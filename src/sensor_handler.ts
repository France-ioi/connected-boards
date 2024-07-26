import {getSensorDefinitions} from "./sensor_definitions";

export class SensorHandler {
  private context;
  private strings;
  private sensorDefinitions;

  constructor(context, strings) {
    this.context = context;
    this.strings = strings;
    this.sensorDefinitions = getSensorDefinitions(context, strings);
  }

  getNewSensorSuggestedName(name) {
    var maxvalue = 0;

    for (var i = 0; i < this.context.infos.quickPiSensors.length; i++) {
      var sensor = this.context.infos.quickPiSensors[i];

      var firstdigit = sensor.name.search(/\d/);
      if (firstdigit > 0) {
        var namepart = sensor.name.substring(0, firstdigit);
        var numberpart = parseInt(sensor.name.substring(firstdigit), 10);

        if (name == namepart && numberpart > maxvalue) {
          maxvalue = numberpart;
        }
      }
    }

    return name + (maxvalue + 1);
  }

  findSensorDefinition(sensor) {
    // console.log(sensor)
    var sensorDef = null;
    for (var iType = 0; iType < this.sensorDefinitions.length; iType++) {
      var type = this.sensorDefinitions[iType];

      if (sensor.type == type.name) {
        if (sensor.subType && type.subTypes) {

          for (var iSubType = 0; iSubType < type.subTypes.length; iSubType++) {
            var subType = type.subTypes[iSubType];

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
}
