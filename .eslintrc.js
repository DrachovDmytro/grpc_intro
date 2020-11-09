module.exports = {
  env: {
    es6: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'jest'
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': ['error'],

    'no-useless-constructor': 'off',
    'no-return-assign': 'off',
    complexity: ['error', 10],
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }]
  }
}
