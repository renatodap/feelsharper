import { parseHealthLogWithOpenAI } from '../ai/openai-client';
import { ParsedHealthLog } from '../types';

/**
 * Parses a natural language health log string into a structured object.
 * This utility function serves as a wrapper around the AI parsing client,
 * allowing for additional business logic or error handling to be added in the future.
 *
 * @param text The raw text of the health log.
 * @returns A promise that resolves to a ParsedHealthLog object.
 */
export async function parseHealthLog(text: string): Promise<ParsedHealthLog> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty.');
  }

  try {
    const parsedLog = await parseHealthLogWithOpenAI(text);
    // Here we could add more processing steps in the future,
    // for example, converting units, validating data, etc.
    return parsedLog;
  } catch (error) {
    console.error('Error parsing health log:', error);
    // Re-throw the error or handle it as per application requirements.
    // For now, we re-throw to let the caller handle it.
    throw error;
  }
}
