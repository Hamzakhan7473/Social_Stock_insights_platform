"""
FastAPI application entry point for Social Stock Insights Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import posts, users, feeds, analytics, market_data, sentiment, comments, messages, auth
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Stock Insights API",
    description="API for social-driven stock analysis platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(feeds.router, prefix="/api/feeds", tags=["feeds"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(market_data.router, prefix="/api/market", tags=["market"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["sentiment"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])


@app.get("/")
async def root():
    return {"message": "Social Stock Insights API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

