
import React from 'react';
import { expect } from 'chai';
import { configure, shallow } from 'enzyme';
import sinon from 'sinon';

import SimpleFunctionComponent from "src/components/SimpleComponent";
import SimpleFunctionComponent2 from "src/components/SimpleComponentWithButton";
import SimpleContainment from "src/components/SimpleContainment";

import ShallowRenderer from 'react-test-renderer/shallow';

import Adapter from "enzyme-adapter-react-16";

configure({adapter: new Adapter() });

describe('<MyComponent />', () => {


  it('renders an `.icon-star`', () => {
    const wrapper = shallow(<SimpleFunctionComponent />);
    expect(wrapper.find('.icon-star')).to.have.lengthOf(1);
  });

  it('renders children when passed in', () => {
    const wrapper = shallow((
      <SimpleContainment>
        <div className="unique" />
      </SimpleContainment>
    ));
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<SimpleFunctionComponent2 onButtonClick={onButtonClick} />);
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });
});