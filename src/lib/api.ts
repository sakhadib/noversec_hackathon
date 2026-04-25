const normalizedMathExplainerBaseUrl = "http://localhost:8000";

export const MATH_EXPLAINER_API = {
  baseUrl: normalizedMathExplainerBaseUrl,
  hasBaseUrl: true,
  useRealVideoApi: true,
  pollingIntervalMs: 2000,
  maxPollingAttempts: 180,
  endpoints: {
    explain: `${normalizedMathExplainerBaseUrl}/explain`,
    job: (jobId: string) => `${normalizedMathExplainerBaseUrl}/jobs/${jobId}`,
    video: (jobId: string) => `${normalizedMathExplainerBaseUrl}/videos/${jobId}`,
  },
} as const;
