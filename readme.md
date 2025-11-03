# Sakhi Seva

Platform empowering rural women entrepreneurs in Maharashtra through digital skills training, marketplace, and government schemes access.

## Features

### 🎓 AI Trainer
- Powered by **Gemini 2.5 Flash**
- Real-time web search with Google
- Structured resource cards (videos, articles, blogs)
- Conversation history
- Web citations and summaries
- Auto-parse JSON for resource info
- 24/7 support

### 🏪 Marketplace
- Product listings
- CRUD
- Seller profiles
- Tags and categories

### 📋 Government Schemes
- Women-entrepreneur programs
- Application links
- Maharashtra focus

## Setup

### Prerequisites
- Node.js 20+
- npm or pnpm
- MongoDB Atlas (optional)
- Gemini API key (required for AI Trainer)

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Create `.env.local`:
```env
# MongoDB (Optional)
MONGODB_URI=mongodb://localhost:27017/sakhi-seva

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Gemini API (Required for AI Trainer)
GEMINI_API_KEY=your-gemini-api-key
```

3. Run:
```bash
npm run dev
```

4. Open http://localhost:3000

### Get Gemini API Key
1. https://ai.google.dev/
2. Create an account or sign in
3. Generate a new key

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- MongoDB (optional)
- Gemini 2.5 Flash
- MongoDB
- JWT auth
- React Markdown