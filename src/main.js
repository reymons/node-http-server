import http from "http";
import { configureEnv } from "./env.js";
import { STATUS } from "./const.js";
import { pages, preparePages } from "./pages.js";
import { Connection } from "./conn.js";

export default async function server(conf) {
    const port        = conf.port;
    const host        = conf.host;
    const staticDir   = conf.staticDir;
    const pagesDir    = conf.pagesDir;
    const apiPrfx     = conf.apiPrfx;
    const staticPrfx  = conf.staticPrfx;
    const page404Path = conf.page404Path;

    let server;
    
    configureEnv();
    await preparePages(pagesDir);
    
    function run(callback) {
        server = http.createServer();
        
        server.on("request", (req, res) => {
            detectUrlExceptions(req);

            const conn = new Connection(req, res, staticDir);
        
            if (conn.path.startsWith(staticPrfx)) {
                handleStatic(conn);
            } else if (conn.path.startsWith(apiPrfx)) {
                handleAPI(conn);
            } else {
                handlePage(conn);
            }
        });

        server.listen(port, callback ?? (() => {
            console.log(`Running on ${host}:${port}`);
        }));
    }
    
    function detectUrlExceptions(req) {
        req.url = req.url ?? "";

        if (req.url == "/favicon.ico") {
            req.url = `${staticPrfx}/favicon.ico`;
        }
    }

    function handleStatic(conn) {
        conn.send(conn.path.replace(staticPrfx, ""));
    }
     
    function handlePage(conn) {
        let handler = pages[conn.path];
        
        if (handler === undefined) {
            if (pages[page404Path]) {
                handler = pages[page404Path];
            } else {
                conn.close(STATUS.NOT_FOUND);
                return;
            }
        }
    
        handler(conn);
    }
    
    function handleAPI() {
        const handler = pages[conn.path];

        if (handler === undefined) {
            conn.close(STATUS.NOT_FOUND);
        } else {
            handler(conn);
        }
    }

    return {
        run,
    };
}

