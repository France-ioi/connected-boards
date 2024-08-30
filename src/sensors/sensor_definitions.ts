import {quickPiLocalLanguageStrings} from "../lang/language_strings";
import {deepEqual, isPrimitive} from "../util";
import {LocalQuickStore} from "./local_quickpi_store";
import {SensorDefinition} from "../definitions";

export const getSensorDefinitions = function (context, strings): SensorDefinition[] {
  return [
    /******************************** */
    /*             Actuators          */
    /**********************************/
    {
      name: "led",
      suggestedName: strings.messages.sensorNameLed,
      description: strings.messages.led,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return false;
      },
      selectorImages: ["ledon-red.png"],
      valueType: "boolean",
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      setLiveState: function (sensor, state, callback) {
        var ledstate = state ? 1 : 0;
        var command = "setLedState(\"" + sensor.name + "\"," + ledstate + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return state ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase();
      },
      subTypes: [{
        subType: "blue",
        description: strings.messages.blueled,
        selectorImages: ["ledon-blue.png"],
        suggestedName: strings.messages.sensorNameBlueLed,
      },
        {
          subType: "green",
          description: strings.messages.greenled,
          selectorImages: ["ledon-green.png"],
          suggestedName: strings.messages.sensorNameGreenLed,
        },
        {
          subType: "orange",
          description: strings.messages.orangeled,
          selectorImages: ["ledon-orange.png"],
          suggestedName: strings.messages.sensorNameOrangeLed,
        },
        {
          subType: "red",
          description: strings.messages.redled,
          selectorImages: ["ledon-red.png"],
          suggestedName: strings.messages.sensorNameRedLed,
        }
      ],
    },
    {
      name: "ledrgb",
      suggestedName: strings.messages.sensorNameLedRgb,
      description: strings.messages.ledrgb,
      isAnalog: true,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return null;
      },
      selectorImages: ["ledon-red.png"],
      valueType: "object",
      valueMin: 0,
      valueMax: 255,
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state)
          return state / 255;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return percentage * 255;
        else
          return 0;
      },
      setLiveState: function (sensor, state, callback) {
        var command = `setLedRgbState("${sensor.name}", [0, 0, 0])`;

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return `[${state.join(', ')}]`;
      },
    },
    {
      name: "leddim",
      suggestedName: strings.messages.sensorNameLedDim,
      description: strings.messages.ledDim,
      isAnalog: true,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return 0;
      },
      selectorImages: ["ledon-red.png"],
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 1,
      getPercentageFromState: function (state) {
        return state;
      },
      getStateFromPercentage: function (percentage) {
        return percentage;
      },
      getStateFromPwm: function (duty) {
        return duty / 1023;
      },
      setLiveState: function (sensor, state, callback) {
        var ledstate = state ? 1 : 0;
        var command = "setLedState(\"" + sensor.name + "\"," + ledstate + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return Math.round(state * 100) + "%";
      },
    },
    {
      name: "ledmatrix",
      suggestedName: strings.messages.sensorNameLedMatrix,
      description: strings.messages.ledmatrix,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
      },
      selectorImages: ["ledon-red.png"],
      valueType: "boolean",
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state) {
          var total = 0;
          state.forEach(function(substate) {
            substate.forEach(function(v) {
              total += v;
            });
          });
          return total / 25;
        }
        return 0;
      },
      getStateFromPercentage: function (percentage) {
        if(percentage > 0) {
          return [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]];
        }
        return [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
      },
      setLiveState: function (sensor, state, callback) {
        var command = "setLedMatrixState(\"" + sensor.name + "\"," + JSON.stringify(state) + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return '';
      },
    },
    {
      name: "buzzer",
      suggestedName: strings.messages.sensorNameBuzzer,
      description: strings.messages.buzzer,
      isAnalog: false,
      isSensor: false,
      getInitialState: function(sensor) {
        return false;
      },
      portType: "D",
      selectorImages: ["buzzer-ringing.png"],
      valueType: "boolean",
      getPercentageFromState: function (state, sensor) {

        if (sensor.showAsAnalog)
        {
          return (state - sensor.minAnalog) / (sensor.maxAnalog - sensor.minAnalog);
        } else {
          if (state)
            return 1;
          else
            return 0;
        }
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      setLiveState: function (sensor, state, callback) {
        var ledstate = state ? 1 : 0;
        var command = "setBuzzerState(\"" + sensor.name + "\"," + ledstate + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {

        if(typeof state == 'number' &&
          state != 1 &&
          state != 0) {

          return state.toString() + "Hz";
        }
        return state ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase();
      },
      subTypes: [{
        subType: "active",
        description: strings.messages.grovebuzzer,
        pluggable: true,
      },
        {
          subType: "passive",
          description: strings.messages.quickpibuzzer,
        }],
    },
    {
      name: "servo",
      suggestedName: strings.messages.sensorNameServo,
      description: strings.messages.servo,
      isAnalog: true,
      isSensor: false,
      getInitialState: function(sensor) {
        return 0;
      },
      portType: "D",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 180,
      selectorImages: ["servo.png", "servo-pale.png", "servo-center.png"],
      getPercentageFromState: function (state) {
        return state / 180;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 180);
      },
      setLiveState: function (sensor, state, callback) {
        var command = "setServoAngle(\"" + sensor.name + "\"," + state + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return "" + state + "°";
      },
      getStateFromPwm: function (pwmDuty) {
        return 180*(pwmDuty - 0.025*1023) / (0.1 * 1023);
      },
    },
    {
      name: "screen",
      suggestedName: strings.messages.sensorNameScreen,
      description: strings.messages.screen,
      isAnalog: false,
      isSensor: false,
      getInitialState: function(sensor) {
        if (sensor.isDrawingScreen)
          return null;
        else
          return {line1: "", line2: ""};
      },
      cellsAmount: function(paper) {
        // console.log(paper.width)
        if(context.board == 'grovepi') {
          return 2;
        }
        if(paper.width < 250) {
          return 4;
        } else if(paper.width < 350) {
          return 3;
        }

        if (context.compactLayout)
          return 3;
        else
          return 2;
      },
      portType: "i2c",
      valueType: "object",
      selectorImages: ["screen.png"],
      compareState: function (state1, state2) {
        // Both are null are equal
        if (state1 == null && state2 == null)
          return true;

        // If only one is null they are different
        if ((state1 == null && state2) ||
          (state1 && state2 == null))
          return false;

        if (state1.isDrawingData !=
          state2.isDrawingData)
          return false;

        if (state1 && state1.isDrawingData) {
          // They are ImageData objects
          // The image data is RGBA so there are 4 bits per pixel

          var data1 = state1.getData(1).data;
          var data2 = state2.getData(1).data;

          for (var i = 0; i < data1.length; i+=4) {
            if (data1[i]  != data2[i] ||
              data1[i + 1]  != data2[i + 1] ||
              data1[i + 2]  != data2[i + 2] ||
              data1[i + 3]  != data2[i + 3])
              return false;
          }

          return true;
        } else {

          // Otherwise compare the strings
          return (state1.line1 == state2.line1) &&
            ((state1.line2 == state2.line2) ||
              (!state1.line2 && !state2.line2));
        }
      },
      setLiveState: function (sensor, state, callback) {
        var line2 = state.line2;
        if (!line2)
          line2 = "";

        var command = "displayText(\"" + sensor.name + "\"," + state.line1 + "\", \"" + line2 + "\")";

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        if(!state) { return '""'; }

        if (state.isDrawingData)
          return strings.messages.drawing;
        else
          return '"' + state.line1 + (state.line2 ? " / " + state.line2 : "") + '"';
      },
      getWrongStateString: function(failInfo) {
        if(!failInfo.expected ||
          !failInfo.expected.isDrawingData ||
          !failInfo.actual ||
          !failInfo.actual.isDrawingData) {
          return null; // Use default message
        }
        var data1 = failInfo.expected.getData(1).data;
        var data2 = failInfo.actual.getData(1).data;
        var nbDiff = 0;
        for (var i = 0; i < data1.length; i+=4) {
          if(data1[i] != data2[i]) {
            nbDiff += 1;
          }
        }
        return strings.messages.wrongStateDrawing.format(failInfo.name, nbDiff, failInfo.time);
      },
      subTypes: [{
        subType: "16x2lcd",
        description: strings.messages.grove16x2lcd,
        pluggable: true,
      },
        {
          subType: "oled128x32",
          description: strings.messages.oled128x32,
        }],

    },
    {
      name: "irtrans",
      suggestedName: strings.messages.sensorNameIrTrans,
      description: strings.messages.irtrans,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["irtranson.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
      setLiveState: function (sensor, state, callback) {
        var ledstate = state ? 1 : 0;
        var command = "setInfraredState(\"" + sensor.name + "\"," + ledstate + ")";

        context.quickPiConnection.sendCommand(command, callback);
      },
    },
    /******************************** */
    /*             sensors            */
    /**********************************/
    {
      name: "button",
      suggestedName: strings.messages.sensorNameButton,
      description: strings.messages.button,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "boolean",
      pluggable: true,
      selectorImages: ["buttonoff.png"],
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("isButtonPressed(\"" + sensor.name + "\")", function (retVal) {
          var intVal = parseInt(retVal, 10);
          callback(intVal != 0);
        });
      },
    },
    {
      name: "stick",
      suggestedName: strings.messages.sensorNameStick,
      description: strings.messages.fivewaybutton,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "boolean",
      selectorImages: ["stick.png"],
      gpiosNames: ["up", "down", "left", "right", "center"],
      gpios: [10, 9, 11, 8, 7],
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      compareState: function (state1, state2) {
        if (state1 == null && state2 == null)
          return true;

        return state1[0] == state2[0] &&
          state1[1] == state2[1] &&
          state1[2] == state2[2] &&
          state1[3] == state2[3] &&
          state1[4] == state2[4];
      },
      getLiveState: function (sensor, callback) {
        var cmd = "readStick(" + this.gpios.join() + ")";

        context.quickPiConnection.sendCommand("readStick(" + this.gpios.join() + ")", function (retVal) {
          var array = JSON.parse(retVal);
          callback(array);
        });
      },
      getButtonState: function(buttonname, state) {
        if (state) {
          var buttonparts = buttonname.split(".");
          var actualbuttonmame = buttonname;
          if (buttonparts.length == 2) {
            actualbuttonmame = buttonparts[1];
          }

          var index = this.gpiosNames.indexOf(actualbuttonmame);

          if (index >= 0) {
            return state[index];
          }
        }

        return false;
      },
      cellsAmount: function(paper) {
        return 2;
      },
    },
    {
      name: "temperature",
      suggestedName: strings.messages.sensorNameTemperature,
      description: strings.messages.tempsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["temperature-hot.png", "temperature-overlay.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readTemperature(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
      subTypes: [{
        subType: "groveanalog",
        description: strings.messages.groveanalogtempsensor,
        portType: "A",
        pluggable: true,
      },
        {
          subType: "BMI160",
          description: strings.messages.quickpigyrotempsensor,
          portType: "i2c",
        },
        {
          subType: "DHT11",
          description: strings.messages.dht11tempsensor,
          portType: "D",
          pluggable: true,
        }],
    },
    {
      name: "potentiometer",
      suggestedName: strings.messages.sensorNamePotentiometer,
      description: strings.messages.potentiometer,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["potentiometer.png", "potentiometer-pale.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readRotaryAngle(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
    },
    {
      name: "light",
      suggestedName: strings.messages.sensorNameLight,
      description: strings.messages.lightsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["light.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readLightIntensity(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
    },
    {
      name: "range",
      suggestedName: strings.messages.sensorNameDistance,
      description: strings.messages.distancesensor,
      isAnalog: true,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 5000,
      selectorImages: ["range.png"],
      getPercentageFromState: function (state) {
        return state / 500;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 500);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readDistance(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
      subTypes: [{
        subType: "vl53l0x",
        description: strings.messages.timeofflightranger,
        portType: "i2c",
      },
        {
          subType: "ultrasonic",
          description: strings.messages.ultrasonicranger,
          portType: "D",
          pluggable: true,
        }],

    },
    {
      name: "humidity",
      suggestedName: strings.messages.sensorNameHumidity,
      description: strings.messages.humiditysensor,
      isAnalog: true,
      isSensor: true,
      portType: "D",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["humidity.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readHumidity(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
    },
    {
      name: "sound",
      suggestedName: strings.messages.sensorNameMicrophone,
      description: strings.messages.soundsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["sound.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readSoundLevel(\"" + sensor.name + "\")", function(val) {
          val = Math.round(val);
          callback(val);
        });
      },
    },
    {
      name: "accelerometer",
      suggestedName: strings.messages.sensorNameAccelerometer,
      description: strings.messages.accelerometerbmi160,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      step: 0.1,
      selectorImages: ["accel.png"],
      getStateString: function (state) {
        if (state == null)
          return "0m/s²";

        if (Array.isArray(state))
        {
          return "X: " + state[0] + "m/s² Y: " + state[1] + "m/s² Z: " + state[2] + "m/s²";
        }
        else {
          return state.toString() + "m/s²";
        }
      },
      getPercentageFromState: function (state) {
        var perc = ((state + 78.48) / 156.96)
        // console.log(state,perc)
        return perc;
      },
      getStateFromPercentage: function (percentage) {
        var value = ((percentage * 156.96) - 78.48);
        var state = parseFloat(value.toFixed(1));
        // console.log(state)
        return state;
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readAccelBMI160()", function(val) {
          var array = JSON.parse(val);
          callback(array);
        });100
      },
      cellsAmount: function(paper) {
        return 2;
      },
    },
    {
      name: "gyroscope",
      suggestedName: strings.messages.sensorNameGyroscope,
      description: strings.messages.gyrobmi160,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["gyro.png"],
      getPercentageFromState: function (state) {
        return (state + 125) / 250;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 250) - 125;
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readGyroBMI160()", function(val) {

          var array = JSON.parse(val);
          array[0] = Math.round(array[0]);
          array[1] = Math.round(array[1]);
          array[2] = Math.round(array[2]);
          callback(array);
        });
      },
      cellsAmount: function(paper) {
        return 2;
      },
    },
    {
      name: "magnetometer",
      suggestedName: strings.messages.sensorNameMagnetometer,
      description: strings.messages.maglsm303c,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["mag.png"],
      getPercentageFromState: function (state) {
        return (state + 1600) / 3200;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 3200) - 1600;
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("readMagnetometerLSM303C(False)", function(val) {

          var array = JSON.parse(val);

          array[0] = Math.round(array[0]);
          array[1] = Math.round(array[1]);
          array[2] = Math.round(array[2]);

          callback(array);
        });
      },
      cellsAmount: function(paper) {
        return 2;
      },
    },
    {
      name: "irrecv",
      suggestedName: strings.messages.sensorNameIrRecv,
      description: strings.messages.irreceiver,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["irrecvon.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
      getLiveState: function (sensor, callback) {
        context.quickPiConnection.sendCommand("isButtonPressed(\"" + sensor.name + "\")", function (retVal) {
          var intVal = parseInt(retVal, 10);
          callback(intVal == 0);
        });
      },
    },
    {
      name: "wifi",
      suggestedName: strings.messages.sensorNameWifi,
      description: strings.messages.wifi,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return null;
      },
      selectorImages: ["wifi.png"],
      valueType: "object",
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      setLiveState: function (sensor, state, callback) {
        var command = `setWifiState("${sensor.name}", [0, 0, 0])`;

        context.quickPiConnection.sendCommand(command, callback);
      },
      getStateString: function(state) {
        return `[${state.join(', ')}]`;
      },
    },
    /******************************** */
    /*             dummy sensors      */
    /**********************************/
    {
      name: "cloudstore",
      suggestedName: strings.messages.sensorNameCloudStore,
      description: strings.messages.cloudstore,
      isAnalog: false,
      isSensor: false,
      // portType: "none",
      portType: "D",
      valueType: "object",
      selectorImages: ["cloudstore.png"],
      /*getInitialState: function(sensor) {
          return {};
      },*/

      getWrongStateString: function(failInfo) {
        /**
         * Call this function when more.length > less.length. It will find the key that is missing inside of the
         * less array
         * @param more The bigger array, containing one or more key more than less
         * @param less Less, the smaller array, he has a key or more missing
         */
        function getMissingKey(more, less) {
          for (var i = 0; i < more.length; i++) {
            var found = false;
            for (var j = 0; j < less.length; j++) {
              if (more[i] === less[j]) {
                found = true;
                break;
              }
            }
            if (!found)
              return more[i];
          }
          // should never happen because length are different.
          return null;
        }

        // the type of a value in comparison.
        var valueType = {
          // Primitive type are strings and integers
          PRIMITIVE: "primitive",
          ARRAY: "array",
          DICTIONARY: "dictionary",
          // if two values are of wrong type then this is returned
          WRONG_TYPE: "wrong_type"
        };

        /**
         * This method allow us to compare two keys of the cloud and their values
         * @param actual The actual key that we have
         * @param expected The expected key that we have
         * @return An object containing the type of the return and the key that differ
         */
        function compareKeys(actual, expected) {
          function compareArrays(arr1, arr2) {
            if (arr1.length != arr2.length)
              return false;
            for (var i = 0; i < arr1.length; i++) {
              for (var j = 0; j < arr2.length; j++) {
                if (arr1[i] !== arr2[i])
                  return false;
              }
            }
            return true;
          }
          var actualKeys = Object.keys(actual);

          for (var i = 0; i < actualKeys.length; i++) {
            var actualVal = actual[actualKeys[i]];

            // they both have the same keys so we can do that.
            var expectedVal = expected[actualKeys[i]];

            if (isPrimitive(expectedVal)) {
              // if string with int for example
              if (typeof expectedVal !== typeof actualVal) {
                return {
                  type: valueType.WRONG_TYPE,
                  key: actualKeys[i]
                }
              }
              if (expectedVal !== actualVal) {
                return {
                  type: valueType.PRIMITIVE,
                  key: actualKeys[i]
                };
              }
            } else if (Array.isArray(expectedVal)) {
              if (!Array.isArray(actualVal)) {
                return {
                  type: valueType.WRONG_TYPE,
                  key: actualKeys[i]
                };
              }
              if (!compareArrays(expectedVal, actualVal)) {
                return {
                  type: valueType.ARRAY,
                  key: actualKeys[i]
                };
              }
              // if we are in a dictionary
              // method from: https://stackoverflow.com/questions/38304401/javascript-check-if-dictionary
            } else if (expectedVal.constructor == Object) {
              if (actualVal.constructor != Object) {
                return {
                  type: valueType.WRONG_TYPE,
                  key: actualKeys[i]
                };
              }
              if (!deepEqual(expectedVal, actualVal)) {
                return {
                  type: valueType.DICTIONARY,
                  key: actualKeys[i]
                };
              }
            }
          }
        }

        if(!failInfo.expected &&
          !failInfo.actual)
          return null;

        var expected = failInfo.expected;
        var actual = failInfo.actual;

        var expectedKeys = Object.keys(expected);
        var actualKeys = Object.keys(actual);

        if (expectedKeys.length != actualKeys.length) {
          if (expectedKeys.length > actualKeys.length) {
            var missingKey = getMissingKey(expectedKeys, actualKeys);
            return strings.messages.cloudMissingKey.format(missingKey);
          } else {
            var additionalKey = getMissingKey(actualKeys, expectedKeys);
            return strings.messages.cloudMoreKey.format(additionalKey);
          }
        }

        // This will return a key that is missing inside of expectedKeys if there is one, otherwise it will return null.
        var unexpectedKey = getMissingKey(actualKeys, expectedKeys);

        if (unexpectedKey) {
          return strings.messages.cloudUnexpectedKeyCorrection.format(unexpectedKey);
        }

        var keyCompare = compareKeys(actual, expected);

        switch (keyCompare.type) {
          case valueType.PRIMITIVE:
            return strings.messages.cloudPrimitiveWrongKey.format(keyCompare.key, expected[keyCompare.key], actual[keyCompare.key]);
          case valueType.WRONG_TYPE:
            var typeActual: string = typeof actual[keyCompare.key];
            var typeExpected: string = typeof expected[keyCompare.key];
            // we need to check if it is an array or a dictionary
            if (typeActual == "object") {
              if (Array.isArray(actual[keyCompare.key]))
                typeActual = "array";
            }
            if (typeExpected == "object") {
              if (Array.isArray(expected[keyCompare.key]))
                typeExpected = "array";
            }
            var typeActualTranslate = quickPiLocalLanguageStrings.fr.messages.cloudTypes[typeActual];
            var typeExpectedTranslate = quickPiLocalLanguageStrings.fr.messages.cloudTypes[typeExpected];
            return strings.messages.cloudWrongType.format(typeActualTranslate, keyCompare.key, typeExpectedTranslate);
          case valueType.ARRAY:
            return strings.messages.cloudArrayWrongKey.format(keyCompare.key);
          case valueType.DICTIONARY:
            return strings.messages.cloudDictionaryWrongKey.format(keyCompare.key);
        }
      },

      compareState: function (state1, state2) {
        return LocalQuickStore.compareState(state1, state2);
      }
    },
    {
      name: "clock",
      description: strings.messages.cloudstore,
      isAnalog: false,
      isSensor: false,
      portType: "none",
      valueType: "object",
      selectorImages: ["clock.png"],
    },
    {
      name: "adder",
      portType: "none"
    }
  ];
}