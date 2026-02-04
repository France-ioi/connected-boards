import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorButton} from "../sensors/button";

export function buttonsModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const waitForButton = function (name, callback) {
    //        context.registerQuickPiEvent("button", "D22", "wait", false);
    let sensor = sensorHandler.findSensorByName<SensorButton>(name, true);

    if (!context.display || context.autoGrading) {
      context.advanceToNextRelease("button", sensor.port);

      context.waitDelay(callback);
    } else if (context.offLineMode) {
      if (sensor) {
        let cb = context.runner.waitCallback(callback);
        sensor.onPressed = function () {
          cb();
        }
      } else {
        context.waitDelay(callback);
      }
    }
    else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("waitForButton(\"" + name + "\")", cb);
    }
  };

  const isButtonPressed = function (arg1, arg2) {
    let callback;
    let sensor;
    let name;
    if(typeof arg2 == "undefined") {
      // no arguments
      callback = arg1;
      sensor = sensorHandler.findSensorByType("button");
      name = sensor.name;
    } else {
      callback = arg2;
      sensor = sensorHandler.findSensorByName<SensorButton>(arg1, true);
      name = arg1;
    }

    if (!context.display || context.autoGrading || context.offLineMode) {

      if (sensor.type == "stick") {
        let state = context.getSensorState(name);
        let stickDefinition = sensorHandler.findSensorDefinition(sensor);
        let buttonstate = stickDefinition.getButtonState(name, sensor.state);


        context.runner.noDelay(callback, buttonstate);
      } else {
        let state = context.getSensorState(name);

        context.runner.noDelay(callback, state);
      }
    } else {
      let cb = context.runner.waitCallback(callback);

      if (sensor.type == "stick") {
        let stickDefinition = sensorHandler.findSensorDefinition(sensor);

        sensor.getLiveState(function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);

          let buttonstate = stickDefinition.getButtonState(name, sensor.state);

          cb(buttonstate);
        });

      } else {
        sensor.getLiveState(function(returnVal) {
          sensor.state = returnVal != "0";
          sensorHandler.drawSensor(sensor);
          cb(returnVal != "0");
        });
      }
    }
  };

  const buttonWasPressed = function (name, callback) {
    let sensor = sensorHandler.findSensorByName<SensorButton>(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);

      let wasPressed = !!sensor.wasPressed;
      sensor.wasPressed = false;

      context.runner.noDelay(callback, wasPressed);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand("buttonWasPressed(\"" + name + "\")", function (returnVal) {
        cb(returnVal != "0");
      });
    }
  };

  const onButtonPressed = function (name, func, callback) {
    sensorHandler.findSensorByName(name, true);

    context.waitForEvent(function (callback) {
      context.quickpi.isButtonPressed(name, callback)
    }, func);

    context.waitDelay(callback);
  };

  return {
    waitForButton: {
      category: 'sensors',
      blocks: [
        {
          name: "waitForButton",
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
              }
            ]
          },
          handler: waitForButton,
        },
      ],
    },
    buttonWasPressed: {
      category: 'sensors',
      blocks: [
        {
          name: "buttonWasPressed",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
              }
            ],
          },
          handler: buttonWasPressed,
        },
      ]
    },
    onButtonPressed: {
      category: 'sensors',
      blocks: [
        {
          name: "onButtonPressed",
          params: ["String", "Statement"],
          blocklyInit() {
            return function () {
              this.setColour(context.blocklyHelper.getDefaultColours().categories["sensors"]);
              this.appendDummyInput("PARAM_0")
                .appendField(strings.label.onButtonPressed)
                .appendField(new window.Blockly.FieldDropdown(sensorHandler.getSensorNames("button")), 'PARAM_0')
                .appendField(strings.label.onButtonPressedEnd);
              this.appendStatementInput("PARAM_1")
                .setCheck(null)
                .appendField(strings.label.onButtonPressedDo);
              this.setPreviousStatement(false);
              this.setNextStatement(false);
              this.setOutput(null);
            };
          },
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")},
              { "type": "input_value", "name": "PARAM_1"},
            ]
          },
          handler: onButtonPressed,
        },
      ],
    },
    isButtonPressed: {
      category: 'sensors',
      blocks: [
        {
          name: "isButtonPressed",
          yieldsValue: 'bool',
          handler: isButtonPressed,
        },
      ],
    },
    isButtonPressedWithName: {
      category: 'sensors',
      blocks: [
        {
          name: "isButtonPressedWithName",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
              },
            ]
          },
          handler: isButtonPressed,
        },
      ],
      classMethods: {
        Button: {
          instances: sensorHandler.getSensorNamesForType("button").filter(name => name.startsWith('button_')),
          methods: {
            is_pressed: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                isButtonPressed(self.__variableName, callback);
              },
            },
          },
        },
        ButtonTouch: {
          instances: sensorHandler.getSensorNamesForType("button").filter(name => name.startsWith('pin_') || name.startsWith('touch_')),
          methods: {
            is_touched: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                isButtonPressed(self.__variableName, callback);
              },
            },
          },
        }
      },
    }
  } satisfies ModuleDefinition;
}
