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


const nariUltimateStateMachine = Machine(
  {
    id: "device",
    type: "parallel",
    initial: "idle",
    context: {
      mixer: {
        abortController: undefined,
        targetState:"",
      },
      enhancement: {
        abortController: undefined,
        targetState:"",
      },
      equalizer: {
        abortController: undefined,
        targetState:"",
      },
    },
    states: {
      mixer: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.mixer.abortController) {
                context.mixer.abortController?.abort();
              }
            },
            on: {
              switchOffSpatialAudioSetting: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    mixer: {
                      abortController: new AbortController(),
                      targetState: "switchOffSpatialAudioSetting",
                    },
                  }
                }),
                target: "requestingLock"
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.mixer.abortController),
              onDone: [
                {
                  target: "switchOffSpatialAudioSetting",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.mixer.targetState === "switchOffSpatialAudioSetting";
                  },
                },
              ],
              onError: {
                target: "idle",
                actions: () => {
                  console.log("requestingLock error");
                },
              },
            },
          },
          switchOffSpatialAudioSetting: {
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
      enhancement: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.enhancement.abortController) {
                context.enhancement.abortController?.abort();
              }
            },
            on: {
              bassboost: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "bassboost",
                    },
                  }
                }),
                target: "requestingLock"

              },
              switchOffBassBoostSetting: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "switchOffBassBoostSetting",
                    },
                  }
                }),
                target: "requestingLock"
              },

              voiceClarity: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "voiceClarity",
                    },
                  }
                }),
                target: "requestingLock"
              },
              switchOffVoiceClaritySetting: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "switchOffVoiceClaritySetting",
                    },
                  }
                }),
                target: "requestingLock"
              },

              soundNormalization: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "soundNormalization",
                    },
                  }
                }),
                target: "requestingLock"
              },
              switchOffSoundNormalizationSetting: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "switchOffSoundNormalizationSetting",
                    },
                  }
                }),
                target: "requestingLock"
              },

              hapticIntensity: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "hapticIntensity",
                    },
                  }
                }),
                target: "requestingLock"
              },
              switchOffHapticIntensitySetting: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    enhancement: {
                      abortController: new AbortController(),
                      targetState: "switchOffHapticIntensitySetting",
                    },
                  }
                }),
                target: "requestingLock"
              },


            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.enhancement.abortController),
              onDone: [
                {
                  target: "bassboost",
                  cond: (context, event, meta) => {
                   console.log(meta)
                    return context.enhancement.targetState === "bassboost";
                  },
                },
                {
                  target: "switchOffBassBoostSetting",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "switchOffBassBoostSetting";
                  },
                },
                {
                  target: "voiceClarity",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "voiceClarity";
                  },
                },
                {
                  target: "switchOffVoiceClaritySetting",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "switchOffVoiceClaritySetting";
                  },
                },
                {
                  target: "soundNormalization",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "soundNormalization";
                  },
                },
                {
                  target: "switchOffSoundNormalizationSetting",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "switchOffSoundNormalizationSetting";
                  },
                }, 

                {
                  target: "hapticIntensity",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "hapticIntensity";
                  },
                },
                {
                  target: "switchOffHapticIntensitySetting",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.enhancement.targetState === "switchOffHapticIntensitySetting";
                  },
                }, 
              ],
              onError: {
                target: "idle",
                actions: () => {
                  console.log("requestingLock error");
                },
              },
            },
          },
          bassboost: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          switchOffBassBoostSetting: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          voiceClarity: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          switchOffVoiceClaritySetting: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          soundNormalization: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          switchOffSoundNormalizationSetting: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          hapticIntensity: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          },
          switchOffHapticIntensitySetting: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          }
        }
      },
      equalizer: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.equalizer.abortController) {
                context.equalizer.abortController?.abort();
              }
            },
            on: {
              equalizer: {
                actions: assign<any>(ctx => {
                  return {
                    ...ctx,
                    equalizer: {
                      abortController: new AbortController(),
                      targetState: "equalizer",
                    },
                  }
                }),
                target: "requestingLock"
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) =>
                requestLocks(context.equalizer.abortController),
              onDone: [
                {
                  target: "equalizer",
                  cond: (context, event, meta) => {
                    console.log(meta)
                    return context.equalizer.targetState === "equalizer";
                  },
                },
              ],
              onError: {
                target: "idle",
                actions: () => {
                  console.log("requestingLock error");
                },
              },
            },
          },
          equalizer: {
            on: {
              completed: [
                {
                  target: "idle"
                }
              ]
            }
          }
        },
      }
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
