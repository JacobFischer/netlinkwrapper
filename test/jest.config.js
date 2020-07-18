// @ts-check

const { resolve } = require("path");

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

/** @type {Partial<import("@jest/types/build/Config").InitialOptions>} */
/*
const jestConfig = {
    clearMocks: true,
    collectCoverage: false,
    coverageReporters: [],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    rootDir: resolve(__dirname + "/../dist/test/"),
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "src/",
        "/node_modules/",
        "([^s]+).config.(js|ts|tsx)",
        ".eslintrc.js(on)?",
    ],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
    verbose: true,
    useStderr: true,
};
*/

const jestConfig = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{js,ts}"],
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: [
        "\\\\node_modules\\\\", // do not test external modules
        "(babel|webpack|jest).config.(js|ts)", // config files for frameworks/tools
        ".eslintrc.js", // config file for eslint
    ],
    coverageReporters: ["text"],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 0,
        },
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    preset: "ts-jest",
    rootDir: resolve("./"),
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "dist/",
        "src/",
        "/node_modules/",
        "([^s]+).config.(js|ts|tsx)",
        ".eslintrc.js(on)?",
    ],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
    verbose: true,
    useStderr: true,
};

module.exports = jestConfig;
