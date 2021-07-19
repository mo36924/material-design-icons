declare module "fontverter" {
  export const detectFormat: (buffer: Buffer) => "woff" | "woff2" | "sfnt";
  export const convert: (
    buffer: Buffer,
    toFormat: "woff" | "woff2" | "sfnt",
    fromFormat?: "woff" | "woff2" | "sfnt",
  ) => Promise<Buffer>;
}
