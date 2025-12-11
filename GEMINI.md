# Bedienpanel (Industrial Control Panel)

This project is a Node.js-based industrial control panel interface ("Bedienfeld") designed for communicating with SPS automation systems via the OPC UA protocol. It features a skeuomorphic web interface that mimics physical controls (buttons, switches, lamps).

## Project Overview

*   **Type:** Node.js Web Application & Standalone Executable
*   **Core Purpose:** Provide a graphical user interface (GUI) for controlling and monitoring industrial machinery connected via OPC UA.
*   **Architecture:**
    *   **Frontend:** `bedienfeld.html` & `bedienfeld.css` (Static HTML/CSS, Vanilla JS).
    *   **Backend:** Node.js with `api-server.js` (API endpoints) and `webserver.js` (static file serving).
    *   **Orchestration:** `start-all.js` initializes all services and opens the default browser.
    *   **OPC UA Integration:** `BedienfeldController.js` manages business logic and communication using `OPCUAClient.js` (wrapper around `node-opcua`).
    *   **Packaging:** Uses `pkg` to bundle the application into a standalone executable (`.exe`) for easy deployment without requiring Node.js on the target machine.

## Key Files & Directories

*   `start-all.js`: Main entry point. Starts the API and Web servers and launches the browser.
*   `BedienfeldController.js`: Handles logic for button presses, status updates, and variable mapping.
*   `OPCUAClient.js`: Wrapper class for `node-opcua` client functionality.
*   `config.json`: Configuration for OPC UA endpoint and server ports.
*   `spsVars.json`: Maps internal variable names to specific OPC UA Node IDs (Namespace and String ID).
*   `bedienfeld.html`: The main UI structure.
*   `bedienfeld.css`: Styles for the industrial look-and-feel.
*   `dist/`: Destination folder for the built executable.

## Building and Running

### Prerequisites

*   Node.js (v18+ recommended)

### Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Application:**
    ```bash
    npm start
    ```
    This command runs `node start-all.js`, which:
    *   Starts the API Server (Port 3001)
    *   Starts the Web Server (Port 8080)
    *   Automatically opens `http://localhost:8080` in your default browser.

### Building Standalone Executable

To create a standalone `.exe` file for deployment:

```bash
npm run build
```
The output file `bedienpanel.exe` will be generated in the `dist/` directory.

## Configuration

The application relies on two external configuration files which must be present in the same directory as the executable (or project root during development):

1.  **`config.json`**: Network settings.
    ```json
    {
      "opcua": { "endpoint": "opc.tcp://192.168.0.12:4840", ... },
      "api": { "port": 3001 },
      "web": { "port": 8080 }
    }
    ```

2.  **`spsVars.json`**: OPC UA Variable Mapping.
    Maps application logic names (e.g., `xBTN_START`) to SPS-specific Node IDs (`ns` = namespace index, `s` = string identifier).

## Development Conventions

*   **Language:** The UI is in German (Bedienfeld, Taster, etc.), but code comments and structure use a mix of English and German.
*   **Style:** No frontend framework (React, Vue, etc.) is used; it relies on Vanilla JS and CSS Grid.
*   **Path Handling:** The code uses a `getAssetPath` helper function to correctly locate files (`config.json`, `html`, etc.) whether running from source or as a packaged executable.
*   **OPC UA:** Communication is handled asynchronously. The `BedienfeldController` abstracts the raw OPC UA read/write operations.
