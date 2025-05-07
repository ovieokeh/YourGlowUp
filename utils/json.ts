export function parseJSONCleaned(raw: string): any | null {
  if (!raw || typeof raw !== "string") return null;

  try {
    // Step 1: Remove backticks and language hints
    let cleaned = raw
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();

    // Step 2: Try direct JSON parse
    try {
      return JSON.parse(cleaned);
    } catch {}

    // Step 3: Try to extract JSON from inside escaped quotes
    try {
      const unescaped = cleaned
        .replace(/^"(.*)"$/, "$1") // remove wrapping quotes
        .replace(/\\"/g, '"') // unescape internal quotes
        .replace(/\\n/g, "") // remove newline escapes
        .trim();
      return JSON.parse(unescaped);
    } catch {}

    // Step 4: Use regex to extract closest `{...}` or `[...]` block
    const match = cleaned.match(/({[\s\S]+})|(\[[\s\S]+\])/);
    if (match) {
      return JSON.parse(match[0]);
    }

    return null;
  } catch (err) {
    console.error("parseJSONCleaned failed", err);
    return null;
  }
}
