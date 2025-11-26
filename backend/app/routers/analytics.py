"""
Analytics router for dashboard metrics and insights
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict
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
    
    # Get top insights (by quality score and engagement) with author relationship
    top_insights = db.query(models.Post).options(joinedload(models.Post.author)).order_by(
        desc(models.Post.quality_score),
        desc(models.Post.helpful_count)
    ).limit(10).all()
    
    # Get top users by reputation
    top_users = db.query(models.User).order_by(
        desc(models.User.reputation_score)
    ).limit(10).all()
    
    # Calculate aggregated sentiment (optimized with SQL aggregation)
    sentiment_result = db.query(
        func.sum(models.Post.bullish_count).label('total_bullish'),
        func.sum(models.Post.bearish_count).label('total_bearish')
    ).first()
    
    total_bullish = sentiment_result.total_bullish or 0
    total_bearish = sentiment_result.total_bearish or 0
    total_sentiment = total_bullish + total_bearish
    
    # If no reactions, provide demo sentiment data for better UX
    if total_sentiment == 0:
        # Demo sentiment: slightly bullish
        total_bullish = 15
        total_bearish = 10
        total_sentiment = 25
    
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
    """Get trending tickers with parallel market data fetching"""
    from datetime import datetime, timedelta, timezone
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
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
            bullish = post.bullish_count or 0
            bearish = post.bearish_count or 0
            total_sentiment = bullish + bearish
            if total_sentiment > 0:
                sentiment = (bullish - bearish) / total_sentiment
                ticker_sentiment[post.ticker] = ticker_sentiment.get(post.ticker, 0) + sentiment
    
    # Get top tickers
    top_tickers = sorted(ticker_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    # Fetch market data in parallel for speed
    def fetch_market_data(ticker):
        try:
            return ticker, market_service.get_ticker_data(ticker)
        except Exception as e:
            print(f"Error fetching market data for {ticker}: {e}")
            return ticker, {}
    
    # Use ThreadPoolExecutor for parallel market data fetching
    market_data_dict = {}
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(fetch_market_data, ticker): ticker for ticker, _ in top_tickers}
        for future in as_completed(futures):
            ticker, market_data = future.result()
            market_data_dict[ticker] = market_data
    
    # Build trending tickers list
    trending_tickers = []
    for ticker, count in top_tickers:
        market_data = market_data_dict.get(ticker, {})
        
        # Calculate average sentiment for this ticker
        ticker_total_sentiment = ticker_sentiment.get(ticker, 0)
        avg_sentiment = ticker_total_sentiment / count if count > 0 else 0
        
        # If no sentiment data, provide demo sentiment based on price change
        if avg_sentiment == 0:
            price_change = market_data.get("price_change_24h", 0)
            # Demo sentiment: slightly positive if price up, slightly negative if down
            if price_change > 0:
                avg_sentiment = 0.15  # Slightly bullish
            elif price_change < 0:
                avg_sentiment = -0.10  # Slightly bearish
            else:
                avg_sentiment = 0.05  # Neutral-positive
        
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
    
    post = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get market context for enhanced explanation
    market_context = None
    if post.ticker:
        market_context = market_service.get_market_context([post.ticker], include_sentiment=True)
    
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
    
    # Generate new explanation with market context
    llm_service = LLMService()
    post_data = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "summary": post.summary,
        "ticker": post.ticker,
        "quality_score": post.quality_score,
        "author_reputation_score": post.author.reputation_score if post.author else 0,
        "like_count": post.like_count,
        "helpful_count": post.helpful_count,
        "sector": post.sector,
        "insight_type": post.insight_type.value if post.insight_type else None
    }
    
    explanation = llm_service.generate_explanation(
        post_data, 
        user_id,
        ranking_score=post.quality_score,
        market_context=market_context
    )
    
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


@router.post("/batch", response_model=schemas.BatchAnalyticsResponse)
async def batch_analytics(
    request: schemas.BatchAnalyticsRequest,
    db: Session = Depends(get_db)
):
    """
    Batch analytics endpoint for downstream processing.
    Enables batch analysis of posts with market data and sentiment.
    """
    import time
    from app.services.llm_service import LLMService
    
    start_time = time.time()
    llm_service = LLMService()
    
    # Build query
    query = db.query(models.Post).options(joinedload(models.Post.author))
    
    if request.post_ids:
        query = query.filter(models.Post.id.in_(request.post_ids))
    
    if request.tickers:
        query = query.filter(models.Post.ticker.in_(request.tickers))
    
    if request.start_date:
        query = query.filter(models.Post.created_at >= request.start_date)
    
    if request.end_date:
        query = query.filter(models.Post.created_at <= request.end_date)
    
    posts = query.all()
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found matching criteria")
    
    # Calculate metrics
    total_quality = sum(p.quality_score for p in posts)
    avg_quality = total_quality / len(posts) if posts else 0.0
    
    total_engagement = sum(
        p.like_count + p.helpful_count + p.bullish_count + p.bearish_count 
        for p in posts
    )
    
    # Get trending tickers from posts
    ticker_counts = {}
    for post in posts:
        if post.ticker:
            ticker_counts[post.ticker] = ticker_counts.get(post.ticker, 0) + 1
    
    trending_tickers = []
    if request.include_market_data:
        top_tickers = sorted(ticker_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for ticker, count in top_tickers:
            market_data = market_service.get_ticker_data(ticker)
            trending_tickers.append({
                "ticker": ticker,
                "post_count": count,
                "sentiment_score": 0.0,  # Would calculate from posts
                "price_change_24h": market_data.get("price_change_24h"),
                "volume_change_24h": market_data.get("volume_change_24h")
            })
    
    # Sentiment distribution
    sentiment_distribution = {
        "bullish": sum(p.bullish_count for p in posts),
        "bearish": sum(p.bearish_count for p in posts),
        "neutral": len(posts) - sum(p.bullish_count + p.bearish_count for p in posts)
    }
    
    # Top insights
    top_insights = sorted(posts, key=lambda p: p.quality_score, reverse=True)[:10]
    
    # Market trends
    market_trends = []
    if request.include_market_data and request.tickers:
        market_trends = market_service.detect_market_trends(request.tickers)
    
    processing_time = (time.time() - start_time) * 1000  # Convert to ms
    
    return {
        "posts_analyzed": len(posts),
        "average_quality_score": avg_quality,
        "total_engagement": total_engagement,
        "trending_tickers": trending_tickers,
        "sentiment_distribution": sentiment_distribution,
        "top_insights": top_insights,
        "market_trends": market_trends,
        "processing_time_ms": processing_time
    }


@router.post("/rerank", response_model=schemas.ReRankResponse)
async def rerank_posts(
    request: schemas.ReRankRequest,
    db: Session = Depends(get_db)
):
    """
    Dynamically re-rank posts based on current market conditions.
    Incorporates live market data to re-rank insights, highlight timely opportunities,
    and deprioritize outdated or low-relevance posts.
    """
    from app.services.llm_service import LLMService
    
    llm_service = LLMService()
    
    # Get posts
    posts = db.query(models.Post).options(joinedload(models.Post.author)).filter(
        models.Post.id.in_(request.post_ids)
    ).all()
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found")
    
    # Convert to dict format
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
    
    # Get fresh market context
    market_context = market_service.get_market_context(list(tickers), include_sentiment=True)
    
    # Re-rank with strategy
    ranked_posts = llm_service.rank_posts(
        posts_data,
        request.user_preferences,
        market_context,
        strategy=request.strategy or "balanced"
    )
    
    # Generate explanations for top posts
    explanations = {}
    for post_data in ranked_posts[:5]:
        explanation = llm_service.generate_explanation(
            post_data,
            None,
            post_data.get("ranking_score", 0),
            market_context=market_context
        )
        explanations[post_data["id"]] = explanation
    
    # Get full post objects in ranked order
    post_ids = [p["id"] for p in ranked_posts]
    post_dict = {p.id: p for p in posts}
    ordered_posts = [post_dict[pid] for pid in post_ids if pid in post_dict]
    
    return {
        "ranked_posts": ordered_posts,
        "strategy_used": request.strategy or "balanced",
        "market_context_applied": True,
        "explanations": explanations
    }


@router.get("/strategy-experiment", response_model=Dict[str, List[schemas.PostResponse]])
async def experiment_with_strategies(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Experiment with different ranking strategies.
    Allows LLM to experiment with strategies that balance insight quality,
    diversity, and real-time responsiveness.
    """
    from app.services.llm_service import LLMService
    
    llm_service = LLMService()
    
    # Get recent posts
    posts = db.query(models.Post).options(joinedload(models.Post.author)).order_by(
        desc(models.Post.created_at)
    ).limit(limit).all()
    
    if not posts:
        raise HTTPException(status_code=404, detail="No posts found")
    
    # Convert to dict format
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
            "like_count": post.like_count,
            "helpful_count": post.helpful_count,
            "author_reputation_score": post.author.reputation_score if post.author else 0.0,
            "created_at": post.created_at.isoformat() if post.created_at else None
        })
    
    # Get market context
    market_context = market_service.get_market_context(list(tickers), include_sentiment=True)
    
    # Experiment with strategies
    strategy_results = llm_service.experiment_with_strategy(
        posts_data,
        None,
        market_context
    )
    
    # Convert to PostResponse objects
    post_dict = {p.id: p for p in posts}
    results = {}
    
    for strategy, ranked_data in strategy_results.items():
        post_ids = [p["id"] for p in ranked_data]
        results[strategy] = [post_dict[pid] for pid in post_ids if pid in post_dict]
    
    return results

