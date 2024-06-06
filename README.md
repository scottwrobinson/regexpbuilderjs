```asciidoc
 ____            _____            ____        _ _     _              _ ____  
|  _ \ ___  __ _| ____|_  ___ __ | __ ) _   _(_) | __| | ___ _ __   | / ___| 
| |_) / _ \/ _` |  _| \ \/ / '_ \|  _ \| | | | | |/ _` |/ _ \ '__|  | \___ \ 
|  _ <  __/ (_| | |___ >  <| |_) | |_) | |_| | | | (_| |  __/ | | |_| |___) |
|_| \_\___|\__, |_____/_/\_\ .__/|____/ \__,_|_|_|\__,_|\___|_|  \___/|____/ 
           |___/           |_|                                                                  
```

- [Install](#install)
- [Examples](#examples)
- [Documentation](#documentation)

## Human-readable regular expressions for JavaScript

JavaScript port of `regexpbuilderphp` (which was a port of `regexpbuilder`, which is now gone). All credit goes to [Andrew Jones](https://github.com/thebinarysearchtree) and [Max Girkens](https://github.com/gherkins).

> RegExpBuilder integrates regular expressions into the programming language, thereby making them easy to read and maintain. Regular Expressions are created by using chained methods and variables such as arrays or strings.

## Supporters

Development of RegExpBuilderJS is supported by:

- [Ping Bot](https://pingbot.dev?ref=regexpbuilderjs) - A free uptime and vendor monitoring service for everyone.

## Installation

```bash
$ npm install regexpbuilderjs
```

## Examples

```javascript
const RegExpBuilder = require('regexpbuilderjs');
const builder = new RegExpBuilder();
```

### Validation

```javascript
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

// true
regExp.test('2020_10_hund.jpg');
regExp.test('2030_11_katze.png');
regExp.test('4000_99_maus.gif');

// false
regExp.test('123_00_nein.gif');
regExp.test('4000_0_nein.pdf');
regExp.test('201505_nein.jpg');
```

### Search

```javascript
const regExp = builder
    .multiLine()
    .globalMatch()
    .min(1).max(10).anythingBut(' ')
    .anyOf(['.pdf', '.doc'])
    .getRegExp();

const text = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd File.doc.`;

const matches = Array.from(text.matchAll(regExp));

// true
(matches[0][0] === 'SomeFile.pdf');
(matches[1][0] === 'doc_04.pdf');
(matches[2][0] === 'File.doc');
```

### Replace

```javascript
const regExp = builder
    .min(1)
    .max(10)
    .digits()
    .getRegExp();

let text = '98 bottles of beer on the wall';

text = text.replace(regExp, match => (parseInt(match, 10) + 1).toString());

// true
('99 bottles of beer on the wall' === text);
```

### Validation with multiple patterns

```javascript
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

// true
regExp.test('123.pdf');
regExp.test('456.doc');
regExp.test('bbbb.jpg');
regExp.test('aaaa.jpg');

// false
regExp.test('1234.pdf');
regExp.test('123.gif');
regExp.test('aaaaa.jpg');
regExp.test('456.docx');
```
        
Take a look at the [tests](test/examples.test.js) for more examples.

## Documentation

RegExpBuilder integrates regular expressions into the programming language, thereby making them easy to read and maintain. Regular Expressions are created by using chained methods and variables such as arrays or strings.

### RegExpBuilder

```javascript
const builder = new RegExpBuilder();
```

All public methods except [getRegExp()](#getregexp) are chainable.

### find(string)
Alias for then, sounds nicer at the beginning.

```javascript
builder
    .find("Hey, ")
    .then("where do you go to get ")
    .eitherFind("juice")
    .orFind("milk");
```

related: [then()](#thenstring)

### then(string)
Matches a single occurrence of the string.

```javascript
builder
    .startOfLine()
    .then("Where do you go to get ")
    .eitherFind("juice")
    .orFind("milk");
```

### some(array)
Specifies that there is at least one character and that each character must be one of those contained in the array of strings. Each string in the array must be a single character.

```javascript
const digits = ["3", "7", "8"];
builder
    .some(digits)
    .then(".");
```

### maybeSome(array)
The same as `some(array)`, except that there may be no characters at all, rather than at least one.

```javascript
const digits = ["3", "7", "8"];
builder
    .maybeSome(digits);
```

### maybe(string)
Specifies that the string may or may not occur.

```javascript
builder
    .maybe("milk");
```

### anything()
Specifies that there is zero or more of any character.

```javascript
builder
    .anything();
```

### anythingBut(string)
Specifies that there is zero or more of any character as long as the string of resulting characters does not start with the supplied string.

```javascript
builder
    .anythingBut("milk");
```

### something()
Specifies that there is one or more of any character.

```javascript
builder
    .something();
```

### lineBreak()
Specifies that there is a line break.

```javascript
builder
    .lineBreak();
```

### lineBreaks()
Specifies that there are multiple line breaks.

```javascript
builder
    .exactly(2)
    .lineBreaks();
```

### whitespace()
If used alone, specifies that there is a single whitespace character.

```javascript
builder
    .whitespace();
```

### tab()
Specifies that there is a single tab.

```javascript
builder
    .tab();
```

### tabs()
Specifies that there are multiple tabs.

```javascript
builder
    .exactly(2)
    .tabs();
```

### digit()
Specifies that there is a single digit.

```javascript
builder
    .digit();
```

### digits()
Specifies that there are multiple digits.

```javascript
builder
    .exactly(2)
    .digits();
```

### letter()
Specifies that there is a single letter.

```javascript
builder
    .letter();
```

### letters()
Specifies that there are multiple letters.

```javascript
builder
    .exactly(2)
    .letters();
```

### lowerCaseLetter()
Specifies that there is a single lowercase letter.

```javascript
builder
    .lowerCaseLetter();
```

### lowerCaseLetters()
Specifies that there are multiple lowercase letters.

```javascript
builder
    .exactly(2)
    .lowerCaseLetters();
```

### upperCaseLetter()
Specifies that there is a single uppercase letter.

```javascript
builder
    .upperCaseLetter();
```

### upperCaseLetters()
Specifies that there are multiple uppercase letters.

```javascript
builder
    .exactly(2)
    .upperCaseLetters();
```

### startOfInput()
Matches the start of input.

```javascript
builder
    .startOfInput()
    .min(1)
    .of("milk");
```

related: [endOfInput()](#endofinput)

### startOfLine()
Matches the start of input or start of a line.

```javascript
builder
    .startOfLine()
    .min(1)
    .of("milk");
```

related: [endOfLine()](#endofline)

### endOfInput()
Matches the end of input.

```javascript
builder
    .min(1)
    .of("milk")
    .endOfInput();
```

related: [startOfInput()](#startofinput)

### endOfLine()
Matches the end of input or line.

```javascript
builder
    .min(1)
    .of("milk")
    .endOfLine();
```

related: [startOfLine()](#startofline)

### eitherFind(RegExpBuilder)
Used with or. This method takes a new `RegExpBuilder` object.

```javascript
const a = builder.exactly(1).of("milk");
const b = builder.exactly(2).of("juice");

builder
    .eitherFind(a)
    .orFind(b);
```

related: [orFind(RegExpBuilder)](#orfindregexpbuilder)

### orFind(RegExpBuilder)
Used after either. Multiple or methods can be chained together. This method takes a new `RegExpBuilder` object.

```javascript
const a = builder.exactly(1).of("milk");
const b = builder.exactly(2).of("juice");

builder
    .eitherFind(a)
    .orFind(b);
```

related: [eitherFind(RegExpBuilder)](#eitherfindregexpbuilder)

### eitherFind(string)
Used with or. This method takes a string.

```javascript
builder
    .eitherFind("milk")
    .orFind("juice");
```

related: [orFind(string)](#orfindstring)

### orFind(string)
Used after either. Multiple or methods can be chained together. This method takes a string.

```javascript
builder
    .eitherFind("milk")
    .orFind("juice");
```

related: [eitherFind(string)](#eitherfindstring)

### neither(RegExpBuilder)
Used with nor. This method takes a new `RegExpBuilder` object.

```javascript
const a = builder.exactly(1)
    .of("milk");
const b = builder.exactly(2)
    .of("juice");

builder
    .neither(a)
    .nor(b);
```

related: [nor(RegExpBuilder)](#norregexpbuilder)

### nor(RegExpBuilder)
Used after neither. Multiple nor methods can be chained together. This method takes a new `RegExpBuilder` object.

```javascript
const a = builder.exactly(1)
    .of("milk");
const b = builder.exactly(2)
    .of("juice");

builder
    .neither(a)
    .nor(b);
```

related: [neither(RegExpBuilder)](#neitherregexpbuilder)

### neither(string)
Used with nor. This method takes a string.

```javascript
builder
    .neither("milk")
    .nor("juice");
```

related: [nor(string)](#norstring)

### nor(string)
Used after neither. Multiple nor methods can be chained together. This method takes a string.

```javascript
builder
    .neither("milk")
    .nor("juice");
```

related: [neither(string)](#neitherstring)

### exactly(number)
Used to specify the exact number of times a pattern will repeat.

```javascript
builder
    .exactly(1)
    .of("milk");
```

related: [min(number)](#minnumber), [max(number)](#maxnumber)

### min(number)
Used to specify the minimum number of times a pattern will repeat. This method can optionally occur before `max()`

```javascript
builder
    .min(1)
    .of("milk");
```

related: [max(number)](#maxnumber)

### max(number)
Used to specify the maximum number of times a pattern will repeat. This method can optionally occur after `min()`

```javascript
builder
    .max(1)
    .of("milk");
```

related: [min(number)](#minnumber)

### of(string)
Used to match a string.

```javascript
builder
    .exactly(1)
    .of("milk");
```

related: [from(array)](#fromarray), [notFrom(array)](#notfromarray), [like(RegExpBuilder)](#likeregexpbuilder)

### anyOf(string)
Match one of multiple strings.

```javascript
builder
    .startOfInput()
    .min(2).max(5).letters()
    .anyOf([".jpg", ".gif", ".png"]);
```

related: [from(array)](#fromarray), [notFrom(array)](#notfromarray)

### ofAny()
Used to match any character.

```javascript
builder
    .exactly(1)
    .ofAny();
```

related: [anything()](#anything)

### ofGroup(number)
Used to match a previously defined group.

```javascript
builder
    .exactly(3)
    .of("milk")
    .asGroup()
    .exactly(1)
    .of("juice")
    .exactly(1)
    .ofGroup(1);
```

related: [asGroup()](#asgroup)

### from(array)
Used to match any of the characters contained in the array. It is equivalent to the regular expression `[array]`.

```javascript
builder
    .exactly(3)


    .from(["p", "q", "r"]);
```

related: [notFrom(array)](#notfromarray)

### notFrom(array)
Used to match any characters other than those contained in the array. It is equivalent to the regular expression `[^array]`.

```javascript
builder
    .exactly(3)
    .notFrom(["p", "q", "r"]);
```

related: [from(array)](#fromarray)

### like(RegExpBuilder)
Used to nest patterns. This method takes a new `RegExpBuilder` object.

```javascript
const pattern = builder
    .min(1)
    .of("milk")
    .min(2)
    .of("juice");

builder
    .getNew()
    .exactly(2)
    .like(pattern);
```

### reluctantly()
Used to specify that the pattern is matched reluctantly. This means that the smallest possible match is found, rather than the largest possible match.

```javascript
builder
    .find("milk")
    .anything()
    .reluctantly()
    .digit();
```

### ahead(RegExpBuilder)
Equivalent to the concept of lookaheads in regular expressions. This method takes a new `RegExpBuilder` object.

```javascript
const pattern = builder
    .exactly(1)
    .of("juice");

builder
    .getNew()
    .exactly(1)
    .of("fruit")
    .ahead(pattern);
```

related: [notAhead(RegExpBuilder)](#notaheadregexpbuilder)

### notAhead(RegExpBuilder)
Equivalent to the concept of lookaheads in regular expressions. This method takes a new `RegExpBuilder` object.

```javascript
const pattern = builder
    .exactly(1)
    .of("pqr");

builder
    .getNew()
    .exactly(1)
    .of("milk")
    .notAhead(pattern);
```

related: [ahead(RegExpBuilder)](#aheadregexpbuilder)

### asGroup()
Equivalent to the concept of capturing groups in regular expressions.

```javascript
const regExp = builder
    .min(1)
    .max(3)
    .of("p")
    .exactly(1)
    .of("milk")
    .asGroup()
    .exactly(1)
    .from(["p", "q", "r"])
    .getRegExp();

const matches = regExp.exec("pmilkq");
matches[1] === "milk"; //true
```

related: [ofGroup(number)](#ofgroupnumber)

### ignoreCase()
Used before calling `getRegExp()` to ensure that the regular expression ignores case.

```javascript
builder
    .min(1)
    .max(3)
    .of("Milk")
    .ignoreCase()
    .getRegExp();
```

### multiLine()
Used before calling `getRegExp()` to set multiline on the regular expression. Normally when `start()` or `end()` are called, they refer to the start or end of the input. When `multiLine()` is called, they refer to the start or end of a line instead.

```javascript
const builderA = builder
    .startOfLine()
    .min(1)
    .of("milk");

const builderB = builder
    .min(1)
    .like(builderA)
    .multiLine()
    .getRegExp();
```

### getRegExp()
Once you have finished building your regular expression, `getRegExp()` should be called to get the actual `RegExp` object.

```javascript
const regExp = builder
    .min(1)
    .of("milk")
    .multiLine()
    .getRegExp();

regExp.test("milk"); //true
```

### append(RegExpBuilder)
Used to append patterns to the end of an existing pattern.

```javascript
const a = builder
    .min(1)
    .of("fruit");
    
const b = builder
    .min(2)
    .of("juice");

a.append(b);
```

### optional(RegExpBuilder)
The regular expression in the example below suggests that `p1` must occur once, and then `p2` might occur once.

```javascript
const a = builder
    .min(1)
    .of("milk");

const b = builder
    .min(2)
    .of("juice");

a.optional(b);
```