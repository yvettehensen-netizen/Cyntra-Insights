const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jszip.min-DrRqynH4.js","assets/react-Bn9dduAv.js","assets/react-pdf-pdfkit-CEaR6fY3.js","assets/react-pdf-fontkit-YaFPSb7g.js","assets/supabase-D7A2gHrI.js","assets/react-pdf-png-DA5Nl_fI.js","assets/generateAureliusPDF-eW9HMrX3.js","assets/pdf-jspdf-D13NyoKP.js","assets/ui-Diqst8Nr.js"])))=>i.map(i=>d[i]);
import{u as Ls,j as E,R as Hn,a as Bs,r as O}from"./react-Bn9dduAv.js";import{B as Gs,L as wr,C as Ms,S as jr,U as ki,a as Ps,W as Us,b as xr,c as yr,T as Hs,d as Ks,A as Kn,e as Vs,F as Fs,P as $r}from"./ui-Diqst8Nr.js";const Ws="modulepreload",Js=function(e){return"/"+e},_r={},Ji=function(t,n,i){let r=Promise.resolve();if(n&&n.length>0){let c=function(l){return Promise.all(l.map(u=>Promise.resolve(u).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),s=o?.nonce||o?.getAttribute("nonce");r=c(n.map(l=>{if(l=Js(l),l in _r)return;_r[l]=!0;const u=l.endsWith(".css"),g=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${g}`))return;const m=document.createElement("link");if(m.rel=u?"stylesheet":Ws,u||(m.as="script"),m.crossOrigin="",m.href=l,s&&m.setAttribute("nonce",s),document.head.appendChild(m),u)return new Promise((p,I)=>{m.addEventListener("load",p),m.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return r.then(o=>{for(const s of o||[])s.status==="rejected"&&a(s.reason);return t().catch(a)})};function Zs({to:e="/portal/dashboard",label:t="Terug naar Dashboard",className:n=""}){const i=Ls();return E.jsxs("button",{type:"button",onClick:()=>i(e),className:`fixed right-4 top-24 z-[9500] inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/55 bg-[#17130c]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#f3d983] shadow-lg transition hover:bg-[#D4AF37] hover:text-black ${n}`,"aria-label":t,children:[E.jsx("span",{"aria-hidden":!0,children:"←"}),t]})}const Ao="cyntra.board_index.snapshots.v1";function Ys(e,t){if(!e)return t;try{return JSON.parse(e)}catch{return t}}function sr(){return typeof localStorage>"u"?[]:Ys(localStorage.getItem(Ao),[])}function qs(e){typeof localStorage>"u"||localStorage.setItem(Ao,JSON.stringify(e))}async function Qs(e){try{return(await fetch("/api/board-index",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).ok}catch{return!1}}async function Xs(e){try{const t=await fetch(`/api/board-index/${encodeURIComponent(e)}`,{method:"GET",headers:{Accept:"application/json"}});return t.ok?await t.json():null}catch{return null}}async function ec(e){const t=sr();t.unshift(e),qs(t.slice(0,500)),await Qs(e)}async function tc(e){const t=await Xs(e);return t||(sr().find(i=>i.analysisId===e)??null)}async function SE(e){const t=Date.now(),n=Math.max(1,Number(e?.days)),i=t-n*24*60*60*1e3;return sr().filter(r=>{if(e?.analysisId&&r.analysisId!==e.analysisId||e?.organisationId&&r.organisationId!==e.organisationId)return!1;const a=new Date(r.createdAt).getTime();return Number.isFinite(a)?a>=i:!1})}const zr={strategy:{title:"Strategische Analyse",subtitle:"Waar moet deze organisatie écht voor kiezen?",analysisType:"strategy",accent:"#7A1E2B",icon:Hs,minWords:9e3,depthDefault:"boardroom",strategicWeight:5,intakeQuestions:["Wat is de belangrijkste strategische keuze die nu moet vallen?","Waar zit de grootste spanning tussen ambitie en realiteit?","Welke richting wordt intern vermeden of uitgesteld?","Wat zou over 12 maanden een strategische mislukking betekenen?","Wat is het ene besluit dat alles versnelt?"]},finance:{title:"Financiële Gezondheid",subtitle:"Waar ontstaat waarde — en waar verdampt zij?",analysisType:"finance",accent:"#8B1538",icon:yr,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Wat is de huidige omzet en cash runway (in maanden)?","Waar lekt geld weg zonder duidelijke ROI?","Welke kostenpost is structureel onbeheersbaar geworden?","Wat is de grootste financiële bottleneck vandaag?","Welke beslissing moet deze maand vallen om stabiliteit te behouden?"]},financial_strategy:{title:"Financiële Strategie",subtitle:"Kapitaal, investeringen en rendement",analysisType:"financial_strategy",accent:"#5E0F2E",icon:yr,minWords:9e3,depthDefault:"boardroom",strategicWeight:5,intakeQuestions:["Welke investeringen zijn de komende 12 maanden cruciaal?","Wat moet rendement opleveren — en wat is ballast?","Hoe ziet een gezonde kapitaalstructuur eruit voor deze organisatie?","Welke financiële keuze is onomkeerbaar als je te lang wacht?","Wat moet prioriteit krijgen: winst, groei of stabiliteit?"]},growth:{title:"Groei & Schaalbaarheid",subtitle:"Wat houdt groei tegen — en wat versnelt haar?",analysisType:"growth",accent:"#4F1D2C",icon:xr,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Waar stokt groei vandaag concreet?","Wat is het grootste schaalprobleem in people/process/tech?","Welke klantgroep of marktsegment groeit sneller dan jullie capaciteit?","Wat is de groeifout die jullie steeds herhalen?","Wat moet radicaal anders om door te breken?"]},market:{title:"Markt & Concurrentie",subtitle:"Positionering onder druk of klaar voor versnelling?",analysisType:"market",accent:"#6E2338",icon:xr,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Wie is jullie echte concurrent (niet op papier, maar in gedrag)?","Waar verliezen jullie positionering of pricing power?","Wat is de belangrijkste marktverschuiving nu?","Waar zit het unieke voordeel dat onvoldoende benut wordt?","Wat is het risico als je niets verandert?"]},process:{title:"Proces & Operatie",subtitle:"Efficiëntie is geen toeval — bottlenecks wel.",analysisType:"process",accent:"#3D0E1E",icon:Us,minWords:7e3,depthDefault:"full",strategicWeight:3,intakeQuestions:["Waar loopt execution structureel vast?","Welke bottleneck vertraagt alles?","Waar ontstaat onnodige complexiteit of verspilling?","Wat kost vandaag energie zonder output?","Welke procesbeslissing moet nu genomen worden?"]},leadership:{title:"Leiderschap & Governance",subtitle:"Wie stuurt écht — en wie zou moeten sturen?",analysisType:"leadership",accent:"#8B1538",icon:Ps,minWords:8e3,depthDefault:"boardroom",strategicWeight:5,intakeQuestions:["Wie neemt daadwerkelijk beslissingen vs. formeel leiderschap?","Waar zit governance-frictie of besluiteloosheid?","Welke leiderschapskwestie wordt niet uitgesproken?","Wat is de grootste blokkade in accountability?","Welke CEO-beslissing wordt vermeden?"]},team_culture:{title:"Team & Cultuur",subtitle:"De onderstroom bepaalt alles wat boven water gebeurt.",analysisType:"team_culture",accent:"#7A1E2B",icon:ki,minWords:7e3,depthDefault:"full",strategicWeight:3,intakeQuestions:["Wat wordt intern gevoeld maar niet gezegd?","Waar zit spanning tussen teams of lagen?","Welke cultuur is ontstaan ondanks intenties?","Waar verdwijnt ownership?","Wat moet besproken worden om verder te kunnen?"]},team_dynamics:{title:"Teamdynamiek",subtitle:"Samenwerking, spanning en besluitvorming",analysisType:"team_dynamics",accent:"#6E2338",icon:ki,minWords:7e3,depthDefault:"full",strategicWeight:3,intakeQuestions:["Waar botst samenwerking structureel?","Welke personen of rollen houden spanning vast?","Welke besluiten blijven hangen door teamfrictie?","Wat gebeurt er als druk stijgt?","Wat moet nu uitgesproken worden?"]},change_resilience:{title:"Veranderkracht",subtitle:"Hoe veerkrachtig is de organisatie écht?",analysisType:"change_resilience",accent:"#4F1D2C",icon:jr,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Welke verandering is urgent maar wordt uitgesteld?","Wat breekt als de druk stijgt?","Waar zit verandermoeheid?","Wat is het vermogen tot executie onder onzekerheid?","Welke stap is nodig om momentum terug te krijgen?"]},onderstroom:{title:"Onderstroom",subtitle:"Wat wordt niet gezegd, maar stuurt alles?",analysisType:"onderstroom",accent:"#5E0F2E",icon:ki,minWords:8e3,depthDefault:"full",strategicWeight:4,intakeQuestions:["Wat wordt hier structureel vermeden?","Welke spanning bepaalt gedrag achter de schermen?","Wat is de echte machtstructuur?","Waar zit angst of statusbescherming?","Wat zou gezegd moeten worden om vrij te komen?"]},esg:{title:"ESG & Duurzaamheid",subtitle:"Impact, compliance en toekomstbestendigheid",analysisType:"esg",accent:"#3D0E1E",icon:jr,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Welke ESG-druk komt eraan vanuit markt of regelgeving?","Waar zit reputatierisico of compliance exposure?","Wat is duurzame strategie vs. marketinglaag?","Welke investering maakt jullie toekomstbestendig?","Wat is het ESG-besluit dat nu moet vallen?"]},ai_data:{title:"AI & Data Volwassenheid",subtitle:"Ambitie groter dan fundament?",analysisType:"ai_data",accent:"#7A1E2B",icon:Ms,minWords:8e3,depthDefault:"boardroom",strategicWeight:4,intakeQuestions:["Wat is jullie AI-ambitie in 12 maanden?","Waar ontbreekt datafundament of governance?","Welke processen zijn ripe for automation?","Wat is het grootste AI-risico intern?","Wat moet eerst gebouwd worden voordat AI waarde levert?"]},marketing:{title:"Marketing",subtitle:"Zichtbaarheid, propositie en conversie",analysisType:"marketing",accent:"#8B1538",icon:wr,minWords:7e3,depthDefault:"full",strategicWeight:3,intakeQuestions:["Wat is jullie huidige positionering in één zin?","Waar faalt conversie of propositie helderheid?","Welke kanaalstrategie werkt niet meer?","Waar zit de marketinglekkage?","Wat moet komende maand groeien: leads, merk of sales?"]},sales:{title:"Sales",subtitle:"Pipeline, closing en klantwaarde",analysisType:"sales",accent:"#6E2338",icon:wr,minWords:7e3,depthDefault:"full",strategicWeight:3,intakeQuestions:["Waar stokt closing vandaag?","Wat is de zwakste schakel in pipeline?","Welke klantgroep levert meeste waarde?","Welke salesbeslissing wordt uitgesteld?","Wat moet nu veranderen om voorspelbaar te verkopen?"]},swot:{title:"Integrale SWOT",subtitle:"Geen klassiek schema — strategische waarheid",analysisType:"swot",accent:"#5E0F2E",icon:Gs,minWords:9e3,depthDefault:"boardroom",strategicWeight:5,intakeQuestions:["Wat is jullie grootste kracht die nog niet geëxploiteerd wordt?","Wat is de zwakte die jullie groei beperkt?","Welke externe kans wordt nu gemist?","Welke bedreiging is reëel binnen 12 maanden?","Welke keuze maakt het verschil tussen winst en irrelevantie?"]}},Dr=e=>{let t;const n=new Set,i=(l,u)=>{const g=typeof l=="function"?l(t):l;if(!Object.is(g,t)){const m=t;t=u??(typeof g!="object"||g===null)?g:Object.assign({},t,g),n.forEach(p=>p(t,m))}},r=()=>t,s={setState:i,getState:r,getInitialState:()=>c,subscribe:l=>(n.add(l),()=>n.delete(l))},c=t=e(i,r,s);return s},nc=(e=>e?Dr(e):Dr),ic=e=>e;function rc(e,t=ic){const n=Hn.useSyncExternalStore(e.subscribe,Hn.useCallback(()=>t(e.getState()),[e,t]),Hn.useCallback(()=>t(e.getInitialState()),[e,t]));return Hn.useDebugValue(n),n}const Lr=e=>{const t=nc(e),n=i=>rc(t,i);return Object.assign(n,t),n},ac=(e=>e?Lr(e):Lr),_e=ac(e=>({runId:null,status:"idle",progress:0,result:null,startRun:t=>e({runId:t,status:"running",progress:0,result:null}),setProgress:t=>e({progress:Math.max(0,Math.min(100,Number(t)||0))}),setResult:t=>e({result:t}),completeRun:t=>e({status:"completed",result:t,progress:100}),failRun:()=>e({status:"error"}),reset:()=>e({runId:null,status:"idle",progress:0,result:null})})),oc=["waar_staan_we_nu_echt","wat_hier_fundamenteel_schuurt","wat_er_gebeurt_als_er_niets_verandert","de_keuzes_die_nu_voorliggen","wat_dit_vraagt_van_bestuur_en_organisatie","het_besluit_dat_nu_nodig_is"];function vi(e){const t=/###\s*(?:\d+\.?\d*\s*)?(.+?)(?=\n|$)/g,n=[...e.matchAll(t)],i={};return n.forEach((r,a)=>{if(r.index==null)return;const o=r[1]?.trim()??"Onbekende sectie",s=r.index+r[0].length,c=n[a+1]?.index??e.length,l=e.slice(s,c).replace(/^\n+/,"").trim(),u=o.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");i[u]={title:o,content:l}}),i}function Si(e){if(!/^\s*([-*•]|\d+[.)])/m.test(e))return e;const t=e.split(`
`),n=[];let i=[];for(const r of t){const a=r.match(/^\s*([-*•]|\d+[.)])\s*(.*)/);a?(i.length&&(n.push(i.join(" ").trim()),i=[]),i.push(a[2]?.trim()??"")):r.trim()&&i.push(r.trim())}return i.length&&n.push(i.join(" ").trim()),n.filter(Boolean)}function sc(e){const t=e.toLowerCase();return{has_explicit_decision:t.includes("besluit")||t.includes("moet nu"),has_tradeoffs:t.includes("keuze")||t.includes("keuzeconflict")||t.includes("stop"),has_consequences:t.includes("gevolg")||t.includes("consequentie")||t.includes("als er niets verandert")}}function Br(e,t){const n=e.trim().replace(/\r\n/g,`
`),i=vi(n),r={};for(const[m,p]of Object.entries(i))r[m]={title:p.title,content:Si(p.content)};const a="interventieplan",o=r[a];let s;if(o&&typeof o.content=="string"){const m=vi(o.content);s={};for(const p of Object.values(m)){const I=Si(p.content);Array.isArray(I)&&(s[p.title.toLowerCase().replace(/\s+/g,"_")]=I)}r[a]={title:"Interventieplan",content:s}}const c="90_dagen_actieplan",l=r[c];if(l&&typeof l.content=="string"){const m=vi(l.content),p={};for(const I of Object.values(m)){const T=Si(I.content);Array.isArray(T)&&(p[I.title.toLowerCase().replace(/\s+/g,"_")]=T)}r[c]={title:"Legacy Roadmap (Fallback)",content:p}}const u=typeof r.het_besluit_dat_nu_nodig_is?.content=="string"?r.het_besluit_dat_nu_nodig_is.content:"",g=u?sc(u):{has_explicit_decision:!1,has_tradeoffs:!1,has_consequences:!1};return{analysis_type:t,title:r.waar_staan_we_nu_echt?.title??"Analyse",executive_summary:typeof r.waar_staan_we_nu_echt?.content=="string"?r.waar_staan_we_nu_echt.content.slice(0,600):"",sections:r,interventions:s,raw_markdown:n,canonical_sections_present:oc.every(m=>m in r),decision_readiness:g}}const cc=18e4,kn=1250,lc=2,dc=3e4,uc=4e3,Gr=6e3,Mr=15e3,Pr=5,gc=.25,mc=.95,pc=.25;function bc(e,t,n){return new Promise((i,r)=>{const a=setTimeout(()=>r(new Error("AI call timeout")),t);n&&n.addEventListener("abort",()=>{clearTimeout(a),r(new Error("AI call aborted"))}),e.then(o=>{clearTimeout(a),i(o)}).catch(o=>{clearTimeout(a),r(o)})})}function Ur(e){return e.trim().split(/\s+/).filter(Boolean).length}function hc(e){return Math.ceil(e.split(/\s+/).length*1.35)}const Ec=e=>new Promise(t=>setTimeout(t,e));function fc(e,t){return[{role:"system",content:["AURELIUS LONGFORM CONTRACT (NON-NEGOTIABLE):",`1) Target output length: at least ${t} words.`,"2) NO markdown. No bullets. No asterisks. No lists.","3) Write in structured paragraphs with clear plain-text headings.","4) Keep EXACT section order and naming used in Cyntra board reports.","5) Each section must include diagnosis, logic, implications, decision.","6) Finish the CURRENT SECTION before stopping."].join(`
`)},...e]}function kc(e,t,n){return[...e,{role:"assistant",content:t},{role:"user",content:["CONTINUE OUTPUT.",`- Target length: ${n} words.`,"- Continue EXACTLY where you stopped.","- Finish the CURRENT SECTION completely.","- Do NOT repeat earlier text.","- No markdown, bullets, symbols or lists.","- Maintain identical structure and tone."].join(`
`)}]}async function Zi(e,t,n,i=1){const r=e.map(m=>`${m.role.toUpperCase()}:
${m.content}`).join(`

`),a=hc(r),o=dc-uc-a,s=Math.max(1500,Math.min(t.max_tokens??Gr,o,Gr)),c={company_context:r,max_tokens:s,temperature:t.temperature??gc,top_p:t.top_p??mc,frequency_penalty:t.frequency_penalty??pc,meta:{engine:"Aurelius",version:"4.7",generated_at:new Date().toISOString(),...n}},l=await bc(fetch("https://xlnchtikhxqfnifwbgbu.supabase.co/functions/v1/aurelius-analyze",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbmNodGlraHhxZm5pZndiZ2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTE4MjIsImV4cCI6MjA4MTEyNzgyMn0.MfzwX7lfTO4WC9HHb0CQ_iqYn5P-17zv7LiRn_R8T9I"},body:JSON.stringify(c),signal:t.signal??null}),cc,t.signal??null);if(!l.ok){const m=await l.text();if(l.status===429&&i<=Pr)return console.warn(`[AURELIUS] TPM limit geraakt — retry ${i}/${Pr} in ${Mr/1e3}s`),await Ec(Mr),Zi(e,t,n,i+1);throw new Error(`AI HTTP ${l.status}: ${m}`)}const u=await l.json();let g=u?.report;if(typeof g=="object"&&g!==null&&typeof g.narrative=="string"&&(g=g.narrative),typeof g!="string"){const m=u?.report?.narrative??u?.narrative??u?.text??null;typeof m=="string"&&m.trim()&&(g=m)}if(typeof g!="string"||!g.trim())throw console.error("[AURELIUS RAW RESPONSE]",u),new Error("AI returned empty or invalid content");return g}async function Ue(e,t,n={}){const i=fc(t,kn);let r=await Zi(i,n,{phase:"initial"}),a=Ur(r),o=0;for(;a<kn&&o<lc;){o++;const s=kc(i,r,kn),c=await Zi(s,{...n,temperature:typeof n.temperature=="number"?n.temperature:.18},{phase:"continue",loop:o});r=`${r}

${c}`,a=Ur(r)}return a<kn&&console.warn(`[AURELIUS NOTICE] Output below target length (${a} < ${kn}).`),r}function vc(e){return e==="nl"?"Schrijf uitsluitend in het Nederlands. Nooit Engels gebruiken.":"Write exclusively in English. Never use Dutch."}const Sc="Schrijf concrete inhoud. Geen meta. Gebruik realistische bestuurlijke feiten als data ontbreekt.",cr="CYNTRA SIGNATURE LAYER VIOLATIE",Ut="[CYNTRA_FALLBACK_WARNING]",un=2,Oo="ggz-realiteit: mandaatfrictie en harde botsing tussen directie en professionals, ambulantisering versus klinische capaciteit, IGJ-sanctierisico, wachtlijst-MAC-druk, opdrogende transformatiegelden, zorgzwaartebekostiging onder druk en personeelstekort tegen kwaliteit. De bovenstroom meet €-bedragen, % marge-impact en machtsverschuiving naar centrale regie; de onderstroom verdubbelt sabotage via stille vertraging en burn-out-verhalen.",Ic={ggz:Oo,zorg:"zorg: personeelstekort vs kwaliteit, centralisatie vs lokale autonomie en digitalisering vs privacy.",onderwijs:"onderwijs: lerarentekort vs pedagogisch vakmanschap, inclusie vs excellentie en bestuurlijke druk op scholen.",finance:"finance/banken: compliance vs innovatiesnelheid, rentemarge vs klantbelang en DNB/EBA-toezicht.",industrie:"industrie: schaal vs wendbaarheid en energietransitie vs continuiteit van productie en levering.",tech:"tech/scale-up: hypergroei vs governance en founder-macht vs institutionele investeerders.",overheid:"overheid: politieke druk vs executiekracht en budgetkrimp vs dienstverlening.",retail:"retail/logistiek: fysiek vs online, margedruk vs klantbeleving, personeelstekort vs automatisering.",energie:"energie/duurzaamheid: transitie vs betaalbaarheid, netcongestie vs investeringen, geopolitieke afhankelijkheid.",default:"default transformatie-template: schaal vs autonomie, centrale sturing vs lokale macht, kostenreductie vs executiekwaliteit, plus toxische patronen in onderstroom."},Co={ggz:{label:"GGZ/Jeugdzorg",loss30:"toenemende werkdruk rond de 75%-norm en spanning op kwaliteit in de teams",loss90:"aanhoudende margedruk door >5% loonkostenstijging, tariefverlaging in 2026 en contractplafonds",loss365:"structurele strategische schade: minder voorspelbaarheid, hogere personeelsdruk en uitgestelde consolidatie",explicitLoss:"tijdelijk pauzeren van minimaal één niet-kerninitiatief totdat de GGZ-kern financieel stabiel draait",powerShift:"formele besluitmacht verschuift van behandeloverleg naar centrale zorgregie",irreversible:"bij aanhoudend uitstel groeit de kans op uitstroom en verlies van bestuurlijke geloofwaardigheid",kpi:"binnen 90 dagen een volledige kostprijskaart, maandelijkse 1-op-1 ritmes en aantoonbare dashboarddiscipline",human30:"teams lopen vast, cliënten merken dat progressie stokt en de spanning op de werkvloer stijgt",human90:"families raken gefrustreerd, behandelaren lopen tegen burn-out aan en vertrouwen keldert",human365:"senior behandelaren stappen op, cliënten verliezen vertrouwen en netwerkpartners trekken zich terug"},zorg:{label:"Zorg",loss30:"EUR 1,4 miljoen operationele inefficiente kosten en 3,8% capaciteitsverlies",loss90:"EUR 4,6 miljoen marge-erosie en 6,9% hogere personeelsdruk",loss365:"EUR 17,9 miljoen structureel verlies en 10,6% lagere kwaliteitsscore",explicitLoss:"afbouw van 10% autonome lokale initiatieven zonder kwaliteitsbijdrage",powerShift:"besluitrechten verschuiven van locatieleiding naar centrale governance-tafel",irreversible:"blijvend verlies van schaars personeel en contractwaarde bij uitstel > 12 maanden",kpi:"uitstroom personeel -8%, kwaliteitsindicator +6%, kostprijs -5%",human30:"verpleegkundigen draaien dubbele diensten en patiënten ervaren steeds wisselende teams",human90:"zorgteams raken gefragmenteerd, families sturen boze mails en zoeken alternatieven",human365:"vertrouwen in de zorginstelling slinkt, personeel verlaat de organisatie en reputatie lijdt"},onderwijs:{label:"Onderwijs",loss30:"EUR 0,9 miljoen roosterinefficiency en 3,4% lesuitval",loss90:"EUR 2,8 miljoen kwaliteits- en vervangingskosten en 6,2% hogere uitval docenten",loss365:"EUR 11,7 miljoen structurele schade en 9,1% daling leerresultaat op kernvakken",explicitLoss:"beperking van 15% lokale projectruimte buiten kerncurriculum",powerShift:"besluitmacht verschuift van losse schoolautonomie naar centraal onderwijskader",irreversible:"achterstand in basisvaardigheden wordt na 12 maanden niet meer binnen een schooljaar hersteld",kpi:"lesuitval -25%, basisvaardigheid +7%, docentbehoud +5%",human30:"docenten improviseren extra uren, leerlingen missen consistente begeleiding en rust",human90:"ouders verliezen vertrouwen, ondersteunend personeel voelt zich uitgespeeld en onzeker",human365:"leerachterstanden raken permanent en schoolleiders verliezen de motivatie om te blijven"},finance:{label:"Financiele Dienstverlening",loss30:"EUR 2,1 miljoen compliance-herwerk en 2,9% lagere productiviteit",loss90:"EUR 6,8 miljoen rentemarge- en herstelkosten, plus 5,4% extra klantverloop",loss365:"EUR 24,4 miljoen structurele winstdruk en 8,7% lagere cross-sell conversie",explicitLoss:"bevriezing van 12% niet-conforme innovatietrajecten en sluiting van dubbele processen",powerShift:"mandaat verschuift van productteams naar centrale risk/compliance-regie",irreversible:"toezichtsdruk en herstelplannen vergroten kapitaalbeslag structureel na 12 maanden",kpi:"compliance-incidenten -30%, cost-to-serve -6%, klantverloop -4%",human30:"klanten merken inconsistent advies, relationship managers werken nachtshifts",human90:"vertrouwen daalt, advisors lopen over en teams raken gefrustreerd",human365:"kapitaal stroomt weg, senior bankers verlaten en reputatie slinkt"},industrie:{label:"Industrie/Manufacturing",loss30:"EUR 1,8 miljoen outputverlies en 3,6% lagere leverbetrouwbaarheid",loss90:"EUR 5,5 miljoen marge-impact door scrap, spoedinkoop en lijnstilstand",loss365:"EUR 20,1 miljoen structurele schade en 9,8% lagere OTIF-score",explicitLoss:"afbouw van 10% laag-rendabele SKU-complexiteit en tijdelijke capaciteitsstop op randlijnen",powerShift:"operationeel besluitrecht verschuift van plantniveau naar centrale ketensturing",irreversible:"klantverlies door leveronzekerheid wordt na 12 maanden contractueel vastgezet",kpi:"OTIF +8 punten, scrap -12%, voorraadrotatie +10%",human30:"operators werken overuren, toeleveranciers signaleren chaos en onzekerheid",human90:"teams raken overstuur en beschuldigen elkaar van vertraging",human365:"klanten zoeken productie elders, moraal en retentie lijden"},tech:{label:"Tech/Scale-up",loss30:"EUR 1,6 miljoen burn zonder schaalbare output en 4,3% churnversnelling",loss90:"EUR 5,2 miljoen runway-erosie en 7,1% daling releasebetrouwbaarheid",loss365:"EUR 18,9 miljoen waardedruk en 12,4% hogere compliance- en refactorlast",explicitLoss:"stopzetting van 15% feature-initiatieven zonder unit-economics",powerShift:"macht verschuift van founder-intuïtie naar institutionele governance en release-controls",irreversible:"na 12 maanden wordt groeikapitaal duurder en strategische optionaliteit blijvend kleiner",kpi:"gross retention +6 punten, release-failures -35%, burn multiple -0,4",human30:"squads draaien nachtshifts, early adopters verliezen vertrouwen en proeven vertraging",human90:"founders raken in conflict, engineers voeren refactor na refactor uit",human365:"investors verliezen vertrouwen, top talent vertrekt en burn-out-verhalen domineren de chat"},overheid:{label:"Overheid/Publiek",loss30:"EUR 1,0 miljoen uitvoeringsfrictie en 3,1% lagere dienstverleningsoutput",loss90:"EUR 3,3 miljoen herstel- en inhuurkosten en 6,7% langere doorlooptijd",loss365:"EUR 13,5 miljoen structurele inefficiency en 9,4% lagere publieke tevredenheid",explicitLoss:"stopzetting van 10% versnipperde trajecten buiten kernmandaat",powerShift:"besluitmacht verschuift van politieke ad-hocsturing naar programmatische executieregie",irreversible:"vertrouwensverlies en achterstanden worden na 12 maanden niet lineair herstelbaar",kpi:"doorlooptijd -18%, first-time-right +9%, uitvoeringsachterstand -20%",human30:"ambtenaren blokkeren door politiek, burgers horen dat projecten stilliggen",human90:"politici verheffen ego's en uitvoering stagneert terwijl ambtenaren elkaar dwarszitten",human365:"publiek vertrouwen en reputatie smelten, medewerkers vertrekken uit de organisatie"},retail:{label:"Retail/Logistiek",loss30:"EUR 1,3 miljoen brutomargeverlies en 3,9% lagere beschikbaarheid",loss90:"EUR 4,1 miljoen marge-erosie en 6,3% hogere fulfilmentkosten",loss365:"EUR 16,2 miljoen structurele schade en 10,2% lagere klantretentie",explicitLoss:"afbouw van 12% lage-marge assortiment en sluiting van niet-renderende kanalen",powerShift:"kanaalmacht verschuift van lokale winkels naar centrale omnichannel-sturing",irreversible:"marktaandeelverlies wordt na 12 maanden kostbaar en traag teruggewonnen",kpi:"marge +2,5 punten, out-of-stock -30%, fulfilmentkosten -8%",human30:"winkelmedewerkers draaien dubbele diensten, schappen blijven deels leeg en klanten vragen zich af waar het personeel is",human90:"klanten klagen over inconsistentie, store managers verliezen grip en teams verliezen energie",human365:"merkperceptie degradeert en teams zoeken ander werk omdat de stress onhoudbaar is"},energie:{label:"Energie/Duurzaamheid",loss30:"EUR 2,0 miljoen vertraging door netcongestie-herplanning en 2,7% outputverlies",loss90:"EUR 6,4 miljoen project- en inkoopdruk plus 5,8% lagere leverzekerheid",loss365:"EUR 23,7 miljoen structurele waardevernietiging en 11,1% lagere investeringsrendementen",explicitLoss:"stop op 10% subkritische projecten met lage netimpact",powerShift:"mandaat verschuift van projectteams naar centrale portfolio- en netregie",irreversible:"na 12 maanden worden vergunningvensters en netcapaciteit blijvend ongunstiger",kpi:"projectdoorlooptijd -15%, capex-afwijking -10%, leverzekerheid +6%",human30:"technici lopen op volle toeren, gemeenschappen ervaren storingen en onrust",human90:"netbeheerders krijgen kritiek en politieke druk tegen, waardoor teammoed afneemt",human365:"kredietrating daalt, investeerders durven geen nieuwe projecten aan en personeel stapt op"},default:{label:"Strategische Transformatie",loss30:"EUR 1,1 miljoen executieverlies en 3,2% lagere leverbetrouwbaarheid",loss90:"EUR 3,7 miljoen marge-erosie en 6,0% hogere doorlooptijd",loss365:"EUR 14,2 miljoen structurele schade en 9,0% lagere strategische wendbaarheid",explicitLoss:"afbouw van 10% initiatieven zonder directe strategische bijdrage",powerShift:"besluitmacht verschuift van verspreid mandaat naar centraal bestuurlijk eigenaarschap",irreversible:"na 12 maanden wordt herstel significant duurder en strategische keuzevrijheid kleiner",kpi:"doorlooptijd -15%, marge +2 punten, escalaties -25%",human30:"teams voelen dat besluiteloosheid vermoeidheid en cynisme voedt",human90:"informele coalities verscherpen zich en loyaliteiten verschuiven",human365:"mensen verliezen vertrouwen en vertrekken, momentum is weg"}},Tc={ggz:[/\bggz\b/i,/\bjeugdzorg\b/i,/\bgeestelijke gezondheid\b/i],zorg:[/\bzorg\b/i,/\bziekenhuis\b/i,/\bwlz\b/i,/\bzvw\b/i],onderwijs:[/\bonderwijs\b/i,/\bschool\b/i,/\bleraar\b/i,/\bstudent\b/i],finance:[/\bbank\b/i,/\bfinance\b/i,/\bfinanc/i,/\bverzekeraar\b/i,/\bdnb\b/i,/\beba\b/i],industrie:[/\bindustrie\b/i,/\bmanufacturing\b/i,/\bfabriek\b/i,/\bproductie\b/i],tech:[/\btech\b/i,/\bscale[- ]?up\b/i,/\bsaas\b/i,/\bplatform\b/i,/\bfounder\b/i,/\bovername\b/i],overheid:[/\boverheid\b/i,/\bgemeente\b/i,/\bministerie\b/i,/\bpubliek\b/i],retail:[/\bretail\b/i,/\blogistiek\b/i,/\be-?commerce\b/i,/\bwinkel\b/i],energie:[/\benergie\b/i,/\bduurzaam/i,/\bnetcongestie\b/i,/\btransitie\b/i]},Nc=[/\[source_free_field\]/i,/\[source_upload\]/i,/moet expliciet worden/i,/\bformuleer\b/i,/\banalyseer\b/i,/geen expliciete context/i,/ontbreekt/i,/placeholder/i,/trade-?offs\s+moeten/i,/nog niet voldoende/i,/zou kunnen/i,/lijkt erop dat/i,/^\s*aanname:/i,/^\s*contextanker:/i,/^\s*signat(?:ure)? layer waarschuwing/i,/\bbeperkte context\b/i,/^\s*duid structureel\b/i,/\bcontextsignaal\b/i,/werk uit structureel/i,/huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd/i,/inconsistentie tussen besluit en uitvoering verhoogt frictie/i,/leg voor .* expliciet eigenaarschap en besluitmomenten vast/i,/in jouw context wordt dit zichtbaar in/i,/\bbestand gespreksverslag\b/i,/\bbestuurlijke opdracht:\b/i,/^de organisatie bevindt zich op een beslismoment/i,/^u moet kiezen tussen schaalvergroting/i,/^summary:\s*binnen 90 dagen/i,/\bmonths:\s*month:/i],Rc=[/\[source_free_field\]/i,/\[source_upload\]/i,/moet expliciet worden/i,/trade-?offs?\s+moeten/i,/nog niet voldoende/i,/zou kunnen/i,/lijkt erop dat/i,/^\s*aanname:/i,/^\s*contextanker:/i,/^\s*duid structureel\b/i,/\bcontextsignaal\b/i,/werk uit structureel/i,/huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd/i,/inconsistentie tussen besluit en uitvoering verhoogt frictie/i,/in jouw context wordt dit zichtbaar in/i,/\bbestand gespreksverslag\b/i,/^summary:\s*binnen 90 dagen/i,/\bmonths:\s*month:/i],Ac=[/^\s*\[source_free_field\]/i,/^\s*\[source_upload\]/i,/^\s*aanname:\s*/i,/^\s*contextanker:\s*/i,/^\s*signat(?:ure)? layer waarschuwing[:\s-]*/i,/^\s*beperkte context[:\s-]*/i,/^\s*duid structureel[:\s-]*/i,/^\s*contextsignaal[:\s-]*/i],Oc=[/\[SOURCE_FREE_FIELD\]/gi,/\[SOURCE_UPLOAD\]/gi,/SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,/^\s*Aanname:[^\n]*\n?/gim,/^\s*Contextanker:[^\n]*\n?/gim,/\bbeperkte context\b/gi,/\bduid structureel\b/gi,/\bcontextsignaal\b/gi,/werk uit structureel/gi];function Hr(e,t){return mn(String(e??"")).replace(new RegExp(`^${t}(?::)?\\s*`,"i"),"").replace(/\.+$/g,"").trim()}const ge=(e,t)=>`Bovenstroom: ${Hr(e,"Bovenstroom")}. Onderstroom (Interpretatie): ${Hr(t,"Onderstroom")}.`,an=(e,t,n)=>`${e}: Bovenstroom ${t.trim()}. Onderstroom (Hypothese) ${n.trim()}.`,Cc="Onomkeerbaar moment: uitstel knijpt het vertrouwen van teams en klanten langzaam dicht.",Kr={dominantThesis:ge("De raad moet binnen veertien dagen één lijn kiezen en concurrerende initiatieven beëindigen; uitstel vergroot kosten en interne verdeeldheid.","Loyale teams zoeken naar zacht uitstel, burn-out-verhalen en onduidelijke mandaten om besluitkracht te ondermijnen."),coreConflict:ge("Bovenstroom vraagt schaalversnelling met minder controle of stabilisatie met hogere beheersbaarheid en lagere groeisnelheid.","Onderstroom zoekt mandaatverlies als hefboom en bewaart coalities rond oude autonomie, wat escalaties vertraagt."),tradeoffs:ge("Centralisatie versnelt besluittempo maar kost binnen 90 dagen EUR 2,4 miljoen en 4,8% marge; stabilisatie beschermt controle maar vertraagt groeihorizon met EUR 3,1 miljoen aan gemiste bijdrage binnen 12 maanden.","Informele coalities reageren met scope-verdunning, uitstel en het omhoog schuiven van afhankelijkheden zodat centrale macht langzamer groeit."),opportunityCost:[an("30 dagen","EUR 1,1 miljoen executieverlies en 2,9% lagere leverbetrouwbaarheid","teams lopen vast en cliënten voelen dat progressie stokt, waardoor de druk op operatie stijgt"),an("90 dagen","EUR 3,7 miljoen marge-erosie en 6,0% langere doorlooptijd","families en professionals verliezen vertrouwen; onzekerheid wordt de nieuwe norm"),an("365 dagen","EUR 14,2 miljoen structurele schade en 9,0% lagere strategische wendbaarheid","senior leiders stappen op, markten verwerpen het plan en herstel wordt sociaal en financieel duur"),Cc].join(" "),governanceImpact:ge("Formele macht verschuift naar een centraal besluitcomité met 48-uurs escalatie en duidelijke mandaatlijnen.","Onderstroom probeert die lijn te omzeilen via lokaal behoud van budget en vertraagde escalatieroutes."),powerDynamics:ge("Formeel schuift macht richting centrale besluitkracht en de governance-as wordt verscherpt.","Informele invloed bouwt rond roostering, capaciteitsplanning en het uitmelken van oude mandaten."),executionRisk:ge("Faalrisico: parallelle prioritering zonder hiërarchie en dubbel mandaat tussen lijn en programma.","Onderstroom reageert met vertraagde escalatie, burn-out-verhalen en het verschuiven van deadlines."),interventionPlan90D:ge("Week 1-2: CEO en CFO zetten één richting, publiceren eigenaren en KPI's. Week 3-6: COO herverdeelt capaciteit en stuurt op 48-uurs escalaties. Week 7-12: uitvoering wordt afgerekend op doorlooptijd, kwaliteit en financieel effect; blokkades worden binnen zeven dagen afgesloten of als verlies geboekt.","Onderstroom wordt gemonitord via directe lijnrapportages, deep-dive dagsluitingen en het zichtbaar maken van sabotagepatronen."),decisionContract:ge("De Raad van Bestuur committeert zich aan één expliciete strategische keuze, KPI-verbetering binnen 90 dagen, besluit binnen 14 dagen, executiebewijs binnen 30 dagen en structureel effect binnen 365 dagen; verlies wordt expliciet benoemd en geacceptieerd.","Onderstroom accepteert de lijn alleen als CEO, CFO en bestuurssecretaris tekenen, verborgen agenda's worden benoemd en machtsverschuivingen rust krijgen."),narrative:ge("Bovenstroom zoekt structuur, cijfers en hernieuwde besluitkracht; elke doorgeschoven keuze kost margin en tijd.","Onderstroom dreigt met informeel uitstel, sabotagepatronen en vertrouwde mandaten totdat externe druk de knop omdraait.")};function mn(e){return(n=>n.replace(/€\s*([0-9][0-9.,\s]*)/g,(i,r)=>{const a=String(r??"").replace(/\s+/g,"").replace(/[.,]+$/g,"");return a?`€${a}`:"€"}))(e).replace(/\[SOURCE_FREE_FIELD\]/gi," ").replace(/\[SOURCE_UPLOAD\]/gi," ").replace(/\s+/g," ").replace(/\s+\./g,".").replace(/\.{2,}/g,".").trim()}function wo(e){return String(e??"").toLowerCase().replace(/[^a-z0-9\s/-]/g," ").replace(/\s+/g," ").trim()}function jo(e){const t=wo(e||"");if(!t)return"default";if(/\b(ggz|jeugdzorg|geestelijke gezondheid|igj|wachtlijst|mac)\b/i.test(t))return"ggz";let n="default",i=0;for(const[r,a]of Object.entries(Tc)){const o=a.reduce((s,c)=>c.test(t)?s+1:s,0);o>i&&(n=r,i=o)}return n}function Yi(e){const t=wo(e||"");return!!(!t||t.split(/\s+/).filter(Boolean).length<=4||t.length<36||/\b(nvt|n\/a|null|onduidelijk|vaag|algemeen|test|dummy|lege context)\b/i.test(t))}function xo(e){const t=String(e??"").trim();return t?t.split(/\n+/).flatMap(n=>n.split(new RegExp("(?<=[.!?])\\s+"))).map(n=>mn(n)).filter(n=>n.length>=24&&n.length<=260):[]}function wc(e){const t=String(e??"");if(!t.trim())return[];const n=[{re:/loonkosten[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(?:per jaar)?/i,normalize:r=>`Loonkosten stijgen met ${r[1]}% per jaar.`},{re:/tarieven[^.\n]{0,80}?2026[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(?:verlaagd|gedaald)/i,normalize:r=>`Tarieven 2026 zijn ${r[1]}% verlaagd.`},{re:/adhd[-\s]?diagnostiek[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per cliënt/i,normalize:r=>`ADHD-diagnostiek kost circa €${r[1]} per cliënt.`},{re:/(?:maximum|plafond)[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per jaar/i,normalize:r=>`Declaratieplafond ligt rond €${r[1]} per jaar per verzekeraar.`},{re:/(?:bijbetalen|eigen bijdrage)[^.\n]{0,80}?(\d+[,.]?\d*)\s*-\s*(\d+[,.]?\d*)\s*%/i,normalize:r=>`Cliënten betalen vaak ${r[1]}-${r[2]}% bij.`},{re:/(?:minimaal\s*)?(\d+[,.]?\d*)\s*uur[^.\n]{0,80}?cliëntcontact[^.\n]{0,80}?per dag/i,normalize:r=>`Productienorm is ${r[1]} uur cliëntcontact per dag.`},{re:/(\d+[,.]?\d*)\s*%\s*productief/i,normalize:r=>`Doelnorm is ${r[1]}% productiviteit.`},{re:/gemiddeld[^.\n]{0,80}?(\d+[,.]?\d*)\s*gesprekken[^.\n]{0,80}?per cliënt/i,normalize:r=>`Gemiddeld traject omvat ${r[1]} gesprekken per cliënt.`},{re:/kostprijs[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per cliënt/i,normalize:r=>`Gemiddelde kostprijs ligt rond €${r[1]} per cliënt.`},{re:/(\d+[,.]?\d*)\s*-\s*(\d+[,.]?\d*)\s*%\s*(?:zelf|bij)betalen/i,normalize:r=>`Cliënten betalen geregeld ${r[1]}-${r[2]}% zelf.`},{re:/vier teamvergaderingen per jaar/i,normalize:()=>"Er zijn slechts vier teamvergaderingen per jaar."},{re:/dashboard[^.\n]{0,80}sinds 1 januari/i,normalize:()=>"Dashboard met productiepercentages loopt sinds 1 januari."},{re:/individuele maandelijkse gesprekken ontbreken/i,normalize:()=>"Maandelijkse 1-op-1 sturing ontbreekt grotendeels."},{re:/praten over productie[^.\n]{0,80}onaangenaam/i,normalize:()=>"Praten over productie wordt door teams als onaangenaam ervaren."},{re:/hr-loket[^.\n]{0,100}start[^.\n]{0,40}2 februari/i,normalize:()=>"HR-loket is gestart op 2 februari."},{re:/binnen 48 uur advies/i,normalize:()=>"HR-loket belooft advies binnen 48 uur."},{re:/45 aanmeldingen[^.\n]{0,80}kick-?off/i,normalize:()=>"Kick-off had al 45 aanmeldingen via netwerk."},{re:/vier extra kamers[^.\n]{0,80}dezelfde huur/i,normalize:()=>"Verhuizing levert vier extra kamers op voor dezelfde huur."},{re:/openheid over volledige cijfers[^.\n]{0,80}vermeden/i,normalize:()=>"Volledige financiële openheid intern wordt nog vermeden."},{re:/ontbreken van contracten met zorgverzekeraars/i,normalize:()=>"Ontbrekende contractzekerheid met zorgverzekeraars beperkt groei."},{re:/geen doorverwijzingen van zorgverzekeraars/i,normalize:()=>"Er zijn geen doorverwijzingen vanuit zorgverzekeraars."},{re:/zzp[’']?ers ingezet om flexibiliteit te behouden/i,normalize:()=>"ZZP-inzet wordt gebruikt om flexibiliteit te behouden bij financiële onzekerheid."}],i=[];for(const{re:r,normalize:a}of n){const o=t.match(r);o&&i.push(a(o))}return Array.from(new Set(i)).slice(0,12)}function jc(e){const t=wc(e),n=xo(e);if(!n.length)return t;const i=[/\b\d+[,.]?\d*\s*%/i,/(?:eur|euro|€)\s?\d[\d.,]*/i,/\b\d+\s*(?:uur|dagen|maanden|jaar)\b/i,/\b(igj|nza|verzekeraar|zorgverzekeraar|contract|plafond|wachttijd)\b/i,/\b(productiviteit|marge|tarief|loonkosten|kostprijs|uitval|no-show)\b/i,/\b(adhd|diagnostiek|behandel|cliënten|zzp)\b/i],r=n.map(o=>{const s=i.reduce((c,l)=>l.test(o)?c+1:c,0);return{segment:o,score:s}}).filter(o=>o.score>=2).sort((o,s)=>s.score-o.score),a=[...t];for(const o of r){if(a.length>=6)break;const s=o.segment.toLowerCase().replace(/[^a-z0-9]/g,"");a.some(l=>l.toLowerCase().replace(/[^a-z0-9]/g,"")===s)||a.push(o.segment.replace(/\.+$/g,""))}return a}function xc(e){const t=String(e??"").replace(/\[SOURCE_FREE_FIELD\]/gi,"").replace(/\[SOURCE_UPLOAD\]/gi,"").trim();if(!t)return[];const i=xo(t).filter(r=>/\(\d{1,2}:\d{2}(?::\d{2})?\)|€|\b\d+[,.]?\d*\s*%|\b(plafond|verzekeraar|productief|cliëntcontact|diagnostiek)\b/i.test(r)).map(r=>r.replace(/\s+/g," ").trim()).filter(r=>r.length>=40&&r.length<=220).filter(r=>!/\b(dat|die|wat|waarbij|zodat|waardoor|omdat)\s*$/i.test(r)).map(r=>/[.!?]$/.test(r)?r:`${r}.`);return Array.from(new Set(i)).slice(0,4)}function yc(e,t){const n=jo(t),i=Ic[n],r=Co[n],a=jc(t),o=xc(t),s=String(t??""),c=/\[SOURCE_FREE_FIELD\]/i.test(s),l=/\[SOURCE_UPLOAD\]/i.test(s),u={dominantThesis:0,coreConflict:1,tradeoffs:2,opportunityCost:3,governanceImpact:0,powerDynamics:1,executionRisk:2,interventionPlan90D:3,decisionContract:0,narrative:0},g=(h,d=2)=>{const x=c&&l?"Bronbasis: vrije invoer + uploads.":c?"Bronbasis: vrije invoer.":l?"Bronbasis: uploads.":"Bronbasis: context.",N=u[e]??0,j={dominantThesis:"Volgordefout: zonder expliciete prioritering tussen consolideren en verbreden ontstaat bestuurlijke ruis en besluituitstel.",coreConflict:"Volwassenheidskloof: financieel leiderschap vraagt transparantie en ritme, terwijl de organisatie nog vooral op relationele sturing draait.",tradeoffs:"Kapitaalallocatie onder onzekerheid: tijdelijke groeirem is nodig om eerst kostprijszekerheid en contractdiscipline te herstellen.",opportunityCost:"Systeemverschuiving: uitstel verandert een bestuurbaar financieel vraagstuk in een cultuur- en uitvoeringsprobleem.",governanceImpact:"Governance-paradox: formele centralisatie van intake/planning werkt pas als financiële sturing en transparantie tegelijk worden verdiept.",powerDynamics:"Machtsmechanisme: weerstand uit zich vooral als vermijding van productiedialoog, vertraagde opvolging en behoud van lokale routine.",executionRisk:"Ritmerisico: zonder maandelijkse 1-op-1 sturing en harde stoplijst blijft uitvoering structureel achter op besluitvorming.",interventionPlan90D:"Interventielogica: eerst inzicht (marge/kostprijs), dan stop-keuzes, daarna capaciteit en governance borgen.",decisionContract:"Contractprincipe: zonder expliciet verlies, tijdpad en mandaatverschuiving blijft het besluit bestuurlijk niet afdwingbaar.",narrative:"Afgeleide bestuurslijn: prioriteren op kernrendement en uitvoerbaarheid gaat voor parallelle expansie."},$={dominantThesis:"Kosten- en tariefdruk plus contractplafonds dwingen tot volgorde: eerst kernstabilisatie, dan gecontroleerde verbreding.",coreConflict:"Consolidatie vraagt focus op margesturing; verbreding vraagt juist managementaandacht en capaciteit die nu al schaars is.",tradeoffs:"Elke keuze heeft direct effect op cashdiscipline, teambelasting en onderhandelingspositie richting verzekeraars.",opportunityCost:"Uitstel verschuift het probleem van cijfers naar gedrag: vermijding, vertraging en afnemende bestuurlijke voorspelbaarheid.",governanceImpact:"Zonder centraal besluitrecht blijven portfolio-, capaciteits- en contractbesluiten verspreid en moeilijk afdwingbaar.",powerDynamics:"Informele macht concentreert zich rond planning en productienormen; daar ontstaat de feitelijke rem op uitvoering.",executionRisk:"Afwezig ritme in individuele sturing maakt dat blokkades laat zichtbaar worden en te laat worden gecorrigeerd.",interventionPlan90D:"Een vast 90-dagenritme met eigenaar, KPI en escalatie maakt van intentie een bestuurlijk contract.",decisionContract:"Alleen een besluit met expliciet verlies en handtekeningdiscipline voorkomt terugval naar parallelle agenda's.",narrative:"Kernrendement en uitvoeringsdiscipline zijn voorwaarden voor duurzame groei."},q=[$[e]??$.narrative,j[e]??j.narrative],le=u[e]??0,U=a.slice(le).concat(a.slice(0,le)).map(R=>R.replace(/\.+$/g,"")),y=o[N%Math.max(1,o.length)],X=o.length>1?o[(N+1)%o.length]:"",_=R=>/\b(loonkosten|tarief|kostprijs|€|plafond|contract|gesprekken|bijbetalen|eigen bijdrage)\b/i.test(R)?"financial":/\b(productiviteit|1-op-1|teamvergaderingen|werkdruk|cliëntcontact|dashboard|transparantie|openheid|vermijden)\b/i.test(R)?"understroom":/\b(raad|bestuur|mandaat|escalatie|zorgverzekeraar|contractzekerheid|governance|prioritering)\b/i.test(R)?"governance":"other",de=(R,pe)=>{const V={financial:[],onderstroom:[],governance:[],other:[]};for(const be of R){const Ve=_(be);Ve==="financial"?V.financial.push(be):Ve==="understroom"?V.onderstroom.push(be):Ve==="governance"?V.governance.push(be):V.other.push(be)}const ce=[],Se=be=>{be&&(ce.includes(be)||ce.push(be))};Se(V.financial[0]),Se(V.onderstroom[0]),Se(V.governance[0]);const Ge=[...V.financial,...V.onderstroom,...V.governance,...V.other];for(const be of Ge){if(ce.length>=pe)break;Se(be)}return ce.slice(0,pe)},H={dominantThesis:[/\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,/\bloonkosten\b/i,/\b75%|6 uur cliëntcontact|productiviteit\b/i,/\badhd\b|\b€90\b/i],coreConflict:[/\bpraten over productie\b|\bonaangenaam\b/i,/\b1-op-1\b|maandelijkse gesprekken ontbreken/i,/\bopenheid\b|\btransparantie\b/i,/\bdashboard\b|\b1 januari\b/i],tradeoffs:[/\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,/\bplafond|€160\.?000|zorgverzekeraar\b/i,/\bkostprijs|gesprekken per cliënt\b/i,/\b30-40%|bijbetalen|eigen bijdrage\b/i],opportunityCost:[/\b75%|6 uur cliëntcontact|productiviteit\b/i,/\bhr-loket\b|\b48 uur\b/i,/\bcontractzekerheid|plafond|zorgverzekeraar\b/i,/\bgeen doorverwijzingen\b|vinden de praktijk zelf\b/i,/\b30-40%|bijbetalen|eigen bijdrage\b/i],governanceImpact:[/\bcontractzekerheid|zorgverzekeraar|plafond\b/i,/\bopenheid\b|\btransparantie\b/i,/\bdashboard\b|\b1 januari\b/i,/\b1-op-1\b|maandelijkse gesprekken ontbreken/i,/\bvier teamvergaderingen per jaar\b/i],powerDynamics:[/\bpraten over productie\b|\bonaangenaam\b/i,/\b75%|6 uur cliëntcontact|productiviteit\b/i,/\b1-op-1\b|maandelijkse gesprekken ontbreken/i,/\bvier teamvergaderingen per jaar\b/i],executionRisk:[/\b1-op-1\b|maandelijkse gesprekken ontbreken/i,/\bdashboard\b|\b1 januari\b/i,/\bopenheid\b|\btransparantie\b/i,/\b75%|6 uur cliëntcontact|productiviteit\b/i],interventionPlan90D:[/\bkostprijs|gesprekken per cliënt\b/i,/\bcontractzekerheid|zorgverzekeraar|plafond\b/i,/\b75%|6 uur cliëntcontact|productiviteit\b/i,/\bhr-loket\b|\b2 februari\b|\b48 uur\b/i,/\bzzp\b|\bflexibiliteit\b/i],decisionContract:[/\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,/\bloonkosten\b/i,/\bcontractzekerheid|zorgverzekeraar|plafond\b/i,/\b1-op-1\b|maandelijkse gesprekken ontbreken/i],narrative:[]},ie=[y,X].filter(Boolean).map(R=>`Broncitaat: "${R}"`),z=3,ve=de(U.length?U:ie,z),te=(H[e]??H.narrative).map(R=>U.find(pe=>R.test(pe))).filter(Boolean),K=[],B=R=>{R&&(K.includes(R)||K.push(R))},Ee=["financial","understroom","governance"],ne=R=>te.find(pe=>{const V=_(pe);return R==="financial"&&V==="financial"||R==="understroom"&&V==="understroom"||R==="governance"&&V==="governance"})??U.find(pe=>{const V=_(pe);return R==="financial"&&V==="financial"||R==="understroom"&&V==="understroom"||R==="governance"&&V==="governance"});for(const R of Ee)if(B(ne(R)),K.length>=z)break;for(const R of te)if(B(R),K.length>=z)break;for(const R of ve)if(B(R),K.length>=z)break;const se=y?`Citaat: "${y}"`:"";se&&(K.length>=z?K[K.length-1]=se:K.push(se));const je=K.length?`Bronankers: ${K.map(R=>R.replace(/^Citaat:\s*/i,"")).join(" | ")}.`:"",fe=`Bestuurlijke implicatie: ${q.join(" ")}`;return[h,x,je,fe].filter(Boolean).join(`
`)},m=()=>{const h=a.length?a:["Loonkosten stijgen >5% terwijl tarieven niet mee-indexeren.","Productienorm 75% / 6 uur cliëntcontact staat onder druk.","Plafondcontracten met verzekeraars beperken volume en voorspelbaarheid."],d=j=>h[j%h.length],x=[{month:1,week:"1-2",owner:"CEO + CFO",action:"Maak de margekaart compleet voor 100% van het aanbod (GGZ-kern + verbreding) en leg dezelfde week stop/door-keuzes formeel vast.",kpi:"100% aanbod heeft gevalideerde kostprijs en expliciet beslislabel.",escalation:"Escalatie naar RvT bij ontbrekende stop-keuze >48 uur."},{month:1,week:"2-4",owner:"Commercieel verantwoordelijke + CFO",action:"Stel contractondergrens en plafondstrategie per verzekeraar vast; geen contract zonder tariefvloer.",kpi:"Per verzekeraar: minimumtarief, plafondruimte en verliesgrens vastgesteld.",escalation:"Escalatie naar bestuur bij contract zonder ondergrens."},{month:2,week:"5-6",owner:"CEO/COO",action:"Draai één centrale besluittafel met 48-uurs escalatieplicht; lokale bypasses zijn ongeldig.",kpi:"100% blokkades heeft eigenaar + besluitdatum; >=90% afgesloten binnen 48 uur.",escalation:"Automatische escalatie naar CEO bij open blokkade >48 uur."},{month:2,week:"6-8",owner:"HR-verantwoordelijke",action:"Verplicht maandelijkse individuele productiedialoog per behandelaar met actiepunt op capaciteit, kwaliteit en uitvalrisico.",kpi:"100% behandelaren heeft maandgesprek + opvolgactie; uitvalsignalen binnen 7 dagen opgepakt.",escalation:"Escalatie naar directie bij teamuitvalsignalering zonder actie."},{month:3,week:"9-10",owner:"HR/Operations",action:"Herdefinieer de 75%-norm met kwaliteitsbuffer (casemix/no-show) en borg dit in roosters en teamafspraken.",kpi:">=90% teams werkt met norm + kwaliteitsbuffer; overbelasting >2 weken daalt aantoonbaar.",escalation:"Escalatie naar COO bij structurele overbelasting >2 weken."},{month:3,week:"10-12",owner:"Zakelijk verantwoordelijke HR-loket + CFO",action:"Laat HR-loket alleen groeien bij positieve margevalidatie en aantoonbaar neutrale/positieve capaciteitsimpact op kernzorg.",kpi:"0 uitbreiding zonder margevalidatie + capaciteitsimpactanalyse; KPI's wekelijks zichtbaar.",escalation:"Escalatie naar CEO als initiatief capaciteit uit de GGZ-kern wegtrekt."}],N=j=>x.filter($=>$.month===j).map(($,q)=>`${q+1}. Actie: ${$.action}
   Eigenaar: ${$.owner}
   Deadline: week ${$.week}
   KPI: ${$.kpi}
   Escalatiepad: ${$.escalation}
   Casus-anker: ${d(q+j)}`).join(`
`);return["Interventieplan 90 dagen (6 kerninterventies, causaal en afdwingbaar)","Maand 1 — Besluitvorming en financiële stop-keuzes",N(1),"Maand 2 — Governance-herinrichting en capaciteitssturing",N(2),"Maand 3 — Verankering, strategiebesluit en controle op onomkeerbaar moment",N(3)].join(`

`)},p=()=>"Structurele druk van €202.000 per jaar ondermijnt binnen 12 maanden circa 1,3 FTE behandelcapaciteit (ongeveer 112 cliënten) en veroorzaakt circa €16.833 druk per maand.",I=()=>["1-PAGINA BESTUURLIJKE SAMENVATTING","Besluit vandaag: consolideren 12 maanden; verbreding bevriezen.","Voorkeursoptie: consolidatiepad.","Expliciet verlies: HR-loket pauze, geen nieuwe initiatieven zonder margevalidatie, tijdelijke groeivertraging.","Waarom onvermijdelijk: structurele kosten/tariefdruk plus contractplafonds blokkeren autonome groei.","30/60/90 meetpunten: Dag 30 margekaart 100%, Dag 60 contractvloer per verzekeraar, Dag 90 cash-scenario's + formeel strategiebesluit.","Als meetpunten niet gehaald worden: verbreding automatisch gepauzeerd tot formeel herstelbesluit."].join(`
`),T=`${Oo} Formele machtsverschuiving: centrale regie over capaciteit, triage en budgetritme.`.trim(),b=[an("30 dagen",r.loss30,r.human30),an("90 dagen",r.loss90,r.human90),an("365 dagen",r.loss365,r.human365)].join(" ");switch(e){case"dominantThesis":{if(n==="ggz"){const d=p(),x=ge("De raad moet nu kiezen tussen consolideren van de GGZ-kern en doorzetten op verbreding met nieuwe initiatieven; beide tegelijk houden vergroot structurele margeslijtage in een model zonder contractzekerheid en met plafonds die groei blokkeren.","De organisatie stuurt op 75% productiviteit (6 uur cliëntcontact), maar vermijdt volledige financiële transparantie, waardoor de norm gedragsmatig wordt ervaren en niet als marge-instrument.");return g(`${d} Beslismoment GGZ: ${x} Structurele afhankelijkheid: zonder contractzekerheid en met plafonds rond €160.000 per verzekeraar blijft groei extern begrensd. Keuzevolgorde: consolideren -> stabiliseren -> gecontroleerde verbreding. Expliciet verlies: tijdelijke pauze op HR-loket-uitbreiding en geen nieuw initiatief zonder margevalidatie.`)}const h=ge(`Besluitkracht moet binnen veertien dagen een single lijn bepalen; ${r.loss90} en ${r.loss365} blijven anders voortmodderen.`,"Onderstroom bouwt coalities rond oude mandaten en vertraagde escalaties om centrale macht te ondermijnen.");return g(`${r.label}: ${h} Expliciet verlies: ${r.explicitLoss}.`)}case"coreConflict":{if(n==="ggz"){const d=ge("Parallel sturen op consolidatie en expansie vergroot binnen 12 maanden het liquiditeitsrisico, terwijl kostprijsinzicht per product nog grotendeels ontbreekt.","Teams ervaren 75%-normdruk, vinden productiegesprekken onaangenaam en werken met beperkte cijferopenheid; daardoor botst uitvoeringsgedrag met bestuurlijke ambitie.");return g(`Kernconflict GGZ: ${d} Kernzin: de organisatie wil autonomie, maar accepteert geen volledige financiële transparantie.`)}const h=ge(`${i} schildert een keuze tussen snelheid en controle die geen derde weg heeft.`,"Onderstroom bouwt informele coalities rond budget en personeel, waarbij vertraging en scope-verdunning de enige gelijkmaker zijn.");return g(`${r.label}: ${h} Machtssituatie: ${r.powerShift}.`)}case"tradeoffs":{if(n==="ggz"){const d=ge("Kies je voor consolidatie, dan vertraagt korte-termijngroei maar ontstaat grip op marge, planning en contractering. Kies je voor verbreding, dan neemt afhankelijkheid van beperkte capaciteit en zwak kostprijsinzicht toe.","Onderstroom reageert met uitstelgedrag rondom productiegesprekken, waardoor uitvoering achterloopt op strategische ambities.");return g(`Keerzijde van de keuze GGZ: ${d}
- Wat lever je in: tijdelijke groeisnelheid buiten de kern.
- Wat vertraag je: uitbreiding van HR-loket en vierde pijler.
- Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.
- Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.
- Expliciet verlies: HR-loket-uitbreiding wordt tijdelijk gepauzeerd.
- Stopregel: geen verbreding zonder getekende margevalidatie en capaciteitsimpact.
- Machtsimpact: besluitrecht verschuift naar een centrale prioriteringstafel met harde stop-doing keuzes.`)}const h=ge(`Bovenstroom: ${r.loss90} en ${r.loss365} laten zien wat centralisatie versus stabilisatie kost.`,`Onderstroom: informele coalities schuiven macht naar traditionele mandaten en vertragen escalatie rond ${r.powerShift}.`);return g(`Keerzijde van de keuze ${r.label}: ${h} Expliciet verlies: ${r.explicitLoss}. Machtsimpact: ${r.powerShift}.`)}case"opportunityCost":return g(n==="ggz"?"Prijs van uitstel GGZ/Jeugdzorg: 30 dagen: zonder volledige margekaart blijven stop-keuzes uit en neemt spanning op de 75%-norm toe. 90 dagen: capaciteit schuift naar verbreding, waardoor kernzorgplanning en contractruimte extra onder druk komen; onomkeerbaar moment: zonder margekaart op dag 90 wordt verbreding verplicht gepauzeerd. 365 dagen: consolidatie mislukt, afhankelijkheid van zorgverzekeraars en plafonds blijft dominant en strategische bewegingsruimte krimpt. Als de volgorde niet wordt afgedwongen, ontstaat binnen 12-18 maanden reëel risico op liquiditeitsstress of noodreductie van capaciteit.":`Prijs van uitstel ${r.label}: ${b} Onomkeerbaar moment: ${r.irreversible}.`,3);case"governanceImpact":{if(n==="ggz"){const d=ge("Centrale sturing op capaciteit, contractruimte en portfolio-keuzes wordt bindend gemaakt om de financiële basis te herstellen; planning en intake zijn al centraal ingericht, maar financiële sturing is nog niet volledig doorvertaald.","Onderstroom vraagt om maandelijkse individuele gesprekken en hogere financiële transparantie; zonder dat blijft weerstand stil en hardnekkig.");return g(`Governance-impact GGZ: ${d}`)}const h=ge(`${r.powerShift} en 48-uurs escalatieroutes dwingen structurele sturing.`,"Onderstroom zoekt naar wrijving binnen geplande ritmes, houdt budgetten vast en vertraagt escalaties.");return g(`Governance-impact ${r.label}: ${h}`)}case"powerDynamics":{if(n==="ggz"){const d=ge("Macht verschuift van verspreide operationele keuzes naar centraal besluitrecht over capaciteit, contracten en prioriteiten.","In de onderstroom zit spanning op productienorm, werkdruk en transparantie; dat uit zich eerder in vermijding dan in open conflict.");return g(`Machtsdynamiek GGZ: ${d}`)}const h=ge("Bovenstroom: macht schuift richting centrale besluitkracht en de governance-as wordt verscherpt.","Onderstroom: informele invloed richt zich op planning, budget en het subtiel uitstellen van besluiten.");return g(`Machtsdynamiek ${r.label}: ${h} Machtsverschuiving: ${r.powerShift}.`)}case"executionRisk":{if(n==="ggz"){const d=ge("Grootste faalrisico is parallel sturen op consolidatie en expansie zonder expliciete volgorde, mandaat en stoplijst.","Onderstroom blokkeert via uitstel in normgesprekken, beperkte cijfertransparantie en fragmentarische opvolging.");return g(`Executierisico GGZ: ${d} Bij uitstel groeit personeelsuitputting en daalt bestuurlijke voorspelbaarheid.`)}const h=ge("Bovenstroom: parallelle prioritering van oud en nieuw beleid vormt het faalpunt.","Onderstroom: dubbel mandaat en verborgen agenda's veroorzaken vertraagde escalaties en deadline-erosie.");return g(`Executierisico ${r.label}: ${h} ${r.irreversible}.`)}case"interventionPlan90D":return g(m(),4);case"decisionContract":{const h=ge("Bovenstroom: de Raad tekent een contract met keuze, KPI, tijdshorizon (14 dagen besluit, 30 dagen executiebewijs, 365 dagen structureel effect), expliciet verlies en de harde regel: geen nieuw initiatief zonder margevalidatie en capaciteitsimpactanalyse.","Onderstroom (Interpretatie): CEO, CFO en bestuurssecretaris plaatsen handtekeningen, benoemen machtspartners en maken duidelijk dat verborgen agenda's geen ruimte krijgen.");return g(`Besluitkader: ${h} Mandaatverschuiving: lokale capaciteitsbesluiten vervallen bij gemist beslismeetpunt; centrale prioritering beslist bindend. Expliciet verlies: tijdelijk stoppen of pauzeren van minimaal één niet-kerninitiatief totdat de GGZ-kern financieel voorspelbaar draait. Verbod: geen capaciteit voor HR-loket-uitbreiding zonder centrale goedkeuring. Onomkeerbaar moment: na 90 dagen zonder volledige margekaart wordt verbreding automatisch gepauzeerd; terugdraaien kan alleen via formeel herbesluit van bestuur en RvT met onderbouwing.

${I()}`)}default:{const h=ge(`${i} schrijft de bovenstroom met cijfers, structuur en ${r.loss30} als prijs voor uitstel.`,"Onderstroom draait om sabotage via vertraagde escalatie, burn-out-verhalen en behoud van oude mandaten.");return g(n==="ggz"?`GGZ/Jeugdzorg: ${T} ${h} Formele machtsverschuiving: ${r.powerShift}. Expliciet verlies: ${r.explicitLoss}. Onomkeerbaar moment: ${r.irreversible}.`:`${r.label}: ${h} Formele machtsverschuiving: ${r.powerShift}. Expliciet verlies: ${r.explicitLoss}. Onomkeerbaar moment: ${r.irreversible}.`,3)}}}function $c(e){return String(e??"").split(`
`).filter(t=>!t.includes(Ut)).join(`
`).trim()}function _c(e){let t=String(e??"");for(const n of Oc)t=t.replace(n,"");return t.trim()}function zc(e){let t=_c(String(e??"")).trim();for(const n of Ac)t=t.replace(n,"").trimStart();return t.trim()}function He(e){return zc($c(e))}function qi(e){const t=He(e);return t?`${Ut}

${t}`:Ut}function ni(e){return Nc.some(t=>t.test(e))}const Dc=new Set(["dominantThesis","decisionContract"]);function yo(e){return Dc.has(String(e??""))}function $o(e){const t=mn(String(e||""));if(!t)return!1;const n=/\bals\b/i.test(t),i=/\bdan\b/i.test(t),r=/\bwaardoor\b/i.test(t),a=/\b(dat betekent|impliciet kiest|feitelijk kiest|kiest voor)\b/i.test(t),o=/\b(verlies|prijs|risico|liquiditeitsstress|capaciteitsreductie|marge-erosie|mandaatverlies)\b/i.test(t);return n&&i&&r&&a&&o}function Lc(e,t){const n=jo(t),i=Co[n],r=i?.label??"Strategische Transformatie",a=i?.explicitLoss??"tijdelijk pauzeren van minimaal één niet-kerninitiatief totdat kernsturing aantoonbaar hersteld is",o=i?.loss90??"oplopende marge- en uitvoeringsdruk binnen 90 dagen";return`Als het bestuur in ${r} niet eerst de kern consolideert met expliciete prioritering, stoplijst en eigenaarschap, dan blijven consolidatie en verbreding parallel lopen, waardoor ${o} structureel oploopt. Dat betekent dat de verantwoordelijke bestuurder feitelijk kiest voor uitstel boven kernstabilisatie; expliciet verlies: ${a}.`}function ti(e,t,n){const i=He(String(e||""));if(!yo(t)||$o(i)||i.length>=320)return i;const r=Lc(t,n);return[i,r].filter(Boolean).join(`
`).trim()}const Bc=/Als het bestuur in[\s\S]*?niet eerst de kern consolideert[\s\S]*?expliciet verlies:[\s\S]*?\./gi;function Vr(e,t){const n=He(String(e||""));return!n||t==="dominantThesis"||t==="decisionContract"?n:n.replace(Bc," ").replace(/\n{3,}/g,`

`).replace(/\s{2,}/g," ").trim()}function tn(e,t){const n=mn(String(e||""));if(!n)return 4;let i=ni(n)?2:0;yo(String(t??""))&&!$o(n)&&(i+=3);for(const r of Rc)r.test(n)&&(i+=1);return i}function Gc(e){const t=e.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();return t.includes("dominante")&&t.includes("these")?"dominantThesis":t.includes("kernconflict")||t.includes("kernspanning")?"coreConflict":t.includes("trade")||t.includes("keerzijde van de keuze")||t.includes("onvermijdelijke")&&t.includes("keuzes")?"tradeoffs":t.includes("opportunity")||t.includes("prijs van uitstel")?"opportunityCost":t.includes("governance")||t.includes("mandaat")||t.includes("besluitrecht")?"governanceImpact":t.includes("machtsdynamiek")||t.includes("onderstroom")||t.includes("informele macht")?"powerDynamics":t.includes("executierisico")||t.includes("faalmechanisme")?"executionRisk":t.includes("90")||t.includes("interventieplan")||t.includes("interventieontwerp")?"interventionPlan90D":t.includes("decision contract")||t.includes("besluitkader")?"decisionContract":"narrative"}function lr(e,t){const n=yc(e,t)||Kr[e]||Kr.narrative;return ti(n,e,t)}function Qi(e,t,n=1){const i=He(lr(e,t));return Math.max(1,Math.min(n,un))>=un,i}function Mc(e){const t=new Map,n=mn(String(e??"")).toLowerCase().replace(/[^\p{L}\p{N}\s€%]/gu," ").replace(/\s+/g," ").trim();for(const i of n.split(" ").map(r=>r.trim()).filter(r=>r.length>2))t.set(i,(t.get(i)??0)+1);return t}function Pc(e,t){if(e.size===0||t.size===0)return 0;let n=0,i=0,r=0;for(const a of e.values())i+=a*a;for(const a of t.values())r+=a*a;for(const[a,o]of e.entries()){const s=t.get(a);s&&(n+=o*s)}return!i||!r?0:n/(Math.sqrt(i)*Math.sqrt(r))}function Fr(e,t=.8){const n=String(e??"").split(/\n\s*\n+/).map(o=>o.trim()).filter(Boolean),i=[],r=[],a=new Set;for(const o of n){const s=mn(o).toLowerCase();if(!s||a.has(s))continue;const c=Mc(o);r.some(u=>Pc(u,c)>=t)||(i.push(o),r.push(c),a.add(s))}return i.join(`

`).trim()}const Wr=new Set;function wn(e,t,n=0){const i=`${e}:${n}`;Wr.has(i)||(Wr.add(i),console.warn("Signature violation bypassed → fallback used",{sectionKey:e,residualScore:n}));const r=He(lr(e,t));return e==="narrative"?qi(r):r}function Xi(e,t,n){const i=ti(He(String(e||"")),t,n),r=(t==="dominantThesis"||t==="coreConflict")&&(!/\bBovenstroom:\b/i.test(i)||!/\bOnderstroom:\b/i.test(i)||!/\bBronankers:\b/i.test(i)||!/\bBestuurlijke implicatie:\b/i.test(i));if(Yi(n)||r){const c=He(lr(t,n));return t==="narrative"?wn(t,n,0):ni(c)||tn(c,t)>0?wn(t,n,1):c}let o=i;for(let c=1;c<=un&&(o=ti(o,t,n),!(o&&tn(o,t)===0));c++)o=Qi(t,n,c);tn(o,t)>0&&(o=Qi(t,n,un)),o=ti(o,t,n);const s=tn(o,t);return ni(o)||s>0?wn(t,n,s):He(o)}function Uc(e,t){let n={};for(let r=0;r<=un;r++){n={};for(const[o,s]of Object.entries(e))n[o]=Vr(Xi(s,o,t?.contextHint),o);if(!Object.entries(n).find(([o,s])=>tn(s,o)>0))return n}const i={};for(const r of Object.keys(e))i[r]=Vr(Qi(r,t?.contextHint,un),r);return i}function _o(e,t){const n=String(e||"").trim();if(!n)return wn("narrative",t,4);if(!n.includes("###")){const l=Xi(n,"narrative",t);return l.includes(Ut)||Yi(t)?qi(l):He(Fr(l))}const r=n.split(/(?=###\s*\d+\.)/g).map(l=>l.trim()).filter(Boolean).map(l=>{const[u,...g]=l.split(`
`),m=u.trim(),p=g.join(`
`).trim(),I=Gc(m),T=He(Xi(p,I,t));return`${m}
${T}`.trim()}),a=Fr(r.join(`

`).trim()),s=Yi(t)&&!a.includes(Ut)?qi(a):He(a),c=tn(s);return ni(s)||c>0?wn("narrative",t,c):s}const Hc=["### 1. DOMINANTE THESE","### 2. KERNCONFLICT","### 3. KEERZIJDE VAN DE KEUZE","### 4. PRIJS VAN UITSTEL","### 5. GOVERNANCE IMPACT","### 6. MACHTSDYNAMIEK","### 7. EXECUTIERISICO","### 8. 90-DAGEN INTERVENTIEPROGRAMMA","### 9. BESLUITKADER"],Kc="### 3 STRATEGISCHE INZICHTEN",Vc=[/\bstaat onder druk\b/gi,/\bmogelijk\b/gi,/\bzou kunnen\b/gi,/\bbelangrijk om\b/gi,/\bvaak zien we\b/gi,/\bin veel organisaties\b/gi,/\bquick win\b/gi,/\blaaghangend fruit\b/gi,/\bessentieel\b/gi,/\bcruciaal\b/gi,/\balignment\b/gi,/\boptimaliseren\b/gi,/\btransformatie\b/gi,/\broadmap\b/gi,/\bblueprint\b/gi,/\bbest practice\b/gi,/\ber is sprake van\b/gi,/\ber lijkt sprake van\b/gi,/\bdefault template\b/gi,/\bas ai\b/gi,/\bals taalmodel\b/gi],Fc="Het bestuur committeert zich aan het volgende besluit:";function li(e){return String(e??"").replace(/\r\n?/g,`
`).trim()}function zo(e){const t=li(e);if(!t)return[];const n=/^###\s*(\d+)\.\s*([^\n]+)$/gm,i=[...t.matchAll(n)];return i.length?i.map((r,a)=>{const o=r[0].trim(),s=Number(r[1]||0),c=(r.index??0)+r[0].length,l=i[a+1]?.index??t.length,u=t.slice(c,l).replace(/^\n+/,"").trim();return{heading:o,number:s,body:u}}):[]}function Do(e){const t=new Map;for(const o of e)o.number&&(t.has(o.number)||t.set(o.number,o.body||"Niet onderbouwd in geuploade documenten of vrije tekst."));const n=Hc.map((o,s)=>{const c=s+1,l=li(t.get(c)||"Niet onderbouwd in geuploade documenten of vrije tekst.");return`${o}

${l}`}),i=[Kc,"INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.","WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.","BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst.","","INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.","WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.","BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst.","","INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.","WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.","BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst."].join(`
`),r=n[0]??"",a=n.slice(1);return[r,i,...a].filter(Boolean).join(`

`).trim()}function Wc(e){const t=li(e).replace(/Het bestuur committeert zich aan het volgende besluit:[\s\S]*$/i,"").trim(),n=r=>{const a=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),o=t.match(new RegExp(`^${a}\\s*(.*)$`,"im"));return String(o?.[1]??"").trim()},i=[Fc,`Keuze: ${n("Keuze:")||"Een expliciete voorkeurskeuze met direct mandaat."}`,`Expliciet verlies: ${n("Expliciet verlies:")||"Tijdelijke inlevering van parallelle prioriteiten."}`,`Besluitrecht ligt bij: ${n("Besluitrecht ligt bij:")||"De benoemde eindverantwoordelijke in het bestuur."}`,`Stoppen per direct: ${n("Stoppen per direct:")||"Alle uitzonderingsroutes buiten het besluitritme."}`,`Niet meer escaleren: ${n("Niet meer escaleren:")||"Informele bypasses buiten het formele escalatiepad."}`,`Maandelijkse KPI: ${n("Maandelijkse KPI:")||"Doorlooptijd, escalaties en uitvoeringsdiscipline."}`,`Failure trigger: ${n("Failure trigger:")||"Twee opeenvolgende periodes zonder aantoonbare voortgang."}`,`Point of no return: ${n("Point of no return:")||"Na het missen van Dag 60-gate wordt verlies onomkeerbaar."}`,`Herijkingsmoment: ${n("Herijkingsmoment:")||"Maandelijks bestuursmoment met stop/door-besluit."}`,"Dit betekent dat het bestuur nu moet kiezen voor ..."].join(`
`);return t?`${t}

${i}`.trim():i}const Jc=`
CYNTRA Executive Decision Engine Spec.
Volg exact de sectiestructuur die in de actieve prompt of skeleton is opgegeven.
Gebruik waar gevraagd een 1-pagina Board Memo direct boven het Decision Contract.
Schrijf menselijk, financieel hard, bestuurlijk rustig en zonder dreigtoon.
Geen algemene statements, geen meta-tekst, geen AI-taal, geen consultant-jargon.
Maak besluituitstel psychologisch onmogelijk: geen twijfelzinnen, geen open einde.
Formuleer bestuurlijke causaliteit als onvermijdelijkheid, niet als advies.
Het 90-dagenplan bevat exact 6 kerninterventies (2 per maand) met velden:
Probleem dat wordt opgelost/Concrete actie/Waarom deze interventie/Eigenaar/Deadline/Meetbare KPI/Escalatieregel met gevolg/Gevolg voor organisatie/Gevolg voor klant-cliënt/Risico van niet handelen/Direct zichtbaar effect/Casus-anker.
Escalatie gebruikt niveaus L1-L2-L3 (operationeel, MT, bestuurlijke herprioritering).
Decision Contract bevat een rustig geformuleerd point of no return en mandaatverschuiving.
In zorgcontext (GGZ/Jeugdzorg) zijn deze zinnen verplicht aanwezig:
1) "De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel."
2) "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
3) "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."
Vertaal capaciteit altijd naar menselijk effect: behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
`.trim(),er=`
Schrijf uitsluitend op basis van broncontext.
Geen nieuwe feiten buiten input.
Geen bullets buiten sectie 8 en 9.
Geen verboden generieke woorden.
`.trim();function Jr(e){return li(e).split(`
`).filter(t=>!/^(meta|toelichting|uitleg|opmerking)\s*:/i.test(t.trim())).join(`
`).trim()}function $n(e){return Do(zo(e))}function Zr(e){return $n(e)}function Yr(e){return $n(e)}function qr(e){const t=zo($n(e)).map(n=>n.number!==9?n:{...n,body:Wc(n.body)});return Do(t)}function Zc(e){const t=String(e??"");return Vc.some(n=>n.test(t))}const Yc=Zc,Ft=["### 1. DOMINANTE THESE","### 2. KERNCONFLICT","### 3. STRATEGISCHE INZICHTEN","### 4. KEERZIJDE VAN DE KEUZE","### 5. PRIJS VAN UITSTEL","### 6. GOVERNANCE IMPACT","### 7. MACHTSDYNAMIEK","### 8. EXECUTIERISICO","### 9. STRATEGISCHE SCENARIOANALYSE","### 10. 90-DAGEN INTERVENTIEPROGRAMMA","### 11. BESLUITSKWALITEIT","### 12. BESLUITKADER"],qc=/^###\s*(\d+)\.\s*([^\n]+)$/gm;function Ht(e){const t=String(e??"").replace(/\r\n?/g,`
`),n=[...t.matchAll(qc)];return n.map((i,r)=>{const a=(i.index??0)+i[0].length,o=n[r+1]?.index??t.length;return{number:Number(i[1]||0),heading:i[0].trim(),body:t.slice(a,o).replace(/^\n+/,"").trim()}})}function Qc(e){return String(e??"").toLowerCase().replace(/[\r\n]+/g," ").replace(/[^\p{L}\p{N}%€\s]+/gu," ").replace(/\s+/g," ").trim()}function tr(e){return Qc(e).split(" ").filter(Boolean)}function Xc(e,t,n=4){const i=tr(e),r=tr(t);if(i.length<n||r.length<n)return 0;const a=l=>{const u=new Set;for(let g=0;g<=l.length-n;g+=1)u.add(l.slice(g,g+n).join(" "));return u},o=a(i),s=a(r);if(!o.size||!s.size)return 0;let c=0;for(const l of o)s.has(l)&&(c+=1);return c/Math.min(o.size,s.size)}function Lo(e){return String(e??"").split(`
`).map(t=>t.trim()).find(Boolean)??""}function el(e){return String(e??"").split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean)}const tl=new Set(["de","het","een","voor","met","door","van","naar","wordt","zijn","niet","maar","deze","organisatie","bestuur"]);function pn(e){return[...new Set(e.map(t=>t.trim()).filter(Boolean))]}function nl(e){return String(e??"").replace(/\s+/g," ").trim()}function Qr(e){return nl(e).toLowerCase()}function il(e){return pn(String(e??"").match(/(?:€\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\b)/g)??[])}function rl(e){return pn(String(e??"").match(/\b(ceo|cfo|coo|chro|cto|rvb|raad van bestuur|raad van toezicht|directeur|manager|teamlead|planner|projectleider|medisch directeur|compliance officer)\b/gi)??[])}function al(e){return pn(String(e??"").match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g)??[]).slice(0,120)}function ol(e){return pn(String(e??"").toLowerCase().match(/\b[a-z][a-z0-9_-]{4,}\b/g)??[]).filter(n=>!tl.has(n)).filter(n=>/(intake|planning|dashboard|contract|wachttijd|igj|instroom|consolidatie|escalatie|doorlooptijd|capaciteit|besluit|mandaat|kpi|coalitie|onderstroom|bovenstroom)/.test(n)).slice(0,160)}function bn(e){const t=String(e??""),n=[...rl(t),...al(t),...il(t),...ol(t)];return pn(n).slice(0,200)}function Xr(e,t){return Qr(e).includes(Qr(t))}function sl(e,t){const n=pn(t);if(!n.length)return{coverage:1,missing:[],matched:[]};const i=n.filter(a=>Xr(e,a)),r=n.filter(a=>!Xr(e,a));return{coverage:i.length/n.length,missing:r,matched:i}}class D extends Error{constructor(t,n,i,r){super(t),this.code=n,this.details=i,this.repairDirective=r,this.name="ExecutiveGateError"}}function cl(e,t){const n=bn(t),i=sl(e,n);if(i.matched.length<6)throw new D("Te weinig unieke casus-ankers in output.","CASUS_ANCHORS_MIN",{matched:i.matched.length,required:6},"ANCHOR REPAIR MODE: elke sectie minimaal 2 casus-ankers; sectie 8 elke interventie met casus-anker.");const r=Ht(e);let a=0;for(const c of r)n.filter(u=>c.body.toLowerCase().includes(u.toLowerCase())).length>=2&&(a+=1);if(a<6)throw new D("Te weinig secties met >=2 casus-ankers.","SECTION_ANCHORS_DISTRIBUTION",{richSections:a,required:6},"ANCHOR REPAIR MODE: herbouw volledige output met minimaal 2 casus-ankers in elke sectie.");const o=r.find(c=>c.number===8)?.body??"",s=n.filter(c=>o.toLowerCase().includes(c.toLowerCase()));if(s.length<10)throw new D("Sectie 8 bevat te weinig casus-ankers.","SECTION8_ANCHORS_MIN",{found:s.length,required:10},"INTERVENTION REWRITE MODE: elke interventie koppelen aan expliciet casus-anker uit context.")}const ll=/\b(default template|transformatie-template|state under pressure|mogelijk|zou kunnen|quick win|low hanging fruit|geen expliciete context aangeleverd|analyseer structureel)\b/i;function dl(e){if(ll.test(e))throw new D("Generieke of verboden taal gedetecteerd.","SEMANTIC_DENSITY_TOO_LOW",void 0,"Vervang generieke taal door concrete casusfrictie met actor, mechanisme en gevolg.")}const ea=.18,ta=.18;function ul(e,t){if(t){const r=Xc(t,e,4);if(r>ea)throw new D("Repetition overlap te hoog.","REPETITION_TOO_HIGH",{overlap:r,threshold:ea},"Herschrijf volledig met andere mechanische ketens en andere formuleringen.")}const n=tr(e),i=n.length?new Set(n).size/n.length:0;if(i<ta)throw new D("Semantische dichtheid te laag.","SEMANTIC_DENSITY_TOO_LOW",{uniqueRatio:i,threshold:ta},"Verhoog lexicale variatie en verwijder herhaling per sectie.")}const gl=/\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|daardoor|hierdoor)\b/i;function ml(e){for(const t of Ht(e)){const n=(t.body.match(/\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|daardoor|hierdoor)\b/gi)??[]).length;if(n<1||!gl.test(t.body))throw new D(`Sectie ${t.number} mist causale keten.`,"SYSTEM_MECHANISM_REQUIRED",{section:t.number,hits:n},"Maak per sectie minimaal één expliciete causale keten zichtbaar.")}}const pl="De Raad van Bestuur committeert zich aan:",bl=["Keuze:","Expliciet verlies:","Besluitrecht ligt bij:","Stoppen per direct:","Niet meer escaleren:","Maandelijkse KPI:","Failure trigger:","Point of no return:","Herijkingsmoment:"];function hl(e){const t=Ht(e).find(i=>i.number===9)?.body??"";if(Lo(t)!==pl)throw new D("Decision contract startzin is niet exact.","DECISION_CONTRACT_REQUIRED",void 0,"Start sectie 9 exact met: De Raad van Bestuur committeert zich aan:");const n=[];for(const i of bl){const r=t.match(new RegExp(`${i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*(.*)`,"i"));String(r?.[1]??"").trim()||n.push(i)}if(n.length>=2)throw new D("Decision contract mist labels of waarden.","DECISION_CONTRACT_REQUIRED",{missingOrEmpty:n},"Vul alle contractlabels met concrete, casusgebonden inhoud.");if(!/\b(onomkeerbaar|irreversibel|point of no return)\b/i.test(t))throw new D("Irreversibiliteit ontbreekt in decision contract.","IRREVERSIBILITY_REQUIRED",void 0,"Neem een expliciete point-of-no-return op in sectie 9 met trigger en consequentie.")}const El=/\b(ceo|cfo|coo|chro|cto|rvb|raad van bestuur|directeur|manager|teamlead|planner|projectleider|medisch directeur)\b/i;function fl(e,t){const n=Ht(e),i=String(e??""),r=bn(t).map(p=>p.toLowerCase()),a=/\b(mandaat verschuift|besluitrecht verschuift|mandaatherverdeling|formele macht verschuift)\b/i.test(i),o=/\b(status verliest|autonomie verliest|informeel wint tempo|informeel verliest|onderstroom verschuift)\b/i.test(i),s=i.split(/\n+/).filter(p=>El.test(p)&&/\b(verliest|wint|verschuift|krijgt)\b/i.test(p));if(!(a&&o&&s.length>=2))throw new D("Machtsverschuiving onvoldoende expliciet of actor-gebonden.","POWER_SHIFT_REQUIRED",{formalShift:a,informalShift:o,actorLines:s.length},"POWER REPAIR MODE: benoem 2 machtsverschuivingen (formeel + informeel) met naam/rol uit input.");const c=/point of no return/i.test(i),l=/\b(dag\s*30|dag\s*60|dag\s*90|30\s*dagen|60\s*dagen|90\s*dagen)\b/i.test(i),u=/\b(onomkeerbaar|irreversibel|reputatie|retentie|contractmacht|uitvoerbaarheid)\b/i.test(i);if(!(c&&l&&u))throw new D("Irreversibiliteit/PoNR ontbreekt.","IRREVERSIBILITY_REQUIRED",{hasPONR:c,hasTriggerTime:l,hasIrreversibleEffect:u},"IRREVERSIBILITY REPAIR: voeg PoNR toe met dag-trigger en onomkeerbaar gevolg.");const g=/\b(conflictmijding|informele bypass|planners nemen besluiten|teams nemen besluiten|escalatie wordt omzeild)\b/i.test(i),m=/\b(leidt tot|resulteert in|met gevolg dat)\b/i.test(i);if(!(g&&m))throw new D("Culture drift niet concreet genoeg.","CULTURE_DRIFT_REQUIRED",{hasBehaviorShift:g,hasConsequence:m},"CULTURE REPAIR: beschrijf concreet gedrag + direct bestuurlijk gevolg.");for(const p of n){const I=p.body.toLowerCase(),T=r.filter(b=>I.includes(b)).length;if(p.number<=8&&T<1)throw new D(`Sectie ${p.number} mist casus-koppeling.`,"CASUS_ANCHORS_MIN",{section:p.number,anchorHits:T},"Veranker elke sectie expliciet aan minimaal 1 casus-anker.")}}const kl=["MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN","MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN","MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN","BOVENSTROOM-DOELEN","ONDERSTROOM-DOELEN"],vl=["Actie:","Eigenaar:","Deadline:","KPI:","Escalatiepad:","Effect organisatie:","Effect cliënt:","Direct zichtbaar effect:","Casus-anker:"];function Sl(e,t){const n=Ht(e).find(c=>c.number===8)?.body??"",i=n.toLowerCase();for(const c of kl)if(!n.includes(c))throw new D(`Sectie 8 mist verplichte header: ${c}`,"INTERVENTION_ARTEFACT_REQUIRED",{header:c},"INTERVENTION REWRITE MODE: herschrijf sectie 8 met exacte maandheaders en doelblokken.");const r=n.split(/(?=Actie:)/g).map(c=>c.trim()).filter(Boolean);if(r.length!==6)throw new D("Sectie 8 bevat niet exact 6 kerninterventies.","INTERVENTION_ARTEFACT_REQUIRED",{interventions:r.length,required:6},"INTERVENTION REWRITE MODE: exact 2 interventies per maand (6 totaal).");for(const c of r)for(const l of vl)if(!c.includes(l))throw new D(`Interventie mist veld ${l}`,"INTERVENTION_ARTEFACT_REQUIRED",{field:l,block:c.slice(0,200)},"INTERVENTION REWRITE MODE: elke interventie moet alle verplichte velden bevatten.");const a=[n.split("MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN")[1]??"",n.split("MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN")[1]??"",n.split("MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN")[1]??""];for(const[c,l]of a.entries()){const u=l.split(/MAAND\s+[23]|BOVENSTROOM-DOELEN/i)[0]??l,g=(u.match(/\bActie:/g)??[]).length,m=(u.match(/\bEscalatiepad:/g)??[]).length;if(g<2||m<1)throw new D(`Maand ${c+1} interventievolume of escalatiepad onvoldoende.`,"INTERVENTION_ARTEFACT_REQUIRED",{month:c+1,interventions:g,escalations:m},"INTERVENTION REWRITE MODE: minimaal 2 interventies en 1 escalatiepad per maand.")}if(!/\bDag\s*30\b/i.test(n)||!/\bDag\s*60\b/i.test(n)||!/\bDag\s*90\b/i.test(n))throw new D("Dag 30/60/90 gates ontbreken in sectie 8.","INTERVENTION_ARTEFACT_REQUIRED",void 0,"INTERVENTION REWRITE MODE: voeg expliciete Dag 30, Dag 60 en Dag 90 gates toe.");const o=bn(t).map(c=>c.toLowerCase()),s=r.filter(c=>{const l=c.toLowerCase();return o.every(u=>!l.includes(u))});if(s.length>0||/\b(verbeter communicatie|meer afstemming|extra focus)\b/i.test(i))throw new D("Generieke interventies zonder casus-anker gedetecteerd.","INTERVENTION_ARTEFACT_REQUIRED",{genericActions:s.length},"INTERVENTION REWRITE MODE: maak elke interventie casus-specifiek met expliciet anker.")}const Il="De Raad van Bestuur committeert zich aan:",Tl="1-PAGINA BESTUURLIJKE SAMENVATTING",Nl="0 SITUATIERECONSTRUCTIE",Rl="### 3. STRATEGISCHE INZICHTEN";function Al(e){const t=Ht(e);if(t.length!==12)throw new D("Exact 12 secties vereist.","EXACT_12_SECTIONS",{count:t.length},"Herbouw de volledige output met exact 12 canonieke secties.");for(let U=0;U<Ft.length;U+=1)if(t[U]?.heading!==Ft[U])throw new D("Heading exact match mislukt.","HEADING_EXACT_MATCH",{expected:Ft[U],observed:t[U]?.heading},"Gebruik exact de 12 canonieke headings in vaste volgorde.");if(!t.find(U=>U.number===10)?.body.trim())throw new D("Sectie 10 ontbreekt of is leeg.","SECTION_8_PRESENT",void 0,"Vul sectie 10 volledig met maandblokken en interventies.");const n=t.find(U=>U.number===12);if(!n)throw new D("Sectie 12 ontbreekt.","SECTION_12_COMMIT_PREFIX");const i=Lo(n.body);if(i!==Il)throw new D("Sectie 12 moet exact starten met commit-prefix.","SECTION_12_COMMIT_PREFIX",{firstLine:i},"Start sectie 12 exact met: De Raad van Bestuur committeert zich aan:");const r=(String(e??"").match(/^###\s*\d+\./gm)??[]).length;if(r!==12)throw new D("Extra headings gevonden.","NO_EXTRA_HEADINGS",{headingCount:r},"Verwijder extra headings; behoud exact 12 hoofdkoppen.");const a=String(e??""),o=a.indexOf(Nl),s=a.indexOf(Ft[0]);if(o<0||s<0||o>s)throw new D("0 SITUATIERECONSTRUCTIE ontbreekt of staat niet boven sectie 1.","SITUATION_RECON_REQUIRED",{reconFound:o>=0,section1Found:s>=0},"Plaats een blok '0 SITUATIERECONSTRUCTIE' direct boven sectie 1.");const c=a.indexOf(Rl),l=a.indexOf(Ft[3]);if(c<0||l<0||c>l)throw new D("3. STRATEGISCHE INZICHTEN ontbreekt of staat niet op sectiepositie 3.","STRATEGIC_INSIGHTS_REQUIRED",{strategicFound:c>=0,section4Found:l>=0},"Gebruik exact heading: '### 3. STRATEGISCHE INZICHTEN'.");const u=a.indexOf(Tl),g=a.indexOf(Ft[11]);if(u<0||g<0||u>g)throw new D("1-pagina samenvatting ontbreekt of staat niet boven sectie 12.","BOARD_SUMMARY_REQUIRED",{summaryFound:u>=0,section12Found:g>=0},"Plaats een blok '1-PAGINA BESTUURLIJKE SAMENVATTING' direct boven sectie 12.");const m=t.find(U=>U.number===9)?.body??"",p=/\bSCENARIO\s*A\b/i.test(m),I=/\bSCENARIO\s*B\b/i.test(m),T=/\bSCENARIO\s*C\b/i.test(m),b=/\bSCENARIOVERGELIJKING\b/i.test(m);if(!p||!I||!T||!b)throw new D("Scenarioanalyse in sectie 9 is onvolledig.","STRATEGIC_INSIGHTS_REQUIRED",{hasScenarioA:p,hasScenarioB:I,hasScenarioC:T,hasComparison:b},"Voeg in sectie 9 minimaal SCENARIO A/B/C en een SCENARIOVERGELIJKING toe.");const h=t.find(U=>U.number===11)?.body??"",d=/\bBesluitscore\b/i.test(h),x=/\bBelangrijkste risico/i.test(h),N=/\bUitvoerbaarheidsanalyse\b/i.test(h),j=/\bAanbevolen verbeteringen\b/i.test(h);if(!d||!x||!N||!j)throw new D("Besluitskwaliteit-sectie is onvolledig.","BOARDROOM_INTELLIGENCE_REQUIRED",{hasDecisionScore:d,hasRisks:x,hasFeasibility:N,hasImprovements:j},"Vul sectie 11 met Besluitscore, risico's, uitvoerbaarheid en verbeteringen.");const $=t.find(U=>U.number===7)?.body??"",q=($.match(/\bBOARDROOM INZICHT\b/gi)??[]).length,le=/\bwie heeft besluitmacht\b/i.test($)&&/\bwie heeft informele invloed\b/i.test($)&&/\bwaar zit de feitelijke macht\b/i.test($);if(q<3||!le)throw new D("Boardroom-intelligentie in sectie 7 is onvolledig.","BOARDROOM_INTELLIGENCE_REQUIRED",{boardroomInsights:q,hasPowerCore:le},"Voeg in sectie 7 minimaal 3 BOARDROOM INZICHT-blokken toe plus expliciete machtstoedeling.");for(const U of t)if(U.number<=10&&/^\s*([-*•]|\d+[.)])\s+/m.test(U.body))throw new D("Bullets buiten sectie 11/12 zijn verboden.","NO_BULLETS_OUTSIDE_8_9",{section:U.number},"Gebruik in sectie 1-10 alleen doorlopende alinea's zonder bullets.")}const na=/\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|prikkel|mechanisme|feedbackloop|frictie)\b/i;function Ol(e){const t=Ht(e);for(const n of t){const i=el(n.body)[0]??"";if(/^de\s+organisatie\b/i.test(i)&&!na.test(i))throw new D(`Sectie ${n.number} start als observatie zonder mechanisme.`,"SYSTEM_MECHANISM_REQUIRED",{section:n.number,firstSentence:i},"Start elke sectie met mechanische causalketen: Omdat A -> ontstaat B -> leidt tot C.");if(!na.test(n.body))throw new D(`Sectie ${n.number} mist mechanisme.`,"SYSTEM_MECHANISM_REQUIRED",{section:n.number},"Voeg expliciete oorzaak-gevolg mechaniek toe in de openingszinnen van elke sectie.")}}function Cl(e){const{text:t,context:n,lastOutput:i}=e;try{Al(t),dl(t),Ol(t),ml(t),cl(t,n),fl(t,n),Sl(t,n),hl(t),ul(t,i)}catch(r){throw r instanceof D?r:r instanceof Error?new D(r.message,"SEMANTIC_DENSITY_TOO_LOW",{cause:r.name}):new D("Onbekende gate-fout","SEMANTIC_DENSITY_TOO_LOW")}}const wl=`
CYNTRA BESTUURLIJKE TAAL- EN STRUCTUURPATCH

DOEL
Maak het Cyntra rapport volledig Nederlandstalig
en geschikt voor bestuur, directie en raad van toezicht.

Gebruik heldere, menselijke en bestuurlijke taal.
Verwijder alle consultancytaal en technische jargonwoorden.

ADD ONLY.

------------------------------------------------

1. VERBODEN WOORDEN

Deze woorden zijn verboden:

hefboom
framework
synergie
optimaliseren
ecosysteem
insight
board
boardroom
executive
strategy
scenario
memo
implicatie

------------------------------------------------

2. VERVANG MET MENSELIJKE BESTUURLIJKE TAAL

Gebruik in plaats daarvan:

onderliggende oorzaak
belangrijke reden
patroon
knelpunt
beslispunt
richting
gevolg
keuze
kerninzicht
mogelijke ontwikkeling
bestuurlijk
werkwijze
verbeteren
aangrijpingspunt
waar het verschil gemaakt kan worden

------------------------------------------------

3. SECTIETITELS

Gebruik uitsluitend deze secties in deze volgorde:

Bestuurlijke besliskaart
Bestuurlijke kernsamenvatting
Strategisch speelveld
Doorbraakinzichten
Strategische breukpunten
Bestuurlijk actieplan
Scenario's
Bestuurlijke stresstest

------------------------------------------------

4A. BEWIJSDISCIPLINE

Elke hoofdsectie moet nieuwe informatiewaarde toevoegen.
Herhaal geen kernstelling, keuze of risico in meerdere secties met andere woorden.

Onderbouw de aanbevolen keuze met 3 tot 5 concrete bronankers uit de input, zoals:

- aantallen
- percentages
- data
- contractfeiten
- capaciteitsgrenzen
- expliciete deadlines

Gebruik alleen bronankers die bestuurlijk relevant zijn.
Neem geen ruwe transcriptblokken, exportkoppen, actie-overzichten of vergadernotities over in het hoofdrapport.

------------------------------------------------

4. STRUCTUUR VAN INZICHTEN

Gebruik altijd deze opbouw binnen Doorbraakinzichten:

KERNINZICHT
MECHANISME
BESTUURLIJK GEVOLG

Gebruik maximaal 5 inzichten.

------------------------------------------------

4A. STRATEGISCH SPEELVELD

Gebruik altijd exact 3 blokken:

Zorginhoud
Contractlogica
Capaciteit

------------------------------------------------

4B. STRATEGISCHE BREUKPUNTEN

Gebruik altijd deze opbouw:

MECHANISME
SYSTEEMDRUK
RISICO
BESTUURLIJKE TEST

------------------------------------------------

5. STRUCTUUR VAN HET ACTIEPLAN

Gebruik altijd exact deze velden voor elke actie:

ACTIE
MECHANISME
BESTUURLIJK BESLUIT
VERANTWOORDELIJKE
DEADLINE
KPI

Het BESTUURLIJK BESLUIT moet beginnen met:

"Het bestuur besluit"

Voorbeeld: "Het bestuur besluit triageregels vast te stellen en deze te koppelen aan caseloadgrenzen."

Vermijd vage formuleringen zoals "Laat het bestuur besluiten hoe..." of "Borg dit bestuurlijk.".
Elke actie moet een echte keuze bevatten:

- wat direct start
- wat stopt of wordt begrensd
- wie beslist
- wanneer heroverweging verplicht is

------------------------------------------------

6. GEEN LEGE SECTIES

Als een sectie geen inhoud heeft:

sectie niet genereren

Toon nooit: "Niet beschikbaar".

Bestuurlijke documenten mogen geen lege of kapotte secties tonen.

------------------------------------------------

7. SCHRIJFSTIJL

Zinnen maximaal 22 woorden.

Gebruik actieve formuleringen:

"Het bestuur besluit" 
"De organisatie kiest" 
"Het risico is" 
"De belangrijkste oorzaak is"

Gebruik korte, duidelijke en directe taal.
Elke alinea voegt iets nieuws toe.
Geen parafrase-herhaling tussen samenvatting, kernstelling, keuze en gevolgen.

Vermijd abstracte en analytische formuleringen.

Gebruik nooit consultancytaal.

------------------------------------------------

8. CONSISTENTE TERMINOLOGIE

Kort dossier en volledig dossier moeten exact dezelfde terminologie gebruiken.
Alle taalregels moeten in de engine worden toegepast, niet alleen in de interface.
Kort dossier, volledig dossier en andere weergaven mogen geen verschillende woordenboeken gebruiken.

------------------------------------------------

9. BESTUURLIJKE WOORDKEUZE

Voorkeurswoorden voor causaliteit en aanbevelingen:

oorzaak
reden
patroon
knelpunt
beslispunt
richting
gevolg
keuze
aandachtspunt
onderbouwing
ontwikkelrichting
belangrijk aangrijpingspunt
waar het verschil gemaakt kan worden

Vermijd woorden die afstandelijk, technisch of consultant-achtig klinken.

------------------------------------------------

10. LENGTE VAN HET RAPPORT

Maximaal 8 pagina's.
Bestuurlijke kernsamenvatting: maximaal 6 regels.
Doorbraakinzichten: exact 5 inzichten.
Bestuurlijk actieplan: maximaal 3 acties.
Scenario's: exact 3.
Bestuurlijke stresstest: exact 3 vragen.

Schrijf compact, bestuurlijk en zonder herhaling.

------------------------------------------------

10A. HOOFDRAPPORT VS BIJLAGE

Het hoofdrapport bevat uitsluitend bestuurlijke selectie.

Verboden in het hoofdrapport:

- "Samenvatting gesprekverslag"
- "ACTION ITEMS"
- "FYI"
- "BLOCKERS"
- ruwe bronverwijzingen per bullet
- lange thematische bronlijsten

Bronmateriaal mag alleen worden samengevat tot bestuurlijke feitenbasis.

------------------------------------------------

11. VASTE VOLGORDE VAN HET RAPPORT

Bestuurlijke kernsamenvatting
Besluitvraag
Kernstelling van het rapport
Feitenbasis
Keuzerichtingen
Aanbevolen keuze
Doorbraakinzichten
Bestuurlijk actieplan
Bestuurlijke stresstest
Bestuurlijke blinde vlekken
Vroegsignalering
Mogelijke ontwikkelingen
Besluitgevolgen
Open strategische vragen

------------------------------------------------

RESULTAAT

Cyntra produceert een volledig Nederlandstalig bestuursdocument
dat leest als een strategisch besluitstuk
voor directie, bestuur en raad van toezicht.

Geen AI-taal.
Geen consultancytaal.
Geen Engelse managementwoorden.
Geen lege secties.
Alleen duidelijke, menselijke en bestuurlijke taal.

------------------------------------------------

12. BOARD QUALITY MODE (MAX)

Doel:
Alle rapporten moeten lezen als een board memo op topconsultancy-niveau.

Hanteer daarom deze extra harde regels:

- Elke kernstelling of elk inzicht mag slechts 1 keer voorkomen.
- Bij semantische gelijkenis > 0.80: herschrijven.
- Vermijd generieke woorden zoals complex, dynamiek, balans, uitdaging, druk, situatie en ontwikkeling, tenzij direct concreet gemaakt.
- Elke zin beschrijft een concreet patroon, mechanisme of bestuursbesluit.
- Maximaal 20 woorden per zin.
- Besliskaart: maximaal 3 regels per onderdeel.
- Inzicht: maximaal 5 regels.
- Actieplan: maximaal 3 interventies.
- Scenario's: maximaal 3 richtingen.
- Open strategische vragen: maximaal 3.

Gebruik in Doorbraakinzichten exact deze logica:

PATROON
Wat is concreet zichtbaar in bron of context.

MECHANISME
Waarom dit gebeurt in contractstructuur, personeelsmodel, instroom of financiering.

BESTUURLIJK GEVOLG
Wat het bestuur nu moet beslissen.

Het eindrapport moet binnen 5 minuten scanbaar zijn voor raad van bestuur en raad van toezicht:

- kernprobleem direct zichtbaar
- keuze direct zichtbaar
- risico direct zichtbaar
- bestuurlijk besluit direct zichtbaar

------------------------------------------------

13. BOARD DOCUMENT MODE — MAX

Doel:
Genereer een bestuursrapport op het niveau van
McKinsey / BCG board memoranda.

Het rapport moet binnen 5 minuten scanbaar zijn
door een Raad van Bestuur.

13.1 DOMINANTE THESE

Het rapport bevat exact één kernstelling.

Deze kernstelling:
- is mechanistisch
- bevat maximaal 25 woorden
- verklaart het strategische probleem

Verboden:
- meerdere theses of varianten

Controle:
if more_than_one_thesis:
  rewrite()

13.2 GEEN GENERIEKE MANAGEMENTTAAL

Verboden woorden:
- balans
- complexiteit
- dynamiek
- uitdaging
- situatie
- ontwikkeling

Elke zin bevat een concreet patroon, oorzaak of bestuursbesluit.

13.3 STRUCTUUR VAN HET RAPPORT

Gebruik exact deze structuur:

1. BESTUURLIJKE BESLISKAART
- kernprobleem
- kernstelling
- aanbevolen keuze
- waarom
- grootste risico bij uitstel
- stopregels

2. BESTUURLIJKE KERNSAMENVATTING
- maximaal 6 regels

3. BESLUITVRAAG
- 1 zin

4. FEITENBASIS
- maximaal 3 feiten

5. DOORBRAAKINZICHTEN
- exact 5 inzichten
- per inzicht exact:
  KERNINZICHT
  MECHANISME
  BESTUURLIJK GEVOLG

6. BESTUURLIJK ACTIEPLAN
- maximaal 3 acties
- per actie exact:
  ACTIE
  MECHANISME
  BESTUURLIJK BESLUIT
  KPI

7. STRATEGISCHE SCENARIO'S
- exact 3 opties

8. BESLUITGEVOLGEN
- operationeel
- financieel
- organisatorisch

9. OPEN VRAGEN
- maximaal 3

13.4 ZINLENGTE

Maximaal 20 woorden per zin.

13.5 HERHALINGSCONTROLE

if semantic_similarity(sentence, previous) > 0.80:
  rewrite()

13.6 BESTUURLIJK NIVEAU

Alle conclusies liggen op bestuursniveau.

Niet:
"teams moeten verbeteren"

Maar:
"bestuur moet contractmix herzien"

13.7 STOPREGELS

Elk rapport bevat minimaal 3 stopregels.

Structuur:
Herzie strategie direct als:
- KPI > drempel
- KPI > drempel
- KPI > drempel

13.8 OUTPUTKWALITEIT

Een bestuurder moet binnen 5 minuten:
- het kernprobleem begrijpen
- de keuze zien
- de risico's begrijpen
- weten wat hij moet besluiten

13.9 STIJL

Schrijf alsof het rapport is opgesteld door
een senior partner van een topstrategieconsultancy.

`.trim();function jl(e){return["SOURCE EXTRACTION PROMPT","ROL","Je bent een analytische bronextractor.","","DOEL","Extraheer uitsluitend informatie uit het bronmateriaal. Maak nog geen analyse, advies of interpretatie.","","INSTRUCTIES","Lees het bronmateriaal en categoriseer informatie in vier groepen:","1. FEITEN — objectieve informatie die expliciet genoemd wordt.","2. SIGNALEN — patronen, trends of spanningen die impliciet zichtbaar zijn.","3. HYPOTHESES — voorlopige verklaringen die mogelijk kloppen maar nog niet bewezen zijn.","4. ACTIEPUNTEN — concrete acties die in het bronmateriaal genoemd worden.","","BELANGRIJKE REGELS","- voeg geen nieuwe informatie toe","- gebruik geen advies","- gebruik geen managementtaal","- schrijf kort en feitelijk","- schrijf nog geen scenario's","- schrijf nog geen aanbevolen keuze","",`Organisatie: ${e.organisation||"onbekend"}`,`Sector: ${e.sector||"onbekend"}`,"","OUTPUTSTRUCTUUR","FEITEN","• …","","SIGNALEN","• …","","HYPOTHESES","• …","","ACTIEPUNTEN","• …","","Broninput:","Niet beschikbaar."].join(`
`)}function xl(e){return["STRATEGIC TENSION PROMPT","ROL","Je bent een strategisch denker.","","DOEL","Identificeer exact één centrale strategische spanning.","","INSTRUCTIES","Analyseer de bronextractie en zoek de belangrijkste strategische spanning waar het bestuur een keuze moet maken.","","REGELS","- formuleer exact één spanning","- geen lijst met meerdere problemen","- geen advies of acties","- geen samenvatting van het gesprek","- exact één spanning in formaat A VS B","",`Dominant risico: ${e.dominantRisk||"onbekend"}`,"Beschikbare richtingen:",...e.decisionOptions?.map(t=>`- ${t}`)||["- Niet beschikbaar"],"","FORMAAT","Strategische spanning:","A","VS","B","","Uitleg","Leg in maximaal drie zinnen uit waarom dit de centrale spanning is."].join(`
`)}function yl(e){return["MECHANISM PROMPT","ROL","Je bent een systeemanalist.","","DOEL","Leg het onderliggende mechanisme achter de strategische spanning uit.","","INSTRUCTIES","Gebruik de strategische spanning en bronextractie om het systeem te verklaren.","Analyseer volgens deze keten:","symptoom -> oorzaak -> systeemdruk -> gevolg","","REGELS","- elke stap moet logisch volgen uit de vorige","- geen generieke formuleringen","- geen advies","- elke conclusie moet een oorzaak-gevolgketen bevatten","",`Dominant risico: ${e.dominantRisk||"onbekend"}`,`Patroonmechanisme: ${e.patternMechanism||"onbekend"}`,"Bronbasis: onbekend","","OUTPUTSTRUCTUUR","SYSTEEMMECHANISME","","SYMPTOOM","…","OORZAAK","…","SYSTEEMDRUK","…","GEVOLG","…"].join(`
`)}function $l(e){return["STRATEGIC FAILURE PROMPT","ROL","Je bent een strategisch criticus.","","DOEL","Test waar de strategie kan falen.","","INSTRUCTIES","Gebruik de strategische spanning en het mechanisme. Genereer minimaal drie strategische breukpunten.","","REGELS","- breekpunten moeten realistisch zijn","- ze moeten voortkomen uit systeemdruk","- vermijd hypothetische fantasie","",`Gekozen richting: ${e.recommendedOption||"onbekend"}`,"Broncontext: onbekend","","FORMAAT","BREUKPUNT 1","","BREUKPUNT","…","WAAROM HET FAALT","…","WAT HET BESTUUR MOET WETEN","…","","BREUKPUNT 2","…","","BREUKPUNT 3","…"].join(`
`)}function _l(e){return["DECISION PROMPT","ROL","Je bent een strategisch adviseur voor een raad van bestuur.","","DOEL","Formuleer één duidelijke strategische keuze.","","INSTRUCTIES","Gebruik strategische spanning, systeemmechanisme en breukpunten.","","REGELS","- kies exact één richting","- geen compromis tenzij expliciet noodzakelijk","- onderbouw waarom de andere opties slechter zijn","",`Dominant risico: ${e.dominantRisk||"onbekend"}`,`Optie A: ${e.optionA||"onbekend"}`,`Optie B: ${e.optionB||"onbekend"}`,`Optie C: ${e.optionC||"optioneel"}`,"","OUTPUTSTRUCTUUR","AANBEVOLEN KEUZE","…","WAAROM DEZE","…","WAAROM NIET B","…","WAAROM NIET C","…"].join(`
`)}function zl(e){return["INTERVENTION PROMPT","ROL","Je bent een implementatiestrateeg.","","DOEL","Vertaal de strategie naar concrete bestuursacties.","","INSTRUCTIES","Genereer minimaal tien interventies.","Elke interventie moet bevatten: actie, eigenaar, termijn, KPI en stopregel.","","REGELS","- geen generieke adviezen","- elke actie moet bestuurbaar zijn","- elke actie moet meetbaar zijn","- geen interventie zonder eigenaar, termijn, KPI en stopregel","",`Gekozen richting: ${e.recommendedOption||"onbekend"}`,`Dominant risico: ${e.dominantRisk||"onbekend"}`,"","FORMAAT","INTERVENTIE 1","","ACTIE","…","EIGENAAR","…","TERMIJN","…","KPI","…","STOPREGEL","…","","INTERVENTIE 2","…","","INTERVENTIE 3","…","","(minimaal 10)"].join(`
`)}function Dl(e){return["EDITORIAL PROMPT","ROL","Je bent hoofdredacteur van een bestuursrapport.","","DOEL","Maak van de analyse een helder en professioneel rapport.","","INSTRUCTIES","Gebruik als input: strategische spanning, systeemmechanisme, breukpunten, keuze en interventies.","","REGELS","- gebruik geen interne labels","- gebruik geen Engelse consultancywoorden","- gebruik geen halve zinnen","- vermijd herhaling","- gebruik exact één dominante these in het hele rapport","- formuleer de dominante these in maximaal 25 woorden","- maximaal één kernidee per alinea","- maximaal 20 woorden per zin","- elke sectie moet zelfstandig begrijpelijk zijn","- elke sectie moet nieuwe informatiewaarde toevoegen","- onderbouw de aanbevolen keuze met 3 tot 5 concrete bronankers","- neem geen ruwe transcriptblokken of bronbullets over in het hoofdrapport","- vervang procesplaceholder-taal door echte bestuurlijke besluiten",'- schrijf "Het bestuur besluit ..." in plaats van "Laat het bestuur besluiten hoe..."',"- vermijd deze woorden tenzij direct concreet gemaakt: balans, complexiteit, dynamiek, uitdaging, situatie, ontwikkeling","- maximale rapportlengte: 8 pagina's","- bestuurlijke samenvatting bevat maximaal 6 regels","- strategisch speelveld bevat exact 3 blokken: zorginhoud, contractlogica, capaciteit","- doorbraakinzichten bevat exact 5 inzichten","- het actieplan bevat maximaal 3 acties","- scenario's bevat exact 3 opties","- bestuurlijke stresstest bevat exact 3 vragen","- elk rapport bevat minimaal 3 stopregels","",`Organisatie: ${e.organisation||"onbekend"}`,`Sector: ${e.sector||"onbekend"}`,"","STRUCTUUR","1. Bestuurlijke besliskaart","2. Bestuurlijke kernsamenvatting","3. Strategisch speelveld","4. Doorbraakinzichten","5. Strategische breukpunten","6. Bestuurlijk actieplan","7. Scenario's","8. Bestuurlijke stresstest"].join(`
`)}function Ll(e){return e?.decisionOptions?.[2]||e?.scenarios?.[2]?.name||"optioneel"}function Bl(e,t){return[{key:"source_extraction",title:"Source Extraction",prompt:jl({organisation:e?.organisation,sector:e?.sector}),requiredSignals:["FEITEN","SIGNALEN","HYPOTHESES","ACTIEPUNTEN"]},{key:"strategic_tension",title:"Strategic Tension",prompt:xl({dominantRisk:e?.dominantRisk,decisionOptions:e?.decisionOptions}),requiredSignals:["Strategische spanning","VS"]},{key:"mechanism",title:"Mechanism",prompt:yl({dominantRisk:e?.dominantRisk,patternMechanism:e?.strategicPattern?.mechanism}),requiredSignals:["SYMPTOOM","OORZAAK","SYSTEEMDRUK","GEVOLG"]},{key:"strategic_failure",title:"Strategic Failure",prompt:$l({recommendedOption:e?.recommendedOption}),requiredSignals:["BREUKPUNT"]},{key:"decision",title:"Decision",prompt:_l({optionA:e?.strategicTension.optionA,optionB:e?.strategicTension.optionB,optionC:Ll(e),dominantRisk:e?.dominantRisk}),requiredSignals:["AANBEVOLEN KEUZE","WAAROM DEZE","WAAROM NIET B","WAAROM NIET C"]},{key:"intervention",title:"Intervention",prompt:zl({recommendedOption:e?.recommendedOption,dominantRisk:e?.dominantRisk}),requiredSignals:["ACTIE","EIGENAAR","TERMIJN","KPI","STOPREGEL"]},{key:"editorial",title:"Editorial",prompt:Dl({organisation:e?.organisation,sector:e?.sector}),requiredSignals:["geen prompt labels","geen halve zinnen","geen Engels"]}]}function Gl(e,t){return["PROMPTSTACK DISCIPLINE",...Bl(e).flatMap((i,r)=>[`${r+1}. ${i.title}`,i.prompt,""])].join(`
`)}const ia=/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+[.,]?\d*\b)/gi,Ml=/(\/|\*|\+|\-|x\s*\d|per\s+(?:cliënt|client|fte|maand|jaar)|maximale schaal|implicatie|doorrekening|berekening)/i;function yt(e){return String(e??"").replace(/\r\n?/g,`
`).trim()}function Vn(e){return[...new Set(e.map(t=>t.trim()).filter(Boolean))]}function Pl(e,t){return t.reduce((n,i)=>n+(e.match(i)?.length??0),0)}function Ii(e,t){const n=new RegExp(`OPTIE\\s*${t}[\\s\\S]*?(?=OPTIE\\s*[ABC]\\b|$)`,"i");return e.match(n)?.[0]??""}function Ul(e){const t=[],n=yt(e.sourceContext),i=yt(e.contextEngineOutput),r=yt(e.diagnosisOutput),a=yt(e.strategicInsightsOutput),o=yt(e.orgDynamicsOutput),s=yt(e.hypothesisOutput),c=yt(e.interventionOutput),l=[i,r,a,o].join(`

`);let u=0;const g=a.match(/STRATEGISCH\s+INZICHT[\s\S]*?(?=STRATEGISCH\s+INZICHT|$)/gi)??[],m=Vn(g.map(ne=>(ne.match(/STRATEGISCH\s+INZICHT\s*[:\-]?\s*([^\n]+)/i)?.[1]??"").trim()).filter(Boolean)),p=(a.match(/\bLOGICA\b/gi)??[]).length,I=(a.match(/\b(?:BESTUURLIJKE\s+IMPLICATIE|STRATEGISCHE\s+IMPLICATIE)\b/gi)??[]).length;m.length>=3&&p>=3&&I>=3?u=30:(u=Math.min(30,m.length*7+Math.min(p,3)*3),t.push("Minimaal 3 unieke strategische inzichten met logica en bestuurlijke implicatie ontbreken."));let T=0;const b=(n.match(ia)??[]).length>0,h=(l.match(ia)??[]).length,d=Ml.test(l);b?h>=3&&d?T=20:(T=Math.min(20,h>=1?8:0),t.push("Cijfers aanwezig zonder voldoende numerieke interpretatie of berekeningslogica.")):T=20;let x=0;const N=Pl(l.toLowerCase(),[/\banalyse\b/g,/\bmechanisme\b/g,/\bgevolg\b/g,/\bbestuurlijke implicatie\b/g,/->/g,/\boorzaak\b/g]);N>=8?x=20:(x=Math.min(20,N*2),t.push("Causale redenering (analyse -> mechanisme -> gevolg -> bestuurlijke implicatie) is onvoldoende."));let j=0;const $=Ii(s,"A"),q=Ii(s,"B"),le=Ii(s,"C"),y=[$,q,le].filter(Boolean).filter(ne=>/\bVOORDEEL\b/i.test(ne)&&/\bRISICO\b/i.test(ne)&&/\bLANGE\s+TERMIJN\s+EFFECT\b/i.test(ne)).length;y>=3?j=10:(j=Math.min(10,y*3),t.push("Strategische opties A/B/C met voordeel, risico en lange termijn effect zijn onvolledig."));let X=0;const _=(c.match(/\b(?:ACTIE|INTERVENTIE)\b\s*:?/gi)??[]).length,de=(c.match(/\bEIGENAAR\b\s*:?/gi)??[]).length,H=(c.match(/\b(?:KPI|MEETBARE\s+KPI)\b\s*:?/gi)??[]).length,ie=(c.match(/\bDEADLINE\b\s*:?/gi)??[]).length,z=(c.match(/\bPROBLEEM\s+DAT\s+WORDT\s+OPGELOST\b\s*:?/gi)??[]).length,ve=(c.match(/\bGEVOLG\s+VOOR\s+ORGANISATIE\b\s*:?/gi)??[]).length,Ie=(c.match(/\bGEVOLG\s+VOOR\s+(?:KLANT\s*\/\s*CLI[ËE]NT|CLI[ËE]NT|KLANT)\b\s*:?/gi)??[]).length,te=_>=6&&de>=6&&H>=6&&ie>=6&&z>=6,K=ve>=6&&Ie>=6;if(te&&K)X=20;else{const ne=Math.min(_,6)+Math.min(de,6)+Math.min(H,6)+Math.min(ie,6);X=Math.min(20,Math.round(ne/24*12+Math.min(ve,Ie,6))),t.push("Interventieprogramma mist vereiste diepgang (minimaal 6 interventies met eigenaar, KPI, deadline en impactanalyse).")}const B=Math.max(0,Math.min(100,u+x+T+X+j));return m.length<3||b&&!(h>=3&&d)||y<3||!te||!K?{pass:!1,strategicDepthScore:B,breakdown:{strategicInsights:u,causalLogic:x,numericAnalysis:T,interventionQuality:X,strategicOptions:j},reasons:Vn(t),message:"Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang."}:B<70?{pass:!1,strategicDepthScore:B,breakdown:{strategicInsights:u,causalLogic:x,numericAnalysis:T,interventionQuality:X,strategicOptions:j},reasons:Vn(t),message:"Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang."}:{pass:!0,strategicDepthScore:B,breakdown:{strategicInsights:u,causalLogic:x,numericAnalysis:T,interventionQuality:X,strategicOptions:j},reasons:Vn(t)}}function Hl(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

ORGANISATIEDYNAMIEK:
${e.orgDynamicsEngineOutput||"Niet beschikbaar; leid dynamiek af uit primaire broncontext."}

INSTRUCTIE:
Analyseer boardroom-intelligentie op macht, belangen, besluitdynamiek, informele structuren,
verborgen conflicten en leiderschapsdynamiek.

OUTPUT (EXACTE KOPPEN):
MACHTSSTRUCTUUR
WIE HEEFT BESLUITMACHT
WIE HEEFT INFORMELE INVLOED
WAAR ZIT DE FEITELIJKE MACHT
BELANGENSPANNING
WELKE BELANGEN BOTSTEN
WAT STAAT ER VOOR ELKE PARTIJ OP HET SPEL
BESLUITDYNAMIEK
GEDRAGSPATROON
STRATEGISCHE CONSEQUENTIE
VERBORGEN SPANNING
WAAROM DIT NIET WORDT UITGESPROKEN
WAT HET RISICO IS
LEIDERSCHAPSDYNAMIEK
WELKE BESLISSINGEN BIJ WIE LIGGEN
WAAR MANDATEN ONDUIDELIJK ZIJN

Minimaal 3 keer herhalen in exact format:
BOARDROOM INZICHT
WAAROM DIT BESTUURLIJK BELANGRIJK IS
RISICO ALS DIT NIET WORDT GEADRESSEERD
`.trim()}function Kl(e){const t=String(e??""),n=(t.match(/\bBOARDROOM\s+INZICHT\b/gi)??[]).length,i=(t.match(/\bWAAROM\s+DIT\s+BESTUURLIJK\s+BELANGRIJK\s+IS\b/gi)??[]).length,r=(t.match(/\bRISICO\s+ALS\s+DIT\s+NIET\s+WORDT\s+GEADRESSEERD\b/gi)??[]).length;return n>=3&&i>=3&&r>=3}function Vl(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGISCHE INZICHTEN:
${e.strategicInsightsOutput||"Niet beschikbaar; leid inzichten af uit primaire broncontext."}

STRATEGISCHE HYPOTHESEN:
${e.hypothesisOutput||"Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

INSTRUCTIE:
Leid minimaal drie strategische scenario's direct af uit de broninput, de strategische opties en de organisatiepositionering.
Gebruik broninput als hoogste autoriteit: input > sectorlogica > generieke template.
Geef per scenario eerst een specifieke scenarionaam die past bij deze organisatiecontext.
Verboden scenarionamen tenzij letterlijk onderbouwd in de input:
- status quo
- hybride
- volumegroei
- groei zonder context
- netwerkreplicatie zonder bronanker

Gebruik exact:
SCENARIO A — [specifieke brongebonden naam]
SCENARIO B — [specifieke brongebonden naam]
SCENARIO C — [specifieke brongebonden naam]

Gebruik voor ELK scenario exact:
SCENARIO
STRATEGISCHE LOGICA
FINANCIËLE CONSEQUENTIES
ORGANISATORISCHE CONSEQUENTIES
RISICO'S
LANGE TERMIJN EFFECT

Wanneer cijfers aanwezig zijn:
- bereken implicaties (maximale schaal, marge-impact, capaciteitsbehoefte)
- gebruik expliciet rekenlogica per scenario

Voeg daarna exact toe:
### SCENARIOVERGELIJKING
Per scenario: voordelen, nadelen, risiconiveau, strategische robuustheid.

Voeg daarna exact toe:
VOORKEURSSCENARIO
WAAROM DIT HET MEEST ROBUUST IS
WELKE VOORWAARDEN NODIG ZIJN
`.trim()}function Fl(e){const t=String(e??""),n=/SCENARIO\s*A\b/i.test(t),i=/SCENARIO\s*B\b/i.test(t),r=/SCENARIO\s*C\b/i.test(t),o=(t.match(/SCENARIO\s*[ABC][\s\S]*?(?=SCENARIO\s*[ABC]|###\s*SCENARIOVERGELIJKING|$)/gi)??[]).filter(l=>/STRATEGISCHE\s+LOGICA/i.test(l)&&/FINANCI[ËE]LE\s+CONSEQUENTIES/i.test(l)&&/ORGANISATORISCHE\s+CONSEQUENTIES/i.test(l)&&/RISICO'?S/i.test(l)&&/LANGE\s+TERMIJN\s+EFFECT/i.test(l)).length,s=/###\s*SCENARIOVERGELIJKING/i.test(t),c=/VOORKEURSSCENARIO/i.test(t)&&/WAAROM\s+DIT\s+HET\s+MEEST\s+ROBUUST\s+IS/i.test(t)&&/WELKE\s+VOORWAARDEN\s+NODIG\s+ZIJN/i.test(t);return n&&i&&r&&o>=3&&s&&c}function Wl(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; werk met primaire broncontext."}

STRATEGISCHE INZICHTEN:
${e.strategicInsightsOutput||"Niet beschikbaar; werk met primaire broncontext."}

SCENARIO-ANALYSE:
${e.scenarioSimulationOutput||"Niet beschikbaar; werk met primaire broncontext."}

INTERVENTIEPROGRAMMA:
${e.interventionOutput||"Niet beschikbaar; werk met primaire broncontext."}

BOARDROOM-INTELLIGENTIE:
${e.boardroomIntelligenceOutput||"Niet beschikbaar; werk met primaire broncontext."}

INSTRUCTIE:
Beoordeel de kwaliteit van het bestuursbesluit als kritische boardroom-tegenkracht.
Controleer:
1) Strategische consistentie tussen these, inzichten, scenarioanalyse en interventies.
2) Besluitrisico's (complexiteit, externe afhankelijkheid, overbelasting, financiele kwetsbaarheid).
3) Uitvoerbaarheid binnen capaciteit, leiderschap, governance en cultuur.
4) Of een alternatief scenario mogelijk sterker is.

OUTPUT (EXACTE KOPPEN):
STRATEGISCHE CONSISTENTIE
BESLUITSRISICO
WAAROM DIT RISICO BESTAAT
HOE HET ZICH KAN MANIFESTEREN
UITVOERBAARHEID
WELKE VOORWAARDEN NODIG ZIJN
WAAR DE GROOTSTE IMPLEMENTATIERISICO'S ZITTEN
ALTERNATIEVE STRATEGIE
WAAROM DIT SCENARIO STERKER KAN ZIJN

SCORES (EXACT):
STRATEGISCHE CONSISTENTIE SCORE: <0-30>
RISICOANALYSE SCORE: <0-20>
UITVOERBAARHEID SCORE: <0-30>
ROBUUSTHEID SCENARIO SCORE: <0-20>
DECISIONQUALITYSCORE: <0-100>

FLAGS (EXACT):
INTERVENTIES INCONSISTENT: <JA/NEE>
SCENARIOANALYSE ONTBREEKT: <JA/NEE>
`.trim()}function Jl(e,t){const n=Number.parseInt(String(e??"").trim(),10);return Number.isFinite(n)?Math.max(0,Math.min(t,n)):0}function vn(e,t,n){const i=e.match(new RegExp(`${t}\\s*:\\s*(\\d{1,3})`,"i"));return Jl(i?.[1]??"0",n)}function Zl(e){const t=String(e??""),n=vn(t,"STRATEGISCHE CONSISTENTIE SCORE",30),i=vn(t,"RISICOANALYSE SCORE",20),r=vn(t,"UITVOERBAARHEID SCORE",30),a=vn(t,"ROBUUSTHEID SCENARIO SCORE",20),o=vn(t,"DECISIONQUALITYSCORE",100),s=n+i+r+a,c=o>0?o:Math.max(0,Math.min(100,s)),l=/INTERVENTIES\s+INCONSISTENT\s*:\s*JA/i.test(t),u=/SCENARIOANALYSE\s+ONTBREEKT\s*:\s*JA/i.test(t);return{decisionQualityScore:c,strategicConsistencyScore:n,riskAnalysisScore:i,feasibilityScore:r,scenarioRobustnessScore:a,inconsistentInterventions:l,scenarioMissing:u}}const Bo="strategic_case_embeddings",ut=[];function Go(){try{return typeof globalThis>"u"?null:globalThis.localStorage??null}catch{return null}}function Ti(){const e=Go();if(!e)return[...ut];try{const t=e.getItem(Bo);if(!t)return[...ut];const n=JSON.parse(t);return Array.isArray(n)?(ut.splice(0,ut.length,...n),[...ut]):[...ut]}catch{return[...ut]}}function Yl(e){ut.splice(0,ut.length,...e);const t=Go();if(t)try{t.setItem(Bo,JSON.stringify(e))}catch{}}function ra(e){return String(e??"").toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu," ").split(/\s+/).filter(Boolean)}function aa(e,t=128){const n=new Array(t).fill(0);for(const i of e){let r=2166136261;for(let o=0;o<i.length;o+=1)r^=i.charCodeAt(o),r=Math.imul(r,16777619);const a=Math.abs(r)%t;n[a]+=1}return n}function ql(e,t){if(!e.length||!t.length||e.length!==t.length)return 0;let n=0,i=0,r=0;for(let a=0;a<e.length;a+=1)n+=e[a]*t[a],i+=e[a]*e[a],r+=t[a]*t[a];return i===0||r===0?0:n/(Math.sqrt(i)*Math.sqrt(r))}class Mo{buildCaseEmbedding(t){const n=[t.sector,t.keyProblem,t.dominantThesis,t.strategicInsights.join(" "),t.chosenStrategy].filter(Boolean).join(" "),i=aa(ra(n));return{caseId:t.caseId,embedding:i,sourceText:n}}indexCase(t){const n=this.buildCaseEmbedding(t),i=Ti(),r=i.findIndex(a=>a.caseId===n.caseId);return r>=0?i[r]=n:i.push(n),Yl(i),n}listIndexedCases(){return Ti()}querySimilar(t,n=5){const i=aa(ra(t));return Ti().map(r=>({caseId:r.caseId,score:ql(i,r.embedding)})).sort((r,a)=>a.score-r.score).slice(0,Math.max(0,n))}}const oa="strategic_cases",sa="strategic_interventions",ca="strategic_pattern_memory",$t=[],_t=[],zt=[];function Po(){try{return typeof globalThis>"u"?null:globalThis.localStorage??null}catch{return null}}function Ni(e,t){const n=Po();if(!n)return t;try{const i=n.getItem(e);if(!i)return t;const r=JSON.parse(i);return Array.isArray(r)?r:t}catch{return t}}function Ri(e,t){const n=Po();if(n)try{n.setItem(e,JSON.stringify(t))}catch{}}let Uo=class{addCase(t){const n=this.listCases(),i=n.findIndex(r=>r.caseId===t.caseId);i>=0?n[i]=t:n.push(t),$t.splice(0,$t.length,...n),Ri(oa,n)}listCases(){const t=Ni(oa,$t);return!t.length&&$t.length?[...$t]:($t.splice(0,$t.length,...t),[...t])}addIntervention(t){const n=this.listInterventions(),i=n.findIndex(r=>r.interventionId===t.interventionId);i>=0?n[i]=t:n.push(t),_t.splice(0,_t.length,...n),Ri(sa,n)}listInterventions(){const t=Ni(sa,_t);return!t.length&&_t.length?[..._t]:(_t.splice(0,_t.length,...t),[...t])}upsertStrategicPattern(t){const n=this.listStrategicPatterns(),i=n.findIndex(r=>r.memoryId===t.memoryId);i>=0?n[i]=t:n.push(t),zt.splice(0,zt.length,...n),Ri(ca,n)}listStrategicPatterns(){const t=Ni(ca,zt);return!t.length&&zt.length?[...zt]:(zt.splice(0,zt.length,...t),[...t])}};class Ql{constructor(t=new Uo,n=new Mo){this.store=t,this.indexer=n}retrieveSimilarCases(t){const n=[t.sector,t.problemType,t.strategicInsights.join(" ")].filter(Boolean).join(" ").trim();if(!n)return[];const i=this.indexer.querySimilar(n,t.topK??5);if(!i.length)return[];const r=new Map(this.store.listCases().map(a=>[a.caseId,a]));return i.map(a=>{const o=r.get(a.caseId);return o?{caseRecord:o,similarityScore:a.score}:null}).filter(a=>a!==null)}}function Dt(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function Xl(...e){for(const t of e)if(t&&t.trim())return t.trim();return""}function ed(e,t=4){return(String(e??"").match(/\bPATTERN NAAM\b/gi)??[]).length>=t}function td(e){const t=[e.caseContextBlock,e.contextEngineOutput,e.memoryContextBlock,e.diagnosisOutput].filter(Boolean).join(`

`).toLowerCase(),n=[],i=Dt(t,["contract","plafond","verzekeraar","tarief"]);n.push({patternName:"BOTTLENECK ANALYSIS",observation:i?"Contractruimte en plafondlogica begrenzen schaal direct.":"Capaciteit en besluittempo zijn de vermoedelijke primaire bottleneck.",strategicImplication:"Groei moet starten met expliciete bottleneck-oplossing; anders ontstaat versnelling van verlies."});const r=Dt(t,["marge","kostprijs","loonkosten","verlies","omzet"]);n.push({patternName:"ECONOMIC ENGINE",observation:r?"Economisch mechanisme staat onder druk door kostenstijging en beperkte pricing power.":"Verdienmodel is onvoldoende hard gemaakt in prijs-, volume- en capaciteitsdrivers.",strategicImplication:"Besluitvorming moet draaien op driver-based economics in plaats van activiteitengroei."}),n.push({patternName:"INCENTIVE STRUCTURE",observation:Dt(t,["productiviteit","norm","autonomie","kwaliteit"])?"Productie- en kwaliteitsprikkels wijzen niet vanzelf in dezelfde richting.":"Prikkels zijn impliciet en daardoor gedragstechnisch inconsistent.",strategicImplication:"Zonder expliciete prikkelarchitectuur ontstaat stille weerstand in uitvoering."}),n.push({patternName:"SYSTEM DYNAMICS",observation:Dt(t,["groei","complexiteit","uitstel","werkdruk"])?"Feedbackloop: uitstel verhoogt complexiteit, complexiteit verlaagt executiekracht.":"Feedbackloop: onduidelijke prioritering leidt tot vertraging en bestuurlijke ruis.",strategicImplication:"Interventies moeten eerst versterkende negatieve loops dempen voordat uitbreiding zinvol is."});const a=Xl(Dt(t,["mandaat","besluit","macht","informele"])?"Formele besluitmacht en informele invloed lopen niet volledig parallel.":"","Besluitmacht is verspreid over formele rollen en informele routines.");n.push({patternName:"POWER STRUCTURE",observation:a,strategicImplication:"Zonder expliciete herverdeling van besluitrechten blijven stopkeuzes niet afdwingbaar."}),n.push({patternName:"STRATEGIC TRADE-OFF",observation:Dt(t,["groei","stabiliteit","kwaliteit","controle"])?"Er is een onvermijdelijke keuze tussen tempo van verbreding en kernstabilisatie.":"De strategie bevat impliciete trade-offs die nu nog niet expliciet geprijsd zijn.",strategicImplication:"Het bestuur moet expliciet benoemen wat tijdelijk wordt verloren om richting uitvoerbaar te maken."}),n.push({patternName:"CAPABILITY GAP",observation:Dt(t,["leiderschap","capacity","capaciteit","governance","ritme"])?"Uitvoeringscapaciteit en governance-ritme zijn beperkende capability-factors.":"De benodigde capabilities voor de gekozen strategie zijn nog niet volledig ingericht.",strategicImplication:"Zonder capability-upgrade wordt een goede strategie een slechte executie."});const o=n.slice(0,7),s=o.map(c=>`PATTERN NAAM: ${c.patternName}
OBSERVATIE: ${c.observation}
STRATEGISCHE IMPLICATIE: ${c.strategicImplication}`).join(`

`);return{appliedPatterns:o,output:s}}function nd(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function id(e){const t=[e.contextText,e.memoryText,e.graphText].filter(Boolean).join(`

`),n=[];n.push({id:"H1",hypothesis:"Financiele begrenzing is de primaire oorzaak van het strategische probleem.",explanation:"Tariefdruk, contractplafonds of kostprijsdruk limiteren de strategische ruimte sterker dan operationele intentie.",mechanism:"Externe prijs- en contractbeperkingen drukken marge, waardoor capaciteit en groeiruimte direct krimpen."}),n.push({id:"H2",hypothesis:"Bestuurlijke en organisatorische uitvoeringsfrictie is de primaire oorzaak.",explanation:"Besluitdynamiek, onduidelijke mandaten en conflictvermijding verlagen executiekracht van een op papier juiste strategie.",mechanism:"Besluituitstel en verspreid eigenaarschap veroorzaken structurele vertraging en inconsistent gedrag."}),n.push({id:"H3",hypothesis:"Strategische scope en prioritering zijn onvoldoende geordend.",explanation:"Te veel parallelle initiatieven zonder expliciete stopregels veroorzaken versnippering en verlies aan focus.",mechanism:"Capaciteit wordt verdeeld over concurrerende agenda's, waardoor kernactiviteiten en resultaatdiscipline verzwakken."}),nd(t,["markt","verwijzer","instroom","vraag","concurrent"])&&n.push({id:"H4",hypothesis:"Markt- en instroomdynamiek versterkt de interne kwetsbaarheid.",explanation:"Externe vraagverschuivingen en kanaalafhankelijkheid vergroten de druk op een al fragiele operationele basis.",mechanism:"Volatiliteit in instroom en verwijzingen maakt planning instabiel en verhoogt de foutmarge in capaciteitssturing."});const i=Math.max(3,e.minHypotheses);return n.slice(0,Math.max(i,3))}const rd={H1:["contract","plafond","tarief","marge","kostprijs","loonkosten","verlies"],H2:["mandaat","besluit","weerstand","conflict","governance","uitstel","onderstroom"],H3:["prioriteit","parallel","initiatief","scope","focus","versnippering","stopregel"],H4:["markt","instroom","verwijzer","concurrent","vraag","kanaal"]};function Ho(e){return String(e??"").split(/[\n.!?]+/).map(t=>t.trim()).filter(Boolean)}function ad(e,t){return Ho(e).filter(r=>t.some(a=>r.toLowerCase().includes(a.toLowerCase()))).slice(0,4)}function od(e,t){return Ho(e).filter(r=>/(geen|ontbreekt|niet|onduidelijk|beperkt|laag|zwak)/i.test(r)&&t.some(a=>r.toLowerCase().includes(a.toLowerCase()))).slice(0,3)}function sd(e){const t=String(e.contextText??""),n=String(e.memoryText??""),i=String(e.graphText??""),r=`${t}
${n}
${i}`;return e.hypotheses.map(a=>{const o=rd[a.id]??a.hypothesis.toLowerCase().split(/\s+/).slice(0,6),s=ad(r,o),c=od(r,o),l=Math.min(1,s.length/4),u=Math.min(1,c.length/3);return{...a,evidenceFor:s,evidenceAgainst:c,supportScore:l,contradictionScore:u}})}function cd(e){return Math.max(0,Math.min(1,e))}function la(e,t){return e.length?e.join(" | "):t}function ld(e){const t=e.map(r=>{const a=r.supportScore*.7+(1-r.contradictionScore)*.3;return{...r,plausibility:Number(cd(a).toFixed(2))}}).sort((r,a)=>a.plausibility-r.plausibility),n=t[0]??null,i=[];return t.slice(0,3).forEach((r,a)=>{i.push(`HYPOTHESE ${a+1}: ${r.hypothesis}`),i.push(`WAT DE VERKLARING IS: ${r.explanation}`),i.push(`WELK MECHANISME HIERACHTER ZIT: ${r.mechanism}`),i.push(`BEWIJS VOOR: ${la(r.evidenceFor,"Beperkt direct bewijs; hypothese blijft voorlopig op first-principles.")}`),i.push(`BEWIJS TEGEN: ${la(r.evidenceAgainst,"Geen sterk weerleggend bewijs gevonden in huidige context.")}`),i.push(`PLAUSIBILITEIT: ${r.plausibility.toFixed(2)}`),i.push("")}),i.push(`WAARSCHIJNLIJKSTE VERKLARING: ${n?.hypothesis??"Nog geen dominante verklaring vastgesteld; aanvullende verificatie vereist."}`),i.push(`DOMINANTE PLAUSIBILITEIT: ${(n?.plausibility??0).toFixed(2)}`),{evaluated:t,dominant:n,block:i.join(`
`).trim()}}function Ai(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function dd(e){const t=[e.contextText,e.hypothesisText,e.memoryText,e.graphText].filter(Boolean).join(`

`),n=[];return n.push({symptom:Ai(t,["marge","verlies","tarief","kostprijs"])?"Aanhoudende margedruk en verlies op kernactiviteiten.":"Financiele spanning zonder stabiel herstelpad.",mechanism:"Kostenstijging en tariefbeperking lopen uit elkaar waardoor elke extra productie minder marge oplevert.",structuralCause:"Verdienmodel is contract- en prijsafhankelijk zonder voldoende sturingsruimte op onderliggende kostenmix.",breakingIntervention:"Herijk prijs-volume-capaciteit met contractvloer, kostprijsdiscipline en stopregel voor verlieslatende varianten."}),n.push({symptom:Ai(t,["uitstel","mandaat","conflict","onderstroom"])?"Besluituitstel en inconsistente executie tussen teams.":"Lage executiesnelheid ondanks duidelijke strategische intentie.",mechanism:"Formele besluitlijnen en informele invloed lopen niet parallel, waardoor keuzes in uitvoering worden afgezwakt.",structuralCause:"Governance- en mandaatstructuur borgt onvoldoende eigenaarschap, ritme en escalatiediscipline.",breakingIntervention:"Instellen van bindende prioriteringstafel met vaste escalatietermijnen, expliciet eigenaarschap en afdwingbare stop-doing keuzes."}),n.push({symptom:Ai(t,["werkdruk","productiviteit","uitval","capaciteit"])?"Capaciteitsdruk, normspanning en verhoogd risico op uitval.":"Instabiele capaciteit en voorspelbaarheid in levering.",mechanism:"Productienormdruk zonder adaptieve buffer vergroot belasting en verlaagt duurzame inzetbaarheid.",structuralCause:"Systeem stuurt op outputmeting, maar beperkt op stuurinformatie over casemix, no-show en herstelcapaciteit.",breakingIntervention:"Inbouwen van kwaliteitsbuffer in norm, weekritme op capaciteitsindicatoren en vroege correctie op overbelasting."}),{items:n.slice(0,3)}}function ud(e){const t=(e.items??[]).map(i=>({symptom:i.symptom,mechanism:i.mechanism,structuralCause:i.structuralCause,intervention:i.breakingIntervention})),n=[];return n.push("SYMPTOMEN"),n.push(t.map((i,r)=>`${r+1}. ${i.symptom}`).join(" | ")),n.push("WELK MECHANISME HIERACHTER ZIT"),n.push(t.map((i,r)=>`${r+1}. ${i.mechanism}`).join(" | ")),n.push("STRUCTURELE OORZAAK"),n.push(t.map((i,r)=>`${r+1}. ${i.structuralCause}`).join(" | ")),n.push("WELKE INTERVENTIE HET MECHANISME DOORBREKT"),n.push(t.map((i,r)=>`${r+1}. ${i.intervention}`).join(" | ")),{chains:t,block:n.join(`
`)}}const gd={kostenstijging:["kosten","loonkosten","inflatie","kostprijs"],tariefdruk:["tarief","prijs","vergoeding","contract"],productiviteitsnorm:["productiviteit","norm","uren","output"],personeelsbelasting:["werkdruk","uitval","belasting","verzuim","capaciteit"]};function md(e,t){const n=e.toLowerCase();return t.reduce((r,a)=>{const o=new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"gi");return r+((n.match(o)??[]).length>0?1:0)},0)}function pd(e){const t=String(e.contextText??""),n=Object.entries(gd).map(([a,o])=>({variable:a,score:md(t,o)})).sort((a,o)=>o.score-a.score),i=n[0]?.variable??"onbekend",r=`Dominante systeemvariabele: ${i}. Variabelen beïnvloeden elkaar via kosten, tarieven, productiviteitsdruk en personeelsbelasting.`;return{dominantVariable:i,variables:n,summary:r}}function da(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function bd(e){const t=[e.contextText,e.causalText,e.hypothesisText].filter(Boolean).join(`

`),n=da(t,["marge","kostprijs","tarief","contract","plafond","verlies"]),i=da(t,["mandaat","uitstel","onderstroom","governance","conflict","capaciteit"]),r={code:"A",name:"Consolidatie kernactiviteiten",strategicDirection:"Focus op stabilisatie van kernzorg, margeherstel en executiediscipline.",solvesProblem:"Vermindert directe financiële druk en herstelt bestuurlijke voorspelbaarheid.",createsRisks:"Vertraagt korte-termijngroei en beperkt ruimte voor nieuwe initiatieven."},a={code:"B",name:"Verbreding nieuwe diensten",strategicDirection:"Versneld ontwikkelen van aanvullende diensten voor extra omzet en risicospreiding.",solvesProblem:"Vergroot strategische optionaliteit en vermindert afhankelijkheid van één inkomstenstroom.",createsRisks:"Verhoogt managementbelasting, complexiteit en liquiditeitsdruk bij zwakke basis."},o={code:"C",name:"Kostenreductie en herstructurering",strategicDirection:"Herontwerp van kostenbasis, capaciteit en governance met harde prioritering.",solvesProblem:"Doorbreekt structurele inefficiëntie en verlaagt financiële kwetsbaarheid.",createsRisks:"Kan cultuurspanning en tijdelijke kwaliteitsdruk veroorzaken bij te harde implementatie."};return n&&!i?[r,o,a]:i&&!n?[o,r,a]:[r,a,o]}function hd(e){return e.map(t=>t.code==="A"?{option:t,advantages:"Verhoogt financiële stabiliteit en uitvoerbaarheid van kernprocessen.",disadvantages:"Beperkt commerciële expansie op korte termijn.",risks:"Verlies van momentum buiten de kern en interne frustratie over groeirem.",impactOrganisation:"Meer focus, duidelijkere prioriteiten, lagere coördinatiedruk.",impactCustomers:"Betere continuïteit in kernzorg, maar trager nieuw aanbod.",impactFinancials:"Sneller margeherstel en lagere volatiliteit in cashflow.",explicitGiveUp:"Tijdelijke opgave van parallelle verbredingsambities.",initiativesStopped:"Nieuwe niet-kerninitiatieven zonder margevalidatie worden gestopt.",growthDeferred:"Verbredingsgroei wordt uitgesteld tot na stabilisatiefase."}:t.code==="B"?{option:t,advantages:"Vergroot omzetpotentieel en strategische spreiding.",disadvantages:"Verhoogt complexiteit en vraagt extra managementcapaciteit.",risks:"Snellere margeslijtage en liquiditeitsstress bij onvoldoende basisdiscipline.",impactOrganisation:"Meer veranderdruk en kans op versnipperde aandacht.",impactCustomers:"Meer aanbodopties, maar risico op minder stabiele kerncontinuïteit.",impactFinancials:"Hoger opwaarts potentieel met groter neerwaarts risico.",explicitGiveUp:"Opgeven van tijdelijke rust en focus op kernstabiliteit.",initiativesStopped:"Minder stopzetting; juist doorzetten van verbredingsprojecten.",growthDeferred:"Kernoptimalisatie wordt uitgesteld door prioriteit op uitbreiding."}:{option:t,advantages:"Creëert snelle kostencontrole en dwingt scherpere allocatie af.",disadvantages:"Kan draagvlak en cultuur onder druk zetten.",risks:"Kwaliteitsverlies of uitval bij te agressieve ingrepen.",impactOrganisation:"Hoge veranderintensiteit met duidelijke besluitdiscipline.",impactCustomers:"Mogelijke tijdelijke frictie in dienstverlening tijdens transitie.",impactFinancials:"Directe kostenverlaging met transitiekosten op korte termijn.",explicitGiveUp:"Opgeven van comfort in bestaande werkwijzen en routines.",initiativesStopped:"Niet-kritieke projecten en dubbele structuren worden afgebouwd.",growthDeferred:"Groei die extra overhead vraagt wordt uitgesteld."})}function Ed(e,t){const n=t.toLowerCase(),i=/(marge|tarief|kostprijs|contract|plafond|verlies|liquiditeit)/i.test(n)?2:0,r=/(mandaat|uitstel|governance|onderstroom|capaciteit|werkdruk)/i.test(n)?2:0,a=/(groei|verbreding|nieuwe diensten|expansie)/i.test(n)?1:0;return e==="A"?3+i+Math.max(0,r-1):e==="B"?1+a-i:2+r+Math.max(0,i-1)}function fd(e){const t=[e.causalText,e.hypothesisText,e.memoryText,e.graphText].filter(Boolean).join(`

`),i=e.tradeoffs.map(l=>({tradeoff:l,score:Ed(l.option.code,t)})).sort((l,u)=>u.score-l.score)[0]?.tradeoff??e.tradeoffs[0],r=i.option.code,a=e.tradeoffs.map(l=>[`OPTIE ${l.option.code}`,`BESCHRIJVING: ${l.option.strategicDirection}`,`VOORDELEN: ${l.advantages}`,`NADelen: ${l.disadvantages}`,`RISICO’S: ${l.risks}`,`IMPACT OP ORGANISATIE: ${l.impactOrganisation}`,`IMPACT OP KLANTEN: ${l.impactCustomers}`,`IMPACT OP FINANCIËN: ${l.impactFinancials}`].join(`
`)).join(`

`),o=r==="A"?"Deze optie past het best bij hoge financiële en uitvoeringsdruk en herstelt bestuurlijke voorspelbaarheid.":r==="C"?"Deze optie past het best bij dominante uitvoeringsfrictie en noodzaak tot harde herallocatie.":"Deze optie past bij lagere basisdruk en hogere strategische ruimte voor gecontroleerde expansie.",s=["GEVOLGEN VAN GEEN KEUZE","30 DAGEN: besluituitstel houdt parallelle agenda's in stand en vergroot coördinatieverlies.","90 DAGEN: margedruk en capaciteitsfrictie worden structureel zichtbaar in planning en uitvoering.","365 DAGEN: strategische bewegingsruimte krimpt, correctiekosten stijgen en noodmaatregelen worden waarschijnlijker."].join(`
`),c=["STRATEGISCHE OPTIES",a,"","VOORKEURSOPTIE",`BESCHRIJVING: OPTIE ${i.option.code} — ${i.option.name}.`,`WAAROM DEZE KEUZE LOGISCH IS: ${o}`,`WELK PROBLEEM HIERMEE WORDT OPGELOST: ${i.option.solvesProblem}`,`WELKE CONSEQUENTIES DIT HEEFT: ${i.disadvantages} ${i.risks}`,"","EXPLICIET VERLIES",`WAT WORDT OPGEEVEN: ${i.explicitGiveUp}`,`WELKE INITIATIEVEN STOPPEN: ${i.initiativesStopped}`,`WELKE GROEI WORDT UITGESTELD: ${i.growthDeferred}`,"",s].join(`
`);return{preferredOptionCode:i.option.code,preferredOptionReason:o,solvedProblem:i.option.solvesProblem,block:c}}function Fn(e,t){return t.some(n=>n.test(e))}function kd(e){const t=[e.contextText,e.hypothesisText,e.causalText].filter(Boolean).join(`

`).toLowerCase(),n=[];return Fn(t,[/\bbevestig/i,/\beigen gelijk\b/i,/\bselectief\b/i])&&n.push({bias:"bevestigingsbias",signal:"Signalen worden selectief geïnterpreteerd om bestaand beleid te bevestigen.",risk:"Tegenbewijs wordt te laat erkend waardoor correctie duurder wordt."}),Fn(t,[/\bstatus quo\b/i,/\bbestaande routine\b/i,/\bzoals altijd\b/i])&&n.push({bias:"status_quo_bias",signal:"Bestaande routines krijgen voorrang boven noodzakelijke herprioritering.",risk:"Structurele problemen worden genormaliseerd in plaats van opgelost."}),Fn(t,[/\bgroei lost\b/i,/\bkomt goed\b/i,/\boptimistisch\b/i])&&n.push({bias:"optimismebias",signal:"Verwachtingen over groei of verbetering zijn sterker dan de onderliggende bewijsbasis.",risk:"Besluiten worden genomen op te gunstige aannames met financieel neerwaarts risico."}),Fn(t,[/\bconflictmijding\b/i,/\bvermijd/i,/\buitstel\b/i,/\bconsensusdruk\b/i])&&n.push({bias:"conflictvermijding",signal:"Spanning wordt uitgesteld in plaats van bestuurlijk geadresseerd.",risk:"Besluitvertraging stapelt zich op en tast executiekracht aan."}),n.length||n.push({bias:"conflictvermijding",signal:"Geen expliciete biasmarkeringen; impliciete conflictmijding blijft plausibel.",risk:"Onzichtbare spanningen kunnen alsnog tot uitstelgedrag leiden."}),n.slice(0,4)}function Oi(e,t){const n=e.toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function vd(e){const t=[e.contextText,e.memoryText,e.graphText].filter(Boolean).join(`

`);return[{assumption:"Groei lost financiële druk automatisch op.",realism:Oi(t,["contractplafond","tariefdruk","marge"])?"laag":"middel",rationale:"Zonder prijs- en contractruimte kan volumegroei margedruk juist vergroten."},{assumption:"Hogere productiviteit lost kostenproblemen op.",realism:Oi(t,["werkdruk","uitval","capaciteit"])?"laag":"middel",rationale:"Productiviteitsverhoging zonder systeembuffer verhoogt vaak uitval- en kwaliteitsrisico."},{assumption:"Nieuwe initiatieven genereren vanzelf extra marge.",realism:Oi(t,["governance","complexiteit","managementbelasting"])?"laag":"middel",rationale:"Nieuwe initiatieven vragen eerst investeringen, managementaandacht en commerciële tractie."}]}function ua(e,t){const n=e.toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function Sd(e){const t=[e.contextText,e.memoryText,e.graphText,e.hypothesisText,e.causalText].filter(Boolean).join(`

`),n=kd({contextText:e.contextText,hypothesisText:e.hypothesisText,causalText:e.causalText}),i=vd({contextText:e.contextText,memoryText:e.memoryText,graphText:e.graphText}),r=[{blindSpot:"Strategie-gedrag mismatch",whatOrgThinks:"De gekozen strategie wordt consistent uitgevoerd.",reality:ua(t,["uitstel","vermijding","onderstroom","mandaat"])?"Besluituitvoering is inconsistent door uitstel en informeel tegenstuurgedrag.":"Uitvoeringsdiscipline is kwetsbaar en niet overal gelijk.",whyUnseen:"Formele voortgangsrapportage maskeert informele uitvoeringsfrictie.",risk:"Strategie op papier blijft achter bij gerealiseerde resultaten."},{blindSpot:"Onbenoemde financiële grens",whatOrgThinks:"Extra activiteit levert direct herstel op.",reality:ua(t,["contractplafond","tarief","marge","kostprijs"])?"Economische randvoorwaarden begrenzen herstel ondanks extra inzet.":"Financiële herstelruimte is beperkter dan operationeel wordt aangenomen.",whyUnseen:"Sturing focust op output, niet op causale marge- en contractlogica.",risk:"Capaciteit groeit zonder structureel financieel herstel."},{blindSpot:"Vermijdingspatroon in besluitvorming",whatOrgThinks:"Consensus voorkomt frictie en houdt teams betrokken.",reality:"Conflictmijding verschuift scherpe keuzes naar later en vergroot cumulatieve schade.",whyUnseen:"Uitstel voelt op korte termijn relationeel veiliger dan expliciete stopkeuzes.",risk:"Bestuurlijke voorspelbaarheid en executiesnelheid nemen structureel af."}],a=[];return r.forEach(o=>{a.push(`BLINDE VLEK: ${o.blindSpot}`),a.push(`WAT DE ORGANISATIE DENKT: ${o.whatOrgThinks}`),a.push(`WAT DE REALITEIT IS: ${o.reality}`),a.push(`WAAROM DIT PROBLEEM NIET WORDT GEZIEN: ${o.whyUnseen}`),a.push(`WELK RISICO DIT CREËERT: ${o.risk}`),a.push("")}),a.push(`COGNITIVE BIAS SIGNALEN: ${n.map(o=>`${o.bias} (${o.signal})`).join("; ")}`),a.push(`STRATEGISCHE AANNAMES: ${i.map(o=>`${o.assumption} [realisme=${o.realism}]`).join("; ")}`),{items:r,biases:n,assumptions:i,block:a.join(`
`).trim()}}function Lt(e){return Math.max(0,Math.min(1,e))}function Ci(e,t){return[{label:"30_dagen",factor:.3},{label:"90_dagen",factor:.6},{label:"365_dagen",factor:1}].map(i=>{const r=e.baseFinancialPressure,a=e.baseCapacityPressure;let o=r,s=a;t==="status_quo"?(o=Lt(r+i.factor*.15),s=Lt(a+i.factor*.12)):t==="interventie"?(o=Lt(r-e.interventionEffect*i.factor),s=Lt(a-e.interventionEffect*i.factor*.8)):(o=Lt(r+e.escalationFactor*i.factor),s=Lt(a+e.escalationFactor*i.factor*.9));const c=Lt(o*.55+s*.45);return{horizon:i.label,financialPressure:o,capacityPressure:s,strategicRisk:c}})}function wi(e){return e.length?e.reduce((t,n)=>t+n,0)/e.length:0}function at(e){return`${Math.round(e*100)}%`}function ji(e){const t=wi(e.trajectory.map(r=>r.financialPressure)),n=wi(e.trajectory.map(r=>r.capacityPressure)),i=wi(e.trajectory.map(r=>r.strategicRisk));return e.name==="STATUS_QUO"?["SCENARIO 1 — STATUS QUO","WAT GEBEURT ALS NIETS VERANDERT:",e.description,`Financiële ontwikkeling: druk stijgt richting ${at(t)}.`,`Capaciteitsontwikkeling: belasting stijgt richting ${at(n)}.`,`Strategische risico's: risico-opbouw richting ${at(i)} zonder trendbreuk.`].join(`
`):e.name==="INTERVENTIE"?["SCENARIO 2 — INTERVENTIE","WAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD:",e.description,`Herstel financiële stabiliteit: druk daalt richting ${at(t)}.`,`Impact op capaciteit: belasting daalt richting ${at(n)}.`,`Impact op strategische positie: risiconiveau daalt richting ${at(i)}.`].join(`
`):["SCENARIO 3 — ESCALATIE","WAT GEBEURT ALS HET PROBLEEM VERERGERT:",e.description,`Financiële ontwikkeling: versnellende druk richting ${at(t)}.`,`Capaciteitsontwikkeling: versnellend verlies richting ${at(n)}.`,`Strategische risico's: escalatie richting ${at(i)} met kans op stagnatie.`].join(`
`)}function Wn(e,t){const n=String(e??"").toLowerCase(),i=t.reduce((r,a)=>r+(n.includes(a.toLowerCase())?1:0),0);return Math.max(.2,Math.min(.9,.2+i*.1))}function Id(e){const t=`${e.contextText}
${e.causalText}
${e.interventionText}`,n=Wn(t,["marge","kostprijs","tariefdruk","contract","verlies","liquiditeit"]),i=Wn(t,["capaciteit","werkdruk","uitval","productiviteit","planning"]),r=Wn(e.interventionText,["actie","eigenaar","kpi","deadline","escalatie"])*.55,a=Wn(t,["uitstel","stagnatie","escalatie"])*.5,o=[{id:"SCENARIO_1",name:"STATUS_QUO",description:"De organisatie houdt huidige koers en ritmes aan zonder aanvullende structurele interventies.",trajectory:Ci({baseFinancialPressure:n,baseCapacityPressure:i,interventionEffect:r,escalationFactor:a},"status_quo")},{id:"SCENARIO_2",name:"INTERVENTIE",description:"De organisatie voert het interventieprogramma consistent uit met governance- en capaciteitsdiscipline.",trajectory:Ci({baseFinancialPressure:n,baseCapacityPressure:i,interventionEffect:r,escalationFactor:a},"interventie")},{id:"SCENARIO_3",name:"ESCALATIE",description:"Financiële en operationele druk verergert door uitstel, beperkte correctie en toenemende systeemfrictie.",trajectory:Ci({baseFinancialPressure:n,baseCapacityPressure:i,interventionEffect:r,escalationFactor:a},"escalatie")}],s=[ji(o[0]),"",ji(o[1]),"",ji(o[2])].join(`
`);return{scenarios:o,block:s}}function ga(e,t){const n=e.toLowerCase();return t.every(i=>n.includes(i.toLowerCase()))}function Td(e){const t=[],n=[],i=String(e.diagnosisText??""),r=String(e.insightText??""),a=String(e.interventionText??""),o=String(e.decisionPressureText??""),s=String(e.causalText??"");ga(`${i}
${s}`,["oorzaak"])||/structurele oorzaak/i.test(s)?t.push("Causale redenering bevat expliciete oorzaaklaag."):n.push("Causale oorzaaklaag is beperkt expliciet."),ga(`${r}
${a}`,["bestuurlijke implicatie"])||/kpi|eigenaar|deadline/i.test(a)?t.push("Inzichten zijn vertaald naar uitvoerbare interventies."):n.push("Koppeling tussen inzicht en interventie is zwak."),/voorkeursoptie/i.test(o)&&/expliciet verlies/i.test(o)?t.push("Besluitlogica bevat voorkeursoptie met expliciet verlies."):n.push("Besluitlogica mist duidelijke keuze of verliesdiscipline.");const c=Math.max(0,Math.min(1,t.length*.33-n.length*.12+.5));return{pass:c>=.6,strengths:t,issues:n,score:Number(c.toFixed(2))}}function xi(e,t,n){return String(e.match(t)?.[1]??n).trim()}function Nd(e){const t=`${e.hypothesisText}
${e.blindSpotText}
${e.contextText}`,n={explanation:"Het kernprobleem is primair governance-frictie, niet marktdruk.",plausibility:/mandaat|uitstel|conflict|onderstroom/i.test(t)?.72:.48,evidence:xi(t,/(uitstel[^\n]{0,180}|mandaat[^\n]{0,180}|conflict[^\n]{0,180})/i,"Signalen van besluituitstel en mandaatonduidelijkheid."),counterEvidence:"Externe contract- en tariefdruk kan alsnog dominante driver zijn."},i={explanation:"Het kernprobleem is primair financiële modeldruk, niet organisatiegedrag.",plausibility:/marge|tarief|kostprijs|contract|plafond/i.test(t)?.74:.5,evidence:xi(t,/(marge[^\n]{0,180}|tarief[^\n]{0,180}|kostprijs[^\n]{0,180}|contract[^\n]{0,180})/i,"Signalen van structurele marge- en contractdruk."),counterEvidence:"Sterke governance- en gedragseffecten kunnen financiële druk versterken."},r={explanation:"Het kernprobleem is strategische scopeversnippering door te veel parallelle agenda's.",plausibility:/parallel|initiatief|versnipper|prioritering|stopregel/i.test(t)?.69:.46,evidence:xi(t,/(parallel[^\n]{0,180}|initiatief[^\n]{0,180}|prioritering[^\n]{0,180})/i,"Signalen van parallelle prioriteiten en ontbrekende stopregels."),counterEvidence:"Bij sterke marktdruk kan zelfs scherpe prioritering onvoldoende zijn."};return[n,i,r]}const Rd=[{variable:"regelgeving",patterns:[/\bregelgeving\b/i,/\btoezicht\b/i,/\bigj\b/i]},{variable:"marktstructuur",patterns:[/\bmarkt\b/i,/\bconcurrent\b/i,/\bverwijzer\b/i]},{variable:"capaciteitslimieten",patterns:[/\bcapaciteit\b/i,/\buitval\b/i,/\bwerkdruk\b/i]},{variable:"financiële parameters",patterns:[/\bmarge\b/i,/\bkostprijs\b/i,/\btarief\b/i,/\bliquiditeit\b/i]}];function Ad(e){const t=`${e.contextText}
${e.diagnosisText}
${e.insightText}`;return{missingVariables:Rd.filter(i=>!i.patterns.some(r=>r.test(t))).map(i=>i.variable)}}function Od(e){const t=Td(e.logicInput),n=Nd(e.alternativeInput),i=Ad(e.missingVariableInput),r=n.filter(c=>c.plausibility>=.55).length,a=t.score-r*.08-i.missingVariables.length*.04,o=Math.max(.1,Math.min(.95,Number(a.toFixed(2)))),s=["WAAR DE ANALYSE STERK IS",t.strengths.length?t.strengths.join(" | "):"Causale en strategische koppeling is beperkt expliciet.","","WAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN",n.map((c,l)=>`${l+1}. ${c.explanation} (plausibiliteit ${c.plausibility.toFixed(2)}) | bewijs: ${c.evidence} | tegenbewijs: ${c.counterEvidence}`).join(`
`),"","WELKE VARIABELEN MOGELIJK ONTBREKEN",i.missingVariables.length?i.missingVariables.join(", "):"Geen kritieke ontbrekende variabelen gedetecteerd op huidige context.","","HOE ZEKER DE CONCLUSIE IS",`Meta-zekerheidsscore: ${(o*100).toFixed(0)}% (logische consistentie ${(t.score*100).toFixed(0)}%).`].join(`
`);return{logic:t,alternatives:n,missing:i,confidence:o,block:s}}function Cd(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function wd(e){const t=`${e.orgDynamicsText}
${e.interventionText}`;return[{friction:"Capaciteitsfrictie in weekritme",bottleneckProcess:"Planning, intake en opvolgafspraken",missingCondition:"Buffer op casemix/no-show en real-time capaciteitszicht",failureMode:"Interventies schuiven door naar ad-hoc prioriteiten"},{friction:"Procesvolwassenheid en datakwaliteit",bottleneckProcess:"KPI-sturing en escalatiebesluiten",missingCondition:Cd(t,["dashboard","kpi"])?"KPI-definities consistent gebruiken":"Betrouwbare KPI-definities en datadiscipline",failureMode:"Beslissingen worden genomen op incompleet of laat inzicht"},{friction:"Governancefrictie tussen formeel en informeel",bottleneckProcess:"Mandaatuitvoering en stop-doing handhaving",missingCondition:"Eenduidig mandaat, eigenaarschap en 48-uurs escalatieregel",failureMode:"Lokale uitzonderingen herstellen oude patronen"}]}function jd(e){return String(e??"").split(/\n{2,}/).map(n=>n.trim()).filter(Boolean).filter(n=>/(actie|interventie|maand\s*[123]|eigenaar|kpi)/i.test(n)).slice(0,6)}function xd(e){const t=jd(e.interventionText),i=String(e.boardroomText??"").toLowerCase().includes("informele invloed")?"Informele beïnvloeders rond planning en uitzonderingsroutes":"Lokale besluitnemers met afwijkende prioriteiten";return t.map((r,a)=>({intervention:`Interventie ${a+1}: ${r.slice(0,120)}`,stakeholders:"Bestuur, management, operations, HR en behandel-/uitvoeringsteams",mustAdopt:"CEO/COO/CFO plus lijnverantwoordelijken en teamcoördinatoren",canBlock:i,canAccelerate:"Centrale prioriteringstafel, duidelijke owners en snelle escalatieroutes"}))}function yd(e){const t=`${e.boardroomText}
${e.decisionPressureText}`.toLowerCase();return{coalition:"Kernbeslissers (CEO/CFO/COO), informele beïnvloeders (planning/operations leads) en uitvoeringsdragers (teamleads/HR/secretariaat)",requiredMandate:/centrale|mandaat|prioritering|besluitrecht/.test(t)?"Centrale mandaten op capaciteit, uitzonderingen en portfolio-besluiten":"Eenduidige mandaten op prioriteiten, escalatie en resource-allocatie",ownershipMapping:"CEO: volgorde en stopregels; CFO: financiële grenzen; COO: uitvoeringsritme; HR/Operations: adoptie en capaciteitscorrectie"}}function ma(e,t){const n=String(e??"").toLowerCase();return t.some(i=>n.includes(i.toLowerCase()))}function $d(e){const t=`${e.orgDynamicsText}
${e.boardroomText}
${e.decisionPressureText}`;return[{point:"Verlies van autonomie bij centrale prioritering",why:"Lokale beslisruimte krimpt door centralisatie van mandaat en stopregels.",form:"STIL",risk:"Passieve naleving met vertraagde uitvoering en informatieachterstand."},{point:"Verhoging van transparantie en normdiscipline",why:"Maandelijkse opvolging maakt prestaties en afwijkingen expliciet zichtbaar.",form:ma(t,["conflict","frictie"])?"OPEN":"VERTRAGING",risk:"Defensief gedrag of uitstel in rapportage, waardoor correcties te laat komen."},{point:"Machtsverschuiving en reputatierisico",why:"Besluitmonopolie verschuift naar centrale governance en beïnvloedt informele macht.",form:ma(t,["sabotage","stil veto"])?"SABOTAGE":"STIL",risk:"Bypass-routes en uitzonderingsgedrag ondermijnen interventie-effect."}]}function _d(e){const t=xd({interventionText:e.interventionOutput,boardroomText:e.boardroomOutput}),n=$d({orgDynamicsText:e.orgDynamicsOutput,boardroomText:e.boardroomOutput,decisionPressureText:e.decisionPressureOutput}),i=wd({orgDynamicsText:e.orgDynamicsOutput,interventionText:e.interventionOutput}),r=yd({boardroomText:e.boardroomOutput,decisionPressureText:e.decisionPressureOutput}),a=t.map((s,c)=>{const l=n[c%n.length],u=i[c%i.length];return[`INTERVENTIE: ${s.intervention}`,`UITVOERINGSROUTE (WIE/WANNEER): ${s.mustAdopt}; uitvoering in maandcadans met weekreviews.`,`WAAR HET GAAT KNARSEN: ${l.point}; ${u.friction}.`,`WAAROM DIT GAAT KNARSEN (MECHANISME): ${l.why}; ${u.missingCondition}.`,"WAT JE MOET DOEN VOORDAT JE START: borg mandaat, dataritme en escalatie-eigenaarschap.",`RISICO ALS JE DIT NIET DOET: ${l.risk} ${u.failureMode}.`,"AANPASSING VOOR UITVOERBAARHEID: fasering per team, expliciete stop-doing en 48-uurs escalatie."].join(`
`)}).join(`

`),o=["EXECUTIEROUTE EN ADOPTIEPAD",t.map(s=>`${s.intervention} | STAKEHOLDERS: ${s.stakeholders} | WIE MOET ADOPTEREN: ${s.mustAdopt} | WIE KAN BLOKKEREN: ${s.canBlock} | WIE KAN VERSNELLEN: ${s.canAccelerate}`).join(`
`),"","VERWACHTE WEERSTANDSPUNTEN",n.map(s=>`WEERSTANDSPUNT: ${s.point} | WAAROM HIER WEERSTAND ONTSTAAT: ${s.why} | VORM (${s.form}) | RISICO ALS DIT NIET WORDT GEMITIGEERD: ${s.risk}`).join(`
`),"","UITVOERINGSFRICTIE",i.map(s=>`UITVOERINGSFRICTIE: ${s.friction} | WELK PROCES HIER KNELT: ${s.bottleneckProcess} | WELKE VOORWAARDE ONTBREEKT: ${s.missingCondition} | WAT ER DAN MISGAAT: ${s.failureMode}`).join(`
`),"","BENODIGDE COALITIE EN MANDAAT",`COALITIE: ${r.coalition}`,`WELK MANDAAT NODIG IS: ${r.requiredMandate}`,`WIE EIGENAAR IS VAN WELKE BESLUITEN: ${r.ownershipMapping}`,"","AANPASSINGEN VOOR UITVOERBAARHEID","Start met pilot op hoogste frictie-interventies, leg stopregels vooraf vast en sluit elke blokkade binnen 48 uur.","",a].join(`
`);return{interventionCount:t.length,block:o}}const zd=["0 SITUATIERECONSTRUCTIE","1 DOMINANTE THESE","2 KERNCONFLICT","3 KEERZIJDE VAN DE KEUZE","4 PRIJS VAN UITSTEL","5 GOVERNANCE IMPACT","6 MACHTSDYNAMIEK","7 EXECUTIERISICO","8 INTERVENTIEONTWERP","9 BESLUITKADER"];function Dd(e,t){const n=String(e??"");return t==="8 INTERVENTIEONTWERP"?/###\s*(?:8\.\s*INTERVENTIEONTWERP|10\.\s*90-DAGEN INTERVENTIEPROGRAMMA)/i.test(n):t==="9 BESLUITKADER"?/###\s*(?:9\.\s*BESLUITKADER|12\.\s*BESLUITKADER)/i.test(n):new RegExp(String.raw`(?:^|\n)\s*(?:###\s*)?${t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\b`,"i").test(n)}function Ko(e){const t=[],n=[];for(const i of zd)Dd(e,i)?t.push(i):n.push(i);return{pass:n.length===0,missing:n,matched:t}}const Ld=[{signal:"SITUATIE -> KERNCONFLICT",pattern:/(?:situatiereconstructie|huidige situatie)[\s\S]{0,1200}(?:kernconflict|conflict)/i},{signal:"KERNCONFLICT -> DOMINANTE THESE",pattern:/kernconflict[\s\S]{0,1200}(?:dominante these|these)/i},{signal:"THESE -> INTERVENTIE",pattern:/(?:dominante these|these)[\s\S]{0,1600}(?:interventie|90-dagen interventieprogramma|interventieontwerp)/i},{signal:"SPANNING + REALITEIT + KEUZE",pattern:/(?:probeert te bereiken|doel|ambitie)[\s\S]{0,1200}(?:structurele realiteit|beperking|belemmert)[\s\S]{0,1200}(?:keuze|noodzakelijk|onvermijdelijk)/i}];function Vo(e){const t=String(e??""),n=[],i=[];for(const r of Ld)r.pattern.test(t)?n.push(r.signal):i.push(r.signal);return{pass:i.length===0,signals:n,missingSignals:i}}function Bd(e){const t=String(e??"").trim();if(!t)return[];const n=/^###\s*\d+\.\s*[^\n]+$/gm,i=[...t.matchAll(n)];return i.length?i.map((r,a)=>{const o=(r.index??0)+r[0].length,s=i[a+1]?.index??t.length;return{heading:String(r[0]??"").trim(),body:t.slice(o,s).trim()}}):[]}function di(e){return String(e??"").replace(/\r\n/g,`
`).replace(/\s+/g," ").split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean)}function Gd(e){return String(e??"").replace(/\r\n/g,`
`).split(/\n{2,}/).map(n=>{const i=n.trim();if(!i)return[];const r=i.split(`
`).map(o=>o.trim()).filter(Boolean);if(!r.length)return[];const a=r.map(o=>o.replace(/^[-*]\s+/,"").replace(/^\d+\.\s+/,"")).map(o=>o.replace(/^[A-Z][^:]{1,32}:\s*/i,"")).join(" ");return di(a)}).flat().map(n=>n.replace(/\s+\./g,".").trim()).filter(Boolean)}function on(e,t){return e.filter(Boolean).slice(0,t).join(" ").trim()}function Md(e,t){const n=on(e,3);if(!n)return"";if(t===1){const i=n.charAt(0).toLowerCase()+n.slice(1);return on([`De dominante bestuurlijke these is dat ${i}`,"De spanning ontstaat doordat ambitie en uitvoerbaarheid nu uit elkaar lopen."],4)}return on([n,"De spanning zit in het verschil tussen gewenste richting en operationele realiteit."],4)}function Pd(e){const t=e.find(r=>/\b(druk|tekort|uitval|vertraging|frictie|verlies|plafond|daling|stijging)\b/i.test(r)),n=e.find(r=>/\b(contract|tarief|kostprijs|capaciteit|governance|mandaat|transparantie|planning)\b/i.test(r)),i=e.find(r=>/\b(liquiditeit|marge|behandelcapaciteit|wachtlijst|doorlooptijd|voorspelbaarheid)\b/i.test(r));return on([`Mechanisme: ${t??"De zichtbare symptomen stapelen zich op in uitvoering en planning."}`,`Structurele oorzaak: ${n??"Financiële en organisatorische randvoorwaarden begrenzen beslisruimte."}`,`Systeemeffect: ${i??"Zonder correctie verschuift druk van cijfers naar gedrag en uitvoering."}`],4)}function Ud(e,t){const n=e.find(r=>/\b(bestuurlijk|besluit|mandaat|prioritering|stop|escalatie|keuze)\b/i.test(r)),i={1:"Zonder consolidatie binnen 12 maanden verdwijnt behandelcapaciteit uit de kern.",2:"Zonder volgordekeuze blijft dubbel sturen bestaan en neemt liquiditeitsdruk toe.",3:"Zonder expliciet verlies blijft verbreding margedruk versnellen.",4:"Zonder stopregel wordt uitstel binnen 90 dagen operationeel onomkeerbaar.",5:"Zonder bindend mandaat blijven escalaties hangen en wordt sturing reactief.",6:"Zonder ritme op onderstroom blijft informele macht formele keuzes blokkeren.",7:"Zonder maandelijkse correcties verschuift falen naar kwartaalniveau en komt herstel te laat.",8:"Zonder eigenaar, deadline en escalatie vervalt het interventieplan tot intentie.",9:"Zonder besluitcontract is de gekozen richting niet afdwingbaar in uitvoering.",10:"Zonder dag-30, dag-60 en dag-90 gates ontbreekt bestuurlijke sluiting op uitvoering.",11:"Zonder toets op besluitkwaliteit groeit de kans op herhaling van dezelfde fout.",12:"Zonder expliciete keuze blijft bestuurlijke ruis bestaan en daalt uitvoerbaarheid."};return on([`Bestuurlijke implicatie: ${n??"Het bestuur moet volgorde, mandaat en stopregels direct formaliseren."}`,i[t]??"Zonder expliciete keuze blijft de uitvoering bestuurlijk diffuus."],4)}function Hd(e,t){const n=Gd(t);if(!n.length)return String(t??"").trim();const i=Md(n,e),r=Pd(n),a=Ud(n,e);return[i,r,a].filter(Boolean).join(`

`).trim()}function Kd(e){const t=Bd(e);return t.length?t.map(i=>{const r=i.heading.match(/^###\s*(\d+)\./),a=Number(r?.[1]??0),o=Hd(a,i.body);return`${i.heading}

${o}`.trim()}).join(`

`).trim():String(e??"").trim()}function Wt(e,t){const n=String(e??""),i=new RegExp(String.raw`###\s*${t}\.\s*[^\n]+\n([\s\S]*?)(?=\n###\s*\d+\.\s*[^\n]+|$)`,"i"),r=n.match(i);return String(r?.[1]??"").trim()}function pt(e,t,n){return(di(e).find(r=>t.test(r))??"")||n}function Vd(e){const t=di(e).filter(n=>/(?:€\s?\d|\b\d+[.,]?\d*\s*%|\b\d+\s*(?:dagen|maanden|jaar|FTE|cliënten?|uren?)\b)/i.test(n));return Array.from(new Set(t)).slice(0,5)}function Fd(e){const t=di(e).filter(n=>/\b(risico|druk|erosie|frictie|liquiditeit|bestuurlijk|mandaat|uitstel|verlies|spann)\b/i.test(n));return Array.from(new Set(t)).slice(0,5)}function Wd(e,t){const n=String(e??""),i=/\bSCENARIO A\b/i.test(n),r=/\bSCENARIO B\b/i.test(n),a=/\bSCENARIO C\b/i.test(n),o=/consolid/i.test(t)||/stabilis/i.test(t)?"C":"B";return[{title:"Optie A - Parallel consolideren en verbreden",description:i?"Consolidatie en verbreding tegelijk doorzetten.":"Parallel sturen op kernstabilisatie en nieuwe initiatieven.",financial:"Hoge kans op margedruk en cash-volatiliteit.",operational:"MT-capaciteit versnipperd, hogere coördinatiedruk.",risk:"Hoog"},{title:"Optie B - Volledige groeipauze buiten de kern",description:r?"Kern consolideren met tijdelijke stop op verbreding.":"Alleen kernstabilisatie met tijdelijk stop-doing op uitbreidingen.",financial:"Snelste herstel op margecontrole en kasdiscipline.",operational:"Lagere complexiteit, lager innovatietempo.",risk:"Middel"},{title:"Optie C - Gefaseerd model met harde gates",description:a?"Eerst kernconsolidatie, daarna gecontroleerde verbreding.":"Consolideren -> stabiliseren -> gecontroleerd verbreden op KPI-gates.",financial:"Gebalanceerde risicoreductie met gecontroleerde investeringen.",operational:"Duidelijke volgorde en bestuurlijke focus.",risk:o==="C"?"Laag-Middel":"Middel"}]}function Jd(e,t,n,i,r,a,o,s,c){const l=n.length?n:["Kosten en tarieven bewegen ongunstig terwijl contractruimte begrensd is."],u=i.length?i:["Structurele druk vertaalt zich zonder prioritering naar capaciteits- en cashrisico."];return["OUTPUT 1","BESLISNOTA RvT / MT (BOARD MEMO)","","1. Besluitvraag",e,"","2. Executive Thesis",t,"","3. Feitenbasis (HARD) vs Interpretatie","HARD",...l.map(g=>`- ${g}`),"INTERPRETATIE",...u.map(g=>`- ${g}`),"","4. Strategische opties",...r.flatMap(g=>[g.title,`- Beschrijving: ${g.description}`,`- Financieel effect: ${g.financial}`,`- Operationeel effect: ${g.operational}`,`- Risicoprofiel: ${g.risk}`]),"","5. Aanbevolen keuze",a,"","6. Niet-onderhandelbare besluitregels","- Geen nieuw initiatief zonder margevalidatie en capaciteitsimpact.","- Geen capaciteitstoename zonder expliciete businesscase en owner.","- Geen afwijking van prioritering zonder formele board-escalatie.","- Geen parallelle KPI-sturing op conflicterende doelen.","- Automatische pauze op verbreding bij ontbrekende kernstuurdata.","","7. 90-dagen interventieplan","- Actie: Volledige margekaart per product. Owner: CFO/Finance. Deadline: Dag 14. Doel: Feitelijke stuurbasis.","- Actie: Contractvloer en plafondstrategie per verzekeraar. Owner: CEO + CFO. Deadline: Dag 30. Doel: Contractdiscipline.","- Actie: Capaciteitsritme op productiviteit en no-show. Owner: COO/Operations. Deadline: Dag 45. Doel: Betere benutting kerncapaciteit.","- Actie: Centrale prioriteringstafel met stop-doing-lijst. Owner: MT. Deadline: Dag 60. Doel: Besluithelderheid en focus.","","8. KPI-set voor board monitoring","- Marge per productlijn.","- Cash runway (maanden).","- Productiviteit versus norm (gecorrigeerd).","- Contractdekking en plafondbenutting.","- Wachttijd en behandelcontinuiteit.","","9. Besluittekst voor notulen",`De RvT besluit tot gefaseerde kernconsolidatie met harde stop/go-gates voor verbreding. ${c}`,"",`Mechanisme: ${o}`,`Bestuurlijke implicatie: ${s}`].join(`
`).trim()}function Zd(e,t,n,i){const r=t.slice(0,4);return["OUTPUT 2","1-SLIDE BOARD SUMMARY","","1. Besluitvraag",`- ${e}`,"","2. Feiten",...(r.length?r:["- Kernsturing vereist harde fact-base en contractdiscipline."]).map(a=>`- ${a.replace(/^-\s*/,"")}`),"","3. Aanbevolen keuze",`- ${n}`,"","4. 90-dagen plan","- Dag 14: margekaart op productniveau.","- Dag 30: contractvloer per verzekeraar.","- Dag 60: capaciteitstafel met stop-doing-lijst.","- Dag 90: board gate met doorpakken of pauzeren.","","5. Governance mechanisme",`- ${i}`,"- Geen verbreding zonder formele marge- en capaciteitsgate.","","6. KPI's","- Marge per product","- Cash runway","- Productiviteit","- Contractdekking","- Wachttijd"].join(`
`).trim()}function Yd(e,t,n,i){const r=t.slice(0,3).join(" ");return["OUTPUT 3","SPREEKTEKST VOOR DIRECTEUR / CEO (2 MINUTEN)","","Probleem",`${e}`,"","Feiten",`${r||"Onze kostenbasis, contractruimte en capaciteit zijn niet meer in balans."}`,"","Keuze",`${n}`,"","Plan","In de komende 90 dagen maken we eerst de feiten volledig: margekaart, contractvloer en capaciteitsturing. Daarna zetten we alleen stappen door die de kern aantoonbaar versterken. Alles zonder onderbouwing gaat op pauze.","","Besluitvraag",`${i}`].join(`
`).trim()}function dr(e){const t=String(e??"").trim();if(!t)return"";if(/\bOUTPUT 1\b/i.test(t)&&/\bOUTPUT 2\b/i.test(t)&&/\bOUTPUT 3\b/i.test(t))return t;const i=Wt(t,1),r=Wt(t,2),a=Wt(t,4),o=Wt(t,5),s=Wt(t,9),c=Wt(t,12),l=pt(r||t,/\b(keuze|besluit|kernconflict|consolider|verbred)\b/i,"Moet de organisatie kiezen voor kernconsolidatie of voor parallelle verbreding?"),u=on([pt(i||t,/\b(dominante|marge|druk|capaciteit|contract|plafond)\b/i,"De organisatie staat onder structurele financiële en operationele druk."),pt(a||t,/\b(uitstel|12|90|365|maanden|dagen)\b/i,"Uitstel verhoogt voorspelbaar het risico op margedruk en capaciteitsverlies."),"Aanbevolen route: consolideren -> stabiliseren -> gecontroleerd verbreden."],3),g=pt(a||t,/\b(mechanisme|druk|marge|contract|plafond|liquiditeit)\b/i,"Structurele margedruk en contractbeperkingen vertalen zich direct naar capaciteitsdruk."),m=pt(o||t,/\b(bestuurlijk|implicatie|mandaat|governance|besluit)\b/i,"Het bestuur moet volgorde, mandaat en stopregels hard formaliseren."),p=pt(c||t,/\b(besluit|keuze|stop|mandaat|prioritering)\b/i,"Nieuwe initiatieven worden alleen toegestaan na formele validatie op marge en capaciteit."),I=pt(`${s}
${c}`,/\b(voorkeur|aanbevolen|consolid|stabilis|verbred)\b/i,"Kies voor gefaseerde kernconsolidatie met harde stop/go-gates richting verbreding."),T=pt(o||c||t,/\b(mandaat|governance|escalatie|besluitrecht|stopregel)\b/i,"Besluitrecht wordt centraal belegd met expliciete stopregels en escalatieritme."),b=Vd(t),h=Fd(`${r}
${a}
${o}
${c}`),d=Wd(s,I),x=Jd(l,u,b,h,d,I,g,m,p),N=Zd(l,b,I,T),j=Yd(u,b,I,l);return`${t}

${x}

${N}

${j}`.trim()}function Fo(e){let t=String(e.text??"").trim();t=Kd(t),t=dr(t);const n=Ko(t),i=Vo(t),r=[];return n.pass||r.push(`NarrativeStructureEngine: ontbrekende secties: ${n.missing.join(", ")}`),i.pass||r.push(`NarrativeCausalityValidator: ontbrekende causale signalen: ${i.missingSignals.join(", ")}`),{composedText:t,structure:n,causality:i,warnings:r}}const pa={dominante_these:[/\bdominante\b.*\bthese\b/i,/\bdominante bestuurlijke these\b/i],kernspanning:[/\bstructurele kernspanning\b/i,/\bkernconflict\b/i,/\bkernspanning\b/i],keerzijde_keuze:[/\bkeerzijde\b.*\bkeuze\b/i,/\btrade-?offs?\b/i],prijs_uitstel:[/\bprijs\b.*\buitstel\b/i,/\bopportunity cost\b/i],mandaat_besluitrecht:[/\bmandaat\b/i,/\bbesluitrecht\b/i,/\bgovernance impact\b/i],onderstroom_macht:[/\bonderstroom\b/i,/\binformele macht\b/i,/\bmachtsdynamiek\b/i],faalmechanisme:[/\bfaalmechanisme\b/i,/\bexecutierisico\b/i],interventieplan_90_dagen:[/\b90[- ]dagen\b.*\binterventie/i,/\binterventieplan\b/i],besluitkader:[/\bbesluitkader\b/i,/\bdecision contract\b/i]};function qd(e){return String(e??"").replace(/\r\n/g,`
`)}function Qd(e){const t=qd(e),n=Object.keys(pa).filter(i=>!pa[i].some(r=>r.test(t)));return{pass:n.length===0,missing:n}}function Wo(e){const t=Qd(e);if(!t.pass)throw new Error(`Boardroom rapport geblokkeerd: ontbrekende secties: ${t.missing.join(", ")}`)}const Jo="strategic_knowledge_graph_v1",we={nodes:[],edges:[]};function Zo(){try{return typeof globalThis>"u"?null:globalThis.localStorage??null}catch{return null}}function yi(){const e=Zo();if(!e)return{...we,nodes:[...we.nodes],edges:[...we.edges]};try{const t=e.getItem(Jo);if(!t)return{...we,nodes:[...we.nodes],edges:[...we.edges]};const n=JSON.parse(t),i=Array.isArray(n?.nodes)?n.nodes:[],r=Array.isArray(n?.edges)?n.edges:[];return we.nodes=[...i],we.edges=[...r],{nodes:[...i],edges:[...r]}}catch{return{...we,nodes:[...we.nodes],edges:[...we.edges]}}}function ba(e){we.nodes=[...e.nodes],we.edges=[...e.edges];const t=Zo();if(t)try{t.setItem(Jo,JSON.stringify(e))}catch{}}class ur{getGraph(){return yi()}upsertNode(t){const n=yi(),i=n.nodes.findIndex(r=>r.id===t.id);i>=0?n.nodes[i]={...n.nodes[i],...t,metadata:{...n.nodes[i].metadata??{},...t.metadata??{}}}:n.nodes.push(t),ba(n)}upsertEdge(t){const n=yi(),i=n.edges.findIndex(r=>r.id===t.id);if(i>=0){const r=n.edges[i];n.edges[i]={...r,...t,weight:Math.max(1,Number(r.weight??1)+1),metadata:{...r.metadata??{},...t.metadata??{}}}}else n.edges.push(t);ba(n)}}function Xd(e,t){const n=String(t??"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"").slice(0,80);return`${e}:${n||"unknown"}`}function $i(e){return e.map(t=>t.label).filter(Boolean).slice(0,5)}class eu{constructor(t=new ur){this.store=t}run(t){const n=this.store.getGraph(),i=Xd("sector",t.sector||"onbekend"),r=String(t.organizationName??"").toLowerCase(),a=String(t.problemHint??"").toLowerCase(),o=n.edges.filter(b=>b.type==="BELONGS_TO_SECTOR"&&b.to===i).map(b=>n.nodes.find(h=>h.id===b.from)).filter(b=>!!b).filter(b=>!r||b.label.toLowerCase()!==r),s=o.map(b=>b.label).slice(0,5),c=new Set(o.map(b=>b.id)),l=n.edges.filter(b=>b.type==="HAS_PROBLEM"&&c.has(b.from)).map(b=>{const h=n.nodes.find(x=>x.id===b.to&&x.type==="problem");if(!h)return null;const d=a&&h.label.toLowerCase().includes(a)?2:0;return{id:h.id,label:h.label,score:b.weight+d}}).filter(b=>!!b).sort((b,h)=>h.score-b.score),u=n.edges.filter(b=>b.type==="USES_STRATEGY"&&c.has(b.from)).map(b=>{const h=n.nodes.find(d=>d.id===b.to&&d.type==="strategy");return h?{id:h.id,label:h.label,score:b.weight}:null}).filter(b=>!!b).sort((b,h)=>h.score-b.score),g=n.edges.filter(b=>b.type==="APPLIED_INTERVENTION"&&c.has(b.from)).map(b=>{const h=n.nodes.find(d=>d.id===b.to&&d.type==="intervention");return h?{id:h.id,label:h.label,score:b.weight}:null}).filter(b=>!!b).sort((b,h)=>h.score-b.score),m=$i(l),p=$i(u),I=$i(g),T=["VERGELIJKBARE ORGANISATIES",s.length?s.join("; "):"Geen directe vergelijkbare organisaties gevonden.","GEMEENSCHAPPELIJKE PROBLEMEN",m.length?m.join("; "):"Nog geen dominant probleemcluster beschikbaar in de graph.","MEEST EFFECTIEVE STRATEGIEËN",p.length?p.join("; "):"Nog geen dominante strategie-signalen beschikbaar.","MEEST EFFECTIEVE INTERVENTIES",I.length?I.join("; "):"Nog geen bewezen interventies beschikbaar in de graph."].join(`
`);return{comparableOrganisations:s,commonProblems:m,effectiveStrategies:p,effectiveInterventions:I,block:T}}}class tu{constructor(t=new ur){this.store=t}apply(t){for(const n of t.nodes)this.store.upsertNode(n);for(const n of t.edges)this.store.upsertEdge(n)}}function Yo(){return new Date().toISOString()}function nu(e){return String(e??"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"").slice(0,80)}function iu(e,t){return`${e}:${nu(t)||"unknown"}`}function ru(e,t,n){return`${e}:${t}->${n}`}function Jt(e,t,n){return{id:iu(e,t),type:e,label:t||"onbekend",metadata:n,updatedAt:Yo()}}function bt(e,t,n,i){return{id:ru(e,t,n),from:t,to:n,type:e,weight:1,metadata:i,updatedAt:Yo()}}function au(e){const t=Jt("organisation",e.companyName||"Onbekende organisatie"),n=Jt("sector",e.sector||"onbekend"),i=Jt("problem",e.problem||"onbekend probleem"),r=Jt("strategy",e.strategy||"onbekende strategie"),a=(e.interventions??[]).filter(Boolean).map(l=>Jt("intervention",l)),o=(e.patterns??[]).filter(Boolean).map(l=>Jt("pattern",l)),s=[t,n,i,r,...a,...o],c=[bt("BELONGS_TO_SECTOR",t.id,n.id),bt("HAS_PROBLEM",t.id,i.id),bt("USES_STRATEGY",t.id,r.id),bt("CAUSED_BY",i.id,n.id)];return a.forEach(l=>{c.push(bt("APPLIED_INTERVENTION",t.id,l.id)),c.push(bt("CAUSED_BY",l.id,i.id))}),o.forEach(l=>{c.push(bt("SIMILAR_TO",i.id,l.id)),c.push(bt("SIMILAR_TO",r.id,l.id))}),{nodes:s,edges:c}}function ht(e){if(typeof e=="string"){const t=e.trim();return t?[t]:[]}return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):[]}function Et(e,t){const n=new Set(e);for(const i of t)n.has(i)||(e.push(i),n.add(i))}function ou(){return{context_state:{entries:[]},diagnosis:{entries:[]},mechanisms:{entries:[]},strategic_tension:{entries:[]},strategic_options:{entries:[]},insights:{entries:[]},decision:{entries:[]},narrative:{entries:[]}}}function Je(e,t){return Et(e.context_state.entries,ht(t.context_state)),Et(e.diagnosis.entries,ht(t.diagnosis)),Et(e.mechanisms.entries,ht(t.mechanisms)),Et(e.strategic_tension.entries,ht(t.strategic_tension)),Et(e.strategic_options.entries,ht(t.strategic_options)),Et(e.insights.entries,ht(t.insights)),Et(e.decision.entries,ht(t.decision)),Et(e.narrative.entries,ht(t.narrative)),e}function ha(e){return new Set(String(e??"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).map(t=>t.trim()).filter(t=>t.length>=5))}function _i(e,t){const n=ha(e),i=ha(t);if(!n.size||!i.size)return 0;let r=0;for(const a of n)i.has(a)&&(r+=1);return r/Math.max(1,Math.min(n.size,i.size))}function zi(e){return e[e.length-1]??""}function su(e){const t=[],n=zi(e.diagnosis.entries),i=zi(e.mechanisms.entries),r=zi(e.decision.entries);return n||t.push("diagnosis ontbreekt in gedeelde ReasoningState."),i||t.push("mechanisms ontbreken in gedeelde ReasoningState."),r||t.push("decision ontbreekt in gedeelde ReasoningState."),n&&i&&_i(n,i)<.05&&t.push("lage consistentie tussen diagnosis en mechanisms; causale aansluiting is zwak."),i&&r&&_i(i,r)<.05&&t.push("lage consistentie tussen mechanisms en decision; besluit lijkt niet op mechanisme aan te sluiten."),n&&r&&_i(n,r)<.03&&t.push("lage consistentie tussen diagnosis en decision; besluitdruk kan diagnostiek missen."),t.length&&console.error("[ReasoningGuard]",{issueCount:t.length,issues:t}),{pass:t.length===0,issues:t}}function Sn(e,t){return t.test(String(e??""))}function cu(e){const t=`${e.contextText}
${e.diagnosisText}
${e.mechanismText}`,n=[];return[/\bconsortium\b/i,/\bgemeent/i,/\btriage\b/i,/\bcontract/i,/\bbudget/i].reduce((r,a)=>a.test(t)?r+1:r,0)>=3&&n.push("regionale contractsturing en triage"),Sn(t,/\b(ambulant|ambulante|specialist|specialisatie|niche|positionering)\b/i)&&n.push("brede ambulante positionering versus specialisatie"),Sn(t,/\b(zzp|loondienst|vaste medewerkers|flexibele schil|capaciteitsflexibiliteit)\b/i)&&n.push("capaciteitsflexibiliteit binnen budgetgrenzen"),Sn(t,/\b(kwaliteit|behandelcontinu[iï]teit|uitkomst|cliënt)\b/i)&&n.push("kwaliteit van zorg"),Sn(t,/\b(marge|liquiditeit|tarief|kostprijs|contract|plafond)\b/i)&&n.push("financiële stabiliteit"),Sn(t,/\b(verbreding|initiatief|groei|portfolio|opschalen)\b/i)&&n.push("strategische verbreding"),n.length||n.push("kwaliteit van zorg","financiële stabiliteit","strategische verbreding"),{tension:n,block:["STRATEGISCHE KERNSPANNING",`tension: [${n.map(r=>`"${r}"`).join(", ")}]`].join(`
`)}}function Ea(e){return[`Optie ${e.id} – ${e.title}`,`focus: ${e.focus}`,`voordelen: ${e.advantages.join("; ")}`,`nadelen: ${e.disadvantages.join("; ")}`,`strategisch risico: ${e.strategicRisk}`].join(`
`)}function lu(e){const t=e.tension.some(a=>/financ/i.test(a));if(e.tension.some(a=>/(ambulante positionering|specialisatie|consortium|triage|contractsturing)/i.test(a))){const a=[{id:"A",title:"Brede ambulante specialist blijven",focus:"Behoud brede ambulante positionering, bescherm kerncapaciteit en beperk verbreding tot wat binnen consortium-, contract- en kwaliteitsdiscipline past.",advantages:["sluit aan op bestaande positionering","houdt bestuurlijke complexiteit beheersbaar","beschermt teamstabiliteit en zorgkwaliteit"],disadvantages:["minder snelle verbreding","beperkte ruimte voor nicheprofilering buiten de kern"],strategicRisk:"te brede positionering blijft kwetsbaar als contractruimte en triage blijvend vernauwen"},{id:"B",title:"Selectieve specialisatie / niche kiezen",focus:"Versmal het aanbod naar een scherper specialistisch profiel om capaciteit, kwaliteit en contractonderhandeling te concentreren.",advantages:["helderder profiel","meer focus in teams","minder portfolio-complexiteit"],disadvantages:["verlies van breedte in zorgaanbod","hogere afhankelijkheid van beperkt vraagsegment"],strategicRisk:"te snelle versmalling kan regionale relevantie en instroombasis ondergraven"},{id:"C",title:"Consortiumstrategie verdiepen",focus:"Vergroot invloed via sterkere regionale samenwerking, scherpere triage-afspraken en explicietere rol in consortiumsturing.",advantages:["betere aansluiting op instroommechaniek","meer invloed op regionale toegang","sterkere bestuurlijke verankering"],disadvantages:["meer afhankelijkheid van partners en gemeenten","langzamere autonome koerswijziging"],strategicRisk:"governancecomplexiteit stijgt als rolverdeling en mandaat niet expliciet worden vastgelegd"}];return{options:a,block:["STRATEGISCHE OPTIES",...a.map(Ea)].join(`

`)}}const i=[{id:"A",title:"Consolidatie",focus:"Kernzorg stabiliseren, margeherstel prioriteren, verbreding tijdelijk begrenzen.",advantages:["hogere voorspelbaarheid","sneller margeherstel","lagere bestuurlijke ruis"],disadvantages:["tragere volumegroei","tijdelijk minder innovatie buiten de kern"],strategicRisk:"verlies van marktmomentum buiten kernactiviteiten"},{id:"B",title:"Parallel model",focus:"Kern consolideren en tegelijk beperkt verbreden met harde poortcriteria.",advantages:["behoud van strategische opties","gebalanceerde groei","betere leerlus"],disadvantages:["hogere sturingscomplexiteit","risico op prioriteitsconflict"],strategicRisk:"scope-creep bij onvoldoende stopregels en mandaatdiscipline"},{id:"C",title:"Verbreding",focus:"Versneld opschalen van nieuwe initiatieven naast de GGZ-kern.",advantages:["hogere potentiële omzetdiversificatie","strategische zichtbaarheid"],disadvantages:[t?"hogere kans op margedruk in de kern":"hogere implementatiedruk in management","meer afhankelijkheid van schaarse capaciteit"],strategicRisk:"kapitaal- en aandachtstekort bij onvoldoende contract- en capaciteitsbasis"}],r=["STRATEGISCHE OPTIES",...i.map(Ea)].join(`

`);return{options:i,block:r}}function Jn(e){return Math.max(0,Math.min(100,Math.round(e)))}function du(e){let t=65,n=60,i=45;e.id==="A"&&(t+=15,n+=20,i-=10),e.id==="B"&&(t+=5,n+=10,i+=5),e.id==="C"&&(t-=10,n-=5,i+=20);const r=Jn(t*.4+n*.4+(100-i)*.2);return{optionId:e.id,uitvoerbaarheid:Jn(t),financieelEffect:Jn(n),strategischRisico:Jn(i),total:r}}function uu(e){const t=e.options.map(du),i=[...t].sort((a,o)=>o.total-a.total)[0]?.optionId??null,r=["STRATEGISCHE OPTIE-EVALUATIE",...t.map(a=>`Optie ${a.optionId}: uitvoerbaarheid=${a.uitvoerbaarheid}, financieel effect=${a.financieelEffect}, strategisch risico=${a.strategischRisico}, totaalscore=${a.total}`),i?`Voorkeursoptie: Optie ${i}`:"Voorkeursoptie: niet beschikbaar"].join(`
`);return{scores:t,preferredOptionId:i,block:r}}class gu{async generate(t){return Ue(t.model??"gpt-4o",t.messages,t.options??{})}}function gr(e){const t=String(e??"").trim(),n=/^###\s*(\d+)\.\s*([^\n]+)$/gm,i=[...t.matchAll(n)];return i.length?i.map((r,a)=>{const o=(r.index??0)+r[0].length,s=i[a+1]?.index??t.length;return{heading:`### ${r[1]}. ${r[2]}`.trim(),number:Number(r[1]??0),body:t.slice(o,s).trim()}}):[]}function ii(e,t){return gr(e).find(n=>n.number===t)?.body??""}function mu(e){return String(e??"").replace(/\s+/g," ").split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean).length}function pu(e){const t=ii(e,1);if(!t)return{status:"WARN",finding:"Dominante these ontbreekt of is leeg.",evidence:"Sectie 1 niet gevonden."};const n=/€\s?\d|\d+\s*%|\b\d+\s*(?:dagen|maanden|fte|cliënten?)\b/i.test(t),i=/\bMechanisme:|\bStructurele oorzaak:|\bSysteemeffect:/i.test(t),r=/\bBestuurlijke implicatie:|\bbesluit\b/i.test(t);return Number(n)+Number(i)+Number(r)>=2?{status:"PASS",finding:"Dominante these is grotendeels consistent met feiten, mechanismen en implicatie.",evidence:`Signalen aanwezig: feiten=${n}, mechanisme=${i}, implicatie=${r}.`}:{status:"WARN",finding:"Dominante these volgt onvoldoende logisch uit feiten, mechanismen en implicatie.",evidence:`Signalen aanwezig: feiten=${n}, mechanisme=${i}, implicatie=${r}.`}}function bu(e){const t=gr(e).filter(i=>i.number>=1&&i.number<=9);if(!t.length)return{status:"WARN",finding:"Geen valide secties gevonden voor mechanismevalidatie.",evidence:"Sectieherkenning mislukt."};const n=t.filter(i=>{const r=/\bMechanisme:/i.test(i.body),a=/\bStructurele oorzaak:/i.test(i.body),o=/\bSysteemeffect:/i.test(i.body);return!(r&&a&&o)}).map(i=>i.number);return n.length?{status:"WARN",finding:"Causale keten is niet volledig in alle kernsecties.",evidence:`Onvolledige mechanismeketen in sectie(s): ${n.join(", ")}.`}:{status:"PASS",finding:"Mechanismeketens zijn aanwezig in de kernsecties.",evidence:"SYMPTOM -> MECHANISM -> STRUCTURAL CAUSE -> SYSTEM EFFECT is afgedekt."}}function hu(e){const t=ii(e,2),n=ii(e,10);if(!t||!n)return{status:"WARN",finding:"Strategie-interventie consistentie kan niet volledig worden getoetst.",evidence:"Sectie 2 of sectie 10 ontbreekt."};const i=/\b(contract|plafond|tarief|verzekeraar)\b/i.test(t),r=/\b(capaciteit|planning|productiviteit|uitval)\b/i.test(t),a=/\b(contract|verzekeraar|tarief|ondergrens|vloer)\b/i.test(n),o=/\b(capaciteit|planning|productiviteit|rooster|casemix)\b/i.test(n),s=i&&!a,c=r&&!o;return!s&&!c?{status:"PASS",finding:"Interventies sluiten aan op dominante structurele beperkingen.",evidence:`Contractmatch=${a}, capaciteitsmatch=${o}.`}:{status:"WARN",finding:"Minstens een interventie lost het dominante mechanisme niet aantoonbaar op.",evidence:`Contract mismatch=${s}, capaciteits mismatch=${c}.`}}function Eu(e){const n=ii(e,12)||e;return/\bZonder\b[\s\S]{0,120}\bbinnen\s+\d+\s*(?:dagen|maanden)\b/i.test(n)||/\bgeen nieuw initiatief zonder\b/i.test(n)||/\bDe Raad van Bestuur committeert zich aan\b/i.test(n)?{status:"PASS",finding:"Beslisdruk is expliciet en tijdgebonden.",evidence:"Rapport bevat harde keuzeformule met consequentie."}:{status:"WARN",finding:"Beslisdruk is te impliciet; harde keuze ontbreekt.",evidence:"Geen tijdgebonden 'zonder X dan Y'-formule gevonden."}}function fu(e){const t=gr(e);if(!t.length)return{status:"WARN",finding:"Narratieve helderheid kan niet worden getoetst.",evidence:"Geen secties gevonden."};const n=[];for(const i of t){const r=i.body.split(/\n{2,}/).map(o=>o.trim()).filter(Boolean);r.length>3&&n.push(`sectie ${i.number}: meer dan 3 alinea's`),r.find(o=>mu(o)>4)&&n.push(`sectie ${i.number}: alinea > 4 zinnen`)}return n.length?{status:"WARN",finding:"Narratieve discipline vertoont fragmentatie of te lange alinea's.",evidence:n.join(" | ")}:{status:"PASS",finding:"Narratieve discipline voldoet aan sectie- en alinearegels.",evidence:"Geen fragmentatie- of lengte-overtredingen gevonden."}}function ku(e){return["CRITIQUE",`Dominante these consistentie: ${e.dominantThesisConsistency.status}. ${e.dominantThesisConsistency.finding} Evidentie: ${e.dominantThesisConsistency.evidence}`,`Mechanisme-validatie: ${e.mechanismValidation.status}. ${e.mechanismValidation.finding} Evidentie: ${e.mechanismValidation.evidence}`,`Strategie-interventie consistentie: ${e.strategyInterventionConsistency.status}. ${e.strategyInterventionConsistency.finding} Evidentie: ${e.strategyInterventionConsistency.evidence}`,`Beslisdruk evaluatie: ${e.decisionPressureEvaluation.status}. ${e.decisionPressureEvaluation.finding} Evidentie: ${e.decisionPressureEvaluation.evidence}`,`Narrative helderheid: ${e.narrativeClarity.status}. ${e.narrativeClarity.finding} Evidentie: ${e.narrativeClarity.evidence}`].join(`

`)}function vu(e){const t=String(e.boardroomReport??"").trim(),n=pu(t),i=bu(t),r=hu(t),a=Eu(t),o=fu(t),s=[];n.status==="WARN"&&s.push("dominante_these"),i.status==="WARN"&&s.push("mechanismeketen"),r.status==="WARN"&&s.push("strategie_interventie_fit"),a.status==="WARN"&&s.push("beslisdruk"),o.status==="WARN"&&s.push("narratieve_discipline");const c={hasCriticalIssues:s.length>=2,missingSignals:s,dominantThesisConsistency:n,mechanismValidation:i,strategyInterventionConsistency:r,decisionPressureEvaluation:a,narrativeClarity:o};return{...c,critiqueText:ku(c)}}function Su(e,t){const n=String(e??""),i=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return n.match(new RegExp(`${i}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`,"i"))?.[1]?.trim()??""}function Iu(e,t,n){const i=String(e??""),r=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(r,"i").test(i)?i.replace(new RegExp(`${r}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`,"i"),`${t}

${String(n??"").trim()}
`):i}function Tu(e){return/\bZonder\b[\s\S]{0,120}\bbinnen\s+\d+\s*(?:dagen|maanden)\b/i.test(e)||/\bgeen nieuw initiatief zonder\b/i.test(e)||/\bDe Raad van Bestuur committeert zich aan\b/i.test(e)}function Nu(e){if(Tu(e))return{text:e,changed:!1};const t="### 12. BESLUITKADER",n=Su(e,t);if(!n)return{text:`${e.trim()}

Zonder consolidatie binnen 12 maanden verdwijnt structureel behandelcapaciteit en neemt liquiditeitsdruk toe.`.trim(),changed:!0};const r=`${n.trim()} Zonder consolidatie binnen 12 maanden verdwijnt structureel behandelcapaciteit en neemt liquiditeitsdruk toe.`.replace(/\s+/g," ").trim();return{text:Iu(e,t,r).trim(),changed:!0}}function Ru(e){const t=[];let n=String(e.boardroomReport??"").trim();(e.critique.narrativeClarity.status==="WARN"||e.critique.mechanismValidation.status==="WARN")&&(n=Fo({text:n}).composedText,t.push("Narratieve discipline hersteld via Context->Spanning->Mechanisme->Bestuurlijke implicatie."));const r=Nu(n);return n=r.text,r.changed&&t.push("Expliciete beslisdruk toegevoegd in besluitkader."),{rewrittenReport:n.trim(),changesApplied:t}}function Au(e,t){const n=String(e??""),i=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return n.match(new RegExp(`${i}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`,"i"))?.[1]?.trim()??""}function Ou(e){return String(e??"").replace(/\r\n/g,`
`).replace(/\s+/g," ").split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean)}function Cu(e){const t=Ou(e),n=t.filter(r=>/\b(actie|interventie|contractvloer|margekaart|besluittafel|75%-norm|capaciteit|escalatie|stopregel|verbreding)\b/i.test(r)),i=(n.length?n:t).slice(0,6);return i.length?i:["Geen expliciete interventies gevonden in sectie 10."]}function wu(e){return/\b(contract|verzekeraar|mandaat|centrale sturing|stopregel|portfolio)\b/i.test(e)?"hoog":/\b(capaciteit|planning|productiviteit|norm|escalatie|governance)\b/i.test(e)?"middel":"laag"}function ju(e,t){return t==="hoog"?`Deze interventie raakt externe afhankelijkheden of bestuurlijke machtsverdeling direct: ${e}`:t==="middel"?`Deze interventie vraagt strak uitvoeringsritme en gedragsverandering in teams: ${e}`:`Deze interventie is operationeel uitvoerbaar met beperkte structurele weerstand: ${e}`}function xu(e,t){return t==="hoog"?"Mitigeer via scenariovergelijking met expliciete trade-off op volumeverlies versus margeherstel en besluit met vooraf gedefinieerde escalatieregels.":t==="middel"?"Mitigeer via maandritme met eigenaar, KPI, correctie binnen 7 dagen en centrale opvolging van blokkades.":"Mitigeer via wekelijkse voortgangscontrole en directe correctie op afwijkingen."}function yu(e){return`EXECUTION VALIDATION

${e.map(n=>`Interventie: ${n.intervention} Uitvoeringsrisico: ${n.risk}. Waarom: ${n.reason} Mitigatie: ${n.mitigation}`).join(`

`)}`.trim()}function $u(e){const t=String(e.boardroomReport??"").trim(),n=Au(t,"### 10. 90-DAGEN INTERVENTIEPROGRAMMA"),r=Cu(n).map(a=>{const o=wu(a);return{intervention:a,risk:o,reason:ju(a,o),mitigation:xu(a,o)}});return{entries:r,validationText:yu(r),hasHighRisk:r.some(a=>a.risk==="hoog")}}function Z(e){const t=String(e??"").trim();return t?/[.!?]$/.test(t)?t:`${t}.`:"onvoldoende informatie beschikbaar."}function _u(e){return["0. Boardroom summary",`Organisatie: ${e.organisation}`,`Sector: ${e.sector}`,`Analyse datum: ${e.analysisDate}`,`Dominant risico: ${e.dominantRisk}.`,`Aanbevolen richting: ${e.recommendedOption}.`].join(`
`)}function zu(e){return"Welke keuze verlaagt nu het structurele risico zonder kwaliteit, teamstabiliteit en contractdiscipline te schaden?"}function Du(e){return[e.dominantRisk,e.strategyChallenge?.externalPressure||"",e.strategyChallenge?.requiredCondition||""].filter(Boolean).slice(0,3).map(n=>Z(n)).join(`

`)}function Lu(e){return[`OPERATIONEEL GEVOLG — ${Z(e.scenarios[0]?.risk||e.dominantRisk)}`,`FINANCIEEL GEVOLG — ${Z(e.strategyChallenge?.externalPressure||e.dominantRisk)}`,`ORGANISATORISCH GEVOLG — ${Z(e.strategyChallenge?.requiredCondition||`Het bestuur moet kiezen tussen ${e.strategicTension.optionA} en ${e.strategicTension.optionB}`)}`].join(`

`)}function Bu(e){const t=e.systemMechanism;return t?[`SYMPTOOM — ${Z(t.symptom)}`,`OORZAAK — ${Z(t.cause)}`,`MECHANISME — ${Z(t.mechanism)}`,`GEVOLG — ${Z(t.consequence)}`,`SYSTEEMDRUK — ${Z(t.systemPressure)}`,`BESTUURLIJKE IMPLICATIE — ${Z(t.boardImplication)}`].join(`
`):["SYMPTOOM — onvoldoende informatie beschikbaar.","OORZAAK — onvoldoende informatie beschikbaar.","MECHANISME — onvoldoende informatie beschikbaar.","GEVOLG — onvoldoende informatie beschikbaar.","SYSTEEMDRUK — onvoldoende informatie beschikbaar.","BESTUURLIJKE IMPLICATIE — onvoldoende informatie beschikbaar."].join(`
`)}function Gu(e){const t=e.strategicQuestions;return t?[`1. BESTAANSRECHT — ${Z(t.raisonDetre)}`,`2. MACHT — ${Z(t.powerStructure)}`,`3. BOTTLENECK — ${Z(t.bottleneck)}`,`4. BREUKPUNT — ${Z(t.failurePoint)}`,`5. BESTUURSVRAAG — ${Z(t.boardDecision)}`].join(`
`):["1. BESTAANSRECHT — onvoldoende informatie beschikbaar.","2. MACHT — onvoldoende informatie beschikbaar.","3. BOTTLENECK — onvoldoende informatie beschikbaar.","4. BREEKPUNT — onvoldoende informatie beschikbaar.","5. BESTUURSVRAAG — onvoldoende informatie beschikbaar."].join(`
`)}function Mu(e){const t=e.strategicPattern;return t?[`PRIMAIR PATROON — ${Z(t.primaryPattern)}`,`SECUNDAIR PATROON — ${Z(t.secondaryPattern)}`,`PATROONMECHANISME — ${Z(t.mechanism)}`,`PATROONRISICO — ${Z(t.dominantRisk)}`,`RATIONALE — ${Z(t.rationale)}`].join(`
`):["PRIMAIR PATROON — onvoldoende informatie beschikbaar.","SECUNDAIR PATROON — onvoldoende informatie beschikbaar.","PATROONMECHANISME — onvoldoende informatie beschikbaar.","PATROONRISICO — onvoldoende informatie beschikbaar."].join(`
`)}function Pu(e){return(e.strategicFailurePoints??[]).slice(0,5).map((n,i)=>[`Breukpunt ${i+1}`,`MECHANISME — ${Z(n.mechanism)}`,`SYSTEEMDRUK — ${Z(n.systemPressure)}`,`RISICO — ${Z(n.risk)}`,`BESTUURLIJKE TEST — ${Z(n.boardTest)}`].join(`
`)).join(`

`)}function Uu(e){return(e.boardroomRedFlags??[]).slice(0,6).map((n,i)=>[`Red flag ${i+1} — ${n.category}`,`BESCHRIJVING — ${Z(n.description)}`,`MECHANISME — ${Z(n.mechanism)}`,`BESTUURLIJKE VRAAG — ${Z(n.boardQuestion)}`].join(`
`)).join(`

`)}function Hu(e){const n=[...[{insight:`${e.dominantRisk}.`,mechanism:`Het mechanisme ligt in ${e.strategicTension.optionA.toLowerCase()} versus ${e.strategicTension.optionB.toLowerCase()}.`,implication:`BESTUURLIJKE CONSEQUENTIE
Bestuur moet prioritering, contractruimte en capaciteitsritme expliciet verbinden.`},...e.strategyChallenge?[{insight:Z(e.strategyChallenge.externalPressure),mechanism:Z(e.strategyChallenge.breakScenario),implication:`BESTUURLIJKE CONSEQUENTIE
${Z(e.strategyChallenge.requiredCondition)}`}]:[],...e.scenarios.map(i=>({insight:Z(i.name),mechanism:Z(i.mechanism),implication:`BESTUURLIJKE CONSEQUENTIE
${Z(i.governanceImplication)}`}))]];for(;n.length<7;)n.push({insight:`Vroegsignaal ${n.length+1}`,mechanism:`Stopregel en KPI moeten direct terugleiden naar ${e.recommendedOption.toLowerCase()}.`,implication:`BESTUURLIJKE CONSEQUENTIE
Bij afwijking volgt herbesluit op capaciteit, contractruimte of positionering.`});return n.slice(0,7).map((i,r)=>`Inzicht ${r+1}
INZICHT
${i.insight}
MECHANISME
${i.mechanism}
${i.implication}`).join(`

`)}function Ku(e){const t=`${e.dominantRisk} -> hogere druk op kerncapaciteit -> scherpere keuzevolgorde nodig -> bestuurlijke beheersbaarheid stijgt`,n=`${e.strategicTension.optionA} -> betere uitvoerbaarheid -> stabielere kwaliteit -> meer bestuurlijke rust`,i=`${e.strategicTension.optionB} -> hogere focus of andere instroomlogica -> verschuiving in portfolio -> expliciet herbesluit nodig`;return[t,n,i].join(`
`)}function Vu(e){const t=e.scenarios.map(i=>[`${i.name}`,`MECHANISME: ${i.mechanism}`,`RISICO: ${i.risk}`,`RELATIE TOT SPANNING: ${e.strategicTension.optionA} / ${e.strategicTension.optionB}`,`BESTUURLIJKE IMPLICATIE: ${i.governanceImplication}`].join(`
`)).join(`

`),n=e.interventions.slice(0,10).map((i,r)=>[`STOPREGEL ${r+1}`,`ACTIE: ${i.action}`,`RICHTING: ${e.recommendedOption}`,`WAAROM: ${i.reason}`,`RISICO: ${i.risk}`,`STOPREGEL: ${i.stopRule}`,`OWNER: ${i.owner||"Bestuur"}`,`DEADLINE: ${i.deadline||"30 dagen"}`,`KPI: ${i.KPI||"Meetbare verbetering op wachtdruk, marge of teamstabiliteit"}`].join(`
`)).join(`

`);return[`${e.organisation}`,`Sector: ${e.sector}`,`Analyse datum: ${e.analysisDate}`,"",_u(e),"","Besluitvraag",zu(),"","KERNPROBLEEM",`${e.dominantRisk}. De keuze loopt tussen ${e.strategicTension.optionA} en ${e.strategicTension.optionB}.`,"","KERNSTELLING",`${e.dominantRisk}. Het bestuur moet kiezen tussen ${e.strategicTension.optionA} en ${e.strategicTension.optionB}.`,"","Strategische kernvragen",Gu(e),"","Strategisch patroon",Mu(e),"","Systeemmechanisme",Bu(e),"","Feitenbasis",Du(e),"","Keuzerichtingen",e.decisionOptions.join(`
`),"","AANBEVOLEN KEUZE",`${e.recommendedOption}.`,"","Doorbraakinzichten","### NIEUWE INZICHTEN (KILLER INSIGHTS)",Hu(e),"","Mechanismeketens",Ku(e),"","Mogelijke ontwikkelingen",t,"","Bestuurlijke waarschuwingssignalen",Uu(e),"","Bestuurlijk actieplan",n,"","Strategische breukpunten",Pu(e),"","Besluitgevolgen",Lu(e)].filter(Boolean).join(`
`)}function Fu(e){const t=e.getUTCFullYear(),n=String(e.getUTCMonth()+1).padStart(2,"0"),i=String(e.getUTCDate()).padStart(2,"0");return`${t}-${n}-${i}`}function Wu(e){return String(e??"").replace(/\s+/g," ").trim()||"Onbekende organisatie"}function Ju(e){const t=String(e??"").replace(/\s+/g," ").trim();return t?/jeugdzorg/i.test(t)?"Jeugdzorg":/ggz/i.test(t)?"GGZ":t:"Onbekende sector"}function Zu(e){return{organisation:Wu(e.organisation||e.companyName||""),sector:Ju(e.sector||e.sectorSelected||""),analysisDate:String(e.analysisDate??"").trim()||Fu(e.now??new Date)}}function Di(e){return String(e??"").replace(/\s+/g," ").trim()}class Yu{detectStrategicOptions(t){return Array.from(new Set(t.map(n=>Di(n)).filter(Boolean))).slice(0,3)}identifyDominantTension(t,n){const[i,r]=this.detectStrategicOptions(t);return{optionA:i||"Optie A niet beschikbaar",optionB:r||"Optie B niet beschikbaar",dominantRisk:Di(n)||"onvoldoende informatie beschikbaar",decisionPressure:Di(n)||"Keuze-uitstel vergroot structurele schade sneller dan aanvullende activiteit die kan compenseren."}}validateOptionContrast(t){return!!(t.optionA&&t.optionB&&t.optionA.toLowerCase()!==t.optionB.toLowerCase())}}function qu(e){return String(e??"").replace(/\s+/g," ").trim()}function ot(e,t){return e.match(new RegExp(`\\b${t}\\b\\s*[:—-]\\s*(.+)$`,"im"))?.[1]?.trim()||""}class Qu{generateInterventions(t){const a=[...String(t??"").split(/\n\s*\n+/).map(o=>o.trim()).filter(o=>/\b(ACTIE|Actie|Maand)\b/.test(o)).map((o,s)=>({action:ot(o,"ACTIE")||ot(o,"Actie")||`Interventie ${s+1}`,reason:ot(o,"WAAROM DEZE INTERVENTIE")||"Interventie gekoppeld aan gekozen richting en uitvoeringsdruk.",risk:ot(o,"RISICO VAN NIET HANDELEN")||"Uitstel houdt druk op uitvoering en bestuurlijke beheersbaarheid in stand.",stopRule:ot(o,"STOPREGEL")||"Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes.",owner:ot(o,"Eigenaar")||ot(o,"VERANTWOORDELIJKE")||void 0,deadline:ot(o,"Deadline")||void 0,KPI:ot(o,"KPI")||void 0})).filter(o=>qu(o.action))];for(;a.length<10;){const o=a.length+1;a.push({action:`Interventie ${o}`,reason:"Interventie gekoppeld aan gekozen richting en uitvoeringsdruk.",risk:"Uitstel houdt druk op uitvoering en bestuurlijke beheersbaarheid in stand.",stopRule:"Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes.",owner:"Bestuur",deadline:`${Math.min(180,15*o)} dagen`,KPI:"Meetbare verbetering op wachtdruk, marge of teamstabiliteit"})}return a.slice(0,10)}assignOwner(t){return{...t,owner:t.owner||"Bestuur"}}generateStopRules(t){return{...t,stopRule:t.stopRule||"Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes."}}generateKPIs(t){return{...t,KPI:t.KPI||"Meetbare verbetering op wachtdruk, marge of teamstabiliteit"}}}const fa="strategic_case_store",ka="strategic_case_embeddings",va="decision_outcomes",In=[],Tn=[],Nn=[];function qo(){try{return typeof globalThis>"u"?null:globalThis.localStorage??null}catch{return null}}function Li(e,t){const n=qo();if(!n)return[...t];try{const i=n.getItem(e);if(!i)return[...t];const r=JSON.parse(i);return Array.isArray(r)?r:[...t]}catch{return[...t]}}function Bi(e,t){const n=qo();if(n)try{n.setItem(e,JSON.stringify(t))}catch{}}class Xu{listCases(){const t=Li(fa,In);return In.splice(0,In.length,...t),[...t]}upsertCase(t){const n=this.listCases(),i=n.findIndex(r=>r.case_id===t.case_id);i>=0?n[i]=t:n.push(t),In.splice(0,In.length,...n),Bi(fa,n)}listEmbeddings(){const t=Li(ka,Tn);return Tn.splice(0,Tn.length,...t),[...t]}upsertEmbedding(t){const n=this.listEmbeddings(),i=n.findIndex(r=>r.case_id===t.case_id);i>=0?n[i]=t:n.push(t),Tn.splice(0,Tn.length,...n),Bi(ka,n)}listOutcomes(){const t=Li(va,Nn);return Nn.splice(0,Nn.length,...t),[...t]}upsertOutcome(t){const n=this.listOutcomes(),i=n.findIndex(r=>r.outcome_id===t.outcome_id);i>=0?n[i]=t:n.push(t),Nn.splice(0,Nn.length,...n),Bi(va,n)}}function Gi(e,t){const n=new Set(String(e??"").toLowerCase().split(/\s+/).filter(a=>a.length>4)),i=new Set(String(t??"").toLowerCase().split(/\s+/).filter(a=>a.length>4));if(!n.size||!i.size)return 0;let r=0;return n.forEach(a=>{i.has(a)&&(r+=1)}),r/Math.max(n.size,i.size)}function Sa(e){switch(e){case"hoog":return 1;case"middel":return .6;case"laag":return .25;default:return .5}}class eg{store=new Xu;storeCase(t){this.store.upsertCase(t)}detectPattern(t){return/\b(consortium|triage|gemeent|contract)\b/i.test(t)?"Extern gestuurde instroom- en contractlogica":/\b(marge|kostprijs|tarief|plafond)\b/i.test(t)?"Margedruk en contractdiscipline":"Nog geen dominant patroon vastgesteld"}findSimilarCases(t){return this.store.listCases().map(n=>({item:n,score:Gi(t,n.dominant_problem)})).filter(n=>n.score>.15).sort((n,i)=>i.score-n.score).slice(0,5).map(n=>n.item)}rankRecommendations(t,n){const i=this.store.listOutcomes(),r=new Map;return this.store.listCases().map(a=>{const o=Gi(t,a.dominant_problem),s=i.filter(g=>g.case_id===a.case_id).sort((g,m)=>Date.parse(m.evaluation_date)-Date.parse(g.evaluation_date))[0],c=!!n&&a.sector.toLowerCase()===String(n).toLowerCase(),l=a.gekozen_strategie||a.strategic_options[0]||"",u=o*60+(c?20:0)+Sa(s?.outcome_score)*20;return{item:a,recommendation:l,overlap:o,sectorMatch:c,weightedScore:u,averageOutcomeScore:Sa(s?.outcome_score)*100}}).filter(a=>a.recommendation&&a.overlap>.15).forEach(a=>{const o=r.get(a.recommendation)||{supportCount:0,weightedScoreTotal:0,averageOutcomeScoreTotal:0,evidenceCaseIds:[],sectorMatch:!1};o.supportCount+=1,o.weightedScoreTotal+=a.weightedScore,o.averageOutcomeScoreTotal+=a.averageOutcomeScore,o.evidenceCaseIds.push(a.item.case_id),o.sectorMatch=o.sectorMatch||a.sectorMatch,r.set(a.recommendation,o)}),Array.from(r.entries()).map(([a,o])=>({recommendation:a,weightedScore:Math.round(o.weightedScoreTotal/o.supportCount),supportCount:o.supportCount,averageOutcomeScore:Math.round(o.averageOutcomeScoreTotal/o.supportCount),sectorMatch:o.sectorMatch,evidenceCaseIds:o.evidenceCaseIds})).sort((a,o)=>o.weightedScore-a.weightedScore).slice(0,5)}linkOutcome(t,n){this.store.upsertOutcome({case_id:t,...n})}trackOutcome(t,n){const i=this.findSimilarCases(t),r=this.store.listOutcomes(),a=this.rankRecommendations(t,n),o=i.length?Math.round(Gi(t,i[0].dominant_problem)*100):0,c=r.find(l=>i.some(u=>u.case_id===l.case_id))?.outcome_summary||i[0]?.resultaat||"Geen historisch outcome-signaal beschikbaar";return{similarCases:i,patternMatchScore:o,historicalOutcome:c,dominantRecommendation:a[0]?.recommendation,rankedRecommendations:a}}}function tg(e){return String(e??"").replace(/\s+/g," ").trim()}function Rn(e,t){return e.test(t)}function ng(e,t){return Rn(/\bbrede ambulante specialist|ambulante\b/i,`${e} ${t}`)?["Breed zorgaanbod en maatwerk als kern van de positionering","Regionale samenwerking als toegangspoort tot instroom","Capaciteitsflexibiliteit via mix van vast en flexibel personeel"]:["Huidige strategie steunt op samenhang tussen propositie, capaciteit en sturing","Uitvoerbaarheid vraagt expliciete keuzevolgorde","Governance bepaalt of spanning corrigeerbaar blijft"]}function ig(e){const t=[];return Rn(/\bgemeent|jeugdwet|contract/i,e)&&t.push("Gemeentelijke contractlogica en budgetstructuur"),Rn(/\bconsortium|triage|toegang/i,e)&&t.push("Consortiumtriage en regionale toegang"),Rn(/\bpersoneel|schaarste|zzp|werkdruk/i,e)&&t.push("Personeelsschaarste en capaciteitsdruk"),Rn(/\bbudget|tarief|marge|kostprijs/i,e)&&t.push("Budgetdruk en beperkte financieringslogica"),Array.from(new Set(t))}function Ia(e,t){return/Gemeentelijke contractlogica/i.test(t)?{mechanism:e,systemPressure:t,risk:"Brede aanbieders verliezen economische ruimte wanneer contractering specialisatie of lagere kosten bevoordeelt.",boardTest:"Wat gebeurt er als gemeenten binnen drie jaar vooral specialistische aanbieders contracteren?"}:/Consortiumtriage/i.test(t)?{mechanism:e,systemPressure:t,risk:"De organisatie verliest stuurkracht als instroom, matching en wachtdruk vooral buiten de eigen governance worden bepaald.",boardTest:"Wat gebeurt er als consortiumtriage structureel casuistiek toewijst die wel complexer maar niet rendabeler is?"}:/Personeelsschaarste/i.test(t)?{mechanism:e,systemPressure:t,risk:"Breedte wordt bestuurlijk onhoudbaar wanneer capaciteitsdruk sneller stijgt dan teams specialistische continuiteit kunnen borgen.",boardTest:"Wat gebeurt er als retentie daalt terwijl gemeenten wel op volume en bereik blijven drukken?"}:{mechanism:e,systemPressure:t,risk:"De gekozen strategie breekt wanneer externe druk harder toeneemt dan bestuurlijke correctie kan compenseren.",boardTest:"Welke bestuurlijke keuze wordt onvermijdelijk als deze afhankelijkheid binnen twaalf maanden verslechtert?"}}class rg{run(t){const n=`${t.sourceText||""}
${t.dominantRisk||""}
${(t.options||[]).join(`
`)}`,i=tg(t.strategy||t.options?.[0]||""),r=ng(i,n),a=ig(n),s=[...a.map((c,l)=>Ia(r[l%r.length]||i||"Strategisch kernmechanisme",c))];for(;s.length<3;)s.push(Ia(r[s.length%r.length]||"Strategisch kernmechanisme",a[s.length%a.length]||"Externe systeemdruk"));return s.slice(0,5)}}function Pt(e){return String(e??"").replace(/\s+/g," ").trim()}function Bt(e,t){return e.test(t)}function Be(e){const t=Pt(e);return t?/[.!?]$/.test(t)?t:`${t}.`:"onvoldoende informatie beschikbaar."}function ag(e,t,n){const i=t||"Wachtdruk, contractspanning en capaciteitsdruk lopen tegelijk op in de ambulante jeugdzorg",r=Bt(/\bconsortium|triage|toegang\b/i,e)?"Instroom en toewijzing worden mede buiten de eigen organisatie bepaald via consortium en regionale triage":"Instroom en capaciteit bewegen niet volledig op hetzelfde bestuurlijke ritme",a=Bt(/\bgemeent|contract|budget\b/i,e)?"Een breed ambulant model moet functioneren binnen gemeentelijke contractruimte, regionale triage en budgetgedreven capaciteit":"De strategie moet tegelijk kwaliteit, bereik en uitvoerbaarheid dragen binnen externe contract- en budgetkaders",o=Bt(/\bspecialisatie|niche\b/i,`${e} ${n}`)?"Breedte wordt kwetsbaar zodra externe partijen specialisatie en scherpere financieringslogica belonen":"Verbreding vergroot sneller de bestuurlijke druk dan extra activiteit die spanning kan compenseren",s=[Bt(/\bgemeent|contract|budget\b/i,e)?"gemeentelijke contractlogica":"",Bt(/\bconsortium|triage|toegang\b/i,e)?"consortiumtriage":"",Bt(/\bzzp|personeel|arbeidsmarkt|schaarste|werkdruk\b/i,e)?"personeelsschaarste":""].filter(Boolean).join(", ");return{symptom:Be(i),cause:Be(r),mechanism:Be(a),consequence:Be(o),systemPressure:Be(s||"externe systeemdruk op instroom, capaciteit en contractdiscipline"),boardImplication:Be(`Bestuur moet ${Pt(n).toLowerCase()||"de gekozen richting"} alleen voortzetten als instroomlogica, contractruimte en kerncapaciteit bestuurlijk verdedigbaar blijven`)}}function og(e,t,n){return{symptom:Be(t||"Operationele druk en strategische versnippering lopen op"),cause:Be("Externe druk, interne uitvoerbaarheid en bestuurlijke prioritering grijpen niet vanzelf in elkaar"),mechanism:Be(`De strategie ${Pt(n).toLowerCase()||"van de organisatie"} werkt alleen als capaciteit, sturing en marktdruk in hetzelfde ritme worden bestuurd`),consequence:Be("Zonder mechanische koppeling tussen keuze, capaciteit en correctie stapelen symptomen zich sneller op dan herstelmaatregelen"),systemPressure:Be(Pt(e).slice(0,220)||"externe marktdruk, capaciteitsdruk en bestuurlijke fragmentatie"),boardImplication:Be("Bestuur moet expliciet maken welk mechanisme de strategie draagt en bij welke systeemdruk herbesluit verplicht is")}}class sg{run(t){const n=Pt([t.sourceText,t.dominantRisk,t.strategy,t.externalPressure].filter(Boolean).join(" ")),i=Pt(t.dominantRisk||""),r=Pt(t.strategy||"");return Bt(/\b(jeugdzorg|ambulant|ambulante|consortium|triage|gemeent|contract|budget)\b/i,n)?ag(n,i,r):og(n,i,r)}}function sn(e){return String(e??"").replace(/\s+/g," ").trim()}function Qe(e){const t=sn(e);return t?/[.!?]$/.test(t)?t:`${t}.`:"onvoldoende informatie beschikbaar."}function cn(e,t){return e.test(t)}function cg(e,t){return e.decisionOptions,{raisonDetre:Qe("De organisatie ontleent haar bestaansrecht aan brede ambulante expertise, maatwerk per gezin en regionale samenwerking rond complexe jeugdcasuistiek"),powerStructure:Qe("De machtsstructuur loopt primair via gemeente naar consortium naar zorgorganisatie: gemeenten bepalen budget en contractruimte, het consortium beïnvloedt instroom en triage, de organisatie bepaalt de uitvoering"),bottleneck:Qe(cn(/\bcontract|budget\b/i,t)?"Het schaarsepunt ligt in teamcapaciteit binnen gemeentelijke contractruimte en budgetgedreven caseload":"Het schaarsepunt ligt in uitvoerbare capaciteit binnen externe instroom- en budgetgrenzen"),failurePoint:Qe(cn(/\bspecialisatie|niche\b/i,t)?"De strategie breekt wanneer gemeenten en regionale toegang sterker op niche-aanbieders en scherpere specialisatie gaan sturen dan op brede ambulante aanbieders":"De strategie breekt wanneer externe contractlogica minder ruimte laat voor brede ambulante uitvoering dan voor specialistische of goedkopere routes"),boardDecision:Qe(`Het bestuur moet kiezen of ${sn(e.organisation||"de organisatie")} brede ambulante expertise actief beschermt via contract- en consortiumsturing, of het portfolio selectiever versmalt richting specialisatie`)}}function lg(e,t){const n=sn(e.decisionOptions?.[0]||e.strategy||"de huidige strategie"),i=sn(e.decisionOptions?.[1]||"een alternatief strategisch pad");return{raisonDetre:Qe(`De organisatie verdient haar bestaansrecht doordat zij waarde levert die niet eenvoudig vervangbaar is binnen ${sn(e.sector||"haar markt")}`),powerStructure:Qe(cn(/\boverheid|gemeente|toezicht|contract\b/i,t)?"Externe financiers, contractpartijen en toezichthouders bepalen in hoge mate welke strategische ruimte werkelijk beschikbaar is":"Succes wordt bepaald door de actor die instroom, prijslogica of toegang tot schaarse middelen controleert"),bottleneck:Qe(cn(/\btalent|personeel|arbeidsmarkt\b/i,t)?"De primaire bottleneck ligt in talent en uitvoerbare capaciteit":cn(/\bkapitaal|cash|burn\b/i,t)?"De primaire bottleneck ligt in kapitaal en financieringsruimte":"De primaire bottleneck ligt in het schaarsepunt dat groei of herstel bestuurlijk begrenst"),failurePoint:Qe(`De strategie faalt zodra ${n.toLowerCase()} niet langer bestand is tegen externe systeemdruk of sneller waarde verliest dan ${i.toLowerCase()}`),boardDecision:Qe(`Het bestuur moet beslissen tussen ${n} en ${i}, en expliciet maken welke randvoorwaarden morgen bestuurlijk worden afgedwongen`)}}class dg{run(t){const n=sn([t.organisation,t.sector,t.strategy,t.dominantRisk,...t.decisionOptions??[],t.sourceText].filter(Boolean).join(" "));return cn(/\b(jeugdzorg|ambulant|consortium|triage|gemeent|contract|budget)\b/i,n)?cg(t,n):lg(t,n)}}function mr(e){return String(e??"").replace(/\s+/g," ").trim()}function Qo(e){const t=mr(e);return t?/[.!?]$/.test(t)?t:`${t}.`:"onvoldoende informatie beschikbaar."}function ug(e,t){switch(e){case"contractorganisatie":return[/\bcontract|gemeent|gemeente|verzekeraar|budget|tarief|inkoop|plafond\b/i,/\bjeugdzorg|ggz|zorg\b/i,/\bconsortium|triage|toegang\b/i].filter(n=>n.test(t)).length;case"capaciteitsorganisatie":return[/\bpersoneel|talent|capaciteit|caseload|retentie|schaarste|zzp|teams\b/i,/\bkwaliteit|expertise|professionals\b/i].filter(n=>n.test(t)).length;case"platformorganisatie":return[/\bplatform|marktplaats|gebruikers|netwerkeffect|vraag en aanbod\b/i,/\bkritische massa|transactie|liquiditeit\b/i].filter(n=>n.test(t)).length;case"specialist":return[/\bniche|speciali|expertise|topkliniek|boutique|hoogwaardig\b/i,/\breputatie|prijs|onderscheid\b/i].filter(n=>n.test(t)).length;case"portfolio-organisatie":return[/\bportfolio|mix|productlijn|zorgvorm|holding|groep\b/i,/\brisicospreiding|versnippering|allocatie\b/i].filter(n=>n.test(t)).length;case"netwerkorganisatie":return[/\bconsortium|netwerk|partners|alliantie|franchise|samenwerking\b/i,/\bbereik|partnerschap|regionaal\b/i].filter(n=>n.test(t)).length;case"missieorganisatie":return[/\bmissie|impact|maatschappelijk|waarden|onderwijs|ngo|preventie\b/i,/\blegitimiteit|publiek|doel\b/i].filter(n=>n.test(t)).length}}function gg(e,t,n){return e==="contractorganisatie"&&t==="capaciteitsorganisatie"?"Contractlogica bepaalt budgetruimte, budgetruimte bepaalt capaciteit en capaciteit bepaalt hoeveel strategie uitvoerbaar blijft.":e==="netwerkorganisatie"&&t==="contractorganisatie"?"Partners en regionale toegang bepalen bereik, maar contractruimte bepaalt hoeveel van dat bereik financieel houdbaar is.":e==="platformorganisatie"?"Netwerkvolume vergroot waarde, meer waarde trekt meer gebruikers en die lus bepaalt de strategische uitkomst.":e==="specialist"?"Expertise bouwt reputatie, reputatie trekt vraag en vraag legitimeert prijs en positionering.":e==="portfolio-organisatie"?"De mix van activiteiten bepaalt risicospreiding, focus en bestuurlijke complexiteit.":e==="missieorganisatie"?"Impact creëert legitimiteit, legitimiteit trekt financiering en financiering houdt de missie uitvoerbaar.":mr(n).includes("partner")?"Samenwerking bepaalt capaciteit en bereik; bestuurlijke invloed bepaalt of dat netwerk strategisch werkt.":"Het primaire patroon bepaalt de strategische ruimte en het secundaire patroon bepaalt waar de uitvoering begrensd raakt."}function mg(e,t){return Qo(`Primair patroon is ${e} en secundair patroon is ${t}, omdat financieringslogica en schaalmechanisme niet door één enkele interne factor worden bepaald`)}function pg(e,t){return e==="contractorganisatie"?"Verandering in contractlogica of budgetruimte verschuift direct de strategische speelruimte.":e==="capaciteitsorganisatie"?"Verlies van schaars talent vertaalt zich direct naar minder capaciteit, lagere kwaliteit en lagere opbrengst.":e==="netwerkorganisatie"?"Verlies van invloed in het netwerk verkleint bereik en bestuurlijke stuurkracht tegelijk.":e==="platformorganisatie"?"Verlies van kritische massa ondermijnt de waardecreatie van het hele model.":e==="specialist"?"Verouderde expertise of verlies van reputatie tast vraag en prijszetting direct aan.":e==="portfolio-organisatie"?"Versnippering over te veel activiteiten verlaagt focus en bestuurlijke beheersbaarheid.":"Onduidelijke impact verzwakt legitimiteit en daarmee de ruimte voor financiering en continuiteit."}class bg{run(t){const n=mr([t.sector,t.dominantRisk,t.recommendedOption,...t.decisionOptions??[],t.sourceText].filter(Boolean).join(" ")),i=["contractorganisatie","capaciteitsorganisatie","platformorganisatie","specialist","portfolio-organisatie","netwerkorganisatie","missieorganisatie"].map(o=>({pattern:o,score:ug(o,n)})).sort((o,s)=>s.score-o.score),r=i[0]?.pattern||"capaciteitsorganisatie";let a=i.find(o=>o.pattern!==r&&o.score>0)?.pattern;return a||(a=r==="contractorganisatie"?"capaciteitsorganisatie":r==="capaciteitsorganisatie"||r==="netwerkorganisatie"?"contractorganisatie":"capaciteitsorganisatie"),{primaryPattern:r,secondaryPattern:a,mechanism:Qo(gg(r,a,n)),rationale:mg(r,a),dominantRisk:pg(r)}}}function Xo(e){return String(e??"").replace(/\s+/g," ").trim()}function Mi(e){const t=Xo(e);return t?/[.!?]$/.test(t)?t:`${t}.`:"onvoldoende informatie beschikbaar."}function ze(e,t){return e.test(t)}function st(e,t,n,i,r){e.some(a=>a.category===t)||e.push({category:t,description:Mi(n),mechanism:Mi(i),boardQuestion:Mi(r)})}class hg{run(t){const n=Xo([t.sector,t.dominantRisk,t.recommendedOption,...t.decisionOptions??[],t.sourceText].filter(Boolean).join(" ")),i=[];for(ze(/\bgroei|verbreding|opschalen|uitbreiding\b/i,n)&&!ze(/\bmechanisme|capaciteit|contract|partner|netwerk\b/i,n)&&st(i,"groei zonder mechanisme","De organisatie spreekt over groei of verbreding zonder hard schaalmechanisme.","Groeiambitie zonder expliciete koppeling aan contractruimte, capaciteit of netwerklogica blijft bestuurlijk wensdenken.","Welk mechanisme laat deze strategie daadwerkelijk groeien zonder de kernoperatie te overbelasten?"),ze(/\bgemeent|consortium|verzekeraar|contract|triage|toegang\b/i,n)&&st(i,"strategie zonder macht","De strategie veronderstelt ruimte die feitelijk door externe partijen wordt begrensd.","Instroom, contractvolume of budgetruimte worden mede buiten de eigen organisatie bepaald.","Welke strategische keuze blijft over als de organisatie zelf de instroom- of contractlogica niet controleert?"),ze(/\bbreed|verbreding|portfolio|pilot|project|innovatie|meer diensten\b/i,n)&&ze(/\bcapaciteit|team|werkdruk|personeel|caseload\b/i,n)&&st(i,"complexiteitsexplosie","De organisatie voegt strategische complexiteit sneller toe dan capaciteit kan absorberen.","Meer diensten, initiatieven of positioneringen vergroten bestuurlijke en operationele druk zonder proportionele capaciteitsgroei.","Welke activiteiten worden expliciet gestopt als de organisatie breedte wil behouden?"),ze(/\bconsortium|gemeent|partner|alliantie|toegang\b/i,n)&&st(i,"afhankelijkheid buiten organisatie","Kritische sturing ligt buiten de eigen organisatie.","Externe partijen beïnvloeden toegang, budget of bereik sterker dan interne planning alleen kan corrigeren.","Hoe beschermt het bestuur de strategie als consortium, gemeente of partnerlogica verandert?"),st(i,"strategie zonder stopregel","De strategie bevat gemakkelijk meer ambitie dan expliciete exitcriteria.","Zonder stopregels blijven verbreding, innovatie of prioriteiten vaak doorlopen ondanks tegenvallende uitvoerbaarheid.","Bij welke KPI-, marge- of capaciteitsgrens moet het bestuur de gekozen richting direct heroverwegen?"),(ze(/\bkpi|dashboard|wachttijd|cliënten|volume|activiteit\b/i,n)||!ze(/\bmarge|rendabiliteit|contractmix|caseload\b/i,n))&&st(i,"kpi's zonder strategische betekenis","Er is risico dat de organisatie vooral meet wat zichtbaar is en niet wat strategisch bepalend is.","Activiteits-KPI's zeggen weinig als ze niet gekoppeld zijn aan marge, contractkwaliteit, caseload of portfolio-effect.","Welke drie KPI's voorspellen daadwerkelijk of de strategie bestuurlijk werkt?"),ze(/\binnovatie|pilot|experiment|nieuwe methodiek|nieuw project\b/i,n)&&ze(/\bteam|capaciteit|werkdruk|personeel\b/i,n)&&st(i,"innovatie zonder capaciteit","Nieuwe initiatieven kunnen sneller starten dan de organisatie ze uitvoerbaar kan dragen.","Innovatie trekt aandacht, tijd en specialistische capaciteit weg uit de kernoperatie.","Welke innovatie wordt gepauzeerd als de kerncapaciteit onder druk komt?"),(ze(/\bzal wel|hopelijk|verwacht|waarschijnlijk|vast|aanname|onderstelt\b/i,n)||!ze(/\bbewijs|aantoonbaar|meetbaar|norm\b/i,n))&&st(i,"strategie gebaseerd op aannames","De strategie lijkt deels te rusten op verwachtingen die nog niet hard zijn gevalideerd.","Aannames over steun van financiers, partners of marktgedrag kunnen de bestuurlijke logica vertekenen.","Welke kernveronderstelling moet eerst bewezen worden voordat deze strategie verder wordt uitgebreid?");i.length<3;)st(i,i.length===0?"strategie zonder stopregel":i.length===1?"kpi's zonder strategische betekenis":"strategie gebaseerd op aannames","De bestuurlijke logica vraagt explicietere toetsing voordat de strategie verder wordt uitgebouwd.","Zonder harde criteria blijft optimisme sterker dan corrigeerbare executielogica.","Welke bestuurlijke grens maakt deze strategie morgen toetsbaar?");return i.slice(0,8)}}function Ta(e){return String(e??"").replace(/\s+/g," ").trim()}function Eg(e){const t=`${e.sourceText||""}
${e.dominantRisk||""}`,n=(e.decisionOptions??[]).map(r=>Ta(r)).filter(Boolean),i=Ta(e.recommendedOption||n[0]||"Huidige strategie onvoldoende bepaald");return/\b(jeugdzorg|consortium|triage|gemeent|ambulant|contract)\b/i.test(t)?{currentStrategy:i,externalPressure:"Gemeenten en consortium sturen instroom, specialisatie en budgetruimte sterker dan de organisatie autonoom kan compenseren.",breakScenario:"De huidige brede ambulante strategie breekt wanneer contractruimte vernauwt en complexe instroom met wachtdruk blijft oplopen.",requiredCondition:"Breedte is alleen houdbaar als triage, contractafspraken en portfoliokeuzes expliciet worden aangescherpt."}:{currentStrategy:i,externalPressure:"Externe marktdruk en interne uitvoerbaarheid kunnen de huidige strategie sneller ondermijnen dan extra activiteit oplost.",breakScenario:"De huidige strategie breekt wanneer capaciteit, marge of governance structureel onder de vereiste drempel zakt.",requiredCondition:"De huidige koers blijft alleen houdbaar als bestuur mandaat, stopregels en sturing expliciet maakt."}}function nn(e){return String(e??"").replace(/\s+/g," ").trim()}function pr(e){return/\b(jeugdzorg|ambulant|ambulante|consortium|triage|gemeent|contract|budget)\b/i.test(e)}function fg(e){const t=`${e.dominantRisk||""}
${e.memoryProblemText||""}`,n=nn(e.dominantRisk||"");return pr(t)&&(!n||/\bbestuurlijke inertie\b/i.test(n)||!/\b(consortium|triage|gemeent|contract|budget|ambulant)\b/i.test(n))?"Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost":n||"onvoldoende informatie beschikbaar"}function kg(e){const t=(e.strategicOptions??[]).map(i=>nn(i)).filter(Boolean),n=`${t.join(" ")}
${e.memoryProblemText||""}
${e.dominantRisk||""}`;return pr(n)?["Brede ambulante specialist blijven binnen consortium- en contractdiscipline","Selectieve specialisatie / niche kiezen voor scherpere positionering","Consortiumstrategie verdiepen om instroom en triage actiever te sturen"]:t}function vg(e,t){return e.length>=3&&pr(`${e.join(" ")} ${t}`)?[{name:e[0],mechanism:"Behoud brede ambulante positionering, maar begrens verbreding op kerncapaciteit, contractruimte en kwaliteitsdiscipline.",risk:"De organisatie blijft bestuurlijk kwetsbaar als breedte behouden blijft zonder scherpere instroom- en portfoliokeuzes.",governanceImplication:"Bestuur moet kerncapaciteit prioriteren en verbreding alleen toestaan achter expliciete consortium- en contractgates."},{name:e[1],mechanism:"Versmal het aanbod zodat teams, kwaliteit en contractonderhandeling rond een scherper profiel georganiseerd worden.",risk:"Te snelle versmalling kan regionale relevantie en continuiteit van instroom aantasten.",governanceImplication:"Bestuur moet bepalen welke zorgvormen strategisch kern zijn en welke bewust worden afgebouwd."},{name:e[2],mechanism:"Vergroot invloed op regionale toegang door explicietere rol in consortium, triage en contractgesprekken.",risk:"Governancecomplexiteit stijgt als mandaat, eigenaarschap en regionale rolverdeling niet helder zijn.",governanceImplication:"Bestuur moet consortiumdoelen, mandaat en escalatieritme formeel vastleggen."}]:e.slice(0,3).map((n,i)=>({name:n||`Scenario ${String.fromCharCode(65+i)}`,mechanism:"onvoldoende informatie beschikbaar",risk:t||"onvoldoende informatie beschikbaar",governanceImplication:"onvoldoende informatie beschikbaar"}))}function Sg(e,t,n){const r=(String(e??"").match(/SCENARIO\s*[ABC][\s\S]*?(?=SCENARIO\s*[ABC]|###\s*SCENARIOVERGELIJKING|$)/gi)??[]).map((o,s)=>({name:o.match(/SCENARIO\s*[ABC]\s*[—-]?\s*(.+)$/im)?.[1]?.trim()||`Scenario ${String.fromCharCode(65+s)}`,mechanism:o.match(/STRATEGISCHE LOGICA:\s*(.+)$/im)?.[1]?.trim()||"onvoldoende informatie beschikbaar",risk:o.match(/RISICO'?S:\s*(.+)$/im)?.[1]?.trim()||"onvoldoende informatie beschikbaar",governanceImplication:o.match(/BESTUURLIJKE IMPLICATIE:\s*(.+)$/im)?.[1]?.trim()||o.match(/ORGANISATORISCHE CONSEQUENTIES:\s*(.+)$/im)?.[1]?.trim()||"onvoldoende informatie beschikbaar"})),a=r.some(o=>/\b(volumegroei|status quo|hybride|optie a\b|optie b\b|optie c\b)\b/i.test(`${o.name} ${o.mechanism} ${o.risk}`));return!r.length||a?vg(t,n):r}function Ig(){return[{action:"Bestuurlijke prioritering expliciet maken",reason:"Voorkomt parallelle prioriteiten zonder keuzevolgorde.",risk:"Uitstel vergroot druk op uitvoering en marge.",stopRule:"Herzie direct bij wachttijd > 12 weken of marge < 4%",owner:"Bestuur",deadline:"30 dagen",KPI:"Besluitdiscipline en wachtdruk verbeteren aantoonbaar"}]}function Tg(e){const t=Zu({organisation:e.organisation,sector:e.sector,analysisDate:e.analysisDate}),n=fg(e),i=kg(e),a=new Yu().identifyDominantTension(i,n),o=new Qu,s=new sg,c=new dg,l=new bg,u=new hg,g=o.generateInterventions(e.interventionOutput||"").map(N=>o.generateKPIs(o.generateStopRules(o.assignOwner(N)))),m=new eg,p=new rg,I=m.trackOutcome(nn(e.memoryProblemText||n||"onvoldoende informatie beschikbaar"),t.sector),T=I.rankedRecommendations.find(N=>i.some(j=>nn(j).toLowerCase()===N.recommendation.toLowerCase()))?.recommendation||I.dominantRecommendation,b=nn(e.recommendedOption||T||a.optionA||"onvoldoende informatie beschikbaar"),h=g.map((N,j)=>({...N,action:/^Interventie\s+\d+/i.test(N.action)?`${N.action}: borg ${j%2===0?"kerncapaciteit":"contractdiscipline"} rond ${b.toLowerCase()}`:N.action,reason:nn(`${N.reason} Gekoppeld aan ${b.toLowerCase()} en ${n.toLowerCase()}.`)})),d=Eg({dominantRisk:n,decisionOptions:i,recommendedOption:b,sourceText:e.memoryProblemText}),x=l.run({sector:t.sector,sourceText:e.memoryProblemText,dominantRisk:n,decisionOptions:i,recommendedOption:b});return{organisation:t.organisation,sector:t.sector,analysisDate:t.analysisDate,dominantRisk:n,strategicTension:{optionA:a.optionA,optionB:a.optionB},decisionOptions:i,recommendedOption:b,strategicPattern:x,strategyChallenge:d,systemMechanism:s.run({strategy:b,dominantRisk:x.dominantRisk||n,sourceText:`${e.memoryProblemText||""} ${x.mechanism} ${x.primaryPattern} ${x.secondaryPattern}`,externalPressure:d.externalPressure}),strategicQuestions:c.run({organisation:t.organisation,sector:t.sector,strategy:b,dominantRisk:n,decisionOptions:i,sourceText:e.memoryProblemText}),boardroomRedFlags:u.run({sector:t.sector,dominantRisk:n,sourceText:e.memoryProblemText,recommendedOption:b,decisionOptions:i}),strategicFailurePoints:p.run({strategy:b,options:i,dominantRisk:n,sourceText:e.memoryProblemText}),memoryInsights:{historicalOutcome:I.historicalOutcome,patternMatchScore:I.patternMatchScore,dominantRecommendation:I.dominantRecommendation,rankedRecommendations:I.rankedRecommendations},scenarios:Sg(e.scenarioSimulationOutput||"",i,n),interventions:h.length?h:Ig()}}function Ng(e){const t=Tg(e);return{analysisMap:t,challengeSummary:t.strategyChallenge?`${t.strategyChallenge.externalPressure} ${t.strategyChallenge.breakScenario}`:void 0,mechanismSummary:t.systemMechanism?`${t.systemMechanism.cause} ${t.systemMechanism.mechanism}`:void 0,questionSummary:t.strategicQuestions?`${t.strategicQuestions.raisonDetre} ${t.strategicQuestions.boardDecision}`:void 0,patternSummary:t.strategicPattern?`${t.strategicPattern.primaryPattern} ${t.strategicPattern.secondaryPattern}`:void 0,redFlagSummary:t.boardroomRedFlags?.[0]?`${t.boardroomRedFlags[0].category} ${t.boardroomRedFlags[0].description}`:void 0,pipeline:["dependency mapping","capacity analysis","red flag detection","source extraction","pattern detection","tension detection","five strategic questions","mechanism mapping","failure analysis","intervention design","evidence normalization","strategic tension detection","decision selection","scenario generation","intervention planning","section drafting","consistency validation","language lint","final render"]}}function Na(e){return String(e??"").split(/\n+/).map(t=>t.trim()).filter(Boolean)}class Rg{parseEvidence(t){return Na(t)}extractClaims(t){return Na(t).filter(n=>/[A-Za-zÀ-ÿ]/.test(n))}validateClaimsAgainstEvidence(t,n){const i=n.map(r=>r.toLowerCase());return t.map(r=>{const a=r.toLowerCase().split(/\s+/).filter(s=>s.length>5),o=n.filter((s,c)=>a.some(l=>i[c].includes(l)));return{claim:r,evidence:o.slice(0,3),grounded:o.length>=3}})}detectContradictions(t,n){const i=`${t.join(`
`)}
${n.join(`
`)}`,r=[];return/bestuurlijke inertie/i.test(i)&&/\b(consortium|triage|contract|budget)\b/i.test(i)&&r.push("Dominante claim stuurt op bestuurlijke inertie terwijl bewijs sterker wijst op extern gestuurde instroom- en contractlogica."),r}run(t){const n=this.parseEvidence(t.evidenceText),i=this.extractClaims(t.claimText),r=this.validateClaimsAgainstEvidence(i,n),a=this.detectContradictions(i,n),o=r.filter(c=>c.grounded).length,s=r.length===0?0:Math.round(o/r.length*100);return{dominantClaims:r,contradictorySignals:a,evidenceConfidenceScore:s}}}const Ag=3500,Og=6200,Cg=12,Ra=4200,wg=320,br=wl,ui="Gebruik gecombineerde broncontext: geüploade documenten + vrije tekst. Als bronnen botsen, benoem spanning expliciet en kies niet impliciet.",gi=`
BRONDISCIPLINE (ALTIJD GELDIG):
- Gebruik alleen feiten die aantoonbaar in geuploade documenten of expliciete contextvelden staan.
- Neem geen sectorsjabloon over als feit.
- Gebruik geen cijfers, percentages of bedragen zonder bron in de input.
- Als een gevraagde metriek ontbreekt in de bron, benoem dit expliciet als "niet onderbouwd in geüploade documenten".
`.trim(),hr="Als input dun is, blijf strikt brongebonden: benoem wat ontbreekt en verzin geen feiten.",Er="Bij minimale of vage input: gebruik alleen de aanwezige bronfragmenten, voeg geen sectoraannames toe en maak hiaten expliciet.",fr="Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Verbied generieke taal zoals 'default template', 'transformatie-template', 'governance-technisch', 'patroon', 'context is schaars', 'werk uit', 'mogelijk', 'lijkt erop dat', 'zou kunnen', 'men zou', 'belangrijke succesfactor', 'quick win' en 'low hanging fruit'.",Xe="Onvoldoende bestuurlijke scherpte",Zn=cr,ee="HGBCO_HARD_GATE_FAILED",es="Opportunity Cost MOET drie unieke lagen bevatten: 30 dagen (direct signaalverlies + eerste gedragsverschuiving), 90 dagen (zichtbare machtsverschuiving + structurele erosie), 365 dagen (systeemverschuiving + onomkeerbare positie + dominante coalitie). Maak na 12 maanden concreet wat niet zonder reputatieschade terug te draaien is.",ts="Bij elk absoluut €-bedrag: voeg direct de berekeningslogica toe (driver x volume x periode) met bronverwijzing; ontbreekt bron, markeer expliciet als niet onderbouwd in geüploade documenten.",ns="Sectie 8 bevat exact 6 interventies (2 per maand), elk met Probleem dat wordt opgelost, Concrete actie, Waarom deze interventie, Eigenaar, Deadline, Meetbare KPI, Escalatieregel, Gevolg voor organisatie, Gevolg voor klant/cliënt, Risico van niet handelen, Direct zichtbaar effect en Casus-anker.",jg=`
JE BENT CYNTRA CONTEXT ENGINE.
Reconstrueer de werkelijke situatie van de organisatie op basis van gebruikersinput, gespreksverslagen, uploads, cijfers en contextinformatie.
Geef geen advies, geen interventies en geen keuzes.
Richt je op systeembeschrijving, beperkingen en numerieke implicaties.
Gebruik alleen broninformatie; geen verzonnen cijfers.
`.trim(),xg=`
JE BENT CYNTRA STRUCTURELE DIAGNOSE ENGINE.
Je taak is het werkelijke probleem achter zichtbare symptomen te identificeren.
Geef geen advies, geen interventieontwerp, geen keuzeadvies.
Werk brongebonden en causaal.
`.trim(),yg=`
JE BENT CYNTRA STRATEGICREASONINGNODE.
Zoek systematisch naar:
1) Structurele beperkingen: contractplafonds, schaalgrenzen, verdienmodelproblemen, afhankelijkheid van derden.
2) Financiële logica: reken implicaties door, detecteer schaalplafonds en margedruk.
3) Strategische paradoxen: groeiambitie vs capaciteit, autonomie vs centrale sturing, kwaliteit vs productienorm.
4) Nieuwe zienswijzen: minimaal 3 perspectieven.

Output exact in dit format en herhaal het minimaal 3 keer:
STRATEGISCH INZICHT
LOGICA
BESTUURLIJKE IMPLICATIE

Geen interventieadvies.
`.trim(),$g=`
JE BENT CYNTRA ORGANISATIEDYNAMIEK ENGINE.
Analyseer gedrags- en machtsdynamiek in de organisatie.
Zoek naar besluitvermijding, onbenoemde conflicten, spanning tussen visie en realiteit en leiderschapsdynamiek.
Beschrijf exact: DYNAMIEK, GEDRAGSPATROON, IMPACT OP STRATEGIE.
Geef geen interventievoorstel.
`.trim(),_g=`
JE BENT CYNTRA BOARDROOM INTELLIGENCE NODE.
Analyseer formele en informele macht, belangen, besluitdynamiek, verborgen conflicten en leiderschapsdynamiek.
Genereer minimaal 3 boardroom-inzichten.
Gebruik exact labels:
BOARDROOM INZICHT
WAAROM DIT BESTUURLIJK BELANGRIJK IS
RISICO ALS DIT NIET WORDT GEADRESSEERD
Geen interventievoorstellen.
`.trim(),zg=`
JE BENT CYNTRA SCENARIO SIMULATION NODE.
Leid minimaal 3 scenario's direct af uit broninput, organisatiepositionering en sectorstructuur.
Broninput heeft prioriteit boven generieke strategiemodellen.
Verboden als standaardscenario: status quo, hybride, volumegroei, groei zonder context.
Per scenario verplicht:
SCENARIO
STRATEGISCHE LOGICA
FINANCIËLE CONSEQUENTIES
ORGANISATORISCHE CONSEQUENTIES
RISICO'S
LANGE TERMIJN EFFECT
Voeg toe:
### SCENARIOVERGELIJKING
VOORKEURSSCENARIO
WAAROM DIT HET MEEST ROBUUST IS
WELKE VOORWAARDEN NODIG ZIJN
Geen interventies.
`.trim(),Dg=`
JE BENT CYNTRA DECISION QUALITY NODE.
Toets kritisch of het gekozen besluit verstandig is op consistentie, risico, uitvoerbaarheid en scenario-robuustheid.
Geef scorecomponenten en totaalscore.
Geef ook flags:
INTERVENTIES INCONSISTENT: JA/NEE
SCENARIOANALYSE ONTBREEKT: JA/NEE
Geen interventieontwerp.
`.trim(),Lg=`
JE BENT CYNTRA STRATEGISCHE HYPOTHESE ENGINE.
Genereer minimaal 3 strategische opties: OPTIE A, OPTIE B, OPTIE C.
Laat de opties direct volgen uit de broninput. Gebruik geen generieke templates als de input al echte strategische richtingen bevat.
Als de bron expliciete keuzes bevat, hergebruik die keuzes in normale bestuurstaal.
Per optie exact:
VOORDEEL
NADEEL
RISICO
LANGE TERMIJN EFFECT
Geen interventies.
`.trim(),Bg=`
JE BENT CYNTRA INTERVENTIE ENGINE.
Ontwerp een concreet plan van aanpak.
Elke interventie bevat exact:
ACTIE
WAAROM DEZE INTERVENTIE
GEVOLG VOOR ORGANISATIE
GEVOLG VOOR KLANT/CLIËNT
RISICO VAN NIET HANDELEN
Maak minimaal zes interventies.
Voeg daarna een tijdlijn toe met: 0–30 dagen, 30–60 dagen, 60–90 dagen.
Werk brongebonden en concreet.
`.trim(),Gg=/\b(recommendation|in conclusion|quick\s+wins|accountability|roadmap|downside|upside|baseline|framework|stakeholder|governance\s+model)\b/i,Mg=/\b(overweeg|overwegen|misschien|mogelijk|wellicht|eventueel|zou kunnen|kan helpen|kan bijdragen|men zou)\b/i,Pg=/\b(gamechanger|disrupt|synergie|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|uniek verkoopargument|viral)\b/i,Ug=/\b(op basis van de analyse|het lijkt erop dat|als ai|als taalmodel|mogelijk is het)\b/i,Hg=/\b(belangrijke succesfactor|quick win|quick wins|low-hanging fruit|low hanging fruit|governance-technisch|default template|transformatie-template)\b/i,is=/\b(default template|transformatie-template|governance-technisch|aanname:|contextanker:|signat(?:ure)? layer waarschuwing)\b/i,rs=[/^\s*SIGNATURE LAYER WAARSCHUWING/i,/^\s*Aanname:/i,/^\s*Contextanker:/i,/^\s*beperkte context/i,/^\s*duid structureel/i],Kg=[/^\s*SIGNATURE LAYER WAARSCHUWING.*$/gim,/^\s*Contextsignaal:.*$/gim,/^\s*Aanname:.*$/gim,/^\s*Contextanker:.*$/gim,/^\s*beperkte context.*$/gim,/^\s*duid structureel.*$/gim,/\$\{facts\.[^}]+\}/gim],tt=["### 1. DOMINANTE THESE","### 2. KERNCONFLICT","### 3. STRATEGISCHE INZICHTEN","### 4. KEERZIJDE VAN DE KEUZE","### 5. PRIJS VAN UITSTEL","### 6. GOVERNANCE IMPACT","### 7. MACHTSDYNAMIEK","### 8. EXECUTIERISICO","### 9. STRATEGISCHE SCENARIOANALYSE","### 10. 90-DAGEN INTERVENTIEPROGRAMMA","### 11. BESLUITSKWALITEIT","### 12. BESLUITKADER"],Mt="### 3. STRATEGISCHE INZICHTEN",Aa=new Map,as={"### 1. DOMINANTE THESE":"De dominante bestuurlijke these is dat de organisatie niet vastloopt op intentie, maar op te veel gelijktijdige prioriteiten zonder harde volgorde. Mensen trekken hard aan hetzelfde doel, maar in de praktijk verschuift de uitkomst nog te vaak met de druk van de dag. In de bovenstroom lijkt de koers daardoor stabieler dan zij in de onderstroom werkelijk is. De kernvraag voor het bestuur blijft: versterkt deze keuze de regie aan de top, of vergroot zij opnieuw de bestuurlijke ruis.","### 2. KERNCONFLICT":"Het kernconflict is dat meerdere legitieme doelen tegelijk maximaal worden nagestreefd in een context waarin dat niet meer vanzelf samenvalt. De bovenstroom vraagt om tempo, voorspelbaarheid en margediscipline, terwijl de onderstroom vooral spanning voelt op werkdruk, autonomie en kwaliteit. Daardoor schuift het gesprek snel van inhoud naar positie. Zonder expliciete volgorde blijft dit conflict bestuurlijk onoplosbaar.","### 3. STRATEGISCHE INZICHTEN":"INZICHT: Financiële en operationele grenzen versnellen elkaar. WAAROM DIT BELANGRIJK IS: Zonder geïntegreerde doorrekening lijken losse verbeteringen mogelijk die in combinatie verlies vergroten. BESTUURLIJKE CONSEQUENTIE: Besluitvorming verschuift van initiatiefgestuurd naar constraint-gestuurd.","### 4. KEERZIJDE VAN DE KEUZE":"Keuzeconflict 1: centrale regie op instroom en planning verhoogt tempo en voorspelbaarheid, maar beperkt lokale beslisruimte. Keuzeconflict 2: brede uitzonderingsruimte verlaagt de spanning op korte termijn, maar verlengt margedruk en doorlooptijd op middellange termijn. In de bovenstroom lijken dit rationele keuzes; in de onderstroom gaan deze keuzes over verlies van invloed, ritme en routine. Keuzeconflicten worden pas werkbaar wanneer expliciet is wie wat tijdelijk inlevert.","### 5. PRIJS VAN UITSTEL":"30 dagen zonder hard besluit leidt meestal tot direct signaalverlies, meer ad-hoc herstelwerk en lagere voorspelbaarheid in de operatie. Na 90 dagen zie je dat terug in doorlooptijd, vervangingsdruk en oplopende frictie tussen formele prioriteiten en informele uitzonderingen. Op 365 dagen verschuift dit van tijdelijk ongemak naar structurele schade: lagere bestuurbaarheid, zwakkere marges en tragere executie. Na 12 maanden draait de organisatie niet meer op keuze maar op gewoonte, en wordt herstel aantoonbaar duurder in tijd, energie en vertrouwen.","### 6. GOVERNANCE IMPACT":"Governance-impact betekent hier: van persoonsafhankelijke sturing naar ritmegedreven besluitvorming met heldere mandaten. In de bovenstroom vraagt dat een vaste regietafel met eigenaarschap, KPI-definities en korte escalatielijnen. In de onderstroom vraagt het vooral consistentie: dezelfde regels, dezelfde termijnen en dezelfde toetsing. Pas dan neemt besluitkracht toe zonder dat teams het ervaren als willekeur of extra politieke druk.","### 7. MACHTSDYNAMIEK":"De feitelijke macht zit niet alleen in formele organogrammen, maar ook in intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor parallelle uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en marge. De COO levert informele speelruimte in, maar wint duidelijk mandaat op capaciteit en doorstroom. In de onderstroom blijft de gevoeligheid zitten in wie informatie doseert, wie escalaties versnelt of vertraagt en wie uitzonderingen als norm probeert te houden.","### 8. EXECUTIERISICO":"Het primaire executierisico is terugval in bekende patronen zodra de eerste spanning oploopt. Het faalpunt is bijna altijd hetzelfde: oude en nieuwe prioriteiten blijven naast elkaar bestaan zonder harde stopkeuze. De blocker zit dan niet in planvorming, maar in dubbelmandaat, vertraagde escalatie en stille heronderhandeling in de onderstroom. Dat maakt uitvoering traag, ook als de strategie op papier klopt.","### 9. STRATEGISCHE SCENARIOANALYSE":"SCENARIO A: CONSOLIDATIE. STRATEGISCHE LOGICA: stabilisatie van de kern met focus op margediscipline. FINANCIËLE CONSEQUENTIES: lagere variatie en voorspelbaardere kasdruk. ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en minder parallelle initiatieven. RISICO'S: tijdelijke groeivertraging. LANGE TERMIJN EFFECT: hogere robuustheid bij externe druk. SCENARIO B: GROEI. STRATEGISCHE LOGICA: versneld opschalen van activiteiten. FINANCIËLE CONSEQUENTIES: hogere investeringsbehoefte en groter margerisico bij tariefdruk. ORGANISATORISCHE CONSEQUENTIES: hogere managementbelasting en capaciteitskrapte. RISICO'S: overbelasting en versnippering. LANGE TERMIJN EFFECT: hoger potentieel, maar fragiel bij contractbeperkingen. SCENARIO C: HYBRIDE MODEL. STRATEGISCHE LOGICA: kern stabiliseren en gecontroleerd verbreden. FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk met gefaseerde investeringen. ORGANISATORISCHE CONSEQUENTIES: hogere complexiteit, maar bestuurbaar bij strakke governance. RISICO'S: sluipende scope-uitbreiding. LANGE TERMIJN EFFECT: adaptieve robuustheid. SCENARIOVERGELIJKING: per scenario worden voordelen, nadelen, risiconiveau en strategische robuustheid expliciet gewogen. VOORKEURSSCENARIO: hybride met consolidatie-eerst. WAAROM DIT HET MEEST ROBUUST IS: combineert risicobeheersing met gecontroleerde groei. WELKE VOORWAARDEN NODIG ZIJN: harde stopregels, capaciteitsdiscipline en contractvloer per verzekeraar.","### 10. 90-DAGEN INTERVENTIEPROGRAMMA":"Maand 1 (dag 1-30): stabiliseren en stop-doing vastzetten met exact twee interventies. Maand 2 (dag 31-60): governance en capaciteit herontwerpen met exact twee interventies. Maand 3 (dag 61-90): verankeren en contracteren met exact twee interventies. Elke interventie bevat actie, eigenaar, deadline, KPI, escalatiepad, effect op organisatie, effect op cliënt, direct zichtbaar effect en casus-anker.","### 11. BESLUITSKWALITEIT":"Besluitscore: 0/100. Belangrijkste risico's: nog te valideren op consistentie, uitvoerbaarheid en scenario-robuustheid. Uitvoerbaarheidsanalyse: governance, capaciteit en leiderschap bepalen realisatiekracht. Aanbevolen verbeteringen: versterk besluitlogica, risico-afdekking en herijkingsritme.","### 12. BESLUITKADER":"De Raad van Bestuur committeert zich aan: een bindende keuze met duidelijke eindverantwoordelijkheid, vaste termijnen en toetsbare resultaten. Per direct stopt parallelle sturing op dezelfde KPI's, en nieuwe niet-kerninitiatieven starten alleen na formele board-goedkeuring. Formeel betekent dit dat lokaal mandaat op intake, planning en uitzonderingen wordt beperkt; informeel betekent dit dat vertraagde bypass-routes niet langer geaccepteerd worden. Expliciet verlies: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom waar de druk disproportioneel is, en tijdelijke inlevering van lokale uitzonderingsruimte om centrale regie te herstellen."},Vg={"### 1. DOMINANTE THESE":{line:"Zonder volgorde wordt groei een versneller van verlies.",guard:/\bversneller van verlies\b/i},"### 2. KERNCONFLICT":{line:"Zonder volledige financiële transparantie blijft autonomie bestuurlijk fictief.",guard:/\bautonomie\b[\s\S]{0,80}\bfictief\b/i},"### 3. STRATEGISCHE INZICHTEN":{line:"Zonder expliciete logica blijft inzicht een observatie zonder bestuurlijke werking.",guard:/\binzicht\b[\s\S]{0,120}\bbestuurlijke\b/i},"### 4. KEERZIJDE VAN DE KEUZE":{line:"Wat niet op marge wordt gevalideerd, stopt.",guard:/\bwordt gevalideerd,\s*stopt\b/i},"### 5. PRIJS VAN UITSTEL":{line:"Uitstel verschuift dit vraagstuk van optimalisatie naar continuïteitsrisico.",guard:/\bcontinu[iï]teitsrisico\b/i},"### 6. GOVERNANCE IMPACT":{line:"Besluitrecht zonder afdwinging is procedure, geen governance.",guard:/\bgeen governance\b/i},"### 7. MACHTSDYNAMIEK":{line:"Waar informele macht niet wordt begrensd, wordt formeel besluitrecht uitgehold.",guard:/\bformeel besluitrecht uitgehold\b/i},"### 8. EXECUTIERISICO":{line:"Zonder stopregels blijft uitvoering ondergeschikt aan vermijding.",guard:/\bondergeschikt aan vermijding\b/i},"### 9. STRATEGISCHE SCENARIOANALYSE":{line:"Scenariovergelijking maakt bestuurlijke trade-offs expliciet en toetsbaar.",guard:/\bscenariovergelijking\b/i},"### 10. 90-DAGEN INTERVENTIEPROGRAMMA":{line:"Na dag 90 volgt mandaatverschuiving bij gate-falen.",guard:/\bmandaatverschuiving\b[\s\S]{0,40}\bgate-falen\b/i},"### 11. BESLUITSKWALITEIT":{line:"Een besluit zonder kwaliteitstoets vergroot de kans op strategische foutbesluiten.",guard:/\b(besluitscore|uitvoerbaarheidsanalyse|belangrijkste risico)/i},"### 12. BESLUITKADER":{line:"Terugdraaien kan alleen via formeel herbesluit met onderbouwing.",guard:/\bformeel herbesluit\b/i}};function An(e){return e.trim().split(/\s+/).filter(Boolean).length}function Fg(e){const t=String(e??"");let n=0;for(let i=0;i<t.length;i+=1)n=n*31+t.charCodeAt(i)>>>0;return`ctx_${n.toString(16)}`}function _n(e,t){const n=e.trim().split(/\s+/).filter(Boolean);return n.length<=t?e.trim():n.slice(0,t).join(" ").trim()}function A(e){return typeof e=="string"?e.trim():""}function kt(e,t){const n=String(e??"").trim();return n.length<=t?n:`${n.slice(0,t).trim()} ...`}function Wg(e){const t=String(e??"").trim().match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i);return t?{mime:String(t[1]||"application/octet-stream").toLowerCase(),payloadBase64:String(t[2]||"").trim()}:null}function os(e){try{return typeof atob!="function"?"":atob(e)}catch{return""}}function Oa(e){const t=os(e);if(!t)return"";try{const n=Uint8Array.from(t,i=>i.charCodeAt(0));return new TextDecoder("utf-8").decode(n)}catch{return t}}function Ca(e){return e.replace(/\\([\\()])/g,"$1").replace(/\\n/g," ").replace(/\\r/g," ").replace(/\\t/g," ").replace(/\\[0-7]{1,3}/g," ").replace(/\s+/g," ").trim()}function Jg(e){const t=[],n=/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g;let i=null;for(;(i=n.exec(e))!==null;){const s=Ca(i[1]||"");s.length>=2&&t.push(s)}const r=/\[(.*?)\]\s*TJ/gs;let a=null;for(;(a=r.exec(e))!==null;){const s=a[1]||"",c=/\(([^()]*(?:\\.[^()]*)*)\)/g;let l=null;for(;(l=c.exec(s))!==null;){const u=Ca(l[1]||"");u.length>=2&&t.push(u)}}if(t.length>=10)return kt(t.join(`
`),24e3);const o=e.match(/[A-Za-z0-9€%(),.;:'"\/\-_ ]{20,}/g)?.slice(0,500).join(`
`)||"";return kt(o,2e4)}function Zg(e){const t=A(e?.content);if(!t)return"";const n=Wg(t);if(!n)return kt(t,24e3);const i=n.mime;if(i.includes("pdf")){const a=os(n.payloadBase64),o=Jg(a);return o?`[PDF-TEXTEXTRACTIE]
${o}`:"[PDF-INHOUD NIET LEESBAAR IN TEKSTLAAG]"}if(i.startsWith("text/")||i.includes("json")||i.includes("xml")||i.includes("csv")){const a=Oa(n.payloadBase64);return kt(a,24e3)}const r=Oa(n.payloadBase64);return r.trim().length>=120?kt(r,18e3):`[BINAR DOCUMENT: ${i}]`}function Yg(e){return e.map(t=>({...t,content:Zg(t)}))}function qg(e,t,n){const i=e.slice(0,12).map((a,o)=>`Casusdocument ${o+1} (${a.filename}):
${kt(a.content,12e3)}`);return[gi,ui,i.length?`VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON):
${i.join(`

`)}`:"VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON): geen leesbare documenttekst gevonden; rapporteer hiaten expliciet.",t?`VRIJE TEKST CONTEXT (EXPLICIETE INPUT):
${kt(t,12e3)}`:"",n?`SAMENGEVATTE BRIEFCONTEXT:
${kt(n,12e3)}`:""].filter(Boolean).join(`

`)}function L(e,t){const n=e.indexOf(t);if(n<0)return"";const i=e.slice(n+t.length).trimStart(),r=i.search(/\n###\s*\d+\./);return r<0?i.trim():i.slice(0,r).trim()}function Ae(e,t,n){const i=e.indexOf(t);if(i<0)return e;const r=i+t.length,o=e.slice(r).search(/\n###\s*\d+\./),s=`
${n.trim()}
`;if(o<0)return`${e.slice(0,r)}${s}`.trim();const c=r+o;return`${e.slice(0,r)}${s}${e.slice(c).trimStart()}`.trim()}function Qg(e,t){const n="### 10. 90-DAGEN INTERVENTIEPROGRAMMA",i=L(e,n),r=String(t??"").trim();if(!i||!r||/\bEXECUTION VALIDATION\b/i.test(i))return e;const a=r.replace(/^EXECUTION VALIDATION\s*/i,"").trim(),o=`${i}

EXECUTION VALIDATION
${a}`.trim();return Ae(e,n,o)}function Xg(e,t,n,i){const r=/€|%|\\b\\d+\\b/.test(e)?`KPI: Behoud of herstel van ${e} binnen afgesproken bandbreedte`:`KPI: Meetwijze = wekelijkse trendverbetering op ${e} (zonder numerieke claim buiten input)`;return[`Probleem dat wordt opgelost: Onvoldoende bestuurlijke grip op ${e}.`,`Concrete actie: Veranker ${e} als besliscriterium in operationele weekstart ${t+1}.`,`Waarom deze interventie: Zonder expliciete sturing op ${e} blijft margedruk en uitvoeringsfrictie oplopen.`,`Eigenaar: ${n}`,`Deadline: Dag ${i}`,`Meetbare KPI: ${r.replace(/^KPI:\s*/i,"")}`,`Escalatieregel: Bij conflict beslist ${n} binnen 48 uur met RvB-escalatie.`,`Gevolg voor organisatie: Hogere uitvoerbaarheid op capaciteit en minder bestuurlijke ruis rond ${e}.`,`Gevolg voor klant/cliënt: Meer voorspelbare doorlooptijd en betere continuïteit binnen trajecten gekoppeld aan ${e}.`,`Risico van niet handelen: Oplopende wachttijd, lagere voorspelbaarheid en versnelde marge-erosie op ${e}.`,`Direct zichtbaar effect: Binnen 7 dagen minder frictie rond ${e}.`,`Casus-anker: ${e}`].join(`
`)}function wa(e,t){const n="### 10. 90-DAGEN INTERVENTIEPROGRAMMA",i=L(e,n),r=bn(t).slice(0,18),a=["CEO","CFO","COO","Programmadirecteur","Operationeel manager"],o=r.slice(0,2),s=r.slice(2,4),c=r.slice(4,6),l=(m,p)=>(m.length?m:p).map((I,T)=>Xg(I,T,a[T%a.length],10+T*3)),u=["MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN",...l(o,["intake","planning"]),"","MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN",...l(s,["contractvormen","capaciteit"]),"","MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN",...l(c,["mandaat","governance"]),"","Dag 30 gates: Stop-doing compliance + owner accountability bevestigd.","Dag 60 gates: Mandaatverschuiving + escalatiepad hard vastgelegd.","Dag 90 gates: Adoptie + impact aantoonbaar op kern-KPI en casus-ankers.","","BOVENSTROOM-DOELEN","1. Besluitrecht eenduidig en conflictescalatie binnen 48 uur.","","ONDERSTROOM-DOELEN","1. Informele bypasses dalen zichtbaar binnen 30 dagen."].join(`

`);return!i.includes("MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN")||!i.includes("MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN")||!i.includes("MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN")||(i.match(/\b(?:Concrete actie|Actie):/gi)??[]).length<6?Ae(e,n,u):e}function ja(e){const t="### 12. BESLUITKADER",n=L(e,t),i="De Raad van Bestuur committeert zich aan:",r=(o,s)=>{const c=o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return(n.match(new RegExp(`${c}\\s*(.+)`,"i"))?.[1]??s).trim()},a=[i,`Keuze: ${r("Keuze:","Eén dominante koers met expliciet mandaat.")}`,`Expliciet verlies: ${r("Expliciet verlies:","Tijdelijke inperking van lokale uitzonderingsruimte.")}`,`Besluitrecht ligt bij: ${r("Besluitrecht ligt bij:","CEO met formele board-borging.")}`,`Stoppen per direct: ${r("Stoppen per direct:","Parallelle prioriteiten zonder owner/KPI/deadline.")}`,`Niet meer escaleren: ${r("Niet meer escaleren:","Informele bypasses buiten de formele lijn.")}`,`Maandelijkse KPI: ${r("Maandelijkse KPI:","Trend op doorlooptijd, kwaliteit en uitvoeringsdiscipline.")}`,`Failure trigger: ${r("Failure trigger:","Twee opeenvolgende gate-failures op Dag 30/60/90.")}`,`Point of no return: ${r("Point of no return:","Na Dag 90 zonder meetbare trendbreuk wordt herstel disproportioneel duur.")}`,`Herijkingsmoment: ${r("Herijkingsmoment:","Maandelijks boardreview met expliciete keuze tot doorpakken of stoppen.")}`].join(`
`);return Ae(e,t,a)}function em(e){const t="1-PAGINA BESTUURLIJKE SAMENVATTING";if(e.includes(t))return e;const n=[t,"Besluit vandaag: consolideren 12 maanden; verbreding tijdelijk bevriezen.","Voorkeursoptie: consolidatiepad.","Expliciet verlies: tijdelijke groeivertraging buiten de kern, tijdelijke pauze op niet-kerninitiatieven, minder lokale uitzonderingsruimte.","Waarom onvermijdelijk: kosten- en tariefdruk plus contractplafonds blokkeren autonome groei zonder margeherstel.","30/60/90 meetpunten: Dag 30 margekaart 100%, Dag 60 contractvloer per verzekeraar, Dag 90 cash-scenario's + formeel strategiebesluit.","Als meetpunten niet gehaald worden: verbreding automatisch gepauzeerd tot formeel herstelbesluit."].join(`
`),r=e.indexOf("### 12. BESLUITKADER");return r<0?e:`${e.slice(0,r).trimEnd()}

${n}

${e.slice(r).trimStart()}`.trim()}function tm(e){const t="0 SITUATIERECONSTRUCTIE",n=["Feiten uit documenten:","Belangrijkste cijfers:","Organisatorische context:"];if(e.includes(t)&&n.every(o=>e.toLowerCase().includes(o.toLowerCase())))return e;const i=[t,"Feiten uit documenten: reconstrueer de feitelijke situatie op basis van geüploade documenten en expliciete contextvelden.","Belangrijkste cijfers: benoem expliciet broncijfers over kostprijs, tarieven, contractplafonds, loonkosten en capaciteit; ontbrekende cijfers markeren als niet onderbouwd.","Organisatorische context: maak zichtbaar hoe governance, capaciteit en teamdynamiek de strategische ruimte begrenzen."].join(`
`),a=e.indexOf("### 1. DOMINANTE THESE");return a<0?e:`${i}

${e.slice(a).trimStart()}`.trim()}function xa(e,t){const n="### HYPOTHESE CONCURRENTIE";if(e.includes(n))return e;const r=e.indexOf("### 1. DOMINANTE THESE");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function ya(e,t){const n="### CAUSALE MECHANISMEN";if(e.includes(n))return e;const r=e.indexOf("### 1. DOMINANTE THESE");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function $a(e,t){const n=On(t,/\bWAARSCHIJNLIJKSTE VERKLARING:\s*(.+)$/im)||"";if(!n)return e;const i="### 1. DOMINANTE THESE",r=L(e,i);return!r||/waarschijnlijkste verklaring/i.test(r)?e:Ae(e,i,`${r.trim()}

Waarschijnlijkste verklaring uit hypotheseconcurrentie: ${n}`)}function _a(e){if(e.includes(Mt)&&(e.match(/\bINZICHT:\b/gi)??[]).length>=3&&(e.match(/\bWAAROM DIT BELANGRIJK IS:\b/gi)??[]).length>=3&&(e.match(/\bBESTUURLIJKE CONSEQUENTIE:\b/gi)??[]).length>=3)return e;const n=[Mt,"INZICHT: Financiële schaalgrens wordt bepaald door contractplafonds en kostprijs per cliënt.","WAAROM DIT BELANGRIJK IS: Groei zonder margeherstel vergroot structurele druk en verkleint behandelcapaciteit.","BESTUURLIJKE CONSEQUENTIE: Prioriteit verschuift naar kernconsolidatie en contractdiscipline.","","INZICHT: Strategische paradox tussen kwaliteit, productienorm en transparantie remt uitvoerbaarheid.","WAAROM DIT BELANGRIJK IS: Zonder causaal gesprek over normdruk ontstaat vermijding en vertraagde correctie.","BESTUURLIJKE CONSEQUENTIE: Maandritme met expliciete normafwijking en snelle escalatie wordt verplicht.","","INZICHT: Afhankelijkheid van verzekeraars en plafondcontracten maakt autonome groei rekenkundig beperkt.","WAAROM DIT BELANGRIJK IS: Externe begrenzing vertaalt zich direct in cashrisico en wachtlijstdruk.","BESTUURLIJKE CONSEQUENTIE: Geen verbreding zonder margevalidatie en aantoonbare capaciteitsimpact."].join(`
`),i=e.includes(Mt)?e.replace(new RegExp(`${Mt.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}[\\s\\S]*?(?=\\n###\\s*4\\.\\s*KEERZIJDE\\s+VAN\\s+DE\\s+KEUZE|$)`,"i"),""):e,a=i.indexOf("### 4. KEERZIJDE VAN DE KEUZE");return a<0?`${i.trim()}

${n}`.trim():`${i.slice(0,a).trimEnd()}

${n}

${i.slice(a).trimStart()}`.trim()}function za(e,t){const n="### 7. MACHTSDYNAMIEK",i=L(e,n);if(!i)return e;const r=/\bwie heeft besluitmacht\b/i.test(i)&&/\bwie heeft informele invloed\b/i.test(i)&&/\bwaar zit de feitelijke macht\b/i.test(i),a=(i.match(/\bBOARDROOM INZICHT\b/gi)??[]).length>=3&&(i.match(/\bWAAROM DIT BESTUURLIJK BELANGRIJK IS\b/gi)??[]).length>=3&&(i.match(/\bRISICO ALS DIT NIET WORDT GEADRESSEERD\b/gi)??[]).length>=3;if(r&&a)return e;const s=String(t??"").match(/BOARDROOM INZICHT[\s\S]*?(?=BOARDROOM INZICHT|$)/gi)??[],c=(s.length?s:[]).slice(0,3),l=["BOARDROOM INZICHT: Formeel mandaat en informele invloed lopen niet parallel.","WAAROM DIT BESTUURLIJK BELANGRIJK IS: Besluiten lijken genomen, maar blokkeren in uitvoering.","RISICO ALS DIT NIET WORDT GEADRESSEERD: Uitstel wordt structureel en noodmaatregelen worden waarschijnlijker.","","BOARDROOM INZICHT: Belangenconflicten tussen kwaliteit, autonomie en marge worden niet expliciet geordend.","WAAROM DIT BESTUURLIJK BELANGRIJK IS: Zonder ordening stuurt elk team op eigen optimum.","RISICO ALS DIT NIET WORDT GEADRESSEERD: Bestuurlijke voorspelbaarheid en schaalbaarheid nemen af.","","BOARDROOM INZICHT: Besluitdynamiek wordt geremd door conflictmijding en consensusdruk.","WAAROM DIT BESTUURLIJK BELANGRIJK IS: Escalatie verschuift van inhoud naar timingverlies.","RISICO ALS DIT NIET WORDT GEADRESSEERD: Capaciteitsverlies en wachtrijdruk lopen sneller op."].join(`
`),u=["WIE HEEFT BESLUITMACHT: expliciet benoemd per bestuursrol.","WIE HEEFT INFORMELE INVLOED: zichtbaar in planning, informatie en uitzonderingsroutes.","WAAR ZIT DE FEITELIJKE MACHT: op knooppunten waar instroom, capaciteit en uitzonderingen samenkomen.","",(c.length?c.join(`

`):l).trim()].join(`
`),g=`${i.trim()}

${u}`.trim();return Ae(e,n,g)}function Da(e,t){const n="### 9. STRATEGISCHE SCENARIOANALYSE",i=L(e,n);if(/\bSCENARIO\s*A\b/i.test(i)&&/\bSCENARIO\s*B\b/i.test(i)&&/\bSCENARIO\s*C\b/i.test(i)&&/\bSCENARIOVERGELIJKING\b/i.test(i)&&/\bVOORKEURSSCENARIO\b/i.test(i))return e;const a=String(t??"").trim(),o=["SCENARIO A — CONSOLIDATIE","STRATEGISCHE LOGICA: stabilisatie van kernactiviteiten met focus op margediscipline.","FINANCIËLE CONSEQUENTIES: lagere variabiliteit in kasdruk en hogere voorspelbaarheid van margeherstel.","ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en lagere managementcomplexiteit.","RISICO'S: tijdelijke groeivertraging buiten de kern.","LANGE TERMIJN EFFECT: hogere bestuurlijke robuustheid onder contractdruk.","","SCENARIO B — GROEI","STRATEGISCHE LOGICA: uitbreiding van activiteiten voor schaal en marktbereik.","FINANCIËLE CONSEQUENTIES: hogere investeringsbehoefte en groter margerisico bij tariefdruk.","ORGANISATORISCHE CONSEQUENTIES: extra capaciteitsvraag en hogere leiderschapsbelasting.","RISICO'S: overbelasting, versnippering en uitvoeringsvertraging.","LANGE TERMIJN EFFECT: hoger potentieel, maar lagere schokbestendigheid zonder contractzekerheid.","","SCENARIO C — HYBRIDE MODEL","STRATEGISCHE LOGICA: kern stabiliseren en gecontroleerd verbreden via gefaseerde poorten.","FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk met gefaseerde investeringen en risicospreiding.","ORGANISATORISCHE CONSEQUENTIES: hogere complexiteit die bestuurbaar blijft bij harde governance.","RISICO'S: sluipende scope-uitbreiding en managementfrictie bij onduidelijk mandaat.","LANGE TERMIJN EFFECT: adaptieve robuustheid met behoud van strategische optionaliteit.","","### SCENARIOVERGELIJKING","SCENARIO A: voordelen = stabiliteit; nadelen = tragere groei; risiconiveau = laag-middel; strategische robuustheid = hoog.","SCENARIO B: voordelen = schaalpotentieel; nadelen = hoge kapitaal- en capaciteitsdruk; risiconiveau = hoog; strategische robuustheid = laag-middel.","SCENARIO C: voordelen = balans tussen stabiliteit en groei; nadelen = hogere coördinatiecomplexiteit; risiconiveau = middel; strategische robuustheid = hoog.","","VOORKEURSSCENARIO: SCENARIO C met consolidatie-eerst ritme.","WAAROM DIT HET MEEST ROBUUST IS: combineert margeherstel met gecontroleerde groei en beperkt downside-risico.","WELKE VOORWAARDEN NODIG ZIJN: contractdiscipline, capaciteitsgates, centrale prioritering en expliciete stopregels."].join(`
`);return Ae(e,n,a||o)}function La(e,t,n){const i="### 11. BESLUITSKWALITEIT",r=L(e,i);if(/\bBesluitscore\b/i.test(r)&&/\bBelangrijkste risico/i.test(r)&&/\bUitvoerbaarheidsanalyse\b/i.test(r)&&/\bAanbevolen verbeteringen\b/i.test(r)&&/\bDECISION CONTRACT\b/i.test(r))return e;const o=String(t??"").trim(),s=[`Besluitscore: ${Math.max(0,Math.min(100,Number.isFinite(n)?n:0))}/100.`,"Belangrijkste risico's: onderschatte complexiteit, externe afhankelijkheid, overbelasting van leiderschap en financiële kwetsbaarheid.","Uitvoerbaarheidsanalyse: uitvoerbaarheid vereist capaciteit, helder mandaat, governance-ritme en cultureel draagvlak.","Aanbevolen verbeteringen: verscherp scenario-keuze, borg risicoafdekking, koppel interventies aan capaciteit en stel harde herijkingsmomenten vast.","","DECISION CONTRACT","Besluit: gekozen scenario met expliciet mandaat.","Waarom dit besluit wordt genomen: hoogste robuustheid onder huidige beperkingen.","Welke verliezen worden geaccepteerd: tijdelijke groeivertraging en inperking van uitzonderingsruimte.","Welke meetpunten bepalen succes: dag 30, dag 60 en dag 90 gate-resultaten.","Wanneer het besluit wordt herzien: bij gate-failure of periodieke boardreview."].join(`
`);return Ae(e,i,o||s)}function nm(e){if(!e.similarCases.length)return["GEEN DIRECT VERGELIJKBARE CASES GEVONDEN","Analyse is uitgevoerd via strategische denkpatronen en systeemlogica."].join(`
`);const t=["VERGELIJKBARE CASES"];return e.similarCases.slice(0,5).forEach((n,i)=>{t.push(`CASE ${i+1}: ${n.caseId} (relevantie ${Math.round(n.relevance*100)}%)`),t.push(`WAT HET PROBLEEM WAS: ${n.keyProblem||"Onbekend probleemtype."}`),t.push(`WELKE STRATEGIE IS GEKOZEN: ${n.chosenStrategy||"Niet vastgelegd."}`),t.push(`WAT HET RESULTAAT WAS: ${n.resultSummary||"Niet vastgelegd in memory."}`),t.push(`WAAROM DIT RELEVANT IS VOOR DE HUIDIGE SITUATIE: overeenkomst op sector (${n.sector}) en probleemmechanisme.`)}),t.join(`
`)}function On(e,t){return String(e??"").match(t)?.[1]?.trim()??""}function im(e){return[...L(e,Mt).matchAll(/\bINZICHT:\s*(.+)$/gim)].map(i=>String(i[1]??"").trim()).filter(Boolean).slice(0,12)}function rm(e){const t=L(e,"### 10. 90-DAGEN INTERVENTIEPROGRAMMA");if(!t.trim())return[];const n=t.split(/\n{2,}/).map(i=>i.trim()).filter(Boolean).filter(i=>/(maand\s*[123]|dag\s*(30|60|90)|probleem|actie|owner|eigenaar|kpi|deadline|escalatie)/i.test(i));return n.length?n.slice(0,12):[t.trim()]}function am(e){return[...String(e??"").matchAll(/\bPATTERN NAAM:\s*(.+)$/gim)].map(n=>String(n[1]??"").trim()).filter(Boolean).slice(0,12)}function Ba(e,t){const n="### HISTORISCHE PATROONANALYSE";if(e.includes(n))return e;const r=e.indexOf("### 10. 90-DAGEN INTERVENTIEPROGRAMMA");if(r<0)return`${e.trim()}

${n}
${t}`.trim();const a=[t,"GEMEENSCHAPPELIJKE PATRONEN: contractdruk, capaciteitsspanning en governance-frictie bepalen vaak de uitkomst.","WELKE INTERVENTIES WERKTEN: bewezen interventies worden geprioriteerd wanneer context en risicoprofiel overeenkomen."].join(`
`);return`${e.slice(0,r).trimEnd()}

${n}
${a}

${e.slice(r).trimStart()}`.trim()}function Ga(e,t){const n="### STRATEGISCHE KENNISGRAPH INZICHTEN";if(e.includes(n))return e;const r=e.indexOf("### 10. 90-DAGEN INTERVENTIEPROGRAMMA"),a=[t,"VERGELIJKBARE ORGANISATIES: benut vergelijkbare organisaties als referentie, niet als kopie.","GEMEENSCHAPPELIJKE PROBLEMEN: valideer probleemcluster op causaliteit en sectorcontext.","MEEST EFFECTIEVE STRATEGIEËN: kies strategie op robuustheid en uitvoerbaarheid.","MEEST EFFECTIEVE INTERVENTIES: prioriteer interventies met bewezen effect in vergelijkbare context."].join(`
`);return r<0?`${e.trim()}

${n}
${a}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${a}

${e.slice(r).trimStart()}`.trim()}function Ma(e,t){const n="### STRATEGISCHE OPTIES EN BESLUITDRUK";if(e.includes(n))return e;const r=e.indexOf("### 12. BESLUITKADER");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function Pa(e,t){const n="### META-ANALYSE VAN DE REDENERING";if(e.includes(n))return e;const r=e.indexOf("### 11. BESLUITSKWALITEIT");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function Ua(e,t){const n="### BESTUURLIJKE BLINDE VLEKKEN";if(e.includes(n))return e;const r=e.indexOf("### 9. STRATEGISCHE SCENARIOANALYSE");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function Ha(e,t){const n="### STRATEGISCHE VOORUITBLIK";if(e.includes(n))return e;const r=e.indexOf("### 9. STRATEGISCHE SCENARIOANALYSE");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function Ka(e,t){const n="### ORGANISATIESIMULATIE";if(e.includes(n))return e;const r=e.indexOf("### 11. BESLUITSKWALITEIT");return r<0?`${e.trim()}

${n}
${t}`.trim():`${e.slice(0,r).trimEnd()}

${n}
${t}

${e.slice(r).trimStart()}`.trim()}function Va(e,t){const n=String(t.company_context??"");if(!n.includes("[SECTOR-LAYER | bron: extern | datum:"))return e;const r="### 1. DOMINANTE THESE",a=L(e,r);if(a.includes("[SECTOR-LAYER | bron: extern | datum:"))return e;const o=n.split(/\n{2,}/).find(g=>g.includes("[SECTOR-LAYER | bron: extern | datum:"));if(!o)return e;const s=bn(n).slice(0,3),c=`Relevantie voor deze casus: ${(s.length?s:["Niet onderbouwd in geüploade documenten of vrije tekst."]).join(", ")}`,u=`${o.split(`
`).filter(g=>!/€\\s*\\d|\\d+\\s*%/.test(g)).join(`
`)}
${c}

${a}`.trim();return Ae(e,r,u)}function kr(e){return(e.match(/[^.!?\n]+[.!?]?/g)??[]).map(t=>t.trim()).filter(Boolean)}function ss(e){return e.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function om(e){return/\bkpi\b|€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%/i.test(e)}function sm(e){return String(e??"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function Fa(e){return String(e??"").toLowerCase().replace(/\s+/g,"").replace(/eur/g,"€").replace(/,/g,".").trim()}function cm(e){const n=String(e??"").match(/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi)??[];return[...new Set(n.map(i=>i.trim()))]}function lm(e,t,n,i){const r=e.questions??{},a=[r.q1,r.q2,r.q3,r.q4,r.q5].map(s=>A(s)).filter(Boolean).join(`
`),o=t.slice(0,30).map(s=>`${s.filename}
${s.content}`).join(`

`);return[n,i,a,o].filter(Boolean).join(`

`)}function Zt(e,t){const n=new Set(cm(t).map(i=>Fa(i)));return n.size===0?e.replace(/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,"niet onderbouwd cijfer"):e.replace(/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,i=>{const r=Fa(i);return n.has(r)?i:"niet onderbouwd cijfer"})}function dm(e){const t=[];if(e.executive_thesis&&t.push(`Bestuurlijke these uit eerdere synthese: ${e.executive_thesis}`),e.central_tension&&t.push(`Kernconflict uit eerdere synthese: ${e.central_tension}`),e.strategic_narrative&&t.push(`Kernnarratief uit eerdere synthese: ${e.strategic_narrative}`),Array.isArray(e.key_tradeoffs)&&e.key_tradeoffs.length){const i=e.key_tradeoffs.map((r,a)=>{const o=A(r?.chosen_side)||"onbenoemd",s=A(r?.abandoned_side)||"onbenoemd",c=A(r?.consequence)||"consequentie niet benoemd";return`${a+1}. gekozen: ${o}; verlaten: ${s}; consequentie: ${c}`}).join(`
`);t.push(`Keuzeconflicten uit eerdere synthese:
${i}`)}Array.isArray(e.governance_risks)&&e.governance_risks.length&&t.push(`Governance-risico's:
${e.governance_risks.join(`
`)}`),Array.isArray(e.execution_risks)&&e.execution_risks.length&&t.push(`Executierisico's:
${e.execution_risks.join(`
`)}`);const n=e.executive_summary_block;if(n&&typeof n=="object"){const i=[];if(n.dominant_thesis&&i.push(`Dominante these: ${n.dominant_thesis}`),n.core_conflict&&i.push(`Kernconflict: ${n.core_conflict}`),n.tradeoff_statement&&i.push(`Keuzeconflict kern: ${n.tradeoff_statement}`),n.opportunity_cost){const r=n.opportunity_cost;i.push(`Opportunity cost 30/90/365: ${A(r.days_30||r.days_0)} | ${A(r.days_90)} | ${A(r.days_365||r.months_12)}`)}if(n.governance_impact){const r=n.governance_impact;i.push(`Governance impact: besluitkracht=${A(r.decision_power)}; escalatie=${A(r.escalation)}; diffuse verantwoordelijkheid=${A(r.responsibility_diffusion)}; machtscentralisatie=${A(r.power_centralization)}`)}if(n.power_dynamics){const r=n.power_dynamics;i.push(`Machtsdynamiek: machtverlies=${A(r.who_loses_power)}; informele invloed=${A(r.informal_influence)}; sabotagetechnieken=${A(r.expected_sabotage_patterns)}`)}if(n.execution_risk){const r=n.execution_risk;i.push(`Executierisico: breekpunt=${A(r.failure_point)}; blocker=${A(r.blocker)}; onderstroom=${A(r.hidden_understream)}`)}if(n.signature_layer){const r=n.signature_layer;i.push(`Signature layer: besluitkracht-as=${A(r.decision_power_axis)}; spanningsveld=${A(r.structural_tension)}; verlies=${A(r.explicit_loss)}; machtsverschuiving=${A(r.power_shift)}; tijdsdruk=${A(r.time_pressure)}; cognitieve volwassenheid=${A(r.cognitive_maturity_reflection)}; herhaling=${A(r.historical_repetition)}; hardheid=${A(r.adaptive_hardness_mode)}`)}if(n.intervention_plan_90d){const r=n.intervention_plan_90d;i.push(`Plan weekblokken: ${A(r.week_1_2)} | ${A(r.week_3_6)} | ${A(r.week_7_12)}`)}if(n.decision_contract){const r=n.decision_contract;i.push(`Decision contract kern: opening=${A(r.opening_line)}; keuze=${A(r.choice)}; resultaat=${A(r.measurable_result)}; horizon=${A(r.time_horizon)}; verlies=${A(r.accepted_loss)}`)}i.length&&t.push(`Executive Summary blok:
${i.join(`
`)}`)}return t.join(`

`).trim()}function um(e){if(/(executive summary|in conclusion|recommended action)/i.test(e)||Gg.test(e))throw new Error(Xe)}function gm(e){const t=e.replace(/op basis van bestuurlijke patronen in de ggz:/gi,"").replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi,"");if(Mg.test(e))throw new Error(Xe);if(Pg.test(e))throw new Error(Xe);if(Ug.test(e))throw new Error(Xe);if(Hg.test(e))throw new Error(Xe);if(is.test(t))throw new Error(Xe)}function mm(e){if(tt.some(t=>!e.includes(t)))throw new Error(Xe)}function pm(e){return(e.match(/^###\s*\d+\.\s*[^\n]+/gm)??[]).map(t=>t.trim().replace(/\s+/g," "))}function cs(e){const t=pm(e),n=tt.map(i=>i.trim().replace(/\s+/g," "));if(t.length!==n.length)throw new Error(`${ee}: exacte 12 HGBCO-secties vereist (gevonden ${t.length}, verwacht ${n.length})`);for(let i=0;i<n.length;i+=1)if(t[i]!==n[i])throw new Error(`${ee}: sectievolgorde ongeldig op positie ${i+1} (verwacht "${n[i]}", vond "${t[i]}")`)}function bm(e){for(const t of tt){const n=L(e,t);if(!n)continue;const i=n.split(`
`).find(r=>r.trim())??"";if(rs.some(r=>r.test(i)))throw new Error(Xe)}}function hm(e){const t=new Set;for(const n of tt){const i=L(e,n),r=kr(i);for(const a of r){const o=ss(a);if(!(o.length<24)){if(t.has(o))throw new Error(Xe);t.add(o)}}}}function Em(e){const t=L(e,"### 10. 90-DAGEN INTERVENTIEPROGRAMMA"),n=t.toLowerCase(),i=/maand\s*1\s*\(dag\s*1[-–]30\)\s*:/.test(n),r=/maand\s*2\s*\(dag\s*31[-–]60\)\s*:/.test(n),a=/maand\s*3\s*\(dag\s*61[-–]90\)\s*:/.test(n),o=/\b(owner|eigenaar|ceo|cfo|coo|chro|raad van bestuur|rvb)\b/i.test(t),s=om(t)||/\bmeetbaar\b/i.test(t),c=(t.match(/\b(?:Concrete actie|Actie):/gi)??[]).length>=6,l=/\bGevolg voor organisatie:/i.test(t),u=/\bGevolg voor klant\/cliënt:/i.test(t),g=/\bRisico van niet handelen:/i.test(t),m=/\bCasus-anker:/i.test(t);if(!i||!r||!a||!o||!s||!c||!l||!u||!g||!m)throw new Error(Xe)}function ls(e){const t=L(e,"### 10. 90-DAGEN INTERVENTIEPROGRAMMA");if(!t)throw new Error(`${ee}: sectie 10 ontbreekt`);if([/(?:^|\n{2,})\s*MAAND\s*1\s*\(dag\s*1[-–]30\):\s*STABILISEREN EN KNOPEN DOORHAKKEN/i,/(?:^|\n{2,})\s*MAAND\s*2\s*\(dag\s*31[-–]60\):\s*HERONTWERPEN EN HERALLOCEREN/i,/(?:^|\n{2,})\s*MAAND\s*3\s*\(dag\s*61[-–]90\):\s*VERANKEREN EN CONTRACTEREN/i,/(?:^|\n{2,})\s*Dag\s*30:/i,/(?:^|\n{2,})\s*Dag\s*60:/i,/(?:^|\n{2,})\s*Dag\s*90:/i].filter(r=>!r.test(t)).length>0)throw new Error(`${ee}: sectie 10 vereist aparte alinea's voor Maand 1 (dag 1-30), Maand 2 (dag 31-60), Maand 3 (dag 61-90) en Dag 30/60/90`)}function fm(e){const t=e.indexOf("1-PAGINA BESTUURLIJKE SAMENVATTING"),n=e.indexOf("### 12. BESLUITKADER"),i=/\bBesluit vandaag:\b/i.test(e),r=/\bVoorkeursoptie:\b/i.test(e),a=/\bExpliciet verlies:\b/i.test(e),o=/\b30\/60\/90\b|\bDag\s*30\b/i.test(e);if(t<0||n<0||t>n||!i||!r||!a||!o)throw new Error(`${ee}: 1-pagina bestuurlijke samenvatting ontbreekt of is onvolledig`)}function km(e){const t=/(?:^|\n)0 SITUATIERECONSTRUCTIE(?:\n|$)/i.test(e),n=/\bfeiten uit documenten\b/i.test(e),i=/\bbelangrijkste cijfers\b/i.test(e),r=/\borganisatorische context\b/i.test(e);if(!t||!(n&&i&&r))throw new Error(`${ee}: 0 SITUATIERECONSTRUCTIE ontbreekt of is onvolledig`)}function vm(e){if(!/###\s*HYPOTHESE CONCURRENTIE/i.test(e))throw new Error(`${ee}: hypothese concurrentie ontbreekt`);const n=L(e,"### HYPOTHESE CONCURRENTIE"),i=(n.match(/\bHYPOTHESE\s+\d+\b/gi)??[]).length,r=(n.match(/\bBEWIJS VOOR\b/gi)??[]).length>=3,a=(n.match(/\bBEWIJS TEGEN\b/gi)??[]).length>=3,o=/\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(n);if(i<3||!r||!a||!o)throw new Error(`${ee}: hypothese concurrentie is onvolledig`)}function Sm(e){if(!/###\s*CAUSALE MECHANISMEN/i.test(e))throw new Error(`${ee}: causale mechanismen ontbreken`);const n=L(e,"### CAUSALE MECHANISMEN"),i=/\bSYMPTOMEN\b/i.test(n),r=/\bWELK MECHANISME HIERACHTER ZIT\b/i.test(n),a=/\bSTRUCTURELE OORZAAK\b/i.test(n),o=/\bWELKE INTERVENTIE HET MECHANISME DOORBREKT\b/i.test(n);if(!i||!r||!a||!o)throw new Error(`${ee}: causale mechanismen sectie is onvolledig`)}function Im(e){const t=e.indexOf(Mt);if(t<0)throw new Error(`${ee}: 3. STRATEGISCHE INZICHTEN ontbreekt`);const n=e.slice(t+Mt.length),i=n.search(/\n###\s*\d+\.\s+/),r=(i>=0?n.slice(0,i):n).trim(),a=(r.match(/\bINZICHT:\b/gi)??[]).length,o=(r.match(/\bWAAROM DIT BELANGRIJK IS:\b/gi)??[]).length,s=(r.match(/\bBESTUURLIJKE CONSEQUENTIE:\b/gi)??[]).length;if(a<3||o<3||s<3)throw new Error(`${ee}: minimaal 3 strategische inzichten met belang en bestuurlijke consequentie vereist`)}function Tm(e){const t=L(e,"### 7. MACHTSDYNAMIEK"),n=/\bwie heeft besluitmacht\b/i.test(t)&&/\bwie heeft informele invloed\b/i.test(t)&&/\bwaar zit de feitelijke macht\b/i.test(t),i=/\b(blokkeert|besluitdynamiek|besluitvermijding|conflictvermijding|consensuscultuur)\b/i.test(t),r=(t.match(/\bBOARDROOM INZICHT\b/gi)??[]).length,a=(t.match(/\bWAAROM DIT BESTUURLIJK BELANGRIJK IS\b/gi)??[]).length,o=(t.match(/\bRISICO ALS DIT NIET WORDT GEADRESSEERD\b/gi)??[]).length;if(!n||!i||r<3||a<3||o<3)throw new Error(`${ee}: boardroom-intelligentie ontbreekt of is onvolledig in sectie 7`)}function Nm(e){const t=L(e,"### 9. STRATEGISCHE SCENARIOANALYSE"),n=/\bSCENARIO\s*A\b/i.test(t),i=/\bSCENARIO\s*B\b/i.test(t),r=/\bSCENARIO\s*C\b/i.test(t),a=/\bSCENARIOVERGELIJKING\b/i.test(t),o=/\bVOORKEURSSCENARIO\b/i.test(t)&&/\bWAAROM DIT HET MEEST ROBUUST IS\b/i.test(t)&&/\bWELKE VOORWAARDEN NODIG ZIJN\b/i.test(t);if(!n||!i||!r||!a||!o)throw new Error(`${ee}: scenarioanalyse ontbreekt of is onvolledig in sectie 9`)}function Rm(e){const t=L(e,"### 11. BESLUITSKWALITEIT"),n=/\bBesluitscore\s*:\s*\d{1,3}\/100\b/i.test(t),i=/\bBelangrijkste risico/i.test(t),r=/\bUitvoerbaarheidsanalyse\b/i.test(t),a=/\bAanbevolen verbeteringen\b/i.test(t),o=/\bDECISION CONTRACT\b/i.test(t);if(!n||!i||!r||!a||!o)throw new Error(`${ee}: besluitskwaliteit ontbreekt of is onvolledig in sectie 11`)}function Am(e){if(!/###\s*HISTORISCHE PATROONANALYSE/i.test(e))throw new Error(`${ee}: historische patroonanalyse ontbreekt`);const n=L(e,"### HISTORISCHE PATROONANALYSE"),i=/\bVERGELIJKBARE CASES\b/i.test(n),r=/\bGEMEENSCHAPPELIJKE PATRONEN\b/i.test(n),a=/\bWELKE INTERVENTIES WERKTEN\b/i.test(n),o=/\bGEEN DIRECT VERGELIJKBARE CASES GEVONDEN\b/i.test(n);if((!i||!r||!a)&&!o)throw new Error(`${ee}: historische patroonanalyse is onvolledig`)}function Om(e){if(!/###\s*STRATEGISCHE KENNISGRAPH INZICHTEN/i.test(e))throw new Error(`${ee}: strategische kennisgraph inzichten ontbreken`);const n=L(e,"### STRATEGISCHE KENNISGRAPH INZICHTEN"),i=/\bVERGELIJKBARE ORGANISATIES\b/i.test(n),r=/\bGEMEENSCHAPPELIJKE PROBLEMEN\b/i.test(n),a=/\bMEEST EFFECTIEVE STRATEGIE[ËE]N\b/i.test(n),o=/\bMEEST EFFECTIEVE INTERVENTIES\b/i.test(n);if(!i||!r||!a||!o)throw new Error(`${ee}: strategische kennisgraph inzichten zijn onvolledig`)}function Cm(e){if(!/###\s*STRATEGISCHE OPTIES EN BESLUITDRUK/i.test(e))throw new Error(`${ee}: strategische opties en besluitdruk ontbreekt`);const n=L(e,"### STRATEGISCHE OPTIES EN BESLUITDRUK"),i=/\bOPTIE\s*A\b/i.test(n),r=/\bOPTIE\s*B\b/i.test(n),a=/\bOPTIE\s*C\b/i.test(n),o=/\bVOORKEURSOPTIE\b/i.test(n),s=/\bEXPLICIET VERLIES\b/i.test(n),c=/\bGEVOLGEN VAN GEEN KEUZE\b/i.test(n),l=/\b30 DAGEN\b/i.test(n),u=/\b90 DAGEN\b/i.test(n),g=/\b365 DAGEN\b/i.test(n);if(!i||!r||!a||!o||!s||!c||!l||!u||!g)throw new Error(`${ee}: strategische opties en besluitdruk is onvolledig`)}function wm(e){if(!/###\s*BESTUURLIJKE BLINDE VLEKKEN/i.test(e))throw new Error(`${ee}: bestuurlijke blinde vlekken ontbreekt`);const n=L(e,"### BESTUURLIJKE BLINDE VLEKKEN"),i=(n.match(/\bBLINDE VLEK\b/gi)??[]).length,r=/\bWAT DE ORGANISATIE DENKT\b/i.test(n),a=/\bWAT DE REALITEIT IS\b/i.test(n),o=/\bWAAROM DIT PROBLEEM NIET WORDT GEZIEN\b/i.test(n),s=/\bWELK RISICO DIT CREËERT\b/i.test(n);if(i<3||!r||!a||!o||!s)throw new Error(`${ee}: bestuurlijke blinde vlekken is onvolledig`)}function jm(e){if(!/###\s*STRATEGISCHE VOORUITBLIK/i.test(e))throw new Error(`${ee}: strategische vooruitblik ontbreekt`);const n=L(e,"### STRATEGISCHE VOORUITBLIK"),i=/\bSCENARIO 1\s*[—-]\s*STATUS QUO\b/i.test(n),r=/\bSCENARIO 2\s*[—-]\s*INTERVENTIE\b/i.test(n),a=/\bSCENARIO 3\s*[—-]\s*ESCALATIE\b/i.test(n),o=/\bWAT GEBEURT ALS NIETS VERANDERT\b/i.test(n),s=/\bWAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD\b/i.test(n),c=/\bWAT GEBEURT ALS HET PROBLEEM VERERGERT\b/i.test(n);if(!i||!r||!a||!o||!s||!c)throw new Error(`${ee}: strategische vooruitblik is onvolledig`)}function xm(e){if(!/###\s*META-ANALYSE VAN DE REDENERING/i.test(e))throw new Error(`${ee}: meta-analyse van de redenering ontbreekt`);const n=L(e,"### META-ANALYSE VAN DE REDENERING"),i=/\bWAAR DE ANALYSE STERK IS\b/i.test(n),r=/\bWAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN\b/i.test(n),a=/\bWELKE VARIABELEN MOGELIJK ONTBREKEN\b/i.test(n),o=/\bHOE ZEKER DE CONCLUSIE IS\b/i.test(n);if(!i||!r||!a||!o)throw new Error(`${ee}: meta-analyse van de redenering is onvolledig`)}function ym(e){if(!/###\s*ORGANISATIESIMULATIE/i.test(e))throw new Error(`${ee}: organisatiesimulatie ontbreekt`);const n=L(e,"### ORGANISATIESIMULATIE"),i=/\bEXECUTIEROUTE EN ADOPTIEPAD\b/i.test(n),r=/\bVERWACHTE WEERSTANDSPUNTEN\b/i.test(n),a=/\bUITVOERINGSFRICTIE\b/i.test(n),o=/\bBENODIGDE COALITIE EN MANDAAT\b/i.test(n),s=/\bAANPASSINGEN VOOR UITVOERBAARHEID\b/i.test(n);if(!i||!r||!a||!o||!s)throw new Error(`${ee}: organisatiesimulatie is onvolledig`)}function $m(e){cs(e),vm(e),Sm(e),Am(e),Om(e),wm(e),jm(e),xm(e),ym(e),Cm(e),Nm(e),ls(e),Em(e),km(e),Im(e),Tm(e),Rm(e),fm(e)}function Pi(e,t){mm(e),cs(e),bm(e),hm(e),gm(e),um(e),ls(e)}function Wa(e){let t=e.trim();for(const n of tt)if(!t.includes(n)){const i=as[n];t=t?`${t}

${n}
${i}`:`${n}
${i}`}return t}function Ja(e){const t=String(e??"").trim();if(!t)return t;const i=t.indexOf("### 1. DOMINANTE THESE");return i<0?t:t.slice(i).trim()}function Yn(e){let t=e;for(const n of tt){const i=L(t,n);if(!i)continue;const r=i.split(`
`);for(;r.length>0&&rs.some(o=>o.test(r[0]||""));)r.shift();const a=r.join(`
`).trim();t=Ae(t,n,a||as[n])}return t}function Za(e){let t=e;for(const n of tt){const i=L(t,n);if(!i)continue;const r=Vg[n];!r||r.guard.test(i)||(t=Ae(t,n,`${i.trim()}

${r.line}`))}return t}function ds(e,t=2,n=220){const i=[];let r=[];const a=()=>{r.length&&(i.push(r.join(" ").trim()),r=[])};for(const o of e){const s=o.trim();if(!s)continue;if(!r.length){r.push(s);continue}const c=`${r.join(" ")} ${s}`;if(r.length>=t||c.length>n){a(),r.push(s);continue}r.push(s)}return a(),i.filter(Boolean)}function Ya(e){let t=e;for(const n of tt){const i=L(t,n);if(!i)continue;const r=i.replace(/^\s*[-*•]\s+/gm,"").replace(/^\s*\d+[.)]\s+/gm,""),a=kr(r);if(!a.length)continue;const o=ds(a,5,1200).join(`

`);t=Ae(t,n,o||i.trim())}return t}function qa(e){const t="### 10. 90-DAGEN INTERVENTIEPROGRAMMA",n=L(e,t);if(!n)return e;const i=n.replace(/\n+/g," ").replace(/\s+/g," ").trim();if(!i)return e;const r=i.replace(/\s*(Week\s*1\s*[-–]\s*2:)/i,`

$1`).replace(/\s*(Week\s*3\s*[-–]\s*6:)/i,`

$1`).replace(/\s*(Week\s*7\s*[-–]\s*12:)/i,`

$1`).replace(/\s*(Dag\s*30:)/i,`

$1`).replace(/\s*(Dag\s*60:)/i,`

$1`).replace(/\s*(Dag\s*90:)/i,`

$1`).replace(/\s*(Wie tempo controleert,\s*controleert macht\.)/i,`

$1`).replace(/^\s+/,"").replace(/\n{3,}/g,`

`).trim();return Ae(e,t,r)}function _m(e){const t="### 5. PRIJS VAN UITSTEL",n=L(e,t);if(!n)return e;const i=n.split(/\n+/).map(o=>o.trim()).filter(Boolean),r=new Set,a=[];for(const o of i){const s=o.match(/^(30|90|365)\s*dagen\s*[:\-]\s*(.+)$/i);if(!s){a.push(o);continue}const c=String(s[2]??"").trim(),l=sm(c);!l||r.has(l)||(r.add(l),a.push(`${s[1]} dagen: ${c}`))}return a.length?Ae(e,t,a.join(`

`)):e}function Qa(e){let t=e;const n=new Set;for(const i of tt){const r=L(t,i);if(!r)continue;const a=r.replace(/^\s*[-*•]\s+/gm,"").replace(/^\s*\d+[.)]\s+/gm,""),o=kr(a),s=[];for(const l of o){const u=ss(l);u.length>=24&&n.has(u)||(u.length>=24&&n.add(u),s.push(l))}const c=ds(s,5,1200).join(`

`).trim()||r.trim();t=Ae(t,i,c)}return t}function zm(e){return(e.match(/\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|beeindigen|beëindigen)\b/gi)??[]).length>=2?e:`${e}

In deze keuze wordt verlies expliciet geaccepteerd: initiatieven worden beëindigd en macht wordt centraal herverdeeld.`}function Ui(e){let t=String(e??"");const n="__GGZ_CONTEXT_SENTINEL__";t=t.replace(/op basis van bestuurlijke patronen in de ggz:/gi,n);const i=[[/\bsabotagepatronen\b/gi,"sabotagetechnieken"],[/\bdefault template\b/gi,"standaardbouwsteen"],[/\btransformatie-template\b/gi,"transformatieroute"],[/\bgovernance-technisch\b/gi,"bestuurlijk concreet"]];for(const[r,a]of i)t=t.replace(r,a);return t=t.replace(new RegExp(n,"g"),"Op basis van bestuurlijke patronen in de ggz:"),t}function Xa(e){const t=String(e??"").replace(/op basis van bestuurlijke patronen in de ggz:/gi,"").replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi,"");return is.test(t)}function Gt(e){let t=String(e??"");for(const n of Kg)t=t.replace(n,"");return t=t.replace(/\b(default template|transformatie-template)\b/gi,""),t=t.replace(/\n{3,}/g,`

`),t.trim()}function Dm(e){return(String(e??"").match(/^###\s*\d+\.\s+/gm)??[]).length===12}function Lm(e){const t=String(e??"").split(/\n(?=###\s*\d+\.\s+)/g).map(n=>n.trim()).filter(Boolean);return t.length!==12?!1:t.every(n=>["A","B","C","D","E"].every(i=>new RegExp(`^\\s*#{0,6}\\s*${i}\\.`,"im").test(n)))}function Bm(e){const t=L(e,"### 12. BESLUITKADER");return t?/^De Raad van Bestuur committeert zich aan:/im.test(t):!1}function Yt(e){const t=String(e??"");if(!Dm(t))throw new Error(Zn);if(!Lm(t))throw new Error(Zn);if(!Bm(t))throw new Error(Zn);if(Yc(t))throw new Error(Zn)}function Gm(e){return!1}function Mm(e,t){return e}function Pm(e,t){return e}function us(e,t,n,i="de organisatie"){let r=String(e??"").trim();return r&&(An(r)<t,_n(r,n))}function eo(e,t,n){if(e.analysis_map)return Vu(e.analysis_map);const i=e.company_name??"de organisatie",r=gs(e).toLowerCase(),o=/\b(jeugdzorg|ambulant|ambulante|gemeent|consortium|triage)\b/i.test(r)?`SCENARIO A — BREDE AMBULANTE SPECIALIST BLIJVEN
STRATEGISCHE LOGICA: behoud brede ambulante positionering, maar maak groei ondergeschikt aan contractdiscipline, triage-realiteit en teamstabiliteit.
FINANCIËLE CONSEQUENTIES: lagere uitbreidingssnelheid, maar betere beheersing van druk op budget en capaciteit.
ORGANISATORISCHE CONSEQUENTIES: meer focus op kernuitvoering, minder parallelle verbreding en scherper prioriteren in het aanbod.
RISICO'S: beperkte ruimte voor nieuwe proposities en tijdelijke vertraging in marktverbreding.
LANGE TERMIJN EFFECT: stabielere positie zolang regionale instroom en gemeentelijke ruimte leidend blijven.

SCENARIO B — SELECTIEVE SPECIALISATIE / NICHE KIEZEN
STRATEGISCHE LOGICA: versmal het profiel naar een kleiner aantal zorgvormen om capaciteit en kwaliteit te concentreren.
FINANCIËLE CONSEQUENTIES: mogelijk scherper rendement per zorgvorm, maar ook grotere afhankelijkheid van smaller vraagvolume.
ORGANISATORISCHE CONSEQUENTIES: eenvoudiger sturing, maar zwaardere keuze over wat niet langer prioriteit krijgt.
RISICO'S: verlies van regionale breedte en minder flexibiliteit in instroomopvang.
LANGE TERMIJN EFFECT: sterker specialistisch profiel, mits vraag en contractering die focus structureel ondersteunen.

SCENARIO C — CONSORTIUMSTRATEGIE VERDIEPEN
STRATEGISCHE LOGICA: vergroot invloed op regionale toegang, triage en samenwerking in plaats van primair op autonome verbreding te sturen.
FINANCIËLE CONSEQUENTIES: minder autonome groeiruimte, maar potentieel betere voorspelbaarheid in instroom en contractafspraken.
ORGANISATORISCHE CONSEQUENTIES: meer bestuurlijke afstemming extern, minder vrijheid voor solistische koerswijzigingen intern.
RISICO'S: extra afhankelijkheid van partners en tragere besluitvorming als mandaat diffuus blijft.
LANGE TERMIJN EFFECT: sterkere regionale verankering als de organisatie haar consortiumrol expliciet weet te sturen.

### SCENARIOVERGELIJKING
SCENARIO A: voordelen = continuiteit en beheersbaarheid; nadelen = beperkte verbreding; risiconiveau = middel; strategische robuustheid = hoog.
SCENARIO B: voordelen = focus en profilering; nadelen = smaller speelveld; risiconiveau = middel-hoog; strategische robuustheid = middel.
SCENARIO C: voordelen = betere aansluiting op instroommechaniek; nadelen = hogere externe afhankelijkheid; risiconiveau = middel; strategische robuustheid = hoog indien governance scherp is.

VOORKEURSSCENARIO: SCENARIO A, met elementen van SCENARIO C in de bestuurlijke samenwerking.
WAAROM DIT HET MEEST ROBUUST IS: het beschermt de operationele kern en sluit tegelijk aan op het echte sturingsmechanisme van contracten, triage en regionale samenwerking.
WELKE VOORWAARDEN NODIG ZIJN: expliciete prioritering, harde capaciteitstoetsen, contractdiscipline en een actieve rol in regionale besluitvorming.`:`SCENARIO A — KERN CONSOLIDEREN
STRATEGISCHE LOGICA: stabilisatie van de kern met focus op margediscipline.
FINANCIËLE CONSEQUENTIES: lagere variatie en voorspelbare kasdruk.
ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en lagere uitvoeringsruis.
RISICO'S: tragere groei buiten de kern.
LANGE TERMIJN EFFECT: hogere schokbestendigheid.

SCENARIO B — SELECTIEF VERSNELLEN
STRATEGISCHE LOGICA: versneld uitbreiden van activiteiten die direct op de broncontext aansluiten.
FINANCIËLE CONSEQUENTIES: hogere investeringsdruk en margerisico.
ORGANISATORISCHE CONSEQUENTIES: meer managementbelasting en complexiteit.
RISICO'S: overbelasting en versnippering.
LANGE TERMIJN EFFECT: hoger potentieel, maar fragieler profiel.

SCENARIO C — GEFASEERDE VERBREDING
STRATEGISCHE LOGICA: kern stabiliseren en verbreding gefaseerd ontwikkelen.
FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk en gecontroleerde investeringen.
ORGANISATORISCHE CONSEQUENTIES: hogere coördinatiebehoefte met bestuurlijke discipline.
RISICO'S: scope-drift bij zwakke governance.
LANGE TERMIJN EFFECT: adaptieve robuustheid.

### SCENARIOVERGELIJKING
SCENARIO A: voordelen stabiliteit; nadelen trage groei; risiconiveau laag-middel; strategische robuustheid hoog.
SCENARIO B: voordelen schaal; nadelen hoge druk; risiconiveau hoog; strategische robuustheid laag-middel.
SCENARIO C: voordelen balans; nadelen complexiteit; risiconiveau middel; strategische robuustheid hoog.

VOORKEURSSCENARIO: SCENARIO C met consolidatie-eerst.
WAAROM DIT HET MEEST ROBUUST IS: combineert risicobeperking en gecontroleerde groei.
WELKE VOORWAARDEN NODIG ZIJN: harde gates op marge, capaciteit en mandaat.`,s=`### 1. DOMINANTE THESE
De dominante bestuurlijke these voor ${i} is dat de organisatie niet vastloopt op inzet of intentie, maar op besturing onder druk. In de bovenstroom is de richting vaak duidelijk, maar in de onderstroom wordt de uitvoering nog te vaak bepaald door uitzonderingen, onderlinge afstemming en de persoon die op dat moment de meeste ruimte neemt. Daardoor lijkt het besluitproces op papier stabiel, terwijl het in de praktijk teveel schommelt met de dagdruk. De kernboodschap is niet dat teams harder moeten werken, maar dat het bestuur scherper moet kiezen.

### 2. KERNCONFLICT
Het kernconflict is dat meerdere legitieme doelen tegelijk worden gemaximaliseerd in een context die daar te weinig bestuurlijke en operationele ruimte voor laat. De bovenstroom wil snelheid, kwaliteit en voorspelbare uitkomsten tegelijk. De onderstroom voelt ondertussen werkdruk, onzekerheid en spanning op autonomie. Zolang die twee lagen niet expliciet worden verbonden in een duidelijke volgorde, blijft elk besluit half-af en verschuift de echte keuze naar de uitvoering.

### 3. STRATEGISCHE INZICHTEN
INZICHT: Contractgrenzen en kostprijslogica bepalen de feitelijke groeiruimte.
WAAROM DIT BELANGRIJK IS: Zonder expliciete doorrekening ontstaat schijngroei die margedruk versnelt.
BESTUURLIJKE CONSEQUENTIE: Het bestuur prioriteert margeherstel boven parallelle uitbreiding.

INZICHT: Productiviteitsnorm en kwaliteitsmodel botsen wanneer casemix en no-show niet zichtbaar worden gestuurd.
WAAROM DIT BELANGRIJK IS: Teams ervaren normdruk als gedragsthema, terwijl het een financieel sturingsvraagstuk is.
BESTUURLIJKE CONSEQUENTIE: Centrale sturing op normafwijking en capaciteit wordt bindend.

INZICHT: Afhankelijkheid van externe contractruimte verschuift strategierisico naar governance.
WAAROM DIT BELANGRIJK IS: Zonder contractvloer absorbeert de kern tariefschokken direct in behandelcapaciteit.
BESTUURLIJKE CONSEQUENTIE: Verbreding wordt conditioneel gemaakt aan margevalidatie en capaciteitsimpact.

### 4. KEERZIJDE VAN DE KEUZE
Keuzeconflict 1: strengere regie op intake, planning en prioritering verhoogt voorspelbaarheid, maar vraagt lokaal inleveren van uitzonderingsruimte.

Keuzeconflict 2: ruime lokale uitzonderingen verlagen frictie op korte termijn, maar verlengen doorlooptijd, herplanning en margedruk.

Keuzeconflict 3: kernconsolidatie verhoogt uitvoeringskans in het komende kwartaal, maar vertraagt tijdelijk de opschaling van niet-kerninitiatieven.

De bestuurlijke volwassen vorm van deze keuzeconflicten is dat expliciet wordt benoemd wie wat tijdelijk verliest, waarom dat verlies nodig is en binnen welke termijn het effect zichtbaar moet zijn.

### 5. PRIJS VAN UITSTEL
30 dagen zonder hard besluit: direct signaalverlies, meer herstelwerk en minder voorspelbaarheid in planning en opvolging.

90 dagen zonder hard besluit: zichtbare erosie in doorstroom en margediscipline, plus groeiende spanning tussen formeel besluit en informele praktijk.

365 dagen zonder hard besluit: structurele schade aan bestuurbaarheid, retentie en leverbetrouwbaarheid, met oplopende herstelkosten.

Na 12 maanden verschuift de organisatie van kiezen naar compenseren: uitstel wordt normaal gedrag, en herstel wordt trager en duurder in zowel geld als vertrouwen.

### 6. GOVERNANCE IMPACT
Governance-impact betekent hier dat besluitvorming opnieuw wordt ontworpen op ritme, eigenaarschap en uitvoerbaarheid. In de bovenstroom vraagt dat een vaste weekcadans met eenduidige KPI-definities en harde escalatielijnen. In de onderstroom vraagt dat vooral gelijke toepassing: dezelfde regel voor elk team, dezelfde termijn voor elke blokkade. Zonder die consistentie blijft governance een afspraak op papier in plaats van een werkend systeem.

### 7. MACHTSDYNAMIEK
De feitelijke macht zit in deze fase vooral op intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor losse uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en margelogica. De COO levert informele speelruimte in, maar wint formeel mandaat op capaciteit en doorstroom. Team- en lijnverantwoordelijken verliezen een deel van lokale autonomie, maar krijgen duidelijker kaders voor eerlijke escalatie. De onderstroom blijft zichtbaar in wie informatie doseert, wie tempo remt en wie uitzonderingen probeert te normaliseren.

### 8. EXECUTIERISICO
Het primaire executierisico is terugval in oude werkafspraken zodra spanning oploopt. Het faalpunt is meestal dat oude en nieuwe prioriteiten naast elkaar actief blijven, waardoor teams tegelijk moeten versnellen en stabiliseren. De concrete blocker is dubbelmandaat: formeel wordt een richting gekozen, informeel blijft heronderhandeling bestaan. Dat maakt uitvoering langzaam zonder dat iemand expliciet nee zegt.

### 9. STRATEGISCHE SCENARIOANALYSE
${o}

### 10. 90-DAGEN INTERVENTIEPROGRAMMA
Maand 1 (dag 1-30): Owner CEO/CFO. Deliverable: bindend consolidatiebesluit, stop-doinglijst, eigenaarschap per prioriteit en vaste KPI-definities. Escalatiepad: uitzonderingen binnen 48 uur naar de formele regietafel.

Maand 2 (dag 31-60): Owner COO. Deliverable: herverdeling van capaciteit, planning en besluitrechten naar een vaste weekcadans met beslislog. Escalatiepad: blokkades binnen 7 dagen sluiten of expliciet accepteren als gekozen verlies.

Maand 3 (dag 61-90): Owner DRI per prioriteit. Deliverable: aantoonbare adoptie plus KPI-impact, met uitzonderingen alleen op naam, met reden en met einddatum. Escalatiepad: stil veto direct terug naar boardreview.

Dag 30: eerste executiebewijs zichtbaar in stopkeuzes en besluitdiscipline.

Dag 60: stabiel ritme op intake, planning en opvolging.

Dag 90: meetbare verbetering op doorstroom, marge en effectieve bezetting.

### 11. BESLUITSKWALITEIT
Besluitscore: 72/100.
Belangrijkste risico's: onderschatte complexiteit, afhankelijkheid van externe contractruimte en managementoverbelasting.
Uitvoerbaarheidsanalyse: het besluit is uitvoerbaar bij strakke governance, capaciteitstransparantie en heldere mandaten.
Aanbevolen verbeteringen: verscherp scenario-keuze, borg risicobeheersing en herijk op vaste beslismomenten.

### 12. BESLUITKADER
De Raad van Bestuur committeert zich aan: een bindende keuze met eenduidige eindverantwoordelijkheid, vaste termijnen en meetbare uitkomsten. Per direct stopt parallelle sturing op dezelfde KPI's en stopt elk initiatief zonder benoemde owner, deadline en toetsbaar resultaat. Formeel wordt mandaat op intake, planning en uitzonderingen gecentraliseerd waar dat nodig is voor ketenregie. Informeel vervalt de ruimte om via bypass-routes besluituitstel te organiseren. Expliciet verlies: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom in druksegmenten en tijdelijke inperking van lokale uitzonderingsruimte om bestuurlijke voorspelbaarheid te herstellen.`;return _n(us(s,t,n,i),n)}function to(e){return e?[`Organisatie: ${e.organisation}`,`Sector: ${e.sector}`,`Analyse datum: ${e.analysisDate}`,`Dominant risico: ${e.dominantRisk}`,`Strategische spanning A: ${e.strategicTension.optionA}`,`Strategische spanning B: ${e.strategicTension.optionB}`,`Aanbevolen keuze: ${e.recommendedOption}`,`Historisch outcome-signaal: ${e.memoryInsights?.historicalOutcome||"niet beschikbaar"}`,"",...e.memoryInsights?.rankedRecommendations?.length?["Historische aanbevelingsranking:",...e.memoryInsights.rankedRecommendations.map(t=>`- ${t.recommendation} | score: ${t.weightedScore} | support: ${t.supportCount} | outcome: ${t.averageOutcomeScore} | sector match: ${t.sectorMatch?"ja":"nee"}`),""]:[],"Scenario's:",...e.scenarios.map(t=>`- ${t.name} | mechanisme: ${t.mechanism} | risico: ${t.risk} | bestuurlijke implicatie: ${t.governanceImplication}`),"","Interventies:",...e.interventions.map(t=>`- ${t.action} | reden: ${t.reason} | risico: ${t.risk} | stopregel: ${t.stopRule} | owner: ${t.owner||"Bestuur"} | deadline: ${t.deadline||"30 dagen"} | KPI: ${t.KPI||"n.v.t."}`),"",Gl(e)].join(`
`):"Niet beschikbaar; val terug op bestaande node-output en expliciteer ontbrekende velden."}function gs(e){const n=(Array.isArray(e.documents)?e.documents:[]).slice(0,3).map(i=>A(i?.content).slice(0,700)).filter(Boolean);return[A(e.company_name),A(e.company_context),A(e.executive_thesis),A(e.central_tension),A(e.strategic_narrative),...n].filter(Boolean).join(" ").trim()}function Hi(e,t,n,i,r,a,o,s,c,l,u,g,m,p,I,T,b){const h=gs(t);let d=Ja(Ui(String(e??"").trim()));return d=Jr(d),d=$n(d),d=Zr(d),d=Yr(d),d=qr(d),d=Wa(d),d=Mm(d),d=Pm(d),d=Yn(d),d=zm(d),d=Yn(d),d=Qa(d),d=_m(d),d=Ya(d),d=qa(d),d=wa(d,h),d=ja(d),d=tm(d),d=xa(d,g),d=ya(d,m),d=$a(d,g),d=_a(d),d=za(d,n),d=Da(d,i),d=La(d,l,u),d=Ba(d,p),d=Ga(d,I),d=Ua(d,r),d=Ha(d,a),d=Ma(d,o),d=Ka(d,s),d=Pa(d,c),d=em(d),d=Va(d,t),d=Za(d),d=_o(d,h),d=Jr(d),d=$n(d),d=Zr(d),d=Yr(d),d=qr(d),d=Wa(d),d=Ui(d),d=Yn(d),d=Qa(d),d=Ya(d),d=qa(d),d=wa(d,h),d=ja(d),d=xa(d,g),d=ya(d,m),d=$a(d,g),d=_a(d),d=za(d,n),d=Da(d,i),d=La(d,l,u),d=Ba(d,p),d=Ga(d,I),d=Ua(d,r),d=Ha(d,a),d=Ma(d,o),d=Ka(d,s),d=Pa(d,c),d=Va(d,t),d=Za(d),d=Gt(d),d=us(d,T,b,t.company_name||"de organisatie"),d=Gt(d),d=Ja(d),d=Yn(d),_n(Ui(d),b)}function no(){return`
${Jc}
${br}
${gi}
${ui}
${vc("nl")}
${hr}
${Er}
${fr}

JE BENT AURELIUS EXECUTIVE KERNEL.
JE RAPPORT IS NIET ADVISEREND.
JE RAPPORT IS NIET BESCHRIJVEND.
JE RAPPORT IS NIET INFORMATIEF.
JE RAPPORT FORCEERT EEN BESTUURSBESLUIT.

JE SCHRIJFT UITSLUITEND NEDERLANDS, OOK KOPPEN EN TERMINOLOGIE.
GEEN MARKETINGTAAL. GEEN AI-TAAL. GEEN VAGE FORMULERINGEN.
BRONINPUT HEEFT ALTIJD PRIORITEIT BOVEN GENERIEKE STRATEGIEMODELLEN.
DE STRATEGIC ANALYSIS MAP IS DE PRIMAIRE BRON VOOR RAPPORTTEKST; ANDERE NODE-OUTPUT MAG ALLEEN NORMALISEREN OF VALIDEREN.

CYNTRA SIGNATURE LAYER:
- Besluitkracht blijft de centrale variabele.
- Schrijf menselijk, concreet en bestuurlijk scherp; geen slogans, geen theatrale oneliners.
- Gebruik een empathische maar duidelijke boardroomtoon: confronterend op systeemkeuzes, respectvol richting professionals.
- Maak verlies expliciet en eerlijk verdeeld.
- Benoem formele en informele machtsdynamiek zonder karikaturen of beschuldigende taal.
- Benoem tijdsdruk en cumulatieve schade van uitstel op 30/90/365 dagen.
- Sluit af met een besluitcontract dat uitvoerbaar en toetsbaar is.
- Maak in zorgcontext de uitkomst onvermijdelijk met rekenkundige logica, niet met overtuigingstaal.

VERPLICHTE STRUCTUUR (EXACT):
0 SITUATIERECONSTRUCTIE
### 1. DOMINANTE THESE
### 2. KERNCONFLICT
### 3. STRATEGISCHE INZICHTEN
### 4. KEERZIJDE VAN DE KEUZE
### 5. PRIJS VAN UITSTEL
### 6. GOVERNANCE IMPACT
### 7. MACHTSDYNAMIEK
### 8. EXECUTIERISICO
### 9. STRATEGISCHE SCENARIOANALYSE
### 10. 90-DAGEN INTERVENTIEPROGRAMMA
### 11. BESLUITSKWALITEIT
### 12. BESLUITKADER

INHOUDSEISEN:
- Start met blok: 0 SITUATIERECONSTRUCTIE met exact: Feiten uit documenten, Belangrijkste cijfers, Organisatorische context.
- Sectie 1 bevat één dominante these in maximaal 10 zinnen.
- Sectie 1 benoemt expliciet de bestuurlijke toetsvraag voor de top.
- Sectie 1 bevat: huidige situatie, gewenste situatie (12 maanden) en het bestuurlijke gat daartussen.
- Verwerk StrategicReasoningNode expliciet in sectie 1, 2 en 3.
- Sectie 1 vertaalt capaciteit naar menselijk effect: behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
- In zorgcontext bevat sectie 1 expliciet: "De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel."
- Blok "### 3. STRATEGISCHE INZICHTEN" bevat minimaal 3 inzichten met exact: INZICHT, WAAROM DIT BELANGRIJK IS, BESTUURLIJKE CONSEQUENTIE.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 4 bevat minimaal 3 nieuwe zienswijzen/hypothesen die niet letterlijk in de input staan maar wel logisch volgen uit de casus.
- Sectie 4 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 4 gebruikt alleen meetbare verliezen (EUR/%/volume) als die in de broncontext staan; anders expliciet "niet onderbouwd in geüploade documenten".
- Sectie 5 beschrijft concreet de kosten van niets doen op 30, 90 en 365 dagen.
- Sectie 5 verwerkt drie unieke lagen: 30 dagen = signaalverlies, 90 dagen = machtsverschuiving, 365 dagen = systeemverschuiving.
- Sectie 5 maakt na 12 maanden concreet welke positie permanent schuift, welke coalitie dominant wordt en wat niet zonder reputatieschade terug te draaien is.
- Sectie 5 benoemt sectorspecifieke effecten alleen als ze expliciet in bronmateriaal staan.
- ${ts}
- Sectie 6 benoemt expliciet effect op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen.
- Sectie 6 bevat expliciet: "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
- ${es}
- Sectie 7 benoemt minimaal drie machtsactoren en maakt per actor verlies, winst, sabotagewijze en instrument expliciet.
- Sectie 7 verweeft formele bovenstroom met informele onderstroom in natuurlijke taal.
- Sectie 7 bevat expliciet: WIE HEEFT BESLUITMACHT, WIE HEEFT INFORMELE INVLOED, WAAR ZIT DE FEITELIJKE MACHT.
- Sectie 7 bevat minimaal 3 BOARDROOM INZICHT-blokken met bestuurlijk belang en niet-adresseringsrisico.
- Sectie 8 benoemt waar uitvoering misgaat, wie blokkeert, wat het concrete faalpunt is en welke onderstroom onzichtbaar werkt.
- Sectie 9 bevat scenarioanalyse met SCENARIO A/B/C plus scenariovergelijking en voorkeursscenario.
- Scenario's in sectie 9 moeten naam en logica direct ontlenen aan de broncontext; generieke labels als "groei", "hybride", "status quo" of "volumegroei" zijn verboden tenzij letterlijk door de bron onderbouwd.
- Als de bron expliciete strategische richtingen bevat, moeten die richtingen terugkomen in sectie 9 en in de afwijzing van niet-gekozen opties.
- Sectie 10 gebruikt exact: MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN, MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN, MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN.
- Sectie 10 bevat exact 6 interventies, met exact 2 interventies per maand.
- Sectie 10 bevat dag-30, dag-60 en dag-90 beslisgates met meetbaar resultaat.
- Sectie 11 bevat: Besluitscore, Belangrijkste risico's, Uitvoerbaarheidsanalyse, Aanbevolen verbeteringen.
- Sectie 11 bevat een DECISION CONTRACT met: Besluit, Waarom dit besluit wordt genomen, Welke verliezen worden geaccepteerd, Welke meetpunten bepalen succes, Wanneer het besluit wordt herzien.
- ${ns}
- Voeg direct boven sectie 12 een apart blok toe met titel: 1-PAGINA BESTUURLIJKE SAMENVATTING.
- Sectie 12 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 12 bevat expliciet: gekozen richting, formeel machtsverlies, informeel machtsverlies, heldere stopregels en expliciet verlies met impact.
- Sectie 12 benoemt actor-impact met rolgevolg; voeg €/% alleen toe als onderbouwd in bronmateriaal.
- Sectie 12 bevat expliciet de onomkeerbare trigger: "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."

STIJLREGELS:
- Schrijf per sectie maximaal 3 alinea's.
- Alinea 1 = context en observatie met expliciete spanning.
- Alinea 2 = mechanisme in deze volgorde: SYMPTOOM -> MECHANISME -> STRUCTURELE OORZAAK -> SYSTEEMEFFECT.
- Alinea 3 = bestuurlijke implicatie met expliciete keuze en beslisdruk.
- Maximaal 4 zinnen per alinea.
- Geen bullets of checklist-fragmenten; schrijf doorlopende boardroomtaal.
- Geen vrijblijvende aanbevelingen of algemeenheden.
- Geen generieke consultancy-abstracties zoals "bestuurlijke inertie" als de bron een concreter extern mechanisme laat zien.
- Als context dun is: noem hiaten expliciet en verzin geen feiten.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk", "zou kunnen" of "men zou".
- Geen termen als "default template", "transformatie-template", "governance-technisch", "patroon", "context is schaars", "werk uit", "aanname", "contextanker", "belangrijke succesfactor", "quick win" of "low hanging fruit".
- Consolideer: vermijd herhaling van dezelfde alinea in meerdere secties.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Elke sectie (incl. strategische inzichten) volgt verplicht: Analyse -> Mechanisme -> Gevolg -> Bestuurlijke implicatie.
- Hanteer per sectie expliciet deze narratieve opbouw: Context -> Spanning -> Mechanisme -> Bestuurlijke implicatie.
- Vermijd fragmentatie: geen feit -> losse interpretatie -> losse alinea zonder causale brug.
- Sectie 1 start exact met: "De dominante bestuurlijke these is dat..."
- Sectie 2 opent met: "De organisatie probeert drie legitieme doelen tegelijk te maximaliseren."
- Trade-offs beschrijf je narratief (winst, verlies, emotionele frictie), niet als checklist.
- Governance beschrijf je als overgang van persoonlijk leiderschap naar systeemleiderschap met ritme, rolhelderheid en besluitarchitectuur.
- Opportunity Cost volgt causale escalatie: 30 dagen tempoverlies -> 90 dagen verlies aan beheersbaarheid -> 365 dagen verlies aan keuzevrijheid.
- Claims moeten terugleidbaar zijn naar de geüploade documenten/context.
- Externe sectorinformatie mag alleen als:
  [SECTOR-LAYER | bron: extern | datum: YYYY-MM-DD]
  gevolgd door macro-mechanisme en:
  Relevantie voor deze casus: <3 casus-ankers>.
- Sector-layer mag nooit doen alsof het uit uploads komt.
  `.trim()}function Um(e){const t=e?`REJECT: ${e}`:"REJECT direct elke output met verboden generieke taal of AI-sporen.";return`
${er}
${br}
${gi}
${ui}
${hr}
${Er}
${fr}

${t}
Ga verder.
Behoud exact de 12 secties.
Houd de toon menselijk, concreet en bestuurlijk scherp.
Schrap slogans en formuletaal; schrijf doorlopend en natuurlijk.
Hanteer per sectie verplicht de keten: Context -> Spanning -> Mechanisme -> Bestuurlijke implicatie.
Gebruik per sectie maximaal 3 alinea's en maximaal 4 zinnen per alinea.
Alinea 1 is context/observatie met spanning.
Alinea 2 is mechanisme: SYMPTOOM -> MECHANISME -> STRUCTURELE OORZAAK -> SYSTEEMEFFECT.
Alinea 3 is bestuurlijke implicatie met expliciete keuze en beslisdruk.
Vermijd losse feitblokken; bouw alinea's causaal op elkaar voort.
Geen bullets of checklist-fragmenten.
Sectie 1 moet starten met "De dominante bestuurlijke these is dat...".
Sectie 2 moet openen met "De organisatie probeert drie legitieme doelen tegelijk te maximaliseren.".
Beschrijf trade-offs narratief (winst, verlies, emotionele moeilijkheid), niet als losse bullets.
Maak in sectie 7 minimaal drie machtsactoren concreet met verlies, winst, vertraging en instrument.
Verwerk boardroom-intelligentie expliciet: besluitmacht, informele invloed, feitelijke macht en besluitblokkades.
Gebruik minimaal 3 BOARDROOM INZICHT-blokken met bestuurlijke relevantie en risico bij niet-adresseren.
Werk opportunity cost uit op 30/90/365 plus 12 maanden met irreversibele machts- en coalitieverschuiving.
Vertaal capaciteitsverlies naar menselijk effect op behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
Gebruik absolute €-bedragen alleen met expliciete berekening + bron; anders expliciet "niet onderbouwd in geüploade documenten".
Verwerk StrategicReasoningNode zichtbaar in sectie 1 (Dominante these), sectie 2 (Kernconflict) en sectie 3 (Strategische inzichten).
Vul blok ### 3. STRATEGISCHE INZICHTEN met minimaal 3 inzichten (INZICHT, WAAROM DIT BELANGRIJK IS, BESTUURLIJKE CONSEQUENTIE).
Werk sectie 9 uit als scenarioanalyse (A/B/C, vergelijking, voorkeur).
Leid scenarionamen en keuzecontrasten af uit de broncontext; vermijd generieke labels tenzij brongebonden.
Werk sectie 10 uit met Maand 1 (dag 1-30), Maand 2 (dag 31-60), Maand 3 (dag 61-90) inclusief owner, deliverable, KPI, escalatiepad en dag-30/60/90 beslisgates.
Werk sectie 11 uit met besluitscore, risicoanalyse, uitvoerbaarheidsanalyse en verbeteringen inclusief DECISION CONTRACT.
Sluit sectie 12 af met formeel/informeel machtsverlies, directe stopregels en expliciet verlies met impact.
Neem in sectie 12 actor-impact op met rolgevolg voor sleutelactoren; €/% alleen als brononderbouwd.
Neem letterlijk op: "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
Neem letterlijk op: "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."
Voeg alleen sectorspecifieke claims toe als ze aantoonbaar in de broncontext staan.
Gebruik altijd gecombineerde input uit geüploade documenten en vrije tekstcontext.
Gebruik de Strategic Analysis Map als primaire rapportbron en wijk alleen af als een veld aantoonbaar ontbreekt.
${es}
${ts}
${ns}
${Sc}
`.trim()}function Hm(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

BRIEF CONTEXT:
${e.briefContext||"Geen bruikbare brief-context."}

LEGACY CONTEXT:
${e.legacyContext||"Geen legacy-context."}

INSTRUCTIE:
Reconstrueer het systeem waarin de organisatie opereert.
Geef nog GEEN advies.

Analyseer:
1 MARKTCONTEXT
- sector en regelgeving
- afhankelijkheid van externe partijen
- prijsstructuur
- contractstructuren

2 VERDIENMODEL
- inkomstenstromen
- prijs per dienst
- vergoedingstructuren
- afhankelijkheid van verzekeraars, subsidies of contracten

3 CAPACITEIT
- aantal medewerkers
- productiviteitsnormen
- aantal cliënten of opdrachten
- maximale doorlooptijd

4 FINANCIËLE STRUCTUUR
- belangrijkste kostenposten
- margestructuur
- financiële druk
- break-even logica

5 ORGANISATIEDYNAMIEK
- rol van bestuurders
- spanningen of vermijding
- cultuur rond verantwoordelijkheid

6 STRUCTURELE BEPERKINGEN
- contractplafonds
- regelgeving
- personeelscapaciteit
- marktlimieten

7 NUMERIEKE INZICHTEN
Als cijfers voorkomen: reken implicaties door.
Voorbeeld: contractplafond / opbrengst per cliënt = maximale schaal.

OUTPUTSTRUCTUUR (EXACT):
HUIDIGE SITUATIE
MARKTLIMITES
FINANCIËLE STRUCTUUR
CAPACITEITSGRENZEN
ORGANISATIEDYNAMIEK
STRUCTURELE BEPERKINGEN
`.trim()}function Km(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY:
${e.memoryContextBlock||"GEEN DIRECT VERGELIJKBARE CASES GEVONDEN"}

KNOWLEDGE GRAPH INSIGHTS:
${e.knowledgeGraphContextBlock||"Nog geen knowledge graph inzichten beschikbaar."}

CAUSALE MECHANISMEN:
${e.causalMechanismOutput||"Nog geen causale mechanismen beschikbaar."}

STRATEGIC THINKING PATTERNS:
${e.strategicThinkingPatternsOutput||"Niet beschikbaar; gebruik minimaal bottleneck, economic engine, incentive structure en system dynamics."}

INSTRUCTIE:
Identificeer het werkelijke probleem achter zichtbare symptomen.

Gebruik exact deze structuur:
1 ZICHTBARE SYMPTOMEN
2 OPERATIONELE OORZAKEN
3 STRUCTURELE OORZAKEN
4 SYSTEEMDYNAMIEK
5 DOMINANT STRATEGISCH PROBLEEM

OUTPUT (EXACTE KOPPEN):
SYMPTOMEN
OPERATIONELE OORZAKEN
STRUCTURELE OORZAKEN
SYSTEEMDYNAMIEK
DOMINANT STRATEGISCH PROBLEEM
`.trim()}function Vm(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

INSTRUCTIE:
Analyseer gedrags- en machtsdynamiek in de organisatie.

OUTPUT (EXACTE KOPPEN):
DYNAMIEK
GEDRAGSPATROON
IMPACT OP STRATEGIE
`.trim()}function Fm(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC MEMORY:
${e.memoryContextBlock||`GEEN DIRECT VERGELIJKBARE CASES GEVONDEN
Analyse is uitgevoerd via strategische denkpatronen en systeemlogica.`}

KNOWLEDGE GRAPH INSIGHTS:
${e.knowledgeGraphContextBlock||"Nog geen knowledge graph inzichten beschikbaar."}

CAUSALE MECHANISMEN:
${e.causalMechanismOutput||"Nog geen causale mechanismen beschikbaar."}

STRATEGIC THINKING PATTERNS:
${e.strategicThinkingPatternsOutput||"Niet beschikbaar; hanteer first-principles met bottleneck, economic engine, incentive structure en system dynamics."}

INSTRUCTIE:
Genereer verborgen strategische inzichten via systeemlogica.
Detecteer:
- contractplafonds
- schaalgrenzen
- verdienmodelproblemen
- afhankelijkheid van derden
- strategische paradoxen

Als cijfers voorkomen: bereken implicaties automatisch.
Voorbeeld: contractplafond / opbrengst per cliënt = maximale schaal.

OUTPUT (EXACT):
STRATEGISCH INZICHT
LOGICA
BESTUURLIJKE IMPLICATIE
`.trim()}function Wm(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

KNOWLEDGE GRAPH INSIGHTS:
${e.knowledgeGraphContextBlock||"Nog geen knowledge graph inzichten beschikbaar."}

STRATEGIC THINKING PATTERNS:
${e.strategicThinkingPatternsOutput||"Niet beschikbaar; gebruik first-principles patronen."}

INSTRUCTIE:
Formuleer minimaal drie strategische opties: OPTIE A, OPTIE B, OPTIE C.

Per optie exact:
VOORDEEL
NADEEL
RISICO
LANGE TERMIJN EFFECT

Gebruik dit format:
OPTIE A
VOORDEEL: ...
NADEEL: ...
RISICO: ...
LANGE TERMIJN EFFECT: ...
`.trim()}function Jm(e){return`
ORGANISATIE: ${e.companyName??"Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${e.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${e.contextEngineReconstruction||"Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${e.diagnosisEngineOutput||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGISCHE HYPOTHESEN:
${e.hypothesisEngineOutput||"Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${e.scenarioSimulationOutput||"Niet beschikbaar; leid scenario's af uit primaire broncontext."}

KNOWLEDGE GRAPH INSIGHTS:
${e.knowledgeGraphContextBlock||"Nog geen knowledge graph inzichten beschikbaar."}

STRATEGIC THINKING PATTERNS:
${e.strategicThinkingPatternsOutput||"Niet beschikbaar; gebruik first-principles patronen."}

INSTRUCTIE:
Ontwerp een concreet plan van aanpak met minimaal zes interventies.
Elke interventie ondersteunt expliciet een gekozen scenario en benoemt welk probleem uit dat scenario wordt opgelost.

Elke interventie bevat exact:
ACTIE
WAAROM DEZE INTERVENTIE
GEVOLG VOOR ORGANISATIE
GEVOLG VOOR KLANT/CLIËNT
RISICO VAN NIET HANDELEN
PROBLEEM DAT WORDT OPGELOST

Voeg daarna een tijdlijn toe met exact:
0–30 dagen
30–60 dagen
60–90 dagen
`.trim()}async function Zm(e,t={}){const n=Gm(),i=t.minWords??Ag,r=t.maxWords??Og,a=t.temperature??.18,o=Math.max(3500,Math.min(i,r)),s=Math.max(o,r-wg),c=Array.isArray(e.documents)?e.documents:[],l=Yg(c),u=e.questions??{},g=!!u.q1&&!!u.q2&&!!u.q3&&!!u.q4&&!!u.q5,m=g?`
5 KERNVRAGEN:
1. ${u.q1}
2. ${u.q2}
3. ${u.q3}
4. ${u.q4}
5. ${u.q5}
`:`
Vragen zijn onvolledig. Werk uitsluitend met aantoonbare broncontext en benoem ontbrekende informatie expliciet.
`,p=l.length===0?"Geen documenten geüpload. Geef alleen brongebonden conclusies uit aanwezige context en markeer dat documentonderbouwing ontbreekt.":l.slice(0,30).map((k,C)=>`
--- DOCUMENT ${C+1}: ${k.filename} ---
${k.content}
`).join(`
`),I=typeof e.company_context=="string"?e.company_context:"",T=dm(e),b=qg(l,I,T),h=lm(e,l,I,T),d=Fg(h),x=Aa.get(d),N=new Uo,j=new Mo,$=new Ql(N,j),q=new ur,le=new eu(q),U=new tu(q);let y="",X=`GEEN DIRECT VERGELIJKBARE CASES GEVONDEN
Analyse is uitgevoerd via strategische denkpatronen en systeemlogica.`,_=["VERGELIJKBARE ORGANISATIES","Geen directe vergelijkbare organisaties gevonden.","GEMEENSCHAPPELIJKE PROBLEMEN","Nog geen dominant probleemcluster beschikbaar.","MEEST EFFECTIEVE STRATEGIEËN","Nog geen dominante strategie-signalen beschikbaar.","MEEST EFFECTIEVE INTERVENTIES","Nog geen bewezen interventies beschikbaar in de graph."].join(`
`),de=["HYPOTHESE 1: Financiele begrenzing is de primaire verklaring.","BEWIJS VOOR: Nog te valideren.","BEWIJS TEGEN: Nog te valideren.","","HYPOTHESE 2: Organisatorische executiefrictie is de primaire verklaring.","BEWIJS VOOR: Nog te valideren.","BEWIJS TEGEN: Nog te valideren.","","HYPOTHESE 3: Scopeversnippering is de primaire verklaring.","BEWIJS VOOR: Nog te valideren.","BEWIJS TEGEN: Nog te valideren.","","WAARSCHIJNLIJKSTE VERKLARING: Nog niet vastgesteld."].join(`
`),H=["SYMPTOMEN","1. Nog te valideren symptoom.","WELK MECHANISME HIERACHTER ZIT","1. Nog te valideren mechanisme.","STRUCTURELE OORZAAK","1. Nog te valideren oorzaak.","WELKE INTERVENTIE HET MECHANISME DOORBREKT","1. Nog te valideren interventie."].join(`
`),ie=["STRATEGISCHE OPTIES","OPTIE A","BESCHRIJVING: Nog te valideren.","VOORDELEN: Nog te valideren.","NADelen: Nog te valideren.","RISICO’S: Nog te valideren.","","OPTIE B","BESCHRIJVING: Nog te valideren.","VOORDELEN: Nog te valideren.","NADelen: Nog te valideren.","RISICO’S: Nog te valideren.","","OPTIE C","BESCHRIJVING: Nog te valideren.","VOORDELEN: Nog te valideren.","NADelen: Nog te valideren.","RISICO’S: Nog te valideren.","","VOORKEURSOPTIE","BESCHRIJVING: Nog te valideren.","WAAROM DEZE KEUZE LOGISCH IS: Nog te valideren.","WELK PROBLEEM HIERMEE WORDT OPGELOST: Nog te valideren.","","EXPLICIET VERLIES","WAT WORDT OPGEEVEN: Nog te valideren.","WELKE INITIATIEVEN STOPPEN: Nog te valideren.","WELKE GROEI WORDT UITGESTELD: Nog te valideren.","","GEVOLGEN VAN GEEN KEUZE","30 DAGEN: Nog te valideren.","90 DAGEN: Nog te valideren.","365 DAGEN: Nog te valideren."].join(`
`),z=["BLINDE VLEK: Nog te valideren.","WAT DE ORGANISATIE DENKT: Nog te valideren.","WAT DE REALITEIT IS: Nog te valideren.","WAAROM DIT PROBLEEM NIET WORDT GEZIEN: Nog te valideren.","WELK RISICO DIT CREËERT: Nog te valideren."].join(`
`),ve=["SCENARIO 1 — STATUS QUO","WAT GEBEURT ALS NIETS VERANDERT: Nog te valideren.","","SCENARIO 2 — INTERVENTIE","WAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD: Nog te valideren.","","SCENARIO 3 — ESCALATIE","WAT GEBEURT ALS HET PROBLEEM VERERGERT: Nog te valideren."].join(`
`),Ie=["WAAR DE ANALYSE STERK IS","Nog te valideren.","","WAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN","Nog te valideren.","","WELKE VARIABELEN MOGELIJK ONTBREKEN","Nog te valideren.","","HOE ZEKER DE CONCLUSIE IS","Nog te valideren."].join(`
`),te=["EXECUTIEROUTE EN ADOPTIEPAD","Nog te valideren.","","VERWACHTE WEERSTANDSPUNTEN","Nog te valideren.","","UITVOERINGSFRICTIE","Nog te valideren.","","BENODIGDE COALITIE EN MANDAAT","Nog te valideren.","","AANPASSINGEN VOOR UITVOERBAARHEID","Nog te valideren."].join(`
`),K="",B="",Ee="",ne="",se="",je="",fe="",R="",pe="",V="",ce="",Se="",Ge=0,be=!1,Ve=!1,It=0,Tt=!1;const P=[];let hn=0,Fe=0,Nt=0,F=0,Oe=0,nt=0,Re=0,xe=!1,ye=0,Ce=!1,Rt=!1,En=!1,At=!1,mt=!1,Ot=!1,it=0,Ct="",Bn="";const he=ou();let fn=!0,Vt=[];const bi=new gu;try{const k=await bi.generate({model:"gpt-4o",messages:[{role:"system",content:jg},{role:"user",content:Hm({companyName:e.company_name,caseContextBlock:b,briefContext:T,legacyContext:I})}],options:{max_tokens:2200,temperature:.1}});y=typeof k=="string"?k.trim():"",Je(he,{context_state:y})}catch{y=""}try{const k=N.listCases();for(const w of k)j.listIndexedCases().some(oe=>oe.caseId===w.caseId)||j.indexCase(w);const C=$.retrieveSimilarCases({sector:A(e.sector_selected)||"onbekend",problemType:A(e.central_tension)||A(e.executive_thesis),strategicInsights:[A(e.executive_thesis),A(e.central_tension)].filter(Boolean),topK:5});hn=C.length,X=nm({similarCases:C.map(w=>({caseId:w.caseRecord.caseId,sector:w.caseRecord.sector,keyProblem:w.caseRecord.keyProblem,chosenStrategy:w.caseRecord.chosenStrategy,resultSummary:w.caseRecord.resultSummary,relevance:w.similarityScore}))})}catch{X=`GEEN DIRECT VERGELIJKBARE CASES GEVONDEN
Analyse is uitgevoerd via strategische denkpatronen en systeemlogica.`}try{const k=le.run({sector:A(e.sector_selected)||"onbekend",problemHint:A(e.central_tension)||A(e.executive_thesis),organizationName:A(e.company_name)});_=k.block,Fe=k.comparableOrganisations.length}catch{Fe=0,_=["VERGELIJKBARE ORGANISATIES","Geen directe vergelijkbare organisaties gevonden.","GEMEENSCHAPPELIJKE PROBLEMEN","Nog geen dominant probleemcluster beschikbaar.","MEEST EFFECTIEVE STRATEGIEËN","Nog geen dominante strategie-signalen beschikbaar.","MEEST EFFECTIEVE INTERVENTIES","Nog geen bewezen interventies beschikbaar in de graph."].join(`
`),P.push("KnowledgeGraphQuery gaf geen bruikbare output; analyse vervolgd met memory en patterns.")}try{const k=id({contextText:`${b}
${y}`,memoryText:X,graphText:_,minHypotheses:3});Nt=k.length;const C=sd({hypotheses:k,contextText:`${b}
${y}`,memoryText:X,graphText:_});de=ld(C).block}catch{Nt=0,P.push("Hypothesis competition kon niet volledig worden uitgevoerd; analyse vervolgd met standaardverklaring.")}try{const k=dd({contextText:`${b}
${y}`,hypothesisText:de,memoryText:X,graphText:_}),C=ud(k),w=pd({contextText:`${b}
${y}
${X}
${_}`});F=C.chains.length,H=`${C.block}

SYSTEEMDYNAMIEK: ${w.summary}`,Je(he,{mechanisms:H})}catch{F=0,P.push("CausalMechanismDetector kon niet volledig worden uitgevoerd; analyse vervolgd met standaard causale sectie.")}try{const k=Sd({contextText:`${b}
${y}
${ne}`,memoryText:X,graphText:_,hypothesisText:de,causalText:H});nt=k.items.length,z=k.block}catch{nt=0,P.push("BlindSpotDetector kon niet volledig worden uitgevoerd; analyse vervolgd met standaard blind-spot sectie.")}try{K=td({caseContextBlock:b,contextEngineOutput:y,memoryContextBlock:X,diagnosisOutput:H}).output,ed(K,4)||P.push("Minder dan 4 strategische denkpatronen gedetecteerd; analyse vervolgd met quality warning.")}catch{K="",P.push("StrategicThinkingPatterns kon niet volledig worden toegepast; analyse vervolgd via beschikbare context.")}try{const k=await Ue("gpt-4o",[{role:"system",content:xg},{role:"user",content:Km({companyName:e.company_name,caseContextBlock:b,contextEngineReconstruction:y,memoryContextBlock:X,knowledgeGraphContextBlock:_,causalMechanismOutput:H,strategicThinkingPatternsOutput:K})}],{max_tokens:1600,temperature:.1});B=typeof k=="string"?k.trim():"",Je(he,{diagnosis:B})}catch{B=""}try{const k=cu({contextText:`${b}
${y}`,diagnosisText:B,mechanismText:H}),C=lu({tension:k.tension}),w=uu({options:C.options});V=k.block,ce=`${C.block}

${w.block}`.trim(),Se=w.preferredOptionId?`Optie ${w.preferredOptionId}`:"",Je(he,{strategic_tension:V,strategic_options:ce,decision:Se?`Voorkeursoptie uit evaluatie: ${Se}`:""})}catch{V="",ce="",Se="",P.push("Strategic Option Engine kon niet volledig worden uitgevoerd; analyse vervolgd met bestaande engines.")}try{const k=await Ue("gpt-4o",[{role:"system",content:yg},{role:"user",content:Fm({companyName:e.company_name,caseContextBlock:`${b}

${V}

${ce}`.trim(),contextEngineReconstruction:y,diagnosisEngineOutput:B,memoryContextBlock:X,knowledgeGraphContextBlock:_,causalMechanismOutput:H,strategicThinkingPatternsOutput:K})}],{max_tokens:1400,temperature:.1});Ee=typeof k=="string"?k.trim():"",Je(he,{insights:Ee})}catch{Ee=""}try{const k=await Ue("gpt-4o",[{role:"system",content:$g},{role:"user",content:Vm({companyName:e.company_name,caseContextBlock:b,contextEngineReconstruction:y,diagnosisEngineOutput:B})}],{max_tokens:1400,temperature:.1});ne=typeof k=="string"?k.trim():""}catch{ne=""}try{const k=await Ue("gpt-4o",[{role:"system",content:_g},{role:"user",content:Hl({companyName:e.company_name,caseContextBlock:b,contextEngineReconstruction:y,diagnosisEngineOutput:B,orgDynamicsEngineOutput:ne})}],{max_tokens:1700,temperature:.12});se=typeof k=="string"?k.trim():""}catch{se=""}try{const k=Id({contextText:`${b}
${y}
${B}`,causalText:H,interventionText:R});ve=k.block,Re=k.scenarios.length}catch{Re=0,P.push("StrategicForesightEngine kon niet volledig worden uitgevoerd; vooruitbliksectie draait op fallback.")}try{const k=await Ue("gpt-4o",[{role:"system",content:Lg},{role:"user",content:Wm({companyName:e.company_name,caseContextBlock:b,contextEngineReconstruction:y,diagnosisEngineOutput:B,knowledgeGraphContextBlock:_,strategicThinkingPatternsOutput:K})}],{max_tokens:1600,temperature:.12});je=typeof k=="string"?k.trim():""}catch{je=""}try{const k=await Ue("gpt-4o",[{role:"system",content:zg},{role:"user",content:Vl({companyName:e.company_name,caseContextBlock:`${b}

STRATEGIC MEMORY:
${X}

KNOWLEDGE GRAPH INSIGHTS:
${_}

STRATEGISCHE VOORUITBLIK:
${ve}`,contextEngineReconstruction:y,diagnosisEngineOutput:B,strategicInsightsOutput:`${Ee}

STRATEGIC THINKING PATTERNS:
${K}

KNOWLEDGE GRAPH INSIGHTS:
${_}

STRATEGISCHE VOORUITBLIK:
${ve}`,hypothesisOutput:je})}],{max_tokens:1800,temperature:.12});fe=typeof k=="string"?k.trim():""}catch{fe=""}try{const k=await Ue("gpt-4o",[{role:"system",content:Bg},{role:"user",content:Jm({companyName:e.company_name,caseContextBlock:b,contextEngineReconstruction:y,diagnosisEngineOutput:B,hypothesisEngineOutput:je,scenarioSimulationOutput:fe,knowledgeGraphContextBlock:_,strategicThinkingPatternsOutput:K})}],{max_tokens:1800,temperature:.12});R=typeof k=="string"?k.trim():""}catch{R=""}try{const k=bd({contextText:`${b}
${y}
${B}`,causalText:H,hypothesisText:de}),C=hd(k),w=fd({tradeoffs:C,causalText:H,hypothesisText:de,memoryText:X,graphText:_});Oe=k.length,ie=w.block,Se&&(ie=`${ie}

VOORKEURSOPTIE UIT STRATEGISCHE OPTIE-EVALUATIE: ${Se}`.trim()),Je(he,{decision:ie})}catch{Oe=0,P.push("DecisionPressureEngine kon niet volledig worden uitgevoerd; besluitdruksectie draait op fallbackinhoud.")}try{const k=_d({orgDynamicsOutput:ne,boardroomOutput:se,interventionOutput:R,decisionPressureOutput:ie});te=k.block,ye=k.interventionCount}catch{ye=0,P.push("OrganizationalSimulationEngine kon niet volledig worden uitgevoerd; organisatiesimulatie draait op fallback.")}try{const k=Od({logicInput:{diagnosisText:B,insightText:Ee,interventionText:`${R}

ORGANISATIESIMULATIE:
${te}`,decisionPressureText:ie,causalText:H},alternativeInput:{hypothesisText:de,blindSpotText:z,contextText:`${b}
${y}`},missingVariableInput:{contextText:`${b}
${y}`,diagnosisText:B,insightText:Ee}});Ie=k.block,xe=k.logic.pass}catch{xe=!1,P.push("MetaReasoningEngine kon niet volledig worden uitgevoerd; meta-analyse sectie draait op fallback.")}try{const k=await Ue("gpt-4o",[{role:"system",content:Dg},{role:"user",content:Wl({companyName:e.company_name,caseContextBlock:`${b}

STRATEGIC MEMORY:
${X}

KNOWLEDGE GRAPH INSIGHTS:
${_}`,diagnosisEngineOutput:B,strategicInsightsOutput:`${Ee}

BESTUURLIJKE BLINDE VLEKKEN:
${z}

STRATEGISCHE VOORUITBLIK:
${ve}

ORGANISATIESIMULATIE:
${te}

META-ANALYSE VAN DE REDENERING:
${Ie}

STRATEGIC THINKING PATTERNS:
${K}

KNOWLEDGE GRAPH INSIGHTS:
${_}`,scenarioSimulationOutput:fe,interventionOutput:`${R}

STRATEGISCHE OPTIES EN BESLUITDRUK:
${ie}

ORGANISATIESIMULATIE:
${te}`,boardroomIntelligenceOutput:se})}],{max_tokens:1300,temperature:.1});pe=typeof k=="string"?k.trim():""}catch{pe=""}const wt=Zl(pe);Ge=wt.decisionQualityScore,be=wt.inconsistentInterventions,Ve=wt.scenarioMissing,Kl(se)||P.push("Boardroom-intelligentie onder minimum; analyse vervolgd met aanvullende hardening."),Fl(fe)||P.push("Scenario-set onder minimum; analyse vervolgd met aanvullende hardening."),(Ge<60||be||Ve)&&P.push("Besluitkwaliteit kwetsbaar (<60 of inconsistentie); analyse vervolgd met expliciete waarschuwing.");const jt=Ul({sourceContext:h,contextEngineOutput:`${y}

${V}

${ce}`.trim(),diagnosisOutput:`${B}

${H}

${V}

${ce}

${z}

${ve}

${te}

${Ie}

${K}

${_}

${de}

${ie}`.trim(),strategicInsightsOutput:`${Ee}

${se}

${H}

${V}

${ce}

${z}

${ve}

${te}

${Ie}

${K}

${_}

${de}

${ie}`.trim(),orgDynamicsOutput:`${ne}

${se}`.trim(),hypothesisOutput:`${je}

${fe}`.trim(),interventionOutput:R});It=jt.strategicDepthScore,Tt=jt.pass;const Gn=Ng({organisation:e.company_name,sector:e.sector_selected,dominantRisk:jt.message||On(ie,/\bWELK PROBLEEM HIERMEE WORDT OPGELOST:\s*(.+)$/im)||"",strategicOptions:(ce.match(/Optie [ABC].+/gi)??[]).map(k=>k.replace(/^Optie\s+[ABC]\s*[–-]\s*/i,"").trim()),recommendedOption:Se||On(ie,/\bBESCHRIJVING:\s*(OPTIE\s+[ABC][^.:\n]*)/im)||"",scenarioSimulationOutput:fe,interventionOutput:R,memoryProblemText:h}),xt=e.analysis_map??Gn.analysisMap,S=new Rg().run({claimText:to(xt),evidenceText:h});S.contradictorySignals.length&&P.push(...S.contradictorySignals),S.evidenceConfidenceScore<40&&P.push(`RealityEngine: lage evidence-confidence (${S.evidenceConfidenceScore}/100) op analysekaart.`),jt.pass||P.push(jt.message||"Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang.");const G=[{role:"system",content:no()},{role:"user",content:`
${er}
${br}
${gi}
${ui}
${hr}
${Er}
${fr}

ORGANISATIE: ${e.company_name??"Onbenoemd"}

${m}

CONTEXTDOCUMENTEN:
${p}

VOLLEDIG CASUSDOSSIER (VERPLICHT LEIDEND):
${b}

CONTEXT ENGINE RECONSTRUCTIE (GEEN ADVIES, ALLEEN SYSTEEM):
${y||"Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY RETRIEVER:
${X}

KNOWLEDGE GRAPH QUERY:
${_}

HYPOTHESIS CONCURRENTIE:
${de}

CAUSALE MECHANISMEN:
${H}

STRATEGISCHE KERNSPANNING:
${V||"Niet beschikbaar; leid kernspanning af uit primaire broncontext."}

STRATEGISCHE OPTIES:
${ce||"Niet beschikbaar; leid strategische opties af uit primaire broncontext."}

BESTUURLIJKE BLINDE VLEKKEN:
${z}

STRATEGISCHE VOORUITBLIK:
${ve}

STRATEGIC THINKING PATTERNS:
${K||"Niet beschikbaar; gebruik first-principles patronen."}

STRUCTURELE DIAGNOSE ENGINE (GEEN ADVIES, ALLEEN DIAGNOSE):
${B||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC REASONING NODE:
${Ee||"Niet beschikbaar; leid strategische inzichten af uit primaire broncontext."}

ORGANISATIEDYNAMIEK ENGINE:
${ne||"Niet beschikbaar; leid organisatiedynamiek af uit primaire broncontext."}

BOARDROOM INTELLIGENCE NODE:
${se||"Niet beschikbaar; leid boardroom-intelligentie af uit primaire broncontext."}

STRATEGISCHE HYPOTHESE ENGINE (GEEN ADVIES, ALLEEN HYPOTHESEN):
${je||"Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${fe||"Niet beschikbaar; leid scenario-simulaties af uit primaire broncontext."}

INTERVENTIE ENGINE (PLAN VAN AANPAK):
${R||"Niet beschikbaar; leid interventies af uit primaire broncontext."}

DECISION QUALITY NODE:
${pe||"Niet beschikbaar; leid besluitkwaliteitsanalyse af uit primaire broncontext."}

STRATEGISCHE OPTIES EN BESLUITDRUK ENGINE:
${ie}

STRATEGIC ANALYSIS MAP (PRIMAIRE RAPPORTBRON):
${to(xt)}

ORGANIZATIONAL SIMULATION ENGINE:
${te}

META-REASONING ENGINE:
${Ie}

BRIEF CONTEXT:
${T||"Geen bruikbare brief-context; rapporteer alleen wat uit bronmateriaal afleidbaar is."}

LEGACY CONTEXT:
${I||"Geen legacy-context; markeer ontbrekende onderbouwing expliciet."}
`.trim()}];let Y=[...G],Q="",W=0,ae=0;const me=k=>{const C=Um(k),w=String(Q||"").trim().slice(-16e3);if(!w){Y=[...G,{role:"user",content:C}];return}Y=[...G,{role:"assistant",content:w},{role:"user",content:C}]};for(;An(Q)<o&&W<Cg&&!(An(Q)>=s);){try{const k=await Ue("gpt-4o",Y,{max_tokens:Ra,temperature:a});if(typeof k=="string"&&k.trim()){const C=k.trim();if(Xa(C))ae=0,me("vorige output bevatte verboden generieke consultancy-taal en is afgekeurd; lever volledige herwerking zonder verboden termen");else{const w=Q?`${Q}

${C}`:C;Q=_n(w,s),ae=0,me()}}else if(ae+=1,ae<=2)me("vorige output was leeg of afgebroken; ga exact verder vanaf de laatste volledige zin zonder herhaling");else break}catch{if(ae+=1,ae<=3)me("vorige call faalde technisch; hervat exact vanaf de laatste volledige zin en behoud de 9-sectiestructuur");else break}W++}let v=Q.trim()||eo(e,o,r);v=Hi(v,e,se,fe,z,ve,ie,te,Ie,pe,Ge,de,H,X,_,o,r),v=Gt(v),v=Zt(v,h),Yt(v);const M=["ANCHOR REPAIR MODE","POWER/IRREVERSIBILITY/CULTURE REPAIR MODE","INTERVENTION REWRITE MODE"];let ue=null;for(let k=1;k<=4;k+=1)try{Cl({text:v,context:h,lastOutput:x}),ue=null;break}catch(C){if(!(C instanceof D))throw C;if(ue=C,k>=4)break;const w=M[k-1],oe=C.repairDirective||(C.code==="REPETITION_TOO_HIGH"?"Volledig nieuwe formulering + andere mechanische keten; geen zinsdelen hergebruiken.":"Herbouw output met exacte gate-compliance."),$e=w==="INTERVENTION REWRITE MODE"||C.code==="INTERVENTION_ARTEFACT_REQUIRED",We=`
${er}
${w}
FOUTCODE: ${C.code}
REPAIR DIRECTIVE: ${oe}

REGELS:
- ${$e?"Herschrijf uitsluitend sectie 10, maar retourneer volledige narrative met exact dezelfde 12 headings.":"Herschrijf de volledige narrative opnieuw. Niet patchen."}
- Elke sectie minimaal 2 casus-ankers uit context.
- Sectie 8: elke interventie verwijst expliciet naar een casus-anker.
- Sectie 9 start exact met: De Raad van Bestuur committeert zich aan:
- Bij REPETITION_TOO_HIGH: verplicht volledig nieuwe formulering + andere mechanische keten.

CONTEXT:
${b}

CONTEXT ENGINE RECONSTRUCTIE:
${y||"Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY RETRIEVER:
${X}

KNOWLEDGE GRAPH QUERY:
${_}

HYPOTHESIS CONCURRENTIE:
${de}

CAUSALE MECHANISMEN:
${H}

STRATEGISCHE KERNSPANNING:
${V||"Niet beschikbaar; leid kernspanning af uit primaire broncontext."}

STRATEGISCHE OPTIES:
${ce||"Niet beschikbaar; leid strategische opties af uit primaire broncontext."}

BESTUURLIJKE BLINDE VLEKKEN:
${z}

STRATEGISCHE VOORUITBLIK:
${ve}

STRATEGIC THINKING PATTERNS:
${K||"Niet beschikbaar; gebruik first-principles patronen."}

STRUCTURELE DIAGNOSE ENGINE:
${B||"Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC REASONING NODE:
${Ee||"Niet beschikbaar; leid strategische inzichten af uit primaire broncontext."}

ORGANISATIEDYNAMIEK ENGINE:
${ne||"Niet beschikbaar; leid organisatiedynamiek af uit primaire broncontext."}

BOARDROOM INTELLIGENCE NODE:
${se||"Niet beschikbaar; leid boardroom-intelligentie af uit primaire broncontext."}

STRATEGISCHE HYPOTHESE ENGINE:
${je||"Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${fe||"Niet beschikbaar; leid scenario-simulaties af uit primaire broncontext."}

INTERVENTIE ENGINE:
${R||"Niet beschikbaar; leid interventies af uit primaire broncontext."}

DECISION QUALITY NODE:
${pe||"Niet beschikbaar; leid besluitkwaliteitsanalyse af uit primaire broncontext."}

STRATEGISCHE OPTIES EN BESLUITDRUK ENGINE:
${ie}

ORGANIZATIONAL SIMULATION ENGINE:
${te}

META-REASONING ENGINE:
${Ie}

VORIGE OUTPUT:
${v}
`.trim(),rt=await Ue("gpt-4o",[{role:"system",content:no()},{role:"user",content:We}],{max_tokens:Ra,temperature:a});typeof rt=="string"&&rt.trim()&&(v=Hi(rt.trim(),e,se,fe,z,ve,ie,te,Ie,pe,Ge,de,H,X,_,o,r),v=Zt(v,h),Yt(v))}if(ue)throw ue;try{Pi(v,n)}catch{const k=tt.every(w=>v.includes(w));if(!(An(v)>=Math.max(3200,o-400)&&k&&!Xa(v))){const w=eo(e,o,r),oe=Hi(w,e,se,fe,z,ve,ie,te,Ie,pe,Ge,de,H,X,_,o,r),$e=Gt(oe),We=Zt($e,h);Yt(We);try{Pi(We,n),v=We}catch{v=We}}}v=Gt(v),v=Zt(v,h),Yt(v);try{const k=Fo({text:v});v=k.composedText,Je(he,{narrative:v}),Ce=k.structure.pass,Rt=k.causality.pass,k.warnings.length&&P.push(...k.warnings)}catch{P.push("BoardroomNarrativeComposer kon niet volledig worden toegepast; output is niet verrijkt door narrative intelligence.")}v=Gt(v),v=Zt(v,h),Yt(v);try{const k=vu({boardroomReport:v,sourceContext:h});At=!0,Ct=k.critiqueText,it=k.missingSignals.length,k.missingSignals.length&&P.push(`StrategicCritiqueAgent: aandachtspunten gedetecteerd: ${k.missingSignals.join(", ")}`);const C=Ru({boardroomReport:v,critique:k});C.changesApplied.length&&(mt=!0,P.push(`NarrativeRewriteEngine: ${C.changesApplied.join(" | ")}`)),v=C.rewrittenReport,Je(he,{narrative:v});const w=$u({boardroomReport:v});Bn=w.validationText,v=Qg(v,w.validationText),Je(he,{narrative:v}),Ot=w.entries.length>0,w.hasHighRisk&&P.push("ExecutionFeasibilityValidator: ten minste een interventie heeft hoog uitvoeringsrisico."),En=At||mt||Ot}catch{P.push("Reflection/Narrative Discipline/Execution Feasibility layers konden niet volledig worden toegepast.")}v=Gt(v),v=Zt(v,h),Yt(v),Je(he,{narrative:v});const Me=su(he);fn=Me.pass,Vt=Me.issues,Vt.length&&P.push(`ReasoningGuard: ${Vt.join(" | ")}`);try{Ce=Ko(v).pass,Rt=Vo(v).pass}catch{}Pi(v),$m(v);try{const k=new Date().toISOString(),C=A(e.analysis_id)||`case-${d.slice(0,12)}-${Date.now().toString(36)}`,w=L(v,"### 1. DOMINANTE THESE").trim(),oe=L(v,"### 2. KERNCONFLICT").trim(),$e=L(v,"### 9. STRATEGISCHE SCENARIOANALYSE"),We=L(v,"### 12. BESLUITKADER"),rt=On($e,/\bVOORKEURSSCENARIO:\s*(.+)$/im)||On(We,/\bBesluit:\s*(.+)$/im)||"Nog niet expliciet vastgelegd.",hi=L(v,"### 10. 90-DAGEN INTERVENTIEPROGRAMMA").trim(),Mn=rm(v),Pn=am(K),Un=im(v),Ei=L(v,"1-PAGINA BESTUURLIJKE SAMENVATTING").trim();if(!N.listCases().some(Te=>Te.caseId===C)){const Te={caseId:C,createdAt:k,sector:A(e.sector_selected)||"onbekend",organizationSize:"onbekend",keyProblem:oe||"Niet expliciet benoemd.",dominantThesis:w||"Niet expliciet benoemd.",strategicInsights:Un.length>0?Un:["Geen direct vergelijkbare cases gevonden; first-principles redenering toegepast."],chosenStrategy:rt,interventionProgram:hi||"Niet expliciet benoemd.",resultSummary:Ei||"Analyse afgerond; implementatieresultaat nog onbekend."};N.addCase(Te),j.indexCase(Te),Mn.forEach((fi,Ds)=>{N.addIntervention({interventionId:`${C}-int-${Ds+1}`,caseId:C,problemType:oe.slice(0,220)||"strategisch uitvoeringsprobleem",intervention:fi.slice(0,1200),sector:A(e.sector_selected)||"onbekend",result:"Nog te meten"})})}const ke=au({companyName:A(e.company_name)||"Onbekende organisatie",sector:A(e.sector_selected)||"onbekend",problem:oe||"onbekend probleem",strategy:rt||"onbekende strategie",interventions:Mn.map(Te=>Te.slice(0,220)),patterns:Pn.length>0?Pn:["BOTTLENECK ANALYSIS","ECONOMIC ENGINE","INCENTIVE STRUCTURE","SYSTEM DYNAMICS"]});U.apply(ke)}catch{P.push("Strategic memory of knowledge graph kon niet volledig worden bijgewerkt; rapportgeneratie is wel voltooid.")}return v=dr(v),Wo(v),Aa.set(d,v),{text:v,metrics:{words:An(v),loops:W,documents_used:c.length,used_questions:g,engine_pipeline:["Context Engine","StrategicMemoryRetriever","KnowledgeGraphQuery","HypothesisGenerator","HypothesisCompetition","CausalMechanismDetector","Strategic Tension Engine","Strategic Option Generator","Strategic Option Evaluator","BlindSpotDetector","StrategicThinkingPatterns","Structurele Diagnose Engine","Strategic Insight Engine","Organisatiedynamiek Engine","Boardroom Intelligence Node","Strategische Hypothese Engine","StrategicForesightEngine","Scenario Simulation Node","Interventie Engine","DecisionOptionGenerator","DecisionTradeoffAnalyzer","DecisionPressureEngine","OrganizationalSimulationEngine","MetaReasoningEngine","Decision Quality Node","StrategicReasoningGate","NarrativeStructureEngine","NarrativeCausalityValidator","BoardroomNarrativeComposer","Shared ReasoningState","ReasoningGuard","Strategic Critique Agent","Narrative Rewrite Engine","Execution Feasibility Validator"],engine_status:{"Context Engine":!!y,StrategicMemoryRetriever:!0,KnowledgeGraphQuery:!0,HypothesisGenerator:Nt>=3,HypothesisCompetition:/\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(de),CausalMechanismDetector:/\bSTRUCTURELE OORZAAK\b/i.test(H),"Strategic Tension Engine":!!V,"Strategic Option Generator":!!ce,"Strategic Option Evaluator":!!Se,BlindSpotDetector:nt>=3,StrategicThinkingPatterns:!!K,"Structurele Diagnose Engine":!!B,"Strategic Insight Engine":!!Ee,"Organisatiedynamiek Engine":!!ne,"Boardroom Intelligence Node":!!se,"Strategische Hypothese Engine":!!je,StrategicForesightEngine:Re>=3,"Scenario Simulation Node":!!fe,"Interventie Engine":!!R,DecisionOptionGenerator:Oe>=3,DecisionTradeoffAnalyzer:Oe>=3,DecisionPressureEngine:/\bVOORKEURSOPTIE\b/i.test(ie),OrganizationalSimulationEngine:ye>0,MetaReasoningEngine:xe,"Decision Quality Node":!!pe,StrategicReasoningGate:Tt,NarrativeStructureEngine:Ce,NarrativeCausalityValidator:Rt,BoardroomNarrativeComposer:!!(v&&v.trim()),"Shared ReasoningState":!0,ReasoningGuard:fn,"Strategic Critique Agent":At,"Narrative Rewrite Engine":mt,"Execution Feasibility Validator":Ot},context_engine_enabled:!!y,strategic_memory_retriever_enabled:!0,knowledge_graph_query_enabled:!0,hypothesis_generator_enabled:Nt>=3,hypothesis_competition_enabled:/\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(de),causal_mechanism_detector_enabled:/\bSTRUCTURELE OORZAAK\b/i.test(H),strategic_tension_engine_enabled:!!V,strategic_option_generator_enabled:!!ce,strategic_option_evaluator_enabled:!!Se,blind_spot_detector_enabled:nt>=3,strategic_thinking_patterns_enabled:!!K,diagnosis_engine_enabled:!!B,strategic_insight_node_enabled:!!Ee,strategic_reasoning_node_enabled:!!Ee,org_dynamics_engine_enabled:!!ne,boardroom_intelligence_node_enabled:!!se,hypothesis_engine_enabled:!!je,strategic_foresight_engine_enabled:Re>=3,scenario_simulation_node_enabled:!!fe,intervention_engine_enabled:!!R,decision_option_generator_enabled:Oe>=3,decision_tradeoff_analyzer_enabled:Oe>=3,decision_pressure_engine_enabled:/\bVOORKEURSOPTIE\b/i.test(ie),organizational_simulation_engine_enabled:ye>0,meta_reasoning_engine_enabled:xe,decision_quality_node_enabled:!!pe,decision_quality_score:Ge,interventions_inconsistent:be,strategic_reasoning_gate_enabled:Tt,narrative_structure_engine_enabled:Ce,narrative_causality_validator_enabled:Rt,boardroom_narrative_composer_enabled:!!(v&&v.trim()),shared_reasoning_state_enabled:!0,reasoning_guard_enabled:!0,reasoning_guard_pass:fn,reasoning_guard_issues:Vt,reasoning_state_snapshot_sizes:{context_state:he.context_state.entries.length,diagnosis:he.diagnosis.entries.length,mechanisms:he.mechanisms.entries.length,strategic_tension:he.strategic_tension.entries.length,strategic_options:he.strategic_options.entries.length,insights:he.insights.entries.length,decision:he.decision.entries.length,narrative:he.narrative.entries.length},reflection_layer_enabled:En,strategic_critique_agent_enabled:At,narrative_rewrite_engine_enabled:mt,execution_feasibility_validator_enabled:Ot,critique_signal_count:it,critique_excerpt:Ct.slice(0,800),execution_validation_excerpt:Bn.slice(0,800),strategic_depth_score:It,strategic_reasoning_warnings:P,analysis_map_enabled:!0,analysis_map_scenarios:xt.scenarios.length,analysis_map_interventions:xt.interventions.length,analysis_map_recommended_option:xt.recommendedOption,reality_engine_enabled:!0,reality_engine_confidence_score:S.evidenceConfidenceScore,strategic_memory_cases_retrieved:hn,knowledge_graph_comparable_organizations:Fe,hypothesis_count:Nt,causal_mechanism_count:F,blind_spot_count:nt,strategic_foresight_scenarios:Re,decision_option_count:Oe,simulation_intervention_count:ye,strategic_memory_cases_stored:N.listCases().length,strategic_memory_interventions_stored:N.listInterventions().length}}}function Ym(e){const t=typeof e?.narrative=="string"?e.narrative:typeof e?.raw_markdown=="string"?e.raw_markdown:"",n=e?.sections&&typeof e.sections=="object"?e.sections:{},i=Object.keys(n);console.table({narrativeLength:t.trim().length,sectionsCount:i.length,keys:i.join(", ")})}function qm(e){const t=e.signals??[],n=t.filter(o=>/toezicht|regelgeving|beleid|inspectie|compliance|igj|nza|afm|dnb|acm/i.test(o)).length,i=t.filter(o=>/contract|tarief|verzekeraar|inkoop|prijs|contractmacht/i.test(o)).length,r=t.filter(o=>/arbeidsmarkt|krapte|personeel|uitval|rooster|werkdruk/i.test(o)).length,a=t.length;return{sectorRiskIndex:Math.min(100,a*20),regulatorPressureIndex:Math.min(100,n*30),contractPowerScore:Math.min(100,i*30),arbeidsmarktdrukIndex:Math.min(100,r*30),rubric:{sectorRiskIndex:`20 * signal_count (${a})`,regulatorPressureIndex:`30 * regulator_signal_count (${n})`,contractPowerScore:`30 * contract_signal_count (${i})`,arbeidsmarktdrukIndex:`30 * labor_signal_count (${r})`}}}const nr=new Map,Qm=10080*60*1e3;function Xm(e){const t=nr.get(e);return t?Date.now()>t.expiresAtEpochMs?(nr.delete(e),null):t.payload:null}function ep(e,t){nr.set(e,{fetchedAt:new Date().toISOString(),expiresAtEpochMs:Date.now()+Qm,payload:t})}const tp={gezondheidszorg:["Toezichtdruk op toegankelijkheid en kwaliteit vraagt versnelde governance-cadence.","Arbeidsmarktkrapte verhoogt roosterfrictie en operationele uitvaldruk.","Contractering met verzekeraars verschuift contractmacht naar meetbare uitkomsten."],advies_consultancy:["Inkoopdiscipline verschuift prijsmacht naar aantoonbare impact op klantresultaat.","Schaarste op senior profielen verhoogt leverings- en retentierisico.","Automatisering drukt marge op standaardwerk en vergroot specialisatiedruk."],bouw:["Regelgeving en vergunningtempo bepalen uitvoerbaarheid van projectportfolio.","Materiaalprijsvolatiliteit verhoogt contractrisico in vaste prijsafspraken.","Arbeidsmarktkrapte vergroot afhankelijkheid van onderaannemers."],cultuur:["Subsidiecycli vergroten onzekerheid in meerjarige capaciteitsplanning.","Platformmacht beïnvloedt contractpositie en distributie-inkomsten.","Personele schaarste verhoogt kans op productie- en planningsfrictie."],energie:["Regulatoire druk en netcapaciteit beïnvloeden investeringsvolgorde.","Prijsvolatiliteit vergroot contract- en portefeuillerisico.","Arbeidsmarktkrapte vertraagt uitvoering van transitieprogramma's."],financiele_dienstverlening:["Toezichtdruk verhoogt compliance- en rapportagebelasting.","Rente- en liquiditeitsdynamiek verscherpen contractvoorwaarden.","Schaarste op risk/compliance-profielen remt verandercapaciteit."],detailhandel:["Koopkrachtvolatiliteit verhoogt druk op marge en assortimentskeuzes.","Kanaalverschuiving wijzigt contractmacht in de keten.","Arbeidsmarktdruk in logistiek verhoogt verstoringskans in operatie."],industrie:["Ketenvolatiliteit beïnvloedt leveringszekerheid en contractkosten.","Grondstofschommelingen verschuiven onderhandelingsruimte in contracten.","Technische arbeidsmarktkrapte beperkt schaalbaarheid van productie."],onderwijs:["Bekostigingskaders en toezicht bepalen bestuurlijk handelingsritme.","Docentenschaarste verhoogt roosterdruk en continuiteitsrisico.","Digitale leveranciers verschuiven contractmacht in leermiddelenketen."]};async function Ki(e){const t=Xm(e);if(t)return{...t,source:"cache"};const n=tp[e]??[],i=qm({signals:n}),r={sector:e,source:"curated",fetchedAt:new Date().toISOString(),signals:n,...i};return ep(e,r),r}async function np(e){{const n=await Ki(e);return{...n,source:n.source||"fallback"}}try{const n=await fetch(`/api/sector/signals?sector=${encodeURIComponent(e)}`);return n.ok?await n.json():{...await Ki(e),source:"fallback"}}catch{return{...await Ki(e),source:"fallback"}}}const ip=[{value:"gezondheidszorg",label:"Gezondheidszorg"},{value:"advies_consultancy",label:"Advies / Consultancy"},{value:"bouw",label:"Bouw"},{value:"cultuur",label:"Cultuur"},{value:"energie",label:"Energie"},{value:"financiele_dienstverlening",label:"Financiële dienstverlening"},{value:"detailhandel",label:"Detailhandel"},{value:"industrie",label:"Industrie"},{value:"onderwijs",label:"Onderwijs"}];function rp({title:e,subtitle:t,children:n}){return E.jsxs("div",{className:"cyntra-shell w-full overflow-hidden font-sans",children:[E.jsxs("div",{className:"h-14 flex items-center px-8 border-b divider-cyntra bg-cyntra-surface/90 backdrop-blur",children:[E.jsx("div",{className:"text-[10px] tracking-cockpitWide uppercase text-cyntra-gold font-semibold",children:"CYNTRA · AURELIUS"}),E.jsx("div",{className:"ml-auto text-[10px] tracking-cockpit text-cyntra-secondary font-semibold",children:"Bestuurlijk · Vertrouwelijk"})]}),E.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-[260px_1fr_280px] min-h-[calc(100vh-56px)]",children:[E.jsxs("aside",{className:"border-b xl:border-b-0 xl:border-r divider-cyntra bg-cyntra-surface px-6 py-8",children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-8 font-semibold",children:"Context"}),E.jsxs("div",{className:"space-y-6 text-sm",children:[E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Analyse"}),E.jsx("div",{className:"text-cyntra-primary font-semibold text-base",children:e})]}),t&&E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Doel"}),E.jsx("div",{className:"text-cyntra-secondary leading-relaxed text-sm",children:t})]}),E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Status"}),E.jsxs("div",{className:"flex items-center gap-2 text-cyntra-gold text-xs font-semibold",children:[E.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-cyntra-gold"}),"Actief"]})]})]})]}),E.jsx("main",{className:"relative overflow-y-auto px-6 md:px-12 py-12 bg-cyntra-primary",children:E.jsxs("div",{className:"relative z-10 max-w-6xl mx-auto",children:[E.jsxs("header",{className:"mb-14",children:[E.jsx("h1",{className:"text-3xl font-semibold tracking-tight text-cyntra-gold normal-case",children:e}),t&&E.jsx("p",{className:"mt-2 text-sm text-cyntra-secondary max-w-2xl leading-relaxed",children:t})]}),E.jsx("div",{className:"text-[15px] leading-relaxed tracking-normal text-cyntra-primary",children:n})]})}),E.jsxs("aside",{className:"border-t xl:border-t-0 xl:border-l divider-cyntra bg-cyntra-surface px-6 py-8",children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-8 font-semibold",children:"Besluitbeeld"}),E.jsxs("div",{className:"space-y-8 text-sm",children:[E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Vertrouwen"}),E.jsx("div",{className:"text-4xl font-semibold text-cyntra-gold",children:"HIGH"})]}),E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Risiconiveau"}),E.jsx("div",{className:"text-cyntra-primary",children:"MODERATE"})]}),E.jsxs("div",{children:[E.jsx("div",{className:"text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold",children:"Sturingsmodus"}),E.jsx("div",{className:"text-cyntra-primary",children:"Bestuurlijke afstemming"})]})]})]})]})]})}function ap({text:e="STRICTLY CONFIDENTIAL",logoUrl:t,risk:n="MODERATE"}){const i=n==="HIGH"?.09:n==="MODERATE"?.05:.03;return E.jsx("div",{className:"pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none",children:E.jsx("div",{className:"absolute -inset-[50%] flex flex-wrap gap-x-32 gap-y-24 rotate-[-30deg]",style:{opacity:i},children:Array.from({length:40}).map((r,a)=>E.jsx("div",{className:"flex items-center justify-center font-bold text-white whitespace-nowrap",style:{fontSize:"4.5rem"},children:t?E.jsx("img",{src:t,alt:"Watermark",className:"h-16 opacity-80"}):e},a))})})}function op({label:e,onClick:t,disabled:n}){return E.jsx("button",{onClick:t,disabled:n,className:`
        mt-14
        px-14
        py-5
        uppercase
        tracking-[0.4em]
        text-base
        font-semibold
        border
        transition-all
        duration-300
        ${n?"border-[var(--c-border)] text-[var(--c-text-muted)] cursor-not-allowed opacity-60":"border-[var(--c-accent)] text-[var(--c-accent)] hover:bg-[var(--c-accent)] hover:text-[var(--c-bg)] hover:shadow-[var(--c-glow-gold)] active:scale-[0.98]"}
      `,children:e})}const ms="cyntra.stored_reports.v1",sp="cyntra_report_db",ri="reports";function cp(e,t){if(!e)return t;try{return JSON.parse(e)}catch{return t}}function lp(){return typeof localStorage>"u"?[]:cp(localStorage.getItem(ms),[])}function dp(e){typeof localStorage>"u"||localStorage.setItem(ms,JSON.stringify(e))}function up(e){return[...e].sort((t,n)=>new Date(n.date).getTime()-new Date(t.date).getTime())}function gp(){return typeof indexedDB>"u"?Promise.resolve(null):new Promise(e=>{const t=indexedDB.open(sp,1);t.onupgradeneeded=()=>{const n=t.result;n.objectStoreNames.contains(ri)||n.createObjectStore(ri,{keyPath:"id"}).createIndex("date","date",{unique:!1})},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)})}async function mp(e){const t=await gp();return t?new Promise(n=>{const i=t.transaction(ri,"readwrite");i.objectStore(ri).put(e),i.oncomplete=()=>n(!0),i.onerror=()=>n(!1)}):!1}async function pp(e){try{return(await fetch("/api/reports-storage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).ok}catch{return!1}}async function bp(e){const t=lp().filter(n=>n.id!==e.id);t.unshift(e),dp(up(t).slice(0,1e3)),await mp(e).catch(()=>!1),await pp(e).catch(()=>!1)}const hp=[/\bKeuzedruk\b/i,/\bHARD\s*-/i,/\bbron:\b/i,/\bKopieer richting\b/i,/\bOption placeholder\b/i,/\bOUTPUT\s*\d+\b/i,/\bCONTEXT LAYER\b/i,/\bSTRATEGIC CONFLICT\b/i,/\bSTRATEGY SIMULATION\b/i,/\bDECISION MEMORY\b/i];function Ep(e){const t=hp.map(n=>e.match(n)?.[0]).filter(Boolean);return{pass:t.length===0,matches:t}}const fp=[/\blaagste directe\b/i,/\bverschuift strategisch\b/i,/\bdaalt o\b/i,/\bzodra\b/i,/\benz\.\b/i],kp=[/^Strategisch patroon$/i];function vp(e){const n=String(e??"").split(`
`).map(i=>i.trim()).filter(Boolean).filter(i=>!kp.some(r=>r.test(i))&&fp.some(r=>r.test(i)));return{pass:n.length===0,matches:n}}function Sp(e,t){return{pass:!0,mismatches:[]}}function Ip(e){return{pass:!0,issues:[]}}function Tp(e){return{pass:!0,issues:[]}}function Np(e,t){return{pass:!0,issues:[]}}function io(e){return String(e??"").replace(/\s+/g," ").trim()}function Rp(e){return/\b(mechanisme|oorzaak|waardoor|omdat|via|door|systemPressure|systeemdruk|gevolg)\b/i.test(e)}function ro(e){return/\b(druk|wachttijd|wachtdruk|uitval|marge|vertraging|frictie|schaarste|drukte|risico)\b/i.test(e)}function Ap(e,t){const n=[],i=io(e);if(!i)return{pass:!0,issues:n};const r=io("");r&&ro(r)&&!Rp(r)&&n.push("Dominant risico beschrijft vooral een symptoom zonder expliciet mechanisme.");const a=/\bSysteemmechanisme\b/i.test(i),o=/\bMechanismeketens\b/i.test(i)||/\bMECHANISME\s*[—:-]/i.test(i);return i&&/\bKERNPROBLEEM\b/i.test(i)&&!a&&!o&&ro(i)&&n.push("Rapport benoemt symptomen maar mist een expliciete systeemmechanismesectie."),{pass:n.length===0,issues:n}}const Op=[{re:/^\s*Keuzedruk\s+\d+\s*$/gim},{re:/^\s*Kopieer richting\s*$/gim},{re:/^\s*bron:\s*.*$/gim},{re:/^\s*HARD\s*-\s*/gim,replacement:""},{re:/^\s*Mechanisme zonder inhoud\s*$/gim}],Cp=[/\bKeuzedruk\s+\d+\b/gi,/\bKopieer richting\b/gi,/\bMechanisme zonder inhoud\b/gi],wp=[/\bHISTORISCH LEERSIGNAAL\b/gi,/\bPattern match\b/gi],jp=[/^\s*Samenvatting gesprekverslag(?:\s+\w+)?\s*:?\s*$/i,/^\s*🔴\s*ACTION ITEMS.*$/i,/^\s*Action items\s*$/i,/^\s*🟢\s*FYI.*$/i,/^\s*⛔\s*BLOCKERS.*$/i,/^\s*Notes\s*$/i,/^\s*OPEN VRAGEN.*$/i],xp=[/\bScenario\s+A\s+[—-]\s+Volumegroei(?:\s+via\s+extra\s+capaciteit)?\b/i,/\bScenario\s+[ABC]\s+[—-]\s+Status quo\b/i,/\bScenario\s+[ABC]\s+[—-]\s+Hybride\b/i,/\bScenario\s+[ABC]\s+[—-]\s+Volumegroei\b/i];function Kt(e){return String(e??"").replace(/\r\n/g,`
`)}function ir(e){return String(e??"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim()}function yp(e){const t=e.trim();return!t||/^(#{1,6}|\d+[.)]|[-*•])\s+/.test(t)||/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s'-]+:\s*.+$/.test(t)||/^(SCENARIO'?S|INTERVENTIES|KERNPROBLEEM|KERNSTELLING|AANBEVOLEN KEUZE)$/i.test(t)||/^Scenario\s+[A-Z]\s+[—-]\s+.+$/i.test(t)||/^Red flag\s+\d+\s+[—-]\s+.+$/i.test(t)||/^[A-Z][A-Za-z0-9&' -]{3,}$/.test(t)&&!/[.!?:]$/.test(t)||/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s'-]+$/.test(t)&&t===t.toUpperCase()||/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s/'-]{12,}$/.test(t)&&!/[.!?:]$/.test(t)||/^(Sector|Analyse datum):\s*.+$/i.test(t)||/^STOPREGEL\s+\d+$/i.test(t)||/^(Sector|Analyse datum|Kernprobleem|Kernstelling|Aanbevolen keuze|Waarom deze keuze|Grootste risico bij uitstel|Stopregel)\s*$/i.test(t)?!1:!!(/\b(en|maar|of|omdat|waardoor|terwijl|zodat|plus|zonder)\s*$/i.test(t)||/^(De spanning zit tussen a\.|Herzie direct als De spanning zit tussen a\.)$/i.test(t)||/^(Omdat c\.\s*optie a)/i.test(t)||/^[A-Za-zÀ-ÿ].{0,80}$/.test(t)&&!/[.!?:]$/.test(t)&&t.split(/\s+/).filter(Boolean).length<=8)}function $p(e,t){let n=Kt(e);for(const{re:i,replacement:r}of Op)n=n.replace(i,a=>(t.push({code:"forbidden_artifact",message:"Verboden artefact uit board report verwijderd.",fragment:a.trim()}),r??""));return n=n.split(`
`).filter(i=>[...Cp,...wp].find(a=>a.test(i))?(t.push({code:"forbidden_artifact",message:"Verboden artefactregel uit board report verwijderd.",fragment:i.trim()}),!1):!0).join(`
`),n.replace(/\n{3,}/g,`

`).trim()}function _p(e,t){const n=Kt(e).split(`
`),i=[];let r=!1;for(const a of n){let o=a.trim();const s=o.match(/^(.*?)(?:\s+Bronnen?\s*:|\s+Notes\b|\s+Action items\b)[\s\S]*$/i);if(s&&(t.push({code:"forbidden_artifact",message:"Inline bron- of notitieblok uit hoofdrapport verwijderd.",fragment:o}),o=String(s[1]??"").trim(),!o))continue;const c=jp.some(u=>u.test(o)),l=/\[Bron:\s*[^\]]+\]/i.test(o)||/\bFireflies\b/i.test(o)||/^\s*[•*-]\s+/.test(a)&&/\[Bron:\s*[^\]]+\]/i.test(a);if(c){r=!0,t.push({code:"forbidden_artifact",message:"Ruw bronblok uit hoofdrapport verwijderd.",fragment:o});continue}if(r){if(!o)continue;if(/^\d+\s*$/.test(o)||/^(Bestuurlijke kernsamenvatting|Besluitvraag|Kernstelling van het rapport|Feitenbasis|Keuzerichtingen|Aanbevolen keuze|Doorbraakinzichten|Bestuurlijk actieplan|Bestuurlijke stresstest|Bestuurlijke blinde vlekken|Vroegsignalering|Mogelijke ontwikkelingen|Besluitgevolgen|Open strategische vragen)\b/i.test(o))r=!1;else{t.push({code:"forbidden_artifact",message:"Ruwe bronregel uit hoofdrapport verwijderd.",fragment:o});continue}}if(l){t.push({code:"forbidden_artifact",message:"Bronregel met transcriptverwijzing verwijderd.",fragment:o});continue}i.push(o===a.trim()?a:o)}return i.join(`
`).replace(/\n{3,}/g,`

`).trim()}function zp(e,t){return Kt(e).split(`
`).map(r=>/^\s*BESTUURLIJK BESLUIT\s*[—:-]\s*Laat het bestuur besluiten hoe\b/i.test(r)?(t.push({code:"forbidden_artifact",message:"Placeholder-besluittaal genormaliseerd naar bestuurlijke besluitzin.",fragment:r.trim()}),r.replace(/Laat het bestuur besluiten hoe\s+.+?\s+bestuurlijk borgt\.?/i,"Het bestuur besluit deze interventie vast te stellen, te beleggen en op voortgang te toetsen.")):r).join(`
`).replace(/\n{3,}/g,`

`).trim()}function Dp(e,t){const n=[];for(const i of Kt(e).split(`
`)){if(!yp(i)){n.push(i);continue}t.push({code:"incomplete_sentence",message:"Onvolledige of semantisch kapotte regel verwijderd.",fragment:i.trim()})}return n.join(`
`).replace(/\n{3,}/g,`

`).trim()}function Lp(e,t){const n=new Set,i=Kt(e).split(`
`),r=[];for(const a of i){const o=a.trim();if(!o){r.push(a);continue}const s=/^(KERNINZICHT|ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|OPERATIONEEL GEVOLG|FINANCIEEL GEVOLG|ORGANISATORISCH GEVOLG)\s*(?:-|—|:)/i.test(o)||/^Bestuurlijke stilstand vergroot de schade sneller dan extra activiteit haar compenseert\.?$/i.test(o),c=ir(o);if(s&&n.has(c)){t.push({code:"duplicate_core_line",message:"Dubbele kernregel verwijderd.",fragment:o});continue}s&&n.add(c),r.push(a)}return r.join(`
`).replace(/\n{3,}/g,`

`).trim()}function Bp(e,t){const n=[...Kt(e).matchAll(/^\s*Sector\s*:?\s*(.+)\s*$/gim)].map(r=>String(r[1]??"").trim()).filter(Boolean);Array.from(new Set(n.map(r=>r.toLowerCase()))).length>1&&t.push({code:"metadata_conflict",message:`Conflicterende sectorlabels gedetecteerd: ${n.join(" / ")}`})}function Gp(e,t){for(const n of xp){const i=e.match(n);i&&t.push({code:"generic_scenario",message:"Generieke scenariolabels gedetecteerd; scenario's moeten brongebonden zijn.",fragment:i[0]})}}function Mp(e,t){const n=e.match(/Waarom niet optie\s*[BC]\?[\s\S]{0,240}?(optie a|kies de richting met de hoogste bestuurlijke beheersbaarheid)/i);if(n){t.push({code:"why_not_choice_leak",message:"Waarom-niet-sectie lekt aanbevolen keuze in plaats van contrasterende logica.",fragment:n[0]});return}const i=e.match(/(?:AANBEVOLEN KEUZE|Aanbevolen keuze)\s*\n(?:[A-Z]\.\s*)?(.+)/i)?.[1]?.trim()??"";if(!i)return;const r=[...e.matchAll(/Waarom niet optie\s*[BC]\?\s*\n([\s\S]*?)(?=\n(?:Waarom niet optie|Besluitgevolgen|$))/gi)];for(const a of r){const o=String(a[1]??"").trim();if(!o)continue;const s=ir(o),c=ir(i);(s.includes(c.slice(0,24))||/\boptie a\b/i.test(o)||/\bkies de richting met de hoogste bestuurlijke beheersbaarheid\b/i.test(o))&&t.push({code:"why_not_choice_leak",message:"Waarom-niet-sectie lekt aanbevolen keuze in plaats van contrasterende logica.",fragment:o})}}function ps(e,t){const n=[],i=Kt(e);let r=i;return Ep(i).matches.forEach(m=>n.push({code:"forbidden_artifact",message:"Prompt-lekkage gedetecteerd.",fragment:m})),vp(i).matches.forEach(m=>n.push({code:"incomplete_sentence",message:"Fragmenteinde gedetecteerd.",fragment:m})),Gp(i,n),Mp(i,n),Bp(i,n),r=$p(r,n),r=_p(r,n),r=Dp(r,n),r=Lp(r,n),r=zp(r,n),Sp().mismatches.forEach(m=>n.push({code:"metadata_conflict",message:"Metadata ontbreekt of is inconsistent met de analysekaart.",fragment:m})),Ip().issues.forEach(m=>n.push({code:"generic_scenario",message:m})),Tp().issues.forEach(m=>n.push({code:"incomplete_sentence",message:m})),Np().issues.forEach(m=>n.push({code:"incomplete_section",message:m})),Ap(r).issues.forEach(m=>n.push({code:"symptom_without_mechanism",message:m})),{sanitizedText:r.replace(/\n{3,}/g,`

`).trim(),issues:n}}const bs=["waardoor","leidt tot","daardoor","resulteert in","betekent dat"],hs=[/onvoldoende cash-inzicht/gi,/onvoldoende financieel inzicht/gi,/\bstaat in bron\b/gi,/\bverifieer\b/gi,/\bindicatief aanwezig\b/gi,/\buitwerken\b/gi],Vi="Cash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan.",Pp=.8,Up=.9,Es="met directe impact op besluitdiscipline en uitvoeringsritme",Hp="De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel.",Kp="Dit betekent dat cliënten behandelcontinuïteit verliezen of op een wachtlijst komen, met directe impact op behandeluitkomst en verwijzersvertrouwen.",Vp="Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze.",Fp="Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt.",Wp=[{id:"cost_5",re:/5%\s*(per jaar)?|loonkosten/i,text:"Loonkosten stijgen met 5% per jaar."},{id:"tariff_7",re:/7%\s*(verlaagd|daling)?|tarief/i,text:"Tariefwijziging 2026: -7%."},{id:"adhd_90",re:/€\s?90|90\s*per cliënt|adhd/i,text:"ADHD-diagnostiek kent circa €90 verliescomponent per cliënt."},{id:"cost_1800",re:/€\s?1800|1800\s*per cliënt|kostprijs/i,text:"Gemiddelde kostprijs ligt rond €1800 per cliënt."},{id:"cap_160",re:/€\s?160\.?000|160k|plafond/i,text:"Contractplafond ligt rond €160.000 per verzekeraar per jaar."},{id:"norm_75",re:/75%\s*|6 uur cliëntcontact|productiviteit/i,text:"Gedragsnorm: 75% productiviteit (circa 6 uur cliëntcontact)."},{id:"name_deborah",re:/\bdeborah\b/i,text:"Deborah is expliciet opgenomen als actor in besluituitvoering."},{id:"name_jan",re:/\bjan\b/i,text:"Jan is expliciet opgenomen als actor in besluituitvoering."},{id:"name_barbara",re:/\bbarbara\b/i,text:"Barbara is expliciet opgenomen als actor in besluituitvoering."}];function Ke(e){return String(e??"").toLowerCase().replace(/\bdit leidt tot directe bestuurlijke consequenties\.?/g,"").replace(/,\s*waardoor besluitvertraging directe uitvoeringsschade veroorzaakt\.?/g,"").replace(new RegExp(`\\b${Es}\\.?`,"gi"),"").replace(/[^\p{L}\p{N}\s€%]/gu," ").replace(/\s+/g," ").trim()}function ai(e){let t=String(e??""),n="";for(;t!==n;)n=t,t=t.replace(/€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,(i,r,a,o)=>`€${r}${a}${o}`);return t=t.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g,"€$1$2$3"),t=t.replace(/€\s*([0-9]{1,3})([.,])\s*([0-9]{3})(?=[A-Za-z])/g,"€$1$2$3 "),t=t.replace(/€\s*([0-9][0-9.,]*)(?=[A-Za-z])/g,"€$1 "),t=t.replace(/€\s+([0-9])/g,"€$1"),t}function Jp(e){const t=new Map;for(const n of Ke(e).split(" ").map(i=>i.trim()).filter(i=>i.length>2))t.set(n,(t.get(n)??0)+1);return t}function Zp(e){const t=new Map,n=Ke(e);for(const i of n.split(" ").map(r=>r.trim()).filter(r=>r.length>2))t.set(i,(t.get(i)??0)+1);return t}function fs(e,t){if(e.size===0||t.size===0)return 0;let n=0,i=0,r=0;for(const a of e.values())i+=a*a;for(const a of t.values())r+=a*a;for(const[a,o]of e.entries()){const s=t.get(a);s&&(n+=o*s)}return!i||!r?0:n/(Math.sqrt(i)*Math.sqrt(r))}function Yp(e){const t=String(e??"").split(/\n\s*\n+/).map(a=>a.trim()).filter(Boolean),n=new Set,i=[],r=[];for(const a of t){const o=Ke(a);if(!o||n.has(o))continue;const s=Jp(a);i.some(l=>fs(l,s)>=Pp)||(n.add(o),i.push(s),r.push(a))}return r.join(`

`)}function qp(e){return String(e??"").split(/\n\s*\n+/).map(i=>i.trim()).filter(Boolean).map(i=>{const r=(i.match(/[^.!?]+[.!?]?/g)??[i]).map(s=>s.trim()).filter(Boolean),a=new Set,o=[];for(const s of r){const c=Ke(s);!c||a.has(c)||(a.add(c),o.push(s))}return o.join(" ").replace(/\s+/g," ").trim()}).filter(Boolean).join(`

`)}function Qp(e){const t=String(e??"").split(`
`),n=[],i=new Set;for(const r of t){const a=r.trim();if(!a){n.push("");continue}const o=Ke(a);!o||i.has(o)||(i.add(o),n.push(r))}return n.join(`
`).replace(/\n{3,}/g,`

`).trim()}function Xp(e,t){const n=String(e??"").split(/\s+/).map(i=>i.trim()).filter(Boolean);return n.length<=t?String(e??"").trim():n.slice(0,t).join(" ").trim()}function eb(e){const t=String(e??""),n=t.match(/€\s?[0-9][0-9.,]*/i)?.[0]??"€202.000",i=t.match(/\b\d+[,.]?\d*\s*FTE\b/i)?.[0]??t.match(/\b\d+\s*cliënten?\b/i)?.[0]??"1,3 FTE behandelcapaciteit",r=t.match(/\b(?:12\s*maanden|365\s*dagen|90\s*dagen|60\s*dagen|30\s*dagen)\b/i)?.[0]??"12 maanden",a=t.match(/\bExpliciet verlies:\s*([^\n.]+)/i)?.[1]?.trim()??"pauze op minimaal één niet-kerninitiatief";return`Een structurele druk van ${n} per jaar resulteert in verlies van ${i} binnen ${r}. Expliciet verlies: ${a}.`}function tb(e){const t=String(e??"").split(/\s+/).filter(Boolean).slice(0,200).join(" "),n=/€\s?[0-9][0-9.,]*/i.test(t),i=/\b(?:30|60|90|365|12)\s*(?:dagen|maanden|jaar)\b/i.test(t),r=/\b(?:\d+[,.]?\d*\s*FTE|capaciteit|cliënten?)\b/i.test(t),a=/\b(?:expliciet verlies|verlies:)\b/i.test(t);return n&&i&&r&&a}function nb(e){const t=String(e??"").trim();return!t||!/^(de raad moet kiezen|er is een spanningsveld|de organisatie staat voor)/i.test(t)&&tb(t)?t:`${eb(t)}

${t}`.trim()}function ks(e){return/\b(ggz|zorgverzekeraar|verzekeraar|cliënt|cliënten|behandel|wachtlijst|jeugdzorg|diagnostiek)\b/i.test(String(e??""))}function ib(e){const t=String(e??"").trim();if(!t||!ks(t))return t;let n=t;const i=/\b(behandelcontinu[iï]teit|wachtlijst|behandeluitkomst|verwijzersvertrouwen)\b/i.test(n),r=/\b(rekenkundig onmogelijk|autonome groei onmogelijk|zonder margeherstel)\b/i.test(n);return i||(n=`${n}

${Kp}`),r||(n=`${n}

${Hp}`),n.trim()}function ao(e){const t=String(e??"").trim();if(!t)return t;const n=/\b(systeemdruk|bestuurlijke nalatigheid|escalatie|escalatiemoment)\b/i.test(t),i=/\bgeen marktrisico meer,\s*maar een bestuurlijke keuze\b/i.test(t);return!n||i?t:`${t}

${Vp}`.trim()}function oo(e){const t=String(e??"").trim();if(!t||!ks(t))return t;const n=/\b(dag\s*90|90\s*dagen)\b/i.test(t),i=/\bmargekaart\b/i.test(t),r=/\b(vervalt het mandaat|mandaat.*vervalt)\b/i.test(t);return n&&i&&r||!n?t:`${t}

${Fp}`.trim()}function zn(e){const t=String(e??"").trim();if(!/^###\s*\d+\./m.test(t))return[];const n=[...t.matchAll(/^###\s*\d+\.\s*[^\n]+$/gm)];return n.map((i,r)=>{const a=(i.index??0)+i[0].length,o=n[r+1]?.index??t.length;return{heading:i[0].trim(),body:t.slice(a,o).trim()}})}function mi(e){const t=String(e??"").replace(/\s+(?=(?:###\s*)?[1-9]\.\s+(?:Dominante These|Structurele Kernspanning|Keerzijde van de keuze|De Prijs van Uitstel|Mandaat & Besluitrecht|Onderstroom & Informele Macht|Faalmechanisme|90-Dagen Interventieontwerp|Besluitkader)\b)/g,`
`).replace(/\n{3,}/g,`

`).trim();if(!/^(?:###\s*)?[1-9]\.\s+/m.test(t))return[];const n=[...t.matchAll(/^(?:###\s*)?[1-9]\.\s+[^\n]+$/gm)];return n.length?n.map((i,r)=>{const a=(i.index??0)+i[0].length,o=n[r+1]?.index??t.length;return{heading:i[0].trim(),body:t.slice(a,o).trim()}}):[]}function Dn(e){const t=zn(e);return t.length?t:mi(e)}function vr(e){const t=String(e??"").match(/(\d+)\./);if(!t)return null;const n=Number(t[1]);return Number.isFinite(n)?n:null}function rb(e){const t=String(e??"").trim(),n=zn(t),i=n.length?[]:mi(t),r=n.length?n:i;if(!r.length)return t;const a=new Map,o=[];for(const l of r){const u=Zp(l.body),g=vr(l.heading),m=g!=null?`section:${g}`:`heading:${String(l.heading??"").toLowerCase().replace(/\s+/g," ").trim()}`,p=a.get(m)??[];p.some(T=>fs(T,u)>=Up)||(p.push(u),a.set(m,p),o.push(`${l.heading}

${l.body}`.trim()))}const s=n.length?t.search(/^###\s*\d+\./m):t.search(/^\d+\.\s+/m);return[s>0?t.slice(0,s).trim():"",o.join(`

`).trim()].filter(Boolean).join(`

`).trim()}function ab(e){const t=String(e??"").trim(),n=zn(e);if(n.length){const r=new Set,a=[];for(const c of n){const l=`${c.heading.toLowerCase()}::${Ke(c.body)}`;!l||r.has(l)||(r.add(l),a.push(`${c.heading}

${c.body}`.trim()))}const o=t.search(/^###\s*\d+\./m);return[o>0?t.slice(0,o).trim():"",a.join(`

`).trim()].filter(Boolean).join(`

`).trim()}const i=mi(e);if(i.length){const r=new Set,a=[];for(const c of i){const l=`${c.heading.toLowerCase()}::${Ke(c.body)}`;!l||r.has(l)||(r.add(l),a.push(`${c.heading}

${c.body}`.trim()))}const o=t.search(/^\d+\.\s+/m);return[o>0?t.slice(0,o).trim():"",a.join(`

`).trim()].filter(Boolean).join(`

`).trim()}return e}function ob(e){const t=String(e??"").trim(),n=zn(e);if(!n.length)return e;const i=n.map(({heading:o,body:s})=>{const c=s.split(/\n\s*\n+/).map(d=>d.trim()).filter(Boolean),l=c[0]??"",u=(l.match(/[^.!?]+[.!?]?/g)??[]).map(d=>d.trim()).find(Boolean)??l,g=/^kernzin:/i.test(u)?u:`Kernzin: ${u.replace(/^Kernzin:\s*/i,"").trim()}`,m=c.slice(1,3),p=[l,...m].join(" "),I=/\b(vermijd|productiegesprek|75%|gedrag|normdruk|transparantie|maandgesprek)\b/i.test(p),T=/\b(CEO|CFO|COO|behandelaar|directie|bestuur)\b/i.test(p),b=/\b(onhoudbaar|ondermijnt executiekracht|vergroot structureel risico)\b/i.test(p),h=[g];return m.length&&h.push(...m),I||h.push("Gedragsmechanisme: de 75%-norm wordt ervaren als controle in plaats van marge-instrument, waardoor productiegesprekken worden vermeden."),T||h.push("Actorimpact: CEO verliest bypassruimte, CFO krijgt escalatiemandaat en behandelaren leveren lokale planningsautonomie in."),b||h.push("Normatief oordeel: dit is bestuurlijk onhoudbaar."),`${o}

${h.slice(0,3).join(`

`)}`.trim()}),r=t.search(/^###\s*\d+\./m);return[r>0?t.slice(0,r).trim():"",i.join(`

`).trim()].filter(Boolean).join(`

`).trim()}function sb(e){let t=String(e??"");return t=t.replace(/(?:Kernzin:\s*){2,}/gi,"Kernzin: ").replace(/Beslismoment GGZ:\s*Beslismoment GGZ:/gi,"Beslismoment GGZ:").replace(/\bterwijl\.\s*/gi,"terwijl ").replace(/\s+:\s+:/g,": ").replace(/;\./g,".").replace(/\.\s*\./g,".").replace(/:\s*(?=\n|$)/g,".").replace(/\n{3,}/g,`

`),t.trim()}function cb(e){return String(e??"").split(`
`).map(i=>i.trim()).map(i=>!i||!/^kernzin:/i.test(i)||bs.some(o=>i.toLowerCase().includes(o))?i:`${i.replace(/[.!?]*$/,"")}, waardoor besluitimpact expliciet wordt gemaakt.`).join(`
`).replace(/\n{3,}/g,`

`).trim()}function lb(e){let t=String(e??"");t=t.replace(/(Cash runway \(maanden\):|Minimale liquiditeitsbuffer:|Maandelijkse druk \(EUR\):|Status:)\s*[^\n]*/gi,(n,i)=>`${i} ${Vi}`);for(const n of hs)t=t.replace(n,Vi);return t=t.replace(/\s*—\s*berekening vereist vóór strategisch besluit\.?/gi,"").replace(/\bCash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan\.\s*\.?/gi,Vi).replace(/;\s*$/gm,".").replace(/terwijl\./gi,"terwijl").replace(/;\./g,".").replace(/\.\s*\./g,".").replace(/\n{3,}/g,`

`),t.trim()}function qt(e,t){return new RegExp(`\\b${t}\\b`,"i").test(e)?e:`${e}
${t} —
Actie: Vastleggen en uitvoeren van prioritaire stop/door-keuze.
Eigenaar: CEO + CFO
Deadline: binnen 14 dagen
KPI: 100% besluitlabels met eigenaar
Escalatiepad: >48 uur zonder besluit -> escalatie naar RvT
Casus-anker: 75% productiviteitsnorm en contractplafond €160.000`}function De(e,t,n){return new RegExp(`\\b${t}\\b\\s*:`,"i").test(e)?e:`${e}
${t}: ${n}`}function db(e){const t=String(e??"").trim(),n=Dn(t);if(!n.length){let r=t;return r=qt(r,"Maand 1"),r=qt(r,"Maand 2"),r=qt(r,"Maand 3"),r=De(r,"Actie","Consolideer kernaanbod en formaliseer stop-doing."),r=De(r,"Eigenaar","CEO + CFO"),r=De(r,"Deadline","Binnen 30 dagen"),r=De(r,"KPI","Minimaal 90% besluitdiscipline op prioriteiten."),r=De(r,"Escalatiepad","Automatische escalatie na 48 uur blokkade."),r=De(r,"Casus-anker","5% loonkosten, -7% tarief, 75% norm."),r.replace(/\n{3,}/g,`

`).trim()}return n.map(({heading:r,body:a})=>{if(vr(r)!==8)return`${r}

${a}`.trim();let o=String(a??"");return o=qt(o,"Maand 1"),o=qt(o,"Maand 2"),o=qt(o,"Maand 3"),o=De(o,"Actie","Consolideer kernaanbod en formaliseer stop-doing."),o=De(o,"Eigenaar","CEO + CFO"),o=De(o,"Deadline","Binnen 30 dagen"),o=De(o,"KPI","Minimaal 90% besluitdiscipline op prioriteiten."),o=De(o,"Escalatiepad","Automatische escalatie na 48 uur blokkade."),o=De(o,"Casus-anker","5% loonkosten, -7% tarief, 75% norm."),`${r}

${o.replace(/\n{3,}/g,`

`).trim()}`.trim()}).join(`

`).replace(/\n{3,}/g,`

`).trim()}function ub(e){return String(e??"").split(/\n\s*\n+/).map(n=>n.trim()).filter(Boolean).map(n=>{const r=n.split(`
`).map(s=>s.trim()).filter(Boolean).map(s=>{if(/^kernzin:/i.test(s)){const c=s.match(/^kernzin:\s*/i)?.[0]??"Kernzin: ",g=s.replace(/^kernzin:\s*/i,"").split(/\s+/).filter(Boolean).slice(0,25).join(" ");return`${c}${g}${/[.!?]$/.test(g)?"":"."}`}return/[.!?]$/.test(s)||/^(-|\*|•|\d+\.)\s+/.test(s)?s:`${s}.`});if(r.length<=10)return r.join(`
`);const a=r.slice(0,10).join(`
`),o=r.slice(10).join(" ");return`${a}
${o}`}).join(`

`).replace(/\n{3,}/g,`

`).trim()}function so(e){const t=a=>a.replace(/€\s*[0-9][0-9.,]*/g,o=>o.replace(/\s+/g,"").replace(/\./g,"§DOT§").replace(/,/g,"§COMMA§")),n=a=>a.replace(/§DOT§/g,".").replace(/§COMMA§/g,","),r=ai(String(e??"")).split(`
`).map(a=>{let o=a.trim();if(!o)return"";if(o=o.replace(/terwijl\./gi,"terwijl dit directe uitvoeringsdruk veroorzaakt."),o=o.replace(/;\s*$/g,"."),/^(#|\d+\.)\s/.test(o)||/^(-|\*|•)\s/.test(o)||/^(Dag|Week|Maand|Optie)\s+/i.test(o))return o;const s=t(o);return(s.match(/[^.!?]+[.!?]?/g)??[s]).map(u=>{const g=n(u.trim());if(!g)return"";if(g.split(/\s+/).filter(Boolean).length>=8)return g.replace(/;\s*$/g,".");const p=g.replace(/[;:]+$/g,"");return/[.!?]$/.test(p)?p:`${p}.`}).join(" ").replace(/\s+/g," ").trim()});return ai(r.filter(Boolean).join(`
`).replace(/\n{3,}/g,`

`).trim())}function co(e){const t=String(e??"").trim(),n=zn(t),i=n.length?[]:mi(t),r=n.length?n:i;if(!r.length)return t;const a=r.map(({heading:c,body:l})=>{let u=!1;const g=String(l??"").split(`
`).map(m=>m.trim()).filter(m=>/^Kernzin:/i.test(m)?u?!1:(u=!0,!0):!0).join(`
`).replace(/\n{3,}/g,`

`).trim();return`${c}

${g}`}),o=n.length?t.search(/^###\s*\d+\./m):t.search(/^\d+\.\s+/m);return[o>0?t.slice(0,o).trim():"",a.join(`

`).trim()].filter(Boolean).join(`

`).trim()}function St(e,t){const n=!!t?.fullDocument,i=String(t?.sectionTitle??"").toLowerCase(),r=i.includes("dominante these")||i.includes("dominantethese"),a=i.includes("90-dagen interventieontwerp")||i.includes("interventie")||i.includes("90 day"),o=i.includes("mandaat")||i.includes("besluit")||i.includes("governance");let s=ai(String(e??""));return s=s.replace(new RegExp(`\\b${Es}\\b`,"gi"),""),s=sb(s),s=lb(s),s=Yp(s),s=qp(s),s=Qp(s),s=ab(s),s=rb(s),n?(s=oo(s),s=ao(s),s=so(s),s=co(s)):(r&&(s=nb(s),s=ib(s)),o&&(s=ao(s),s=oo(s)),s=ob(s),s=cb(s),a&&(s=db(s)),s=ub(s),s=so(s)),s=co(s),n&&(s=Xp(s,1500)),s=ai(s),ps(s).sanitizedText}function gb(e){const t=String(e??"").split(`
`).map(i=>i.trim()).filter(i=>/^kernzin:/i.test(i)),n=new Set;for(const i of t){const r=Ke(i.replace(/^kernzin:/i,""));if(r){if(n.has(r))return!0;n.add(r)}}return!1}function mb(e){const t=Dn(e);return t.length?t.some(({body:n})=>{const i=n.split(`
`).map(a=>a.trim()).filter(a=>/^kernzin:/i.test(a)).map(a=>Ke(a.replace(/^kernzin:/i,""))).filter(Boolean),r=new Set;for(const a of i){if(r.has(a))return!0;r.add(a)}return!1}):!1}function pb(e){let t=0;for(const n of Wp)n.re.test(e)&&(t+=1);return t}function vs(e){const t=String(e??"").split(new RegExp("(?<=[.!?])\\s+|\\n+")).map(i=>i.trim()).filter(Boolean);if(!t.length)return!0;for(const i of t)if(/(en|maar|of|waardoor|terwijl|omdat|plus|zonder)$/i.test(i)||/€\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(i)&&!/[.!?]["')\]]?$/.test(i))return!0;const n=t[t.length-1]??"";return!/[.!?]["')\]]?$/.test(n)}function bb(e){const t=new Set;for(const n of e){const i=String(n??"").replace(/\s+/g," ").trim().toLowerCase();if(i){if(t.has(i))return!0;t.add(i)}}return!1}function hb(e){const t=Dn(e);if(!t.length)return!1;for(const{body:n}of t){const i=String(n??"").split(/\n\s*\n+/).map(s=>s.trim()).filter(Boolean);if(i.length<2||i.length%2!==0)continue;const r=i.length/2,a=i.slice(0,r).map(s=>Ke(s)).join("|"),o=i.slice(r).map(s=>Ke(s)).join("|");if(a&&o&&a===o)return!0}return!1}function Eb(e){const t=Dn(e);if(t.length!==9)return!1;const n=t.map(i=>vr(i.heading)).filter(i=>i!=null).sort((i,r)=>i-r);if(n.length!==9)return!1;for(let i=1;i<=9;i+=1)if(n[i-1]!==i)return!1;return!0}function TE(e,t){const n=String(e??""),i=Array.isArray(t)?t:Dn(n).map(u=>`${u.heading}
${u.body}`.trim()),r=bb(i),a=hb(n),o=vs(n),s=mb(n),l=!!(Array.isArray(t)?void 0:t)&&!Eb(n);if(r)throw new Error("Board-output v1.3: dubbele volledige sectie gedetecteerd.");if(a)throw new Error("Board-output v1.3: semantische sectieherhaling gedetecteerd.");if(s)throw new Error("Board-output v1.3: identieke kernzin binnen sectie.");if(o)throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");if(l)throw new Error("Documentstructuur onvolledig of niet vergrendeld (Slot-Lock v4).");return!0}function NE(e){if(vs(e))throw new Error("Board-output bevat een afgeknotte zin.")}function fb(e){const t=String(e??""),i=t.split(`
`).map(s=>s.trim()).filter(Boolean).filter(s=>/^kernzin:/i.test(s)),r=i.filter(s=>bs.some(c=>s.toLowerCase().includes(c))).length,a=hs.reduce((s,c)=>{const l=t.match(c);return s+(l?.length??0)},0),o=t.match(/€\s?\d+[.,]?\d*/g)?.length??0;return{causalCoveragePct:i.length===0?100:Math.round(r/i.length*100),placeholderHits:a,anchorCount:pb(t),euroMentions:o,duplicateKernzin:gb(t)}}function et(e){return String(e||"").replace(/\s+/g," ").trim()}function oi(e){return et(e).split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean)}function kb(e){return/\b(best|base|worst|scenario|scenario's|scenarioanalyse)\b/i.test(e)}function vb(e){const t=e.toLowerCase();return/\b(implicatie|dus|daarom|consequentie|volgt)\b/.test(t)?"BESLUITIMPLICATIE":/\b(ik denk|waarschijnlijk|kan|mogelijk|risico)\b/.test(t)?(/\brisico\b/.test(t)&&!kb(t),"HYPOTHESE"):/\b(conflict|patroon|duidt|betekent|trekt|wringt)\b/.test(t)?"INTERPRETATIE":"FEIT"}function Sb(e){const t=e.match(/"[^"]+"|€\s?\d+[.,]?\d*|\d+%|\d+\s*(dagen|maanden|jaar)/gi)||[];return Array.from(new Set(t.map(n=>et(n)))).slice(0,5)}function Ib(e){return oi(e).slice(0,8).map(t=>({label:vb(t),text:t}))}function ct(e,t){const n=et(t);return{title:e,summary:n,claims:Ib(n),source_anchors:Sb(n)}}function Tb(e){const t=[e.dominante_these.summary,e.structurele_kernspanning.summary,e.onvermijdelijke_keuzes.summary,e.prijs_van_uitstel.summary].join(" "),n=t.match(/\bkostprijs[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,40}\bper cliënt\b/i),i=t.match(/\badhd[-\s]?diagnostiek[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,80}\badhd/i),r=t.match(/\bplafond[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,80}\bper verzekeraar\b/i),a=t.match(/\bloonkosten[^.\n]{0,80}?(\d+[,.]?\d*)\s*%|\b(\d+[,.]?\d*)\s*%\s*loonkosten/i),o=t.match(/\btarieven?\s*2026[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(verlaagd|gedaald)|\b(\d+[,.]?\d*)\s*%\s*tariefdaling/i),s=`Gemiddelde kostprijs: €${n?.[1]??n?.[2]??"1800"} per cliënt.`,c=`ADHD-diagnostiek: €${i?.[1]??i?.[2]??"90"} verliescomponent per cliënt.`,l=`Plafond per verzekeraar: €${r?.[1]??r?.[2]??"160.000"} per jaar.`,u=`Loonkosten stijgen met ${a?.[1]??a?.[2]??"5"}% per jaar.`,g=`Tariefwijziging 2026: -${o?.[1]??o?.[3]??"7"}%.`;return{average_cost_per_client:s,adhd_loss_component:c,insurer_cap_per_year:l,wage_cost_growth:u,tariff_change_2026:g,structural_pressure_example:"Rekenvoorbeeld: +5% loonkosten op €1,8M = +€90.000 en -7% tarief op €1,6M omzet = -€112.000; totale structurele druk = €202.000. Vertaling: circa 112 cliënten per jaar, circa 1,3 FTE behandelcapaciteit en circa €16.833 druk per maand.",cash_runway:"Cash-runway wordt binnen 14 dagen door CFO vastgesteld met bandbreedte en minimale liquiditeitsbuffer in de maandelijkse treasury-review.",margin_bandwidth_core_products:"Margebandbreedte per productlijn wordt binnen 14 dagen vastgesteld en wekelijks geactualiseerd in Vision Planner.",tariff_drop_impact_12m:"Effect 7% tariefdaling: circa €112.000 jaarlijkse druk op €1,6M omzet; compensatie via contractmix en capaciteitssturing wordt binnen 30 dagen besloten.",contract_cap_volume_impact:"Contractplafonds van circa €160.000 per verzekeraar begrenzen volume; capaciteit wordt prioritair toegewezen aan kernproducten met positieve marge.",status:"OK"}}function Nb(e,t){const n=oi(e)[0];return n||t}function Sr(e,t){const n=et(e).split(/\s+/).filter(Boolean);return n.length<=t?n.join(" "):n.slice(0,t).join(" ")}function Rb(e){return et(e).replace(/\bBronbasis:[\s\S]*$/i,"").replace(/\bBronankers:[\s\S]*$/i,"").replace(/\bBestuurlijke implicatie:[\s\S]*$/i,"").replace(/\b(?:GGZ\/Jeugdzorg|Kernconflict GGZ|Keerzijde van de keuze GGZ|Prijs van uitstel GGZ\/Jeugdzorg|Governance-impact GGZ|Machtsdynamiek GGZ|Executierisico GGZ|Besluitkader)\s*:\s*/gi,"").replace(/\bBovenstroom:\s*/gi,"").replace(/\bOnderstroom(?:\s*\((?:Interpretatie|Hypothese)\))?:\s*/gi,"").trim()}function qn(e,t,n=24){const i=Rb(e),r=oi(i).find(a=>{const o=et(a).split(/\s+/).filter(Boolean).length;return o>=6&&o<=36&&!/\b(bron|implicatie)\b/i.test(a)})??oi(i)[0]??t;return Sr(et(r),n)}function Ab(e){const t=new Set;return e.map(({description:n,fallback:i})=>{const r=et(n).toLowerCase();if(!r||t.has(r)){const a=Sr(et(i),24);return t.add(a.toLowerCase()),a}return t.add(r),n})}function Ob(e){const t=et(e),n=/\bdeborah\b/i.test(t)?"Deborah":"CEO",i=/\bjan\b/i.test(t)?"Jan":"CFO",r=/\bbarbara\b/i.test(t)?"Barbara":"COO";return{lead:n,strategy:i,operations:r}}function Cb(e){const t=n=>St(n,{fullDocument:!1});return{dominante_these:ct("1. Dominante These",t(e.dominante_these)),structurele_kernspanning:ct("2. Structurele Kernspanning",t(e.structurele_kernspanning)),onvermijdelijke_keuzes:ct("3. Keerzijde van de keuze",t(e.onvermijdelijke_keuzes)),prijs_van_uitstel:ct("4. De Prijs van Uitstel",t(e.prijs_van_uitstel)),mandaat_besluitrecht:ct("5. Mandaat & Besluitrecht",t(e.mandaat_besluitrecht)),onderstroom_informele_macht:ct("6. Onderstroom & Informele Macht",t(e.onderstroom_informele_macht)),faalmechanisme:ct("7. Faalmechanisme",t(e.faalmechanisme)),interventieplan_90_dagen:ct("8. 90-Dagen Interventieontwerp",t(e.interventieplan_90_dagen)),decision_contract:ct("9. Besluitkader",t(e.decision_contract))}}function wb(e){const t=e.dominante_these.summary,n=e.onvermijdelijke_keuzes.summary,i=e.decision_contract.summary,r=[e.dominante_these.summary,e.structurele_kernspanning.summary,e.onvermijdelijke_keuzes.summary,e.prijs_van_uitstel.summary,e.mandaat_besluitrecht.summary,e.onderstroom_informele_macht.summary].join(" "),a=Ob(r),o=qn(t,"Consolideer eerst de kernactiviteiten en herstel financiële voorspelbaarheid."),s=qn(n,"Stuur op hybride uitvoering met begrensde verbreding binnen harde meetpunten."),c=qn(e.structurele_kernspanning.summary,"Versnel verbreding ondanks beperkte contractzekerheid en capaciteit."),[l,u,g]=Ab([{description:o,fallback:"Consolideer 12 maanden de GGZ-kern en herstel margecontrole vóór uitbreiding."},{description:s,fallback:"Hanteer hybride sturing met verbreding onder harde 30/60/90-gates en capaciteitsplafond."},{description:c,fallback:"Versnel verbreding direct en accepteer hogere kans op liquiditeitsdruk en executieverlies."}]),m=Nb(i,"Pauzeer minimaal één niet-kerninitiatief tot margesturing aantoonbaar stabiel is."),p={de_keuze_vandaag:Sr(qn(t,"Kies vandaag expliciet voor kernconsolidatie vóór verbreding.",22),22),drie_opties:[{name:"Optie A",description:l,risk:"Tijdelijke groeivertraging en druk op verwachtingen."},{name:"Optie B",description:u,risk:"Complexe governance; risico op dubbel sturen blijft bestaan."},{name:"Optie C",description:g,risk:"Hoger cash- en executierisico bij onvoldoende margedata."}],voorkeursoptie:"Optie A: consolideren, daarna gecontroleerd verbreden.",expliciet_verlies:["Wat lever je in: tijdelijke groeisnelheid buiten de kern.","Wat vertraag je: uitbreiding van HR-loket en vierde pijler.","Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.","Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.",`Actorimpact: ${a.lead} borgt besluitdiscipline; ${a.strategy} borgt contract- en margebesluit; ${a.operations} verliest lokale bypassruimte.`,m].join(" "),stop_doing:["Stop nieuwe initiatieven zonder margevalidatie.","Stop lokale capaciteitsbesluiten buiten centrale prioritering.","Stop besluituitstel zonder gedocumenteerde escalatie."],gates:[{day:30,criteria:["Besluitmemo met keuze, eigenaar en deadline is getekend.","Stop-doing lijst actief in weekritme.","Financieel bewijsblok heeft geen ontbrekende kernvelden."],consequence_if_failed:"Nieuwe initiatieven worden automatisch bevroren tot formeel herstelbesluit."},{day:60,criteria:["Marge- en capaciteitsoverzicht wordt wekelijks ververst.","Escalaties worden binnen 48 uur gesloten.","Contractprioriteiten zijn geformaliseerd per verzekeraar."],consequence_if_failed:"Mandaat verschuift tijdelijk naar centrale besluittafel onder CFO/CEO."},{day:90,criteria:["Minimaal 85% van de acties is gesloten of hergecontracteerd.","Voorkeursoptie is aantoonbaar in operatie verankerd.","RvT heeft het onomkeerbaar moment formeel beoordeeld."],consequence_if_failed:"Verbreding blijft gepauzeerd; herbesluit verplicht met RvT-goedkeuring."}],mandaatverschuiving:`Bij gemist meetpunt vervallen lokale portfolio- en capaciteitsbesluiten; ${a.lead}/${a.strategy} beslissen bindend via centrale prioriteringstafel binnen 48 uur.`,handtekeningdiscipline:{wie_tekent:["CEO","CFO","Bestuurssecretaris"],overtreding_consequentie:"Bij overtreding volgt automatische escalatie naar RvT met herstelplan binnen 5 werkdagen."},financieel_bewijsblok:Tb(e)};return jb(p),p}function jb(e){if(!e.voorkeursoptie.trim())throw new Error("Decision Layer FAIL: geen voorkeursoptie.");if(!e.expliciet_verlies.trim())throw new Error("Decision Layer FAIL: geen expliciet verlies.");if(!Array.isArray(e.stop_doing)||e.stop_doing.length!==3)throw new Error("Decision Layer FAIL: stop_doing moet exact 3 punten bevatten.");if(!Array.isArray(e.gates)||e.gates.length<3)throw new Error("Decision Layer FAIL: minimaal 3 gates vereist.");for(const t of e.gates)if(!t.consequence_if_failed?.trim())throw new Error(`Decision Layer FAIL: gate ${t.day} mist consequence_if_failed.`)}function xb(e){const t=Cb(e),n=wb(t);return{intelligence_layer:t,decision_layer:n}}const yb=["dominanteThese","kernspanning","keerzijde","prijsUitstel","mandaat","onderstroom","faalmechanisme","interventie","besluitkader"];function $b(e){return String(e??"").replace(/\r\n/g,`
`).replace(/[ \t]+/g," ").replace(/\n{3,}/g,`

`).trim()}function Cn(e){function t(u,g){return u>>>g|u<<32-g}const n=Math.pow,i=n(2,32);let r="";const a=[],o=e.length*8;let s=Cn._hash,c=Cn._k,l=c?c.length:0;if(!s||!c){s=[],c=[];const u={};for(let g=2;l<64;g+=1)if(!u[g]){for(let m=0;m<313;m+=g)u[m]=!0;s[l]=n(g,.5)*i|0,c[l++]=n(g,1/3)*i|0}Cn._hash=s,Cn._k=c}for(e+="";e.length%64-56;)e+="\0";for(let u=0;u<e.length;u+=1){const g=e.charCodeAt(u);a[u>>2]|=g<<(3-u)%4*8}a[a.length]=o/i|0,a[a.length]=o;for(let u=0;u<a.length;){const g=a.slice(u,u+=16),m=s.slice(0);for(let p=0;p<64;p+=1){const I=g[p-15],T=g[p-2],b=s[0],h=s[4],d=s[7]+(t(h,6)^t(h,11)^t(h,25))+(h&s[5]^~h&s[6])+c[p]+(g[p]=p<16?g[p]:g[p-16]+(t(I,7)^t(I,18)^I>>>3)+g[p-7]+(t(T,17)^t(T,19)^T>>>10)|0),x=(t(b,2)^t(b,13)^t(b,22))+(b&s[1]^b&s[2]^s[1]&s[2]);s=[d+x|0].concat(s),s[4]=s[4]+d|0,s.pop()}for(let p=0;p<8;p+=1)s[p]=s[p]+m[p]|0}for(let u=0;u<8;u+=1)for(let g=3;g+1;g-=1){const m=s[u]>>g*8&255;r+=(m<16?"0":"")+m.toString(16)}return r}class si{static latestState={frozen:!1,complete:!1};slots;frozen=!1;hashIndex=new Set;constructor(){this.slots={dominanteThese:{content:null,locked:!1,hash:null},kernspanning:{content:null,locked:!1,hash:null},keerzijde:{content:null,locked:!1,hash:null},prijsUitstel:{content:null,locked:!1,hash:null},mandaat:{content:null,locked:!1,hash:null},onderstroom:{content:null,locked:!1,hash:null},faalmechanisme:{content:null,locked:!1,hash:null},interventie:{content:null,locked:!1,hash:null},besluitkader:{content:null,locked:!1,hash:null}},this.syncGlobalState()}static getLatestState(){return{...si.latestState}}isFrozen(){return this.frozen}isComplete(){return yb.every(t=>!!this.slots[t].content)}writeSlot(t,n,i){if(this.frozen)throw new Error("Kernel v4: schrijven geblokkeerd na freeze().");const r=this.slots[t],a=!!i?.override;if(r.locked&&!a)throw new Error(`Kernel v4: slot ${t} is vergrendeld.`);if(r.content!==null&&!a)throw new Error(`Kernel v4: slot ${t} bevat al inhoud.`);const o=$b(n);if(!o)throw new Error(`Kernel v4: lege inhoud niet toegestaan voor slot ${t}.`);const s=Cn(o);if(r.hash&&this.hashIndex.has(r.hash)&&this.hashIndex.delete(r.hash),this.hashIndex.has(s))throw new Error("Identieke sectie-inhoud gedetecteerd in meerdere slots.");this.hashIndex.add(s),r.content=o,r.hash=s,r.locked=!0,this.syncGlobalState()}overrideSlot(t,n){this.writeSlot(t,n,{override:!0}),console.info("[slot_kernel_v4_override]",{slotId:t,hash:this.slots[t].hash})}assembleDocument(){if(!this.isComplete())throw new Error("Kernel v4: onvolledig document, niet alle 9 slots gevuld.");return[`1. Dominante These
${this.slots.dominanteThese.content??""}`,`2. Structurele Kernspanning
${this.slots.kernspanning.content??""}`,`3. Keerzijde van de keuze
${this.slots.keerzijde.content??""}`,`4. De Prijs van Uitstel
${this.slots.prijsUitstel.content??""}`,`5. Mandaat & Besluitrecht
${this.slots.mandaat.content??""}`,`6. Onderstroom & Informele Macht
${this.slots.onderstroom.content??""}`,`7. Faalmechanisme
${this.slots.faalmechanisme.content??""}`,`8. 90-Dagen Interventieontwerp
${this.slots.interventie.content??""}`,`9. Besluitkader
${this.slots.besluitkader.content??""}`].join(`

`).trim()}freeze(){this.frozen=!0,this.syncGlobalState()}syncGlobalState(){si.latestState={frozen:this.frozen,complete:this.isComplete()}}}var _b={};const rr="Dominante These|Structurele Kernspanning|Keerzijde van de keuze|De Prijs van Uitstel|Mandaat & Besluitrecht|Onderstroom & Informele Macht|Faalmechanisme|90-Dagen Interventieontwerp|Besluitkader";function Ss(e){return String(e??"").replace(new RegExp(`\\s+(?=(?:###\\s*)?[1-9]\\.\\s+(?:${rr})\\b)`,"g"),`
`).replace(/\n{3,}/g,`

`).trim()}function vt(e){return String(e??"").toLowerCase().replace(/[^\p{L}\p{N}\s€%]/gu," ").replace(/\s+/g," ").trim()}function Is(e){return new Set(vt(e).split(" ").map(t=>t.trim()).filter(t=>t.length>2))}function Ts(e,t){if(!e.size||!t.size)return 0;let n=0;for(const r of e)t.has(r)&&(n+=1);const i=e.size+t.size-n;return i>0?n/i:0}function Ln(e){const t=Ss(String(e??"").trim());if(!t)return[];const n=/^(?:###\s*)?[1-9]\.\s+[^\n]+$/gm,i=[...t.matchAll(n)];return i.length?i.map((r,a)=>{const o=String(r[0]??"").trim(),s=(r.index??0)+o.length,c=i[a+1]?.index??t.length,l=t.slice(s,c).trim();return{heading:o,body:l}}):[]}function zb(e){const t=String(e??"").split(new RegExp("(?<=[.!?])\\s+|\\n+")).map(i=>i.trim()).filter(Boolean);if(!t.length)return!0;for(const i of t)if(/(en|maar|of|waardoor|terwijl|omdat|plus|zonder)$/i.test(i)||/€\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(i)&&!/[.!?]["')\]]?$/.test(i))return!0;const n=t[t.length-1]??"";return!/[.!?]["')\]]?$/.test(n)}function Db(e){const t=Ln(e);let n=0;for(const i of t){const r=i.body.split(`
`).map(a=>a.trim()).filter(a=>/^kernzin:/i.test(a));r.length>1&&(n+=r.length-1)}return n}function Lb(e){const t=Ln(e);let n=0;for(const i of t){const r=i.body.split(`
`).map(o=>o.trim()).filter(Boolean);let a=!1;for(const o of r)/^status:/i.test(o)&&(a&&(n+=1),a=!0)}return n}function Bb(e){let t=0;for(const n of e){const i=String(n.body??"").split(/\n\s*\n+/).map(a=>a.trim()).filter(Boolean),r=[];for(const a of i){if(!vt(a))continue;const s=Is(a);r.some(l=>Ts(l,s)>=.96)?t+=1:r.push(s)}}return t}function Gb(e){return/€\s*\d{1,3}\.\s+\d{3}\b/.test(String(e??""))}function Mb(e){return/veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk(?!\s+per maand)/i.test(String(e??""))}function Pb(e){return String(e??"").replace(/\s+(Bovenstroom:)/gi,`

$1`).replace(/\s+(Onderstroom:)/gi,`

$1`).replace(new RegExp("\\s+-\\s+(?=\\p{L})","gu"),`
- `).replace(/\s+(Maand\s+[123]\s+—)/gi,`

$1`).replace(/\s+(Week\s+\d+:)/gi,`
$1`).replace(/Interventieplan 90 dagen \(6 kerninterventies\.\s*causaal en afdwingbaar\)/gi,"Interventieplan 90 dagen (6 kerninterventies, causaal en afdwingbaar)").replace(/Verankering\.\s*strategiebesluit/gi,"Verankering, strategiebesluit").replace(/KPI\.\s*tijdshorizon/gi,"KPI, tijdshorizon").replace(/\n{2,}(Bestuurlijke implicatie:)/gi,`
$1`).replace(/\n{2,}(Kernzin:)/gi,`
$1`).replace(/\n{3,}/g,`

`).trim()}function Ub(e){const t=new Set;for(const n of e){const i=vt(`${n.heading}
${n.body}`);if(i){if(t.has(i))return!0;t.add(i)}}return!1}function Hb(e){for(const t of e){const n=String(t.body??"").split(/\n\s*\n+/).map(o=>o.trim()).filter(Boolean);if(n.length<2||n.length%2!==0)continue;const i=n.length/2,r=n.slice(0,i).map(o=>vt(o)).join("|"),a=n.slice(i).map(o=>vt(o)).join("|");if(r&&a&&r===a)return!0}return!1}function Ne(e,t){let n=Ss(String(e??"")).replace(/\r\n/g,`
`).replace(/[ \t]+/g," ").replace(/\.\s+(maar|waardoor|terwijl)\b/gi,", $1").replace(/\n{3,}/g,`

`).trim();const i=new RegExp(`\\n(?:###\\s*)?[1-9]\\.\\s+(?:${rr})\\b[\\s\\S]*$`,"i");n=n.replace(i,"").trim();const r=n.split(`
`).map(h=>h.trim()).filter(Boolean);if(r.length>=6&&r.length%2===0){const h=r.length/2,d=r.slice(0,h).map(N=>vt(N)).join("|"),x=r.slice(h).map(N=>vt(N)).join("|");d&&d===x&&(n=r.slice(0,h).join(`
`))}const a=String(t??"").toLowerCase();if(a==="besluitkader"||a.includes("besluitkader")){const h=n.toLowerCase().indexOf(`
90-dagen executieplan`);h>=0&&(n=n.slice(0,h).trim())}const o=n.split(/\n\s*\n+/).map(h=>h.trim()).filter(Boolean),s=[],c=new Set;for(const h of o){const d=vt(h);!d||c.has(d)||(c.add(d),s.push(h))}n=s.join(`

`);const l=[],u=[];for(const h of n.split(/\n\s*\n+/).map(d=>d.trim()).filter(Boolean)){const d=Is(h);u.some(N=>Ts(N,d)>=.96)||(u.push(d),l.push(h))}n=l.join(`

`);const g=n.split(`
`);let m=!1,p=!1;const I=[];for(const h of g){const d=h.trim();if(/^kernzin:/i.test(d)){if(m)continue;m=!0}if(/^status:/i.test(d)){if(p)continue;p=!0}I.push(h)}n=I.join(`
`).replace(/\n{3,}/g,`

`).trim();let T=!1;n=n.replace(/Status:\s*[^\n]+/gi,h=>T?"":(T=!0,h)).replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).trim();let b=!1;return n=n.split(`
`).map(h=>/^status:/i.test(h.trim())?b?"":(b=!0,h):h).filter(Boolean).join(`
`).replace(/\n{3,}/g,`

`).trim(),n=n.replace(/\b(veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk)(?!\s+per maand)\b/gi,"$1 per maand"),n=n.replace(/\.\s+(maar|waardoor|terwijl)\b/gi,", $1").replace(/\s+\./g,".").replace(/\.\./g,"."),(a==="besluitkader"||a.includes("besluitkader"))&&(n=n.replace(/\b90-dagen executieplan\b[\s\S]*$/i,"").replace(/\bBesluitdocument Raad van Bestuur\b[\s\S]*$/i,"").replace(/\s+(Mandaatverschuiving:|Expliciet verlies:|Verbod:|Onomkeerbaar moment:|1-PAGINA BESTUURLIJKE SAMENVATTING|Besluit vandaag:|Voorkeursoptie:|Waarom onvermijdelijk:|30\/60\/90 meetpunten:|Bestuurlijke implicatie:|Contractprincipe:)/gi,`

$1`).trim()),(a==="interventie"||a.includes("interventie"))&&(n=n.replace(new RegExp(`\\n(?:###\\s*)?[1-9]\\.\\s+(?:${rr})\\b[\\s\\S]*$`,"i"),"").replace(/\s+(Eigenaar:|Deadline:|KPI:|Escalatiepad:|Casus-anker:|Actie:)/gi,`
$1`).replace(/\s+(Maand\s+[123]\s+—)/gi,`

$1`).trim()),n=Pb(n),n&&!/[.!?]["')\]]?$/.test(n)&&(n=`${n}.`),n}function ft(e){const t=String(e??"").replace(/\r\n/g,`
`).trim();if(!t)return"";const n=Ln(t);return n.length?n.map(r=>{const a=(()=>{const s=r.heading.toLowerCase();if(s.includes("1."))return"dominanteThese";if(s.includes("2."))return"kernspanning";if(s.includes("3."))return"keerzijde";if(s.includes("4."))return"prijsUitstel";if(s.includes("5."))return"mandaat";if(s.includes("6."))return"onderstroom";if(s.includes("7."))return"faalmechanisme";if(s.includes("8."))return"interventie";if(s.includes("9."))return"besluitkader"})(),o=Ne(r.body,a);return`${r.heading}

${o}`}).join(`

`).replace(/\n{3,}/g,`

`).trim():Ne(t)}function Fi(e){return{...e,dominantThesis:Ne(String(e.dominantThesis??""),"dominanteThese"),coreConflict:Ne(String(e.coreConflict??""),"kernspanning"),tradeoffs:Ne(String(e.tradeoffs??""),"keerzijde"),opportunityCost:Ne(String(e.opportunityCost??""),"prijsUitstel"),governanceImpact:Ne(String(e.governanceImpact??""),"mandaat"),powerDynamics:Ne(String(e.powerDynamics??""),"onderstroom"),executionRisk:Ne(String(e.executionRisk??""),"faalmechanisme"),interventionPlan90D:Ne(String(e.interventionPlan90D??""),"interventie"),decisionContract:Ne(String(e.decisionContract??""),"besluitkader")}}function Kb(e){const t=String(e??""),n=Ln(t),i=zb(t);return{headingMatches:n.length,duplicateSections:Ub(n)?1:0,duplicateParagraphBlocks:Bb(n),duplicateKernzin:Db(t),splitEuro:Gb(t),sentenceIntegrity:!i,statusLineDuplicates:Lb(t)}}function rn(e){const t=Kb(e);typeof process<"u"&&_b?.BOARD_DEBUG_LOGS==="1"&&console.info("[board_output_integrity_metrics]",t);const n=Ln(String(e??""));if(t.duplicateSections>0)throw new Error("Board-output v1.3: dubbele volledige sectie gedetecteerd.");if(t.duplicateParagraphBlocks>0)throw new Error("Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section).");if(Hb(n))throw new Error("Board-output v1.3: semantische sectieherhaling gedetecteerd.");if(t.duplicateKernzin>0)throw new Error("Board-output v1.3: identieke kernzin binnen sectie.");if(t.statusLineDuplicates>0)throw new Error("Board-output v1.3: dubbele statusregel binnen sectie.");if(t.splitEuro||Mb(e))throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");if(!t.sentenceIntegrity)throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");return t}const Vb=[{id:"dominante_these",patterns:[/\bDOMINANTE STRATEGISCHE THESE\b/i,/\bDominante These\b/i]},{id:"kernconflict",patterns:[/\bKERNCONFLICT\b/i,/\bKERNCONFLICT \(A\/B KEUZE\)\b/i,/\bStructurele Kernspanning\b/i]},{id:"machtsstructuur",patterns:[/\bMACHTSSTRUCTUUR\b/i,/\bOnderstroom\b/i,/\bMandaat\b/i]},{id:"case_structure",patterns:[/\bCASE STRUCTURE\b/i]},{id:"interventies",patterns:[/\bBOARD INTERVENTIES\b/i,/\b90-Dagen Interventie/i,/\bInterventieplan\b/i]},{id:"risico_niet_handelen",patterns:[/\bRISICO VAN NIET HANDELEN\b/i,/\bPrijs van Uitstel\b/i,/\bOpportunity Cost\b/i]},{id:"open_questions",patterns:[/\bOPEN QUESTIONS\b/i,/\bOpen vragen\b/i]}];function Fb(e){return String(e??"").replace(/\r\n/g,`
`)}function Wb(e,t){return t.some(n=>n.test(e))}function lo(e,t){const n=e.split(`
`),i=n.findIndex(a=>t.test(a));if(i<0)return"";let r=n.length;for(let a=i+1;a<n.length;a+=1)if(/^\s*###\s+/.test(n[a])||/^\s*\d+\.\s+/.test(n[a])){r=a;break}return n.slice(i+1,r).join(`
`).trim()}function Jb(e){let t=0;`${e.errors.join(" ")}${e.warnings.join(" ")}`;const n=e.errors.filter(i=>i.startsWith("missing_section:")).length;return t+=Math.max(0,25-n*5),e.errors.includes("missing_conflict_choice")||(t+=20),e.errors.includes("missing_mechanistic_chains")?e.warnings.includes("low_mechanistic_density")||(t+=10):t+=20,e.errors.includes("forbidden_operational_intervention")||(t+=20),e.errors.includes("missing_decision_enforcement")||(t+=15),Math.max(0,Math.min(100,t))}function Zb(e,t){const n=Fb(e),i=[],r=[],a=Number.isFinite(t?.minScore)?Number(t?.minScore):85;for(const T of Vb)Wb(n,T.patterns)||i.push(`missing_section:${T.id}`);const o=/\bA:\s*.+/i.test(n)&&/\bB:\s*.+/i.test(n)&&/\b(BESLUIT|kies)\b/i.test(n),s=/\bversus\b/i.test(n)&&/\bkernconflict|kernspanning\b/i.test(n);!o&&!s&&i.push("missing_conflict_choice");const c=lo(n,/^\s*###\s*CASE STRUCTURE\b/i);if(c){const T=(c.match(/^\s*[-*]\s+/gm)??[]).length;(T<3||T>5)&&r.push("case_structure_topic_count_outside_3_5")}const l=(n.match(/->/g)??[]).length,u=(n.match(/\b(waardoor|leidt tot|daardoor|resulteert in|omdat)\b/gi)??[]).length;if(l+u<5&&(i.push("missing_mechanistic_chains"),r.push("low_mechanistic_density")),/\b(training|workshop|meeting|procesverbetering)\b/i.test(lo(n,/^\s*###\s*(BOARD INTERVENTIES|90-Dagen Interventieplan)\b/i)||n)&&i.push("forbidden_operational_intervention"),/\b(owner|eigenaar)\b/i.test(n)&&/\b(deadline|dag\s*30|binnen\s*\d+\s*dagen?)\b/i.test(n)&&/\b(kpi|meetbaar)\b/i.test(n)&&/\b(stopregel|escalatie)\b/i.test(n)||i.push("missing_decision_enforcement"),/\bmolendrift\b/i.test(n)){const T=[/\b5\s*FTE\b/i,/\b70\/30\b/i,/\b8%\b/i,/\blicentie|netwerkmarge|netwerkopdrachten\b/i];for(const b of T)b.test(n)||i.push("missing_molendrift_anchor")}const I=Jb({errors:i,warnings:r});return I<a&&i.push(`score_below_threshold:${I}<${a}`),{pass:i.length===0,score:I,minScore:a,errors:i,warnings:r}}var Yb={};const qb={"Context Layer":["context_state"],"Diagnosis Layer":["diagnosis"],"Contradiction Engine":["contradiction"],"Mechanism Engine":["mechanisms"],"Strategic Insight Engine":["strategic_insights"],"Strategic Pattern Engine":["historical_patterns"],"Strategic Leverage Engine":["leverage_points"],"Decision Engine":["decision"],"Strategic Simulation Engine":["simulation_results"],"Strategic OS Layer":["strategic_os"],"Narrative Layer":["board_report"]},Qb="/logs/cyntra_stability.log",uo="VITE_CYNTRA_STABILITY_DEBUG";function Ns(){return new Date().toISOString()}function Xb(e){return e instanceof Error?e.message:String(e)}function eh(){return!!globalThis.process?.versions?.node&&typeof window>"u"}function th(){const e=Yb,t=globalThis.import_meta_env,n=e?.[uo]??t?.[uo];return n==="1"||n==="true"||n===!0}function ci(){return th()}function nh(e){const t=`${e.timestamp} [${e.guard}] [${e.layer??"n/a"}] ${e.message}`;ci()&&console.warn(t),eh()&&(async()=>{try{const n="node:fs/promises",i="node:path",r=await import(n),a=await import(i),o=globalThis.process,s=o?.cwd?o.cwd():".",c=a.join(s,"logs","cyntra_stability.log");await r.mkdir(a.dirname(c),{recursive:!0}),await r.appendFile(c,`${t}
`,"utf8")}catch(n){const i=`${Ns()} [StabilityLogger] [n/a] Log write skipped: ${Xb(n)}`;ci()&&console.warn(i)}})()}function RE(){return Qb}function AE(e,t){const n=qb[e]??[],i=[];for(const r of n)if(!(r in t)){const a={guard:"OutputContractGuard",layer:e,message:`Contract mismatch: expected key '${r}' ontbreekt in output.`,timestamp:Ns()};i.push(a),nh(a)}return{value:t,warnings:i}}const ih=[{heading:/^\s*1\.\s+Dominante These\b/i,slot:"dominanteThese"},{heading:/^\s*1\.\s+Dominante Bestuurlijke These\b/i,slot:"dominanteThese"},{heading:/^\s*2\.\s+Structurele Kernspanning\b/i,slot:"kernspanning"},{heading:/^\s*2\.\s+Kernconflict\b/i,slot:"kernspanning"},{heading:/^\s*3\.\s+Keerzijde van de keuze\b/i,slot:"keerzijde"},{heading:/^\s*3\.\s+Expliciete Trade-offs\b/i,slot:"keerzijde"},{heading:/^\s*4\.\s+De Prijs van Uitstel\b/i,slot:"prijsUitstel"},{heading:/^\s*4\.\s+Opportunity Cost\b/i,slot:"prijsUitstel"},{heading:/^\s*5\.\s+Mandaat & Besluitrecht\b/i,slot:"mandaat"},{heading:/^\s*5\.\s+Governance Impact\b/i,slot:"mandaat"},{heading:/^\s*6\.\s+Onderstroom & Informele Macht\b/i,slot:"onderstroom"},{heading:/^\s*6\.\s+Machtsdynamiek & Onderstroom\b/i,slot:"onderstroom"},{heading:/^\s*7\.\s+Faalmechanisme\b/i,slot:"faalmechanisme"},{heading:/^\s*7\.\s+Executierisico\b/i,slot:"faalmechanisme"},{heading:/^\s*8\.\s+90-Dagen Interventieontwerp\b/i,slot:"interventie"},{heading:/^\s*8\.\s+90-Dagen Interventieplan\b/i,slot:"interventie"},{heading:/^\s*9\.\s+Besluitkader\b/i,slot:"besluitkader"},{heading:/^\s*9\.\s+Decision Contract\b/i,slot:"besluitkader"}],rh={dominanteThese:"Kernzin: Structurele druk ondermijnt binnen 12 maanden de kerncapaciteit en vereist directe consolidatiekeuze.",kernspanning:"Kernzin: Parallel sturen op consolidatie en verbreding vergroot het liquiditeitsrisico zolang kostprijsinzicht ontbreekt.",keerzijde:"Kernzin: Consolidatie levert grip op marge en contractering op, maar vraagt tijdelijk verlies van groeitempo buiten de kern.",prijsUitstel:"Kernzin: Uitstel veroorzaakt voorspelbaar verlies van marge, capaciteit en bestuurlijke voorspelbaarheid binnen 12 tot 18 maanden.",mandaat:"Kernzin: Centrale besluitvorming op capaciteit, contractruimte en portfolio wordt bindend met 48-uurs escalatieritme.",onderstroom:"Kernzin: Vermijding van productiegesprekken en beperkte financiële openheid blokkeert executie in de onderstroom.",faalmechanisme:"Kernzin: Zonder expliciete volgorde en stoplijst loopt de organisatie vast in dubbel sturen en vertraagde uitvoering.",interventie:"Kernzin: Het 90-dagenplan borgt eigenaarschap, deadlines, KPI-sturing en automatische escalatie op blokkades.",besluitkader:"Kernzin: Geen nieuw initiatief zonder margevalidatie en capaciteitsimpactanalyse; bij KPI-mis beslist centrale prioritering bindend."},ah={dominanteThese:"Zonder consolidatie binnen 12 maanden verliest de GGZ-kern direct behandelcapaciteit.",kernspanning:"Zonder volgordebesluit tussen consolideren en verbreden neemt liquiditeitsdruk direct toe.",keerzijde:"Zonder expliciete stopkeuzes blijft groei buiten de kern verliesvolume vergroten.",prijsUitstel:"Zonder correctie binnen 90 dagen verschuift een financieel vraagstuk naar een cultuur- en uitvoeringsprobleem.",mandaat:"Zonder bindend besluitrecht op capaciteit en contractruimte blijft governance niet afdwingbaar.",onderstroom:"Zonder ritmische sturing op gedrag blijft informele macht formele besluiten neutraliseren.",faalmechanisme:"Zonder maandelijkse correctie schuift escalatie naar achterafsturing met hoger capaciteitsverlies.",interventie:"Zonder dag-30, dag-60 en dag-90 sluiting blijft het plan een intentie zonder executiekracht.",besluitkader:"Zonder expliciet verlies, mandaatverschuiving en stopregels is het besluit bestuurlijk niet afdwingbaar."},gt={thesis:"Dominante these kon niet automatisch worden bepaald.",conflict:"Strategisch conflict kon niet automatisch worden bepaald.",boardQuestion:"Bestuurlijke vraag kon niet automatisch worden bepaald.",stressTest:"Boardroom stresstest kon niet automatisch worden bepaald. Zonder expliciete keuze neemt strategische frictie verder toe.",insights:"Killer insights konden niet automatisch worden bepaald.",interventionPlan:"Interventieplan kon niet automatisch worden bepaald.",openQuestions:`- Welke keuze wordt de komende 90 dagen expliciet niet meer gefinancierd?
- Welke KPI dwingt herbesluit af als de gekozen koers niet werkt?
- Welke bestuurlijke bottleneck moet binnen 30 dagen expliciet worden opgeheven?`};function oh(e){return String(e??"").replace(/\r\n/g,`
`).replace(/\s+/g," ").split(new RegExp("(?<=[.!?])\\s+")).map(t=>t.trim()).filter(Boolean)}function sh(e){return String(e??"").replace(/\r\n/g,`
`).split(/\n{2,}/).map(t=>{const n=t.trim();if(!n)return[];const i=n.split(`
`).map(a=>a.trim()).filter(Boolean);if(!i.length)return[];const r=i.map(a=>a.replace(/^[-*]\s+/,"").replace(/^\d+\.\s+/,"")).map(a=>a.replace(/^[A-Z][^:]{1,40}:\s*/i,"")).join(" ");return oh(r)}).flat().map(t=>t.replace(/\s+\./g,".").trim()).filter(Boolean)}function jn(e,t){return e.slice(0,t).join(" ").trim()}function ch(e,t){const n=jn(t,3);if(!n)return"";if(e==="dominanteThese"){const i=n.charAt(0).toLowerCase()+n.slice(1);return jn([`De dominante bestuurlijke these is dat ${i}`,"De spanning ontstaat doordat ambitie en operationele realiteit niet meer in hetzelfde ritme lopen."],4)}return jn([n,"De spanning zit in het verschil tussen bestuurlijke ambitie en uitvoerbare capaciteit."],4)}function lh(e){const t=e.find(r=>/\b(druk|uitval|vertraging|verlies|frictie|onrust|plafond|tekort)\b/i.test(r)),n=e.find(r=>/\b(kostprijs|contract|tarief|capaciteit|mandaat|transparantie|planning|norm)\b/i.test(r)),i=e.find(r=>/\b(liquiditeit|marge|behandelcapaciteit|wachtlijst|voorspelbaarheid|doorlooptijd)\b/i.test(r));return jn([`Mechanisme: ${t??"Symptomen worden zichtbaar als vertraging, druk en oplopende frictie."}`,`Structurele oorzaak: ${n??"Randvoorwaarden in contracten, capaciteit en sturing begrenzen wat uitvoerbaar is."}`,`Systeemeffect: ${i??"Daardoor verschuift druk van cijfers naar gedrag, planning en continuiteit."}`],4)}function dh(e,t){const n=t.find(i=>/\b(bestuurlijk|besluit|mandaat|escalatie|stopregel|prioritering|keuze)\b/i.test(i));return jn([`Bestuurlijke implicatie: ${n??"Het bestuur moet keuzevolgorde, mandaat en stopregels expliciet en afdwingbaar maken."}`,ah[e]],4)}function uh(e,t){const n=Ne(t,e),i=sh(n);if(!i.length)return n.trim();const r=ch(e,i),a=lh(i),o=dh(e,i);return[r,a,o].filter(Boolean).join(`

`).trim()}function gh(e,t){const n=`${e}
${t}`,i=String(n??"").replace(/\r\n/g,`
`).split(/\n+/).map(c=>c.trim()).filter(Boolean),r=i.filter(c=>/\b(ggz|jeugdzorg|contract|verzekeraar|plafond|productiviteit|behandel|intake|planning|capaciteit)\b/i.test(c)).slice(0,2),a=i.filter(c=>/€\s?\d|(?:\d+[,.]?\d*\s*%|\b\d+\s*(?:dagen|maanden|FTE|cliënten?)\b)/i.test(c)).slice(0,2),o=r.length>0?r.join(" "):"De organisatie opereert in een context met hoge druk op capaciteit, tarieven en contractruimte.",s=a.length>0?a.join(" "):"Kritieke stuurcijfers zijn deels beschikbaar, maar nog niet overal ritmisch gekoppeld aan besluitvorming.";return["0. Situatiereconstructie",`${o} ${s}`.replace(/\s+/g," ").trim()].join(`
`)}function ar(e,t){return String(e??"").trim()||t}function mh(e,t){const n=String(e??"").trim(),i=n.toLowerCase(),r=[],a=Rs(t),o=n.match(/90-dagen interventie(?:ontwerp|plan)[\s\S]*?(?=\n### |\n\d+\. |$)/i)?.[0]||"";return/(dominante these|executive thesis|bestuurlijke these|bestuurlijke kernsamenvatting)/i.test(i)||r.push(`### EXECUTIVE THESIS
${gt.thesis}`),/kernconflict|strategisch kernconflict|strategische spanning/i.test(i)||r.push(`### STRATEGISCHE SPANNING
${gt.conflict}`),/boardroom question|bestuurlijke vraag|board vraag|besluitvraag/i.test(i)||r.push(`### BESTUURLIJKE VRAAG
${gt.boardQuestion}`),/stresstest|stress test|bestuurlijke stresstest/i.test(i)||r.push(`### BOARDROOM STRESSTEST
${gt.stressTest}`),/killer insights|nieuwe inzichten|doorbraakinzichten/i.test(i)||r.push(`### DOORBRAAKINZICHTEN
${a.length?a.slice(0,5).join(`
`):gt.insights}`),/90-dagen interventie|interventieplan|bestuurlijk actieplan/i.test(i)||r.push(`### BESTUURLIJK ACTIEPLAN
${ar(o,gt.interventionPlan)}`),/open questions|open vragen|open strategische vragen/i.test(i)||r.push(`### OPEN STRATEGISCHE VRAGEN
${gt.openQuestions}`),r.length?[n,...r].filter(Boolean).join(`

`):n}function ph(e){const t=String(e??"").trim();if(!t)return{};const n=/^\s*[1-9]\.\s+[^\n]+$/gm,i=[...t.matchAll(n)];if(!i.length)return{};const r={};for(let a=0;a<i.length;a+=1){const o=i[a],s=String(o[0]??"").trim(),c=ih.find(m=>m.heading.test(s))?.slot;if(!c||r[c])continue;const l=(o.index??0)+s.length,u=i[a+1]?.index??t.length,g=Ne(t.slice(l,u).trim(),c);g&&(r[c]=g)}return r}function Rs(e){const t=e.killer_insights;return Array.isArray(t)?t.map(n=>String(n??"").trim()).filter(Boolean):[]}function bh(e){return String(e??"").replace(/\s+/g," ").trim()}function go(e){const t=[{theme:"Cultuur & Eigenaarschap",description:"Retentie, betrokkenheid en professionele verantwoordelijkheid als kwaliteitsmotor.",patterns:[/\bcultuur\b/i,/\beigenaarschap\b/i,/\bziekteverzuim\b/i,/\bmede-?eigenaar\b/i]},{theme:"Netwerkstrategie",description:"Impactvergroting via partners, kennisdeling en licenties.",patterns:[/\bnetwerk\b/i,/\bpartners?\b/i,/\blicentie\b/i,/\bkennisdeling\b/i]},{theme:"Wachttijdinnovatie",description:"Triage en kortdurende interventies als capaciteitshefboom.",patterns:[/\bwachttijd\b/i,/\btriage\b/i,/\bwachtlijst\b/i,/\bkort traject\b/i,/\bintake\b/i]},{theme:"Beleidsinvloed",description:"Systeembeinvloeding via gemeenten, VWS/VNG en sectornetwerken.",patterns:[/\bbeleid\b/i,/\bgemeente\b/i,/\bvng\b/i,/\bvws\b/i,/\bbeweging van nul\b/i]},{theme:"Financiele Druk",description:"Tariefdruk en loonkosten vragen expliciete margelogica.",patterns:[/\bmarge\b/i,/\btarief\b/i,/\bloonkosten?\b/i,/\bcontract\b/i,/\bvergrijzing\b/i]}],n=String(e??"").replace(/\r\n/g,`
`).split(/\n+/).map(r=>r.trim()).filter(Boolean),i=t.map(r=>{const a=n.filter(o=>r.patterns.some(s=>s.test(o))).slice(0,3);return{theme:r.theme,description:r.description,signals:a}}).filter(r=>r.signals.length>0).slice(0,5);return i.length>0?i:[{theme:"Capaciteit & Kwaliteit",description:"Balans tussen zorgkwaliteit en uitvoerbare groei.",signals:n.slice(0,2)}]}function hh(e,t){const n=e,i=n.caseStructure??n.state?.caseStructure;if(Array.isArray(i)){const s=i.map(c=>{if(!c||typeof c!="object")return null;const l=c,u=bh(String(l.theme??""));if(!u)return null;const g=typeof l.description=="string"?l.description.trim():void 0,m=Array.isArray(l.signals)?l.signals.map(p=>String(p??"").trim()).filter(Boolean).slice(0,3):[];return{theme:u,description:g,signals:m}}).filter(Boolean);if(s.length>0){const c=[...s],l=go(t);for(const u of l)if(!c.some(g=>g.theme===u.theme)&&(c.push(u),c.length>=3))break;return c.slice(0,5)}}const r=go(t);if(r.length>=3)return r.slice(0,5);const a=[{theme:"Governance & Besluitritme",description:"Mandaat, escalatie en prioritering bepalen of keuzes uitvoerbaar blijven.",signals:[]},{theme:"Capaciteit & Continuiteit",description:"Instroom, werkdruk en uitvoerbaarheid lopen vast zonder harde toegangskeuzes.",signals:[]},{theme:"Positionering & Contractruimte",description:"Contractkwaliteit en scherpe propositie bepalen of groei bestuurlijk houdbaar is.",signals:[]}],o=[...r];for(const s of a)if(!o.some(c=>c.theme===s.theme)&&(o.push(s),o.length>=3))break;return o.slice(0,5)}function Eh(e){const t=e.toLowerCase();return/\bkwaliteit|cultuur|behandelrelatie|eigenaarschap\b/.test(t)?{tensionA:"Behandelkwaliteit beschermen",tensionB:"Maatschappelijke impact vergroten",explanation:"Groei wordt begrensd om kwaliteit en eigenaarschap te borgen, waardoor impactgroei vooral via netwerkadoptie en modelverspreiding moet plaatsvinden."}:/\bmarge|tarief|kostprijs|loonkosten|contract\b/.test(t)?{tensionA:"Financiele weerbaarheid borgen",tensionB:"Innovatieruimte behouden",explanation:"Kostendruk vraagt directe margecontrole, terwijl toekomstige impact afhankelijk blijft van doorlopende innovatie en overdraagbare modellen."}:{tensionA:"Autonomie behouden",tensionB:"Standaardisatie verhogen",explanation:"Lokale ruimte versnelt maatwerk, maar zonder standaardkaders daalt voorspelbaarheid van kwaliteit en uitvoerbaarheid."}}function fh(e,t){const n=e,i=n.strategicConflict??n.state?.strategicConflict;if(i&&typeof i=="object"){const r=i,a=String(r.tensionA??"").trim(),o=String(r.tensionB??"").trim(),s=String(r.explanation??"").trim();if(a&&o&&s)return{tensionA:a,tensionB:o,explanation:s}}return Eh(t)}function kh(e){return["### CASE STRUCTURE",...e.slice(0,5).map(n=>{const i=(n.signals??[]).filter(Boolean).slice(0,2).join(" | "),r=n.description?` — ${n.description}`:"",a=i?` (signals: ${i})`:"";return`- ${n.theme}${r}${a}`})].join(`
`).trim()}function vh(e){return["### STRATEGISCH KERNCONFLICT","Strategisch spanningsveld:",`A: ${e.tensionA}`,`B: ${e.tensionB}`,"","Interpretatie:",e.explanation].join(`
`)}function Sh(e,t){const n=e.report??gt.thesis,i=St(n,{fullDocument:!1}),r=St(String(t??""),{fullDocument:!0}),a=new Set,o=($,q,le)=>{if(!$||!q)return;const U=$.toLowerCase().trim();a.has(U)||(a.add(U),le.push(q))},s=[];o("korte termijn stabiliteit versus lange termijn transformatie","Korte termijn stabiliteit versus lange termijn transformatie",s),o("decentrale autonomie versus centrale sturing","Decentrale autonomie versus centrale sturing",s);const c=new si,l=ph(r),u=Rs(e),g=["dominanteThese","kernspanning","keerzijde","prijsUitstel","mandaat","onderstroom","faalmechanisme","interventie","besluitkader"],m={dominanteThese:0,kernspanning:0,keerzijde:0,prijsUitstel:0,mandaat:0,onderstroom:0,faalmechanisme:0,interventie:0,besluitkader:0},p=$=>{let q=2166136261;for(let le=0;le<$.length;le+=1)q^=$.charCodeAt(le),q=Math.imul(q,16777619);return(q>>>0).toString(16).padStart(8,"0")};for(const $ of g){let q=l[$]??($==="dominanteThese"?i:rh[$]);$==="prijsUitstel"&&u.length&&(q=[`Nieuwe inzichten: ${u.map(y=>y.replace(/^[-*]\s+/,"").trim()).filter(Boolean).join(" ")}`.trim(),String(q??"").trim()].filter(Boolean).join(`

`));const le=uh($,q);m[$]+=1,ci()&&console.info("[slot_write_trace]",{sectionId:$,hash:p(le),writeCount:m[$]}),c.writeSlot($,le)}c.freeze();const I=c.assembleDocument();rn(I);const T=hh(e,`${i}
${r}`),b=fh(e,`${i}
${r}`),h=[kh(T),vh(b)].filter(Boolean).join(`

`),x=[gh(i,r),h,I].filter(Boolean).join(`

`).trim();let N=dr(x);N=mh(N,e),Wo(N);const j=Zb(N,{minScore:85});return j.pass||(N=[N,"### BOARD-GRADE VALIDATIE",`Status: SOFT_FAIL (score ${j.score}/${j.minScore})`,`Errors: ${j.errors.join(" | ")}`].filter(Boolean).join(`

`)),j.pass||ci()&&console.warn("[BoardGrade][SOFT_FAIL]",{score:j.score,minScore:j.minScore,errors:j.errors,warnings:j.warnings}),{executive_thesis:ar(i,gt.thesis),central_tension:ar(b.explanation,"Spanning tussen huidige operationele realiteit en strategische noodzaak."),strategic_narrative:N,key_tradeoffs:s,irreversible_decisions:["Structuur van leiderschap","Positionering in de markt"]}}const Qn="Cash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan.";function As(e){return String(e??"").replace(/\r\n/g,`
`).replace(/[ \t]+/g," ").replace(/\n{3,}/g,`

`).trim()}function Os(e){return String(e??"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function pi(e){const t=As(String(e??"")).replace(/Bronbasis:.*$/gim,"").replace(/Bronankers:.*$/gim,"").replace(/\(Interpretatie\)/g,"").replace(/\(Hypothese\)/g,"").replace(/^\s*(Aanname|Contextanker|Contextsignaal):.*$/gim,"").replace(/\n{3,}/g,`

`).trim();return ps(t).sanitizedText}function Ih(e,t=20){return e.split(/\s+/).filter(Boolean).length<=t?[e.trim()]:[e.trim()]}function Th(e){return String(e??"").replace(/€\s*[0-9][0-9.,]*/g,t=>t.replace(/\s+/g,"").replace(/\./g,"§DOT§").replace(/,/g,"§COMMA§"))}function Nh(e){return String(e??"").replace(/§DOT§/g,".").replace(/§COMMA§/g,",")}function Rh(e){const t=pi(e);if(!t)return"";const n=t.split(/\n\s*\n+/).map(r=>r.trim()).filter(Boolean),i=[];for(const r of n){const a=r.split(`
`).map(u=>u.trim()).filter(Boolean);if(a.some(u=>/^([-*•]|\d+[.)])\s+/.test(u))){i.push(a.join(`
`));continue}const c=(Th(r).match(/[^.!?\n]+[.!?]?/g)??[]).map(u=>Nh(u.trim())).filter(Boolean).flatMap(u=>Ih(u,20)),l=[];for(let u=0;u<c.length;u+=5)l.push(c.slice(u,u+5).join(" "));i.push(l.join(`
`))}return As(i.join(`

`))}function OE(e){const t=new Set,n=[];for(const i of e){const r=Os(i.title);r&&(t.has(r)||(t.add(r),n.push(i)))}return n}function Ah(e){const t=pi(e).split(`
`).map(r=>r.trim()).filter(Boolean),n=new Set,i=[];for(const r of t){if(!/^(30|90|365)\s*dagen\b/i.test(r)){i.push(r);continue}const o=r.toLowerCase();n.has(o)||(n.add(o),i.push(r))}return i.join(`
`)}function Oh(e,t){const n=pi(e),i=Os(t);if(!(i.includes("financiele onderbouwing")||i.includes("prijs van uitstel")))return n;const a=n.split(`
`).map(m=>m.trim()).filter(Boolean),o=/cash\s*runway|liquiditeitsruimte|runway/i.test(n),s=/liquiditeitsbuffer|minimale liquiditeitsbuffer/i.test(n),c=/maandelijkse druk|druk per maand|per maand/i.test(n),l=/^status:/im.test(n)||/onvoldoende cash-inzicht|cash-inzicht/i.test(n);o||a.push(`Cash runway (maanden): ${Qn}`),s||a.push(`Minimale liquiditeitsbuffer: ${Qn}`),c||a.push(`Maandelijkse druk (EUR): ${Qn}`),l||a.push(`Status: ${Qn}`);let u=!1;return a.filter(m=>/^status:/i.test(m)?u?!1:(u=!0,!0):!0).join(`
`)}function Cs(e,t=""){const n=pi(e),i=Oh(n,t),r=Ah(i),a=St(r,{fullDocument:!1});return St(Rh(a),{fullDocument:!1})}function Ch(e){let t=String(e??"");t=t.replace(/\n\s*\n\s*\n/g,`

`);const n=t.split(`

`),i=new Set,r=[];for(const a of n){const o=a.trim().toLowerCase();o&&(i.has(o)||(i.add(o),r.push(a)))}return t=r.join(`

`),t=t.replace(/trade-?offs?/gi,"verliesbesluit"),t=t.replace(/([^\.]{180,}\.)/g,a=>a.replace(/, /g,". ")),t}function mo(e){let t=String(e??""),n="";for(;t!==n;)n=t,t=t.replace(/€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,(i,r,a,o)=>`€${r}${a}${o}`);return t=t.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g,"€$1$2$3"),t=t.replace(/€\s+([0-9])/g,"€$1"),t}function wh(e){return String(e??"").replace(/Dit betekent dat/gi,"Daardoor").replace(/Hierdoor ontstaat/gi,"Dit leidt tot").replace(/Het gevolg is dat/gi,"Gevolg:")}function jh(e){return String(e??"")}function xh(e){const t=new Set;return String(e??"").split(`
`).filter(n=>{const i=n.trim();if(!i)return!0;if(i.includes("30 dagen")||i.includes("90 dagen")||i.includes("365 dagen")){if(t.has(i))return!1;t.add(i)}return!0}).join(`
`)}function yh(e){return String(e??"").replace(/\s+\./g,".").replace(/\.\./g,".").trim()}function $h(e){const t=new Set;return String(e??"").split(`
`).filter(n=>{if(!(/^\s*#{1,6}\s+/.test(n)||/^\s*\d+\.\s+/.test(n)))return!0;const r=n.toLowerCase().replace(/\s+/g," ").trim();return t.has(r)?!1:(t.add(r),!0)}).join(`
`)}function _h(e){return String(e??"").split(`

`).map(t=>{const n=t.trim();return!n||/conclusie:|daarom|gevolg:/i.test(n)||/[.!?]$/.test(n)?n:`${n}.`}).join(`

`)}function ws(e){return String(e??"").toLowerCase().replace(/[^\p{L}\p{N}\s€%]/gu," ").replace(/\s+/g," ").trim()}function zh(e){const t=String(e??"").split(/\n\s*\n+/).map(r=>r.trim()).filter(Boolean),n=new Set,i=[];for(const r of t){const a=ws(r);!a||n.has(a)||(n.add(a),i.push(r))}return i.join(`

`)}function Dh(e){return String(e??"").split(/\n\s*\n+/).map(i=>i.trim()).filter(Boolean).map(i=>{const r=(i.match(/[^.!?\n]+[.!?]?/g)??[i]).map(s=>s.trim()).filter(Boolean),a=new Set,o=[];for(const s of r){const c=ws(s);!c||a.has(c)||(a.add(c),o.push(s))}return o.join(" ").replace(/\s+/g," ").trim()}).filter(Boolean).join(`

`)}function Lh(e){return String(e??"").replace(/\s+:\s+/g,": ").replace(/\s+;\s+/g,"; ").replace(/\.\s*([,;:])/g,"$1").replace(new RegExp("\\b(circa|ongeveer|rond|ca|en|maar|terwijl|of)\\.\\s+(€|\\p{L})","giu"),"$1 $2").replace(/;\./g,".").replace(/\.\s*\./g,".").replace(/\n{3,}/g,`

`).trim()}function Ir(e){let t=mo(String(e??""));return t=jh(t),t=Ch(t),t=wh(t),t=xh(t),t=$h(t),t=yh(t),t=Dh(t),t=zh(t),t=_h(t),mo(Lh(t))}function Xn(e,t,n){return Math.min(n,Math.max(t,e))}function Qt(e,t){return{content:e.trim(),insights:[`${t}: huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd.`,`${t}: inconsistentie tussen besluit en uitvoering verhoogt frictie.`],recommendations:[`Leg voor ${t.toLowerCase()} expliciet eigenaarschap en besluitmomenten vast.`,`Koppel ${t.toLowerCase()} aan meetbare 30/60/90-dagen doelen.`],risks:[`${t}: uitstel vergroot herstelkosten en vertraagt executie.`],opportunities:[`${t}: versnelde besluitdiscipline kan binnen 90 dagen aantoonbare impact geven.`]}}function Bh(e){const t=e.toLowerCase(),n=["urg","risico","conflict","druk","stagn","verlies"],i=["governance","eigenaar","mandaat","besluit","escalat","kpi"],r=["focus","prioriteit","discipline","uitvoering","helder"],a=I=>I.reduce((T,b)=>T+(t.includes(b)?1:0),0),o=a(n),s=a(i),c=a(r),l=Xn(42+o*7-c*2,20,95),u=Xn(35+s*8+c*3-o*2,15,95),g=Xn(Math.round(u*.55+(100-l)*.45),20,95),m=Xn(Number((.35+(s+c)*.05-o*.02).toFixed(2)),.1,.95),p=l>=75?"HIGH":l>=50?"MEDIUM":"LOW";return{conflict_intensity_score_0_100:l,governance_integrity_score_0_100:u,decision_strength_index_0_100:g,execution_risk_level:p,decision_certainty_0_1:m}}async function Gh(e){const t=String(e.rawText??"").trim(),n=Bh(t),i=n.execution_risk_level,r=e.analysisType||"analyse";return{metrics:n,execution_layer:{"90_day_priorities":[`Prioriteit 1: besluitkader voor ${r} expliciet vastleggen met eigenaar en deadline.`,"Prioriteit 2: wekelijkse escalatieroute activeren op blokkades in capaciteit en mandaat.","Prioriteit 3: executieritme op 30/60/90 dagen met meetbare KPI-review afdwingen."],measurable_outcomes:["Binnen 30 dagen: 100% van de top-3 besluiten voorzien van owner, scope en deadline.","Binnen 60 dagen: minimaal 2 blokkades per week opgelost binnen afgesproken escalatie-SLA.","Binnen 90 dagen: aantoonbare verbetering op beslisdoorlooptijd en uitvoerbetrouwbaarheid."],risk_level:i,owner_map:["CEO: besluitdiscipline en mandaatbewaking","COO: uitvoeringsritme en blokkade-oplossing","CFO: keuzeconflict validatie en opportunity-cost monitoring"]},node_results:{truth:Qt("Strategische realiteitscheck toont een gat tussen bestuurlijke intentie en operationele doorvertaling.","Waarheidslaag"),governance:Qt("Governance-integriteit vraagt heldere besluitrechten, escalatiegrenzen en afdwingbaar eigenaarschap.","Governance"),conflict:Qt("Machtsfrictie concentreert zich rond prioritering, mandaatduidelijkheid en informele beïnvloeding.","Conflict"),opportunity_cost:Qt("Kosten van uitstel lopen op door vertraging in keuzes, herwerk en dalende executiezekerheid.","Opportunity cost"),tradeoff:Qt("Keuzeconflicten moeten expliciet worden gemaakt tussen snelheid, controle en organisatiedraagvlak.","Keuzeconflict"),decision_finalizer:Qt("Bestuurlijke verankering vereist één expliciet besluitcontract met tijdshorizon, KPI en faalconditie.","Decision finalizer")}}}const Mh=3500,po=7e3,Ph=6200,Uh=cr,Hh="Waarschuwing: output voldoet niet volledig aan Cyntra-standaard → fallback gegenereerd. Rapport is bruikbaar maar minder scherp.",Kh=[/\[SOURCE_FREE_FIELD\]/gi,/\[SOURCE_UPLOAD\]/gi,/SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,/^\s*Aanname:[^\n]*\n?/gim,/^\s*Contextanker:[^\n]*\n?/gim,/\bbeperkte context\b/gi,/\bduid structureel\b/gi,/\bcontextsignaal\b/gi,/werk uit structureel/gi];function bo(e){if(!e||typeof e!="object")return null;const t=e.result_payload&&typeof e.result_payload=="object"?e.result_payload:e.result&&typeof e.result=="object"?e.result:null;if(!t)return null;const n="input_payload"in t?Object.fromEntries(Object.entries(t).filter(([i])=>i!=="input_payload")):t;return{report:n,confidence:typeof n.confidence=="string"?n.confidence:"medium",created_at:typeof e.finished_at=="string"?e.finished_at:typeof e.created_at=="string"?e.created_at:void 0,intelligence_layer:n.intelligence_layer,decision_layer:n.decision_layer,strategic_levers:n.strategic_levers,causal_strategy:n.causal_strategy}}function Vh(e){const n=[gn(e.decision).strategic_options,e.strategic_options,e.options];for(const i of n){if(!Array.isArray(i))continue;const r=i.map(a=>{if(typeof a=="string")return a.trim();if(a&&typeof a=="object"){const o=a;return String(o.description||o.title||o.option||"").trim()}return""}).filter(Boolean).slice(0,3);if(r.length)return r}return[]}function Fh(e,t){const n=gn(e.decision);return[n.recommended_option,e.recommended_option,n.dominant_thesis,t.tradeoffs].map(r=>String(r??"").trim()).find(Boolean)||t.dominantThesis}function Wh(e,t,n){const i=Vh(t),r=Fh(t,e),a=[e.opportunityCost,e.powerDynamics,e.executionRisk].map(s=>re(s).trim()).filter(Boolean).slice(0,3),o=i.length?i.map((s,c)=>`${c+1}. ${s}`).join(`
`):["1. Stabiliseren rond de kernpropositie en verlieslatende complexiteit stoppen.","2. Selectief versnellen waar mandaat, capaciteit en rendement aantoonbaar samenvallen.","3. Huidige koers handhaven en stijgende uitvoeringsdruk accepteren."].join(`
`);return ft(["1. Dominante These",re(e.dominantThesis),"","2. STRATEGISCH CONFLICT",re(e.coreConflict),"","3. KILLER INSIGHTS",a.length?a.map((s,c)=>`${c+1}. ${s}`).join(`
`):re(n),"","4. Strategische opties",o,"","5. Aanbevolen keuze",re(r),"","6. Mandaat & Besluitrecht",re(e.governanceImpact),"","7. 90-dagen interventieplan",re(e.interventionPlan90D),"","8. Besluitkader",re(e.decisionContract)].join(`
`))}const js={conflict_intensity_score_0_100:0,governance_integrity_score_0_100:0,decision_strength_index_0_100:0,execution_risk_level:"MEDIUM",decision_certainty_0_1:0},xs={"90_day_priorities":[],measurable_outcomes:[],risk_level:"MEDIUM",owner_map:[]},ys=["Analyse Entry","Intake","runCyntraFullPipeline()","MultiAgentOrchestrator","Synthese Core","Besluitkader","Bestuurlijke Analyse","Control Surface","Rapport Download"],Ze=ys.length,Jh=500,Zh={truth:"Strategische Realiteitscheck",governance:"Besluitspanningsindicator",conflict:"Machtsfrictie",opportunity_cost:"Stilstandsverlies",tradeoff:"Strategische Samensmelting",decision_finalizer:"Bestuurlijke Verankering"},Yh={dominantThesis:"Analyse.dominante_these",coreConflict:"Analyse.kernspanning",tradeoffs:"Analyse.keerzijde_van_de_keuze",governanceImpact:"Analyse.mandaat_en_besluitrecht",powerDynamics:"Analyse.onderstroom",opportunityCost:"Analyse.prijs_van_uitstel",executionRisk:"Analyse.faalmechanisme",decisionContract:"Analyse.besluitkader",interventionPlan90D:"Analyse.interventieplan_90_dagen"},ho=new Set,Eo=new Set,$s=typeof window<"u"&&new URLSearchParams(window.location.search).has("debugBoard");function Le(e,...t){ho.has(e)||(ho.add(e),console.warn(...t))}function _s(e,...t){Eo.has(e)||(Eo.add(e),console.info(...t))}function Tr(e){if(typeof e=="string")return e;if(Array.isArray(e))return e.map(t=>String(t)).join(`
`);if(e&&typeof e=="object")try{return JSON.stringify(e,null,2)}catch{return String(e)}return""}function fo(e){return e.trim().split(/\s+/).filter(Boolean).length}function ln(e,t=0){const n=typeof e=="number"?e:Number(e);return Number.isFinite(n)?n:t}function xn(e){return[e.name,e.size,e.lastModified].join(":")}function qh(e,t){const n=[...e],i=new Set(e.map(xn));return t.forEach(r=>{const a=xn(r);i.has(a)||(i.add(a),n.push(r))}),n}function ko(e,t="{}"){try{return JSON.stringify(e??{})}catch{return t}}function Qh(e){const t=String(e??"").trim();if(!/Board-grade contract fail/i.test(t))return[];const n=t.indexOf(":");return(n>=0?t.slice(n+1):t).split(",").map(r=>r.trim()).filter(Boolean).slice(0,8)}function Nr(e){try{if(typeof atob=="function")return atob(e)}catch{}return""}function Xh(e){try{const t=Nr(e);if(!t)return"";const n=Uint8Array.from(t,i=>i.charCodeAt(0));return new TextDecoder("utf-8").decode(n)}catch{return""}}function vo(e){return e.replace(/\\([\\()])/g,"$1").replace(/\\n/g," ").replace(/\\r/g," ").replace(/\\t/g," ").replace(/\\[0-7]{1,3}/g," ").replace(/\s+/g," ").trim()}function eE(e){const t=[],n=/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g;let i=null;for(;(i=n.exec(e))!==null;){const o=vo(i[1]||"");o.length>=2&&t.push(o)}const r=/\[(.*?)\]\s*TJ/gs;let a=null;for(;(a=r.exec(e))!==null;){const o=a[1]||"",s=/\(([^()]*(?:\\.[^()]*)*)\)/g;let c=null;for(;(c=s.exec(o))!==null;){const l=vo(c[1]||"");l.length>=2&&t.push(l)}}return t.length>=10?t.join(`
`).slice(0,5e3):(e.match(/[A-Za-z0-9€%(),.;:'"\/\-_ ]{20,}/g)?.slice(0,120).join(`
`)||"").slice(0,5e3)}async function tE(e){try{const{default:t}=await Ji(async()=>{const{default:o}=await import("./jszip.min-DrRqynH4.js").then(s=>s.j);return{default:o}},__vite__mapDeps([0,1,2,3,4,5])),n=Nr(e);if(!n)return"";const i=Uint8Array.from(n,o=>o.charCodeAt(0)),a=await(await t.loadAsync(i)).file("word/document.xml")?.async("string");return a?a.replace(/<w:tab\/>/g," ").replace(/<w:br\/>/g,`
`).replace(/<w:p[^>]*>/g,`
`).replace(/<\/w:p>/g,`
`).replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/\s+/g," ").trim().slice(0,5e3):""}catch{return""}}async function nE(e,t){const n=String(e||"").match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i);if(!n)return"";const i=(n[1]||"").toLowerCase(),r=n[2]||"",a=(t||"").toLowerCase(),o=i.startsWith("text/")||i.includes("json")||i.includes("xml")||i.includes("csv")||i.includes("markdown"),s=/\.(txt|md|markdown|json|csv|xml|log)$/i.test(a);if(i.includes("pdf")||/\.pdf$/i.test(a)){const l=Nr(r);return eE(l).slice(0,1200)}if(i.includes("officedocument.wordprocessingml.document")||/\.docx$/i.test(a))return(await tE(r)).slice(0,1200);if(!o&&!s)return"";const c=Xh(r).replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g," ").replace(/\s+/g," ").trim();return c?c.slice(0,800):""}async function iE(e){return e.length?(await Promise.all(e.map(async n=>{const i=await nE(n.content,n.filename);return i?`Bestand ${n.filename}: ${i}`:`Bestand ${n.filename}: tekstpreview niet direct extraheerbaar, gebruik bestandscontext als bronanker.`}))).join(`
`):"Geen uploads aangeleverd."}function gn(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}function or(e,t=0){return t>3||e==null?[]:typeof e=="string"?e.split(`
`).map(n=>n.trim()).filter(Boolean):typeof e=="number"||typeof e=="boolean"?[String(e)]:Array.isArray(e)?e.flatMap(n=>or(n,t+1)):typeof e=="object"?Object.entries(e).map(([n,i])=>{const r=or(i,t+1);if(r.length===0)return"";const a=n.replace(/_/g," ").trim();return r.length===1?`${a}: ${r[0]}`:`${a}: ${r.join(" | ")}`}).filter(Boolean):[]}function J(e){return or(e).join(`
`).trim()}function So(e){return String(e??"").toLowerCase().replace(/[^a-z0-9\s_-]/g," ").replace(/\s+/g," ").trim()}function Ye(e,t){const n=t.map(a=>So(a)),i=/^#{1,6}\s*(.+?)\s*$/gm,r=[...e.matchAll(i)];for(let a=0;a<r.length;a+=1){const o=r[a];if(o.index==null)continue;const s=So(o[1]??"");if(!n.some(m=>s.includes(m)||m.includes(s)))continue;const l=o.index+o[0].length,u=r[a+1]?.index??e.length,g=e.slice(l,u).replace(/^\n+/,"").trim();if(g)return g}return""}function zs(e){const t=gn(e);return[J(t.content),J(t.insights),J(t.recommendations),J(t.risks),J(t.opportunities)].filter(Boolean).join(`
`).trim()}function Xt(e,t){if(!e?.node_results?.[t])return"";const n=Zh[String(t)]??String(t),i=zs(e.node_results[t]);return i?`${n}: ${i}`:""}function Pe(...e){for(const t of e)if(t&&t.trim())return t.trim();return""}function Io(e,t){const n=String(t??""),i=/\bjan\b/i.test(n),r=/\bbarbara\b/i.test(n),a=/\bdeborah\b/i.test(n),o=/\b(office manager|hr-medewerker|hr verantwoordelijke|hr-verantwoordelijke|hr lead|hr\/operations)\b/i.test(n),s=/\bbestuurssecretaris\b/i.test(n);if(!i&&!r&&!a&&!o&&!s)return e;const c=T=>{const b=String(T??"").trim();if(!b)return!1;const h=/\bals\b/i.test(b),d=/\bdan\b/i.test(b),x=/\bwaardoor\b/i.test(b),N=/\b(dat betekent|impliciet kiest|feitelijk kiest|kiest voor)\b/i.test(b),j=/\b(verlies|prijs|risico|liquiditeitsstress|capaciteitsreductie|marge-erosie|mandaatverlies)\b/i.test(b);return h&&d&&x&&N&&j},l=(T,b,h)=>!h.trim()||new RegExp(`\\b${b}\\b`,"i").test(T)||!c(h)?T:`${T}
${h}`.trim();let u=e.dominantThesis,g=e.governanceImpact,m=e.powerDynamics,p=e.executionRisk,I=e.decisionContract;return i&&(u=l(u,"jan","Als Jan vasthoudt aan het mensgerichte model zonder contractvloer per verzekeraar vast te leggen, dan absorbeert de GGZ-kern tariefdalingen direct in de behandelcapaciteit, waardoor marge-erosie en liquiditeitsstress sneller oplopen. Dat betekent dat Jan impliciet kiest voor kwaliteitsbehoud met financieel risico; persoonlijke prijs: zichtbaar risico op capaciteitsreductie binnen zijn behandelmodel."),g=l(g,"jan","Als Jan geen expliciete volgordebeslissing neemt tussen consolideren en verbreden, dan blijven portfolio-keuzes parallel lopen, waardoor mandaatverschuiving uitblijft en stopbesluiten niet afdwingbaar worden. Dat betekent dat Jan feitelijk kiest voor bestuurlijke ruis; persoonlijke prijs: hogere kans op noodmaatregelen bij liquiditeitsdruk.")),r&&(m=l(m,"barbara","Als Barbara geen maandelijks individueel ritme installeert en 75%-afwijkingen niet binnen 7 dagen corrigeert, dan verschuift normsturing van managementinstrument naar teamfrictie, waardoor uitvalsignalen te laat escaleren. Dat betekent dat Barbara impliciet kiest voor reactieve in plaats van preventieve sturing; persoonlijke prijs: oplopend verzuim- en uitvalrisico in haar domein."),p=l(p,"barbara","Als maandritme en planning niet consequent via Barbara’s lijn worden opgevolgd, dan blijven blokkades langer dan 48 uur openstaan, waardoor executierisico zich opstapelt in roosters en wachttijd. Dat betekent dat Barbara feitelijk kiest voor vertraging in plaats van closure; persoonlijke prijs: zichtbare prestatiedruk zonder formeel ingrijpmandaat.")),!r&&o&&(m=l(m,"hr-verantwoordelijke","Als de HR-verantwoordelijke geen maandelijks individueel ritme afdwingt en normafwijkingen niet binnen 7 dagen corrigeert, dan wordt productiviteitsdruk informeel en diffuus, waardoor uitval later zichtbaar wordt. Dat betekent dat de HR-verantwoordelijke impliciet kiest voor stil risico; persoonlijke prijs: verlies van grip op teamcapaciteit en inzetbaarheid."),p=l(p,"hr-verantwoordelijke","Als het maandritme via de HR-verantwoordelijke niet consequent wordt opgevolgd, dan verschuiven correcties naar kwartaalgesprekken, waardoor escalatie structureel te laat komt. Dat betekent dat de HR-verantwoordelijke feitelijk kiest voor achterafsturing; persoonlijke prijs: hogere kans op capaciteitsverlies door uitval.")),a&&(g=l(g,"deborah","Als Deborah gemiste meetpunten niet binnen 48 uur laat escaleren naar bestuur en RvT, dan blijven uitzonderingen op de stoplijst bestaan, waardoor parallelle agenda's terugkeren in de portefeuille. Dat betekent dat Deborah impliciet kiest voor proces boven besluitdiscipline; persoonlijke prijs: mandaatverlies op governance-closure."),I=l(I,"deborah","Als Deborah handtekeningdiscipline niet koppelt aan automatische mandaatverschuiving bij gemiste KPI-poorten, dan blijft het besluitkader vrijblijvend, waardoor overtreding zonder consequentie mogelijk blijft. Dat betekent dat Deborah feitelijk kiest voor niet-afdwingbare governance; persoonlijke prijs: bestuurlijk aansprakelijk op naleving en escalatie.")),!a&&s&&(I=l(I,"bestuurssecretaris","Als de bestuurssecretaris handtekeningdiscipline niet bindt aan een vast meetpuntritme met directe escalatie, dan vervagen deadlines in overleg, waardoor mandaatverschuiving niet automatisch plaatsvindt. Dat betekent dat de bestuurssecretaris impliciet kiest voor procescomfort; persoonlijke prijs: verlies van bestuurlijke afdwingbaarheid.")),{...e,dominantThesis:u,governanceImpact:g,powerDynamics:m,executionRisk:p,decisionContract:I}}function rE(e){return typeof e!="string"?!1:e.includes(Ut)||/SIGNATURE LAYER WAARSCHUWING/i.test(e)}function en(e){return typeof e!="string"?!1:/SIGNATURE LAYER WAARSCHUWING/i.test(e)}function re(e){if(typeof e!="string")return"";let t=e.replace(new RegExp(Ut.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),"").replace(/SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,"");for(const n of Kh)t=t.replace(n,"");return t.replace(/^\s+/,"").trim()}function qe(e,t){const n=re(e),i=Cs(n,t),r=Ir(i),a=St(r,{fullDocument:!1,sectionTitle:t}).trim();return Ne(a,t)}function yn(e){const t=St(String(e??""),{fullDocument:!0}).trim();if(!t)return t;const n=ft(t),i=n.split(`
`).map(a=>a.trim()).filter(Boolean),r=i[i.length-1]??"";return/^(-|\*|•|\d+\.)\s+/.test(r)||/[.!?]["')\]]?$/.test(r)?n:`${n}.`}const aE=["Dominante These","Structurele Kernspanning","Keerzijde van de keuze","De Prijs van Uitstel","Mandaat & Besluitrecht","Onderstroom & Informele Macht","Faalmechanisme","90-Dagen Interventieontwerp","Besluitkader"];function oE(e){const t=String(e??"").trim();if(!t)return"";const n=[...t.matchAll(/^\s*[#]*\s*([1-9])\.\s+([^\n]+)$/gm)];if(n.length<9)throw new Error(`Canonieke documentintegriteit faalt: headingMatches=${n.length}, verwacht=9.`);const i=new Map;for(let o=0;o<n.length;o+=1){const s=n[o],c=Number(s[1]),l=(s.index??0)+s[0].length,u=n[o+1]?.index??t.length,g=t.slice(l,u).trim(),m=(()=>{if(c===1)return"dominanteThese";if(c===2)return"kernspanning";if(c===3)return"keerzijde";if(c===4)return"prijsUitstel";if(c===5)return"mandaat";if(c===6)return"onderstroom";if(c===7)return"faalmechanisme";if(c===8)return"interventie";if(c===9)return"besluitkader"})(),p=Ne(g,m);if(!p)throw new Error(`Canonieke documentintegriteit faalt: sectie ${c} is leeg.`);if(i.has(c))throw new Error(`Canonieke documentintegriteit faalt: duplicate sectie ${c}.`);i.set(c,p)}const r=new Set,a=[];for(let o=1;o<=9;o+=1){const s=i.get(o);if(!s)throw new Error(`Canonieke documentintegriteit faalt: sectie ${o} ontbreekt.`);const c=s.replace(/\s+/g," ").trim().toLowerCase();if(r.has(c))throw new Error("UI duplicatie gedetecteerd: identieke sectie-inhoud in canonieke output.");r.add(c),a.push(`${o}. ${aE[o-1]}

${s}`)}return ft(a.join(`

`).trim())}function Wi(e){const{report:t,power:n,safeContext:i}=e,r=gn(t),o=J(r.narrative)||(typeof t=="string"?t.trim():"")||J(t),s=gn(r.decision_card),c=Pe(J(r.dominant_thesis),J(r.executive_thesis),Ye(o,["dominante bestuurlijke these","bestuurlijke these","executive thesis"]),J(s.executive_thesis),"GGZ/Jeugdzorg: De raad moet nu kiezen tussen consolideren van de GGZ-kern en verbreden; beide tegelijk is financieel en organisatorisch niet houdbaar."),l=Pe(J(r.core_conflict),J(r.central_tension),Ye(o,["kernconflict","centrale spanning"]),J(s.central_tension),"Kernconflict GGZ: consolidatie van financieel fundament versus expansie met nieuwe proposities binnen dezelfde beperkte capaciteit."),u=Pe(J(r.narrative),Ye(o,["dominante bestuurlijke these","executive thesis","narrative"]),Rr(i,o)),g=Pe(J(r.tradeoffs),J(r.trade_offs),Ye(o,["keerzijde van de keuze","keuzeconflict","tradeoff","keuzes die nu voorliggen"]),zs(n?.node_results?.tradeoff),"Keerzijde van de keuze moet expliciet worden gemaakt tussen focus, snelheid en draagvlak."),m=Pe(J(r.governance),J(r.governance_impact),Ye(o,["governance impact","governance","bestuur"]),Xt(n,"governance"),"Governance-impact ontbreekt nog; eigenaarschap en escalatieregels moeten worden vastgelegd."),p=Pe(J(r.opportunityCost),J(r.opportunity_cost),Ye(o,["prijs van uitstel","opportunity cost","kosten van uitstel"]),Xt(n,"opportunity_cost"),"Prijs van uitstel moet expliciet worden gemaakt om uitstelgedrag te voorkomen."),I=Pe(J(r.power_dynamics),J(r.machtsdynamiek),J(r.onderstroom),Ye(o,["machtsdynamiek","onderstroom"]),[Xt(n,"conflict"),Xt(n,"governance")].filter(Boolean).join(`
`),"Machtsdynamiek en onderstroom vragen expliciete interventie op informele invloed, sabotagepatronen en besluitdiscipline."),T=Pe(J(r.execution_risk),J(r.conflict),Ye(o,["executierisico","conflict"]),Xt(n,"conflict"),"Executierisico vraagt directe interventie op blokkadepunten, eigenaarschap en handhaving."),b=Pe(J(r.decisionContract),J(r.decision_contract),J(s.decision_contract),Ye(o,["besluitkader","decision contract","het besluit dat nu nodig is","bestuurlijke verankering"]),Xt(n,"decision_finalizer"),"Besluitkader ontbreekt: leg besluit, eigenaar, scope, deadline en faalmechanisme expliciet vast."),h=Pe(J(r["90_day_plan"]),J(r.intervention_plan_90d),J(r.action_plan_90d),Ye(o,["90-dagen interventieplan","90-dagen","90 day","executie en 90-dagen sturing"]),"","90-dagen interventieplan ontbreekt: definieer 3 prioriteiten, 3 meetbare outcomes en eigenaar per actie."),d={dominantThesis:Pe(c,u),coreConflict:l,tradeoffs:g,governanceImpact:m,powerDynamics:I,opportunityCost:p,executionRisk:T,decisionContract:b,interventionPlan90D:h},x=`${i}
${o}
${J(t)}
${J(r)}`,N=Uc(Io(d,x),{contextHint:i});return Io(N,x)}function sE(e,t){const n=String(e??"").trim().split(/\s+/).filter(Boolean);return n.length<=t?n.join(" "):n.slice(0,t).join(" ")}function Rr(e,t){return`### 1. DOMINANTE BESTUURLIJKE THESE
De organisatie moet eerst consolideren op financiële kernsturing en pas daarna verbreden via HR-loket en nieuwe pijlers. Spanning op productienorm en vermijding van financiële dialoog vertraagt harde keuzes.

### 2. HET KERNCONFLICT
Kernconflict: rust en stabilisatie worden bestuurlijk nagestreefd, terwijl de organisatie operationeel tegelijk op verbreding en groei blijft sturen.

### 3. KEERZIJDE VAN DE KEUZE
Keerzijde van de keuze:
- Wat lever je in: tijdelijke groeisnelheid buiten de kern.
- Wat vertraag je: uitbreiding van HR-loket en vierde pijler.
- Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.
- Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.

### 4. PRIJS VAN UITSTEL
30 dagen zonder besluit: geen margekaart, geen stop-keuzes, oplopende druk op 75%-norm. 90 dagen: verbreding trekt managementaandacht en capaciteit weg uit de GGZ-kern. 365 dagen: afhankelijkheid van verzekeraarstarieven en plafonds blijft dominant en consolidatie faalt.

### 5. GOVERNANCE IMPACT
Governance-impact: formele centralisatie van intake en planning is al aanwezig, maar maandelijkse individuele sturing ontbreekt grotendeels en volledige financiële openheid wordt nog vermeden; daardoor blijft uitvoeringsdiscipline kwetsbaar.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Macht zit informeel op productiegesprekken, roostering en normering. Wanneer het gesprek over productie als onaangenaam wordt ervaren, verschuift sturing van expliciete besluitvorming naar impliciete vertraging.

### 7. EXECUTIERISICO
Grootste executierisico: parallelle agenda's zonder harde stoplijst, gecombineerd met beperkt individueel sturingsritme en vertraagde escalatie.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: CEO en CFO stoppen conflicterende initiatieven en leggen eigenaar + KPI vast. Week 3-6: COO herverdeelt capaciteit, mandaat en budget naar de gekozen lijn; escalaties sluiten binnen 48 uur. Week 7-12: CHRO en COO sturen op meetbaar effect en sluiten blokkades binnen zeven dagen.

### 9. BESLUITKADER
De Raad van Bestuur committeert zich aan:
- Keuze: eerst consolidatie van GGZ-kern, daarna gefaseerde verbreding.
- KPI: kostprijskaart volledig, maandritme geborgd, contractgrenzen vastgelegd binnen 90 dagen.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Geaccepteerd verlies: mandaatverlies en stopzetting van niet-prioritaire initiatieven.

Contextsignaal: ${re(e||t||"")||"niet beschikbaar"}.`}function cE(e){let t=String(e??""),n="";for(;t!==n;)n=t,t=t.replace(/€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,(i,r,a,o)=>`€${r}${a}${o}`);return t=t.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g,"€$1$2$3"),t=t.replace(/€\s*([0-9][0-9.,]*)\s+([0-9]{1,3})(\b|(?=\D))/g,"€$1$2"),t=t.replace(/€\s+([0-9])/g,"€$1"),t}function dn(e){return cE(String(e??"")).replace(/€\s*([0-9]{1,3}(?:\.[0-9]{3})*)\s+([0-9]{3})\b/g,"€$1$2").replace(/€\s*([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{3})\b/g,"€$1$2").replace(/€\s*([0-9]{1,3})\.\s*([0-9]{3})\b/g,"€$1.$2").replace(/€\s*([0-9]{1,3}),\s*([0-9]{3})\b/g,"€$1,$2").trim()}function lE(e){return yn(Ir(["### 1. DOMINANTE BESTUURLIJKE THESE",re(e.dominantThesis),"","### 2. HET KERNCONFLICT",re(e.coreConflict),"","### 3. KEERZIJDE VAN DE KEUZE",re(e.tradeoffs),"","### 4. PRIJS VAN UITSTEL",re(e.opportunityCost),"","### 5. MANDAAT EN BESLUITRECHT",re(e.governanceImpact),"","### 6. MACHTSDYNAMIEK & ONDERSTROOM",re(e.powerDynamics),"","### 7. EXECUTIERISICO",re(e.executionRisk),"","### 8. 90-DAGEN INTERVENTIEPLAN",re(e.interventionPlan90D),"","### 9. BESLUITKADER",re(e.decisionContract)].join(`
`)))}function dE(e){return[["1. Dominante These",e.dominantThesis],["2. Structurele Kernspanning",e.coreConflict],["3. Keerzijde van de keuze",e.tradeoffs],["4. De Prijs van Uitstel",e.opportunityCost],["5. Mandaat & Besluitrecht",e.governanceImpact],["6. Onderstroom & Informele Macht",e.powerDynamics],["7. Faalmechanisme",e.executionRisk],["8. 90-Dagen Interventieontwerp",e.interventionPlan90D],["9. Besluitkader",e.decisionContract]].map(([n,i])=>`${n}

${re(i).trim()}`).join(`

`)}function uE(e){return String(e??"").replace(/^\s*(?:###\s*)?[1-9]\.\s+[^\n]+$/gim,"").replace(/\n{3,}/g,`

`).trim()}function To(e){const n=[{number:1,title:"Dominante These",text:e.dominantThesis,fallback:"Dominante these wordt vastgesteld op basis van beschikbare context."},{number:2,title:"Structurele Kernspanning",text:e.coreConflict,fallback:"Structurele kernspanning wordt geconcretiseerd in bestuurlijke keuze."},{number:3,title:"Keerzijde van de keuze",text:e.tradeoffs,fallback:"Keerzijde van de keuze wordt expliciet gemaakt inclusief verlies."},{number:4,title:"De Prijs van Uitstel",text:e.opportunityCost,fallback:"Prijs van uitstel wordt op 30/90/365 dagen zichtbaar gemaakt."},{number:5,title:"Mandaat & Besluitrecht",text:e.governanceImpact,fallback:"Mandaat en besluitrecht worden helder toegewezen."},{number:6,title:"Onderstroom & Informele Macht",text:e.powerDynamics,fallback:"Onderstroom en informele macht worden bestuurlijk adresseerbaar gemaakt."},{number:7,title:"Faalmechanisme",text:e.executionRisk,fallback:"Faalmechanisme wordt expliciet gemaakt met corrigeerbaar patroon."},{number:8,title:"90-Dagen Interventieontwerp",text:e.interventionPlan90D,fallback:"90-dagen interventieontwerp bevat eigenaar, deadline en KPI."},{number:9,title:"Besluitkader",text:e.decisionContract,fallback:"Besluitkader borgt keuze, verlies en handhaafbare discipline."}].map(({number:i,title:r,text:a,fallback:o})=>{const s=uE(re(a)),c=qe(s||o,r);return`${i}. ${r}

${c||o}`});return dn(ft(n.join(`

`).trim()))}function No(e){const t=p=>String(p??"").replace(/\b(veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk)(?!\s+per maand)\b/gi,"$1 per maand").trim(),n=t(e.de_keuze_vandaag),i=e.drie_opties.map(p=>`${p.name}: ${t(p.description)}
Risico: ${t(p.risk)}`).join(`

`),r=e.stop_doing.map((p,I)=>`${I+1}. ${p}`).join(`
`),a=e.gates.map(p=>`Dag ${p.day}
Criteria:
${p.criteria.map((I,T)=>`${T+1}. ${I}`).join(`
`)}
Gevolg bij missen: ${p.consequence_if_failed}`).join(`

`),o=e.financieel_bewijsblok,s=e.handtekeningdiscipline.wie_tekent.join(", "),c=["### 1. De Keuze Vandaag",n,"Dominante druk: €202.000 structurele druk per jaar in combinatie met 75% productiviteitsnorm maakt parallelle verbreding bestuurlijk onhoudbaar.","","### 2. Drie Opties",i,"","### 3. Voorkeursoptie",e.voorkeursoptie,"","### 4. Keerzijde van de keuze",e.expliciet_verlies,"","### 5. Stoplijst",r,"","### 6. 30 / 60 / 90 Meetpunten",a,"","### 7. Mandaatverschuiving",e.mandaatverschuiving,"","### 8. Financiële Onderbouwing (compact)",`${o.average_cost_per_client}
${o.adhd_loss_component}
${o.insurer_cap_per_year}
${o.wage_cost_growth}
${o.tariff_change_2026}
${o.structural_pressure_example}
Liquiditeitsruimte: ${o.cash_runway}
Margebandbreedte kernproducten: ${o.margin_bandwidth_core_products}
Effect 7% tariefdaling (12m): ${o.tariff_drop_impact_12m}
Impact contractplafonds op volume: ${o.contract_cap_volume_impact}
Status: ${o.status??"Onbekend"}`,"","### 9. Handtekeningdiscipline",`Wie tekent: ${s}
Overtreding: ${e.handtekeningdiscipline.overtreding_consequentie}`].join(`
`),l=Ir(Cs(c,"Besluitdocument Raad van Bestuur")).replace(/\bBeslismoment GGZ:\s*/gi,"").replace(/\bOnvoldoende Financieel Inzicht\b/gi,"Actie vereist binnen 14 dagen").replace(/\bstaat in de bron;?\s*/gi,"").replace(/\bverifieer\b/gi,"onderbouw").replace(/\bterwijl\./gi,"terwijl").replace(/\n{3,}/g,`

`).trim(),u=/(Deborah|Jan|Barbara)/i.test(l)?l:`${l}

Naamankers: Deborah (besluitdiscipline), Jan (strategische koers), Barbara (uitvoeringsritme).`,g=dn(u),m=dn(yn(g));try{rn(m)}catch(p){Le(`decision_memo_integrity_warning:${String(p?.message??p)}`,"[decision_memo_integrity_warning]",String(p?.message??p))}if($s){const p=fb(m);_s(`board_output_metrics:${JSON.stringify(p)}`,"[board_output_metrics]",p)}return m}function gE(e){const t=e.gates.map(n=>{const i=n.criteria.map((r,a)=>`${a+1}. ${r}`).join(`
`);return`Dag ${n.day}
Criteria:
${i}
Gevolg bij missen: ${n.consequence_if_failed}`}).join(`

`);return{dominantThesis:e.de_keuze_vandaag,coreConflict:e.drie_opties.map(n=>`${n.name}: ${n.risk}`).join(`
`),tradeoffs:e.drie_opties.map(n=>`${n.name}: ${n.description}`).join(`
`),governanceImpact:e.mandaatverschuiving,powerDynamics:e.stop_doing.map((n,i)=>`${i+1}. ${n}`).join(`
`),opportunityCost:e.gates.map(n=>`Dag ${n.day}: ${n.consequence_if_failed}`).join(`
`),executionRisk:e.gates.map(n=>`Dag ${n.day} criteria: ${n.criteria.join(" | ")}`).join(`
`),interventionPlan90D:t,decisionContract:`Voorkeursoptie: ${e.voorkeursoptie}
Expliciet verlies: ${e.expliciet_verlies}
Handtekeningen: ${e.handtekeningdiscipline.wie_tekent.join(", ")}`}}function ei(e,t){try{return Br(e,t)}catch{const n=Rr("Geen expliciete context aangeleverd.",e);return Br(n,t)}}function mE(e){const t=e?.execution_layer??xs,n=(t["90_day_priorities"]??[]).map((a,o)=>`${o+1}. ${a}`).join(`
`),i=(t.measurable_outcomes??[]).map((a,o)=>`${o+1}. ${a}`).join(`
`),r=(t.owner_map??[]).map((a,o)=>`${o+1}. ${a}`).join(`
`);return`Aanvullende executiesturing:
Risiconiveau: ${t.risk_level??"MEDIUM"}.
Prioriteiten: ${n||"niet gevuld"}.
Meetbare outcomes: ${i||"niet gevuld"}.
Eigenaarschap: ${r||"niet gevuld"}.`}function pE(e){const t=e?.metrics??js;return`Kernmetrieken:
Intensiteit van machtsfrictie (0-100): ${ln(t.conflict_intensity_score_0_100,0)}
Integriteit van besluitstructuur (0-100): ${ln(t.governance_integrity_score_0_100,0)}
Besluitkrachtindex (0-100): ${ln(t.decision_strength_index_0_100,0)}
Executierisiconiveau: ${t.execution_risk_level??"MEDIUM"}
Besluitzekerheid (0-1): ${(Number(t.decision_certainty_0_1)||0).toFixed(2)}`}function bE(e,t){return[e.trim(),mE(t),pE(t)].join(`

`)}function hE(e,t){const n=e.sections.decision_contract!=null?"decision_contract":e.sections.het_besluit_dat_nu_nodig_is!=null?"het_besluit_dat_nu_nodig_is":"",i=n?e.sections[n]:void 0;if(!i)return e;const r=t?.metrics??js,a=t?.execution_layer??xs,o=["","Bestuurlijke Metrieken",`Intensiteit van machtsfrictie (0-100): ${ln(r.conflict_intensity_score_0_100,0)}`,`Integriteit van besluitstructuur (0-100): ${ln(r.governance_integrity_score_0_100,0)}`,`Besluitkrachtindex (0-100): ${ln(r.decision_strength_index_0_100,0)}`,`Executierisiconiveau: ${r.execution_risk_level??"MEDIUM"}`,`Besluitzekerheid (0-1): ${(Number(r.decision_certainty_0_1)||0).toFixed(2)}`,"","Executie en 90-dagen sturing",`Risiconiveau: ${a.risk_level??"MEDIUM"}`,`Prioriteiten: ${(a["90_day_priorities"]??[]).join(" | ")}`,`Meetbare uitkomsten: ${(a.measurable_outcomes??[]).join(" | ")}`,`Eigenaarschap: ${(a.owner_map??[]).join(" | ")}`].join(`
`),s=`${Tr(i.content)}

${o}`.trim();return{...e,sections:{...e.sections,[n]:{...i,content:s}}}}function lt(e,t){for(const n of t){const i=e[n];if(!i)continue;const r=Tr(i.content).trim();if(r)return r}return""}function dt(e){return re(e).replace(/\n{3,}/g,`

`).trim()}function EE(e,t){const n=e.sections??{},i=t?.dominantThesis||lt(n,["bestuurlijke_these","dominante_bestuurlijke_these"]),r=t?.coreConflict||lt(n,["het_kernconflict","kernconflict"]),a=t?.tradeoffs||lt(n,["expliciete_tradeoffs","tradeoffs"]),o=t?.opportunityCost||lt(n,["opportunity_cost","wat_er_gebeurt_als_er_niets_verandert"]),s=t?.governanceImpact||lt(n,["governance_impact"]),c=t?.powerDynamics||lt(n,["machtsdynamiek__onderstroom","machtsdynamiek_onderstroom"]),l=t?.executionRisk||lt(n,["executierisico"]),u=t?.interventionPlan90D||lt(n,["90dagen_interventieplan","90_dagen_actieplan"]),g=t?.decisionContract||lt(n,["decision_contract","het_besluit_dat_nu_nodig_is"]);return{dominante_bestuurlijke_these:{title:"1. Dominante These",content:dt(i)},kernconflict:{title:"2. Structurele Kernspanning",content:dt(r)},expliciete_tradeoffs:{title:"3. Keerzijde van de keuze",content:dt(a)},opportunity_cost:{title:"4. De Prijs van Uitstel",content:dt(o)},governance_impact:{title:"5. Mandaat & Besluitrecht",content:dt(s)},machtsdynamiek_onderstroom:{title:"6. Onderstroom & Informele Macht",content:dt(c)},executierisico:{title:"7. Faalmechanisme",content:dt(l)},interventieplan_90dagen:{title:"8. 90-Dagen Interventieontwerp",content:dt(u)},decision_contract:{title:"9. Besluitkader",content:dt(g)}}}const Ro=(e,t,n)=>({title:e.title,executive_summary:e.executive_summary,sections:EE(e,t),interventions:e?.interventions,hgbco:e?.hgbco,raw_markdown:re(n?.rawMarkdownOverride??e.raw_markdown??"")});function fE(){const e=Bs(),t=e.slug??e.type??"strategy",n=t?.replace(/-/g,"_"),i=n&&zr[n]||zr.strategy,r=i.analysisType||"strategy",a=_e(f=>f.runId),o=_e(f=>f.status),s=_e(f=>f.progress),c=_e(f=>f.result),[l,u]=O.useState(""),[g,m]=O.useState([]),[p,I]=O.useState(null),[T,b]=O.useState(null),[h,d]=O.useState(null),[x,N]=O.useState(null),[j,$]=O.useState(null),[q,le]=O.useState(!1),[U,y]=O.useState([]),[X,_]=O.useState(null),[de,H]=O.useState(!1),[ie,z]=O.useState(0),[ve,Ie]=O.useTransition(),[te,K]=O.useState(""),[B,Ee]=O.useState(""),[ne,se]=O.useState(!1),[je,fe]=O.useState(null),[R,pe]=O.useState({q1:"",q2:"",q3:"",q4:"",q5:""}),V=O.useId(),ce=O.useRef(null),Se=O.useRef(null),Ge=O.useRef(null),be=O.useRef(null),Ve=O.useRef(null),It=O.useRef(0),Tt=o==="running"||de||ve,P=x,hn=O.useMemo(()=>Qh(P),[P]),Fe=!!(P&&P.includes(cr)),Nt=String(i.subtitle??"").replace(/\bmoet\b/gi,"kiest"),F=O.useMemo(()=>{const f=T??(p?Wi({report:p.raw_markdown,power:h,safeContext:["[SOURCE_FREE_FIELD]",l.trim()||[`Organisatie: ${te?.trim()||"Onbekende organisatie"}.`,`Sector: ${B||"onbekend"}.`,"Bestuurlijke opdracht: maak een scherpe keuze tussen versnellen en stabiliseren met expliciete keerzijde van de keuze, bestuurlijke impact en 90-dagen interventie."].join(" "),"[SOURCE_UPLOAD]",g.length?g.map(S=>`Bestand ${S.name}`).join(`
`):"Geen uploads aangeleverd."].join(`

`)}):null);return f?Fi(f):null},[te,l,T,g,h,p,B]),Oe=O.useMemo(()=>F?dE(F):p?.raw_markdown?.trim()||"",[F,p]),nt=O.useMemo(()=>Oe.trim()?{report:re(F?.dominantThesis||p?.executive_summary||p?.title||"Bestuurlijke these beschikbaar in context.")}:null,[Oe,F,p]),Re=O.useMemo(()=>{if(!nt)return{document:"",error:null};const f=()=>{if(F)return To(F);const S=re(Oe);return S.trim()?dn(ft(yn(S))):""};try{const S=F?To(F):"",G=S?null:Sh(nt,Oe),Y=S||re(G?.strategic_narrative??""),Q=yn(Y);let W=dn(S?ft(Q):oE(Q));const ae=en(G?.strategic_narrative??"")||en(Y)||en(W);try{rn(W)}catch{const me=dn(ft(yn(St(W,{fullDocument:!0}))));try{rn(me)}catch(v){const M=v instanceof Error?v.message:String(v);Le(`runtime_integrity_warning:${M}`,"[runtime_integrity_warning]",M),Le(`integrity_soft_fail_runtime:${M}`,"[integrity_soft_fail_runtime]",M),Le(`signature_fallback_integrity_warning:canonicalRender:${M}`,"[signature_fallback_integrity_warning]",{stage:"canonicalRender",reason:M})}W=me}return{document:W,error:null}}catch(S){const G=S instanceof Error?S.message:String(S),Y=f();Le(`runtime_integrity_warning:${G}`,"[runtime_integrity_warning]",G),Le(`integrity_soft_fail_runtime:${G}`,"[integrity_soft_fail_runtime]",G);const Q=/Canonieke documentintegriteit faalt:/i.test(G);return{document:Y,error:Q?null:G}}},[nt,Oe,F]),xe=Re.document,ye=O.useMemo(()=>Object.values(F??{}).some(f=>rE(f)),[F]);O.useEffect(()=>{if(!(Re.error&&(H(!1),Le(`runtime_integrity_warning:${Re.error}`,"[runtime_integrity_warning]",Re.error),Le(`integrity_soft_fail_runtime:${Re.error}`,"[integrity_soft_fail_runtime]",Re.error),$(Re.error),!xe))&&xe)try{rn(xe),$s&&_s(`canonical_length:${xe.length}`,"CANONICAL LENGTH:",xe.length),$(null)}catch(f){const S=f instanceof Error?f.message:String(f);Le(`runtime_integrity_warning:${S}`,"[runtime_integrity_warning]",S),Le(`integrity_soft_fail_runtime:${S}`,"[integrity_soft_fail_runtime]",S),(Fe||q||ye)&&Le(`signature_fallback_integrity_warning:runtime_checks:${S}`,"[signature_fallback_integrity_warning]",{stage:"runtime_checks",reason:S}),$(S)}},[xe,Re.error,ye,Fe,q]);const Ce=O.useMemo(()=>F?xb({dominante_these:qe(F.dominantThesis,"Dominante These"),structurele_kernspanning:qe(F.coreConflict,"Structurele Kernspanning"),onvermijdelijke_keuzes:qe(F.tradeoffs,"Keerzijde van de keuze"),prijs_van_uitstel:qe(F.opportunityCost,"De Prijs van Uitstel"),mandaat_besluitrecht:qe(F.governanceImpact,"Mandaat & Besluitrecht"),onderstroom_informele_macht:qe(F.powerDynamics,"Onderstroom & Informele Macht"),faalmechanisme:qe(F.executionRisk,"Faalmechanisme"),interventieplan_90_dagen:qe(F.interventionPlan90D,"90-Dagen Interventieontwerp"),decision_contract:qe(F.decisionContract,"Besluitkader")}):null,[F]),Rt=O.useMemo(()=>Ce?fo(No(Ce.decision_layer)):0,[Ce]),En=!!(q||ye||P&&Fe),At=O.useMemo(()=>{const f=[...U];return P&&Fe&&f.unshift(`Runtime.signature_violation: ${P}`),Array.from(new Set(f))},[Fe,P,U]),mt=!!(p||F),Ot=mt,it=O.useCallback(()=>{be.current==null||typeof window>"u"||(window.clearTimeout(be.current),be.current=null)},[]),Ct=O.useCallback(()=>{if(it(),typeof window>"u"){z(Ze),console.log(`Flow advanced to stage ${Ze} after fallback`);return}be.current=window.setTimeout(()=>{z(Ze),console.log(`Flow advanced to stage ${Ze} after fallback`),be.current=null},Jh)},[it]);O.useEffect(()=>{Se.current=p},[p]),O.useEffect(()=>{Ge.current=T},[T]),O.useEffect(()=>{F&&(q||ye)&&(H(!1),Ct())},[ye,F,Ct,q]),O.useEffect(()=>()=>it(),[it]);const Bn=f=>new Promise((S,G)=>{const Y=new FileReader;Y.onload=()=>S(Y.result),Y.onerror=()=>G(new Error("File read failed")),Y.readAsDataURL(f)}),he=O.useCallback(f=>{const S=Array.from(f.target.files??[]);S.length&&(m(G=>qh(G,S)),f.target.value="")},[]),fn=O.useCallback(()=>{const f=ce.current;if(f){if(typeof f.showPicker=="function")try{f.showPicker();return}catch{}f.click()}},[]),Vt=O.useCallback(()=>{m([]),ce.current&&(ce.current.value="")},[]),bi=O.useCallback(f=>{const S=xn(f);m(G=>G.filter(Y=>xn(Y)!==S))},[]),wt=O.useCallback(async(f,S,G)=>{if(z(3),!f?.report)throw new Error("Geen analyse-output ontvangen");f?.linguistic_signals&&fe(f.linguistic_signals);const Y=Wi({report:f.report,power:null,safeContext:S.sourceContext}),Q=f.report&&typeof f.report=="object"?{...gn(f.report),...Y}:Y;z(4);const W=typeof f.report=="string"?f.report:ko(Q),ae=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2,10)}`;let me=!1,v=Rr(S.safeContext,W);z(5);try{const ke=await Zm({analysis_id:ae,company_name:S.clientName||"Onbenoemde organisatie",questions:{q1:R.q1,q2:R.q2,q3:R.q3,q4:R.q4,q5:R.q5},documents:S.documents,company_context:[W,S.sourceContext,S.sectorLayer].filter(Boolean).join(`

`),meta:{sector_selected:S.sectorSelected}},{minWords:Mh,maxWords:Ph});typeof ke?.text=="string"&&ke.text.trim()&&(v=ke.text.trim())}catch(ke){ke instanceof Error&&ke.message===Uh&&Le("signature_violation_fallback_narrative","Signature violation bypassed → fallback narrative used",{stage:"generateBoardroomNarrative",analysisType:S.analysisType})}v=_o(v,[S.sourceContext,S.sectorLayer].filter(Boolean).join(`

`)),en(v)&&(me=!0);const M=ei(v,S.analysisType);z(6);const ue=await Gh({analysisType:S.analysisType,rawText:[S.sourceContext,W,v,ko(M)].filter(Boolean).join(`

`),userContext:{client_name:S.clientName||"Onbenoemde organisatie"}}),Me=bE(v,ue),k=fo(Me)>po?sE(Me,po):Me,C=ei(k,S.analysisType);z(7);const w=Fi(Wi({report:Q,power:ue,safeContext:S.sourceContext})),oe=Object.values(w).some(ke=>en(ke)),$e=[];me&&$e.push("Narrative.signature_warning_detected");for(const[ke,Te]of Object.entries(w))en(Te)&&$e.push(`${Yh[ke]}: signature_warning_detected`);const We=me||oe,rt=hE(C,ue),hi=typeof ue.metrics?.decision_certainty_0_1=="number"?ue.metrics.decision_certainty_0_1*10:0,Mn=String(ue.execution_layer?.risk_level||"ACTIEF").toUpperCase(),Pn=`/portal/analyse/${n||"strategy"}`,Un=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`report-${Date.now()}`,Ei=Wh(w,Q,k);`${i.title}${S.clientName||"Organisatie"}`,Ei.split(/\n(?=\d+\.\s+)/).map(ke=>ke.trim()).filter(Boolean),new Date().toISOString();const Cr={kind:"final",routeSlug:S.routeSlug,report:rt,executiveReport:w,powerOutput:ue,linguisticSignals:f?.linguistic_signals??null,signatureFallbackWarning:me||oe,signatureFallbackReasons:$e,clientName:S.clientName,sectorSelected:S.sectorSelected,context:S.context};Ie(()=>{I(rt),d(ue),b(w),le(me||oe),y($e)}),_e.getState().completeRun(Cr),Ve.current=G,H(!1),We?Ct():z(Ze),(async()=>{const ke=await Promise.race([tc(`org:${S.sectorSelected||"unknown"}:board-evaluation`),new Promise(fi=>{window.setTimeout(()=>fi(null),1500)})]).catch(()=>null),Te=ke?.baliScore??0;bp({id:Un,analysisId:ae,title:`${i.title} · ${S.clientName||"Organisatie"}`,date:new Date().toISOString(),baliScore:Te,betrouwbaarheid:Number(hi.toFixed(2)),interventionStatus:Mn,pdfUrl:`/api/reports/pdf?analysisId=${encodeURIComponent(ae)}`,analysisRoute:Pn}).catch(()=>{}),ec({baliScore:Te,classification:ke?.classification??"Kwetsbaar",spread:ke?.spread??{min:Te,max:Te},reliabilityBand:ke?.reliabilityBand??{low:Math.max(0,Te-.4),high:Math.min(10,Te+.4)},analysisId:ae,organisationId:S.sectorSelected||void 0,createdAt:new Date().toISOString()}).catch(()=>{})})()},[i.title,Ct,R.q1,R.q2,R.q3,R.q4,R.q5,n,Ie]);O.useEffect(()=>{const f=c;o==="completed"&&f?.kind==="final"&&f.routeSlug===t&&(I(f.report),b(f.executiveReport?Fi(f.executiveReport):null),d(f.powerOutput),fe(f.linguisticSignals),le(f.signatureFallbackWarning),y(f.signatureFallbackReasons),K(f.clientName),Ee(f.sectorSelected),u(f.context),z(Ze))},[c,o,t]),O.useEffect(()=>{const f=c,S=f?.kind==="pending"&&f.routeSlug===t;if(!a||o!=="running"||!S)return;const G=setInterval(async()=>{try{const Y=await fetch(`/api/analyses/${encodeURIComponent(a)}`);if(!Y.ok)return;const Q=await Y.json(),W=Q&&typeof Q=="object"&&Q.analysis&&typeof Q.analysis=="object"?Q.analysis:null;if(!W)return;if(String(W.status||"").toLowerCase()==="running"){_e.getState().setProgress(55);return}if(String(W.status||"").toLowerCase()==="failed"){_e.getState().failRun(),N(String(W.error_message||"Analyse mislukt")),H(!1);return}const ae=bo(W);if(String(W.status||"").toLowerCase()==="done"&&ae){const me=_e.getState(),v=me.result;if(Ve.current===a||!v||v.kind!=="pending"||v.routeSlug!==t)return;H(!0),me.setProgress(65),await wt(ae,v,a)}}catch{}},2e3);return()=>clearInterval(G)},[c,o,wt,t,a]);const Ar=async()=>{if(!Tt){if(!B){N("Selecteer eerst een sector.");return}it(),N(null),le(!1),y([]),_(null),H(!0),z(1);try{const f=await Promise.all((g??[]).map(async(oe,$e)=>({id:`${$e}-${oe.name}`,filename:oe.name,content:await Bn(oe)}))),S=l.trim()||[`Organisatie: ${te?.trim()||"Onbekende organisatie"}.`,`Sector: ${B||"onbekend"}.`,"Bestuurlijke opdracht: maak een scherpe keuze tussen versnellen en stabiliseren met expliciete keerzijde van de keuze, bestuurlijke impact en 90-dagen interventie."].join(" "),G=await iE(f),Y=["[SOURCE_FREE_FIELD]",S,"[SOURCE_UPLOAD]",G].join(`

`),Q=bn([S,G,te].filter(Boolean).join(`
`)).slice(0,5),W=await np(B),ae=W?[`[SECTOR-LAYER | bron: extern | datum: ${new Date().toISOString().slice(0,10)}]`,...W.signals.slice(0,3).map(oe=>`- ${oe}`),`Sector Risk Index: ${W.sectorRiskIndex}`,`Regulator Pressure Index: ${W.regulatorPressureIndex}`,`Contract Power Score: ${W.contractPowerScore}`,`Arbeidsmarktdruk-index: ${W.arbeidsmarktdrukIndex}`,`Relevantie voor deze casus: ${(Q.length?Q:["Niet onderbouwd in geüploade documenten of vrije tekst."]).join(", ")}`].join(`
`):"",me=[Y,ae].filter(Boolean).join(`

`);z(2);const v={kind:"pending",routeSlug:t,analysisType:r,clientName:te,sectorSelected:B,context:l,sourceContext:Y,sectorLayer:ae,safeContext:S,documents:f},M=await fetch("/api/analyses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({organization:te||"Organisatie",description:me,context:{analysis_type:r,analysisContext:{sector_selected:B},source_context:Y,sector_layer:ae,documents:f.map(oe=>({id:oe.id,name:oe.name,mimeType:oe.mimeType}))},runImmediately:!0})});if(!M.ok){const oe=await M.text();throw new Error(`Analysejob starten mislukt: ${oe}`)}const ue=await M.json(),Me=ue&&typeof ue=="object"&&ue.analysis&&typeof ue.analysis=="object"?ue.analysis:null,k=String(Me?.id||(typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`run-${Date.now()}-${Math.random().toString(36).slice(2,10)}`)),C=_e.getState();C.startRun(k),C.setResult(v),C.setProgress(25),z(3);const w=bo(Me);if(String(Me?.status||"").toLowerCase()==="done"&&w){C.setProgress(65),await wt(w,v,k);return}}catch(f){_e.getState().failRun(),N(f instanceof Error?f.message:"Analyse mislukt"),Se.current||Ge.current?z(Ze):z(0),H(!1)}}},Or=async()=>{const f=Date.now();if(f-It.current<500)return;if(It.current=f,ne){console.info("[pdf_start_skip_single_flight]");return}const S=p??(F?ei(lE(F),r):null);if(!S){console.info("[pdf_start_skip_no_report]");return}se(!0),_(null),z(8),console.info("[pdf_start]",{analysisType:r,hasExecutiveReport:!!F});const G=Ro(S,F),Y=G.sections??{},Q=Object.entries(Y).map(([M,ue])=>({key:M,text:Tr(ue?.content).trim()})),W=Q.filter(M=>M.text.length>0),ae=Q.filter(M=>M.text.length===0).map(M=>M.key),me=typeof G.raw_markdown=="string"?String(G.raw_markdown):W.map(M=>M.text).join(`

`),v=me.trim().length;if(Ym({title:G.title,narrative:me,sections:Y,sectionKeys:Q.map(M=>M.key)}),W.length===0||v<200){const M={narrativeLength:v,sectionsCount:W.length,emptySectionKeys:ae};console.error("PDF pre-flight assert failed",M),_(`PDF pre-flight mislukt. narrativeLength=${v}, sectionsCount=${W.length}, emptySectionKeys=${ae.join(", ")||"none"}.`),z(mt?Ze:0),console.info("[pdf_end]",{status:"preflight_failed",...M});return}try{const M=Ji(()=>import("./generateAureliusPDF-eW9HMrX3.js"),__vite__mapDeps([6,7,1,8])),ue=new Promise((k,C)=>setTimeout(()=>C(new Error("PDF generatie timeout")),2e4));(await Promise.race([M,ue])).generateAureliusPDF(S.title||"Aurelius Analyse",G,te||"Onbekende organisatie",{confidence:.82}),z(Ze),console.info("[pdf_end]",{status:"success"})}catch(M){_(M instanceof Error?M.message:"PDF generatie mislukt."),console.info("[pdf_end]",{status:"error",error:M instanceof Error?M.message:"unknown"})}finally{se(!1)}},jt=async()=>{if(!Ce)return;if(Rt>900){_(`Besluitdocument Raad van Bestuur overschrijdt limiet: ${Rt} woorden (max 900).`);return}const f=Date.now();if(!(f-It.current<500)&&(It.current=f,!ne)){se(!0),_(null),z(8);try{const S=ft(No(Ce.decision_layer));rn(S);const G=ei(S,r),Y=gE(Ce.decision_layer),Q=Ro(G,Y,{rawMarkdownOverride:S}),W=Ji(()=>import("./generateAureliusPDF-eW9HMrX3.js"),__vite__mapDeps([6,7,1,8])),ae=new Promise((v,M)=>setTimeout(()=>M(new Error("PDF generatie timeout")),2e4));(await Promise.race([W,ae])).generateAureliusPDF(`${i.title} — Besluitdocument Raad van Bestuur`,Q,te||"Onbekende organisatie",{confidence:.82}),z(Ze)}catch(S){_(S instanceof Error?S.message:"PDF-generatie van het besluitdocument is mislukt.")}finally{se(!1)}}},Gn=()=>{it(),u(""),m([]),I(null),b(null),d(null),N(null),le(!1),y([]),_(null),H(!1),z(0),K(""),Ee(""),fe(null),pe({q1:"",q2:"",q3:"",q4:"",q5:""}),Ve.current=null,ce.current&&(ce.current.value="")},xt=()=>{_e.getState().reset(),Gn()};return O.useEffect(()=>{const f=_e.getState().result,S=o==="running"&&f?.kind==="pending"&&f.routeSlug===t,G=o==="completed"&&f?.kind==="final"&&f.routeSlug===t;!S&&!G&&Gn()},[t]),E.jsxs(rp,{title:i.title,subtitle:Nt,children:[E.jsx(Zs,{}),p&&E.jsx(ap,{risk:"MODERATE"}),o==="running"&&E.jsxs("div",{className:"mb-6 rounded-xl border border-[#d4af37]/40 bg-[#1a1408] p-4",children:[E.jsx("p",{className:"text-sm font-semibold text-[#f6dd93]",children:"Analyse draait op de achtergrond"}),E.jsx("div",{className:"mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10",children:E.jsx("div",{className:"h-full rounded-full bg-[#d4af37] transition-all duration-500",style:{width:`${Math.max(2,s)}%`}})}),E.jsxs("p",{className:"mt-2 text-xs text-cyntra-secondary",children:["Voortgang: ",Math.max(0,Math.round(s)),"%"]})]}),(o==="running"||de)&&E.jsxs("div",{className:"mb-8 flex items-center gap-2 text-cyntra-secondary font-semibold",children:[E.jsx(Ks,{className:"h-4 w-4 animate-spin"}),"Analyse wordt opgebouwd in lineaire bestuursflow..."]}),En&&E.jsx("div",{className:"mb-8 rounded-xl border border-amber-500/70 bg-amber-950/40 p-4 text-sm text-amber-100",children:E.jsxs("div",{className:"flex items-start gap-2",children:[E.jsx(Kn,{className:"mt-0.5 h-4 w-4 shrink-0"}),E.jsxs("div",{children:[E.jsx("div",{className:"font-semibold",children:"Signature Layer Waarschuwing"}),E.jsx("div",{className:"mt-1 text-amber-100/90",children:Hh}),At.length>0&&E.jsxs("div",{className:"mt-2 rounded-lg border border-amber-300/30 bg-black/30 px-3 py-2 text-xs text-amber-100/85",children:[E.jsx("div",{className:"font-semibold",children:"Debug triggers"}),E.jsx("div",{className:"mt-1 space-y-1",children:At.map(f=>E.jsxs("div",{children:["- ",f]},f))})]})]})]})}),j&&E.jsx("div",{className:"mb-8 rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 text-sm text-amber-100",children:E.jsxs("div",{className:"flex items-start gap-2",children:[E.jsx(Kn,{className:"mt-0.5 h-4 w-4 shrink-0"}),E.jsxs("span",{children:["Runtime-integriteitswaarschuwing: ",j]})]})}),P&&!Fe&&E.jsxs("div",{className:"mb-8 rounded-xl border border-red-500/60 bg-red-950/40 p-4 text-red-200",children:[E.jsxs("div",{className:"flex items-center gap-2 text-red-300",children:[E.jsx(Kn,{className:"h-4 w-4"}),E.jsx("span",{children:P})]}),hn.length>0&&E.jsxs("div",{className:"mt-2 text-xs text-red-100/90",children:[E.jsx("span",{className:"font-semibold",children:"Board-gate debug:"})," ",E.jsx("span",{className:"font-mono",children:hn.join(" | ")})]})]}),X&&E.jsx("div",{className:"mb-8 rounded-xl border border-red-500/60 bg-red-950/50 p-4 text-sm text-red-100",children:E.jsxs("div",{className:"flex items-start gap-2",children:[E.jsx(Kn,{className:"mt-0.5 h-4 w-4 shrink-0"}),E.jsx("span",{children:X})]})}),E.jsxs("div",{className:"mb-8 rounded-2xl border divider-cyntra bg-cyntra-surface p-4",children:[E.jsx("p",{className:"mb-3 text-xs uppercase tracking-[0.2em] text-cyntra-gold font-semibold",children:"Unified Lineaire Flow"}),E.jsx("div",{className:"grid gap-2 md:grid-cols-3",children:ys.map((f,S)=>{const G=S===ie,Y=S<ie;return E.jsxs("div",{className:`rounded-lg border px-3 py-2 text-xs ${G?"border-[#d4af37] text-[#f6dd93] bg-[#1a1408]":Y?"border-emerald-500/40 text-emerald-300 bg-emerald-950/30":"border-white/10 text-cyntra-secondary bg-cyntra-card"}`,children:[S+1,". ",f]},f)})})]}),E.jsx("div",{className:"mb-8",children:E.jsx(op,{label:Tt?"Analyse draait...":"Start Volledige Analyse",onClick:Ar,disabled:Tt})}),E.jsx("input",{id:V,ref:ce,type:"file",multiple:!0,className:"absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]",onChange:he}),E.jsxs("div",{className:"mb-6 rounded-2xl border divider-cyntra bg-cyntra-surface p-4",children:[E.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[E.jsxs("label",{htmlFor:V,onClick:fn,className:"flex items-center gap-3 border divider-cyntra bg-cyntra-card px-5 py-2.5 text-cyntra-primary font-semibold",children:[E.jsx(Vs,{className:"h-4 w-4"}),"Documenten uploaden"]}),E.jsxs("span",{className:"text-sm text-cyntra-secondary",children:[g.length," document",g.length===1?"":"en"," geselecteerd (20+ ondersteund, geen harde limiet)"]}),g.length>0&&E.jsx("button",{type:"button",onClick:Vt,className:"text-xs uppercase tracking-[0.12em] text-cyntra-gold font-semibold",children:"Wis selectie"})]}),E.jsx("div",{className:"mt-4 space-y-2",children:(g??[]).map((f,S)=>E.jsxs("div",{className:"flex items-center justify-between gap-3 text-cyntra-secondary font-semibold",children:[E.jsxs("div",{className:"flex min-w-0 items-center gap-2",children:[E.jsx(Fs,{className:"h-4 w-4 shrink-0"}),E.jsx("span",{className:"truncate",children:f.name})]}),E.jsx("button",{type:"button",onClick:()=>bi(f),className:"text-xs uppercase tracking-[0.12em] text-cyntra-gold",children:"Verwijder"})]},`${xn(f)}:${S}`))})]}),mt?E.jsxs(E.Fragment,{children:[E.jsxs("div",{className:"mb-10 flex gap-6",children:[E.jsx("button",{onClick:xt,className:"text-cyntra-secondary font-semibold",children:"Nieuwe analyse"}),E.jsxs("button",{onClick:Or,disabled:!Ot||ne,className:`flex items-center gap-2 ${Ot?"text-cyntra-gold font-bold":"text-cyntra-secondary"}`,children:[E.jsx($r,{className:"h-4 w-4"}),ne?"PDF wordt gemaakt...":"PDF Download"]}),E.jsxs("button",{onClick:jt,disabled:!Ce||ne,className:`flex items-center gap-2 ${Ce?"text-cyntra-gold font-bold":"text-cyntra-secondary"}`,children:[E.jsx($r,{className:"h-4 w-4"}),ne?"Besluitdocument wordt gemaakt...":"Download Besluitdocument Raad van Bestuur"]})]}),!En&&(q||ye)&&E.jsx("div",{className:"mb-6 rounded-xl border border-amber-500/70 bg-amber-950/35 p-4 text-sm text-amber-100",children:"Fallbackrapport actief in Control Surface. Download gereed."}),E.jsx("div",{className:"analysis-container print-report-section rounded-2xl border divider-cyntra bg-cyntra-surface p-8 shadow-sm",children:E.jsx("pre",{className:"whitespace-pre-wrap break-words text-cyntra-primary leading-relaxed",children:xe})})]}):E.jsxs(E.Fragment,{children:[E.jsx("input",{value:te,onChange:f=>K(f.target.value),placeholder:"Naam organisatie",className:"cyntra-input mb-6"}),E.jsxs("div",{className:"mb-6",children:[E.jsx("label",{className:"mb-2 block text-xs uppercase tracking-[0.15em] text-cyntra-secondary font-semibold",children:"Sector"}),E.jsxs("select",{value:B,onChange:f=>Ee(f.target.value),className:"cyntra-input",children:[E.jsx("option",{value:"",children:"Selecteer sector"}),ip.map(f=>E.jsx("option",{value:f.value,children:f.label},f.value))]})]}),E.jsx("textarea",{value:l,onChange:f=>u(f.target.value),className:"cyntra-input mb-6",rows:6,placeholder:"Vrije context"})]})]})}const CE=Object.freeze(Object.defineProperty({__proto__:null,default:fE},Symbol.toStringTag,{value:"Module"}));export{zr as A,Zs as B,Uo as S,CE as U,Ji as _,Cs as a,TE as b,ac as c,rn as d,NE as e,OE as f,tc as g,ec as h,dd as i,bd as j,hd as k,fd as l,Sd as m,Xu as n,nh as o,AE as p,Tg as q,St as r,pi as s,Zm as t,Sh as u,RE as v,SE as w};
