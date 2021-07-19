import { camelCase } from "change-case";
import download from "download";
// @ts-ignore
import { convert } from "fontverter";
import { readFile, writeFile } from "fs/promises";

const ligaturesExtension = "ligatures";
const exports: { [path: string]: { [condition: string]: string } } = {};
const trimExtension = (basename: string) => basename.replace(/\.\w+$/, "");
const basenames = [
  "MaterialIcons-Regular.codepoints",
  "MaterialIcons-Regular.ttf",
  "MaterialIconsOutlined-Regular.codepoints",
  "MaterialIconsOutlined-Regular.otf",
  "MaterialIconsRound-Regular.codepoints",
  "MaterialIconsRound-Regular.otf",
  "MaterialIconsSharp-Regular.codepoints",
  "MaterialIconsSharp-Regular.otf",
  "MaterialIconsTwoTone-Regular.codepoints",
  "MaterialIconsTwoTone-Regular.otf",
];
const paths = [...basenames];
await Promise.all(
  basenames.map(
    (basename) =>
      download(
        `https://github.com/google/material-design-icons/raw/63c5cb306073a9ecdfd3579f0f696746ab6305f6/font/${basename}`,
        ".",
      ) as Promise<any>,
  ),
);
await Promise.all(
  basenames.map(async (basename) => {
    const buffer = await readFile(basename);
    if (basename.endsWith(".codepoints")) {
      const codepoints = Object.fromEntries(
        buffer
          .toString()
          .trim()
          .split("\n")
          .map((line) => line.split(" ")),
      );
      const codepointsScript = `Object.assign(Object.create(null),${JSON.stringify(codepoints)})`;
      const ligaturesScript = `Object.assign(Object.create(null),${JSON.stringify(
        Object.fromEntries(Object.entries(codepoints).map((entries) => entries.reverse())),
      )})`;
      const codepointsScriptName = camelCase(basename);
      exports[`./${codepointsScriptName}`] = {
        import: `./${codepointsScriptName}.js`,
        require: `./${codepointsScriptName}.cjs`,
        default: `./${codepointsScriptName}.js`,
      };
      const ligaturesScriptName = camelCase(`${trimExtension(basename)}.${ligaturesExtension}`);
      exports[`./${ligaturesScriptName}`] = {
        import: `./${ligaturesScriptName}.js`,
        require: `./${ligaturesScriptName}.cjs`,
        default: `./${ligaturesScriptName}.js`,
      };
      await Promise.all([
        writeFile(
          `${codepointsScriptName}.d.ts`,
          `declare const _default: {[ligature: string]: string};export default _default`,
        ),
        writeFile(
          `${ligaturesScriptName}.d.ts`,
          `declare const _default: {[codepoint: string]: string};export default _default`,
        ),
        writeFile(`${codepointsScriptName}.js`, `export default ${codepointsScript}`),
        writeFile(`${ligaturesScriptName}.js`, `export default ${ligaturesScript}`),
        writeFile(`${codepointsScriptName}.cjs`, `"use strict";module.exports = ${codepointsScript}`),
        writeFile(`${ligaturesScriptName}.cjs`, `"use strict";module.exports = ${ligaturesScript}`),
      ]);
    } else if (basename.endsWith(".ttf") || basename.endsWith(".otf")) {
      const fontScript = `Buffer.from("${buffer.toString("base64")}", "base64")`;
      const fontScriptName = camelCase(basename);
      exports[`./${fontScriptName}`] = {
        import: `./${fontScriptName}.js`,
        require: `./${fontScriptName}.cjs`,
        default: `./${fontScriptName}.js`,
      };
      await Promise.all([
        writeFile(`${fontScriptName}.d.ts`, `declare const _default: Buffer;export default _default`),
        writeFile(`${fontScriptName}.js`, `export default ${fontScript}`),
        writeFile(`${fontScriptName}.cjs`, `module.exports = ${fontScript}`),
        ...(["woff", "woff2"] as const).map(async (format) => {
          const data = await convert(buffer, format);
          const fontName = `${trimExtension(basename)}.${format}`;
          const fontScript = `Buffer.from("${data.toString("base64")}", "base64")`;
          const fontScriptName = camelCase(fontName);
          exports[`./${fontScriptName}`] = {
            import: `./${fontScriptName}.js`,
            require: `./${fontScriptName}.cjs`,
            default: `./${fontScriptName}.js`,
          };
          paths.push(fontName);
          await Promise.all([
            writeFile(fontName, data),
            writeFile(`${fontScriptName}.d.ts`, `declare const _default: Buffer;export default _default`),
            writeFile(`${fontScriptName}.js`, `export default ${fontScript}`),
            writeFile(`${fontScriptName}.cjs`, `module.exports = ${fontScript}`),
          ]);
        }),
      ]);
    }
  }),
);
const entries = Object.keys(exports)
  .sort()
  .map((key) => [key, exports[key]] as const);
paths.sort();
const pathsScript = `paths = {${paths.map((path) => `"${path}": dir + "${path}"`).join()}}`;
const js = `
  import { dirname, sep } from "path"
  import { fileURLToPath } from "url"
  const dir = dirname(fileURLToPath(import.meta.url)) + sep
  export const ${pathsScript}
  ${entries
    .map(([path, conditions]) => `export { default as ${path.slice(2)} } from "${conditions.import}"`)
    .join("\n")}
`;
const cjs = `
  const { sep } = require("path")
  const dir = __dirname + sep
  exports.${pathsScript}
  ${entries.map(([path, conditions]) => `exports.${path.slice(2)} = require("${conditions.require}")`).join("\n")}
`;
const dts = `
  export declare const paths: {${paths.map((path) => `"${path}": string`).join()}};
  ${entries.map(([path]) => `export { default as ${path.slice(2)} } from "${path}"`).join("\n")}
`;
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
