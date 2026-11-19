import re
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class HeroKey(str, Enum):
    IRON_MAN = "IRON_MAN"
    CAPTAIN_AMERICA = "CAPTAIN_AMERICA"
    BLACK_PANTHER = "BLACK_PANTHER"
    DOCTOR_STRANGE = "DOCTOR_STRANGE"
    BLACK_WIDOW = "BLACK_WIDOW"
    SPIDER_MAN = "SPIDER_MAN"


class UserProfileRequest(BaseModel):
    work_style: str = Field(..., min_length=3, max_length=120)
    main_skill: str = Field(..., min_length=3, max_length=120)
    biggest_challenge: str = Field(..., min_length=3, max_length=200)
    career_goal: str = Field(..., min_length=3, max_length=200)
    lgpd_consent: bool = Field(...)

    @field_validator("work_style", "main_skill", "biggest_challenge", "career_goal")
    @classmethod
    def sanitize_control_characters(cls, value: str) -> str:
        cleaned = re.sub(r"[\x00-\x1f\x7f-\x9f]", " ", value).strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
        if len(cleaned) < 3:
            raise ValueError("O campo deve conter ao menos 3 caracteres validos.")
        return cleaned

    @field_validator("lgpd_consent")
    @classmethod
    def must_accept_privacy_terms(cls, value: bool) -> bool:
        if not value:
            raise ValueError("O consentimento para processamento transitorio e obrigatorio.")
        return value


class AIHeroDecision(BaseModel):
    hero_key: HeroKey
    compatibility_score: int = Field(..., ge=65, le=100)
    trait_analysis: str = Field(..., max_length=450)
    career_advice: str = Field(..., max_length=500)
    recommended_next_step: str = Field(..., max_length=250)


class HeroMatchResponse(BaseModel):
    hero_key: HeroKey
    hero_name: str
    alter_ego: str
    compatibility_score: int
    trait_analysis: str
    career_advice: str
    recommended_next_step: str
    image_url: str
    image_attribution: str
    privacy_notice: str