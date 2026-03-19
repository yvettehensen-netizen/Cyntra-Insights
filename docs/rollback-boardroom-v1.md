## Rollback Plan — Boardroom v1 Production

### Doel
Deze rollback is bedoeld voor problemen in:
- boardroom rendering
- PDF-uitvoer
- marketing CTA → login flow
- release-gate regressies

### Trigger voor rollback
Rollback direct als één van deze situaties optreedt:
- boardroomrapporten renderen leeg of onleesbaar
- PDF preview of download faalt in productie
- marketing CTA’s leiden niet naar scan of login
- quickscan submit eindigt niet op login
- regressies in boardroom release-gate na deploy

### Scope van rollback
Terugdraaien van alleen:
- boardroom presentation layer
- memo formatter / rewrite integratie
- PDF presentatiepad
- marketing CTA/login handoff
- release-gate scripts

Niet terugdraaien:
- engine logic
- data pipeline
- niet-gerelateerde portalwijzigingen

### Technische rollback-aanpak
1. Revert de release-commit:
```bash
git revert <commit-sha>
```

2. Draai direct de validatie:
```bash
npm run build
node scripts/test/run_boardroom_release_gate.mjs
```

3. Controleer handmatig:
- rapportpagina laadt
- PDF preview opent
- PDF download werkt
- `/scan` submit eindigt niet in een dode flow
- `/aurelius/login` blijft bereikbaar

### Fallback gedrag na rollback
Na rollback valt het systeem terug op de vorige render/presentatielaag die vóór deze release actief was.

### Communicatie
Intern melden:
- wat is teruggedraaid
- waarom rollback nodig was
- of het probleem in UI, PDF of marketingflow zat
- of een hotfix volgt of de release opnieuw wordt ingepland

### Herdeploy-voorwaarde
Pas opnieuw uitrollen als:
- build groen is
- release-gate groen is
- runtime CTA browsercheck groen is
- PDF preview/download opnieuw bevestigd is
