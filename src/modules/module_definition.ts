import {QuickalgoLibraryBlock} from "../definitions";

export interface ModuleClassDefinition {
  instances: string[],
  methods: {[methodName: string]: QuickalgoLibraryBlock},
}

export interface ModuleFeature {
  generatorName?: string,
  category: string,
  blocks?: QuickalgoLibraryBlock[],
  classMethods?: {[className: string]: ModuleClassDefinition},
  // constants?: QuickAlgoConstant[],
}

export type ModuleDefinition = {[featureName: string]: ModuleFeature};
