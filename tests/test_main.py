import re

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app import main
from app.schemas import AIHeroDecision, HeroKey, UserProfileRequest

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def clear_ip_request_log():
    main._ip_request_log.clear()
    yield
    main._ip_request_log.clear()


def valid_profile_payload():
    return {
        "work_style": "Inovador autônomo",
        "main_skill": "Python e FastAPI",
        "biggest_challenge": "Escalar arquitetura",
        "career_goal": "Engenheiro Sênior",
        "lgpd_consent": True,
    }


def test_short_field_returns_422():
    payload = valid_profile_payload()
    payload["work_style"] = "ab"

    response = client.post("/api/v1/match", json=payload)

    assert response.status_code == 422


def test_rate_limit_returns_429_after_maximum_requests(monkeypatch):
    monkeypatch.setattr(main, "MAX_REQUESTS_PER_WINDOW", 2)
    monkeypatch.setattr(main, "RATE_LIMIT_WINDOW_SECONDS", 60)
    monkeypatch.setenv("GEMINI_API_KEY", "")

    first_response = client.post("/api/v1/match", json=valid_profile_payload())
    second_response = client.post("/api/v1/match", json=valid_profile_payload())
    third_response = client.post("/api/v1/match", json=valid_profile_payload())

    assert first_response.status_code == 200
    assert first_response.json()["analysis_source"] == "regras"
    assert second_response.status_code == 200
    assert third_response.status_code == 429


def test_deterministic_match_returns_valid_hero_key():
    profile = UserProfileRequest.model_validate(valid_profile_payload())

    decision = main.build_deterministic_match(profile)

    assert isinstance(decision.hero_key, HeroKey)


def test_deterministic_match_respects_text_limits_and_quotes_profile_data():
    payload = valid_profile_payload()
    payload["main_skill"] = "habilidade " * 10
    payload["biggest_challenge"] = "desafio " * 25
    payload["career_goal"] = "meta " * 40
    profile = UserProfileRequest.model_validate(payload)

    decision = main.build_deterministic_match(profile)

    assert len(decision.trait_analysis) <= 450
    assert len(decision.career_advice) <= 500
    assert len(decision.recommended_next_step) <= 250
    assert '"habilidade' in decision.trait_analysis
    assert '("desafio' in decision.career_advice
    assert 'à meta "meta' in decision.recommended_next_step


def test_empty_gemini_api_key_uses_deterministic_fallback(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    profile = UserProfileRequest.model_validate(valid_profile_payload())

    decision, analysis_source = main.generate_ai_decision(profile)

    assert isinstance(decision.hero_key, HeroKey)
    assert analysis_source == "regras"


def test_home_page_title_contains_official_product_name():
    response = client.get("/")

    assert response.status_code == 200
    assert "<title>UCM - Ultimate Carreira Marvel</title>" in response.text
    assert '<h1 class="hero-title">Qual herói da Marvel define a sua carreira?</h1>' in response.text
    assert '<meta name="description"' in response.text
    assert '<meta name="theme-color"' in response.text
    assert '<div id="hqWall" class="hq-wall" aria-hidden="true"></div>' in response.text
    assert '<span class="brand-subtitle">ULTIMATE CARREIRA MARVEL</span>' in response.text
    assert (
        "UCM - Ultimate Carreira Marvel | Projeto pessoal de portfólio | Código aberto (MIT) "
        "| Python, FastAPI e Google Gemini"
    ) in response.text
    assert (
        "Projeto independente, sem vínculo com a Marvel ou a Disney. Marvel e os nomes de "
        "personagens são marcas de seus respectivos titulares."
    ) in response.text
    options = re.findall(r'<option value="([^"]*)">([^<]*)</option>', response.text)
    assert len(options) == 6
    assert all(len(value) <= 110 and len(label) <= 110 for value, label in options)


def test_health_check_and_security_headers():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["persistence"] == "stateless_lgpd_compliant"
    assert "script-src 'self'" in response.headers["Content-Security-Policy"]
    assert "'unsafe-inline'" not in response.headers["Content-Security-Policy"]
    assert "wikimedia" not in response.headers["Content-Security-Policy"]
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"


def test_separated_frontend_assets_served():
    html_res = client.get("/")
    css_res = client.get("/static/styles.css")
    js_res = client.get("/static/app.js")

    assert html_res.status_code == 200
    assert "text/html" in html_res.headers["content-type"]
    assert '/static/styles.css' in html_res.text
    assert '/static/app.js' in html_res.text

    assert css_res.status_code == 200
    assert "text/css" in css_res.headers["content-type"]

    assert js_res.status_code == 200
    assert any(
        mime in js_res.headers["content-type"]
        for mime in ("application/javascript", "text/javascript")
    )


def test_rejects_missing_lgpd_consent():
    response = client.post(
        "/api/v1/match",
        json={
            **valid_profile_payload(),
            "lgpd_consent": False,
        },
    )
    assert response.status_code == 422


@patch("app.main.generate_ai_decision")
def test_successful_hero_match(mock_ai):
    mock_ai.return_value = (
        AIHeroDecision(
            hero_key=HeroKey.IRON_MAN,
            compatibility_score=95,
            trait_analysis="Perfil altamente orientado à resolução técnica com automação.",
            career_advice="Invista em arquitetura de sistemas distribuídos e lidere revisões de código.",
            recommended_next_step="Containerize seus projetos principais e documente decisões arquiteturais.",
        ),
        "ia",
    )

    response = client.post(
        "/api/v1/match",
        json={
            **valid_profile_payload(),
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["hero_name"] == "Homem de Ferro"
    assert body["analysis_source"] == "ia"
    assert "image_url" not in body
    assert "image_attribution" not in body


@pytest.mark.parametrize(
    "hero_key",
    [hero.value for hero in HeroKey],
)
def test_original_hero_emblems_are_served(hero_key):
    response = client.get(f"/static/img/heroes/{hero_key}.svg")

    assert response.status_code == 200
    assert "image/svg+xml" in response.headers["content-type"]