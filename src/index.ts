import {GalaxiaBoard} from './galaxia/galaxia_board';
import {getQuickPiConnection} from './galaxia/galaxia';

const exportToWindow = {
  GalaxiaBoard,
  getQuickPiConnection,
};

for (let [name, object] of Object.entries(exportToWindow)) {
  window[name] = object;
}

let a = 5 ** 4;
let b = [1, 3, 5].includes(1);

export {
  GalaxiaBoard,
  getQuickPiConnection,
  a,
  b,
}
