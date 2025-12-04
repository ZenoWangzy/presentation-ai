import { z } from "zod";

/**
 * Schema for search result items from web search
 */
export const SearchResultItemSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    url: z.string().url().optional(),
});

/**
 * Schema for search results grouped by query
 */
export const SearchResultSchema = z.object({
    query: z.string(),
    results: z.array(SearchResultItemSchema).default([]),
});

/**
 * Schema for outline generation request (without search)
 * Used by /api/presentation/outline
 */
export const OutlineRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    numberOfCards: z.number().int().min(1, "Number of cards must be at least 1").max(20, "Number of cards cannot exceed 20"),
    language: z.string().min(2, "Language code must be at least 2 characters"),
    modelProvider: z.enum(["deepseek", "openai", "ollama", "lmstudio"]).optional().default("deepseek"),
    modelId: z.string().optional(),
});

/**
 * Schema for outline generation request with web search
 * Used by /api/presentation/outline-with-search
 */
export const OutlineWithSearchRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    numberOfCards: z.number().int().min(1, "Number of cards must be at least 1").max(20, "Number of cards cannot exceed 20"),
    language: z.string().min(2, "Language code must be at least 2 characters"),
    modelProvider: z.enum(["deepseek", "openai", "ollama", "lmstudio"]).optional().default("deepseek"),
    modelId: z.string().optional(),
});

/**
 * Schema for slides generation request
 * Used by /api/presentation/generate
 */
export const SlidesRequestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    prompt: z.string().default(""),
    outline: z.array(z.string()).min(1, "Outline must contain at least one item"),
    language: z.string().min(2, "Language code must be at least 2 characters"),
    tone: z.string().default("professional"),
    modelProvider: z.enum(["deepseek", "openai", "ollama", "lmstudio"]).optional().default("deepseek"),
    modelId: z.string().optional(),
    searchResults: z.array(SearchResultSchema).optional(),
});

// Export inferred types for TypeScript usage
export type OutlineRequest = z.infer<typeof OutlineRequestSchema>;
export type OutlineWithSearchRequest = z.infer<typeof OutlineWithSearchRequestSchema>;
export type SlidesRequest = z.infer<typeof SlidesRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
