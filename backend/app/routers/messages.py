"""
Direct messages router for private chat between users
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from sqlalchemy import or_, and_
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.MessageResponse)
async def send_message(
    message: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a direct message to another user"""
    # Verify recipient exists
    recipient = db.query(models.User).filter(models.User.id == message.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    if current_user.id == message.recipient_id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    # Create message
    db_message = models.DirectMessage(
        sender_id=current_user.id,
        recipient_id=message.recipient_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Load relationships
    db_message = db.query(models.DirectMessage).options(
        joinedload(models.DirectMessage.sender),
        joinedload(models.DirectMessage.recipient)
    ).filter(models.DirectMessage.id == db_message.id).first()
    
    return db_message


@router.get("/conversations", response_model=List[schemas.ConversationResponse])
async def get_conversations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    user_id = current_user.id
    
    # Get all unique conversation partners
    sent_messages = db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_id == user_id
    ).options(joinedload(models.DirectMessage.recipient)).all()
    
    received_messages = db.query(models.DirectMessage).filter(
        models.DirectMessage.recipient_id == user_id
    ).options(joinedload(models.DirectMessage.sender)).all()
    
    # Build conversation map
    conversations = {}
    
    for msg in sent_messages:
        partner_id = msg.recipient_id
        if partner_id not in conversations:
            conversations[partner_id] = {
                "user": msg.recipient,
                "last_message": msg,
                "unread_count": 0
            }
        elif msg.created_at > conversations[partner_id]["last_message"].created_at:
            conversations[partner_id]["last_message"] = msg
    
    for msg in received_messages:
        partner_id = msg.sender_id
        if partner_id not in conversations:
            conversations[partner_id] = {
                "user": msg.sender,
                "last_message": msg,
                "unread_count": 0
            }
        elif msg.created_at > conversations[partner_id]["last_message"].created_at:
            conversations[partner_id]["last_message"] = msg
        
        if not msg.is_read:
            conversations[partner_id]["unread_count"] += 1
    
    # Convert to list
    result = []
    for partner_id, conv in conversations.items():
        result.append({
            "user": conv["user"],
            "last_message": conv["last_message"],
            "unread_count": conv["unread_count"]
        })
    
    # Sort by last message time
    result.sort(key=lambda x: x["last_message"].created_at, reverse=True)
    
    return result


@router.get("/conversation/{user_id}", response_model=List[schemas.MessageResponse])
async def get_conversation(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get messages in a conversation with a specific user"""
    current_user_id = current_user.id
    
    messages = db.query(models.DirectMessage).options(
        joinedload(models.DirectMessage.sender),
        joinedload(models.DirectMessage.recipient)
    ).filter(
        or_(
            and_(
                models.DirectMessage.sender_id == current_user_id,
                models.DirectMessage.recipient_id == user_id
            ),
            and_(
                models.DirectMessage.sender_id == user_id,
                models.DirectMessage.recipient_id == current_user_id
            )
        )
    ).order_by(models.DirectMessage.created_at.asc()).limit(limit).all()
    
    # Mark messages as read
    for msg in messages:
        if msg.recipient_id == current_user_id and not msg.is_read:
            msg.is_read = True
    
    db.commit()
    
    return messages


@router.post("/{message_id}/read")
async def mark_message_read(
    message_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    user_id = current_user.id
    
    message = db.query(models.DirectMessage).filter(
        models.DirectMessage.id == message_id,
        models.DirectMessage.recipient_id == user_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Message marked as read"}


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow a user"""
    current_user_id = current_user.id
    
    if current_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already following
    existing = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user_id,
        models.Follow.following_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    # Create follow relationship
    follow = models.Follow(
        follower_id=current_user_id,
        following_id=user_id
    )
    db.add(follow)
    db.commit()
    
    return {"message": "User followed successfully"}


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfollow a user"""
    current_user_id = current_user.id
    
    follow = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user_id,
        models.Follow.following_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    db.delete(follow)
    db.commit()
    
    return {"message": "User unfollowed successfully"}

