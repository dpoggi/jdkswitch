"use strict";

import fs from "fs";
import path from "path";

import chalk from "chalk";
import plist from "plist";
import semver from "semver";

import * as sudofs from "./sudofs.js";

const homeSymlinkPath = "/Library/Java/Home";
const jvmsDirectoryPath = "/Library/Java/JavaVirtualMachines";
const androidJDKDirname = "Android Studio.app/Contents/jbr";
const androidJDKPath = `/Applications/${androidJDKDirname}`;

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
    // Let things throw if they fail. Nothing to see here.
    const jdks = fs.readdirSync(jvmsDirectoryPath)
        .map(node => path.join(jvmsDirectoryPath, node))
        .filter(node => fs.lstatSync(node).isDirectory())
        .map(dir => {
          try {
            return new JDK(dir);
          } catch (e) {
            return null;
          }
        })
        .filter(jdk => jdk != null);

    try {
      const androidJDK = new JDK(androidJDKPath);
      androidJDK.dirname = androidJDKDirname;
      jdks.push(androidJDK);
    } catch (e) {
    }

    jdks.sort((lhs, rhs) => {
      const versionCmp = semver.compare(rhs.sortVersion, lhs.sortVersion);
      if (versionCmp !== 0) return versionCmp;
      return lhs.name.localeCompare(rhs.name);
    });

    return jdks;
  }

  constructor(jdkPath) {
    if (jdkPath == null) {
      this.jdkPath = null;
      this.dirname = "N/A";
      return;
    }

    const plistPath = path.join(jdkPath, "Contents", "Info.plist");
    const plistContents = fs.readFileSync(plistPath, "utf8");

    this.jdkPath = jdkPath;
    this.dirname = path.basename(jdkPath);
    this.infoPlist = plist.parse(plistContents);
  }

  get view() {
    return new JDKView(this);
  }

  get selected() {
    return this.jdkPath === findCurrentSelectedJDKPath();
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

  get sortVersion() {
    return this.infoPlist?.["JavaVM"]?.["JVMVersion"]
      ?.replace(/^1\./, "")
      ?.replace(/_/, ".")
      ?.replace(/^(\d+)\.(\d+)\.(\d+)\.\d+$/, "$1.$2.$3")
      ?? "0.0.0";
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
    this.jdk = jdk;
  }

  get tableRow() {
    return [this.name, this.vendor, this.dirname];
  }

  get selectedMessage() {
    if (this.jdk.jdkPath != null) {
      return `Using ${this.name} by ${this.vendor}.`;
    } else {
      return chalk.red(`No JDK selected, removing symlink at ${homeSymlinkPath}.`);
    }
  }

  get name() {
    if (this.jdk.jdkPath != null) {
      return chalk.bold(this.jdk.name);
    } else {
      return chalk.red(this.jdk.name);
    }
  }

  get vendor() {
    if (this.jdk.jdkPath != null) {
      return chalk.blue(this.jdk.vendor);
    } else {
      return chalk.red(this.jdk.vendor);
    }
  }

  get dirname() {
    if (this.jdk.jdkPath != null) {
      return chalk.green(this.jdk.dirname);
    } else {
      return chalk.red(this.jdk.dirname);
    }
  }
}
