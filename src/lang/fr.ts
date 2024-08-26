export default {
  label: {
    // Labels for the blocks
    sleep: "attendre %1 millisecondes",
    currentTime: "temps écoulé en millisecondes",

    turnLedOn: "allumer la LED",
    turnLedOff: "éteindre la LED",

    setLedState: "passer la LED %1 à %2 ",
    toggleLedState: "inverser la LED %1",
    setLedMatrixOne: "passer la LED %1 en position %2, %3 à %4",

    isLedOn: "LED allumée",
    isLedOnWithName: "LED %1 allumée",

    setLedBrightness: "mettre la luminosité de %1 à %2",
    getLedBrightness: "lire la luminosité de %1",
    setLedColors: "mettre la couleur de %1 à r:%2 g:%3 b:%4",

    turnBuzzerOn: "allumer le buzzer",
    turnBuzzerOff: "éteindre le buzzer",
    setBuzzerState: "mettre le buzzer %1 à %2",
    isBuzzerOn: "buzzer allumé",
    isBuzzerOnWithName: "buzzer %1 allumé",

    setBuzzerNote: "jouer la fréquence %2Hz sur %1",
    getBuzzerNote: "fréquence du buzzer %1",

    isButtonPressed: "bouton enfoncé",
    isButtonPressedWithName: "bouton  %1 enfoncé",
    waitForButton: "attendre une pression sur le bouton",
    buttonWasPressed: "le bouton a été enfoncé",
    onButtonPressed: "quand le bouton",
    onButtonPressedEnd: "est enfoncé",
    onButtonPressedDo: "faire",

    displayText: "afficher %1",
    displayText2Lines: "afficher Ligne 1 : %1 Ligne 2 : %2",

    readTemperature: "température ambiante",
    getTemperatureFromCloud: "temperature de la ville %1",

    readRotaryAngle: "état du potentiomètre %1",
    readDistance: "distance mesurée par %1",
    readLightIntensity: "intensité lumineuse",
    readHumidity: "humidité ambiante",

    setServoAngle: "mettre le servo %1 à l'angle %2",
    getServoAngle: "angle du servo %1",

    setContinousServoDirection: "la direction du servo continu  %1 %2",

    drawPoint: "dessiner un pixel en x₀: %1 y₀: %2",
    isPointSet: "pixel affiché en x₀: %1 y₀: %2",
    drawLine: "ligne x₀: %1 y₀: %2 x₁: %3 y₁: %4",
    drawRectangle: "rectangle x₀: %1 y₀: %2 largeur₀: %3 hauteur₀: %4",
    drawCircle: "cercle x₀: %1 y₀: %2 diamètre₀: %3",
    clearScreen: "effacer tout l'écran",
    updateScreen: "mettre à jour l'écran",
    autoUpdate: "mode de mise à jour automatique de l'écran",

    fill: "mettre la couleur de remplissage à %1",
    noFill: "ne pas remplir les formes",
    stroke: "mettre la couleur de tracé à %1",
    noStroke: "ne pas dessiner les contours",

    readAcceleration: "accélération en (m/s²) dans l'axe %1",
    computeRotation: "calcul de l'angle de rotation (°) sur l'accéléromètre %1",
    readSoundLevel: "volume sonore",

    readMagneticForce: "champ magnétique (µT) sur %1",
    computeCompassHeading: "direction de la boussole en (°)",

    readInfraredState: "infrarouge détecté sur %1",
    setInfraredState: "mettre l'émetteur infrarouge %1 à %2",

    // Gyroscope
    readAngularVelocity: "vitesse angulaire (°/s) du gyroscope %1",
    setGyroZeroAngle: "initialiser le gyroscope à l'état zéro",
    computeRotationGyro: "calculer la rotation du gyroscope %1",

    //Internet store
    connectToCloudStore: "se connecter au cloud. Identifiant %1 Mot de passe %2",
    writeToCloudStore: "écrire dans le cloud : identifiant %1 clé %2 valeur %3",
    readFromCloudStore: "lire dans le cloud : identifiant %1 clé %2",

    // IR Remote
    readIRMessage: "attendre un message IR nom : %1 pendant : %2 ms",
    sendIRMessage: "envoi du message préparé IR nommé %2 sur %1",
    presetIRMessage: "préparer un message IR de nom %1 et contenu %2",
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
    onButtonPressed: "onButtonPressed",

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
    setLedColors: "setLedColors",
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
    turnLedOn: "turnLedOn() allume la LED",
    turnLedOff: "turnLedOff() éteint la LED",
    isButtonPressed: "isButtonPressed() retourne True si le bouton est enfoncé, False sinon",
    isButtonPressedWithName: "isButtonPressed(button) retourne True si le bouton est enfoncé, False sinon",
    waitForButton: "waitForButton(button) met en pause l'exécution jusqu'à ce que le bouton soit appuyé",
    buttonWasPressed: "buttonWasPressed(button) indique si le bouton a été appuyé depuis le dernier appel à cette fonction",
    onButtonPressed: "onButtonPressed(button, fonction) appelle la fonction indiquée lorsque le bouton est appuyé",
    setLedState: "setLedState(led, state) modifie l'état de la LED : True pour l'allumer, False pour l'éteindre",
    setLedMatrixOne: "setLedMatrixOne(x, y, state) modifie l'état d'une LED de la matrice",
    toggleLedState: "toggleLedState(led) inverse l'état de la LED",
    displayText: "displayText(line1, line2) affiche une ou deux lignes de texte. line2 est optionnel",
    displayText2Lines: "displayText(line1, line2) affiche une ou deux lignes de texte. line2 est optionnel",
    readTemperature: "readTemperature(thermometer) retourne la température ambiante",
    sleep: "sleep(milliseconds) met en pause l'exécution pendant une durée en ms",
    setServoAngle: "setServoAngle(servo, angle) change l'angle du servomoteur",
    readRotaryAngle: "readRotaryAngle(potentiometer) retourne la position potentiomètre",
    readDistance: "readDistance(distanceSensor) retourne la distance mesurée",
    readLightIntensity: "readLightIntensity(lightSensor) retourne l'intensité lumineuse",
    readHumidity: "readHumidity(hygrometer) retourne l'humidité ambiante",
    currentTime: "currentTime() temps en millisecondes depuis le début du programme",

    setLedBrightness: "setLedBrightness(led, brightness) règle l'intensité lumineuse de la LED",
    getLedBrightness: "getLedBrightness(led) retourne l'intensité lumineuse de la LED",
    setLedColors: "setLedColors(led, r, g, b) règle la couleur de la LED",
    getServoAngle: "getServoAngle(servo) retourne l'angle du servomoteur",

    isLedOn: "isLedOn() retourne True si la LED est allumée, False si elle est éteinte",
    isLedOnWithName: "isLedOn(led) retourne True si la LED est allumée, False sinon",

    turnBuzzerOn: "turnBuzzerOn() allume le buzzer",
    turnBuzzerOff: "turnBuzzerOff() éteint le buzzer",

    isBuzzerOn: "isBuzzerOn() retourne True si le buzzer est allumé, False sinon",
    isBuzzerOnWithName: "isBuzzerOn(buzzer) retourne True si le buzzer est allumé, False sinon",

    setBuzzerState: "setBuzzerState(buzzer, state) modifie l'état du buzzer: True pour allumé, False sinon",
    setBuzzerNote: "setBuzzerNote(buzzer, frequency) fait sonner le buzzer à la fréquence indiquée",
    getBuzzerNote: "getBuzzerNote(buzzer) retourne la fréquence actuelle du buzzer",

    getTemperatureFromCloud: "getTemperatureFromCloud(town) retourne la température dans la ville donnée",

    drawPoint: "drawPoint(x, y) dessine un point de un pixel aux coordonnées données",
    isPointSet: "isPointSet(x, y) retourne True si le point aux coordonées x, y est actif",
    drawLine: "drawLine(x0, y0, x1, y1) dessine un segment commençant en x0, y0 jusqu'à x1, y1",
    drawRectangle: "drawRectangle(x0, y0, width, height) dessine un rectangle, de coin haut gauche (x0,y0)",
    drawCircle: "drawCircle(x0, y0, diameter) dessine un cercle de centre x0, y0 et de diamètre donné",
    clearScreen: "clearScreen() efface le contenu de l'écran",
    updateScreen: "updateScreen() mettre à jour l'écran",
    autoUpdate: "autoUpdate(auto) change le mode d'actualisation de l'écran",

    fill: "fill(color) Remplir les formes avec la couleur donnée",
    noFill: "noFill() Ne pas remplir les formes",
    stroke: "stroke(color) dessiner les bords des figures avec la couleur donnée",
    noStroke: "noStroke() ne pas dessiner les bordures des figures",


    readAcceleration: "readAcceleration(axis) lit l'accélération en m/s² sur l'axe (X, Y ou Z)",
    computeRotation: "computeRotation(axis) calcule l'angle de rotation en degrés sur l'accéléromètre",

    readSoundLevel: "readSoundLevel(port) retourne le volume ambiant",


    readMagneticForce: "readMagneticForce(axis) retourne le champ magnétique (µT) sur l'axe (X, Y ou Z)",
    computeCompassHeading: "computeCompassHeading() retourne la direction de la boussole en degrés",

    readInfraredState: "readInfraredState(IRReceiver) retourne True si un signal infra-rouge est détecté, False sinon",
    setInfraredState: "setInfraredState(IREmitter, state) modifie l'état de l'émetteur : True pour l'allumer, False pour l'éteindre",

    // Gyroscope
    readAngularVelocity: "readAngularVelocity(axis) retourne la vitesse engulairee (°/s) du gyroscope",
    setGyroZeroAngle: "setGyroZeroAngle() initialize le gyroscope à l'état 0",
    computeRotationGyro: "computeRotationGyro(axis) calcule la rotation du gyroscope en degrés",

    //Internet store
    connectToCloudStore: "connectToCloudStore(identifier, password) se connecter au cloud avec le nom d'utilisateur et le mot de passe donnés",
    writeToCloudStore: "writeToCloudStore(identifier, key, value) écrire une valeur sur une clé dans le cloud",
    readFromCloudStore: "readFromCloudStore(identifier, key) retourne la valeur lue dans le cloud de la clé donnée",

    // IR Remote
    readIRMessage: "readIRMessage(irrec, timeout) attends un message infrarouge pendant le temps donné en millisecondes et le renvois",
    sendIRMessage: "sendIRMessage(irtrans, name) envoi un message infrarouge précédement configurer avec le nom donné",
    presetIRMessage: "presetIRMessage(name, data) configure un message infrarouge de nom name et de donné data",

    //Continous servo
    setContinousServoDirection: "setContinousServoDirection(servo, direction)",

    // Galaxia
    "accelerometer.get_x": "accelerometer.get_x() retourne la valeur de l'accélération sur l'axe X",

    "pin.__constructor": "pin = Pin(pinNumber, mode) description",
    "pin.on": "pin.on() description",
    "pin.off": "pin.off() description",

    "pwm.__constructor": "pwm = PWM(pin, freq, duty) description",
    "pwm.duty": "pwm.duty(duty) description",

    sleep_us: "sleep_us(microseconds) met en pause l'exécution pendant une durée en microsec",
  },
  constant: {},

  startingBlockName: "Programme", // Name for the starting block
  messages: {
    sensorNotFound: "Accès à un capteur ou actuateur inexistant : {0}.",
    manualTestSuccess: "Test automatique validé.",
    testSuccess: "Bravo ! La sortie est correcte",
    wrongState: "Test échoué : <code>{0}</code> a été dans l'état {1} au lieu de {2} à t={3}ms.",
    wrongStateDrawing: "Test échoué : <code>{0}</code> diffère de {1} pixels par rapport à l'affichage attendu à t={2}ms.",
    wrongStateSensor: "Test échoué : votre programme n'a pas lu l'état de <code>{0}</code> après t={1}ms.",
    programEnded: "Programme terminé.",
    piPlocked: "L'appareil est verrouillé. Déverrouillez ou redémarrez.",
    cantConnect: "Impossible de se connecter à l'appareil.",
    wrongVersion: "Votre Raspberry Pi a une version trop ancienne, mettez le à jour.",
    cardDisconnected: "La carte a été déconnectée.",
    sensorInOnlineMode: "Vous ne pouvez pas agir sur les capteurs en mode connecté.",
    actuatorsWhenRunning: "Impossible de modifier les actionneurs lors de l'exécution d'un programme",
    cantConnectoToUSB: 'Tentative de connexion par USB en cours, veuillez brancher votre Raspberry sur le port USB <i class="fas fa-circle-notch fa-spin"></i>',
    cantConnectoToBT: 'Tentative de connection par Bluetooth, veuillez connecter votre appareil au Raspberry par Bluetooth <i class="fas fa-circle-notch fa-spin"></i>',
    canConnectoToUSB: "Connecté en USB.",
    canConnectoToBT: "Connecté en Bluetooth.",
    noPortsAvailable: "Aucun port compatible avec ce {0} n'est disponible (type {1})",
    sensor: "capteur",
    actuator: "actionneur",
    removeConfirmation: "Êtes-vous certain de vouloir retirer ce capteur ou actuateur?",
    remove: "Retirer",
    keep: "Garder",
    minutesago: "Last seen {0} minutes ago",
    hoursago: "Last seen more than one hour ago",
    drawing: "dessin",
    timeLabel: "Temps",
    seconds: "secondes",

    changeBoard: "Changer de carte",
    connect: "Connecter",
    install: "Installer",
    config: "Config",
    remoteControl: "Contrôle à distance",
    simulator: "Simulateur",

    raspiConfig: "Configuration de la carte",
    local: "Local",
    schoolKey: "Indiquez un identifiant d'école",
    connectList: "Sélectionnez un appareil à connecter dans la liste suivante",
    enterIpAddress: "ou entrez son adesse IP",
    getPiList: "Obtenir la liste",
    connectTroughtTunnel: "Connecter à travers le France-ioi tunnel",

    connectToLocalhost: "Connecter l'interface à la machine sur laquelle tourne ce navigateur",
    connectToWindowLocation: "Connecter à la carte depuis lequel cette page est chargée",

    connectToDevice: "Connecter l'appareil",
    disconnectFromDevice: "Déconnecter",

    removeSensor: "Supprimer",

    irReceiverTitle: "Recevoir des codes infrarouges",
    directIrControl: "Dirigez votre télécommande vers votre carte QuickPi et appuyez sur un des boutons",
    getIrCode: "Recevoir un code",
    closeDialog: "Fermer",

    irRemoteControl: "Télécommande IR",

    noIrPresets: "Veuillez utiliser la fonction de préparation de messages IR pour ajouter des commandes de télécommande",
    irEnableContinous: "Activer l'émission IR en continu",
    irDisableContinous: "Désactiver l'émission IR en continu",

    connectToLocalHost: "Connecter l'interface à la machine sur laquelle tourne ce navigateur",

    up: "up",
    down: "down",
    left: "left",
    right: "right",
    center: "center",

    on: "On",
    off: "Off",

    grovehat: "Grove Base Hat for Raspberry Pi",
    quickpihat: "France IOI QuickPi Hat",
    pinohat: "Raspberry Pi without hat",
    led: "LED",
    ledrgb: "LED RGB",
    blueled: "LED bleue",
    greenled: "LED verte",
    orangeled: "LED orange",
    redled: "LED rouge",
    buzzer: "Buzzer",
    grovebuzzer: "Grove Buzzer",
    quickpibuzzer: "Quick Pi Passive Buzzer",
    servo: "Servo Motor",
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
    distancesensor: "Capteur de distance",
    timeofflightranger: "Time of flight distance sensor",
    ultrasonicranger: "Capteur de distance à ultrason",
    humiditysensor: "Humidity sensor",
    soundsensor: "Sound sensor",
    accelerometerbmi160: "Accelerometer sensor (BMI160)",
    gyrobmi160: "Gyropscope sensor (BMI160)",
    maglsm303c: "Magnetometer sensor (LSM303C)",
    irreceiver: "IR Receiver",
    cloudstore: "Cloud Store",
    addcomponent: "Ajouter un composant",
    selectcomponent: "Sélectionnez un composant à ajouter à votre carte et attachez-le à un port.",
    add: "Ajouter",
    builtin: "(builtin)",
    chooseBoard: "Choisissez votre carte",
    nameandports: "Noms et ports des capteurs et actionneurs QuickPi",
    name: "Name",
    port: "Port",
    state: "State",

    cloudTypes: {
      object: "Dictionnaire",
      array: "Tableau",
      boolean: "Booléen",
      number: "Nombre",
      string: "Chaîne de caractère"
    },
    cloudMissingKey: "Test échoué : Il vous manque la clé {0} dans le cloud.",
    cloudMoreKey: "Test échoué : La clé {0} est en trop dans le cloud",
    cloudUnexpectedKeyCorrection: "Test échoué : La clé {0} n'étais pas attendu dans le cloud",
    cloudPrimitiveWrongKey: "Test échoué : À la clé {0} du cloud, la valeur {1} était attendue au lieu de {2}",
    cloudArrayWrongKey: "Test échoué : Le tableau à la clé {0} du cloud diffère de celui attendu.",
    cloudDictionaryWrongKey: "Test échoué : Le dictionnaire à la clé {0} diffère de celui attendu",
    cloudWrongType: "Test échoué : Vous avez stocké une valeur de type \"{0}\" dans la clé {1} du cloud, mais le type \"{2}\" était attendu.",

    cloudKeyNotExists: "La clé n'existe pas : {0} ",
    cloudWrongValue: "Clé {0} : la valeur {2} n'est pas celle attendue, {1}.",
    cloudUnexpectedKey: "La clé {0} n'est pas une clé attendue",
    hello: "Bonjour",

    getTemperatureFromCloudWrongValue: "getTemperatureFromCloud: {0} n'est pas une ville supportée par getTemperatureFromCloud",
    wifiNotActive: "Le Wi-Fi n'est pas activé. Activez le Wi-Fi pour faire cette opération.",

    experiment: "Expérimenter",
    validate: "Valider",
    validate1: "Valider 1",
    validate2: "Valider 2",
    validate3: "Valider 3",
    cancel: "Annuler",

    areYouSure: "Vous êtes sûr ?",
    yes: "Oui",
    no: "Non",

    // sensorNameBuzzer: "buzzer",
    sensorNameBuzzer: "buzz",
    sensorNameLed: "led",
    sensorNameLedRgb: "ledRgb",
    // sensorNameRedLed: "redled",
    sensorNameRedLed: "Rled",
    // sensorNameGreenLed: "greenled",
    sensorNameGreenLed: "Gled",
    // sensorNameBlueLed: "blueled",
    sensorNameBlueLed: "Bled",
    // sensorNameOrangeLed: "orangeled",
    sensorNameOrangeLed: "Oled",
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
    // sensorNameButton: "button",
    sensorNameButton: "but",
    sensorNameLight: "light",
    sensorNameStick: "stick",
    sensorNameServo: "servo",
    sensorNameHumidity: "humidity",
    sensorNamePotentiometer: "pot",
    sensorNameCloudStore: "cloud",
    sensorNameWifi: "wifi",

    selectOption: "Sélectionnez une rubrique…",
    components: "Composants",
    connection: "Connexion",
    display: "Affichage",
    displayPrompt: "Afficher par nom de composant ou nom de port ?",
    componentNames: "Nom de composant",
    portNames: "Nom de port",
  },
  concepts: {
    quickpi_start: 'Créer un programme',
    quickpi_validation: 'Valider son programme',
    quickpi_buzzer: 'Buzzer',
    quickpi_led: 'LEDs',
    quickpi_button: 'Boutons et manette',
    quickpi_screen: 'Écran',
    quickpi_draw: 'Dessiner',
    quickpi_range: 'Capteur de distance',
    quickpi_servo: 'Servomoteur',
    quickpi_thermometer: 'Thermomètre',
    quickpi_microphone: 'Microphone',
    quickpi_light_sensor: 'Capteur de luminosité',
    quickpi_accelerometer: 'Accéléromètre',
    quickpi_wait: 'Gestion du temps',
    quickpi_magneto: 'Magnétomètre',
    quickpi_ir_receiver: 'Récepteur infrarouge',
    quickpi_ir_emitter: 'Émetteur infrarouge',
    quickpi_potentiometer: "Potentiomètre",
    quickpi_gyroscope: "Gyroscope",
    quickpi_cloud: 'Stockage dans le cloud'
  }
}
