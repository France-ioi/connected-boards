export default {
  label: {
    // Labels for the blocks
    sleep: "esperar %1 milisegundos",
    currentTime: "tiempo transcurrido en milisegundos",

    turnLedOn: "encender el LED",
    turnLedOff: "apagar el LED",

    setLedState: "cambiar el LED %1 a %2 ",
    toggleLedState: "invertir el estado del LED %1",

    isLedOn: "LED encendido",
    isLedOnWithName: "LED %1 encendido",

    setLedBrightness: "Cambiar el brillo de %1 a %2",
    getLedBrightness: "Obtener el brillo de %1",

    turnBuzzerOn: "encender el zumbador",
    turnBuzzerOff: "apagar el zumbador",
    setBuzzerState: "cambiar el zumbador %1 a %2",
    isBuzzerOn: "zumbador encendido",
    isBuzzerOnWithName: "zumbador %1 encendido",

    setBuzzerNote: "frequencia de reproducción %2Hz en %1",
    getBuzzerNote: "frequncia del zumbador %1",

    isButtonPressed: "botón presionado",
    isButtonPressedWithName: "botón  %1 presionado",
    waitForButton: "esperar a que se presione un botón",
    buttonWasPressed: "el botón ha sido presionado",

    displayText: "desplegar texto %1",
    displayText2Lines: "desplegar texto Linea 1 : %1 Linea 2 : %2",

    readTemperature: "temperatura ambiente",
    getTemperatureFromCloud: "temperatura de la ciudad %1", // TODO: verify

    readRotaryAngle: "estado del potenciómetro %1",
    readDistance: "distancia medida por %1",
    readLightIntensity: "intensidad de luz",
    readHumidity: "humedad ambiental",

    setServoAngle: "cambiar el ángulo de el servo %1 a %2°",
    getServoAngle: "ángulo del servo %1",


    drawPoint: "dibuja un pixel",
    isPointSet: "este pixel esta dibujado",
    drawLine: "linea desde x₀: %1 y₀: %2 hasta x₁: %3 y₁: %4",
    drawRectangle: "rectángulo  x: %1 y: %2 largo: %3 alto: %4",
    drawCircle: "circulo x₀: %1 y₀: %2 diametro: %3",
    clearScreen: "limpiar toda la pantalla",
    updateScreen: "actualizar pantalla",
    autoUpdate: "modo de actualización de pantalla automática",

    fill: "establecer el color de fondo en %1",
    noFill: "no rellenar figuras",
    stroke: "color de los bordes %1",
    noStroke: "no dibujar los contornos",

    readAcceleration: "aceleración en m/s² en el eje %1",
    computeRotation: "cálculo del ángulo de rotación (°) en el acelerómetro %1",
    readSoundLevel: "volumen de sonido",

    readMagneticForce: "campo magnético (µT) en %1",
    computeCompassHeading: "dirección de la brújula en (°)",

    readInfraredState: "infrarrojos detectados en %1",
    setInfraredState: "cambiar emisor de infrarrojos %1 a %2",

    // Gyroscope
    readAngularVelocity: "velocidad angular (°/s) del guroscopio %1",
    setGyroZeroAngle: "inicializar el giroscopio a estado cero",
    computeRotationGyro: "calcular la rotación del giroscopio %1",

    //Internet store
    connectToCloudStore: "conectar a la nube. Usuario %1 Contraseña %2",
    writeToCloudStore: "escribir en la nube : Usuario %1 llave %2 valor %3",
    readFromCloudStore: "leer de la nube : Usuario %1 lave %2",

    // IR Remote
    readIRMessage: "esperar un mensaje de infrarrojos : %1 durante : %2 ms",
    sendIRMessage: "enviar el mensaje por infrarrojos %2 por %1",
    presetIRMessage: "preparar un mensaje de infrarrojos con el nombre %1 y el contenido %2",

    //Continous servo
    setContinousServoDirection: "cambiar la dirección del servomotor continuo %1 %2",
  },
  code: {
    // Names of the functions in Python, or Blockly translated in JavaScript
    turnLedOn: "turnLedOn",
    turnLedOff: "turnLedOff",
    setLedState: "setLedState",

    isButtonPressed: "isButtonPressed",
    isButtonPressedWithName: "isButtonPressed",
    waitForButton: "waitForButton",
    buttonWasPressed: "buttonWasPressed",

    toggleLedState: "toggleLedState",
    displayText: "displayText",
    displayText2Lines: "displayText",
    readTemperature: "readTemperature",
    sleep: "sleep",
    setServoAngle: "setServoAngle",
    readRotaryAngle: "readRotaryAngle",
    readDistance: "readDistance",
    readLightIntensity: "readLightIntensity",
    readHumidity: "readHumidity",
    currentTime: "currentTime",
    getTemperatureFromCloud: "getTemperatureFromCloud",

    isLedOn: "isLedOn",
    isLedOnWithName: "isLedOn",

    setBuzzerNote: "setBuzzerNote",
    getBuzzerNote: "getBuzzerNote",
    setLedBrightness: "setLedBrightness",
    getLedBrightness: "getLedBrightness",
    getServoAngle: "getServoAngle",

    setBuzzerState: "setBuzzerState",

    turnBuzzerOn: "turnBuzzerOn",
    turnBuzzerOff: "turnBuzzerOff",
    isBuzzerOn: "isBuzzerOn",
    isBuzzerOnWithName: "isBuzzerOn",


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
  },
  description: {
    // Descriptions of the functions in Python (optional)
    turnLedOn: "turnLedOn() enciende el LED",
    turnLedOff: "turnLedOff() apaga el led LED",
    isButtonPressed: "isButtonPressed() devuelve True si el boton esta presionado, False de otra manera",
    isButtonPressedWithName: "isButtonPressed(button) devuelve True si el boton esta presionado, False de otra manera",
    waitForButton: "waitForButton(button) pausa la ejecución hasta que se presiona el botón",
    buttonWasPressed: "buttonWasPressed(button) indica si se ha pulsado el botón desde la última llamada a esta función",
    setLedState: "setLedState(led, state) modifica el estado del LED: True para encenderlo, False para apagarlo",
    toggleLedState: "toggleLedState(led) invierte el estado del LED",
    displayText: "displayText(line1, line2) muestra una o dos líneas de texto. line2 es opcional",
    displayText2Lines: "displayText(line1, line2) muestra una o dos líneas de texto. line2 es opcional",
    readTemperature: "readTemperature(thermometer) devuelve la temperatura ambiente",
    sleep: "sleep(milliseconds) pausa la ejecución por un tiempo en milisegundos",
    setServoAngle: "setServoAngle(servo, angle) cambiar el ángulo del servomotor",
    readRotaryAngle: "readRotaryAngle(potentiometer) devuelve la posición del potenciómetro",
    readDistance: "readDistance(distanceSensor) devuelve la distancia medida",
    readLightIntensity: "readLightIntensity(lightSensor) devuelve la intensidad de la luz",
    readHumidity: "readHumidity(hygrometer) devuelve la humedad ambiental",
    currentTime: "currentTime() tiempo en milisegundos desde el inicio del programa",

    setLedBrightness: "setLedBrightness(led, brightness) ajusta la intensidad de la luz del LED",
    getLedBrightness: "getLedBrightness(led) devuelve la intensidad de luz del LED",
    getServoAngle: "getServoAngle(servo) devuelve el ángulo del servomotor",

    isLedOn: "isLedOn() devuelve True si el LED está encendido, False si está apagado",
    isLedOnWithName: "isLedOn(led) devuelve True si el LED está encendido, False si está apagado",

    turnBuzzerOn: "turnBuzzerOn() enciende el zumbador",
    turnBuzzerOff: "turnBuzzerOff() apaga el zumbador",

    isBuzzerOn: "isBuzzerOn() devuelve True si el zumbador está encendido, False si está apagado",
    isBuzzerOnWithName: "isBuzzerOn(buzzer) devuelve True si el zumbador está encendido, False si está apagado",

    setBuzzerState: "setBuzzerState(buzzer, state) modifica el estado del zumbador: Verdadero para encendido, Falso para apagado",
    setBuzzerNote: "setBuzzerNote(buzzer, frequency) suena el zumbador en la frecuencia indicada",
    getBuzzerNote: "getBuzzerNote(buzzer) devuelve la frecuencia actual del zumbador",

    getTemperatureFromCloud: "getTemperatureFromCloud(town) obtiene la temperatura de la ciudad", // TODO: Verify

    drawPoint: "drawPoint(x, y) dibuja un punto en las coordenadas x, y",
    isPointSet: "isPointSet(x, y) devuelve True se dibujó sobre el punto x, y, False de lo contrario",
    drawLine: "drawLine(x0, y0, x1, y1) dibuja una linea empezando desde el punto x0, x1, hasta el punto x1, y1",
    drawRectangle: "drawRectangle(x0, y0, width, height) dibuja un rectángulo empezando en el punto x0, y0 con el ancho y altura dados",
    drawCircle: "drawCircle(x0, y0, diameter) dibuja un circulo con centro en x0, y0 y el diametro dado",
    clearScreen: "clearScreen() limpia toda la pantalla",
    updateScreen: "updateScreen() actualiza los contenidos de la pantalla",
    autoUpdate: "autoUpdate(auto) cambia el modo de actualización de pantalla automatica",

    fill: "fill(color) rellenar las figuras con el color dado",
    noFill: "noFill() no rellenar las figuras",
    stroke: "stroke(color) dibujar los bordes de las figuras con el color dado",
    noStroke: "noStroke() no dibujar los bordes de las figuras",


    readAcceleration: "readAcceleration(axis) leer la acceleración (m/s²) en el eje (X, Y o Z)",
    computeRotation: "computeRotation(axis) calcular el ángulo de rotación (°) en el acelerómetro",

    readSoundLevel: "readSoundLevel(port) devuelve el volumen del sonido ambiente",


    readMagneticForce: "readMagneticForce(axis) devuelve el campo magnético (µT) en el eje (X, Y o Z)",
    computeCompassHeading: "computeCompassHeading() devuelve la dirección de la brujula en grados",

    readInfraredState: "readInfraredState() devuelve True si se detecta una señal infrarroja, Falso de otra manera",
    setInfraredState: "setInfraredState(state) si se le pasa True enciende el transmisor infrarrojo, Falso lo apaga",

    // Gyroscope
    readAngularVelocity: "readAngularVelocity(axis) devuelve la velocidad angular (°/s) del gyroscopio",
    setGyroZeroAngle: "setGyroZeroAngle() inicializa el giroscopio a estado cero",
    computeRotationGyro: "computeRotationGyro(axis) calcula la rotación del giroscopio (°)",

    //Internet store
    connectToCloudStore: "connectToCloudStore(identifier, password) se conecta a la nube con el usuario y password dados",
    writeToCloudStore: "writeToCloudStore(identifier, key, value) escribe un valor a un llave en la nube",
    readFromCloudStore: "readFromCloudStore(identifier, key) devuelve un valor leido de la nube de la llave dada",

    // IR Remote
    readIRMessage: "readIRMessage(irrec, timeout) espera por un mensaje infrarrojo y lo devuelve durante el tiempo dado en milisegundos",
    sendIRMessage: "sendIRMessage(irtrans, name) envia un mensaje infrarrojo previamente configurado con el nombre dado",
    presetIRMessage: "presetIRMessage(name, data) configura un mensaje infrarrojo con el nombre y datos dados",

    //Continous servo
    setContinousServoDirection: "setContinousServoDirection(servo, direction) cambia la dirección de un servomotor",
  },
  constant: {},

  startingBlockName: "Programa", // Name for the starting block
  messages: {
    sensorNotFound: "Acceso a un componente inexistente: {0}.",
    manualTestSuccess: "Prueba automática validada.",
    testSuccess: "Bien hecho! El resultado es correcto",
    wrongState: "Prueba fallida: <code>{0}</code> estaba en etado {1} en lugar de {2} en t={3}ms.",
    wrongStateDrawing: "Prueba fallida: <code>{0}</code> difiere en {1} píxeles de la visualización esperada en t = {2} ms.",
    wrongStateSensor: "Prueba fallida: su programa no leyó el estado de <code>{0}</code> después de t = {1} ms.",
    programEnded: "Programa completado.",
    piPlocked: "El dispositivo está bloqueado. Desbloquear o reiniciar.",
    cantConnect: "No puede conectarse al dispositivo.",
    wrongVersion: "El software en tu Raspberry Pi es demasiado antiguo, actualízalo.",
    cardDisconnected: "La tarjeta ha sido desconectada.",
    sensorInOnlineMode: "No se pueden modificar sensores en modo conectado.",
    actuatorsWhenRunning: "No se pueden cambiar los actuadores mientras se ejecuta un programa",
    cantConnectoToUSB: 'Intentado conectarse por USB, conecta tu Raspberry Pi al puerto USB <i class="fas fa-circle-notch fa-spin"></i>',
    cantConnectoToBT: 'Intentando conectarse por Bluetooth, conecta tu Raspberry Pi por Bluetooth <i class="fas fa-circle-notch fa-spin"></i>',
    canConnectoToUSB: "USB Conectado.",
    canConnectoToBT: "Bluetooth Conectado.",
    noPortsAvailable: "No hay ningún puerto compatible con {0} disponible (type {1})",
    sensor: "Sensor",
    actuator: "Actuador",
    removeConfirmation: "¿Estás seguro de que deseas quitar este componente?",
    remove: "Eliminar",
    keep: "Mantener",
    minutesago: "Visto por última vez hace {0} minutos",
    hoursago: "Visto por ultima vez hace mas de una hora",
    drawing: "dibujando",
    timeLabel: "Tiempo",
    seconds: "segundos",

    changeBoard: "Cambiar tablero",
    connect: "Conectar",
    install: "Instalar",
    config: "Configuración",


    raspiConfig: "Configuración de tu tablero",
    local: "Local",
    schoolKey: "Ingresa una identificación de la escuela",
    connectList: "Selecciona un dispositivo para conectarte de la siguiente lista",
    enterIpAddress: "o ingresa una dirección IP",
    getPiList: "Obtener la lista",
    connectTroughtTunnel: "Conéctate a través del túnel de France-ioi",

    connectToLocalhost: "Conectarse al dispositivo que ejecuta este navegador",
    connectToWindowLocation: "Conéctate al tablero desde la que se carga esta página",

    connectToDevice: "Conectar al dispositivo",
    disconnectFromDevice: "Desconectar",


    irReceiverTitle: "Recibir códigos infrarrojos",
    directIrControl: "Apunta tu control remoto a tu tablero QuickPi y presiona uno de los botones",
    getIrCode: "Recibir un código",
    closeDialog: "Cerrar",

    irRemoteControl: "Control remoto Infrarrojo",

    noIrPresets: "Utiliza la función de preparación de mensajes IR para agregar comandos de control remoto",
    irEnableContinous: "Activar la emisión IR continua",
    irDisableContinous: "Desactivar la emisión IR continua",

    getTemperatureFromCloudWrongValue: "getTemperatureFromCloud: {0} is not a town supported by getTemperatureFromCloud", // TODO: translate
    wifiNotActive: "El wifi no está activado. Active Wi-Fi para hacer esto.",
    wifiSsid: "SSID:",
    wifiPassword: "Contraseña:",
    wifiEnable: "Activar",
    wifiDisable: "Desactivar",
    wifiConnect: "Conectar",
    wifiDisconnect: "Desconectar",
    wifiStatusDisabled: "Desactivado",
    wifiStatusDisconnected: "Desconectado",
    wifiStatusConnected: "Conectado",
    wifiStatus: "Estado:",
    networkRequestFailed: "Error en la solicitud a la página {0}.",
    networkResponseInvalidJson: "Esta respuesta no está en formato JSON.",

    up: "arriba",
    down: "abajo",
    left: "izquierda",
    right: "derecha",
    center: "centro",

    on: "Encendido",
    off: "Apagado",

    grovehat: "Sombrero Grove para Raspberry Pi",
    quickpihat: "Sobrero QuickPi de France IOI",
    pinohat: "Raspberry Pi sin sombrero",
    led: "LED",
    ledrgb: "LED RGB",
    leddim: "LED regulable",
    blueled: "LED azul",
    greenled: "LED verde",
    orangeled: "LED naranja",
    redled: "LED rojo",
    buzzer: "Zumbador",
    grovebuzzer: "Zumbador Grove",
    quickpibuzzer: "Zumbador passive de QuickPi",
    servo: "Motor Servo",
    screen: "Pantalla",
    grove16x2lcd: "Pantalla Grove 16x2",
    oled128x32: "Pantalla 128x32 Oled",
    irtrans: "Transmisor de infrarrojos",
    button: "Botón",
    wifi: "Wi-Fi",
    fivewaybutton: "Botón de 5 direcciones",
    tempsensor: "Sensor de temperatura",
    groveanalogtempsensor: "Sensor de temperatura analógico Grove",
    quickpigyrotempsensor: "Sensor de temperaturea en el Acelerometro y Gyroscopio de QuickPi",
    dht11tempsensor: "Sensor de Temperatura DHT11",
    potentiometer: "Potenciómetro",
    lightsensor: "Sensor de luz",
    distancesensor: "Sensor de distancia",
    timeofflightranger: "Sensor de distancia por rebote de luz",
    ultrasonicranger: "Sensor de distancia por últrasonido",
    humiditysensor: "Sensor de humedad",
    soundsensor: "Sensor de sonido",
    accelerometerbmi160: "Acelerómetro (BMI160)",
    gyrobmi160: "Giroscopio (BMI160)",
    maglsm303c: "Magnetómetro (LSM303C)",
    irreceiver: "Receptor de infrarrojos",
    cloudstore: "Almacenamiento en la nube",
    addcomponent: "Agregar componente",
    selectcomponent: "Selecciona un componente para agregar a tu tablero y conéctalo a un puerto.",
    add: "Agregar",
    builtin: "(incorporado)",
    chooseBoard: "Elije tu tablero",
    nameandports: "Nombres y puertos de sensores y actuadores QuickPi",
    name: "Nombre",
    port: "Puerto",
    state: "Estado",

    cloudTypes: {
      object: "Dictionario",
      array: "Arreglo",
      boolean: "Booleano",
      number: "Nombre",
      string: "Cadena de caracteres"
    },
    cloudMissingKey: "Test échoué : Il vous manque la clé {0} dans le cloud.", // TODO: translate
    cloudMoreKey: "Test échoué : La clé {0} est en trop dans le cloud", // TODO: translate
    cloudUnexpectedKeyCorrection: "Test échoué : La clé {0} n'étais pas attendu dans le cloud", // TODO: translate
    cloudPrimitiveWrongKey: "Test échoué : À la clé {0} du cloud, la valeur {1} était attendue au lieu de {2}", // TODO: translate
    cloudArrayWrongKey: "Test échoué : Le tableau à la clé {0} du cloud diffère de celui attendu.", // TODO: translate
    cloudDictionaryWrongKey: "Test échoué : Le dictionnaire à la clé {0} diffère de celui attendu", // TODO: translate
    cloudWrongType: "Test échoué : Vous avez stocké une valeur de type \"{0}\" dans la clé {1} du cloud, mais le type \"{2}\" était attendu.", // TODO: translate

    cloudKeyNotExists: "La llave no existe : {0} ",
    cloudWrongValue: "Llave {0}: el valor {2} no es el esperado, {1}.",
    cloudUnexpectedKey: "La llave {0} no es una llave esperada",
    hello: "Hola",
    experiment: "Experimentar",
    validate: "Validar",
    validate1: "Validar 1",
    validate2: "Validar 2",
    validate3: "Validar 3",

    // sensorNameBuzzer: "timbre",
    sensorNameBuzzer: "tim",
    sensorNameLed: "led",
    sensorNameLedRgb: "ledRgb",
    sensorNameLedDim: "ledDim",
    sensorNameRedLed: "ledrojo",
    sensorNameGreenLed: "ledverde",
    sensorNameBlueLed: "ledazul",
    sensorNameScreen: "pantalla",
    sensorNameIrTrans: "tranir",
    sensorNameIrRecv: "recir",
    sensorNameMicrophone: "micro",
    sensorNameTemperature: "temp",
    sensorNameGyroscope: "gyro",
    sensorNameMagnetometer: "magneto",
    // sensorNameDistance: "distancia",
    sensorNameDistance: "dist",
    sensorNameAccelerometer: "acel",
    sensorNameButton: "boton",
    sensorNameLight: "luz",
    sensorNameStick: "stick",
    sensorNameServo: "servo",
    sensorNameHumidity: "humedad",
    sensorNamePotentiometer: "pot",
    sensorNameCloudStore: "nube",
    sensorNameWifi: "wifi",
  },
  concepts: {
    quickpi_start: 'Crea tu primer programa y ejecútalo',
    quickpi_validation: 'Prueba y valida tus programas',
    quickpi_buzzer: 'Zumbador',
    quickpi_led: 'LEDs o diodos electroluminiscentes',
    quickpi_button: 'Botón',
    quickpi_screen: 'Pantalla',
    quickpi_draw: 'Dibujar sobre la pantalla',
    quickpi_range: 'Sensor de distancia',
    quickpi_servo: 'Servo motor',
    quickpi_thermometer: 'Termómetro',
    quickpi_microphone: 'Micrófono',
    quickpi_light_sensor: 'Sensor de luz',
    quickpi_accelerometer: 'Acelerómetro',
    quickpi_wait: 'Gestión del tiempo',
    quickpi_magneto: 'Magnetómetro', // TODO: verify
    quickpi_ir_receiver: 'Receptor de infrarrojos', // TODO: verify
    quickpi_ir_emitter: 'Emisor de infrarrojos', // TODO: verify
    quickpi_potentiometer: "Potenciómetro", // TODO: verify
    quickpi_gyroscope: "giroscopio", // TODO: verify
    quickpi_cloud: 'Almacenamiento en la nube'
  }
}
