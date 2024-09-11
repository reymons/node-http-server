import pg from "pg";

const { Pool } = pg;

export class DB {
    #pool;

    constructor() {
        this.#pool = new Pool({
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });
    }

    connect() {
        return this.#pool.query("SELECT NOW()");
    }

    query(str, params) {
        return new Promise((resolve, reject) => {
            this.#pool.query(str, params, (err, result) => {
                if (err) reject(err);
                else resolve(result.rows);
            });
        });
    }
}
