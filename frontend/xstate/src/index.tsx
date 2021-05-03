import "./style.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, send, Machine, spawn, interpret, State } from "xstate";
import { useMachine } from "@xstate/react";

import StateNode from "./components/StateNode";
import InvokingService from "./components/InvokingService";

const holdMachine = Machine(
  {
    id: "hold",
    type: "parallel",
    states: {
      clutch: {
        initial: "inactive",
        states: {
          active: {
            entry: ["clutchKeyDown"],
            on: {
              clutch_off: "inactive",
            },
          },
          inactive: {
            entry: ["clutchKeyUp"],
            on: {
              clutch_on: "active",
            },
          },
        },
      },
      otfs: {
        initial: "inactive",
        states: {
          active: {
            on: {
              otfs_off: "inactive",
            },
          },
          inactive: {
            on: {
              otfs_on: "active",
            },
          },
        },
      },
    },
  },
  {
    actions: {
      clutchKeyDown: (context, event) => {
        console.log("clutch key down inner");
      },
      clutchKeyUp: (context, event) => {
        console.log("clutch key up inner");
      },
    },
  }
);
const deviceStateMachine = Machine(
  {
    id: "device",
    initial: "starting",
    context: {
      holdMachine: null,
    },
    states: {
      starting: {
        entry: assign<any>({
          holdMachine: () => spawn(holdMachine),
        }),
        always: "idle",
      },
      idle: {
        on: {
          dpiUI: [
            {
              target: "dpiUI",
              cond: { type: "dpiUIGuard" },
            },
            { target: ".invalid" },
          ],
          clutch: {
            target: "clutch",
          },
        },
        initial: "normal",
        states: {
          normal: {},
          invalid: {
            entry: ["notifyFail"],
          },
        },
      },
      clutch: {
        initial: "processing",
        on: {
          key_down: {
            actions: send("clutch_on", {
              to: (context: any) => {
                console.log(context);
                return context.holdMachine;
              },
            }),
            target: ".completed",
          },
          key_up: {
            actions: send("clutch_off", {
              to: (context: any) => context.holdMachine,
            }),
            target: ".completed",
          },
        },
        states: {
          processing: {},
          completed: {
            type: "final",
          },
        },
        onDone: {
          target: "idle",
          actions: ["notifyDone"],
        },
      },
      dpiUI: {
        entry: ["processDPI"],
        onDone: "idle",
        on: {
          idle: {
            target: "idle",
          },
        },
      },
    },
  },
  {
    actions: {
      notifyFail: (context, event) => {
        console.log("fail");
      },
      notifyDone: (context, event) => {
        console.log("event:", event.type, "context:", context);
      },
      processDPI: (context, event) => {
        console.log("process dpi");
      },
    },
    guards: {
      dpiUIGuard: (context: any, event: any) => {
        const { clutch, otfs } = context.holdMachine.state.value;
        if (clutch === "active" || otfs === "active") {
          return false;
        }
        return true;
      },
    },
  }
);

function App() {
  const [current, send] = useMachine(deviceStateMachine);
  const active = current.matches("active");
  const { dpi } = current.context;

  const service = interpret(deviceStateMachine)
  .onTransition((state) => console.log(state.value, state.context))
  .start();

  return (
    <div className="App">
      <h1>XState React Template</h1>

     <button onClick={() => service.send(['clutch', 'key_down'])}>
        Hold clutch
      </button>
      <button onClick={() => service.send(['clutch', 'key_up'])}>
        Release clutch
      </button>
      {/* <button onClick={() => service.send(['dpiUI', 'processDPI'])}>
         Process DPI
      </button>

      <button onClick={() => service.send(['dpiUI', 'notifyDone'])}>
         Process DPI DONE
      </button> */}
      <StateNode></StateNode>
      <InvokingService></InvokingService>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
