import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function thingzButtonsModuleDefinition(context: any, strings: any): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: {
        Button: {
          blocks: [
            {name: "is_pressed", yieldsValue: true, blocklyJson: {output: "Boolean"}},
          ],
        },
        ButtonTouch: {
          blocks: [
            {name: "is_touched", yieldsValue: true, blocklyJson: {output: "Boolean"}},
          ],
        }
      }
    },
    classImplementations: {
      Button: {
        is_pressed: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.isButtonPressedWithName(self.__variableName, callback);
        },
      },
      ButtonTouch: {
        is_touched: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.isButtonPressedWithName(self.__variableName, callback);
        },
      }
    },
    classInstances: {
      button_a: 'Button',
      button_b: 'Button',
      touch_n: 'ButtonTouch',
      touch_s: 'ButtonTouch',
      touch_e: 'ButtonTouch',
      touch_w: 'ButtonTouch',
    },
  }
}
