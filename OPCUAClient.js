const { OPCUAClient, AttributeIds, ClientSession } = require("node-opcua");

/**
 * OPC UA Client Klasse für die Kommunikation mit dem Bedienfeld-Server
 */
class OPCUAClientManager {
    constructor(endpointUrl) {
        this.endpointUrl = endpointUrl;
        this.client = null;
        this.session = null;
        this.isConnected = false;
    }

    /**
     * Verbindung zum OPC UA Server herstellen
     */
    async connect() {
        try {
            this.client = OPCUAClient.create({
                endpointMustExist: false,
            });

            await this.client.connect(this.endpointUrl);
            console.log("Mit OPC UA Server verbunden:", this.endpointUrl);

            this.session = await this.client.createSession();
            console.log("Session erstellt");

            this.isConnected = true;
            return true;
        } catch (error) {
            console.error("Fehler beim Verbinden:", error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Verbindung trennen
     */
    async disconnect() {
        try {
            if (this.session) {
                await this.session.close();
                console.log("Session geschlossen");
            }
            if (this.client) {
                await this.client.disconnect();
                console.log("Verbindung getrennt");
            }
            this.isConnected = false;
        } catch (error) {
            console.error("Fehler beim Trennen:", error.message);
        }
    }

    /**
     * Wert einer Variable lesen
     * @param {string} nodeId - Die Node ID (z.B. "ns=1;s=Bedienpanel.IsRunning")
     */
    async readVariable(nodeId) {
        if (!this.isConnected) {
            throw new Error("Nicht mit Server verbunden");
        }

        try {
            const dataValue = await this.session.read({
                nodeId: nodeId,
                attributeId: AttributeIds.Value
            });
            return dataValue.value.value;
        } catch (error) {
            console.error(`Fehler beim Lesen von ${nodeId}:`, error.message);
            throw error;
        }
    }

    /**
     * Wert einer Variable schreiben
     * @param {string} nodeId - Die Node ID
     * @param {*} value - Der zu schreibende Wert
     * @param {number} dataType - Der Datentyp (aus node-opcua DataType)
     */
    async writeVariable(nodeId, value, dataType) {
        if (!this.isConnected) {
            throw new Error("Nicht mit Server verbunden");
        }

        try {
            const nodesToWrite = [{
                nodeId: nodeId,
                attributeId: AttributeIds.Value,
                value: {
                    value: {
                        dataType: dataType,
                        value: value
                    }
                }
            }];

            const statusCodes = await this.session.write(nodesToWrite);

            if (statusCodes[0].isGood()) {
                console.log(`${nodeId} erfolgreich auf ${value} gesetzt`);
                return true;
            } else {
                console.error(`Fehler beim Schreiben: ${statusCodes[0].toString()}`);
                return false;
            }
        } catch (error) {
            console.error(`Fehler beim Schreiben von ${nodeId}:`, error.message);
            throw error;
        }
    }

    /**
     * Überprüfen ob verbunden
     */
    checkConnection() {
        return this.isConnected;
    }
}

module.exports = OPCUAClientManager;
