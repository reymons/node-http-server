import * as fs from "fs";
import { join, parse, normalize } from "path";

const allowedExt = [".js"];
const rootName = "index";
const pageImports = [];

export const pages = {};

let initialPagesDir;

export async function preparePages(pagesDir) {
    initialPagesDir = pagesDir;
    _preparePages(pagesDir);
    await Promise.all(pageImports);
    Object.freeze(pages);
}

function _preparePages(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            _preparePages(join(dir, item.name));
        } else if (item.isFile()) {
            pageImports.push(importPage(join(dir, item.name)));
        }
    }
}

function importPage(fileName) {
    const fileInfo = parse(fileName.replace(initialPagesDir, ""));
    
    if (!allowedExt.includes(fileInfo.ext)) {
        return Promise.resolve();
    }

    return import(fileName).then(({ default: handler }) => {
        const page = fileInfo.name === rootName
                     ? fileInfo.dir 
                     : normalize(`${fileInfo.dir}/${fileInfo.name}`);

        if (handler === undefined) {
            throw new Error(
                `Invalid handler for ${page}\nMake sure you've exported a default handler`
            );
        }

        pages[page] = handler;
    });
}

