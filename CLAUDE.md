# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language industrial control panel interface ("Bedienfeld") for managing an automated tool system. The project includes an HTML/CSS frontend and has OPC UA capabilities for industrial automation communication.

## File Structure

- `bedienfeld.html` - Main HTML structure with embedded JavaScript
- `bedienfeld.css` - Separated stylesheet with skeuomorphic industrial design
- `package.json` - Node.js dependencies (node-opcua, node-opcua-samples)
- `.gitignore` - Standard git ignore rules for editors, OS files, and node_modules

## Architecture

**Frontend**: Clean separation of concerns with HTML, CSS, and minimal inline JavaScript. No build process required for the frontend.

**Key UI Components**:
- **Top Row**: Tool control buttons (Tool On/Off), Start/Stop buttons, Manual/Auto toggle switch, and Reset button
- **Middle Row**: MAN and ERROR status indicators, current step display (00), and emergency stop button
- **Actuator Section**: Home/Work positioning buttons and a dropdown selector

**Styling Approach**: Skeuomorphic design mimicking physical industrial control panels with gradients, shadows, inset effects, and a dotted metal texture background. Layout uses CSS Grid exclusively.

## Development Workflow

**Frontend Development**:
- Open `bedienfeld.html` directly in a web browser
- No build step required
- Refresh browser to see changes

**Dependencies Management**:
```bash
npm install        # Install dependencies (node-opcua, node-opcua-samples)
```

## Implementation Details

**Current State**: The UI is primarily static with minimal interactivity:
- Toggle switch (bedienfeld.html:73-75) is the only interactive element - toggles between MAN/AUTO modes via CSS `.active` class
- All other buttons have no event handlers implemented
- Step display shows static "00" value (bedienfeld.html:50)
- Actuator dropdown has only placeholder option (bedienfeld.html:65)
- Status indicators are static gray circles with no active states
- Emergency stop button is visual only

**Language**: All UI text is in German (Toolcontrol, Toolmode, Actuator Selection, Current Step, Emergency STOP)

**Future Integration**: The node-opcua dependency suggests planned integration with industrial automation systems via OPC UA protocol for real machine control.
