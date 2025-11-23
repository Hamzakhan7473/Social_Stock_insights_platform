"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import InsightType, ReactionType


class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    reputation_score: float
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PostBase(BaseModel):
    title: str
    content: str
    ticker: Optional[str] = None
    insight_type: InsightType


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: int
    author_id: int
    author: UserResponse
    summary: Optional[str] = None
    quality_score: float
    semantic_tags: List[str] = []
    sector: Optional[str] = None
    catalyst_type: Optional[str] = None
    risk_profile: Optional[str] = None
    llm_explanation: Optional[str] = None
    like_count: int
    dislike_count: int
    bullish_count: int
    bearish_count: int
    helpful_count: int
    view_count: int
    market_price_at_post: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReactionCreate(BaseModel):
    reaction_type: ReactionType


class ReactionResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    reaction_type: ReactionType
    created_at: datetime
    
    class Config:
        from_attributes = True


class FeedRequest(BaseModel):
    user_id: Optional[int] = None
    page: int = 1
    page_size: int = 20
    ticker: Optional[str] = None
    insight_type: Optional[InsightType] = None
    sector: Optional[str] = None


class FeedResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
    has_next: bool


class TrendingTicker(BaseModel):
    ticker: str
    post_count: int
    sentiment_score: float
    price_change_24h: Optional[float] = None
    volume_change_24h: Optional[float] = None


class AnalyticsResponse(BaseModel):
    trending_tickers: List[TrendingTicker]
    top_insights: List[PostResponse]
    top_users: List[UserResponse]
    aggregated_sentiment: Dict[str, float]


class MarketDataResponse(BaseModel):
    ticker: str
    current_price: float
    price_change_24h: float
    volume_24h: float
    volume_change_24h: float
    market_cap: Optional[float] = None
    last_updated: datetime


class ExplanationRequest(BaseModel):
    post_id: int
    user_id: Optional[int] = None


class ExplanationResponse(BaseModel):
    explanation: str
    factors: Dict[str, Any]
    confidence_score: float

