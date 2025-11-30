# Architecture Diagram

## Visual Architecture

A visual architecture diagram is available at:
- **Location**: `frontend/LLM-Driven Stock Insight Platform Architecture.jam`
- **Format**: JAM file (diagramming tool format)

## How to View

The `.jam` file can be opened with various diagramming tools. If you need to convert it or view it:

1. **If using a diagramming tool**: Open the `.jam` file directly
2. **Export options**: Export to PNG, PDF, or SVG for documentation
3. **Alternative**: Create a markdown-based diagram using Mermaid syntax (see below)

## Quick Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Feed View   │  │  Post View   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
┌───────────────────────────▼─────────────────────────────────┐
│              Backend API (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Posts API  │  │  Feeds API   │  │ Analytics API │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────┬───────────────────────────────┬─────────────────┘
            │                                 │
    ┌───────▼────────┐              ┌────────▼────────┐
    │  LLM Service   │              │ Market Data     │
    │  (OpenAI)      │              │ Service         │
    └───────┬────────┘              └────────┬─────────┘
            │                                 │
            │                      ┌─────────▼─────────┐
            │                      │ StockTwits API    │
            │                      │ (Sentiment)       │
            │                      └───────────────────┘
    ┌───────▼────────┐
    │  PostgreSQL    │
    │  Database      │
    └────────────────┘
```

## Component Details

### Frontend Layer
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Components**: Dashboard, Feed, Post Cards, Analytics

### Backend Layer
- **Framework**: FastAPI
- **Services**: 
  - LLM Service (content analysis)
  - Market Data Service (yfinance)
  - StockTwits Service (sentiment)
  - Reputation Service

### Data Layer
- **Database**: PostgreSQL
- **Cache**: Redis (optional)
- **External APIs**: OpenAI, yfinance, StockTwits

### LLM Pipeline
1. Post Creation → Background Analysis
2. Content Analysis → Semantic Tagging
3. Quality Scoring → Ranking
4. Feed Generation → Personalization

## Data Flow

1. **User creates post** → Saved to DB → Background LLM analysis
2. **LLM analyzes** → Extracts tags, summary, quality score
3. **Market data fetched** → Price, volume, fundamentals, sentiment
4. **Ranking engine** → Combines signals → Personalized feed
5. **Dashboard updates** → Trending tickers, top insights, sentiment

## Integration Points

- **LLM**: OpenAI GPT-4 for content analysis
- **Market Data**: yfinance for price/volume/fundamentals
- **Social Sentiment**: StockTwits API (optional)
- **Database**: PostgreSQL for persistence
- **Cache**: Redis for performance (optional)

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).




