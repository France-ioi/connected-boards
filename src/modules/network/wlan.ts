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
            {name: "disconnect"},
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

          if (!context.display || context.autoGrading || context.offLineMode) {
            const cb = context.runner.waitCallback(callback);

            setTimeout(() => {
              context.registerQuickPiEvent(sensor.name, {
                ...sensor.state,
                active: !!active,
              });

              cb();
            }, 500);
          } else {
            const cb = context.runner.waitCallback(callback);
            const command = `wifiSetActive("${sensor.name}", ${active ? 1 : 0})`;
            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        scan: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            if (!sensor.state?.active) {
              throw strings.messages.wifiNotActive;
            }

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
            const cb = context.runner.waitCallback(callback);
            const command = "wifiScan(\"" + sensor.name + "\")";
            context.quickPiConnection.sendCommand(command, (result) => {
              cb(JSON.parse(result));
            });
          }
        },
        connect: function (self, ssid, password, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            if (!sensor.state?.active) {
              throw strings.messages.wifiNotActive;
            }

            const cb = context.runner.waitCallback(callback);

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
            const cb = context.runner.waitCallback(callback);
            const command = "wifiConnect(\"" + sensor.name + "\", \"" + ssid + "\", \"" + password + "\")";
            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        disconnect: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('wifi');
          if (!sensor) {
            throw `There is no Wi-Fi sensor.`;
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            if (!sensor.state?.active) {
              throw strings.messages.wifiNotActive;
            }

            const cb = context.runner.waitCallback(callback);

            setTimeout(() => {
              context.registerQuickPiEvent(sensor.name, {
                ...sensor.state,
                connected: false,
                ssid: null,
                password: null,
              });

              cb();
            }, 500);
          } else {
            const cb = context.runner.waitCallback(callback);
            const command = "wifiDisconnect(\"" + sensor.name + "\")";
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

            context.runner.noDelay(callback, !!state.connected);
          } else {
            const cb = context.runner.waitCallback(callback);
            const command = "wifiIsConnected(\"" + sensor.name + "\")";

            context.quickPiConnection.sendCommand(command, function (returnVal) {
              cb(!!returnVal);
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
            const command = "wifiIfConfig(\"" + sensor.name + "\")";
            const cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, (result) => {
              cb(JSON.parse(result));
            });
          }
        },
      },
    },
  }
}
