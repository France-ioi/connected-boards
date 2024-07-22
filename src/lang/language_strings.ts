import langFr from './fr';
import langEs from './es';
import langIt from './it';

export const quickPiLocalLanguageStrings = {
  fr: langFr,
  es: langEs,
  it: langIt,

  none: {
    comment: {
      // Comments for each block, used in the auto-generated documentation for task writers
      turnLedOn: "Turns on the light",
      turnLedOff: "Turns off the light",
      isButtonPressed: "Returns the state of a button, Pressed means True and not pressed means False",
      waitForButton: "Stops program execution until a button is pressed",
      buttonWasPressed: "Returns true if the button has been pressed and will clear the value",
      setLedState: "Change led state in the given port",
      setLedMatrixOne: "Change led state in the given port",
      toggleLedState: "If led is on, turns it off, if it's off turns it on",
      isButtonPressedWithName: "Returns the state of a button, Pressed means True and not pressed means False",
      displayText: "Display text in LCD screen",
      displayText2Lines: "Display text in LCD screen (two lines)",
      readTemperature: "Read Ambient temperature",
      sleep: "pause program execute for a number of seconds",
      setServoAngle: "Set servo motor to an specified angle",
      readRotaryAngle: "Read state of potentiometer",
      readDistance: "Read distance using ultrasonic sensor",
      readLightIntensity: "Read light intensity",
      readHumidity: "lire l'humidité ambiante",
      currentTime: "returns current time",
      setBuzzerState: "sonnerie",
      getTemperatureFromCloud: "Get temperature from town",
      setBuzzerNote: "Set buzzer note",
      getBuzzerNote: "Get buzzer note",
      setLedBrightness: "Set Led Brightness",
      getLedBrightness: "Get Led Brightness",
      setLedColors: "Set Led Colors",
      getServoAngle: "Get Servo Angle",
      isLedOn: "Get led state",
      isLedOnWithName: "Get led state",
      turnBuzzerOn: "Turn Buzzer on",
      turnBuzzerOff: "Turn Buzzer off",
      isBuzzerOn: "Is Buzzer On",
      isBuzzerOnWithName: "get buzzer state",
      drawPoint: "drawPoint",
      isPointSet: "isPointSet",
      drawLine: "drawLine",
      drawRectangle: "drawRectangle",
      drawCircle: "drawCircle",
      clearScreen: "clearScreen",
      updateScreen: "updateScreen",
      autoUpdate: "autoUpdate",
      fill: "fill",
      noFill: "noFill",
      stroke: "stroke",
      noStroke: "noStroke",
      readAcceleration: "readAcceleration",
      computeRotation: "computeRotation",
      readSoundLevel: "readSoundLevel",
      readMagneticForce: "readMagneticForce",
      computeCompassHeading: "computeCompassHeading",
      readInfraredState: "readInfraredState",
      setInfraredState: "setInfraredState",

      // Gyroscope
      readAngularVelocity: "readAngularVelocity",
      setGyroZeroAngle: "setGyroZeroAngle",
      computeRotationGyro: "computeRotationGyro",

      //Internet store
      connectToCloudStore: "connectToCloudStore",
      writeToCloudStore: "writeToCloudStore",
      readFromCloudStore: "readFromCloudStore",

      // IR Remote
      readIRMessage: "readIRMessage",
      sendIRMessage: "sendIRMessage",
      presetIRMessage: "presetIRMessage",

      //Continous servo
      setContinousServoDirection: "setContinousServoDirection",
    }
  }
}
