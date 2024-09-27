export const galaxiaPythonLib = `

try:
    sensorTable
except:
    sensorTable = []

from thingz import *
from machine import *
from time import *
from network import *
from requests import *
from json import *

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
    return led.read_light_level()

def readTemperature(pin):
    return temperature()

def turnLedOn():
    setLedState("led", 1)

def turnLedOff():
    setLedState("led", 0)

def setLedRgbState(pin, rgb):
    led.set_colors(rgb[0], rgb[1], rgb[2])

def setLedDimState(pin, state):
    pwmDuty(pin, int(state*1023))
 
def isButtonPressed(name):
    if name == "button_a":
        return button_a.is_pressed()
    elif name == "button_b":
        return button_b.is_pressed()
    elif name == "touch_n":
        return touch_n.is_touched()
    elif name == "touch_s":
        return touch_s.is_touched()
    elif name == "touch_e":
        return touch_e.is_touched()
    elif name == "touch_w":
        return touch_w.is_touched()
    else:
        throw("Unknown button")
        
def setServoAngle(pin, angle):
    pin = normalizePin(pin)

    if pin != 0:
        print(pin)
        servo_angle[pin] = 0

        angle = int(angle)

        if angle < 0:
            angle = 0
        elif angle > 180:
            angle = 180
            
        pin = PWM(Pin(pin), freq=50, duty=0)
        pin.duty(int(0.025*1023 + (angle*0.1*1023)/180))
        
def getServoAngle(pin):
    pin = normalizePin(pin)
    angle = 0

    try:
        angle = servo_angle[pin]
    except:
        pass

    return angle

def pwmDuty(pin, duty):
    pin = normalizePin(pin)
    if pin != 0:
        print(pin)
        print(duty)
        pinElement = PWM(Pin(pin), freq=50, duty=0)
        pinElement.duty(duty)

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
        
def getTimePulseUs(pin, pulseLevel, timeoutUs):
    pin = normalizePin(pin)
    if pin != 0:
        echo = Pin(pin, Pin.IN)
        
        return time_pulse_us(echo, pulseLevel, timeoutUs)
        
def readDistance(pin):
  pin = normalizePin(pin)
  if pin != 0:
      trig = Pin(pin, Pin.OUT)
      trig.off()
      sleep_us(2)
      trig.on()
      sleep_us(10)
      trig.off()
      echo = Pin(pin, Pin.IN)
      timeout_us = 30000
      duration = time_pulse_us(echo, 1, timeout_us)/1e6 # t_echo in seconds
      
      last_value = 0
      try:
          last_value = distance_last_value[pin]
      except:
          pass
        
      if duration > 0:
          distance = round(343 * duration/2 * 100, 1)
          distance_last_value[pin] = distance
          
          return distance
      else:
          return last_value
          
def wifiSetActive(sensor, active):
    wlan = WLAN(STA_IF)
    wlan.active(True if 1 == active else False)
          
def wifiConnect(sensor, ssid, password):
    wlan = WLAN(STA_IF)
    wlan.disconnect()
    wlan.connect(ssid, password)

def wifiDisconnect(sensor):
    wlan = WLAN(STA_IF)
    wlan.disconnect()
 
def wifiIsConnected(sensor):
    wlan = WLAN(STA_IF)
    
    return wlan.isconnected()
    
def wifiGetActive(sensor):
    wlan = WLAN(STA_IF)
    
    return wlan.active()

def wifiGetStatus(sensor):
    wlan = WLAN(STA_IF)
    
    return [wlan.active(), wlan.status(), wlan.config('essid')]

def wifiIfConfig(sensor):
    wlan = WLAN(STA_IF)
    
    return wlan.ifconfig()
    
def wifiScan(sensor):
    wlan = WLAN(STA_IF)
    
    return wlan.scan()

def requestsGet(sensor, url, headers):
    response = get(url, headers=loads(headers))
    
    return [response.status_code, response.text]

def requestsPost(sensor, url, data, headers):
    response = post(url, data=loads(data), headers=loads(headers))
    
    return [response.status_code, response.text]

`;