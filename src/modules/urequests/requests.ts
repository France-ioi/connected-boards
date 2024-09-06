import {ModuleDefinition} from "../module_definition";
import {SensorWifi} from "../../sensors/wifi";

export interface FetchParameters {
  method: 'GET'|'POST',
  url: string,
  headers?: {[field: string]: string},
  body?: {[field: string]: string},
}

function getRealValue(object: any) {
  if (!object) {
    return object;
  }
  if (object.toJSON) {
    return object.toJSON();
  }

  return object;
}

export function urequestsModuleDefinition(context: any, strings): ModuleDefinition {
  async function makeRequest(sensor: SensorWifi, fetchParameters: FetchParameters, callback) {
    const proxyUrl = fetchParameters.url;

    context.registerQuickPiEvent(sensor.name, {
      ...sensor.state,
      lastRequest: {
        ...fetchParameters,
      },
    });

    const fetchArguments = {
      method: fetchParameters.method,
      headers: getRealValue(fetchParameters.headers),
      body: getRealValue(fetchParameters.body),
    };

    let result = null;
    try {
      // @ts-ignore
      result = await fetch(proxyUrl, fetchArguments)
    } catch (e) {
      console.error(e);
      throw strings.messages.networkRequestFailed.format(fetchParameters.url);
    }

    const text = await result.text();
    callback({
      __className: 'Response',
      arguments: [
        result.status,
        text,
      ],
    });
  }

  return {
    classDefinitions: {
      actuator: { // category name
        Response: {
          defaultInstanceName: 'response',
          init: {params: ["Number", "String"], hidden: true},
          blocks: [
            {name: "json"},
          ],
        },
      },
    },
    classImplementations: {
      Response: {
        __constructor: function* (self, statusCode, text) {
          self.statusCode = statusCode;
          self.text = text;
        },
        json: function* (self) {
          try {
            return JSON.parse(self.text);
          } catch (e) {
            console.error(e);
            throw strings.messages.nonValidJson;
          }
        },
      },
    },
    blockDefinitions: {
      actuator: [
        {name: 'get', variants: [["String"], ["String", null]], yieldsValue: 'string'},
        {name: 'post', variants: [["String", null], ["String", null, null]], yieldsValue: 'string'},
      ]
    },
    blockImplementations: {
      get: function () {
        const args = [...arguments];
        const callback = args.pop();
        const [url, headers] = args;

        const sensor = context.sensorHandler.findSensorByType('wifi');
        if (!sensor.state?.active) {
          throw strings.messages.wifiNotActive;
        }

        const cb = context.runner.waitCallback(callback);

        return makeRequest(sensor, {
          method: 'GET',
          url,
          headers,
        }, cb);
      },
      post: function () {
        const args = [...arguments];
        const callback = args.pop();
        const [url, data, headers] = args;

        const sensor = context.sensorHandler.findSensorByType('wifi');
        if (!sensor.state?.active) {
          throw strings.messages.wifiNotActive;
        }

        const cb = context.runner.waitCallback(callback);

        return makeRequest(sensor, {
          method: 'POST',
          url,
          headers,
          body: data,
        }, cb);
      },
    },
  };
}
