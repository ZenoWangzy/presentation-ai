import { describe, it, expect } from "vitest";
import { SlideParser } from "@/components/presentation/utils/parser";

describe("SlideParser - Basic Parsing", () => {
    it("should parse simple SECTION tag", () => {
        const parser = new SlideParser();
        parser.parseChunk("<SECTION><H1>Title</H1></SECTION>");
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
        expect(slides[0]?.content).toBeDefined();
    });

    it("should extract multiple SECTION tags", () => {
        const parser = new SlideParser();
        parser.parseChunk("<SECTION><H1>Slide 1</H1></SECTION><SECTION><H1>Slide 2</H1></SECTION>");
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(2);
    });

    it("should handle empty input", () => {
        const parser = new SlideParser();
        parser.parseChunk("");
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(0);
    });
});

describe("SlideParser - Layout", () => {
    it("should recognize layout attributes", () => {
        const parser = new SlideParser();
        parser.parseChunk('<SECTION layout="left"><H1>Left</H1></SECTION>');
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides[0]?.layoutType).toBe("left");
    });
});

describe("SlideParser - Streaming", () => {
    it("should handle multiple chunks", () => {
        const parser = new SlideParser();
        parser.parseChunk("<SECTION><H1>");
        parser.parseChunk("Content");
        parser.parseChunk("</H1></SECTION>");
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });
});
