import {BoardDefinition, ConnectionMethod} from "../definitions";

export abstract class AbstractBoard {
  protected strings: any = {};

  abstract getBoardDefinitions(): BoardDefinition[]

  abstract getAvailableConnectionMethods(): ConnectionMethod[]

  init(selector, onUserEvent) {
  }

  setStrings(strings) {
    this.strings = strings;
  }
}
