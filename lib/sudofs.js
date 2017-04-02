"use strict";

const execFileSync = require("child_process").execFileSync;

function sudoExecSync() {
  execFileSync(
    "/usr/bin/sudo",
    ["-H"].concat(Array.from(arguments)),
    { stdio: "inherit" }
  );
}

exports.unlinkSync = (path) => {
  sudoExecSync("/bin/rm", "-f", path);
};

exports.symlinkSync = (target, path) => {
  sudoExecSync("/bin/ln", "-snf", target, path);
};
