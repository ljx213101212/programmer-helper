import * as React from "react";
import {
  assign,
  send,
  sendParent,
  Machine,
  spawn,
  interpret,
  actions,
} from "xstate";

const { respond, raise } = actions;

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
            { actions: respond("completed") },
          ],
          clutch_on: [
            {
              actions: respond("failed"),
              in: "#hold.otfs.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.otfm.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.calibration.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.macroRecorder.active",
            },
            {
              target: ".active",
              in: "#hold.clutch.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["clutchKeyDown", respond("completed")],
          },
          inactive: {
            entry: ["clutchKeyUp", respond("completed")],
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
            { actions: respond("completed") },
          ],
          otfs_on: [
            {
              actions: respond("failed"),
              in: "#hold.clutch.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.otfm.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.calibration.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.macroRecorder.active",
            },
            {
              target: ".active",
              in: "#hold.otfs.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["otfsKeyDown", respond("completed")],
          },
          inactive: {
            entry: ["otfsKeyUp", respond("completed")],
          },
        },
      },
      otfm: {
        initial: "inactive",
        on: {
          otfm_off: [
            { target: ".inactive", in: "#hold.otfm.active" },
            { actions: respond("completed") },
          ],
          otfm_on: [
            {
              actions: respond("failed"),
              in: "#hold.otfs.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.clutch.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.calibration.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.macroRecorder.active",
            },
            {
              target: ".active",
              in: "#hold.otfm.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["otfmKeyDown", respond("completed")],
          },
          inactive: {
            entry: ["otfmKeyUp", respond("completed")],
          },
        },
      },
      calibration: {
        initial: "inactive",
        on: {
          calibration_off: [
            { target: ".inactive", in: "#hold.calibration.active" },
            { actions: respond("completed") },
          ],
          calibration_on: [
            {
              actions: respond("failed"),
              in: "#hold.otfs.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.clutch.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.otfm.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.macroRecorder.active",
            },
            {
              target: ".active",
              in: "#hold.calibration.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["calibrationStart", respond("completed")],
          },
          inactive: {
            entry: ["calibrationEnd", respond("completed")],
          },
        },
      },
      macroRecorder: {
        initial: "inactive",
        on: {
          macroRecorder_off: [
            { target: ".inactive", in: "#hold.macroRecorder.active" },
            { actions: respond("completed") },
          ],
          macroRecorder_on: [
            {
              actions: respond("failed"),
              in: "#hold.otfs.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.clutch.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.otfm.active",
            },
            {
              actions: respond("failed"),
              in: "#hold.calibration.active",
            },
            {
              target: ".active",
              in: "#hold.macroRecorder.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["macroRecorderStart", respond("completed")],
          },
          inactive: {
            entry: ["macroRecorderEnd", respond("completed")],
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
      otfmKeyDown: (context, event) => {
        console.log("otfm key down inner");
      },
      otfmKeyUp: (context, event) => {
        console.log("otfm key up inner");
      },
      calibrationStart: (context, event) => {
        console.log("calibration start inner");
      },
      calibrationEnd: (context, event) => {
        console.log("calibration end inner");
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
          customizeUI: {
            target: "customizeUI",
          },
          performanceUI: {
            target: "performanceUI",
          },
          lightingUI: {
            target: "lightingUI",
          },
          clutch: {
            target: "clutch",
          },
          otfs: {
            target: "otfs",
          },
          otfm: {
            target: "otfm",
          },
          switchProfile: {
            target: "switchProfile",
          }
        },
      },
      customizeUI: {
        on: {
          keyMapping: [
            {
              actions: ["processkeyMapping", raise("completed")],
              cond: { type: "keyMappingGuard" },
            },
            { actions: raise("failed") },
          ],
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      performanceUI: {
        on: {
          dpi: [
            {
              actions: ["processDPI", raise("completed")],
              cond: { type: "dpiUIGuard" },
            },
            { actions: raise("failed") },
          ],
          pollingRate: [
            {
              actions: ["processPollingRate", raise("completed")],
              cond: { type: "pollingRateUIGuard" },
            },
            { actions: raise("failed") },
          ],
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      lightingUI: {
        on: {
          brightness: [
            {
              actions: ["processBrightness", raise("completed")],
              cond: { type: "brightnessUIGuard" },
            },
            { actions: raise("failed") },
          ],
          offLightingSetting: [
            {
              actions: ["processSwitchOffSetting", raise("completed")],
              cond: { type: "offLightingSettingGuard" },
            },
            { actions: raise("failed") },
          ],
          lightingEffects: [
            {
              actions: ["processLightingEffects", raise("completed")],
              cond: { type: "lightingEffectsGuard" },
            },
            { actions: raise("failed") },
          ],
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      calibration: {
        on: {
          start: [
            {
              actions: send("calibration_on", {
                to: (context: any) => context.holdMachine,
              }),
              cond: { type: "isCalibrationAllowed" },
            },
            { actions: raise("failed") },
          ],
          end: {
            actions: send("calibration_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
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
            { actions: raise("failed") },
          ],
          end: {
            actions: send("clutch_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          completed: {
            target: "idle",
          },
          failed: {
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
            { actions: raise("failed") },
          ],
          end: {
            actions: send("otfs_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          completed: {
            target: "idle",
          },
          failed: {
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
            { actions: raise("failed") },
          ],
          end: {
            actions: send("otfm_off", {
              to: (context: any) => context.holdMachine,
            }),
          },
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      },
      switchProfile: {
        on: {
          switchProfile: [
            {
              actions: ["processswitchProfile", raise("completed")],
              cond: { type: "switchProfileGuard" },
            },
            { actions: raise("failed") },
          ],
          completed: {
            target: "idle",
          },
          failed: {
            actions: ["notifyFail"],
            target: "idle",
          },
        },
      }
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
      processBrightness: (context, event) => {
        console.log("process brightness");
      },
      processKeyMapping: (context, event) => {
        console.log("process key mapping");
      },
    },
    guards: {
      keyMappingGuard: (context: any, event: any) => {
        return true;
      },
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
      brightnessUIGuard: (context: any, event: any) => {
        return true;
      },
      offLightingSettingGuard: (context: any, event: any) => {
        return true;
      },
      lightingEffectsGuard: (context: any, event: any) => {
        return true;
      },
      isCalibrationAllowed: (context: any, event: any) => {
        const { otfm, otfs, clutch } = context.holdMachine.state.value;
        if (otfm === "active" || otfs === "active" || clutch === "active") {
          return false;
        }
        return true;
      },
      isClutchAllowed: (context: any, event: any) => {
        const { otfm, otfs, calibration } = context.holdMachine.state.value;
        if (otfm === "active" || otfs === "active" || calibration === "active") {
          return false;
        }
        return true;
      },
      isOtfsAllowed: (context: any, event: any) => {
        const { clutch, otfm, calibration } = context.holdMachine.state.value;
        if (otfm === "active" || clutch === "active" || calibration === "active") {
          return false;
        }
        return true;
      },
      isOtfmAllowed: (context: any, event: any) => {
        const { clutch, otfs, calibration } = context.holdMachine.state.value;
        if (otfs === "active" || clutch === "active" || calibration === "active") {
          return false;
        }
        return true;
      },
      switchProfileGuard: (context: any, event: any) => {
        const { clutch, otfs, otfm, calibration } = context.holdMachine.state.value;
        if (otfs === "active" || clutch === "active" || calibration === "active" || otfm === "active") {
          return false;
        }
        return true;
      },
    },
  }
);

function MyPOCUI() {
  const service = interpret(deviceStateMachine, { devTools: true })
    .onTransition((state) => console.log(state.value, state.context))
    .start();

  return (
    <div className="StateNode">
      <h1>My POC</h1>

      <button onClick={() => service.send(["clutch", "key_down"])}>
        Hold clutch
      </button>
      <button onClick={() => service.send(["clutch", "key_up"])}>
        Release clutch
      </button>
    </div>
  );
}

export default MyPOCUI;
