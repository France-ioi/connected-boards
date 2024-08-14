import {QuickalgoLibraryBlock} from "../definitions";

export interface ModuleDefinition {
  blockDefinitions: {[categoryName: string]: {[className: string]: QuickalgoLibraryBlock[]}},
  classImplementations?: {[className: string]: {[methodName: string]: Function}},
  blockImplementations?: {[blockName: string]: Function},
}
