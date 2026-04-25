This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend Plug-and-Play Setup

The Math Explainer backend base URL is configured in one place via environment variable:

```bash
NEXT_PUBLIC_MATH_EXPLAINER_API_BASE_URL=/api/math-explainer
```

Where it is consumed:
- `src/lib/api.ts`

Behavior:
- By default, the frontend uses the real Math Explainer adapter and routes calls through Next.js proxy:
	- `POST /api/math-explainer/explain`
	- `GET /api/math-explainer/jobs/{job_id}`
	- `GET /api/math-explainer/videos/{job_id}`
- Proxy target defaults to `http://localhost:8000` (backend local server).
- To force frontend mock video mode, set `NEXT_PUBLIC_FORCE_MOCK_VIDEO_API=true`.

## Backend Team Local Test Flow

1. Start backend API on `http://localhost:8000` (as per `api_contract.md`).
2. In this frontend repo:

```bash
cp .env.example .env.local
npm install
npm run dev
```

3. Open `http://localhost:3000`.

No CORS setup is required for local testing because frontend calls same-origin proxy routes.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
