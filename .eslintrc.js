module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 1,
    'linebreak-style': 1,
    'no-template-curly-in-string': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
  },
  ignorePatterns: ['*.test.js', 'fixtures/*', 'files/*'],
};
