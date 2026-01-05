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

const specificAudioUrls = {
    1: "https://drive.google.com/file/d/1-IE9NneXdl5f_fGLD_lWOIATRMbBEjww/preview",
    2: "https://drive.google.com/file/d/1Hm9Nx7v818fT0cqwcLCOmhjcN84VNBXL/preview",
    3: "https://drive.google.com/file/d/1Qco9PjqAoDuz67S4pCX8y2PeJH_Yddun/preview",
    4: "https://drive.google.com/file/d/1BUtyA6TOAlCO5hmND48tKUWUzXtECGb_/preview",
    5: "https://drive.google.com/file/d/1-HjrTwq8o_DMmnc9ksXICTebok19iLzl/preview",
    6: "https://drive.google.com/file/d/15u1-KUh0mp1aMXkvHj0EZAg_BylvNMa6/preview",
    7: "https://drive.google.com/file/d/1NdJHEGAMLI6vmQWeSftcHBDjl4HDD6Ey/preview",
    8: "https://drive.google.com/file/d/1BSZuMalJ8f0bbkRQin3t7ZN1wWSxtdeZ/preview",
    9: "https://drive.google.com/file/d/1s8xJkHA8g42DxdmyXu7XGCIkKuXGqgpR/preview",
    10: "https://drive.google.com/file/d/1CktY4tyP-vGZLNpAN9b61Ocn9ZZW0kya/preview",
    11: "https://drive.google.com/file/d/1S3qq6A7k0glReEY52ceRoEBSL-llVfJd/preview",
    12: "https://drive.google.com/file/d/1VHruTtOMrnXLLDb08U5Ur2SJW7X4gu-3/preview",
    13: "https://drive.google.com/file/d/1bdzskjYB8o1gEYNz7VXG7J2qPqNiu3RM/preview",
    14: "https://drive.google.com/file/d/1aDQZf1E6ntm3Yy2rwZU7e7daiD7pHCmz/preview",
    15: "https://drive.google.com/file/d/15KBf538w3dzl9-SRzfO2qFMlJDERcJHt/preview",
    16: "https://drive.google.com/file/d/1AGcaxrlmKPESEKUX3ugWatPVduOjTTRt/preview",
    17: "https://drive.google.com/file/d/1Uzkbb70Jrv1ueaf6WTAn-2VMNppC-J3k/preview",
    18: "https://drive.google.com/file/d/1grxccnjsi5WkJKcwQhAY-tErJI3g5-SP/preview",
    19: "https://drive.google.com/file/d/1rYtd3nt7aCO4RzJX741ysgiZaOiH0L0P/preview",
    20: "https://drive.google.com/file/d/1BPYu4EcfGlYolCYKc-IDgwgg2AO9Tjtc/preview",
    21: "https://drive.google.com/file/d/1aUt5YHN9HO_m2DKPQ3uZdMJmUgK5_fad/preview",
    22: "https://drive.google.com/file/d/10wTNXJbmbHDIUCbdViBslsMA-yhB1RaW/preview",
    23: "https://drive.google.com/file/d/1nwc3o2XhfbqGfmD-enHUJ73D7eB8TjoR/preview",
    24: "https://drive.google.com/file/d/11JZ_7oDSSW_TcnadGR0XOHqj86dfC_ch/preview",
    25: "https://drive.google.com/file/d/1BidoCkT1tIZWrXFvgS_w3jykrFMrTt4n/preview",
    26: "https://drive.google.com/file/d/1PD7aqsPvrtYEpaCKuvYzpa2bxLsfLxxs/preview",
    27: "https://drive.google.com/file/d/1bwHLAHiz94XsLdUHyg-JZeZ81ncj_Tqh/preview",
    28: "https://drive.google.com/file/d/1flXiOZ5fDsPsOYs8X0jmqzOxmc42m4Wa/preview",
    29: "https://drive.google.com/file/d/17FLoBlqTqaA5NJvOgHYP59CP9aF35ruK/preview",
    30: "https://drive.google.com/file/d/1Bs9ztsEtZKbwmMIFIYX1xMcWfMLYVA2w/preview",
    31: "https://drive.google.com/file/d/12tRyk38ONEukI8nRZniKMrrEeCnVAPTP/preview",
    32: "https://drive.google.com/file/d/1LjEr_RIOsndMBEt04PZsQekZvizMZAgv/preview",
    33: "https://drive.google.com/file/d/1C-tC0PgLEWtWkq8orlWru6krRACdSUN-/preview",
    34: "https://drive.google.com/file/d/1ajuC1ewnPELRe636x0sm_SDxclRF6F8J/preview",
    35: "https://drive.google.com/file/d/1lIB0hwIMGKl_H1dmQ6hp1FcYTm4vmLRy/preview",
    36: "https://drive.google.com/file/d/1p2mnQhWDFuSHalhQe_TroshvW92m2n9o/preview",
    37: "https://drive.google.com/file/d/1xCuiJqofczrVpC96M2ZkpOgc-mX-66Cv/preview",
    38: "https://drive.google.com/file/d/1otPG_PExAnSAsyp3mwMaYor22z01hlpy/preview",
    39: "https://drive.google.com/file/d/17VOhWo36kVqwTlJBJyHKPiIpMHgZkb60/preview",
    40: "https://drive.google.com/file/d/1hHywsdLfrtw3KSkW1ovEfVHPZCu3xkuP/preview",
    41: "https://drive.google.com/file/d/1TVlvrDu3Zl5B1Fl2msLBtEfARzvSoxIX/preview",
    42: "https://drive.google.com/file/d/1NgV33N3labk5T1GL39j0v9GGnZNVOC4B/preview",
    43: "https://drive.google.com/file/d/1y6ALljCrmuS46tEQSgKCPxyu_U9CVTRJ/preview",
    44: "https://drive.google.com/file/d/1su5okxqMcQswDFWQ0SIPa6DWvAQB-k51/preview",
    45: "https://drive.google.com/file/d/1xLOUbnD6mYC_cGX4HqvufoP7MCdQ-d7f/preview",
    46: "https://drive.google.com/file/d/175_IvwOuyKmc81-XAATOkIEblTV1tDt_/preview",
    47: "https://drive.google.com/file/d/1cSNU5QLCSy_QFYPT-Vx6AYDD_2vEX9yA/preview",
    48: "https://drive.google.com/file/d/14WinrT9PmkC4oR9miasFPD62MclDlWWO/preview",
    49: "https://drive.google.com/file/d/1IEH_vLNePYu-SdYzjN0ZXaFrSq6-e6Tq/preview",
    50: "https://drive.google.com/file/d/1YJGIe_-jMiZij4tCS8YQtg7ooeENQSCD/preview",
    51: "https://drive.google.com/file/d/15G1wyYeauaGR2Lot5GprfrgpSqDZtgdI/preview",
    52: "https://drive.google.com/file/d/1L2PzgA7naimbnnQJ3ninBtuxpYZqZ2Ye/preview",
    53: "https://drive.google.com/file/d/1k0A1dpARH22gaP80xVlb9E0R-g4Csz0V/preview",
    54: "https://drive.google.com/file/d/1cYm9VGOpUFN_pM7WambAT25-Ts7rjoFQ/preview",
    55: "https://drive.google.com/file/d/19GHM1RDpVTMaSR3DMvmzcODjms4kEOUO/preview",
    56: "https://drive.google.com/file/d/1jdrsurweTWCO8k9J99Uz56vgKw_k-jrb/preview",
    57: "https://drive.google.com/file/d/1fhjm_ogsTQbVpdG35iG4L7HhO9DeHwnn/preview",
    58: "https://drive.google.com/file/d/1No_gzhPlIiyQgisCujYZVfXlyaXXw3DX/preview",
    59: "https://drive.google.com/file/d/1Pv5zHPlpm443dTVmdSyvA84MHe7h4Dgd/preview",
    60: "https://drive.google.com/file/d/1awdwHBKPGmDNvV621tFb7Ea6tfapJ6Bd/preview",
    61: "https://drive.google.com/file/d/1-bM3sypJoi0YLEwgQA5JqqJbJ8lLZIh-/preview",
    62: "https://drive.google.com/file/d/1nK7Yf0Fqv8gTJdO_0xEs2GGvyEICO_6s/preview",
    63: "https://drive.google.com/file/d/1hj91n9geVGUm1xhuBIdXxLGkMycI9TOI/preview",
    64: "https://drive.google.com/file/d/1KRx6uNfA03DmdUurQygFMIcGcNZpdG6E/preview",
    65: "https://drive.google.com/file/d/1xebvbzH4rjaK-XYHpbVdCJ7YQWr36Ods/preview",
    66: "https://drive.google.com/file/d/1kVh5z0k5HaLSYttIkpQC532tvYY-VxgH/preview",
    67: "https://drive.google.com/file/d/1gbiOBdzXCFjoyRr1TrlwkX2GmRSbu6ek/preview",
    68: "https://drive.google.com/file/d/1bzO1mkpJBsCUrvZugV5aMXEmyQ7crI-7/preview",
    69: "https://drive.google.com/file/d/14QvzTTIT8eZAkaL1hYeb470RUoxjbikd/preview",
    70: "https://drive.google.com/file/d/1U1o6RMQ9ZlOqng0E7uq4dC1c_4nalSMS/preview",
    71: "https://drive.google.com/file/d/1A3GY2FmX0e6Hint4sw75E8-6OoFUfbGp/preview",
    72: "https://drive.google.com/file/d/1wIj8jVxAzxrUirUkDfE9RzMuxm-RaFWR/preview",
    73: "https://drive.google.com/file/d/1Hdo-7MrhPYAswIRE8BTwbEfhUc6TNJmy/preview",
    74: "https://drive.google.com/file/d/1JFmePIsHpybC9cOgpI7NeHNPIcEm3nGp/preview",
    75: "https://drive.google.com/file/d/1-ZYCvjMhyPdt4MkkBkjCGCGBXOKMjvp8/preview",
    76: "https://drive.google.com/file/d/1Ge0Z29XkCBZ8i9OjQDuJuXlLr_AfE4-G/preview",
    77: "https://drive.google.com/file/d/1QJ-zLZjL3ZJUJU5AQwWZPlYcUKr-4l_-/preview",
    78: "https://drive.google.com/file/d/1FdxGEaDtv8L7X6qYkM9o_QYI4YL8QAyd/preview",
    79: "https://drive.google.com/file/d/1s_JO49guTT7C2DW7_tRFJ0loPmrMEAKe/preview",
    80: "https://drive.google.com/file/d/1uFpy9r6EM_eFhuWokZWFQ61lXqXd7i5D/preview"
};

for (let i = 0; i < testBlocks.length; i += 2) {
    const num = parseInt(testBlocks[i]);
    const txt = testBlocks[i + 1];
    const sections = extractQuestionsFromTestBlock(num, txt);
    tests.push({
        id: `test-${num}`,
        title: `Listening Test ${num}`,
        audioUrl: specificAudioUrls[num] || "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
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
