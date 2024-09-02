import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";
import {screenDrawing} from "./util/screen";

export class SensorScreen extends AbstractSensor {
  private screenrect: any;
  private canvasNode: any;
  private canvas: any;
  protected type = 'screen';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "screen",
      suggestedName: strings.messages.sensorNameScreen,
      description: strings.messages.screen,
      isAnalog: false,
      isSensor: false,
      cellsAmount: function(paper) {
        // console.log(paper.width)
        if(context.board == 'grovepi') {
          return 2;
        }
        if(paper.width < 250) {
          return 4;
        } else if(paper.width < 350) {
          return 3;
        }

        if (context.compactLayout)
          return 3;
        else
          return 2;
      },
      portType: "i2c",
      valueType: "object",
      selectorImages: ["screen.png"],
      compareState: function (state1, state2) {
        // Both are null are equal
        if (state1 == null && state2 == null)
          return true;

        // If only one is null they are different
        if ((state1 == null && state2) ||
          (state1 && state2 == null))
          return false;

        if (state1.isDrawingData !=
          state2.isDrawingData)
          return false;

        if (state1 && state1.isDrawingData) {
          // They are ImageData objects
          // The image data is RGBA so there are 4 bits per pixel

          var data1 = state1.getData(1).data;
          var data2 = state2.getData(1).data;

          for (var i = 0; i < data1.length; i+=4) {
            if (data1[i]  != data2[i] ||
              data1[i + 1]  != data2[i + 1] ||
              data1[i + 2]  != data2[i + 2] ||
              data1[i + 3]  != data2[i + 3])
              return false;
          }

          return true;
        } else {

          // Otherwise compare the strings
          return (state1.line1 == state2.line1) &&
            ((state1.line2 == state2.line2) ||
              (!state1.line2 && !state2.line2));
        }
      },
      getStateString: function(state) {
        if(!state) { return '""'; }

        if (state.isDrawingData)
          return strings.messages.drawing;
        else
          return '"' + state.line1 + (state.line2 ? " / " + state.line2 : "") + '"';
      },
      getWrongStateString: function(failInfo) {
        if(!failInfo.expected ||
          !failInfo.expected.isDrawingData ||
          !failInfo.actual ||
          !failInfo.actual.isDrawingData) {
          return null; // Use default message
        }
        var data1 = failInfo.expected.getData(1).data;
        var data2 = failInfo.actual.getData(1).data;
        var nbDiff = 0;
        for (var i = 0; i < data1.length; i+=4) {
          if(data1[i] != data2[i]) {
            nbDiff += 1;
          }
        }
        return strings.messages.wrongStateDrawing.format(failInfo.name, nbDiff, failInfo.time);
      },
      subTypes: [{
        subType: "16x2lcd",
        description: strings.messages.grove16x2lcd,
        pluggable: true,
      },
        {
          subType: "oled128x32",
          description: strings.messages.oled128x32,
        }],

    };
  }

  getInitialState(sensor) {
    if (sensor.isDrawingScreen)
      return null;
    else
      return {line1: "", line2: ""};
  }

  setLiveState(state, callback) {
    var line2 = state.line2;
    if (!line2)
    line2 = "";

    var command = "displayText(\"" + this.name + "\"," + state.line1 + "\", \"" + line2 + "\")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, drawParameters: SensorDrawParameters) {
    if (this.stateText) {
      this.stateText.remove();
      this.stateText = null;
    }

    let borderSize = 5;

    let screenScale = 1.5;
    if (drawParameters.w < 300) {
      screenScale = 1;
    }
    if (drawParameters.w < 150) {
      screenScale = 0.5;
    }
    // console.log(screenScale,w,h)

    let screenScalerSize = {
      width: 128 * screenScale,
      height: 32 * screenScale
    }
    borderSize = borderSize * screenScale;

    drawParameters.imgw = screenScalerSize.width + borderSize * 2;
    drawParameters.imgh = screenScalerSize.height + borderSize * 2;
    drawParameters.imgx = drawParameters.x - (drawParameters.imgw / 2) + (drawParameters.w / 2);

    drawParameters.imgy = drawParameters.y + (drawParameters.h - drawParameters.imgh) / 2 + drawParameters.h * 0.05;

    drawParameters.portx = drawParameters.imgx + drawParameters.imgw + borderSize;
    drawParameters.porty = drawParameters.imgy + drawParameters.imgh / 3;

    drawParameters.statesize = drawParameters.imgh / 3.5;

    if (!this.img || sensorHandler.isElementRemoved(this.img)) {
      this.img = this.context.paper.image(getImg('screen.png'), drawParameters.imgx, drawParameters.imgy, drawParameters.imgw, drawParameters.imgh);
    }

    this.img.attr({
      "x": drawParameters.imgx,
      "y": drawParameters.imgy,
      "width": drawParameters.imgw,
      "height": drawParameters.imgh,
      "opacity": drawParameters.fadeopacity,
    });

    if (this.state) {
      if (this.state.isDrawingData) {
        if (!this.screenrect || sensorHandler.isElementRemoved(this.screenrect) || !this.canvasNode) {
          this.screenrect = this.context.paper.rect(drawParameters.imgx, drawParameters.imgy, screenScalerSize.width, screenScalerSize.height);

          this.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
          this.canvasNode.setAttribute("x", drawParameters.imgx + borderSize); //Set rect data
          this.canvasNode.setAttribute("y", drawParameters.imgy + borderSize); //Set rect data
          this.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
          this.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data
          this.context.paper.canvas.appendChild(this.canvasNode);

          this.canvas = document.createElement("canvas");
          this.canvas.id = "screencanvas";
          this.canvas.width = screenScalerSize.width;
          this.canvas.height = screenScalerSize.height;
          this.canvasNode.appendChild(this.canvas);
        }

        $(this.canvas).css({opacity: drawParameters.fadeopacity});
        this.canvasNode.setAttribute("x", drawParameters.imgx + borderSize); //Set rect data
        this.canvasNode.setAttribute("y", drawParameters.imgy + borderSize); //Set rect data
        this.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
        this.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data

        this.screenrect.attr({
          "x": drawParameters.imgx + borderSize,
          "y": drawParameters.imgy + borderSize,
          "width": 128,
          "height": 32,
        });

        this.screenrect.attr({"opacity": 0});

        this.context.quickpi.initScreenDrawing(this);
        //sensor.screenDrawing.copyToCanvas(sensor.canvas, screenScale);
        screenDrawing.renderToCanvas(this.state, this.canvas, screenScale);
      } else {
        let statex = drawParameters.imgx + (drawParameters.imgw * .05);

        let statey = drawParameters.imgy + (drawParameters.imgh * .2);

        if (this.state.line1.length > 16)
          this.state.line1 = this.state.line1.substring(0, 16);

        if (this.state.line2 && this.state.line2.length > 16)
          this.state.line2 = this.state.line2.substring(0, 16);

        if (this.canvasNode) {
          $(this.canvasNode).remove();
          this.canvasNode = null;
        }

        this.stateText = this.context.paper.text(statex, statey, this.state.line1 + "\n" + (this.state.line2 ? this.state.line2 : ""));
        drawParameters.stateanchor = "start";
        this.stateText.attr("")
      }
    }
  }
}
