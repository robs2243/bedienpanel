const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Server-Module direkt laden (pkg-kompatibel)
const WebServer = require('./webserver');
const BedienfeldController = require('./BedienfeldController');
const APIServer = require('./api-server');

/**
 * Hilfsfunktion: Datei-Pfad für pkg-kompatible Ausführung
 */
function getAssetPath(filename) {
    if (process.pkg) {
        return path.join(path.dirname(process.execPath), filename);
    }
    return path.join(__dirname, filename);
}

/**
 * Konfiguration laden
 */
function loadConfig() {
    try {
        const configPath = getAssetPath('config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.warn("Konnte config.json nicht laden, verwende Standardwerte");
        return {
            opcua: { endpoint: "opc.tcp://192.168.0.12:4840" },
            api: { port: 3001 },
            web: { port: 8080 }
        };
    }
}

/**
 * Startet alle drei Server: OPC UA Server, API Server und Web Server
 */
class ApplicationStarter {
    constructor() {
        this.servers = {};
        this.config = loadConfig();
    }

    /**
     * Alle Server starten
     */
    async start() {
        console.log('\x1b[1m========================================');
        console.log('Bedienpanel Application wird gestartet...');
        console.log('========================================\x1b[0m\n');

        try {
            // API Server starten (verbindet zu OPC UA)
            console.log('\x1b[32m[INFO]\x1b[0m Starte API Server...');
            const APIServerClass = require('./api-server');
            // API Server startet sich selbst beim require (siehe api-server.js)

            // Kurze Verzögerung
            await this.delay(2000);

            // Web Server starten
            console.log('\x1b[33m[INFO]\x1b[0m Starte Web Server...');
            const webPort = this.config.web.port || 8080;
            this.servers.web = new WebServer(webPort);
            this.servers.web.start();

            await this.delay(1000);

            console.log('\n\x1b[1m========================================');
            console.log('✓ Alle Server gestartet!');
            console.log('========================================\x1b[0m');
            console.log(`\n\x1b[36mBedienfeld öffnen:\x1b[0m http://localhost:${webPort}`);

            // Browser öffnen
            this.openBrowser(`http://localhost:${webPort}`);

            console.log('\n\x1b[90mDrücke Ctrl+C zum Beenden...\x1b[0m\n');

        } catch (error) {
            console.error('\x1b[31m[FEHLER]\x1b[0m Fehler beim Starten:', error);
            process.exit(1);
        }
    }

    /**
     * Delay-Hilfsfunktion
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Browser öffnen
     */
    openBrowser(url) {
        let command;

        // Plattform-spezifische Befehle
        switch (process.platform) {
            case 'win32':
                command = `start ${url}`;
                break;
            case 'darwin':
                command = `open ${url}`;
                break;
            default:
                command = `xdg-open ${url}`;
                break;
        }

        exec(command, (error) => {
            if (error) {
                console.log('\x1b[33m[WARNUNG]\x1b[0m Browser konnte nicht automatisch geöffnet werden');
                console.log(`Bitte öffne manuell: ${url}`);
            } else {
                console.log('\x1b[32m✓ Browser geöffnet\x1b[0m');
            }
        });
    }

    /**
     * Alle Server beenden
     */
    stop() {
        console.log('\n\x1b[1m========================================');
        console.log('Server werden heruntergefahren...');
        console.log('========================================\x1b[0m\n');

        if (this.servers.web) {
            console.log('Stoppe Web Server...');
            this.servers.web.stop();
        }

        // Warte kurz und beende dann den Hauptprozess
        setTimeout(() => {
            console.log('\n\x1b[32m✓ Alle Server beendet\x1b[0m');
            process.exit(0);
        }, 1000);
    }
}

// Application starten
const app = new ApplicationStarter();
app.start().catch(err => {
    console.error('\x1b[31m[FEHLER]\x1b[0m', err);
    process.exit(1);
});

// Graceful shutdown bei Ctrl+C
process.on('SIGINT', () => {
    app.stop();
});

// Fehlerbehandlung
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[FEHLER]\x1b[0m Unerwarteter Fehler:', err);
    app.stop();
});
