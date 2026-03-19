## Go / No-Go Checklist — Boardroom v1 Production

### Go alleen als alles hieronder groen is

#### Build
- [ ] `npm run build` slaagt zonder fouten

#### Kernregressies
- [ ] `node scripts/test/run_boardroom_release_gate.mjs` slaagt
- [ ] `REPORT_E2E_BASE_URL='http://127.0.0.1:4174' node scripts/test/run_boardroom_release_gate.mjs` slaagt

#### Boardroom UI
- [ ] boardroomrapport opent zonder lege secties
- [ ] besluitsectie is zichtbaar en leesbaar
- [ ] memo-structuur is aanwezig en scanbaar
- [ ] geen AI-achtige truncaties zichtbaar

#### PDF
- [ ] PDF preview opent
- [ ] PDF download werkt
- [ ] PDF-bestand is niet leeg of corrupt
- [ ] PDF-structuur komt overeen met UI

#### Marketing flow
- [ ] homepage CTA naar scan werkt
- [ ] scanformulier submit leidt naar login
- [ ] loginpagina toont correct
- [ ] loginlinks op marketingpagina’s werken

#### Scope discipline
- [ ] alleen de bedoelde boardroom/marketing/test-slice zit in release
- [ ] geen ongecontroleerde engine- of platformwijzigingen meegesleept
- [ ] geen cache-, fixture- of rapportartefacten in release

#### Rollback readiness
- [ ] rollback-commitstrategie is bekend
- [ ] verantwoordelijke eigenaar is aangewezen
- [ ] post-deploy checkmoment is gepland

### No-Go als één van deze waar is
- [ ] build faalt
- [ ] release-gate faalt
- [ ] runtime CTA-browsercheck faalt
- [ ] PDF preview/download is instabiel
- [ ] marketing scan eindigt niet op login
- [ ] onbedoelde engine/platformwijzigingen zitten in de release
