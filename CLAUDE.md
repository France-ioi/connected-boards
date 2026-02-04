# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
yarn build    # Build to dist/ (IIFE format)
yarn dev      # Watch mode with auto-rebuild
```

Output: `dist/index.js` (JavaScript) and `dist/style.css` (extracted styles).

## Architecture

Connected Boards is a TypeScript library for visual programming with IoT devices (QuickPi, Galaxia, micro:bit). It integrates with the Blockly visual editor and the QuickAlgo educational framework.

### Core Components

**Entry Point**: `src/index.ts` → exports to `window` global for QuickAlgo integration.

**Main Library**: `src/blocklyQuickPi_lib.ts` contains `getContext()` which creates the QuickAlgo library context with sensor handling, event registration, and grading support.

### Three-Layer Architecture

1. **Boards** (`src/boards/`): Hardware abstractions extending `AbstractBoard`
   - `quickpi/` - GrovePi Hat with pluggable sensors
   - `microbit/` - UK micro:bit with hex code generation
   - `galaxia/` - Network-based board

2. **Sensors** (`src/sensors/`): 23 sensor types extending `AbstractSensor<T>`
   - `SensorHandler` - discovery by type/name/port
   - `SensorFactory` - creates instances from definitions
   - `SensorCollection` - container managing all sensors

3. **Modules** (`src/modules/`): Blockly block definitions implementing `ModuleDefinition`
   - Each module exports a function: `featureModuleDefinition(context, strings)`
   - Returns object with features containing `category`, `blocks`, `classMethods`, `classConstants`

### Key Interfaces (in `src/definitions.ts`)

- `QuickalgoLibrary` - Main context with 150+ properties for sensor state, grading, display
- `QuickalgoLibraryBlock` - Block definition with `name`, `params`, `handler`, `yieldsValue`
- `ModuleDefinition` - Maps feature names to `ModuleFeature` objects

### Module Pattern

Modules define Blockly blocks with handlers:
```typescript
export function exampleModuleDefinition(context: QuickalgoLibrary, strings) {
  return {
    featureName: {
      category: 'sensors',  // or 'actuator'
      blocks: [{
        name: "blockName",
        params: ["String", "Number"],
        yieldsValue: 'int',
        handler: function(param1, param2, callback) { ... }
      }],
      classMethods: {
        ClassName: {
          init: { handler: function() {...} },
          methods: { methodName: { handler: function(self, callback) {...} } }
        }
      }
    }
  } satisfies ModuleDefinition;
}
```

Note that the handler function should be defined separately
from the list of features, in a defined function above
the return, having the same name as the block or feature name.

### Execution Modes

- `context.display` - UI rendering enabled
- `context.autoGrading` - Test validation mode
- `context.offLineMode` - Simulation without hardware
- Live mode - Real hardware via `context.quickPiConnection`

### Connection Methods

Defined in `ConnectionMethod` enum: local, wifi, web_serial, usb, bluetooth. Board-specific methods in `getAvailableConnectionMethods()`.

## Key Files

- `src/blocklyQuickPi_lib.ts` - Main library, sensor initialization, concepts
- `src/modules/module_definition.ts` - `ModuleDefinition`, `ModuleFeature`, `ModuleClassDefinition` interfaces
- `src/sensors/util/sensor_handler.ts` - Sensor discovery and management

## Integration

Library exports to `window` for QuickAlgo consumption:
- `window.quickPiLocalLanguageStrings` - i18n strings
- `window.getContext` - Creates library context
- `window.QuickStore` - State persistence