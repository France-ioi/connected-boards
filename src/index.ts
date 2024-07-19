import {GalaxiaBoard} from './galaxia/galaxia_board';
import {getQuickPiConnection} from './galaxia/galaxia';
import {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
} from './quickpi/blocklyQuickPi_lib';

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
