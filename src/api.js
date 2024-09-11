import * as fs from "fs";
import { join } from "path";

export const api = [];

export async function prepareAPI(apiDir, apiPrfx) {
    const dirs = fs.readdirSync(apiDir, { withFileTypes: true });
    const configPromises = [];

    for (const dir of dirs) {
        if (dir.isDirectory()) {
            const items = fs.readdirSync(join(apiDir, dir.name), { withFileTypes: true });
            
            for (const item of items) {
                if (item.isFile() && item.name === "api.js") {
                    const filePath = join(apiDir, dir.name, item.name);
                    const promise = import(filePath).then(m => m.config);
                    configPromises.push(promise);
                }
            }
        }
    }
    
    const configs = (await Promise.all(configPromises));
    
    for (const config of configs) {
        for (const desc of config.schema) {
            const params = {};
            let paramIdx = 0;

            const path = new RegExp(
                `^${apiPrfx}${config.base}${desc.path || ""}$`
                .replace(/:([a-zA-Z_]+)/g, (_, param) => {
                    params[paramIdx++] = param;
                    return "(.+)";
                }));
            
            const idx = api.findIndex(e => String(e.path) === String(path));
            const apiItem = idx !== -1 ? api[idx] : {
                path,
                handler: {},
                params: {},
            };
            apiItem.handler[desc.method] = desc.handler;
            apiItem.params = params;
            if (idx === -1) api.push(apiItem);
        }
    }

    Object.freeze(api);
}

