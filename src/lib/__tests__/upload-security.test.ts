import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import {
  readUploadedFile,
  sanitizeSvg,
  isSvgDocument,
  deleteStoredFile,
  UploadError,
} from "../upload-security";

function svgFile(content: string, name = "logo.svg", type = "image/svg+xml") {
  return new File([content], name, { type });
}

const SAFE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';

describe("isSvgDocument", () => {
  it("accepts a well-formed svg", () => {
    expect(isSvgDocument(SAFE_SVG)).toBe(true);
  });

  it("rejects non-svg text", () => {
    expect(isSvgDocument("<html><body>hi</body></html>")).toBe(false);
  });
});

describe("sanitizeSvg", () => {
  it("keeps safe markup intact", () => {
    expect(sanitizeSvg(Buffer.from(SAFE_SVG)).toString("utf8")).toContain("<circle");
  });

  it("strips script elements", () => {
    const out = sanitizeSvg(
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect/></svg>')
    ).toString("utf8");
    expect(out).not.toMatch(/script/i);
    expect(out).toContain("<rect");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeSvg(
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle onload="alert(1)" r="5"/></svg>')
    ).toString("utf8");
    expect(out).not.toMatch(/onload/i);
  });

  it("strips javascript: links", () => {
    const out = sanitizeSvg(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>'
      )
    ).toString("utf8");
    expect(out).not.toMatch(/javascript:/i);
  });

  it("strips foreignObject payloads", () => {
    const out = sanitizeSvg(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><img src=x onerror="alert(1)"/></body></foreignObject></svg>'
      )
    ).toString("utf8");
    expect(out).not.toMatch(/foreignObject/i);
    expect(out).not.toMatch(/onerror/i);
  });

  it("rejects entity declarations (xxe)", () => {
    expect(() =>
      sanitizeSvg(
        Buffer.from(
          '<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><text>&xxe;</text></svg>'
        )
      )
    ).toThrow(UploadError);
  });

  it("rejects content that is not an svg", () => {
    expect(() => sanitizeSvg(Buffer.from("<html>nope</html>"))).toThrow(UploadError);
  });
});

describe("readUploadedFile svg handling", () => {
  it("accepts a valid svg and reports image/svg+xml", async () => {
    const res = await readUploadedFile(svgFile(SAFE_SVG));
    expect(res.ext).toBe("svg");
    expect(res.mime).toBe("image/svg+xml");
  });

  it("sanitizes on the way in", async () => {
    const res = await readUploadedFile(
      svgFile('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect/></svg>')
    );
    expect(res.buffer.toString("utf8")).not.toMatch(/script/i);
  });

  it("rejects a binary file disguised as svg", async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    await expect(readUploadedFile(svgFile(png.toString("binary")))).rejects.toThrow(UploadError);
  });

  it("validates content even when the claimed mime is generic", async () => {
    const res = await readUploadedFile(svgFile(SAFE_SVG, "logo.svg", "application/octet-stream"));
    expect(res.ext).toBe("svg");
  });

  it("still rejects active mime types such as text/html", async () => {
    await expect(readUploadedFile(svgFile(SAFE_SVG, "logo.svg", "text/html"))).rejects.toThrow(
      UploadError
    );
  });
});

describe("deleteStoredFile", () => {
  const originalUploadsDir = process.env.UPLOADS_DIR;
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "unitrack-upload-"));
    process.env.UPLOADS_DIR = tmpRoot;
  });

  afterEach(() => {
    if (originalUploadsDir === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = originalUploadsDir;
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("removes a stored file from the uploads root", () => {
    const name = `${crypto.randomUUID()}.pdf`;
    const target = path.join(tmpRoot, name);
    fs.writeFileSync(target, "hello");

    deleteStoredFile(`/uploads/${name}`);

    expect(fs.existsSync(target)).toBe(false);
  });

  it("is a no-op for urls outside the uploads prefix", () => {
    const outside = path.join(tmpRoot, "..", "keep-me.txt");
    const target = path.resolve(outside);
    fs.writeFileSync(target, "keep");

    deleteStoredFile("/uploads/../keep-me.txt");
    deleteStoredFile("https://example.com/evil.pdf");
    deleteStoredFile("");

    expect(fs.existsSync(target)).toBe(true);
    fs.rmSync(target, { force: true });
  });

  it("refuses to escape the uploads root via traversal", () => {
    const victim = path.join(tmpRoot, "..", "victim.txt");
    const target = path.resolve(victim);
    fs.writeFileSync(target, "victim");

    deleteStoredFile("/uploads/../victim.txt");

    expect(fs.existsSync(target)).toBe(true);
    fs.rmSync(target, { force: true });
  });

  it("ignores a missing file without throwing", () => {
    expect(() => deleteStoredFile(`/uploads/${crypto.randomUUID()}.png`)).not.toThrow();
  });
});
