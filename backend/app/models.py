"""
Database models for Social Stock Insights Platform
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class InsightType(str, enum.Enum):
    FUNDAMENTAL_ANALYSIS = "fundamental_analysis"
    TECHNICAL_ANALYSIS = "technical_analysis"
    MACRO_COMMENTARY = "macro_commentary"
    EARNINGS_FORECAST = "earnings_forecast"
    RISK_WARNING = "risk_warning"


class ReactionType(str, enum.Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    BULLISH = "bullish"
    BEARISH = "bearish"
    HELPFUL = "helpful"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    reputation_score = Column(Float, default=0.0, index=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    ticker = Column(String, index=True)  # Stock ticker symbol
    insight_type = Column(Enum(InsightType), nullable=False, index=True)
    
    # LLM-generated fields
    summary = Column(Text, nullable=True)
    quality_score = Column(Float, default=0.0, index=True)
    semantic_tags = Column(JSON, default=list)  # List of tags like ["sector:tech", "catalyst:earnings"]
    sector = Column(String, index=True)
    catalyst_type = Column(String, index=True)
    risk_profile = Column(String, index=True)
    llm_explanation = Column(Text, nullable=True)  # Why this post was recommended
    
    # Engagement metrics
    like_count = Column(Integer, default=0)
    dislike_count = Column(Integer, default=0)
    bullish_count = Column(Integer, default=0)
    bearish_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Market context (snapshot at post time)
    market_price_at_post = Column(Float, nullable=True)
    market_volume_at_post = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="posts")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")


class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reaction_type = Column(Enum(ReactionType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")
    
    # Unique constraint: one reaction type per user per post
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )


class MarketTrend(Base):
    __tablename__ = "market_trends"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True, nullable=False)
    trend_type = Column(String, nullable=False)  # "volume_spike", "price_movement", "earnings_release"
    magnitude = Column(Float, nullable=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    metadata = Column(JSON, default=dict)


class UserFeedPreference(Base):
    __tablename__ = "user_feed_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    preferred_sectors = Column(JSON, default=list)
    preferred_insight_types = Column(JSON, default=list)
    followed_tickers = Column(JSON, default=list)
    risk_tolerance = Column(String, default="moderate")  # "low", "moderate", "high"
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

