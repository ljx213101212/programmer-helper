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
declare global {
  interface Navigator {
    readonly locks: any;
  }
}

enum LockMode {
  "shared" = "shared",
  "exclusive" = "exclusive",
}

const GLOBAL_LOCK_NAME = "rz_global_lock";
const DEVICE_LOCK_NAME = "rz_doorLock_pid_eid_cid";

const REQUESTING_LOCK = "requestingLock";
const GET_LOCKS = "getLocks";

const requestLocks = async (timerTick: number, globalLockMode: LockMode, deviceLockMode: LockMode) => {
  return new Promise((outterResolve, outterReject) => {
    window.navigator.locks
      .request(
        GLOBAL_LOCK_NAME,
        { mode: globalLockMode, ifAvailable: true },
        (globalLock: any) => {
          if (globalLock) {
            return window.navigator.locks.request(
              DEVICE_LOCK_NAME,
              { mode: deviceLockMode, ifAvailable: true },
              (deviceLock: any) => {
                if (deviceLock) {
                  return new Promise((resolve) => {
                    outterResolve({ timerTick, resolve });
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
        outterReject({ timerTick });
      });
  });
};



// const stateReadLock = (state, initialState, subStates) => {


//    const idleSubStatesOn = () => {
//      let idleSubState: any = {};
//      subStates.forEach((element:any) => {
//         let subStateKey = element;
//         let subStateValue = {
//           actions: assign<any>((ctx) => {
//             return {
//               ...ctx,
//               [state]: {
//                 targetState: subStateKey,
//               },
//             };
//           }),
//           target: REQUESTING_LOCK,
//         };
//         // idleSubState = {...idleSubState, [subStateKey]:subStateValue}
//         idleSubState[subStateKey] = subStateValue;
//      });
//    }

//    const requestingLockOnDone = () => {
//      let onDoneArray:Array<any> = [];
  
//      subStates.forEach((element:any) => {
//       let onDoneItem:any = {
//         target: element,
//         actions: assign((context, event) => {
//           return {
//             [state]: {
//               ...context[state],
//               promiseResolve: event.data.resolve,
//             },
//           };
//         }),
//         cond: (context) => {
//           return context[state].targetState === element;
//         },
//       };
//       onDoneArray.push(onDoneItem);
//      });
//      return onDoneArray;
//    }

//    const requestingLockOnError = () => {
//      let onErrorObject = {
//         target: "idle",
//         actions: () => {
//           console.log("requestingLock error");
//         }
//      };
//      return onErrorObject;
//    }
 
//     return {
//       [state]: {
//         initial: initialState,
//         idle: {
//           entry: (context:any) => {
//             if (context[state].promiseResolve) {
//               context[state].promiseResolve(1);
//             }
//           },
//           on: idleSubStatesOn(),
//         },
//         requestingLock: {
//           invoke: {
//             id: GET_LOCKS,
//             src: (_context, event) =>
//               requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
//             onDone: requestingLockOnDone(),
//             onError: requestingLockOnError()
//           },
//         },
//       }
//     }
// }

const nariUltimateStateMachine = Machine(
  {
    id: "device",
    type: "parallel",
    initial: "idle",
    context: {
      isMicPreview: false,
      mixer: {
        promiseResolve: undefined,
        targetState: "",
      },
      enhancement: {
        promiseResolve: undefined,
        targetState: "",
      },
      equalizer: {
        promiseResolve: undefined,
        targetState: "",
      },
      lighting: {
        promiseResolve: undefined,
        targetState: "",
      },
      power: {
        promiseResolve: undefined,
        targetState: "",
      },
      mic: {
        promiseResolve: undefined,
        targetState: "",
        isMicOn: true,
      },
    },
    on: {
      "*": {
        actions: ["ignoreTask"],
      },
    },
    states: {
      mixer: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.mixer.promiseResolve) {
                context.mixer.promiseResolve(1);
              }
            },
            on: {
              switchOffSpatialAudioSetting: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    mixer: {
                      targetState: "switchOffSpatialAudioSetting",
                    },
                  };
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context, event) =>
                requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "switchOffSpatialAudioSetting",
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.mixer.targetState === "switchOffSpatialAudioSetting"
                    );
                  },
                  actions: assign<any>((context, event) => {
                    return {
                      mixer: {
                        ...context.mixer,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
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
              switchOffSpatialAudioSettingCompleted: [
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
              if (context.enhancement.promiseResolve) {
                context.enhancement.promiseResolve(1);
              }
            },
            on: {
              bassboost: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "bassboost",
                    },
                  };
                }),
                target: "requestingLock",
              },
              switchOffBassBoostSetting: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "switchOffBassBoostSetting",
                    },
                  };
                }),
                target: "requestingLock",
              },
              voiceClarity: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "voiceClarity",
                    },
                  };
                }),
                target: "requestingLock",
              },
              switchOffVoiceClaritySetting: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "switchOffVoiceClaritySetting",
                    },
                  };
                }),
                target: "requestingLock",
              },
              soundNormalization: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "soundNormalization",
                    },
                  };
                }),
                target: "requestingLock",
              },
              switchOffSoundNormalizationSetting: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "switchOffSoundNormalizationSetting",
                    },
                  };
                }),
                target: "requestingLock",
              },
              hapticIntensity: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "hapticIntensity",
                    },
                  };
                }),
                target: "requestingLock",
              },
              switchOffHapticIntensitySetting: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    enhancement: {
                      targetState: "switchOffHapticIntensitySetting",
                    },
                  };
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context, event) =>
                requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "bassboost",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return context.enhancement.targetState === "bassboost";
                  },
                },
                {
                  target: "switchOffBassBoostSetting",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState ===
                      "switchOffBassBoostSetting"
                    );
                  },
                },
                {
                  target: "voiceClarity",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return context.enhancement.targetState === "voiceClarity";
                  },
                },
                {
                  target: "switchOffVoiceClaritySetting",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState ===
                      "switchOffVoiceClaritySetting"
                    );
                  },
                },
                {
                  target: "soundNormalization",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState === "soundNormalization"
                    );
                  },
                },
                {
                  target: "switchOffSoundNormalizationSetting",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState ===
                      "switchOffSoundNormalizationSetting"
                    );
                  },
                },

                {
                  target: "hapticIntensity",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState === "hapticIntensity"
                    );
                  },
                },
                {
                  target: "switchOffHapticIntensitySetting",
                  actions: assign((context, event) => {
                    return {
                      enhancement: {
                        ...context.enhancement,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
                    return (
                      context.enhancement.targetState ===
                      "switchOffHapticIntensitySetting"
                    );
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
              bassboostCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffBassBoostSetting: {
            on: {
              switchOffBassBoostSettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          voiceClarity: {
            on: {
              voiceClarityCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffVoiceClaritySetting: {
            on: {
              switchOffVoiceClaritySettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          soundNormalization: {
            on: {
              soundNormalizationCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSoundNormalizationSetting: {
            on: {
              switchOffSoundNormalizationSettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          hapticIntensity: {
            on: {
              hapticIntensityCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffHapticIntensitySetting: {
            on: {
              switchOffHapticIntensitySettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      equalizer: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.equalizer.promiseResolve) {
                context.equalizer.promiseResolve(1);
              }
            },
            on: {
              equalizer: {
                actions: assign<any>((ctx) => {
                  return {
                    ...ctx,
                    equalizer: {
                      targetState: "equalizer",
                    },
                  };
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context, event) => requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "equalizer",
                  actions: assign((context, event) => {
                    return {
                      equalizer: {
                        ...context.equalizer,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context, event, meta) => {
                    console.log(meta);
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
              equalizerCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      lighting: {
        initial: "idle",
        states: {
          idle: {
            entry: (context) => {
              if (context.lighting.promiseResolve) {
                (context.lighting.promiseResolve as any)(1);
              }
            },
            on: {
              brightness: {
                actions: assign<any>({
                  lighting: {
                    targetState: "brightness",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSetting: {
                actions: assign<any>({
                  lighting: {
                    targetState: "switchOffSetting",
                  },
                }),
                target: "requestingLock",
              },
              effects: {
                actions: assign<any>({
                  lighting: {
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
              src: (context, event) => requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "brightness",
                  cond: (context) => {
                    return context.lighting.targetState === "brightness";
                  },
                  actions: assign((context, event) => {
                    return {
                      lighting: {
                        ...context.lighting,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "switchOffSetting",
                  cond: (context) => {
                    return context.lighting.targetState === "switchOffSetting";
                  },
                  actions: assign((context, event) => {
                    return {
                      lighting: {
                        ...context.lighting,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  })
                },
                {
                  target: "effects",
                  cond: (context) => {
                    return context.lighting.targetState === "effects";
                  },
                  actions: assign((context, event) => {
                    return {
                      lighting: {
                        ...context.lighting,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  })
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
              brightnessCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSetting: {
            on: {
              switchOffSettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          effects: {
            on: {
              effectsCompleted: [
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
              if (context.power.promiseResolve) {
                (context.power.promiseResolve as any)(1);
              }
            },
            on: {
              powerSaving: {
                actions: assign<any>({
                  power: {
                    targetState: "powerSaving",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSetting: {
                actions: assign<any>({
                  power: {
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
              src: (context, event) => requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "powerSaving",
                  cond: (context) => {
                    return context.power.targetState === "powerSaving";
                  },
                  actions: assign((context, event) => {
                    return {
                      power: {
                        ...context.power,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "switchOffSetting",
                  cond: (context) => {
                    return context.power.targetState === "switchOffSetting";
                  },
                  actions: assign((context, event) => {
                    return {
                      power: {
                        ...context.power,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
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
              powerSavingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSetting: {
            on: {
              switchOffSettingCompleted: [
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
              console.log("idle entry");
              if (context.mic.promiseResolve) {
                context.mic?.promiseResolve(1);
              }
            },
            on: {
              switchOffMicroPhoneSetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffMicroPhoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volume: {
                actions: assign<any>({
                  mic: {
                    targetState: "volume",
                  },
                }),
                target: "requestingLock",
              },

              sensitivity: {
                actions: assign<any>({
                  mic: {
                    targetState: "sensitivity",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSensitivitySetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffSensitivitySetting",
                  },
                }),
                target: "requestingLock",
              },
              micPreview: {
                actions: assign<any>({
                  mic: {
                    targetState: "micPreview",
                  },
                }),
                target: "requestingLock",
              },
              sidetone: {
                actions: assign<any>({
                  mic: {
                    targetState: "sidetone",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSidetoneSetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffSidetoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volumeNormalization: {
                actions: assign<any>({
                  mic: {
                    targetState: "volumeNormalization",
                  },
                }),
                target: "requestingLock",
              },
              ambientNoiseReduction: {
                actions: assign<any>({
                  mic: {
                    targetState: "ambientNoiseReduction",
                  },
                }),
                target: "requestingLock",
              },
              vocalClarity: {
                actions: assign<any>({
                  mic: {
                    targetState: "vocalClarity",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          idleMicPreview: {
            entry: (context) => {
              if (context.mic.promiseResolve) {
                (context.mic.promiseResolve as any)(1);
              }
            },
            on: {
              switchOffMicroPhoneSetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffMicroPhoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volume: {
                actions: assign<any>({
                  mic: {
                    targetState: "volume",
                  },
                }),
                target: "requestingLock",
              },
              sensitivity: {
                actions: assign<any>({
                  mic: {
                    targetState: "sensitivity",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSensitivitySetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffSensitivitySetting",
                  },
                }),
                target: "requestingLock",
              },
              micPreview: {
                actions: assign<any>({
                  mic: {
                    targetState: "micPreview",
                  },
                }),
                target: "requestingLock",
              },
              sidetone: {
                actions: assign<any>({
                  mic: {
                    targetState: "sidetone",
                  },
                }),
                target: "requestingLock",
              },
              switchOffSidetoneSetting: {
                actions: assign<any>({
                  mic: {
                    targetState: "switchOffSidetoneSetting",
                  },
                }),
                target: "requestingLock",
              },
              volumeNormalization: {
                actions: assign<any>({
                  mic: {
                    targetState: "volumeNormalization",
                  },
                }),
                target: "requestingLock",
              },
              ambientNoiseReduction: {
                actions: assign<any>({
                  mic: {
                    targetState: "ambientNoiseReduction",
                  },
                }),
                target: "requestingLock",
              },
              vocalClarity: {
                actions: assign<any>({
                  mic: {
                    targetState: "vocalClarity",
                  },
                }),
                target: "requestingLock",
              },
            },
          },
          requestingLock: {
            invoke: {
              id: "getLocks",
              src: (context, event) => requestLocks(event.timerTick, LockMode.shared, LockMode.shared),
              onDone: [
                {
                  target: "switchOffMicroPhoneSetting",
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                  cond: (context) => {
                    return (
                      context.mic.targetState === "switchOffMicroPhoneSetting"
                    );
                  },
                },
                {
                  target: "volume",
                  cond: (context) => {
                    return context.mic.targetState === "volume";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "sensitivity",
                  cond: (context) => {
                    return context.mic.targetState === "sensitivity";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "switchOffSensitivitySetting",
                  cond: (context) => {
                    return (
                      context.mic.targetState === "switchOffSensitivitySetting"
                    );
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "micPreview",
                  cond: (context) => {
                    return context.mic.targetState === "micPreview";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "sidetone",
                  cond: (context) => {
                    return context.mic.targetState === "sidetone";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "switchOffSidetoneSetting",
                  cond: (context) => {
                    return (
                      context.mic.targetState === "switchOffSidetoneSetting"
                    );
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "volumeNormalization",
                  cond: (context) => {
                    return context.mic.targetState === "volumeNormalization";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "ambientNoiseReduction",
                  cond: (context) => {
                    return context.mic.targetState === "ambientNoiseReduction";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
                },
                {
                  target: "vocalClarity",
                  cond: (context) => {
                    return context.mic.targetState === "vocalClarity";
                  },
                  actions: assign((context, event) => {
                    return {
                      mic: {
                        ...context.mic,
                        promiseResolve: event.data.resolve,
                      },
                    };
                  }),
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
              switchOffMicroPhoneSettingCompleted: [
                {
                  target: "idle",
                  actions: ["closeMicPreview"],
                },
              ],
            },
          },
          volume: {
            on: {
              volumeCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          sensitivity: {
            on: {
              sensitivityCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSensitivitySetting: {
            on: {
              switchOffSensitivitySettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          micPreview: {
            on: {
              micPreviewCompleted: [
                {
                  target: "idle",
                  cond: (context, event, meta) => {
                    return context.isMicPreview;
                  },
                  actions: () => {
                    console.log("[on completed - idle]");
                  },
                },
                {
                  target: "idleMicPreview",
                  cond: (context, event, meta) => {
                    return !context.isMicPreview;
                  },
                },
              ],
            },
            entry: (context) => {
              console.log("[entry]");
            },
            exit: (context) => {
              console.log("[exit]");
              context.isMicPreview = !context.isMicPreview;
            },
          },
          sidetone: {
            on: {
              sidetoneCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          switchOffSidetoneSetting: {
            on: {
              switchOffSidetoneSettingCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          volumeNormalization: {
            on: {
              volumeNormalizationCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          ambientNoiseReduction: {
            on: {
              ambientNoiseReductionCompleted: [
                {
                  target: "idle",
                },
              ],
            },
          },
          vocalClarity: {
            on: {
              vocalClarityCompleted: [
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
    actions: {
      closeMicPreview: (context) => {
        // open it if need
        // context.mic.isMicOn = !context.mic.isMicOn;
        // if (!context.mic.isMicOn) {
        //   context.isMicPreview = false;
        // }
      },
      ignoreTask: (_context, event) => {
        console.log("ignore", event.type);
        if (!event.notification) {
          const responseEvent = new CustomEvent("xstate_ignored");
          responseEvent.timerTick = event?.data?.timerTick ?? event.timerTick;
          window.dispatchEvent(responseEvent);
        }
      },
      dispatchError: (_context, event) => {
        console.log("error", event.type);
        const responseEvent = new CustomEvent("xstate_error");
        responseEvent.timerTick = event.data ?? event.timerTick;
        window.dispatchEvent(responseEvent);
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
