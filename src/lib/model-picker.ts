import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

// Exponential backoff utility
function exponentialBackoff(retryCount: number): number {
  const delay = INITIAL_DELAY * Math.pow(2, retryCount);
  return Math.min(delay, MAX_DELAY);
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Centralized model picker function for all presentation generation routes
 * Supports DeepSeek, OpenAI, Ollama, and LM Studio models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  // Priority 1: DeepSeek (default provider)
  if (modelProvider === "deepseek" || (!modelProvider && process.env.DEEPSEEK_API_KEY)) {
    const deepseek = createOpenAI({
      name: "deepseek",
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY || "",
    });

    // Use specified model or default deepseek-chat
    const deepseekModel = modelId && modelId.startsWith("deepseek-") ? modelId : "deepseek-chat";
    return deepseek(deepseekModel) as unknown as LanguageModelV1;
  }

  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  // Fallback to OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI();
    const openaiModel = modelId && !modelId.startsWith("deepseek-") ? modelId : "gpt-4o-mini";
    return openai(openaiModel) as unknown as LanguageModelV1;
  }

  // Error if no AI provider is configured
  throw new Error(
    "No AI provider configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable."
  );
}

/**
 * Enhanced model picker with retry mechanism and fallback support
 * Attempts to use the primary provider with retries, then falls back to backup providers
 */
export async function modelPickerWithRetry(
  modelProvider: string,
  modelId?: string,
  options?: {
    maxRetries?: number;
    enableFallback?: boolean;
    onRetry?: (error: Error, retryCount: number) => void;
  }
): Promise<LanguageModelV1> {
  const { maxRetries = MAX_RETRIES, enableFallback = true, onRetry } = options || {};

  // Define provider priority for fallback
  const providerPriority = [
    { provider: "deepseek", modelId: modelId && modelId.startsWith("deepseek-") ? modelId : "deepseek-chat" },
    { provider: "openai", modelId: modelId && !modelId.startsWith("deepseek-") ? modelId : "gpt-4o-mini" },
  ];

  // If a specific provider is requested, try it first
  if (modelProvider && modelProvider !== "auto") {
    const requestedProvider = providerPriority.find(p => p.provider === modelProvider);
    if (requestedProvider) {
      try {
        return await tryProviderWithRetry(requestedProvider.provider, requestedProvider.modelId, maxRetries, onRetry);
      } catch (error) {
        console.warn(`Primary provider ${modelProvider} failed:`, error);
        if (!enableFallback) throw error;
      }
    }
  }

  // Try providers in priority order
  for (const { provider, modelId: defaultModelId } of providerPriority) {
    try {
      return await tryProviderWithRetry(provider, defaultModelId, maxRetries, onRetry);
    } catch (error) {
      console.warn(`Provider ${provider} failed:`, error);
      // Continue to next provider
      continue;
    }
  }

  throw new Error(
    "All AI providers failed. Please check your API keys and network connection."
  );
}

/**
 * Try a specific provider with retry mechanism
 */
async function tryProviderWithRetry(
  provider: string,
  defaultModelId: string,
  maxRetries: number,
  onRetry?: (error: Error, retryCount: number) => void
): Promise<LanguageModelV1> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return modelPicker(provider, defaultModelId);
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = exponentialBackoff(attempt);
        console.warn(`Provider ${provider} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);

        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
