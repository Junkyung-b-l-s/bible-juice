
import { SITUATION_VERSE_MAP_EXPANDED_V1 } from "../data/situationVerseMap.expanded";
import { VERSE_COMMENTARY_KRV } from "../data/verseCommentary.krv";

function checkCoverage() {
    const allVerses = new Set<string>();
    const missingVerses: { ref: string; situation: string }[] = [];

    // 1. Collect all verses from the map
    SITUATION_VERSE_MAP_EXPANDED_V1.forEach((situation) => {
        situation.core_pool.forEach((v) => allVerses.add(v.ref_key));
        situation.gems_pool.forEach((v) => allVerses.add(v.ref_key));
    });

    console.log(`Total unique verses in Situation Map: ${allVerses.size}`);

    // 2. Check against commentary
    allVerses.forEach((ref) => {
        if (!VERSE_COMMENTARY_KRV[ref]) {
            // Find which situation uses this verse for better reporting
            const usage = SITUATION_VERSE_MAP_EXPANDED_V1.find(
                (s) =>
                    s.core_pool.some((v) => v.ref_key === ref) ||
                    s.gems_pool.some((v) => v.ref_key === ref)
            );
            missingVerses.push({
                ref,
                situation: usage ? usage.display_name_ko : "Unknown",
            });
        }
    });

    // 3. Report
    if (missingVerses.length === 0) {
        console.log("✅ All verses have commentary!");
    } else {
        console.log(`❌ Missing commentary for ${missingVerses.length} verses:`);
        missingVerses.forEach((m) => {
            console.log(`- ${m.ref} (used in: ${m.situation})`);
        });
    }
}

checkCoverage();
