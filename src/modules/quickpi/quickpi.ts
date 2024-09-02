import {buzzerSound} from "../../sensors/buzzer_sound";
import {ModuleDefinition} from "../module_definition";
import {LocalQuickStore} from "../../sensors/local_quickpi_store";
import {QuickStore} from "../../sensors/quickpi_store";
import {arrayContains} from "../../util";
import {screenDrawing} from "../../sensors/screen";

export function quickpiModuleDefinition(context: any, strings: any): ModuleDefinition {
  const sensorHandler = context.sensorHandler;

  const blockDefinitions = {
    sensors: [
      { name: "currentTime", yieldsValue: 'int' },

      {
        name: "waitForButton", params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
            }
          ]
        }
      },
      {
        name: "isButtonPressed", yieldsValue: 'bool'
      },
      {
        name: "isButtonPressedWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
            },
          ]
        }
      },
      {
        name: "buttonWasPressed", yieldsValue: 'bool', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("button")
            }
          ]
        }
      },
      {
        name: "onButtonPressed", params: ["String", "Statement"], blocklyInit() {
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
        }
      },
      {
        name: "readTemperature", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("temperature")
            }
          ]
        }
      },
      {
        name: "readRotaryAngle", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("potentiometer")
            }
          ]
        }
      },
      {
        name: "readDistance", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("range")
            }
          ]
        }
      },
      {
        name: "readLightIntensity", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("light")
            }
          ]
        }
      },
      {
        name: "readHumidity", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("humidity")
            }
          ]
        }
      },
      {
        name: "readAcceleration", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
            }
          ]
        }
      },
      {
        name: "computeRotation", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": [["pitch", "pitch"], ["roll", "roll"]]
            }
          ]
        }
      },
      {
        name: "readSoundLevel", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("sound")
            }
          ]
        }
      },
      {
        name: "readMagneticForce", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
            }
          ]
        }
      },
      {
        name: "computeCompassHeading", yieldsValue: 'int'
      },
      {
        name: "readInfraredState", yieldsValue: 'bool', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irrecv")
            }
          ]
        }
      },
      {
        name: "readIRMessage", yieldsValue: 'string', params: ["String", "Number"], blocklyJson: {
          "args0": [
            { "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irrecv") },
            { "type": "input_value", "name": "PARAM_1"},
          ]
        },
        blocklyXml: "<block type='readIRMessage'>" +
          "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>10000</field></shadow></value>" +
          "</block>"
      },
      {
        name: "readAngularVelocity", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
            }
          ]
        }
      },
      {
        name: "setGyroZeroAngle"
      },
      {
        name: "computeRotationGyro", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
            }
          ]
        }
      },

    ],
    actuator: [
      { name: "turnLedOn" },
      { name: "turnLedOff" },
      { name: "turnBuzzerOn" },
      { name: "turnBuzzerOff" },
      {
        name: "setLedState", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
          ]
        }
      },
      {
        name: "setLedMatrixOne", params: ["String", "Number", "Number", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
            { "type": "input_value", "name": "PARAM_1" },
            { "type": "input_value", "name": "PARAM_2" },
            { "type": "field_dropdown", "name": "PARAM_3", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
          ]
        }
      },
      {
        name: "setBuzzerState", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
            },
            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
          ]
        }
      },
      {
        name: "setBuzzerNote", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
            },
            { "type": "input_value", "name": "PARAM_1"},
          ]
        },
        blocklyXml: "<block type='setBuzzerNote'>" +
          "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>200</field></shadow></value>" +
          "</block>"
      },
      {
        name: "getBuzzerNote", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
            },
          ]
        }
      },
      {
        name: "setLedBrightness", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
            { "type": "input_value", "name": "PARAM_1"},
          ]
        },
        blocklyXml: "<block type='setLedBrightness'>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "getLedBrightness", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
          ]
        }
      },
      {
        name: "isLedOn", yieldsValue: 'bool'
      },
      {
        name: "isLedOnWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
          ]
        }
      },
      {
        name: "isBuzzerOn", yieldsValue: 'bool'
      },
      {
        name: "isBuzzerOnWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
            },
          ]
        }
      },
      {
        name: "toggleLedState", params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")
            },
          ]
        }
      },
      {
        name: "setServoAngle", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")
            },
            { "type": "input_value", "name": "PARAM_1" },

          ]
        },
        blocklyXml: "<block type='setServoAngle'>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "getServoAngle", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")
            },
          ]
        }
      },
      {
        name: "setContinousServoDirection", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {
              "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")
            },
            {
              "type": "field_dropdown", "name": "PARAM_1", "options": [["forward", "1"], ["backwards", "-1"], ["stop", "0"]]
            },

          ]
        },
      },
      {
        name: "setInfraredState", params: ["String", "Number"], blocklyJson: {
          "args0": [
            {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irtrans")},
            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
          ]
        }
      },
      {
        name: "sendIRMessage", params: ["String", "String"], blocklyJson: {
          "args0": [
            {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irtrans")},
            { "type": "input_value", "name": "PARAM_1", "text": "" },
          ]
        },
        blocklyXml: "<block type='sendIRMessage'>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },
      {
        name: "presetIRMessage", params: ["String", "String"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", "text": "" },
            { "type": "input_value", "name": "PARAM_1", "text": "" },
          ]
        },
        blocklyXml: "<block type='presetIRMessage'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },
      {
        name: "sleep", params: ["Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", "value": 0 },
          ]
        }
        ,
        blocklyXml: "<block type='sleep'>" +
          "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1000</field></shadow></value>" +
          "</block>"
      },
    ],
    display: [
      {
        name: "displayText", params: ["String", "String"], variants: [[null], [null, null]], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", "text": "" },
          ]
        },
        blocklyXml: "<block type='displayText'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
          "</block>"

      },
      {
        name: "displayText2Lines", params: ["String", "String"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", "text": "" },
            { "type": "input_value", "name": "PARAM_1", "text": "" },
          ]
        },
        blocklyXml: "<block type='displayText2Lines'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"

      },
      {
        name: "drawPoint", params: ["Number", "Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
            { "type": "input_value", "name": "PARAM_1"},
          ]
        },
        blocklyXml: "<block type='drawPoint'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "isPointSet", yieldsValue: 'bool', params: ["Number", "Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
            { "type": "input_value", "name": "PARAM_1"},
          ]
        },
        blocklyXml: "<block type='isPointSet'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "drawLine", params: ["Number", "Number", "Number", "Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
            { "type": "input_value", "name": "PARAM_1"},
            { "type": "input_value", "name": "PARAM_2"},
            { "type": "input_value", "name": "PARAM_3"},
          ]
        },
        blocklyXml: "<block type='drawLine'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "drawRectangle", params: ["Number", "Number", "Number", "Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
            { "type": "input_value", "name": "PARAM_1"},
            { "type": "input_value", "name": "PARAM_2"},
            { "type": "input_value", "name": "PARAM_3"},
          ]
        },
        blocklyXml: "<block type='drawRectangle'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "drawCircle", params: ["Number", "Number", "Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
            { "type": "input_value", "name": "PARAM_1"},
            { "type": "input_value", "name": "PARAM_2"},
          ]
        },
        blocklyXml: "<block type='drawCircle'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
          "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },

      {
        name: "clearScreen"
      },
      {
        name: "updateScreen"
      },
      {
        name: "autoUpdate", params: ["Boolean"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
          ],
        },
        blocklyXml: "<block type='autoUpdate'>" +
          "<value name='PARAM_0'><shadow type='logic_boolean'></shadow></value>" +
          "</block>"

      },
      {
        name: "fill", params: ["Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
          ]
        },
        blocklyXml: "<block type='fill'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "noFill"
      },
      {
        name: "stroke", params: ["Number"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0"},
          ]
        },
        blocklyXml: "<block type='stroke'>" +
          "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
          "</block>"
      },
      {
        name: "noStroke"
      },
    ],
    internet: [
      {
        name: "getTemperatureFromCloud", yieldsValue: 'int', params: ["String"], blocklyJson: {
          "args0": [
            { "type": "field_input", "name": "PARAM_0", text: "Paris"},
          ]
        },
        blocklyXml: "<block type='getTemperatureFromCloud'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },
      {
        name: "connectToCloudStore", params: ["String", "String"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", text: ""},
            { "type": "input_value", "name": "PARAM_1", text: ""},
          ]
        },
        blocklyXml: "<block type='connectToCloudStore'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },
      {
        name: "writeToCloudStore", params: ["String", "String", "String"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", text: ""},
            { "type": "input_value", "name": "PARAM_1", text: ""},
            { "type": "input_value", "name": "PARAM_2", text: ""},
          ]
        },
        blocklyXml: "<block type='writeToCloudStore'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "<value name='PARAM_2'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },
      {
        name: "readFromCloudStore", yieldsValue: 'string', params: ["String", "String"], blocklyJson: {
          "args0": [
            { "type": "input_value", "name": "PARAM_0", text: ""},
            { "type": "input_value", "name": "PARAM_1", text: ""},
          ]
        },
        blocklyXml: "<block type='readFromCloudStore'>" +
          "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
          "</block>"
      },

    ]
  };

  let getTemperatureFromCloudURl = "https://cloud.quick-pi.org/cache/weather.php";

  let getTemperatureFromCloudSupportedTowns = [];

// setup the supported towns
  $.get(getTemperatureFromCloudURl + "?q=" + "supportedtowns", function(towns) {
    getTemperatureFromCloudSupportedTowns = JSON.parse(towns);
  });

// We create a cache so there is less calls to the api and we get the results of the temperature faster
  let getTemperatureFromCloudCache = {};

  const blockImplementations: {[block: string]: Function} = {
    turnLedOn: function (callback) {
      let sensor = sensorHandler.findSensorByType("led");

      context.registerQuickPiEvent(sensor.name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      }
      else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("turnLedOn()", cb);
      }
    },

    turnLedOff: function (callback) {
      let sensor = sensorHandler.findSensorByType("led");

      context.registerQuickPiEvent(sensor.name, false);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("turnLedOff()", cb);
      }
    },

    setLedMatrixOne: function (name, i, j, state, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if(i < 0 || i > 5 || j < 0 || j > 5) {
        throw "invalid led position";
      }

      sensor.state[i][j] = state ? 1 : 0;

      context.registerQuickPiEvent(name, sensor.state);
      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        const command = "setLedMatrixState(\"" + name + "\"," + JSON.stringify(sensor.state) + ")";
        const cb = context.runner.waitCallback(callback);
        context.quickPiConnection.sendCommand(command, cb);
      }
    },

    turnBuzzerOn: function (callback) {
      context.registerQuickPiEvent("buzzer1", true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      }
      else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("turnBuzzerOn()", cb);
      }
    },

    turnBuzzerOff: function (callback) {
      context.registerQuickPiEvent("buzzer1", false);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("turnBuzzerOff()", cb);
      }
    },

    waitForButton: function (name, callback) {
      //        context.registerQuickPiEvent("button", "D22", "wait", false);
      let sensor = sensorHandler.findSensorByName(name, true);

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
    },


    isButtonPressed: function (arg1, arg2) {
      let callback = arg2;
      let sensor = sensorHandler.findSensorByName(arg1, true);
      let name = arg1;
      if(typeof arg2 == "undefined") {
        // no arguments
        let callback = arg1;
        let sensor = sensorHandler.findSensorByType("button");
        let name = sensor.name;
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

          stickDefinition.getLiveState(sensor, function(returnVal) {
            sensor.state = returnVal;
            sensorHandler.drawSensor(sensor);

            let buttonstate = stickDefinition.getButtonState(name, sensor.state);

            cb(buttonstate);
          });

        } else {
          sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
            sensor.state = returnVal != "0";
            sensorHandler.drawSensor(sensor);
            cb(returnVal != "0");
          });
        }
      }
    },

    buttonWasPressed: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

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

    },

    setLedState: function (name, state, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);
      let command = "setLedState(\"" + sensor.port + "\"," + (state ? "True" : "False") + ")";

      context.registerQuickPiEvent(name, state ? true : false);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, cb);
      }
    },

    setBuzzerState: function (name, state, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let command = "setBuzzerState(\"" + name + "\"," + (state ? "True" : "False") + ")";

      context.registerQuickPiEvent(name, state ? true : false);

      if(context.display) {
        state ? buzzerSound.start(name) : buzzerSound.stop(name);
      }

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, cb);
      }
    },

    isBuzzerOn: function (arg1, arg2) {
      let callback = arg2;
      let sensor = sensorHandler.findSensorByName(arg1, true);
      if(typeof arg2 == "undefined") {
        // no arguments
        let callback = arg1;
        let sensor = sensorHandler.findSensorByType("buzzer");
      }

      let command = "isBuzzerOn(\"" + sensor.name + "\")";

      if (!context.display || context.autoGrading || context.offLineMode) {
        let state = context.getSensorState("buzzer1");
        context.waitDelay(callback, state);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal)
          cb(returnVal);
        });
      }
    },

    setBuzzerNote: function (name, frequency, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);
      let command = "setBuzzerNote(\"" + name + "\"," + frequency + ")";

      context.registerQuickPiEvent(name, frequency);

      if(context.display && context.offLineMode) {
        buzzerSound.start(name, frequency);
      }

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal)
          cb(returnVal);

        });
      }
    },

    getBuzzerNote: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let command = "getBuzzerNote(\"" + name + "\")";

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback, sensor.state);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal)
          cb(returnVal);

        });
      }
    },


    setLedBrightness: function (name, level, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (typeof level == "object")
      {
        level = level.valueOf();
      }

      let command = "setLedBrightness(\"" + name + "\"," + level + ")";

      context.registerQuickPiEvent(name, level);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, cb);
      }
    },


    getLedBrightness: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let command = "getLedBrightness(\"" + name + "\")";

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback, sensor.state);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal)
          cb(returnVal);

        });
      }
    },

    isLedOn: function (arg1, arg2) {
      let callback = arg2;
      let sensor = sensorHandler.findSensorByName(arg1, true);
      if(typeof arg2 == "undefined") {
        // no arguments
        let callback = arg1;
        let sensor = sensorHandler.findSensorByType("led");
      }

      let command = "getLedState(\"" + sensor.name + "\")";

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback, sensor.state);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal)
          cb(returnVal);

        });
      }
    },

    toggleLedState: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let command = "toggleLedState(\"" + name + "\")";
      let state = sensor.state;

      context.registerQuickPiEvent(name, !state);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) { return returnVal != "0"; });
      }
    },

    displayText: function (line1, arg2, arg3) {
      let line2 = arg2;
      let callback = arg3;
      if(typeof arg3 == "undefined") {
        // Only one argument
        let line2 = null;
        let callback = arg2;
      }

      let sensor = sensorHandler.findSensorByType("screen");

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
    },

    readTemperature: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        let state = context.getSensorState(name);

        context.runner.waitDelay(callback, state);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },

    sleep: function (time, callback) {
      context.increaseTimeBy(time);
      if (!context.display || context.autoGrading) {
        context.runner.noDelay(callback);
      }
      else {
        context.runner.waitDelay(callback, null, time);
      }
    },


    setServoAngle: function (name, angle, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (angle > 180)
        angle = 180;
      else if (angle < 0)
        angle = 0;

      context.registerQuickPiEvent(name, angle);
      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let command = "setServoAngle(\"" + name + "\"," + angle + ")";
        const cb = context.runner.waitCallback(callback);
        context.quickPiConnection.sendCommand(command, cb);
      }
    },

    getServoAngle: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let command = "getServoAngle(\"" + name + "\")";

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback, sensor.state);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand(command, function(returnVal) {
          returnVal = parseFloat(returnVal);
          cb(returnVal);

        });
      }
    },


    setContinousServoDirection: function (name, direction, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      let angle = 90;
      if (direction > 0) {
        angle = 0;
      }
      else if (direction < 0) {
        angle = 180;
      }

      context.registerQuickPiEvent(name, angle);
      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let command = "setServoAngle(\"" + name + "\"," + angle + ")";
        const cb = context.runner.waitCallback(callback);
        context.quickPiConnection.sendCommand(command, cb);
      }
    },

    readRotaryAngle: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {

        let state = context.getSensorState(name);
        context.waitDelay(callback, state);
      } else {

        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },


    readDistance: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);
      if (!context.display || context.autoGrading || context.offLineMode) {

        let state = context.getSensorState(name);
        context.waitDelay(callback, state);
      } else {

        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },



    readLightIntensity: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {

        let state = context.getSensorState(name);
        context.waitDelay(callback, state);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;

          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },

    readHumidity: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {

        let state = context.getSensorState(name);
        context.waitDelay(callback, state);
      } else {

        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },

    currentTime: function (callback) {
      let millis = new Date().getTime();

      if (context.autoGrading) {
        millis = context.currentTime;
      }

      context.runner.waitDelay(callback, millis);
    },

    getTemperatureFromCloud: function(location, callback) {
      let url = getTemperatureFromCloudURl;

      if (!arrayContains(getTemperatureFromCloudSupportedTowns, location))
        throw strings.messages.getTemperatureFromCloudWrongValue.format(location);

      let cache = getTemperatureFromCloudCache;
      if (cache[location] != undefined && ((Date.now() - cache[location].lastUpdate) / 1000) / 60 < 10) {
        context.waitDelay(callback, cache[location].temperature);
        return;
      }

      let cb = context.runner.waitCallback(callback);
      $.get(url + "?q=" + location, function(data) {
        // If the server return invalid it mean that the town given is not supported
        if (data === "invalid") {
          // This only happen when the user give an invalid town to the server, which should never happen because
          // the validity of the user input is checked above.
          cb(0);
        } else {
          cache[location] = {
            lastUpdate: Date.now(),
            temperature: data
          },
            cb(data);
        }
      });
    },

    initScreenDrawing: function(sensor) {
      if  (!sensor.screenDrawing)
        sensor.screenDrawing = new screenDrawing(sensor.canvas);
    },

    drawPoint: function(x, y, callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },

    isPointSet: function(x, y, callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },

    drawLine: function(x0, y0, x1, y1, callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },


    drawRectangle: function(x0, y0, width, height, callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },

    drawCircle: function(x0, y0, diameter, callback) {

      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
      sensor.screenDrawing.drawCircle(x0, y0, diameter, diameter);
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
    },


    clearScreen: function(callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },


    updateScreen: function(callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        let command = "updateScreen()";
        context.quickPiConnection.sendCommand(command, function () {
          cb();
        });
      }
    },


    autoUpdate: function(autoupdate, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        let command = "autoUpdate(\"" + (autoupdate ? "True" : "False") + "\")";
        context.quickPiConnection.sendCommand(command, function () {
          cb();
        });
      }
    },

    fill: function(color, callback) {

      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },


    noFill: function(callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },


    stroke: function(color, callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },


    noStroke: function(callback) {
      let sensor = sensorHandler.findSensorByType("screen");

      context.quickpi.initScreenDrawing(sensor);
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
    },

    readAcceleration: function(axis, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("accelerometer");

        let index = 0;
        if (axis == "x")
          index = 0;
        else if (axis == "y")
          index = 1;
        else if (axis == "z")
          index = 2;

        let state = context.getSensorState(sensor.name);

        if (Array.isArray(state))
          context.waitDelay(callback, state[index]);
        else
          context.waitDelay(callback, 0);
      } else {
        let cb = context.runner.waitCallback(callback);

        let command = "readAcceleration(\"" + axis + "\")";
        context.quickPiConnection.sendCommand(command, function (returnVal) {
          cb(returnVal);
        });
      }
    },

    computeRotation: function(rotationType, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("accelerometer");

        let zsign = 1;
        let result = 0;

        if (sensor.state[2] < 0)
          zsign = -1;

        if (rotationType == "pitch")
        {
          result = 180 * Math.atan2 (sensor.state[0], zsign * Math.sqrt(sensor.state[1]*sensor.state[1] + sensor.state[2]*sensor.state[2]))/Math.PI;
        }
        else if (rotationType == "roll")
        {
          result = 180 * Math.atan2 (sensor.state[1], zsign * Math.sqrt(sensor.state[0]*sensor.state[0] + sensor.state[2]*sensor.state[2]))/Math.PI;
        }

        result = Math.round(result);

        context.waitDelay(callback, result);
      } else {
        let cb = context.runner.waitCallback(callback);
        let command = "computeRotation(\"" + rotationType + "\")";

        context.quickPiConnection.sendCommand(command, function (returnVal) {
          cb(returnVal);
        });
      }
    },


    readSoundLevel: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        let state = context.getSensorState(name);

        context.runner.noDelay(callback, state);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },

    readMagneticForce: function (axis, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("magnetometer");

        let index = 0;
        if (axis == "x")
          index = 0;
        else if (axis == "y")
          index = 1;
        else if (axis == "z")
          index = 2;

        context.waitDelay(callback, sensor.state[index]);
      } else {
        let cb = context.runner.waitCallback(callback);
        let sensor = context.findSensor("magnetometer", "i2c");

        sensorHandler.findSensorDefinition(sensor).getLiveState(axis, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);

          if (axis == "x")
            returnVal = returnVal[0];
          else if (axis == "y")
            returnVal = returnVal[1];
          else if (axis == "z")
            returnVal = returnVal[2];

          cb(returnVal);
        });
      }
    },

    computeCompassHeading: function (callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("magnetometer");

        let heading = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

        heading = Math.round(heading);

        context.runner.noDelay(callback, heading);
      } else {
        let cb = context.runner.waitCallback(callback);
        let sensor = context.findSensor("magnetometer", "i2c");

        context.quickPiConnection.sendCommand("readMagnetometerLSM303C()", function(returnVal) {
          sensor.state = JSON.parse(returnVal);
          sensorHandler.drawSensor(sensor);

          returnVal = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

          returnVal = Math.floor(returnVal);

          cb(returnVal);
        }, true);
      }
    },

    readInfraredState: function (name, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        let state = context.getSensorState(name);

        context.runner.noDelay(callback, state ? true : false);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);
          cb(returnVal);
        });
      }
    },

    setInfraredState: function (name, state, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      context.registerQuickPiEvent(name, state ? true : false);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, state, cb);
      }
    },

    onButtonPressed: function (name, func, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      context.waitForEvent(function (callback) {
        context.quickpi.isButtonPressed(name, callback)
      }, func);

      context.waitDelay(callback);
    },


//// Gyroscope
    readAngularVelocity: function (axis, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("gyroscope");

        let index = 0;
        if (axis == "x")
          index = 0;
        else if (axis == "y")
          index = 1;
        else if (axis == "z")
          index = 2;

        context.waitDelay(callback, sensor.state[index]);
      } else {
        let cb = context.runner.waitCallback(callback);
        let sensor = context.findSensor("gyroscope", "i2c");

        sensorHandler.findSensorDefinition(sensor).getLiveState(axis, function(returnVal) {
          sensor.state = returnVal;
          sensorHandler.drawSensor(sensor);

          if (axis == "x")
            returnVal = returnVal[0];
          else if (axis == "y")
            returnVal = returnVal[1];
          else if (axis == "z")
            returnVal = returnVal[2];

          cb(returnVal);
        });
      }
    },

    setGyroZeroAngle: function (callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("gyroscope");

        sensor.rotationAngles = [0, 0, 0];
        sensor.lastSpeedChange = new Date();

        context.runner.noDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("setGyroZeroAngle()", function(returnVal) {
          cb();
        }, true);
      }
    },

    computeRotationGyro: function (axis, callback) {
      if (!context.display || context.autoGrading || context.offLineMode) {
        let sensor = sensorHandler.findSensorByType("gyroscope");


        let ret = 0;

        if (sensor.rotationAngles != undefined) {
          for (let i = 0; i < 3; i++)
            sensor.rotationAngles[i] += sensor.state[i] * ((+new Date() - sensor.lastSpeedChange) / 1000);

          sensor.lastSpeedChange = new Date();

          if (axis == "x")
            ret = sensor.rotationAngles[0];
          else if (axis == "y")
            ret = sensor.rotationAngles[1];
          else if (axis == "z")
            ret = sensor.rotationAngles[2];
        }

        context.runner.noDelay(callback, ret);
      } else {
        let cb = context.runner.waitCallback(callback);
        let sensor = context.findSensor("gyroscope", "i2c");

        context.quickPiConnection.sendCommand("computeRotationGyro()", function(returnVal) {
          //sensor.state = returnVal;
          //sensorHandler.drawSensor(sensor);

          returnVal = JSON.parse(returnVal);

          if (axis == "x")
            returnVal = returnVal[0];
          else if (axis == "y")
            returnVal = returnVal[1];
          else if (axis == "z")
            returnVal = returnVal[2];

          cb(returnVal);
        }, true);
      }
    },


    connectToCloudStore: function (prefix, password, callback) {
      let sensor = sensorHandler.findSensorByType("cloudstore");

      if (!context.display || context.autoGrading) {
        sensor.quickStore = new LocalQuickStore();
      } else {
        sensor.quickStore = new QuickStore(prefix, password);
      }

      context.runner.noDelay(callback, 0);
    },

    writeToCloudStore: function (identifier, key, value, callback) {
      let sensor = sensorHandler.findSensorByType("cloudstore");

      if (!sensor.quickStore || !sensor.quickStore.connected)
      {
        context.success = false;
        throw("Cloud store not connected");
      }

      if (!context.display || context.autoGrading) {
        sensor.quickStore.write(identifier, key, value);

        context.registerQuickPiEvent(sensor.name, sensor.quickStore.getStateData());

        context.runner.noDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        sensor.quickStore.write(identifier, key, value, function(data) {
          if (!data || !data.success)
          {
            if (data && data.message)
              context.failImmediately = "cloudstore: " + data.message;
            else
              context.failImmediately = "Error trying to communicate with cloud store";

          }
          cb();
        });
      }
    },

    readFromCloudStore: function (identifier, key, callback) {
      let sensor = sensorHandler.findSensorByType("cloudstore");

      if (!sensor.quickStore)
      {
        if (!context.display || context.autoGrading) {
          sensor.quickStore = new LocalQuickStore();
        } else {
          sensor.quickStore = new QuickStore();
        }
      }

      if (!context.display || context.autoGrading) {
        let state = context.getSensorState(sensor.name);
        let value = "";

        if (state.hasOwnProperty(key)) {
          value = state[key];
        }
        else {
          context.success = false;
          throw("Key not found");
        }

        sensor.quickStore.write(identifier, key, value);
        context.registerQuickPiEvent(sensor.name, sensor.quickStore.getStateData());

        context.runner.noDelay(callback, value);
      } else {
        let cb = context.runner.waitCallback(callback);
        sensor.quickStore.read(identifier, key, function(data) {
          let value = "";
          if (data && data.success)
          {
            try {
              value = JSON.parse(data.value);
            } catch(err)
            {
              value = data.value;
            }
          }
          else
          {
            if (data && data.message)
              context.failImmediately = "cloudstore: " + data.message;
            else
              context.failImmediately = "Error trying to communicate with cloud store";
          }

          cb(value);
        });
      }
    },




    readIRMessage: function (name, timeout, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      if (!context.display || context.autoGrading || context.offLineMode) {
        let state = context.getSensorState(name);

        let cb = context.runner.waitCallback(callback);

        sensor.waitingForIrMessage = function(command)
        {
          clearTimeout(sensor.waitingForIrMessageTimeout);
          sensor.waitingForIrMessage = null;

          cb(command);
        }

        sensor.waitingForIrMessageTimeout = setTimeout(function () {
            if (sensor.waitingForIrMessage) {
              sensor.waitingForIrMessage = null;
              cb("none");
            }
          },
          timeout);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("readIRMessage(\"irrec1\", " + timeout + ")", function(returnVal) {

          if (typeof returnVal === 'string')
            returnVal = returnVal.replace(/['"]+/g, '')

          cb(returnVal);
        }, true);
      }
    },

    sendIRMessage: function (name, preset, callback) {
      let sensor = sensorHandler.findSensorByName(name, true);

      //context.registerQuickPiEvent(name, state ? true : false);

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("sendIRMessage(\"irtran1\", \"" + preset + "\")", function(returnVal) {
          cb();
        }, true);
      }
    },

    presetIRMessage: function (preset, data, callback) {
      //let sensor = sensorHandler.findSensorByName(name, true);

      //context.registerQuickPiEvent(name, state ? true : false);
      if (!context.remoteIRcodes)

        context.remoteIRcodes = {};

      context.remoteIRcodes[preset] = data;

      if (!context.display || context.autoGrading || context.offLineMode) {
        context.waitDelay(callback);
      } else {
        let cb = context.runner.waitCallback(callback);

        context.quickPiConnection.sendCommand("presetIRMessage(\"" + preset + "\", \"" + JSON.stringify(JSON.parse(data)) + "\")", function(returnVal) {
          cb();
        }, true);
      }
    },
  };

  blockImplementations.isButtonPressedWithName = blockImplementations.isButtonPressed;
  blockImplementations.isLedOnWithName = blockImplementations.isLedOn;
  blockImplementations.displayText2Lines = blockImplementations.displayText;
  blockImplementations.isBuzzerOnWithName = blockImplementations.isBuzzerOn;

  return {
    blockDefinitions,
    blockImplementations,
  };
}