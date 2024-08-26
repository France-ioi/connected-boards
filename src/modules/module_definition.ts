import {QuickAlgoConstant, QuickAlgoCustomClass, QuickalgoLibraryBlock} from "../definitions";

export interface ModuleDefinition {
  blockDefinitions?: {[categoryName: string]: QuickalgoLibraryBlock[]},
  classDefinitions?: {[categoryName: string]: {[className: string]: QuickAlgoCustomClass}},
  classInstances?: {[className: string]: string},
  constants?: QuickAlgoConstant[],

  blockImplementations?: {[blockName: string]: Function},
  classImplementations?: {[className: string]: {[methodName: string]: Function}},
}
