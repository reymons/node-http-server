import { template } from "../render.js";

export default function handler(req, res) {
    res.writeHead(200, { "content-type": "text/html" });
    
    res.end(template({
        title: "Home",
        content: "<h1>Home</h1>"
    }));
}
