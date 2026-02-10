
import { SITUATION_VERSE_MAP_EXPANDED_V1 } from "../data/situationVerseMap.expanded";
import { VERSE_COMMENTARY_KRV } from "../data/verseCommentary.krv";
import { VERSE_COMMENTARY_EXPANDED } from "../data/verseCommentary.expanded";
import fs from "fs";

// OpenAI types (simple polyfill)
type ChatGPTMessage = { role: string, content: string };
type ChatGPTResponse = { choices: { message: { content: string } }[] };

// Read .env.local manually
const envPath = ".env.local";
let apiKey = process.env.OPENAI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/OPENAI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

const OPENAI_API_KEY = apiKey;

if (!OPENAI_API_KEY) {
    console.error("Please set OPENAI_API_KEY environment variable or in .env.local");
    process.exit(1);
}

// 1. Identify Missing Verses
const allVerses = new Map<string, { situations: string[], themes: string[] }>();

SITUATION_VERSE_MAP_EXPANDED_V1.forEach((situation) => {
    [...situation.core_pool, ...situation.gems_pool].forEach((v) => {
        if (!allVerses.has(v.ref_key)) {
            allVerses.set(v.ref_key, { situations: [], themes: [] });
        }
        const meta = allVerses.get(v.ref_key)!;
        if (!meta.situations.includes(situation.display_name_ko)) {
            meta.situations.push(situation.display_name_ko);
        }
        situation.themes.forEach(t => {
            if (!meta.themes.includes(t)) meta.themes.push(t);
        });
    });
});

const missingRefs: string[] = [];
for (const [ref, meta] of allVerses.entries()) {
    // Check both main and expanded files (in memory, though expanded should be imported in main)
    // Actually, we should check the runtime object
    if (!VERSE_COMMENTARY_KRV[ref] && !VERSE_COMMENTARY_EXPANDED[ref]) {
        missingRefs.push(ref);
    }
}

console.log(`Found ${missingRefs.length} missing verses.`);

// 2. Generate Commentary (Batching)
const BATCH_SIZE = 5; // Generate 5 at a time to avoid timeout/rate limits
const DELAY_MS = 1000;

async function generateCommentary(ref: string, meta: { situations: string[], themes: string[] }) {
    const prompt = `
  Context: Making a Bible app for specific life situations.
  Verse: ${ref}
  User Situation: ${meta.situations.join(", ")}
  Themes: ${meta.themes.join(", ")}

  Task: Create a JSON object for this verse commentary.
  Format:
  {
    "context": "Short biblical context (1-2 sentences)",
    "intent": "Pastoral intent relevant to the User Situation (1-2 sentences)",
    "pitfalls": ["Common misunderstanding 1", "Common misunderstanding 2"],
    "reframing": "A powerful, comforting, or challenging reframing statement (1 sentence)",
    "tags": ["Tag1", "Tag2"]
  }
  Language: Korean (Natural, warm, pastoral tone).
  Important: The commentary MUST be specific to the User Situation provided.
  `;

    // Mock fetch for OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}


async function run() {
    console.log(`Found ${missingRefs.length} missing verses.`);

    // Process ALL missing verses
    const targetRefs = missingRefs;
    const results: Record<string, any> = {};
    const CONCURRENCY = 10;

    let completed = 0;
    const total = targetRefs.length;

    // Simple concurrency queue
    const queue = [...targetRefs];
    const workers = Array(CONCURRENCY).fill(null).map(async (_, i) => {
        while (queue.length > 0) {
            const ref = queue.shift();
            if (!ref) break;

            try {
                const meta = allVerses.get(ref)!;
                console.log(`[${completed + 1}/${total}] Generating for ${ref}...`);
                const commentary = await generateCommentary(ref, meta);
                results[ref] = commentary;
                completed++;
            } catch (e) {
                console.error(`Failed for ${ref}:`, e);
            }
        }
    });

    await Promise.all(workers);

    // Output to file
    const fileContent = `
export const GENERATED_COMMENTARY = ${JSON.stringify(results, null, 2)};
  `;

    fs.writeFileSync("data/verseCommentary.generated.ts", fileContent);
    console.log("Done! Check data/verseCommentary.generated.ts");
}

run();
