import {ModuleDefinition} from "../module_definition";

export function networkWlanModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    constants: [
      {name: 'STA_IF', value: 0},
      {name: 'AP_IF', value: 1},
    ],
    classDefinitions: {
      actuator: { // category name
        WLAN: {
          defaultInstanceName: 'wlan',
          init: {params: ["Number"]},
          blocks: [
            {name: "active", params: ["Boolean"]},
            {name: "scan"},
            {name: "connect", params: ["String", "String"]},
            {name: "isconnected", yieldsValue: "bool"},
            {name: "ifconfig", yieldsValue: "String"},
          ],
        },
      },
    },
    classImplementations: {
      WLAN: {
        __constructor: function* (self, interfaceId) {
          self.interface = interfaceId;
        },
        active: function (self, active, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          let command = "wifiSetActive(\"" + sensor.name + "\", " + active + ")";

          if (!context.display || context.autoGrading || context.offLineMode) {
            let cb = context.runner.waitCallback(callback);

            setTimeout(() => {
              context.registerQuickPiEvent(sensor.name, {
                ...sensor.state,
                active: !!active,
              });

              cb();
            }, 500);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        scan: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!sensor.state?.active) {
            throw strings.messages.wifiNotActive;
          }

          let command = "wifiScan(\"" + sensor.name + "\")";

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.registerQuickPiEvent(sensor.name, {
              ...sensor.state,
              scanning: true,
            });

            let cb = context.runner.waitCallback(callback);

            setTimeout(() => {
              context.registerQuickPiEvent(sensor.name, {
                ...sensor.state,
                scanning: false,
              });

              cb();
            }, 1000);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        connect: function (self, ssid, password, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!sensor.state?.active) {
            throw strings.messages.wifiNotActive;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            let cb = context.runner.waitCallback(callback);

            setTimeout(() => {
              context.registerQuickPiEvent(sensor.name, {
                ...sensor.state,
                connected: true,
                ssid,
                password,
              });

              cb();
            }, 500);
          } else {
            let cb = context.runner.waitCallback(callback);
            let command = "wifiConnect(\"" + sensor.name + "\", \"" + ssid + "\", \"" + password + "\")";
            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        isconnected: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            const state = context.getSensorState(sensor.name);
            if (!state?.active) {
              throw strings.messages.wifiNotActive;
            }

            context.runner.noDelay(callback, !!state.connected);
          } else {
            let command = "wifiIsConnected(\"" + sensor.name + "\")";
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function (returnVal) {
              cb(!!returnVal.connected);
            });
          }
        },
        ifconfig: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            const state = context.getSensorState(sensor.name);
            if (!state?.active) {
              throw strings.messages.wifiNotActive;
            }

            const ips = ['192.168.1.4', '255.255.255.0', '192.168.1.1', '8.8.8.8'];

            context.runner.noDelay(callback, ips);
          } else {
            let command = "wifiIfconfig(\"" + sensor.name + "\")";
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function (returnVal) {
              cb(returnVal);
            });
          }
        },
      },
    },
  }
}
