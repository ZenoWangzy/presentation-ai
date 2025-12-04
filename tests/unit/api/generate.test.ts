import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { POST as GenerateSlides } from "@/app/api/presentation/generate/route";

// Mock dependencies
vi.mock("@/server/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/model-picker", () => ({
    modelPicker: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
    streamText: vi.fn(() => ({
        toDataStreamResponse: () => new Response("mock-stream"),
    })),
}));

describe("API: /api/presentation/generate", () => {
    let auth: any;
    let mockAuth: any;

    beforeAll(async () => {
        const authModule = await import("@/server/auth");
        auth = authModule.auth;
        mockAuth = vi.mocked(auth);
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockResolvedValue({ user: { id: "test-user" } } as any);
    });

    describe("Request Validation", () => {
        it("should reject request with missing title", async () => {
            const req = new Request("http://localhost:3000/api/presentation/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    outline: ["# Topic 1", "# Topic 2"],
                    language: "en-US",
                }),
            });

            const response = await GenerateSlides(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe("Invalid request data");
        });

        it("should accept valid request with minimal fields", async () => {
            const req = new Request("http://localhost:3000/api/presentation/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "AI Training Course",
                    outline: ["# Introduction to AI", "# Machine Learning"],
                    language: "zh-CN",
                }),
            });

            const response = await GenerateSlides(req);

            expect(response.status).toBe(200);
        });
    });
});
