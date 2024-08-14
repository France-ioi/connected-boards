import {galaxiaBoard} from "./boards/galaxia/galaxia_board";
import {quickPiLocalLanguageStrings} from "./lang/language_strings";
import {quickPiBoard} from "./boards/quickpi/quickpi_board";
import {AbstractBoard} from "./boards/abstract_board";
import {buzzerSound} from "./sensors/buzzer_sound";
import {showConfig} from "./config/config";
import {getSessionStorage, setSessionStorage} from "./helpers/session_storage";
import {SensorHandler} from "./sensors/sensor_handler";
import {showasConnecting} from "./display";
import {LocalQuickStore} from "./sensors/local_quickpi_store";
import {Sensor} from "./definitions";

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
    context.mainBoard = mainBoard;

    const sensorHandler = new SensorHandler(context, strings);
    context.sensorHandler = sensorHandler;

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

        let conceptStrings = strings.concepts;
        let conceptIndex = 'quickpi_' + window.stringsLanguage + '.html';
        if (window.stringsLanguage == 'fr' || !strings.concepts) {
            conceptStrings = quickPiLocalLanguageStrings.fr.concepts;
            conceptIndex = 'quickpi.html';
        }
        let conceptBaseUrl = 'https://static4.castor-informatique.fr/help/'+conceptIndex;

        for(let i = 0; i < quickPiConceptList.length; i++) {
            let concept: any = quickPiConceptList[i];
            concept.name = conceptStrings[concept.id];
            concept.url = conceptBaseUrl + '#' + concept.id;
            if(!concept.language) { concept.language = 'all'; }
            conceptList.push(concept);
        }
        return conceptList;
    }

    const boardDefinitions = mainBoard.getBoardDefinitions();

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

    context.offLineMode = true;
    context.timeLineStates = [];
    let innerState: any = {};

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
                        let newFailInfo = {
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

        if (context.paper && context.autoGrading && context.display) {
            if (context.sensorStates)
                context.sensorStates.remove();
            context.sensorStates = context.paper.set();
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
                    sensorHandler.drawSensor(sensor);
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

                    var newSensor: any = {
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
            var savedSensor: Sensor = {
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

        for (let i = 0; i < infos.quickPiSensors.length; i++) {
            var sensor = infos.quickPiSensors[i];
            sensor.removed = true;
        }

        infos.quickPiSensors = [];

        for (var i = 0; i < newSensors.length; i++) {
            let sensor: Sensor = {
                type: newSensors[i].type,
                port: newSensors[i].port,
                name: newSensors[i].name
            };

            if (newSensors[i].subType)
                sensor.subType = newSensors[i].subType;

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

        if (context.recreateDisplay || !context.paper)
        {
            context.createDisplay();
            context.recreateDisplay = false;
        }

        context.paper.setSize(($('#virtualSensors').width() * context.quickPiZoom), $('#virtualSensors').height());
        if(context.infos.quickPiBoard) {
            $('#virtualBoard').height($('#virtualSensors').height());
        }

        var area = context.paper.width * context.paper.height;
        context.compactLayout = false;
        if (area < 218700)
        {
            context.compactLayout = true;
        }        

        if (context.sensorDivisions) {
            context.sensorDivisions.remove();
        }

        context.sensorDivisions = context.paper.set();

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
            context.sensorStates = context.paper.set();
            //context.paper.clear(); // Do this for now.

            var numSensors = infos.quickPiSensors.length;
            var sensorSize = Math.min(context.paper.height / numSensors * 0.80, $('#virtualSensors').width() / 10);

            //var sensorSize = Math.min(context.paper.height / (numSensors + 1));


            context.timeLineSlotHeight = Math.min(context.paper.height / (numSensors + 1));
            context.sensorSize = sensorSize * .90;

            context.timelineStartx = context.sensorSize * 3;

            var maxTime = context.maxTime;
            if (maxTime == 0)
                maxTime = 1000;

            if (!context.loopsForever)
                maxTime = Math.floor(maxTime * 1.05);

            context.pixelsPerTime = (context.paper.width - context.timelineStartx - 30) / maxTime;

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

                var rect = context.paper.rect(0, sensor.drawInfo.y, context.paper.width, context.timeLineSlotHeight);

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

                sensorHandler.drawSensor(sensor);
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
                    nSensors += cellsAmount(context.paper) - 1;
                }
            });

            if (nSensors < 4)
                nSensors = 4;

            var geometry = null;
            if (context.compactLayout)
                // geometry = squareSize(context.paper.width, context.paper.height, nSensors, 2);
                geometry = squareSize(context.paper.width, context.paper.height, nSensors, 1.5);
            else
                geometry = squareSize(context.paper.width, context.paper.height, nSensors, 1);
            
            // console.log(geometry)
            var nbRows = geometry.rows;
            var nbCol = geometry.cols;
            var cellW = context.paper.width / nbCol;

            // context.sensorSize = geometry.size * .10;
            reorganizeSensors(geometry);

            var lineAttr = {
                "stroke-width": 1,
                "stroke": "black",
                opacity: 0.1
            };
            var x1 = cellW*0.2;
            var x2 = context.paper.width - cellW*0.2;
            var iSensor = 0;
            for (var row = 0; row < nbRows; row++) {
                var y = geometry.size * row;
                
                if(row > 0){
                    var line = context.paper.path(["M", x1,y,"L", x2,y]);
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
                        cells = cellsAmount(context.paper);

                    // Particular case if we have a screen and only 2 columns, we can put the
                    // cells of the screen at 2 because the display is still good with it.
                    // I used rows, because I think that for geometry, rows and cols are reversed. You can try to change
                    // it and see the result in animal connecte.
                    if (sensor && sensor.type === "screen" && cells > nbCol && cells == 3 && nbCol == 2)
                        cells = 2;

                    if(col > 0){
                        var line = context.paper.path(["M", x, y1, "V", y2]).attr(lineAttr);
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
                                    cells = cellsAmount(context.paper);

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

                        sensorHandler.drawSensor(sensor);
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
                sensorHandler.warnClientSensorStateChanged(sensor);
                sensorHandler.drawSensor(sensor);
            }

            context.sensorStateListener = mainBoard.init('#virtualBoard', onUserEvent);
        }

        this.raphaelFactory.destroyAll();
        context.paper = this.raphaelFactory.create(
                "paperMain",
                "virtualSensors",
                ($('#virtualSensors').width() * context.quickPiZoom),
                $('#virtualSensors').height()
        );

            if (context.autoGrading) {
                $('#virtualSensors').css("overflow-y", "hidden");
                $('#virtualSensors').css("overflow-x", "auto");

                // Allow horizontal zoom on grading
                context.paper.canvas.onwheel = function(event) {
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

                        sensorHandler.drawSensor(sensor);
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
                    let table = document.getElementById("sensorTable") as HTMLTableElement;
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

    function addDefaultBoardSensors() {
        var board = mainBoard.getCurrentBoard(context.board);
        var boardDefaultSensors = board.default;

        if (!boardDefaultSensors)
            boardDefaultSensors = board.builtinSensors;

        if (boardDefaultSensors)
        {
            for (var i = 0; i < boardDefaultSensors.length; i++) {
                var sensor = boardDefaultSensors[i];

                let newSensor: Sensor = {
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

            let newSensor = {
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

    // Straight from stack overflow :)
    function squareSize(x, y, n, ratio) {
        // Compute number of rows and columns, and cell size
        ratio = x / y * ratio;
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
        if (context.paper == undefined || !context.display)
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

        var timelabel = context.paper.text(textStart, context.timeLineY, strings.messages.timeLabel);
        timelabel.attr({ "font-size": "10px", 'text-anchor': 'start', 'font-weight': 'bold', fill: "gray" });
        context.timelineText.push(timelabel);
        timelabel.node.style.MozUserSelect = "none";
        timelabel.node.style.WebkitUserSelect = "none";

        var bbox = timelabel.getBBox();
        textStart = bbox.x + bbox.width + 3;

        var timelabel = context.paper.text(textStart, context.timeLineY, '\uf00e');
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

        var timelabel = context.paper.text(textStart, context.timeLineY, '\uf010');
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


            var timelabel = context.paper.text(x, context.timeLineY, labelText);

            timelabel.attr({ "font-size": "15px", 'text-anchor': 'center', 'font-weight': 'bold', fill: "gray" });
            timelabel.node.style = "-moz-user-select: none; -webkit-user-select: none;";

            context.timelineText.push(timelabel);


            var timelinedivisor = context.paper.path(["M", x,
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
        if (!context.timeLineHoverLine || sensorHandler.isElementRemoved(context.timeLineHoverLine)) {
            context.timeLineHoverLine = context.paper.rect(0, 0, 0, 0);
        }

        context.timeLineHoverLine.attr({
                                            "stroke": "blue",
                                             "opacity": 0
        });


        if (context.timeLineHoverPath) {
            context.timeLineHoverPath.remove();
        }

        context.timeLineHoverPath = context.paper.rect(context.timelineStartx, 0, context.maxTime * context.pixelsPerTime, context.timeLineY);

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
                    sensorHandler.drawSensor(sensor);
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

                sensorHandler.drawSensor(sensor);
            }

        });


        if (!context.loopsForever) {
            var endx = context.timelineStartx + (context.maxTime * context.pixelsPerTime);
            var x = context.timelineStartx + (i * context.pixelsPerTime);
            var timelabel = context.paper.text(x, context.timeLineY, '\uf11e');
            timelabel.node.style.fontFamily = '"Font Awesome 5 Free"';
            timelabel.node.style.fontWeight = "bold";
            timelabel.node.style.MozUserSelect = "none";
            timelabel.node.style.WebkitUserSelect = "none";


            timelabel.attr({ "font-size": "20" + "px", 'text-anchor': 'middle', 'font-weight': 'bold', fill: "gray" });
            context.timelineText.push(timelabel);

			if (context.timeLineEndLine)
				context.timeLineEndLine.remove();

            context.timeLineEndLine = context.paper.path(["M", endx,
                                                0,
                                                "L", endx,
                                                context.timeLineY]);


            if (context.endFlagEnd)
                context.endFlagEnd.remove();
            context.endFlagEnd = context.paper.rect(endx, 0, x, context.timeLineY + 10);
            context.endFlagEnd.attr({
                "fill": "lightgray",
                "stroke": "none",
                "opacity": 0.2,
            });
        }


        /*
                context.paper.path(["M", context.timelineStartx,
                    context.paper.height - context.sensorSize * 3 / 4,
                    "L", context.paper.width,
                    context.paper.height - context.sensorSize * 3 / 4]);
        */
    }

    function drawCurrentTime() {
        if (!context.paper || !context.display || isNaN(context.currentTime))
            return;
/*
        if (context.currentTimeText)
            context.currentTimeText.remove();

        context.currentTimeText = context.paper.text(0, context.paper.height - 40, context.currentTime.toString() + "ms");
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
            context.timeLineCurrent = context.paper.path(targetpath);

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
            context.timeLineCircle = context.paper.circle(startx, context.timeLineY, 10);

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
            context.timeLineTriangle = context.paper.path(targetpath);

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

        if (context.paper == undefined ||
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

                    var joinline = context.paper.path(["M", startx,
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

                        var paperText = context.paper.text(startx, ypositiontop + offset - 10, stateText);
                        drawnElements.push(paperText);
                        context.sensorStates.push(paperText);

                        sensor.timelinelastxlabel[i] = startx;
                    }
                }

                var stateline = context.paper.path(["M", startx,
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

                var joinline = context.paper.path(["M", startx,
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

                    var paperText = context.paper.text(startx, y, stateText);
                    drawnElements.push(paperText);
                    context.sensorStates.push(paperText);

                    sensor.timelinelastxlabel = startx;
                }
            }

            sensor.lastAnalogState = state == null ? 0 : state;

            var stateline = context.paper.path(["M", startx,
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
                        var stateline = context.paper.path(targetpath);
                    }
                    else
                    {
                        var stateline = context.paper.path(startingpath);
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
                        sensor.stateArrow = context.paper.text(startx, ypos + 7, stateToFA[i]);
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
                    var stateBubble = context.paper.text(startx, ypositiontop + 10, '\uf303');

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
                    var stateBubble = context.paper.text(startx, ypositionmiddle + 10, '\uf27a');

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
                            sensor.tooltipText = context.paper.text(startx, ypositionmiddle + 50, state.line1 + "\n" + (state.line2 ? state.line2 : ""));

                            var textDimensions = sensor.tooltipText.getBBox();

                            sensor.tooltip = context.paper.rect(textDimensions.x - 15, textDimensions.y - 15, textDimensions.width + 30, textDimensions.height + 30);
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
                    var stateBubble = context.paper.text(startx, ypositionmiddle + 10, '\uf044');

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
                                var div = LocalQuickStore.renderDifferences(expectedState, state);
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
                var c = context.paper.rect(startx, ypositionmiddle, stateLenght, strokewidth);
                c.attr({
                    "stroke": "none",
                    "fill": color,
                });

            } else {
                var c = context.paper.rect(startx, ypositionmiddle, 0, strokewidth);
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
            wrongindicator = context.paper.path(["M", startx,
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

    context.sensorsSaved = {};

    context.registerQuickPiEvent = function (name, newState, setInSensor = true, allowFail = false) {
        var sensor = sensorHandler.findSensorByName(name);
        if (!sensor) {
            context.success = false;
            throw (strings.messages.sensorNotFound.format(name));
        }

        if (setInSensor) {
            sensor.state = newState;
            sensorHandler.drawSensor(sensor);
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
            sensorHandler.drawSensor(sensor);
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
            const sensorState = context.gradingStatesByTime[iStates];

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
        sensorHandler.drawSensor(sensor);
        callback();
    }

    /***** Functions *****/
    /* Here we define each function of the library.
       Blocks will generally use context.group.blockName as their handler
       function, hence we generally use this name for the functions. */



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

    // TODO: Move this to Galaxia
    // TODO: Move to external file and then import them in Galaxia to be reusable
    context.customClasses = {
        thingz: { // module name
            sensors: { // category name
                Accel: [ // class name
                    {name: "get_x", yieldsValue: true, blocklyJson: {output: "Number"}},
                    {name: "get_y", yieldsValue: true, blocklyJson: {output: "Number"}},
                    {name: "get_z", yieldsValue: true, blocklyJson: {output: "Number"}},
                ],
            },
        },
    };

    context.customClassInstances = {
        thingz: {
            accelerometer: 'Accel',
        }
    };

    context.thingz = {
        Accel: {
            get_x: function (self, callback) {
                context.quickpi.readAcceleration('x', callback);
            },
            get_y: function (self, callback) {
                context.quickpi.readAcceleration('y', callback);
            },
            get_z: function (self, callback) {
                context.quickpi.readAcceleration('z', callback);
            },
        }
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
        window.Blockly.HSV_SATURATION = 0.65;
        window.Blockly.HSV_VALUE = 0.80;
        window.Blockly.Blocks.inputs.HUE = 50;

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
    window.quickAlgoLibraries.register('quickpi', getContext);
} else {
    if (!window.quickAlgoLibrariesList) { window.quickAlgoLibrariesList = []; }
    window.quickAlgoLibrariesList.push(['quickpi', getContext]);
}

export {
  getContext,
}