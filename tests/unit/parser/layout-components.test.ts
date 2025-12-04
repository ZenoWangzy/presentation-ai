import { describe, it, expect } from "vitest";
import { SlideParser } from "@/components/presentation/utils/parser";

describe("SlideParser - Layout Components", () => {
    it("should handle COLUMNS layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <COLUMNS>
          <DIV><H3>Column 1</H3></DIV>
          <DIV><H3>Column 2</H3></DIV>
        </COLUMNS>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
        expect(slides[0].content).toBeDefined();
    });

    it("should handle BULLETS layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <BULLETS>
          <DIV><H3>Point 1</H3></DIV>
          <DIV><H3>Point 2</H3></DIV>
        </BULLETS>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle ICONS layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <ICONS>
          <DIV><ICON query="rocket" /><H3>Innovation</H3></DIV>
        </ICONS>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle CYCLE layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <CYCLE>
          <DIV><H3>Step 1</H3></DIV>
          <DIV><H3>Step 2</H3></DIV>
        </CYCLE>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle ARROWS layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <ARROWS>
          <DIV><H3>Start</H3></DIV>
          <DIV><H3>End</H3></DIV>
        </ARROWS>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle TIMELINE layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <TIMELINE>
          <DIV><H3>2020</H3><P>Event 1</P></DIV>
          <DIV><H3>2021</H3><P>Event 2</P></DIV>
        </TIMELINE>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle TABLE layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <TABLE>
          <TR><TH>Header 1</TH><TH>Header 2</TH></TR>
          <TR><TD>Data 1</TD><TD>Data 2</TD></TR>
        </TABLE>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle CHART layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <CHART charttype="bar">
          <DATA><LABEL>Q1</LABEL><VALUE>100</VALUE></DATA>
          <DATA><LABEL>Q2</LABEL><VALUE>150</VALUE></DATA>
        </CHART>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle PYRAMID layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <PYRAMID>
          <DIV><H3>Top</H3></DIV>
          <DIV><H3>Middle</H3></DIV>
          <DIV><H3>Bottom</H3></DIV>
        </PYRAMID>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });

    it("should handle COMPARE layout", () => {
        const parser = new SlideParser();
        parser.parseChunk(`
      <SECTION>
        <COMPARE>
          <DIV><H3>Option A</H3></DIV>
          <DIV><H3>Option B</H3></DIV>
        </COMPARE>
      </SECTION>
    `);
        parser.finalize();
        const slides = parser.getAllSlides();

        expect(slides).toHaveLength(1);
    });
});
