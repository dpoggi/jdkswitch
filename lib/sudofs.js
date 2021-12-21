"use strict";

const execFileSync = require("child_process").execFileSync;

function symlinkSync(target, path, type) {
  sudoExecFileSync("/bin/ln", ["-snf", target, path]);
};

function unlinkSync(path) {
  sudoExecFileSync("/bin/rm", ["-f", path]);
}

function sudoExecFileSync(file, args, options) {
  options = Object.assign({ stdio: "inherit" }, (options ?? {}));
  return execFileSync("/usr/bin/sudo", ["-H", "--", file, ...(args ?? [])], options);
}

exports.symlinkSync = symlinkSync;
exports.unlinkSync = unlinkSync;
