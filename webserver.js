const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Minimalistischer Web-Server für das Bedienfeld
 */
class WebServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = null;
    }

    /**
     * MIME-Typen für verschiedene Dateitypen
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Datei ausliefern
     */
    serveFile(filePath, res) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 - Datei nicht gefunden');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('500 - Interner Server Fehler');
                }
            } else {
                const mimeType = this.getMimeType(filePath);
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(data);
            }
        });
    }

    /**
     * Request Handler
     */
    handleRequest(req, res) {
        let filePath = req.url;

        // Root auf bedienfeld.html mappen
        if (filePath === '/' || filePath === '') {
            filePath = '/bedienfeld.html';
        }

        // Vollständiger Pfad
        filePath = path.join(__dirname, filePath);

        // Sicherheitscheck: Verhindere Directory Traversal
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 - Zugriff verweigert');
            return;
        }

        console.log(`Request: ${req.url} -> ${filePath}`);
        this.serveFile(filePath, res);
    }

    /**
     * Server starten
     */
    start() {
        this.server = http.createServer((req, res) => this.handleRequest(req, res));

        this.server.listen(this.port, () => {
            console.log("========================================");
            console.log(`Web-Server läuft auf Port ${this.port}`);
            console.log(`Bedienfeld: http://localhost:${this.port}`);
            console.log("========================================");
        });
    }

    /**
     * Server stoppen
     */
    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log("Web-Server gestoppt");
            });
        }
    }
}

// Konfiguration laden
function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.warn("Konnte config.json nicht laden, verwende Standardwerte");
        return {
            web: { port: 8080 }
        };
    }
}

// Server starten, wenn direkt ausgeführt
if (require.main === module) {
    const config = loadConfig();
    const webPort = config.web.port || 8080;

    console.log(`Verwende Web Server Port: ${webPort}`);

    const webServer = new WebServer(webPort);
    webServer.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log("\nServer wird heruntergefahren...");
        webServer.stop();
        process.exit(0);
    });
}

module.exports = WebServer;
