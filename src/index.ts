import {
  getContext,
} from './blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';
import {QuickStore} from './sensors/quickpi_store';
import {LocalQuickStore} from './sensors/local_quickpi_store';

import "./style.scss"

const exportToWindow = {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
  quickPiStore: LocalQuickStore,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

export {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
}
