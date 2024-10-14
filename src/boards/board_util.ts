import {ModuleDefinition} from "../modules/module_definition";
import {BoardCustomBlocks} from "../definitions";
import {deepMerge} from "../util";

export function mergeModuleDefinitions(moduleDefinitions: {[moduleName: string]: ModuleDefinition[]}): BoardCustomBlocks {
  const moduleDefinitionToBoardBlocks = {
    'classDefinitions': 'customClasses',
    'classInstances': 'customClassInstances',
    'classImplementations': 'customClassImplementations',
    'blockImplementations': 'customBlockImplementations',
    'blockDefinitions': 'customBlocks',
    'constants': 'customConstants',
  };

  const toBeMerged: {[boardCustomBlockName: string]: {[moduleName: string]: any}} = {};

  const addToMerge = (boardCustomBlockName: string, moduleName: string, moduleDef) => {
    if (!(boardCustomBlockName in toBeMerged)) {
      toBeMerged[boardCustomBlockName] = {};
    }
    if (!(moduleName in toBeMerged[boardCustomBlockName])) {
      toBeMerged[boardCustomBlockName][moduleName] = [];
    }

    toBeMerged[boardCustomBlockName][moduleName].push(moduleDef);
  }

  for (let [moduleName, moduleSelfDefinitions] of Object.entries(moduleDefinitions)) {
    for (let moduleSelfDefinition of moduleSelfDefinitions) {
      for (let [moduleDefinitionName, boardCustomBlockName] of Object.entries(moduleDefinitionToBoardBlocks)) {
        if (moduleSelfDefinition[moduleDefinitionName]) {
          addToMerge(boardCustomBlockName, moduleName, moduleSelfDefinition[moduleDefinitionName]);
        }
      }
    }
  }

  const boardCustomBlocks: BoardCustomBlocks = {};
  for (let [boardCustomBlockName, elements] of Object.entries(toBeMerged)) {
    boardCustomBlocks[boardCustomBlockName] = {};
    for (let [moduleName, moduleDefinitionsList] of Object.entries(elements)) {
      if (Array.isArray(moduleDefinitionsList[0])) {
        boardCustomBlocks[boardCustomBlockName][moduleName] = moduleDefinitionsList.reduce((cur, next) => [...cur, ...next], []);
      } else {
        boardCustomBlocks[boardCustomBlockName][moduleName] = deepMerge(...moduleDefinitionsList);
      }
    }
  }

  return boardCustomBlocks;
}