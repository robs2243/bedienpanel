# Bedienpanel - Industrial Control Panel

Ein deutschsprachiges Bedienfeld für industrielle Automatisierungssysteme mit OPC UA-Anbindung.

## Features

- **OPC UA Integration**: Direkte Kommunikation mit SPS-Steuerungen
- **Web-Interface**: Skeuomorphisches industrielles Design
- **Echtzeit-Steuerung**: Taster, Schalter und Signallampen
- **Konfigurierbar**: OPC UA Server-Adresse über GUI einstellbar
- **Standalone**: Als ausführbare .exe verfügbar

## Installation

### Entwicklung

```bash
npm install
```

### Projekt starten

```bash
npm start
```

Das startet automatisch:
- API Server (Port 3001)
- Web Server (Port 8080)
- Browser öffnet sich automatisch

## Build (Standalone .exe)

### Voraussetzungen

```bash
npm install -g pkg
```

### EXE erstellen

```bash
npm run build
```

Die fertige `bedienpanel.exe` befindet sich im `dist/` Ordner.

### Manuelle Build-Optionen

```bash
# Windows x64
pkg . --targets node18-win-x64 --output dist/bedienpanel.exe

# Andere Plattformen
pkg . --targets node18-linux-x64 --output dist/bedienpanel-linux
pkg . --targets node18-macos-x64 --output dist/bedienpanel-macos
```

## Deployment der .exe

### Benötigte Dateien neben der .exe

Die .exe benötigt folgende Konfigurationsdateien im **gleichen Verzeichnis**:

1. **config.json** - Server-Konfiguration
2. **spsVars.json** - SPS-Variablen-Mapping
3. **bedienfeld.html** - UI-Template
4. **bedienfeld.css** - Styling

### Beispiel-Verzeichnisstruktur

```
bedienpanel/
├── bedienpanel.exe
├── config.json
├── spsVars.json
├── bedienfeld.html
└── bedienfeld.css
```

### config.json anpassen

Bearbeite die `config.json` für deine SPS-Adresse:

```json
{
  "opcua": {
    "endpoint": "opc.tcp://192.168.0.12:4840",
    "port": 4840,
    "host": "192.168.0.12"
  },
  "api": {
    "port": 3001
  },
  "web": {
    "port": 8080
  }
}
```

## Verwendung

1. **Starte die .exe**: Doppelklick auf `bedienpanel.exe`
2. **Browser öffnet automatisch** mit dem Bedienfeld
3. **Bei Bedarf neu verbinden**: Zahnrad-Symbol → Neue OPC UA Adresse eingeben

### Bedienelemente

- **Tool On/Off**: Taster mit blauer Signallampe
- **Start**: Grüner Taster mit Signallampe
- **Stop**: Roter Taster
- **Reset**: Taster mit weißer Signallampe
- **MAN/AUTO**: Toggle-Schalter
- **NOT-AUS**: Pilz-Schalter (einrastend)
- **Actuator**: Dropdown-Auswahl (1-10)

### Signallampen

- **MAN**: Grün = Manueller Modus aktiv
- **ERROR**: Rot = Fehler aktiv
- **Current Step**: Aktueller Prozessschritt (00-99)

## Konfiguration

### OPC UA Variablen anpassen

Bearbeite `spsVars.json`:

```json
{
  "xBTN_START": {
    "ns": 3,
    "s": "\"dbBedienfeld\".\"xBTN_START\"",
    "datatype": "Bool"
  },
  ...
}
```

## Troubleshooting

### Port bereits belegt

Ändere die Ports in `config.json`:
- API Port (Standard: 3001)
- Web Port (Standard: 8080)

### Verbindung zur SPS fehlschlägt

1. Prüfe OPC UA Endpoint in config.json
2. Zahnrad → Neue Adresse eingeben
3. Firewall-Regeln prüfen
4. OPC UA Server auf SPS läuft

### Browser öffnet sich nicht

Öffne manuell: `http://localhost:8080`

## Entwicklung

### Projektstruktur

```
bedienpanel/
├── start-all.js          # Haupt-Entry-Point
├── api-server.js         # HTTP API Server
├── webserver.js          # Statischer Web-Server
├── BedienfeldController.js  # Business Logic
├── OPCUAClient.js        # OPC UA Client Manager
├── bedienfeld.html       # Frontend UI
├── bedienfeld.css        # Styling
├── config.json           # Konfiguration
└── spsVars.json          # Variablen-Mapping
```

### Scripts

```bash
npm start         # Alle Server starten
npm run build     # EXE erstellen
```

## Technologie

- **Node.js** 18+
- **node-opcua** - OPC UA Client/Server
- **pkg** - Executable Builder
- **Vanilla JS** - Kein Framework
- **CSS Grid** - Layout

## Lizenz

ISC
