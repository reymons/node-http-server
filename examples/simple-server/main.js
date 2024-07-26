import lib from "src/main.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));

const server = await lib({
    host:        "127.0.0.1",
    port:        6969,
    page404Name: "404",
    pagesDir:    join(dir, "pages"),
});

server.createServer();
server.listen();

