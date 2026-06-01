import { expect } from 'chai';
import fs from 'fs';
import parse from 'parse-duration';
import { normalizeTime, convertSingle, convertOverall, convertFirstAnniversary, getGauntletScoreHighlight } from '../scripts/util-gauntlet.js';


describe('normalizeTime', () => {
    it("51''45 -> 51.45s", () => {
        expect(normalizeTime("51''45")).to.equal('51.45s');
    });

    it("1'01''56 -> 1m01.56s", () => {
        expect(normalizeTime("1'01''56")).to.equal('1m01.56s');
    });

    it("1'17''75 -> 1m17.75s", () => {
        expect(normalizeTime("1'17''75")).to.equal('1m17.75s');
    });

    it("1'29'' -> 1m29s", () => {
        expect(normalizeTime("1'29''")).to.equal('1m29s');
    });

    it("3'16''? -> 3m16s", () => {
        expect(normalizeTime("3'16''?")).to.equal('3m16s');
    });

    it('empty string -> empty', () => {
        expect(normalizeTime("")).to.equal('');
    });

    it('invalid string -> original', () => {
        expect(normalizeTime("abc")).to.equal('abc');
    });
});

describe('parse normalizeTime', () => {
    it("51''45 -> 51.45", () => {
        expect(parse(normalizeTime("51''45"), 's')).to.equal(51.45);
    });

    it("1'01''56 -> 61.56", () => {
        expect(parse(normalizeTime("1'01''56"), 's')).to.equal(61.56);
    });

    it("1'17''75 -> 77.75", () => {
        expect(parse(normalizeTime("1'17''75"), 's')).to.equal(77.75);
    });

    it("1'29'' -> 89", () => {
        expect(parse(normalizeTime("1'29''"), 's')).to.equal(89);
    });

    it("3'16''? -> 196", () => {
        expect(parse(normalizeTime("3'16''?"), 's')).to.equal(196);
    });
});

describe('getGauntletScoreHighlight', () => {
    it('black background and gold text -> gold', () => {
        const cell = {
            s: { fgColor: { rgb: '000000' } },
            r: '<r><rPr><color rgb="FFFFE270"/></rPr><t>49&apos;&apos;69</t></r>'
        };

        expect(getGauntletScoreHighlight(cell)).to.equal('gold');
    });

    it('black background and white text -> white', () => {
        const cell = {
            s: { fgColor: { rgb: '000000' } },
            r: '<r><rPr><color rgb="FFF2F2F2"/></rPr><t>1&apos;18&apos;&apos;92</t></r>'
        };

        expect(getGauntletScoreHighlight(cell)).to.equal('white');
    });

    it('normal score -> none', () => {
        const cell = {
            s: { patternType: 'none' },
            r: '<r><rPr><color rgb="FF175CEB"/></rPr><t>49&apos;&apos;88</t></r>'
        };

        expect(getGauntletScoreHighlight(cell)).to.equal('none');
    });
});

describe('convertSingle', () => {
    const testJsonPath = './test-single.json';
    const testData = [
        {
            "三虎": [
                {
                    "选手": "张三",
                    "成绩": ["50''99"],
                    "日期": "2025/8/12",
                    "highlight": "none"
                },
                {
                    "选手": "李四",
                    "成绩": ["50''86", "https://example.com"],
                    "日期": "2025/6/25",
                    "highlight": "gold"
                }
            ]
        }
    ];

    before(() => {
        fs.writeFileSync(testJsonPath, JSON.stringify(testData), 'utf-8');
    });

    after(() => {
        fs.unlinkSync(testJsonPath);
    });

    it('includes headers and renders highlight markup', () => {
        const md = convertSingle(testJsonPath);

        expect(md).to.include('单项');
        expect(md).to.include('三虎');
        expect(md).to.include('选手');
        expect(md).to.include('成绩');
        expect(md).to.not.include('| highlight |');
        expect(md).to.include('gauntlet-highlight--gold');
    });
});

describe('convertOverall', () => {
    const testJsonPath = './test-overall.json';
    const testData = [
        {
            "选手": "张三",
            "三虎": ["54''52", "https://example.com"],
            "四僧": ["1'28''78"],
            "四渎龙神": ["1'53''64"],
            "六健将": ["2'35''04"],
            "蛰虫始振": ["2'20''49"],
            "万样骁凶": ["2'40''50"],
            "心猿": ["1'19''93"],
            "梅山故人": ["3'23''94"],
            "六根一性": ["5'03''94"],
            "总成绩": "21'40''78"
        },
        {
            "选手": "李四",
            "三虎": ["53''79"],
            "四僧": ["1'26''75"],
            "四渎龙神": ["1'54''15"],
            "六健将": ["2'31''50"],
            "蛰虫始振": ["2'14''44"],
            "万样骁凶": ["2'46''08"],
            "心猿": ["1'21''98"],
            "梅山故人": ["3'03''56"],
            "六根一性": ["5'05''88"],
            "总成绩": "21'18''13"
        }
    ];

    before(() => {
        fs.writeFileSync(testJsonPath, JSON.stringify(testData), 'utf-8');
    });

    after(() => {
        fs.unlinkSync(testJsonPath);
    });

    it('includes headers', () => {
        const md = convertOverall(testJsonPath);

        expect(md).to.include('选手');
        expect(md).to.include('三虎');
        expect(md).to.include('四僧');
        expect(md).to.include('四渎龙神');
        expect(md).to.include('六健将');
        expect(md).to.include('蛰虫始振');
        expect(md).to.include('万样骁凶');
        expect(md).to.include('心猿');
        expect(md).to.include('梅山故人');
        expect(md).to.include('六根一性');
        expect(md).to.include('总成绩');
    });
});

describe('convertFirstAnniversary', () => {
    const testJsonPath = './test-first-anniversary.json';
    const testData = [
        {
            "道满归根": [
                {
                    "选手": "张三",
                    "成绩": ["3'53''63", "https://example.com"],
                    "日期": "2026/02/08",
                    "highlight": "gold"
                },
                {
                    "选手": "李四",
                    "成绩": ["3'56''54"],
                    "日期": "2026/02/07",
                    "highlight": "none"
                }
            ]
        },
        {
            "总成绩": [
                {
                    "选手": "张三",
                    "成绩": ["6'08''55"],
                    "奖金": "3200元",
                    "highlight": "white"
                }
            ]
        }
    ];

    before(() => {
        fs.writeFileSync(testJsonPath, JSON.stringify(testData), 'utf-8');
    });

    after(() => {
        fs.unlinkSync(testJsonPath);
    });

    it('renders highlighted anniversary scores', () => {
        const md = convertFirstAnniversary(testJsonPath);

        expect(md).to.include('道满归根');
        expect(md).to.include('总成绩');
        expect(md).to.not.include('| highlight |');
        expect(md).to.include('gauntlet-highlight--gold');
        expect(md).to.include('gauntlet-highlight--white');
    });
});
