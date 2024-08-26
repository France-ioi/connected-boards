import {ModuleDefinition} from "../module_definition";

export interface FetchParameters {
  method: 'GET'|'POST',
  url: string,
  headers?: object,
  body?: string,
}



export function urequestsModuleDefinition(context: any, strings): ModuleDefinition {
  function makeRequest(fetchParameters: FetchParameters, callback) {
    console.log('fetch', fetchParameters);
    const proxyUrl = fetchParameters.url;
    const {url, ...withoutUrlParameters} = fetchParameters;

    // @ts-ignore
    return fetch(proxyUrl, withoutUrlParameters)
      .then((result) => {
        console.log('result', result);
        // TODO: handle response to make .text and .json() on it
        callback(result);
      })
      .catch(() => {
        throw strings.messages.networkRequestFailed.format(fetchParameters.url);
      })
  }

  return {
    blockDefinitions: {
      actuator: [
        {name: 'get', variants: [["String"], ["String", null]], yieldsValue: 'string'},
        {name: 'post', variants: [["String", null], ["String", null, null]], yieldsValue: 'string'},
      ]
    },
    blockImplementations: {
      get: function (url: string, headers = {}, callback) {
        const cb = context.runner.waitCallback(callback);

        return makeRequest({
          method: 'GET',
          url,
          headers,
        }, cb);
      },
      post: function (url: string, data = null, headers = {}, callback) {
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
