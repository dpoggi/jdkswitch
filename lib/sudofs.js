"use strict";

const execFileSync = require("child_process").execFileSync;

function symlinkSync(target, path, type) {
  sudoExecFileSync("/bin/ln", ["-snf", target, path], { stdio: "inherit" });
};

function unlinkSync(path) {
  sudoExecFileSync("/bin/rm", ["-f", path], { stdio: "inherit" });
}

function sudoExecFileSync(file, args, options) {
  return execFileSync("/usr/bin/sudo", ["-H", "--", file, ...(args || [])], options);
}

exports.symlinkSync = symlinkSync;
exports.unlinkSync = unlinkSync;
