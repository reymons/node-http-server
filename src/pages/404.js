export default function handler(req, res) {
    const html = `
        <div>Page not found</div>
    `;

    res.writeHead(200, { "content-type": "text/html" });
    res.end(html);
}
