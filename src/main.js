import * as http from "http";
import * as path from "path";
import * as fs   from "fs";
import { parse } from "url";
import { pages, preparePages } from "./pages.js";
import { configureEnv } from "./env.js";

configureEnv();
await preparePages();

const port      = 6969;
const host      = "127.0.0.1";
const distDir   = "/dist";
const apiPrfx   = "/api";
const staticDir = `${distDir}/_static`;
const name404   = "/404"

const STATUS = {
    OK:         200,
    BAD_REQ:    400,
    NOT_FOUND:  404,
    INTERNAL:   500,
};

const mime  = {
    "_html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css",
};

const server = http.createServer();

server.on("request", (req, res) => {
    if (req.url === undefined) {
        resClose(res, STATUS.BAD_REQ);
        return;
    }

    const url = parse(req.url, true);
    const ext = path.extname(url.pathname);

    if (ext !== "") {
        handleStatic(res, url, ext);
    } else if (url.pathname.startsWith(apiPrfx)) {
        handleApi(req, res, url);
    } else {
        handlePage(req, res, url);
    }
});

server.listen(port, () => console.log(`Running on ${host}:${port}`));

function resClose(res, status, msg) {
    res.statusCode = status;
    res.end(msg);
}

function handleStatic(res, url, ext) {
    const m = mime[ext];

    if (m === undefined) {
        resClose(res, STATUS.NOT_FOUND);
        return;
    }

    const filePath = path.join(staticDir, url.pathname);
    const rs = fs.createReadStream(filePath);

    res.writeHead(STATUS.OK, {
        "Content-Type": m
    });
 
    rs.pipe(res);
    rs.once("error", () => res.close());
} 
 
function handlePage(req, res, url) {
    let handler = pages[url.pathname];

    if (!handler) {
        if (pages[name404]) {
            handler = pages[name404];
        } else {
            resClose(res, STATUS.NOT_FOUND);
            return;
        }
    }

    handler(req, res, url);
}
  
function handleApi() {}

