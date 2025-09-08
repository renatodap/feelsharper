# Backend Integration Guide

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js and npm (already installed for frontend)

### Installation

1. Install Python dependencies:
```bash
npm run backend:install
```

2. Configure environment variables:
- Copy `backend/.env.example` to `backend/.env` if needed
- Update with your specific configuration

### Development

#### Run backend only:
```bash
npm run backend:dev
```

#### Run frontend and backend together:
```bash
npm run fullstack:dev
```

### Testing

#### Run backend tests:
```bash
npm run backend:test
```

#### Run backend tests with coverage:
```bash
npm run backend:coverage
```

### API Endpoints

The backend runs on `http://localhost:8000` by default and provides:

- `/api/auth/*` - Authentication endpoints
- `/api/parse/*` - Parser endpoints
- `/docs` - Swagger API documentation

### Architecture

```
backend/
├── api/           # API routes and endpoints
├── models/        # Data models
├── services/      # Business logic
├── tests/         # Test suite
└── main.py        # FastAPI application entry
```

### Deployment Notes

For production deployment:
1. Set proper environment variables
2. Use a production WSGI server (e.g., uvicorn with gunicorn)
3. Configure CORS settings appropriately
4. Set up proper database connections