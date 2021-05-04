import * as React from "react";
import * as ReactDOM from "react-dom";

import { PropsDrilling, PropsDrillingWithContext} from "./components/PropsDrillingVSUseContext";

function App() {

    return (
        <div className="App">
            Hello react


        
            <PropsDrilling></PropsDrilling>
            <PropsDrillingWithContext></PropsDrillingWithContext>
        </div>
    )
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);