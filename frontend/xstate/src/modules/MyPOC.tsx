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

const nariUltimateStateMachine = Machine({
  id: "device",
  type: "parallel",
  initial: "idle",
  context: {
    configuration: {},
    spatialAudioDemo: {
      abortController: new AbortController(),
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
              requestLocks(context.spatialAudioDemo.abortController),
            onDone: {
              target: "playing",
            },
            onError: {
              target: "idle",
              actions: () => {
                console.log("error");
              },
            },
          },
        },
        playing: {
          on: {
            thxSpatialAudioDemo_COMPLETE: "idle",
          },
        },
      },
    },
    mixerUI: {
      initial: "idle",
      states: {
        idle: {
          on: {
            thxSpatialAudioStatus: "enable",
          },
        },
        enable: {
          on: {
            thxSpatialAudioStatus_ENABLE: "idle",
          },
        },
      },
    },
  },
});

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
