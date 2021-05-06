import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, send, Machine, spawn, interpret } from "xstate";
import { useMachine } from "@xstate/react";


function StateNode() {

    const timeOfDayMachine = Machine({
        id: 'timeOfDay',
        initial: 'unknown',
        context: {
          time: new Date(Date.now())
        },
        states: {
          // Transient state
          unknown: {
            on: {//[Null Events] https://xstate.js.org/docs/guides/events.html#null-events
              '': [
                { target: 'morning', cond: 'isBeforeNoon' },
                { target: 'afternoon', cond: 'isBeforeSix' },
                { target: 'evening' }
              ]
            }
          },
          morning: {},
          afternoon: {},
          evening: {}
        }
      }, {
        guards: {
            isBeforeNoon: (context) => {
              return context.time.getHours() < 12
            },
            isBeforeSix: (context) =>  {
              return context.time.getHours() < 18
            }
          }
      });


    const timeOfDayService = interpret(
        timeOfDayMachine.withContext({  time: new Date(Date.now()) }),{ devTools: true }
      ).onTransition((state) => console.log(state.value));
    const startTheDay = () => {
        timeOfDayService.start();
    }


    return (
        <div className="StateNode">
             <h1>StateNode</h1>
            <button onClick= {()=> {
                startTheDay();
            }}>Start the Day</button>
        </div>
      );
}

export default StateNode;