﻿import {galaxiaBoard} from "./boards/galaxia/galaxia_board";
import {quickPiLocalLanguageStrings} from "./lang/language_strings";
import {quickPiBoard} from "./boards/quickpi/quickpi_board";
import {AbstractBoard} from "./boards/abstract_board";
import {buzzerSound} from "./buzzer_sound";
import {gyroscope3D} from "./gyroscope3d";
import {getSensorDefinitions} from "./sensor_definitions";
import {showConfig} from "./config/config";
import {getSessionStorage, setSessionStorage} from "./helpers/session_storage";
import {SensorHandler} from "./sensor_handler";
import {showasConnecting} from "./display";
import {getImg} from "./util";

const colors = {
    blue: "#4a90e2",
    orange: "#f5a623"
}

const boards: {[board: string]: AbstractBoard} = {
    galaxia: galaxiaBoard,
    quickpi: quickPiBoard,
};

// This is a template of library for use with quickAlgo.
var getContext = function (display, infos, curLevel) {

    // Local language strings for each language
    var introControls = null;

    // Create a base context
    var context = window.quickAlgoContext(display, infos);

    // we set the lib involved to Quick-Pi
    context.title = "Quick-Pi";

    // Import our localLanguageStrings into the global scope
    let strings = context.setLocalLanguageStrings(quickPiLocalLanguageStrings);

    context.disableAutoCompletion = false;

    // Some data can be made accessible by the library through the context object
    context.quickpi = {};

    const mainBoard: AbstractBoard = boards[context.infos.quickPiBoard ?? 'quickpi'];
    if (!mainBoard) {
        throw `This main board doesn't exist: "${context.infos.quickPiBoard}"`;
    }

    mainBoard.setStrings(strings);

    const sensorHandler = new SensorHandler(context, strings);

    // List of concepts to be included by conceptViewer
    context.getConceptList = function() {
        var conceptList = [{id: 'language', ignore: true}];
        var quickPiConceptList = [
            {
                id: 'quickpi_start',
                isBase: true,
                order: 1,
                python: []
            },
            {
                id: 'quickpi_validation',
                isBase: true,
                order: 2,
                python: []
            },
            {
                id: 'quickpi_buzzer',
                order: 200,
                python: ['setBuzzerState', 'setBuzzerNote','turnBuzzerOn','turnBuzzerOff', 'setBuzzerState',
                    'getBuzzerNote', 'isBuzzerOn']
            },
            {
                id: 'quickpi_led',
                order: 201,
                python: ['setLedState','toggleLedState','turnLedOn','turnLedOff', 'setLedBrightness', 'getLedBrightness', 'isLedOn']
            },
            {
                id: 'quickpi_button',
                order: 202,
                python: ['isButtonPressed', 'isButtonPressedWithName', 'waitForButton', 'buttonWasPressed', 'onButtonPressed']
            },  
            {   
                id: 'quickpi_screen',
                order: 203,
                python: ['displayText']
            },
            {   
                id: 'quickpi_draw',
                order: 203,
                python: ['drawRectangle','drawLine','drawCircle', 'drawPoint', 'clearScreen', 'fill', 'noFill',
                    'stroke', 'noStroke','updateScreen', 'autoUpdate', 'isPointSet']
            },
            {
                id: 'quickpi_range',
                order: 204,
                python: ['readDistance']
            },
            {
                id: 'quickpi_servo',
                order: 205,
                python: ['setServoAngle', 'getServoAngle']
            },
            {
                id: 'quickpi_thermometer',
                order: 206,
                python: ['readTemperature']
            },
            {
                id: 'quickpi_microphone',
                order: 207,
                python: ['readSoundLevel']
            },
            {
                id: 'quickpi_light_sensor',
                order: 208,
                python: ['readLightIntensity']
            },
            {
                id: 'quickpi_accelerometer',
                order: 209,
                python: ['readAcceleration', 'computeRotation']
            },
            {
                id: 'quickpi_wait',
                order: 250,
                python: ['sleep', 'currentTime']
            },
            {
                id: 'quickpi_magneto',
                order: 210,
                python: ['readMagneticForce', 'computeCompassHeading']
            },
            {
                id: 'quickpi_ir_receiver',
                order: 211,
                python: ['readInfraredState', 'readIRMessage']
            },
            {
                id: "quickpi_ir_emitter",
                order: 212,
                python: ["setInfraredState", "sendIRMessage", "presetIRMessage"]
            },
            {
                id: "quickpi_potentiometer",
                order: 213,
                python: ["readRotaryAngle"]
            },
            {
                id: "quickpi_gyroscope",
                order: 214,
                python: ["readAngularVelocity", "setGyroZeroAngle", "computeRotationGyro"]
            },
            {
                id: 'quickpi_cloud',
                order: 220,
                python: ['writeToCloudStore','connectToCloudStore','readFromCloudStore', 'getTemperatureFromCloud']
            }
        ];

        if(window.stringsLanguage == 'fr' || !strings.concepts) {
            var conceptStrings = quickPiLocalLanguageStrings.fr.concepts;
            var conceptIndex = 'quickpi.html';
        } else {
            var conceptStrings = strings.concepts;
            var conceptIndex = 'quickpi_' + window.stringsLanguage + '.html';
        }
        var conceptBaseUrl = 'https://static4.castor-informatique.fr/help/'+conceptIndex;

        for(var i = 0; i < quickPiConceptList.length; i++) {
            var concept = quickPiConceptList[i];
            concept.name = conceptStrings[concept.id];
            concept.url = conceptBaseUrl + '#' + concept.id;
            if(!concept.language) { concept.language = 'all'; }
            conceptList.push(concept);
        }
        return conceptList;
    }

    const boardDefinitions = mainBoard.getBoardDefinitions();

    const sensorDefinitions = getSensorDefinitions(context, strings);

    if(window.quickAlgoInterface) {
        window.quickAlgoInterface.stepDelayMin = 1;
    }

    var defaultQuickPiOptions = {
        disableConnection: false,
        increaseTimeAfterCalls: 5
        };
    function getQuickPiOption(name) {
        if(name == 'disableConnection') {
            // TODO :: Legacy, remove when all tasks will have been updated
            return (context.infos
                && (context.infos.quickPiDisableConnection
                || (context.infos.quickPi && context.infos.quickPi.disableConnection)));
        }
        if(context.infos && context.infos.quickPi && typeof context.infos.quickPi[name] != 'undefined') {
            return context.infos.quickPi[name];
        } else {
            return defaultQuickPiOptions[name];
        }
    }

    function getWrongStateText(failInfo) {
        var actualStateStr = "" + failInfo.actual;
        var expectedStateStr = "" + failInfo.expected;
        var sensorDef = sensorHandler.findSensorDefinition(failInfo.sensor);
        if(sensorDef) {
            if(sensorDef.isSensor) {
                return strings.messages.wrongStateSensor.format(failInfo.name, failInfo.time);
            }
            if(sensorDef.getWrongStateString) {
                var sensorWrongStr = sensorDef.getWrongStateString(failInfo);
                if(sensorWrongStr) {
                    return sensorWrongStr;
                }
            }
            if(sensorDef.getStateString) {
                actualStateStr = sensorDef.getStateString(failInfo.actual);
                expectedStateStr = sensorDef.getStateString(failInfo.expected);
            }
        }
        return strings.messages.wrongState.format(failInfo.name, actualStateStr, expectedStateStr, failInfo.time);
    }

    if (mainBoard.getConnection()) {
        var lockstring = getSessionStorage('lockstring');
        if(!lockstring) {
            lockstring = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            setSessionStorage('lockstring', lockstring);
        }

        const getBoardConnection = mainBoard.getConnection();
        context.quickPiConnection = getBoardConnection(lockstring, raspberryPiConnected, raspberryPiDisconnected, raspberryPiChangeBoard);

        context.quickPiConnection.isAvailable("localhost", function(available) {
            context.localhostAvailable = available;
        });

        context.quickPiConnection.isAvailable(window.location.hostname, function(available) {
            context.windowLocationAvailable = available;
        });

    }

    var paper;
    context.offLineMode = true;
    context.timeLineStates = [];
    var innerState = {};

    var getSensorFullState = function (sensor) {
        return {
            state: sensor.state,
            screenDrawing: sensor.screenDrawing,
            lastDrawnTime: sensor.lastDrawnTime,
            lastDrawnState: sensor.lastDrawnState,
            callsInTimeSlot: sensor.callsInTimeSlot,
            lastTimeIncrease: sensor.lastTimeIncrease,
            removed: sensor.removed,
            quickStore: sensor.quickStore,
        };
    }

    var reloadSensorFullState = function (sensor, save) {
        sensor.state = save.state;
        sensor.screenDrawing = save.screenDrawing;
        sensor.lastDrawnTime = save.lastDrawnTime;
        sensor.lastDrawnState = save.lastDrawnState;
        sensor.callsInTimeSlot = save.callsInTimeSlot;
        sensor.lastTimeIncrease = save.lastTimeIncrease;
        sensor.removed = save.removed;
        sensor.quickStore = save.quickStore;
    };

    context.getInnerState = function() {
        var savedSensors = {};
        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];
            var savedSensor = getSensorFullState(sensor);
            savedSensors[sensor.name] = savedSensor;
        }

        innerState.sensors = savedSensors;
        innerState.timeLineStates = context.timeLineStates.map(function (timeLineState) {
            var timeLineElement = Object.assign({}, timeLineState);
            timeLineElement.sensorName = timeLineElement.sensor.name;
            delete timeLineElement.sensor;

            return timeLineElement;
        });
        innerState.currentTime = context.currentTime;

        return innerState;
    };

    context.implementsInnerState = function () {
        return true;
    }

    context.reloadInnerState = function(data) {
        innerState = data;

        for (var name in data.sensors) {
            var sensor = sensorHandler.findSensorByName(name);
            var savedSensor = data.sensors[name];
            context.sensorsSaved[name] = savedSensor;
            reloadSensorFullState(sensor, savedSensor);
        }

        context.timeLineStates = [];
        for (var i = 0; i < data.timeLineStates.length; i++) {
            var newTimeLineState = Object.assign({}, data.timeLineStates[i]);
            newTimeLineState.sensor = sensorHandler.findSensorByName(newTimeLineState.sensorName);
            context.timeLineStates.push(newTimeLineState);
        }

        context.currentTime = data.currentTime;
    }
    
    context.getEventListeners = function () {
        return {
            'quickpi/changeSensorState': 'changeSensorState',
        };
    }

    context.redrawDisplay = function () {
        context.resetDisplay();
    }

    context.onExecutionEnd = function () {
        if (context.autoGrading)
        {
            buzzerSound.stopAll();
        }

    };

    infos.checkEndEveryTurn = true;
    infos.checkEndCondition = function (context, lastTurn) {

        if (!context.display && !context.autoGrading && !context.forceGradingWithoutDisplay) {
            context.success = true;
            throw (strings.messages.manualTestSuccess);
        }

        if (context.failImmediately)
        {
            context.success = false;
            throw (context.failImmediately);
        }

        var testEnded = lastTurn || context.currentTime > context.maxTime;

        if (context.autoGrading) {
            if (!testEnded) { return; }

            if (lastTurn && context.display && !context.loopsForever) {
                context.currentTime = Math.floor(context.maxTime * 1.05);
                drawNewStateChanges();
                drawCurrentTime();
            }

            var failInfo = null;

            for(var sensorName in context.gradingStatesBySensor) {
                // Cycle through each sensor from the grading states
                var sensor = sensorHandler.findSensorByName(sensorName);
                var sensorDef = sensorHandler.findSensorDefinition(sensor);

                var expectedStates = context.gradingStatesBySensor[sensorName];
                if(!expectedStates.length) { continue;}

                var actualStates = context.actualStatesBySensor[sensorName];
                var actualIdx = 0;

                // Check that we went through all expected states
                for (var i = 0; i < context.gradingStatesBySensor[sensorName].length; i++) {
                    var expectedState = context.gradingStatesBySensor[sensorName][i];

                    if(expectedState.hit || expectedState.input ) { continue; } // Was hit, valid
                    var newFailInfo = null;
                    if(actualStates) {
                        // Scroll through actual states until we get the state at this time
                        while(actualIdx + 1 < actualStates.length && actualStates[actualIdx+1].time <= expectedState.time) {
                            actualIdx += 1;
                        }
                        if(!sensorDef.compareState(actualStates[actualIdx].state, expectedState.state)) {
                            newFailInfo = {
                                sensor: sensor,
                                name: sensorName,
                                time: expectedState.time,
                                expected: expectedState.state,
                                actual: actualStates[actualIdx].state
                            };
                        }
                    } else {
                        // No actual states to compare to
                        newFailInfo = {
                            sensor: sensor,
                            name: sensorName,
                            time: expectedState.time,
                            expected: expectedState.state,
                            actual: null
                        };
                    }

                    if(newFailInfo) {
                        // Only update failInfo if we found an error earlier
                        failInfo = failInfo && failInfo.time < newFailInfo.time ? failInfo : newFailInfo;
                    }
                }

                // Check that no actual state conflicts an expected state
                if(!actualStates) { continue; }
                var expectedIdx = 0;
                for(var i = 0; i < actualStates.length ; i++) {
                    var actualState = actualStates[i];
                    while(expectedIdx + 1 < expectedStates.length && expectedStates[expectedIdx+1].time <= actualState.time) {
                        expectedIdx += 1;
                    }
                    if(!sensorDef.compareState(actualState.state, expectedStates[expectedIdx].state)) {
                        // Got an unexpected state change
                        var newFailInfo = {
                            sensor: sensor,
                            name: sensorName,
                            time: actualState.time,
                            expected: expectedStates[expectedIdx].state,
                            actual: actualState.state
                        };
                        failInfo = failInfo && failInfo.time < newFailInfo.time ? failInfo : newFailInfo;
                    }
                }
            }

            if(failInfo) {
                // Missed expected state
                context.success = false;
                throw (getWrongStateText(failInfo));
            } else {
                // Success
                context.success = true;
                throw (strings.messages.programEnded);
            }
        } else {
            if (!context.offLineMode) {
                $('#piinstallcheck').hide();
            }

            if (lastTurn) {
                context.success = true;
                throw (strings.messages.programEnded);
            }
        }
   };

   context.generatePythonSensorTable = function()
   {
        var pythonSensorTable = "sensorTable = [";
        var first = true;

        for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
            var sensor = infos.quickPiSensors[iSensor];
            if (first) {
                first = false;
            } else {
                pythonSensorTable += ",";
            }

            if (sensor.type == "stick") {
                var stickDefinition = sensorHandler.findSensorDefinition(sensor);
                var firststick = true;

                for (var iStick = 0; iStick < stickDefinition.gpiosNames.length; iStick++) {
                    var name = sensor.name + "." + stickDefinition.gpiosNames[iStick];
                    var port = "D" + stickDefinition.gpios[iStick];

                    if (firststick) {
                        firststick = false;
                    } else {
                        pythonSensorTable += ",";
                    }

                    pythonSensorTable += "{\"type\":\"button\"";
                    pythonSensorTable += ",\"name\":\"" + name + "\"";
                    pythonSensorTable += ",\"port\":\"" + port + "\"}";
                }
            } else {
                pythonSensorTable += "{\"type\":\"" + sensor.type + "\"";
                pythonSensorTable += ",\"name\":\"" + sensor.name + "\"";
                pythonSensorTable += ",\"port\":\"" + sensor.port + "\"";
                if (sensor.subType)
                    pythonSensorTable += ",\"subType\":\"" + sensor.subType + "\"";

                pythonSensorTable += "}";
            }
        }

        var board = mainBoard.getCurrentBoard(context.board);
        pythonSensorTable += "]; currentADC = \"" + board.adc + "\"";

        return pythonSensorTable;
   }

    context.resetSensorTable = function()
    {
        var pythonSensorTable = context.generatePythonSensorTable();

        context.quickPiConnection.sendCommand(pythonSensorTable, function(x) {});
    }


    context.findSensor = function findSensor(type, port, error=true) {
        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];

            if (sensor.type == type && sensor.port == port)
                return sensor;
        }

        if (error) {
            context.success = false;
            throw (strings.messages.sensorNotFound.format('type ' + type + ', port ' + port));
        }

        return null;
    }


    function sensorAssignPort(sensor)
    {
        var board = mainBoard.getCurrentBoard(context.board);
        var sensorDefinition = sensorHandler.findSensorDefinition(sensor);

        sensor.port = null;

        // first try with built ins
        if (board.builtinSensors) {
            for (var i = 0; i < board.builtinSensors.length; i++) {
                var builtinsensor = board.builtinSensors[i];

                // Search for the specified subtype 
                if (builtinsensor.type == sensor.type && 
                    builtinsensor.subType == sensor.subType &&
                    !context.findSensor(builtinsensor.type, builtinsensor.port, false))
                {
                    sensor.port = builtinsensor.port;
                    return;
                }
            }

            // Search without subtype
            for (var i = 0; i < board.builtinSensors.length; i++) {
                var builtinsensor = board.builtinSensors[i];

                // Search for the specified subtype 
                if (builtinsensor.type == sensor.type && 
                    !context.findSensor(builtinsensor.type, builtinsensor.port, false))
                {
                    sensor.port = builtinsensor.port;
                    sensor.subType = builtinsensor.subType;
                    return;
                }
            }


            // If this is a button try to set it to a stick
            if (!sensor.port && sensor.type == "button") {
                for (var i = 0; i < board.builtinSensors.length; i++) {
                    var builtinsensor = board.builtinSensors[i];
                    if (builtinsensor.type == "stick")
                    {
                        sensor.port = builtinsensor.port;
                        return;
                    }
                }
            }
        }


        // Second try assign it a grove port
        if (!sensor.port) {
            var sensorDefinition = sensorHandler.findSensorDefinition(sensor);
            var pluggable = sensorDefinition.pluggable;

            if (sensorDefinition.subTypes) {
                for (var iSubTypes = 0; iSubTypes < sensorDefinition.subTypes.length; iSubTypes++) {
                    var subTypeDefinition = sensorDefinition.subTypes[iSubTypes];
                    if (pluggable || subTypeDefinition.pluggable) {
                        var ports = board.portTypes[sensorDefinition.portType];
                        for (var iPorts = 0; iPorts < ports.length; iPorts++) {
                            var port = sensorDefinition.portType;
                            if (sensorDefinition.portType != "i2c")
                                port = sensorDefinition.portType + ports[iPorts];
                            if (!findSensorByPort(port)) {
                                sensor.port = port;

                                if (!sensor.subType)
                                    sensor.subType = subTypeDefinition.subType;
                                return;
                            }
                        }
                    }
                }
            } else {
                if (pluggable) {
                    var ports = board.portTypes[sensorDefinition.portType];
                    for (var iPorts = 0; iPorts < ports.length; iPorts++) {
                        var port = sensorDefinition.portType + ports[iPorts];
                        if (!findSensorByPort(port)) {
                            sensor.port = port;
                            return;
                        }
                    }
                }
            }
        }
    }

    context.resetSensors = function() {
        for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
            var sensor = infos.quickPiSensors[iSensor];
            if (context.sensorsSaved[sensor.name] && !context.autoGrading) {
                var save = context.sensorsSaved[sensor.name];
                reloadSensorFullState(sensor, save);
            } else {
                sensor.state = null;
                sensor.screenDrawing = null;
                sensor.lastDrawnTime = 0;
                sensor.lastDrawnState = null;
                sensor.callsInTimeSlot = 0;
                sensor.lastTimeIncrease = 0;
                sensor.removed = false;
                sensor.quickStore = null;
            }
            if (sensor.name == "gyroscope")
                sensor.rotationAngles = undefined;
        }
    };
    
    context.reset = function (taskInfos) {
        buzzerSound.stopAll();

        context.alreadyHere = true;

        context.failImmediately  = null;

        if (!context.offLineMode) {
            $('#piinstallcheck').hide();
            context.quickPiConnection.startNewSession();
            context.resetSensorTable();
        }

        context.currentTime = 0;
        if (taskInfos != undefined) {
            context.actualStatesBySensor = {};
            context.tickIncrease = 100;
            context.autoGrading = taskInfos.autoGrading;
            context.loopsForever = taskInfos.loopsForever;
            context.allowInfiniteLoop = !context.autoGrading;
            if (context.autoGrading) {
                context.maxTime = 0;

                if (taskInfos.input)
                {
                    for (var i = 0; i < taskInfos.input.length; i++)
                    {
                        taskInfos.input[i].input = true;
                    }
                    context.gradingStatesByTime = taskInfos.input.concat(taskInfos.output);
                }
                else {
                    context.gradingStatesByTime = taskInfos.output;
                }

                // Copy states to avoid modifying the taskInfos states
                context.gradingStatesByTime = context.gradingStatesByTime.map(
                    function(val) {
                        return Object.assign({}, val);
                    });

                context.gradingStatesByTime.sort(function (a, b) { return a.time - b.time; });

                context.gradingStatesBySensor = {};

                for (var i = 0; i < context.gradingStatesByTime.length; i++) {
                    var state = context.gradingStatesByTime[i];

                    if (!context.gradingStatesBySensor.hasOwnProperty(state.name))
                        context.gradingStatesBySensor[state.name] = [];

                    context.gradingStatesBySensor[state.name].push(state);
//                    state.hit = false;
//                    state.badonce = false;

                    if (state.time > context.maxTime)
                        context.maxTime = state.time;
                }


                for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                    var sensor = infos.quickPiSensors[iSensor];
                    
                    if (sensor.type == "buzzer") {
                        var states = context.gradingStatesBySensor[sensor.name];

                        if (states) {
                            for (var iState = 0; iState < states.length; iState++) {
                                var state = states[iState].state;
                                
                                if (typeof state == 'number' &&
                                        state != 0 &&
                                        state != 1) {
                                    sensor.showAsAnalog = true;
                                    break;
                                }
                            }
                        }
                    }

                    var isAnalog = sensorHandler.findSensorDefinition(sensor).isAnalog || sensor.showAsAnalog;

                    if (isAnalog) {
                        sensor.maxAnalog = Number.MIN_VALUE;
                        sensor.minAnalog = Number.MAX_VALUE;

                        if (context.gradingStatesBySensor.hasOwnProperty(sensor.name)) {
                            var states = context.gradingStatesBySensor[sensor.name];

                            for (var iState = 0; iState < states.length; iState++) {
                                var state = states[iState];

                                if (state.state > sensor.maxAnalog)
                                    sensor.maxAnalog = state.state;
                                if (state.state < sensor.minAnalog)
                                    sensor.minAnalog = state.state;
                            }
                        }
                    }

                    if (sensor.type == "screen") {
                        var states = context.gradingStatesBySensor[sensor.name];

                        if (states) {
                            for (var iState = 0; iState < states.length; iState++) {
                                var state = states[iState];
                                if (state.state.isDrawingData)
                                    sensor.isDrawingScreen = true;
                            }
                        }
                    }
                }
            }


            if (infos.quickPiSensors == "default")
            {
                infos.quickPiSensors = [];
                addDefaultBoardSensors();
            }
        }

        context.success = false;
        if (context.autoGrading)
            context.doNotStartGrade = false;
        else
            context.doNotStartGrade = true;

        if (paper && context.autoGrading && context.display) {
            if (context.sensorStates)
                context.sensorStates.remove();
            context.sensorStates = paper.set();
        }
    

        context.resetSensors();

        for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
            var sensor = infos.quickPiSensors[iSensor];

            // If the sensor has no port assign one
            if (!sensor.port) {
                sensorAssignPort(sensor);
            }
        }

        if (context.display) {
            context.recreateDisplay = true;
            context.displayAutoGrading = context.autoGrading;
            context.timeLineStates = [];
            context.resetDisplay();
        } else {

            context.success = false;
        }

        // Needs display to be reset before calling registerQuickPiEvent
        for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
            var sensor = infos.quickPiSensors[iSensor];

            // Set initial state
            var sensorDef = sensorHandler.findSensorDefinition(sensor);
            if(sensorDef && !sensorDef.isSensor && sensorDef.getInitialState) {
                var initialState = sensorDef.getInitialState(sensor);
                if (initialState != null)
                    context.registerQuickPiEvent(sensor.name, initialState, true, true);
            }
        }

        startSensorPollInterval();
    };

    function clearSensorPollInterval() {
        if(context.sensorPollInterval) {
            clearInterval(context.sensorPollInterval);
            context.sensorPollInterval = null;
        }
    };

    function startSensorPollInterval() {
        // Start polling the sensors on the raspberry if the raspberry is connected

        clearSensorPollInterval();

        context.liveUpdateCount = 0;

        if(!context.quickPiConnection.isConnected()) { return; }

        context.sensorPollInterval = setInterval(function () {
            if((context.runner && context.runner.isRunning())
                || context.offLineMode
                || context.liveUpdateCount != 0
                || context.stopLiveUpdate) { return; }

            context.quickPiConnection.startTransaction();

            for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                var sensor = infos.quickPiSensors[iSensor];

                updateLiveSensor(sensor);
            }

            context.quickPiConnection.endTransaction();
        }, 200);
    };

    function updateLiveSensor(sensor) {
        if (sensorHandler.findSensorDefinition(sensor).isSensor && sensorHandler.findSensorDefinition(sensor).getLiveState) {
            context.liveUpdateCount++;

            //console.log("updateLiveSensor " + sensor.name, context.liveUpdateCount);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function (returnVal) {
                context.liveUpdateCount--;

                //console.log("updateLiveSensor callback" + sensor.name, context.liveUpdateCount);

                if (!sensor.removed) {
                    sensor.state = returnVal;
                    drawSensor(sensor);
                }
            });
        }
    }

    context.changeBoard = function(newboardname)
    {
        if (context.board == newboardname)
            return;

        var board = null;
        for (var i = 0; i < boardDefinitions.length; i++) {
            board = boardDefinitions[i];

            if (board.name == newboardname)
                break;
        }

        if (board == null)
            return;

        context.board = newboardname;
        setSessionStorage('board', newboardname);

        if (infos.customSensors) {
            for (var i = 0; i < infos.quickPiSensors.length; i++) {
                var sensor = infos.quickPiSensors[i];
                sensor.removed = true;
            }
            infos.quickPiSensors = [];

            if (board.builtinSensors) {
                for (var i = 0; i < board.builtinSensors.length; i++) {
                    var sensor = board.builtinSensors[i];

                    var newSensor = {
                        "type": sensor.type,
                        "port": sensor.port,
                        "builtin": true,
                    };

                    if (sensor.subType) {
                        newSensor.subType = sensor.subType;
                    }

                    newSensor.name = getSensorSuggestedName(sensor.type, sensor.suggestedName);

                    sensor.state = null;
                    sensor.callsInTimeSlot = 0;
                    sensor.lastTimeIncrease = 0;

                    infos.quickPiSensors.push(newSensor);
                }
            }
        } else {
            for (var i = 0; i < infos.quickPiSensors.length; i++) {
                var sensor = infos.quickPiSensors[i];
                sensorAssignPort(sensor);
            }
        }

        context.resetSensorTable();
        context.reset();
    };



    context.board = "quickpi";

    if (getSessionStorage('board'))
        context.changeBoard(getSessionStorage('board'));

    /**
     * This method allow us to save the sensors inside of the variable additional.
     * If other things must be saved from quickPi later, it can be saved inside of this variable.
     * @param additional The additional object saved inside of the xml
     */
    context.saveAdditional = function(additional) {
        // we don't need to save sensors if user can't modify them
        if (!infos.customSensors)
            return;

        additional.quickpiSensors = [];
        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var currentSensor = infos.quickPiSensors[i];
            var savedSensor = {
                type: currentSensor.type,
                port: currentSensor.port,
                name: currentSensor.name
            };
            if (currentSensor.subType)
                savedSensor.subType = currentSensor.subType;
            additional.quickpiSensors.push(savedSensor);
        }
    };

    /**
     * This function loads all additional stuff from the object "additional" for quickpi.
     * For now on it only loads the sensor
     * @param additional The additional variable which contains the sensors
     */
    context.loadAdditional = function(additional) {
        // we load sensors only if custom sensors is available
        if (!infos.customSensors)
            return;

        var newSensors = additional.quickpiSensors;

        // we don't verify if sensors are empty or not, because if they are it is maybe meant this
        // way by the user
        if (!newSensors)
            return;

        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];
            sensor.removed = true;
        }

        infos.quickPiSensors = [];

        for (var i = 0; i < newSensors.length; i++) {
            var sensor = {
                type: newSensors[i].type,
                port: newSensors[i].port,
                name: newSensors[i].name
            };

            if (newSensors[i].subType)
                sensor.sybType = newSensors[i].subType;

            sensor.state = null;
            sensor.callsInTimeSlot = 0;
            sensor.lastTimeIncrease = 0;

            infos.quickPiSensors.push(sensor);
        }
        // console.log(infos.quickPiSensors)

        context.recreateDisplay = true;
        this.resetDisplay();
    };

    context.resetDisplay = function() {
        // console.log("resetDisplay")
        if (!context.display || !this.raphaelFactory)
            return;


        context.autoGrading = context.displayAutoGrading;

        if (context.recreateDisplay || !paper)
        {
            context.createDisplay();
            context.recreateDisplay = false;
        }

        paper.setSize(($('#virtualSensors').width() * context.quickPiZoom), $('#virtualSensors').height());
        if(context.infos.quickPiBoard) {
            $('#virtualBoard').height($('#virtualSensors').height());
        }

        var area = paper.width * paper.height;
        context.compactLayout = false;
        if (area < 218700)
        {
            context.compactLayout = true;
        }        

        if (context.sensorDivisions) {
            context.sensorDivisions.remove();
        }

        context.sensorDivisions = paper.set();

        // Fix this so we don't have to recreate this.
        if (context.timeLineCurrent)
        {
            context.timeLineCurrent.remove();
            context.timeLineCurrent = null;
        }

        if (context.timeLineCircle)
        {
            context.timeLineCircle.remove();
            context.timeLineCircle = null;
        }

        if (context.timeLineTriangle) {
            context.timeLineTriangle.remove();
            context.timeLineTriangle = null;
        }

        if (context.autoGrading) {
            if (context.sensorStates)
                context.sensorStates.remove();
            context.sensorStates = paper.set();
            //paper.clear(); // Do this for now.

            var numSensors = infos.quickPiSensors.length;
            var sensorSize = Math.min(paper.height / numSensors * 0.80, $('#virtualSensors').width() / 10);

            //var sensorSize = Math.min(paper.height / (numSensors + 1));


            context.timeLineSlotHeight = Math.min(paper.height / (numSensors + 1));
            context.sensorSize = sensorSize * .90;

            context.timelineStartx = context.sensorSize * 3;

            var maxTime = context.maxTime;
            if (maxTime == 0)
                maxTime = 1000;

            if (!context.loopsForever)
                maxTime = Math.floor(maxTime * 1.05);

            context.pixelsPerTime = (paper.width - context.timelineStartx - 30) / maxTime;

            context.timeLineY = 25 + (context.timeLineSlotHeight * (infos.quickPiSensors.length));
            

            var color = true;

            for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                var sensor = infos.quickPiSensors[iSensor];

                sensor.drawInfo = {
                    x: 0,
                    y: 10 + (context.timeLineSlotHeight * iSensor),
                    width: sensorSize * .90,
                    height: sensorSize * .90
                };

                var rect = paper.rect(0, sensor.drawInfo.y, paper.width, context.timeLineSlotHeight);

                rect.attr({
                        "fill": color ? "#0000FF" : "#00FF00",
                        "stroke": "none",
                        "opacity": 0.03,
                    });
                context.sensorDivisions.push(rect);
                color = !color;
            }

            drawTimeLine();

            for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                var sensor = infos.quickPiSensors[iSensor];

                drawSensor(sensor);
                sensor.timelinelastxlabel = 0;

                if (context.gradingStatesBySensor.hasOwnProperty(sensor.name)) {
                    var states = context.gradingStatesBySensor[sensor.name];
                    var startTime = 0;
                    var lastState = null;
                    sensor.lastAnalogState = null;

                    for (var iState = 0; iState < states.length; iState++) {
                        var state = states[iState];

                        drawSensorTimeLineState(sensor, lastState, startTime, state.time, "expected", true);

                        startTime = state.time;
                        lastState = state.state;
                    }

                    drawSensorTimeLineState(sensor, lastState, state.time, context.maxTime, "expected", true);
                    
                    if (!context.loopsForever)
                        drawSensorTimeLineState(sensor, lastState, startTime, maxTime, "finnish", false);

                    sensor.lastAnalogState = null;
                }
            }


            for (var iState = 0; iState < context.timeLineStates.length; iState++) {
                var timelinestate = context.timeLineStates[iState];

                drawSensorTimeLineState(timelinestate.sensor,
                    timelinestate.state,
                    timelinestate.startTime,
                    timelinestate.endTime,
                    timelinestate.type,
                    true);
            }
        } else {
            var nSensors = infos.quickPiSensors.length;

            infos.quickPiSensors.forEach(function (sensor) {
                var cellsAmount = sensorHandler.findSensorDefinition(sensor).cellsAmount;
                if (cellsAmount) {
                    nSensors += cellsAmount(paper) - 1;
                }
            });

            if (nSensors < 4)
                nSensors = 4;

            var geometry = null;
            if (context.compactLayout)
                // geometry = squareSize(paper.width, paper.height, nSensors, 2);
                geometry = squareSize(paper.width, paper.height, nSensors, 1.5);
            else
                geometry = squareSize(paper.width, paper.height, nSensors, 1);
            
            // console.log(geometry)
            var nbRows = geometry.rows;
            var nbCol = geometry.cols;
            var cellW = paper.width / nbCol;

            // context.sensorSize = geometry.size * .10;
            reorganizeSensors(geometry);

            var lineAttr = {
                "stroke-width": 1,
                "stroke": "black",
                opacity: 0.1
            };
            var x1 = cellW*0.2;
            var x2 = paper.width - cellW*0.2;
            var iSensor = 0;
            for (var row = 0; row < nbRows; row++) {
                var y = geometry.size * row;
                
                if(row > 0){
                    var line = paper.path(["M", x1,y,"L", x2,y]);
                    context.sensorDivisions.push(line);
                    line.attr(lineAttr);
                }

                for (var col = 0; col < nbCol; col++) {
                    var x = cellW * col;
                    // var y1 = y + geometry.size / 4;
                    var y1 = y;
                    // var y2 = y + geometry.size * 3 / 4;
                    var y2 = y + geometry.size;
                    var cells = 1;
                    var sensor = infos.quickPiSensors[iSensor];
                    var foundsize = 0;

                    var cellsAmount = null;
                    if (sensor)
                         cellsAmount = sensorHandler.findSensorDefinition(sensor).cellsAmount;

                    if (cellsAmount)
                        cells = cellsAmount(paper);

                    // Particular case if we have a screen and only 2 columns, we can put the
                    // cells of the screen at 2 because the display is still good with it.
                    // I used rows, because I think that for geometry, rows and cols are reversed. You can try to change
                    // it and see the result in animal connecte.
                    if (sensor && sensor.type === "screen" && cells > nbCol && cells == 3 && nbCol == 2)
                        cells = 2;

                    if(col > 0){
                        var line = paper.path(["M", x, y1, "V", y2]).attr(lineAttr);
                        context.sensorDivisions.push(line);
                    }

                    var foundcols = false;
                    var bump = false;

                    while (!foundcols && !bump)
                    {
                        var colsleft = nbCol - col;
                        if (cells > colsleft)
                        {
                            for (var iNewSensor = iSensor + 1; iNewSensor < infos.quickPiSensors.length; iNewSensor++)
                            {
                                var newSensor = infos.quickPiSensors[iNewSensor];
                                // if(newSensor.type == "adder")
                                    // continue

                                cells = 1;
                                cellsAmount = sensorHandler.findSensorDefinition(newSensor).cellsAmount;
                                
                                if (cellsAmount)
                                    cells = cellsAmount(paper);

                                if (cells == 1)
                                {
                                    infos.quickPiSensors[iNewSensor] = sensor;
                                    infos.quickPiSensors[iSensor] = newSensor;
                                    sensor = newSensor;
                                    foundcols = true;
                                    break;
                                }
                            }
                            bump = true;
                        }
                        else
                        {
                            foundcols = true;
                        }
                    }

                    if (bump)
                        continue;


                    if (iSensor == infos.quickPiSensors.length && infos.customSensors) {
                        // drawCustomSensorAdder(x, y, cellW * cells, geometry.size);
                        // drawCustomSensorAdder(x, y, geometry.size);
                    } else if (infos.quickPiSensors[iSensor]) {                        
                        col += cells - 1;

                        sensor.drawInfo = {
                                x: x,
                                y: y,
                                width: cellW * cells,
                                height: geometry.size,
                        }

                        drawSensor(sensor);
                    }
                    iSensor++;
                }
            }
        }
    }

    function reorganizeSensors(geo) {
        // console.log(geo)
        // var nbRows = geo.rows;
        // var nbCol = geo.cols;
        // var newSensors = [];
        // var sensors = Beav.Object.clone(infos.quickPiSensors);
        //  sensors.map()
        // var row = 0, col = 0;
        // do{
        //     for(var sen of sensors)
        // }while(newSensors.length < infos.quickPiSensors.length)
    }

    // Reset the context's display
    context.createDisplay = function () {
        // Do something here
        //$('#grid').html('Display for the library goes here.');

        // Ask the parent to update sizes
        //context.blocklyHelper.updateSize();
        //context.updateScale();

        if (!context.display || !this.raphaelFactory)
            return;


        var connectionHTML = 
        "<div id=\"piui\" class='hide' >" +
        // "   <button type=\"button\" id=\"piconnect\" class=\"btn\">" +
        // // "       <span class=\"fa fa-wifi\"></span><span id=\"piconnecttext\" class=\"btnText\">" + strings.messages.connect + "</span> " +
        // "       <span class=\"fas fa-exchange-alt\"></span><span id=\"piconnecttext\" class=\"btnText\">" + strings.messages.connect + "</span> " +
        // "   </button>" +
        // "   <span id=\"piinstallui\">" +
        // "       <span class=\"fa fa-exchange-alt\"></span>" +
        // "       <button type=\"button\" id=\"piinstall\" class=\"btn\">" +
        // "           <span class=\"fa fa-upload\"></span><span>" + strings.messages.install + "</span><span id=piinstallprogresss class=\"fas fa-spinner fa-spin\"></span><span id=\"piinstallcheck\" class=\"fa fa-check\"></span>" +
        // "       </button>" +
        // "   </span>" +
        "   <div id=\"dropdown_menu\">"+
        "       <span class='menu_line' id='toggle_menu'><span class=\"fas fa-exchange-alt\"></span><span class='label'>"+strings.messages.simulator+"</span></span>"+
        "       <span class='menu_line clickable' id='simulator'><span class=\"fas fa-desktop\"></span><span class='label'>"+strings.messages.simulator+"</span></span>"+
        "       <span class='menu_line clickable' id='remote_control'><span class=\"fas fa-plug\"></span><span class='label'>"+strings.messages.remoteControl+"</span></span>"+
        "       <span class='menu_line clickable' id='install'><span class=\"fas fa-upload\"></span><span class='label'>"+strings.messages.install+"</span></span>"+
        "   </div>"+

        "   <span id=\"pichangehatui\">" +
        "       <button type=\"button\" id=\"pichangehat\" class=\"btn\">" +
        // "           <span class=\"fas fa-hat-wizard\"></span><span>" + strings.messages.changeBoard + "</span></span></span>" +
        "           <span class=\"fas fa-cog\"></span>"+
        "       </button>" +
        // "       <button type=\"button\" id=\"pihatsetup\" class=\"btn\">" +
        // "           <span class=\"fas fa-cog\"></span><span>" + strings.messages.config + "</span></span></span>" +
        // "       </button>" +
        "   </span>" +
        "</div>";

        var piUi = getQuickPiOption('disableConnection') ? '' : connectionHTML;

        var hasIntroControls = $('#taskIntro').find('#introControls').length;
        if (!hasIntroControls) {
            $('#taskIntro').append("<div id=\"introControls\"></div>");
        }
        $('#introControls').html(piUi);
        $('#taskIntro').addClass('piui');

        $('#grid').html("<div id=\"virtualBoard\"></div><div id=\"virtualSensors\" style=\"height: 100%; width: 100%;\">"
          + "</div>");


        if (!context.quickPiZoom || !context.autoGrading)
            context.quickPiZoom = 1;

        if(["galaxia", "microbit"].includes(context.infos.quickPiBoard)) {
            $('#grid').css('display', 'flex');
            if(context.infos.quickPiBoard == "microbit") {
                $('#grid').css('flex-direction', 'column');
                $('#virtualBoard')
                  .css('flex', '0 0 200px')
                  .css('height', '200px')
            } else {
                $('#virtualBoard')
                  .css('flex', '1 0 40%')
                  .css('margin-right', '20px')
            }
            function onUserEvent(sensorName, state) {
                var sensor = sensorHandler.findSensorByName('button ' + sensorName);
                if(!sensor) { return; }
                sensor.state = state;
                warnClientSensorStateChanged(sensor);
                drawSensor(sensor);
            }

            context.sensorStateListener = mainBoard.init('#virtualBoard', onUserEvent);
        }

        this.raphaelFactory.destroyAll();
        paper = this.raphaelFactory.create(
                "paperMain",
                "virtualSensors",
                ($('#virtualSensors').width() * context.quickPiZoom),
                $('#virtualSensors').height()
        );

            if (context.autoGrading) {
                $('#virtualSensors').css("overflow-y", "hidden");
                $('#virtualSensors').css("overflow-x", "auto");

                // Allow horizontal zoom on grading
                paper.canvas.onwheel = function(event) {
                        var originalzoom = context.quickPiZoom;
                        context.quickPiZoom += event.deltaY * -0.001;
                    
                        if (context.quickPiZoom < 1)
                            context.quickPiZoom = 1;
    
                        if (originalzoom != context.quickPiZoom)
                            context.resetDisplay();
                };                

                $('#virtualSensors').scroll(function(event) {
                    for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                        var sensor = infos.quickPiSensors[iSensor];

                        drawSensor(sensor);
                    }
                });        
            }
            else
            {
                $('#virtualSensors').css("overflow-y", "hidden");
                $('#virtualSensors').css("overflow", "hidden");
            }
        

        if (infos.quickPiSensors == "default")
        {
            infos.quickPiSensors = [];
            addDefaultBoardSensors();
        }

        if (context.blocklyHelper) {
            context.blocklyHelper.updateSize();
        }

        context.inUSBConnection = false;
        context.inBTConnection = false;
        context.releasing = false;
        context.offLineMode = true;

        showasReleased();

        if (context.quickPiConnection.isConnecting()) {
            showasConnecting(context);
        }

        if (context.quickPiConnection.isConnected()) {
            showasConnected();

            context.offLineMode = false;
        }

        const showConfigSettings = {
            context,
            strings,
            mainBoard,
        };

        var showMenu = false;
        $('#toggle_menu, #simulator').click(function() {
            showMenu = !showMenu;
            updateMenu();
        });
        $("#dropdown_menu #remote_control").click(function() {
            if(!context.quickPiConnection.isConnected()) { 
                showConfig(showConfigSettings);
            }else{
                showasConnected();
                context.offLineMode = false;
            }
        });
        $("#dropdown_menu #install").click(function() {
            if(!context.quickPiConnection.isConnected()) { 
                showConfig(showConfigSettings);
            }else{
                context.blocklyHelper.reportValues = false;

                var python_code = context.generatePythonSensorTable();
                python_code += "\n\n";
                python_code += window.task.displayedSubTask.blocklyHelper.getCode('python');

                python_code = python_code.replace("from quickpi import *", "");

                if (context.runner)
                    context.runner.stop();

                context.installing = true;
                $('#piinstallprogresss').show();
                $('#piinstallcheck').hide();

                context.quickPiConnection.installProgram(python_code, function () {
                    context.justinstalled = true;
                    $('#piinstallprogresss').hide();
                    $('#piinstallcheck').show();
                });
            }
        });
        $('#pichangehat').click(() => {
            showConfig(showConfigSettings);
        });

        function updateMenu() {
            if(showMenu){
                $("#piui").addClass("show");
                $("#piui").removeClass("hide");
            }else{
                $("#piui").addClass("hide");
                $("#piui").removeClass("show");
            }
        };

        // $('#pichangehat').click(function () {
        //     console.log("chooseBoard")
        //     window.displayHelper.showPopupDialog("<div class=\"content connectPi qpi\">" +
        //         "   <div class=\"panel-heading\">" +
        //         "       <h2 class=\"sectionTitle\">" +
        //         "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
        //                     strings.messages.chooseBoard +
        //         "       </h2>" +
        //         "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
        //         "   </div>" +
        //         "   <div class=\"panel-body\">" +
        //         "       <div id=boardlist>" +
        //         "       </div>" +
        //         "       <div panel-body-usbbt>" +
        //         "           <label id=\"piconnectionlabel\"></label>" +
        //         "       </div>" +
        //         "   </div>" +
        //         "</div>");

        //     $('#picancel').click(function () {
        //         $('#popupMessage').hide();
        //         window.displayHelper.popupMessageShown = false;
        //     });


        //     for (var i = 0; i < boardDefinitions.length; i++) {
        //         let board = boardDefinitions[i];
        //         var image = document.createElement('img');
        //         image.src = getImg(board.image);

        //         $('#boardlist').append(image).append("&nbsp;&nbsp;");

        //         image.onclick = function () {
        //             $('#popupMessage').hide();
        //             window.displayHelper.popupMessageShown = false;

        //             context.changeBoard(board.name);
        //         }
        //     }
        // });


        $('#pihatsetup').click(function () {

                window.displayHelper.showPopupDialog("<div class=\"content connectPi qpi\">" +
                    "   <div class=\"panel-heading\">" +
                    "       <h2 class=\"sectionTitle\">" +
                    "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
                                strings.messages.nameandports +
                    "       </h2>" +
                    "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
                    "   </div>" +
                    "   <div class=\"panel-body\">" +
                    "       <table id='sensorTable' style=\"display:table-header-group;\">" +
                    "           <tr>" +
                    "               <th>" + strings.messages.name + "</th>" +
                    "               <th>" + strings.messages.port + "</th>" +
                    "               <th>" + strings.messages.state + "</th>" +
                    "           </tr>" +
                    "       </table>" +
                    "   <!--" +
                    "       <div>" +
                    "           <input type=\"checkbox\" id=\"buzzeraudio\" value=\"buzzeron\"> Output audio trought audio buzzer<br>" +
                    "       </div>" +
                    "       <div class=\"inlineButtons\">" +
                    "           <button id=\"pisetupok\" class=\"btn\"><i class=\"fas fa-cog icon\"></i>Set</button>" +
                    "       </div>" +
                    "   -->" +
                    "   </div>" +
                    "</div>", function () {
                    var table = document.getElementById("sensorTable");
                    for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                        var sensor = infos.quickPiSensors[iSensor];

                        function addNewRow()
                        {
                            var row = table.insertRow();
                            var type = row.insertCell();
                            var name = row.insertCell();
                            var port = row.insertCell();

                            return [type, name, port];
                        }


                        if (sensor.type == "stick")
                        {
                            var gpios = sensorHandler.findSensorDefinition(sensor).gpios;
                            var cols = addNewRow();

                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name + ".up"));
                            cols[2].appendChild(document.createTextNode("D" + gpios[0]));

                            var cols = addNewRow();

                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name + ".down"));
                            cols[2].appendChild(document.createTextNode("D" + gpios[1]));
                            var cols = addNewRow();

                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name + ".left"));
                            cols[2].appendChild(document.createTextNode("D" + gpios[2]));
                            var cols = addNewRow();

                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name + ".right"));
                            cols[2].appendChild(document.createTextNode("D" + gpios[3]));
                            var cols = addNewRow();

                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name + ".center"));
                            cols[2].appendChild(document.createTextNode("D" + gpios[4]));

    /*
                            $('#stickupname').text(sensor.name + ".up");

                            $('#stickdownname').text(sensor.name + ".down");
                            $('#stickleftname').text(sensor.name + ".left");
                            $('#stickrightname').text(sensor.name + ".right");
                            $('#stickcentername').text(sensor.name + ".center");

                            $('#stickupport').text("D" + gpios[0]);
                            $('#stickdownport').text("D" + gpios[1]);
                            $('#stickleftport').text("D" + gpios[2]);
                            $('#stickrightport').text("D" + gpios[3]);
                            $('#stickcenterport').text("D" + gpios[4]);

                            $('#stickupstate').text(sensor.state[0] ? "ON" : "OFF");
                            $('#stickdownstate').text(sensor.state[1] ? "ON" : "OFF");
                            $('#stickleftstate').text(sensor.state[2] ? "ON" : "OFF");
                            $('#stickrightstate').text(sensor.state[3] ? "ON" : "OFF");
                            $('#stickcenterstate').text(sensor.state[4] ? "ON" : "OFF");
        */
                        }
                        else
                        {
                            var cols = addNewRow();


                            cols[0].appendChild(document.createTextNode(sensor.type));
                            cols[1].appendChild(document.createTextNode(sensor.name));
                            cols[2].appendChild(document.createTextNode(sensor.port));
                        }

                    }

                    $('#picancel').click(function () {
                        $('#popupMessage').hide();
                        window.displayHelper.popupMessageShown = false;
                    });
                });
        });

        function installPythonCode(code) {
            if (context.runner)
                context.runner.stop();

            context.installing = true;
            $('#piinstallprogresss').show();
            $('#piinstallcheck').hide();

            context.quickPiConnection.installProgram(code, function () {
                context.justinstalled = true;
                $('#piinstallprogresss').hide();
                $('#piinstallcheck').show();
            });
        }

        $('#piinstall').click(function () {
            context.blocklyHelper.reportValues = false;

            var python_code = context.generatePythonSensorTable();
            python_code += "\n\n";
            if(context.blocklyHelper.getCode) {
                python_code += context.blocklyHelper.getCode('python');
                python_code = python_code.replace("from quickpi import *", "");
                installPythonCode(python_code);
            } else {
                window.task.getAnswer(function (answer) {
                    python_code += JSON.parse(answer).easy.document.lines.join("\n");
                    python_code = python_code.replace("from quickpi import *", "");
                    installPythonCode(python_code);
                });
            }
        });


        if (parseInt(getSessionStorage('autoConnect'))) {
            if (!context.quickPiConnection.isConnected() && !context.quickPiConnection.isConnecting()) {
                $('#piconnect').attr('disabled', 'disabled');
                context.quickPiConnection.connect(getSessionStorage('quickPiUrl'));
            }
        }
    };

    function warnClientSensorStateChanged(sensor) {
        var sensorStateCopy = JSON.parse(JSON.stringify(sensor.state));
        if (context.dispatchContextEvent) {
            context.dispatchContextEvent({type: 'quickpi/changeSensorState', payload: [sensor.name, sensorStateCopy], onlyLog: true});
        }
    }

    function addDefaultBoardSensors() {
        var board = mainBoard.getCurrentBoard(context.board);
        var boardDefaultSensors = board.default;

        if (!boardDefaultSensors)
            boardDefaultSensors = board.builtinSensors;

        if (boardDefaultSensors)
        {
            for (var i = 0; i < boardDefaultSensors.length; i++) {
                var sensor = boardDefaultSensors[i];

                var newSensor = {
                    "type": sensor.type,
                    "port": sensor.port,
                    "builtin": true,
                };

                if (sensor.subType) {
                    newSensor.subType = sensor.subType;
                }

                newSensor.name = getSensorSuggestedName(sensor.type, sensor.suggestedName);

                sensor.state = null;
                sensor.callsInTimeSlot = 0;
                sensor.lastTimeIncrease = 0;

                infos.quickPiSensors.push(newSensor);
            }

            var newSensor = {
                type: "cloudstore",
                name: "cloud1",
                port: "D5"
            };
            infos.quickPiSensors.push(newSensor);
        }
        if(infos.customSensors){
            // infos.quickPiSensors.push({
            //     type: "adder",
            //     name: ""
            // })
        }
        // console.log(infos.quickPiSensors)

    }

    function drawCustomSensorAdder(x, y, w, h, fontsize) {
        if (context.sensorAdder) {
            context.sensorAdder.remove();
        }
        // paper.rect(x,y,size,size)
        var r = Math.min(w,h)*0.2;
        var cx = x + w / 2;
        var cy = y + h*0.4;
        var plusSize = r*0.8;
        var x1 = cx - plusSize/2;
        var x2 = cx + plusSize/2;
        var y1 = cy - plusSize/2;
        var y2 = cy + plusSize/2;
        var yText = y + h - (h/2 - r)/2;
        // var fontsize = h * .15;
        var sSize1 = 2*h/100;
        var sSize2 = 3*h/100;
        // console.log(h)

        var circ = paper.circle(cx,cy,r).attr({
            stroke: colors.blue,
            "stroke-width": sSize1,
            fill: "white"
        });
        var plus = paper.path(["M",cx,y1,"V",y2,"M",x1,cy,"H",x2]).attr({
            stroke: colors.blue,
            "stroke-width": sSize2,
            "stroke-linecap": "round"
        });
        var text = paper.text(cx,yText,strings.messages.add).attr({
            "font-size": fontsize,
            "font-weight": "bold",
            fill: colors.blue
        });
        var rect = paper.rect(x,y,w,h).attr({
            stroke: "none",
            fill: "red",
            opacity: 0
        });
        // context.sensorAdder = paper.text(cx, cy, "+");
        context.sensorAdder = paper.set(circ,plus,text,rect);

        // context.sensorAdder.attr({
        //     "font-size": fontsize + "px",
        //     fill: "lightgray"
        // });
        // context.sensorAdder.node.style = "-moz-user-select: none; -webkit-user-select: none;";

        context.sensorAdder.click(clickAdder);

        //     window.displayHelper.showPopupDialog("<div class=\"content qpi\">" +
        //         "   <div class=\"panel-heading\">" +
        //         "       <h2 class=\"sectionTitle\">" +
        //         "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
        //                     strings.messages.addcomponent +
        //         "       </h2>" +
        //         "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
        //         "   </div>" +
        //         "   <div id=\"sensorPicker\" class=\"panel-body\">" +
        //         "       <label>" + strings.messages.selectcomponent + "</label>" +
        //         "       <div class=\"flex-container\">" +
        //         "           <div id=\"selector-image-container\" class=\"flex-col half\">" +
        //         "               <img id=\"selector-sensor-image\">" +
        //         "           </div>" +
        //         "           <div class=\"flex-col half\">" +
        //         "               <div class=\"form-group\">" +
        //         "                   <div class=\"input-group\">" +
        //         "                       <select id=\"selector-sensor-list\" class=\"custom-select\"></select>" +
        //         "                   </div>" +
        //         "              </div>" +
        //         "              <div class=\"form-group\">" +
        //         "                   <div class=\"input-group\">" +
        //         "                       <select id=\"selector-sensor-port\" class=\"custom-select\"></select>" +
        //         "                   </div>" +
        //         "                   <label id=\"selector-label\"></label>" +
        //         "               </div>" +
        //         "           </div>" +
        //         "       </div>" +
        //         "   </div>" +
        //         "   <div class=\"singleButton\">" +
        //         "       <button id=\"selector-add-button\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + strings.messages.add + "</button>" +
        //         "   </div>" +
        //         "</div>");

        //     var select = document.getElementById("selector-sensor-list");
        //     for (var iSensorDef = 0; iSensorDef < sensorDefinitions.length; iSensorDef++) {
        //         var sensorDefinition = sensorDefinitions[iSensorDef];

        //         if (sensorDefinition.subTypes) {
        //             for (var iSubType = 0; iSubType < sensorDefinition.subTypes.length; iSubType++) {

        //                 if (!sensorDefinition.pluggable && !sensorDefinition.subTypes[iSubType].pluggable)
        //                     continue;


        //                 var el = document.createElement("option");
        //                 el.textContent = sensorDefinition.description;

        //                 if (sensorDefinition.subTypes[iSubType].description)
        //                     el.textContent = sensorDefinition.subTypes[iSubType].description;

        //                 el.value = sensorDefinition.name;
        //                 el.value += "-" + sensorDefinition.subTypes[iSubType].subType;
        //                 select.appendChild(el);
        //             }
        //         } else {
        //             if (!sensorDefinition.pluggable)
        //                 continue;

        //             var el = document.createElement("option");
        //             el.textContent = sensorDefinition.description;
        //             el.value = sensorDefinition.name;

        //             select.appendChild(el);
        //         }
        //     }

        //     var board = mainBoard.getCurrentBoard(context.board);
        //     if (board.builtinSensors) {
        //         for (var i = 0; i < board.builtinSensors.length; i++) {
        //             var sensor = board.builtinSensors[i];
        //             var sensorDefinition = sensorHandler.findSensorDefinition(sensor);

        //             if (context.findSensor(sensor.type, sensor.port, false))
        //                 continue;

        //             var el = document.createElement("option");

        //             el.textContent = sensorDefinition.description + strings.messages.builtin;
        //             el.value = sensorDefinition.name + "-";

        //             if (sensor.subType)
        //                 el.value += sensor.subType;

        //             el.value += "-" + sensor.port;

        //             select.appendChild(el);
        //         }
        //     }

        //     $('#selector-sensor-list').on('change', function () {
        //         var values = this.value.split("-");
        //         var builtinport = false;

        //         var dummysensor = { type: values[0] };

        //         if (values.length >= 2)
        //             if (values[1])
        //                 dummysensor.subType = values[1];

        //         if (values.length >= 3)
        //             builtinport = values[2];

        //         var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);

        //         var imageContainer = document.getElementById("selector-image-container");
        //         while (imageContainer.firstChild) {
        //             imageContainer.removeChild(imageContainer.firstChild);
        //         }
        //         for (var i = 0; i < sensorDefinition.selectorImages.length; i++) {
        //             var image = document.createElement('img');

        //             image.src = getImg(sensorDefinition.selectorImages[i]);

        //             imageContainer.appendChild(image);

        //             //$('#selector-sensor-image').attr("src", getImg(sensorDefinition.selectorImages[0]));
        //         }


        //         var portSelect = document.getElementById("selector-sensor-port");
        //         $('#selector-sensor-port').empty();
        //         var hasPorts = false;
        //         if (builtinport) {
        //             var option = document.createElement('option');
        //             option.innerText = builtinport;
        //             option.value = builtinport;
        //             portSelect.appendChild(option);
        //             hasPorts = true;
        //         } else {
        //             var ports = mainBoard.getCurrentBoard(context.board).portTypes[sensorDefinition.portType];
        //             if (sensorDefinition.portType == "i2c")
        //             {
        //                 ports = ["i2c"];
        //             }

        //             for (var iPort = 0; iPort < ports.length; iPort++) {
        //                 var port = sensorDefinition.portType + ports[iPort];
        //                 if (sensorDefinition.portType == "i2c")
        //                     port = "i2c";

        //                 if (!isPortUsed(sensorDefinition.name, port)) {
        //                     var option = document.createElement('option');
        //                     option.innerText = port;
        //                     option.value = port;
        //                     portSelect.appendChild(option);
        //                     hasPorts = true;
        //                 }
        //             }
        //         }



        //         if (!hasPorts) {
        //             $('#selector-add-button').attr('disabled', 'disabled');

        //             var object_function = strings.messages.actuator;
        //             if (sensorDefinition.isSensor)
        //                 object_function = strings.messages.sensor;

        //             $('#selector-label').text(strings.messages.noPortsAvailable.format(object_function, sensorDefinition.portType));
        //             $('#selector-label').show();
        //         }
        //         else {
        //             $('#selector-add-button').attr('disabled', null);
        //             $('#selector-label').hide();
        //         }
        //     });

        //     $('#selector-add-button').click(function () {
        //         var sensorType = $("#selector-sensor-list option:selected").val();
        //         var values = sensorType.split("-");

        //         var dummysensor = { type: values[0] };
        //         if (values.length == 2)
        //             dummysensor.subType = values[1];

        //         var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);


        //         var port = $("#selector-sensor-port option:selected").text();
        //         var name = getNewSensorSuggestedName(sensorDefinition.suggestedName);

        //         // if(name == 'screen1') {
        //             // prepend screen because squareSize func can't handle cells wrap
        //             infos.quickPiSensors.unshift({
        //                 type: sensorDefinition.name,
        //                 subType: sensorDefinition.subType,
        //                 port: port,
        //                 name: name
        //             });

        //         // } else {
        //         //     infos.quickPiSensors.push({
        //         //         type: sensorDefinition.name,
        //         //         subType: sensorDefinition.subType,
        //         //         port: port,
        //         //         name: name
        //         //     });
        //         // }



        //         $('#popupMessage').hide();
        //         window.displayHelper.popupMessageShown = false;

        //         context.resetSensorTable();
        //         context.resetDisplay();
        //     });


        //     $("#selector-sensor-list").trigger("change");

        //     $('#picancel').click(function () {
        //         $('#popupMessage').hide();
        //         window.displayHelper.popupMessageShown = false;
        //     });
        // });
    };

    function clickAdder() {
        window.displayHelper.showPopupDialog("<div class=\"content qpi\">" +
            "   <div class=\"panel-heading\">" +
            "       <h2 class=\"sectionTitle\">" +
            "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
                        strings.messages.addcomponent +
            "       </h2>" +
            "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
            "   </div>" +
            "   <div id=\"sensorPicker\" class=\"panel-body\">" +
            "       <label>" + strings.messages.selectcomponent + "</label>" +
            "       <div class=\"flex-container\">" +
            "           <div id=\"selector-image-container\" class=\"flex-col half\">" +
            "               <img id=\"selector-sensor-image\">" +
            "           </div>" +
            "           <div class=\"flex-col half\">" +
            "               <div class=\"form-group\">" +
            "                   <div class=\"input-group\">" +
            "                       <select id=\"selector-sensor-list\" class=\"custom-select\"></select>" +
            "                   </div>" +
            "              </div>" +
            "              <div class=\"form-group\">" +
            "                   <div class=\"input-group\">" +
            "                       <select id=\"selector-sensor-port\" class=\"custom-select\"></select>" +
            "                   </div>" +
            "                   <label id=\"selector-label\"></label>" +
            "               </div>" +
            "           </div>" +
            "       </div>" +
            "   </div>" +
            "   <div class=\"singleButton\">" +
            "       <button id=\"selector-add-button\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + strings.messages.add + "</button>" +
            "   </div>" +
            "</div>", function () {
            var select = document.getElementById("selector-sensor-list");
            for (var iSensorDef = 0; iSensorDef < sensorDefinitions.length; iSensorDef++) {
                var sensorDefinition = sensorDefinitions[iSensorDef];
                // console.log("adder",sensorDefinition.name)
                if (sensorDefinition.subTypes) {
                    for (var iSubType = 0; iSubType < sensorDefinition.subTypes.length; iSubType++) {

                        if (!sensorDefinition.pluggable && !sensorDefinition.subTypes[iSubType].pluggable)
                            continue;


                        var el = document.createElement("option");
                        el.textContent = sensorDefinition.description;

                        if (sensorDefinition.subTypes[iSubType].description)
                            el.textContent = sensorDefinition.subTypes[iSubType].description;

                        el.value = sensorDefinition.name;
                        el.value += "-" + sensorDefinition.subTypes[iSubType].subType;
                        select.appendChild(el);
                        // console.log("+",el.value)
                    }
                } else {
                    if (!sensorDefinition.pluggable)
                        continue;

                    var el = document.createElement("option");
                    el.textContent = sensorDefinition.description;
                    el.value = sensorDefinition.name;
                    // console.log("+",el.value)

                    select.appendChild(el);
                }
            }

            var board = mainBoard.getCurrentBoard(context.board);
            if (board.builtinSensors) {
                for (var i = 0; i < board.builtinSensors.length; i++) {
                    var sensor = board.builtinSensors[i];
                    var sensorDefinition = sensorHandler.findSensorDefinition(sensor);

                    if (context.findSensor(sensor.type, sensor.port, false))
                        continue;

                    var el = document.createElement("option");

                    el.textContent = sensorDefinition.description + strings.messages.builtin;
                    el.value = sensorDefinition.name + "-";

                    if (sensor.subType)
                        el.value += sensor.subType;

                    el.value += "-" + sensor.port;

                    select.appendChild(el);
                }
            }

            $('#selector-sensor-list').on('change', function () {
                var values = this.value.split("-");
                // console.log(values)
                var builtinport = false;

                var dummysensor = { type: values[0] };

                if (values.length >= 2)
                    if (values[1])
                        dummysensor.subType = values[1];

                if (values.length >= 3)
                    builtinport = values[2];

                var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);

                var imageContainer = document.getElementById("selector-image-container");
                while (imageContainer.firstChild) {
                    imageContainer.removeChild(imageContainer.firstChild);
                }
                for (var i = 0; i < sensorDefinition.selectorImages.length; i++) {
                    var image = document.createElement('img');

                    image.src = getImg(sensorDefinition.selectorImages[i]);

                    imageContainer.appendChild(image);

                    //$('#selector-sensor-image').attr("src", getImg(sensorDefinition.selectorImages[0]));
                }


                var portSelect = document.getElementById("selector-sensor-port");
                $('#selector-sensor-port').empty();
                var hasPorts = false;
                if (builtinport) {
                    var option = document.createElement('option');
                    option.innerText = builtinport;
                    option.value = builtinport;
                    portSelect.appendChild(option);
                    hasPorts = true;
                } else {
                    var ports = mainBoard.getCurrentBoard(context.board).portTypes[sensorDefinition.portType];
                    // console.log(ports)
                    if (sensorDefinition.portType == "i2c")
                    {
                        ports = ["i2c"];
                    }

                    for (var iPort = 0; iPort < ports.length; iPort++) {
                        var port = sensorDefinition.portType + ports[iPort];
                        if (sensorDefinition.portType == "i2c")
                            port = "i2c";

                        if (!sensorHandler.isPortUsed(sensorDefinition.name, port)) {
                            var option = document.createElement('option');
                            option.innerText = port;
                            option.value = port;
                            portSelect.appendChild(option);
                            hasPorts = true;
                        }
                    }
                }



                if (!hasPorts) {
                    $('#selector-add-button').attr('disabled', 'disabled');

                    var object_function = strings.messages.actuator;
                    if (sensorDefinition.isSensor)
                        object_function = strings.messages.sensor;

                    $('#selector-label').text(strings.messages.noPortsAvailable.format(object_function, sensorDefinition.portType));
                    $('#selector-label').show();
                }
                else {
                    $('#selector-add-button').attr('disabled', null);
                    $('#selector-label').hide();
                }
            });

            $('#selector-add-button').click(function () {
                var sensorType = $("#selector-sensor-list option:selected").val();
                var values = sensorType.split("-");

                var dummysensor = { type: values[0] };
                if (values.length == 2)
                    dummysensor.subType = values[1];

                var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);


                var port = $("#selector-sensor-port option:selected").text();
                var name = sensorHandler.getNewSensorSuggestedName(sensorDefinition.suggestedName);

                // if(name == 'screen1') {
                    // prepend screen because squareSize func can't handle cells wrap
                    infos.quickPiSensors.unshift({
                        type: sensorDefinition.name,
                        subType: sensorDefinition.subType,
                        port: port,
                        name: name
                    });

                // } else {
                //     infos.quickPiSensors.push({
                //         type: sensorDefinition.name,
                //         subType: sensorDefinition.subType,
                //         port: port,
                //         name: name
                //     });
                // }



                $('#popupMessage').hide();
                window.displayHelper.popupMessageShown = false;

                context.resetSensorTable();
                context.resetDisplay();
            });


            $("#selector-sensor-list").trigger("change");

            $('#picancel').click(function () {
                $('#popupMessage').hide();
                window.displayHelper.popupMessageShown = false;
            });
        });
    }

    // Straight from stack overflow :)
    function squareSize(x, y, n, ratio) {
        // Compute number of rows and columns, and cell size
        var ratio = x / y * ratio;
        // console.log(ratio)
        var ncols_float = Math.sqrt(n * ratio);
        var nrows_float = n / ncols_float;

        // Find best option filling the whole height
        var nrows1 = Math.ceil(nrows_float);
        var ncols1 = Math.ceil(n / nrows1);
        while (nrows1 * ratio < ncols1) {
            nrows1++;
            ncols1 = Math.ceil(n / nrows1);
        }
        var cell_size1 = y / nrows1;

        // Find best option filling the whole width
        var ncols2 = Math.ceil(ncols_float);
        var nrows2 = Math.ceil(n / ncols2);
        while (ncols2 < nrows2 * ratio) {
            ncols2++;
            nrows2 = Math.ceil(n / ncols2);
        }
        var cell_size2 = x / ncols2;

        // Find the best values
        var nrows, ncols, cell_size;
        if (cell_size1 < cell_size2) {
            nrows = nrows2;
            ncols = ncols2;
            cell_size = cell_size2;
        } else {
            nrows = nrows1;
            ncols = ncols1;
            cell_size = cell_size1;
        }

        return {
            cols: ncols,
            rows: nrows,
            size: cell_size
        };
    }

    function showasConnected() {
        $('#piconnectprogress').hide();
        $('#piinstallcheck').hide();
        $('#piinstallprogresss').hide();
        $('#piinstallui').show();

        if (context.board == "quickpi")
            $('#pihatsetup').show();
        else
            $('#pihatsetup').hide();

        $('#piconnect').css('background-color', '#F9A423');

        $('#piinstall').css('background-color', "#488FE1");

        $('#piconnecttext').hide();

        if(context.sensorStateListener) {
            context.sensorStateListener('connected');
        }
    }

    function showasReleased() {
        $('#piconnectprogress').hide();
        $('#piinstallcheck').hide();
        $('#piinstallprogresss').hide();
        $('#piinstallui').hide();
        $('#pihatsetup').hide();
        $('#piconnect').css('background-color', '#F9A423');
        $('#piconnecttext').show();

        if (context.sensorStateListener) {
            context.sensorStateListener('disconnected');
        }
    }


    function showasDisconnected() {
        $('#piconnectprogress').hide();
        $('#piinstallcheck').hide();
        $('#piinstallprogresss').hide();
        $('#piinstall').css('background-color', 'gray');
        $('#piconnect').css('background-color', 'gray');
        $('#piconnecttext').hide();

        if(context.sensorStateListener) {
            context.sensorStateListener('disconnected');
        }
    }

    function raspberryPiConnected() {
        showasConnected();

        context.resetSensorTable();

        context.quickPiConnection.startNewSession();

        context.liveUpdateCount = 0;
        context.offLineMode = false;

        setSessionStorage('autoConnect', "1");

        context.recreateDisplay = true;
        context.resetDisplay();

        /// Connect Dialog

        $("#piconnectprogressicon").hide();
        $("#piconnectwifiicon").show();
        $("#pirelease").attr('disabled', null);

        startSensorPollInterval();
    }

    function raspberryPiDisconnected(wasConnected, wrongversion) {
        if (context.releasing || !wasConnected) {
            showasReleased();
        }
        else {
            showasDisconnected();
        }

        window.task.displayedSubTask.context.offLineMode = true;

        if (context.quickPiConnection.wasLocked()) {
            window.displayHelper.showPopupMessage(strings.messages.piPlocked, 'blanket');
        } else if (wrongversion) {
            window.displayHelper.showPopupMessage(strings.messages.wrongVersion, 'blanket');
        } else if (!context.releasing && !wasConnected) {
            window.displayHelper.showPopupMessage(strings.messages.cantConnect, 'blanket');
        } else if(wasConnected) {
            window.displayHelper.showPopupMessage(strings.messages.cardDisconnected, 'blanket');
            context.releasing = true;
            showasReleased();
        }

        clearSensorPollInterval();

        if (wasConnected && !context.releasing && !context.quickPiConnection.wasLocked() && !wrongversion) {
            context.quickPiConnection.connect(getSessionStorage('quickPiUrl'));
        } else {
            // If I was never connected don't attempt to autoconnect again
            setSessionStorage('autoConnect', "0");
            window.task.displayedSubTask.context.resetDisplay();
        }

        /// Dialog
        $("#pirelease").attr('disabled', 'disabled');
        $("#piconnectok").attr('disabled', null);

    }

    function raspberryPiChangeBoard(board) {

        if (board != "unknow")
        {
            window.task.displayedSubTask.context.changeBoard(board);
            window.task.displayedSubTask.context.resetSensorTable();
        }
    }


    // Update the context's display to the new scale (after a window resize for instance)
    context.updateScale = function () {
        if (!context.display) {
            return;
        }

        var width = $('#virtualSensors').width();
        var height =  $('#virtualSensors').height();

        if (!context.oldwidth ||
            !context.oldheight ||
            context.oldwidth != width ||
            context.oldheight != height) {

            context.oldwidth = width;
            context.oldheight =  height;

            context.resetDisplay();
        }
    };

    // When the context is unloaded, this function is called to clean up
    // anything the context may have created
    context.unload = function () {
        // Do something here
        clearSensorPollInterval();
        if (context.display) {
            // Do something here
        }

        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];

            sensor.removed = true;
        }

    };

    function drawTimeLine() {
        if (paper == undefined || !context.display)
            return;

        if (context.timelineText)
            for (var i = 0; i < context.timelineText.length; i++) {
                context.timelineText[i].remove();
            }

        context.timelineText = [];

        var timelinewidth = context.maxTime * context.pixelsPerTime;

        var pixelsPerTick = 50;
        var numberofTicks = timelinewidth / pixelsPerTick;
        var step = context.maxTime / numberofTicks;

        if (step > 1000)
        {
            step = Math.round(step / 1000) * 1000;
        }
        else if (step > 500)
        {
            step = Math.round(step / 500) * 500;
        }
        else if (step > 100)
        {
            step = Math.round(step / 100) * 100;
        }
        else if (step > 10)
        {
            step = Math.round(step / 10) * 10;
        }

        var i = 0;
        var lastx = 0;
        var color = false;

        var textStart = 0;

        var timelabel = paper.text(textStart, context.timeLineY, strings.messages.timeLabel);
        timelabel.attr({ "font-size": "10px", 'text-anchor': 'start', 'font-weight': 'bold', fill: "gray" });
        context.timelineText.push(timelabel);
        timelabel.node.style.MozUserSelect = "none";
        timelabel.node.style.WebkitUserSelect = "none";

        var bbox = timelabel.getBBox();
        textStart = bbox.x + bbox.width + 3;

        var timelabel = paper.text(textStart, context.timeLineY, '\uf00e');
        timelabel.node.style.fontFamily = '"Font Awesome 5 Free"';
        timelabel.node.style.fontWeight = "bold";
        timelabel.node.style.MozUserSelect = "none";
        timelabel.node.style.WebkitUserSelect = "none";

        timelabel.attr({ "font-size": "20" + "px",
        'text-anchor': 'start',
         'font-weight': 'bold',
         'fill': "#4A90E2",
         });
        context.timelineText.push(timelabel);

        timelabel.click(function()
        {
            var originalzoom = context.quickPiZoom;
            context.quickPiZoom += 0.3;

            if (context.quickPiZoom < 1)
                context.quickPiZoom = 1;

            if (originalzoom != context.quickPiZoom)
                context.resetDisplay();
        });


        var bbox = timelabel.getBBox();
        textStart = bbox.x + bbox.width + 3;

        var timelabel = paper.text(textStart, context.timeLineY, '\uf010');
        timelabel.node.style.fontFamily = '"Font Awesome 5 Free"';
        timelabel.node.style.fontWeight = "bold";
        timelabel.node.style.MozUserSelect = "none";
        timelabel.node.style.WebkitUserSelect = "none";

        timelabel.attr({ "font-size": "20" + "px",
         'text-anchor': 'start',
          'font-weight': 'bold',
           'fill': "#4A90E2",
         });
        context.timelineText.push(timelabel);

        timelabel.click(function()
        {
            var originalzoom = context.quickPiZoom;
            context.quickPiZoom -= 0.3;

            if (context.quickPiZoom < 1)
                context.quickPiZoom = 1;

            if (originalzoom != context.quickPiZoom)
                context.resetDisplay();
        });



        for (; i <= context.maxTime; i += step) {
            var x = context.timelineStartx + (i * context.pixelsPerTime);

            var labelText = (i / 1000).toFixed(2);
            if (step >= 1000)
                labelText = (i / 1000).toFixed(0);


            var timelabel = paper.text(x, context.timeLineY, labelText);

            timelabel.attr({ "font-size": "15px", 'text-anchor': 'center', 'font-weight': 'bold', fill: "gray" });
            timelabel.node.style = "-moz-user-select: none; -webkit-user-select: none;";

            context.timelineText.push(timelabel);


            var timelinedivisor = paper.path(["M", x,
                                        0,
                                        "L", x,
                                        context.timeLineY]);
                timelinedivisor.attr({
                                           "stroke-width": 1,
                                            "stroke": "lightgray",
                                             "opacity": 0.2,
                                             'z-index': 100,

                                            });

            context.sensorStates.push(timelinedivisor);
        }
        if (!context.timeLineHoverLine || isElementRemoved(context.timeLineHoverLine)) {
            context.timeLineHoverLine = paper.rect(0, 0, 0, 0);
        }

        context.timeLineHoverLine.attr({
                                            "stroke": "blue",
                                             "opacity": 0.2,
                                             "opacity": 0
        });


        if (context.timeLineHoverPath) {
            context.timeLineHoverPath.remove();
        }

        context.timeLineHoverPath = paper.rect(context.timelineStartx, 0, context.maxTime * context.pixelsPerTime, context.timeLineY);

        context.timeLineHoverPath.attr({
            "fill": "lightgray",
            "stroke": "none",
            "opacity": 0.0,
        });



        context.timeLineHoverPath.mousemove(function(event){

            if (context.runner && context.runner.isRunning())
                return;

            $('#screentooltip').remove();
            var scrolloffset = $('#virtualSensors').scrollLeft();

            var ms = (event.clientX + scrolloffset - context.timelineStartx) / context.pixelsPerTime;
            ms = Math.round(ms);

            if (ms < -4)
                return;
            if (ms < 0)
                ms = 0;

            $( "body" ).append('<div id="screentooltip"></div>');
            $('#screentooltip').css("position", "absolute");
            $('#screentooltip').css("border", "1px solid gray");
            $('#screentooltip').css("background-color", "#efefef");
            $('#screentooltip').css("padding", "3px");
            $('#screentooltip').css("z-index", "1000");


            $('#screentooltip').css("left", event.clientX + 2).css("top", event.clientY + 2);

            $('#screentooltip').text(ms.toString() + "ms");


            for(var sensorName in context.gradingStatesBySensor) {
                // Cycle through each sensor from the grading states
                var sensor = sensorHandler.findSensorByName(sensorName);
                var sensorDef = sensorHandler.findSensorDefinition(sensor);

                var expectedStates = context.gradingStatesBySensor[sensorName];
                if(!expectedStates.length) { continue;}

                var actualStates = context.actualStatesBySensor[sensorName];
                var actualIdx = 0;

                var currentSensorState = null;

                // Check that we went through all expected states
                for (var i = 0; i < context.gradingStatesBySensor[sensorName].length; i++) {
                    var expectedState = context.gradingStatesBySensor[sensorName][i];

                    if (expectedState.time >= ms)
                    {
                        break;
                    }

                    currentSensorState = expectedState;
                }

                if (currentSensorState)
                {
                    sensor.state = currentSensorState.state;
                    drawSensor(sensor);
                }
            }

            context.timeLineHoverLine.attr({
                        "x": event.clientX + scrolloffset,
                        "y": 0,
                        "width": 1,
                        "height": context.timeLineY,

                                           "stroke-width": 4,
                                            "stroke": "blue",
                                             "opacity": 0.2,
                                             "stroke-linecap": "square",
                                             "stroke-linejoin": "round",
            });

        });

        context.timeLineHoverPath.mouseout(function() {
            if (context.runner && context.runner.isRunning())
                return;

            context.timeLineHoverLine.attr({
                "opacity": 0.0,
            });

            $('#screentooltip').remove();

            context.resetSensors();
            for (var iSensor = 0; iSensor < infos.quickPiSensors.length; iSensor++) {
                var sensor = infos.quickPiSensors[iSensor];

                drawSensor(sensor);
            }

        });


        if (!context.loopsForever) {
            var endx = context.timelineStartx + (context.maxTime * context.pixelsPerTime);
            var x = context.timelineStartx + (i * context.pixelsPerTime);
            var timelabel = paper.text(x, context.timeLineY, '\uf11e');
            timelabel.node.style.fontFamily = '"Font Awesome 5 Free"';
            timelabel.node.style.fontWeight = "bold";
            timelabel.node.style.MozUserSelect = "none";
            timelabel.node.style.WebkitUserSelect = "none";


            timelabel.attr({ "font-size": "20" + "px", 'text-anchor': 'middle', 'font-weight': 'bold', fill: "gray" });
            context.timelineText.push(timelabel);

			if (context.timeLineEndLine)
				context.timeLineEndLine.remove();

            context.timeLineEndLine = paper.path(["M", endx,
                                                0,
                                                "L", endx,
                                                context.timeLineY]);


            if (context.endFlagEnd)
                context.endFlagEnd.remove();
            context.endFlagEnd = paper.rect(endx, 0, x, context.timeLineY + 10);
            context.endFlagEnd.attr({
                "fill": "lightgray",
                "stroke": "none",
                "opacity": 0.2,
            });
        }


        /*
                paper.path(["M", context.timelineStartx,
                    paper.height - context.sensorSize * 3 / 4,
                    "L", paper.width,
                    paper.height - context.sensorSize * 3 / 4]);
        */
    }

    function drawCurrentTime() {
        if (!paper || !context.display || isNaN(context.currentTime))
            return;
/*
        if (context.currentTimeText)
            context.currentTimeText.remove();

        context.currentTimeText = paper.text(0, paper.height - 40, context.currentTime.toString() + "ms");
        context.currentTimeText.attr({
            "font-size": "10px",
            'text-anchor': 'start'
        });            */

        if (!context.autoGrading)
            return;

        var animationSpeed = 200; // ms
        var startx = context.timelineStartx + (context.currentTime * context.pixelsPerTime);

        var targetpath = ["M", startx, 0, "L", startx, context.timeLineY];

        if (context.timeLineCurrent)
        {
            context.timeLineCurrent.animate({path: targetpath}, animationSpeed);
        }
        else
        {
            context.timeLineCurrent = paper.path(targetpath);

            context.timeLineCurrent.attr({
                    "stroke-width": 5,
                    "stroke": "#678AB4",
                    "stroke-linecap": "round"
            });
        }


        if (context.timeLineCircle)
        {
            context.timeLineCircle.animate({cx: startx}, animationSpeed);
        }
        else
        {
            var circleradius = 10;
            context.timeLineCircle = paper.circle(startx, context.timeLineY, 10);

            context.timeLineCircle.attr({
                "fill": "white",
                "stroke": "#678AB4"
            });
        }

        var trianglew = 10;
        var targetpath = ["M", startx, 0,
                "L", startx + trianglew, 0,
                "L", startx, trianglew,
                "L", startx - trianglew, 0,
                "L", startx, 0
            ];

        if (context.timeLineTriangle)
        {
            context.timeLineTriangle.animate({path: targetpath}, animationSpeed);
        }
        else
        {
            context.timeLineTriangle = paper.path(targetpath);

            context.timeLineTriangle.attr({
                "fill": "#678AB4",
                "stroke": "#678AB4"
            });
        }

    }

    function storeTimeLineState(sensor, state, startTime, endTime, type) {
        var found = false;
        var timelinestate = {
            sensor: sensor,
            state: state,
            startTime: startTime,
            endTime: endTime,
            type: type
        };

        for (var i = 0; i < context.timeLineStates.length; i++) {
            var currenttlstate = context.timeLineStates[i];

            if (currenttlstate.sensor == sensor &&
                currenttlstate.startTime == startTime &&
                currenttlstate.endTime == endTime &&
                currenttlstate.type == type) {
                context.timeLineStates[i] = timelinestate;
                found = true;
                break;
            }
        }

        if (!found) {
            context.timeLineStates.push(timelinestate);
        }
    }


    function drawSensorTimeLineState(sensor, state, startTime, endTime, type, skipsave = false, expectedState = null) {
        if (!skipsave) {
            storeTimeLineState(sensor, state, startTime, endTime, type);
        }

        if (paper == undefined ||
            !context.display ||
            !context.autoGrading)
            return;

        var startx = context.timelineStartx + (startTime * context.pixelsPerTime);
        var stateLenght = (endTime - startTime) * context.pixelsPerTime;

        var ypositionmiddle = ((sensor.drawInfo.y + (context.timeLineSlotHeight * .5)));

        var ypositiontop = sensor.drawInfo.y
        var ypositionbottom = sensor.drawInfo.y + context.timeLineSlotHeight;

        var color = "green";
        var strokewidth = 4;
        if (type == "expected" || type == "finnish") {
            color = "lightgrey";
            strokewidth = 8;
        } else if (type == "wrong") {
            color = "red";
            strokewidth = 4;
        }
        else if (type == "actual") {
            color = "yellow";
            strokewidth = 4;
        }

        var isAnalog = sensorHandler.findSensorDefinition(sensor).isAnalog;
        var percentage = + state;

        var drawnElements = [];
        var deleteLastDrawnElements = true;

        if (sensor.type == "accelerometer" ||
            sensor.type == "gyroscope" ||
            sensor.type == "magnetometer") {

            if (state != null) {
            for (var i = 0; i < 3; i++) {
                var startx = context.timelineStartx + (startTime * context.pixelsPerTime);
                var stateLenght = (endTime - startTime) * context.pixelsPerTime;

                var yspace = context.timeLineSlotHeight / 3;
                var ypositiontop = sensor.drawInfo.y + (yspace * i)
                var ypositionbottom = ypositiontop + yspace;

                var offset = (ypositionbottom - ypositiontop) * sensorHandler.findSensorDefinition(sensor).getPercentageFromState(state[i], sensor);

                if (type == "expected" || type == "finnish") {
                    color = "lightgrey";
                    strokewidth = 4;
                } else  if (type == "wrong") {
                    color = "red";
                    strokewidth = 2;
                }
                else if (type == "actual") {
                    color = "yellow";
                    strokewidth = 2;
                }

                if (sensor.lastAnalogState != null &&
                    sensor.lastAnalogState[i] != state[i]) {

                    var oldStatePercentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.lastAnalogState[i], sensor);

                    var previousOffset = (ypositionbottom - ypositiontop) * oldStatePercentage;

                    var joinline = paper.path(["M", startx,
                        ypositiontop + offset,
                        "L", startx,
                        ypositiontop + previousOffset]);

                    joinline.attr({
                        "stroke-width": strokewidth,
                        "stroke": color,
                        "stroke-linejoin": "round",
                        "stroke-linecap": "round"
                    });
                    context.sensorStates.push(joinline);

                    if (sensor.timelinelastxlabel == null)
                        sensor.timelinelastxlabel = [0, 0, 0];

                    if ((startx) - sensor.timelinelastxlabel[i] > 40)
                    {
                        var sensorDef = sensorHandler.findSensorDefinition(sensor);
                        var stateText = state.toString();
                        if(sensorDef && sensorDef.getStateString) {
                            stateText = sensorDef.getStateString(state[i]);
                        }

                        var paperText = paper.text(startx, ypositiontop + offset - 10, stateText);
                        drawnElements.push(paperText);
                        context.sensorStates.push(paperText);

                        sensor.timelinelastxlabel[i] = startx;
                    }
                }

                var stateline = paper.path(["M", startx,
                    ypositiontop + offset,
                    "L", startx + stateLenght,
                    ypositiontop + offset]);

                stateline.attr({
                    "stroke-width": strokewidth,
                    "stroke": color,
                    "stroke-linejoin": "round",
                    "stroke-linecap": "round"
                });

                drawnElements.push(stateline);
                context.sensorStates.push(stateline);
            }
                sensor.lastAnalogState = state == null ? [0, 0, 0] : state;
            }


        } else
        if (isAnalog || sensor.showAsAnalog) {
            var offset = (ypositionbottom - ypositiontop) * sensorHandler.findSensorDefinition(sensor).getPercentageFromState(state, sensor);

            if (type == "wrong") {
                color = "red";
                ypositionmiddle += 4;
            }
            else if (type == "actual") {
                color = "yellow";
                ypositionmiddle += 4;
            }

            if (sensor.lastAnalogState != null
                && sensor.lastAnalogState != state) {
                var oldStatePercentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.lastAnalogState, sensor);

                var previousOffset = (ypositionbottom - ypositiontop) * oldStatePercentage;

                var joinline = paper.path(["M", startx,
                    ypositiontop + offset,
                    "L", startx,
                    ypositiontop + previousOffset]);

                joinline.attr({
                    "stroke-width": strokewidth,
                    "stroke": color,
                    "stroke-linejoin": "round",
                    "stroke-linecap": "round"
                });

                context.sensorStates.push(joinline);

                if (!sensor.timelinelastxlabel)
                    sensor.timelinelastxlabel = 0;

                if (!sensor.timelinelastxlabel)
                    sensor.timelinelastxlabel = 0;

                if ((startx) - sensor.timelinelastxlabel > 5)
                {
                    var sensorDef = sensorHandler.findSensorDefinition(sensor);
                    var stateText = state.toString();
                    if(sensorDef && sensorDef.getStateString) {
                        stateText = sensorDef.getStateString(state);
                    }

                    var y = 0;

                    if (sensor.timelinestateup) {
                        y = ypositiontop + offset - 10;
                        sensor.timelinestateup = false;
                    }
                    else {
                        y = ypositiontop + offset + 10;

                        sensor.timelinestateup = true;
                    }

                    var paperText = paper.text(startx, y, stateText);
                    drawnElements.push(paperText);
                    context.sensorStates.push(paperText);

                    sensor.timelinelastxlabel = startx;
                }
            }

            sensor.lastAnalogState = state == null ? 0 : state;

            var stateline = paper.path(["M", startx,
                ypositiontop + offset,
                "L", startx + stateLenght,
                ypositiontop + offset]);

            stateline.attr({
                "stroke-width": strokewidth,
                "stroke": color,
                "stroke-linejoin": "round",
                "stroke-linecap": "round"
            });

            drawnElements.push(stateline);
            context.sensorStates.push(stateline);
        } else if (sensor.type == "stick") {
            var stateToFA = [
                "\uf062",
                "\uf063",
                "\uf060",
                "\uf061",
                "\uf111",
            ]


            var spacing = context.timeLineSlotHeight / 5;
            for (var i = 0; i < 5; i++)
            {
                if (state && state[i])
                {
                    var ypos = sensor.drawInfo.y + (i * spacing);
                    var startingpath = ["M", startx,
                            ypos,
                            "L", startx,
                            ypos];

                    var targetpath = ["M", startx,
                            ypos,
                            "L", startx + stateLenght,
                            ypos];

                    if (type == "expected")
                    {
                        var stateline = paper.path(targetpath);
                    }
                    else
                    {
                        var stateline = paper.path(startingpath);
                        stateline.animate({path: targetpath}, 200);
                    }

                    stateline.attr({
                        "stroke-width": 2,
                        "stroke": color,
                        "stroke-linejoin": "round",
                        "stroke-linecap": "round"
                    });

                    drawnElements.push(stateline);
                    context.sensorStates.push(stateline);

                    if (type == "expected") {
                        sensor.stateArrow = paper.text(startx, ypos + 7, stateToFA[i]);
                        context.sensorStates.push(sensor.stateArrow);

                        sensor.stateArrow.attr({
                            "text-anchor": "start",
                            "font": "Font Awesome 5 Free",
                            "stroke": color,
                            "fill": color,
                            "font-size": (strokewidth * 2) + "px"
                        });

                        sensor.stateArrow.node.style.fontFamily = '"Font Awesome 5 Free"';
                        sensor.stateArrow.node.style.fontWeight = "bold";
                    }
                }
            }

        } else if (sensor.type == "screen" && state) {
            var sensorDef = sensorHandler.findSensorDefinition(sensor);
            if (type != "actual" || !sensor.lastScreenState || !sensorDef.compareState(sensor.lastScreenState, state))
            {
                sensor.lastScreenState = state;
                if (state.isDrawingData) {
                    var stateBubble = paper.text(startx, ypositiontop + 10, '\uf303');

                    stateBubble.attr({
                        "font": "Font Awesome 5 Free",
                        "stroke": color,
                        "fill": color,
                        "font-size": (4 * 2) + "px"
                    });

                    stateBubble.node.style.fontFamily = '"Font Awesome 5 Free"';
                    stateBubble.node.style.fontWeight = "bold";

                    $(stateBubble.node).css("z-index", "1");

                    function showPopup(event) {

                        if (!sensor.showingTooltip)
                        {
                            $( "body" ).append('<div id="screentooltip"></div>');

                            $('#screentooltip').css("position", "absolute");
                            $('#screentooltip').css("border", "1px solid gray");
                            $('#screentooltip').css("background-color", "#efefef");
                            $('#screentooltip').css("padding", "3px");
                            $('#screentooltip').css("z-index", "1000");
                            $('#screentooltip').css("width", "262px");
                            $('#screentooltip').css("height", "70px");

                            $('#screentooltip').css("left", event.clientX+2).css("top", event.clientY+2);

                            var canvas = document.createElement("canvas");
                            canvas.id = "tooltipcanvas";
                            canvas.width = 128 * 2;
                            canvas.height = 32 * 2;
                            $('#screentooltip').append(canvas);


                            $(canvas).css("position", "absolute");
                            $(canvas).css("z-index", "1500");
                            $(canvas).css("left", 3).css("top", 3);


                            var ctx = canvas.getContext('2d');

                            if (expectedState && type == "wrong") {
                                screenDrawing.renderDifferences(expectedState, state, canvas, 2);
                            } else {
                                screenDrawing.renderToCanvas(state, canvas, 2);
                            }

                            sensor.showingTooltip = true;
                        }
                    };

                    $(stateBubble.node).mouseenter(showPopup);
                    $(stateBubble.node).click(showPopup);

                    $(stateBubble.node).mouseleave(function(event) {
                        sensor.showingTooltip = false;
                        $('#screentooltip').remove();
                    });

                } else {
                    var stateBubble = paper.text(startx, ypositionmiddle + 10, '\uf27a');

                    stateBubble.attr({
                        "font": "Font Awesome 5 Free",
                        "stroke": color,
                        "fill": color,
                        "font-size": (strokewidth * 2) + "px"
                    });

                    stateBubble.node.style.fontFamily = '"Font Awesome 5 Free"';
                    stateBubble.node.style.fontWeight = "bold";

                    function showPopup() {
                        if (!sensor.tooltip) {
                            sensor.tooltipText = paper.text(startx, ypositionmiddle + 50, state.line1 + "\n" + (state.line2 ? state.line2 : ""));

                            var textDimensions = sensor.tooltipText.getBBox();

                            sensor.tooltip = paper.rect(textDimensions.x - 15, textDimensions.y - 15, textDimensions.width + 30, textDimensions.height + 30);
                            sensor.tooltip.attr({
                                "stroke": "black",
                                "stroke-width": 2,
                                "fill": "white",
                            });

                            sensor.tooltipText.toFront();
                        }
                    };

                    stateBubble.click(showPopup);

                    stateBubble.hover(showPopup, function () {
                        if (sensor.tooltip) {
                            sensor.tooltip.remove();
                            sensor.tooltip = null;
                        }
                        if (sensor.tooltipText) {
                            sensor.tooltipText.remove();
                            sensor.tooltipText = null;
                        }
                    });
                }
                drawnElements.push(stateBubble);
                context.sensorStates.push(stateBubble);
            } else {
                deleteLastDrawnElements = false;
            }
        } else if (sensor.type == "cloudstore") {
            var sensorDef = sensorHandler.findSensorDefinition(sensor);
            if (type != "actual" || !sensor.lastScreenState || !sensorDef.compareState(sensor.lastScreenState, state))
            {
                sensor.lastScreenState = state;
                    var stateBubble = paper.text(startx, ypositionmiddle + 10, '\uf044');

                    stateBubble.attr({
                        "font": "Font Awesome 5 Free",
                        "stroke": color,
                        "fill": color,
                        "font-size": (4 * 2) + "px"
                    });

                    stateBubble.node.style.fontFamily = '"Font Awesome 5 Free"';
                    stateBubble.node.style.fontWeight = "bold";

                    function showPopup(event) {

                        if (!sensor.showingTooltip)
                        {
                            $( "body" ).append('<div id="screentooltip"></div>');

                            $('#screentooltip').css("position", "absolute");
                            $('#screentooltip').css("border", "1px solid gray");
                            $('#screentooltip').css("background-color", "#efefef");
                            $('#screentooltip').css("padding", "3px");
                            $('#screentooltip').css("z-index", "1000");
                            /*
                            $('#screentooltip').css("width", "262px");
                            $('#screentooltip').css("height", "70px");*/

                            $('#screentooltip').css("left", event.clientX+2).css("top", event.clientY+2);


                            if (expectedState && type == "wrong") {
                                var div = quickPiStore.renderDifferences(expectedState, state);
                                $('#screentooltip').append(div);
                            } else {
                                for (var property in state) {
                                    var div = document.createElement("div");
                                    $(div).text(property + " = " + state[property]);
                                    $('#screentooltip').append(div);
                                }
                            }

                            sensor.showingTooltip = true;
                        }
                    };

                    $(stateBubble.node).mouseenter(showPopup);
                    $(stateBubble.node).click(showPopup);

                    $(stateBubble.node).mouseleave(function(event) {
                        sensor.showingTooltip = false;
                        $('#screentooltip').remove();
                    });

                drawnElements.push(stateBubble);
                context.sensorStates.push(stateBubble);

            } else {
                deleteLastDrawnElements = false;
            }
        } else if (percentage != 0) {
            if (type == "wrong" || type == "actual") {
                ypositionmiddle += 2;
            }

            if (type == "expected") {
                var c = paper.rect(startx, ypositionmiddle, stateLenght, strokewidth);
                c.attr({
                    "stroke": "none",
                    "fill": color,
                });

            } else {
                var c = paper.rect(startx, ypositionmiddle, 0, strokewidth);
                c.attr({
                    "stroke": "none",
                    "fill": color,
                });

                c.animate({ width: stateLenght }, 200);
            }
            drawnElements.push(c);
            context.sensorStates.push(c);
        }

        if (type == "wrong") {
            /*
            wrongindicator = paper.path(["M", startx,
                             sensor.drawInfo.y,
                        "L", startx + stateLenght,
                                sensor.drawInfo.y + sensor.drawInfo.height,

                        "M", startx,
                                sensor.drawInfo.y + sensor.drawInfo.height,
                        "L", startx + stateLenght,
                                   sensor.drawInfo.y
                            ]);

            wrongindicator.attr({
                "stroke-width": 5, "stroke" : "red", "stroke-linecap": "round" });*/
        }

        if(type == 'actual' || type == 'wrong') {
            if(!sensor.drawnGradingElements) {
                sensor.drawnGradingElements = [];
            } else if(deleteLastDrawnElements) {
                for(var i = 0; i < sensor.drawnGradingElements.length; i++) {
                    var dge = sensor.drawnGradingElements[i];
                    if(dge.time >= startTime) {
                        for(var j = 0; j < dge.elements.length; j++) {
                            dge.elements[j].remove();
                        }
                        sensor.drawnGradingElements.splice(i, 1);
                        i -= 1;
                    }
                }
            }
            if(drawnElements.length) {
                sensor.drawnGradingElements.push({time: startTime, elements: drawnElements});
            }
        }

        // Make sure the current time bar is always on top of states
        drawCurrentTime();
    }

    function createSlider(sensor, max, min, x, y, w, h, index) {
        // console.log("createSlider")
        var sliderobj = {};
        sliderobj.sliderdata = {};

        sliderobj.index = index;
        sliderobj.min = min;
        sliderobj.max = max;

        var outsiderectx = x;
        var outsiderecty = y;
        var outsidewidth = w / 6;
        var outsideheight = h;

        var insidewidth = outsidewidth / 6;
        sliderobj.sliderdata.insideheight = h * 0.60;

        var insiderectx = outsiderectx + (outsidewidth / 2) - (insidewidth / 2);
        sliderobj.sliderdata.insiderecty = outsiderecty + (outsideheight / 2) - (sliderobj.sliderdata.insideheight / 2);

        var circleradius = (outsidewidth / 2) - 1;

        var pluscirclex = outsiderectx + (outsidewidth / 2);
        var pluscircley = outsiderecty + circleradius + 1;

        var minuscirclex = pluscirclex;
        var minuscircley = outsiderecty + outsideheight - circleradius - 1;

        paper.setStart();

        sliderobj.sliderrect = paper.rect(outsiderectx, outsiderecty, outsidewidth, outsideheight, outsidewidth / 2);
        sliderobj.sliderrect.attr("fill", "#468DDF");
        sliderobj.sliderrect.attr("stroke", "#468DDF");

        sliderobj.sliderrect = paper.rect(insiderectx, sliderobj.sliderdata.insiderecty, insidewidth, sliderobj.sliderdata.insideheight, 2);
        sliderobj.sliderrect.attr("fill", "#2E5D94");
        sliderobj.sliderrect.attr("stroke", "#2E5D94");


        sliderobj.plusset = paper.set();

        sliderobj.pluscircle = paper.circle(pluscirclex, pluscircley, circleradius);
        sliderobj.pluscircle.attr("fill", "#F5A621");
        sliderobj.pluscircle.attr("stroke", "#F5A621");

        sliderobj.plus = paper.text(pluscirclex, pluscircley, "+");
        sliderobj.plus.attr({ fill: "white" });
        sliderobj.plus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

        sliderobj.plusset.push(sliderobj.pluscircle, sliderobj.plus);

        sliderobj.plusset.click(function () {
            var step = 1;
            var sensorDef = sensorHandler.findSensorDefinition(sensor);
            if (sensorDef.step)
                step = sensorDef.step;

            if (Array.isArray(sensor.state)) {
                if (sensor.state[sliderobj.index] < sliderobj.max)
                    sensor.state[sliderobj.index] += step;
            }
            else
            {
                if (sensor.state < sliderobj.max)
                    sensor.state += step;
            }

            warnClientSensorStateChanged(sensor);
            drawSensor(sensor, true);
        });


        sliderobj.minusset = paper.set();

        sliderobj.minuscircle = paper.circle(minuscirclex, minuscircley, circleradius);
        sliderobj.minuscircle.attr("fill", "#F5A621");
        sliderobj.minuscircle.attr("stroke", "#F5A621");

        sliderobj.minus = paper.text(minuscirclex, minuscircley, "-");
        sliderobj.minus.attr({ fill: "white" });
        sliderobj.minus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

        sliderobj.minusset.push(sliderobj.minuscircle, sliderobj.minus);

        sliderobj.minusset.click(function () {

            var step = 1;
            var sensorDef = sensorHandler.findSensorDefinition(sensor);
            if (sensorDef.step)
                step = sensorDef.step;

            if (Array.isArray(sensor.state)) {
                if (sensor.state[sliderobj.index] > sliderobj.min)
                    sensor.state[sliderobj.index] -= step;
            } else {
                if (sensor.state > sliderobj.min)
                    sensor.state -= step;
            }

            warnClientSensorStateChanged(sensor);
            drawSensor(sensor, true);
        });


        var thumbwidth = outsidewidth * .80;
        sliderobj.sliderdata.thumbheight = outsidewidth * 1.4;
        sliderobj.sliderdata.scale = (sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight);


        if (Array.isArray(sensor.state)) {
            var percentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[index], sensor);
        } else {
            var percentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);
        }


        var thumby = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight - (percentage * sliderobj.sliderdata.scale);

        var thumbx = insiderectx + (insidewidth / 2) - (thumbwidth / 2);

        sliderobj.thumb = paper.rect(thumbx, thumby, thumbwidth, sliderobj.sliderdata.thumbheight, outsidewidth / 2);
        sliderobj.thumb.attr("fill", "#F5A621");
        sliderobj.thumb.attr("stroke", "#F5A621");

        sliderobj.slider = paper.setFinish();

        sliderobj.thumb.drag(
            function (dx, dy, x, y, event) {

                var newy = sliderobj.sliderdata.zero + dy;

                if (newy < sliderobj.sliderdata.insiderecty)
                    newy = sliderobj.sliderdata.insiderecty;

                if (newy > sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight)
                    newy = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight;

                sliderobj.thumb.attr('y', newy);

                var percentage = 1 - ((newy - sliderobj.sliderdata.insiderecty) / sliderobj.sliderdata.scale);

                if (Array.isArray(sensor.state)) {
                    sensor.state[sliderobj.index] = sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
                } else {
                    sensor.state = sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
                }
                warnClientSensorStateChanged(sensor);
                drawSensor(sensor, true);
            },
            function (x, y, event) {
                sliderobj.sliderdata.zero = sliderobj.thumb.attr('y');

            },
            function (event) {
            }
        );

        sliderobj.slider.toFront();

        return sliderobj;
    }


    function setSlider(sensor, juststate, imgx, imgy, imgw, imgh, min, max, triaxial) {
        // console.log("setSlider",juststate)
        if (juststate) {

            if (Array.isArray(sensor.state)) {
                for (var i = 0; i < sensor.state.length; i++) {
                    if (sensor.sliders[i] == undefined)
                        continue;

                    var percentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[i], sensor);

                    thumby = sensor.sliders[i].sliderdata.insiderecty +
                        sensor.sliders[i].sliderdata.insideheight -
                        sensor.sliders[i].sliderdata.thumbheight -
                        (percentage * sensor.sliders[i].sliderdata.scale);

                    sensor.sliders[i].thumb.attr('y', thumby);
                    sensor.sliders[i].slider.toFront();
                }
            } else {
                var percentage = sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);

                thumby = sensor.sliders[0].sliderdata.insiderecty +
                    sensor.sliders[0].sliderdata.insideheight -
                    sensor.sliders[0].sliderdata.thumbheight -
                    (percentage * sensor.sliders[0].sliderdata.scale);

                sensor.sliders[0].thumb.attr('y', thumby);
            }

            return;
        }

        removeSlider(sensor);


        sensor.sliders = [];

        var actuallydragged;

        sensor.hasslider = true;
        sensor.focusrect.drag(
            function (dx, dy, x, y, event) {
                if (sensor.sliders.length != 1)
                    return;

                var newy = sensor.sliders[0].sliderdata.zero + dy;

                if (newy < sensor.sliders[0].sliderdata.insiderecty)
                    newy = sensor.sliders[0].sliderdata.insiderecty;

                if (newy > sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight)
                    newy = sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight;

                sensor.sliders[0].thumb.attr('y', newy);

                var percentage = 1 - ((newy - sensor.sliders[0].sliderdata.insiderecty) / sensor.sliders[0].sliderdata.scale);

                sensor.state = sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
                warnClientSensorStateChanged(sensor);
                drawSensor(sensor, true);

                actuallydragged++;
            },
            function (x, y, event) {
                showSlider();
                actuallydragged = 0;

                if (sensor.sliders.length == 1)
                    sensor.sliders[0].sliderdata.zero = sensor.sliders[0].thumb.attr('y');
            },
            function (event) {
                if (actuallydragged > 4) {
                    hideSlider(sensor);
                }
            }
        );

        function showSlider() {
            hideSlider(sensorWithSlider);
            sensorWithSlider = sensor;

            var w = sensor.drawInfo.width;
            var h = sensor.drawInfo.height;
            var x = sensor.drawInfo.x;
            var y = sensor.drawInfo.y;

            if (Array.isArray(sensor.state)) {

                var offset = 0;
                var sign = -1;
                if (sensor.drawInfo.x -
                     ((sensor.state.length - 1) * sensor.drawInfo.width / 5) < 0)
                {
                    sign = 1;
                    offset = sensor.drawInfo.width * .70;
                }

                // if offset is equal to 0, we need to reverse
                if (offset == 0) {
                    for (var i = 0; i < sensor.state.length; i++) {
                        var sliderobj = createSlider(sensor,
                            max,
                            min,
                            sensor.drawInfo.x + offset + (sign * Math.abs(i + 1 - sensor.state.length) * h / 5),
                            sensor.drawInfo.y,
                            h,
                            h,
                            i);

                        sensor.sliders.push(sliderobj);
                    }
                }
                else {
                    for (var i = 0; i < sensor.state.length; i++) {
                        var sliderobj = createSlider(sensor,
                            max,
                            min,
                            sensor.drawInfo.x + offset + (sign * i * h / 5),
                            sensor.drawInfo.y,
                            h,
                            h,
                            i);

                        sensor.sliders.push(sliderobj);
                    }
                }
            } else {
                var sliderobj = createSlider(sensor,
                    max,
                    min,
                    sensor.drawInfo.x,
                    sensor.drawInfo.y,
                    h,
                    h,
                    0);
                sensor.sliders.push(sliderobj);
            }
        }
    }

    function removeSlider(sensor) {
        if (sensor.hasslider && sensor.focusrect) {
            sensor.focusrect.undrag();
            sensor.hasslider = false;
        }

        if (sensor.sliders) {

            for (var i = 0; i < sensor.sliders.length; i++) {
                sensor.sliders[i].slider.remove();
            }

            sensor.sliders = [];
        }
    }

    function sensorInConnectedModeError() {
        window.displayHelper.showPopupMessage(strings.messages.sensorInOnlineMode, 'blanket');
    }

    function actuatorsInRunningModeError() {
        window.displayHelper.showPopupMessage(strings.messages.actuatorsWhenRunning, 'blanket');
    }

    function isElementRemoved(element) {
        return !element.paper.canvas || !element.node.parentElement;
    }

    var irRemoteDialog = "<div class=\"content qpi\">" +
        "   <div class=\"panel-heading\">" +
        "       <h2 class=\"sectionTitle\">" +
        "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
                    strings.messages.irRemoteControl +
        "       </h2>" +
        "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
        "   </div>" +
        "   <div id=\"sensorPicker\" class=\"panel-body\">" +
        "       <div id=\"piremotemessage\" >" +
        "       </div>" +
        "       <div id=\"piremotecontent\" >" +
        "       </div>" +
        "   </div>" +
        "   <div class=\"singleButton\">" +
        "       <button id=\"picancel2\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + strings.messages.closeDialog + "</button>" +
        "   </div>" +
        "</div>";

    function drawSensor(sensor, juststate = false, donotmovefocusrect = false) {
        // console.log(sensor.type)
        saveSensorStateIfNotRunning(sensor);
        if (context.sensorStateListener) {
            context.sensorStateListener(sensor);
        }

        var sameFont = true;
        var fontWeight = "normal";
        var sideTextSmall = false;

        if (paper == undefined || !context.display || !sensor.drawInfo)
            return;

        var scrolloffset = 0;
        var fadeopacity = 1;

        var w = sensor.drawInfo.width;
        var h = sensor.drawInfo.height;
        var x = sensor.drawInfo.x;
        var y = sensor.drawInfo.y;
        var cx = x + w/2;
        var cy = y + h/2;

        var imgh = h / 2;
        var imgw = imgh;

        var imgx = x - (imgw / 2) + (w / 2);
        var imgy = y + (h - imgh) / 2;

        var namex = x + (w / 2);
        var namey = y + h/8;
        var nameanchor = "middle";
        // paper.path(["M",x,namey,"H",x + w])

        var state1x = x + (w / 2)
        var state1y = y + h - h/8;
        var stateanchor = "middle";
        // paper.path(["M",x,state1y,"H",x + w])
        // console.log(state1y)

        if (sensor.type == "accelerometer" ||
            sensor.type == "gyroscope" ||
            sensor.type == "magnetometer" ||
            sensor.type == "stick")
        {
            if (context.compactLayout)
                imgx = x + 5;
            else
                imgx = x - (imgw / 4) + (w / 4);

            var dx = w*0.03;
            imgx = cx - imgw - dx;

            state1x =  (imgx + imgw) + 10;
            state1y = y + h/2;
            stateanchor = 'start';

            imgy += h*0.05;
            state1y += h*0.05;

        }
        if(sensor.type == "buzzer"){
            var sizeRatio = imgw/w;
            if(sizeRatio > 0.75){
                imgw = 0.75*w;
                imgh = imgw;
            }
        }


        var portx = state1x;
        var porty = imgy;



        var portsize = sensor.drawInfo.height * 0.11;

        // if (context.compactLayout)
        //     var statesize = sensor.drawInfo.height * 0.14;
        // else
        //     var statesize = sensor.drawInfo.height * 0.10;

        var namesize = sensor.drawInfo.height * 0.15;
        statesize = namesize;
        portsize = namesize;

        var maxNameSize = 25;
        var maxStateSize = 20;
        // console.log(context.compactLayout,statesize)



        var drawPortText = true;
        var drawName = true;

        drawPortText = false;

        if (!sensor.focusrect || isElementRemoved(sensor.focusrect)){
            sensor.focusrect = paper.rect(imgx, imgy, imgw, imgh);
        }

        sensor.focusrect.attr({
            "fill": "468DDF",
            "fill-opacity": 0,
            "opacity": 0,
            "x": imgx,
            "y": imgy,
            "width": imgw,
            "height": imgh,
        });

        if (context.autoGrading) {

            scrolloffset = $('#virtualSensors').scrollLeft();

            if (scrolloffset > 0)
                fadeopacity = 0.3;

            imgw = w * .80;
            imgh = sensor.drawInfo.height * .80;

            imgx = sensor.drawInfo.x + (imgw * 0.75) + scrolloffset;
            imgy = sensor.drawInfo.y + (sensor.drawInfo.height / 2) - (imgh / 2);

            state1x = imgx + imgw * 1.2;
            state1y = imgy + (imgh / 2);

            portx = x;
            porty = imgy + (imgh / 2);

            portsize = imgh / 3;
            statesize = sensor.drawInfo.height * 0.2;

            namex = portx;
            namesize = portsize;
            nameanchor = "start";
        }
        namesize = Math.min(namesize,maxNameSize);
        statesize = Math.min(statesize,maxStateSize);
        if(sameFont){
            // namesize = h*0.12;
            statesize = namesize;
            // console.log(statesize)
        }

        var sensorAttr = {
            "x": imgx,
            "y": imgy,
            "width": imgw,
            "height": imgh,
        };

        if (sensor.type == "led") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (sensor.state == null)
                sensor.state = 0;

            if (!sensor.ledoff || isElementRemoved(sensor.ledoff)) {
                sensor.ledoff = paper.image(getImg('ledoff.png'), imgx, imgy, imgw, imgh);

                    sensor.focusrect.click(function () {
                        if (!context.autoGrading && (!context.runner || !context.runner.isRunning())) {
                            sensor.state = !sensor.state;
                            warnClientSensorStateChanged(sensor);
                            drawSensor(sensor);
                        } else {
                            actuatorsInRunningModeError();
                        }
                    });
            }

            if (!sensor.ledon || isElementRemoved(sensor.ledon)) {
                var imagename = "ledon-";
                if (sensor.subType)
                    imagename += sensor.subType;
                else
                    imagename += "red";

                imagename += ".png";
                sensor.ledon = paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
            }

            sensor.ledon.attr(sensorAttr);
            sensor.ledoff.attr(sensorAttr);

            if (sensor.showAsAnalog)
            {
                sensor.stateText = paper.text(state1x, state1y, sensor.state);
            }
            else
            {
                if (sensor.state) {
                    sensor.stateText = paper.text(state1x, state1y, strings.messages.on.toUpperCase());
                } else {
                    sensor.stateText = paper.text(state1x, state1y, strings.messages.off.toUpperCase());
                }
            }

            if (sensor.state) {
                sensor.ledon.attr({ "opacity": fadeopacity });
                sensor.ledoff.attr({ "opacity": 0 });
            } else {
                sensor.ledon.attr({ "opacity": 0 });
                sensor.ledoff.attr({ "opacity": fadeopacity });
            }

            // var x = typeof sensor.state;

            if(typeof sensor.state == 'number' ) {
                sensor.ledon.attr({ "opacity": sensor.state * fadeopacity });
                sensor.ledoff.attr({ "opacity": fadeopacity });
            }


            if ((!context.runner || !context.runner.isRunning())
                && !context.offLineMode) {

                sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function(x) {});
            }
        } else if (sensor.type == "ledmatrix") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.state || !sensor.state.length)
                sensor.state = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];

            var ledmatrixOnAttr = {
                "fill": "red",
                "stroke": "darkgray"
            };
            var ledmatrixOffAttr = {
                "fill": "lightgray",
                "stroke": "darkgray"
            };

            if (!sensor.ledmatrix || isElementRemoved(sensor.ledmatrix[0][0])) {
                sensor.ledmatrix = [];
                for(var i = 0; i < 5; i++) {
                    sensor.ledmatrix[i] = [];
                    for(var j = 0; j < 5; j++) {
                        sensor.ledmatrix[i][j] = paper.rect(imgx + (imgw/5)*i, imgy + (imgh/5)*j, imgw/5, imgh/5);
                        sensor.ledmatrix[i][j].attr(ledmatrixOffAttr);
                    }
                }
            }

            for(var i = 0; i < 5; i++) {
                for(var j = 0; j < 5; j++) {
                    if(sensor.state[i][j]) {
                        sensor.ledmatrix[i][j].attr(ledmatrixOnAttr);
                    } else {
                        sensor.ledmatrix[i][j].attr(ledmatrixOffAttr);
                    }
                }
            }

            function ledMatrixListener(imgx, imgy, imgw, imgh, sensor) {
                return function(e) {
                    var i = Math.floor((e.offsetX - imgx) / (imgw/5));
                    var j = Math.floor((e.offsetY - imgy) / (imgh/5));
                    sensor.state[i][j] = !sensor.state[i][j] ? 1 : 0;
                    sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function() {});
                    drawSensor(sensor);
                }
            }

            sensor.focusrect.unclick();
            sensor.focusrect.click(ledMatrixListener(imgx, imgy, imgw, imgh, sensor));
        }
        else if (sensor.type == "buzzer") {
            if(typeof sensor.state == 'number' &&
               sensor.state != 0 &&
               sensor.state != 1) {
                buzzerSound.start(sensor.name, sensor.state);
            } else if (sensor.state) {
                buzzerSound.start(sensor.name);
            } else {
                buzzerSound.stop(sensor.name);
            }

            if(!juststate) {
                if(sensor.muteBtn) {
                    sensor.muteBtn.remove();
                }


                // var muteBtnSize = w * 0.15;
                var muteBtnSize = imgw * 0.3;
                sensor.muteBtn = paper.text(
                    imgx + imgw*0.8,
                    imgy + imgh*0.8,
                    buzzerSound.isMuted(sensor.name) ? "\uf6a9" : "\uf028"
                );
                sensor.muteBtn.node.style.fontWeight = "bold";
                sensor.muteBtn.node.style.cursor = "default";
                sensor.muteBtn.node.style.MozUserSelect = "none";
                sensor.muteBtn.node.style.WebkitUserSelect = "none";
                sensor.muteBtn.attr({
                    "font-size": muteBtnSize + "px",
                    fill: buzzerSound.isMuted(sensor.name) ? "lightgray" : "#468DDF",
                    "font-family": '"Font Awesome 5 Free"',
                    'text-anchor': 'start',
                    "cursor": "pointer"
                });
                var bbox = sensor.muteBtn.getBBox();

                sensor.muteBtn.click(function () {
                    if(buzzerSound.isMuted(sensor.name)) {
                        buzzerSound.unmute(sensor.name)
                    } else {
                        buzzerSound.mute(sensor.name)
                    }
                    drawSensor(sensor);
                });
                sensor.muteBtn.toFront();
            }


            if (!sensor.buzzeron || isElementRemoved(sensor.buzzeron))
                sensor.buzzeron = paper.image(getImg('buzzer-ringing.png'), imgx, imgy, imgw, imgh);

            if (!sensor.buzzeroff || isElementRemoved(sensor.buzzeroff)) {
                sensor.buzzeroff = paper.image(getImg('buzzer.png'), imgx, imgy, imgw, imgh);

                    sensor.focusrect.click(function () {
                        if (!context.autoGrading && (!context.runner || !context.runner.isRunning())) {
                            sensor.state = !sensor.state;
                            warnClientSensorStateChanged(sensor);
                            drawSensor(sensor);
                        } else {
                            actuatorsInRunningModeError();
                        }
                    });
            }

            if (sensor.state) {
                if (!sensor.buzzerInterval) {
                    sensor.buzzerInterval = setInterval(function () {

                        if (!sensor.removed) {
                            sensor.ringingState = !sensor.ringingState;
                            drawSensor(sensor, true, true);
                        } else {
                            clearInterval(sensor.buzzerInterval);
                        }

                    }, 100);
                }
            } else {
                if (sensor.buzzerInterval) {
                    clearInterval(sensor.buzzerInterval);
                    sensor.buzzerInterval = null;
                    sensor.ringingState = null;
                }
            }
            sensor.buzzeron.attr(sensorAttr);
            sensor.buzzeroff.attr(sensorAttr);

            var drawState = sensor.state;
            if (sensor.ringingState != null)
                drawState = sensor.ringingState;

            if (drawState) {
                sensor.buzzeron.attr({ "opacity": fadeopacity });
                sensor.buzzeroff.attr({ "opacity": 0 });


            } else {
                sensor.buzzeron.attr({ "opacity": 0 });
                sensor.buzzeroff.attr({ "opacity": fadeopacity });
            }

            if (sensor.stateText)
                sensor.stateText.remove();

            var stateText = sensorHandler.findSensorDefinition(sensor).getStateString(sensor.state);

            sensor.stateText = paper.text(state1x, state1y, stateText);


            if ((!context.runner || !context.runner.isRunning())
                && !context.offLineMode) {

                var setLiveState = sensorHandler.findSensorDefinition(sensor).setLiveState;

                if (setLiveState) {
                    setLiveState(sensor, sensor.state, function(x) {});
                }
            }

        }
        else if (sensor.type == "button") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.buttonon || isElementRemoved(sensor.buttonon))
                sensor.buttonon = paper.image(getImg('buttonon.png'), imgx, imgy, imgw, imgh);

            if (!sensor.buttonoff || isElementRemoved(sensor.buttonoff))
                sensor.buttonoff = paper.image(getImg('buttonoff.png'), imgx, imgy, imgw, imgh);

            if (sensor.state == null)
                sensor.state = false;

            sensor.buttonon.attr(sensorAttr);
            sensor.buttonoff.attr(sensorAttr);

            if (sensor.state) {
                sensor.buttonon.attr({ "opacity": fadeopacity });
                sensor.buttonoff.attr({ "opacity": 0 });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.on.toUpperCase());
            } else {
                sensor.buttonon.attr({ "opacity": 0 });
                sensor.buttonoff.attr({ "opacity": fadeopacity });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.off.toUpperCase());
            }

            if (!context.autoGrading && !sensor.buttonon.node.onmousedown) {
                sensor.focusrect.node.onmousedown = function () {
                    if (context.offLineMode) {
                        sensor.state = true;
                        warnClientSensorStateChanged(sensor);
                        drawSensor(sensor);
                    } else
                        sensorInConnectedModeError();
                };


                sensor.focusrect.node.onmouseup = function () {
                    if (context.offLineMode) {
                        sensor.state = false;
                        sensor.wasPressed = true;
                        warnClientSensorStateChanged(sensor);
                        drawSensor(sensor);

                        if (sensor.onPressed)
                            sensor.onPressed();
                    } else
                        sensorInConnectedModeError();
                }

                sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
                sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
            }
        } else if (sensor.type == "galaxia") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.galaxia || isElementRemoved(sensor.galaxia))
                sensor.galaxia = paper.image(getImg('galaxia.svg'), imgx, imgy, imgw, imgh);

            if (sensor.state == null)
                sensor.state = false;

            sensor.galaxia.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
            });

            if (sensor.state) {
                /*sensor.buttonon.attr({ "opacity": fadeopacity });
                sensor.buttonoff.attr({ "opacity": 0 });*/
            } else {
                /*sensor.buttonon.attr({ "opacity": 0 });
                sensor.buttonoff.attr({ "opacity": fadeopacity });*/
            }

            if (!context.autoGrading) {
                // sensor.focusrect.node.onmousedown = function () {
                //     if (context.offLineMode) {
                //         sensor.state = true;
                //         warnClientSensorStateChanged(sensor);
                //         drawSensor(sensor);
                //     } else
                //         sensorInConnectedModeError();
                // };


                // sensor.focusrect.node.onmouseup = function () {
                //     if (context.offLineMode) {
                //         sensor.state = false;
                //         sensor.wasPressed = true;
                //         warnClientSensorStateChanged(sensor);
                //         drawSensor(sensor);

                //         if (sensor.onPressed)
                //             sensor.onPressed();
                //     } else
                //         sensorInConnectedModeError();
                // }

                // sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
                // sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
            }
        }
        else if (sensor.type == "screen") {
            if (sensor.stateText) {
                sensor.stateText.remove();
                sensor.stateText = null;
            }

            var borderSize = 5;

            var screenScale = 1.5;
            if(w < 300) {
                screenScale = 1;
            }
            if(w < 150) {
                screenScale = 0.5;
            }
            // console.log(screenScale,w,h)

            var screenScalerSize = {
                width: 128 * screenScale,
                height: 32 * screenScale
            }
            borderSize = borderSize * screenScale;

            imgw = screenScalerSize.width + borderSize * 2;
            imgh = screenScalerSize.height + borderSize * 2;
            imgx = x - (imgw / 2) + (w / 2);

            imgy = y + (h - imgh)/2 + h*0.05;

            portx = imgx + imgw + borderSize;
            porty = imgy + imgh / 3;

            statesize = imgh / 3.5;

            if (!sensor.img || isElementRemoved(sensor.img)) {
                sensor.img = paper.image(getImg('screen.png'), imgx, imgy, imgw, imgh);
            }

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            if (sensor.state) {
                if (sensor.state.isDrawingData) {
                    if (!sensor.screenrect ||
                        isElementRemoved(sensor.screenrect) ||
                        !sensor.canvasNode) {
                        sensor.screenrect = paper.rect(imgx, imgy, screenScalerSize.width, screenScalerSize.height);

                        sensor.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
                        sensor.canvasNode.setAttribute("x",imgx + borderSize); //Set rect data
                        sensor.canvasNode.setAttribute("y",imgy + borderSize); //Set rect data
                        sensor.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
                        sensor.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data
                        paper.canvas.appendChild(sensor.canvasNode);

                        sensor.canvas = document.createElement("canvas");
                        sensor.canvas.id = "screencanvas";
                        sensor.canvas.width = screenScalerSize.width;
                        sensor.canvas.height = screenScalerSize.height;
                        sensor.canvasNode.appendChild(sensor.canvas);
                    }

                    $(sensor.canvas).css({ opacity: fadeopacity });
                    sensor.canvasNode.setAttribute("x", imgx + borderSize); //Set rect data
                    sensor.canvasNode.setAttribute("y", imgy + borderSize); //Set rect data
                    sensor.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
                    sensor.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data

                    sensor.screenrect.attr({
                        "x": imgx + borderSize,
                        "y": imgy + borderSize,
                        "width": 128,
                        "height": 32,
                    });

                    sensor.screenrect.attr({ "opacity": 0 });

                    context.initScreenDrawing(sensor);
                    //sensor.screenDrawing.copyToCanvas(sensor.canvas, screenScale);
                    screenDrawing.renderToCanvas(sensor.state, sensor.canvas, screenScale);
                } else {
                    var statex = imgx + (imgw * .05);

                    var statey = imgy + (imgh * .2);

                    if (sensor.state.line1.length > 16)
                        sensor.state.line1 = sensor.state.line1.substring(0, 16);

                    if (sensor.state.line2 && sensor.state.line2.length > 16)
                        sensor.state.line2 = sensor.state.line2.substring(0, 16);

                    if (sensor.canvasNode) {
                        $(sensor.canvasNode).remove();
                        sensor.canvasNode = null;
                    }

                    sensor.stateText = paper.text(statex, statey, sensor.state.line1 + "\n" + (sensor.state.line2 ? sensor.state.line2 : ""));
                    stateanchor = "start";
                    sensor.stateText.attr("")
                }
            }
        }
        else if (sensor.type == "temperature") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (sensor.state == null)
                sensor.state = 25; // FIXME

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('temperature-cold.png'), imgx, imgy, imgw, imgh);

            if (!sensor.img2 || isElementRemoved(sensor.img2))
                sensor.img2 = paper.image(getImg('temperature-hot.png'), imgx, imgy, imgw, imgh);

            if (!sensor.img3 || isElementRemoved(sensor.img3))
                sensor.img3 = paper.image(getImg('temperature-overlay.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,

            });
            sensor.img2.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            sensor.img3.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            var scale = imgh / 60;

            var cliph = scale * sensor.state;

            sensor.img2.attr({
                "clip-rect":
                    imgx + "," +
                    (imgy + imgh - cliph) + "," +
                    (imgw) + "," +
                    cliph
            });

            sensor.stateText = paper.text(state1x, state1y, sensor.state + " °C");

            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 60);
            }
            else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }

        }
        else if (sensor.type == "servo") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('servo.png'), imgx, imgy, imgw, imgh);

            if (!sensor.pale || isElementRemoved(sensor.pale))
                sensor.pale = paper.image(getImg('servo-pale.png'), imgx, imgy, imgw, imgh);


            if (!sensor.center || isElementRemoved(sensor.center))
                sensor.center = paper.image(getImg('servo-center.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });
            sensor.pale.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "transform": "",
                "opacity": fadeopacity,
            });
            sensor.center.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            sensor.pale.rotate(sensor.state);

            if (sensor.state == null)
                sensor.state = 0;

            sensor.state = Math.round(sensor.state);

            sensor.stateText = paper.text(state1x, state1y, sensor.state + "°");

            if ((!context.runner || !context.runner.isRunning())
                && !context.offLineMode) {
                if (!sensor.updatetimeout) {
                    sensor.updatetimeout = setTimeout(function () {

                        sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function(x) {});

                        sensor.updatetimeout = null;
                    }, 100);
                }
            }

            if (!context.autoGrading &&
                (!context.runner || !context.runner.isRunning())) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 180);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "potentiometer") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('potentiometer.png'), imgx, imgy, imgw, imgh);

            if (!sensor.pale || isElementRemoved(sensor.pale))
                sensor.pale = paper.image(getImg('potentiometer-pale.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            sensor.pale.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "transform": "",
                "opacity": fadeopacity,
            });

            if (sensor.state == null)
                sensor.state = 0;

            sensor.pale.rotate(sensor.state * 3.6);

            sensor.stateText = paper.text(state1x, state1y, sensor.state + "%");

            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }

        }
        else if (sensor.type == "range") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('range.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy - imgh*0.1,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            if (sensor.state == null)
                sensor.state = 500;

            if (sensor.rangedistance)
                sensor.rangedistance.remove();

            if (sensor.rangedistancestart)
                sensor.rangedistancestart.remove();

            if (sensor.rangedistanceend)
                sensor.rangedistanceend.remove();

            var rangew;

            if (sensor.state < 30) {
                rangew = imgw * sensor.state / 100;
            } else {
                var firstpart = imgw * 30 / 100;
                var remaining = imgw - firstpart;

                rangew = firstpart + (remaining * (sensor.state) * 0.0015);
            }

            var cx = imgx + (imgw / 2);
            var cy = imgy + imgh*0.85;
            var x1 = cx - rangew/2;
            var x2 = cx + rangew/2;
            var markh = 12;
            var y1 = cy - markh/2;
            var y2 = cy + markh/2;

            sensor.rangedistance = paper.path(["M",x1,cy,"H",x2]);
            sensor.rangedistancestart = paper.path(["M",x1,y1,"V",y2]);
            sensor.rangedistanceend = paper.path(["M",x2,y1,"V",y2]);

            sensor.rangedistance.attr({
                "stroke-width": 4,
                "stroke": "#468DDF",
                "stroke-linecapstring": "round"
            });

            sensor.rangedistancestart.attr({
                "stroke-width": 4,
                "stroke": "#468DDF",
                "stroke-linecapstring": "round"
            });


            sensor.rangedistanceend.attr({
                "stroke-width": 4,
                "stroke": "#468DDF",
                "stroke-linecapstring": "round"
            });

            if (sensor.state >= 10)
                sensor.state = Math.round(sensor.state);

            sensor.stateText = paper.text(state1x, state1y, sensor.state + " cm");
            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 500);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "light") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('light.png'), imgx, imgy, imgw, imgh);

            if (!sensor.moon || isElementRemoved(sensor.moon))
                sensor.moon = paper.image(getImg('light-moon.png'), imgx, imgy, imgw, imgh);

            if (!sensor.sun || isElementRemoved(sensor.sun))
                sensor.sun = paper.image(getImg('light-sun.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            if (sensor.state == null)
                sensor.state = 0;

            if (sensor.state > 50) {
                var opacity = (sensor.state - 50) * 0.02;
                sensor.sun.attr({
                    "x": imgx,
                    "y": imgy,
                    "width": imgw,
                    "height": imgh,
                    "opacity": opacity * .80 * fadeopacity
                });
                sensor.moon.attr({ "opacity": 0 });
            }
            else {
                var opacity = (50 - sensor.state) * 0.02;
                sensor.moon.attr({
                    "x": imgx,
                    "y": imgy,
                    "width": imgw,
                    "height": imgh,
                    "opacity": opacity * .80 * fadeopacity
                });
                sensor.sun.attr({ "opacity": 0 });
            }

            sensor.stateText = paper.text(state1x, state1y, sensor.state + "%");
            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "humidity") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('humidity.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            if (sensor.state == null)
                sensor.state = 0;

            sensor.stateText = paper.text(state1x, state1y, sensor.state + "%");
            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "accelerometer") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('accel.png'), imgx, imgy, imgw, imgh);

            // paper.rect(x,y,w,h)
            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });


            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.state)
            {
                sensor.state = [0, 0, 1];
            }

            if (sensor.state) {
                if(sideTextSmall)
                    statesize = h*0.12;
                try {
                    var str = "X: " + sensor.state[0] + " m/s²\nY: " + sensor.state[1] + " m/s²\nZ: " + sensor.state[2] + " m/s²";
                    sensor.stateText = paper.text(cx, state1y, str);
                } catch (Err)
                {
                    var a = 1;
                }
                // var bbox = sensor.stateText.getBBox();
                // sensor.stateText.attr("y",cy - bbox.height/2);
            }

            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -8 * 9.81, 8 * 9.81);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "gyroscope") {
            if (!sensor.state) {
                sensor.state = [0, 0, 0];
            }
            if (sensor.stateText) {
                sensor.stateText.remove();
            }
            if(sideTextSmall)
                statesize = h*0.12;

            var str = "X: " + sensor.state[0] + "°/s\nY: " + sensor.state[1] + "°/s\nZ: " + sensor.state[2] + "°/s";
            sensor.stateText = paper.text(cx, state1y, str);
            if (!sensor.previousState)
                sensor.previousState = [0, 0, 0];

            if (sensor.rotationAngles != undefined) {

                // update the rotation angle
                for (var i = 0; i < 3; i++)
                    sensor.rotationAngles[i] += sensor.previousState[i] * ((new Date() - sensor.lastSpeedChange) / 1000);

                sensor.lastSpeedChange = new Date();
            }


            sensor.previousState = sensor.state;

            if (!context.autoGrading && context.offLineMode) {
                var img3d = gyroscope3D.getInstance(imgw, imgh);
            }
            if(img3d) {
                if (!sensor.screenrect || isElementRemoved(sensor.screenrect)) {
                    sensor.screenrect = paper.rect(imgx, imgy, imgw, imgh);
                    sensor.screenrect.attr({ "opacity": 0 });

                    sensor.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
                    sensor.canvasNode.setAttribute("x", imgx);
                    sensor.canvasNode.setAttribute("y", imgy);
                    sensor.canvasNode.setAttribute("width", imgw);
                    sensor.canvasNode.setAttribute("height", imgh);
                    paper.canvas.appendChild(sensor.canvasNode);

                    sensor.canvas = document.createElement("canvas");
                    sensor.canvas.width = imgw;
                    sensor.canvas.height = imgh;
                    sensor.canvasNode.appendChild(sensor.canvas);
                }

                var sensorCtx = sensor.canvas.getContext('2d');
                sensorCtx.clearRect(0, 0, imgw, imgh);

                sensorCtx.drawImage(img3d.render(
                    sensor.state[0],
                    sensor.state[2],
                    sensor.state[1]
                ), 0, 0);

                if(!juststate) {
                    sensor.focusrect.drag(
                        function(dx, dy, x, y, event) {
                            sensor.state[0] = Math.max(-125, Math.min(125, sensor.old_state[0] + dy));
                            sensor.state[1] = Math.max(-125, Math.min(125, sensor.old_state[1] - dx));
                            warnClientSensorStateChanged(sensor);
                            drawSensor(sensor, true)
                        },
                        function() {
                            sensor.old_state = sensor.state.slice();
                        }
                    );
                }

            } else {

                if (!sensor.img || isElementRemoved(sensor.img)) {
                    sensor.img = paper.image(getImg('gyro.png'), imgx, imgy, imgw, imgh);
                }
                sensor.img.attr({
                    "x": imgx,
                    "y": imgy,
                    "width": imgw,
                    "height": imgh,
                    "opacity": fadeopacity,
                });
                if (!context.autoGrading && context.offLineMode) {
                    setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -125, 125);
                } else {
                    sensor.focusrect.click(function () {
                        sensorInConnectedModeError();
                    });

                    removeSlider(sensor);
                }
            }
        }
        else if (sensor.type == "magnetometer") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('mag.png'), imgx, imgy, imgw, imgh);

            if (!sensor.needle || isElementRemoved(sensor.needle))
                sensor.needle = paper.image(getImg('mag-needle.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            sensor.needle.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "transform": "",
                "opacity": fadeopacity,
            });

            if (!sensor.state)
            {
                sensor.state = [0, 0, 0];
            }

            if (sensor.state) {
                var heading = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

                sensor.needle.rotate(heading);
            }

            if (sensor.stateText)
                sensor.stateText.remove();

            if (sensor.state) {
                if(sideTextSmall)
                    statesize = h*0.12;

                var str = "X: " + sensor.state[0] + " μT\nY: " + sensor.state[1] + " μT\nZ: " + sensor.state[2] + " μT";
                sensor.stateText = paper.text(cx, state1y, str);
            }

            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -1600, 1600);
            } else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }
        }
        else if (sensor.type == "sound") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (sensor.state == null)
                sensor.state = 25; // FIXME

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('sound.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": fadeopacity,
            });

            // if we just do sensor.state, if it is equal to 0 then the state is not displayed
            if (sensor.state != null) {
                sensor.stateText = paper.text(state1x, state1y, sensor.state + " dB");
            }

            if (!context.autoGrading && context.offLineMode) {
                setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 60);
            }
            else {
                sensor.focusrect.click(function () {
                    sensorInConnectedModeError();
                });

                removeSlider(sensor);
            }

        }
        else if (sensor.type == "irtrans") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.ledon || isElementRemoved(sensor.ledon)) {
                sensor.ledon = paper.image(getImg("irtranson.png"), imgx, imgy, imgw, imgh);
            }

            if (!sensor.ledoff || isElementRemoved(sensor.ledoff)) {
                sensor.ledoff = paper.image(getImg('irtransoff.png'), imgx, imgy, imgw, imgh);

                    sensor.focusrect.click(function () {
                        if (!context.autoGrading && (!context.runner || !context.runner.isRunning())
                            && !context.offLineMode) {
                            //sensor.state = !sensor.state;
                            //drawSensor(sensor);
                            window.displayHelper.showPopupDialog(irRemoteDialog, function () {
                                $('#picancel').click(function () {
                                    $('#popupMessage').hide();
                                    window.displayHelper.popupMessageShown = false;
                                });

                                $('#picancel2').click(function () {
                                    $('#popupMessage').hide();
                                    window.displayHelper.popupMessageShown = false;
                                });

                                var addedSomeButtons = false;
                                var remotecontent = document.getElementById('piremotecontent');
                                var parentdiv = document.createElement("DIV");
                                parentdiv.className  = "form-group";

                                remotecontent.appendChild(parentdiv);
                                var count = 0;
                                for (var code in context.remoteIRcodes)
                                {
                                    addedSomeButtons = true;
                                    context.remoteIRcodes[code];

                                    var btn = document.createElement("BUTTON");
                                    var t = document.createTextNode(code);

                                    btn.className = "btn";
                                    btn.appendChild(t);
                                    parentdiv.appendChild(btn);

                                    let capturedcode = code;
                                    let captureddata = context.remoteIRcodes[code];
                                    btn.onclick = function() {
                                        $('#popupMessage').hide();
                                        window.displayHelper.popupMessageShown = false;

                                        //if (sensor.waitingForIrMessage)
                                            //sensor.waitingForIrMessage(capturedcode);

                                        context.quickPiConnection.sendCommand("presetIRMessage(\"" + capturedcode + "\", '" + captureddata + "')", function(returnVal) {});
                                        context.quickPiConnection.sendCommand("sendIRMessage(\"irtran1\", \"" + capturedcode + "\")", function(returnVal) {});

                                    };

                                    count += 1;

                                    if (count == 4)
                                    {
                                        count = 0;
                                        parentdiv = document.createElement("DIV");
                                        parentdiv.className  = "form-group";
                                        remotecontent.appendChild(parentdiv);
                                    }
                                }
                                if (!addedSomeButtons)
                                {
                                    $('#piremotemessage').text(strings.messages.noIrPresets);
                                }

                                var btn = document.createElement("BUTTON");

                                if (sensor.state)
                                    var t = document.createTextNode(strings.messages.irDisableContinous);
                                else
                                    var t = document.createTextNode(strings.messages.irEnableContinous);


                                btn.className = "btn";
                                btn.appendChild(t);
                                parentdiv.appendChild(btn);
                                btn.onclick = function() {
                                    $('#popupMessage').hide();
                                    window.displayHelper.popupMessageShown = false;

                                    sensor.state = !sensor.state;
                                    warnClientSensorStateChanged(sensor);
                                    drawSensor(sensor);
                                };
                            });
                        } else {
                            actuatorsInRunningModeError();
                        }
                    });
            }

            sensor.ledon.attr(sensorAttr);
            sensor.ledoff.attr(sensorAttr);

            if (sensor.state) {
                sensor.ledon.attr({ "opacity": fadeopacity });
                sensor.ledoff.attr({ "opacity": 0 });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.on.toUpperCase());
            } else {
                sensor.ledon.attr({ "opacity": 0 });
                sensor.ledoff.attr({ "opacity": fadeopacity });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.off.toUpperCase());
            }


            if ((!context.runner || !context.runner.isRunning())
                && !context.offLineMode) {

                sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function(x) {});
            }
        }
        else if (sensor.type == "irrecv") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.buttonon || isElementRemoved(sensor.buttonon))
                sensor.buttonon = paper.image(getImg('irrecvon.png'), imgx, imgy, imgw, imgh);

            if (!sensor.buttonoff || isElementRemoved(sensor.buttonoff))
                sensor.buttonoff = paper.image(getImg('irrecvoff.png'), imgx, imgy, imgw, imgh);

            sensor.buttonon.attr(sensorAttr);
            sensor.buttonoff.attr(sensorAttr);

            if (sensor.state) {
                sensor.buttonon.attr({ "opacity": fadeopacity });
                sensor.buttonoff.attr({ "opacity": 0 });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.on.toUpperCase());
            } else {
                sensor.buttonon.attr({ "opacity": 0 });
                sensor.buttonoff.attr({ "opacity": fadeopacity });

                sensor.stateText = paper.text(state1x, state1y, strings.messages.off.toUpperCase());
            }

            sensor.focusrect.click(function () {
                if (context.offLineMode) {
                    window.displayHelper.showPopupDialog(irRemoteDialog, function () {
                        $('#picancel').click(function () {
                            $('#popupMessage').hide();
                            window.displayHelper.popupMessageShown = false;
                        });

                        $('#picancel2').click(function () {
                            $('#popupMessage').hide();
                            window.displayHelper.popupMessageShown = false;
                        });

                        var addedSomeButtons = false;
                        var remotecontent = document.getElementById('piremotecontent');
                        var parentdiv = document.createElement("DIV");
                        parentdiv.className  = "form-group";

                        remotecontent.appendChild(parentdiv);
                        var count = 0;
                        for (var code in context.remoteIRcodes)
                        {
                            addedSomeButtons = true;
                            context.remoteIRcodes[code];

                            var btn = document.createElement("BUTTON");
                            var t = document.createTextNode(code);

                            btn.className = "btn";
                            btn.appendChild(t);
                            parentdiv.appendChild(btn);

                            let capturedcode = code;
                            btn.onclick = function() {
                                $('#popupMessage').hide();
                                window.displayHelper.popupMessageShown = false;

                                if (sensor.waitingForIrMessage)
                                    sensor.waitingForIrMessage(capturedcode);
                            };

                            count += 1;

                            if (count == 4)
                            {
                                count = 0;
                                parentdiv = document.createElement("DIV");
                                parentdiv.className  = "form-group";
                                remotecontent.appendChild(parentdiv);
                            }
                        }
                        if (!addedSomeButtons)
                        {
                            $('#piremotemessage').text(strings.messages.noIrPresets);
                        }

                        var btn = document.createElement("BUTTON");

                        if (sensor.state)
                            var t = document.createTextNode(strings.messages.irDisableContinous);
                        else
                            var t = document.createTextNode(strings.messages.irEnableContinous);


                        btn.className = "btn";
                        btn.appendChild(t);
                        parentdiv.appendChild(btn);
                        btn.onclick = function() {
                            $('#popupMessage').hide();
                            window.displayHelper.popupMessageShown = false;

                            sensor.state = !sensor.state;
                            warnClientSensorStateChanged(sensor);
                            drawSensor(sensor);
                        };
                    });
                }
                else{
                    //sensorInConnectedModeError();

                    context.stopLiveUpdate = true;

                    var irLearnDialog = "<div class=\"content qpi\">" +
                        "   <div class=\"panel-heading\">" +
                        "       <h2 class=\"sectionTitle\">" +
                        "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
                                    strings.messages.irReceiverTitle +
                        "       </h2>" +
                        "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
                        "   </div>" +
                        "   <div id=\"sensorPicker\" class=\"panel-body\">" +
                        "       <div class=\"form-group\">" +
                        "           <p>" + strings.messages.directIrControl + "</p>" +
                        "       </div>" +
                        "       <div class=\"form-group\">" +
                        "           <p id=piircode></p>" +
                        "       </div>" +
                        "   </div>" +
                        "   <div class=\"singleButton\">" +
                        "       <button id=\"piirlearn\" class=\"btn\"><i class=\"fa fa-wifi icon\"></i>" + strings.messages.getIrCode + "</button>" +
                        "       <button id=\"picancel2\" class=\"btn\"><i class=\"fa fa-times icon\"></i>" + strings.messages.closeDialog + "</button>" +
                        "   </div>" +
                        "</div>";

                    window.displayHelper.showPopupDialog(irLearnDialog, function () {
                        $('#picancel').click(function () {
                            $('#popupMessage').hide();
                            window.displayHelper.popupMessageShown = false;
                            context.stopLiveUpdate = false;
                        });

                        $('#picancel2').click(function () {
                            $('#popupMessage').hide();
                            window.displayHelper.popupMessageShown = false;
                            context.stopLiveUpdate = false;
                        });

                        $('#piirlearn').click(function () {

                            $('#piirlearn').attr('disabled', 'disabled');

                            $("#piircode").text("");
                            context.quickPiConnection.sendCommand("readIRMessageCode(\"irrec1\", 10000)", function(retval)
                            {
                                $('#piirlearn').attr('disabled', null);
                                $("#piircode").text(retval);
                            });
                        });
                    });
                }
            });
/*
            if (!context.autoGrading && !sensor.buttonon.node.onmousedown) {
                sensor.focusrect.node.onmousedown = function () {
                    if (context.offLineMode) {
                        sensor.state = true;
                        drawSensor(sensor);
                    } else
                        sensorInConnectedModeError();
                };


                sensor.focusrect.node.onmouseup = function () {
                    if (context.offLineMode) {
                        sensor.state = false;
                        drawSensor(sensor);

                        if (sensor.onPressed)
                            sensor.onPressed();
                    } else
                        sensorInConnectedModeError();
                }

                sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
                sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
            }*/
        }
        else if (sensor.type == "stick") {
            if (sensor.stateText)
                sensor.stateText.remove();

            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('stick.png'), imgx, imgy, imgw, imgh);

            if (!sensor.imgup || isElementRemoved(sensor.imgup))
                sensor.imgup = paper.image(getImg('stickup.png'), imgx, imgy, imgw, imgh);

            if (!sensor.imgdown || isElementRemoved(sensor.imgdown))
                sensor.imgdown = paper.image(getImg('stickdown.png'), imgx, imgy, imgw, imgh);

            if (!sensor.imgleft || isElementRemoved(sensor.imgleft))
                sensor.imgleft = paper.image(getImg('stickleft.png'), imgx, imgy, imgw, imgh);

            if (!sensor.imgright || isElementRemoved(sensor.imgright))
                sensor.imgright = paper.image(getImg('stickright.png'), imgx, imgy, imgw, imgh);

            if (!sensor.imgcenter || isElementRemoved(sensor.imgcenter))
                sensor.imgcenter = paper.image(getImg('stickcenter.png'), imgx, imgy, imgw, imgh);

            var a = {
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
                "opacity": 0,
            };
            sensor.img.attr(a).attr("opacity",fadeopacity);

            sensor.imgup.attr(a);
            sensor.imgdown.attr(a);
            sensor.imgleft.attr(a);
            sensor.imgright.attr(a);
            sensor.imgcenter.attr(a);

            if (sensor.stateText)
               sensor.stateText.remove();

            if (!sensor.state)
                sensor.state = [false, false, false, false, false];

            // var stateString = "\n";
            var stateString = "";
            var click = false;
            if (sensor.state[0]) {
                stateString += strings.messages.up.toUpperCase() + "\n";
                sensor.imgup.attr({ "opacity": 1 });
                click = true;
            }
            if (sensor.state[1]) {
                stateString += strings.messages.down.toUpperCase() + "\n";
                sensor.imgdown.attr({ "opacity": 1 });
                click = true;
            }
            if (sensor.state[2]) {
                stateString += strings.messages.left.toUpperCase() + "\n";
                sensor.imgleft.attr({ "opacity": 1 });
                click = true;
            }
            if (sensor.state[3]) {
                stateString += strings.messages.right.toUpperCase() + "\n";
                sensor.imgright.attr({ "opacity": 1 });
                click = true;
            }
            if (sensor.state[4]) {
                stateString += strings.messages.center.toUpperCase() + "\n";
                sensor.imgcenter.attr({ "opacity": 1 });
                click = true;
            }
            if(!click){
                stateString += "...";
            }

            sensor.stateText = paper.text(state1x, state1y, stateString);

            if (sensor.portText)
                sensor.portText.remove();

            drawPortText = false;

            if (sensor.portText)
                sensor.portText.remove();

            if (!context.autoGrading) {
                var gpios = sensorHandler.findSensorDefinition(sensor).gpios;
                var min = 255;
                var max = 0;

                for (var i = 0; i < gpios.length; i++) {
                    if (gpios[i] > max)
                        max = gpios[i];

                    if (gpios[i] < min)
                        min = gpios[i];
                }


                $('#stickupstate').text(sensor.state[0] ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase());
                $('#stickdownstate').text(sensor.state[1] ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase());
                $('#stickleftstate').text(sensor.state[2] ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase());
                $('#stickrightstate').text(sensor.state[3] ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase());
                $('#stickcenterstate').text(sensor.state[4] ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase());

/*
                sensor.portText = paper.text(state1x, state1y, "D" + min.toString() + "-D" + max.toString() + "?");
                sensor.portText.attr({ "font-size": portsize + "px", 'text-anchor': 'start', fill: "blue" });
                sensor.portText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
                var b = sensor.portText._getBBox();
                sensor.portText.translate(0, b.height / 2);

                var stickPortsDialog = `
                <div class="content qpi">
                <div class="panel-heading">
                    <h2 class="sectionTitle">
                        <span class="iconTag"><i class="icon fas fa-list-ul"></i></span>
                        Noms et ports de la manette
                    </h2>
                    <div class="exit" id="picancel"><i class="icon fas fa-times"></i></div>
                </div>
                <div id="sensorPicker" class="panel-body">
                    <label></label>
                    <div class="flex-container">
                    <table style="display:table-header-group;">
                    <tr>
                    <th>Name</th>
                    <th>Port</th>
                    <th>State</th>
                    <th>Direction</th>
                    </tr>
                    <tr>
                    <td><label id="stickupname"></td><td><label id="stickupport"></td><td><label id="stickupstate"></td><td><label id="stickupdirection"><i class="fas fa-arrow-up"></i></td>
                    </tr>
                    <tr>
                    <td><label id="stickdownname"></td><td><label id="stickdownport"></td><td><label id="stickdownstate"></td><td><label id="stickdowndirection"><i class="fas fa-arrow-down"></i></td>
                    </tr>
                    <tr>
                    <td><label id="stickleftname"></td><td><label id="stickleftport"></td><td><label id="stickleftstate"></td><td><label id="stickleftdirection"><i class="fas fa-arrow-left"></i></td>
                    </tr>
                    <tr>
                    <td><label id="stickrightname"></td><td><label id="stickrightport"></td><td><label id="stickrightstate"></td><td><label id="stickrightdirection"><i class="fas fa-arrow-right"></i></td>
                    </tr>
                    <tr>
                    <td><label id="stickcentername"></td><td><label id="stickcenterport"></td><td><label id="stickcenterstate"></td><td><label id="stickcenterdirection"><i class="fas fa-circle"></i></td>
                    </tr>
                    </table>
                    </div>
                </div>
                <div class="singleButton">
                    <button id="picancel2" class="btn btn-centered"><i class="icon fa fa-check"></i>Fermer</button>
                </div>
            </div>
                `;

                sensor.portText.click(function () {
                    window.displayHelper.showPopupDialog(stickPortsDialog);

                    $('#picancel').click(function () {
                        $('#popupMessage').hide();
                        window.displayHelper.popupMessageShown = false;
                    });

                    $('#picancel2').click(function () {
                        $('#popupMessage').hide();
                        window.displayHelper.popupMessageShown = false;
                    });

                    $('#stickupname').text(sensor.name + ".up");
                    $('#stickdownname').text(sensor.name + ".down");
                    $('#stickleftname').text(sensor.name + ".left");
                    $('#stickrightname').text(sensor.name + ".right");
                    $('#stickcentername').text(sensor.name + ".center");

                    $('#stickupport').text("D" + gpios[0]);
                    $('#stickdownport').text("D" + gpios[1]);
                    $('#stickleftport').text("D" + gpios[2]);
                    $('#stickrightport').text("D" + gpios[3]);
                    $('#stickcenterport').text("D" + gpios[4]);

                    $('#stickupstate').text(sensor.state[0] ? "ON" : "OFF");
                    $('#stickdownstate').text(sensor.state[1] ? "ON" : "OFF");
                    $('#stickleftstate').text(sensor.state[2] ? "ON" : "OFF");
                    $('#stickrightstate').text(sensor.state[3] ? "ON" : "OFF");
                    $('#stickcenterstate').text(sensor.state[4] ? "ON" : "OFF");

                });
                */
            }


            function poinInRect(rect, x, y) {

                if (x > rect.left && x < rect.right && y > rect.top  && y < rect.bottom)
                    return true;

                return false;
            }

            function moveRect(rect, x, y) {
                rect.left += x;
                rect.right += x;

                rect.top += y;
                rect.bottom += y;
            }

            sensor.focusrect.node.onmousedown = function(evt) {
                if (!context.offLineMode) {
                    sensorInConnectedModeError();
                    return;
                }

                var e = evt.target;
                var dim = e.getBoundingClientRect();
                var rectsize = dim.width * .30;


                var rect = {
                    left: dim.left,
                    right: dim.left + rectsize,
                    top: dim.top,
                    bottom: dim.top + rectsize,
                }

                // Up left
                if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[0] = true;
                    sensor.state[2] = true;
                }

                // Up
                 moveRect(rect, rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[0] = true;
                 }

                 // Up right
                 moveRect(rect, rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[0] = true;
                    sensor.state[3] = true;
                 }

                 // Right
                 moveRect(rect, 0, rectsize);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[3] = true;
                 }

                 // Center
                 moveRect(rect, -rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[4] = true;
                 }

                 // Left
                 moveRect(rect, -rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[2] = true;
                 }

                 // Down left
                 moveRect(rect, 0, rectsize);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[1] = true;
                    sensor.state[2] = true;
                 }

                 // Down
                 moveRect(rect, rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[1] = true;
                 }

                 // Down right
                 moveRect(rect, rectsize, 0);
                 if (poinInRect(rect, evt.clientX, evt.clientY)) {
                    sensor.state[1] = true;
                    sensor.state[3] = true;
                 }

                 warnClientSensorStateChanged(sensor);
                 drawSensor(sensor);
            }

            sensor.focusrect.node.onmouseup = function(evt) {
                if (!context.offLineMode) {
                    sensorInConnectedModeError();
                    return;
                }

                sensor.state = [false, false, false, false, false];
                warnClientSensorStateChanged(sensor);
                drawSensor(sensor);
            }

            sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
            sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
        } 
        else if (sensor.type == "cloudstore") {
            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('cloudstore.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh*0.8,
                "opacity": scrolloffset ? 0.3 : 1,
            });
            
            drawPortText = false;
            // drawName = false;

        } 
        else if (sensor.type == "clock") {
            if (!sensor.img || isElementRemoved(sensor.img))
                sensor.img = paper.image(getImg('clock.png'), imgx, imgy, imgw, imgh);

            sensor.img.attr({
                "x": imgx,
                "y": imgy,
                "width": imgw,
                "height": imgh,
            });

            sensor.stateText = paper.text(state1x, state1y, context.currentTime.toString() + "ms");

            drawPortText = false;
            drawName = false;
        }
        else if(sensor.type == "adder"){
            drawCustomSensorAdder(x,y,w,h,namesize);
            return
        }


        if (sensor.stateText) {
            try {
                var statecolor = "gray";
                // if (context.compactLayout)
                //     statecolor = "black";
                // console.log(statesize)
                sensor.stateText.attr({ 
                    "font-size": statesize, 
                    'text-anchor': stateanchor, 
                    'font-weight': fontWeight, 
                    fill: statecolor });
                // var b = sensor.stateText._getBBox();
                // sensor.stateText.translate(0, b.height/2);
                sensor.stateText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
            } catch (err) {
            }
        }


		if (drawPortText) {
        	if (sensor.portText)
            	sensor.portText.remove();

        	sensor.portText = paper.text(portx, porty, sensor.port);
        	sensor.portText.attr({ "font-size": portsize + "px", 'text-anchor': 'start', fill: "gray" });
        	sensor.portText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
        	var b = sensor.portText._getBBox();
        	sensor.portText.translate(0,b.height/2);
		}

        if (sensor.nameText) {
            sensor.nameText.remove();
        }


        if (drawName) {
            if (sensor.name) {
                let sensorId = sensor.name;
                if (context.useportforname)
                    sensorId = sensor.port;

                sensor.nameText = paper.text(namex, namey, sensorId );
                // sensor.nameText = paper.text(namex, namey, sensor.name );
                sensor.nameText.attr({ 
                    "font-size": namesize,
                    "font-weight": fontWeight, 
                    'text-anchor': nameanchor, 
                    fill: "#7B7B7B" });
                sensor.nameText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
                var bbox = sensor.nameText.getBBox();
                if(bbox.width > w - 20){
                    namesize = namesize*(w - 20)/bbox.width;
                    namey += namesize*(1 - (w - 20)/bbox.width);
                    sensor.nameText.attr({ 
                        "font-size":namesize,
                        y: namey });
                }
            }
        }


        if (!donotmovefocusrect) {
            // This needs to be in front of everything
            sensor.focusrect.toFront();
            if(sensor.muteBtn)
                sensor.muteBtn.toFront();
        }

        saveSensorStateIfNotRunning(sensor);
    }

    function saveSensorStateIfNotRunning(sensor) {
        // save the sensor if we are not running
        if (!(context.runner && context.runner.isRunning())) {
            if (_findFirst(sensorDefinitions, function(globalSensor) {
                return globalSensor.name === sensor.type;
            }).isSensor) {
                context.sensorsSaved[sensor.name] = {
                    state: Array.isArray(sensor.state) ? sensor.state.slice() : sensor.state,
                    screenDrawing: sensor.screenDrawing,
                    lastDrawnTime: sensor.lastDrawnTime,
                    lastDrawnState: sensor.lastDrawnState,
                    callsInTimeSlot: sensor.callsInTimeSlot,
                    lastTimeIncrease: sensor.lastTimeIncrease,
                    removed: sensor.removed,
                    quickStore: sensor.quickStore
                };
            }
        }
    }

    function _findFirst(array, func) {
        for (var i = 0; i < array.length; i++) {
            if (func(array[i]))
                return array[i];
        }
        return undefined;
    }

    context.sensorsSaved = {};

    context.registerQuickPiEvent = function (name, newState, setInSensor = true, allowFail = false) {
        var sensor = sensorHandler.findSensorByName(name);
        if (!sensor) {
            context.success = false;
            throw (strings.messages.sensorNotFound.format(name));
        }

        if (setInSensor) {
            sensor.state = newState;
            drawSensor(sensor);
        }

        if (context.autoGrading && context.gradingStatesBySensor != undefined) {
            var fail = false;
            var type = "actual";

            if(!context.actualStatesBySensor[name]) {
                context.actualStatesBySensor[name] = [];
            }
            var actualStates = context.actualStatesBySensor[name];

            var lastRealState = actualStates.length > 0 ? actualStates[actualStates.length-1] : null;
            if(lastRealState) {
                if(lastRealState.time == context.currentTime) {
                    lastRealState.state = newState;
                } else {
                    actualStates.push({time: context.currentTime, state: newState});
                }
            } else {
                actualStates.push({time: context.currentTime, state: newState});
            }

            drawNewStateChangesSensor(name, newState);

            context.increaseTime(sensor);
        }
    }

    function drawNewStateChangesSensor(name, newState=null) {
        var sensor = sensorHandler.findSensorByName(name);
        if (!sensor) {
            context.success = false;
            throw (strings.messages.sensorNotFound.format(name));
        }

        var sensorDef = sensorHandler.findSensorDefinition(sensor);
        if(sensor.lastDrawnState !== null) {
            // Get all states between the last drawn time and now
            var expectedStates = context.getSensorExpectedState(name, sensor.lastDrawnTime, context.currentTime);
            for(var i = 0; expectedStates && i < expectedStates.length; i++) {
                // Draw the line up to the next expected state
                var expectedState = expectedStates[i];
                var nextTime = i+1 < expectedStates.length ? expectedStates[i+1].time : context.currentTime;
                var type = "actual";
                // Check the previous state
                if(!sensorDef.compareState(sensor.lastDrawnState, expectedState.state)) {
                    type = "wrong";
                }
                drawSensorTimeLineState(sensor, sensor.lastDrawnState, sensor.lastDrawnTime, nextTime, type, false, expectedState.state);
                sensor.lastDrawnTime = nextTime;
            }
        }

        sensor.lastDrawnTime = context.currentTime;

        if(newState !== null && sensor.lastDrawnState != newState) {
            // Draw the new state change
            if(sensor.lastDrawnState === null) {
                sensor.lastDrawnState = newState;
            }

            var type = "actual";
            // Check the new state
            var expectedState = context.getSensorExpectedState(name, context.currentTime);

            if (expectedState !== null && !sensorDef.compareState(expectedState.state, newState))
            {
                type = "wrong";
            }
            drawSensorTimeLineState(sensor, newState, context.currentTime, context.currentTime, type, false, expectedState && expectedState.state);
            sensor.lastDrawnState = newState;
        }
    }

    function drawNewStateChanges() {
        // Draw all sensors
        if(!context.gradingStatesBySensor) { return; }
        for(var sensorName in context.gradingStatesBySensor) {
            drawNewStateChangesSensor(sensorName);
        }
    }

    context.increaseTime = function (sensor) {
        if (!sensor.lastTimeIncrease) {
            sensor.lastTimeIncrease = 0;
        }

        if (sensor.callsInTimeSlot == undefined)
            sensor.callsInTimeSlot = 0;

        if (sensor.lastTimeIncrease == context.currentTime) {
            sensor.callsInTimeSlot += 1;
        }
        else {
            sensor.lastTimeIncrease = context.currentTime;
            sensor.callsInTimeSlot = 1;
        }

        if (sensor.callsInTimeSlot > getQuickPiOption('increaseTimeAfterCalls')) {
            context.currentTime += context.tickIncrease;

            sensor.lastTimeIncrease = context.currentTime;
            sensor.callsInTimeSlot = 0;
        }

        drawCurrentTime();
        if(context.autoGrading)
        {
            drawNewStateChanges();
        }

        if(context.runner) {
            // Tell the runner an "action" happened
            context.runner.signalAction();
        }
    }

    context.increaseTimeBy = function (time) {

        var iStates = 0;

        var newTime = context.currentTime + time;

        if (context.gradingStatesByTime) {
            // Advance until current time, ignore everything in the past.
            while (iStates < context.gradingStatesByTime.length &&
                context.gradingStatesByTime[iStates].time < context.currentTime)
                iStates++;

            for (; iStates < context.gradingStatesByTime.length; iStates++) {
                var sensorState = context.gradingStatesByTime[iStates];

                // Until the new time
                if (sensorState.time >= newTime)
                    break;

                // Mark all inputs as hit
                if (sensorState.input) {
                    sensorState.hit = true;
    //                context.currentTime = sensorState.time;
                    context.getSensorState(sensorState.name);
                }
            }
        }

        if(context.runner) {
            // Tell the runner an "action" happened
            context.runner.signalAction();
        }

        context.currentTime = newTime;

        drawCurrentTime();
        if (context.autoGrading) {
            drawNewStateChanges();
        }
    }

    context.getSensorExpectedState = function (name, targetTime = null, upToTime = null) {
        var state = null;
        if(targetTime === null) {
            targetTime = context.currentTime;
        }

        if (!context.gradingStatesBySensor)
        {
            return null;
        }

        var actualname = name;
        var parts = name.split(".");
        if (parts.length == 2) {
            actualname = parts[0];
        }

        var sensorStates = context.gradingStatesBySensor[actualname];

        if (!sensorStates)
            return null; // Fail??

        var lastState;
        var startTime = -1;
        for (var idx = 0; idx < sensorStates.length; idx++) {
            if (startTime >= 0
                && targetTime >= startTime
                && targetTime < sensorStates[idx].time) {
                    state = lastState;
                    break;
            }

            startTime = sensorStates[idx].time;
            lastState = sensorStates[idx];
        }

        // This is the end state
        if(state === null && targetTime >= startTime) {
            state = lastState;
        }

        if(state && upToTime !== null) {
            // If upToTime is given, return an array of states instead
            var states = [state];
            for(var idx2 = idx+1; idx2 < sensorStates.length; idx2++) {
                if(sensorStates[idx2].time < upToTime) {
                    states.push(sensorStates[idx2]);
                } else {
                    break;
                }
            }
            return states;
        } else {
            return state;
        }
    }


    context.getSensorState = function (name) {
        var state = null;

        var sensor = sensorHandler.findSensorByName(name);
        if ((!context.display && !context.forceGradingWithoutDisplay) || context.autoGrading) {
            var stateTime = context.getSensorExpectedState(name);

            if (stateTime != null) {
                stateTime.hit = true;
                state = stateTime.state;
                if(sensor) {
                    // Redraw from the beginning of this state
                    sensor.lastDrawnTime = Math.min(sensor.lastDrawnTime, stateTime.time);
                }
            }
            else {
                state = 0;
            }
        }

        if (!sensor) {
            context.success = false;
            throw (strings.messages.sensorNotFound.format(name));
        }

        if (state == null) {
            state = sensor.state;
        }
        else {
            sensor.state = state;
            drawSensor(sensor);
        }

        drawNewStateChangesSensor(sensor.name, sensor.state);

        context.increaseTime(sensor);

        return state;
    }

    // This will advance grading time to the next button release for waitForButton
    // will return false if the next event wasn't a button press
    context.advanceToNextRelease = function (sensorType, port) {
        var retval = false;
        var iStates = 0;

        // Advance until current time, ignore everything in the past.
        while (context.gradingStatesByTime[iStates].time <= context.currentTime)
            iStates++;

        for (; iStates < context.gradingStatesByTime.length; iStates++) {
            sensorState = context.gradingStatesByTime[iStates];

            if (sensorState.type == sensorType &&
                sensorState.port == port) {

                sensorState.hit = true;
                if (!sensorState.state) {
                    context.currentTime = sensorState.time;
                    retval = true;
                    break;
                }
            }
            else {
                retval = false;
                break;
            }
        }

        return retval;
    };

    context.quickpi.changeSensorState = function (sensorName, sensorState, callback) {
        var sensor = sensorHandler.findSensorByName(sensorName);
        sensor.state = sensorState;
        drawSensor(sensor);
        callback();
    }

    /***** Functions *****/
    /* Here we define each function of the library.
       Blocks will generally use context.group.blockName as their handler
       function, hence we generally use this name for the functions. */
    context.quickpi.turnLedOn = function (callback) {

        var sensor = findSensorByType("led");

        context.registerQuickPiEvent(sensor.name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        }
        else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("turnLedOn()", cb);
        }
    };

    context.quickpi.turnLedOff = function (callback) {

        var sensor = findSensorByType("led");

        context.registerQuickPiEvent(sensor.name, false);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("turnLedOff()", cb);
        }
    };

    context.quickpi.setLedMatrixOne = function (name, i, j, state, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if(i < 0 || i > 5 || j < 0 || j > 5) {
            throw "invalid led position";
        }

        sensor.state[i][j] = state ? 1 : 0;

        context.registerQuickPiEvent(name, sensor.state);
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var command = "setLedMatrixState(\"" + name + "\"," + JSON.stringify(sensor.state) + ")";
            cb = context.runner.waitCallback(callback);
            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.turnBuzzerOn = function (callback) {

        context.registerQuickPiEvent("buzzer1", true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        }
        else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("turnBuzzerOn()", cb);
        }
    };

    context.quickpi.turnBuzzerOff = function (callback) {
        context.registerQuickPiEvent("buzzer1", false);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("turnBuzzerOff()", cb);
        }
    };

    context.quickpi.waitForButton = function (name, callback) {
        //        context.registerQuickPiEvent("button", "D22", "wait", false);
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading) {

            context.advanceToNextRelease("button", sensor.port);

            context.waitDelay(callback);
        } else if (context.offLineMode) {
            if (sensor) {
                var cb = context.runner.waitCallback(callback);
                sensor.onPressed = function () {
                    cb();
                }
            } else {
                context.waitDelay(callback);
            }
        }
        else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("waitForButton(\"" + name + "\")", cb);
        }
    };


    context.quickpi.isButtonPressed = function (arg1, arg2) {
        if(typeof arg2 == "undefined") {
            // no arguments
            var callback = arg1;
            var sensor = findSensorByType("button");
            var name = sensor.name;
        } else {
            var callback = arg2;
            var sensor = sensorHandler.findSensorByName(arg1, true);
            var name = arg1;
        }

        if (!context.display || context.autoGrading || context.offLineMode) {

            if (sensor.type == "stick") {
                var state = context.getSensorState(name);
                var stickDefinition = sensorHandler.findSensorDefinition(sensor);
                var buttonstate = stickDefinition.getButtonState(name, sensor.state);


                context.runner.noDelay(callback, buttonstate);
            } else {
                var state = context.getSensorState(name);

                context.runner.noDelay(callback, state);
            }
        } else {
            var cb = context.runner.waitCallback(callback);

            if (sensor.type == "stick") {
                var stickDefinition = sensorHandler.findSensorDefinition(sensor);

                stickDefinition.getLiveState(sensor, function(returnVal) {
                    sensor.state = returnVal;
                    drawSensor(sensor);

                    var buttonstate = stickDefinition.getButtonState(name, sensor.state);

                    cb(buttonstate);
                });

            } else {
                sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                    sensor.state = returnVal != "0";
                    drawSensor(sensor);
                    cb(returnVal != "0");
                });
            }
        }
    };

    context.quickpi.isButtonPressedWithName = context.quickpi.isButtonPressed;

    context.quickpi.buttonWasPressed = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState(name);

            var wasPressed = !!sensor.wasPressed;
            sensor.wasPressed = false;

            context.runner.noDelay(callback, wasPressed);
        } else {
            var cb = context.runner.waitCallback(callback);
            context.quickPiConnection.sendCommand("buttonWasPressed(\"" + name + "\")", function (returnVal) {
                cb(returnVal != "0");
            });
        }

    };

    context.quickpi.setLedState = function (name, state, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);
        var command = "setLedState(\"" + sensor.port + "\"," + (state ? "True" : "False") + ")";

        context.registerQuickPiEvent(name, state ? true : false);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.setBuzzerState = function (name, state, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        var command = "setBuzzerState(\"" + name + "\"," + (state ? "True" : "False") + ")";

        context.registerQuickPiEvent(name, state ? true : false);

        if(context.display) {
            state ? buzzerSound.start(name) : buzzerSound.stop(name);
        }

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.isBuzzerOn = function (arg1, arg2) {
        if(typeof arg2 == "undefined") {
            // no arguments
            var callback = arg1;
            var sensor = findSensorByType("buzzer");
        } else {
            var callback = arg2;
            var sensor = sensorHandler.findSensorByName(arg1, true);
        }

        var command = "isBuzzerOn(\"" + sensor.name + "\")";

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState("buzzer1");
            context.waitDelay(callback, state);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal)
                cb(returnVal);
            });
        }
    };

    context.quickpi.isBuzzerOnWithName = context.quickpi.isBuzzerOn;

    context.quickpi.setBuzzerNote = function (name, frequency, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);
        var command = "setBuzzerNote(\"" + name + "\"," + frequency + ")";

        context.registerQuickPiEvent(name, frequency);

        if(context.display && context.offLineMode) {
            buzzerSound.start(name, frequency);
        }

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal)
                cb(returnVal);

            });
        }
    };

    context.quickpi.getBuzzerNote = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        var command = "getBuzzerNote(\"" + name + "\")";

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback, sensor.state);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal)
                cb(returnVal);

            });
        }
    };


    context.quickpi.setLedBrightness = function (name, level, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (typeof level == "object")
        {
            level = level.valueOf();
        }

        var command = "setLedBrightness(\"" + name + "\"," + level + ")";

        context.registerQuickPiEvent(name, level);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
        }
    };


    context.quickpi.getLedBrightness = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        var command = "getLedBrightness(\"" + name + "\")";

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback, sensor.state);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal)
                cb(returnVal);

            });
        }
    };

    context.quickpi.setLedColors = function (name, r, g, b, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (typeof r == "object")
        {
            r = r.valueOf();
        }
        if (typeof g == "object")
        {
            g = g.valueOf();
        }
        if (typeof b == "object")
        {
            b = b.valueOf();
        }

        var command = "setLedColors(\"" + name + "\"," + r + "," + g + "," + b + ")";

        context.registerQuickPiEvent(name, {r: r, g: g, b: b});

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.isLedOn = function (arg1, arg2) {
        if(typeof arg2 == "undefined") {
            // no arguments
            var callback = arg1;
            var sensor = findSensorByType("led");
        } else {
            var callback = arg2;
            var sensor = sensorHandler.findSensorByName(arg1, true);
        }

        var command = "getLedState(\"" + sensor.name + "\")";

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback, sensor.state);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal)
                cb(returnVal);

            });
        }
    };

    context.quickpi.isLedOnWithName = context.quickpi.isLedOn;


    context.quickpi.toggleLedState = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        var command = "toggleLedState(\"" + name + "\")";
        var state = sensor.state;

        context.registerQuickPiEvent(name, !state);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) { return returnVal != "0"; });
        }
    };

    context.quickpi.displayText = function (line1, arg2, arg3) {
        if(typeof arg3 == "undefined") {
            // Only one argument
            var line2 = null;
            var callback = arg2;
        } else {
            var line2 = arg2;
            var callback = arg3;
        }

        var sensor = findSensorByType("screen");

        var command = "displayText(\"" + line1 + "\", \"\")";

        context.registerQuickPiEvent(sensor.name,
            {
                line1: line1,
                line2: line2
            }
        );

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function (retval) {
                cb();
            });
        }
    };

    context.quickpi.displayText2Lines = context.quickpi.displayText;

    context.quickpi.readTemperature = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState(name);

            context.runner.waitDelay(callback, state);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };

    context.quickpi.sleep = function (time, callback) {
        context.increaseTimeBy(time);
        if (!context.display || context.autoGrading) {
            context.runner.noDelay(callback);
        }
        else {
            context.runner.waitDelay(callback, null, time);
        }
    };


    context.quickpi.setServoAngle = function (name, angle, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (angle > 180)
            angle = 180;
        else if (angle < 0)
            angle = 0;

        context.registerQuickPiEvent(name, angle);
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var command = "setServoAngle(\"" + name + "\"," + angle + ")";
            cb = context.runner.waitCallback(callback);
            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.getServoAngle = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        var command = "getServoAngle(\"" + name + "\")";

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback, sensor.state);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, function(returnVal) {
                returnVal = parseFloat(returnVal);
                cb(returnVal);

            });
        }
    };


    context.quickpi.setContinousServoDirection = function (name, direction, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (direction > 0)
            angle = 0;
        else if (direction < 0)
            angle = 180;
        else
            angle = 90;

        context.registerQuickPiEvent(name, angle);
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var command = "setServoAngle(\"" + name + "\"," + angle + ")";
            cb = context.runner.waitCallback(callback);
            context.quickPiConnection.sendCommand(command, cb);
        }
    };

    context.quickpi.readRotaryAngle = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {

            var state = context.getSensorState(name);
            context.waitDelay(callback, state);
        } else {

            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };


    context.quickpi.readDistance = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);
        if (!context.display || context.autoGrading || context.offLineMode) {

            var state = context.getSensorState(name);
            context.waitDelay(callback, state);
        } else {

            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };



    context.quickpi.readLightIntensity = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {

            var state = context.getSensorState(name);
            context.waitDelay(callback, state);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;

                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };

    context.quickpi.readHumidity = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {

            var state = context.getSensorState(name);
            context.waitDelay(callback, state);
        } else {

            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };

    context.quickpi.currentTime = function (callback) {
        var millis = new Date().getTime();

        if (context.autoGrading) {
            millis = context.currentTime;
        }

        context.runner.waitDelay(callback, millis);
    };


    var getTemperatureFromCloudURl = "https://cloud.quick-pi.org/cache/weather.php";

    var getTemperatureFromCloudSupportedTowns = [];

    // setup the supported towns
    $.get(getTemperatureFromCloudURl + "?q=" + "supportedtowns", function(towns) {
        getTemperatureFromCloudSupportedTowns = JSON.parse(towns);
    });

    // We create a cache so there is less calls to the api and we get the results of the temperature faster
    var getTemperatureFromCloudCache = {};

    context.quickpi.getTemperatureFromCloud = function(location, callback) {
        var url = getTemperatureFromCloudURl;

        if (!arrayContains(getTemperatureFromCloudSupportedTowns, location))
            throw strings.messages.getTemperatureFromCloudWrongValue.format(location);

        var cache = getTemperatureFromCloudCache;
        if (cache[location] != undefined && ((Date.now() - cache[location].lastUpdate) / 1000) / 60 < 10) {
            context.waitDelay(callback, cache[location].temperature);
            return;
        }

        var cb = context.runner.waitCallback(callback);
        $.get(url + "?q=" + location, function(data) {
            // If the server return invalid it mean that the town given is not supported
            if (data === "invalid") {
                // This only happen when the user give an invalid town to the server, which should never happen because
                // the validity of the user input is checked above.
                cb(0);
            } else {
                cache[location] = {
                    lastUpdate: Date.now(),
                    temperature: data
                };
                cb(data);
            }
        });
    };

    context.initScreenDrawing = function(sensor) {
        if  (!sensor.screenDrawing)                
            sensor.screenDrawing = new screenDrawing(sensor.canvas);
    }    


    context.quickpi.drawPoint = function(x, y, callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.drawPoint(x, y);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "drawPoint(" + x + "," + y + ")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };

    context.quickpi.isPointSet = function(x, y, callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        var value = sensor.screenDrawing.isPointSet(x, y);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback, value);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "isPointSet(" + x + "," + y + ")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };

    context.quickpi.drawLine = function(x0, y0, x1, y1, callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.drawLine(x0, y0, x1, y1);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "drawLine(" + x0 + "," + y0 + "," + x1 + "," + y1 + ")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.drawRectangle = function(x0, y0, width, height, callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.drawRectangle(x0, y0, width, height);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        


        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "drawRectangle(" + x0 + "," + y0 + "," + width + "," + height + ")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };

    context.quickpi.drawCircle = function(x0, y0, diameter, callback) {

        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.drawCircle(x0, y0, diameter, diameter);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        


        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "drawCircle(" + x0 + "," + y0 + "," + diameter + ")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.clearScreen = function(callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.clearScreen();
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "clearScreen()";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.updateScreen = function(callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "updateScreen()";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.autoUpdate = function(autoupdate, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "autoUpdate(\"" + (autoupdate ? "True" : "False") + "\")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };

    context.quickpi.fill = function(color, callback) {

        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.fill(color);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "fill(\"" + color + "\")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.noFill = function(callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.noFill();
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        


        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "NoFill()";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.stroke = function(color, callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.stroke(color);
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData()); 

        if (!context.display || context.autoGrading || context.offLineMode) {

            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);
            var command = "stroke(\"" + color + "\")";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.noStroke = function(callback) {
        var sensor = findSensorByType("screen");

        context.initScreenDrawing(sensor);
        sensor.screenDrawing.noStroke();
        context.registerQuickPiEvent(sensor.name, sensor.screenDrawing.getStateData());        

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "noStroke()";
            context.quickPiConnection.sendCommand(command, function () {
                cb();
            });
        }
    };


    context.quickpi.readAcceleration = function(axis, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("accelerometer");

            var index = 0;
            if (axis == "x")
                index = 0;
            else if (axis == "y")
                index = 1;
            else if (axis == "z")
                index = 2;

            var state = context.getSensorState(sensor.name);

            if (Array.isArray(state))
                context.waitDelay(callback, state[index]);
            else
                context.waitDelay(callback, 0);
        } else {
            var cb = context.runner.waitCallback(callback);

            var command = "readAcceleration(\"" + axis + "\")";
            context.quickPiConnection.sendCommand(command, function (returnVal) {
                cb(returnVal);
            });
        }
    };

    context.quickpi.computeRotation = function(rotationType, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("accelerometer");

            var zsign = 1;
            var result = 0;

            if (sensor.state[2] < 0)
                zsign = -1;

            if (rotationType == "pitch")
            {
                result = 180 * Math.atan2 (sensor.state[0], zsign * Math.sqrt(sensor.state[1]*sensor.state[1] + sensor.state[2]*sensor.state[2]))/Math.PI;
            }
            else if (rotationType == "roll")
            {
                result = 180 * Math.atan2 (sensor.state[1], zsign * Math.sqrt(sensor.state[0]*sensor.state[0] + sensor.state[2]*sensor.state[2]))/Math.PI;
            }

            result = Math.round(result);

            context.waitDelay(callback, result);
        } else {
            var cb = context.runner.waitCallback(callback);
            var command = "computeRotation(\"" + rotationType + "\")";

            context.quickPiConnection.sendCommand(command, function (returnVal) {
                cb(returnVal);
            });
        }
    };


    context.quickpi.readSoundLevel = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState(name);

            context.runner.noDelay(callback, state);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };

    context.quickpi.readMagneticForce = function (axis, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("magnetometer");

            var index = 0;
            if (axis == "x")
                index = 0;
            else if (axis == "y")
                index = 1;
            else if (axis == "z")
                index = 2;

            context.waitDelay(callback, sensor.state[index]);
        } else {
            var cb = context.runner.waitCallback(callback);
            var sensor = context.findSensor("magnetometer", "i2c");

            sensorHandler.findSensorDefinition(sensor).getLiveState(axis, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);

                if (axis == "x")
                    returnVal = returnVal[0];
                else if (axis == "y")
                    returnVal = returnVal[1];
                else if (axis == "z")
                    returnVal = returnVal[2];

                cb(returnVal);
            });
        }
    };

    context.quickpi.computeCompassHeading = function (callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("magnetometer");

            var heading = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

            heading = Math.round(heading);

            context.runner.noDelay(callback, heading);
        } else {
            var cb = context.runner.waitCallback(callback);
            var sensor = context.findSensor("magnetometer", "i2c");

            context.quickPiConnection.sendCommand("readMagnetometerLSM303C()", function(returnVal) {
                sensor.state = JSON.parse(returnVal);
                drawSensor(sensor);

                returnVal = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

                returnVal = Math.floor(returnVal);

                cb(returnVal);
            }, true);
        }
    };

    context.quickpi.readInfraredState = function (name, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState(name);

            context.runner.noDelay(callback, state ? true : false);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).getLiveState(sensor, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);
                cb(returnVal);
            });
        }
    };

    context.quickpi.setInfraredState = function (name, state, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        context.registerQuickPiEvent(name, state ? true : false);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, state, cb);
        }
    };

    context.quickpi.onButtonPressed = function (name, func, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        context.waitForEvent(function (callback) {
            context.quickpi.isButtonPressed(name, callback)
        }, func);

        context.waitDelay(callback);
    };


    //// Gyroscope
    context.quickpi.readAngularVelocity = function (axis, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("gyroscope");

            var index = 0;
            if (axis == "x")
                index = 0;
            else if (axis == "y")
                index = 1;
            else if (axis == "z")
                index = 2;

            context.waitDelay(callback, sensor.state[index]);
         } else {
            var cb = context.runner.waitCallback(callback);
            var sensor = context.findSensor("gyroscope", "i2c");

            sensorHandler.findSensorDefinition(sensor).getLiveState(axis, function(returnVal) {
                sensor.state = returnVal;
                drawSensor(sensor);

                if (axis == "x")
                    returnVal = returnVal[0];
                else if (axis == "y")
                    returnVal = returnVal[1];
                else if (axis == "z")
                    returnVal = returnVal[2];

                cb(returnVal);
            });
        }
    };

    context.quickpi.setGyroZeroAngle = function (callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("gyroscope");

            sensor.rotationAngles = [0, 0, 0];
            sensor.lastSpeedChange = new Date();

            context.runner.noDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("setGyroZeroAngle()", function(returnVal) {
                cb();
            }, true);
        }
    };

    context.quickpi.computeRotationGyro = function (axis, callback) {
        if (!context.display || context.autoGrading || context.offLineMode) {
            var sensor = findSensorByType("gyroscope");


            var ret = 0;

            if (sensor.rotationAngles != undefined) {
                for (var i = 0; i < 3; i++)
                    sensor.rotationAngles[i] += sensor.state[i] * ((new Date() - sensor.lastSpeedChange) / 1000);

                sensor.lastSpeedChange = new Date();

                if (axis == "x")
                    ret = sensor.rotationAngles[0];
                else if (axis == "y")
                    ret = sensor.rotationAngles[1];
                else if (axis == "z")
                    ret = sensor.rotationAngles[2];
            }

            context.runner.noDelay(callback, ret);
        } else {
            var cb = context.runner.waitCallback(callback);
            var sensor = context.findSensor("gyroscope", "i2c");

            context.quickPiConnection.sendCommand("computeRotationGyro()", function(returnVal) {
                //sensor.state = returnVal;
                //drawSensor(sensor);

                var returnVal = JSON.parse(returnVal);

                if (axis == "x")
                    returnVal = returnVal[0];
                else if (axis == "y")
                    returnVal = returnVal[1];
                else if (axis == "z")
                    returnVal = returnVal[2];

                cb(returnVal);
            }, true);
        }
    };


    context.quickpi.connectToCloudStore = function (prefix, password, callback) {
        var sensor = findSensorByType("cloudstore");

        if (!context.display || context.autoGrading) {
            sensor.quickStore = new quickPiStore(true);
        } else {
            sensor.quickStore = QuickStore(prefix, password);
        }

        context.runner.noDelay(callback, 0);
    };

    context.quickpi.writeToCloudStore = function (identifier, key, value, callback) {
        var sensor = findSensorByType("cloudstore");

        if (!sensor.quickStore || !sensor.quickStore.connected)
        {
            context.success = false;
            throw("Cloud store not connected");
        }

        if (!context.display || context.autoGrading) {
            sensor.quickStore.write(identifier, key, value);

            context.registerQuickPiEvent(sensor.name, sensor.quickStore.getStateData());

            context.runner.noDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            sensor.quickStore.write(identifier, key, value, function(data) {
                if (!data || !data.success)
                {
                    if (data && data.message)
                        context.failImmediately = "cloudstore: " + data.message;
                    else
                        context.failImmediately = "Error trying to communicate with cloud store";
    
                }
                cb();
            });
        }
    };

    context.quickpi.readFromCloudStore = function (identifier, key, callback) {
        var sensor = findSensorByType("cloudstore");

        if (!sensor.quickStore)
        {
            if (!context.display || context.autoGrading) {
                sensor.quickStore = new quickPiStore();
            } else {
                sensor.quickStore = QuickStore();
            }
        }

        if (!context.display || context.autoGrading) {
            var state = context.getSensorState(sensor.name);
            var value = "";

            if (state.hasOwnProperty(key)) {
                value = state[key];
            }
            else {
                context.success = false;
                throw("Key not found");    
            }

            sensor.quickStore.write(identifier, key, value);
            context.registerQuickPiEvent(sensor.name, sensor.quickStore.getStateData());
            
            context.runner.noDelay(callback, value);
        } else {
            var cb = context.runner.waitCallback(callback);
            sensor.quickStore.read(identifier, key, function(data) {
                var value = "";
                if (data && data.success)
                {
                    try {
                        value = JSON.parse(data.value);
                    } catch(err)
                    {
                        value = data.value;
                    }
                }
                else
                {
                    if (data && data.message)
                        context.failImmediately = "cloudstore: " + data.message;
                    else
                        context.failImmediately = "Error trying to communicate with cloud store";
                }

                cb(value);
            });
        }
    };



    
    context.quickpi.readIRMessage = function (name, timeout, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        if (!context.display || context.autoGrading || context.offLineMode) {
            var state = context.getSensorState(name);

            var cb = context.runner.waitCallback(callback);

            sensor.waitingForIrMessage = function(command)
            {
                clearTimeout(sensor.waitingForIrMessageTimeout);
                sensor.waitingForIrMessage = null;

                cb(command);
            }

            sensor.waitingForIrMessageTimeout = setTimeout(function () {
                if (sensor.waitingForIrMessage) {
                    sensor.waitingForIrMessage = null;
                    cb("none");
                }
            }, 
            timeout);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("readIRMessage(\"irrec1\", " + timeout + ")", function(returnVal) {

                if (typeof returnVal === 'string')
                    returnVal = returnVal.replace(/['"]+/g, '')

                cb(returnVal);
            }, true);
        }
    };

    context.quickpi.sendIRMessage = function (name, preset, callback) {
        var sensor = sensorHandler.findSensorByName(name, true);

        //context.registerQuickPiEvent(name, state ? true : false);

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("sendIRMessage(\"irtran1\", \"" + preset + "\")", function(returnVal) {
                cb();
            }, true);
        }
    };

    context.quickpi.presetIRMessage = function (preset, data, callback) {
        //var sensor = sensorHandler.findSensorByName(name, true);

        //context.registerQuickPiEvent(name, state ? true : false);
        if (!context.remoteIRcodes)

            context.remoteIRcodes = {};

        context.remoteIRcodes[preset] = data;

        if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
        } else {
            var cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand("presetIRMessage(\"" + preset + "\", \"" + JSON.stringify(JSON.parse(data)) + "\")", function(returnVal) {
                cb();
            }, true);
        }
    };
    /***** Blocks definitions *****/
    /* Here we define all blocks/functions of the library.
       Structure is as follows:
       {
          group: [{
             name: "someName",
             // category: "categoryName",
             // yieldsValue: optional true: Makes a block with return value rather than simple command
             // params: optional array of parameter types. The value 'null' denotes /any/ type. For specific types, see the Blockly documentation ([1,2])
             // handler: optional handler function. Otherwise the function context.group.blockName will be used
             // blocklyJson: optional Blockly JSON objects
             // blocklyInit: optional function for Blockly.Blocks[name].init
             //   if not defined, it will be defined to call 'this.jsonInit(blocklyJson);
             // blocklyXml: optional Blockly xml string
             // codeGenerators: optional object:
             //   { Python: function that generates Python code
             //     JavaScript: function that generates JS code
             //   }
          }]
       }
       [1] https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
       [2] https://developers.google.com/blockly/guides/create-custom-blocks/type-checks
    */


    function getSensorNames(sensorType)
    {
        return function () {
            var ports = [];
            for (var i = 0; i < infos.quickPiSensors.length; i++) {
                var sensor = infos.quickPiSensors[i];

                if (sensor.type == sensorType) {
                    ports.push([sensor.name, sensor.name]);
                }
            }

            if (sensorType == "button") {
                for (var i = 0; i < infos.quickPiSensors.length; i++) {
                    var sensor = infos.quickPiSensors[i];

                    if (sensor.type == "stick") {
                        var stickDefinition = sensorHandler.findSensorDefinition(sensor);

                        for (var iStick = 0; iStick < stickDefinition.gpiosNames.length; iStick++) {
                            var name = sensor.name + "." + stickDefinition.gpiosNames[iStick];

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

    function findSensorByType(type) {
        var firstname = name.split(".")[0];


        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];
            if (sensor.type == type) {
                return sensor;
            }
        }

        return null;
    }

    function findSensorByPort(port) {
        for (var i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];
            if (sensor.port == port) {
                return sensor;
            }
        }

        return null;
    }

    function getSensorSuggestedName(type, suggested) {
        if (suggested) {
            if (!sensorHandler.findSensorByName(suggested))
                return suggested;
        }

        var i = 0;
        var newName;

        do {
            i++;
            newName = type + i.toString();
        } while (sensorHandler.findSensorByName(newName));

        return newName;
    }


    context.customBlocks = {
        // Define our blocks for our namespace "template"
        quickpi: {
            // Categories are reflected in the Blockly menu
            sensors: [
                { name: "currentTime", yieldsValue: 'int' },

                {
                    name: "waitForButton", params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("button")
                            }
                        ]
                    }
                },
                {
                    name: "isButtonPressed", yieldsValue: 'bool'
                },
                {
                    name: "isButtonPressedWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("button")
                            },
                        ]
                    }
                },
                {
                    name: "buttonWasPressed", yieldsValue: 'bool', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("button")
                            }
                        ]
                    }
                },
                {
                    name: "onButtonPressed", params: ["String", "Statement"], blocklyInit() {
                        return function () {
                            this.setColour(context.blocklyHelper.getDefaultColours().categories["sensors"]);
                            this.appendDummyInput("PARAM_0")
                              .appendField(strings.label.onButtonPressed)
                              .appendField(new window.Blockly.FieldDropdown(getSensorNames("button")), 'PARAM_0')
                              .appendField(strings.label.onButtonPressedEnd);
                            this.appendStatementInput("PARAM_1")
                              .setCheck(null)
                              .appendField(strings.label.onButtonPressedDo);
                            this.setPreviousStatement(false);
                            this.setNextStatement(false);
                            this.setOutput(null);
                        };
                    },
                    blocklyJson: {
                        "args0": [
                            {"type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("button")},
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    }
                },
                {
                    name: "readTemperature", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("temperature")
                            }
                        ]
                    }
                },
                {
                    name: "readRotaryAngle", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("potentiometer")
                            }
                        ]
                    }
                },
                {
                    name: "readDistance", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("range")
                            }
                        ]
                    }
                },
                {
                    name: "readLightIntensity", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("light")
                            }
                        ]
                    }
                },
                {
                    name: "readHumidity", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("humidity")
                            }
                        ]
                    }
                },
                {
                    name: "readAcceleration", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
                            }
                        ]
                    }
                },
                {
                    name: "computeRotation", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": [["pitch", "pitch"], ["roll", "roll"]]
                            }
                        ]
                    }
                },
                {
                    name: "readSoundLevel", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("sound")
                            }
                        ]
                    }
                },
                {
                    name: "readMagneticForce", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
                            }
                        ]
                    }
                },
                {
                    name: "computeCompassHeading", yieldsValue: 'int'
                },
                {
                    name: "readInfraredState", yieldsValue: 'bool', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("irrecv")
                            }
                        ]
                    }
                },
                {
                    name: "readIRMessage", yieldsValue: 'string', params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("irrecv") },
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    },
                    blocklyXml: "<block type='readIRMessage'>" +
                        "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>10000</field></shadow></value>" +
                        "</block>"
                },
                {
                    name: "readAngularVelocity", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
                            }
                        ]
                    }
                },
                {
                    name: "setGyroZeroAngle"
                },
                {
                    name: "computeRotationGyro", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
                            }
                        ]
                    }
                },

            ],
            actuator: [
                { name: "turnLedOn" },
                { name: "turnLedOff" },
                { name: "turnBuzzerOn" },
                { name: "turnBuzzerOff" },
                {
                    name: "setLedState", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
                        ]
                    }
                },
                {
                    name: "setLedMatrixOne", params: ["String", "Number", "Number", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                            { "type": "input_value", "name": "PARAM_1" },
                            { "type": "input_value", "name": "PARAM_2" },
                            { "type": "field_dropdown", "name": "PARAM_3", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
                        ]
                    }
                },
                {
                    name: "setBuzzerState", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("buzzer")
                            },
                            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
                        ]
                    }
                },
                {
                    name: "setBuzzerNote", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("buzzer")
                            },
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    },
                    blocklyXml: "<block type='setBuzzerNote'>" +
                        "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>200</field></shadow></value>" +
                        "</block>"
                },
                {
                    name: "getBuzzerNote", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("buzzer")
                            },
                        ]
                    }
                },
                {
                    name: "setLedBrightness", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    },
                    blocklyXml: "<block type='setLedBrightness'>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "getLedBrightness", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                        ]
                    }
                },
                {
                    name: "isLedOn", yieldsValue: 'bool'
                },
                {
                    name: "isLedOnWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                        ]
                    }
                },
                {
                    name: "isBuzzerOn", yieldsValue: 'bool'
                },
                {
                    name: "isBuzzerOnWithName", yieldsValue: 'bool', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("buzzer")
                            },
                        ]
                    }
                },
                {
                    name: "toggleLedState", params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("led")
                            },
                        ]
                    }
                },
                {
                    name: "setServoAngle", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("servo")
                            },
                            { "type": "input_value", "name": "PARAM_1" },

                        ]
                    },
                    blocklyXml: "<block type='setServoAngle'>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "getServoAngle", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("servo")
                            },
                        ]
                    }
                },
                {
                    name: "setContinousServoDirection", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {
                                "type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("servo")
                            },
                            { 
                                "type": "field_dropdown", "name": "PARAM_1", "options": [["forward", "1"], ["backwards", "-1"], ["stop", "0"]] 
                            },

                        ]
                    },
                },
                {
                    name: "setInfraredState", params: ["String", "Number"], blocklyJson: {
                        "args0": [
                            {"type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("irtrans")},
                            { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
                        ]
                    }
                },
                {
                    name: "sendIRMessage", params: ["String", "String"], blocklyJson: {
                        "args0": [
                            {"type": "field_dropdown", "name": "PARAM_0", "options": getSensorNames("irtrans")},
                            { "type": "input_value", "name": "PARAM_1", "text": "" },
                        ]
                    },
                    blocklyXml: "<block type='sendIRMessage'>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },
                {
                    name: "presetIRMessage", params: ["String", "String"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", "text": "" },
                            { "type": "input_value", "name": "PARAM_1", "text": "" },
                        ]
                    },
                    blocklyXml: "<block type='presetIRMessage'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },
                {
                    name: "sleep", params: ["Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", "value": 0 },
                        ]
                    }
                    ,
                    blocklyXml: "<block type='sleep'>" +
                        "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1000</field></shadow></value>" +
                        "</block>"
                },
            ],
            display: [
                {
                    name: "displayText", params: ["String", "String"], variants: [[null], [null, null]], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", "text": "" },
                        ]
                    },
                    blocklyXml: "<block type='displayText'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
                        "</block>"

                },
                {
                    name: "displayText2Lines", params: ["String", "String"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", "text": "" },
                            { "type": "input_value", "name": "PARAM_1", "text": "" },
                        ]
                    },
                    blocklyXml: "<block type='displayText2Lines'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'>" + strings.messages.hello + "</field> </shadow></value>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"

                },
                {
                    name: "drawPoint", params: ["Number", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    },
                    blocklyXml: "<block type='drawPoint'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "isPointSet", yieldsValue: 'bool', params: ["Number", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                            { "type": "input_value", "name": "PARAM_1"},
                        ]
                    },
                    blocklyXml: "<block type='isPointSet'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "drawLine", params: ["Number", "Number", "Number", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                            { "type": "input_value", "name": "PARAM_1"},
                            { "type": "input_value", "name": "PARAM_2"},
                            { "type": "input_value", "name": "PARAM_3"},
                        ]
                    },
                    blocklyXml: "<block type='drawLine'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "drawRectangle", params: ["Number", "Number", "Number", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                            { "type": "input_value", "name": "PARAM_1"},
                            { "type": "input_value", "name": "PARAM_2"},
                            { "type": "input_value", "name": "PARAM_3"},
                        ]
                    },
                    blocklyXml: "<block type='drawRectangle'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_3'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "drawCircle", params: ["Number", "Number", "Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                            { "type": "input_value", "name": "PARAM_1"},
                            { "type": "input_value", "name": "PARAM_2"},
                        ]
                    },
                    blocklyXml: "<block type='drawCircle'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
                        "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },

                {
                    name: "clearScreen"
                },
                {
                    name: "updateScreen"
                },
                {
                    name: "autoUpdate", params: ["Boolean"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                        ],
                    },
                    blocklyXml: "<block type='autoUpdate'>" +
                    "<value name='PARAM_0'><shadow type='logic_boolean'></shadow></value>" +
                    "</block>"

                },
                {
                    name: "fill", params: ["Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                        ]
                    },
                    blocklyXml: "<block type='fill'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "noFill"
                },
                {
                    name: "stroke", params: ["Number"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0"},
                        ]
                    },
                    blocklyXml: "<block type='stroke'>" +
                        "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
                        "</block>"
                },
                {
                    name: "noStroke"
                },
            ],
            internet: [
                {
                    name: "getTemperatureFromCloud", yieldsValue: 'int', params: ["String"], blocklyJson: {
                        "args0": [
                            { "type": "field_input", "name": "PARAM_0", text: "Paris"},
                        ]
                    },
                    blocklyXml: "<block type='getTemperatureFromCloud'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },
                {
                    name: "connectToCloudStore", params: ["String", "String"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", text: ""},
                            { "type": "input_value", "name": "PARAM_1", text: ""},
                        ]
                    },
                    blocklyXml: "<block type='connectToCloudStore'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },
                {
                    name: "writeToCloudStore", params: ["String", "String", "String"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", text: ""},
                            { "type": "input_value", "name": "PARAM_1", text: ""},
                            { "type": "input_value", "name": "PARAM_2", text: ""},
                        ]
                    },
                    blocklyXml: "<block type='writeToCloudStore'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "<value name='PARAM_2'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },
                {
                    name: "readFromCloudStore", yieldsValue: 'string', params: ["String", "String"], blocklyJson: {
                        "args0": [
                            { "type": "input_value", "name": "PARAM_0", text: ""},
                            { "type": "input_value", "name": "PARAM_1", text: ""},
                        ]
                    },
                    blocklyXml: "<block type='readFromCloudStore'>" +
                        "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
                        "</block>"
                },

            ]
        }
        // We can add multiple namespaces by adding other keys to customBlocks.
    };

    // Color indexes of block categories (as a hue in the range 0–420)
    context.provideBlocklyColours = function () {
        Blockly.HSV_SATURATION = 0.65;
        Blockly.HSV_VALUE = 0.80;
        Blockly.Blocks.inputs.HUE = 50;

        return {
            categories: {
                //actuator: 0,
                //sensors: 100,
                actuator: 212,
                sensors: 95,
                internet: 200,
                display: 300,

                input: 50,
                inputs: 50,
                lists: 353,
                logic: 298,
                math: 176,
                loops: 200,
                texts: 312,
                dicts: 52,
                tables: 212,
                variables: 30,
                procedures: 180,
            }
        };
    };

    // Constants available in Python
    context.customConstants = {
        quickpi: [
        ]
    };

    // Don't forget to return our newly created context!
    return context;
}

// Register the library; change "template" by the name of your library in lowercase
if (window.quickAlgoLibraries) {
    quickAlgoLibraries.register('quickpi', getContext);
} else {
    if (!window.quickAlgoLibrariesList) { window.quickAlgoLibrariesList = []; }
    window.quickAlgoLibrariesList.push(['quickpi', getContext]);
}

var sensorWithSlider = null;
var removeRect = null;
var sensorWithRemoveRect = null;

window.addEventListener('click', function (e) {
    var keep = false;
    var keepremove = false;
    e = e || window.event;
    var target = e.target || e.srcElement;

    if (sensorWithRemoveRect && sensorWithRemoveRect.focusrect && target == sensorWithRemoveRect.focusrect.node)
        keepremove = true;

    if (removeRect && !keepremove) {
        removeRect.remove();
        removeRect = null;
    }

    if (sensorWithSlider && sensorWithSlider.focusrect && target == sensorWithSlider.focusrect.node)
        keep = true;

    if (sensorWithSlider && sensorWithSlider.sliders) {
        for (var i = 0; i < sensorWithSlider.sliders.length; i++) {
            sensorWithSlider.sliders[i].slider.forEach(function (element) {
                if (target == element.node ||
                    target.parentNode == element.node) {
                    keep = true;
                    return false;
                }
            });
        }
    }

    if (!keep) {
        hideSlider(sensorWithSlider);
    }

}, false);//<-- we'll get to the false in a minute


function hideSlider(sensor) {
    if (!sensor)
        return;

    if (sensor.sliders) {
        for (var i = 0; i < sensor.sliders.length; i++) {
            sensor.sliders[i].slider.remove();
        }
        sensor.sliders = [];
    }


    if (sensor.focusrect && sensor.focusrect.paper && sensor.focusrect.paper.canvas){
        sensor.focusrect.toFront();
        if(sensor.muteBtn)
            sensor.muteBtn.toFront();
    }
}

export {
  getContext,
}