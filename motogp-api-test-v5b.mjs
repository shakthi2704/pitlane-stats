/**
 * MotoGP PulseLive API — v5b
 * Finish career stats + photo URLs + historical checks
 * Run: node motogp-api-test-v5b.mjs
 */

const BASE = "https://api.motogp.pulselive.com/motogp/v1";
async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} -> ${BASE}${path}`);
  return res.json();
}
async function tryGet(path) {
  try { return { ok: true, data: await get(path) }; }
  catch(e) { return { ok: false, error: e.message }; }
}
function line(c="─",n=60){console.log(c.repeat(n));}
function str(v){ return (v===null||v===undefined) ? "?" : (typeof v==="object" ? JSON.stringify(v).substring(0,60) : String(v).substring(0,80)); }
function dump(obj,indent="  "){
  if(!obj)return;
  Object.entries(obj).forEach(([k,v])=>{
    if(v===null||v===undefined)return;
    if(typeof v==="object")console.log(`${indent}${k.padEnd(28)} [object: ${Object.keys(v).join(", ")}]`);
    else console.log(`${indent}${k.padEnd(28)} ${String(v).substring(0,80)}`);
  });
}

const S2025  = "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4";
const S2015  = "cbe871d8-d8fa-47cb-8b63-cabe0015223e";
const S2010  = "d5bd3042-f4dc-4fdc-897a-e284d07592e6";
const CAT_MG = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";
const MARC_UUID = "23e50438-a657-4fb0-a190-3262b5472f29";

async function main() {
  console.log("\n🏍  MotoGP API v5b — Career + Photos + Historical\n");

  // ── 1. Career data full shape ─────────────────────────────────────────────
  line("═"); console.log("1. RIDER CAREER — Marc Marquez"); line("═");
  const rider = await get(`/riders/${MARC_UUID}`);
  const career = Array.isArray(rider.career) ? rider.career : Object.values(rider.career);
  console.log(`Career seasons: ${career.length}`);
  console.log("\ncareer[0] all fields (2026 current):");
  dump(career[0]);

  // Pictures object
  if (career[0]?.pictures) {
    console.log("\n  .pictures:");
    dump(career[0].pictures,"    ");
    // Go one deeper
    if (career[0].pictures.profile) {
      console.log("\n  .pictures.profile:");
      dump(career[0].pictures.profile,"    ");
    }
    if (career[0].pictures.portrait) {
      console.log("\n  .pictures.portrait:");
      dump(career[0].pictures.portrait,"    ");
    }
  }

  console.log("\n--- Career history (all seasons) ---");
  career.forEach(c => {
    const year = c.season ?? "?";
    const team = typeof c.team === "object" ? (c.team?.name ?? "?") : str(c.team);
    const cat  = typeof c.category === "object" ? (c.category?.name ?? "?") : str(c.category);
    console.log(`  ${year}  ${cat.padEnd(10)}  ${team}`);
  });

  // ── 2. Biography photo URL ────────────────────────────────────────────────
  line("═"); console.log("2. PHOTO URLs"); line("═");
  const bioMedia = rider.biography?.media;
  if (bioMedia?.picture) {
    console.log(`Biography picture: ${bioMedia.picture}`);
  }
  if (rider.famous_attributes?.picture) {
    console.log("\nfamous_attributes.picture:");
    dump(rider.famous_attributes.picture,"  ");
  }

  // ── 3. Second rider — Alex Marquez ───────────────────────────────────────
  line("═"); console.log("3. SECOND RIDER — Alex Marquez (check photo pattern)"); line("═");
  const standings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const riderList = standings.classification ?? standings;
  const r2entry = riderList[1];
  const r2uuid = r2entry?.rider?.riders_api_uuid;
  console.log(`Rider: ${r2entry?.rider?.full_name}  uuid: ${r2uuid}`);
  if (r2uuid) {
    const r2 = await get(`/riders/${r2uuid}`);
    const r2career = Array.isArray(r2.career) ? r2.career : Object.values(r2.career);
    const current = r2career.find(c=>c.current) ?? r2career[0];
    if (current?.pictures?.profile) {
      console.log("Profile picture:");
      dump(current.pictures.profile,"  ");
    }
    if (r2.biography?.media?.picture) {
      console.log(`Biography picture: ${r2.biography.media.picture}`);
    }
    if (r2.famous_attributes?.picture) {
      console.log("Famous picture:");
      dump(r2.famous_attributes.picture,"  ");
    }
  }

  // ── 4. Records shape from race ────────────────────────────────────────────
  line("═"); console.log("4. RACE RECORDS (fastest lap etc)"); line("═");
  const VAL2025_RAC = "4b23dc6a-e083-4771-9f39-b8d3c1042e28";
  const racData = await get(`/results/session/${VAL2025_RAC}/classification`);
  const records = racData.records ?? [];
  const recs = Array.isArray(records) ? records : Object.values(records);
  console.log(`Records count: ${recs.length}`);
  recs.forEach((rec,i) => {
    console.log(`\n  record[${i}]:`);
    dump(rec,"    ");
    if (rec.rider) { console.log("    .rider:"); dump(rec.rider,"      "); }
    if (rec.bestLap) { console.log("    .bestLap:"); dump(rec.bestLap,"      "); }
  });

  // ── 5. 2015 historical results ───────────────────────────────────────────
  line("═"); console.log("5. 2015 HISTORICAL RACE RESULTS"); line("═");
  const ev2015 = await get(`/results/events?seasonUuid=${S2015}&categoryUuid=${CAT_MG}`);
  const r2015 = ev2015.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const sorted2015 = [...r2015].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end));
  const last2015 = sorted2015[0];
  console.log(`Event: ${last2015.name}`);
  const s2015 = await get(`/results/sessions?eventUuid=${last2015.id}&categoryUuid=${CAT_MG}`);
  console.log(`Session types: ${s2015.map(s=>s.type).join(", ")}`);
  const rac2015 = s2015.find(s=>s.type==="RAC");
  if (rac2015) {
    const r = await tryGet(`/results/session/${rac2015.id}/classification`);
    if (r.ok) {
      const c = r.data.classification ?? [];
      console.log(`✓ Classified: ${c.length} riders`);
      console.log(`P1: ${c[0]?.rider?.full_name}  ${c[0]?.constructor?.name}  ${c[0]?.time}`);
      console.log("Fields:", Object.keys(c[0]??{}).join(", "));
    } else console.log(`✗ ${r.error}`);
  }

  // ── 6. 2010 historical results ───────────────────────────────────────────
  line("═"); console.log("6. 2010 HISTORICAL RACE RESULTS"); line("═");
  const ev2010 = await get(`/results/events?seasonUuid=${S2010}&categoryUuid=${CAT_MG}`);
  const r2010 = ev2010.filter(e=>!e.test&&!e.name?.toLowerCase().includes("test"));
  const last2010 = [...r2010].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  console.log(`Event: ${last2010.name}`);
  const s2010 = await get(`/results/sessions?eventUuid=${last2010.id}&categoryUuid=${CAT_MG}`);
  console.log(`Session types: ${s2010.map(s=>s.type).join(", ")}`);
  const rac2010 = s2010.find(s=>s.type==="RAC");
  if (rac2010) {
    const r = await tryGet(`/results/session/${rac2010.id}/classification`);
    if (r.ok) {
      const c = r.data.classification ?? [];
      console.log(`✓ Classified: ${c.length} riders`);
      console.log(`P1: ${c[0]?.rider?.full_name}  ${c[0]?.constructor?.name}  ${c[0]?.time}`);
    } else console.log(`✗ ${r.error}`);
  }

  // ── 7. Constructor standings shape ───────────────────────────────────────
  line("═"); console.log("7. CONSTRUCTOR STANDINGS — full shape"); line("═");
  const cSt = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}&type=constructor`);
  const cList = cSt.classification ?? cSt;
  console.log(`Constructors: ${cList.length}`);
  console.log("\ncList[0] fields:");
  dump(cList[0]);
  if (cList[0]?.constructor) { console.log("  .constructor:"); dump(cList[0].constructor,"    "); }
  console.log("\nAll constructors:");
  cList.forEach(c => console.log(`  P${String(c.position).padStart(2)}  ${(c.constructor?.name??'?').padEnd(15)}  ${c.points}pts  wins:${c.race_wins??'?'}`));

  // ── 8. Team standings shape ──────────────────────────────────────────────
  line("═"); console.log("8. TEAM STANDINGS — full shape"); line("═");
  const tSt = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}&type=team`);
  const tList = tSt.classification ?? tSt;
  console.log(`Teams: ${tList.length}`);
  console.log("\ntList[0] fields:");
  dump(tList[0]);
  if (tList[0]?.team) { console.log("  .team:"); dump(tList[0].team,"    "); }

  line("═"); console.log("\n✅ All data mapped — ready for schema design!"); line("═");
}

main().catch(e => console.error("Fatal:", e.message));