import {ConnectionMethod} from "../definitions";
import {getImg} from "../util";

export function getConnectionDialogHTML(availableConnectionMethods: ConnectionMethod[], strings, boardDefinitions, sensorDefinitions): string {
  const allConnectionMethods: {name: ConnectionMethod, icon: string, label: string}[] = [
    {name: ConnectionMethod.Local, icon: 'fas fa-location-arrow', label: strings.messages.local},
    {name: ConnectionMethod.Wifi, icon: 'fa fa-wifi', label: 'WiFi'},
    {name: ConnectionMethod.Usb, icon: 'fab fa-usb', label: 'USB'},
    {name: ConnectionMethod.Bluetooth, icon: 'fab fa-bluetooth-b', label: 'Bluetooth'},
    {name: ConnectionMethod.WebSerial, icon: 'fa fa-network-wired', label: 'WebSerial'},
  ];

  return `
    <div id="quickpiViewer" class="content connectPi qpi" style="display: block;">
       <div class="content">
          <div class="panel-heading">
             <h2 class="sectionTitle">
                <span class="iconTag">
                  <i class="icon fas fa-list-ul">
                  </i>
                </span>
                ${strings.messages.raspiConfig}       
             </h2>
             <div class="exit" id="picancel">
                <i class="icon fas fa-times">
                </i>
             </div>
          </div>
          <div class="panel-body">
             <div class="navigation">
                <div class="navigationContent">
                   <input type="checkbox" id="showNavigationContent" role="button">
                   <ul>
                      <li id="qpi-portsnames">
                         ${strings.messages.display}
                      </li>
                      <li id="qpi-components">
                         ${strings.messages.components}
                      </li>
                      ${boardDefinitions.length > 1 ? `
                      <li id="qpi-change-board">${strings.messages.changeBoard}</li>
                      ` : ''}
                      <li id="qpi-connection" class="selected">
                         ${strings.messages.connection}
                      </li>
                   </ul>
                </div>
             </div>
             <div class="viewer">
                <div id="qpi-uiblock-portsnames" class="hiddenContent viewerInlineContent" >
                   ${strings.messages.displayPrompt}
                   <div class="switchRadio btn-group" id="pi-displayconf">
                      <button type="button" class="btn active" id="picomponentname">
                      <i class="fas fa-microchip icon">
                      </i>
                      ${strings.messages.componentNames}</button>
                      <button type="button" class="btn" id="piportname">
                      <i class="fas fa-plug icon">
                      </i>
                      ${strings.messages.portNames}</button>
                   </div>
                   <div id='example_sensor'>
                      <span id='name'>
                        ${sensorDefinitions[17].suggestedName}1</span>
                      <span id='port'>
                        ${sensorDefinitions[17].portType}5</span>
                      <img src=${getImg(sensorDefinitions[17].selectorImages[0])}>
                      </span>
                   </div>
                </div>
                <div id="qpi-uiblock-components" class="hiddenContent viewerInlineContent" >
                   <div id="tabs">
                      <div id="tabs_back"></div>
                      <div id='remove_tab' class='tab selected'>
                         ${strings.messages.removeSensor}
                      </div>
                      <div id='add_tab' class='tab'>
                         ${strings.messages.add}
                      </div>
                   </div>
                   <div id="remove_cont">
                      <div id="sensorGrid"></div>
                      <div class='buttonContainer' >
                         <button id="piremovesensor" class="btn">
                         <i class="fas fa-trash icon">
                         </i>
                         ${strings.messages.removeSensor}</button>
                      </div>
                   </div>
                   <div id="add_cont" class='hiddenContent' >
                      <div id="addSensorGrid"></div>
                      <div class='buttonContainer' >
                         <button id="piaddsensor" class="btn">
                         <i class="fas fa-plus icon">
                         </i>
                         ${strings.messages.add}</button>
                      </div>
                   </div>
                </div>
                <div id="qpi-uiblock-change-board" class="hiddenContent viewerInlineContent">
                   <div class="panel-body">
                      <div id=boardlist>
                      </div>
                   </div>
                </div>
                <div id="qpi-uiblock-connection" class="hiddenContent viewerInlineContent">
                   <div class="switchRadio btn-group" id="piconsel">
                      ${allConnectionMethods
                        .filter(connectionMethod => availableConnectionMethods.includes(connectionMethod.name))
                        .map(connectionMethod => `
                          <button type="button" class="btn" id="picon${connectionMethod.name}">
                             <i class="${connectionMethod.icon} icon"></i>
                              ${connectionMethod.label}
                          </button>`
                        )
                      }
                   </div>
                   <div id="pischoolcon">
                      <div class="form-group">
                         <label id="pischoolkeylabel">
                         ${strings.messages.schoolKey}</label>
                         <div class="input-group">
                            <div class="input-group-prepend">
                               Aa
                            </div>
                            <input type="text" id="schoolkey" class="form-control">
                         </div>
                      </div>
                      <div class="form-group">
                         <label id="pilistlabel">
                         ${strings.messages.connectList}</label>
                         <div class="input-group">
                            <button class="input-group-prepend" id=pigetlist disabled>
                            ${strings.messages.getPiList}</button>
                            <select id="pilist" class="custom-select" disabled>
                            </select>
                         </div>
                      </div>
                      <div class="form-group">
                         <label id="piiplabel">
                         ${strings.messages.enterIpAddress}</label>
                         <div class="input-group">
                            <div class="input-group-prepend">
                               123
                            </div>
                            <input id=piaddress type="text" class="form-control">
                         </div>
                      </div>
                      <div>
                         <input id="piusetunnel" disabled type="checkbox">
                         ${strings.messages.connectTroughtTunnel}               
                      </div>
                   </div>
                   <div id="panel-body-usbbt">
                      <label id="piconnectionlabel">
                      </label>
                   </div>
                   <div id="panel-body-local">
                      <label id="piconnectionlabellocal">
                      </label>
                      <div id="piconnectolocalhost">
                         <input type="radio" id="piconnectolocalhostcheckbox" name="pilocalconnectiontype" value="localhost">
                         ${strings.messages.connectToLocalhost}               
                      </div>
                      <div id="piconnectocurrenturl">
                         <input type="radio" id="piconnectocurrenturlcheckbox" name="pilocalconnectiontype" value="currenturl">
                         ${strings.messages.connectToWindowLocation}               
                      </div>
                   </div>
                   <div class="inlineButtons">
                      <button id="piconnectok" class="btn">
                        <i id="piconnectprogressicon" class="fas fa-spinner fa-spin icon"></i>
                        <i id="piconnectwifiicon" class="fa fa-link icon"></i>
                        ${strings.messages.connectToDevice}
                      </button>
                      <button id="pirelease" class="btn">
                        <i class="fa fa-times icon"></i>
                        ${strings.messages.disconnectFromDevice}
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
    `;
}
