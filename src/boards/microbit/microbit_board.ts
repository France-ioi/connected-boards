import {AbstractBoard} from "../abstract_board";
import {BoardCustomBlocks, BoardDefinition, ConnectionMethod} from "../../definitions";
import {thingzAccelerometerModuleDefinition} from "../../modules/thingz/accelerometer";
import {thingzButtonsModuleDefinition} from "../../modules/thingz/buttons";
import {deepMerge} from "../../util";
import {thingzTemperatureModuleDefinition} from "../../modules/thingz/temperature";
import {timeSleepModuleDefinition} from "../../modules/time/sleep";
// @ts-ignore
import microbitSvg from '../../../images/microbit.svg';
import {MicrobitConnection} from "./microbit_connexion";
import {displayModuleDefinition} from "../../modules/microbit/display";

interface MicrobitBoardInnerState {
  connected?: boolean,
  ledmatrix?: number[][],
}

let microbitSvgInline = null;
let microbitConnection = null;

export class MicrobitBoard extends AbstractBoard {
  buttonStatesUpdators = {};
  public defaultSubBoard: string = 'microbit';
  microbitSvg = null;
  initialized = false;
  innerState: MicrobitBoardInnerState = {};
  onUserEvent: (sensorName: string, state: unknown) => void;

  init(selector, onUserEvent) {
    this.onUserEvent = onUserEvent;
    this.importMicrobit(selector);

    return this.updateState.bind(this);
  }

  async fetchMicrobitCard() {
    // Cache results
    if (!microbitSvgInline) {
      microbitSvgInline = decodeURIComponent(microbitSvg.substring(microbitSvg.indexOf(',') + 1));
    }

    return microbitSvgInline;
  }

  async importMicrobit(selector) {
    const svgData = await this.fetchMicrobitCard();

    $(selector).html(svgData).css('user-select', 'none');
    this.microbitSvg = $(selector + ' svg');

    this.initInteraction();
    this.displayInnerState();
    this.initialized = true;
  }

  initInteraction() {
    this.microbitSvg.attr('width', "100%");
    this.microbitSvg.attr('height', "100%");

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
    let buttons = this.microbitSvg.find('#button-' + buttonId + '-top, #button-' + buttonId + '-bot');
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
    let button = this.microbitSvg.find('#pad-' + buttonId);

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

  setLedMatrix(state) {
    if (!this.initialized) {
      return;
    }
    console.log('set led matrix', state);
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 5; x++) {
        var led = this.microbitSvg.find('#ledmatrix-' + x + '-' + y);
        led.attr('opacity', state[y][x] / 10);
      }
    }
  }

  setConnected(isConnected) {
    if (!this.initialized) {
      return;
    }
    let cable = this.microbitSvg.find('#cable');
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
    } else if(sensor.type === 'ledmatrix') {
      this.innerState.ledmatrix = sensor.state;
      this.setLedMatrix(sensor.state ?? [...new Array(5)].fill([...new Array(5)].fill(0)));
    }
  }

  displayInnerState() {
    // The display might be reset so we need to keep it up to date
    for (let id in this.buttonStatesUpdators) {
      this.buttonStatesUpdators[id][this.innerState[id] ? 'down' : 'up'](true);
    }
    this.setLedMatrix(this.innerState.ledmatrix);
    this.setConnected(this.innerState.connected);
  }

  getBoardDefinitions(): BoardDefinition[] {
    return [
      {
        name: "microbit",
        image: "quickpihat.png",
        portTypes: {
          "D": [0, 1, 2, 6, 7, 8, 12, 13, 14, 15, 16, 19, 20],
          "A": [0, 1, 2, 6, 7, 8, 12, 13, 14, 15, 16, 19, 20],
          "i2c": ["i2c"],
        },
        builtinSensors: [
          {type: "button", suggestedName: 'button_a'},
          {type: "button", suggestedName: 'button_b'},
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
    if (!microbitConnection) {
      microbitConnection = function (userName, _onConnect, _onDisconnect, _onChangeBoard) {
        return new MicrobitConnection(userName, _onConnect, _onDisconnect, _onChangeBoard);
      }
    }

    return microbitConnection;
  }

  getCustomBlocks(context, strings): BoardCustomBlocks {
    const accelerometerModule = thingzAccelerometerModuleDefinition(context, strings);
    const buttonModule = thingzButtonsModuleDefinition(context, strings);
    const temperatureModule = thingzTemperatureModuleDefinition(context, strings);
    const timeModule = timeSleepModuleDefinition(context, strings);
    const displayModule = displayModuleDefinition(context, strings);

    return {
      customClasses: {
        microbit: deepMerge(
          accelerometerModule.classDefinitions,
          buttonModule.classDefinitions,
          displayModule.classDefinitions,
        ),
      },
      customClassInstances: {
        microbit: deepMerge(
          accelerometerModule.classInstances,
          buttonModule.classInstances,
          displayModule.classInstances,
        ),
      },
      customClassImplementations: {
        microbit: deepMerge(
          accelerometerModule.classImplementations,
          buttonModule.classImplementations,
          displayModule.classImplementations,
        ),
      },
      customBlockImplementations: {
        microbit: temperatureModule.blockImplementations,
        time: timeModule.blockImplementations,
      },
      customBlocks: {
        microbit: temperatureModule.blockDefinitions,
        time: timeModule.blockDefinitions,
      },
    };
  }
}

export const microbitBoard = new MicrobitBoard();
