
import fs from "fs";

const expandedPath = "data/verseCommentary.expanded.ts";
const generatedPath = "data/verseCommentary.generated.ts";

const expandedContent = fs.readFileSync(expandedPath, "utf-8");
const generatedContent = fs.readFileSync(generatedPath, "utf-8");

// Prepare expanded content: remove the last '};'
const lastBraceIndex = expandedContent.lastIndexOf("};");
if (lastBraceIndex === -1) {
    console.error("Could not find closing brace in expanded file.");
    process.exit(1);
}
const expandedBase = expandedContent.substring(0, lastBraceIndex);

// Prepare generated content: remove wrapper
// Assuming format: export const GENERATED_COMMENTARY = {\n ... \n};
const firstBrace = generatedContent.indexOf("{");
const lastBrace = generatedContent.lastIndexOf("}");

if (firstBrace === -1 || lastBrace === -1) {
    console.error("Invalid generated file format.");
    process.exit(1);
}

const innerGenerated = generatedContent.substring(firstBrace + 1, lastBrace);

// Merge
const newContent = expandedBase + "," + innerGenerated + "\n};";

fs.writeFileSync(expandedPath, newContent);
console.log("Merged successfully!");
