"use strict";

import fs from "fs";
import path from "path";

import chalk from "chalk";
import plist from "plist";

import * as sudofs from "./sudofs.js";

const homeSymlinkPath = "/Library/Java/Home";
const jvmsDirectoryPath = "/Library/Java/JavaVirtualMachines";

function checkHomeSymlinkExists() {
  const stats = fs.lstatSync(homeSymlinkPath, { throwIfNoEntry: false });
  return stats?.isSymbolicLink() ?? false;
}

function findCurrentSelectedJDKPath() {
    if (!checkHomeSymlinkExists()) {
      return null;
    }

    try {
      const selectedHomePath = fs.readlinkSync(homeSymlinkPath);
      return path.resolve(selectedHomePath, "..", "..");
    } catch (e) {
      return null;
    }
}

export class JDK {
  static get all() {
    // Let this throw if it fails. Nothing to see here.
    return fs.readdirSync(jvmsDirectoryPath)
        .map(node => path.join(jvmsDirectoryPath, node))
        .filter(node => fs.lstatSync(node).isDirectory())
        .map(dir => {
          try {
            return new JDK(dir);
          } catch (e) {
            return null;
          }
        })
        .filter(jdk => jdk != null)
        .sort((lhs, rhs) => {
          const majorVersionCmp = rhs.majorVersion - lhs.majorVersion;
          if (majorVersionCmp !== 0) return majorVersionCmp;
          return lhs.name.localeCompare(rhs.name);
        });
  }

  constructor(jdkPath) {
    if (jdkPath != null) {
      this.jdkPath = jdkPath;
    } else {
      this.jdkPath = null;
      return;
    }

    const plistPath = path.join(jdkPath, "Contents", "Info.plist");
    const plistContents = fs.readFileSync(plistPath, "utf8");
    this.infoPlist = plist.parse(plistContents);
  }

  get view() {
    return new JDKView(this);
  }

  get selected() {
    return this.jdkPath === findCurrentSelectedJDKPath();
  }

  get dirname() {
    return (this.jdkPath != null) ? path.basename(this.jdkPath) : "N/A";
  }

  get homePath() {
    return (this.jdkPath != null) ? path.join(this.jdkPath, "Contents", "Home") : null;
  }

  get name() {
    return this.infoPlist?.["CFBundleGetInfoString"] ?? "None";
  }

  get vendor() {
    return this.infoPlist?.["JavaVM"]?.["JVMVendor"] ?? "N/A";
  }

  get majorVersion() {
    const majorVersion = this.infoPlist?.["JavaVM"]?.["JVMPlatformVersion"]?.replace(/^1\./, "");
    return parseInt(majorVersion ?? String(Number.MAX_SAFE_INTEGER));
  }

  select() {
    if (this.selected) {
      return;
    }

    if (checkHomeSymlinkExists()) {
      sudofs.unlinkSync(homeSymlinkPath);
    }
    if (this.homePath != null) {
      sudofs.symlinkSync(this.homePath, homeSymlinkPath);
    }
  }
}

class JDKView {
  constructor(jdk) {
    this._jdk = jdk;
  }

  get tableRow() {
    return [this.name, this.vendor, this.dirname];
  }

  get selectedMessage() {
    if (this._jdk.jdkPath != null) {
      return `Using ${this.name} by ${this.vendor}.`;
    } else {
      return chalk.red(`No JDK selected, removing symlink at ${homeSymlinkPath}.`);
    }
  }

  get name() {
    const nameColor = this._jdk.jdkPath != null ? chalk.bold : chalk.red;
    return nameColor(this._jdk.name);
  }

  get vendor() {
    const vendorColor = this._jdk.jdkPath != null ? chalk.blue : chalk.red;
    return vendorColor(this._jdk.vendor);
  }

  get dirname() {
    const dirnameColor = this._jdk.jdkPath != null ? chalk.green : chalk.red;
    return dirnameColor(this._jdk.dirname);
  }
}
