import "./style.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, send, sendParent ,Machine, spawn, interpret, actions} from "xstate";
import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";

import StateNode from "./components/StateNode";
import InvokingService from "./components/InvokingService";
import MyPOCUI from "./modules/MyPOC";
const { respond, raise} = actions;

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false
});

function App() {


  return (
    <div className="App">
      <MyPOCUI></MyPOCUI>
      <StateNode></StateNode>
      <InvokingService></InvokingService>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
