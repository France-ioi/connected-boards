import React from "react";
import {QuickalgoLibrary} from "../definitions";

export const QuickalgoContext =
  React.createContext<QuickalgoLibrary | null>(null);
