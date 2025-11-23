"""
Analytics router for dashboard metrics and insights
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.database import get_db
from app import models, schemas
from app.services.market_data_service import MarketDataService

router = APIRouter()
market_service = MarketDataService()


@router.get("/dashboard", response_model=schemas.AnalyticsResponse)
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Get dashboard analytics including trending tickers, top insights, etc."""
    # Get trending tickers
    trending_tickers = await get_trending_tickers(limit=10, db=db)
    
    # Get top insights (by quality score and engagement)
    top_insights = db.query(models.Post).order_by(
        desc(models.Post.quality_score),
        desc(models.Post.helpful_count)
    ).limit(10).all()
    
    # Get top users by reputation
    top_users = db.query(models.User).order_by(
        desc(models.User.reputation_score)
    ).limit(10).all()
    
    # Calculate aggregated sentiment
    all_posts = db.query(models.Post).all()
    total_bullish = sum(p.bullish_count for p in all_posts)
    total_bearish = sum(p.bearish_count for p in all_posts)
    total_sentiment = total_bullish + total_bearish
    
    sentiment_score = 0.0
    if total_sentiment > 0:
        sentiment_score = (total_bullish - total_bearish) / total_sentiment
    
    aggregated_sentiment = {
        "overall": sentiment_score,
        "bullish_count": total_bullish,
        "bearish_count": total_bearish,
        "total_reactions": total_sentiment
    }
    
    return {
        "trending_tickers": trending_tickers,
        "top_insights": top_insights,
        "top_users": top_users,
        "aggregated_sentiment": aggregated_sentiment
    }


@router.get("/trending-tickers", response_model=List[schemas.TrendingTicker])
async def get_trending_tickers(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending tickers"""
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


@router.get("/explanation/{post_id}", response_model=schemas.ExplanationResponse)
async def get_post_explanation(
    post_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get LLM-generated explanation for why a post is recommended"""
    from app.services.llm_service import LLMService
    
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # If explanation already exists, return it
    if post.llm_explanation:
        return {
            "explanation": post.llm_explanation,
            "factors": {
                "quality_score": post.quality_score,
                "author_reputation": post.author.reputation_score if post.author else 0,
                "engagement": post.helpful_count + post.like_count
            },
            "confidence_score": min(post.quality_score / 100.0, 1.0)
        }
    
    # Generate new explanation
    llm_service = LLMService()
    post_data = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "ticker": post.ticker,
        "quality_score": post.quality_score,
        "author_reputation_score": post.author.reputation_score if post.author else 0,
        "like_count": post.like_count,
        "helpful_count": post.helpful_count,
        "sector": post.sector
    }
    
    explanation = llm_service.generate_explanation(post_data, user_id)
    
    # Save explanation
    post.llm_explanation = explanation
    db.commit()
    
    return {
        "explanation": explanation,
        "factors": {
            "quality_score": post.quality_score,
            "author_reputation": post.author.reputation_score if post.author else 0,
            "engagement": post.helpful_count + post.like_count
        },
        "confidence_score": min(post.quality_score / 100.0, 1.0)
    }

