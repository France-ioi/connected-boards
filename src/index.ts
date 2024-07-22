import {getQuickPiConnection} from './galaxia/galaxia';
import {
  QuickStore,
  getContext,
} from './quickpi/blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';

import "./style.scss"

const exportToWindow = {
  getQuickPiConnection,
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

export {
  getQuickPiConnection,
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
}
