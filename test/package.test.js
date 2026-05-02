"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pkg = require("../package.json");

test("package.json license matches LICENSE file (Apache-2.0)", () => {
  const licenseText = fs.readFileSync(
    path.join(__dirname, "..", "LICENSE"),
    "utf8",
  );
  assert.match(licenseText, /Apache License\s+Version 2\.0/);
  assert.equal(pkg.license, "Apache-2.0");
});

test("package.json declares a bugs URL pointing at the GitHub issue tracker", () => {
  assert.ok(pkg.bugs, "package.json must declare a bugs field");
  assert.equal(pkg.bugs.url, "https://github.com/pullminder/npm/issues");
});

test("package.json homepage and repository remain canonical", () => {
  assert.equal(pkg.homepage, "https://pullminder.com");
  assert.equal(pkg.repository.type, "git");
  assert.equal(pkg.repository.url, "https://github.com/pullminder/npm.git");
});
