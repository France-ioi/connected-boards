import {
  getContext,
} from './blocklyQuickPi_lib';
import {quickPiLocalLanguageStrings} from './lang/language_strings';
import {QuickStore} from './sensors/util/quickpi_store';
import {LocalQuickStore} from './sensors/util/local_quickpi_store';
import {OutputGenerator} from './output_generator';
import {screenDrawing} from './sensors/util/screen';

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
