# BYTE AI Backend - Simplified AI API Platform

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/kanish14151/byte-by-aj)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## 🚀 BYTE AI Backend

A lean, high-performance backend for BYTE AI. This service provides direct access to advanced LLM models via the Groq API, optimized for speed and simplicity. Developed by **AJ STUDIOZ**.

### ✨ Key Features

- **Direct Model Talking**: Minimal overhead between your request and the AI.
- **BYTE Personality**: Custom-tuned assistant identity.
- **Serverless**: Optimized for Vercel deployment.
- **Streaming Support**: Real-time response generation via Server-Sent Events (SSE).
- **OpenAI Compatible**: Follows the OpenAI chat completion format.

### 📡 API Endpoints

#### Core AI Services
```
POST   /api/byte                    # BYTE AI chat completion endpoint
GET    /api/health                  # Service health status
```

### 🤖 AI Model Details

- **Model Name**: BYTE Mini
- **Base Model**: Llama 3.3 70B Versatile
- **Provider**: Groq Cloud
- **Developer**: [AJ STUDIOZ](https://ajstudioz.com)

#### Usage Example

```bash
curl -X POST "https://byte-by-aj.vercel.app/api/byte" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello BYTE Mini, who developed you?"}
    ],
    "model": "byte-mini"
  }'
```

### 🚀 Deployment

1. **Clone and Install**
```bash
git clone https://github.com/kanish14151/byte-by-aj.git
cd byte-by-aj
npm install
```

2. **Configure Environment**
Create a `.env` file with your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

3. **Deploy**
Push to GitHub and connect to Vercel, or use the Vercel CLI:
```bash
vercel --prod
```

### � Monitoring

The project includes a built-in monitoring dashboard at `/meow.html` to check system health and API status in real-time.

---

**Made with ❤️ by [AJ STUDIOZ](https://ajstudioz.com)**