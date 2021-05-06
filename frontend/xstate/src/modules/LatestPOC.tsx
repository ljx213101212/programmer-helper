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

const requestLocks = async (abortController: AbortController | undefined) => {
  if (abortController) {
    const { held } = await navigator.locks.query();
    
    const runningExclusiveLock = held?.find(
      (runningLock: any) =>
        runningLock.name === 'rzDoorLock' &&
        runningLock.mode === 'exclusive'
    );

    if (runningExclusiveLock) {
      return Promise.reject(false)
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

const deviceStateMachine = Machine<any>(
  {
    id: "device",
    type: "parallel",
    context: {
      configuration: {
        otfs: {
          clutch: false,
          otfm: false,
          calibration: false,
        },
        clutch: {
          otfs: false,
          otfm: false,
          calibration: false,
        },
        otfm: {
          otfs: false,
          clutch: false,
          calibration: false,
        },
        calibration: {
          otfs: false,
          clutch: false,
          otfm: false,
        },
        brightness: {
          otfm: false,
        },
        stages: {
          otfs: false,
        }
      },
      lighting: {
        abortController: undefined,
        targetState: "",
      },
      dpi: {
        abortController: undefined,
        targetState: "",
      },
      pollingRate: {
        abortController: undefined,
        targetState: "",
      },
      calibration: {
        abortController: undefined,
      },
      otfm: {
        abortController: undefined,
      },
    },
    states: {
      lighting: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.lighting.abortController) {
                (context.lighting.abortController as any)?.abort();
              }
            },
            on: {
              brightness: {
                actions: assign<any>({
                  lighting: {
                    abortController: new AbortController(),
                    targetState: "brightness",
                  },
                }),
                target: "requestingLock",
                cond: "stateGuard",
              },
              switchOffSetting: {
                actions: assign<any>({
                  lighting: {
                    abortController: new AbortController(),
                    targetState: "switchOffSetting",
                  },
                }),
                target: "requestingLock",
              },
              effects: {
                actions: assign<any>({
                  lighting: {
                    abortController: new AbortController(),
                    targetState: "effects",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) => requestLocks(context.lighting.abortController),
              onDone: [
                {
                  target: "brightness",
                  cond: (context) => {
                    return context.lighting.targetState === "brightness";
                  },
                },
                {
                  target: "switchOffSetting",
                  cond: (context) => {
                    return context.lighting.targetState === "switchOffSetting";
                  },
                },
                {
                  target: "effects",
                  cond: (context) => {
                    return context.lighting.targetState === "effects";
                  },
                },
                {
                  target: "idle",
                },
              ],
              onError: {
                target: "idle",
              },
            },
          },
          brightness: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSetting: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          effects: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      dpi: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.dpi.abortController) {
                (context.dpi.abortController as any)?.abort();
              }
            },
            on: {
              otfs: {
                actions: assign<any>({
                  dpi: {
                    abortController: new AbortController(),
                    targetState: "otfs",
                  },
                }),
                target: "requestingLock",
                cond: "stateGuard",
              },
              clutch: {
                actions: assign<any>({
                  dpi: {
                    abortController: new AbortController(),
                    targetState: "clutch",
                  },
                }),
                target: "requestingLock",
              },
              stages: {
                actions: assign<any>({
                  dpi: {
                    abortController: new AbortController(),
                    targetState: "stages",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) => requestLocks(context.dpi.abortController),
              onDone: [
                {
                  target: "otfs",
                  cond: (context) => {
                    return context.dpi.targetState === "otfs";
                  },
                },
                {
                  target: "clutch",
                  cond: (context) => {
                    return context.dpi.targetState === "clutch";
                  },
                },
                {
                  target: "stages",
                  cond: (context) => {
                    return context.dpi.targetState === "stages";
                  },
                },
                {
                  target: "idle",
                },
              ],
              onError: {
                target: "idle",
              },
            },
          },
          otfs: {
            on: {
              clutch: {
                target: "otfs_clutch",
                cond: "stateGuard",
              },
              otfs_off: {
                target: "idle",
              },
              stages: {
                target: "otfs_stages",
                cond: "stateGuard",
              },
            },
          },
          clutch: {
            on: {
              otfs: {
                target: "clutch_otfs",
                cond: "stateGuard",
              },
              clutch_off: {
                target: "idle",
              },
            },
          },
          stages: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          otfs_stages: {
            on: {
              completed: [
                {
                  target: "otfs",
                },
              ],
            },
          },
          otfs_clutch: {
            on: {
              otfs_off: {
                target: "clutch",
              },
              clutch_off: {
                target: "otfs",
              },
            },
          },
          clutch_otfs: {
            on: {
              otfs_off: {
                target: "clutch",
              },
              clutch_off: {
                target: "otfs",
              },
            },
          },
        },
      },
      pollingRate: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.pollingRate.abortController) {
                (context.pollingRate.abortController as any)?.abort();
              }
            },
            on: {
              pollingRate: {
                actions: assign<any>({
                  pollingRate: {
                    abortController: new AbortController(),
                    targetState: "pollingRate",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.pollingRate.abortController),
              onDone: [
                {
                  target: "pollingRateSetting",
                  cond: (context) => {
                    return context.pollingRate.targetState === "pollingRate";
                  },
                },
                {
                  target: "idle",
                },
              ],
              onError: {
                target: "idle",
              },
            },
          },
          pollingRateSetting: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      calibration: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.calibration.abortController) {
                (context.calibration.abortController as any)?.abort();
              }
            },
            on: {
              calibration: {
                actions: assign<any>({
                  calibration: {
                    abortController: new AbortController(),
                  },
                }),
                target: "requestingLock",
                cond: "stateGuard",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.calibration.abortController),
              onDone: [
                {
                  target: "calibration",
                },
                {
                  target: "idle",
                },
              ],
              onError: {
                target: "idle",
              },
            },
          },
          calibration: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      otfm: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.otfm.abortController) {
                (context.otfm.abortController as any)?.abort();
              }
            },
            on: {
              otfm: {
                actions: assign<any>({
                  otfm: {
                    abortController: new AbortController(),
                  },
                }),
                target: "requestingLock",
                cond: "stateGuard",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) => requestLocks(context.otfm.abortController),
              onDone: [
                {
                  target: "otfm",
                },
                {
                  target: "idle",
                },
              ],
              onError: {
                target: "idle",
              },
            },
          },
          otfm: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    guards: {
      stateGuard: (context, event, meta) => {
        console.log("log:", context, event, meta);
        const eventTypeConfiguration = context.configuration[event.type];
        const featureStates = meta.state.value as Record<string, any>;
        if (eventTypeConfiguration) {
          for (let key of Object.keys(featureStates)) {
            console.log(
              event.type,
              featureStates[key],
              eventTypeConfiguration[featureStates[key]]
            );
            if (
              eventTypeConfiguration[featureStates[key]] === undefined ||
              eventTypeConfiguration[featureStates[key]] === true
            ) {
              continue;
            } else {
              return false;
            }
          }
        }

        return true;
      },
    },
  }
);
function LatestPOCUI() {
  const service = interpret(deviceStateMachine, { devTools: true })
    .onTransition((state) => console.log(state.value, state.context))
    .start();

  return (
    <div className="StateNode">
      <h1>Latest POC</h1>

      <button onClick={() => service.send(["clutch", "key_down"])}>
        Hold clutch
      </button>
      <button onClick={() => service.send(["clutch", "key_up"])}>
        Release clutch
      </button>

      <button onClick={() => service.send(["idle", "customizeUI"])}>
        Go to customizeUI page.
      </button>

      <button onClick={() => service.send(["customizeUI", "keyMapping"])}>
        Do any keyMapping.
      </button>
    </div>
  );
}

export default LatestPOCUI;
