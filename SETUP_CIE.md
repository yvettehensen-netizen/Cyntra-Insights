# CIE (Consultant Intelligence Engine) Setup

## Edge Functions Geïmplementeerd

De volgende Supabase Edge Functions zijn klaar voor deployment:

1. **document-upload** - Upload en samenvatten van documenten
2. **cie-swot** - SWOT analyse genereren
3. **cie-quickwins** - Quick wins identificeren
4. **cie-benchmark** - Benchmark analyse

## Deployment Instructies

### 1. OpenAI API Key Configureren

De Edge Functions hebben een OpenAI API key nodig. Deze staat al in je `.env` als:
```
VITE_OPENAI_KEY=sk-proj-JcoUQ4k...
```

**BELANGRIJK**: Deze key moet als secret worden toegevoegd aan Supabase:

```bash
# Via Supabase CLI (als je die hebt):
supabase secrets set OPENAI_API_KEY=sk-proj-JcoUQ4k...

# OF via Supabase Dashboard:
# 1. Ga naar je project: https://opnuofonpquvifjdyzql.supabase.co
# 2. Settings > Edge Functions > Secrets
# 3. Voeg toe: OPENAI_API_KEY met de waarde uit .env
```

### 2. Edge Functions Deployen

De functions zijn klaar in `/supabase/functions/`:

```bash
# Deploy alle functions:
supabase functions deploy document-upload
supabase functions deploy cie-swot
supabase functions deploy cie-quickwins
supabase functions deploy cie-benchmark
```

### 3. Frontend Routes

De app heeft nu de volgende routes:
- `/` - Homepage met overzicht van alle analyses
- `/analyses/swot` - SWOT Analysis page (volledig werkend)

## Architectuur

```
Frontend (Vite + React)
  └── src/cie/client.ts         # API client voor Edge Functions
  └── src/cie/types.ts           # TypeScript types
  └── src/pages/HomePage.tsx     # Overzicht analyses
  └── src/pages/analyses/SWOTAnalysisPage.tsx

Backend (Supabase Edge Functions)
  └── document-upload/index.ts   # Document processing + OpenAI summarization
  └── cie-swot/index.ts          # SWOT analysis met OpenAI
  └── cie-quickwins/index.ts     # Quick wins identificatie
  └── cie-benchmark/index.ts     # Benchmark analyse
```

## Volgende Stappen

1. **Deploy Edge Functions** naar Supabase (zie boven)
2. **Test SWOT flow** op `/analyses/swot`
3. **Implementeer overige analyses** (quickwins, benchmark, etc.)
4. **Voeg historie toe** - Sla analyses op in Supabase database
5. **PDF Export** - Voeg export functionaliteit toe

## Testing

Na deployment test je met:
1. Upload een txt/pdf document op `/analyses/swot`
2. Voeg bedrijfscontext toe
3. Genereer SWOT
4. Resultaat verschijnt in UI + wordt opgeslagen in localStorage

## Security

- ✅ OpenAI key is server-side (in Edge Functions)
- ✅ CORS headers zijn correct geconfigureerd
- ✅ JWT verificatie is enabled voor alle functions
- ✅ Rate limiting via Supabase ingebouwd
