# 🔒 Security Notice - API Key Exposure

## ⚠️ CRITICAL: Exposed API Key

During the development process, a Gemini API key was accidentally exposed in public communication:

```
API Key: AIzaSyCr6u1sXeP0Itf2AcMkTIVUADVGhyfsUg0
```

### ⚡ Immediate Actions Required

1. **REVOKE** this API key immediately at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **GENERATE** a new API key
3. **CONFIGURE** the new API key in your environment:

```bash
# Create or update .env file
echo "GEMINI_API_KEY=your_new_secure_api_key_here" > .env
```

### 🛡️ Security Best Practices

- **NEVER** share API keys in:
  - Chat messages
  - Code comments
  - Public repositories
  - Screenshots
  - Documentation

- **ALWAYS** store API keys:
  - In `.env` files (which are gitignored)
  - In secure environment variable services
  - In secret management systems

- **ROTATE** API keys:
  - Immediately if exposed
  - Regularly as a security practice
  - When team members leave

### 📋 How to Set Up

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key
4. Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_new_api_key_here
```

5. Restart the server:

```bash
npm run server:dev
```

### ✅ Verification

The application will work without the API key (using fallback pattern matching), but for best results with AI-powered question parsing, a valid Gemini API key is required.

You'll see this warning in the console if the key is not configured:
```
⚠️ Gemini API key not configured, using fallback parser
```

### 📞 Support

If you need help with API key setup or have questions about security, please refer to the [Google AI Studio documentation](https://ai.google.dev/tutorials/setup).
