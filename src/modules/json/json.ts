import {ModuleDefinition} from "../module_definition";

export function jsonModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    blockDefinitions: {
      actuator: [
        {name: 'dumps', params: [null], yieldsValue: 'string'},
      ]
    },
    blockImplementations: {
      dumps: function (params, callback) {
        const serialized = JSON.stringify(params);
        context.waitDelay(callback, serialized);
      },
    },
  };
}
