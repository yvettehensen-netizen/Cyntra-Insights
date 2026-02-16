# Board Intelligence Pipeline (Next.js + Supabase + OpenAI)

Volledige bestuurlijke analysepipeline met:

- Supabase schema (`organizations`, `analyses`, `reports` + indexes + triggers)
- Next.js App Router API endpoints
- Uploads endpoint + opslag in Supabase Storage
- Worker/job runner met status transitions (`pending -> running -> done | failed`)
- OpenAI integratie (`gpt-4o-mini` default)
- React + Tailwind UI
- PDF generatie via Puppeteer
- Unit tests + E2E test

## 1. Installatie

```bash
cd apps/board-intelligence-next
npm install
cp .env.example .env.local
```

Vul in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## 2. Supabase migration draaien

Voer de SQL uit in de Supabase SQL editor:

- `supabase/migrations/20260216_board_intelligence_pipeline.sql`

## 3. Start app en worker

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run worker
```

Als je zonder worker wilt testen, laat in de UI `Inline verwerking (dev)` aan staan.

## 4. API endpoints

- `POST /api/analyses`
- `GET /api/analyses/[id]`
- `GET /api/reports/[analysisId]`
- `GET /api/reports/pdf?analysisId=...`
- `PUT /api/reports/html?analysisId=...`
- `POST /api/uploads` (multipart form-data: `organization`/`organizationId` + `file`)

## 5. Tests

```bash
npm run test:unit
npm run test:e2e
```

## 6. Worker gedrag

Worker claimt analyses via SQL functie `claim_pending_analysis()` zodat parallelle workers geen dubbele jobs draaien.

Statusflow:

1. `pending`
2. `running`
3. `done` of `failed`

Bij `done` wordt rapport ge-upsert in `reports`.
