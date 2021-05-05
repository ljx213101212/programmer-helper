import React, { useState, useContext, ChangeEvent } from "react";


/**
 * source:
 * function shallowEqual
 * function checkShouldComponentUpdate
 */
export class PureComponentTest extends React.PureComponent {
    
    //renderCount: React.RefObject<number>;
    renderCount: any = 0;
    constructor(props){
        super(props);
        
        this.state = {
            primitive: 100,
            object: {
                primitive: 200,
                object: {
                    primitive: 300
                }
            },
            array: [
                100,
                200,
                300
            ]
        }
    }

    badPractice1 = () => {
        //mutate change
        //comparison:  shallow comparsion.

        
        //mutate change - array reference doesn't change.
        //it's bad practice.
        let shallowCopyArray = this.state["array"];
        shallowCopyArray.push(400);

        //no refresh
        // this.setState({
        //     array: shallowCopyArray
        // });

        //will refresh 
        //immutable change - array reference 
        this.setState({
            primitive: 200
        },()=> {
            //now 400 is in .
            console.log(this.state["array"]);
        })

    }

    
    render() {
        this.renderCount++;
        return (
            <div>
                <section>Learn Pure Component</section>
                <button onClick={this.badPractice1}>Bad Practice 1</button>
                <div>This page is re-rendered {this.renderCount} times this session.</div>
            </div>
        )
    }
}