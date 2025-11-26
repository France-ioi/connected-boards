import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

function convertImageFromString(str: string) {
  return str.split(':').map(e => e.split('').map(Number)).slice(0, 5);
}

export function displayModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      actuator: { // category name
        Display: {
          blocks: [
            {name: "show", params: [null]},
            {name: "clear"},
            {name: "get_pixel", params: ["Number", "Number"]},
            {name: "set_pixel", params: ["Number", "Number", "Number"]},
          ],
        },
        Image: {
          defaultInstanceName: 'image',
          init: {params: ["String"]},
          blocks: [],
          constants: [
            {name: "HEART", value: "09090:99999:99999:09990:00900:"},
            {name: "SMILE", value: "00000:00000:00000:90009:09990:"},
            {name: "SAD", value: "00000:09090:00000:09990:90009:"},
          ],
        },
      },
      sensors: { // category name
        Display: {
          blocks: [
            {name: "read_light_level", yieldsValue: 'int'},
          ],
        },
      },
    },
    classImplementations: {
      Display: {
        __constructor: function* (self) {
        },
        show: function (self, image, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledmatrix');
          if (!sensor) {
            throw `There is no LED matrix.`;
          }

          let command;
          let newState;
          if (image.image) {
            command = `ledMatrixShowImage("${sensor.name}", Image("${image.image}"))`;
            newState = convertImageFromString(image.image);
          } else if (image.match(/[0-9:]/)) {
            command = `ledMatrixShowImage("${sensor.name}", Image("${image}"))`;
            newState = convertImageFromString(image);
          } else {
            command = `ledMatrixShowImage("${sensor.name}", "${image}")`;
            newState = convertImageFromString(image);
          }

          context.registerQuickPiEvent(sensor.name, newState);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        clear: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledmatrix');
          if (!sensor) {
            throw `There is no LED matrix.`;
          }

          const newState = [...new Array(5)].fill([...new Array(5)].fill(0));
          context.registerQuickPiEvent(sensor.name, newState);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            const cb = context.runner.waitCallback(callback);
            const command = `ledMatrixClear("${sensor.name}")`;

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        get_pixel: function (self, x, y, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledmatrix');
          if (!sensor) {
            throw `There is no LED matrix.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            let state = context.getSensorState(sensor.name);

            context.waitDelay(callback, state[y][x]);
          } else {
            let cb = context.runner.waitCallback(callback);

            let command = `ledMatrixGetPixel("${sensor.name}", ${x}, ${y})`;
            context.quickPiConnection.sendCommand(command, function (returnVal) {
              cb(Number(returnVal));
            });
          }
        },
        set_pixel: function (self, x, y, intensity, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledmatrix');
          if (!sensor) {
            throw `There is no LED matrix.`;
          }

          let state = context.getSensorState(sensor.name);
          state[y][x] = intensity;
          context.registerQuickPiEvent(sensor.name, state);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            const cb = context.runner.waitCallback(callback);
            const command = `ledMatrixSetPixel("${sensor.name}", ${x}, ${y}, ${intensity})`;

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        read_light_level: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('light');
          quickPiModuleDefinition.blockImplementations.readLightIntensity(sensor.name, callback);
        },
      },
      Image: {
        __constructor: function* (self, image) {
          self.image = image;
        },
      }
    },
    classInstances: {
      display: 'Display',
    },
  }
}
