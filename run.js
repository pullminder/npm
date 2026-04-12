#!/usr/bin/env node
"use strict";

var execFileSync = require("child_process").execFileSync;
var path = require("path");

var ext = process.platform === "win32" ? ".exe" : "";
var binary = path.join(__dirname, "bin", "pullminder" + ext);

try {
  execFileSync(binary, process.argv.slice(2), { stdio: "inherit" });
} catch (err) {
  if (err.status !== undefined) {
    process.exit(err.status);
  }
  console.error("Failed to run pullminder: " + err.message);
  process.exit(1);
}
