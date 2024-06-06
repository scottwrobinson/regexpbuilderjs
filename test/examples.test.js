const { expect } = require('chai');
const RegExpBuilder = require('../index');

describe('UsageExamplesTest', function() {
    it('testUsageExample', function() {
        const builder = new RegExpBuilder();

        const regExp = builder
            .startOfInput()
            .exactly(4).digits()
            .then('_')
            .exactly(2).digits()
            .then('_')
            .min(3).max(10).letters()
            .then('.')
            .anyOf(['png', 'jpg', 'gif'])
            .endOfInput()
            .getRegExp();

        expect(regExp.test('2020_10_hund.jpg')).to.be.true;
        expect(regExp.test('2030_11_katze.png')).to.be.true;
        expect(regExp.test('4000_99_maus.gif')).to.be.true;

        expect(regExp.test('4000_99_f.gif')).to.be.false;
        expect(regExp.test('4000_09_frogt.pdf')).to.be.false;
        expect(regExp.test('2015_05_thisnameistoolong.jpg')).to.be.false;
    });

    it('testUsageExample2', function() {
        const builder = new RegExpBuilder();

        const a = builder
            .startOfInput()
            .exactly(3).digits()
            .anyOf(['.pdf', '.doc'])
            .endOfInput();

        const b = builder
            .getNew()
            .startOfInput()
            .exactly(4).letters()
            .then('.jpg')
            .endOfInput();

        const regExp = builder
            .getNew()
            .eitherFind(a)
            .orFind(b)
            .getRegExp();

        expect(regExp.test('123.pdf')).to.be.true;
        expect(regExp.test('456.doc')).to.be.true;
        expect(regExp.test('bbbb.jpg')).to.be.true;
        expect(regExp.test('aaaa.jpg')).to.be.true;

        expect(regExp.test('1234.pdf')).to.be.false;
        expect(regExp.test('123.gif')).to.be.false;
        expect(regExp.test('aaaaa.jpg')).to.be.false;
        expect(regExp.test('456.docx')).to.be.false;
    });

    it('testUsageExample3', function() {
        const builder = new RegExpBuilder();

        const regExp = builder
            .multiLine()
            .globalMatch()
            .min(1).max(10).anythingBut(' ')
            .anyOf(['.pdf', '.doc'])
            .getRegExp();

        const text = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy eirmod tempor invidunt ut File.doc labore et
dolore magna aliquyam erat, sed diam voluptua.`;

        const matches = Array.from(text.matchAll(regExp));

        expect(matches[0][0]).to.equal('SomeFile.pdf');
        expect(matches[1][0]).to.equal('doc_04.pdf');
        expect(matches[2][0]).to.equal('File.doc');
    });

    it('testReplace', function() {
        const builder = new RegExpBuilder();

        const regExp = builder
            .min(1)
            .max(10)
            .digits()
            .getRegExp();

        let text = '98 bottles of beer on the wall';

        text = text.replace(regExp, match => (parseInt(match, 10) + 1).toString());

        expect(text).to.equal('99 bottles of beer on the wall');
    });

    it('testPregMatchFlags', function() {
        const builder = new RegExpBuilder();

        const regExp = builder
            .multiLine()
            .globalMatch()
            .min(1).max(10).anythingBut(' ')
            .anyOf(['.pdf', '.doc'])
            .getRegExp();

        const text = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy eirmod tempor invidunt ut File.doc labore et
dolore magna aliquyam erat, sed diam voluptua.`;

        const matches = Array.from(text.matchAll(regExp));

        expect(matches[0]).to.be.an('array');
        expect(matches[0][0]).to.equal('SomeFile.pdf');
        expect(matches[0].index).to.equal(73);

        expect(matches[1]).to.be.an('array');
        expect(matches[1][0]).to.equal('doc_04.pdf');
        expect(matches[1].index).to.equal(226);

        expect(matches[2]).to.be.an('array');
        expect(matches[2][0]).to.equal('File.doc');
        expect(matches[2].index).to.equal(419);
    });
});
