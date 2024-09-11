import { METHOD, STATUS } from "src/const.js";

export const config = {
    base: "/user",
    schema: [
        { method: METHOD.POST, handler: postUser },
        { method: METHOD.GET, handler: echo, path: "/echo/:value" },
    ]
};

async function postUser({ conn, db }) {
    try {
        const data = await conn.json();
        const [user] = await db.query(
            "INSERT INTO users (name, surname, email, phone) VALUES ($1, $2, $3, $4) RETURNING *",
            [data.name, data.surname, data.email, data.phone]
        );
        conn.json(user);
    } catch (err) {
        console.error(err);
        conn.close(STATUS.INTERNAL);
    }
}

function echo({ conn, params }) {
    conn.json(params);
}

