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
      lighting: {
        abortController: undefined,
        targetState: "",
      },
      power: {
        abortController: undefined,
        targetState: "",
      },
      mic: {
        abortController: undefined,
        targetState: "",
      }
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
      },
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
      power: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.power.abortController) {
                (context.power.abortController as any)?.abort();
              }
            },
            on: {
              powerSaving: {
                actions: assign<any>({
                  power: {
                    abortController: new AbortController(),
                    targetState: "powerSaving",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSetting: {
                actions: assign<any>({
                  power: {
                    abortController: new AbortController(),
                    targetState: "switchOffSetting",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) => requestLocks(context.power.abortController),
              onDone: [
                {
                  target: "powerSaving",
                  cond: (context) => {
                    return context.power.targetState === "powerSaving";
                  },
                },
                {
                  target: "switchOffSetting",
                  cond: (context) => {
                    return context.power.targetState === "switchOffSetting";
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
          powerSaving: {
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
        },
      },
      mic: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.mic.abortController) {
                (context.mic.abortController as any)?.abort();
              }
            },
            on: {
              switchOffMicroPhoneSetting: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "switchOffMicroPhoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volume: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "volume",
                  },
                }),
                target: "requestingLock",
              },
             
              sensitivity: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "sensitivity",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSensitivitySetting: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "switchOffSensitivitySetting",
                  },
                }),
                target: "requestingLock",
              },
              sidetone: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "sidetone",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSidetoneSetting: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "switchOffSidetoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volumeNormalization: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "volumeNormalization",
                  },
                }),
                target: "requestingLock",
              },
              ambientNoiseReduction: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "ambientNoiseReduction",
                  },
                }),
                target: "requestingLock",
              },
              vocalClarity: {
                actions: assign<any>({
                  mic: {
                    abortController: new AbortController(),
                    targetState: "vocalClarity",
                  },
                }),
                target: "requestingLock",
              }
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context) => requestLocks(context.mic.abortController),
              onDone: [
                {
                  target: "switchOffMicroPhoneSetting",
                  cond: (context) => {
                    return context.mic.targetState === "switchOffMicroPhoneSetting";
                  },
                },
                {
                  target: "volume",
                  cond: (context) => {
                    return context.mic.targetState === "volume";
                  },
                },
                {
                  target: "sensitivity",
                  cond: (context) => {
                    return context.mic.targetState === "sensitivity";
                  },
                },
                {
                  target: "switchOffSensitivitySetting",
                  cond: (context) => {
                    return context.mic.targetState === "switchOffSensitivitySetting";
                  },
                },
                {
                  target: "sidetone",
                  cond: (context) => {
                    return context.mic.targetState === "sidetone";
                  },
                },
                {
                  target: "switchOffSidetoneSetting",
                  cond: (context) => {
                    return context.mic.targetState === "switchOffSidetoneSetting";
                  },
                },
                {
                  target: "volumeNormalization",
                  cond: (context) => {
                    return context.mic.targetState === "volumeNormalization";
                  },
                },
                {
                  target: "ambientNoiseReduction",
                  cond: (context) => {
                    return context.mic.targetState === "ambientNoiseReduction";
                  },
                },
                {
                  target: "vocalClarity",
                  cond: (context) => {
                    return context.mic.targetState === "vocalClarity";
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

          switchOffMicroPhoneSetting: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          volume: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          sensitivity: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSensitivitySetting: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          sidetone: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSidetoneSetting: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          volumeNormalization: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          ambientNoiseReduction: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
          vocalClarity: {
            on: {
              completed: [
                {
                  target: "idle",
                },
              ],
            },
          },
        }
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
