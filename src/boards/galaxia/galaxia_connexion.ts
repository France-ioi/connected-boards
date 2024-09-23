import {getSessionStorage, setSessionStorage} from "../../helpers/session_storage";
import {galaxiaPythonLib} from "./galaxia_python_lib";
import {galaxiaRequestsModule} from "./galaxia_requests_module";

let DEBUG_OUTPUT_IN_CONSOLE = true;
let DEBUG_FULL_OUTPUT = false;


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
  await writer.write(encoder.encode(data));
  await writer.ready;
  writer.releaseLock();
}

export class GalaxiaConnection {
  private _onConnect;
  private _onDisconnect;
  private _onChangeBoard;
  private connecting: boolean = false;
  private connected: boolean = false;
  private releasing: boolean = false;
  private serial: any;
  private currentOutputLine: string = '';
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
    this.currentOutputLine = '';
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
    this.currentOutputLine += text;

    let currentLines = this.currentOutputLine.split('\r\n');
    if (currentLines.length > 1) {
      this.currentOutputLine = [...currentLines].pop();
      const linesToAdd = currentLines.slice(0, -1).join('\r\n');
      this.currentOutput += linesToAdd + '\r\n';
      if (DEBUG_OUTPUT_IN_CONSOLE && !DEBUG_FULL_OUTPUT) {
        console.log(linesToAdd);
      }
    }

    let lines = this.currentOutput.split('\r\n');
    this.currentOutput = lines.join('\r\n');
    if (DEBUG_OUTPUT_IN_CONSOLE && DEBUG_FULL_OUTPUT) {
      console.log(this.currentOutput);
    }

    window.currentOutput = this.currentOutput;

    if (this.outputCallback && this.currentOutputLine.startsWith('>>> ') && lines[lines.length - 2].startsWith(this.currentOutputId)) {
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
    const waitDelay = 500;

    await this.transferModule('fioilib.py', galaxiaPythonLib, waitDelay);
    await this.transferModule('requests.py', galaxiaRequestsModule, waitDelay);

    await new Promise(resolve => setTimeout(resolve, waitDelay));
    await serialWrite(this.serial, "f = open(\"main.py\", \"w\")\r\nf.write(" + JSON.stringify(mainLib).replace(/\n/g, "\r\n") + ")\r\nf.close()\r\n");
    await new Promise(resolve => setTimeout(resolve, waitDelay));
  }

  async transferModule(moduleFile, moduleContent, waitDelay) {
    const size = 1200; // Max 1kb size
    const numChunks = Math.ceil(moduleContent.length / size);

    await serialWrite(this.serial, `f = open("${moduleFile}", "w")\r
`);
    await new Promise(resolve => setTimeout(resolve, waitDelay));

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      const chunk = moduleContent.substring(o, o + size);

      await serialWrite(this.serial, "f.write(" + JSON.stringify(chunk).replace(/\n/g, "\r\n") + ")\r\n");
      await new Promise(resolve => setTimeout(resolve, waitDelay));
    }
    await serialWrite(this.serial, "f.close()\r\n");
    await new Promise(resolve => setTimeout(resolve, waitDelay));
    await serialWrite(this.serial, `exec(open("${moduleFile}", "r").read())\r
`);
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

  genericSendCommand(command, callback) {
    this.executeSerial(`print(dumps(${command}))`, (data) => {
      const convertedData = data;

      callback(convertedData);
    });
  }

  sendCommand(command: string, callback) {
    if (-1 !== command.indexOf('sensorTable =')) {
      this.executeSerial(command, callback);
      return;
    }

    this.genericSendCommand(command, callback);
  }
}

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

