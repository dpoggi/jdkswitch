"use strict";

const chalk = require("chalk");

class JDKView {

  constructor(jdk) {
    this._jdk = jdk;
  }

  get tableRow() {
    return [this.name, this.vendor, this.dirname];
  }

  get selectedMessage() {
    return !!this._jdk.jdkPath ? `Using ${this.name} by ${this.vendor}.` : chalk.red("No JDK selected.");
  }

  get name() {
    return (!!this._jdk.jdkPath ? chalk.bold : chalk.red)(this._jdk.name);
  }

  get vendor() {
    return (!!this._jdk.jdkPath ? chalk.blue : chalk.red)(this._jdk.vendor);
  }

  get dirname() {
    return (!!this._jdk.jdkPath ? chalk.green : chalk.red)(this._jdk.dirname);
  }
}

module.exports = JDKView;
