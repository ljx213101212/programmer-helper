import * as React from "react";
import * as ReactDOM from "react-dom";

import SimpleFunction from "./components/SimpleComponent"
import SimpleContainment from "./components/SimpleContainment"

function App() {


    return (
        <div className="App">
            Hello Testing

            <SimpleFunction></SimpleFunction>

            <SimpleContainment>
                here is the children
            </SimpleContainment>
        </div>
    )
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);