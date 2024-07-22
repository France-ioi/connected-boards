import {getQuickPiConnection} from './boards/galaxia/galaxia';
import {
  getContext,
} from './blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';
import {QuickStore} from './quickpi_store';

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
