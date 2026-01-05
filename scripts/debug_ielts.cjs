const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/80 IELTS Listening Tests.md');
const content = fs.readFileSync(filePath, 'utf8');

const answerSectionIndex = content.indexOf('## Answers');
console.log('Answer Section Index:', answerSectionIndex);

const answersRaw = content.substring(answerSectionIndex);
const lines = answersRaw.split('\n');

// Find Test 80 in answers
const t80Index = lines.findIndex(l => l.includes('TEST 80'));
console.log('Test 80 Answer Start Line:', t80Index);

if (t80Index !== -1) {
    for (let i = t80Index; i < Math.min(t80Index + 15, lines.length); i++) {
        const line = lines[i];
        if (!line) continue;
        const regex = /^\s*(?:##)?\s*(\d+)\s+(.*)/;
        const match = line.match(regex);
        console.log(`Line ${i}: "${line}" | Match: ${match ? JSON.stringify(match.slice(1)) : 'NULL'}`);
    }
}

// Check missing tests
const questionsRaw = content.substring(0, answerSectionIndex);
const testBlocks = questionsRaw.split(/##\s*(?:TEST|Test)\s+(\d+)/).slice(1);
const foundIds = [];
for (let i = 0; i < testBlocks.length; i += 2) {
    const num = parseInt(testBlocks[i]);
    foundIds.push(num);
}
console.log('Found Test IDs in Questions Section:', foundIds.length);
const allIds = Array.from({ length: 80 }, (_, i) => i + 1);
const missing = allIds.filter(id => !foundIds.includes(id));
console.log('Missing Test IDs:', missing);
