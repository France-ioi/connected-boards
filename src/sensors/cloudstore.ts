import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {deepEqual, getImg, isPrimitive} from "../util";
import {quickPiLocalLanguageStrings} from "../lang/language_strings";
import {LocalQuickStore} from "./util/local_quickpi_store";

export class SensorCloudStore extends AbstractSensor {
  public type = 'cloudstore';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
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
    };
  }

  draw(sensorHandler: SensorHandler, drawParameters: SensorDrawParameters) {
    const {imgx, imgy, imgw, imgh, scrolloffset} = drawParameters;
    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('cloudstore.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh * 0.8,
      "opacity": scrolloffset ? 0.3 : 1,
    });

    drawParameters.drawPortText = false;
    // drawName = false;
  }
}
