class RegExpBuilder {
    constructor() {
        this._flags = '';
        this._pregMatchFlags = null;
        this._literal = [];
        this._groupsUsed = 0;
        this._min = -1;
        this._max = -1;
        this._of = '';
        this._ofAny = false;
        this._ofGroup = -1;
        this._from = '';
        this._notFrom = '';
        this._like = '';
        this._either = '';
        this._reluctant = false;
        this._capture = false;
        this._captureName = null;
    }

    clear() {
        this._min = -1;
        this._max = -1;
        this._of = '';
        this._ofAny = false;
        this._ofGroup = -1;
        this._from = '';
        this._notFrom = '';
        this._like = '';
        this._either = '';
        this._reluctant = false;
        this._capture = false;
    }

    flushState() {
        if (this._of !== '' || this._ofAny || this._ofGroup > 0 || this._from !== '' || this._notFrom !== '' || this._like !== '') {
            const captureLiteral = this._capture
                ? this._captureName ? `?<${this._captureName}>` : ''
                : '?:';
            const quantityLiteral = this.getQuantityLiteral();
            const characterLiteral = this.getCharacterLiteral();
            const reluctantLiteral = this._reluctant ? '?' : '';
            this._literal.push(`(${captureLiteral}(?:${characterLiteral})${quantityLiteral}${reluctantLiteral})`);
            this.clear();
        }
    }

    getQuantityLiteral() {
        if (this._min !== -1) {
            if (this._max !== -1) {
                return `{${this._min},${this._max}}`;
            }
            return `{${this._min},}`;
        }
        return `{0,${this._max}}`;
    }

    getCharacterLiteral() {
        if (this._of) {
            return this._of;
        }
        if (this._ofAny) {
            return '.';
        }
        if (this._ofGroup > 0) {
            return `\\${this._ofGroup}`;
        }
        if (this._from) {
            return `[${this._from}]`;
        }
        if (this._notFrom) {
            return `[^${this._notFrom}]`;
        }
        if (this._like) {
            return this._like;
        }
        return null;
    }

    getLiteral() {
        this.flushState();
        return this._literal.join('');
    }

    combineGroupNumberingAndGetLiteral(r) {
        const literal = this.incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
        this._groupsUsed += r._groupsUsed;
        return literal;
    }

    incrementGroupNumbering(literal, increment) {
        if (increment > 0) {
            literal = literal.replace(/\\(\d+)/g, (match, groupNumber) => {
                return `\\${parseInt(groupNumber, 10) + increment}`;
            });
        }
        return literal;
    }

    getRegExp() {
        this.flushState();
        return new RegExp(this._literal.join(''), this._flags);
    }

    addFlag(flag) {
        if (!this._flags.includes(flag)) {
            this._flags += flag;
        }
        return this;
    }

    ignoreCase() {
        return this.addFlag('i');
    }

    multiLine() {
        return this.addFlag('m');
    }

    globalMatch() {
        return this.addFlag('g');
    }

    pregMatchFlags(flags) {
        this._pregMatchFlags = flags;
        return this;
    }

    startOfInput() {
        this._literal.push('(?:^)');
        return this;
    }

    startOfLine() {
        this.multiLine();
        return this.startOfInput();
    }

    endOfInput() {
        this.flushState();
        this._literal.push('(?:$)');
        return this;
    }

    endOfLine() {
        this.multiLine();
        return this.endOfInput();
    }

    eitherFind(r) {
        if (typeof r === 'string') {
            return this.setEither(this.getNew().exactly(1).of(r));
        }
        return this.setEither(r);
    }

    setEither(r) {
        this.flushState();
        this._either = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    orFind(r) {
        if (typeof r === 'string') {
            return this.setOr(this.getNew().exactly(1).of(r));
        }
        return this.setOr(r);
    }

    anyOf(r) {
        if (r.length < 1) {
            return this;
        }

        const firstToken = r.shift();
        this.eitherFind(firstToken);

        for (const token of r) {
            this.orFind(token);
        }

        return this;
    }

    setOr(r) {
        const either = this._either;
        const or = this.combineGroupNumberingAndGetLiteral(r);
        if (!either) {
            let lastOr = this._literal[this._literal.length - 1];
            lastOr = lastOr.slice(0, -1);
            this._literal[this._literal.length - 1] = lastOr;
            this._literal.push(`|(?:${or}))`);
        } else {
            this._literal.push(`(?:(?:${either})|(?:${or}))`);
        }
        this.clear();
        return this;
    }

    neither(r) {
        if (typeof r === 'string') {
            return this.notAhead(this.getNew().exactly(1).of(r));
        }
        return this.notAhead(r);
    }

    nor(r) {
        if (this._min === 0 && this._ofAny) {
            this._min = -1;
            this._ofAny = false;
        }
        this.neither(r);
        return this.min(0).ofAny();
    }

    exactly(n) {
        this.flushState();
        this._min = n;
        this._max = n;
        return this;
    }

    min(n) {
        this.flushState();
        this._min = n;
        return this;
    }

    max(n) {
        this.flushState();
        this._max = n;
        return this;
    }

    of(s) {
        this._of = this.sanitize(s);
        return this;
    }

    ofAny() {
        this._ofAny = true;
        return this;
    }

    ofGroup(n) {
        this._ofGroup = n;
        return this;
    }

    from(s) {
        this._from = this.sanitize(s.join(''));
        return this;
    }

    notFrom(s) {
        this._notFrom = this.sanitize(s.join(''));
        return this;
    }

    like(r) {
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    reluctantly() {
        this._reluctant = true;
        return this;
    }

    ahead(r) {
        this.flushState();
        this._literal.push(`(?=${this.combineGroupNumberingAndGetLiteral(r)})`);
        return this;
    }

    notAhead(r) {
        this.flushState();
        this._literal.push(`(?!${this.combineGroupNumberingAndGetLiteral(r)})`);
        return this;
    }

    asGroup(name = null) {
        this._capture = true;
        this._captureName = name;
        this._groupsUsed++;
        return this;
    }

    then(s) {
        return this.exactly(1).of(s);
    }

    find(s) {
        return this.then(s);
    }

    some(s) {
        return this.min(1).from(s);
    }

    maybeSome(s) {
        return this.min(0).from(s);
    }

    maybe(s) {
        return this.max(1).of(s);
    }

    anything() {
        return this.min(0).ofAny();
    }

    anythingBut(s) {
        if (s.length === 1) {
            return this.min(1).notFrom([s]);
        }
        this.notAhead(this.getNew().exactly(1).of(s));
        return this.min(0).ofAny();
    }

    something() {
        return this.min(1).ofAny();
    }

    any() {
        return this.exactly(1).ofAny();
    }

    lineBreak() {
        this.flushState();
        this._literal.push('(?:\\r\\n|\\r|\\n)');
        return this;
    }

    lineBreaks() {
        return this.like(this.getNew().lineBreak());
    }

    whitespace() {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push('(?:\\s)');
            return this;
        }
        this._like = '\\s';
        return this;
    }

    notWhitespace() {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push('(?:\\S)');
            return this;
        }
        this._like = '\\S';
        return this;
    }

    tab() {
        this.flushState();
        this._literal.push('(?:\\t)');
        return this;
    }

    tabs() {
        return this.like(this.getNew().tab());
    }

    digit() {
        this.flushState();
        this._literal.push('(?:\\d)');
        return this;
    }

    notDigit() {
        this.flushState();
        this._literal.push('(?:\\D)');
        return this;
    }

    digits() {
        return this.like(this.getNew().digit());
    }

    notDigits() {
        return this.like(this.getNew().notDigit());
    }

    letter() {
        this.exactly(1);
        this._from = 'A-Za-z';
        return this;
    }

    notLetter() {
        this.exactly(1);
        this._notFrom = 'A-Za-z';
        return this;
    }

    letters() {
        this._from = 'A-Za-z';
        return this;
    }

    notLetters() {
        this._notFrom = 'A-Za-z';
        return this;
    }

    lowerCaseLetter() {
        this.exactly(1);
        this._from = 'a-z';
        return this;
    }

    lowerCaseLetters() {
        this._from = 'a-z';
        return this;
    }

    upperCaseLetter() {
        this.exactly(1);
        this._from = 'A-Z';
        return this;
    }

    upperCaseLetters() {
        this._from = 'A-Z';
        return this;
    }

    append(r) {
        this.exactly(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    optional(r) {
        this.max(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    sanitize(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }  

    getNew() {
        return new RegExpBuilder();
    }
}

module.exports = RegExpBuilder;