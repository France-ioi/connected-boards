import {SensorHandler} from "./sensor_handler";
import {AbstractSensor, SensorDrawTimeLineParameters} from "../abstract_sensor";

export function drawBubbleTimeline<T>(sensor: AbstractSensor<T>, sensorHandler: SensorHandler, state: T, expectedState: T, type: string, drawParameters: SensorDrawTimeLineParameters, drawBubble: () => HTMLDivElement) {
  const {startx, ypositionmiddle, color, strokewidth} = drawParameters;

  const sensorDef = sensorHandler.findSensorDefinition(this);
  if (type != "actual" || !sensor.lastState || !sensorDef.compareState(sensor.lastState, state)) {
    console.trace('draw bubble', {state, expectedState, type, drawParameters})
    this.lastWifiState = state;
    let stateBubble = sensor.context.paper.text(startx, ypositionmiddle + 10, '\uf27a');
    stateBubble.attr({
      "font": "Font Awesome 5 Free",
      "stroke": color,
      "fill": color,
      "font-size": (strokewidth * 2) + "px"
    });

    stateBubble.node.style.fontFamily = '"Font Awesome 5 Free"';
    stateBubble.node.style.fontWeight = "bold";

    const showPopup = (event) => {
      if (!sensor.showingTooltip) {
        const bubbleHtmlElement = drawBubble();
        displayTooltip(event, bubbleHtmlElement);

        sensor.showingTooltip = true;
      }
    }

    $(stateBubble.node).mouseenter(showPopup);
    $(stateBubble.node).click(showPopup);

    $(stateBubble.node).mouseleave((event) => {
      sensor.showingTooltip = false;
      $('#screentooltip').remove();
    });

    drawParameters.drawnElements.push(stateBubble);
    sensor.context.sensorStates.push(stateBubble);
  } else {
    drawParameters.deleteLastDrawnElements = false;
  }
}

function displayTooltip(event: MouseEvent, mainDiv: HTMLDivElement) {
  $("body").append('<div id="screentooltip"></div>');

  $('#screentooltip')
    .css("position", "absolute")
    .css("border", "1px solid gray")
    .css("background-color", "#efefef")
    .css("padding", "3px")
    .css("z-index", "1000")
    .css("left", event.clientX+2).css("top", event.clientY+2)
    .append(mainDiv);
}
