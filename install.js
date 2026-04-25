#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const crypto = require("crypto");

function parseChecksums(text) {
  // Format: "<sha256>  <filename>" per line
  var map = {};
  text.split(/\r?\n/).forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed) return;
    var parts = trimmed.split(/\s+/);
    if (parts.length < 2) return;
    map[parts[1]] = parts[0];
  });
  return map;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function verifyChecksum(buf, binaryName, releaseUrl) {
  var checksumsUrl =
    releaseUrl.substring(0, releaseUrl.lastIndexOf("/") + 1) + "checksums.txt";
  var checksumsBuf = await download(checksumsUrl);
  var map = parseChecksums(checksumsBuf.toString("utf8"));
  var expected = map[binaryName];
  if (!expected) {
    throw new Error(
      "checksum verification failed: " +
        binaryName +
        " not listed in " +
        checksumsUrl,
    );
  }
  var actual = sha256(buf);
  if (expected !== actual) {
    throw new Error(
      "checksum verification failed for " +
        binaryName +
        " (expected " +
        expected +
        ", got " +
        actual +
        ")",
    );
  }
}

const VERSION = require("./package.json").version;
const REPO = "pullminder/cli";

const PLATFORM_MAP = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
};

const ARCH_MAP = {
  x64: "amd64",
  arm64: "arm64",
};

function getBinaryName() {
  const platform = PLATFORM_MAP[process.platform];
  const arch = ARCH_MAP[process.arch];

  if (!platform) {
    throw new Error("Unsupported platform: " + process.platform);
  }
  if (!arch) {
    throw new Error("Unsupported architecture: " + process.arch);
  }

  const ext = platform === "windows" ? ".exe" : "";
  return "pullminder-" + platform + "-" + arch + ext;
}

function download(url) {
  return new Promise(function (resolve, reject) {
    var client = url.startsWith("https") ? https : http;
    client
      .get(
        url,
        { headers: { "User-Agent": "pullminder-npm" } },
        function (res) {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            return download(res.headers.location).then(resolve, reject);
          }
          if (res.statusCode !== 200) {
            return reject(new Error("Download failed: HTTP " + res.statusCode));
          }
          var chunks = [];
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
          res.on("end", function () {
            resolve(Buffer.concat(chunks));
          });
          res.on("error", reject);
        },
      )
      .on("error", reject);
  });
}

async function main() {
  var binaryName = getBinaryName();
  var url =
    "https://github.com/" +
    REPO +
    "/releases/download/v" +
    VERSION +
    "/" +
    binaryName;
  var ext = process.platform === "win32" ? ".exe" : "";
  var dest = path.join(__dirname, "bin", "pullminder" + ext);

  fs.mkdirSync(path.join(__dirname, "bin"), { recursive: true });

  console.log(
    "Downloading pullminder v" +
      VERSION +
      " for " +
      process.platform +
      "/" +
      process.arch +
      "...",
  );

  var data = await download(url);
  await verifyChecksum(data, binaryName, url);
  fs.writeFileSync(dest, data);
  fs.chmodSync(dest, 0o755);

  console.log("Installed pullminder to " + dest);
}

main().catch(function (err) {
  console.error("Failed to install pullminder: " + err.message);
  process.exit(1);
});
