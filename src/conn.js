import fs from "fs";
import { extname, join } from "path";
import { STATUS, MIME } from "./const.js";
import { removeEndSlashes } from "./utils.js";

export class Connection {
    #url;
    #closed;
    #staticDir;

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

    close(status, reason) {
        if (!this.#closed) {
            if (status !== STATUS.NONE) {
                this.res.statusCode = status;
            }

            this.res.end(reason);
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
}

