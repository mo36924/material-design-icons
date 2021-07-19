import { expect, test } from "@jest/globals";
import { access } from "fs/promises";
import { sep } from "path";
import * as mod from "./index";

const dir = process.cwd() + sep;

test("material-design-icons", async () => {
  expect(Object.keys(mod)).toMatchInlineSnapshot(`
Array [
  "materialIconsOutlinedRegularCodepoints",
  "materialIconsOutlinedRegularLigatures",
  "materialIconsOutlinedRegularOtf",
  "materialIconsOutlinedRegularWoff",
  "materialIconsOutlinedRegularWoff2",
  "materialIconsRegularCodepoints",
  "materialIconsRegularLigatures",
  "materialIconsRegularTtf",
  "materialIconsRegularWoff",
  "materialIconsRegularWoff2",
  "materialIconsRoundRegularCodepoints",
  "materialIconsRoundRegularLigatures",
  "materialIconsRoundRegularOtf",
  "materialIconsRoundRegularWoff",
  "materialIconsRoundRegularWoff2",
  "materialIconsSharpRegularCodepoints",
  "materialIconsSharpRegularLigatures",
  "materialIconsSharpRegularOtf",
  "materialIconsSharpRegularWoff",
  "materialIconsSharpRegularWoff2",
  "materialIconsTwoToneRegularCodepoints",
  "materialIconsTwoToneRegularLigatures",
  "materialIconsTwoToneRegularOtf",
  "materialIconsTwoToneRegularWoff",
  "materialIconsTwoToneRegularWoff2",
  "paths",
]
`);
  expect(Buffer.isBuffer(mod.materialIconsRegularTtf)).toBe(true);
  expect(mod.materialIconsRegularCodepoints).toBeTruthy();
  expect(typeof mod.materialIconsRegularCodepoints).toBe("object");
  expect(Object.keys(mod.materialIconsRegularCodepoints).length).toBeGreaterThan(100);
  expect(Object.values(mod.materialIconsRegularCodepoints).every((codepoin) => typeof codepoin === "string")).toBe(
    true,
  );
  expect(Object.keys(mod.paths)).toMatchInlineSnapshot(`
Array [
  "MaterialIcons-Regular.codepoints",
  "MaterialIcons-Regular.ttf",
  "MaterialIcons-Regular.woff",
  "MaterialIcons-Regular.woff2",
  "MaterialIconsOutlined-Regular.codepoints",
  "MaterialIconsOutlined-Regular.otf",
  "MaterialIconsOutlined-Regular.woff",
  "MaterialIconsOutlined-Regular.woff2",
  "MaterialIconsRound-Regular.codepoints",
  "MaterialIconsRound-Regular.otf",
  "MaterialIconsRound-Regular.woff",
  "MaterialIconsRound-Regular.woff2",
  "MaterialIconsSharp-Regular.codepoints",
  "MaterialIconsSharp-Regular.otf",
  "MaterialIconsSharp-Regular.woff",
  "MaterialIconsSharp-Regular.woff2",
  "MaterialIconsTwoTone-Regular.codepoints",
  "MaterialIconsTwoTone-Regular.otf",
  "MaterialIconsTwoTone-Regular.woff",
  "MaterialIconsTwoTone-Regular.woff2",
]
`);
  expect(Object.values(mod.paths).every((path) => path.startsWith(dir))).toBe(true);
  const results = await Promise.allSettled(Object.values(mod.paths).map((path) => access(path)));
  expect(results.every((result) => result.status === "fulfilled")).toBe(true);
});
