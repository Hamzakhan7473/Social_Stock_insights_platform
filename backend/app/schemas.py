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
    is_verified: bool = False
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
    comment_count: int = 0
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


class BatchAnalyticsRequest(BaseModel):
    post_ids: Optional[List[int]] = None
    tickers: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    include_market_data: bool = True
    include_sentiment: bool = True


class BatchAnalyticsResponse(BaseModel):
    posts_analyzed: int
    average_quality_score: float
    total_engagement: int
    trending_tickers: List[TrendingTicker]
    sentiment_distribution: Dict[str, int]
    top_insights: List[PostResponse]
    market_trends: List[Dict[str, Any]]
    processing_time_ms: float


class ReRankRequest(BaseModel):
    post_ids: List[int]
    strategy: Optional[str] = "balanced"
    user_preferences: Optional[Dict[str, Any]] = None


class ReRankResponse(BaseModel):
    ranked_posts: List[PostResponse]
    strategy_used: str
    market_context_applied: bool
    explanations: Dict[int, str]  # post_id -> explanation


# Comment schemas
class CommentCreate(BaseModel):
    post_id: int
    content: str
    parent_comment_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    author: UserResponse
    parent_comment_id: Optional[int] = None
    content: str
    like_count: int
    created_at: datetime
    replies: Optional[List['CommentResponse']] = []
    
    class Config:
        from_attributes = True


# Message schemas
class MessageCreate(BaseModel):
    recipient_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    sender: UserResponse
    recipient_id: int
    recipient: UserResponse
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    user: UserResponse
    last_message: MessageResponse
    unread_count: int


# Auth schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str

