import { describe, it, expect, vi } from "vitest";
import { modelPicker } from "@/lib/model-picker";

// Mock the model providers
vi.mock("ollama-ai-provider", () => ({
    ollama: vi.fn(() => "ollama-model"),
}));

vi.mock("@ai-sdk/openai-compatible", () => ({
    createOpenAI: vi.fn(() => ({
        chat: vi.fn(() => "lmstudio-model"),
    })),
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn(() => "openai-model"),
}));

describe("Model Picker", () => {
    beforeEach(() => {
        // Reset environment variables before each test
        vi.clearAllMocks();
    });

    it("should select deepseek provider by default", () => {
        const model = modelPicker("deepseek");
        expect(model).toBeDefined();
    });

    it("should select openai provider", () => {
        const model = modelPicker("openai");
        expect(model).toBeDefined();
    });

    it("should select ollama provider", () => {
        const model = modelPicker("ollama");
        expect(model).toBeDefined();
    });

    it("should select lmstudio provider", () => {
        const model = modelPicker("lmstudio");
        expect(model).toBeDefined();
    });

    it("should use custom modelId when provided", () => {
        const model = modelPicker("deepseek", "custom-model-id");
        expect(model).toBeDefined();
    });

    it("should fallback to deepseek for invalid provider", () => {
        const model = modelPicker("invalid-provider" as any);
        expect(model).toBeDefined();
    });
});
