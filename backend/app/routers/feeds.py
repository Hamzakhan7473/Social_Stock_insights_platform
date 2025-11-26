"""
Feeds router for personalized feed generation
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.llm_service import LLMService
from app.services.market_data_service import MarketDataService

router = APIRouter()
llm_service = LLMService()
market_service = MarketDataService()


@router.get("/personalized", response_model=schemas.FeedResponse)
async def get_personalized_feed(
    user_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """Get personalized feed for user"""
    # Get user preferences if user_id provided
    user_preferences = None
    if user_id:
        pref = db.query(models.UserFeedPreference).filter(
            models.UserFeedPreference.user_id == user_id
        ).first()
        if pref:
            user_preferences = {
                "preferred_sectors": pref.preferred_sectors or [],
                "preferred_insight_types": pref.preferred_insight_types or [],
                "followed_tickers": pref.followed_tickers or [],
                "risk_tolerance": pref.risk_tolerance
            }
    
    # Get all posts with author relationship loaded
    posts = db.query(models.Post).options(joinedload(models.Post.author)).all()
    
    # Convert to dict format for ranking
    posts_data = []
    tickers = set()
    
    for post in posts:
        if post.ticker:
            tickers.add(post.ticker)
        posts_data.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "ticker": post.ticker,
            "insight_type": post.insight_type.value if post.insight_type else None,
            "quality_score": post.quality_score,
            "sector": post.sector,
            "catalyst_type": post.catalyst_type,
            "risk_profile": post.risk_profile,
            "like_count": post.like_count,
            "dislike_count": post.dislike_count,
            "bullish_count": post.bullish_count,
            "bearish_count": post.bearish_count,
            "helpful_count": post.helpful_count,
            "author_reputation_score": post.author.reputation_score if post.author else 0.0,
            "created_at": post.created_at.isoformat() if post.created_at else None
        })
    
    # Get market context (includes social sentiment if available)
    market_context = market_service.get_market_context(list(tickers), include_sentiment=True)
    
    # Rank posts
    ranked_posts = llm_service.rank_posts(posts_data, user_preferences, market_context)
    
    # Generate explanations for top posts with market context
    for post_data in ranked_posts[:5]:
        post_obj = db.query(models.Post).filter(models.Post.id == post_data["id"]).first()
        if post_obj:
            explanation = llm_service.generate_explanation(
                post_data,
                user_id,
                post_data.get("ranking_score", 0),
                market_context=market_context
            )
            post_obj.llm_explanation = explanation
            db.commit()
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_posts = ranked_posts[start:end]
    
    # Get full post objects with author relationship loaded
    post_ids = [p["id"] for p in paginated_posts]
    full_posts = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id.in_(post_ids)).all()
    
    # Sort by ranking order
    post_dict = {p.id: p for p in full_posts}
    ordered_posts = [post_dict[pid] for pid in post_ids if pid in post_dict]
    
    return {
        "posts": ordered_posts,
        "total": len(ranked_posts),
        "page": page,
        "page_size": page_size,
        "has_next": end < len(ranked_posts)
    }


@router.get("/trending", response_model=List[schemas.TrendingTicker])
async def get_trending_tickers(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get trending tickers based on post activity and market data"""
    from sqlalchemy import func
    from datetime import datetime, timedelta, timezone
    
    # Get posts from last 24 hours
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent_posts = db.query(models.Post).filter(
        models.Post.created_at >= yesterday
    ).all()
    
    # Count posts per ticker
    ticker_counts = {}
    ticker_sentiment = {}
    
    for post in recent_posts:
        if post.ticker:
            ticker_counts[post.ticker] = ticker_counts.get(post.ticker, 0) + 1
            
            # Calculate sentiment
            bullish = post.bullish_count
            bearish = post.bearish_count
            total_sentiment = bullish + bearish
            if total_sentiment > 0:
                sentiment = (bullish - bearish) / total_sentiment
                ticker_sentiment[post.ticker] = ticker_sentiment.get(post.ticker, 0) + sentiment
    
    # Get market data for trending tickers
    trending_tickers = []
    for ticker, count in sorted(ticker_counts.items(), key=lambda x: x[1], reverse=True)[:limit]:
        market_data = market_service.get_ticker_data(ticker)
        
        avg_sentiment = ticker_sentiment.get(ticker, 0) / count if count > 0 else 0
        
        trending_tickers.append({
            "ticker": ticker,
            "post_count": count,
            "sentiment_score": avg_sentiment,
            "price_change_24h": market_data.get("price_change_24h"),
            "volume_change_24h": market_data.get("volume_change_24h")
        })
    
    return trending_tickers

