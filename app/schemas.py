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

    @field_validator("lgpd_consent")
    @classmethod
    def must_accept_privacy_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Explicit LGPD consent is required for transient data processing.")
        return v


class AIHeroDecision(BaseModel):
    hero_key: HeroKey
    compatibility_score: int = Field(..., ge=60, le=100)
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