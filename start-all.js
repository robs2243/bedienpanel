const { spawn, exec } = require('child_process');
const path = require('path');

/**
 * Startet alle drei Server: OPC UA Server, API Server und Web Server
 */
class ApplicationStarter {
    constructor() {
        this.processes = [];
    }

    /**
     * Einen Node.js Prozess starten
     */
    startProcess(name, scriptPath, color) {
        const process = spawn('node', [scriptPath], {
            cwd: __dirname,
            stdio: 'pipe'
        });

        // Output mit Farbe und Prefix anzeigen
        process.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    console.log(`${color}[${name}]${'\x1b[0m'} ${line}`);
                }
            });
        });

        process.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    console.error(`${color}[${name}]${'\x1b[0m'} ${line}`);
                }
            });
        });

        process.on('close', (code) => {
            console.log(`${color}[${name}]${'\x1b[0m'} Prozess beendet mit Code ${code}`);
        });

        this.processes.push({ name, process });
        return process;
    }

    /**
     * Alle Server starten
     */
    start() {
        console.log('\x1b[1m========================================');
        console.log('Bedienpanel Application wird gestartet...');
        console.log('========================================\x1b[0m\n');

        // OPC UA Server starten (Blau)
        console.log('\x1b[34m[INFO]\x1b[0m Starte OPC UA Server...');
        this.startProcess('OPC-SERVER', path.join(__dirname, 'opcua-server.js'), '\x1b[34m');

        // Kurze Verzögerung, damit der OPC UA Server Zeit hat zu starten
        setTimeout(() => {
            // API Server starten (Grün)
            console.log('\x1b[32m[INFO]\x1b[0m Starte API Server...');
            this.startProcess('API-SERVER', path.join(__dirname, 'api-server.js'), '\x1b[32m');
        }, 2000);

        // Web Server starten (Gelb)
        setTimeout(() => {
            console.log('\x1b[33m[INFO]\x1b[0m Starte Web Server...');
            this.startProcess('WEB-SERVER', path.join(__dirname, 'webserver.js'), '\x1b[33m');

            setTimeout(() => {
                console.log('\n\x1b[1m========================================');
                console.log('✓ Alle Server gestartet!');
                console.log('========================================\x1b[0m');
                console.log('\n\x1b[36mBedienfeld öffnen:\x1b[0m http://localhost:8080');

                // Browser öffnen
                this.openBrowser('http://localhost:8080');

                console.log('\n\x1b[90mDrücke Ctrl+C zum Beenden...\x1b[0m\n');
            }, 1000);
        }, 3000);
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
     * Alle Prozesse beenden
     */
    stop() {
        console.log('\n\x1b[1m========================================');
        console.log('Server werden heruntergefahren...');
        console.log('========================================\x1b[0m\n');

        this.processes.forEach(({ name, process }) => {
            console.log(`Stoppe ${name}...`);
            process.kill('SIGINT');
        });

        // Warte kurz und beende dann den Hauptprozess
        setTimeout(() => {
            console.log('\n\x1b[32m✓ Alle Server beendet\x1b[0m');
            process.exit(0);
        }, 1000);
    }
}

// Application starten
const app = new ApplicationStarter();
app.start();

// Graceful shutdown bei Ctrl+C
process.on('SIGINT', () => {
    app.stop();
});

// Fehlerbehandlung
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[FEHLER]\x1b[0m Unerwarteter Fehler:', err);
    app.stop();
});
