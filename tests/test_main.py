from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import AI_HERO_RESPONSE_SCHEMA, app
from app.schemas import AIHeroDecision, HeroKey

client = TestClient(app)


def test_gemini_response_schema_is_sdk_compatible():
    assert AI_HERO_RESPONSE_SCHEMA["type"] == "OBJECT"
    assert "$defs" not in str(AI_HERO_RESPONSE_SCHEMA)
    assert "hero_key" in AI_HERO_RESPONSE_SCHEMA["required"]


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
            "work_style": "Inovador autônomo",
            "main_skill": "Python e FastAPI",
            "biggest_challenge": "Escalar arquitetura",
            "career_goal": "Arquiteto de Software",
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
            "work_style": "Inovador autônomo",
            "main_skill": "Python e FastAPI",
            "biggest_challenge": "Escalar arquitetura",
            "career_goal": "Engenheiro Sênior",
            "lgpd_consent": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["hero_name"] == "Homem de Ferro"
    assert "CC BY-SA" in body["image_attribution"]