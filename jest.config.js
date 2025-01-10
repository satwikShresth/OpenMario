"use strict";
// copied from
// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#examples
Object.defineProperty(exports, "__esModule", { value: true });
var jestConfig = {
    // [...]
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};
exports.default = jestConfig;
