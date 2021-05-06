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

const { choose, log } = actions;

const { respond, raise } = actions;

//@ts-nocheck
const requestLocks = async (abortController: AbortController | undefined) => {
  if (abortController) {
    const { held } = await navigator.locks.query();

    const runningExclusiveLock = held?.find(
      (runningLock: any) =>
        runningLock.name === "rzDoorLock" && runningLock.mode === "exclusive"
    );

    if (runningExclusiveLock) {
      return Promise.reject(false);
    }

    return new Promise((outterResolve, outterReject) => {
      window.navigator.locks
        .request(
          "rz_global_lock",
          { mode: "shared", ifAvailable: true },
          (globalLock: any) => {
            if (globalLock) {
              return window.navigator.locks.request(
                "rz_device_lock",
                { mode: "shared", ifAvailable: true },
                (deviceLock: any) => {
                  if (deviceLock) {
                    return new Promise((resolve) => {
                      abortController?.signal?.addEventListener("abort", () => {
                        resolve(1);
                      });

                      outterResolve(1);
                    });
                  } else {
                    return Promise.reject(0);
                  }
                }
              );
            } else {
              return Promise.reject(0);
            }
          }
        )
        .catch((_result: any) => {
          outterReject(0);
        });
    });
  } else {
    return Promise.reject(0);
  }
};

const maybeDoThese = choose([
  {
    cond: "txhSpatialAudioPlaying_GUARD",
    actions: [
      // selected when "cond1" is true
    ],
  },
  {
    cond: "cond2",
    actions: [
      // selected when "cond1" is false and "cond2" is true
      log((context, event) => {
        /* ... */
      }),
      log("another action"),
    ],
  },
  {
    cond: (context, event) => {
      // some condition
      return false;
    },
    actions: [
      // selected when "cond1" and "cond2" are false and the inline `cond` is true
      (context, event) => {
        // some other action
      },
    ],
  },
  {
    actions: [
      log("fall-through action"),
      // selected when "cond1", "cond2", and "cond3" are false
    ],
  },
]);

const nariUltimateStateMachine = Machine(
  {
    id: "device",
    type: "parallel",
    initial: "idle",
    context: {
      soundUI: {
        spatialAudioDemo: {
          abortController: new AbortController(),
          thxSpatialAudioDemo: "stereo",
          thxSpatialAudioDemoSteroPlaying: false,
          thxSpatialAudioDemoSurrondSoundPlaying: false,
        },
      },
      mixerUI: {
        thxSpatialAudioStatus: true,
        thxSpatialAduioPlaying: false,
      },
    },
    states: {
      soundUI: {
        initial: "idle",
        states: {
          idle: {
            on: {
              thxSpatialAudioDemo: "requestingLock",
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.soundUI.spatialAudioDemo.abortController),
              onDone: [
                {
                  target: "stereoPlaying",
                  cond: (context) => {
                    return (
                      context.soundUI.spatialAudioDemo.thxSpatialAudioDemo ===
                      "stereo"
                    );
                  },
                  actions: ["thxSpatialAudioDemoStereo_TOOGLE"]
                },
                {
                  target: "surroundSoundPlaying",
                  actions: ["thxSpatialAudioDemoStereo_TOOGLE"]
                },
              ],
              onError: {
                target: "idle",
                actions: () => {
                  console.log("error");
                },
              },
            },
          },
          stereoPlaying: {
            on: {
              thxSpatialAudioDemo_COMPLETE: {
                target: "idle",
                actions: ["thxSpatialAudioDemoStereo_TOOGLE"]
              },
            },
          },
          surroundSoundPlaying: {
            on: {
              thxSpatialAudioDemo_COMPLETE: {
                target: "idle",
                actions: ["thxSpatialAudioDemoStereo_TOOGLE"]
              },
            },
          },
        },
      },
      mixerUI: {
        initial: "idle",
        states: {
          idle: {
            on: {
              thxSpatialAudioStatus: {
                target: "thxSpatialAudioStatus",
                actions: ["thxSpatialAudioStatus_TOOGLE"],
              },
              thxSpatialAudioCalibration: {
                target: "thxSpatialAudioCalibration",
                cond: "txhSpatialAudioPlayingFromMixerUI_GUARD",
                actions: ["thxSpatialAudioCalibration_TOOGLE"],
              },
            },
          },
          thxSpatialAudioStatus: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          thxSpatialAudioCalibration: {
            on: {
              completed: [
                {
                  target: "idle",
                  actions: ["thxSpatialAudioCalibration_TOOGLE"],
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    actions: {
      thxSpatialAudioStatus_TOOGLE: (context, event) => {
        console.log(event);
        context.mixerUI.thxSpatialAudioStatus = !context.mixerUI
          .thxSpatialAudioStatus;
      },
      thxSpatialAudioDemoStereo_TOOGLE: (context, event) => {
        context.soundUI.spatialAudioDemo.thxSpatialAudioDemoSteroPlaying = !context
          .soundUI.spatialAudioDemo.thxSpatialAudioDemoSteroPlaying;
      },
      thxSpatialAudioDemoSurroundSound_TOOGLE: (context, event) => {
        context.soundUI.spatialAudioDemo.thxSpatialAudioDemoSurrondSoundPlaying = !context
          .soundUI.spatialAudioDemo.thxSpatialAudioDemoSurrondSoundPlaying;
      },
      thxSpatialAudioCalibration_TOOGLE: (context, event) => {
        context.mixerUI.thxSpatialAduioPlaying = !context.mixerUI
          .thxSpatialAduioPlaying;
      },
    },
    guards: {
      txhSpatialAudioPlaying_GUARD: (context, event) => {
        if (
          context.soundUI.spatialAudioDemo.thxSpatialAudioDemoSteroPlaying ||
          context.soundUI.spatialAudioDemo
            .thxSpatialAudioDemoSurrondSoundPlaying ||
          context.mixerUI.thxSpatialAduioPlaying
        ) {
          return false;
        }
        return true;
      },

      txhSpatialAudioPlayingFromMixerUI_GUARD: (context) => {
        if (
          context.soundUI.spatialAudioDemo.thxSpatialAudioDemoSteroPlaying ||
          context.soundUI.spatialAudioDemo
            .thxSpatialAudioDemoSurrondSoundPlaying
        ) {
          return false;
        }
        return true;
      },
    },
  }
);

function MyPOCUI() {
  const service = interpret(nariUltimateStateMachine, { devTools: true })
    .onTransition((state) => console.log(state.value, state.context))
    .start();

  return (
    <div className="StateNode">
      <h1>My POC</h1>
      {/* <button onClick={() => service.send(["soundUI", "thxSpatialAudioDemo"])}>
        thxSpatialAudioDemo Start
      </button> */}
    </div>
  );
}

export default MyPOCUI;
