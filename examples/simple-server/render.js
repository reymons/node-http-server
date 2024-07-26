export function template(conf) {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${conf.title}</title>
                <style>
                    header {
                        height: 80x;
                    }
                    a {
                        margin-left: 5px;
                    }
                    a:first-of-type {
                        margin-left: 0;
                    }
                    footer {
                        height: 80px;
                        background: black;
                    }
                </style>
            </head>
            <body>
                <header>
                    <nav>
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/deep/gallery">Gallery</a>
                    </nav>
                </header>
                ${conf.content}
                <footer></footer>
            </body>
        </html>
    `;
}
