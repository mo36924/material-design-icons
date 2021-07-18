import { expect, test } from "@jest/globals";
import * as mod from "./index";

test("test", () => {
  expect(Object.keys(mod)).toMatchInlineSnapshot(`
Array [
  "codepointsMaterialIconsRegular",
  "codepointsMaterialIconsOutlinedRegular",
  "codepointsMaterialIconsRoundRegular",
  "codepointsMaterialIconsSharpRegular",
  "codepointsMaterialIconsTwoToneRegular",
  "ligaturesMaterialIconsRegular",
  "ligaturesMaterialIconsOutlinedRegular",
  "ligaturesMaterialIconsRoundRegular",
  "ligaturesMaterialIconsSharpRegular",
  "ligaturesMaterialIconsTwoToneRegular",
]
`);
  expect(mod.codepointsMaterialIconsOutlinedRegular).toBeTruthy();
  expect(typeof mod.codepointsMaterialIconsOutlinedRegular).toBe("object");
  expect(Object.keys(mod.codepointsMaterialIconsOutlinedRegular).length > 100).toBe(true);
  expect(
    Object.values(mod.codepointsMaterialIconsOutlinedRegular).every((codepoin) => typeof codepoin === "string"),
  ).toBe(true);
});
