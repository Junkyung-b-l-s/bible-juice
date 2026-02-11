
import { createClient } from "@supabase/supabase-js";

// Note: Run with environment variables or they will be undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRefKeys() {
    const { data, error } = await supabase
        .from("bible_krv")
        .select("ref_key")
        .limit(50);

    if (error) {
        console.error(error);
        return;
    }

    console.log("Sample ref_keys from bible_krv:");
    console.log(data.map(d => d.ref_key).join(", "));
}

checkRefKeys();
