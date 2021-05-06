import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, send, Machine, spawn, interpret } from "xstate";
import { useMachine } from "@xstate/react";

function Trasition() {

    const gameMachine = createMachine(
        {
          id: 'game',
          initial: 'playing',
          context: {
            points: 0
          },
          states: {
            playing: {
              // Eventless transition
              // Will transition to either 'win' or 'lose' immediately upon
              // entering 'playing' state or receiving AWARD_POINTS event
              // if the condition is met.
              always: [
                { target: 'win', cond: 'didPlayerWin' },
                { target: 'lose', cond: 'didPlayerLose' }
              ],
              on: {
                // Self-transition
                AWARD_POINTS: {
                  actions: assign({
                    points: 100
                  })
                }
              }
            },
            win: { type: 'final' },
            lose: { type: 'final' }
          }
        },
        {
          guards: {
            didPlayerWin: (context, event) => {
              // check if player won
              return context.points > 99;
            },
            didPlayerLose: (context, event) => {
              // check if player lost
              return context.points < 0;
            }
          }
        }
      );
      
      const gameService = interpret(gameMachine,{ devTools: true })
        .onTransition((state) => console.log(state.value))
        .start();

    
    return (
        <div className="Trasition">
             <h1>Transition</h1>
            <button onClick= {()=> {
               gameService.send('AWARD_POINTS');
            }}>Start the Transition</button>
        </div>
      );
}

export default Trasition;