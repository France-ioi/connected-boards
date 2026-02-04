import {AbstractBoard} from "../abstract_board";
import {BoardDefinition, ConnectionMethod, QuickalgoLibraryBlock} from "../../definitions";
// @ts-ignore
import galaxiaSvg from '../../../images/galaxia.svg';
import {GalaxiaConnection} from "./galaxia_connexion";
import {ModuleDefinition} from "../../modules/module_definition";
import {accelerometerModuleDefinition} from "../../modules/accelerometer";
import {buttonsModuleDefinition} from "../../modules/buttons";
import {useGeneratorName} from "../../modules/module_utils";
import {magnetometerModuleDefinition} from "../../modules/magnetometer";
import {temperatureModuleDefinition} from "../../modules/temperature";
import {timeModuleDefinition} from "../../modules/time";
import {lightModuleDefinition} from "../../modules/light";
import {jsonModuleDefinition} from "../../modules/json";
import {pinModuleDefinition} from "../../modules/pin";
import {pulseModuleDefinition} from "../../modules/pulse";
import {pwmModuleDefinition} from "../../modules/pwm";
import {requestsModuleDefinition} from "../../modules/requests";
import {wlanModuleDefinition} from "../../modules/wlan";
import {ledRgbModuleDefinition} from "../../modules/led_rgb";

interface GalaxiaBoardInnerState {
  connected?: boolean,
  led?: [number, number, number]|null,
}

let galaxiaSvgInline = null;
let galaxiaConnection = null;

export class GalaxiaBoard extends AbstractBoard {
  buttonStatesUpdators = {};
  public defaultSubBoard: string = 'galaxia';
  galaxiaSvg = null;
  initialized = false;
  innerState: GalaxiaBoardInnerState = {};
  onUserEvent: (sensorName: string, state: unknown) => void;

  init(selector, context, onUserEvent) {
    this.onUserEvent = onUserEvent;
    this.importGalaxia(selector);

    return this.updateState.bind(this);
  }

  async fetchGalaxiaCard() {
    // Cache results
    if (!galaxiaSvgInline) {
      galaxiaSvgInline = decodeURIComponent(galaxiaSvg.substring(galaxiaSvg.indexOf(',') + 1));
    }

    return galaxiaSvgInline;
  }

  async importGalaxia(selector) {
    const svgData = await this.fetchGalaxiaCard();

    $(selector).html(svgData).css('user-select', 'none');
    this.galaxiaSvg = $(selector + ' svg');

    this.initInteraction();
    this.displayInnerState();
    this.initialized = true;
  }

  initInteraction() {
    this.galaxiaSvg.attr('width', "100%");
    this.galaxiaSvg.attr('height', "100%");

    let buttonIds = {
      a: 'button_a',
      b: 'button_b',
      sys: 'button_sys',
    };
    
    for (let [buttonId, buttonName] of Object.entries(buttonIds)) {
      this.bindPushButton(buttonId, buttonName);
    }

    let padIds = {
      up: 'touch_n',
      down: 'touch_s',
      left: 'touch_w',
      right: 'touch_e',
    }
    for (let [padId, padName] of Object.entries(padIds)) {
      this.bindPadButton(padId, padName);
    }
  }

  bindPushButton(buttonId: string, buttonName: string) {
    let that = this;
    let buttons = this.galaxiaSvg.find('#button-' + buttonId + '-top, #button-' + buttonId + '-bot');
    let buttonTop = buttons.filter('#button-' + buttonId + '-top');
    let buttonBot = buttons.filter('#button-' + buttonId + '-bot');
    let colorTop = buttons.filter('#button-' + buttonId + '-top').css('fill');
    let colorBot = buttons.filter('#button-' + buttonId + '-bot').css('fill');
    let buttonDown = function (isSet) {
      buttonTop.css('fill', 'transparent');
      buttonBot.css('fill', colorTop);
      if (isSet !== true && !that.innerState[buttonName]) {
        that.onUserEvent(buttonName, true);
      }
      that.innerState[buttonName] = true;
    }
    let buttonUp = function (isSet) {
      buttonTop.css('fill', colorTop);
      buttonBot.css('fill', colorBot);
      if (isSet !== true && that.innerState[buttonName]) {
        that.onUserEvent(buttonName, false);
      }
      that.innerState[buttonName] = false;
    }
    buttons.mousedown(buttonDown);
    buttons.mouseup(buttonUp);
    buttons.mouseleave(buttonUp);

    this.buttonStatesUpdators[buttonName] = {'down': buttonDown, 'up': buttonUp};
  }

  bindPadButton(buttonId: string, buttonName: string) {
    let that = this;
    let button = this.galaxiaSvg.find('#pad-' + buttonId);

    let buttonDown = function (isSet) {
      button.css('fill-opacity', '1');
      if (isSet !== true && !that.innerState[buttonName]) {
        that.onUserEvent(buttonName, true);
      }
      that.innerState[buttonName] = true;
    };
    let buttonUp = function (isSet) {
      button.css('fill-opacity', '0');
      if (isSet !== true && that.innerState[buttonName]) {
        that.onUserEvent(buttonName, false);
      }
      that.innerState[buttonName] = false;
    };
    button.mousedown(buttonDown);
    button.mouseup(buttonUp);
    button.mouseleave(buttonUp);
    this.buttonStatesUpdators[buttonName] = {'down': buttonDown, 'up': buttonUp};
  }

  setLed(color) {
    if (!this.initialized || !color) {
      return;
    }

    let led = this.galaxiaSvg.find('#led');
    led.css('fill', Array.isArray(color) ? `rgb(${color.join(',')})` : '#d3d3d3');
  }

  setConnected(isConnected) {
    if (!this.initialized) {
      return;
    }
    let cable = this.galaxiaSvg.find('#cable');
    cable.toggle(isConnected);
  }

  updateState(sensor) {
    if (sensor === 'connected') {
      this.innerState.connected = true;
      this.setConnected(true);
    } else if (sensor === 'disconnected') {
      this.innerState.connected = false;
      this.setConnected(false);
    } else if (sensor.name.substring(0, 7) == 'button_' || sensor.name.substring(0, 6) == 'touch_') {
      this.innerState[sensor.name] = sensor.state;
      if (!this.initialized) {
        return;
      }
      this.buttonStatesUpdators[sensor.name][sensor.state ? 'down' : 'up'](true);
    } else if (sensor.type === 'ledrgb') {
      if (sensor.state) {
        this.innerState.led = sensor.state;
      } else {
        this.innerState.led = null;
      }
      this.setLed(this.innerState.led);
    }
  }

  displayInnerState() {
    // The display might be reset so we need to keep it up to date
    for (let id in this.buttonStatesUpdators) {
      this.buttonStatesUpdators[id][this.innerState[id] ? 'down' : 'up'](true);
    }
    this.setLed(this.innerState.led || 'transparent');
    this.setConnected(this.innerState.connected);
  }

  getBoardDefinitions(): BoardDefinition[] {
    return [
      {
        name: "galaxia",
        image: "quickpihat.png",
        portTypes: {
          "D": [0, 1, 2, 6, 7, 8, 12, 13, 14, 15, 16, 19, 20],
          "A": [0, 1, 2, 6, 7, 8, 12, 13, 14, 15, 16, 19, 20],
        },
        builtinSensors: [
          { type: "accelerometer", suggestedName: this.strings.messages.sensorNameAccelerometer },
          { type: "magnetometer", suggestedName: this.strings.messages.sensorNameMagnetometer },
          { type: "buzzer", suggestedName: this.strings.messages.sensorNameBuzzer },
          { type: "temperature", suggestedName: this.strings.messages.sensorNameTemperature },
          { type: "light", suggestedName: this.strings.messages.sensorNameLight },
          { type: "range", suggestedName: this.strings.messages.sensorNameDistance, port: 'D9' },
          { type: "wifi", suggestedName: this.strings.messages.sensorNameWifi },
            // { type: "led", name: 'led', port: 'D5'},
            // { type: "leddim", name: 'leddim', port: 'D8'},
          {type: "ledrgb", suggestedName: this.strings.messages.sensorNameLed },
          {type: "button", suggestedName: 'button_a'},
          {type: "button", suggestedName: 'button_b'},
          {type: "button", suggestedName: 'touch_n'},
          {type: "button", suggestedName: 'touch_s'},
          {type: "button", suggestedName: 'touch_e'},
          {type: "button", suggestedName: 'touch_w'},
        ],
      },
    ];
  }

  getAvailableConnectionMethods(): ConnectionMethod[] {
    return [
      ConnectionMethod.WebSerial,
    ];
  }

  getConnection() {
    if (!galaxiaConnection) {
      galaxiaConnection = function (userName, _onConnect, _onDisconnect, _onChangeBoard) {
        return new GalaxiaConnection(userName, _onConnect, _onDisconnect, _onChangeBoard);
      }
    }

    return galaxiaConnection;
  }

  getCustomFeatures(context, strings): ModuleDefinition {
    const accelerometerModule = accelerometerModuleDefinition(context, strings);
    accelerometerModule.readAcceleration.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const axis = block.getFieldValue('PARAM_0');

          return [`accelerometer.get_${axis}()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const buttonsModule = buttonsModuleDefinition(context, strings);
    buttonsModule.isButtonPressedWithName.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const button = block.getFieldValue('PARAM_0');
          const method = 'touch' === button.substring(0, 5) ? 'is_touched' : 'is_pressed';

          return [`${button}.${method}()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const jsonModule = jsonModuleDefinition(context);

    const ledRgbModule = ledRgbModuleDefinition(context);

    const lightModule: any = lightModuleDefinition(context);
    lightModule.lightIntensity.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: () => {
          return [`display.read_light_level()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });
    lightModule.lightIntensity.classMethods.Led = lightModule.lightIntensity.classMethods.Display;
    lightModule.lightIntensity.classMethods.Led.instances = ['led'];
    delete lightModule.lightIntensity.classMethods.Display;

    const magnetometerModule = magnetometerModuleDefinition(context, strings);
    magnetometerModule.readMagneticForce.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const axis = block.getFieldValue('PARAM_0');

          return [`compass.get_${axis}()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const pinModule = pinModuleDefinition(context);
    const pulseModule = pulseModuleDefinition(context);
    const pwmModule = pwmModuleDefinition(context);

    const requestsModule = requestsModuleDefinition(context, strings);

    const temperatureModule = temperatureModuleDefinition(context);

    const timeModule = timeModuleDefinition(context);
    timeModule.sleep = timeModule.sleep_sec;

    const wlanModule = wlanModuleDefinition(context, strings);

    const features: ModuleDefinition = {
      ...useGeneratorName(accelerometerModule, 'thingz'),
      ...useGeneratorName(buttonsModule, 'thingz'),
      ...useGeneratorName(jsonModule, 'json'),
      ...useGeneratorName(ledRgbModule, 'thingz'),
      ...useGeneratorName(lightModule, 'thingz'),
      ...useGeneratorName(magnetometerModule, 'thingz'),
      ...useGeneratorName(pinModule, 'machine'),
      ...useGeneratorName(pulseModule, 'machine'),
      ...useGeneratorName(pwmModule, 'machine'),
      ...useGeneratorName(requestsModule, 'requests'),
      ...useGeneratorName(temperatureModule, 'thingz'),
      ...useGeneratorName(timeModule, 'time'),
      ...useGeneratorName(wlanModule, 'network'),
    };

    for (let feature of Object.values(features)) {
      if (feature.classMethods) {
        for (let block of feature.blocks ?? []) {
          block.hidden = true;
        }
      }
    }

    return features;
  }
}

export const galaxiaBoard = new GalaxiaBoard();
