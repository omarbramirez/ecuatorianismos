
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const testRegex = (term, text) => {
    const escapedTerm = escapeRegExp(term);
    const regex = new RegExp(`(?<!\\p{L})${escapedTerm}(?!\\p{L})`, 'iu');
    return regex.test(text);
};

const testCases = [
    { term: "a", text: "abago", expected: false },
    { term: "a", text: "voy a ir", expected: true },
    { term: "a", text: "A la una", expected: true },
    { term: "a", text: "casa", expected: false },
    { term: "año", text: "un año más", expected: true },
    { term: "año", text: "dañoso", expected: false },
    { term: "chucha", text: "sacarse la chucha", expected: true },
    { term: "chucha", text: "chuchaki", expected: false },
    { term: "más", text: "más o menos", expected: true },
    { term: "mas", text: "más o menos", expected: false }, // Accent sensitivity check (should be false if strict, but 'i' flag makes it insensitive? Wait, 'i' ignores case, not accents usually. Let's check behavior)
];

console.log("Running Regex Tests...\n");

let passed = 0;
testCases.forEach(({ term, text, expected }, index) => {
    const result = testRegex(term, text);
    const status = result === expected ? "PASS" : "FAIL";
    if (result === expected) passed++;
    console.log(`${status}: Term="${term}" in Text="${text}" -> Got: ${result}, Expected: ${expected}`);
});

console.log(`\nPassed ${passed} out of ${testCases.length} tests.`);
