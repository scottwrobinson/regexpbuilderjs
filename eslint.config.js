const globals = require('globals');
const pluginJs = require('@eslint/js');
const mochaPlugin = require('eslint-plugin-mocha');

module.exports = [
    {
        files: ['*.js', '*.mjs','**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'commonjs'
        },
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            'linebreak-style': ['error', 'unix'],
            'no-console': 'off',
            quotes: ['error', 'single'],
            semi: ['error', 'always']
        }
    }, {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    pluginJs.configs.recommended,
    mochaPlugin.configs.flat.recommended
];