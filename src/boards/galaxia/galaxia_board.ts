import {AbstractBoard, BoardCustomBlocks} from "../abstract_board";
import {BoardDefinition, ConnectionMethod} from "../../definitions";
import {getGalaxiaConnection} from "./galaxia_connexion";
import {thingzAccelerometerModuleDefinition} from "../../modules/thingz/accelerometer";
import {thingzButtonsModuleDefinition} from "../../modules/thingz/buttons";
import {deepMerge} from "../../util";
import {thingzTemperatureModuleDefinition} from "../../modules/thingz/temperature";
import {thingzLedModuleDefinition} from "../../modules/thingz/led";
import {machinePinModuleDefinition} from "../../modules/machine/pin";
import {machinePwmModuleDefinition} from "../../modules/machine/pwm";
import {utimeSleepModuleDefinition} from "../../modules/utime/sleep";
// @ts-ignore
import galaxiaSvg from '../../../images/galaxia.svg';

interface GalaxiaBoardInnerState {
  connected?: boolean,
  led?: [number, number, number]|null,
}

let galaxiaSvgInline = null;

export class GalaxiaBoard extends AbstractBoard {
  buttonStatesUpdators = {};
  galaxiaSvg = null;
  initialized = false;
  innerState: GalaxiaBoardInnerState = {};
  onUserEvent: (sensorName: string, state: unknown) => void;

  init(selector, onUserEvent) {
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
      a: 'btnA',
      b: 'btnB',
      sys: 'btnSys',
    };
    
    for (let [buttonId, buttonName] of Object.entries(buttonIds)) {
      this.bindPushButton(buttonId, buttonName);
    }

    let padIds = {
      up: 'btnN',
      down: 'btnS',
      left: 'btnW',
      right: 'btnE',
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

    console.log({color});
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
    } else if (sensor.name.substring(0, 3) == 'btn') {
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

  // TODO: make something corresponding more to the Galaxia
  getBoardDefinitions(): BoardDefinition[] {
    return [
      {
        name: "quickpi",
        friendlyName: this.strings.messages.quickpihat,
        image: "quickpihat.png",
        adc: "ads1015",
        portTypes: {
          "D": [5, 16, 24],
          "A": [0],
        },
        builtinSensors: [
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "A"},
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "B"},
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "N"},
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "S"},
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "W"},
          {type: "button", suggestedName: this.strings.messages.sensorNameButton + "E"},
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
    return getGalaxiaConnection;
  }

  getCustomBlocks(context, strings): BoardCustomBlocks {
    const accelerometerModule = thingzAccelerometerModuleDefinition(context, strings);
    const buttonModule = thingzButtonsModuleDefinition(context, strings);
    const temperatureModule = thingzTemperatureModuleDefinition(context, strings);
    const ledModule = thingzLedModuleDefinition(context, strings);
    const pinModule = machinePinModuleDefinition(context, strings);
    const pwmModule = machinePwmModuleDefinition(context, strings);
    const utimeModule = utimeSleepModuleDefinition(context, strings);

    return {
      customClasses: {
        thingz: deepMerge(
          accelerometerModule.classDefinitions,
          buttonModule.classDefinitions,
          ledModule.classDefinitions,
        ),
        machine: deepMerge(
          pinModule.classDefinitions,
          pwmModule.classDefinitions,
        ),
      },
      customClassInstances: {
        thingz: deepMerge(
          accelerometerModule.classInstances,
          buttonModule.classInstances,
          ledModule.classInstances,
        ),
      },
      customClassImplementations: {
        thingz: deepMerge(
          accelerometerModule.classImplementations,
          buttonModule.classImplementations,
          ledModule.classImplementations,
        ),
        machine: deepMerge(
          pinModule.classImplementations,
          pwmModule.classImplementations,
        ),
      },
      customBlockImplementations: {
        thingz: temperatureModule.blockImplementations,
        utime: utimeModule.blockImplementations,
      },
      customBlocks: {
        thingz: temperatureModule.blockDefinitions,
        utime: utimeModule.blockDefinitions,
      },
    };
  }
}

export const galaxiaBoard = new GalaxiaBoard();
