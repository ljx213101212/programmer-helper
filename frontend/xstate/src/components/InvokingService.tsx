import * as React from "react";
import * as ReactDOM from "react-dom";
import { assign, send, Machine, interpret, actions } from "xstate";
import { useMachine } from "@xstate/react";
const { respond } = actions;

function InvokingService() {
  const secretMachine = Machine({
    id: "secret",
    initial: "wait",
    context: {
      secret: "42",
    },
    states: {
      wait: {
        after: {
          1000: "reveal",
        },
      },
      reveal: {
        type: "final",
        data: {
          secret: (context, event) => context.secret,
        },
      },
    },
  });

  const parentMachine = Machine({
    id: "parent",
    initial: "pending",
    context: {
      revealedSecret: undefined,
    },
    states: {
      pending: {
        invoke: {
          id: "secret",
          src: secretMachine,
          onDone: {
            target: "success",
            actions: assign({
              revealedSecret: (context, event) => {
                // event is:
                // { type: 'done.invoke.secret', data: { secret: '42' } }
                return event.data.secret;
              },
            }),
          },
        },
      },
      success: {
        type: "final",
      },
    },
  });

  const service = interpret(parentMachine).onTransition((state) =>
    console.log(state.context)
  );

  const authServerMachine = Machine({
    id: "server",
    initial: "waitingForCode",
    states: {
      waitingForCode: {
        on: {
          CODE: {
            actions: respond("TOKEN", { delay: 1000 }),
          },
        },
      },
    },
  });

  const authClientMachine = Machine(
    {
      id: "client",
      initial: "idle",
      states: {
        idle: {
          on: { AUTH: "authorizing" },
        },
        authorizing: {
          invoke: {
            id: "auth-server",
            src: authServerMachine,
          },
          entry: send("CODE", { to: "auth-server" }),
          on: {
            TOKEN: "authorized",
          },
        },
        authorized: {
          entry: ["notifyDone"],
        },
      },
    },
    {
      actions: {
        notifyDone: (context, event) => {
          console.log("Done!");
        },
      },
    }
  );

  const authService = interpret(authClientMachine).onTransition((state) =>
    console.log(state.context)
  );

  const invokeService = () => {
    service.start();
  };

  const invokeAuthService = () => {
    authService.start();
    authService.send("AUTH");
  };

  return (
    <div className="InvokingService">
    
      <h1>InvokingService</h1>
      <button
        onClick={() => {
          invokeService();
        }}
      >
        Invoke Service
      </button>
      <button
        onClick={() => {
          invokeAuthService();
        }}
      >
        Invoke Auth Service
      </button>
    </div>
  );
}

export default InvokingService;
