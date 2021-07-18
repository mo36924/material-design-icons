import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const fontDir = "font";
const codepointsDir = "codepoints";
const ligaturesDir = "ligatures";
const exports: { [path: string]: { [condition: string]: string } } = {};
const [basenames] = await Promise.all([
  readdir(fontDir),
  mkdir(codepointsDir, { recursive: true }),
  mkdir(ligaturesDir, { recursive: true }),
]);
const trimExtension = (basename: string) => basename.replace(/\.\w+$/, "");
const validIdentifier = (basename: string) => basename.replace(/\W/g, "");
await Promise.all(
  basenames
    .filter((basename) => basename.endsWith(".codepoints"))
    .map(async (basename) => {
      const data = await readFile(join(fontDir, basename), "utf-8");
      const codepoints = Object.fromEntries(
        data
          .trim()
          .split("\n")
          .map((line) => line.split(" ")),
      );
      const ligatures = Object.fromEntries(Object.entries(codepoints).map((entries) => entries.reverse()));
      await writeFile(
        join(codepointsDir, `${trimExtension(basename)}.d.ts`),
        `declare const _default: {[ligature: string]: string};export default _default;`,
      );
      await writeFile(
        join(ligaturesDir, `${trimExtension(basename)}.d.ts`),
        `declare const _default: {[codepoint: string]: string};export default _default;`,
      );
      await writeFile(
        join(codepointsDir, `${trimExtension(basename)}.js`),
        `export default Object.assign(Object.create(null),${JSON.stringify(codepoints)});`,
      );
      await writeFile(
        join(ligaturesDir, `${trimExtension(basename)}.js`),
        `export default Object.assign(Object.create(null),${JSON.stringify(ligatures)});`,
      );
      await writeFile(
        join(codepointsDir, `${trimExtension(basename)}.cjs`),
        `"use strict";module.exports = Object.assign(Object.create(null),${JSON.stringify(codepoints)});`,
      );
      await writeFile(
        join(ligaturesDir, `${trimExtension(basename)}.cjs`),
        `"use strict";module.exports = Object.assign(Object.create(null),${JSON.stringify(ligatures)});`,
      );
      exports[`./${codepointsDir}/${trimExtension(basename)}`] = {
        import: `./${codepointsDir}/${trimExtension(basename)}.js`,
        require: `./${codepointsDir}/${trimExtension(basename)}.cjs`,
        default: `./${codepointsDir}/${trimExtension(basename)}.js`,
      };
      exports[`./${ligaturesDir}/${trimExtension(basename)}`] = {
        import: `./${ligaturesDir}/${trimExtension(basename)}.js`,
        require: `./${ligaturesDir}/${trimExtension(basename)}.cjs`,
        default: `./${ligaturesDir}/${trimExtension(basename)}.js`,
      };
    }),
);

const entries = Object.keys(exports)
  .sort()
  .map((key) => [key, exports[key]] as const);
const js = entries
  .map(([path, conditions]) => `export { default as ${validIdentifier(path)} } from "${conditions.import}";`)
  .join("");
const cjs = entries
  .map(([path, conditions]) => `exports.${validIdentifier(path)} = require("${conditions.require}");`)
  .join("");
const dts = entries
  .map(
    ([path, conditions]) =>
      `export { default as ${validIdentifier(path)} } from "${trimExtension(conditions.import)}";`,
  )
  .join("");
const json = await readFile("package.json", "utf-8");
const pkg = JSON.parse(json);
pkg.module = "./index.js";
pkg.main = "./index.cjs";
pkg.exports = {
  ".": {
    import: "./index.js",
    require: "./index.cjs",
    default: "./index.js",
  },
  ...Object.fromEntries(entries),
};
await Promise.all([
  writeFile("index.js", js),
  writeFile("index.cjs", `"use strict";${cjs}`),
  writeFile("index.d.ts", dts),
  writeFile("package.json", JSON.stringify(pkg)),
]);
