import React from 'react';
import {ThreeDimensionVisualizationApp} from "./App";
import {ShadowRoot} from "./ShadowRoot";
import {QuickalgoLibrary} from "../definitions";

const AppContainer: React.FC = ({context}: {context: QuickalgoLibrary}) => {
  return (
    <div style={{width: '100%', height: '100%', position: 'relative'}}>
      <div id="taskContent">
        <ShadowRoot>
          <ThreeDimensionVisualizationApp
            context={context}
          />
        </ShadowRoot>
        <div id="grid" style={{height: '100px'}}/>
      </div>
    </div>
  );
}

export default AppContainer;
