/**
 * MotoGP PulseLive API — v5 FINAL
 * Working endpoint confirmed: /results/session/{id}/classification
 * Run: node motogp-api-test-v5.mjs
 */

const BASE = "https://api.motogp.pulselive.com/motogp/v1";
async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} → ${BASE}${path}`);
  return res.json();
}
async function tryGet(path) {
  try { return { ok: true, data: await get(path) }; }
  catch(e) { return { ok: false, error: e.message }; }
}
function line(c="─",n=60){console.log(c.repeat(n));}
function dump(obj,indent="  "){
  if(!obj)return;
  Object.entries(obj).forEach(([k,v])=>{
    if(v===null||v===undefined)return;
    if(typeof v==="object")console.log(`${indent}${k.padEnd(28)} [object: ${Object.keys(v).join(", ")}]`);
    else console.log(`${indent}${k.padEnd(28)} ${String(v).substring(0,80)}`);
  });
}

const S2025  = "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4";
const S2024  = "dd12382e-1d9f-46ee-a5f7-c5104db28e43";
const S2015  = "cbe871d8-d8fa-47cb-8b63-cabe0015223e";
const S2010  = "d5bd3042-f4dc-4fdc-897a-e284d07592e6";
const CAT_MG = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";

// Confirmed session IDs from v4
const VAL2025_RAC = "4b23dc6a-e083-4771-9f39-b8d3c1042e28";
const VAL2025_SPR = "0c50137e-7adf-4624-a66e-95be29140e03";
const VAL2025_Q2  = "b991ebc5-2cf4-4b72-ad5f-b2ce38710627";
const VAL2025_FP  = "938a4b9d-b574-46c8-966a-8e40083537b2";
const MARC_UUID   = "23e50438-a657-4fb0-a190-3262b5472f29";

async function getClassification(sessionId) {
  return get(`/results/session/${sessionId}/classification`);
}

async function main() {
  console.log("\n🏍  MotoGP API v5 — Final Data Mapping\n");

  // ── 1. Race classification full shape ─────────────────────────────────────
  line("═"); console.log("1. RACE CLASSIFICATION — full shape"); line("═");
  const racData = await getClassification(VAL2025_RAC);
  console.log("Top-level keys:", Object.keys(racData).join(", "));

  const cls = racData.classification ?? [];
  console.log(`\nFinishers: ${cls.length}`);

  if (cls[0]) {
    console.log("\n--- result[0] ALL FIELDS ---");
    dump(cls[0]);
    if (cls[0].rider)       { console.log("\n  .rider:");       dump(cls[0].rider,"    "); }
    if (cls[0].team)        { console.log("\n  .team:");        dump(cls[0].team,"    "); }
    if (cls[0].constructor) { console.log("\n  .constructor:"); dump(cls[0].constructor,"    "); }
  }

  console.log("\n--- Top 10 ---");
  cls.slice(0,10).forEach(r => {
    const name = r.rider?.full_name ?? "?";
    const cons = r.constructor?.name ?? "?";
    const team = r.team?.name ?? "?";
    console.log(`  P${String(r.position).padStart(2)}  ${name.padEnd(22)}  ${cons.padEnd(10)}  ${r.time??r.gap_first??'DNF'}  ${r.points??0}pts`);
  });

  // records/fastest lap
  if (racData.records) {
    console.log("\n--- records ---");
    dump(racData.records);
  }

  // ── 2. Sprint classification ──────────────────────────────────────────────
  line("═"); console.log("2. SPRINT CLASSIFICATION — shape diff vs RAC?"); line("═");
  const sprData = await getClassification(VAL2025_SPR);
  const sprCls = sprData.classification ?? [];
  console.log(`Sprint finishers: ${sprCls.length}`);
  if (sprCls[0]) {
    console.log("Sprint result[0] fields:");
    dump(sprCls[0]);
  }

  // ── 3. Qualifying classification ──────────────────────────────────────────
  line("═"); console.log("3. QUALIFYING CLASSIFICATION"); line("═");
  const qualiData = await getClassification(VAL2025_Q2);
  const qualiCls = qualiData.classification ?? [];
  console.log(`Quali entries: ${qualiCls.length}`);
  if (qualiCls[0]) {
    console.log("Quali result[0] fields:");
    dump(qualiCls[0]);
    console.log(`\nP1: ${qualiCls[0].rider?.full_name}  time: ${qualiCls[0].time ?? '?'}`);
  }

  // ── 4. FP classification ──────────────────────────────────────────────────
  line("═"); console.log("4. FREE PRACTICE CLASSIFICATION"); line("═");
  const fpData = await getClassification(VAL2025_FP);
  const fpCls = fpData.classification ?? [];
  console.log(`FP entries: ${fpCls.length}`);
  if (fpCls[0]) {
    console.log("FP result[0] fields (diff from race?):");
    const fpKeys = Object.keys(fpCls[0]);
    const racKeys = Object.keys(cls[0]??{});
    const onlyInFP = fpKeys.filter(k=>!racKeys.includes(k));
    const onlyInRAC = racKeys.filter(k=>!fpKeys.includes(k));
    console.log(`  FP-only fields:  ${onlyInFP.join(", ") || "none"}`);
    console.log(`  RAC-only fields: ${onlyInRAC.join(", ") || "none"}`);
  }

  // ── 5. Rider profile — deep dive ──────────────────────────────────────────
  line("═"); console.log("5. RIDER PROFILE — Marc Marquez deep dive"); line("═");
  const rider = await get(`/riders/${MARC_UUID}`);
  console.log("\nAll top-level fields:");
  dump(rider);

  // Biography
  if (rider.biography) {
    console.log("\n  .biography:");
    dump(rider.biography, "    ");
    if (rider.biography.media) {
      console.log("\n    .biography.media (photos?):");
      const media = rider.biography.media;
      if (Array.isArray(media)) {
        media.slice(0,3).forEach(m => { console.log("    ---"); dump(m,"      "); });
      } else dump(media,"      ");
    }
  }

  // Career
  if (rider.career) {
    console.log("\n  .career (array of season stats):");
    const career = Array.isArray(rider.career) ? rider.career : Object.values(rider.career);
    console.log(`  Total career seasons: ${career.length}`);
    if (career[0]) {
      console.log("  career[0] fields:");
      dump(career[0],"    ");
    }
    // Show recent seasons
    console.log("\n  Recent career (last 5):");
    career.slice(-5).forEach(c => {
      console.log(`    ${c.year??'?'}  ${(c.team??'?').substring(0,30).padEnd(32)}  pts:${c.points??'?'}  wins:${c.wins??'?'}  pos:${c.position??'?'}`);
    });
  }

  // Famous attributes / picture
  if (rider.famous_attributes) {
    console.log("\n  .famous_attributes:");
    dump(rider.famous_attributes,"    ");
    if (rider.famous_attributes.picture) {
      console.log("\n    .picture (photo URL?):");
      dump(rider.famous_attributes.picture,"      ");
    }
  }

  // Physical
  if (rider.physical_attributes) {
    console.log("\n  .physical_attributes:");
    dump(rider.physical_attributes,"    ");
  }

  // ── 6. Second rider for comparison ───────────────────────────────────────
  line("═"); console.log("6. SECOND RIDER PROFILE (to check photo URL pattern)"); line("═");
  const standings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const riderList = standings.classification ?? standings;
  const rider2uuid = riderList[1]?.rider?.riders_api_uuid;
  if (rider2uuid) {
    const r2 = await get(`/riders/${rider2uuid}`);
    console.log(`${r2.name} ${r2.surname}`);
    if (r2.famous_attributes?.picture) {
      console.log("Picture object:");
      dump(r2.famous_attributes.picture,"  ");
    }
    // Check biography media
    if (r2.biography?.media) {
      const media = r2.biography.media;
      console.log("Biography media:");
      if (Array.isArray(media)) media.slice(0,2).forEach(m=>dump(m,"  "));
      else dump(media,"  ");
    }
  }

  // ── 7. Historical race results — does 2015 work? ─────────────────────────
  line("═"); console.log("7. 2015 RACE RESULT — does it work?"); line("═");
  const ev2015 = await get(`/results/events?seasonUuid=${S2015}&categoryUuid=${CAT_MG}`);
  const r2015 = ev2015.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const last2015 = [...r2015].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  const s2015 = await get(`/results/sessions?eventUuid=${last2015.id}&categoryUuid=${CAT_MG}`);
  const rac2015 = s2015.find(s=>s.type==="RAC");
  if (rac2015) {
    const r = await tryGet(`/results/session/${rac2015.id}/classification`);
    if (r.ok) {
      const c = r.data.classification??[];
      console.log(`✓ 2015 ${last2015.name}: ${c.length} classified`);
      if (c[0]) {
        console.log("2015 result fields vs 2025:");
        const f2015 = Object.keys(c[0]);
        const f2025 = Object.keys(cls[0]??{});
        const diff = f2015.filter(k=>!f2025.includes(k));
        console.log(`  Only in 2015: ${diff.join(", ")||"none (same structure ✓)"}`);
        console.log(`  Only in 2025: ${f2025.filter(k=>!f2015.includes(k)).join(", ")||"none"}`);
        console.log(`P1: ${c[0].rider?.full_name}  constructor: ${c[0].constructor?.name}`);
      }
    } else console.log(`✗ 2015 classification: ${r.error}`);
  }

  // ── 8. 2010 check ────────────────────────────────────────────────────────
  line("═"); console.log("8. 2010 RACE RESULT — does it work?"); line("═");
  const ev2010 = await get(`/results/events?seasonUuid=${S2010}&categoryUuid=${CAT_MG}`);
  const r2010 = ev2010.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const last2010 = [...r2010].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  const s2010 = await get(`/results/sessions?eventUuid=${last2010.id}&categoryUuid=${CAT_MG}`);
  const rac2010 = s2010.find(s=>s.type==="RAC");
  if (rac2010) {
    const r = await tryGet(`/results/session/${rac2010.id}/classification`);
    if (r.ok) {
      const c = r.data.classification??[];
      console.log(`✓ 2010 ${last2010.name}: ${c.length} classified`);
      console.log(`P1: ${c[0]?.rider?.full_name}  constructor: ${c[0]?.constructor?.name}`);
    } else console.log(`✗ 2010 classification: ${r.error}`);
  }

  line("═"); console.log("\n✅ v5 complete — ready to design schema!"); line("═");
}

main().catch(e => console.error("Fatal:", e.message));