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
    assert second_response.status_code == 200
    assert third_response.status_code == 429


def test_deterministic_match_returns_valid_hero_key():
    profile = UserProfileRequest.model_validate(valid_profile_payload())

    decision = main.build_deterministic_match(profile)

    assert isinstance(decision.hero_key, HeroKey)


def test_empty_gemini_api_key_uses_deterministic_fallback(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    profile = UserProfileRequest.model_validate(valid_profile_payload())

    decision = main.generate_ai_decision(profile)

    assert isinstance(decision.hero_key, HeroKey)


def test_home_page_title_contains_official_product_name():
    response = client.get("/")

    assert response.status_code == 200
    assert "<title>UCM - Ultimate Carreira Marvel</title>" in response.text


def test_health_check_and_security_headers():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["persistence"] == "stateless_lgpd_compliant"
    assert "script-src 'self'" in response.headers["Content-Security-Policy"]
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
    mock_ai.return_value = AIHeroDecision(
        hero_key=HeroKey.IRON_MAN,
        compatibility_score=95,
        trait_analysis="Perfil altamente orientado à resolução técnica com automação.",
        career_advice="Invista em arquitetura de sistemas distribuídos e liderar revisões de código.",
        recommended_next_step="Containerizar seus projetos principais e documentar decisões arquiteturais.",
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
    assert "CC BY-SA" in body["image_attribution"]