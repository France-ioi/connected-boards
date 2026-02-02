import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {displayAlphabet} from "./microbit/display_alphabet";
import {SensorLedMatrix} from "../sensors/led_matrix";
import {AbstractSensor} from "../sensors/abstract_sensor";

function convertImageFromString(str: string) {
  return str.split(':').map(e => e.split('').map(Number)).slice(0, 5);
}

const availableImages = [
  {name: "HEART", value: "09090:99999:99999:09990:00900:"},
  {name: "HEART_SMALL", value: "00000:09090:09990:00900:00000:"},
  {name: "HAPPY", value: "00000:09090:00000:90009:09990:"},
  // {name: "SMILE", value: "00000:00000:00000:90009:09990:"},
  {name: "SAD", value: "00000:09090:00000:09990:90009:"},
  // {name: "CONFUSED", value: "00000:09090:00000:09090:90909:"},
  // {name: "ANGRY", value: "90009:09090:00000:99999:90909:"},
  // {name: "ASLEEP", value: "00000:99099:00000:09990:00000:"},
  // {name: "SURPRISED", value: "09090:00000:00900:09090:00900:"},
  // {name: "SILLY", value: "90009:00000:99999:00909:00999:"},
  // {name: "FABULOUS", value: "99999:99099:00000:09090:09990:"},
  // {name: "MEH", value: "09090:00000:00090:00900:09000:"},
  {name: "YES", value: "00000:00009:00090:90900:09000:"},
  {name: "NO", value: "90009:09090:00900:09090:90009:"},

  {name: "CLOCK12", value: "00900:00900:00900:00000:00000:"},
  // {name: "CLOCK1", value: "00090:00090:00900:00000:00000:"},
  // {name: "CLOCK2", value: "00000:00099:00900:00000:00000:"},
  {name: "CLOCK3", value: "00000:00000:00999:00000:00000:"},
  // {name: "CLOCK4", value: "00000:00000:00900:00099:00000:"},
  // {name: "CLOCK5", value: "00000:00000:00900:00090:00090:"},
  {name: "CLOCK6", value: "00000:00000:00900:00900:00900:"},
  // {name: "CLOCK7", value: "00000:00000:00900:09000:09000:"},
  // {name: "CLOCK8", value: "00000:00000:00900:99000:00000:"},
  {name: "CLOCK9", value: "00000:00000:99900:00000:00000:"},
  // {name: "CLOCK10", value: "00000:99000:00900:00000:00000:"},
  // {name: "CLOCK11", value: "09000:09000:00900:00000:00000:"},

  {name: "ARROW_N", value: "00900:09990:90909:00900:00900:"},
  {name: "ARROW_NE", value: "00999:00099:00909:09000:90000:"},
  {name: "ARROW_E", value: "00900:00090:99999:00090:00900:"},
  {name: "ARROW_SE", value: "90000:09000:00909:00099:00999:"},
  {name: "ARROW_S", value: "00900:00900:90909:09990:00900:"},
  {name: "ARROW_SW", value: "00009:00090:90900:99000:99900:"},
  {name: "ARROW_W", value: "00900:09000:99999:09000:00900:"},
  {name: "ARROW_NW", value: "99900:99000:90900:00090:00009:"},

  {name: "TRIANGLE", value: "00000:00900:09090:99999:00000:"},
  {name: "TRIANGLE_LEFT", value: "90000:99000:90900:90090:99999:"},

  // {name: "CHESSBOARD", value: "09090:90909:09090:90909:09090:"},
  {name: "DIAMOND", value: "00900:09090:90009:09090:00900:"},
  {name: "DIAMOND_SMALL", value: "00000:00900:09090:00900:00000:"},

  {name: "SQUARE", value: "99999:90009:90009:90009:99999:"},
  {name: "SQUARE_SMALL", value: "00000:09990:09090:09990:00000:"},

  // {name: "RABBIT", value: "90900:90900:99990:99090:99990:"},
  // {name: "COW", value: "90009:90009:99999:09990:00900:"},

  {name: "MUSIC_CROTCHET", value: "00900:00900:00900:99900:99900:"},
  {name: "MUSIC_QUAVER", value: "00900:00990:00909:99900:99900:"},
  {name: "MUSIC_QUAVERS", value: "09999:09009:09009:99099:99099:"},

  // {name: "PITCHFORK", value: "90909:90909:99999:00900:00900:"},
  // {name: "XMAS", value: "00900:09990:00900:09990:99999:"},
  // {name: "PACMAN", value: "09999:99090:99900:99990:09999:"},

  {name: "TARGET", value: "00900:09990:99099:09990:00900:"},

  // {name: "TSHIRT", value: "99099:99999:09990:09990:09990:"},
  // {name: "ROLLERSKATE", value: "00099:00099:99999:99999:09090:"},
  // {name: "DUCK", value: "09900:99900:09999:09990:00000:"},

  {name: "HOUSE", value: "00900:09990:99999:09990:09090:"},

  // {name: "TORTOISE", value: "00000:09990:99999:09090:00000:"},
  // {name: "BUTTERFLY", value: "99099:99999:00900:99999:99099:"},
  // {name: "STICKFIGURE", value: "00900:99999:00900:09090:90009:"},
  // {name: "GHOST", value: "99999:90909:99999:99999:90909:"},
  // {name: "SWORD", value: "00900:00900:00900:09990:00900:"},
  // {name: "GIRAFFE", value: "99000:09000:09000:09990:09090:"},
  // {name: "SKULL", value: "09990:90909:99999:09990:09990:"},
  // {name: "UMBRELLA", value: "09990:99999:00900:90900:09900:"},
  // {name: "SNAKE", value: "99000:99099:09090:09990:00000:"},

  {name: "SCISSORS", value: "99009:99090:00900:99090:99009:"},
];


const DISPLAY_INTERVAL = 625;

export function ledMatrixModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const displayLedStates = async (sensor: SensorLedMatrix, states: string[], command: string, callback) => {
    const live = !(!context.display || context.autoGrading || context.offLineMode);

    if (live) {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }

    for (let state of states) {
      context.registerQuickPiEvent(sensor.name, state);
      await new Promise(resolve => setTimeout(resolve, DISPLAY_INTERVAL));
    }

    if (!live) {
      context.waitDelay(callback);
    }
  };

  const displayShow = (image, callback) => {
    const sensor = context.sensorHandler.findSensorByType<SensorLedMatrix>('ledmatrix');
    if (!sensor) {
      throw `There is no LED matrix.`;
    }

    let command;
    let statesToDisplay;
    if (image.image) {
      command = `ledMatrixShowImage("${sensor.name}", Image("${image.image}"))`;
      statesToDisplay = [convertImageFromString(image.image)];
    } else if (String(image).match(/[0-9]{5}:[0-9]{5}:[0-9]{5}:[0-9]{5}:[0-9]{5}:?/)) {
      command = `ledMatrixShowImage("${sensor.name}", Image("${image}"))`;
      statesToDisplay = [convertImageFromString(image)];
    } else {
      command = `ledMatrixShowImage("${sensor.name}", "${image}")`;
      statesToDisplay = [];
      for (let char of String(image).split('')) {
        if (char in displayAlphabet) {
          statesToDisplay.push(displayAlphabet[char]);
        } else {
          statesToDisplay.push(displayAlphabet['?']);
        }
      }
    }

    return displayLedStates(sensor, statesToDisplay, command, callback);
  };

  const displayClear = (callback) => {
    const sensor = context.sensorHandler.findSensorByType<SensorLedMatrix>('ledmatrix');
    if (!sensor) {
      throw `There is no LED matrix.`;
    }

    const newState = [...new Array(5)].fill([...new Array(5)].fill(0));
    context.registerQuickPiEvent(sensor.name, newState);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      const cb = context.runner.waitCallback(callback);
      const command = `ledMatrixClear("${sensor.name}")`;

      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const displayGetPixel = (x: number, y: number, callback) => {
    const sensor = context.sensorHandler.findSensorByType<SensorLedMatrix>('ledmatrix');
    if (!sensor) {
      throw `There is no LED matrix.`;
    }

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(sensor.name);

      context.waitDelay(callback, state[y][x]);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = `ledMatrixGetPixel("${sensor.name}", ${x}, ${y})`;
      context.quickPiConnection.sendCommand(command, function (returnVal) {
        cb(Number(returnVal));
      });
    }
  };

  const displaySetPixel = (x: number, y: number, intensity: number, callback) => {
    const sensor = context.sensorHandler.findSensorByType<SensorLedMatrix>('ledmatrix');
    if (!sensor) {
      throw `There is no LED matrix.`;
    }

    let state = context.getSensorState(sensor.name);
    state[y][x] = intensity;
    context.registerQuickPiEvent(sensor.name, state);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      const cb = context.runner.waitCallback(callback);
      const command = `ledMatrixSetPixel("${sensor.name}", ${x}, ${y}, ${intensity})`;

      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const filteredAvailableImages = context.infos.customLedMatrixImages ?
    context.infos.customLedMatrixImages.map(image => {
      if ('object' === typeof image) {
        if (!image.name || !image.value) {
          throw new Error(`Missing name or value for custom LED matrix image: ${JSON.stringify(image)}`);
        }

        return image;
      }

      const realImage = availableImages.find(otherImage => image === otherImage.name);
      if (!realImage) {
        throw new Error(`No LED matrix image exists for this name: ${image}`);
      }

      return realImage;
    }) : availableImages;

  return {
    ledMatrixShow: {
      category: 'actuator',
      blocks: [
        {
          name: "ledMatrixShowText",
          params: ["String"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "text": "" },
            ]
          },
          blocklyXml: "<block type='ledMatrixShowText'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: displayShow,
        },
        {
          name: "ledMatrixShowImage",
          params: ["String"],
          blocklyJson: {
             "args0": [
              {
                "type": "field_dropdown",
                "name": "PARAM_0",
                "options": filteredAvailableImages.map(({name, value}) => [name, value]),
              },
            ],
          },
          handler: displayShow,
        },
      ],
      classMethods: {
        Display: {
          instances: ['display'],
          methods: {
            show: {
              params: ['String'],
              handler: function (self, image, callback) {
                displayShow(image, callback);
              },
            },
          },
        },
        Image: {
          init: {
            params: ['String'],
            handler: function (self, image, callback) {
              self.image = image;
              callback();
            },
          },
        },
      },
      classConstants: {
        Image: filteredAvailableImages.reduce((cur, next) => {
          cur[next.name] = next.value;

          return cur;
        }, {}),
      },
    },
    ledMatrixClear: {
      category: 'actuator',
      blocks: [
        {
          name: "ledMatrixClear",
          handler: displayClear,
        },
      ],
      classMethods: {
        Display: {
          instances: ['display'],
          methods: {
            clear: {
              handler: function (self, callback) {
                displayClear(callback);
              },
            },
          },
        },
      },
    },
    ledMatrixGetPixel: {
      category: 'actuator',
      blocks: [
        {
          name: "ledMatrixGetPixel",
          params: ["Number", "Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0"},
              { "type": "input_value", "name": "PARAM_1"},
            ]
          },
          yieldsValue: 'int',
          blocklyXml: "<block type='ledMatrixGetPixel'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: displayGetPixel,
        },
      ],
      classMethods: {
        Display: {
          instances: ['display'],
          methods: {
            get_pixel: {
              params: ["Number", "Number"],
              yieldsValue: 'int',
              handler: function (self, x: number, y: number, callback) {
                displayGetPixel(x, y, callback);
              },
            },
          },
        },
      },
    },
    ledMatrixSetPixel: {
      category: 'actuator',
      blocks: [
        {
          name: "ledMatrixSetPixel",
          params: ["Number", "Number", "Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0"},
              { "type": "input_value", "name": "PARAM_1"},
              { "type": "input_value", "name": "PARAM_2"},
            ]
          },
          blocklyXml: "<block type='ledMatrixSetPixel'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: displaySetPixel,
        },
      ],
      classMethods: {
        Display: {
          instances: ['display'],
          methods: {
            set_pixel: {
              params: ["Number", "Number", "Number"],
              handler: function (self, x: number, y: number, intensity: number, callback) {
                displaySetPixel(x, y, intensity, callback);
              },
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}
