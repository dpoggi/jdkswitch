"use strict";

const fs = require("fs");
const path = require("path");
const plist = require("plist");

const JDKPaths = require("./jdk_paths");
const JDKView = require("./jdk_view");
const sudofs = require("./sudofs");

class JDK {

  // Let this throw if it fails. Nothing to see here.
  static get all() {
    return fs.readdirSync(JDKPaths.jvmsDirectory)
        .map(node => path.join(JDKPaths.jvmsDirectory, node))
        .filter(node => fs.lstatSync(node).isDirectory())
        .map(dir => {
          try {
            return new JDK(dir);
          } catch (e) {
            return null;
          }
        })
        .filter(jdk => !!jdk)
        .sort((lhs, rhs) => {
          const majorVersionCmp = rhs.majorVersion - lhs.majorVersion;
          if (majorVersionCmp !== 0) {
            return majorVersionCmp;
          }
          return lhs.name.localeCompare(rhs.name);
        });
  }

  constructor(jdkPath) {
    if (!jdkPath) {
      return;
    }

    this.jdkPath = jdkPath;

    const plistPath = path.join(jdkPath, "Contents", "Info.plist");
    this.infoPlist = plist.parse(fs.readFileSync(plistPath, "utf8"));
  }

  get selected() {
    return this.jdkPath === JDKPaths.selectedJDK;
  }

  get dirname() {
    return !!this.jdkPath ? path.basename(this.jdkPath) : "N/A";
  }

  get homePath() {
    return !!this.jdkPath ? path.join(this.jdkPath, "Contents", "Home") : null;
  }

  get name() {
    return !!this.infoPlist ? this.infoPlist["CFBundleGetInfoString"] : "None";
  }

  get vendor() {
    return !!this.infoPlist ? this.infoPlist["JavaVM"]["JVMVendor"] : "N/A";
  }

  get majorVersion() {
    if (!this._majorVersion) {
      if (!!this.infoPlist) {
        const majorVersion = this.infoPlist["JavaVM"]["JVMPlatformVersion"].replace(/^1\./, "");
        this._majorVersion = Number.parseInt(majorVersion);
      } else {
        this._majorVersion = Number.MAX_SAFE_INTEGER;
      }
    }
    return this._majorVersion;
  }

  select() {
    if (this.selected) {
      return;
    }
    if (JDKPaths.homeSymlinkExists) {
      sudofs.unlinkSync(JDKPaths.homeSymlink);
    }
    if (!!this.homePath) {
      sudofs.symlinkSync(this.homePath, JDKPaths.homeSymlink);
    }
  }

  get view() {
    if (!this._view) {
      this._view = new JDKView(this);
    }
    return this._view;
  }
}

module.exports = JDK;
