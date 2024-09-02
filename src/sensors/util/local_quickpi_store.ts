import {deepEqual} from "../../util";

export class LocalQuickStore {
  private Store;
  private rwpassword: string;
  public connected: boolean = false;

  constructor() {
    this.Store = {};
    this.connected = true;
    this.rwpassword = "dummy";
  }

  write(prefix, key, value) {
    this.Store[key] = value;
  }

  read(prefix, key, value) {
    return this.Store[key];
  }

  getStateData() {
    // round trip this trought json so we actually copy everything
    // without keeping any references to objects
    return JSON.parse(JSON.stringify(this.Store));
  }

  static renderDifferences(expectedState, state) {
    let strings = window.task.displayedSubTask.context.setLocalLanguageStrings(window.localLanguageStrings);
    let mainDiv = document.createElement("div");

    for (let p in expectedState) {
      if (expectedState.hasOwnProperty(p) && !state.hasOwnProperty(p)) {

        let div = document.createElement("div");
        $(div).text(strings.messages.cloudKeyNotExists.format(p));
        $(mainDiv).append(div);
      }

      if (expectedState[p] != state[p]) {
        let div = document.createElement("div");

        let message = strings.messages.cloudWrongValue.format(p, expectedState[p], state[p]);

        $(div).text(message);
        $(mainDiv).append(div);
      }
    }

    for (let p in state) {
      if (state.hasOwnProperty(p) && !expectedState.hasOwnProperty(p)) {
        let div = document.createElement("div");
        $(div).text(strings.messages.cloudUnexpectedKey.format(p));
        $(mainDiv).append(div);
      }
    }

    return mainDiv;
  }

  static compareState(state1, state2) {
    return deepEqual(state1, state2);
  }
}
