import {QuickalgoLibraryBlock} from "../definitions";

export interface ModuleDefinition {
  blockDefinitions?: {[categoryName: string]: QuickalgoLibraryBlock[]},
  classDefinitions?: {[categoryName: string]: {[className: string]: QuickalgoLibraryBlock[]}},
  classInstances?: {[className: string]: string},

  blockImplementations?: {[blockName: string]: Function},
  classImplementations?: {[className: string]: {[methodName: string]: Function}},
}
