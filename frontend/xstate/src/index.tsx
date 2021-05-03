import "./style.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, send, sendParent ,Machine, spawn, interpret, actions} from "xstate";
import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";

import StateNode from "./components/StateNode";
import InvokingService from "./components/InvokingService";
const { respond, raise} = actions;

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false
});

const holdMachine = Machine(
  {
    id: "hold",
    type: "parallel",
    states: {
      clutch: {
        initial: "inactive",
        on: {
          clutch_off: [
            {
              target: ".inactive",
              in: "#hold.clutch.active",
            },
            { actions: respond("respond") },
          ],
          clutch_on: [
            {
              target: ".active",
              in: "#hold.clutch.inactive",
            },
            { actions: respond("respond") },
          ],
        },
        states: {
          active: {
            entry: ["clutchKeyDown", respond("respond")],
          },
          inactive: {
            entry: ["clutchKeyUp", sendParent("respond")],
          },
        },
      },
      otfs: {
        initial: "inactive",
        on: {
          otfs_off: [
            {
              target: ".inactive",
              in: "#hold.otfs.active",
            },
            { actions: respond("respond") },
          ],
          otfs_on: [
            {
              target: ".active",
              in: "#hold.otfs.inactive",
            },
            { actions: respond("respond") },
          ],
        },
        states: {
          active: {
            entry: ["otfsKeyDown", respond("respond")],
          },
          inactive: {
            entry: ["otfsKeyUp", sendParent("respond")],
          },
        },
      },
      otfm: {
        initial: "inactive",
        on: {
          otfm_off: [
            { target: ".inactive", in: "#hold.otfm.active" },
            { actions: respond("respond") },
          ],
          otfm_on: [
            {
              target: ".active",
              in: "#hold.otfm.inactive",
            },
            { actions: respond("respond") },
          ],
        },
        states: {
          active: {
            entry: ["otfmKeyDown", respond("respond")],
          },
          inactive: {
            entry: ["otfmKeyUp", sendParent("respond")],
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
      otfsKeyDown: (context, event) => {
        console.log("otfs key down inner");
      },
      otfsKeyUp: (context, event) => {
        console.log("otfs key up inner");
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
          pollingRateUI: [
            {
              target: "pollingRateUI",
              cond: { type: "pollingRateUIGuard" },
            },
            { target: ".invalid" },
          ],
          clutch: {
            target: "clutch",
          },
          otfs: {
            target: "otfs",
          },
          otfm: {
            target: "otfm",
          },
        },
        initial: "normal",
        states: {
          normal: {},
          invalid: {
            entry: ["notifyFail"],
            onDone: "normal"
          },
        },
      },
      clutch: {
        on: {
          start: [
            {
              actions: send("clutch_on", {
                to: (context: any) => context.holdMachine,
              }),
              cond: { type: "isClutchAllowed" },
            },
            { actions: raise("notAllowed") },
          ],
          end: {
            actions: send("clutch_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          respond: {
            target: "idle",
          },
          notAllowed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      otfs: {
        on: {
          start: [
            {
              actions: send("otfs_on", {
                to: (context: any) => context.holdMachine,
              }),
              cond: { type: "isOtfsAllowed" },
            },
            { actions: raise("notAllowed") },
          ],
          end: {
            actions: send("otfs_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          respond: {
            target: "idle",
          },
          notAllowed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      otfm: {
        on: {
          start: [
            {
              actions: send("otfm_on", {
                to: (context: any) => context.holdMachine,
              }),
              cond: { type: "isOtfmAllowed" },
            },
            { actions: raise("notAllowed") },
          ],
          end: {
            actions: send("otfm_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          respond: {
            target: "idle",
          },
          notAllowed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      dpiUI: {
        entry: ["processDPI"],
        onDone: "idle",
      },
      pollingRateUI: {
        entry: ["processPollingRate"],
        onDone: "idle",
      },
    },
  },
  {
    actions: {
      notifyFail: (context, event) => {
        console.log("fail");
      },
      notifyDone: (context, event) => {
        console.log("done");
      },
      processDPI: (context, event) => {
        console.log("process dpi");
      },
      processPollingRate: (context, event) => {
        console.log("process polling rate");
      },
    },
    guards: {
      dpiUIGuard: (context: any, event: any) => {
        const { clutch, otfs, otfm } = context.holdMachine.state.value;
        if (clutch === "active" || otfs === "active" || otfm === "active") {
          return false;
        }
        return true;
      },
      pollingRateUIGuard: (context: any, event: any) => {
        const { otfm } = context.holdMachine.state.value;
        if (otfm === "active") {
          return false;
        }
        return true;
      },
      isClutchAllowed: (context: any, event: any) => {
        const { otfm, otfs } = context.holdMachine.state.value;
        if (otfm === "active" || otfs === "active") {
          return false;
        }
        return true;
      },
      isOtfsAllowed: (context: any, event: any) => {
        const { clutch, otfm } = context.holdMachine.state.value;
        if (otfm === "active" || clutch === "active") {
          return false;
        }
        return true;
      },
      isOtfmAllowed: (context: any, event: any) => {
        const { clutch, otfs } = context.holdMachine.state.value;
        if (otfs === "active" || clutch === "active") {
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

  const service = interpret(deviceStateMachine, { devTools: true })
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
