# Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- Docker and Docker Compose (optional, for containerized deployment)
- PostgreSQL 15+ (or use Docker)
- Redis (optional, for caching)
- OpenAI API key

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd "Social Stock Insights platform"
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your OPENAI_API_KEY
   ```

3. **Deploy with Docker Compose**
   ```bash
   ./deployment/deploy.sh
   ```

   Or manually:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb social_stock_insights
   
   # Run migrations (if using Alembic)
   alembic upgrade head
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

### LLM Service Package

1. **Install the package**
   ```bash
   cd llm_service
   pip install -e .
   ```

2. **Use in your code**
   ```python
   from llm_service import LLMAnalyzer, RankingEngine
   
   analyzer = LLMAnalyzer(api_key="your-key")
   result = analyzer.analyze(title="...", content="...", ticker="AAPL")
   ```

## Configuration

### Environment Variables

**Backend (.env)**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (optional)
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: Model to use (default: gpt-4-turbo-preview)
- `CORS_ORIGINS`: Allowed CORS origins

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Database Schema

The application uses SQLAlchemy models. Key tables:
- `users`: User accounts and reputation scores
- `posts`: Stock analysis posts with LLM-generated metadata
- `reactions`: User reactions to posts
- `market_trends`: Detected market trends
- `user_feed_preferences`: User personalization preferences

## API Endpoints

### Posts
- `POST /api/posts/` - Create a new post
- `GET /api/posts/` - List posts (with filters)
- `GET /api/posts/{id}` - Get a single post
- `POST /api/posts/{id}/reactions` - React to a post

### Feeds
- `GET /api/feeds/personalized` - Get personalized feed
- `GET /api/feeds/trending` - Get trending tickers

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/explanation/{post_id}` - Get LLM explanation

### Market Data
- `GET /api/market/ticker/{ticker}` - Get ticker data
- `GET /api/market/trends` - Detect market trends

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Deployment

### Using Docker Compose

1. Update `docker-compose.yml` for production settings
2. Set environment variables in production `.env`
3. Run: `docker-compose -f docker-compose.prod.yml up -d`

### Using Kubernetes

See `deployment/kubernetes/` for Kubernetes manifests.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `createdb social_stock_insights`

### OpenAI API Issues
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota and billing
- Try a different model if needed

### Frontend Not Connecting to Backend
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Verify CORS settings in backend
- Check browser console for errors

## Next Steps

1. Add authentication (JWT tokens)
2. Implement real-time updates (WebSockets)
3. Add more market data providers
4. Enhance LLM prompts for better analysis
5. Add user following/followers system
6. Implement notification system

