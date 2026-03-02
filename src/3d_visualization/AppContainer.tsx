import React from 'react';
import {ThreeDimensionVisualizationApp} from "./App";
import {ShadowRoot} from "./ShadowRoot";
import {QuickalgoLibrary} from "../definitions";
import { QuickalgoContext } from "./QuickalgoContext";

const AppContainer: React.FC = ({context}: {context: QuickalgoLibrary}) => {
  return (
    <QuickalgoContext.Provider value={context}>
      <div style={{width: '100%', height: '100%', position: 'relative'}}>
        <div id="taskContent">
          <ShadowRoot>
            <ThreeDimensionVisualizationApp
              context={context}
            />
          </ShadowRoot>
          <div id="grid" style={{height: '150px'}}/>
        </div>
      </div>
    </QuickalgoContext.Provider>
  );
}

export default AppContainer;
