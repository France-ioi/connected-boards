import {ConnectionMethod} from "../definitions";
import {getImg} from "../util";
import {getSessionStorage, setSessionStorage} from "../helpers/session_storage";
import {showasConnecting} from "../display";
import {getConnectionDialogHTML} from "./connection_dialog";

export function showConfig({context, strings, mainBoard}) {
  const availableConnectionMethods: ConnectionMethod[] = mainBoard.getAvailableConnectionMethods();

  if (!(context.localhostAvailable || context.windowLocationAvailable) && -1 !== availableConnectionMethods.indexOf(ConnectionMethod.Local)) {
    availableConnectionMethods.splice(availableConnectionMethods.indexOf(ConnectionMethod.Local), 1);
  }

  const boardDefinitions = mainBoard.getBoardDefinitions();
  const sensorHandler = context.sensorHandler;
  const sensorDefinitions = sensorHandler.getSensorDefinitions();

  const connectionDialogHTML = getConnectionDialogHTML(availableConnectionMethods, strings, boardDefinitions, sensorDefinitions);

  window.displayHelper.showPopupDialog(connectionDialogHTML, function () {
    $(".simple-dialog").addClass("config");
    $('#popupMessage .navigationContent ul li').removeClass('selected');
    $('#popupMessage .navigationContent ul li[id=qpi-connection]').addClass('selected');
    $('#showNavigationContent').prop('checked', false);

    $('[id^=qpi-uiblock]').addClass("hiddenContent");
    $('#qpi-uiblock-connection').removeClass("hiddenContent");

    $("#piconnectprogressicon").hide();

    for (var i = 0; i < boardDefinitions.length; i++) {
      let board = boardDefinitions[i];
      var image = document.createElement('img');
      image.src = getImg(board.image);

      $('#boardlist').append(image).append("&nbsp;&nbsp;");

      image.onclick = function () {
        $('#popupMessage').hide();
        window.displayHelper.popupMessageShown = false;

        context.changeBoard(board.name);
      }
    }

    for (let i = 0; i < context.infos.quickPiSensors.length; i++) {
      let sensor = context.infos.quickPiSensors[i];
      let sensorDefinition = sensorHandler.findSensorDefinition(sensor);
      if (sensor.type == "adder")
        continue

      addGridElement("sensorGrid", 0, sensor.name, sensor.name, sensorDefinition.selectorImages[0], sensor.port);
    }

    updateAddGrid();

    var usedPorts = [];
    var toRemove = [];
    var toAdd = [];

    function updateAddGrid() {
      // console.log("updateAddGrid")
      $("#addSensorGrid").empty();
      for (var iSensorDef = 0; iSensorDef < sensorDefinitions.length; iSensorDef++) {
        let sensorDefinition = sensorDefinitions[iSensorDef];
        let id = sensorDefinition.name;
        // console.log("new",id)
        let name = sensorDefinition.description;
        if (sensorDefinition.subTypes) {
          for (var iSubType = 0; iSubType < sensorDefinition.subTypes.length; iSubType++) {
            var sub = sensorDefinition.subTypes[iSubType];
            // @ts-ignore
            if (!sensorDefinition.pluggable && !sub.pluggable)
              continue;
            id = sensorDefinition.name + "_" + sub.subType;
            let name = sub.description;
            // @ts-ignore
            let img = (sub.selectorImages) ? sub.selectorImages[0] : sensorDefinition.selectorImages[0]
            // console.log(1,id)
            addGridElement("addSensorGrid", 1, id, name, img, "");
            // console.log("+",id)
          }
        } else {
          if (!sensorDefinition.pluggable || !sensorDefinition.selectorImages)
            continue;

          // console.log("+",id)
          addGridElement("addSensorGrid", 1, id, name, sensorDefinition.selectorImages[0], "");
        }
      }

      var board = mainBoard.getCurrentBoard(context.board);
      if (board.builtinSensors) {
        for (var i = 0; i < board.builtinSensors.length; i++) {
          var sensor = board.builtinSensors[i];
          var sensorDefinition = sensorHandler.findSensorDefinition(sensor);

          if (context.findSensor(sensor.type, sensor.port, false))
            continue;

          var id = sensorDefinition.name + "_";
          if (sensor.subType)
            id += sensor.subType;
          id += "_" + sensor.port;

          var name = sensorDefinition.description + " " + strings.messages.builtin;
          var img = sensorDefinition.selectorImages[0];
          addGridElement("addSensorGrid", 1, id, name, img, "");
          // console.log(3,id)
        }
      }

      $("#addSensorGrid .sensorElement").click(function () {
        var id = $(this).attr('id');
        var sensorID = id.replace("qpi-add-sensor-parent-", "");
        if ($(this).hasClass("selected")) {
          changePort(sensorID, false);
        } else {
          showPortDialog(sensorID);
        }
        changeSelect(id);
      });
    };

    function addGridElement(gridID, add, idName, name, img, port) {
      // console.log(add,idName,name,img)
      var idType = (add) ? "add" : "remove";
      $('#' + gridID).append(
        "<span class=\"sensorElement\" id=\"qpi-" + idType + "-sensor-parent-" + idName + "\">" +
        "<div class='name'>" + name + "</div>" +
        getSensorImg(img) +
        "<div class=\"sensorInfo\">" +
        "<span class='port'>" + port + "</span>" +
        "<input type=\"checkbox\" id=\"qpi-" + idType + "-sensor-" + idName + "\"></input>" +
        "</div>" +
        "</span>"
      );
    };

    function getSensorImg(img) {
      var html = "";
      html += "<img class=\"sensorImage\" src=" + getImg(img) + ">";
      switch (img) {
        case "servo.png":
          html += "<img class=\"sensorImage\" src=" + getImg("servo-pale.png") + ">";
          html += "<img class=\"sensorImage\" src=" + getImg("servo-center.png") + ">";
          break;
        case "potentiometer.png":
          html += "<img class=\"sensorImage\" src=" + getImg("potentiometer-pale.png") + ">";
          break;
        case "mag.png":
          html += "<img class=\"sensorImage\" src=" + getImg("mag-needle.png") + ">";
          break;
      }
      return html
    };


    $("#tabs .tab").click(function () {
      var id = $(this).attr("id");
      clickTab(id);
    });

    function clickTab(id) {
      // console.log("click tab"+id)
      var el = $("#" + id);
      if (el.hasClass("selected")) {
        return
      }
      if (id == "remove_tab" && toAdd.length > 0 ||
        id == "add_tab" && toRemove.length > 0) {
        showConfirmDialog(function () {
          unselectSensors();
          clickTab(id)
        });
        return
      }
      el.addClass("selected");
      if (id == "remove_tab") {
        $("#add_tab").removeClass("selected");
        $("#remove_cont").removeClass("hiddenContent");
        $("#add_cont").addClass("hiddenContent");
        unselectSensors("add");
      } else {
        $("#remove_tab").removeClass("selected");
        $("#add_cont").removeClass("hiddenContent");
        $("#remove_cont").addClass("hiddenContent");
        unselectSensors("remove");
      }
    };
    $("#sensorGrid .sensorElement").click(function () {
      var id = $(this).attr('id');
      changeSelect(id);
    });

    function changeSelect(id) {
      var add = id.includes("qpi-add");
      var arr = (add) ? toAdd : toRemove;
      var ele = $("#" + id);
      var inp = ele.children(".sensorInfo").children("input");
      if (ele.hasClass("selected")) {
        ele.removeClass("selected");
        inp.prop("checked", false);
        if (arr.includes(id)) {
          var index = arr.indexOf(id);
          arr.splice(index, 1);
        }
      } else {
        ele.addClass("selected");
        inp.prop("checked", true);
        if (!arr.includes(id)) {
          arr.push(id);
        }
      }
      // console.log(arr)
    };

    function unselectSensors(type = null) {
      if (!type) {
        unselectSensors("add");
        unselectSensors("remove");
        return
      }
      var arr = (type == "add") ? toAdd : toRemove;
      var clone = JSON.parse(JSON.stringify(arr));
      for (var id of clone) {
        changeSelect(id);
        if (type == "add") {
          var elID = id.replace("qpi-add-sensor-parent-", "");
          changePort(elID, false);
        }
      }
    };

    if (context.infos.customSensors) {
      // $('#piaddsensor').click(clickAdder);
      $('#piaddsensor').click(addSensors);
    } else {
      $('#piaddsensor').hide();
    }
    $('#piremovesensor').click(function () {
      //$('#popupMessage').hide();
      //window.displayHelper.popupMessageShown = false;

      var removed = false;

      $('[id^=qpi-remove-sensor-]').each(function (index) {
        if ($(this).is(':checked')) {
          var sensorName = $(this).attr('id').replace("qpi-remove-sensor-", "");
          var sensor = sensorHandler.findSensorByName(sensorName);

          $("#qpi-remove-sensor-parent-" + sensorName).remove();

          for (var i = 0; i < context.infos.quickPiSensors.length; i++) {
            if (context.infos.quickPiSensors[i] === sensor) {
              sensor.removed = true;
              context.infos.quickPiSensors.splice(i, 1);
            }
          }

          removed = true;
          // console.log(sensorName);
        }
      });

      if (removed) {
        context.recreateDisplay = true;
        context.resetDisplay();
        updateAddGrid();
      }
    });

    function addSensors() {
      var added = false;

      $('[id^=qpi-add-sensor-]').each(function (index) {
        if ($(this).is(':checked')) {
          var id = $(this).attr('id');
          var sensorID = id.replace("qpi-add-sensor-", "");
          var params = sensorID.split("_");
          // console.log(params)
          var dummysensor = {type: params[0]};
          if (params.length == 2)
            // @ts-ignore
            dummysensor.subType = params[1];

          var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);

          var port = $("#qpi-add-sensor-parent-" + sensorID + " .port").text();
          var name = sensorHandler.getNewSensorSuggestedName(sensorDefinition.suggestedName);

          context.infos.quickPiSensors.push({
            type: sensorDefinition.name,
            subType: sensorDefinition.subType,
            port: port,
            name: name
          });

          added = true;


        }
      });

      if (added) {
        context.resetSensorTable();
        // context.recreateDisplay = true;
        context.resetDisplay();
        updateAddGrid();
        $('#popupMessage').hide();
        window.displayHelper.popupMessageShown = false;
      }
    };

    function showMenu(id) {
      $('#popupMessage .navigationContent ul li').removeClass('selected');
      $('#popupMessage .navigationContent ul li[id=qpi-' + id + ']').addClass('selected');
      $('#showNavigationContent').prop('checked', false);
      $('#piconnectionlabel').hide();

      $('[id^=qpi-uiblock]').addClass("hiddenContent");
      $('#qpi-uiblock-' + id).removeClass("hiddenContent");
    };

    function showPortDialog(id) {
      // removePortDialog();
      var back = $("<div id='port_dialog_back'></div>");
      var dial = $("<div id='port_dialog'></div>");

      var params = id.split("_");
      var builtinport = false;
      var dummysensor = {type: params[0]};
      if (params.length >= 2)
        if (params[1])
          // @ts-ignore
          dummysensor.subType = params[1];
      if (params.length >= 3)
        builtinport = params[2];
      var sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);
      // console.log(params);

      var html = "<div id='port_field'><span>" + strings.messages.port + "</span><select id='port_select' class=\"custom-select\">";
      // var portSelect = document.getElementById("selector-sensor-port");
      // $('#selector-sensor-port').empty();
      var hasPorts = false;
      if (builtinport) {
        html += "<option value=" + builtinport + ">" + builtinport + "</option>";
        hasPorts = true;
      } else {
        var ports = mainBoard.getCurrentBoard(context.board).portTypes[sensorDefinition.portType];
        // console.log(id,ports)
        if (sensorDefinition.portType == "i2c") {
          ports = ["i2c"];
        }

        for (var iPort = 0; iPort < ports.length; iPort++) {
          var port = sensorDefinition.portType + ports[iPort];
          if (sensorDefinition.portType == "i2c")
            port = "i2c";

          if (!sensorHandler.isPortUsed(sensorDefinition.name, port) && !usedPorts.includes(port)) {
            html += "<option value=" + port + ">" + port + "</option>";
            // var option = document.createElement('option');
            hasPorts = true;
          }
        }
      }
      html += "</select><label id=\"selector-label\"></label></div>";
      html += "<div id='buttons'><button id=\"validate\"><i class='icon fas fa-check'></i>" + strings.messages.validate + "</button>";
      html += "<button id=\"cancel\"><i class='icon fas fa-times'></i>" + strings.messages.cancel + "</button></div>";
      dial.html(html);
      $("#popupMessage").after(back, dial);

      if (!hasPorts) {
        $('#buttons #validate').attr('disabled', 'disabled');

        var object_function = strings.messages.actuator;
        if (sensorDefinition.isSensor)
          object_function = strings.messages.sensor;

        $('#selector-label').text(strings.messages.noPortsAvailable.format(object_function, sensorDefinition.portType));
        $('#selector-label').show();
        $('#port_field span, #port_field select').hide();
      } else {
        $('#buttons #validate').attr('disabled', null);
        $('#selector-label').hide();
        $('#port_field span, #port_field select').show();
      }

      $("#port_dialog #cancel").click(function () {
        removePortDialog();
        var elID = "qpi-add-sensor-parent-" + id;
        changeSelect(elID);
        changePort(id, false);
      });

      $("#port_dialog #validate").click(function () {
        var port = $("#port_select").val();
        var elID = "qpi-add-sensor-parent-" + id;
        changePort(id, port);
        removePortDialog();
        // console.log(port)
      });

      // $("#port_select").focusout(function(){console.log("focusout")})
      // $("#port_select").change(function(){console.log("change")})
    };

    function changePort(id, port) {
      var elID = "qpi-add-sensor-parent-" + id;
      if (port) {
        $("#" + elID + " .port").text(port);
        if (!usedPorts.includes(port)) {
          usedPorts.push(port);
        }
      } else {
        var currPort = $("#" + elID + " .port").text();
        var ind = usedPorts.indexOf(currPort);
        if (ind >= 0) {
          usedPorts.splice(ind, 1);
        }
        $("#" + elID + " .port").text("");
      }
    }

    function removePortDialog() {
      $("#port_dialog_back, #port_dialog").remove();
    }

    function showConfirmDialog(cb) {
      var back = $("<div id='port_dialog_back'></div>");
      var dial = $("<div id='port_dialog'></div>");
      let html = "<span>" + strings.messages.areYouSure + "</span>";
      html += "<div id='buttons'><button id=\"yes\">" + strings.messages.yes + "</button>";
      html += "<button id=\"no\">" + strings.messages.no + "</button></div>";
      dial.html(html);

      $("#popupMessage").after(back, dial);

      $("#port_dialog #no").click(function () {
        removePortDialog();
      });
      $("#port_dialog #yes").click(function () {
        if (cb)
          cb();
        removePortDialog();
      });
    };

    $('#qpi-portsnames').click(clickMenu("portsnames"));
    $('#qpi-components').click(clickMenu("components"));
    $('#qpi-change-board').click(clickMenu("change-board"));
    $('#qpi-connection').click(clickMenu("connection"));

    function clickMenu(id) {
      return function () {
        if (id != "components") {
          if (toAdd.length > 0 || toRemove.length > 0) {
            showConfirmDialog(function () {
              unselectSensors();
              clickMenu(id)();
            });
            return
          }
        }
        showMenu(id);
      }
    };

    if (context.offLineMode) {
      $('#pirelease').attr('disabled', 'disabled');
    } else {
      $('#pirelease').attr('disabled', null);
    }

    $('#piconnectionlabel').hide();

    $('#piaddress').on('input', function (e) {

      if (context.offLineMode) {
        var content = $('#piaddress').val();

        if (content) {
          $('#piconnectok').attr('disabled', null);
        }
        else {
          $('#piconnectok').attr('disabled', 'disabled');
        }
      }
    });


    if (getSessionStorage('pilist')) {
      populatePiList(JSON.parse(getSessionStorage('pilist')));
    }

    if (getSessionStorage('raspberryPiIpAddress')) {
      $('#piaddress').val(getSessionStorage('raspberryPiIpAddress'));
      $('#piaddress').trigger("input");
    }

    if (getSessionStorage('schoolkey')) {
      $('#schoolkey').val(getSessionStorage('schoolkey'));
      $('#pigetlist').attr('disabled', null);
    }

    function setLocalIp() {
      var localvalue = $('input[name=pilocalconnectiontype]:checked').val()

      if (localvalue == "localhost") {
        $('#piaddress').val("localhost");
        $('#piaddress').trigger("input");
      } else {
        $('#piaddress').val(window.location.hostname);
        $('#piaddress').trigger("input");
      }
    }

    $('input[type=radio][name=pilocalconnectiontype]').change(function () {
      setLocalIp();
    });

    function cleanUSBBTIP() {
      var ipaddress = $('#piaddress').val();

      if (ipaddress == "192.168.233.1" ||
        ipaddress == "192.168.233.2" ||
        ipaddress == "localhost" ||
        ipaddress == window.location.hostname) {
        $('#piaddress').val("");
        $('#piaddress').trigger("input");

        var schoolkey = $('#schoolkey').val();
        // @ts-ignore
        if (schoolkey.length > 1)
          $('#pigetlist').trigger("click");
      }
    }

    cleanUSBBTIP();

    $('#panel-body-local').hide();


    if (availableConnectionMethods.includes(ConnectionMethod.Local)) {
      if (!context.quickPiConnection.isConnected() ||
        getSessionStorage('connectionMethod') == "LOCAL") {
        $('#piconsel .btn').removeClass('active');
        $('#piconlocal').addClass('active');


        $('#pischoolcon').hide();
        $('#piconnectionlabel').hide();
        $('#panel-body-local').show();
        setSessionStorage('connectionMethod', "LOCAL");

        if (context.localhostAvailable &&
          context.windowLocationAvailable) {
          $("#piconnectolocalhostcheckbox").prop("checked", true);

          setLocalIp();
        } else if (context.localhostAvailable) {
          $('#piconnectolocalhost').hide();
          $('#piconnectocurrenturlcheckbox').hide();

          setLocalIp();
        } else if (context.windowLocationAvailable) {
          $('#piconnectocurrenturl').hide();
          $('#piconnectolocalhostcheckbox').hide();

          setLocalIp();
        }
      }
    } else {
      $('#panel-body-local').hide();
      $("#piconlocal").hide();
    }

    $('#piconnectok').click(function () {
      context.inUSBConnection = false;
      context.inBTConnection = false;

      $('#piconnectok').attr('disabled', 'disabled');
      $("#piconnectprogressicon").show();
      $("#piconnectwifiicon").hide();

      // $('#popupMessage').hide();
      // window.displayHelper.popupMessageShown = false;

      if ($('#piusetunnel').is(":checked")) {

        var piname = $("#pilist option:selected").text().split("-")[0].trim();

        var url = "ws://api.quick-pi.org/client/" +
          $('#schoolkey').val() + "-" +
          piname +
          "/api/v1/commands";

        setSessionStorage('quickPiUrl', url);
        context.quickPiConnection.connect(url);

      } else {
        var ipaddress = $('#piaddress').val();
        setSessionStorage('raspberryPiIpAddress', ipaddress);

        showasConnecting(context);
        var url = "ws://" + ipaddress + ":5000/api/v1/commands";
        setSessionStorage('quickPiUrl', url);

        context.quickPiConnection.connect(url);
      }
    });

    $('#pirelease').click(function () {
      context.inUSBConnection = false;
      context.inBTConnection = false;

      // $('#popupMessage').hide();
      // window.displayHelper.popupMessageShown = false;

      // IF connected release lock
      context.releasing = true;
      context.quickPiConnection.releaseLock();
    });

    $('#picancel').click(exitConfig);

    function exitConfig() {
      if (toAdd.length > 0 || toRemove.length > 0) {
        showConfirmDialog(function () {
          unselectSensors();
          exitConfig();
        });
        return
      }
      context.inUSBConnection = false;
      context.inBTConnection = false;

      $('#popupMessage').hide();
      window.displayHelper.popupMessageShown = false;
    }

    $('#schoolkey').on('input', function (e) {
      var schoolkey = $('#schoolkey').val();
      setSessionStorage('schoolkey', schoolkey);

      if (schoolkey)
        $('#pigetlist').attr('disabled', null);
      else
        $('#pigetlist').attr('disabled', 'disabled');
    });


    $('#pigetlist').click(function () {
      var schoolkey = $('#schoolkey').val();

      fetch('http://www.france-ioi.org/QuickPi/list.php?school=' + schoolkey)
        .then(function (response) {
          return response.json();
        })
        .then(function (jsonlist) {
          populatePiList(jsonlist);
        });
    });

    // Select device connexion methods
    $('#piconsel .btn').click(function () {
      if (!context.quickPiConnection.isConnected()) {
        if (!$(this).hasClass('active')) {
          $('#piconsel .btn').removeClass('active');
          $(this).addClass('active');
        }
      }
    });

    function onPiconLocalClick() {
      context.inUSBConnection = false;
      context.inBTConnection = false;

      cleanUSBBTIP();

      if (!context.quickPiConnection.isConnected()) {
        setLocalIp();
        setSessionStorage('connectionMethod', "LOCAL");
        $("#piconlocal").addClass('active');
        $('#panel-body-local').show();
        $('#pischoolcon').hide();
        $('#piconnectionlabel').hide();
      }
    }

    function onPiconWifiClick() {
      context.inUSBConnection = false;
      context.inBTConnection = false;
      $("#piconwifi").addClass('active');
      cleanUSBBTIP();

      if (!context.quickPiConnection.isConnected()) {
        setSessionStorage('connectionMethod', "WIFI");
        $('#panel-body-local').hide();
        $('#pischoolcon').show();
        $('#piconnectionlabel').hide();
      }
    }

    function onPiconUsbClick() {
      $("#piconusb").addClass('active');

      if (!context.quickPiConnection.isConnected()) {
        setSessionStorage('connectionMethod', "USB");
        $('#piconnectok').attr('disabled', 'disabled');
        $('#panel-body-local').hide();
        $('#piconnectionlabel').show();
        $('#piconnectionlabel').html(strings.messages.cantConnectoToUSB)

        $('#pischoolcon').hide();
        $('#piaddress').val("192.168.233.1");

        context.inUSBConnection = true;
        context.inBTConnection = false;

        function updateUSBAvailability(available) {

          if (context.inUSBConnection && context.offLineMode) {
            if (available) {
              $('#piconnectok').attr('disabled', null);

              $('#piconnectionlabel').text(strings.messages.canConnectoToUSB)
            } else {
              $('#piconnectok').attr('disabled', 'disabled');

              $('#piconnectionlabel').html(strings.messages.cantConnectoToUSB)
            }

            setTimeout(function () {
              context.quickPiConnection.isAvailable("192.168.233.1", updateUSBAvailability);
            }, 1000);
          }
        }

        updateUSBAvailability(false);
      }
    }

    function onPiconBtClick() {
      $("#piconbt").addClass('active');

      $('#piconnectionlabel').show();
      if (!context.quickPiConnection.isConnected()) {
        setSessionStorage('connectionMethod', "BT");
        $('#piconnectok').attr('disabled', 'disabled');
        $('#panel-body-local').hide();
        $('#piconnectionlabel').show();
        $('#piconnectionlabel').html(strings.messages.cantConnectoToBT)

        $('#pischoolcon').hide();

        $('#piaddress').val("192.168.233.2");

        context.inUSBConnection = false;
        context.inBTConnection = true;

        function updateBTAvailability(available) {

          if (context.inBTConnection && context.offLineMode) {
            if (available) {
              $('#piconnectok').attr('disabled', null);

              $('#piconnectionlabel').text(strings.messages.canConnectoToBT)
            } else {
              $('#piconnectok').attr('disabled', 'disabled');

              $('#piconnectionlabel').html(strings.messages.cantConnectoToBT)
            }

            setTimeout(function () {
              context.quickPiConnection.isAvailable("192.168.233.2", updateBTAvailability);
            }, 1000);
          }
        }

        updateBTAvailability(false);
      }
    }

    function onPiconWebSerialClick() {
      $('#panel-body-local').hide();
      $('#piconnectionlabel').hide();
      $("#piconweb_serial").addClass('active');
      $('#pischoolcon').hide();

      if (!context.quickPiConnection.isConnected() && !context.quickPiConnection.isConnecting()) {
        setSessionStorage('connectionMethod', "web_serial");
        $('#piconnectok').attr('disabled', null);

        context.inUSBConnection = false;
        context.inBTConnection = false;
      }
    }

    $('#piconnectok').attr('disabled', 'disabled');

    $('#piconlocal').click(onPiconLocalClick);
    $('#piconwifi').click(onPiconWifiClick);
    $('#piconusb').click(onPiconUsbClick);
    $('#piconbt').click(onPiconBtClick);
    $('#piconweb_serial').click(onPiconWebSerialClick);

    const availableMethodsHandlers = {
      [ConnectionMethod.Local]: onPiconLocalClick,
      [ConnectionMethod.Wifi]: onPiconWifiClick,
      [ConnectionMethod.Usb]: onPiconUsbClick,
      [ConnectionMethod.Bluetooth]: onPiconBtClick,
      [ConnectionMethod.WebSerial]: onPiconWebSerialClick,
    };

    if ((getSessionStorage('connectionMethod') ?? '').toLocaleLowerCase() in availableMethodsHandlers) {
      availableMethodsHandlers[getSessionStorage('connectionMethod').toLocaleLowerCase()]();
    }

    if (context.quickPiConnection.isConnected()) {
      if (getSessionStorage('connectionMethod') == "USB") {
        $('#piconwifi').removeClass('active');
        $('#piconusb').addClass('active');
        $('#pischoolcon').hide();
        $('#piaddress').val("192.168.233.1");

        $('#piconnectok').attr('disabled', 'disabled');
        $('#piconnectionlabel').show();
        $('#piconnectionlabel').text(strings.messages.canConnectoToUSB)

        context.inUSBConnection = true;
        context.inBTConnection = false;
      } else if (getSessionStorage('connectionMethod') == "BT") {
        $('#piconwifi').removeClass('active');
        $('#piconbt').addClass('active');
        $('#pischoolcon').hide();

        $('#piaddress').val("192.168.233.2");

        $('#piconnectok').attr('disabled', 'disabled');
        $('#piconnectionlabel').show();
        $('#piconnectionlabel').text(strings.messages.canConnectoToBT)

        context.inUSBConnection = false;
        context.inBTConnection = true;
      } else if (getSessionStorage('connectionMethod') == "LOCAL") {
        $('#piconlocal').trigger("click");
      }
    } else {
      setSessionStorage('connectionMethod', availableConnectionMethods[0].toLocaleUpperCase());
    }

    if (context.quickPiConnection.isConnecting()) {
      showasConnecting(context);
    }

    function populatePiList(jsonlist) {
      setSessionStorage('pilist', JSON.stringify(jsonlist));

      var select = document.getElementById("pilist");
      var first = true;

      $('#pilist').empty();
      $('#piusetunnel').attr('disabled', 'disabled');

      for (var i = 0; i < jsonlist.length; i++) {
        var pi = jsonlist[i];

        var el = document.createElement("option");

        var minutes = Math.round(jsonlist[i].seconds_since_ping / 60);
        var timeago = "";

        if (minutes < 60)
          timeago = strings.messages.minutesago.format(minutes);
        else
          timeago = strings.messages.hoursago;


        el.textContent = jsonlist[i].name + " - " + timeago;
        el.value = jsonlist[i].ip;

        select.appendChild(el);

        if (first) {
          $('#piaddress').val(jsonlist[i].ip);
          $('#piaddress').trigger("input");
          first = false;
          $('#pilist').prop('disabled', false);

          $('#piusetunnel').attr('disabled', null);
        }
      }
    }

    $('#pilist').on('change', function () {
      // @ts-ignore
      $("#piaddress").val(this.value);
    });

    updatePiComponentButtons();

    $('#picomponentname').click(function () {
      context.useportforname = false;
      updatePiComponentButtons();
      //context.recreateDisplay = true;
      context.resetDisplay();
    });

    $('#piportname').click(function () {
      context.useportforname = true;
      updatePiComponentButtons();
      //context.recreateDisplay = true;
      context.resetDisplay();
    });

    function updatePiComponentButtons() {
      if (context.useportforname) {
        $('#piportname').addClass('active');
        $('#picomponentname').removeClass('active');
        $('#example_sensor #port').show();
        $('#example_sensor #name').hide();
      } else {
        $('#picomponentname').addClass('active');
        $('#piportname').removeClass('active');
        $('#example_sensor #name').show();
        $('#example_sensor #port').hide();
      }
    }
  });
}
