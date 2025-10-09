const { DataType } = require("node-opcua");
const OPCUAClientManager = require("./OPCUAClient");
const fs = require("fs");
const path = require("path");

/**
 * Controller Klasse für das Bedienfeld
 * Verwaltet die Kommunikation zwischen UI und OPC UA Server
 */
class BedienfeldController {
    constructor(serverEndpoint) {
        this.opcClient = new OPCUAClientManager(serverEndpoint);

        // SPS Variablen aus spsVars.json laden
        const spsVarsPath = path.join(__dirname, 'spsVars.json');
        const spsVars = JSON.parse(fs.readFileSync(spsVarsPath, 'utf8'));

        // Node IDs für die verschiedenen SPS-Variablen
        this.nodeIds = {
            // Button Inputs (von Bedienfeld zu SPS)
            btnStart: `ns=${spsVars.xBTN_START.ns};s=${spsVars.xBTN_START.s}`,
            btnStop: `ns=${spsVars.xBTN_STOP.ns};s=${spsVars.xBTN_STOP.s}`,
            btnToolOn: `ns=${spsVars.xBTN_TOOL_ON.ns};s=${spsVars.xBTN_TOOL_ON.s}`,
            btnToolOff: `ns=${spsVars.xBTN_TOOL_OFF.ns};s=${spsVars.xBTN_TOOL_OFF.s}`,
            btnReset: `ns=${spsVars.xBTN_RESET.ns};s=${spsVars.xBTN_RESET.s}`,
            btnManAuto: `ns=${spsVars.xMAN_AUTO.ns};s=${spsVars.xMAN_AUTO.s}`,
            btnEmStop: `ns=${spsVars.xEM_STOP.ns};s=${spsVars.xEM_STOP.s}`,
            btnToWorkPos: `ns=${spsVars.xTO_WORKPOS.ns};s=${spsVars.xTO_WORKPOS.s}`,
            btnToHomePos: `ns=${spsVars.xTO_HOMEPOS.ns};s=${spsVars.xTO_HOMEPOS.s}`,

            // Panel Outputs (von SPS zu Bedienfeld - Status Anzeigen)
            panelToolOn: `ns=${spsVars.xP_TOOL_ON.ns};s=${spsVars.xP_TOOL_ON.s}`,
            panelStart: `ns=${spsVars.xP_START.ns};s=${spsVars.xP_START.s}`,
            panelMan: `ns=${spsVars.xP_MAN.ns};s=${spsVars.xP_MAN.s}`,
            panelReset: `ns=${spsVars.xP_RESET.ns};s=${spsVars.xP_RESET.s}`,
            panelError: `ns=${spsVars.xP_ERROR.ns};s=${spsVars.xP_ERROR.s}`,

            // Process Values
            currentStep: `ns=${spsVars.iCURRENT_STEP.ns};s=${spsVars.iCURRENT_STEP.s}`,
            pvActuator: `ns=${spsVars.iPV_ACTUATOR.ns};s=${spsVars.iPV_ACTUATOR.s}`
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
     * Neu verbinden zu einem anderen OPC UA Server
     */
    async reconnect(newEndpoint) {
        try {
            console.log(`Reconnect zu neuem Server: ${newEndpoint}`);

            // Alte Verbindung trennen
            await this.opcClient.disconnect();

            // Neuen Client mit neuem Endpoint erstellen
            this.opcClient = new OPCUAClientManager(newEndpoint);

            // Neue Verbindung herstellen
            await this.opcClient.connect();

            console.log("Erfolgreich neu verbunden");
            return true;
        } catch (error) {
            console.error("Fehler beim Reconnect:", error);
            throw error;
        }
    }

    /**
     * Aktuellen Endpoint zurückgeben
     */
    getCurrentEndpoint() {
        return this.opcClient.endpointUrl;
    }

    /**
     * Start-Button Aktion
     */
    async start() {
        console.log("Start-Befehl ausgeführt");
        return await this.opcClient.writeVariable(
            this.nodeIds.btnStart,
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
            this.nodeIds.btnStop,
            true,
            DataType.Boolean
        );
    }

    /**
     * Tool On Aktion
     */
    async toolOn() {
        console.log("Tool On");
        return await this.opcClient.writeVariable(
            this.nodeIds.btnToolOn,
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
            this.nodeIds.btnToolOff,
            true,
            DataType.Boolean
        );
    }

    /**
     * Modus setzen (Manual/Auto)
     * true = Manual, false = Auto
     */
    async setManualMode(isManual) {
        console.log(`Modus: ${isManual ? 'Manual' : 'Auto'}`);
        return await this.opcClient.writeVariable(
            this.nodeIds.btnManAuto,
            isManual,
            DataType.Boolean
        );
    }

    /**
     * Home Position anfahren
     */
    async toHomePosition() {
        console.log("Home Position anfahren");
        return await this.opcClient.writeVariable(
            this.nodeIds.btnToHomePos,
            true,
            DataType.Boolean
        );
    }

    /**
     * Work Position anfahren
     */
    async toWorkPosition() {
        console.log("Work Position anfahren");
        return await this.opcClient.writeVariable(
            this.nodeIds.btnToWorkPos,
            true,
            DataType.Boolean
        );
    }

    /**
     * Alle aktuellen Werte lesen (Status von SPS)
     */
    async readAllValues() {
        try {
            const values = {
                // Panel Status (von SPS)
                panelToolOn: await this.opcClient.readVariable(this.nodeIds.panelToolOn),
                panelStart: await this.opcClient.readVariable(this.nodeIds.panelStart),
                panelMan: await this.opcClient.readVariable(this.nodeIds.panelMan),
                panelError: await this.opcClient.readVariable(this.nodeIds.panelError),
                currentStep: await this.opcClient.readVariable(this.nodeIds.currentStep),
                pvActuator: await this.opcClient.readVariable(this.nodeIds.pvActuator)
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
        return await this.opcClient.writeVariable(
            this.nodeIds.btnReset,
            true,
            DataType.Boolean
        );
    }

    /**
     * Emergency Stop
     */
    async emergencyStop() {
        console.log("EMERGENCY STOP!");
        return await this.opcClient.writeVariable(
            this.nodeIds.btnEmStop,
            true,
            DataType.Boolean
        );
    }
}

module.exports = BedienfeldController;
