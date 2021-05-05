import * as React from "react";
import * as ReactDOM from "react-dom";

import { PropsDrilling, PropsDrillingWithContext} from "./components/PropsDrillingVSUseContext";
import { PureComponentTest } from "./components/PureComponentTest";

function App() {

    return (
        <div className="App">
            Hello react

            {/* <PropsDrilling></PropsDrilling>
            <PropsDrillingWithContext></PropsDrillingWithContext> */}

            <PureComponentTest></PureComponentTest>
        </div>
    )
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);