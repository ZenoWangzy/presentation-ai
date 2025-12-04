import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { POST as OutlineGenerate } from "@/app/api/presentation/outline/route";

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

describe("API: /api/presentation/outline", () => {
    let auth: any;
    let mockAuth: any;

    beforeAll(async () => {
        const authModule = await import("@/server/auth");
        auth = authModule.auth;
        mockAuth = vi.mocked(auth);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Authentication", () => {
        it("should return 401 if user is not authenticated", async () => {
            mockAuth.mockResolvedValue(null);

            const req = new Request("http://localhost:3000/api/presentation/outline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: "Test topic",
                    numberOfCards: 5,
                    language: "en-US",
                }),
            });

            const response = await OutlineGenerate(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe("Unauthorized");
        });
    });

    describe("Request Validation", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "test-user" } } as any);
        });

        it("should reject request with missing prompt", async () => {
            const req = new Request("http://localhost:3000/api/presentation/outline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numberOfCards: 5,
                    language: "en-US",
                }),
            });

            const response = await OutlineGenerate(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe("Invalid request data");
        });

        it("should accept valid request with minimal fields", async () => {
            const req = new Request("http://localhost:3000/api/presentation/outline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: "AI technology overview",
                    numberOfCards: 5,
                    language: "en-US",
                }),
            });

            const response = await OutlineGenerate(req);

            expect(response.status).toBe(200);
        });
    });
});
