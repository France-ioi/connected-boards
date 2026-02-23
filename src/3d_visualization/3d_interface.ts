import {PartData, PartType} from "./types";
import {QuickalgoLibrary} from "../definitions";

const syncPartTypes = {
  [PartType.LIGHT]: 'led',
};

export function updateContextSensors(parts: PartData[], context: QuickalgoLibrary) {
  const {sensorsList} = context;
  let sensorsToRemove = [...sensorsList.all()];
  let hasChanges = false;

  for (let part of parts) {
    if (!(part.type in syncPartTypes)) {
      continue;
    }

    if (!part.sensorName || !sensorsList.findSensorByName(part.sensorName)) {
      const dummySensor = {type: syncPartTypes[part.type]};
      // @ts-ignore
      const sensorDefinition = context.sensorHandler.findSensorDefinition(dummySensor);
      const sensorName = context.sensorHandler.getNewSensorSuggestedName(sensorDefinition.suggestedName);

      const newSensor = context.sensorHandler.createSensor({
        type: sensorDefinition.name,
        subType: sensorDefinition.subType,
        name: sensorName,
      });

      part.sensorName = sensorName;

      sensorsList.add(newSensor);
      hasChanges = true;
    } else {
      const sensor = sensorsList.findSensorByName(part.sensorName);

      // TODO: update sensor
      sensorsToRemove.splice(sensorsToRemove.indexOf(sensor), 1);
    }
  }

  for (let sensor of sensorsToRemove) {
    sensorsList.all().splice(sensorsList.all().indexOf(sensor), 1);
    hasChanges = true;
  }

  if (hasChanges) {
    console.log('reflect changes');
    context.recreateDisplay = true;
    context.resetDisplay();
  }
}
