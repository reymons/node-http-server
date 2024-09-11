import fs from "fs";
import { extname, join } from "path";
import { STATUS, MIME } from "./const.js";
import { removeEndSlashes } from "./utils.js";

export class Connection {
    #url;
    #closed;
    #staticDir;
    #payload;

    constructor(req, res, staticDir) {
        const splitted = req.url.split("?");

        this.#url = {
            path:      removeEndSlashes(splitted[0]),
            queryStr:  splitted[1],
            query:     null,
        };

        this.req         = req;
        this.res         = res;
        this.#staticDir  = staticDir;
        this.#payload    = null;

        // TODO: handle errors
        req.once("error", () => {});
        res.once("error", () => {});
    }

    get query() {
        if (this.#url.query == null) {
            this.#url.query = new URLSearchParams(this.#url.queryStr);
        }
        return this.#url.query;
    }

    get path() {
        return this.#url.path;
    }

    get method() {
        return this.req.method;
    }

    close(status, chunk) {
        if (!this.#closed) {
            if (status !== STATUS.NONE) {
                this.res.statusCode = status;
            }

            this.res.end(chunk);
            this.#closed = true;
        }
    }

    send(filePath) {
        const mime = MIME[extname(filePath)];

        if (mime === undefined) {
            this.close(STATUS.NOT_FOUND);
            return;
        }

        const path = join(this.#staticDir, filePath);

        fs.stat(path, (err, stat) => {
            if (err !== null) {
                this.close(STATUS.NOT_FOUND);
                return;
            }

            const rs = fs.createReadStream(path);
            
            const headers = {
                "Content-Type":   mime,
                "Content-Length": stat.size,
            };
            
            this.res.writeHead(STATUS.OK, headers);

            rs.once("error", () => this.close(STATUS.NONE));
            rs.once("end", () => this.close(STATUS.NONE));
            rs.pipe(this.res);
        });
    }

    async #readPayload() {
        if (this.#payload !== null) {
            return Promise.resolve(this.#payload);
        }

        return new Promise((resolve, reject) => {
            const chunks = [];

            this.req.on("data", chunk => chunks.push(chunk));
            
            this.req.once("end", () => {
                this.#payload = Buffer.concat(chunks);
                resolve(this.#payload);
            });

            this.req.once("error", reject);
        });
    }

    async #readJSON() {
        return JSON.parse(await this.#readPayload());
    }

    #sendJSON(obj) {
        try {
            const str = JSON.stringify(obj);

            this.res.writeHead(STATUS.OK, {
                "Content-Type":     MIME[".json"],
                "Content-Length":   str.length,
            });

            this.close(STATUS.NONE, str);
        } catch {
            this.close(STATUS.INTERNAL);
        }
    }

    json(obj) {
        if (obj === undefined) {
            return this.#readJSON();       
        } else {
            return this.#sendJSON(obj);
        }
    }
}

