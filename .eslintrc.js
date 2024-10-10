module.exports = {
  root: true,
  extends: [
    'airbnb-base',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'no-var': 1,
    'linebreak-style': ['off', 'unix'], // enforce unix linebreaks
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
};
