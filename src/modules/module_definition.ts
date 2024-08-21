import {QuickalgoLibraryBlock} from "../definitions";

interface QuickAlgoCustomClass {
  defaultInstanceName?: string,
  init?: QuickalgoLibraryBlock,
  blocks: QuickalgoLibraryBlock[],
  constants?: {name: string, value: any}[],
}

export interface ModuleDefinition {
  blockDefinitions?: {[categoryName: string]: QuickalgoLibraryBlock[]},
  classDefinitions?: {[categoryName: string]: {[className: string]: QuickAlgoCustomClass}},
  classInstances?: {[className: string]: string},

  blockImplementations?: {[blockName: string]: Function},
  classImplementations?: {[className: string]: {[methodName: string]: Function}},
}
