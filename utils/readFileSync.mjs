import fs from "fs";
import path from "path";
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

export const readFileSync = function (relativPath) {
  const img = fs.readFileSync(path.join(__dirname, relativPath));
  return img
}