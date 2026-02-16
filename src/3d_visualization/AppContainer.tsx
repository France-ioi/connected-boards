import React, {useEffect, useState} from 'react';
import {ThreeDimensionVisualizationApp} from "./App";

enum DisplayMode {
  ThreeDimension = '3d',
  Components = 'components',
}

const AppContainer: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ThreeDimension);
  const context = (window as any).quickAlgoLoadedLibraries.getContext(null, 'main');

  useEffect(() => {
    context.displayMode = displayMode;
    context.recreateDisplay = true;
    context.resetDisplay();
  }, [displayMode]);

  return (
    <div className="w-full h-full relative">
      {DisplayMode.ThreeDimension === displayMode ?
        <ThreeDimensionVisualizationApp/>
        :
        <div id="taskContent">
          <div id="taskIntro"/>
          <div id="testSelector">
            <div id="grid"/>
          </div>
        </div>
      }

      <div className={`
        absolute top-2 right-2 z-[200] cursor-pointer
      `} onClick={() => setDisplayMode(DisplayMode.ThreeDimension === displayMode ? DisplayMode.Components : DisplayMode.ThreeDimension)}
      >
        Change
      </div>
    </div>
  )
}

export default AppContainer;
