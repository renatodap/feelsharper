# Ask Feel Sharper - AI Wellness Assistant

A conversational AI assistant that transforms Feel Sharper's evidence-based content into personalized wellness guidance for men seeking to optimize their performance fundamentals.

## 🎯 Overview

**Ask Feel Sharper** is an AI-powered wellness coach that:
- Answers personal wellness questions using Feel Sharper's evidence-based approach
- References and links to relevant Feel Sharper articles
- Provides practical, actionable guidance without medical advice
- Maintains the brand's direct, grounded, intentional voice

## 🏗️ Architecture

### Core Components

1. **Content Processing** (`lib/embeddings.ts`)
   - Loads and chunks MDX content
   - Generates embeddings using OpenAI's text-embedding-3-small
   - Processes Feel Sharper articles for semantic search

2. **Vector Store** (`lib/vector-store.ts`)
   - In-memory vector database for development
   - Semantic similarity search over content
   - Supports both full posts and content chunks

3. **Retrieval System** (`lib/retrieval.ts`)
   - Query preprocessing and enhancement
   - Context injection for Claude
   - Relevance scoring and deduplication

4. **Rate Limiting** (`lib/rate-limiter.ts`)
   - 3 questions per hour per session
   - Cost control and abuse prevention
   - Automatic session cleanup

5. **API Endpoint** (`app/api/ask/route.ts`)
   - Claude Sonnet integration
   - Input validation and error handling
   - Response formatting with sources

6. **Chat UI** (`components/chat/AskFeelSharper.tsx`)
   - Floating chat interface
   - Mobile-responsive design
   - Source attribution and disclaimers

## 🚀 Setup & Deployment

### 1. Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Required API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Generate Embeddings

Run the build script to process your content:

```bash
npx tsx scripts/generate-embeddings.ts
```

This will:
- Process all MDX files in `content/posts/`
- Generate embeddings for posts and chunks
- Initialize the vector store
- Save embeddings to `data/embeddings.json`

### 3. Development

```bash
npm run dev
```

The chat interface will appear as a floating button in the bottom-right corner.

### 4. Production Deployment

#### Vercel (Recommended)

1. Deploy to Vercel:
```bash
vercel --prod
```

2. Set environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`

3. The embedding generation runs during build time automatically.

#### Other Platforms

For other platforms, ensure you:
1. Run `npx tsx scripts/generate-embeddings.ts` during build
2. Set the required environment variables
3. Ensure Node.js 18+ runtime

## 💬 Usage Examples

### Sample Queries

**Sleep Optimization:**
- "Should I take magnesium at night?"
- "I wake up at 3am every night, what should I do?"
- "What's better for sleep: magnesium or ashwagandha?"

**Energy & Focus:**
- "How do I build a morning routine for better energy?"
- "What supplements actually work for energy?"
- "I crash at 2pm every day, help?"

**Implementation Help:**
- "I tried the 3-day sleep protocol but still feel groggy"
- "How do I optimize my sleep if I work night shifts?"

### Expected Behavior

✅ **The assistant will:**
- Provide evidence-based wellness guidance
- Reference relevant Feel Sharper articles with links
- Maintain the brand's direct, grounded, intentional voice
- Include appropriate medical disclaimers
- Stay within wellness/lifestyle optimization scope

❌ **The assistant will NOT:**
- Diagnose medical conditions
- Prescribe treatments or medications
- Make definitive health claims
- Replace professional medical advice

## 🛡️ Safety & Compliance

### Rate Limiting
- 3 questions per hour per session
- Automatic reset after 1 hour
- Graceful error handling for limits

### Content Policy
- No medical diagnosis or treatment recommendations
- Always includes disclaimer about consulting healthcare professionals
- Focuses on lifestyle optimization and wellness
- Cites research when available but emphasizes practical application

### Cost Control
- Token limits: 500 input / 800 output per request
- Embedding generation only during build time
- Efficient vector search with similarity thresholds

## 🔧 Technical Details

### Dependencies
- **@anthropic-ai/sdk**: Claude API integration
- **gray-matter**: MDX frontmatter parsing
- **lucide-react**: UI icons
- **OpenAI API**: Embedding generation

### Performance
- In-memory vector store for fast retrieval
- Chunked content for better context matching
- Optimized embedding dimensions (1536)
- Response caching opportunities

### Monitoring
- API health check endpoint: `/api/ask` (GET)
- Rate limiting statistics
- Error logging and handling

## 📊 Analytics & Optimization

### Key Metrics to Track
- Query volume and patterns
- User satisfaction (implicit through engagement)
- Most referenced articles
- Common question themes
- Rate limit hit frequency

### Content Optimization
- Monitor which articles get referenced most
- Identify gaps in content coverage
- Track query types that don't find good matches
- Optimize chunk sizes for better retrieval

## 🔄 Maintenance

### Regular Tasks
1. **Content Updates**: Re-run embedding generation when adding new posts
2. **API Key Rotation**: Update keys in environment variables
3. **Performance Monitoring**: Check response times and error rates
4. **Cost Monitoring**: Track OpenAI and Anthropic usage

### Scaling Considerations
- **Vector Store**: Migrate to Supabase Vector or Pinecone for production scale
- **Rate Limiting**: Use Redis for multi-instance deployments
- **Caching**: Add response caching for common queries
- **Analytics**: Implement proper usage tracking

## 🎨 Brand Alignment

The assistant embodies Feel Sharper's core philosophy:

> "Most men drift through life accepting mediocrity. Feel Sharper rejects this."

**Voice Characteristics:**
- **Direct**: No fluff, clear actionable advice
- **Grounded**: Evidence-based, practical solutions
- **Intentional**: Every choice matters, purposeful living

## 🚨 Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Users hit 3 questions/hour limit
- Wait for reset or implement session management

**"Search service temporarily unavailable"**
- OpenAI API key missing or invalid
- Check environment variables

**"AI service temporarily unavailable"**
- Anthropic API key missing or invalid
- Check environment variables and quotas

**No relevant content found**
- Content not properly embedded
- Re-run embedding generation script
- Check content directory structure

### Debug Mode
Set `NODE_ENV=development` for detailed logging and error messages.

## 📈 Future Enhancements

### Phase 2 Features
- **Conversation Memory**: Remember context within sessions
- **Personalization**: Adapt responses based on user patterns
- **Advanced Analytics**: Detailed usage insights and optimization
- **Multi-language Support**: Expand beyond English content

### Technical Improvements
- **Streaming Responses**: Real-time response generation
- **Better Chunking**: Semantic-aware content splitting
- **Hybrid Search**: Combine vector and keyword search
- **Response Caching**: Cache common query responses

---

**Status**: ✅ Production Ready
**Last Updated**: January 2025
**Version**: 1.0.0
