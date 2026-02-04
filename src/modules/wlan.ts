import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function wlanModuleDefinition(context: QuickalgoLibrary, strings) {
  const wlanConstructor = function* (self, interfaceId) {
    self.interface = interfaceId;
  };

  const wlanActive = function (self, active, callback) {
    const sensor = context.sensorHandler.findSensorByType('wifi');
    if (!sensor) {
      throw `There is no Wi-Fi sensor.`;
    }

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.registerQuickPiEvent(sensor.name, {
        ...sensor.state,
        active: !!active,
      });

      context.waitDelay(callback);
    } else {
      const cb = context.runner.waitCallback(callback);
      const command = `wifiSetActive("${sensor.name}", ${active ? 1 : 0})`;
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const wlanScan = function (self, callback) {
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
  };

  const wlanConnect = function (self, ssid, password, callback) {
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
  };

  const wlanDisconnect = function (self, callback) {
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
  };

  const wlanIsconnected = function (self, callback) {
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
  };

  const wlanIfconfig = function (self, callback) {
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
  };

  return {
    wlanInit: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          defaultInstanceName: 'wlan',
          instances: ['wlan'],
          init: {
            params: ["Number"],
            handler: wlanConstructor,
          },
        },
      },
      classConstants: {
        WLAN: {
          STA_IF: '0',
          AP_IF: '1',
        },
      },
    },
    wlanActive: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            active: {
              params: ["Boolean"],
              handler: wlanActive,
            },
          },
        },
      },
    },
    wlanScan: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            scan: {
              handler: wlanScan,
            },
          },
        },
      },
    },
    wlanConnect: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            connect: {
              params: ["String", "String"],
              handler: wlanConnect,
            },
          },
        },
      },
    },
    wlanDisconnect: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            disconnect: {
              handler: wlanDisconnect,
            },
          },
        },
      },
    },
    wlanIsConnected: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            isconnected: {
              yieldsValue: "bool",
              handler: wlanIsconnected,
            },
          },
        },
      },
    },
    wlanIfConfig: {
      category: 'actuator',
      classMethods: {
        WLAN: {
          instances: ['wlan'],
          methods: {
            ifconfig: {
              yieldsValue: "string",
              handler: wlanIfconfig,
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}