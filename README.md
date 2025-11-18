This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Ensure you have NPM and Node Installed on your machine

## Getting Started

First, install all dependent packages:

```bash
npm i
# or
yarn install
```

then create a .env file in your root folder and add your API_KEY's

```
PERPLEXITY_API_KEY=pplx-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

finally run your development server.

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

the public API routes are available in app/api/

to call the /triage endpoint you can run this curl command

## Curl Command

Postman Images can be found: https://tickettriage.vercel.app/

## Curl Command

```bash
curl -X POST "https://tickettriage.vercel.app/api/triage" -H "x-forwarded-for: 123.45.67.89" -H "Content-Type: application/json" -d "{\"description\": \"This is a sample issue description for triage testing.\"}"
```

## How is the LLM used?

The system is a fixed-workflow triage agent. It does not make autonomous decision or the REACT pattern.
The LLM is used only for classification and structured interpretation.
After upstream tools produce data (KB matches, metadata), the LLM receives a single consolidated prompt and returns:

- summary
- category
- severity
- known_issue vs new_issue
- suggested_next_step

Tool calls are executed before the LLM.
The main tool is the Knowledge Base Search, which runs a local similarity match against the ticket description.
Its output is passed directly into the LLM prompt as matched_issues
