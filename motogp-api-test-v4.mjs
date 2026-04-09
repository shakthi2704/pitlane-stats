/**
 * MotoGP PulseLive API — v4
 * Focus: fix classification endpoint + rider profile
 * Run: node motogp-api-test-v4.mjs
 */

const BASE = "https://api.motogp.pulselive.com/motogp/v1";
async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} → ${BASE}${path}`);
  return res.json();
}
async function tryGet(path) {
  try { return await get(path); } catch(e) { return { _error: e.message }; }
}
function line(c="─",n=60){console.log(c.repeat(n));}
function dump(obj,indent="  "){
  if (!obj) return;
  Object.entries(obj).forEach(([k,v])=>{
    if(v===null||v===undefined)return;
    if(typeof v==="object")console.log(`${indent}${k.padEnd(28)} [object: ${Object.keys(v).join(", ")}]`);
    else console.log(`${indent}${k.padEnd(28)} ${v}`);
  });
}

const S2025  = "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4";
const S2024  = "dd12382e-1d9f-46ee-a5f7-c5104db28e43";
const S2023  = "db8dc197-c7b2-4c1b-b3a4-6dc534c023ef";
const S2015  = "cbe871d8-d8fa-47cb-8b63-cabe0015223e";
const CAT_MG = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";

// Known session IDs from v3
const VAL2025_RAC = "4b23dc6a-e083-4771-9f39-b8d3c1042e28";
const VAL2025_SPR = "0c50137e-7adf-4624-a66e-95be29140e03";
const VAL2025_Q2  = "b991ebc5-2cf4-4b72-ad5f-b2ce38710627";
const VAL2025_Q1  = "305526c5-2377-4ecd-a853-d2a13dd41eaa";
const VAL2025_FP  = "938a4b9d-b574-46c8-966a-8e40083537b2";

async function main() {
  console.log("\n🏍  MotoGP API v4 — Fix Classification + Rider Data\n");

  // ── 1. Try every classification endpoint pattern ──────────────────────────
  line("═"); console.log("1. CLASSIFICATION ENDPOINT PATTERNS"); line("═");

  const patterns = [
    `/results/session?sessionUuid=${VAL2025_RAC}`,
    `/results/session/${VAL2025_RAC}`,
    `/results/session/${VAL2025_RAC}/classification`,
    `/results/sessions/${VAL2025_RAC}`,
    `/results/sessions/${VAL2025_RAC}/classification`,
    `/results/classification?sessionUuid=${VAL2025_RAC}`,
    `/results/classifications?sessionUuid=${VAL2025_RAC}`,
  ];

  let workingResult = null;
  let workingPattern = null;

  for (const p of patterns) {
    const r = await tryGet(p);
    const isError = r._error;
    const count = Array.isArray(r) ? r.length : (r.classification?.length ?? "?");
    console.log(`  ${isError ? "✗" : "✓"} ${p}`);
    if (!isError) {
      console.log(`    → keys: ${Object.keys(r).join(", ")}`);
      if (!workingResult) { workingResult = r; workingPattern = p; }
    } else {
      console.log(`    → ${r._error}`);
    }
  }

  // ── 2. Try fetching the PDF classification URL ────────────────────────────
  line("─"); console.log("\n2. SESSION FILES — try classification PDF URL"); line("─");
  // From v3: session has session_files.classification
  // Let's get the session object first
  const sessData = await tryGet(`/results/sessions?eventUuid=b84b9bd0-3ef3-4367-90cb-2840350673ca&categoryUuid=${CAT_MG}`);
  // Use Valencia event ID from v3
  const VAL_EVENT = "b84b9bd0-3ef3-4367-90cb-2840350673ca"; // Thailand was first, let's get Valencia
  
  // Get Valencia event directly from season events
  const allEvents = await get(`/results/events?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const val = allEvents.find(e => e.short_name === "VAL" || e.name?.includes("VALENCIAN"));
  if (val) {
    console.log(`Found Valencia: ${val.name}  id: ${val.id}`);
    const valSessions = await get(`/results/sessions?eventUuid=${val.id}&categoryUuid=${CAT_MG}`);
    console.log(`Sessions: ${valSessions.map(s=>s.type).join(", ")}`);
    const raceSess = valSessions.find(s => s.type === "RAC");
    if (raceSess) {
      console.log(`\nRAC session id: ${raceSess.id}`);
      console.log("RAC session_files:");
      dump(raceSess.session_files, "  ");
      
      // Try fetching each pattern with the correct RAC id
      line("─"); console.log("\n3. RE-TEST with correct RAC id"); line("─");
      const racId = raceSess.id;
      const patterns2 = [
        `/results/session?sessionUuid=${racId}`,
        `/results/session/${racId}`,
        `/results/classifications?sessionUuid=${racId}`,
        `/results/classification?sessionUuid=${racId}`,
      ];
      for (const p of patterns2) {
        const r = await tryGet(p);
        const isErr = !!r._error;
        const count = Array.isArray(r) ? r.length : (r.classification?.length ?? "obj");
        console.log(`  ${isErr?"✗":"✓"} ${p}`);
        if (!isErr) {
          console.log(`    → keys: ${Object.keys(r).join(", ")}  count:${count}`);
          if (!workingResult) { workingResult = r; workingPattern = p; }
        } else console.log(`    → ${r._error}`);
      }
    }
  }

  // ── 3. Try 2023 season (different season ID) ──────────────────────────────
  line("═"); console.log("4. TRY 2023 RACE SESSION"); line("═");
  const events2023 = await get(`/results/events?seasonUuid=${S2023}&categoryUuid=${CAT_MG}`);
  const races2023 = events2023.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const last2023 = [...races2023].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  console.log(`Last 2023 event: ${last2023.name}`);
  const sess2023 = await get(`/results/sessions?eventUuid=${last2023.id}&categoryUuid=${CAT_MG}`);
  console.log(`Session types: ${sess2023.map(s=>s.type).join(", ")}`);
  const rac2023 = sess2023.find(s=>s.type==="RAC");
  if (rac2023) {
    console.log(`RAC id: ${rac2023.id}`);
    const r = await tryGet(`/results/session?sessionUuid=${rac2023.id}`);
    if (!r._error) {
      const cls = r.classification ?? r;
      console.log(`Classification count: ${Array.isArray(cls)?cls.length:'obj'}`);
      console.log("Keys:", Object.keys(r).join(", "));
      if (Array.isArray(cls) && cls[0]) {
        console.log("\nResult[0] fields:");
        dump(cls[0]);
        if (cls[0].rider) { console.log("  rider:"); dump(cls[0].rider,"    "); }
        if (cls[0].team) { console.log("  team:"); dump(cls[0].team,"    "); }
        if (cls[0].constructor) { console.log("  constructor:"); dump(cls[0].constructor,"    "); }
        console.log("\nTop 5:");
        cls.slice(0,5).forEach(r=>console.log(`  P${String(r.position).padStart(2)}  ${(r.rider?.full_name??'?').padEnd(22)}  ${r.constructor?.name??'?'}  ${r.time??r.gap_first??'?'}`));
      }
    } else console.log(`✗ ${r._error}`);
  }

  // ── 4. Rider standings to get rider UUIDs ────────────────────────────────
  line("═"); console.log("5. RIDER PROFILE via standings UUID"); line("═");
  const standings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const riders = standings.classification ?? standings;
  const topRider = riders[0];
  console.log(`Top rider: ${topRider.rider?.full_name}  riders_api_uuid: ${topRider.rider?.riders_api_uuid}`);

  if (topRider.rider?.riders_api_uuid) {
    const uuid = topRider.rider.riders_api_uuid;
    const rPatterns = [
      `/riders/${uuid}`,
      `/riders?uuid=${uuid}`,
      `/riders/profile/${uuid}`,
    ];
    for (const p of rPatterns) {
      const r = await tryGet(p);
      if (!r._error) {
        console.log(`\n✓ ${p}`);
        console.log("Rider fields:");
        dump(r);
        // Look for photo
        const entries = Object.entries(r);
        entries.forEach(([k,v])=>{
          if(typeof v==="string"&&(v.includes("http")||v.includes("photo")||v.includes("image")))
            console.log(`  📸 ${k}: ${v}`);
        });
        break;
      } else console.log(`✗ ${p} → ${r._error}`);
    }
  }

  // ── 5. Check rider standings shape fully ─────────────────────────────────
  line("═"); console.log("6. STANDINGS FULL SHAPE"); line("═");
  console.log("Fields on standings[0]:");
  dump(riders[0]);
  if (riders[0]?.rider) { console.log("\n  .rider:"); dump(riders[0].rider,"    "); }
  if (riders[0]?.team) { console.log("\n  .team:"); dump(riders[0].team,"    "); }
  if (riders[0]?.constructor) { console.log("\n  .constructor:"); dump(riders[0].constructor,"    "); }

  // ── 6. Historical session check 2015 ─────────────────────────────────────
  line("═"); console.log("7. 2015 SESSION TYPES (pre-sprint)"); line("═");
  const ev2015 = await get(`/results/events?seasonUuid=${S2015}&categoryUuid=${CAT_MG}`);
  const r2015 = ev2015.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const last2015 = [...r2015].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  console.log(`Event: ${last2015.name}`);
  const s2015 = await get(`/results/sessions?eventUuid=${last2015.id}&categoryUuid=${CAT_MG}`);
  console.log(`Session types: ${s2015.map(s=>s.type).join(", ")}`);
  const rac2015 = s2015.find(s=>s.type==="RAC");
  if (rac2015) {
    const rr = await tryGet(`/results/session?sessionUuid=${rac2015.id}`);
    if (!rr._error) {
      const cls = rr.classification??rr;
      console.log(`2015 classification: ${Array.isArray(cls)?cls.length:'?'} riders`);
      if(Array.isArray(cls)&&cls[0]) console.log("Fields:", Object.keys(cls[0]).join(", "));
    } else console.log(`✗ ${rr._error}`);
  }

  line("═"); console.log("\n✅ v4 complete!"); line("═");
}

main().catch(e => console.error("Fatal:", e.message));