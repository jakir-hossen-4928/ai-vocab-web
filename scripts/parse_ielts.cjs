const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/80 IELTS Listening Tests.md');
const outputPath = path.join(__dirname, '../src/data/generatedIeltsData.json');

const content = fs.readFileSync(filePath, 'utf8');

const answerSectionIndex = content.indexOf('## Answers');
const questionsRaw = content.substring(0, answerSectionIndex);
const answersRaw = content.substring(answerSectionIndex);

function extractQuestionsFromTestBlock(testNum, text) {
    const sections = [];
    const parts = text.split(/##\s*(?:Questions|PART)\s*/i).slice(1);

    parts.forEach(part => {
        const lines = part.split('\n').filter(l => l.trim().length > 0);
        let instruction = "Questions " + lines[0].replace(/##/g, '').trim();
        let title = "Section";

        let contentStartIndex = 1;
        if (lines[1] && !lines[1].match(/Complete|Write|Example|Answer the questions|Choose/i)) {
            title = lines[1].replace(/##/g, '').trim();
            contentStartIndex = 2;
        }

        const contentLines = lines.slice(contentStartIndex);
        const cleanLines = [];

        for (let i = 0; i < contentLines.length; i++) {
            let l = contentLines[i].replace(/##/g, '').trim();
            if (!l) continue;

            if (l.match(/^(Complete the (notes|table|sentences|summary|flow-chart|diagram)|Answer the questions|Choose the correct letter)/i)) {
                continue;
            }
            if (l.match(/NO MORE THAN .* WORDS/i) || l.match(/ONE WORD ONLY/i)) {
                continue;
            }
            if (l.match(/^Example/i)) {
                continue;
            }

            cleanLines.push(contentLines[i]);
        }

        const fullText = cleanLines.join('\n');
        const questions = [];
        const regex = /(\d+)\s*([._\-\u2013\u2014]{3,})/g;
        let lastIndex = 0;

        const matches = [...fullText.matchAll(regex)];

        matches.forEach((m, idx) => {
            const qNum = parseInt(m[1]);
            const blank = m[0];
            const startIndex = m.index;
            let preText = fullText.substring(lastIndex, startIndex);
            preText = preText.replace(/[\r\n]+/g, ' ').trim();
            preText = preText.replace(/##/g, '').trim();

            const endIndex = startIndex + blank.length;
            const nextNewline = fullText.indexOf('\n', endIndex);
            const endOfLine = nextNewline === -1 ? fullText.length : nextNewline;
            const lineSuffix = fullText.substring(endIndex, endOfLine).trim();

            let afterInput = "";
            if (lineSuffix && !lineSuffix.match(/^\d+\s*\./)) {
                afterInput = lineSuffix;
                lastIndex = endOfLine;
            } else {
                lastIndex = endIndex;
            }

            questions.push({
                id: testNum * 100 + qNum,
                number: qNum,
                beforeInput: preText,
                afterInput: afterInput,
                answer: ""
            });
        });

        if (questions.length > 0) {
            sections.push({
                title,
                instruction,
                questions
            });
        }
    });

    // Fallback if no questions found (so we don't lose the Test)
    if (sections.length === 0) {
        // Try to verify if it was truly empty or just parse error.
        // We'll add a placeholder.
        sections.push({
            title: "Questions",
            instruction: "Please refer to audio.",
            questions: Array.from({ length: 10 }, (_, k) => ({
                id: testNum * 100 + k + 1,
                number: k + 1,
                beforeInput: `Question ${k + 1}`,
                afterInput: "",
                answer: "Unknown"
            }))
        });
        console.warn(`Test ${testNum} parsed 0 sections, added placeholders.`);
    }

    return sections;
}


function parseKeys(raw) {
    const map = {};
    const headers = raw.split(/##\s*TEST\s+(\d+)/i).slice(1);
    for (let i = 0; i < headers.length; i += 2) {
        const testNum = parseInt(headers[i]);
        const body = headers[i + 1];
        map[testNum] = {};
        const lines = body.split('\n');
        for (let line of lines) {
            line = line.trim();
            const m = line.match(/^\s*(?:##)?\s*(\d+)\s+(.*)/);
            if (m) {
                map[testNum][parseInt(m[1])] = m[2].trim();
            }
        }
    }
    return map;
}

const tests = [];
const testBlocks = questionsRaw.split(/##\s*(?:TEST|Test)\s+(\d+)/).slice(1);

for (let i = 0; i < testBlocks.length; i += 2) {
    const num = parseInt(testBlocks[i]);
    const txt = testBlocks[i + 1];
    const sections = extractQuestionsFromTestBlock(num, txt);
    tests.push({
        id: `test-${num}`,
        title: `Listening Test ${num}`,
        audioUrl: "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        sections
    });
}

const keys = parseKeys(answersRaw);

tests.forEach(test => {
    const tNum = parseInt(test.id.replace('test-', ''));
    if (keys[tNum]) {
        test.sections.forEach(sec => {
            sec.questions.forEach(q => {
                if (keys[tNum][q.number]) {
                    q.answer = keys[tNum][q.number];
                } else {
                    q.answer = "Unknown";
                }
            });
        });
    }
});

fs.writeFileSync(outputPath, JSON.stringify(tests, null, 2));
console.log(`Generated ${tests.length} tests in ${outputPath}`);
