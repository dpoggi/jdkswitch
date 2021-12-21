#!/usr/bin/env node

"use strict";

import inquirer from "inquirer";
import stripAnsi from "strip-ansi";
import table from "text-table";

import { JDK } from "../lib/jdk.js";

const jdks = [new JDK(null), ...JDK.all];
const selectedJDKIndex = jdks.findIndex((jdk) => jdk.selected);

const tableOptions = {
  hsep: "      ",
  stringLength: (str) => stripAnsi(str).length,
};
const tableRows = table(jdks.map((jdk) => jdk.view.tableRow), tableOptions)
  .split("\n")
  .map((row, i) => {
    return {
      name: row,
      value: i,
      short: jdks[i].dirname,
    };
  });

inquirer
  .prompt([
    {
      type: "list",
      name: "jdk",
      message: "Which JDK would you like to use?",
      choices: tableRows,
      default: selectedJDKIndex,
    },
  ])
  .then((answers) => {
    const jdk = jdks[answers["jdk"]];
    jdk.select();
    console.log(`\n${jdk.view.selectedMessage}`);
  })
  .catch((err) => {
    console.log(`\n${err}`);
    process.exit(1);
  });
