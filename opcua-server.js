const { OPCUAServer, Variant, DataType, StatusCodes } = require("node-opcua");
const http = require("http");

// Zustandsvariablen
const state = {
    toolOn: false,
    isRunning: false,
    manualMode: true,
    currentStep: 0,
    errorActive: false
};

async function main() {
    // Server erstellen
    const server = new OPCUAServer({
        port: 4842,
        resourcePath: "/UA/BedienpanelServer",
        buildInfo: {
            productName: "Bedienpanel OPC UA Server",
            buildNumber: "1.0.0",
            buildDate: new Date()
        }
    });

    await server.initialize();
    console.log("Server initialisiert");

    // Address Space aufbauen
    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    // Device Objekt erstellen
    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Bedienpanel"
    });

    // Variablen hinzufügen mit Getter/Setter
    const toolOn = namespace.addVariable({
        componentOf: device,
        browseName: "ToolOn",
        dataType: "Boolean",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Boolean, value: state.toolOn }),
            set: (variant) => {
                state.toolOn = variant.value;
                console.log("ToolOn =", state.toolOn);
                return StatusCodes.Good;
            }
        }
    });

    const isRunning = namespace.addVariable({
        componentOf: device,
        browseName: "IsRunning",
        dataType: "Boolean",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Boolean, value: state.isRunning }),
            set: (variant) => {
                state.isRunning = variant.value;
                console.log("IsRunning =", state.isRunning);
                return StatusCodes.Good;
            }
        }
    });

    const manualMode = namespace.addVariable({
        componentOf: device,
        browseName: "ManualMode",
        dataType: "Boolean",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Boolean, value: state.manualMode }),
            set: (variant) => {
                state.manualMode = variant.value;
                console.log("ManualMode =", state.manualMode);
                return StatusCodes.Good;
            }
        }
    });

    const currentStep = namespace.addVariable({
        componentOf: device,
        browseName: "CurrentStep",
        dataType: "Int32",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Int32, value: state.currentStep }),
            set: (variant) => {
                state.currentStep = variant.value;
                console.log("CurrentStep =", state.currentStep);
                return StatusCodes.Good;
            }
        }
    });

    const errorActive = namespace.addVariable({
        componentOf: device,
        browseName: "ErrorActive",
        dataType: "Boolean",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Boolean, value: state.errorActive }),
            set: (variant) => {
                state.errorActive = variant.value;
                console.log("ErrorActive =", state.errorActive);
                return StatusCodes.Good;
            }
        }
    });

    // Server starten
    await server.start();

    console.log("========================================");
    console.log("OPC UA Server gestartet!");
    console.log("Port:", server.endpoints[0].port);
    console.log("Endpoint URL:", server.endpoints[0].endpointDescriptions()[0].endpointUrl);
    console.log("========================================");

    // HTTP Server für Browser-Zugriff erstellen
    const httpServer = http.createServer((req, res) => {
        // CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);

                    // Variablen setzen
                    if (data.variable && data.value !== undefined) {
                        switch(data.variable) {
                            case 'toolOn':
                                state.toolOn = data.value;
                                break;
                            case 'isRunning':
                                state.isRunning = data.value;
                                break;
                            case 'manualMode':
                                state.manualMode = data.value;
                                break;
                            case 'currentStep':
                                state.currentStep = data.value;
                                break;
                            case 'errorActive':
                                state.errorActive = data.value;
                                break;
                        }
                        console.log(`HTTP: ${data.variable} = ${data.value}`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, state }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid request' }));
                    }
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (req.method === 'GET') {
            // Status abfragen
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(state));
        } else {
            res.writeHead(405);
            res.end();
        }
    });

    const httpPort = 3000;
    httpServer.listen(httpPort, () => {
        console.log(`HTTP API läuft auf Port ${httpPort}`);
        console.log("\nVerfügbare Variablen:");
        console.log("  - Bedienpanel.ToolOn (Boolean)");
        console.log("  - Bedienpanel.IsRunning (Boolean)");
        console.log("  - Bedienpanel.ManualMode (Boolean)");
        console.log("  - Bedienpanel.CurrentStep (Int32)");
        console.log("  - Bedienpanel.ErrorActive (Boolean)");
        console.log("\nHTTP API Endpoints:");
        console.log("  GET  http://localhost:3000 - Status abfragen");
        console.log("  POST http://localhost:3000 - Variable setzen");
        console.log("\nServer läuft... Drücke Ctrl+C zum Beenden");
    });
}

// Server starten
main().catch(err => {
    console.error("Fehler beim Starten des Servers:", err);
    process.exit(1);
});
