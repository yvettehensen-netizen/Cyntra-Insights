# CACHE CLEAREN - BELANGRIJK!

## Probleem Opgelost: Veldnamen Updated

De onderstr team_dynamics, change_power en ninety_day_plan worden nu correct getoond.

### WAT WAS HET PROBLEEM?

De backend gebruikte nieuwe veldnamen maar de frontend las nog van localStorage met oude veldnamen:
- ❌ `undercurrent` → ✅ `understream`
- ❌ `teamdynamics` → ✅ `team_dynamics`
- ❌ `change` → ✅ `change_power`
- ❌ `masterplan_90_days` → ✅ `ninety_day_plan`

### HOE CACHE CLEAREN?

#### **Optie 1: Browser Console (Snelste)**
```javascript
localStorage.removeItem('cyntra_last_full_report')
```

#### **Optie 2: Chrome DevTools**
1. Open DevTools (F12)
2. Ga naar "Application" tab
3. Klik op "Local Storage" → selecteer je domain
4. Verwijder `cyntra_last_full_report`
5. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

#### **Optie 3: Complete Reset**
```javascript
localStorage.clear()
```

### NA HET CLEAREN:

1. **Hard refresh** (Cmd+Shift+R)
2. **Start nieuwe analyse** via `/intake`
3. **Complete wizard** doorlopen
4. **Bekijk resultaat** op `/full-report`

Je zult nu ALLE modules zien:
- ✅ Executive Summary
- ✅ Top 3 Prioriteiten
- ✅ SWOT met Key Takeaway
- ✅ Benchmark Metrics
- ✅ Financial Health
- ✅ Cashflow & WC
- ✅ Quick Wins
- ✅ **Onderstroom Analyse** (themes, patterns, interventions)
- ✅ **Teamdynamiek** (summary + recommendations)
- ✅ **Veranderkracht** (summary + roadmap)
- ✅ **90-Dagen Masterplan** (3 fases + metrics + risks + ownership)
- ✅ CEO Message

---

**KLAAR!** Na cache clear zie je alle modules correct! 🎉
