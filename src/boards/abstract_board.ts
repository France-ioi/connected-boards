import {BoardDefinition, ConnectionMethod, QuickalgoLibraryBlock} from "../definitions";

export interface BoardCustomBlocks {
  customBlocks?: {[generatorName: string]: {[categoryName: string]: QuickalgoLibraryBlock[]}},
  customConstants?: {[generatorName: string]: {name: string, value: any}[]},
  customClasses?: {[generatorName: string]: {[categoryName: string]: {[className: string]: any[]}}},
  customClassInstances?: {[generatorName: string]: {[instanceName: string]: string}},

  customBlockImplementations?: {[generatorName: string]: {[blockName: string]: Function}},
  customClassImplementations?: {[generatorName: string]: {[className: string]: {[methodName: string]: Function}}},
}

export abstract class AbstractBoard {
  protected strings: any = {};
  public defaultSubBoard: string = 'quickpi';

  abstract getBoardDefinitions(): BoardDefinition[]

  abstract getAvailableConnectionMethods(): ConnectionMethod[]

  abstract getConnection(): (userName: string, _onConnect: () => void, _onDisconnect: (wasConnected: boolean, wrongversion: boolean) => void, _onChangeBoard: (board: string) => void) => void

  init(selector, onUserEvent) {
  }

  setStrings(strings) {
    this.strings = strings;
  }

  getCurrentBoard(board: string) {
    return this.getBoardDefinitions().find(function (element) {
      if (board === element.name)
        return element;
    });
  }

  getCustomBlocks(context, strings): BoardCustomBlocks {
    return {
      customBlocks: {},
    };
  }
}
