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
      soundPreview: {
        initial: "inactive",
        on: {
          sound_preview_off: [
            {
              target: ".inactive",
              in: "#hold.soundPreview.active",
            },
            { actions: respond("completed") },
          ],
          sound_preview_on: [
            {
              actions: respond("failed"),
              in: "#hold.micPreview.active",
            },
            {
              target: ".active",
              in: "#hold.soundPreview.inactive",
            },
            { actions: respond("completed") },
          ],
        },
        states: {
          active: {
            entry: ["soundPreviewKeyDown", respond("completed")],
          },
          inactive: {
            entry: ["soundPreviewKeyUp", respond("completed")],
          },
        },
      },
      micPreview: {
          initial: "inactive",
          on: {
            mic_preview_off: [
                {
                  target: ".inactive",
                  in: "#hold.micPreview.active",
                },
                { actions: respond("completed") },
            ],
            mic_preview_on: [
              {
                actions: respond("failed"),
                in: "#hold.soundPreview.active",
              },
              {
                target: ".active",
                in: "#hold.micPreview.inactive",
              },
              { actions: respond("completed") },
            ]
          },
          states: {
            active: {
              entry: ["micPreviewKeyDown", respond("completed")],
            },
            inactive: {
              entry: ["micPreviewKeyUp", respond("completed")],
            },
          }
      }
    }
  },
  {
    actions: {
      soundPreviewKeyDown: (context, event) => {
        console.log("sound preview key down");
      },
      soundPreviewKeyUp: (context, event) => {
        console.log("sound preview key uo");
      },
      micPreviewKeyDown: (context, event) => {
        console.log("mic preview key down");
      },
      micPreviewKeyUp: (context, event) => {
        console.log("mic preview key down");
      }
    },
  }

);

const nariUltimateStateMachine = Machine(
  {
    id: "device",
    type: "parallel",
    initial: "starting",
    context: {
      holdMachine: undefined,
      isPlayingTestAudio: false,
      thx: {
        status: false,
      },
    },
    states: {
      starting: {
        
        entry: assign<any>({ holdMachine: () => spawn(holdMachine),}),
        always: [
          {
            target:"idle"
          }
        ],
      },
      idle: {
        on: {
          soundUI: {
            target: "soundUI",
          },
          // mixerUI: {
          //   target: "mixerUI",
          // },
          // enhancementUI: {
          //   target: "enhancementUI",
          // },
          // eqUI: {
          //   target: "eqUI",
          // },
          // micUI: {
          //   target: "micUI",
          // },
          // lightingUI: {
          //   target: "lightingUI",
          // },
          // powerUI: {
          //   target: "powerUI",
          // },
          // switchProfile: {
          //   target: "switchProfile",
          // },
        },
      },
      soundUI: {
        on: {
          // thxSpatialAudioDemo: [
          //   {
          //     actions: ["playingTEST", raise("completed")],
          //     cond: { type: "playingGuard" },
          //   },
          //   { actions: raise("failed") },
          // ],
          // completed: {
          //   target: "idle",
          //   actions: ["notifyDone"],
          // },
          // failed: {
          //   actions: ["notifyFail"],
          //   target: "idle",
          // },
        },
      },
      // mixerUI: {
      //   on: {
      //     thxSpatialAudioDemo: [
      //       {
      //         actions: ["playingTEST", raise("completed")],
      //         cond: { type: "playingGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     thxSpatialAudioStatus: [
      //       {
      //         actions: ["processTHXSpatialAudioStatus", raise("completed")],
      //         cond: { type: "dpiUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
      // enhancementUI: {
      //   on: {
      //     bassBoost: [
      //       {
      //         actions: ["processBassBoost", raise("completed")],
      //         cond: { type: "bassBoostUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     voiceClarity: [
      //       {
      //         actions: ["processVoiceClarity", raise("completed")],
      //         cond: { type: "voiceClarityUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     soundNormalization: [
      //       {
      //         actions: ["processHapticIntensity", raise("completed")],
      //         cond: { type: "hapticIntensityUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
      // eqUI: {
      //   on: {
      //     eq: [
      //       {
      //         actions: ["processEQ", raise("completed")],
      //         cond: { type: "eqUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
      // micUI: {
      //   on: {
      //     micPreviewStart: {
      //       actions: send("mic_preview_on", {
      //         to: (context: any) => context.holdMachine,
      //       }),
      //     },
      //     micPreviewEnd: {
      //       actions: send("mic_preview_off", {
      //         to: (context: any) => context.holdMachine,
      //       }),
      //     },
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
      // lightingUI: {
      //   on: {
      //     brightness: [
      //       {
      //         actions: ["processBrightness", raise("completed")],
      //         cond: { type: "brightnessUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     offLightingSetting: [
      //       {
      //         actions: ["processSwitchOffSetting", raise("completed")],
      //         cond: { type: "offLightingSettingGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     lightingEffects: [
      //       {
      //         actions: ["processLightingEffects", raise("completed")],
      //         cond: { type: "lightingEffectsGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
      // powerUI: {
      //   on: {
      //     powerSaving: [
      //       {
      //         actions: ["processPowerSaving", raise("completed")],
      //         cond: { type: "powerSavingUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     offPowerSaving: [
      //       {
      //         actions: ["processOffPowerSaving", raise("completed")],
      //         cond: { type: "powerOffSavingUIGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //   },
      // },
      // switchProfile: {
      //   on: {
      //     switchProfile: [
      //       {
      //         actions: ["processSwitchProfile", raise("completed")],
      //         cond: { type: "switchProfileGuard" },
      //       },
      //       { actions: raise("failed") },
      //     ],
      //     completed: {
      //       target: "idle",
      //     },
      //     failed: {
      //       actions: ["notifyFail"],
      //       target: "idle",
      //     },
      //   },
      // },
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
      // playingTEST: () => {
      //   console.log("playingTEST");
      // },
      // processTHXSpatialAudioStatus: (context, event) => {
      //   console.log("process THXSpatialAudioStatus");
      // },
      // processBassBoost: (context, event) => {
      //   console.log("process BassBoost");
      // },
      // processBrightness: (context, event) => {
      //   console.log("process brightness");
      // },
      // processVoiceClarity: (context, event) => {
      //   console.log("process voice clarity");
      // },
      // processHapticIntensity: (context, event) => {
      //   console.log("process haptic intensity");
      // },
      // processEQ: (context, event) => {
      //   console.log("process EQ");
      // },
      // processSwitchOffSetting: (context, event) => {
      //   console.log("process switchoff setting");
      // },
      // processLightingEffects: (context, event) => {
      //   console.log("process lighting effects");
      // },
      // processSwitchProfile: (conext, event) => {
      //   console.log("process switch profile");
      // },
      // processPowerSaving: (context, event) => {
      //   console.log("process powersaving");
      // },
    },
    guards: {
      playingGuard: (context: any, event: any) => {
        if (context.isPlayingTestAudio) {
          console.log("Another Test Audio is playing already.");
          return false;
        }
        return true;
      },
      thxSpatialAudioStatusGuard: (context: any, event: any) => {
        const { status } = context.thx;
        if (!status) {
          return false;
        }
        return true;
      },
      // bassBoostUIGuard: (context: any, event: any) => {
      //   return true;
      // },
      // voiceClarityUIGuard: () => {
      //   return true;
      // },
      // hapticIntensityUIGuard: () => {
      //   return true;
      // },
      // offLightingSettingGuard: (context: any, event: any) => {
      //   return true;
      // },
      // eqUIGuard: (context: any, event: any) => {
      //   return true;
      // },
      // powerSavingUIGuard: (context: any, event: any) => {
      //   return true;
      // },
      // powerOffSavingUIGuard: (context: any, event: any) => {
      //   return true;
      // },
      // lightingEffectsGuard: (context: any, event: any) => {
      //   return true;
      // },
      // switchProfileGuard: (context: any, event: any) => {
      //   return true;
      // },
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
      <button onClick={()=> service.send(["soundUI","thxSpatialAudioDemo"])}>thxSpatialAudioDemo Start</button>
    </div>
  );
}

export default MyPOCUI;
