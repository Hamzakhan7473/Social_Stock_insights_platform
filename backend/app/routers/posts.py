"""
Posts router for creating, reading, and managing posts
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.llm_service import LLMService
from app.services.market_data_service import MarketDataService
from app.services.reputation_service import ReputationService

router = APIRouter()
llm_service = LLMService()
market_service = MarketDataService()
reputation_service = ReputationService()


@router.post("/", response_model=schemas.PostResponse)
async def create_post(
    post: schemas.PostCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new post and trigger LLM analysis"""
    # Get market data if ticker is provided
    market_price = None
    if post.ticker:
        ticker_data = market_service.get_ticker_data(post.ticker)
        market_price = ticker_data.get("current_price")
    
    # Create post
    db_post = models.Post(
        title=post.title,
        content=post.content,
        ticker=post.ticker,
        insight_type=post.insight_type,
        author_id=1,  # TODO: Get from auth
        market_price_at_post=market_price
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Load author relationship for response
    db_post = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id == db_post.id).first()
    
    # Trigger LLM analysis in background
    background_tasks.add_task(analyze_post_background, db_post.id, db)
    
    return db_post


def analyze_post_background(post_id: int, db: Session):
    """Background task to analyze post with LLM"""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        return
    
    # Analyze with LLM
    analysis = llm_service.analyze_post(post.title, post.content, post.ticker)
    
    # Update post with analysis results
    post.summary = analysis.get("summary")
    post.quality_score = analysis.get("quality_score", 0.0)
    post.semantic_tags = analysis.get("semantic_tags", [])
    post.sector = analysis.get("sector")
    post.catalyst_type = analysis.get("catalyst_type")
    post.risk_profile = analysis.get("risk_profile", "moderate")
    
    db.commit()
    
    # Update author reputation
    update_author_reputation(post.author_id, db)


def update_author_reputation(author_id: int, db: Session):
    """Update author reputation based on posts"""
    author = db.query(models.User).filter(models.User.id == author_id).first()
    if not author:
        return
    
    # Get all posts by author
    posts = db.query(models.Post).filter(models.Post.author_id == author_id).all()
    
    # Get reactions received
    reactions_received = {}
    for post in posts:
        for reaction in post.reactions:
            rt = reaction.reaction_type.value
            reactions_received[rt] = reactions_received.get(rt, 0) + 1
    
    # Calculate reputation
    posts_data = [
        {
            "quality_score": p.quality_score,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in posts
    ]
    
    new_reputation = reputation_service.calculate_reputation(
        author_id, posts_data, reactions_received
    )
    
    author.reputation_score = new_reputation
    author.is_verified = reputation_service.should_be_verified(new_reputation)
    db.commit()


@router.get("/{post_id}", response_model=schemas.PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID"""
    post = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    post.view_count += 1
    db.commit()
    
    return post


@router.get("/", response_model=List[schemas.PostResponse])
async def list_posts(
    ticker: Optional[str] = None,
    insight_type: Optional[schemas.InsightType] = None,
    sector: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List posts with optional filters"""
    query = db.query(models.Post).options(joinedload(models.Post.author))
    
    if ticker:
        query = query.filter(models.Post.ticker == ticker)
    if insight_type:
        query = query.filter(models.Post.insight_type == insight_type)
    if sector:
        query = query.filter(models.Post.sector == sector)
    
    posts = query.order_by(models.Post.created_at.desc()).limit(limit).all()
    return posts


@router.post("/{post_id}/reactions", response_model=schemas.ReactionResponse)
async def create_reaction(
    post_id: int,
    reaction: schemas.ReactionCreate,
    db: Session = Depends(get_db)
):
    """Create a reaction to a post"""
    post = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if reaction already exists
    existing = db.query(models.Reaction).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.user_id == 1,  # TODO: Get from auth
        models.Reaction.reaction_type == reaction.reaction_type
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Reaction already exists")
    
    # Create reaction
    db_reaction = models.Reaction(
        post_id=post_id,
        user_id=1,  # TODO: Get from auth
        reaction_type=reaction.reaction_type
    )
    db.add(db_reaction)
    
    # Update post reaction counts
    if reaction.reaction_type.value == "like":
        post.like_count += 1
    elif reaction.reaction_type.value == "dislike":
        post.dislike_count += 1
    elif reaction.reaction_type.value == "bullish":
        post.bullish_count += 1
    elif reaction.reaction_type.value == "bearish":
        post.bearish_count += 1
    elif reaction.reaction_type.value == "helpful":
        post.helpful_count += 1
    
    db.commit()
    db.refresh(db_reaction)
    
    # Update author reputation
    update_author_reputation(post.author_id, db)
    
    return db_reaction

