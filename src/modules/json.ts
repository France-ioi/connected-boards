import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function jsonModuleDefinition(context: QuickalgoLibrary) {
  const dumps = function (params, callback) {
    const serialized = JSON.stringify(params);
    context.waitDelay(callback, serialized);
  };

  return {
    jsonDumps: {
      category: 'actuator',
      blocks: [
        {
          name: 'dumps',
          params: [null],
          yieldsValue: 'string',
          handler: dumps,
        },
      ],
    },
  } satisfies ModuleDefinition;
}