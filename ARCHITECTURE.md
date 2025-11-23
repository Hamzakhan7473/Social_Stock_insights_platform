# Architecture Overview

> **📊 Visual Architecture Diagram**: A visual architecture diagram is available at `frontend/LLM-Driven Stock Insight Platform Architecture.jam`.  
> This is a diagramming tool file (JAM format) that can be opened with tools like Miro, Lucidchart, or similar.  
> See [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) for more details and a text-based overview.

## System Architecture

The Social Stock Insights platform is built with a microservices-oriented architecture:

```
┌─────────────┐
│   Frontend  │ (Next.js/React)
│  Dashboard  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────┐
│   Backend   │ (FastAPI)
│     API     │
└──────┬──────┘
       │
       ├───► LLM Service (OpenAI)
       ├───► Market Data Service (yfinance)
       ├───► Database (PostgreSQL)
       └───► Cache (Redis, optional)
```

## Components

### 1. Frontend (Next.js/React)

**Location**: `frontend/`

**Features**:
- Dashboard with trending tickers, top insights, user rankings
- Personalized feed with LLM-ranked posts
- Post creation and interaction UI
- Sentiment visualization
- Transparency tooling (LLM explanations)

**Key Components**:
- `Dashboard.tsx` - Main dashboard view
- `Feed.tsx` - Personalized feed
- `PostCard.tsx` - Post display with reactions
- `TrendingTickers.tsx` - Trending ticker list
- `SentimentIndicator.tsx` - Sentiment visualization

### 2. Backend API (FastAPI)

**Location**: `backend/`

**Features**:
- RESTful API for posts, users, feeds, analytics
- LLM integration for content analysis
- Market data integration
- Reputation scoring
- Feed ranking and personalization

**Key Modules**:
- `app/models.py` - Database models
- `app/routers/` - API endpoints
- `app/services/llm_service.py` - LLM content analysis
- `app/services/market_data_service.py` - Market data fetching
- `app/services/reputation_service.py` - User reputation calculation

**API Endpoints**:
- `/api/posts/` - Post management
- `/api/feeds/` - Feed generation
- `/api/analytics/` - Dashboard analytics
- `/api/market/` - Market data

### 3. LLM Service Package

**Location**: `llm_service/`

**Purpose**: Reusable Python package for content analysis and ranking

**Components**:
- `LLMAnalyzer` - Content analysis, tagging, summarization
- `RankingEngine` - Ensemble ranking algorithm
- `TrendDetector` - Trend detection from posts

**Usage**:
```python
from llm_service import LLMAnalyzer

analyzer = LLMAnalyzer(api_key="...")
result = analyzer.analyze(title="...", content="...", ticker="AAPL")
```

## Data Flow

### Post Creation Flow

```
User creates post
    │
    ▼
POST /api/posts/
    │
    ├──► Save to database (initial state)
    │
    ├──► Background task: LLM analysis
    │       │
    │       ├──► Analyze content
    │       ├──► Extract semantic tags
    │       ├──► Generate summary
    │       ├──► Calculate quality score
    │       └──► Update post with analysis
    │
    └──► Update author reputation
```

### Feed Generation Flow

```
GET /api/feeds/personalized
    │
    ├──► Fetch posts from database
    │
    ├──► Get user preferences
    │
    ├──► Fetch market data for tickers
    │
    ├──► Rank posts (ensemble algorithm)
    │       │
    │       ├──► Quality score (40%)
    │       ├──► Engagement (20%)
    │       ├──► Author reputation (15%)
    │       ├──► User preferences (15%)
    │       ├──► Market relevance (10%)
    │       └──► Apply diversity boost
    │
    ├──► Generate explanations for top posts
    │
    └──► Return ranked feed
```

### Market Data Integration

```
Market Data Service
    │
    ├──► Fetch live prices (yfinance)
    ├──► Detect volume spikes (>50% increase)
    ├──► Detect price movements (>5% change)
    ├──► Check earnings releases
    └──► Update market context for ranking
```

## LLM Pipeline

### Content Analysis Pipeline

1. **Input**: Post title, content, optional ticker
2. **LLM Processing**:
   - Extract summary (2-3 sentences)
   - Calculate quality score (0-100)
   - Generate semantic tags
   - Identify sector, catalyst type, risk profile
   - Classify insight type
   - Extract key points
3. **Output**: Structured analysis data
4. **Storage**: Saved to post record

### Ranking Pipeline

1. **Input**: Posts, user preferences, market context
2. **Scoring**:
   - Base quality score (normalized)
   - Engagement signals (likes, helpful marks)
   - Author reputation
   - Preference matching
   - Market relevance (volume spikes, price moves)
   - Recency boost
3. **Diversity**: Boost posts with different tickers/sectors
4. **Output**: Ranked list with scores

### Explanation Generation

1. **Input**: Post data, user context
2. **Analysis**: Identify ranking factors
3. **Generation**: Natural language explanation
4. **Output**: Human-readable explanation

## Database Schema

### Core Tables

**users**
- id, username, email, reputation_score, is_verified

**posts**
- id, author_id, title, content, ticker
- LLM fields: summary, quality_score, semantic_tags, sector, catalyst_type, risk_profile
- Engagement: like_count, helpful_count, etc.
- Market snapshot: market_price_at_post

**reactions**
- id, post_id, user_id, reaction_type

**market_trends**
- id, ticker, trend_type, magnitude, detected_at

**user_feed_preferences**
- user_id, preferred_sectors, preferred_insight_types, followed_tickers

## Ensemble Ranking Algorithm

The ranking engine uses an ensemble approach combining multiple signals:

```
Final Score = 
    Quality Score (40%) +
    Engagement (20%) +
    Author Reputation (15%) +
    User Preferences (15%) +
    Market Relevance (10%) +
    Recency Boost (5%)
```

**Diversity Boost**: Additional points for posts with unique tickers/sectors in top results.

## Market Data Integration

### Live Data Sources
- **yfinance**: Primary source for price/volume data
- **Alpha Vantage**: Alternative provider (configurable)

### Detected Signals
- Volume spikes (>50% increase in 24h)
- Price movements (>5% change)
- Earnings releases (within 7 days)

### Dynamic Re-ranking
Market data influences ranking in real-time:
- Posts about tickers with volume spikes get boost
- Posts about tickers with significant moves get boost
- Posts about tickers with recent earnings get boost

## Deployment

### Docker Compose
- PostgreSQL database
- Redis cache
- Backend API
- Frontend

### Kubernetes
- Deployment manifests in `deployment/kubernetes/`
- ConfigMaps and Secrets for configuration
- Service definitions for load balancing

## Scalability Considerations

1. **LLM Calls**: Background tasks prevent blocking
2. **Database**: Indexed on ticker, sector, quality_score
3. **Caching**: Redis for frequently accessed data
4. **Market Data**: Cached with TTL to reduce API calls
5. **Feed Generation**: Can be pre-computed and cached

## Future Enhancements

1. Real-time updates (WebSockets)
2. User following/followers
3. Advanced analytics and backtesting
4. Multi-provider market data aggregation
5. A/B testing for ranking algorithms
6. Historical accuracy tracking
7. Expert verification system

