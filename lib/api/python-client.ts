/**
 * Python Backend API Client
 * Connects to FastAPI backend for parsing
 */

const API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

export interface ParseOptions {
  type?: string;
  occurred_at?: string;
  source?: string;
}

export interface ParseResponse {
  type: string;
  confidence: number;
  fields: Record<string, any>;
  timestamp: string;
  message: string;
}

/**
 * Parse natural language input using Python backend
 */
export async function parseActivityPython(
  text: string, 
  options?: ParseOptions
): Promise<ParseResponse> {
  const response = await fetch(`${API_BASE}/api/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      ...options
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Parse failed: ${error}`);
  }

  return response.json();
}

/**
 * Health check for Python backend
 */
export async function checkPythonBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}