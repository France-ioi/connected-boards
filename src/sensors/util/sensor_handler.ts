import {getSensorDefinitions} from "./sensor_definitions";
import {SensorDrawer} from "./sensor_drawer";
import {Sensor, SensorDefinition} from "../../definitions";
import {sensorsList} from "../sensor_factory";

export class SensorHandler {
  private context;
  private strings;
  private sensorDefinitions: SensorDefinition[];
  private sensorDrawer: SensorDrawer;

  constructor(context, strings) {
    this.context = context;
    this.strings = strings;
    console.log('construct');
    const otherDefinitions = Object.values(sensorsList).map(a => a.getDefinition(this.context, this.strings));

    this.sensorDefinitions = [
      ...getSensorDefinitions(context, strings),
      ...otherDefinitions,
    ];

    this.sensorDrawer = new SensorDrawer(context, strings, this.sensorDefinitions, this);
  }

  getSensorDefinitions(): SensorDefinition[] {
    return this.sensorDefinitions;
  }

  getSensorDrawer(): SensorDrawer {
    return this.sensorDrawer;
  }

  getNewSensorSuggestedName(name) {
    let maxvalue = 0;

    for (let sensor of this.context.sensorsList.all()) {
      let firstdigit = sensor.name.search(/\d/);
      if (firstdigit > 0) {
        let namepart = sensor.name.substring(0, firstdigit);
        let numberpart = parseInt(sensor.name.substring(firstdigit), 10);

        if (name == namepart && numberpart > maxvalue) {
          maxvalue = numberpart;
        }
      }
    }

    return name + (maxvalue + 1);
  }

  findSensorDefinition(sensor: Sensor): SensorDefinition {
    console.log(sensor, this.sensorDefinitions);
    let sensorDef = null;
    for (let iType = 0; iType < this.sensorDefinitions.length; iType++) {
      let type = this.sensorDefinitions[iType];

      if (sensor.type == type.name) {
        if (sensor.subType && type.subTypes) {

          for (let iSubType = 0; iSubType < type.subTypes.length; iSubType++) {
            let subType = type.subTypes[iSubType];

            if (subType.subType == sensor.subType) {
              sensorDef = $.extend({}, type, subType);
            }
          }
        } else {
          sensorDef = type;
        }
      }
    }

    if (sensorDef && !sensorDef.compareState) {
      sensorDef.compareState = function (state1, state2) {
        if (Array.isArray(state1) && Array.isArray(state2)) {
          return JSON.stringify(state1) === JSON.stringify(state2)
        }
        return state1 == state2;
      };
    }

    return sensorDef;
  }

  isPortUsed(type, port): boolean {
    for (let sensor of this.context.sensorsList.all()) {
      if (port == "i2c") {
        if (sensor.type == type)
          return true;
      } else {
        if (sensor.port == port)
          return true;
      }
    }

    return false;
  }

  findSensorByName(name, error=false): Sensor|null {
    if (isNaN(name.substring(0, 1)) && !isNaN(name.substring(1))) {
      for (let sensor of this.context.sensorsList.all()) {
        if (sensor.port.toUpperCase() == name.toUpperCase()) {
          return sensor;
        }
      }
    } else {
      let firstname = name.split(".")[0];

      for (let sensor of this.context.sensorsList.all()) {
        if (sensor.name.toUpperCase() == firstname.toUpperCase()) {
          return sensor;
        }
      }
    }

    if (error) {
      this.context.success = false;
      throw (this.strings.messages.sensorNotFound.format(name));
    }

    return null;
  }

  findSensorByType(type: string): Sensor|null {
    for (let sensor of this.context.sensorsList.all()) {
      if (sensor.type == type) {
        return sensor;
      }
    }

    return null;
  }

  findSensorByPort(port: string): Sensor|null {
    for (let sensor of this.context.sensorsList.all()) {
      if (sensor.port == port) {
        return sensor;
      }
    }

    return null;
  }

  getSensorNames(sensorType) {
    return () => {
      let ports = [];
      for (let sensor of this.context.sensorsList.all()) {
        if (sensor.type == sensorType) {
          ports.push([sensor.name, sensor.name]);
        }
      }

      if (sensorType == "button") {
        for (let sensor of this.context.sensorsList.all()) {
          if (sensor.type == "stick") {
            let stickDefinition = this.findSensorDefinition(sensor);

            for (let iStick = 0; iStick < stickDefinition.gpiosNames.length; iStick++) {
              let name = sensor.name + "." + stickDefinition.gpiosNames[iStick];

              ports.push([name, name]);
            }
          }
        }
      }

      if (ports.length == 0) {
        ports.push(["none", "none"]);
      }

      return ports;
    }
  }

  drawSensor(sensor, juststate = false, donotmovefocusrect = false) {
    this.sensorDrawer.drawSensor(sensor, juststate, donotmovefocusrect);
  }

  isElementRemoved(element) {
    return !element.paper.canvas || !element.node.parentElement;
  }

  warnClientSensorStateChanged(sensor) {
    let sensorStateCopy = JSON.parse(JSON.stringify(sensor.state));
    if (this.context.dispatchContextEvent) {
      this.context.dispatchContextEvent({type: 'quickpi/changeSensorState', payload: [sensor.name, sensorStateCopy], onlyLog: true});
    }
  }

  actuatorsInRunningModeError() {
    window.displayHelper.showPopupMessage(this.strings.messages.actuatorsWhenRunning, 'blanket');
  }
}
