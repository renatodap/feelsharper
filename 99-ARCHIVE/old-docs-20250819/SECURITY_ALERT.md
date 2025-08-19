# 🚨 CRITICAL SECURITY ALERT

## Exposed API Keys Detected

The following API keys were exposed in the repository and need IMMEDIATE rotation:

### Compromised Keys:
1. **Anthropic API Key**: `sk-ant-api03-04DhLL...` (ROTATE IMMEDIATELY)
2. **OpenAI API Key**: `sk-proj-9ek8PE...` (ROTATE IMMEDIATELY)
3. **Supabase Service Role Key**: `eyJhbGciOiJIUzI1...` (ROTATE IMMEDIATELY)

### Required Actions:

1. **Rotate All Keys NOW**:
   - Go to https://console.anthropic.com → Generate new API key
   - Go to https://platform.openai.com/api-keys → Create new key
   - Go to Supabase Dashboard → Settings → API → Regenerate service role key

2. **Update .env.local** with new keys

3. **Update Vercel Environment Variables** with new keys

4. **Never commit .env.local to git** (already in .gitignore)

### Security Best Practices:
- Use environment variables only
- Never hardcode API keys
- Rotate keys every 90 days
- Use least-privilege keys when possible
- Monitor API usage for anomalies

**Status**: CRITICAL - Fix before deployment