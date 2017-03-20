
> IMPORTANT: This module is deprecated. Use the babel 6 based plugin instead: https://github.com/geekflyer/babel-plugin-transform-es2015-modules-ui5


# babel-openui5-module-formatter [![Build Status](https://travis-ci.org/geekflyer/babel-openui5-module-formatter.svg?branch=master)](https://travis-ci.org/geekflyer/babel-openui5-module-formatter) [![npm version](https://badge.fury.io/js/babel-openui5-module-formatter.svg)](http://badge.fury.io/js/babel-openui5-module-formatter)

This is a custom module formatter for the babel js transpiler. It transpiles ES6 modules to `sap.ui.define` calls (AMD-like syntax).

## Install

```sh
$ npm install --save-dev babel-openui5-module-formatter
```

## Usage

Configure your babel transpiler to use a custom module formatter as described here: https://babeljs.io/docs/usage/modules/#custom and here https://babeljs.io/docs/usage/options/.

## Example

check this: https://github.com/geekflyer/babel-openui5-module-example

## Current Limitations

- The formatter transpiles your ES6 module code into `sap.ui.define` calls. Therefore generally speaking the same limitations as described here apply: https://openui5beta.hana.ondemand.com/#docs/api/symbols/sap.ui.html#.define . Noteworthy ones are:
	- Relative imports only work within the same or a subdirectory, but not a parent. E.g. `import foo from '../bla/bar'` won't work, while `import foo from './sub/bar'` works. You have to use absolute imports instead then, e.g. `import foo from 'mycompany/myapp/bla/bar'`. This problem might be solved by the formatter / transpiler in future, by statically resolving the module paths to absolute ones at transpile time.
	- In ES6 one can define *named exports* and *default* exports at the same time. However in AMD / sap.ui.define there's no equivalent. **Therefore you should have per module either only a *default export* or *named exports*.** If you violate this, the behaviour the transpiled module won't be as expected. For clarification refer to http://www.2ality.com/2014/09/es6-modules-final.html .
	- In ES6 syntax one can define global module / namespace mappings etc. via `System.map`. This doesn't work with the current transpiler and instead the global module mappings from UI5, e.g. `jQuery.sap.registerModulepath` and `data-sap-ui-resourceroots=` apply.
- Even though the formatter supports *named exports* it does not support *named imports* yet. Instead one on has to import the whole module via the wildcard syntax. This will be fixed soon in the formatter. 
For example: 

```js
// mymodule.js
// named exports
export var foo = () => 'bla';
export var bar = () => 'blub';
```
```js
// doesn't work at the moment:
import {foo} from './mymodule'
foo(); // ERROR
```
```js
// works:
import * as mymodule from './mymodule';
mymodule.foo();
```

## License

Apache 2.0 © [Christian Theilemann](https://github.com/geekflyer)
