import { template } from "../render.js";

export default function handler(req, res) {
    res.writeHead(404, { "conent-type": "text/html" });

    res.end(template({
        title: "Page Not Found | 404",
        content: `<h1>Page not found, sowry :c</h>`
    }));
}
