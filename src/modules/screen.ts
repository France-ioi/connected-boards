import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {screenDrawing} from "../sensors/util/screen";
import {SensorScreen} from "../sensors/screen";

export function initScreenDrawing(sensor: SensorScreen) {
  if (!sensor.screenDrawing) {
    sensor.screenDrawing = new screenDrawing(sensor.canvas);
  }
}

export function screenModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const displayText = (line1, arg2, arg3) => {
    let line2 = arg2;
    let callback = arg3;
    if (typeof arg3 == "undefined") {
      // Only one argument
      line2 = null;
      callback = arg2;
    }

    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    let command = "displayText(\"" + line1 + "\", \"\")";

    context.registerQuickPiEvent(sensor.name,
      {
        line1: line1,
        line2: line2
      }
    );

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function (retval) {
        cb();
      });
    }
  };
  const drawPoint = (x, y, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.drawPoint(x, y);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());


    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "drawPoint(" + x + "," + y + ")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };

  const isPointSet = (x, y, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    let value = sensor.screenDrawing.isPointSet(x, y);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback, value);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "isPointSet(" + x + "," + y + ")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };

  const drawLine = (x0, y0, x1, y1, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.drawLine(x0, y0, x1, y1);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "drawLine(" + x0 + "," + y0 + "," + x1 + "," + y1 + ")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const drawRectangle = (x0, y0, width, height, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.drawRectangle(x0, y0, width, height);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());


    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "drawRectangle(" + x0 + "," + y0 + "," + width + "," + height + ")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };

  const drawCircle = (x0, y0, diameter, callback) => {

    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.drawCircle(x0, y0, diameter);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());


    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "drawCircle(" + x0 + "," + y0 + "," + diameter + ")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const clearScreen = (callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.clearScreen();
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());


    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "clearScreen()";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const updateScreen = (callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "updateScreen()";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const autoUpdate = (autoupdate, callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "autoUpdate(\"" + (autoupdate ? "True" : "False") + "\")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };

  const fill = (color, callback) => {

    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.fill(color);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "fill(\"" + color + "\")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const noFill = (callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.noFill();
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());


    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "NoFill()";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const stroke = (color, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.stroke(color);
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());

    if (!context.display || context.autoGrading || context.offLineMode) {

      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      let command = "stroke(\"" + color + "\")";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };


  const noStroke = (callback) => {
    let sensor = sensorHandler.findSensorByType<SensorScreen>("screen");

    initScreenDrawing(sensor);
    sensor.screenDrawing.noStroke();
    context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "noStroke()";
      context.quickPiConnection.sendCommand(command, function () {
        cb();
      });
    }
  };

  return {
    displayText: {
      category: 'display',
      blocks: [
        {
          name: "displayText",
          params: ["String", "String"],
          variants: [[null], [null, null]],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", "text": ""},
            ]
          },
          blocklyXml: "<block type='displayText'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
            "</block>",
          handler: displayText,
        },
      ],
    },
    displayText2Lines: {
      category: 'display',
      blocks: [
        {
          name: "displayText2Lines",
          params: ["String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", "text": ""},
              {"type": "input_value", "name": "PARAM_1", "text": ""},
            ]
          },
          blocklyXml: "<block type='displayText2Lines'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: displayText,
        },
      ],
    },
    drawPoint: {
      category: 'display',
      blocks: [
        {
          name: "drawPoint",
          params: ["Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='drawPoint'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: drawPoint,
        },
      ],
    },
    isPointSet: {
      category: 'display',
      blocks: [
        {
          name: "isPointSet",
          yieldsValue: 'bool',
          params: ["Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='isPointSet'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: isPointSet,
        },
      ],
    },
    drawLine: {
      category: 'display',
      blocks: [
        {
          name: "drawLine",
          params: ["Number", "Number", "Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
              {"type": "input_value", "name": "PARAM_2"},
              {"type": "input_value", "name": "PARAM_3"},
            ]
          },
          blocklyXml: "<block type='drawLine'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: drawLine,
        },
      ],
    },
    drawRectangle: {
      category: 'display',
      blocks: [
        {
          name: "drawRectangle",
          params: ["Number", "Number", "Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
              {"type": "input_value", "name": "PARAM_2"},
              {"type": "input_value", "name": "PARAM_3"},
            ]
          },
          blocklyXml: "<block type='drawRectangle'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: drawRectangle,
        },
      ],
    },
    drawCircle: {
      category: 'display',
      blocks: [
        {
          name: "drawCircle",
          params: ["Number", "Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
              {"type": "input_value", "name": "PARAM_2"},
            ]
          },
          blocklyXml: "<block type='drawCircle'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: drawCircle,
        },
      ],
    },
    clearScreen: {
      category: 'display',
      blocks: [
        {
          name: "clearScreen",
          handler: clearScreen,
        },
      ],
    },
    updateScreen: {
      category: 'display',
      blocks: [
        {
          name: "updateScreen",
          handler: updateScreen,
        },
      ],
    },
    autoUpdate: {
      category: 'display',
      blocks: [
        {
          name: "autoUpdate",
          params: ["Boolean"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
            ],
          },
          blocklyXml: "<block type='autoUpdate'>" +
            "<value name='PARAM_0'><shadow type='logic_boolean'></shadow></value>" +
            "</block>",
          handler: autoUpdate,
        },
      ],
    },
    fill: {
      category: 'display',
      blocks: [
        {
          name: "fill",
          params: ["Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
            ]
          },
          blocklyXml: "<block type='fill'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: fill,
        },
      ],
    },
    noFill: {
      category: 'display',
      blocks: [
        {
          name: "noFill",
          handler: noFill,
        },
      ],
    },
    stroke: {
      category: 'display',
      blocks: [
        {
          name: "stroke",
          params: ["Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
            ]
          },
          blocklyXml: "<block type='stroke'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: stroke,
        },
      ],
    },
    noStroke: {
      category: 'display',
      blocks: [
        {
          name: "noStroke",
          handler: noStroke,
        },
      ],
    },
  } satisfies ModuleDefinition;
}
