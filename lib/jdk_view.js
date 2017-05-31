"use strict";

const chalk = require("chalk");

class JDKView {

  constructor(jdk) {
    if (jdk.homePath == null) {
      this.tableRow = [
        chalk.red(jdk.name),
        chalk.red(jdk.vendor),
        chalk.red(jdk.dirName),
      ];

      this.selectedMessage = chalk.red("No JDK selected.");

      return;
    }

    const name = chalk.bold(jdk.name);
    const vendor = chalk.blue(jdk.vendor);
    const dirName = chalk.green(jdk.dirName);

    this.tableRow = [
      name,
      vendor,
      dirName,
    ];

    this.selectedMessage = `Using ${name} by ${vendor}.`;
  }
}

module.exports = JDKView;
