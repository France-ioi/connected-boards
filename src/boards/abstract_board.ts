import {BoardCustomBlocks, BoardDefinition, ConnectionMethod} from "../definitions";
import {ModuleDefinition} from "../modules/module_definition";

export abstract class AbstractBoard {
  protected strings: any = {};
  public defaultSubBoard: string = 'quickpi';

  abstract getBoardDefinitions(): BoardDefinition[]

  abstract getAvailableConnectionMethods(): ConnectionMethod[]

  abstract getConnection(): (userName: string, _onConnect: () => void, _onDisconnect: (wasConnected: boolean, wrongversion: boolean) => void, _onChangeBoard: (board: string) => void) => void

  init(selector, context, onUserEvent) {
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

  getCustomFeatures(context, strings): ModuleDefinition {
    return {
    };
  }
}
