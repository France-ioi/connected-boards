import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {LocalQuickStore} from "../sensors/util/local_quickpi_store";
import {QuickStore} from "../sensors/util/quickpi_store";
import {arrayContains} from "../util";
import {SensorCloudStore} from "../sensors/cloudstore";

const getTemperatureFromCloudUrl = "https://cloud.quick-pi.org/cache/weather.php";
let getTemperatureFromCloudSupportedTowns = [];
let getTemperatureFromCloudCache = {};

// Load supported towns
if (typeof $ !== 'undefined') {
  $.get(getTemperatureFromCloudUrl + "?q=" + "supportedtowns", function(towns) {
    getTemperatureFromCloudSupportedTowns = JSON.parse(towns);
  });
}

export function cloudStoreModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const getTemperatureFromCloud = (location, callback) => {
    if (!arrayContains(getTemperatureFromCloudSupportedTowns, location))
      throw strings.messages.getTemperatureFromCloudWrongValue.format(location);

    let cache = getTemperatureFromCloudCache;
    if (cache[location] != undefined && ((Date.now() - cache[location].lastUpdate) / 1000) / 60 < 10) {
      context.waitDelay(callback, cache[location].temperature);
      return;
    }

    let cb = context.runner.waitCallback(callback);
    $.get(getTemperatureFromCloudUrl + "?q=" + location, function(data) {
      if (data === "invalid") {
        cb(0);
      } else {
        cache[location] = {
          lastUpdate: Date.now(),
          temperature: data
        };
        cb(data);
      }
    });
  };

  const connectToCloudStore = (prefix, password, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorCloudStore>("cloudstore");

    if (!context.display || context.autoGrading) {
      sensor.quickStore = new LocalQuickStore();
    } else {
      sensor.quickStore = new QuickStore(prefix, password);
    }

    context.runner.noDelay(callback, 0);
  };

  const writeToCloudStore = (identifier, key, value, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorCloudStore>("cloudstore");

    if (!sensor.quickStore || !sensor.quickStore.connected) {
      context.success = false;
      throw("Cloud store not connected");
    }

    if (!context.display || context.autoGrading) {
      (sensor.quickStore as LocalQuickStore).write(identifier, key, value);
      context.registerQuickPiEvent(sensor.name, (sensor.quickStore as LocalQuickStore).getStateData());
      context.runner.noDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      sensor.quickStore.write(identifier, key, value, function(data) {
        if (!data || !data.success) {
          if (data && data.message)
            context.failImmediately = "cloudstore: " + data.message;
          else
            context.failImmediately = "Error trying to communicate with cloud store";
        }
        cb();
      });
    }
  };

  const readFromCloudStore = (identifier, key, callback) => {
    let sensor = sensorHandler.findSensorByType<SensorCloudStore>("cloudstore");

    if (!sensor.quickStore) {
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
      } else {
        context.success = false;
        throw("Key not found");
      }

      (sensor.quickStore as LocalQuickStore).write(identifier, key, value);
      context.registerQuickPiEvent(sensor.name, (sensor.quickStore as LocalQuickStore).getStateData());

      context.runner.noDelay(callback, value);
    } else {
      let cb = context.runner.waitCallback(callback);
      sensor.quickStore.read(identifier, key, function(data) {
        let value = "";
        if (data && data.success) {
          try {
            value = JSON.parse(data.value);
          } catch(err) {
            value = data.value;
          }
        } else {
          if (data && data.message)
            context.failImmediately = "cloudstore: " + data.message;
          else
            context.failImmediately = "Error trying to communicate with cloud store";
        }

        cb(value);
      });
    }
  };

  return {
    getTemperatureFromCloud: {
      category: 'internet',
      blocks: [
        {
          name: "getTemperatureFromCloud",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_input", "name": "PARAM_0", text: "Paris"},
            ]
          },
          blocklyXml: "<block type='getTemperatureFromCloud'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: getTemperatureFromCloud,
        },
      ],
    },
    connectToCloudStore: {
      category: 'internet',
      blocks: [
        {
          name: "connectToCloudStore",
          params: ["String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", text: ""},
              {"type": "input_value", "name": "PARAM_1", text: ""},
            ]
          },
          blocklyXml: "<block type='connectToCloudStore'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: connectToCloudStore,
        },
      ],
    },
    writeToCloudStore: {
      category: 'internet',
      blocks: [
        {
          name: "writeToCloudStore",
          params: ["String", "String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", text: ""},
              {"type": "input_value", "name": "PARAM_1", text: ""},
              {"type": "input_value", "name": "PARAM_2", text: ""},
            ]
          },
          blocklyXml: "<block type='writeToCloudStore'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "<value name='PARAM_2'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: writeToCloudStore,
        },
      ],
    },
    readFromCloudStore: {
      category: 'internet',
      blocks: [
        {
          name: "readFromCloudStore",
          yieldsValue: 'string',
          params: ["String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", text: ""},
              {"type": "input_value", "name": "PARAM_1", text: ""},
            ]
          },
          blocklyXml: "<block type='readFromCloudStore'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: readFromCloudStore,
        },
      ],
    },
  } satisfies ModuleDefinition;
}