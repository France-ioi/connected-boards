import {AbstractBoard} from "../abstract_board";
import {BoardCustomBlocks, ConnectionMethod} from "../../definitions";
import {getQuickPiConnection} from "./quickpi_connection";
import {quickpiModuleDefinition} from "../../modules/quickpi/quickpi";
import {mergeModuleDefinitions} from "../board_util";
import {ModuleDefinition} from "../../modules/module_definition";
import {accelerometerModuleDefinition} from "../../modules/accelerometer";
import {buttonsModuleDefinition} from "../../modules/buttons";
import {useGeneratorName} from "../../modules/module_utils";
import {magnetometerModuleDefinition} from "../../modules/magnetometer";
import {temperatureModuleDefinition} from "../../modules/temperature";

export class QuickPiBoard extends AbstractBoard {
  getBoardDefinitions() {
    return [
      {
        name: "grovepi",
        image: "grovepihat.png",
        adc: "grovepi",
        portTypes: {
          "D": [5, 16, 18, 22, 24, 26],
          "A": [0, 2, 4, 6],
          "i2c": ["i2c"],
        },
        default: [
          { type: "screen", suggestedName: this.strings.messages.sensorNameScreen + "1", port: "i2c", subType: "16x2lcd" },
          { type: "led", suggestedName: this.strings.messages.sensorNameLed + "1", port: 'D5', subType: "blue" },
          { type: "servo", suggestedName: this.strings.messages.sensorNameServo + "1", port: "D16" },
          { type: "range", suggestedName: this.strings.messages.sensorNameDistance + "1", port :"D18", subType: "ultrasonic"},
          { type: "button", suggestedName: this.strings.messages.sensorNameButton + "1", port: "D22" },
          { type: "humidity", suggestedName: this.strings.messages.sensorNameHumidity + "1", port: "D24"},
          { type: "buzzer", suggestedName: this.strings.messages.sensorNameBuzzer + "1", port: "D26", subType: "active"},
          { type: "temperature", suggestedName: this.strings.messages.sensorNameTemperature + "1", port: 'A0', subType: "groveanalog" },
          { type: "potentiometer", suggestedName: this.strings.messages.sensorNamePotentiometer + "1", port :"A4"},
          { type: "light", suggestedName: this.strings.messages.sensorNameLight + "1", port :"A6"},
        ]
      },
      {
        name: "quickpi",
        image: "quickpihat.png",
        adc: "ads1015",
        portTypes: {
          "D": [5, 16, 24],
          "A": [0],
        },
        builtinSensors: [
          { type: "screen", subType: "oled128x32", port: "i2c",  suggestedName: this.strings.messages.sensorNameScreen + "1", },
          { type: "led", subType: "red", port: "D4", suggestedName: this.strings.messages.sensorNameRedLed + "1", },
          { type: "led", subType: "green", port: "D17", suggestedName: this.strings.messages.sensorNameGreenLed + "1", },
          { type: "led", subType: "blue", port: "D27",  suggestedName: this.strings.messages.sensorNameBlueLed + "1", },
          { type: "irtrans", port: "D22",  suggestedName: this.strings.messages.sensorNameIrTrans + "1", },
          { type: "irrecv", port: "D23", suggestedName: this.strings.messages.sensorNameIrRecv + "1", },
          { type: "sound", port: "A1", suggestedName: this.strings.messages.sensorNameMicrophone + "1", },
          { type: "buzzer", subType: "passive", port: "D12", suggestedName: this.strings.messages.sensorNameBuzzer + "1", },
          { type: "accelerometer", subType: "BMI160", port: "i2c", suggestedName: this.strings.messages.sensorNameAccelerometer + "1", },
          { type: "gyroscope", subType: "BMI160", port: "i2c", suggestedName: this.strings.messages.sensorNameGyroscope  + "1", },
          { type: "magnetometer", subType: "LSM303C", port: "i2c", suggestedName: this.strings.messages.sensorNameMagnetometer + "1", },
          { type: "temperature", subType: "BMI160", port: "i2c", suggestedName: this.strings.messages.sensorNameTemperature + "1", },
          { type: "range", subType: "vl53l0x", port: "i2c", suggestedName: this.strings.messages.sensorNameDistance + "1", },
          { type: "button", port: "D26", suggestedName: this.strings.messages.sensorNameButton + "1", },
          { type: "light", port: "A2", suggestedName: this.strings.messages.sensorNameLight + "1", },
          { type: "stick", port: "D7", suggestedName: this.strings.messages.sensorNameStick + "1", },
          { type: "cloud", port: "D5", suggestedName: this.strings.messages.sensorNameCloudStore + "1", },
        ],
      },
      {
        name: "pinohat",
        image: "pinohat.png",
        adc: ["ads1015", "none"],
        portTypes: {
          "D": [5, 16, 24],
          "A": [0],
          "i2c": ["i2c"],
        },
      }
    ];
  }

  getAvailableConnectionMethods(): ConnectionMethod[] {
    return [
      ConnectionMethod.Local,
      ConnectionMethod.Wifi,
      ConnectionMethod.Usb,
      ConnectionMethod.Bluetooth,
    ]
  }

  getConnection() {
    return getQuickPiConnection;
  }

  getCustomBlocks(context, strings): BoardCustomBlocks {
    const quickpiModule = quickpiModuleDefinition(context, strings);

    return mergeModuleDefinitions({
      quickpi: [
        quickpiModule,
      ]
    });
  }

  getCustomFeatures(context, strings): ModuleDefinition {
    const accelerometerModule = accelerometerModuleDefinition(context, strings);
    const buttonsModule = buttonsModuleDefinition(context, strings);
    const magnetometerModule = magnetometerModuleDefinition(context, strings);
    const temperatureModule = temperatureModuleDefinition(context);

    const features: ModuleDefinition = {
      ...accelerometerModule,
      ...buttonsModule,
      ...magnetometerModule,
      ...temperatureModule,
    };

    for (let feature in features) {
      delete features[feature].classMethods;
    }

    return useGeneratorName(features, 'quickpi');
  }
}

export const quickPiBoard = new QuickPiBoard();
