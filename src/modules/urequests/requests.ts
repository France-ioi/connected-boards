import {ModuleDefinition} from "../module_definition";

export interface FetchParameters {
  method: 'GET'|'POST',
  url: string,
  headers?: object,
  body?: string,
}

export function urequestsModuleDefinition(context: any, strings): ModuleDefinition {
  async function makeRequest(fetchParameters: FetchParameters, callback) {
    const proxyUrl = fetchParameters.url;
    const {url, ...withoutUrlParameters} = fetchParameters;

    let result = null;
    try {
      // @ts-ignore
      result = await fetch(proxyUrl, withoutUrlParameters)
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
          init: {params: ["Number", "String"]},
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
        const cb = context.runner.waitCallback(callback);

        return makeRequest({
          method: 'GET',
          url,
          headers,
        }, cb);
      },
      post: function () {
        const args = [...arguments];
        const callback = args.pop();
        const [url, data, headers] = args;
        const cb = context.runner.waitCallback(callback);

        return makeRequest({
          method: 'POST',
          url,
          headers,
          body: data,
        }, cb);
      },
    },
  };
}
