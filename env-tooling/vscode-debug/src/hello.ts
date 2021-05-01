// var jsonDiff = require('./dist/cli.js');
import { diff } from "json-diff";

export class Hello{

    constructor() {
        console.log("learning how to import npm package.");
    }

    sayHi() {
        console.log("Hello world!");
    }

    invokeDependency() {

        //console.log(jsonDiff);
        // let diff = require_json_diff().diff;
        console.log(diff({ foo: 'bar' }, { foo: 'baz' }));
    }
};