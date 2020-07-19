// @ts-check
/* eslint-env node */

/** @type {import("eslint").Linter.Config} */
const baseEslintConfig = {
    extends: ["../.eslintrc.js", "plugin:mocha/recommended"],
    plugins: ["mocha"],
    env: {
        mocha: true,
    },
};

module.exports = baseEslintConfig;
