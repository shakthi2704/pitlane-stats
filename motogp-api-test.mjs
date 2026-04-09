// /**
//  * MotoGP PulseLive API — Exploration Script
//  * Run: node motogp-api-test.mjs
//  *
//  * This tests the unofficial MotoGP API and tells us:
//  * - What seasons are available
//  * - What categories exist (MotoGP / Moto2 / Moto3)
//  * - How many events/races per season
//  * - What rider data looks like
//  * - Whether standings data is complete
//  */

// const BASE = "https://api.motogp.pulselive.com/motogp/v1";

// async function get(path) {
//   const url = `${BASE}${path}`;
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText} → ${url}`);
//   return res.json();
// }

// function line(char = "─", len = 60) {
//   console.log(char.repeat(len));
// }

// // ─── 1. Seasons ──────────────────────────────────────────────────────────────
// async function testSeasons() {
//   line("═");
//   console.log("1. AVAILABLE SEASONS");
//   line("═");

//   const seasons = await get("/results/seasons");
//   console.log(`Total seasons: ${seasons.length}`);
//   console.log("\nAll seasons (newest first):");

//   const sorted = [...seasons].sort((a, b) => b.year - a.year);
//   sorted.forEach((s) => {
//     console.log(`  ${s.year}  id: ${s.id}  current: ${s.current ?? false}`);
//   });

//   // Return the 2025 and a few historical seasons for further testing
//   const s2025 = sorted.find((s) => s.year === 2025);
//   const s2024 = sorted.find((s) => s.year === 2024);
//   const s2019 = sorted.find((s) => s.year === 2019);
//   const s2000 = sorted.find((s) => s.year === 2000);
//   const s1990 = sorted.find((s) => s.year === 1990);

//   console.log("\nKey seasons found:");
//   [s2025, s2024, s2019, s2000, s1990].filter(Boolean).forEach((s) => {
//     console.log(`  ${s.year}: ${s.id}`);
//   });

//   return { seasons: sorted, s2025, s2024 };
// }

// // ─── 2. Categories ───────────────────────────────────────────────────────────
// async function testCategories(seasonId, year) {
//   line("─");
//   console.log(`\n2. CATEGORIES for ${year}`);
//   line("─");

//   const cats = await get(`/results/categories?seasonUuid=${seasonId}`);
//   cats.forEach((c) => {
//     console.log(`  ${c.name.padEnd(12)} id: ${c.id}  legacy_id: ${c.legacy_id}`);
//   });

//   const motogp = cats.find(
//     (c) => c.legacy_id === 3 || c.name.toLowerCase().includes("motogp")
//   );
//   return { categories: cats, motogp };
// }

// // ─── 3. Events / Race Calendar ───────────────────────────────────────────────
// async function testEvents(seasonId, categoryId, year) {
//   line("─");
//   console.log(`\n3. RACE CALENDAR for MotoGP ${year}`);
//   line("─");

//   const events = await get(
//     `/results/events?seasonUuid=${seasonId}&categoryUuid=${categoryId}&isFinished=false`
//   );
//   console.log(`Total events: ${events.length}`);
//   events.forEach((e) => {
//     const status = e.status || "?";
//     console.log(
//       `  Rd${String(e.number ?? "?").padStart(2, "0")}  ${e.date_end?.substring(0, 10) ?? "?"}  ${e.name?.substring(0, 35).padEnd(35)}  ${status}`
//     );
//   });

//   return events;
// }

// // ─── 4. Standings ────────────────────────────────────────────────────────────
// async function testStandings(seasonId, categoryId, year) {
//   line("─");
//   console.log(`\n4. RIDER STANDINGS for MotoGP ${year} (top 10)`);
//   line("─");

//   try {
//     const data = await get(
//       `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}`
//     );
//     const riders = data.classification ?? data;
//     console.log(`Total riders in standings: ${riders.length}`);
//     riders.slice(0, 10).forEach((r) => {
//       const name = r.rider?.full_name ?? "Unknown";
//       const team = r.team?.name ?? "?";
//       const pts = r.points ?? 0;
//       console.log(
//         `  P${String(r.position).padStart(2)} ${name.padEnd(22)} ${String(pts).padStart(6)} pts  ${team}`
//       );
//     });
//     return riders;
//   } catch (e) {
//     console.log(`  ⚠ Standings error: ${e.message}`);
//     return [];
//   }
// }

// // ─── 5. Single Event Sessions ────────────────────────────────────────────────
// async function testSessions(eventId, categoryId, eventName) {
//   line("─");
//   console.log(`\n5. SESSIONS for "${eventName}"`);
//   line("─");

//   try {
//     const sessions = await get(
//       `/results/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`
//     );
//     console.log(`Total sessions: ${sessions.length}`);
//     sessions.forEach((s) => {
//       console.log(
//         `  ${s.type?.padEnd(5) ?? "?????"}  ${s.date?.substring(0, 10) ?? "?"}  id: ${s.id}`
//       );
//     });
//     return sessions;
//   } catch (e) {
//     console.log(`  ⚠ Sessions error: ${e.message}`);
//     return [];
//   }
// }

// // ─── 6. Race Classification (results) ────────────────────────────────────────
// async function testClassification(sessionId, label) {
//   line("─");
//   console.log(`\n6. RACE CLASSIFICATION: ${label} (top 10)`);
//   line("─");

//   try {
//     const data = await get(`/results/session?sessionUuid=${sessionId}`);
//     const results = data.classification ?? [];
//     console.log(`Total classified: ${results.length}`);
//     results.slice(0, 10).forEach((r) => {
//       const name = r.rider?.full_name ?? "?";
//       const constructor = r.constructor?.name ?? "?";
//       const time = r.time ?? r.gap_first ?? "?";
//       console.log(
//         `  P${String(r.position).padStart(2)} ${name.padEnd(22)} ${constructor.padEnd(10)} ${time}`
//       );
//     });

//     // Log the raw shape of one result so we know all fields
//     if (results[0]) {
//       console.log("\n  Raw fields on result[0]:");
//       console.log("  " + Object.keys(results[0]).join(", "));
//     }
//     return results;
//   } catch (e) {
//     console.log(`  ⚠ Classification error: ${e.message}`);
//     return [];
//   }
// }

// // ─── 7. Rider Profile ────────────────────────────────────────────────────────
// async function testRiderProfile(ridersApiUuid, riderName) {
//   line("─");
//   console.log(`\n7. RIDER PROFILE: ${riderName}`);
//   line("─");

//   try {
//     const data = await get(`/riders/${ridersApiUuid}`);
//     console.log("  Fields available:");
//     Object.entries(data).forEach(([k, v]) => {
//       if (typeof v !== "object") {
//         console.log(`    ${k.padEnd(25)} ${v}`);
//       } else {
//         console.log(`    ${k.padEnd(25)} [object]`);
//       }
//     });
//     return data;
//   } catch (e) {
//     console.log(`  ⚠ Rider profile error: ${e.message}`);
//     return null;
//   }
// }

// // ─── 8. Historical data check ─────────────────────────────────────────────────
// async function testHistoricalDepth(seasons) {
//   line("─");
//   console.log("\n8. HISTORICAL DATA DEPTH CHECK");
//   line("─");
//   console.log("Testing if results exist for older seasons...\n");

//   const testYears = [2025, 2020, 2015, 2010, 2005, 2000, 1995, 1990];

//   for (const year of testYears) {
//     const season = seasons.find((s) => s.year === year);
//     if (!season) {
//       console.log(`  ${year}: ✗ Season not in API`);
//       continue;
//     }
//     try {
//       const cats = await get(`/results/categories?seasonUuid=${season.id}`);
//       const motogp = cats.find(
//         (c) => c.legacy_id === 3 || c.name.toLowerCase().includes("motogp") || c.legacy_id === 1
//       );
//       if (!motogp) {
//         console.log(`  ${year}: ✓ Season exists, no MotoGP category (${cats.map(c=>c.name).join(", ")})`);
//         continue;
//       }
//       const events = await get(
//         `/results/events?seasonUuid=${season.id}&categoryUuid=${motogp.id}&isFinished=false`
//       );
//       console.log(`  ${year}: ✓ ${events.length} events  [category: ${motogp.name}]`);
//     } catch (e) {
//       console.log(`  ${year}: ✗ Error — ${e.message}`);
//     }
//   }
// }

// // ─── MAIN ────────────────────────────────────────────────────────────────────
// async function main() {
//   console.log("\n🏍  MotoGP PulseLive API — Data Exploration");
//   console.log("    Run this from your local machine (not in CI/sandbox)\n");

//   try {
//     // Step 1: seasons
//     const { seasons, s2025, s2024 } = await testSeasons();

//     if (!s2025) {
//       console.log("\n⚠ 2025 season not found — using first available season");
//     }

//     const targetSeason = s2025 ?? s2024 ?? seasons[0];
//     const targetYear = targetSeason.year;

//     // Step 2: categories
//     const { motogp } = await testCategories(targetSeason.id, targetYear);
//     if (!motogp) {
//       console.log("⚠ MotoGP category not found!");
//       return;
//     }

//     // Step 3: race calendar
//     const events = await testEvents(targetSeason.id, motogp.id, targetYear);

//     // Step 4: standings
//     await testStandings(targetSeason.id, motogp.id, targetYear);

//     // Step 5: sessions for the most recent finished event
//     const finishedEvents = events.filter(
//       (e) => e.status === "Finished" || e.finished === true
//     );
//     const lastEvent = finishedEvents[finishedEvents.length - 1] ?? events[0];

//     if (lastEvent) {
//       const sessions = await testSessions(lastEvent.id, motogp.id, lastEvent.name);

//       // Step 6: race classification from the RAC session
//       const raceSession = sessions.find(
//         (s) => s.type === "RAC" || s.type === "RACE"
//       );
//       if (raceSession) {
//         const results = await testClassification(
//           raceSession.id,
//           `${lastEvent.name} Race`
//         );

//         // Step 7: rider profile for the winner
//         if (results[0]?.rider?.riders_api_uuid) {
//           await testRiderProfile(
//             results[0].rider.riders_api_uuid,
//             results[0].rider.full_name
//           );
//         }
//       }
//     }

//     // Step 8: historical depth
//     await testHistoricalDepth(seasons);

//     line("═");
//     console.log("\n✅ API exploration complete!");
//     console.log(
//       "   Copy the season/category UUIDs above — we'll hardcode the important ones."
//     );
//     line("═");
//   } catch (err) {
//     console.error("\n❌ Fatal error:", err.message);
//     console.error(
//       "   Is the API still up? Try: curl https://api.motogp.pulselive.com/motogp/v1/results/seasons"
//     );
//   }
// }

// main();

// /**
//  * MotoGP PulseLive API — Exploration Script v2
//  * Fixed: removed isFinished=false filter
//  * Run: node motogp-api-test-v2.mjs
//  */

// const BASE = "https://api.motogp.pulselive.com/motogp/v1";

// async function get(path) {
//   const url = `${BASE}${path}`;
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText} → ${url}`);
//   return res.json();
// }

// function line(char = "─", len = 60) { console.log(char.repeat(len)); }

// // Known UUIDs from v1 run
// const SEASONS = {
//   2026: "e88b4e43-2209-47aa-8e83-0e0b1cedde6e",
//   2025: "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4",
//   2024: "dd12382e-1d9f-46ee-a5f7-c5104db28e43",
//   2023: "db8dc197-c7b2-4c1b-b3a4-6dc534c023ef",
//   2019: "cbc5dc8d-3aae-4327-bd88-d1cdeea9b654",
//   2015: "cbe871d8-d8fa-47cb-8b63-cabe0015223e",
//   2010: "d5bd3042-f4dc-4fdc-897a-e284d07592e6",
//   2000: "ef1e2970-0ff9-4933-95ac-404845820462",
//   1990: "79ccac73-5093-489c-9d37-e77a005723f9",
// };

// // Category UUIDs appear STABLE across seasons (same legacy_id=3 for MotoGP)
// const CAT_MOTOGP = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";
// const CAT_MOTO2  = "549640b8-fd9c-4245-acfd-60e4bc38b25c";
// const CAT_MOTO3  = "954f7e65-2ef2-4423-b949-4961cc603e45";

// // ─── 1. Race Calendar (no filter) ────────────────────────────────────────────
// async function testCalendar(seasonId, year, categoryId = CAT_MOTOGP) {
//   line("═");
//   console.log(`CALENDAR: MotoGP ${year} — no filter`);
//   line("═");
//   const events = await get(`/results/events?seasonUuid=${seasonId}&categoryUuid=${categoryId}`);
//   console.log(`Total events: ${events.length}`);
//   events.forEach(e => {
//     const finished = e.status ?? (e.test ? "TEST" : "?");
//     console.log(`  Rd${String(e.number??'?').padStart(2,'0')}  ${(e.date_end??'').substring(0,10).padEnd(12)}  ${(e.name??'?').substring(0,35).padEnd(36)} status:${finished}`);
//   });
//   return events;
// }

// // ─── 2. Sessions for an event ────────────────────────────────────────────────
// async function testSessions(eventId, categoryId, eventName) {
//   line("─");
//   console.log(`SESSIONS: "${eventName}"`);
//   line("─");
//   try {
//     const sessions = await get(`/results/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`);
//     console.log(`Total sessions: ${sessions.length}`);
//     sessions.forEach(s => {
//       console.log(`  ${(s.type??'?').padEnd(6)}  ${(s.date??'').substring(0,16).padEnd(18)}  id:${s.id}`);
//     });
//     return sessions;
//   } catch(e) {
//     console.log(`  ⚠ ${e.message}`);
//     return [];
//   }
// }

// // ─── 3. Race Classification ───────────────────────────────────────────────────
// async function testClassification(sessionId, label) {
//   line("─");
//   console.log(`RACE RESULTS: ${label}`);
//   line("─");
//   try {
//     const data = await get(`/results/session?sessionUuid=${sessionId}`);
//     const results = data.classification ?? [];
//     console.log(`Classified: ${results.length} riders`);

//     if (results[0]) {
//       console.log("\n  All fields on result[0]:");
//       console.log("  " + Object.keys(results[0]).join(", "));
//       console.log("\n  Top 5:");
//     }

//     results.slice(0, 5).forEach(r => {
//       const name = r.rider?.full_name ?? "?";
//       const team = r.team?.name ?? "?";
//       const cons = r.constructor?.name ?? "?";
//       console.log(`  P${String(r.position).padStart(2)}  ${name.padEnd(22)}  ${cons.padEnd(10)}  ${team.substring(0,30)}`);
//     });
//     return results;
//   } catch(e) {
//     console.log(`  ⚠ ${e.message}`);
//     return [];
//   }
// }

// // ─── 4. Rider Profile ────────────────────────────────────────────────────────
// async function testRiderProfile(ridersApiUuid, name) {
//   line("─");
//   console.log(`RIDER PROFILE: ${name}  uuid:${ridersApiUuid}`);
//   line("─");
//   try {
//     const data = await get(`/riders/${ridersApiUuid}`);
//     console.log("  All top-level fields:");
//     Object.entries(data).forEach(([k, v]) => {
//       if (typeof v !== "object" || v === null) {
//         console.log(`    ${k.padEnd(28)} ${v}`);
//       } else {
//         console.log(`    ${k.padEnd(28)} { ${Object.keys(v).join(", ")} }`);
//       }
//     });
//     return data;
//   } catch(e) {
//     console.log(`  ⚠ ${e.message}`);
//     return null;
//   }
// }

// // ─── 5. Constructor Standings ─────────────────────────────────────────────────
// async function testConstructorStandings(seasonId, categoryId, year) {
//   line("─");
//   console.log(`CONSTRUCTOR STANDINGS: ${year}`);
//   line("─");
//   try {
//     // Try different endpoint patterns
//     const urls = [
//       `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}&type=constructor`,
//       `/results/constructorstandings?seasonUuid=${seasonId}&categoryUuid=${categoryId}`,
//     ];
//     for (const path of urls) {
//       try {
//         const data = await get(path);
//         const list = data.classification ?? data;
//         if (Array.isArray(list) && list.length > 0) {
//           console.log(`  Endpoint: ${path}`);
//           list.slice(0, 5).forEach(c => {
//             const name = c.constructor?.name ?? c.team?.name ?? c.name ?? "?";
//             console.log(`  P${String(c.position).padStart(2)}  ${name.padEnd(25)}  ${c.points} pts`);
//           });
//           return list;
//         }
//       } catch(_) {}
//     }
//     console.log("  ⚠ No constructor standings endpoint found");
//   } catch(e) {
//     console.log(`  ⚠ ${e.message}`);
//   }
//   return [];
// }

// // ─── 6. Team Standings ────────────────────────────────────────────────────────
// async function testTeamStandings(seasonId, categoryId, year) {
//   line("─");
//   console.log(`TEAM STANDINGS: ${year}`);
//   line("─");
//   try {
//     const urls = [
//       `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}&type=team`,
//       `/results/teamstandings?seasonUuid=${seasonId}&categoryUuid=${categoryId}`,
//     ];
//     for (const path of urls) {
//       try {
//         const data = await get(path);
//         const list = data.classification ?? data;
//         if (Array.isArray(list) && list.length > 0) {
//           console.log(`  Endpoint: ${path}`);
//           list.slice(0, 5).forEach(t => {
//             const name = t.team?.name ?? t.name ?? "?";
//             console.log(`  P${String(t.position).padStart(2)}  ${name.padEnd(35)}  ${t.points} pts`);
//           });
//           return list;
//         }
//       } catch(_) {}
//     }
//     console.log("  ⚠ No team standings endpoint found");
//   } catch(e) {
//     console.log(`  ⚠ ${e.message}`);
//   }
//   return [];
// }

// // ─── 7. Historical event count ────────────────────────────────────────────────
// async function testHistoricalEvents() {
//   line("═");
//   console.log("HISTORICAL EVENT COUNT (no filter)");
//   line("═");
//   const testYears = [2025, 2024, 2023, 2019, 2015, 2010, 2005, 2000, 1995, 1990];
//   for (const year of testYears) {
//     const sid = SEASONS[year];
//     if (!sid) { console.log(`  ${year}: no UUID stored`); continue; }
//     try {
//       // Get correct category for year (500cc before 2002)
//       const cats = await get(`/results/categories?seasonUuid=${sid}`);
//       const cat = cats.find(c => c.legacy_id === 3) ?? cats.find(c => c.legacy_id === 1) ?? cats[0];
//       const events = await get(`/results/events?seasonUuid=${sid}&categoryUuid=${cat.id}`);
//       const finished = events.filter(e => e.status === "Finished" || e.finished).length;
//       console.log(`  ${year}: ${events.length} total events, ${finished} finished  [class: ${cat.name}]`);
//     } catch(e) {
//       console.log(`  ${year}: ✗ ${e.message}`);
//     }
//   }
// }

// // ─── 8. Check circuit data ────────────────────────────────────────────────────
// async function testCircuits(eventId, eventName) {
//   line("─");
//   console.log(`CIRCUIT DATA check on event: ${eventName}`);
//   line("─");
//   try {
//     const data = await get(`/results/events/${eventId}`);
//     console.log("  Event fields:", Object.keys(data).join(", "));
//     if (data.circuit) {
//       console.log("  Circuit fields:", Object.keys(data.circuit).join(", "));
//       Object.entries(data.circuit).forEach(([k,v]) => {
//         if (typeof v !== "object") console.log(`    circuit.${k.padEnd(20)} ${v}`);
//       });
//     }
//   } catch(e) {
//     // Try alternate
//     try {
//       const events = await get(`/results/events?seasonUuid=${SEASONS[2025]}&categoryUuid=${CAT_MOTOGP}`);
//       const ev = events.find(e => e.id === eventId) ?? events[0];
//       if (ev) {
//         console.log("  Event fields from list:", Object.keys(ev).join(", "));
//         if (ev.circuit) {
//           console.log("  Circuit fields:", Object.keys(ev.circuit).join(", "));
//           Object.entries(ev.circuit).forEach(([k,v]) => {
//             if (typeof v !== "object") console.log(`    circuit.${k.padEnd(20)} ${v}`);
//           });
//         }
//       }
//     } catch(e2) {
//       console.log(`  ⚠ ${e2.message}`);
//     }
//   }
// }

// // ─── MAIN ────────────────────────────────────────────────────────────────────
// async function main() {
//   console.log("\n🏍  MotoGP API — Deep Exploration v2\n");

//   // 1. 2025 calendar (no filter)
//   const events2025 = await testCalendar(SEASONS[2025], 2025);

//   // 2. Sessions for first finished event
//   const finished = events2025.filter(e => e.status === "Finished" || e.finished === true);
//   console.log(`\n  Finished events in 2025: ${finished.length}`);

//   if (finished.length > 0) {
//     const lastFinished = finished[finished.length - 1];
//     console.log(`  Testing with: ${lastFinished.name}`);

//     const sessions = await testSessions(lastFinished.id, CAT_MOTOGP, lastFinished.name);

//     // Race session
//     const raceSess = sessions.find(s => s.type === "RAC" || s.type === "RACE");
//     if (raceSess) {
//       const results = await testClassification(raceSess.id, `${lastFinished.name} Race`);

//       // Rider profile for winner
//       const winner = results[0];
//       if (winner?.rider?.riders_api_uuid) {
//         const profile = await testRiderProfile(winner.rider.riders_api_uuid, winner.rider.full_name);
//       }
//     }

//     // Circuit data
//     await testCircuits(lastFinished.id, lastFinished.name);
//   }

//   // 3. Constructor + Team standings
//   await testConstructorStandings(SEASONS[2025], CAT_MOTOGP, 2025);
//   await testTeamStandings(SEASONS[2025], CAT_MOTOGP, 2025);

//   // 4. Historical depth
//   await testHistoricalEvents();

//   // 5. Check if category UUIDs are same across seasons
//   line("═");
//   console.log("CATEGORY UUID STABILITY CHECK");
//   line("═");
//   for (const [year, sid] of [[2025, SEASONS[2025]], [2023, SEASONS[2023]], [2019, SEASONS[2019]], [2015, SEASONS[2015]]]) {
//     const cats = await get(`/results/categories?seasonUuid=${sid}`);
//     const mg = cats.find(c => c.legacy_id === 3);
//     if (mg) console.log(`  ${year}  MotoGP uuid: ${mg.id}  ← ${mg.id === CAT_MOTOGP ? "SAME ✓" : "DIFFERENT ⚠"}`);
//   }

//   line("═");
//   console.log("\n✅ Done!");
//   line("═");
// }

// main().catch(e => console.error("Fatal:", e.message));



/**
 * MotoGP PulseLive API — Exploration Script v3
 * Focus: session data, race results shape, rider profiles
 * Run: node motogp-api-test-v3.mjs
 */

const BASE = "https://api.motogp.pulselive.com/motogp/v1";
async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} → ${BASE}${path}`);
  return res.json();
}
function line(c = "─", n = 60) { console.log(c.repeat(n)); }
function dump(obj, indent = "  ") {
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (typeof v === "object") console.log(`${indent}${k.padEnd(28)} [object: ${Object.keys(v).join(", ")}]`);
    else console.log(`${indent}${k.padEnd(28)} ${v}`);
  });
}

const S2025    = "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4";
const CAT_MG   = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";
const CAT_M2   = "549640b8-fd9c-4245-acfd-60e4bc38b25c";
const CAT_M3   = "954f7e65-2ef2-4423-b949-4961cc603e45";

async function main() {
  console.log("\n🏍  MotoGP API v3 — Sessions, Results, Riders\n");

  // ── 1. Get events, fix status check ────────────────────────────────────────
  line("═"); console.log("1. 2025 EVENTS — status values");  line("═");
  const events = await get(`/results/events?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const races = events.filter(e => !e.test && !e.name?.toLowerCase().includes("test"));
  console.log(`Race events (non-test): ${races.length}`);
  console.log("Status values seen:", [...new Set(events.map(e => e.status))].join(", "));
  console.log("\nFirst event raw fields:");
  dump(events[0]);

  // Pick the most recent race event
  const sorted = [...races].sort((a,b) => new Date(b.date_end) - new Date(a.date_end));
  const latestRace = sorted[0];
  console.log(`\nUsing: ${latestRace.name} (${latestRace.date_end?.substring(0,10)})`);

  // ── 2. Sessions ─────────────────────────────────────────────────────────────
  line("═"); console.log("2. SESSIONS for latest race"); line("═");
  const sessions = await get(`/results/sessions?eventUuid=${latestRace.id}&categoryUuid=${CAT_MG}`);
  console.log(`Total sessions: ${sessions.length}`);
  sessions.forEach(s => {
    console.log(`  type:${(s.type??'?').padEnd(6)}  date:${(s.date??'').substring(0,16).padEnd(18)}  id:${s.id}`);
  });
  console.log("\nFirst session raw fields:");
  dump(sessions[0]);

  // ── 3. Race classification ───────────────────────────────────────────────────
  const raceSess = sessions.find(s => s.type === "RAC") ?? sessions.find(s => s.type === "RACE") ?? sessions[sessions.length-1];
  if (raceSess) {
    line("═"); console.log(`3. RACE CLASSIFICATION — ${raceSess.type}`); line("═");
    const data = await get(`/results/session?sessionUuid=${raceSess.id}`);
    const classification = data.classification ?? data;
    console.log(`Finishers: ${classification.length}`);

    if (classification[0]) {
      console.log("\nAll fields on classification[0]:");
      dump(classification[0]);
      if (classification[0].rider) {
        console.log("\n  rider fields:");
        dump(classification[0].rider, "    ");
      }
      if (classification[0].team) {
        console.log("\n  team fields:");
        dump(classification[0].team, "    ");
      }
      if (classification[0].constructor) {
        console.log("\n  constructor fields:");
        dump(classification[0].constructor, "    ");
      }
    }

    console.log("\nTop 5:");
    classification.slice(0,5).forEach(r => {
      console.log(`  P${String(r.position).padStart(2)}  ${(r.rider?.full_name??'?').padEnd(22)}  ${(r.constructor?.name??'?').padEnd(10)}  ${r.time??r.gap_first??'?'}`);
    });

    // ── 4. Sprint race session ─────────────────────────────────────────────────
    const sprintSess = sessions.find(s => s.type === "SPR");
    if (sprintSess) {
      line("─"); console.log("3b. SPRINT RACE exists — checking shape"); line("─");
      const sprintData = await get(`/results/session?sessionUuid=${sprintSess.id}`);
      const sc = sprintData.classification ?? sprintData;
      console.log(`Sprint finishers: ${sc.length}`);
      console.log("Sprint result fields:", Object.keys(sc[0]??{}).join(", "));
    } else {
      console.log("\n  (no sprint session for this event)");
    }

    // ── 5. Qualifying ─────────────────────────────────────────────────────────
    const qualiSess = sessions.find(s => s.type === "Q2" || s.type === "Q1" || s.type === "QP");
    if (qualiSess) {
      line("─"); console.log(`3c. QUALIFYING (${qualiSess.type}) shape`); line("─");
      const qData = await get(`/results/session?sessionUuid=${qualiSess.id}`);
      const qc = qData.classification ?? qData;
      console.log(`Quali entries: ${qc.length}`);
      if (qc[0]) {
        console.log("Quali result fields:", Object.keys(qc[0]).join(", "));
        console.log(`P1: ${qc[0].rider?.full_name}  time: ${qc[0].time ?? qc[0].best_lap_time ?? '?'}`);
      }
    }

    // ── 6. Rider profile ───────────────────────────────────────────────────────
    const winnerUuid = classification[0]?.rider?.riders_api_uuid;
    if (winnerUuid) {
      line("═"); console.log(`4. RIDER PROFILE — ${classification[0].rider.full_name}`); line("═");
      try {
        const rider = await get(`/riders/${winnerUuid}`);
        console.log("All rider profile fields:");
        dump(rider);
        // Check for photo URL
        const photoFields = Object.entries(rider).filter(([k,v]) => typeof v === 'string' && (v.includes('http') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('image') || k.toLowerCase().includes('picture')));
        if (photoFields.length) {
          console.log("\nPhoto/image URLs found:");
          photoFields.forEach(([k,v]) => console.log(`  ${k}: ${v}`));
        }
      } catch(e) {
        console.log(`  ⚠ ${e.message}`);
      }
    }
  }

  // ── 7. Constructor standings shape ───────────────────────────────────────────
  line("═"); console.log("5. CONSTRUCTOR STANDINGS — full shape"); line("═");
  const cStandings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}&type=constructor`);
  const cList = cStandings.classification ?? cStandings;
  console.log(`Constructors: ${cList.length}`);
  if (cList[0]) {
    console.log("Fields on constructor standing[0]:");
    dump(cList[0]);
  }
  cList.forEach(c => {
    console.log(`  P${String(c.position).padStart(2)}  ${(c.constructor?.name??c.name??'?').padEnd(20)}  ${c.points} pts`);
  });

  // ── 8. Team standings shape ──────────────────────────────────────────────────
  line("═"); console.log("6. TEAM STANDINGS — full shape"); line("═");
  const tStandings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}&type=team`);
  const tList = tStandings.classification ?? tStandings;
  console.log(`Teams: ${tList.length}`);
  if (tList[0]) {
    console.log("Fields on team standing[0]:");
    dump(tList[0]);
  }

  // ── 9. Circuit data from event ────────────────────────────────────────────────
  line("═"); console.log("7. CIRCUIT DATA"); line("═");
  // Try fetching event detail
  try {
    const evDetail = await get(`/results/events/${latestRace.id}?categoryUuid=${CAT_MG}`);
    console.log("Event detail fields:", Object.keys(evDetail).join(", "));
    if (evDetail.circuit) { console.log("Circuit fields:"); dump(evDetail.circuit); }
  } catch(e) {
    console.log(`Event detail endpoint: ⚠ ${e.message}`);
    // Circuit data is embedded in the event list
    console.log("Circuit data from event list:");
    if (latestRace.circuit) dump(latestRace.circuit);
    else console.log("  No .circuit field on event — fields:", Object.keys(latestRace).join(", "));
  }

  // ── 10. Check a 2023 event for sessions (confirm structure consistent) ────────
  line("═"); console.log("8. 2023 DATA CONSISTENCY CHECK"); line("═");
  const S2023 = "db8dc197-c7b2-4c1b-b3a4-6dc534c023ef";
  const events2023 = await get(`/results/events?seasonUuid=${S2023}&categoryUuid=${CAT_MG}`);
  const races2023 = events2023.filter(e => !e.test && !e.name?.toLowerCase().includes("test"));
  console.log(`2023 race events: ${races2023.length}`);
  const last2023 = [...races2023].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  if (last2023) {
    const sess2023 = await get(`/results/sessions?eventUuid=${last2023.id}&categoryUuid=${CAT_MG}`);
    console.log(`Sessions for ${last2023.name}: ${sess2023.length} — types: ${sess2023.map(s=>s.type).join(", ")}`);
    const hasSprint = sess2023.some(s => s.type === "SPR");
    console.log(`Sprint race in 2023: ${hasSprint ? "YES ✓" : "NO"}`);
  }

  // ── 11. Check 2015 (pre-sprint era) ──────────────────────────────────────────
  const S2015 = "cbe871d8-d8fa-47cb-8b63-cabe0015223e";
  const events2015 = await get(`/results/events?seasonUuid=${S2015}&categoryUuid=${CAT_MG}`);
  const races2015 = events2015.filter(e => !e.test && !e.name?.toLowerCase().includes("test"));
  console.log(`\n2015 race events: ${races2015.length}`);
  const last2015 = [...races2015].sort((a,b)=>new Date(b.date_end)-new Date(a.date_end))[0];
  if (last2015) {
    const sess2015 = await get(`/results/sessions?eventUuid=${last2015.id}&categoryUuid=${CAT_MG}`);
    console.log(`Sessions for ${last2015.name}: ${sess2015.length} — types: ${sess2015.map(s=>s.type).join(", ")}`);
  }

  line("═");
  console.log("\n✅ v3 complete!");
  line("═");
}

main().catch(e => console.error("Fatal:", e.message));