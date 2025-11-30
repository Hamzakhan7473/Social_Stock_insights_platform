# Social Stock Insights Platform

A social platform where traders and investors share stock analyses, trading ideas, and market insights. We use AI to automatically organize content, tag posts semantically, and rank your personalized feed based on what matters most to you.

## 🚀 What This Platform Does

Think of it as Twitter meets Reddit, but specifically for stock analysis. Here's what you can do:

- **Share Your Analysis**: Post your trading ideas and stock analyses for the community
- **Discover Insights**: Browse personalized feeds ranked by AI based on quality and relevance
- **Track Market Trends**: See live price movements, volume spikes, and earnings releases
- **Understand Sentiment**: Get social sentiment signals from StockTwits integration
- **Build Reputation**: Earn reputation scores based on the quality of your insights
- **Get Explanations**: See why certain posts are recommended to you with AI-generated explanations

The platform uses GPT-4 to analyze every post, extract key information, and rank content using multiple signals like quality, engagement, author reputation, and market relevance.

## ✨ Key Features

- **AI-Powered Content Analysis**: Every post gets analyzed by GPT-4 for semantic tags, quality scores, and summaries
- **Multiple Insight Types**: Support for fundamental analysis, technical analysis, macro commentary, earnings forecasts, and risk warnings
- **Live Market Data**: Real-time price movements and volume data from Yahoo Finance, with dynamic re-ranking based on market conditions
- **Smart Ranking**: Our ensemble algorithm combines multiple signals - post quality, engagement metrics, author reputation, user preferences, and market relevance
- **Social Features**: Comments, direct messaging, following users, and reactions (like, helpful, bullish, bearish)
- **Dashboard Analytics**: Track trending tickers, top insights, user reputation leaderboards, and aggregated sentiment
- **Transparency**: Get AI-generated explanations for why certain posts are recommended to you
- **Flexible Ranking Strategies**: Choose from balanced, quality-focused, trending, diverse, or expert-based ranking
- **Batch Processing**: Process multiple posts at once for downstream analytics
- **Reusable LLM Service**: Export the LLM analysis engine as a standalone Python package  

## 🏗️ System Architecture

Here's how everything fits together:

![System Architecture](architecture/Social%20Stock%20Insights%20-%20System%20Architecture.jpg)

**High-Level Overview:**

- **Frontend**: Next.js 15 + React 18 with TypeScript. Clean, modern UI built with Tailwind CSS
- **Backend API**: FastAPI (Python) with PostgreSQL for data persistence
- **LLM Service**: Reusable Python package that handles content analysis, ranking, and explanation generation using GPT-4
- **Market Data**: Yahoo Finance integration via `yfinance` library, with StockTwits for social sentiment
- **Authentication**: JWT-based auth with bcrypt password hashing

The architecture follows a clean separation: frontend talks to the API, which orchestrates various services (LLM, market data, reputation), and everything persists to PostgreSQL. The LLM service can also be used standalone for batch processing.

For more details, check out [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Getting Started

The fastest way to get up and running is with Docker. If you prefer manual setup, check out [SETUP.md](SETUP.md).

### Quick Start with Docker

1. **Clone the repo** (if you haven't already)
   ```bash
   git clone <repo-url>
   cd "Social Stock Insights platform"
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your OPENAI_API_KEY
   ```

3. **Start everything**
   ```bash
   docker-compose up -d
   ```

4. **Access the platform**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

That's it! The frontend and backend will start up, and you can start using the platform right away.

**Note**: You'll need an OpenAI API key for the LLM features to work. Get one at https://platform.openai.com/

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [RESEARCH_INTEGRATION.md](RESEARCH_INTEGRATION.md) - Research-based enhancements and findings
- [llm_service/README.md](llm_service/README.md) - LLM service package documentation
- `frontend/LLM-Driven Stock Insight Platform Architecture.jam` - Visual architecture diagram

## 🔬 Research-Backed Features

We've incorporated findings from research on using LLMs for stock analysis. The platform includes:

- **Fundamental Data Integration**: We pull in financial fundamentals (revenue growth, P/E ratios, etc.) to enhance analysis quality
- **Social Sentiment Signals**: StockTwits integration provides sentiment data that helps with short-term predictions
- **Forward-Looking Analysis**: Our LLM prompts emphasize forward-looking perspectives and fundamental focus
- **Multi-Signal Ranking**: We combine fundamentals, market data, and sentiment signals for better ranking

For more details on the research integration, see [RESEARCH_INTEGRATION.md](RESEARCH_INTEGRATION.md).

## 🔧 What's Under the Hood

### Backend (`backend/`)
Built with FastAPI, handling all the business logic:
- REST API endpoints for posts, feeds, analytics, comments, messages
- PostgreSQL database with SQLAlchemy ORM
- LLM service integration for content analysis
- Market data fetching from Yahoo Finance
- User reputation scoring system
- Feed ranking engine with multiple strategies

### Frontend (`frontend/`)
Next.js 15 application with a modern, dark-themed UI:
- Dashboard showing trending tickers, top insights, and sentiment
- Personalized feed with AI-ranked posts
- Post creation and interaction (comments, reactions)
- Direct messaging between users
- User profiles and following system
- Real-time sentiment visualization

### LLM Service (`llm_service/`)
A standalone Python package you can use independently:
- Content analyzer that extracts semantic tags and quality scores
- Ranking engine with ensemble algorithm
- Trend detector for market patterns
- Can be imported and used in other projects

## 🎯 API Overview

The backend exposes a REST API with endpoints for everything you need. Here are the main ones:

**Core Endpoints:**
- `POST /api/posts/` - Create a new post (triggers LLM analysis in the background)
- `GET /api/feeds/personalized` - Get your personalized feed, ranked by AI
- `GET /api/analytics/dashboard` - Get dashboard data (trending tickers, top insights, etc.)
- `GET /api/market/ticker/{ticker}` - Fetch live market data for a ticker
- `GET /api/analytics/explanation/{post_id}` - Get AI explanation for why a post was recommended

**Social Features:**
- `POST /api/comments/` - Comment on posts (supports nested replies)
- `POST /api/messages/` - Send direct messages
- `POST /api/users/{id}/follow` - Follow a user

**Advanced Features:**
- `POST /api/analytics/batch` - Process multiple posts at once
- `POST /api/analytics/rerank` - Re-rank posts with fresh market data
- `GET /api/analytics/strategy-experiment` - Try different ranking strategies

**Ranking Strategies:**
You can customize how posts are ranked:
- `balanced` (default) - Equal weight to all signals
- `quality_focused` - Prioritize high-quality analysis
- `trending` - Focus on market relevance and timeliness
- `diverse` - Maximize variety across tickers and sectors
- `expert` - Prioritize posts from high-reputation authors

For complete API documentation with request/response examples, visit http://localhost:8000/docs when the backend is running.

## 🔑 Configuration

You'll need to set up a few environment variables. Copy `backend/.env.example` to `backend/.env` and fill in:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key (get one at https://platform.openai.com/)

**Optional (but recommended):**
- `STOCKTWITS_API_KEY` - RapidAPI key for StockTwits sentiment data (get from https://rapidapi.com/stocktwits/api/stocktwits)

The `.env.example` file has all the configuration options with descriptions. Most things work out of the box with sensible defaults.

## 🐳 Deployment

For local development, Docker Compose is the easiest option. For production:

- **Docker Compose**: Perfect for local dev and small deployments - just `docker-compose up -d`
- **Kubernetes**: Production-ready manifests are in `deployment/kubernetes/`
- **Manual Setup**: If you prefer to run things manually, see [SETUP.md](SETUP.md)

## 🧪 Testing

Run the test suites:

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test

# Test the LLM service package
cd llm_service && python example_usage.py
```

We also have seed data scripts to populate the database with dummy users and posts for testing. Check out `backend/scripts/seed_data.py`.

## 📦 Project Structure

```
Social Stock Insights platform/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── llm_service/       # Reusable LLM package
├── deployment/        # Deployment scripts
├── docker-compose.yml  # Docker setup
└── README.md          # This file
```

## 🚧 What's Next

Some ideas we're considering:
- Real-time updates via WebSockets for live feed updates
- Historical accuracy tracking to improve reputation scores
- Advanced analytics and backtesting capabilities
- Multi-provider market data aggregation (beyond Yahoo Finance)
- Mobile app support

Feel free to open an issue if you have feature requests or ideas!

## 📄 License

This project is provided as-is for demonstration and educational purposes.

---

**Built with ❤️ using FastAPI, Next.js, PostgreSQL, and GPT-4**

