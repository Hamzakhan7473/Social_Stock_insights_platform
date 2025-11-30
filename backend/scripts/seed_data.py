"""
Seed script to populate database with dummy users and sample data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from datetime import datetime, timedelta, timezone
import random
import bcrypt

# Dummy user data
DUMMY_USERS = [
    {
        "username": "trader_john",
        "email": "john.trader@example.com",
        "full_name": "John Trader",
        "bio": "Professional day trader with 10+ years experience. Focus on tech stocks.",
        "reputation_score": 85.5,
        "is_verified": True
    },
    {
        "username": "investor_sarah",
        "email": "sarah.investor@example.com",
        "full_name": "Sarah Chen",
        "bio": "Value investor specializing in healthcare and biotech. CFA holder.",
        "reputation_score": 92.3,
        "is_verified": True
    },
    {
        "username": "market_analyst",
        "email": "analyst@example.com",
        "full_name": "Michael Rodriguez",
        "bio": "Equity research analyst covering semiconductors and AI companies.",
        "reputation_score": 78.9,
        "is_verified": True
    },
    {
        "username": "crypto_trader",
        "email": "crypto@example.com",
        "full_name": "Alex Kim",
        "bio": "Crypto and tech stock enthusiast. Following the money.",
        "reputation_score": 65.2,
        "is_verified": False
    },
    {
        "username": "dividend_hunter",
        "email": "dividends@example.com",
        "full_name": "Emily Watson",
        "bio": "Dividend growth investor. Building passive income streams.",
        "reputation_score": 71.8,
        "is_verified": False
    },
    {
        "username": "growth_investor",
        "email": "growth@example.com",
        "full_name": "David Park",
        "bio": "Growth stock investor. Looking for the next big thing.",
        "reputation_score": 68.4,
        "is_verified": False
    },
    {
        "username": "options_guru",
        "email": "options@example.com",
        "full_name": "Lisa Thompson",
        "bio": "Options trader and market strategist. 15 years on Wall Street.",
        "reputation_score": 88.7,
        "is_verified": True
    },
    {
        "username": "tech_insider",
        "email": "tech@example.com",
        "full_name": "Robert Lee",
        "bio": "Former FAANG engineer turned investor. Deep tech insights.",
        "reputation_score": 76.3,
        "is_verified": True
    },
    {
        "username": "macro_economist",
        "email": "macro@example.com",
        "full_name": "Jennifer Martinez",
        "bio": "Macro economist and market commentator. PhD in Economics.",
        "reputation_score": 81.5,
        "is_verified": True
    },
    {
        "username": "retail_trader",
        "email": "retail@example.com",
        "full_name": "Chris Anderson",
        "bio": "Retail trader learning the markets. Sharing my journey.",
        "reputation_score": 45.2,
        "is_verified": False
    },
    {
        "username": "quant_analyst",
        "email": "quant@example.com",
        "full_name": "Priya Patel",
        "bio": "Quantitative analyst using data science for stock selection.",
        "reputation_score": 79.6,
        "is_verified": True
    },
    {
        "username": "value_seeker",
        "email": "value@example.com",
        "full_name": "James Wilson",
        "bio": "Deep value investor. Finding undervalued gems.",
        "reputation_score": 73.1,
        "is_verified": False
    },
    {
        "username": "momentum_trader",
        "email": "momentum@example.com",
        "full_name": "Amanda Brown",
        "bio": "Momentum trader focusing on breakouts and trends.",
        "reputation_score": 62.4,
        "is_verified": False
    },
    {
        "username": "earnings_expert",
        "email": "earnings@example.com",
        "full_name": "Kevin Taylor",
        "bio": "Earnings season specialist. Predicting beats and misses.",
        "reputation_score": 84.2,
        "is_verified": True
    },
    {
        "username": "sector_rotator",
        "email": "sector@example.com",
        "full_name": "Nicole Garcia",
        "bio": "Sector rotation strategist. Following the economic cycle.",
        "reputation_score": 70.8,
        "is_verified": False
    }
]

# Sample posts data
SAMPLE_POSTS = [
    {
        "title": "AAPL Q4 Earnings Analysis: Strong iPhone Sales Drive Growth",
        "content": "Apple's Q4 earnings exceeded expectations with revenue growth of 8% YoY. The iPhone 15 Pro series showed strong demand, particularly in emerging markets. Services revenue continues to grow at 12% YoY, showing the ecosystem's strength. Looking ahead, I expect continued momentum in the premium smartphone segment. Key risks: China market exposure and potential supply chain disruptions.",
        "ticker": "AAPL",
        "insight_type": "fundamental_analysis"
    },
    {
        "title": "TSLA Technical Breakdown: Breaking Key Resistance at $250",
        "content": "Tesla is showing strong technical momentum, breaking above the $250 resistance level with high volume. The RSI is at 65, indicating healthy momentum without being overbought. The MACD shows a bullish crossover. Key support levels: $240, $235. Target: $280 based on the measured move pattern. Risk: Any negative news could trigger a sharp reversal.",
        "ticker": "TSLA",
        "insight_type": "technical_analysis"
    },
    {
        "title": "Fed Rate Cuts: Impact on Growth Stocks",
        "content": "With the Fed signaling potential rate cuts in 2024, growth stocks are likely to benefit. Lower rates reduce the discount rate for future cash flows, making growth companies more attractive. Sectors to watch: Technology, Biotech, and Consumer Discretionary. However, be cautious of overvalued names that could still correct even in a rate-cutting environment.",
        "ticker": None,
        "insight_type": "macro_commentary"
    },
    {
        "title": "NVDA Earnings Forecast: AI Demand Remains Strong",
        "content": "NVIDIA's upcoming earnings should show continued strength in AI chip demand. Data center revenue is expected to grow 50%+ YoY. Key metrics to watch: Data center revenue, gross margins (should remain above 70%), and guidance for next quarter. My forecast: EPS beat by 5-10%, revenue beat by 3-5%. The AI narrative remains intact, but valuation is stretched.",
        "ticker": "NVDA",
        "insight_type": "earnings_forecast"
    },
    {
        "title": "Warning: High Risk in Small-Cap Biotech Stocks",
        "content": "Recent volatility in small-cap biotech suggests increased risk. Many companies are trading below cash value, indicating market skepticism. Key risks: Clinical trial failures, FDA rejections, funding challenges. Only invest if you can handle 50%+ drawdowns. Consider diversifying across multiple names rather than concentrating in one stock.",
        "ticker": None,
        "insight_type": "risk_warning"
    },
    {
        "title": "GOOGL: Cloud Growth Accelerating",
        "content": "Google Cloud is showing accelerating growth, now at 22% YoY. The AI integration with Gemini is creating new revenue streams. YouTube Shorts monetization is improving. Key catalyst: Potential AI search integration could drive significant revenue. Valuation remains reasonable at 22x forward P/E. Risk: Regulatory concerns in EU.",
        "ticker": "GOOGL",
        "insight_type": "fundamental_analysis"
    },
    {
        "title": "MSFT: Azure Momentum Continues",
        "content": "Microsoft's Azure cloud business continues to show strong growth, up 28% YoY. The Copilot integration across Office products is creating new subscription revenue. Gaming division is stabilizing. Key strength: Enterprise stickiness and AI integration. Trading at premium valuation but justified by growth and margins.",
        "ticker": "MSFT",
        "insight_type": "fundamental_analysis"
    },
    {
        "title": "AMZN: E-commerce Recovery + AWS Strength",
        "content": "Amazon is showing recovery in e-commerce margins while AWS maintains strong growth. Prime membership growth is accelerating. Advertising revenue is becoming a significant profit driver. Key catalyst: Same-day delivery expansion. Valuation looks attractive relative to growth. Risk: Regulatory pressure on AWS.",
        "ticker": "AMZN",
        "insight_type": "fundamental_analysis"
    },
    {
        "title": "META: Reels Monetization Improving",
        "content": "Meta's Reels monetization is improving, closing the gap with Feed. Reality Labs losses are stabilizing. Threads is gaining traction. Key strength: Strong cash generation and buyback program. Risk: Regulatory pressure and TikTok competition. Valuation reasonable for growth rate.",
        "ticker": "META",
        "insight_type": "fundamental_analysis"
    },
    {
        "title": "Market Outlook: Rotation into Value Stocks",
        "content": "We're seeing early signs of rotation from growth to value stocks. Financials and energy are outperforming. This could be driven by expectations of higher rates or economic recovery. Key sectors to watch: Banks, Energy, Industrials. Growth stocks may underperform if this rotation accelerates.",
        "ticker": None,
        "insight_type": "macro_commentary"
    }
]


def create_dummy_users(db: Session):
    """Create dummy users"""
    print("Creating dummy users...")
    created_users = []
    
    for user_data in DUMMY_USERS:
        # Check if user already exists
        existing = db.query(models.User).filter(
            (models.User.username == user_data["username"]) | 
            (models.User.email == user_data["email"])
        ).first()
        
        if existing:
            print(f"User {user_data['username']} already exists, skipping...")
            created_users.append(existing)
            continue
        
        # Create user with hashed password
        # Use bcrypt directly to avoid passlib issues
        password = "pass123"  # Default password for all dummy users
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        db_user = models.User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            full_name=user_data["full_name"],
            bio=user_data["bio"],
            reputation_score=user_data["reputation_score"],
            is_verified=user_data["is_verified"]
        )
        db.add(db_user)
        created_users.append(db_user)
        print(f"Created user: {user_data['username']} (ID: {db_user.id})")
    
    db.commit()
    
    # Refresh to get IDs
    for user in created_users:
        db.refresh(user)
    
    return created_users


def create_sample_posts(db: Session, users: list):
    """Create sample posts from dummy users"""
    print("\nCreating sample posts...")
    
    # Get insight types
    insight_types = [
        models.InsightType.FUNDAMENTAL_ANALYSIS,
        models.InsightType.TECHNICAL_ANALYSIS,
        models.InsightType.MACRO_COMMENTARY,
        models.InsightType.EARNINGS_FORECAST,
        models.InsightType.RISK_WARNING
    ]
    
    created_posts = []
    
    for i, post_data in enumerate(SAMPLE_POSTS):
        # Assign to random user (weighted towards higher reputation users)
        user = random.choices(
            users,
            weights=[u.reputation_score for u in users]
        )[0]
        
        # Get insight type
        insight_type_map = {
            "fundamental_analysis": models.InsightType.FUNDAMENTAL_ANALYSIS,
            "technical_analysis": models.InsightType.TECHNICAL_ANALYSIS,
            "macro_commentary": models.InsightType.MACRO_COMMENTARY,
            "earnings_forecast": models.InsightType.EARNINGS_FORECAST,
            "risk_warning": models.InsightType.RISK_WARNING
        }
        insight_type = insight_type_map.get(post_data["insight_type"], models.InsightType.MACRO_COMMENTARY)
        
        # Create post with some engagement
        post = models.Post(
            author_id=user.id,
            title=post_data["title"],
            content=post_data["content"],
            ticker=post_data["ticker"],
            insight_type=insight_type,
            quality_score=random.uniform(65, 95),  # Random quality score
            like_count=random.randint(5, 50),
            helpful_count=random.randint(2, 20),
            bullish_count=random.randint(3, 30),
            bearish_count=random.randint(0, 10),
            view_count=random.randint(50, 500),
            comment_count=random.randint(0, 15),
            created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 168))  # Random time in last week
        )
        db.add(post)
        created_posts.append(post)
        print(f"Created post: {post_data['title'][:50]}... by {user.username}")
    
    db.commit()
    
    # Refresh to get IDs
    for post in created_posts:
        db.refresh(post)
    
    return created_posts


def create_sample_reactions(db: Session, users: list, posts: list):
    """Create sample reactions on posts"""
    print("\nCreating sample reactions...")
    
    reaction_types = [
        models.ReactionType.LIKE,
        models.ReactionType.BULLISH,
        models.ReactionType.HELPFUL,
        models.ReactionType.BEARISH
    ]
    
    reaction_count = 0
    
    for post in posts:
        # Each post gets reactions from 3-8 random users
        num_reactions = random.randint(3, 8)
        reacting_users = random.sample(users, min(num_reactions, len(users)))
        
        for user in reacting_users:
            reaction_type = random.choice(reaction_types)
            
            # Check if reaction already exists
            existing = db.query(models.Reaction).filter(
                models.Reaction.post_id == post.id,
                models.Reaction.user_id == user.id,
                models.Reaction.reaction_type == reaction_type
            ).first()
            
            if not existing:
                reaction = models.Reaction(
                    post_id=post.id,
                    user_id=user.id,
                    reaction_type=reaction_type
                )
                db.add(reaction)
                reaction_count += 1
    
    db.commit()
    print(f"Created {reaction_count} reactions")


def create_sample_comments(db: Session, users: list, posts: list):
    """Create sample comments on posts"""
    print("\nCreating sample comments...")
    
    comment_templates = [
        "Great analysis! I agree with your points on {ticker}.",
        "Thanks for sharing. I'm also bullish on this one.",
        "Interesting perspective. What's your price target?",
        "I have a different view - {ticker} might face headwinds.",
        "Solid fundamental analysis. The numbers support your thesis.",
        "What about the competitive landscape?",
        "Thanks for the detailed breakdown. Very helpful!",
        "I'm watching this one closely. Good call on the catalyst.",
        "Risk/reward looks favorable here.",
        "What's your time horizon for this trade?"
    ]
    
    comment_count = 0
    
    for post in posts:
        # Each post gets 2-6 comments
        num_comments = random.randint(2, 6)
        commenting_users = random.sample(users, min(num_comments, len(users)))
        
        for user in commenting_users:
            template = random.choice(comment_templates)
            ticker = post.ticker or "this stock"
            content = template.format(ticker=ticker)
            
            comment = models.Comment(
                post_id=post.id,
                author_id=user.id,
                content=content,
                like_count=random.randint(0, 10),
                created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
            )
            db.add(comment)
            comment_count += 1
            
            # Update post comment count
            post.comment_count = (post.comment_count or 0) + 1
    
    db.commit()
    print(f"Created {comment_count} comments")


def create_sample_messages(db: Session, users: list):
    """Create sample direct messages between users"""
    print("\nCreating sample messages...")
    
    message_templates = [
        "Hey! What do you think about {ticker}?",
        "Thanks for your analysis on {ticker}. Very insightful!",
        "I'm considering a position in {ticker}. Any thoughts?",
        "Great post! Would love to discuss this further.",
        "What's your take on the recent earnings?",
        "Thanks for sharing your research. It helped me make a decision.",
        "I have a different view on {ticker}. Want to discuss?",
        "Your analysis was spot on. Thanks!"
    ]
    
    message_count = 0
    
    # Create conversations between random pairs of users
    for _ in range(10):
        user1, user2 = random.sample(users, 2)
        
        # Create 2-4 messages in each conversation
        num_messages = random.randint(2, 4)
        
        for i in range(num_messages):
            sender = user1 if i % 2 == 0 else user2
            recipient = user2 if i % 2 == 0 else user1
            
            template = random.choice(message_templates)
            ticker = random.choice(["AAPL", "TSLA", "NVDA", "GOOGL", "MSFT"])
            content = template.format(ticker=ticker)
            
            message = models.DirectMessage(
                sender_id=sender.id,
                recipient_id=recipient.id,
                content=content,
                is_read=random.choice([True, False]),
                created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 72))
            )
            db.add(message)
            message_count += 1
    
    db.commit()
    print(f"Created {message_count} messages")


def main():
    """Main seeding function"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("SEEDING DATABASE WITH DUMMY DATA")
        print("=" * 60)
        
        # Create users
        users = create_dummy_users(db)
        print(f"\n✅ Created {len(users)} users")
        
        # Create posts
        posts = create_sample_posts(db, users)
        print(f"✅ Created {len(posts)} posts")
        
        # Create reactions
        create_sample_reactions(db, users, posts)
        
        # Create comments
        create_sample_comments(db, users, posts)
        
        # Create messages
        create_sample_messages(db, users)
        
        print("\n" + "=" * 60)
        print("SEEDING COMPLETE!")
        print("=" * 60)
        print(f"\nSummary:")
        print(f"- Users: {len(users)}")
        print(f"- Posts: {len(posts)}")
        print(f"- Default password for all users: pass123")
        print(f"\nYou can now login with any user:")
        for user in users[:5]:
            print(f"  - Username: {user.username}, Email: {user.email}")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

