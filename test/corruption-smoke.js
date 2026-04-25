"use strict";
// Stand up a fake release server that returns a binary AND a checksums.txt
// whose hash deliberately does not match. Run main() and assert it exits
// non-zero.

const http = require("node:http");

const fakeBinary = Buffer.from("not-a-real-binary");
const wrongHash = "0".repeat(64);
const platform = process.platform === "win32" ? "windows" : process.platform;
const arch = process.arch === "x64" ? "amd64" : process.arch;
const ext = platform === "windows" ? ".exe" : "";
const binaryName = "pullminder-" + platform + "-" + arch + ext;

const server = http.createServer((req, res) => {
  if (req.url.endsWith("/checksums.txt")) {
    res.writeHead(200);
    res.end(wrongHash + "  " + binaryName + "\n");
    return;
  }
  if (req.url.endsWith(binaryName)) {
    res.writeHead(200);
    res.end(fakeBinary);
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(0, () => {
  const port = server.address().port;
  // Patch install.js's URL constant via env override is not supported, so we
  // run a small JS that requires the helpers and asserts directly.
  const verify = require("../install.js").verifyChecksum;
  const releaseUrl = "http://127.0.0.1:" + port + "/release/" + binaryName;
  verify(fakeBinary, binaryName, releaseUrl).then(
    () => {
      console.error("FAIL: verifyChecksum accepted a wrong hash");
      process.exit(1);
    },
    (err) => {
      if (/checksum verification failed/.test(err.message)) {
        console.log("OK: tampered checksum rejected:", err.message);
        server.close();
        process.exit(0);
      }
      console.error("FAIL: unexpected error:", err);
      process.exit(1);
    },
  );
});
