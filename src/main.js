import http from "http";
import { configureEnv } from "./env.js";
import { STATUS } from "./const.js";
import { pages, preparePages } from "./pages.js";
import { api, prepareAPI } from "./api.js";
import { Connection } from "./conn.js";
import { DB } from "./db.js";

export default async function server(conf) {
    const port        = conf.port;
    const host        = conf.host;
    const staticDir   = conf.staticDir;
    const pagesDir    = conf.pagesDir;
    const domainsDir  = conf.domainsDir;
    const apiPrfx     = conf.apiPrfx || "/api";
    const staticPrfx  = conf.staticPrfx;
    const page404Path = conf.page404Path;
    const db          = new DB();

    let server;
    
    configureEnv();

    await Promise.all([
        preparePages(pagesDir),
        prepareAPI(domainsDir, apiPrfx),
        db.connect()
    ]);
    
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
    
    function handleAPI(conn) {
        for (const item of api) {
            if (item.handler[conn.method]) {
                const matches = conn.path.match(item.path);
                
                if (matches !== null) {
                    const params = {};

                    for (let i = 1; i < matches.length; i++) {
                        params[item.params[i - 1]] = matches[i];
                    }

                    item.handler[conn.method]({
                        conn,
                        params,
                        db,
                    });
                    
                    return;
                }
            }
        }

        conn.close(STATUS.NOT_FOUND);
    }

    return {
        run,
    };
}

