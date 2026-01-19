import {AbstractBoard} from "../abstract_board";
import {BoardCustomBlocks, BoardDefinition, ConnectionMethod, QuickalgoLibraryBlock} from "../../definitions";
import {thingzAccelerometerModuleDefinition} from "../../modules/thingz/accelerometer";
import {thingzButtonsModuleDefinition} from "../../modules/thingz/buttons";
import {thingzTemperatureModuleDefinition} from "../../modules/thingz/temperature";
import {timeSleepModuleDefinition} from "../../modules/time/sleep";
// @ts-ignore
import microbitSvg from '../../../images/microbit.svg';
import {MicrobitConnection} from "./microbit_connexion";
import {displayModuleDefinition} from "../../modules/microbit/display";
import {thingzCompassModuleDefinition} from "../../modules/thingz/compass";
import {microphoneModuleDefinition} from "../../modules/microbit/microphone";
import {mergeModuleDefinitions} from "../board_util";
import {musicModuleDefinition} from "../../modules/microbit/music";
import {convertToHex} from "./microbit_hex";
import {accelerometerModuleDefinition} from "../../modules/accelerometer";
import {ModuleDefinition} from "../../modules/module_definition";
import {buttonsModuleDefinition} from "../../modules/buttons";
import {useGeneratorName} from "../../modules/module_utils";
import {magnetometerModuleDefinition} from "../../modules/magnetometer";
import {temperatureModuleDefinition} from "../../modules/temperature";
import {timeModuleDefinition} from "../../modules/time";
import {buzzerModuleDefinition} from "../../modules/buzzer";
import {soundModuleDefinition} from "../../modules/sound";
import {ledMatrixModuleDefinition} from "../../modules/led_matrix";

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
  microbitDownloadHex = null;
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

    $(selector)
      .html(`${svgData}<div style="display: flex; align-items: center; margin-left: -30px; margin-right: 20px;"><button class="download_hex">.hex</button></div>`)
      .css('user-select', 'none')
      .css('display', 'flex')
    ;
    this.microbitSvg = $(selector + ' svg');
    this.microbitDownloadHex = $(selector + ' .download_hex');

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

    this.bindPinLogo('pin_logo');

    this.microbitDownloadHex.on('click', async (e) => {
      window.task.getAnswer(async function (answer) {
        const pythonCode = JSON.parse(answer).easy.document.lines.join("\n");

        const hexFile = await convertToHex(pythonCode);

        const a = window.document.createElement('a');
        const blob = new Blob([hexFile], { type: 'application/octet-stream' });
        a.href = window.URL.createObjectURL(blob);
        a.download = 'microbit-' + Date.now() + '.hex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    });
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

  bindPinLogo(buttonName: string) {
    let that = this;
    let button = this.microbitSvg.find('#pad-logo');
    let buttonActive = this.microbitSvg.find('#pad-logo-active');
    let buttonInactive = this.microbitSvg.find('#pad-logo-inactive');
    buttonActive.css('display', 'none');

    let buttonDown = function (isSet) {
      buttonActive.css('display', 'block');
      buttonInactive.css('display', 'none');
      if (isSet !== true && !that.innerState[buttonName]) {
        that.onUserEvent(buttonName, true);
      }
      that.innerState[buttonName] = true;
    };
    let buttonUp = function (isSet) {
      buttonActive.css('display', 'none');
      buttonInactive.css('display', 'block');
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

    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 5; x++) {
        var led = this.microbitSvg.find('#ledmatrix-' + x + '-' + y);
        led.attr('opacity', (state && state[y] ? state[y][x] : 0) / 10);
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
    } else if (sensor.name.substring(0, 7) == 'button_' || sensor.name.substring(0, 6) == 'touch_' || sensor.name.substring(0, 4) == 'pin_') {
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
          {type: "button", suggestedName: 'pin_logo'},
          { type: "temperature", suggestedName: this.strings.messages.sensorNameTemperature },
          { type: "light", suggestedName: this.strings.messages.sensorNameLight },
          { type: "accelerometer", suggestedName: this.strings.messages.sensorNameAccelerometer },
          { type: "magnetometer", suggestedName: this.strings.messages.sensorNameMagnetometer },
          { type: "ledmatrix", suggestedName: this.strings.messages.sensorNameLedMatrix },
          { type: "sound", suggestedName: 'sound', unit: ''},
          { type: "buzzer", suggestedName: this.strings.messages.sensorNameBuzzer },
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
    const compassModule = thingzCompassModuleDefinition(context, strings);
    const buttonModule = thingzButtonsModuleDefinition(context, strings);
    const temperatureModule = thingzTemperatureModuleDefinition(context, strings);
    const timeModule = timeSleepModuleDefinition(context, strings);
    const displayModule = displayModuleDefinition(context, strings);
    const microphoneModule = microphoneModuleDefinition(context, strings);
    const musicModule = musicModuleDefinition(context, strings);

    return mergeModuleDefinitions({
      microbit: [
        accelerometerModule,
        compassModule,
        buttonModule,
        temperatureModule,
        displayModule,
        microphoneModule,
      ],
      music: [
        musicModule,
      ],
      time: [
        timeModule,
      ],
    });
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
          const method = 'pin_logo' === button ? 'is_touched' : 'is_pressed';

          return [`${button}.${method}()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const buzzerModule = buzzerModuleDefinition(context, strings);

    const ledMatrixModule = ledMatrixModuleDefinition(context, strings);
    ledMatrixModule.ledMatrixShow.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: () => {
          return [`display.show(TODO)`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });
    ledMatrixModule.ledMatrixClear.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: () => {
          return [`display.clear()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });
    ledMatrixModule.ledMatrixGetPixel.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const x = block.getFieldValue('PARAM_0');
          const y = block.getFieldValue('PARAM_1');

          return [`display.get_pixel(${x}, ${y})`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });
   ledMatrixModule.ledMatrixSetPixel.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const x = block.getFieldValue('PARAM_0');
          const y = block.getFieldValue('PARAM_1');
          const intensity = block.getFieldValue('PARAM_2');

          return [`display.set_pixel(${x}, ${y}, ${intensity})`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const magnetometerModule = magnetometerModuleDefinition(context, strings);
    magnetometerModule.readMagneticForce.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: (block) => {
          const axis = block.getFieldValue('PARAM_0');

          return [`compass.get_${axis}()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const soundModule = soundModuleDefinition(context);
    soundModule.soundLevel.blocks.forEach((block: QuickalgoLibraryBlock) => {
      block.codeGenerators = {
        Python: () => {
          return [`microphone.sound_level()`, window.Blockly.Python.ORDER_NONE];
        },
      };
    });

    const temperatureModule = temperatureModuleDefinition(context);

    const timeModule = timeModuleDefinition(context);
    timeModule.sleep = timeModule.sleep_sec;

    const features: ModuleDefinition = {
      ...useGeneratorName(accelerometerModule, 'microbit'),
      ...useGeneratorName(buttonsModule, 'microbit'),
      ...useGeneratorName(buzzerModule, 'music'),
      ...useGeneratorName(ledMatrixModule, 'microbit'),
      ...useGeneratorName(magnetometerModule, 'microbit'),
      ...useGeneratorName(soundModule, 'microbit'),
      ...useGeneratorName(temperatureModule, 'microbit'),
      ...useGeneratorName(timeModule, 'time'),
    };

    for (let feature of Object.values(features)) {
      if (feature.classMethods) {
        for (let block of feature.blocks) {
          block.hidden = true;
        }
      }
    }

    return features;
  }
}

export const microbitBoard = new MicrobitBoard();
