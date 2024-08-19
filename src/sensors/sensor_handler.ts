import {getSensorDefinitions} from "./sensor_definitions";
import {SensorDrawer} from "./sensor_drawer";

export class SensorHandler {
  private context;
  private strings;
  private sensorDefinitions;
  private sensorDrawer;

  constructor(context, strings) {
    this.context = context;
    this.strings = strings;
    this.sensorDefinitions = getSensorDefinitions(context, strings);
    this.sensorDrawer = new SensorDrawer(context, strings, this.sensorDefinitions, this);
  }

  getSensorDefinitions() {
    return this.sensorDefinitions;
  }

  getNewSensorSuggestedName(name) {
    let maxvalue = 0;

    for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
      let sensor = this.context.infos.quickPiSensors[i];

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

  findSensorDefinition(sensor) {
    // console.log(sensor)
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
        return state1 == state2;
      };
    }

    return sensorDef;
  }

  isPortUsed(type, port) {
    for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
      let sensor = this.context.infos.quickPiSensors[i];

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

  findSensorByName(name, error=false) {
    if (isNaN(name.substring(0, 1)) && !isNaN(name.substring(1))) {
      for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
        let sensor = this.context.infos.quickPiSensors[i];

        if (sensor.port.toUpperCase() == name.toUpperCase()) {
          return sensor;
        }
      }
    } else {
      let firstname = name.split(".")[0];

      for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
        let sensor = this.context.infos.quickPiSensors[i];

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

  findSensorByType(type: string) {
    for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
      let sensor = this.context.infos.quickPiSensors[i];
      if (sensor.type == type) {
        return sensor;
      }
    }

    return null;
  }

  findSensorByPort(port: string) {
    for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
      let sensor = this.context.infos.quickPiSensors[i];
      if (sensor.port == port) {
        return sensor;
      }
    }

    return null;
  }

  getSensorNames(sensorType) {
    return () => {
      let ports = [];
      for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
        let sensor = this.context.infos.quickPiSensors[i];

        if (sensor.type == sensorType) {
          ports.push([sensor.name, sensor.name]);
        }
      }

      if (sensorType == "button") {
        for (let i = 0; i < this.context.infos.quickPiSensors.length; i++) {
          let sensor = this.context.infos.quickPiSensors[i];

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
}
