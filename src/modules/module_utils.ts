import {ModuleDefinition} from "./module_definition";

export function useGeneratorName(module: ModuleDefinition, generatorName: string): ModuleDefinition {
  for (let feature of Object.values(module)) {
    feature.generatorName = generatorName;
  }

  return module;
}
