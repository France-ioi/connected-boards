import {
  getContext,
} from './blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';
import {QuickStore} from './quickpi_store';

import "./style.scss"

const exportToWindow = {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

export {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
}
