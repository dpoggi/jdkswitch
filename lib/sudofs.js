"use strict";

const execFileSync = require("child_process").execFileSync;

const sudoExecSync = (...args) => {
  execFileSync(
    "/usr/bin/sudo",
    ["-H"].concat(args),
    { stdio: "inherit" }
  );
};

exports.unlinkSync = (path) => {
  sudoExecSync("/bin/rm", "-f", path);
};

exports.symlinkSync = (target, path) => {
  sudoExecSync("/bin/ln", "-snf", target, path);
};
