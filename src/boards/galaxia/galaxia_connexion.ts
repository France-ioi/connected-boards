import {getSessionStorage, setSessionStorage} from "../../helpers/session_storage";

let DEBUG_SILENCE_SENSORS = false;
let DEBUG_OUTPUT_IN_CONSOLE = false;
let DEBUG_FULL_OUTPUT = true;
let SERVO_MIN_DUTY = 26;
let SERVO_MAX_DUTY = 124;


async function getSerial(filters) {
  const allPorts = await navigator.serial.getPorts();
  const savedBoard = getSessionStorage('galaxia_board');

  let port: SerialPort;
  if (null !== savedBoard) {
    port = allPorts.find(port => savedBoard === JSON.stringify(port.getInfo()));
  }

  if (!port) {
    port = await navigator.serial.requestPort({
      filters: filters
    });
  }

  await port.open({baudRate: 115200});

  const info = port.getInfo();
  setSessionStorage('galaxia_board', JSON.stringify(info));

  return port;
}

async function serialWrite(port, data) {
  const writer = port.writable.getWriter();
  const encoder = new TextEncoder();
  /*    let remainingData = data;
      while(remainingData.length > 0) {
          await writer.write(encoder.encode(remainingData.substring(0, 64)));
          remainingData = remainingData.substring(64);
      }*/
  writer.write(encoder.encode(data));
  await writer.ready;
  writer.releaseLock();
}

let sensorValues = {
  "light": 0,
  "acx": 12,
  "acy": 10,
  "acz": 20,
  "heading": 0
}

export class GalaxiaConnection {
  private userName: string;
  private _onConnect;
  private _onDisconnect;
  private _onChangeBoard;
  private connecting: boolean = false;
  private connected: boolean = false;
  private releasing: boolean = false;
  private serial: any;
  private currentOutput: string = "";
  private outputCallback: any;
  private executionQueue: any[];
  private executing: boolean = false;
  private releaseTimeout: any;
  private currentExecutionCallback: any;
  private currentOutputId: string;
  private nbCommandsExecuted: number;
  private reader: any;

  constructor (userName, _onConnect, _onDisconnect, _onChangeBoard) {
    this.userName = userName;
    this._onConnect = _onConnect;
    this._onDisconnect = _onDisconnect;
    this._onChangeBoard = _onChangeBoard;
    this.resetProperties();
  }

  resetProperties() {
    this.connecting = false;
    this.connected = false;
    this.releasing = false;
    this.serial = null;
    this.currentOutput = "";
    this.outputCallback = null;
    this.executionQueue = [];
    this.executing = false;
    this.releaseTimeout = null;
    this.currentExecutionCallback = null;
    this.currentOutputId = "";
    this.nbCommandsExecuted = 0;
  }

  onDisconnect(wasConnected: boolean, wrongversion: boolean = false) {
    this.releaseLock();
    this._onDisconnect.apply(this, arguments);
  }

  onChangeBoard(board: string) {
    this._onChangeBoard.apply(this, arguments);
  }

  processGalaxiaOutput(data) {
    let text = new TextDecoder().decode(data);
    this.currentOutput += text;
    let lines = this.currentOutput.split('\r\n');
    if (!DEBUG_FULL_OUTPUT) {
      lines = lines.slice(-50);
    }
    this.currentOutput = lines.join('\r\n');
    if (DEBUG_OUTPUT_IN_CONSOLE) {
      console.log(this.currentOutput);
    }
    window.currentOutput = this.currentOutput;

    if (this.outputCallback && lines[lines.length - 1].startsWith('>>> ') && lines[lines.length - 2].startsWith(this.currentOutputId)) {
      this.outputCallback(lines[lines.length - 4]);
      this.outputCallback = null;
    }
  }

  async connect(url) {
    this.resetProperties();
    this.connecting = true;
    try {
      this.serial = await getSerial([{usbProductId: 0x4003, usbVendorId: 0x303A}]);
    } catch (e) {
      this.connecting = false;
      this._onDisconnect(false);
      return;
    }

    this.serial.addEventListener('disconnect', () => {
      this.connected = false;
      this.onDisconnect(true);
    });

    this.serialStartRead(this.serial);
    await this.transferPythonLib();

    this.connecting = false;
    this.connected = true;

    this._onConnect();
  }

  async serialStartRead(port) {
    this.reader = port.readable.getReader();
    while (true) {
      const {value, done} = await this.reader.read();
      this.processGalaxiaOutput(value);
      if (done || this.releasing) {
        this.reader.cancel();
        break;
      }
    }
  }


  async transferPythonLib() {
    await serialWrite(this.serial, "f = open(\"fioilib.py\", \"w\")\r\nf.write(" + JSON.stringify(pythonLib).replace(/\n/g, "\r\n") + ")\r\nf.close()\r\n");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await serialWrite(this.serial, "exec(open(\"fioilib.py\", \"r\").read())\r\n");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await serialWrite(this.serial, "f = open(\"main.py\", \"w\")\r\nf.write(" + JSON.stringify(mainLib).replace(/\n/g, "\r\n") + ")\r\nf.close()\r\n");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  isAvailable(ipaddress, callback) {
    callback(ipaddress == "localhost");
  }

  onclose() {
  }

  wasLocked() {
  }

  isConnecting() {
    return this.connecting;
  }

  isConnected() {
    return this.connected;
  }

  executeProgram(pythonProgram) {
    // TODO
  }


  installProgram(pythonProgram, oninstall) {
    let fullProgram = pythonProgram;
    let cmds = [
      "f = open(\"program.py\", \"w\")"
    ]
    while (fullProgram.length > 0) {
      cmds.push("f.write(" + JSON.stringify(fullProgram.substring(0, 128)) + ")");
      fullProgram = fullProgram.substring(128);
    }
    cmds.push("f.close()");
    let idx = -1;

    const executeNext = () => {
      idx += 1;
      if (idx >= cmds.length) {
        oninstall();
        this.executeSerial("exec(open(\"program.py\", \"r\").read())", () => {
        });
      }
      this.executeSerial(cmds[idx] + "\r\n", () => {
        setTimeout(executeNext, 500)
      });
    }

    executeNext();
  }

  runDistributed(pythonProgram, graphDefinition, oninstall) {
    return;
  }

  stopProgram() {
    // TODO
  }

  releaseLock() {
    if (!this.serial) {
      return;
    }
    this.releasing = true;

    const endRelease = async () => {
      if (!this.releaseTimeout) {
        return;
      }
      this.reader.cancel().catch(() => {
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      this.serial.close();
      this.serial = null;
      this.connecting = null;
      this.connected = null;
      this.releaseTimeout = null;
      this.onDisconnect(false);
    }

    serialWrite(this.serial, "\x04")
      .then(() => {
        this.reader.closed.then(() => {
          // For some reason, if we don't use a timeout, the reader is still locked and we can't close the serial port
          setTimeout(endRelease, 100);
        });
      });

    this.releaseTimeout = setTimeout(endRelease, 5000);
  }

  startNewSession() {
    // TODO
  }

  startTransaction() {
    // TODO
  }

  endTransaction() {
    // TODO
  }

  executeSerial(command, callback) {
    if (this.executing) {
      this.executionQueue.push([command, callback]);
      return;
    }
    this.executing = true;
    let that = this;
    this.nbCommandsExecuted += 1;
    if (this.nbCommandsExecuted > 500) {
      this.executionQueue.push(["\x04", () => {
      }]);
      this.executionQueue.push(["exec(open(\"fioilib.py\", \"r\").read())\r\n", () => {
      }]);
      this.nbCommandsExecuted = 0;
    }
    this.currentOutputId = Math.random().toString(36).substring(7);
    this.currentExecutionCallback = callback;
    serialWrite(this.serial, command + "\r\nprint(\"" + this.currentOutputId + "\")\r\n").then(() => {
      that.outputCallback = (data) => {
        if (this.currentExecutionCallback) {
          this.currentExecutionCallback(data);
        }
        that.executing = false;
        if (that.executionQueue.length > 0) {
          let [command, callback] = that.executionQueue.shift();
          this.executeSerial(command, callback);
        }
      }
    })
  }

  // window.exec = executeSerial.bind(this);

  convertResultData(data) {
    if ('True' === data) {
      return true;
    }
    if ('False' === data) {
      return false;
    }

    return data;
  }

  genericSendCommand(command, callback) {
    console.log('generic send command', command);

    this.executeSerial(`print(${command})`, (data) => {
      const convertedData = this.convertResultData(data);
      console.log('received data', {data, convertedData, command});

      callback(convertedData);
    });
  }

  sendCommand(command, callback) {
    if (-1 !== command.indexOf('sensorTable =')) {
      callback();
      return;
    }

    this.genericSendCommand(command, callback);
    return;

    if (command == "readAccelBMI160()") {
      this.genericSendCommand(command, callback);

      // callback(JSON.stringify([sensorValues.acx, sensorValues.acy, sensorValues.acz]));
      // if (DEBUG_SILENCE_SENSORS) {
      //   return callback(JSON.stringify([0, 0, 0]))
      // }
      // executeSerial("print([accelerometer.get_x(), accelerometer.get_y(), accelerometer.get_z()])",
      //   function (data) {
      //   console.log('old receive data', data);
      //     callback(JSON.stringify(JSON.parse(data).map(x => Math.round(x / 10) / 10)));
      //   });

      // executeSerial("print(readAccelBMI160())",
      //   function (data) {
      //     callback(JSON.stringify(JSON.parse(data)));
      //   });
    } else if (command == "setLedState(\"led\",1)" || command == "turnLedOn()") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(true);
      }
      this.executeSerial("led.set_colors(100, 20, 20)\r\nprint(True)", callback);
    } else if (command == "setLedState(\"led\",0)" || command == "turnLedOff()") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(true);
      }
      this.executeSerial("led.set_colors(0, 0, 0)\r\nprint(True)", callback);
    } else if (command == "readAcceleration(\"x\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(0);
      }
      this.executeSerial("print(accelerometer.get_x())", function (data) {
        callback(Math.round(JSON.parse(data) / 10) / 10);
      });
    } else if (command == "readAcceleration(\"y\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(0);
      }
      this.executeSerial("print(accelerometer.get_y())", function (data) {
        callback(Math.round(JSON.parse(data) / 10) / 10);
      });
    } else if (command == "readAcceleration(\"z\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(0);
      }
      this.executeSerial("print(accelerometer.get_z())", function (data) {
        callback(Math.round(JSON.parse(data) / 10) / 10);
      });
    } else if (command == "isButtonPressed(\"btnA\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(0);
      }
      this.executeSerial("print(button_a.is_pressed())", function (data) {
        callback(data == 'True' ? 1 : 0);
      });
    } else if (command == "isButtonPressed(\"btnB\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(0);
      }
      this.executeSerial("print(button_b.is_pressed())", function (data) {
        callback(data == 'True' ? 1 : 0);
      });
    } else if (command.startsWith("setServoAngle(\"servo\",")) {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(true);
      }
      let angle = parseInt(command.substring(22, command.length - 1));
      if (!angle || angle < 0) {
        angle = 0;
      }
      if (angle > 180) {
        angle = 180;
      }
      let duty = Math.floor(0.025 * 1023 + angle * 0.1 * 1023 / 180);
      this.executeSerial("pwm7.duty(" + duty + ")\r\nprint(True)", callback);
    } else if (command == "getServoAngle(\"servo\")") {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(90);
      }
      this.executeSerial("print(pwm7.duty())", function (data) {
        let duty = parseInt(data);
        let angle = Math.floor((duty - SERVO_MIN_DUTY) * 180 / (SERVO_MAX_DUTY - SERVO_MIN_DUTY));
        callback(angle);
      });
    } else if (command.startsWith("setBuzzerState(\"buzzer\",")) {
      if (DEBUG_SILENCE_SENSORS) {
        return callback(true);
      }
      let state = command.substring(24, command.length - 1);
      let target = "off";
      if (state == "True" || state == "1") {
        target = "on";
      }
      this.executeSerial("p7." + target + "()\r\nprint(True)", callback);
    } else {
      console.log("unknown command", command);
      callback();
    }
  }
}


let pythonLib = `
from machine import *
from thingz import *

def readAcceleration(axis):
    if axis == "x":
        val = accelerometer.get_x()
    elif axis == "y":
        val = accelerometer.get_y()
    elif axis == "z":
        val = accelerometer.get_z()
    else:
        throw("Unknown axis")
    return round(val/100, 1)

def readAccelBMI160():
    return [readAcceleration("x"), readAcceleration("y"), readAcceleration("z")]

def setLedState(name, state):
    if state == 1:
        led.set_colors(100, 20, 20)
    else:
        led.set_colors(0, 0, 0)

def readLightIntensity(pin):
	  return led.read_light_level()

def readTemperature(pin):
    return temperature()

def turnLedOn():
    setLedState("led", 1)

def turnLedOff():
    setLedState("led", 0)

def setLedRgbState(pin, rgb):
    led.set_colors(rgb[0], rgb[1], rgb[2])
 
def isButtonPressed(name):
    if name == "button_a":
        return button_a.is_pressed()
    elif name == "button_b":
        return button_b.is_pressed()
    elif name == "touch_n":
        return touch_n.is_touched()
    elif name == "touch_s":
        return touch_s.is_touched()
    elif name == "touch_e":
        return touch_e.is_touched()
    elif name == "touch_w":
        return touch_w.is_touched()
    else:
        throw("Unknown button")
`;

let mainLib = `
import os
from machine import *
from thingz import *

program_exists = False

try:
    open("program.py", "r").close()
    program_exists = True
except OSError:
    pass

if button_a.is_pressed() and button_b.is_pressed():
    if program_exists:
        print("Removing program")
        os.remove("program.py")
elif program_exists:
    exec(open("fioilib.py", "r").read(), globals())
    exec(open("program.py", "r").read(), globals())

`


/*f = open("main.py", "w")
f.write("""
from machine import *
from thingz import *
import os
if button_a.is_pressed() and button_b.is_pressed():
    if os.path.exists("main.py"):
        print("Removing")
        os.remove("main.py")
else:
    print("Hello, world!")
""")
f.close()*/

