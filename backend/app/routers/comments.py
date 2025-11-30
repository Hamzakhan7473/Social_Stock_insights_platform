"""
Comments router for Twitter-like replies to posts
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.CommentResponse)
async def create_comment(
    comment: schemas.CommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment/reply to a post or another comment"""
    # Verify post exists
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify parent comment exists if provided
    if comment.parent_comment_id:
        parent = db.query(models.Comment).filter(models.Comment.id == comment.parent_comment_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    # Create comment
    db_comment = models.Comment(
        post_id=comment.post_id,
        author_id=current_user.id,
        parent_comment_id=comment.parent_comment_id,
        content=comment.content
    )
    db.add(db_comment)
    
    # Update post comment count
    post.comment_count = (post.comment_count or 0) + 1
    
    db.commit()
    db.refresh(db_comment)
    
    # Load relationships
    db_comment = db.query(models.Comment).options(
        joinedload(models.Comment.author),
        joinedload(models.Comment.parent_comment)
    ).filter(models.Comment.id == db_comment.id).first()
    
    return db_comment


@router.get("/post/{post_id}", response_model=List[schemas.CommentResponse])
async def get_post_comments(
    post_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all comments for a post (top-level only)"""
    comments = db.query(models.Comment).options(
        joinedload(models.Comment.author),
        joinedload(models.Comment.replies).joinedload(models.Comment.author)
    ).filter(
        models.Comment.post_id == post_id,
        models.Comment.parent_comment_id == None
    ).order_by(models.Comment.created_at.desc()).limit(limit).all()
    
    return comments


@router.get("/{comment_id}/replies", response_model=List[schemas.CommentResponse])
async def get_comment_replies(
    comment_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get replies to a specific comment"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    replies = db.query(models.Comment).options(
        joinedload(models.Comment.author)
    ).filter(
        models.Comment.parent_comment_id == comment_id
    ).order_by(models.Comment.created_at.asc()).limit(limit).all()
    
    return replies


@router.post("/{comment_id}/like", response_model=schemas.CommentResponse)
async def like_comment(
    comment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a comment"""
    comment = db.query(models.Comment).options(
        joinedload(models.Comment.author)
    ).filter(models.Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if already liked
    existing = db.query(models.CommentReaction).filter(
        models.CommentReaction.comment_id == comment_id,
        models.CommentReaction.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Comment already liked")
    
    # Create reaction
    reaction = models.CommentReaction(
        comment_id=comment_id,
        user_id=current_user.id
    )
    db.add(reaction)
    
    # Update like count
    comment.like_count = (comment.like_count or 0) + 1
    
    db.commit()
    db.refresh(comment)
    
    return comment


@router.delete("/{comment_id}/like")
async def unlike_comment(
    comment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a comment"""
    reaction = db.query(models.CommentReaction).filter(
        models.CommentReaction.comment_id == comment_id,
        models.CommentReaction.user_id == current_user.id
    ).first()
    
    if not reaction:
        raise HTTPException(status_code=404, detail="Like not found")
    
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if comment and comment.like_count > 0:
        comment.like_count -= 1
    
    db.delete(reaction)
    db.commit()
    
    return {"message": "Comment unliked"}

