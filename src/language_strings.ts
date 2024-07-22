export const quickPiLocalLanguageStrings = {
  fr: { // French strings
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
      isButtonPressedWithName : "isButtonPressed",
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
    },
    constant: {
    },

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

      selectOption: "Sélectionnez une rubrique…",
      components: "Composants",
      connection: "Connexion",
      display: "Affichage",
      displayPrompt: "Display component name or port name ?",
      componentNames: "COMPONENT NAME",
      portNames: "PORT NAMES",
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
  },
  es: {
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
      isButtonPressedWithName : "isButtonPressed",
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
    constant: {
    },

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
  },
  it: { // Italian strings // TODO
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
      isButtonPressedWithName : "isButtonPressed",
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
    constant: {
    },

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

      grovehat: "Grove Base Hat for Raspberry Pi",
      quickpihat: "France IOI QuickPi Hat",
      pinohat: "Raspberry Pi without hat",
      led: "LED",
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
  },

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
