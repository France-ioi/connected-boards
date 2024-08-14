import {ModuleDefinition} from "../module_definition";

export function thingzButtonsModuleDefinition(context: any): ModuleDefinition {
  return {
    classDefinitions: {
      sensors: {
        Button: [
          {name: "is_pressed", yieldsValue: true, blocklyJson: {output: "Boolean"}},
        ],
        ButtonTouch: [
          {name: "is_touched", yieldsValue: true, blocklyJson: {output: "Boolean"}},
        ],
      }
    },
    classImplementations: {
      Button: {
        is_pressed: function (self, callback) {
          const buttonName = `btn${self.__variableName.split('_')[1].toLocaleUpperCase()}`;
          context.quickpi.isButtonPressedWithName(buttonName, callback);
        },
      },
      ButtonTouch: {
        is_touched: function (self, callback) {
          const buttonName = `btn${self.__variableName.split('_')[1].toLocaleUpperCase()}`;
          context.quickpi.isButtonPressedWithName(buttonName, callback);
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
