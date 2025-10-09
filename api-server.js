const http = require("http");
const fs = require("fs");
const path = require("path");
const BedienfeldController = require("./BedienfeldController");

/**
 * HTTP API Server für die Kommunikation zwischen Browser und OPC UA Server
 */
class APIServer {
    constructor(port, opcServerEndpoint) {
        this.port = port;
        this.controller = new BedienfeldController(opcServerEndpoint);
        this.server = null;
    }

    /**
     * Server initialisieren und starten
     */
    async start() {
        // Controller initialisieren (Verbindung zum OPC UA Server)
        await this.controller.initialize();

        // HTTP Server erstellen
        this.server = http.createServer((req, res) => this.handleRequest(req, res));

        return new Promise((resolve) => {
            this.server.listen(this.port, () => {
                console.log("========================================");
                console.log(`HTTP API Server läuft auf Port ${this.port}`);
                console.log(`Endpoint: http://localhost:${this.port}`);
                console.log("========================================");
                console.log("\nVerfügbare API Endpoints:");
                console.log("  POST /start          - Start Button");
                console.log("  POST /stop           - Stop Button");
                console.log("  POST /tool-on        - Tool On");
                console.log("  POST /tool-off       - Tool Off");
                console.log("  POST /set-mode       - Modus setzen (body: {manual: true/false})");
                console.log("  POST /to-home        - Home Position anfahren");
                console.log("  POST /to-work        - Work Position anfahren");
                console.log("  POST /reset          - Reset");
                console.log("  POST /emergency-stop - Emergency Stop");
                console.log("  POST /reconnect      - Server-Verbindung ändern (body: {endpoint: string})");
                console.log("  GET  /status         - Alle Werte lesen");
                console.log("  GET  /config         - Aktuelle Konfiguration lesen");
                console.log("\nServer bereit für Anfragen...");
                resolve();
            });
        });
    }

    /**
     * HTTP Request Handler
     */
    async handleRequest(req, res) {
        // CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // OPTIONS Request (CORS Preflight)
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            if (req.method === 'POST') {
                await this.handlePostRequest(req, res);
            } else if (req.method === 'GET') {
                await this.handleGetRequest(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
        } catch (error) {
            console.error("Fehler beim Verarbeiten der Anfrage:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    /**
     * POST Requests verarbeiten
     */
    async handlePostRequest(req, res) {
        const url = req.url;
        let result = false;

        // Body lesen wenn vorhanden
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        await new Promise(resolve => req.on('end', resolve));

        let data = {};
        if (body) {
            try {
                data = JSON.parse(body);
            } catch (e) {
                console.error("Fehler beim Parsen des JSON Body:", e);
            }
        }

        // Route handling
        switch (url) {
            case '/start':
                result = await this.controller.start();
                break;
            case '/stop':
                result = await this.controller.stop();
                break;
            case '/tool-on':
                result = await this.controller.toolOn();
                break;
            case '/tool-off':
                result = await this.controller.toolOff();
                break;
            case '/set-mode':
                if (data.manual !== undefined) {
                    result = await this.controller.setManualMode(data.manual);
                }
                break;
            case '/to-home':
                result = await this.controller.toHomePosition();
                break;
            case '/to-work':
                result = await this.controller.toWorkPosition();
                break;
            case '/reset':
                result = await this.controller.reset();
                break;
            case '/emergency-stop':
                result = await this.controller.emergencyStop();
                break;
            case '/reconnect':
                if (data.endpoint) {
                    try {
                        await this.controller.reconnect(data.endpoint);
                        result = true;
                    } catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Reconnect fehlgeschlagen: ' + error.message
                        }));
                        return;
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Endpoint fehlt' }));
                    return;
                }
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
                return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: result }));
    }

    /**
     * GET Requests verarbeiten
     */
    async handleGetRequest(req, res) {
        if (req.url === '/status') {
            const values = await this.controller.readAllValues();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(values));
        } else if (req.url === '/config') {
            // Aktuelle Konfiguration zurückgeben
            const config = {
                currentEndpoint: this.controller.getCurrentEndpoint()
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(config));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    }

    /**
     * Server herunterfahren
     */
    async shutdown() {
        await this.controller.shutdown();
        if (this.server) {
            this.server.close();
        }
        console.log("API Server heruntergefahren");
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
            opcua: { endpoint: "opc.tcp://localhost:4842" },
            api: { port: 3001 }
        };
    }
}

// Server starten
const config = loadConfig();
const API_PORT = config.api.port;
const OPC_SERVER_ENDPOINT = config.opcua.endpoint;

console.log(`Verwende OPC UA Endpoint: ${OPC_SERVER_ENDPOINT}`);

const apiServer = new APIServer(API_PORT, OPC_SERVER_ENDPOINT);

apiServer.start().catch(err => {
    console.error("Fehler beim Starten des API Servers:", err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("\nServer wird heruntergefahren...");
    await apiServer.shutdown();
    process.exit(0);
});
