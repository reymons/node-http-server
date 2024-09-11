import lib from "src/main.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));

const server = await lib({
    host:         "127.0.0.1",
    port:         6969,
    page404Path:  "/my404",
    staticPrfx:   "/_static",
    staticDir:    join(dir, "static"),
    pagesDir:     join(dir, "pages"),
    domainsDir:   join(dir, "domains"),
});

server.run();

