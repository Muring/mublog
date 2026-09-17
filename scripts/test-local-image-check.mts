import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkLocalImage } from "./local-image-check.mjs";
const dir = mkdtempSync(join(tmpdir(), "local-image-check-"));
try {
    mkdirSync(join(dir, "images"));
    writeFileSync(join(dir, "images/a?b#c.png"), "fixture");
    assert.equal(checkLocalImage("/images/a%3Fb%23c.png?download=1#preview", dir).state, "present");
    assert.equal(checkLocalImage("/images/absent.png", dir).state, "missing");
    assert.equal(checkLocalImage("https://example.invalid/a.png", dir).state, "remote-unverified");
    assert.equal(checkLocalImage("//example.invalid/a.png", dir).state, "remote-unverified");
    for (const value of ["/../secret", "/%2e%2e/secret", "/bad%ZZ", "file:///etc/passwd", "relative.png", "/%00.png"])
        assert.equal(checkLocalImage(value, dir).state, "invalid", value);
    console.log("PASS: remote URLs, encoded filenames, missing files and invalid paths");
} finally { rmSync(dir, { recursive: true, force: true }); }
