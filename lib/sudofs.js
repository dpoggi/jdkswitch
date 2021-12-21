"use strict";

import { execFileSync } from "child_process";

function sudoExecFileSync(file, args, options) {
  return execFileSync(
    "/usr/bin/sudo",
    ["--", file, ...(args ?? [])],
    Object.assign({ stdio: "inherit" }, options ?? {})
  );
}

export function symlinkSync(target, path, type) {
  sudoExecFileSync("/bin/ln", ["-snf", "--", target, path]);
}

export function unlinkSync(path) {
  sudoExecFileSync("/bin/rm", ["-f", "--", path]);
}
