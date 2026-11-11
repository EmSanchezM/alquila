import { describe, expect, test } from "bun:test";

import { safeFileHref } from "./safe-href";

describe("safeFileHref", () => {
  test("keeps our uploads and http(s) URLs", () => {
    expect(safeFileHref("/api/files/u/019a0000-0000-7000-8000-000000000001.pdf")).toBe("/api/files/u/019a0000-0000-7000-8000-000000000001.pdf");
    expect(safeFileHref("https://legacy.example/r.pdf")).toBe("https://legacy.example/r.pdf");
    expect(safeFileHref("http://legacy.example/r.pdf")).toBe("http://legacy.example/r.pdf");
  });

  test("drops script and other schemes, relative paths and empty values", () => {
    for (const url of ["/api/files/u/../../auth/sign-out", "/api/files/u/019a0000-0000-7000-8000-000000000001.html", "javascript:alert(1)", "JavaScript:alert(1)", " javascript:alert(1)", "data:text/html,<script>1</script>", "vbscript:x", "/other/path.pdf", "c.pdf", "", null, undefined]) {
      expect(safeFileHref(url)).toBeNull();
    }
  });
});
