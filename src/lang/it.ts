export default { // TODO
  label: {
    // Labels for the blocks
    sleep: "attendi %1 millisecondei",
    currentTime: "tempo calcolato in millisecondi",

    turnLedOn: "accendi il LED",
    turnLedOff: "spegni il LED",

    setLedState: "passa il LED da %1 a %2 ",
    toggleLedState: "inverti il LED %1",

    isLedOn: "LED acceso",
    isLedOnWithName: "LED %1 acceso",

    setLedBrightness: "imposta la luminosità da %1 a %2",
    getLedBrightness: "leggi la luminosità di %1",

    turnBuzzerOn: "accendi il cicalino",
    turnBuzzerOff: "spegni il cicalino",
    setBuzzerState: "imposta il cicalino %1 a %2",
    isBuzzerOn: "cicalino acceso",
    isBuzzerOnWithName: "cicalino %1 acceso",

    setBuzzerNote: "suona la frequenza %2Hz su %1",
    getBuzzerNote: "frequenza del cicalino %1",

    isButtonPressed: "pulsante premuto",
    isButtonPressedWithName: "pulsante %1 premuto",
    waitForButton: "attendi una pressione sul pulsante",
    buttonWasPressed: "il pulsante è stato premuto",

    displayText: "mostra %1",
    displayText2Lines: "mostra Riga 1 : %1 Riga 2 : %2",

    readTemperature: "temperatura ambiente",
    getTemperatureFromCloud: "temperatura della cità %1", // TODO: verify

    readRotaryAngle: "stato del potenziometro %1",
    readDistance: "distanza misurata all'%1",
    readLightIntensity: "intensità luminosa",
    readHumidity: "umidità ambiente",

    setServoAngle: "metti il servomotore %1 all'angolo %2",
    getServoAngle: "angolo del servomotore %1",

    setContinousServoDirection: "imposta la direzione continua del servo %1 %2",

    drawPoint: "draw pixel",
    isPointSet: "is pixel set in screen",
    drawLine: "riga x₀: %1 y₀: %2 x₁: %3 y₁: %4",
    drawRectangle: "rettangolo x₀: %1 y₀: %2 larghezza₀: %3 altezza₀: %4",
    drawCircle: "cerchio x₀: %1 y₀: %2 diametro₀: %3",
    clearScreen: "cancella tutta la schermata",
    updateScreen: "aggiorna schermata",
    autoUpdate: "aggiornamento automatico della schermata",

    fill: "metti il colore di fondo a %1",
    noFill: "non riempire le forme",
    stroke: "impostare il colore del percorso a %1",
    noStroke: "non disegnare i contorni",

    readAcceleration: "accelerazione in (m/s²) nell'asse %1",
    computeRotation: "calcolo dell'angolo di rotazione (°) sull'accelerometro %1",
    readSoundLevel: "volume sonoro",

    readMagneticForce: "campo magnetico (µT) su %1",
    computeCompassHeading: "direzione della bussola in (°)",

    readInfraredState: "infrarosso rilevato su %1",
    setInfraredState: "imposta il trasmettitore a infrarossi %1 a %2",

    // Gyroscope
    readAngularVelocity: "velocità angolare (°/s) del giroscopio %1",
    setGyroZeroAngle: "inizializza il giroscopio allo stato zero",
    computeRotationGyro: "calcola la rotazione del giroscopio %1",

    //Internet store
    connectToCloudStore: "connettersi al cloud. Nome utente %1 Password %2",
    writeToCloudStore: "scrivi nel cloud : id %1 chiave %2 valore %3",
    readFromCloudStore: "leggi nel cloud : id %1 chiave %2",

    // IR Remote
    readIRMessage: "attendi un messaggio IR nome : %1 per : %2 ms",
    sendIRMessage: "invio del messaggio prepato IR nominato %2 su %1",
    presetIRMessage: "prepara un messaggio IR con il nome %1 e contenuto %2",
  },
  code: {
    // Names of the functions in Python, or Blockly translated in JavaScript
    turnLedOn: "turnLedOn",
    turnLedOff: "turnLedOff",
    setLedState: "setLedState",
    setLedMatrixOne: "setLedMatrixOne",

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
    turnLedOn: "turnLedOn() accendi il LED",
    turnLedOff: "turnLedOff() spegni il LED",
    isButtonPressed: "isButtonPressed() riporta True se il pulsante è premuto, False nel caso contrario",
    isButtonPressedWithName: "isButtonPressed(button) riporta True se il pulsante è premuto, False se non lo è",
    waitForButton: "waitForButton(button) sospende l'esecuzione fino a quando non viene premuto il pulsante",
    buttonWasPressed: "buttonWasPressed(button) indica se il tasto è stato premuto dall'ultima volta che questa funzione è stata utilizzata.",
    setLedState: "setLedState(led, state) modifica lo stato del LED : True per accenderlo, False per spegnerlo",
    toggleLedState: "toggleLedState(led) inverte lo stato del LED",
    displayText: "displayText(line1, line2) mostra una o due righe di testo. La line2 è opzionale",
    displayText2Lines: "displayText(line1, line2) mostra una o due righe di testo. La line2 è opzionale",
    readTemperature: "readTemperature(thermometer) riporta la temperatura ambiente",
    sleep: "sleep(milliseconds) mette in pausa l'esecuzione per una durata in ms",
    setServoAngle: "setServoAngle(servo, angle) cambia l'angolo del servomotore",
    readRotaryAngle: "readRotaryAngle(potentiometer) riporta la posizione del potenziometro",
    readDistance: "readDistance(distanceSensor) riporta la distanza misurata",
    readLightIntensity: "readLightIntensity(lightSensor) riporta l'intensità luminosa",
    readHumidity: "readHumidity(hygrometer) riporta l'umidità dell'ambiente",
    currentTime: "currentTime() tempo in millisecondi dall'avvio del programma",

    setLedBrightness: "setLedBrightness(led, brightness) regola l'intensità luminosa del LED",
    getLedBrightness: "getLedBrightness(led) riporta l'intensità luminosa del LED",
    getServoAngle: "getServoAngle(servo) riporta l'angolo del servomotore",

    isLedOn: "isLedOn() riporta True se il LED è acceso, False se è spento",
    isLedOnWithName: "isLedOn(led) riporta True se il LED è acceso, False se è spento",

    turnBuzzerOn: "turnBuzzerOn() accende il cicalino",
    turnBuzzerOff: "turnBuzzerOff() spegne il cicalino",

    isBuzzerOn: "isBuzzerOn() riporta True se il cicalino è acceso, False se è spento",
    isBuzzerOnWithName: "isBuzzerOn(buzzer) riporta True se il cicalino è acceso, False se è spento",

    setBuzzerState: "setBuzzerState(buzzer, state) modifica lo stato del cicalino: True per acceso, False nel caso contrario",
    setBuzzerNote: "setBuzzerNote(buzzer, frequency) fa suonare il cicalino alla frequenza indicata",
    getBuzzerNote: "getBuzzerNote(buzzer) riporta la frequenza attuale del cicalino",

    getTemperatureFromCloud: "getTemperatureFromCloud(town) get the temperature from the town given", // TODO: Translate

    drawPoint: "drawPoint(x, y) draw a point of 1 pixel at given coordinates", // TODO: Translate
    isPointSet: "isPointSet(x, y) return True if the point at coordinates x, y is on", // TODO: Translate
    drawLine: "drawLine(x0, y0, x1, y1) draw a line starting at x0, y0 to x1, y1", // TODO: Translate
    drawRectangle: "drawRectangle(x0, y0, width, height) disegna un rettangolo, con angolo in alto a sinistra (x0,y0)",
    drawCircle: "drawCircle(x0, y0, diameter) draw a circle of center x0, y0 and of given diameter", // TODO: Translate
    clearScreen: "clearScreen() cancella il contenuto della schermata",
    updateScreen: "updateScreen() update screen content", // TODO: Translate
    autoUpdate: "autoUpdate(auto) change the screen actualisation mode", // TODO: Translate

    fill: "fill(color) fill the shapes with the color given", // TODO: Translate
    noFill: "noFill() do not fill the shapes", // TODO: Translate
    stroke: "stroke(color) draw the borders of shapes with the color given", // TODO: Translate
    noStroke: "noStroke() do not draw the borders of shapes", // TODO: Translate


    readAcceleration: "readAcceleration(axis) read the acceleration (m/s²) in the axis (X, Y or Z)", // TODO: Translate
    computeRotation: "computeRotation(axis) compute the rotation angle (°) in the accelerometro", // TODO: Translate

    readSoundLevel: "readSoundLevel(port) return the ambien sound", // TODO: Translate


    readMagneticForce: "readMagneticForce(axis) return the magnetic force (µT) in the axis (X, Y ou Z)", // TODO : Translate
    computeCompassHeading: "computeCompassHeading() return the compass direction in degres", // TODO: Translate

    readInfraredState: "readInfraredState(IRReceiver) riporta True se viene rilevato un segnale infrarosso, False nel caso in contrario",
    setInfraredState: "setInfraredState(IREmitter, state) modifica lo stato del trasmettitore : True per accenderlo, False per spegnerlo",

    // Gyroscope
    readAngularVelocity: "readAngularVelocity(axis) return the angular speed (°/s) of the gyroscope", // TODO: Translate
    setGyroZeroAngle: "setGyroZeroAngle() initialize the gyroscope at the 0 state", // TODO: Translate
    computeRotationGyro: "computeRotationGyro(axis) compute the rotations of the gyroscope in degres", // TODO: Translate

    //Internet store
    connectToCloudStore: "connectToCloudStore(identifier, password) connect to cloud store with the given username and password", // TODO: Translate
    writeToCloudStore: "writeToCloudStore(identifier, key, value) write a value at a key to the cloud", // TODO: Translate
    readFromCloudStore: "readFromCloudStore(identifier, key) read the value at the given key from the cloud", // TODO: Translate

    // IR Remote
    readIRMessage: "readIRMessage(irrec, timeout) wait for an IR message during the given time and then return it", // TODO: Translate
    sendIRMessage: "sendIRMessage(irtrans, name) send an IR message previously configured with the given name", // TODO: Translate
    presetIRMessage: "presetIRMessage(name, data) configure an IR message with the given name and data", // TODO: Translate

    //Continous servo
    setContinousServoDirection: "setContinousServoDirection(servo, direction)",
  },
  constant: {},

  startingBlockName: "Programma", // Name for the starting block
  messages: {
    sensorNotFound: "Accesso a un sensore o attuatore inesistente : {0}.",
    manualTestSuccess: "Test automatico convalidato.",
    testSuccess: "Bravo ! Il risultato è corretto",
    wrongState: "Test fallito : <code>{0}</code> è rimasto nello stato {1} invece di {2} a t={3}ms.",
    wrongStateDrawing: "Test fallito : <code>{0}</code> differisce di {1} pixel rispetto alla visualizzazione prevista a t={2}ms.",
    wrongStateSensor: "Test fallito : il tuo programma non ha letto lo stato di <code>{0}</code> dopo t={1}ms.",
    programEnded: "programma terminato.",
    piPlocked: "L'unità è bloccata. Sbloccare o riavviare.",
    cantConnect: "Impossibile connettersi all'apparecchio.",
    wrongVersion: "Il tuo Raspberry Pi è una versione troppo vecchia, aggiornala.",
    cardDisconnected: "La scheda è stata disconnessa.",
    sensorInOnlineMode: "Non è possibile agire sui sensori in modalità connessa.",
    actuatorsWhenRunning: "Impossibile modificare gli azionatori durante l'esecuzione di un programma",
    cantConnectoToUSB: 'Tentativo di connessione via USB in corso, si prega di collegare il Raspberry alla porta USB. <i class="fas fa-circle-notch fa-spin"></i>',
    cantConnectoToBT: 'Tentativo di connessione via Bluetooth, si prega di collegare il dispositivo al Raspberry via Bluetooth <i class="fas fa-circle-notch fa-spin"></i>',
    canConnectoToUSB: "Connesso via USB.",
    canConnectoToBT: "Connesso via Bluetooth.",
    noPortsAvailable: "Non è disponibile alcuna porta compatibile con questo {0} (type {1})",
    sensor: "sensore",
    actuator: "azionatore",
    removeConfirmation: "Sei sicuro di voler rimuovere questo sensore o attuatore?",
    remove: "Rimuovi",
    keep: "Tieni",
    minutesago: "Last seen {0} minutes ago",
    hoursago: "Last seen more than one hour ago",
    drawing: "disegno",
    timeLabel: "Tempo",
    seconds: "secondi",

    changeBoard: "Cambia scheda",
    connect: "Connetti",
    install: "Installa",
    config: "Config",


    raspiConfig: "Configurazione del scheda",
    local: "Local",
    schoolKey: "Indica un ID scolastico",
    connectList: "Seleziona un apparecchio da connettere nel seguente elenco",
    enterIpAddress: "o inserisci il tuo indirizzo IP",
    getPiList: "Ottieni l'elenco",
    connectTroughtTunnel: "Collegamento attraverso il canale France-ioi",

    connectToLocalhost: "Collegamento dell'interfaccia al computer su cui funziona questo browser",
    connectToWindowLocation: "Connettiti al Rasberry Pi da cui è stata caricata questa pagina",

    connectToDevice: "Connetti l'apparecchio",
    disconnectFromDevice: "Disconnetti",


    irReceiverTitle: "Ricevi codici infrarossi",
    directIrControl: "Punta il telecomando verso la scheda QuickPi e premi uno dei tasti.s",
    getIrCode: "Ricevi un codice",
    closeDialog: "Chiudi",

    irRemoteControl: "Telecomando IR",

    noIrPresets: "Si prega di utilizzare la funzione di preparazione dei messaggi IR per aggiungere comandi di controllo remoto.",
    irEnableContinous: "Attiva la trasmissione IR continua",
    irDisableContinous: "Disattiva la trasmissione IR continua",

    connectToLocalHost: "Collegamento dell'interfaccia alla periferica su cui funziona questo browser",

    up: "up",
    down: "down",
    left: "left",
    right: "right",
    center: "center",

    on: "On",
    off: "Off",

    getTemperatureFromCloudWrongValue: "getTemperatureFromCloud: {0} is not a town supported by getTemperatureFromCloud", // TODO: translate
    wifiNotActive: "Il Wi-Fi non è attivato. Attiva il Wi-Fi per farlo.",
    wifiSsid: "SSID:",
    wifiPassword: "Password:",
    wifiEnable: "Activare",
    wifiDisable: "Disabilitare",
    wifiConnect: "Connetti",
    wifiDisconnect: "Disconnetti",
    wifiStatusDisabled: "Disabilitato",
    wifiStatusDisconnected: "Disconnesso",
    wifiStatusConnected: "Connesso",
    wifiStatus: "Stato:",
    networkRequestFailed: "La richiesta alla pagina {0} non è riuscita.",
    networkResponseInvalidJson: "Questa risposta non è in formato JSON.",

    grovehat: "Grove Base Hat for Raspberry Pi",
    quickpihat: "France IOI QuickPi Hat",
    pinohat: "Raspberry Pi without hat",
    led: "LED",
    ledrgb: "LED RGB",
    leddim: "LED dimmerabile",
    blueled: "LED blu",
    greenled: "LED verde",
    orangeled: "LED arancione",
    redled: "LED rosso",
    buzzer: "Buzzer",
    grovebuzzer: "Grove Buzzer",
    quickpibuzzer: "Quick Pi Passive Buzzer",
    servo: "Servomotore",
    screen: "Screen",
    grove16x2lcd: "Grove 16x2 LCD",
    oled128x32: "128x32 Oled Screen",
    irtrans: "IR Transmiter",
    button: "Button",
    wifi: "Wi-Fi",
    fivewaybutton: "5 way button",
    tempsensor: "Temperature sensor",
    groveanalogtempsensor: "Grove Analog tempeature sensor",
    quickpigyrotempsensor: "Quick Pi Accelerometer+Gyroscope temperature sensor",
    dht11tempsensor: "DHT11 Tempeature Sensor",
    potentiometer: "Potentiometer",
    lightsensor: "Light sensor",
    distancesensor: "Sensore di distanza",
    timeofflightranger: "Time of flight distance sensor",
    ultrasonicranger: "Sensore di distanza a ultrasuoni",
    humiditysensor: "Humidity sensor",
    soundsensor: "Sound sensor",
    accelerometerbmi160: "Accelerometer sensor (BMI160)",
    gyrobmi160: "Gyropscope sensor (BMI160)",
    maglsm303c: "Magnetometer sensor (LSM303C)",
    irreceiver: "IR Receiver",
    cloudstore: "Cloud Store",
    addcomponent: "Aggiungi un componente",
    selectcomponent: "Seleziona un componente da aggiungere alla tua scheda e collegalo a una porta.",
    add: "Aggiungi",
    builtin: "(builtin)",
    chooseBoard: "Scegli la tua scheda",
    nameandports: "Nomi e porte dei sensori e azionatori QuickPi",
    name: "Name",
    port: "Port",
    state: "State",

    cloudTypes: {
      object: "Dictionnaire", // TODO: translate (dictionary)
      array: "Tableau", // TODO: translate
      boolean: "Booléen", // TODO: translate
      number: "Nombre", // TODO: translate
      string: "Chaîne de caractère" // TODO: translate
    },
    cloudMissingKey: "Test échoué : Il vous manque la clé {0} dans le cloud.", // TODO: translate
    cloudMoreKey: "Test échoué : La clé {0} est en trop dans le cloud", // TODO: translate
    cloudUnexpectedKeyCorrection: "Test échoué : La clé {0} n'étais pas attendu dans le cloud", // TODO: translate
    cloudPrimitiveWrongKey: "Test échoué : À la clé {0} du cloud, la valeur {1} était attendue au lieu de {2}", // TODO: translate
    cloudArrayWrongKey: "Test échoué : Le tableau à la clé {0} du cloud diffère de celui attendu.", // TODO: translate
    cloudDictionaryWrongKey: "Test échoué : Le dictionnaire à la clé {0} diffère de celui attendu", // TODO: translate
    cloudWrongType: "Test échoué : Vous avez stocké une valeur de type \"{0}\" dans la clé {1} du cloud, mais le type \"{2}\" était attendu.", // TODO: translate

    cloudKeyNotExists: "La chiave non esiste : {0} ",
    cloudWrongValue: "Chiave {0} : il valore {2} non è quello previsto, {1}.",
    cloudUnexpectedKey: "La chiave {0} non è una chiave prevista",
    hello: "Buongiorno",

    experiment: "Testa",
    validate: "Convalida",
    validate1: "Convalida 1",
    validate2: "Convalida 2",
    validate3: "Convalida 3",

    sensorNameBuzzer: "buzzer",
    sensorNameLed: "led",
    sensorNameLedRgb: "ledRgb",
    sensorNameLedDim: "ledDim",
    sensorNameRedLed: "redled",
    sensorNameGreenLed: "greenled",
    sensorNameBlueLed: "blueled",
    sensorNameOrangeLed: "orangeled",
    sensorNameScreen: "screen",
    sensorNameIrTrans: "irtran",
    sensorNameIrRecv: "irrec",
    sensorNameMicrophone: "micro",
    sensorNameTemperature: "temp",
    sensorNameGyroscope: "gyroscope",
    sensorNameMagnetometer: "magneto",
    // sensorNameDistance: "distance",
    sensorNameDistance: "dist",
    sensorNameAccelerometer: "accel",
    sensorNameButton: "button",
    sensorNameLight: "light",
    sensorNameStick: "stick",
    sensorNameServo: "servo",
    sensorNameHumidity: "humidity",
    sensorNamePotentiometer: "pot",
    sensorNameCloudStore: "cloud",
    sensorNameWifi: "wifi",
  },
  concepts: {
    quickpi_start: 'Crea un programma',
    quickpi_validation: 'Convalida il tuo programma',
    quickpi_buzzer: 'Cicalino',
    quickpi_led: 'LED',
    quickpi_button: 'Pulsanti e joystick',
    quickpi_screen: 'Schermo',
    quickpi_draw: 'Disegna',
    quickpi_range: 'Sensore di distanza',
    quickpi_servo: 'Servomotore',
    quickpi_thermometer: 'Termometro',
    quickpi_microphone: 'Microfono',
    quickpi_light_sensor: 'Sensore di luminosità',
    quickpi_accelerometer: 'Accelerometro',
    quickpi_wait: 'Gestione del tempo',
    quickpi_magneto: 'Magnetometro', // TODO: verify
    quickpi_ir_receiver: 'Ricevitore a infrarossi', // TODO: verify
    quickpi_ir_emitter: 'Emettitore a infrarossi', // TODO: verify
    quickpi_potentiometer: "Potenziometro", // TODO: verify
    quickpi_gyroscope: "giroscopio", // TODO: verify
    quickpi_cloud: 'Memorizzazione nel cloud'
  }
}
