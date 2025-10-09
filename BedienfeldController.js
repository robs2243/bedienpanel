const { DataType } = require("node-opcua");
const OPCUAClientManager = require("./OPCUAClient");

/**
 * Controller Klasse für das Bedienfeld
 * Verwaltet die Kommunikation zwischen UI und OPC UA Server
 */
class BedienfeldController {
    constructor(serverEndpoint) {
        this.opcClient = new OPCUAClientManager(serverEndpoint);

        // Node IDs für die verschiedenen Variablen (numerische IDs vom Server)
        this.nodeIds = {
            toolOn: "ns=1;i=1001",
            isRunning: "ns=1;i=1002",
            manualMode: "ns=1;i=1003",
            currentStep: "ns=1;i=1004",
            errorActive: "ns=1;i=1005"
        };
    }

    /**
     * Verbindung zum Server initialisieren
     */
    async initialize() {
        try {
            await this.opcClient.connect();
            console.log("BedienfeldController initialisiert");
            return true;
        } catch (error) {
            console.error("Fehler beim Initialisieren:", error);
            throw error;
        }
    }

    /**
     * Verbindung trennen
     */
    async shutdown() {
        await this.opcClient.disconnect();
        console.log("BedienfeldController heruntergefahren");
    }

    /**
     * Start-Button Aktion
     */
    async start() {
        console.log("Start-Befehl ausgeführt");
        return await this.opcClient.writeVariable(
            this.nodeIds.isRunning,
            true,
            DataType.Boolean
        );
    }

    /**
     * Stop-Button Aktion
     */
    async stop() {
        console.log("Stop-Befehl ausgeführt");
        return await this.opcClient.writeVariable(
            this.nodeIds.isRunning,
            false,
            DataType.Boolean
        );
    }

    /**
     * Tool On Aktion
     */
    async toolOn() {
        console.log("Tool On");
        return await this.opcClient.writeVariable(
            this.nodeIds.toolOn,
            true,
            DataType.Boolean
        );
    }

    /**
     * Tool Off Aktion
     */
    async toolOff() {
        console.log("Tool Off");
        return await this.opcClient.writeVariable(
            this.nodeIds.toolOn,
            false,
            DataType.Boolean
        );
    }

    /**
     * Modus setzen (Manual/Auto)
     */
    async setManualMode(isManual) {
        console.log(`Modus: ${isManual ? 'Manual' : 'Auto'}`);
        return await this.opcClient.writeVariable(
            this.nodeIds.manualMode,
            isManual,
            DataType.Boolean
        );
    }

    /**
     * Aktuellen Schritt setzen
     */
    async setCurrentStep(step) {
        console.log(`Schritt: ${step}`);
        return await this.opcClient.writeVariable(
            this.nodeIds.currentStep,
            step,
            DataType.Int32
        );
    }

    /**
     * Error Status setzen
     */
    async setError(hasError) {
        console.log(`Error: ${hasError}`);
        return await this.opcClient.writeVariable(
            this.nodeIds.errorActive,
            hasError,
            DataType.Boolean
        );
    }

    /**
     * Alle aktuellen Werte lesen
     */
    async readAllValues() {
        try {
            const values = {
                toolOn: await this.opcClient.readVariable(this.nodeIds.toolOn),
                isRunning: await this.opcClient.readVariable(this.nodeIds.isRunning),
                manualMode: await this.opcClient.readVariable(this.nodeIds.manualMode),
                currentStep: await this.opcClient.readVariable(this.nodeIds.currentStep),
                errorActive: await this.opcClient.readVariable(this.nodeIds.errorActive)
            };
            return values;
        } catch (error) {
            console.error("Fehler beim Lesen der Werte:", error);
            throw error;
        }
    }

    /**
     * Reset-Funktion
     */
    async reset() {
        console.log("Reset ausgeführt");
        try {
            await this.stop();
            await this.toolOff();
            await this.setError(false);
            await this.setCurrentStep(0);
            return true;
        } catch (error) {
            console.error("Fehler beim Reset:", error);
            return false;
        }
    }

    /**
     * Emergency Stop
     */
    async emergencyStop() {
        console.log("EMERGENCY STOP!");
        try {
            await this.stop();
            await this.toolOff();
            await this.setError(true);
            return true;
        } catch (error) {
            console.error("Fehler beim Emergency Stop:", error);
            return false;
        }
    }
}

module.exports = BedienfeldController;
