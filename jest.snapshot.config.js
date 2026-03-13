/** Jest configuration used exclusively for snapshot tests.
 *  Run via: npm run test:snapshot
 *  These tests are run in CI with continue-on-error so snapshot drift
 *  does not block pull requests.
 */
const baseConfig = require('./package.json').jest;

module.exports = {
  ...baseConfig,
  testMatch: ['**/src/__tests__/screens/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/src/__tests__/screens/setup.js',
  ],
};
