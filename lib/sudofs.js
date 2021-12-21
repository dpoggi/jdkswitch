"use strict";

import { execFileSync } from "child_process";

export function symlinkSync(target, path, type) {
  sudoExecFileSync("/bin/ln", ["-snf", target, path]);
};

export function unlinkSync(path) {
  sudoExecFileSync("/bin/rm", ["-f", path]);
}

function sudoExecFileSync(file, args, options) {
  options = Object.assign({ stdio: "inherit" }, options ?? {});
  return execFileSync(
    "/usr/bin/sudo",
    ["-H", "--", file, ...(args ?? [])],
    options
  );
}
