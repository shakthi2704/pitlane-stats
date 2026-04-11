/**
 * Get real rider photo URLs from MotoGP API
 * Run: node motogp-photo-urls.mjs
 */

const BASE = "https://api.motogp.pulselive.com/motogp/v1";
const S2025 = "ae6c6f0d-c652-44f8-94aa-420fc5b3dab4";
const CAT_MG = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} -> ${BASE}${path}`);
  return res.json();
}

async function main() {
  // Get top 3 riders from standings
  const standings = await get(`/results/standings?seasonUuid=${S2025}&categoryUuid=${CAT_MG}`);
  const top3 = (standings.classification ?? []).slice(0, 3);

  for (const entry of top3) {
    const uuid = entry.rider?.riders_api_uuid;
    if (!uuid) continue;

    console.log(`\n--- ${entry.rider.full_name} (${uuid}) ---`);

    const rider = await get(`/riders/${uuid}`);
    const career = Array.isArray(rider.career) ? rider.career : Object.values(rider.career);
    const current = career.find(c => c.current) ?? career[0];

    // Print ALL picture URLs
    if (current?.pictures) {
      console.log("pictures keys:", Object.keys(current.pictures));
      for (const [key, val] of Object.entries(current.pictures)) {
        if (val && typeof val === "object") {
          console.log(`  ${key}:`);
          for (const [k2, v2] of Object.entries(val)) {
            console.log(`    ${k2}: ${v2}`);
          }
        }
      }
    }

    // Biography picture
    if (rider.biography?.media?.picture) {
      console.log("biography picture:", rider.biography.media.picture);
    }

    // Famous attributes picture
    if (rider.famous_attributes?.picture) {
      console.log("famous picture:");
      console.log(JSON.stringify(rider.famous_attributes.picture, null, 2));
    }
  }
}

main().catch(e => console.error("Fatal:", e.message));