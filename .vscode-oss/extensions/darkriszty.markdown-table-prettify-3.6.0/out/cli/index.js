#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argumentsParser_1 = require("./argumentsParser");
const cliPrettify_1 = require("./cliPrettify");
const inputReader_1 = require("./inputReader");
const cliOptions = argumentsParser_1.parseArguments(process.argv);
inputReader_1.InputReader.subscribe(input => cliOptions.check
    ? cliPrettify_1.CliPrettify.check(input, cliOptions)
    : process.stdout.write(cliPrettify_1.CliPrettify.prettify(input, cliOptions)));
//# sourceMappingURL=index.js.map