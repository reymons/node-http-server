import { template } from "../../render.js";

export default function handler(req, res) {
    res.writeHead(200, { "content-type": "text/html" });
    
    res.end(template({
        title: "Gallery",
        content: "<h1>Gallery</h1>"
    }));
}
