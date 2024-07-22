import {GalaxiaBoard} from './galaxia/galaxia_board';
import {getQuickPiConnection} from './galaxia/galaxia';
import {
  QuickStore,
  getContext,
} from './quickpi/blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';

const exportToWindow = {
  GalaxiaBoard,
  getQuickPiConnection,
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

export {
  GalaxiaBoard,
  getQuickPiConnection,
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
}
