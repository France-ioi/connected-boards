import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorIrRecv} from "../sensors/irrecv";

export function irrecvModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readInfraredState = (name, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);
      context.runner.noDelay(callback, state ? true : false);
    } else {
      let cb = context.runner.waitCallback(callback);

      sensor.getLiveState(function(returnVal) {
        sensor.state = returnVal;
        sensorHandler.drawSensor(sensor);
        cb(returnVal);
      });
    }
  };

  const readIRMessage = (name, timeout, callback) => {
    let sensor = sensorHandler.findSensorByName<SensorIrRecv>(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);

      let cb = context.runner.waitCallback(callback);

      sensor.waitingForIrMessage = function(command) {
        clearTimeout(sensor.waitingForIrMessageTimeout);
        sensor.waitingForIrMessage = null;
        cb(command);
      };

      sensor.waitingForIrMessageTimeout = setTimeout(function() {
        if (sensor.waitingForIrMessage) {
          sensor.waitingForIrMessage = null;
          cb("none");
        }
      }, timeout);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("readIRMessage(\"irrec1\", " + timeout + ")", function(returnVal) {
        if (typeof returnVal === 'string')
          returnVal = returnVal.replace(/['"]+/g, '');

        cb(returnVal);
      }, true);
    }
  };

  return {
    readInfraredState: {
      category: 'sensors',
      blocks: [
        {
          name: "readInfraredState",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irrecv")},
            ]
          },
          handler: readInfraredState,
        },
      ],
    },
    readIRMessage: {
      category: 'sensors',
      blocks: [
        {
          name: "readIRMessage",
          yieldsValue: 'string',
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irrecv")},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='readIRMessage'>" +
            "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>10000</field></shadow></value>" +
            "</block>",
          handler: readIRMessage,
        },
      ],
    },
  } satisfies ModuleDefinition;
}