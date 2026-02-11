
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const NIV_DIR = "/Users/jk/bible-juice/data/niv_tmp/Bible-niv-main";

const bookMap: Record<string, string> = {
    "Genesis": "창",
    "Exodus": "출",
    "Leviticus": "레",
    "Numbers": "민",
    "Deuteronomy": "신",
    "Joshua": "수",
    "Judges": "삿",
    "Ruth": "룻",
    "1 Samuel": "삼상",
    "2 Samuel": "삼하",
    "1 Kings": "왕상",
    "2 Kings": "왕하",
    "1 Chronicles": "대상",
    "2 Chronicles": "대하",
    "Ezra": "라",
    "Nehemiah": "느",
    "Esther": "에",
    "Job": "욥",
    "Psalms": "시",
    "Proverbs": "잠",
    "Ecclesiastes": "전",
    "Song Of Solomon": "아",
    "Isaiah": "사",
    "Jeremiah": "렘",
    "Lamentations": "애",
    "Ezekiel": "겔",
    "Daniel": "단",
    "Hosea": "호",
    "Joel": "요엘",
    "Amos": "암",
    "Obadiah": "오",
    "Jonah": "욘",
    "Micah": "미",
    "Nahum": "나",
    "Habakkuk": "하",
    "Zephaniah": "습",
    "Haggai": "학",
    "Zechariah": "슥",
    "Malachi": "말",
    "Matthew": "마",
    "Mark": "막",
    "Luke": "눅",
    "John": "요",
    "Acts": "행",
    "Romans": "롬",
    "1 Corinthians": "고전",
    "2 Corinthians": "고후",
    "Galatians": "갈",
    "Ephesians": "엡",
    "Philippians": "빌",
    "Colossians": "골",
    "1 Thessalonians": "살전",
    "2 Thessalonians": "살후",
    "1 Timothy": "딤전",
    "2 Timothy": "딤후",
    "Titus": "딛",
    "Philemon": "몬",
    "Hebrews": "히",
    "James": "약",
    "1 Peter": "벧전",
    "2 Peter": "벧후",
    "1 John": "요일",
    "2 John": "요이",
    "3 John": "요삼",
    "Jude": "유",
    "Revelation": "계"
};

async function importNiv() {
    console.log("Starting NIV import...");

    const files = fs.readdirSync(NIV_DIR).filter(f => f.endsWith(".json") && f !== "Books.json");

    for (const file of files) {
        const bookName = path.basename(file, ".json");
        const koreanAbbr = bookMap[bookName];
        if (!koreanAbbr) {
            console.warn(`No mapping for book: ${bookName}`);
            continue;
        }

        console.log(`Importing ${bookName} (${koreanAbbr})...`);
        const content = JSON.parse(fs.readFileSync(path.join(NIV_DIR, file), "utf-8"));

        const rows = [];
        for (const chapter of content.chapters) {
            for (const verse of chapter.verses) {
                rows.push({
                    ref_key: `${koreanAbbr}${chapter.chapter}:${verse.verse}`,
                    text: verse.text
                });
            }
        }

        // Batch insert in chunks of 500 to avoid request size limits
        for (let i = 0; i < rows.length; i += 500) {
            const chunk = rows.slice(i, i + 500);
            const { error } = await supabase.from("bible_niv").insert(chunk);
            if (error) {
                console.error(`Error inserting chunk for ${bookName}:`, error);
            }
        }
    }

    console.log("NIV import complete.");
}

importNiv().catch(console.error);
