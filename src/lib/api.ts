const rawMathExplainerBaseUrl =
  process.env.NEXT_PUBLIC_MATH_EXPLAINER_API_BASE_URL?.trim() ?? "/api/math-explainer";

const normalizedMathExplainerBaseUrl = rawMathExplainerBaseUrl.replace(/\/+$/, "");

const forceMockVideoApi = process.env.NEXT_PUBLIC_FORCE_MOCK_VIDEO_API === "true";

export const MATH_EXPLAINER_API = {
  baseUrl: normalizedMathExplainerBaseUrl,
  hasBaseUrl: normalizedMathExplainerBaseUrl.length > 0,
  useRealVideoApi: !forceMockVideoApi && normalizedMathExplainerBaseUrl.length > 0,
  pollingIntervalMs: 2000,
  maxPollingAttempts: 180,
  endpoints: {
    explain: `${normalizedMathExplainerBaseUrl}/explain`,
    job: (jobId: string) => `${normalizedMathExplainerBaseUrl}/jobs/${jobId}`,
    video: (jobId: string) => `${normalizedMathExplainerBaseUrl}/videos/${jobId}`,
  },
} as const;
