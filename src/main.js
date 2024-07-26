import * as http from "http";
import * as path from "path";
import * as fs   from "fs";
import { parse } from "url";
import { configureEnv } from "./env.js";
import { STATUS, MIME } from "./const.js";
import { pages, preparePages } from "./pages.js";

export default async function server(conf) {
    const port        = conf.port;
    const host        = conf.host;
    const distDir     = conf.distDir;
    const pagesDir    = conf.pagesDir;
    const apiPrfx     = conf.apiPrfx;
    const page404Name = `/${conf.page404Name}`;
    const staticDir   = conf.staticDir;

    let server;
    
    configureEnv();
    await preparePages(pagesDir);
    
    function createServer() {
        server = http.createServer();
        
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
    }

    function listen(callback) {
        server.listen(port, callback ?? (() => {
            console.log(`Running on ${host}:${port}`);
        }));
    }

    function resClose(res, status, msg) {
        res.statusCode = status;
        res.end(msg);
    }
    
    function handleStatic(res, url, ext) {
        const mime = MIME[ext];
    
        if (mime === undefined) {
            resClose(res, STATUS.NOT_FOUND);
            return;
        }
    
        const filePath = path.join(staticDir, url.pathname);
        const rs = fs.createReadStream(filePath);
    
        res.writeHead(STATUS.OK, {
            "Content-Type": mime
        });
     
        rs.pipe(res);
        rs.once("error", () => res.close());
    } 
     
    function handlePage(req, res, url) {
        let handler = pages[url.pathname];
    
        if (!handler) {
            if (pages[page404Name]) {
                handler = pages[page404Name];
            } else {
                resClose(res, STATUS.NOT_FOUND);
                return;
            }
        }
    
        handler(req, res, url);
    }
      
    function handleApi() {}

    return {
        createServer,
        listen,
    };
}

