import type { IChatService } from "@/domain/contracts";
import type { QueryAnalysis } from "@/domain/chat";

const VISUAL_KEYWORDS = [
  "graph",
  "plot",
  "geometry",
  "diagram",
  "parabola",
  "vector",
  "visualize",
  "animation",
  "show me",
  "manim",
  "proof",
  "derive",
  "matrix",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PARABOLA_MARKDOWN_RESPONSE = [
  "## Parabola: quick intuition",
  "",
  "A **parabola** is the set of all points that are equally distant from:",
  "- a fixed point called the **focus**",
  "- a fixed line called the **directrix**",
  "",
  "### Standard equation",
  "For a vertical parabola, the common form is:",
  "",
  "$$y = ax^2 + bx + c$$",
  "",
  "- If $a > 0$, it opens upward",
  "- If $a < 0$, it opens downward",
  "- Larger $|a|$ makes it narrower",
  "",
  "### Vertex",
  "The vertex x-coordinate is:",
  "",
  "$$x_v = -\\frac{b}{2a}$$",
  "",
  "Then substitute into $y=ax^2+bx+c$ to get $y_v$.",
  "",
  "### Example",
  "For $y = x^2 - 4x + 3$:",
  "",
  "$$x_v = -\\frac{-4}{2\\cdot1} = 2, \\quad y_v = 2^2 - 4(2) + 3 = -1$$",
  "",
  "So the vertex is **$(2, -1)$**.",
].join("\n");

export class MockChatService implements IChatService {
  async analyzeQuery(input: string): Promise<QueryAnalysis> {
    await delay(500);
    const lowered = input.toLowerCase();
    const score = VISUAL_KEYWORDS.reduce((acc, key) => {
      return lowered.includes(key) ? acc + 0.12 : acc;
    }, 0.1);

    return {
      shouldSuggestVideo: score >= 0.65,
      confidence: Math.min(score, 0.98),
    };
  }

  async generateTextReply(_input: string): Promise<string> {
    await delay(700);
    void _input;
    return PARABOLA_MARKDOWN_RESPONSE;
  }
}
