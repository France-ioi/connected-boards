import {getImg, textEllipsis} from "../../util";
import {buzzerSound} from "./buzzer_sound";
import {gyroscope3D} from "./gyroscope3d";
import {SensorHandler} from "./sensor_handler";
import {screenDrawing} from "./screen";
import {createSensor} from "../sensor_factory";
import {QuickalgoLibrary} from "../../definitions";
import {SensorDrawParameters} from "../abstract_sensor";

const colors = {
  blue: "#4a90e2",
  orange: "#f5a623"
}

export class SensorDrawer {
  private context: QuickalgoLibrary;
  private strings;
  private sensorHandler: SensorHandler;
  private sensorDefinitions;

  constructor(context, strings, sensorDefinitions, sensorHandler) {
    this.context = context;
    this.strings = strings;
    this.sensorHandler = sensorHandler;
    this.sensorDefinitions = sensorDefinitions;
  }

  sensorInConnectedModeError() {
    window.displayHelper.showPopupMessage(this.strings.messages.sensorInOnlineMode, 'blanket');
  }

  actuatorsInRunningModeError() {
    window.displayHelper.showPopupMessage(this.strings.messages.actuatorsWhenRunning, 'blanket');
  }

  saveSensorStateIfNotRunning(sensor) {
    // save the sensor if we are not running
    if (!(this.context.runner && this.context.runner.isRunning())) {
      if (this._findFirst(this.sensorDefinitions, (globalSensor) => {
        return globalSensor.name === sensor.type;
      }).isSensor) {
        this.context.sensorsSaved[sensor.name] = {
          state: Array.isArray(sensor.state) ? sensor.state.slice() : sensor.state,
          screenDrawing: sensor.screenDrawing,
          lastDrawnTime: sensor.lastDrawnTime,
          lastDrawnState: sensor.lastDrawnState,
          callsInTimeSlot: sensor.callsInTimeSlot,
          lastTimeIncrease: sensor.lastTimeIncrease,
          removed: sensor.removed,
          quickStore: sensor.quickStore
        };
      }
    }
  }

  _findFirst(array, func) {
    for (let i = 0; i < array.length; i++) {
      if (func(array[i]))
        return array[i];
    }
    return undefined;
  }

  drawSensor(sensor, juststate = false, donotmovefocusrect = false) {
    // console.log('draw sensor', sensor, this.context, this.context.paper);
    // console.log(sensor.type)
    this.saveSensorStateIfNotRunning(sensor);
    if (this.context.sensorStateListener) {
      this.context.sensorStateListener(sensor);
    }

    let sameFont = true;
    let fontWeight = "normal";

    if (this.context.paper == undefined || !this.context.display || !sensor.drawInfo)
      return;

    let scrolloffset = 0;
    let fadeopacity = 1;

    let w = sensor.drawInfo.width;
    let h = sensor.drawInfo.height;
    let x = sensor.drawInfo.x;
    let y = sensor.drawInfo.y;
    let cx = x + w / 2;
    let cy = y + h / 2;

    let imgh = h / 2;
    let imgw = imgh;

    let imgx = x - (imgw / 2) + (w / 2);
    let imgy = y + (h - imgh) / 2;

    let namex = x + (w / 2);
    let namey = y + h / 8;
    let nameanchor = "middle";
    // this.context.paper.path(["M",x,namey,"H",x + w])

    let state1x = x + (w / 2)
    let state1y = y + h - h / 8;
    let stateanchor = "middle";
    // this.context.paper.path(["M",x,state1y,"H",x + w])
    // console.log(state1y)

    if (sensor.type == "accelerometer" ||
      sensor.type == "gyroscope" ||
      sensor.type == "magnetometer" ||
      sensor.type == "stick") {
      if (this.context.compactLayout)
        imgx = x + 5;
      else
        imgx = x - (imgw / 4) + (w / 4);

      let dx = w * 0.03;
      imgx = cx - imgw - dx;

      state1x = (imgx + imgw) + 10;
      state1y = y + h / 2;
      stateanchor = 'start';

      imgy += h * 0.05;
      state1y += h * 0.05;

    }
    if (sensor.type == "buzzer") {
      let sizeRatio = imgw / w;
      if (sizeRatio > 0.75) {
        imgw = 0.75 * w;
        imgh = imgw;
      }
    }


    let portx = state1x;
    let porty = imgy;


    let portsize = sensor.drawInfo.height * 0.11;

    // if (this.context.compactLayout)
    //     let statesize = sensor.drawInfo.height * 0.14;
    // else
    //     let statesize = sensor.drawInfo.height * 0.10;

    let namesize = sensor.drawInfo.height * 0.15;
    let statesize = namesize;
    portsize = namesize;

    let maxNameSize = 25;
    let maxStateSize = 20;
    // console.log(this.context.compactLayout,statesize)


    let drawPortText = false;
    let drawName = true;

    if (!sensor.focusrect || this.sensorHandler.isElementRemoved(sensor.focusrect)) {
      sensor.focusrect = this.context.paper.rect(imgx, imgy, imgw, imgh);
    }

    sensor.focusrect.attr({
      "fill": "468DDF",
      "fill-opacity": 0,
      "opacity": 0,
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
    });

    if (this.context.autoGrading) {

      scrolloffset = $('#virtualSensors').scrollLeft();

      if (scrolloffset > 0)
        fadeopacity = 0.3;

      imgw = w * .80;
      imgh = sensor.drawInfo.height * .80;

      imgx = sensor.drawInfo.x + (imgw * 0.75) + scrolloffset;
      imgy = sensor.drawInfo.y + (sensor.drawInfo.height / 2) - (imgh / 2);

      state1x = imgx + imgw * 1.2;
      state1y = imgy + (imgh / 2);

      portx = x;
      porty = imgy + (imgh / 2);

      portsize = imgh / 3;
      statesize = sensor.drawInfo.height * 0.2;

      namex = portx;
      namesize = portsize;
      nameanchor = "start";
    }
    namesize = Math.min(namesize, maxNameSize);
    statesize = Math.min(statesize, maxStateSize);
    if (sameFont) {
      // namesize = h*0.12;
      statesize = namesize;
      // console.log(statesize)
    }

    let sensorAttr = {
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
    };

    const drawParameters: SensorDrawParameters = {
      fadeopacity,
      sensorAttr,
      imgx,
      imgy,
      imgw,
      imgh,
      state1x,
      state1y,
      juststate,
      x,
      y,
      w,
      h,
      cx,
      cy,
      portx,
      porty,
      portsize,
      stateanchor,
      statesize,
      drawName,
      drawPortText,
      fontWeight,
      namex,
      namey,
      namesize,
      nameanchor,
      scrolloffset,
    };

    if (sensor.draw) {
      sensor.draw(this.sensorHandler, drawParameters);
    }

    if (sensor.type == "galaxia") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.galaxia || this.sensorHandler.isElementRemoved(sensor.galaxia))
        sensor.galaxia = this.context.paper.image(getImg('galaxia.svg'), imgx, imgy, imgw, imgh);

      if (sensor.state == null)
        sensor.state = false;

      sensor.galaxia.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
      });

      if (sensor.state) {
        /*sensor.buttonon.attr({ "opacity": fadeopacity });
        sensor.buttonoff.attr({ "opacity": 0 });*/
      } else {
        /*sensor.buttonon.attr({ "opacity": 0 });
        sensor.buttonoff.attr({ "opacity": fadeopacity });*/
      }

      if (!this.context.autoGrading) {
        // sensor.focusrect.node.onmousedown = () => {
        //     if (this.context.offLineMode) {
        //         sensor.state = true;
        //         this.sensorHandler.warnClientSensorStateChanged(sensor);
        //         this.drawSensor(sensor);
        //     } else
        //         this.sensorInConnectedModeError();
        // };


        // sensor.focusrect.node.onmouseup = () => {
        //     if (this.context.offLineMode) {
        //         sensor.state = false;
        //         sensor.wasPressed = true;
        //         this.sensorHandler.warnClientSensorStateChanged(sensor);
        //         this.drawSensor(sensor);

        //         if (sensor.onPressed)
        //             sensor.onPressed();
        //     } else
        //         this.sensorInConnectedModeError();
        // }

        // sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
        // sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
      }
    }


    if (sensor.stateText) {
      try {
        let statecolor = "gray";
        // if (this.context.compactLayout)
        //     statecolor = "black";
        // console.log(statesize)
        sensor.stateText.attr({
          "font-size": drawParameters.statesize,
          'text-anchor': drawParameters.stateanchor,
          'font-weight': drawParameters.fontWeight,
          fill: statecolor
        });
        // let b = sensor.stateText._getBBox();
        // sensor.stateText.translate(0, b.height/2);
        sensor.stateText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
      } catch (err) {
      }
    }


    if (drawPortText) {
      if (sensor.portText)
        sensor.portText.remove();

      sensor.portText = this.context.paper.text(drawParameters.portx, drawParameters.porty, sensor.port);
      sensor.portText.attr({"font-size": portsize + "px", 'text-anchor': 'start', fill: "gray"});
      sensor.portText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
      let b = sensor.portText._getBBox();
      sensor.portText.translate(0, b.height / 2);
    }

    if (sensor.nameText) {
      sensor.nameText.remove();
    }


    if (drawParameters.drawName) {
      if (sensor.name) {
        let sensorId = sensor.name;
        if (this.context.useportforname)
          sensorId = sensor.port;

        sensor.nameText = this.context.paper.text(drawParameters.namex, drawParameters.namey, sensorId);
        // sensor.nameText = this.context.paper.text(namex, namey, sensor.name );
        sensor.nameText.attr({
          "font-size": drawParameters.namesize,
          "font-weight": drawParameters.fontWeight,
          'text-anchor': drawParameters.nameanchor,
          fill: "#7B7B7B"
        });
        sensor.nameText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
        let bbox = sensor.nameText.getBBox();
        if (bbox.width > w - 20) {
          drawParameters.namesize = drawParameters.namesize * (w - 20) / bbox.width;
          drawParameters.namey += drawParameters.namesize * (1 - (w - 20) / bbox.width);
          sensor.nameText.attr({
            "font-size": drawParameters.namesize,
            y: drawParameters.namey
          });
        }
      }
    }


    if (!donotmovefocusrect) {
      // This needs to be in front of everything
      sensor.focusrect.toFront();
      if (sensor.muteBtn)
        sensor.muteBtn.toFront();
    }

    this.saveSensorStateIfNotRunning(sensor);
  }

  setSlider(sensor, juststate, imgx, imgy, imgw, imgh, min, max) {
    // console.log("setSlider",juststate)
    if (juststate) {

      if (Array.isArray(sensor.state)) {
        for (let i = 0; i < sensor.state.length; i++) {
          if (sensor.sliders[i] == undefined)
            continue;

          let percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[i], sensor);

          const thumby = sensor.sliders[i].sliderdata.insiderecty +
            sensor.sliders[i].sliderdata.insideheight -
            sensor.sliders[i].sliderdata.thumbheight -
            (percentage * sensor.sliders[i].sliderdata.scale);

          sensor.sliders[i].thumb.attr('y', thumby);
          sensor.sliders[i].slider.toFront();
        }
      } else {
        let percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);

        const thumby = sensor.sliders[0].sliderdata.insiderecty +
          sensor.sliders[0].sliderdata.insideheight -
          sensor.sliders[0].sliderdata.thumbheight -
          (percentage * sensor.sliders[0].sliderdata.scale);

        sensor.sliders[0].thumb.attr('y', thumby);
      }

      return;
    }

    this.removeSlider(sensor);


    sensor.sliders = [];

    let actuallydragged;

    sensor.hasslider = true;
    sensor.focusrect.drag(
      (dx, dy, x, y, event) => {
        if (sensor.sliders.length != 1)
          return;

        let newy = sensor.sliders[0].sliderdata.zero + dy;

        if (newy < sensor.sliders[0].sliderdata.insiderecty)
          newy = sensor.sliders[0].sliderdata.insiderecty;

        if (newy > sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight)
          newy = sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight;

        sensor.sliders[0].thumb.attr('y', newy);

        let percentage = 1 - ((newy - sensor.sliders[0].sliderdata.insiderecty) / sensor.sliders[0].sliderdata.scale);

        sensor.state = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor, true);

        actuallydragged++;
      },
      function (x, y, event) {
        showSlider();
        actuallydragged = 0;

        if (sensor.sliders.length == 1)
          sensor.sliders[0].sliderdata.zero = sensor.sliders[0].thumb.attr('y');
      },
      function (event) {
        if (actuallydragged > 4) {
          hideSlider(sensor);
        }
      }
    );

    const showSlider = () => {
      hideSlider(sensorWithSlider);
      sensorWithSlider = sensor;

      let w = sensor.drawInfo.width;
      let h = sensor.drawInfo.height;
      let x = sensor.drawInfo.x;
      let y = sensor.drawInfo.y;

      if (Array.isArray(sensor.state)) {

        let offset = 0;
        let sign = -1;
        if (sensor.drawInfo.x -
          ((sensor.state.length - 1) * sensor.drawInfo.width / 5) < 0)
        {
          sign = 1;
          offset = sensor.drawInfo.width * .70;
        }

        // if offset is equal to 0, we need to reverse
        if (offset == 0) {
          for (let i = 0; i < sensor.state.length; i++) {
            let sliderobj = this.createSlider(sensor,
              max,
              min,
              sensor.drawInfo.x + offset + (sign * Math.abs(i + 1 - sensor.state.length) * h / 5),
              sensor.drawInfo.y,
              h,
              h,
              i);

            sensor.sliders.push(sliderobj);
          }
        }
        else {
          for (let i = 0; i < sensor.state.length; i++) {
            let sliderobj = this.createSlider(sensor,
              max,
              min,
              sensor.drawInfo.x + offset + (sign * i * h / 5),
              sensor.drawInfo.y,
              h,
              h,
              i);

            sensor.sliders.push(sliderobj);
          }
        }
      } else {
        let sliderobj = this.createSlider(sensor,
          max,
          min,
          sensor.drawInfo.x,
          sensor.drawInfo.y,
          h,
          h,
          0);
        sensor.sliders.push(sliderobj);
      }
    }
  }

  removeSlider(sensor) {
    if (sensor.hasslider && sensor.focusrect) {
      sensor.focusrect.undrag();
      sensor.hasslider = false;
    }

    if (sensor.sliders) {

      for (let i = 0; i < sensor.sliders.length; i++) {
        sensor.sliders[i].slider.remove();
      }

      sensor.sliders = [];
    }
  }

  createSlider(sensor, max, min, x, y, w, h, index) {
    // console.log("this.createSlider(")
    let sliderobj: any = {};
    sliderobj.sliderdata = {};

    sliderobj.index = index;
    sliderobj.min = min;
    sliderobj.max = max;

    let outsiderectx = x;
    let outsiderecty = y;
    let outsidewidth = w / 6;
    let outsideheight = h;

    let insidewidth = outsidewidth / 6;
    sliderobj.sliderdata.insideheight = h * 0.60;

    let insiderectx = outsiderectx + (outsidewidth / 2) - (insidewidth / 2);
    sliderobj.sliderdata.insiderecty = outsiderecty + (outsideheight / 2) - (sliderobj.sliderdata.insideheight / 2);

    let circleradius = (outsidewidth / 2) - 1;

    let pluscirclex = outsiderectx + (outsidewidth / 2);
    let pluscircley = outsiderecty + circleradius + 1;

    let minuscirclex = pluscirclex;
    let minuscircley = outsiderecty + outsideheight - circleradius - 1;

    this.context.paper.setStart();

    sliderobj.sliderrect = this.context.paper.rect(outsiderectx, outsiderecty, outsidewidth, outsideheight, outsidewidth / 2);
    sliderobj.sliderrect.attr("fill", "#468DDF");
    sliderobj.sliderrect.attr("stroke", "#468DDF");

    sliderobj.sliderrect = this.context.paper.rect(insiderectx, sliderobj.sliderdata.insiderecty, insidewidth, sliderobj.sliderdata.insideheight, 2);
    sliderobj.sliderrect.attr("fill", "#2E5D94");
    sliderobj.sliderrect.attr("stroke", "#2E5D94");


    sliderobj.plusset = this.context.paper.set();

    sliderobj.pluscircle = this.context.paper.circle(pluscirclex, pluscircley, circleradius);
    sliderobj.pluscircle.attr("fill", "#F5A621");
    sliderobj.pluscircle.attr("stroke", "#F5A621");

    sliderobj.plus = this.context.paper.text(pluscirclex, pluscircley, "+");
    sliderobj.plus.attr({ fill: "white" });
    sliderobj.plus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

    sliderobj.plusset.push(sliderobj.pluscircle, sliderobj.plus);

    sliderobj.plusset.click(() => {
      let step = 1;
      let sensorDef = this.sensorHandler.findSensorDefinition(sensor);
      if (sensorDef.step)
        step = sensorDef.step;

      if (Array.isArray(sensor.state)) {
        if (sensor.state[sliderobj.index] < sliderobj.max)
          sensor.state[sliderobj.index] += step;
      }
      else
      {
        if (sensor.state < sliderobj.max)
          sensor.state += step;
      }

      this.sensorHandler.warnClientSensorStateChanged(sensor);
      this.drawSensor(sensor, true);
    });


    sliderobj.minusset = this.context.paper.set();

    sliderobj.minuscircle = this.context.paper.circle(minuscirclex, minuscircley, circleradius);
    sliderobj.minuscircle.attr("fill", "#F5A621");
    sliderobj.minuscircle.attr("stroke", "#F5A621");

    sliderobj.minus = this.context.paper.text(minuscirclex, minuscircley, "-");
    sliderobj.minus.attr({ fill: "white" });
    sliderobj.minus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

    sliderobj.minusset.push(sliderobj.minuscircle, sliderobj.minus);

    sliderobj.minusset.click(() => {
      let step = 1;
      let sensorDef = this.sensorHandler.findSensorDefinition(sensor);
      if (sensorDef.step)
        step = sensorDef.step;

      if (Array.isArray(sensor.state)) {
        if (sensor.state[sliderobj.index] > sliderobj.min)
          sensor.state[sliderobj.index] -= step;
      } else {
        if (sensor.state > sliderobj.min)
          sensor.state -= step;
      }

      this.sensorHandler.warnClientSensorStateChanged(sensor);
      this.drawSensor(sensor, true);
    });


    let thumbwidth = outsidewidth * .80;
    sliderobj.sliderdata.thumbheight = outsidewidth * 1.4;
    sliderobj.sliderdata.scale = (sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight);


    let percentage;
    if (Array.isArray(sensor.state)) {
      percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[index], sensor);
    } else {
      percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);
    }


    let thumby = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight - (percentage * sliderobj.sliderdata.scale);

    let thumbx = insiderectx + (insidewidth / 2) - (thumbwidth / 2);

    sliderobj.thumb = this.context.paper.rect(thumbx, thumby, thumbwidth, sliderobj.sliderdata.thumbheight, outsidewidth / 2);
    sliderobj.thumb.attr("fill", "#F5A621");
    sliderobj.thumb.attr("stroke", "#F5A621");

    sliderobj.slider = this.context.paper.setFinish();

    sliderobj.thumb.drag(
      (dx, dy, x, y, event) => {

        let newy = sliderobj.sliderdata.zero + dy;

        if (newy < sliderobj.sliderdata.insiderecty)
          newy = sliderobj.sliderdata.insiderecty;

        if (newy > sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight)
          newy = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight;

        sliderobj.thumb.attr('y', newy);

        let percentage = 1 - ((newy - sliderobj.sliderdata.insiderecty) / sliderobj.sliderdata.scale);

        if (Array.isArray(sensor.state)) {
          sensor.state[sliderobj.index] = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        } else {
          sensor.state = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        }
        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor, true);
      },
      function (x, y, event) {
        sliderobj.sliderdata.zero = sliderobj.thumb.attr('y');

      },
      function (event) {
      }
    );

    sliderobj.slider.toFront();

    return sliderobj;
  }
}

let sensorWithSlider = null;
let removeRect = null;
let sensorWithRemoveRect = null;

window.addEventListener('click', function (e: any) {
  let keep = false;
  let keepremove = false;
  e = e || window.event;
  let target = e.target || e.srcElement;

  if (sensorWithRemoveRect && sensorWithRemoveRect.focusrect && target == sensorWithRemoveRect.focusrect.node)
    keepremove = true;

  if (removeRect && !keepremove) {
    removeRect.remove();
    removeRect = null;
  }

  if (sensorWithSlider && sensorWithSlider.focusrect && target == sensorWithSlider.focusrect.node)
    keep = true;

  if (sensorWithSlider && sensorWithSlider.sliders) {
    for (let i = 0; i < sensorWithSlider.sliders.length; i++) {
      sensorWithSlider.sliders[i].slider.forEach(function (element) {
        if (target == element.node ||
          target.parentNode == element.node) {
          keep = true;
          return false;
        }
      });
    }
  }

  if (!keep) {
    hideSlider(sensorWithSlider);
  }

}, false);//<-- we'll get to the false in a minute

function hideSlider(sensor) {
  if (!sensor)
    return;

  if (sensor.sliders) {
    for (let i = 0; i < sensor.sliders.length; i++) {
      sensor.sliders[i].slider.remove();
    }
    sensor.sliders = [];
  }


  if (sensor.focusrect && sensor.focusrect.paper && sensor.focusrect.paper.canvas){
    sensor.focusrect.toFront();
    if(sensor.muteBtn)
      sensor.muteBtn.toFront();
  }
}
