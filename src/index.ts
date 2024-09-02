import {
  getContext,
} from './blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';
import {QuickStore} from './sensors/quickpi_store';
import {LocalQuickStore} from './sensors/local_quickpi_store';
import {OutputGenerator} from './output_generator';
import {screenDrawing} from './sensors/screen';

import "./style.scss"

const exportToWindow = {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
  quickPiStore: LocalQuickStore,
  OutputGenerator,
  screenDrawing,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

export {
  quickPiLocalLanguageStrings,
  QuickStore,
  getContext,
}
