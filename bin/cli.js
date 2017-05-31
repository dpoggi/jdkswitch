#!/usr/bin/env node

"use strict";

const table = require("text-table");
const inquirer = require("inquirer");
const chalk = require("chalk");
const JDK = require("../lib/jdk");

const jdks = [new JDK(null)].concat(JDK.all);

const currentJdkIndex = jdks.findIndex(jdk => jdk.selected);

const tableRows = table(
  jdks.map(jdk => jdk.view.tableRow),
  {
    hsep: "      ",
    stringLength: s => chalk.stripColor(s).length,
  }
).split("\n").map((row, i) => {
  return {
    name: row,
    value: i,
    short: jdks[i].dirName,
  };
});

inquirer.prompt([
  {
    type: "list",
    name: "jdk",
    message: "Which JDK would you like to use?",
    choices: tableRows,
    default: currentJdkIndex,
  },
]).then(answers => {
  const jdk = jdks[answers["jdk"]];

  jdk.select();

  console.log(`\n${jdk.view.selectedMessage}`);
}).catch(err => {
  console.log(`\n${err}`);

  process.exit(1);
});
