"use strict";

const fs = require("fs");
const path = require("path");
const plist = require("plist");
const chalk = require("chalk");
const sudofs = require("./sudofs");

const homeLinkPath = "/Library/Java/Home";
const jvmsDirPath = "/Library/Java/JavaVirtualMachines";

let homeLinkExists;

try {
  homeLinkExists = fs.lstatSync(homeLinkPath).isSymbolicLink();
} catch (e) {
  homeLinkExists = false;
}

let selectedJdkPath;

if (homeLinkExists) {
  try {
    const selectedHomePath = fs.readlinkSync(homeLinkPath);
    selectedJdkPath = path.resolve(selectedHomePath, "..", "..");
  } catch (e) {
    selectedJdkPath = null;
  }
} else {
  selectedJdkPath = null;
}

class JDK {

  // Let this throw if it fails. Nothing to see here.
  static get all() {
    return fs.readdirSync(jvmsDirPath)
        .map(f => path.join(jvmsDirPath, f))
        .filter(f => fs.lstatSync(f).isDirectory())
        .map(d => {
          try {
            return new JDK(d);
          } catch (e) {
            return null;
          }
        })
        .filter(j => j != null)
        .sort(JDK.compareFn);
  }

  static compareFn(a, b) {
    const majorVersionCmp = b.majorVersion - a.majorVersion;

    if (majorVersionCmp !== 0) {
      return majorVersionCmp;
    }

    return a.name.localeCompare(b.name);
  }

  constructor(jdkPath) {
    this.selected = jdkPath === selectedJdkPath;

    if (jdkPath == null) {
      this.dirName = "N/A";
      this.homePath = null;

      this.name = "None";
      this.vendor = "N/A";

      this.majorVersion = 999;

      return;
    }

    this.dirName = path.basename(jdkPath);
    this.homePath = path.join(jdkPath, "Contents", "Home");

    const plistPath = path.join(jdkPath, "Contents", "Info.plist");
    const infoPlist = plist.parse(fs.readFileSync(plistPath, "utf8"));

    this.name = infoPlist["CFBundleGetInfoString"];
    this.vendor = infoPlist["JavaVM"]["JVMVendor"];

    const platformVersion = infoPlist["JavaVM"]["JVMPlatformVersion"];
    this.majorVersion = Number.parseInt(platformVersion.replace(/^1\./, ""));
  }

  select() {
    if (homeLinkExists) {
      sudofs.unlinkSync(homeLinkPath);
    }

    if (this.homePath != null) {
      sudofs.symlinkSync(this.homePath, homeLinkPath);
    }
  }

  get tableRow() {
    return [
      this.styledName,
      this.styledVendor,
      this.styledDirName,
    ];
  }

  get selectedMessage() {
    if (this.homePath != null) {
      return `Using ${this.styledName} by ${this.styledVendor}`;
    } else {
      return chalk.red("No JDK selected");
    }
  }

  get styledName() {
    if (this.homePath != null) {
      return chalk.bold(this.name);
    } else {
      return chalk.red(this.name);
    }
  }

  get styledVendor() {
    if (this.homePath != null) {
      return chalk.blue(this.vendor);
    } else {
      return chalk.red(this.vendor);
    }
  }

  get styledDirName() {
    if (this.homePath != null) {
      return chalk.green(this.dirName);
    } else {
      return chalk.red(this.dirName);
    }
  }
}

module.exports = JDK;
