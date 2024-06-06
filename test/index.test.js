const { expect } = require('chai');
const RegExpBuilder = require('../index');

describe('RegExpBuilderTest', function() {
    let r;

    beforeEach(function() {
        r = new RegExpBuilder();
    });

    it('testRegExp', function() {
        const regEx = r
            .startOfLine()
            .exactly(1)
            .of('p')
            .getRegExp();

        expect(regEx.flags).to.be.a('string');
        expect(regEx.flags).to.equal('m');

        expect(regEx.toString()).to.be.a('string');
        expect(regEx.source).to.be.a('string');
    });

    it('testMoney', function() {
        const regEx = r
            .find('€')
            .min(1).digits()
            .then(',')
            .digit()
            .digit()
            .getRegExp();

        expect(regEx.test('€128,99')).to.be.true;
        expect(regEx.test('€81,99')).to.be.true;

        expect(regEx.test('€8,9')).to.be.false;
        expect(regEx.test('12.123.8,99 €')).to.be.false;
    });

    it('testMoney2', function() {
        const regEx = r
            .find('€')
            .exactly(1).whitespace()
            .min(1).digits()
            .then('.')
            .exactly(3).digits()
            .then(',')
            .digit()
            .digit()
            .getRegExp();

        expect(regEx.test('€ 1.228,99')).to.be.true;
        expect(regEx.test('€ 452.000,99')).to.be.true;

        expect(regEx.test('€8,9')).to.be.false;
        expect(regEx.test('12.123.8,99 €')).to.be.false;
    });

    it('testAllMoney', function() {
        const builder1 = r
            .find('€')
            .min(1).digits()
            .then(',')
            .digit()
            .digit();

        expect(builder1.getRegExp().test('€128,99')).to.be.true;
        expect(builder1.getRegExp().test('€81,99')).to.be.true;

        const builder2 = r.getNew()
            .find('€')
            .min(1).digits()
            .then('.')
            .exactly(3).digits()
            .then(',')
            .digit()
            .digit();

        expect(builder2.getRegExp().test('€1.228,99')).to.be.true;
        expect(builder2.getRegExp().test('€452.000,99')).to.be.true;

        const combined = r.getNew()
            .eitherFind(builder1)
            .orFind(builder2);

        expect(combined.getRegExp().test('€128,99')).to.be.true;
        expect(combined.getRegExp().test('€81,99')).to.be.true;
        expect(combined.getRegExp().test('€1.228,99')).to.be.true;
        expect(combined.getRegExp().test('€452.000,99')).to.be.true;
    });

    it('testMaybe', function() {
        const regEx = r
            .startOfLine()
            .notDigit()
            .maybe('a')
            .getRegExp();

        expect(regEx.test('aabba1')).to.be.true;
        expect(regEx.test('12aabba1')).to.be.false;
    });

    it('testMaybeSome', function() {
        const regEx = r
            .startOfLine()
            .notDigit()
            .maybeSome(['a', 'b', 'c'])
            .getRegExp();

        expect(regEx.test('aabba1')).to.be.true;
        expect(regEx.test('12aabba1')).to.be.false;
    });

    it('testSome', function() {
        const regEx = r
            .startOfLine()
            .notDigit()
            .some(['a', 'b', 'c'])
            .getRegExp();

        expect(regEx.test('aabba1')).to.be.true;
        expect(regEx.test('12aabba1')).to.be.false;
    });

    it('testLettersDigits', function() {
        const regEx = r
            .startOfLine()
            .min(3)
            .letters()
            .append(r.getNew().min(2).digits())
            .getRegExp();

        expect(regEx.test('asf24')).to.be.true;
        expect(regEx.test('af24')).to.be.false;
        expect(regEx.test('afs4')).to.be.false;
        expect(regEx.test('234asas')).to.be.false;
    });

    it('testNotLetter', function() {
        const regEx = r
            .startOfLine()
            .notLetter()
            .getRegExp();

        expect(regEx.test('234asd')).to.be.true;
        expect(regEx.test('asd425')).to.be.false;
    });

    it('testNotLetters', function() {
        const regEx = r
            .startOfLine()
            .exactly(1)
            .notLetters()
            .getRegExp();

        expect(regEx.test('234asd')).to.be.true;
        expect(regEx.test('@234asd')).to.be.true;
        expect(regEx.test('asd425')).to.be.false;
    });

    it('testNotDigit', function() {
        const regEx = r
            .startOfLine()
            .notDigit()
            .getRegExp();

        expect(regEx.test('a234asd')).to.be.true;
        expect(regEx.test('45asd')).to.be.false;
    });

    it('testNotDigits', function() {
        const regEx = r
            .startOfLine()
            .exactly(1)
            .notDigits()
            .getRegExp();

        expect(regEx.test('a234asd')).to.be.true;
        expect(regEx.test('@234asd')).to.be.true;
        expect(regEx.test('425asd')).to.be.false;
    });

    it('testAny', function() {
        const regEx = r
            .startOfLine()
            .any()
            .getRegExp();

        expect(regEx.test('a.jpg')).to.be.true;
        expect(regEx.test('a.b_asdasd')).to.be.true;
        expect(regEx.test('4')).to.be.true;
        expect(regEx.test('')).to.be.false;
    });

    it('testOfAny', function() {
        const regEx = r
            .startOfLine()
            .exactly(2)
            .ofAny()
            .find('_')
            .getRegExp();

        expect(regEx.test('12_123123.jpg')).to.be.true;
        expect(regEx.test('ab_asdasd')).to.be.true;
        expect(regEx.test('425asd')).to.be.false;
    });

    it('testOfAny2', function() {
        const regEx = r
            .startOfLine()
            .exactly(3).ofAny()
            .endOfLine()
            .getRegExp();

        expect(regEx.test('pqr')).to.be.true;
    });

    it('testAnything', function() {
        const regEx = r
            .startOfLine()
            .anything()
            .getRegExp();

        expect(regEx.test('a.jpg')).to.be.true;
        expect(regEx.test('a.b_asdasd')).to.be.true;
        expect(regEx.test('4')).to.be.true;
    });

    it('testAnythingBut', function() {
        const regEx = r
            .startOfInput()
            .anythingBut('admin')
            .getRegExp();

        expect(regEx.test('a.jpg')).to.be.true;
        expect(regEx.test('a.b_asdasd')).to.be.true;
        expect(regEx.test('4')).to.be.true;
        expect(regEx.test('admin')).to.be.false;
    });

    it('testAnythingBut2', function() {
        const regEx = r
            .startOfLine()
            .anythingBut('Y')
            .getRegExp();

        expect(regEx.test('a.jpg')).to.be.true;
        expect(regEx.test('a.b_asdasd')).to.be.true;
        expect(regEx.test('4')).to.be.true;
        expect(regEx.test('YY')).to.be.false;
        expect(regEx.test('Y')).to.be.false;
    });

    it('testNeitherNor', function() {
        const regEx = r
            .startOfLine()
            .neither(r.getNew().exactly(1).of('milk'))
            .nor(r.getNew().exactly(1).of('juice'))
            .getRegExp();

        expect(regEx.test('beer')).to.be.true;
        expect(regEx.test('milk')).to.be.false;
        expect(regEx.test('juice')).to.be.false;
    });

    it('testNeitherNor2', function() {
        const regEx = r
            .startOfLine()
            .neither('milk')
            .min(0)
            .ofAny()
            .nor(r.getNew().exactly(1).of('juice'))
            .getRegExp();

        expect(regEx.test('beer')).to.be.true;
        expect(regEx.test('milk')).to.be.false;
        expect(regEx.test('juice')).to.be.false;
    });

    it('testLowerCaseLetter', function() {
        const regEx = r
            .startOfLine()
            .lowerCaseLetter()
            .getRegExp();

        expect(regEx.test('a24')).to.be.true;
        expect(regEx.test('234a')).to.be.false;
        expect(regEx.test('A34')).to.be.false;
    });

    it('testLowerCaseLetters', function() {
        const regEx = r
            .startOfLine()
            .exactly(2)
            .lowerCaseLetters()
            .getRegExp();

        expect(regEx.test('aa24')).to.be.true;
        expect(regEx.test('aAa234a')).to.be.false;
        expect(regEx.test('234a')).to.be.false;
        expect(regEx.test('A34')).to.be.false;
    });

    it('testUpperCaseLetter', function() {
        const regEx = r
            .startOfLine()
            .upperCaseLetter()
            .getRegExp();

        expect(regEx.test('A24')).to.be.true;
        expect(regEx.test('aa234a')).to.be.false;
        expect(regEx.test('34aa')).to.be.false;
    });

    it('testUpperCaseLetters', function() {
        const regEx = r
            .startOfLine()
            .exactly(2)
            .upperCaseLetters()
            .getRegExp();

        expect(regEx.test('AA24')).to.be.true;
        expect(regEx.test('aAa234a')).to.be.false;
        expect(regEx.test('234a')).to.be.false;
        expect(regEx.test('a34')).to.be.false;
    });

    it('testLetterDigit', function() {
        const regEx = r
            .ignoreCase()
            .globalMatch()
            .startOfLine()
            .letter()
            .append(r.getNew().digit())
            .getRegExp();

        expect(regEx.test('a5')).to.be.true;
        expect(regEx.test('5a')).to.be.false;
    });

    it('testTab', function() {
        const regEx = r
            .startOfLine()
            .tab()
            .getRegExp();

        expect(regEx.test('\tp')).to.be.true;
        expect(regEx.test('q\tp\t')).to.be.false;
        expect(regEx.test('p\t')).to.be.false;
    });

    it('testTab2', function() {
        const regEx = r
            .startOfLine()
            .exactly(1).of('p')
            .tab()
            .exactly(1).of('q')
            .getRegExp();

        expect(regEx.test('p\tq')).to.be.true;
    });

    it('testTabs', function() {
        const regEx = r
            .startOfLine()
            .exactly(2)
            .tabs()
            .getRegExp();

        expect(regEx.test('\t\tp')).to.be.true;
        expect(regEx.test('\tp')).to.be.false;
        expect(regEx.test('q\tp\t')).to.be.false;
        expect(regEx.test('p\t')).to.be.false;
    });

    it('testWhiteSpace', function() {
        const regEx = r
            .startOfLine()
            .exactly(2).whitespace()
            .then('p')
            .then('d')
            .then('r')
            .exactly(1).whitespace()
            .getRegExp();

        expect(regEx.test('  pdr ')).to.be.true;

        expect(regEx.test(' pdr ')).to.be.false;
        expect(regEx.test('  pd r ')).to.be.false;
        expect(regEx.test(' p dr ')).to.be.false;
    });

    it('testMoreWhiteSpace', function() {
        const regEx = r
            .startOfLine()
            .whitespace()
            .then('p')
            .then('d')
            .then('r')
            .exactly(1).whitespace()
            .getRegExp();

        expect(regEx.test('\tpdr\t')).to.be.true;
    });

    it('testNotWhitespace', function() {
        const regEx = r
            .startOfLine()
            .notWhitespace()
            .getRegExp();

        expect(regEx.test('a234asd')).to.be.true;
        expect(regEx.test(' 45asd')).to.be.false;
        expect(regEx.test('\t45asd')).to.be.false;
    });

    it('testNotWhitespace2', function() {
        const regEx = r
            .startOfLine()
            .min(1)
            .notWhitespace()
            .getRegExp();

        expect(regEx.test('a234asd')).to.be.true;
        expect(regEx.test(' 45asd')).to.be.false;
        expect(regEx.test('\t45asd')).to.be.false;
    });

    it('testLineBreak', function() {
        const regEx = r
            .startOfLine()
            .lineBreak()
            .getRegExp();

        expect(regEx.test('\n\ra234asd')).to.be.true;
        expect(regEx.test('\na234asd')).to.be.true;
        expect(regEx.test('\ra234asd')).to.be.true;

        expect(regEx.test(' 45asd')).to.be.false;
        expect(regEx.test('\t45asd')).to.be.false;
    });

    it('testLineBreaks', function() {
        const regEx = r
            .startOfLine()
            .min(2)
            .lineBreaks()
            .getRegExp();

        expect(regEx.test('\n\ra234asd')).to.be.true;
        expect(regEx.test('\n\na234asd')).to.be.true;
        expect(regEx.test('\r\ra234asd')).to.be.true;

        expect(regEx.test(' 45asd')).to.be.false;
        expect(regEx.test('\t45asd')).to.be.false;
    });

    it('testStartOfLine', function() {
        const regEx = r
            .startOfLine()
            .exactly(1)
            .of('p')
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('qp')).to.be.false;
    });

    it('testEndOfLine', function() {
        const regEx = r
            .exactly(1)
            .of('p')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('pq')).to.be.false;
    });

    it('testEitherLikeOrLike', function() {
        const regEx = r
            .startOfLine()
            .eitherFind(r.getNew().exactly(1).of('p'))
            .orFind(r.getNew().exactly(2).of('q'))
            .endOfLine()
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('qq')).to.be.true;

        expect(regEx.test('pqq')).to.be.false;
        expect(regEx.test('qqp')).to.be.false;
    });

    it('testOrLikeChain', function() {
        const regEx = r
            .eitherFind(r.getNew().exactly(1).of('p'))
            .orFind(r.getNew().exactly(1).of('q'))
            .orFind(r.getNew().exactly(1).of('r'))
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('q')).to.be.true;
        expect(regEx.test('r')).to.be.true;

        expect(regEx.test('s')).to.be.false;
    });

    it('testEitherOr', function() {
        const regEx = r
            .eitherFind('p')
            .orFind('q')
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('q')).to.be.true;

        expect(regEx.test('r')).to.be.false;
    });

    it('testAnyOf', function() {
        const regEx = r
            .anyOf([
                'abc',
                'def',
                'q',
                r.getNew().exactly(2).digits()
            ])
            .getRegExp();

        expect(regEx.test('abc')).to.be.true;
        expect(regEx.test('def')).to.be.true;
        expect(regEx.test('22')).to.be.true;

        expect(regEx.test('r')).to.be.false;
        expect(regEx.test('1')).to.be.false;

        const emptyRegEx = r
            .getNew()
            .anyOf([])
            .getRegExp();

        expect(emptyRegEx.test('p')).to.be.true;
    });

    it('testExactly', function() {
        const regEx = r
            .startOfLine()
            .exactly(3).of('p')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('ppp')).to.be.true;

        expect(regEx.test('pp')).to.be.false;
        expect(regEx.test('pppp')).to.be.false;
    });

    it('testMin', function() {
        const regEx = r
            .startOfLine()
            .min(2).of('p')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('pp')).to.be.true;
        expect(regEx.test('ppp')).to.be.true;
        expect(regEx.test('ppppppp')).to.be.true;

        expect(regEx.test('p')).to.be.false;
    });

    it('testMax', function() {
        const regEx = r
            .startOfLine()
            .max(3).of('p')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('p')).to.be.true;
        expect(regEx.test('pp')).to.be.true;
        expect(regEx.test('ppp')).to.be.true;

        expect(regEx.test('pppp')).to.be.false;
        expect(regEx.test('pppppppp')).to.be.false;
    });

    it('testMinMax', function() {
        const regEx = r
            .startOfLine()
            .min(3).max(7).of('p')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('ppp')).to.be.true;
        expect(regEx.test('ppppp')).to.be.true;
        expect(regEx.test('ppppppp')).to.be.true;

        expect(regEx.test('pp')).to.be.false;
        expect(regEx.test('p')).to.be.false;
        expect(regEx.test('pppppppp')).to.be.false;
        expect(regEx.test('pppppppppppp')).to.be.false;
    });

    it('testOf', function() {
        const regEx = r
            .startOfLine()
            .exactly(2).of('p p p ')
            .endOfLine()
            .getRegExp();

        expect(regEx.test('p p p p p p ')).to.be.true;

        expect(regEx.test('p p p p pp')).to.be.false;
    });

    it('testOfGroup', function() {
        const regEx = r
            .startOfLine()
            .exactly(3).of('p').asGroup()
            .exactly(1).of('q').asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2)
            .endOfLine()
            .getRegExp();

        expect(regEx.test('pppqpppq')).to.be.true;
    });

    it('testGroupIncrement', function() {
        //aa--aa--
        const builder1 = r
            .exactly(2).of('a').asGroup()
            .exactly(2).of('-').asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2);

        //bb--bb--
        const builder2 = r.getNew()
            .exactly(2).of('b').asGroup()
            .exactly(2).of('-').asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2);

        const builder3 = r.getNew()
            .find('123');

        const regExp = r.getNew()
            .startOfInput()
            .append(builder1)
            .append(builder2)
            .append(builder3)
            .endOfInput()
            .getRegExp();

        expect(regExp.test('aa--aa--bb--bb--123')).to.be.true;

        expect(regExp.test('def123abc')).to.be.false;
        expect(regExp.test('abcabc')).to.be.false;
        expect(regExp.test('abcdef312')).to.be.false;
    });

    it('testNamedGroup', function() {
        const regEx = r
            .exactly(3).digits().asGroup('numbers')
            .getRegExp();

        const res = regEx.exec('hello-123-abc');

        expect(res.groups).to.have.property('numbers');
    });

    it('testFrom', function() {
        const regEx = r
            .startOfLine()
            .exactly(3).from(['p', 'q', 'r'])
            .endOfLine()
            .getRegExp();

        expect(regEx.test('ppp')).to.be.true;
        expect(regEx.test('qqq')).to.be.true;
        expect(regEx.test('ppq')).to.be.true;
        expect(regEx.test('rqp')).to.be.true;

        expect(regEx.test('pyy')).to.be.false;
    });

    it('testNotFrom', function() {
        const regEx = r
            .startOfLine()
            .exactly(3).notFrom(['p', 'q', 'r'])
            .endOfLine()
            .getRegExp();

        expect(regEx.test('lmn')).to.be.true;

        expect(regEx.test('mnq')).to.be.false;
    });

    it('testLike', function() {
        const regEx = r
            .startOfLine()
            .exactly(2).like(
                r.getNew()
                    .min(1).of('p')
                    .min(2).of('q')
            )
            .endOfLine()
            .getRegExp();

        expect(regEx.test('pqqpqq')).to.be.true;

        expect(regEx.test('qppqpp')).to.be.false;
    });

    it('testReluctantly', function() {
        const regEx = r
            .exactly(2).of('p')
            .min(2).ofAny().reluctantly()
            .exactly(2).of('p')
            .getRegExp();

        const matches = regEx.exec('pprrrrpprrpp');
        expect(matches[0]).to.equal('pprrrrpp');
    });

    it('testAhead', function() {
        const regEx = r
            .exactly(1).of('dart')
            .ahead(r.getNew().exactly(1).of('lang'))
            .getRegExp();

        expect(regEx.test('dartlang')).to.be.true;
        expect(regEx.test('dartlanglang')).to.be.true;
        expect(regEx.test('langdartlang')).to.be.true;

        expect(regEx.test('dartpqr')).to.be.false;
        expect(regEx.test('langdart')).to.be.false;
    });

    it('testNotAhead', function() {
        const regEx = r
            .exactly(1).of('dart')
            .notAhead(r.getNew().exactly(1).of('pqr'))
            .getRegExp();

        expect(regEx.test('dartlang')).to.be.true;
        expect(regEx.test('dartpqr')).to.be.false;
    });

    it('testAsGroup', function() {
        const regEx = r
            .min(1).max(3).of('p')
            .exactly(1).of('dart').asGroup()
            .exactly(1).from(['p', 'q', 'r'])
            .getRegExp();

        const matches = regEx.exec('pdartq');
        expect(matches[1]).to.equal('dart');
    });

    it('testOptional', function() {
        const regEx = r
            .min(1).max(3).of('p')
            .exactly(1).of('dart')
            .optional(r.getNew().exactly(1).from(['p', 'q', 'r']))
            .getRegExp();

        expect(regEx.test('pdartq')).to.be.true;
    });

    it('testDelimiter', function() {
        const regEx = r
            .startOfInput()
            .exactly(3).digits()
            .exactly(1).of('/')
            .exactly(2).letters()
            .endOfInput()
            .getRegExp();

        expect(regEx.test('123/ab')).to.be.true;
    });

    it('testSomething', function() {
        const regEx = r
            .min(1).max(3).of('p')
            .something()
            .getRegExp();

        expect(regEx.test('pphelloq')).to.be.true;
        expect(regEx.test('p')).to.be.false;
    });

    it('testAlias', function() {
        const regEx = r
            .startOfLine()
            .upperCaseLetter()
            .getRegExp();

        expect(regEx.test('A24')).to.be.true;

        const execRes = regEx.exec('A45');
        const findInRes = regEx.exec('A45');
        expect(execRes[0]).to.exist;
        expect(findInRes[0]).to.exist;
    });
});