// @ts-check
/* eslint-env node */

const { resolve } = require("path");

process.env.ESLINT_PATH_TSCONFIG = resolve("./tsconfig.eslint.json");

/** @type {import("eslint").Linter.Config} */
const baseEslintConfig = {
    extends: ["jacobfischer"],
    ignorePatterns: ["lib/**/*.js", "docs/**"],
};

module.exports = baseEslintConfig;
