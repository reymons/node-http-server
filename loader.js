import * as path from "path";
import * as fs from "fs";

export function resolve(spcfr, parentModuleURL, resolver) {
    spcfr = spcfr.replace(/^src/, path.resolve(".", "src"));
    spcfr = fs.existsSync(spcfr) && fs.lstatSync(spcfr).isDirectory() ? `${spcfr}/index` : spcfr;
    return resolver(spcfr, parentModuleURL);
}
