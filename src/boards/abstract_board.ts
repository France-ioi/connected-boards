import {BoardDefinition, ConnectionMethod} from "../definitions";

export abstract class AbstractBoard {
  protected strings: any = {};

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
}
