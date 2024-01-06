import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import { Background } from "./components/background";

const App = () => (
  <div className="absolute">
    <Background/>
    aas
  </div>
);
ReactDOM.render(<App />, document.getElementById("app"));
