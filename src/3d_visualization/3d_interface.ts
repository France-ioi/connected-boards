import {AppMode, PartData, PartType} from "./types";
import {QuickalgoLibrary} from "../definitions";
import {AbstractSensor} from "../sensors/abstract_sensor";
import React from "react";
import {SensorType} from "../sensors/sensor_types";

const syncPartTypes = {
  [PartType.LIGHT]: SensorType.Led,
  [PartType.SENSOR]: SensorType.Range,
  [PartType.MOTOR]: SensorType.Motor,
};

export function changePartState(context: QuickalgoLibrary, part: PartData, state: unknown): void {
  if (!part.sensorName) {
    return;
  }

  const sensorState = context.getSensorState(part.sensorName);
  if (sensorState === state) {
    return;
  }

  console.log('update part state', {sensor: part.sensorName, state});
  context.registerQuickPiEvent(part.sensorName, state);
}

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

      newSensor.state = newSensor.getInitialState ? newSensor.getInitialState() : undefined;

      part.sensorName = sensorName;
      part.innerState = newSensor.state;

      sensorsList.add(newSensor);

      setTimeout(() => {
        context.registerQuickPiEvent(sensorName, newSensor.state, true, false);
      });

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

export function subscribeToContextStateChanges(context: QuickalgoLibrary, parts: PartData[], setParts: React.Dispatch<React.SetStateAction<PartData[]>>, setMode: React.Dispatch<React.SetStateAction<AppMode>>) {
  context.sensorStateListener = (sensor: AbstractSensor<any>) => {
    if ('object' !== typeof sensor) {
      return;
    }

    const part = parts.find(part => sensor.name === part.sensorName);
    console.log('[3d] sensor state listener', sensor.name, sensor.state, parts);

    if (!part) {
      return;
    }

    if (part.innerState === sensor.state) {
      return;
    }

    console.log('[3d] subscribed to context state');

    setParts(parts => parts.map(p => sensor.name === p.sensorName ? { ...p, innerState: sensor.state } : p));
    setMode(AppMode.PLAY);
  };
}
