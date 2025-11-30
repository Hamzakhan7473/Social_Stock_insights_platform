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
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan", foreign_keys="Comment.author_id")
    sent_messages = relationship("DirectMessage", back_populates="sender", foreign_keys="DirectMessage.sender_id", cascade="all, delete-orphan")
    received_messages = relationship("DirectMessage", back_populates="recipient", foreign_keys="DirectMessage.recipient_id")
    following = relationship("Follow", back_populates="follower", foreign_keys="Follow.follower_id", cascade="all, delete-orphan")
    followers = relationship("Follow", back_populates="following", foreign_keys="Follow.following_id")


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
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    comment_count = Column(Integer, default=0)  # Denormalized count for performance


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
    trend_metadata = Column(JSON, default=dict)  # Renamed from 'metadata' to avoid SQLAlchemy conflict


class UserFeedPreference(Base):
    __tablename__ = "user_feed_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    preferred_sectors = Column(JSON, default=list)
    preferred_insight_types = Column(JSON, default=list)
    followed_tickers = Column(JSON, default=list)
    risk_tolerance = Column(String, default="moderate")  # "low", "moderate", "high"
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Comment(Base):
    """Twitter-like comments/replies to posts"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True, index=True)  # For nested replies
    content = Column(Text, nullable=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments", foreign_keys=[author_id])
    parent_comment = relationship("Comment", remote_side=[id], backref="replies")
    reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")


class CommentReaction(Base):
    """Reactions to comments (like)"""
    __tablename__ = "comment_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="reactions")
    user = relationship("User")


class DirectMessage(Base):
    """Direct messages between users"""
    __tablename__ = "direct_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="received_messages", foreign_keys=[recipient_id])


class Follow(Base):
    """User following relationships"""
    __tablename__ = "follows"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    follower = relationship("User", back_populates="following", foreign_keys=[follower_id])
    following = relationship("User", back_populates="followers", foreign_keys=[following_id])
    
    # Unique constraint: prevent duplicate follows
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )

