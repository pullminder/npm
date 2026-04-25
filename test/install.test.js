"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { parseChecksums, sha256 } = require("../install.js");

test("parseChecksums splits well-formed lines", () => {
  const text = [
    "abc123  pullminder-linux-amd64",
    "def456  pullminder-darwin-arm64",
    "",
    "  ",
  ].join("\n");
  const map = parseChecksums(text);
  assert.equal(map["pullminder-linux-amd64"], "abc123");
  assert.equal(map["pullminder-darwin-arm64"], "def456");
});

test("sha256 matches Node crypto reference", () => {
  const buf = Buffer.from("hello");
  const expected = crypto.createHash("sha256").update(buf).digest("hex");
  assert.equal(sha256(buf), expected);
});

test("verifyChecksum throws on hash mismatch", async () => {
  const { verifyChecksum } = require("../install.js");
  // Stub download by overriding require cache is brittle; instead build a
  // fixture that hits an in-process HTTP server.
  const http = require("node:http");
  const server = http.createServer((req, res) => {
    if (req.url.endsWith("/checksums.txt")) {
      res.writeHead(200);
      res.end(
        "0000000000000000000000000000000000000000000000000000000000000000  pullminder-linux-amd64\n",
      );
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const releaseUrl =
    "http://127.0.0.1:" + port + "/release/pullminder-linux-amd64";
  await assert.rejects(
    verifyChecksum(
      Buffer.from("real-binary-bytes"),
      "pullminder-linux-amd64",
      releaseUrl,
    ),
    /checksum verification failed for pullminder-linux-amd64/,
  );
  server.close();
});

test("verifyChecksum throws when binary missing from checksums.txt", async () => {
  const { verifyChecksum } = require("../install.js");
  const http = require("node:http");
  const server = http.createServer((req, res) => {
    if (req.url.endsWith("/checksums.txt")) {
      res.writeHead(200);
      res.end("abc  some-other-binary\n");
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const releaseUrl =
    "http://127.0.0.1:" + port + "/release/pullminder-linux-amd64";
  await assert.rejects(
    verifyChecksum(Buffer.from("x"), "pullminder-linux-amd64", releaseUrl),
    /not listed in/,
  );
  server.close();
});

test("verifyChecksum passes on matching hash", async () => {
  const { verifyChecksum } = require("../install.js");
  const http = require("node:http");
  const buf = Buffer.from("the binary contents");
  const hash = require("node:crypto")
    .createHash("sha256")
    .update(buf)
    .digest("hex");
  const server = http.createServer((req, res) => {
    if (req.url.endsWith("/checksums.txt")) {
      res.writeHead(200);
      res.end(hash + "  pullminder-linux-amd64\n");
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const releaseUrl =
    "http://127.0.0.1:" + port + "/release/pullminder-linux-amd64";
  await verifyChecksum(buf, "pullminder-linux-amd64", releaseUrl);
  server.close();
});
