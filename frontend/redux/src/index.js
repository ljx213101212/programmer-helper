import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';

const countReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INC': return { count: state.count + 1 };
    case 'DEC': return { count: state.count - 1 };
    case 'TEST':
      // return {
      //   ...state,
      //   count: action.payload
      // }
      //
      //mutable change
      state.count = action.payload;
      return state;
    default: return state;
  }
}

const reducers = combineReducers({
  counter: countReducer,
})

const actions = {
  inc: () => async (dispatch, getState) => {
    let myState = getState();
    //this step won't change the store until countReducer returned.
    myState.count = 100;
    dispatch({type: 'TEST', payload: myState.count});
    //event loop concept
    setTimeout(() => {
      console.log(getState());
    },0);
  },
  // { type: 'INC' }
  dec: () => ({ type: 'DEC' }),
};

const composeSetup =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(reducers, composeSetup(applyMiddleware(thunk)));

class App extends Component {
  render() {
    console.log(this.props, actions);
    return (
      <div>
        <button onClick={this.props.inc}>Increment</button>
        <button onClick={this.props.dec}>Decrement</button>
        <div>Value: {this.props.count}</div>
      </div>
    );
  }
}

const mapStateToProps = ({ counter }) => {
  return { count: counter.count };
}

const AppContainer = connect(mapStateToProps, actions)(App);

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
