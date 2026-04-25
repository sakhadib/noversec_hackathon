import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/mock/chat/analyze", async ({ request }) => {
    const body = (await request.json()) as { input: string };
    const lowered = body.input.toLowerCase();
    const shouldSuggestVideo = /graph|diagram|vector|geometry|visual|manim/.test(lowered);

    return HttpResponse.json({
      shouldSuggestVideo,
      confidence: shouldSuggestVideo ? 0.82 : 0.24,
    });
  }),
];
