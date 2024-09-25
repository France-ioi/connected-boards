export const microbitPythonLib = `

try:
    sensorTable
except:
    sensorTable = []

from microbit import *
from micropython import *
from machine import *
from time import *

servo_angle = {}
distance_last_value = {}

def normalizePin(pin):
    returnpin = 0
    hadporttype = False

    pin = str(pin)

    if pin.isdigit():
        returnpin = pin
    elif len(pin) >= 2 and pin[0].isalpha() and pin[1:].isdigit():
        returnpin = pin[1:]
    elif pin.upper().startswith("I2C"):
        returnpin = pin[3:]
    else:
        returnpin = normalizePin(nameToPin(pin))

    return int(returnpin)

def nameToPin(name):
    for sensor in sensorTable:
        if sensor["name"] == name:
            return sensor["port"]

    return 0

def nameToDef(name, type):
    for sensor in sensorTable:
        if sensor["name"] == name:
            return sensor

    for sensor in sensorTable:
        if sensor["type"] == type:
            return sensor

    return None

def readAcceleration(axis):
    if axis == "x":
        val = accelerometer.get_x()
    elif axis == "y":
        val = accelerometer.get_y()
    elif axis == "z":
        val = accelerometer.get_z()
    else:
        throw("Unknown axis")
    return round(val/100, 1)

def readAccelBMI160():
    return [readAcceleration("x"), readAcceleration("y"), readAcceleration("z")]

def setLedState(pin, state):
    pin = normalizePin(pin)

    led = Pin(pin, Pin.OUT)
    if state:
        led.on()
    else:
        led.off()

def readLightIntensity(pin):
    return display.read_light_level()

def readTemperature(pin):
    return temperature()

def turnLedOn():
    setLedState("led", 1)

def turnLedOff():
    setLedState("led", 0)

def setLedRgbState(pin, rgb):
    led.set_colors(rgb[0], rgb[1], rgb[2])
 
def isButtonPressed(name):
    if name == "button_a":
        return button_a.is_pressed()
    elif name == "button_b":
        return button_b.is_pressed()
    elif name == "pin_logo":
        return pin_logo.is_touched()
    else:
        throw("Unknown button")
    
def turnPortOn(pin):
    pin = normalizePin(pin)

    if pin != 0:
        pinElement = Pin(pin, Pin.OUT)
        pinElement.on()

def turnPortOff(pin):
    pin = normalizePin(pin)

    if pin != 0:
        pinElement = Pin(pin, Pin.OUT)
        pinElement.off()
`;