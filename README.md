[![Build Status](https://travis-ci.org/coldrye-es/ypo-lexer-i18next.svg?branch=master)](https://travis-ci.org/coldrye-es/ypo-lexer-i18next)
[![NPM](https://nodei.co/npm/ypo-lexer-i18next.png?mini=true)](https://nodei.co/npm/ypo-lexer-i18next/)

# ypo-lexer-i18next

ypo-lexer-i18next is a lexer used for converting the i18next v2 file format
to the YPO file format. It basically translated a JSON file into tokens that
then can be further processed by the ypo-parser.

The main use for this package lies with ypo-cli.


## Releases

See the [changelog](https://github.com/coldrye-es/ypo-lexer-i18next/blob/master/CHANGELOG.md) for more information.


## Limitations

- There is no support for interval plurals or arrays or trees


## Project Site

The project site, see (2) under resources below, provides more insight into the project,
including test coverage reports and API documentation.


## Contributing

You are very welcome to propose changes and report bugs, or even provide pull
requests on [github](https://github.com/coldrye-es/ypo-lexer-i18next).

See the [contributing guidelines](https://github.com/coldrye-es/ypo-lexer-i18next/blob/master/CONTRIBUTING.md) for more information.


### Contributors

 - [Carsten Klein](https://github.com/silkentrance) **Maintainer**


### Building

See [build process](https://github.com/coldrye-es/esmake#build-process) and the available [build targets](https://github.com/coldrye-es/esmake#makefilesoftwarein)
for more information on how to build this.

See also [development dependencies](https://github.com/coldrye-es/esmake#development-dependencies) and on how to deal with them.


## Installation

``npm --save ypo-lexer-i18next``


### Runtime Dependencies

 - _[babel-runtime](https://github.com/babel/babel)_
 - _[ypo-parser-common](https://github.com/coldrye-es/ypo-parser-common)_

**The dependencies denoted in _italics_ need to be provided by the using project.**


## Usage

```
import Lexer from 'ypo-lexer-i18next';

let lexer = new Lexer();
for (let token of lexer.tokenize('./locales/en/translation.json'))
{
    console.log(token.toString());
}
```


## Resources

 - (1) [Github Site](https://github.com/coldrye-es/ypo-lexer-i18next)
 - (2) [Project Site](http://ypo.es.coldrye.eu)

