# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language industrial control panel interface ("Bedienfeld") implemented as a single-page HTML application. The interface simulates a physical control panel with buttons, indicators, and controls for managing an automated tool system.

## Architecture

**Single-File Application**: The entire application is contained in `bedienfeld.html` with embedded CSS and minimal JavaScript. There is no build process, package management, or external dependencies.

**Key Components**:
- **Top Row**: Tool control buttons (Tool On/Off), Start/Stop buttons, and a Manual/Auto mode toggle switch
- **Middle Row**: Status indicators (MAN, ERROR), current step display (00), and emergency stop button
- **Actuator Section**: Home/Work positioning buttons and a dropdown selector for actuator selection
- **Bottom Icons**: Three utility icons (home, warning, info)

**Styling Approach**: The UI uses a skeuomorphic design with gradients, shadows, and inset effects to mimic physical industrial control panels. The background features a dotted metal texture pattern.

## Development Workflow

**Running the Application**: Open `bedienfeld.html` directly in a web browser. No build or compilation step is required.

**Testing Changes**: Refresh the browser after making any modifications to see changes immediately.

## Implementation Details

**Toggle Switch State**: The only interactive JavaScript functionality is the Manual/Auto toggle at line 363-365. The toggle switches between states by adding/removing the `.active` class, which repositions the slider and changes the label via CSS.

**Language**: All UI text and labels are in German:
- Toolcontrol = Tool Control
- Toolmode = Tool Mode
- Actuator Selection = Actuator Selection
- Current Step = Current Step
- Emergency STOP = Emergency Stop

**Grid-Based Layout**: The entire layout uses CSS Grid extensively for positioning all elements. No flexbox or traditional positioning is used.

**Button States**: Buttons have active states with visual feedback (translateY and shadow changes) but no actual functionality implemented.

## Common Modifications

When extending functionality, note that:
- All buttons except the toggle switch currently have no JavaScript event handlers
- The step display shows a static "00" value (line 334)
- The actuator dropdown has only a placeholder option (line 349)
- Status indicators are static gray circles with no active/inactive states implemented
- The emergency stop button has no functionality beyond visual styling
