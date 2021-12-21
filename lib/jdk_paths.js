"use strict";

const fs = require("fs");
const path = require("path");

class JDKPaths {

  static get homeSymlinkExists() {
    if (!this._homeSymlinkExists) {
      try {
        this._homeSymlinkExists = fs.lstatSync(this.homeSymlink).isSymbolicLink();
      } catch (e) {
        this._homeSymlinkExists = false;
      }
    }
    return this._homeSymlinkExists;
  }

  static get selectedJDK() {
    if (this._selectedJDK === undefined) {
      if (this.homeSymlinkExists) {
        try {
          const selectedHomePath = fs.readlinkSync(this.homeSymlink);
          this._selectedJDK = path.resolve(selectedHomePath, "..", "..");
        } catch (e) {
          this._selectedJDK = null;
        }
      } else {
        this._selectedJDK = null;
      }
    }
    return this._selectedJDK;
  }
}

JDKPaths.homeSymlink = "/Library/Java/Home";
JDKPaths.jvmsDirectory = "/Library/Java/JavaVirtualMachines";

module.exports = JDKPaths;
