"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/social_stock_insights"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    
    # Market Data
    MARKET_DATA_API_KEY: str = ""  # For Alpha Vantage or similar
    MARKET_DATA_PROVIDER: str = "yfinance"  # yfinance, alphavantage, etc.
    
    # StockTwits (optional, for social sentiment)
    STOCKTWITS_API_KEY: str = ""  # RapidAPI key for StockTwits API
    
    # LLM Service
    LLM_SERVICE_URL: str = "http://localhost:8001"
    LLM_MAX_TOKENS: int = 1000
    LLM_TEMPERATURE: float = 0.3
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Feed Settings
    FEED_PAGE_SIZE: int = 20
    MAX_TRENDING_TICKERS: int = 10
    
    # Reputation
    REPUTATION_DECAY_FACTOR: float = 0.95
    MIN_REPUTATION_FOR_VERIFIED: float = 50.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

