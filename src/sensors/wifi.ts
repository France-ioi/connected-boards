import {AbstractSensor, SensorDrawParameters, SensorDrawTimeLineParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {deepSubsetEqual, getImg, textEllipsis} from "../util";
import {networkWlanModuleDefinition} from "../modules/network/wlan";
import {drawBubbleTimeline} from "./util/bubble_timeline";

interface SensorWifiState {
  active?: boolean,
  activating?: boolean,
  connecting?: boolean,
  connected?: boolean,
  ssid?: string,
  password?: string,
  ssidInput?: string,
  passwordInput?: string,
  scanning?: boolean,
  lastRequest?: {
    url: string,
    method: string,
    headers?: {[field: string]: string},
    body?: {[field: string]: string},
  }
}

export class SensorWifi extends AbstractSensor<SensorWifiState> {
  declare public state?: SensorWifiState;
  protected active: any;
  private lastWifiState: SensorWifiState;
  public type = 'wifi';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "wifi",
      suggestedName: strings.messages.sensorNameWifi,
      description: strings.messages.wifi,
      isAnalog: false,
      isSensor: true,
      portType: "D",

      selectorImages: ["wifi.png"],
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      pluggable: true,
      getPercentageFromState: function (state: SensorWifiState) {
        if (state.active) {
          if (state.connected) {
            return 1;
          }

          return 0.5;
        }

        return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      getStateString: function(state: SensorWifiState) {
        if (state.connected) {
          return strings.messages.wifiStatusConnected;
        }
        if (state.active) {
          return strings.messages.wifiStatusDisconnected;
        }

        return strings.messages.wifiStatusDisabled;
      },
      compareState: function (state1: SensorWifiState, state2: SensorWifiState) {
        if (state1 === null && state2 === null) {
          return true;
        }
        if ((null !== state1 && null === state2) || (null !== state2 && null === state1)) {
          return false;
        }

        return deepSubsetEqual(state1, state2);
      },
      getWrongStateString: function(failInfo: {actual: SensorWifiState, expected: SensorWifiState, name: string, time: number}) {
        const {actual, expected, name, time} = failInfo;

        const expectedStatus = this.getStateString(expected);
        const actualStatus = this.getStateString(actual);

        if ((undefined !== expected.active && actual.active !== expected.active) || ((undefined !== expected.connected && actual.connected !== expected.connected))) {
          return strings.messages.wrongState.format(name, actualStatus, expectedStatus, time);
        }

        if ((undefined !== expected.ssid && actual.ssid !== expected.ssid) || (undefined !== expected.password && actual.password !== expected.password)) {
          return strings.messages.wifiWrongCredentials.format(name, actual.ssid + ' / ' + actual.password, expected.ssid + ' / ' + expected.password, time);
        }

        if (undefined !== expected.lastRequest) {
          if (!actual.lastRequest) {
            return strings.messages.wifiNoRequest.format(name, time);
          }
          
          if (undefined !== expected.lastRequest.method && expected.lastRequest.method !== actual.lastRequest.method) {
            return strings.messages.wifiWrongMethod.format(name, actual.lastRequest.method, expected.lastRequest.method, time);
          }
          if (undefined !== expected.lastRequest.url && expected.lastRequest.url !== actual.lastRequest.url) {
            return strings.messages.wifiWrongUrl.format(name, actual.lastRequest.url, expected.lastRequest.url, time);
          }
          if (undefined !== expected.lastRequest.headers) {
            for (let field in expected.lastRequest.headers) {
              if (expected.lastRequest.headers[field] !== actual.lastRequest.headers?.[field]) {
                return strings.messages.wifiWrongHeader.format(name, field, actual.lastRequest.headers?.[field] ?? '', expected.lastRequest.headers[field], time);
              }
            }
          }
          if (undefined !== expected.lastRequest.body) {
            for (let field in expected.lastRequest.body) {
              if (expected.lastRequest.body[field] !== actual.lastRequest.body?.[field]) {
                return strings.messages.wifiWrongBody.format(name, field, actual.lastRequest.body?.[field] ?? '', expected.lastRequest.body[field], time);
              }
            }
          }
        }

        return strings.messages.wifiUnknownError.format(name, time);
      }
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand(`wifiGetStatus("${this.name}")`, (val) => {
      const [active, status, ssid] = JSON.parse(val);

      callback({
        ...this.state,
        active,
        connected: 1010 === status,
        connecting: 1001 === status,
        ssid,
      });
    });
  }

  setLiveState(state: SensorWifiState, callback) {
    var command = `setWifiState("${this.name}", [0, 0, 0])`;

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, fadeopacity, state1x, state1y}: SensorDrawParameters) {
    if (this.stateText) {
      this.stateText.remove();
    }

    if (!this.state) {
      this.state = {
        active: false,
        connected: false,
        ssid: '',
        password: '',
        ssidInput: '',
        passwordInput: '',
      };
    }

    const redrawModalState = () => {
      $('#wifi_ssid').val(this.state.ssidInput);
      $('#wifi_password').val(this.state.passwordInput);

      if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
        $('#wifi_ssid').prop('disabled', false);
        $('#wifi_password').prop('disabled', false);
      } else {
        $('#wifi_ssid').prop('disabled', true);
        $('#wifi_password').prop('disabled', true);
      }

      if (this.state.active) {
        if (this.state.connected) {
          $('#wifi_enable').hide();
          $('#wifi_disable').show();
          $('#wifi_connect').hide();
          $('#wifi_disconnect').show();
        } else {
          $('#wifi_enable').hide();
          $('#wifi_disable').show();
          $('#wifi_connect').show();
          $('#wifi_disconnect').hide();
        }
      } else {
        $('#wifi_enable').show();
        $('#wifi_disable').hide();
        $('#wifi_connect').hide();
        $('#wifi_disconnect').hide();
      }

      if (this.state.activating) {
        $('#wifi_activating').show();
        $('#wifi_enable_icon').hide();
      } else {
        $('#wifi_activating').hide();
        $('#wifi_enable_icon').show();
      }

      if (this.state.connecting) {
        $('#wifi_connecting').show();
        $('#wifi_connect_icon').hide();
      } else {
        $('#wifi_connecting').hide();
        $('#wifi_connect_icon').show();
      }

      const realStatus = !this.state.active ? 'disabled' : (this.state.connected ? 'connected' : 'disconnected');
      $('#wifi_status').val(realStatus);
    };

    redrawModalState();

    if (!this.img || sensorHandler.isElementRemoved(this.img)) {
      this.img = this.context.paper.image(getImg('wifi.png'), imgx, imgy, imgw, imgh);

      this.focusrect.click(() => {
        let wifiDialog = `
        <div class="content qpi" id="wifi_dialog">
          <div class="panel-heading" id="bim">
            <h2 class="sectionTitle">
              <span class="iconTag"><i class="icon fas fa-list-ul"></i></span>
              ${this.strings.messages.wifi}
            </h2>
            <div class="exit" id="picancel">
              <i class="icon fas fa-times"></i>
            </div>
          </div>
          <div class="panel-body">
            <div class="wifi-actuator">
              <div class="form-group">
                 <label id="ssidlabel">${this.strings.messages.wifiSsid}</label>
                 <div class="input-group">
                    <div class="input-group-prepend">
                       Aa
                    </div>
                    <input type="text" id="wifi_ssid" class="form-control">
                 </div>
              </div>
               <div class="form-group">
                 <label id="passwordlabel">${this.strings.messages.wifiPassword}</label>
                 <div class="input-group">
                    <div class="input-group-prepend">
                       Aa
                    </div>
                    <input type="text" id="wifi_password" class="form-control">
                 </div>
              </div>
               <div class="wifi-button-group">
                  <button id="wifi_disable" class="btn">
                    <i id="piconnectwifiicon" class="fa fa-power-off icon"></i>
                    ${this.strings.messages.wifiDisable}
                  </button>
                  <button id="wifi_enable" class="btn">
                    <i id="wifi_activating" class="fas fa-spinner fa-spin icon"> </i>
                    <i id="wifi_enable_icon" class="fa fa-signal icon"></i>
                    ${this.strings.messages.wifiEnable}
                  </button>
                  <button id="wifi_connect" class="btn">
                    <i id="wifi_connecting" class="fas fa-spinner fa-spin icon"> </i>
                    <i id="wifi_connect_icon" class="fa fa-wifi icon"></i>
                    ${this.strings.messages.wifiConnect}
                  </button>
                   <button id="wifi_disconnect" class="btn">
                    <i id="wifi_disable_icon" class="fa fa-wifi icon"></i>
                    ${this.strings.messages.wifiDisconnect}
                  </button>
               </div>
            </div>    
            <div class="wifi-sensor">
             <div class="form-group">
                 <label id="pilistlabel">${this.strings.messages.wifiStatus}</label>
                 <div class="input-group">
                    <select id="wifi_status" class="custom-select">
                      <option value="disabled">${this.strings.messages.wifiStatusDisabled}</option>
                      <option value="disconnected">${this.strings.messages.wifiStatusDisconnected}</option>
                      <option value="connected">${this.strings.messages.wifiStatusConnected}</option>
                    </select>
                 </div>
              </div>
            </div>
          </div>
        </div>
      `;

        const sendCommandAndFetchState = (command: string) => {
          this.context.quickPiConnection.sendCommand(command, () => {
            this.getLiveState((returnVal) => {
              this.state = returnVal;
              redrawModalState();
              sensorHandler.drawSensor(this);
            });
          });
        }

        window.displayHelper.showPopupDialog(wifiDialog, () => {
          redrawModalState();

          $('#picancel').click(() => {
            $('#popupMessage').hide();
            window.displayHelper.popupMessageShown = false;
          });

          $('#wifi_enable').click(() => {
            if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
              if (!this.context.display || this.context.autoGrading || this.context.offLineMode) {
                this.state.activating = true;
                redrawModalState();

                setTimeout(() => {
                  this.state.activating = false;
                  this.state.active = true;
                  sensorHandler.warnClientSensorStateChanged(this);
                  sensorHandler.getSensorDrawer().drawSensor(this);
                  redrawModalState();
                }, 500);
              } else {
                const command = `wifiSetActive("${this.name}", 1)`;
                this.context.quickPiConnection.sendCommand(command, sendCommandAndFetchState);
                }
            } else {
              sensorHandler.getSensorDrawer().actuatorsInRunningModeError();
            }
          });

          $('#wifi_disable').click(() => {
            if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
              if (!this.context.display || this.context.autoGrading || this.context.offLineMode) {
                this.state.active = false;
                this.state.connected = false;
                sensorHandler.warnClientSensorStateChanged(this);
                sensorHandler.getSensorDrawer().drawSensor(this);
                redrawModalState();
              } else {
                const command = `wifiSetActive("${this.name}", 0)`;
                sendCommandAndFetchState(command);
              }
            } else {
              sensorHandler.getSensorDrawer().actuatorsInRunningModeError();
            }
          });

          $('#wifi_connect').click(() => {
            if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
              if (!this.context.display || this.context.autoGrading || this.context.offLineMode) {
                if (this.state.connecting) {
                  this.state.connected = false;
                  this.state.connecting = false;
                  sensorHandler.warnClientSensorStateChanged(this);
                  sensorHandler.getSensorDrawer().drawSensor(this);
                  redrawModalState();
                } else {
                  this.state.connecting = true;
                  redrawModalState();

                  setTimeout(() => {
                    this.state.connecting = false;
                    this.state.connected = true;
                    sensorHandler.warnClientSensorStateChanged(this);
                    sensorHandler.getSensorDrawer().drawSensor(this);
                    redrawModalState();
                  }, 500);
                }
              } else {
                if (this.state.connecting) {
                  this.state.connecting = false;

                  const command = "wifiDisconnect(\"" + this.name + "\")";
                  sendCommandAndFetchState(command);

                  redrawModalState();
                } else {
                  const ssid = $('#wifi_ssid').val() as string;
                  const password = $('#wifi_password').val() as string;

                  this.state.connecting = true;

                  const command = "wifiConnect(\"" + this.name + "\", \"" + ssid + "\", \"" + password + "\")";
                  sendCommandAndFetchState(command);

                  redrawModalState();
                }
              }
            } else {
              sensorHandler.getSensorDrawer().actuatorsInRunningModeError();
            }
          });

          $('#wifi_disconnect').click(() => {
            if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
              if (!this.context.display || this.context.autoGrading || this.context.offLineMode) {
                this.state.connected = false;
                sensorHandler.warnClientSensorStateChanged(this);
                sensorHandler.getSensorDrawer().drawSensor(this);
                redrawModalState();
              } else {
                const command = "wifiDisconnect(\"" + this.name + "\")";
                sendCommandAndFetchState(command);
              }
            } else {
              sensorHandler.getSensorDrawer().actuatorsInRunningModeError();
            }
          });

          $('#wifi_ssid').on('input', () => {
            this.state.ssidInput = $('#wifi_ssid').val() as string;
            sensorHandler.warnClientSensorStateChanged(this);
            sensorHandler.getSensorDrawer().drawSensor(this);
          });

          $('#wifi_password').on('input', () => {
            this.state.passwordInput = $('#wifi_password').val() as string;
            sensorHandler.warnClientSensorStateChanged(this);
            sensorHandler.getSensorDrawer().drawSensor(this);
          });

          $('#wifi_status').on('change', () => {
            const newStatus = $('#wifi_status').val();

            if (!this.context.autoGrading && this.context.offLineMode) {
              if ('disabled' === newStatus) {
                this.state.active = false;
                this.state.connected = false;
              } else if ('disconnected' === newStatus) {
                this.state.active = true;
                this.state.connected = false;
              } else if ('connected' === newStatus) {
                this.state.active = true;
                this.state.connected = true;
              }

              sensorHandler.warnClientSensorStateChanged(this);
              sensorHandler.getSensorDrawer().drawSensor(this);
              redrawModalState();
            } else {
              sensorHandler.getSensorDrawer().sensorInConnectedModeError();
            }
          });
        });
      });
    }

    if (!this.active || sensorHandler.isElementRemoved(this.active))
      this.active = this.context.paper.circle();

    const ssid = this.state?.ssid;
    this.stateText = this.context.paper.text(state1x, state1y, this.state?.scanning ? '...' : (ssid && this.state?.connected ? textEllipsis(ssid, 6) : ''));

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    let color = 'grey';
    if (this.state?.connected) {
      color = 'green';
    } else if (this.state?.active) {
      color = 'red';
    }

    this.active.attr({
      "cx": imgx + imgw*0.15,
      "cy": imgy + imgh*0.1,
      "r": imgh*0.15,
      fill: `${color}`,
      stroke: 'none',
      opacity: 1,
    });
  }

  drawTimelineState(sensorHandler: SensorHandler, state: SensorWifiState, expectedState: SensorWifiState, type: string, drawParameters: SensorDrawTimeLineParameters) {
    const sensorDef = sensorHandler.findSensorDefinition(this);

    const drawBubble = () => {
      let textToDisplay = [];

      const renderNewLine = (title: string, value: string, expectedValue: string) => {
        if (null !== expectedValue && undefined !== expectedValue && value !== expectedValue) {
          textToDisplay.push(`${title ? `${title} "${value}"` : value} (${this.strings.messages.insteadOf} "${expectedValue}")`);
        } else {
          textToDisplay.push(`${title ?`${title} "${value}"` : value}`);
        }
      };

      let expectedStatus = expectedState ? sensorDef.getStateString(expectedState) : null;
      let currentStatus = sensorDef.getStateString(state);

      let displayFieldsFrom = 'wrong' === type && expectedState ? expectedState : state;

      if ('connected' in displayFieldsFrom || 'active' in displayFieldsFrom) {
        renderNewLine(this.strings.messages.wifiStatus, currentStatus, expectedStatus);
      }
      if (displayFieldsFrom.ssid) {
        renderNewLine(this.strings.messages.wifiSsid, state.ssid, expectedState?.ssid);
      }
      if (displayFieldsFrom.password) {
        renderNewLine(this.strings.messages.wifiPassword, state.password, expectedState?.password);
      }
      if (displayFieldsFrom.lastRequest) {
        renderNewLine(null, state?.lastRequest ? `${state.lastRequest.method} ${state.lastRequest.url}` : this.strings.messages.wifiNoRequestShort, expectedState?.lastRequest ? `${expectedState?.lastRequest?.method} ${expectedState?.lastRequest?.url}` : null);
        if (state?.lastRequest && displayFieldsFrom.lastRequest.headers) {
          renderNewLine(this.strings.messages.wifiHeaders, `${serializeFields(state.lastRequest.headers) ?? ''}`, expectedState?.lastRequest?.headers ? `${serializeFields(expectedState?.lastRequest?.headers)}` : null);
        }
        if (state?.lastRequest && displayFieldsFrom.lastRequest.body) {
          renderNewLine(this.strings.messages.wifiBody, `${serializeFields(state.lastRequest.body) ?? ''}`, expectedState?.lastRequest?.body ? `${serializeFields(expectedState?.lastRequest?.body ?? {})}` : null);
        }
      }

      const div = document.createElement("div");
      $(div).html(textToDisplay.join('<br/>'));

      return div;
    }

    drawBubbleTimeline<SensorWifiState>(this, sensorHandler, state, expectedState, type, drawParameters, drawBubble);
  }
}

function serializeFields(fields: {[field: string]: string}) {
  if (!fields || 0 === Object.keys(fields).length) {
    return null;
  }

  return Object.entries(fields).map(([key, value]) => `${key} = ${value}`).join(', ');
}

