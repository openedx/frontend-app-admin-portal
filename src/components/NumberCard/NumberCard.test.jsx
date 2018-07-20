import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import NumberCard from './index';

describe('<NumberCard />', () => {
  let wrapper;

  it('renders correctly', () => {
    const tree = renderer
      .create((
        <NumberCard
          className="test-class"
          title={10}
          description="This describes the data!"
          iconClassName="fa fa-users"
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sets the title correctly', () => {
    wrapper = shallow((
      <NumberCard
        title="10%"
        description="This describes the data!"
      />
    ));
    expect(wrapper.find('.card-title span').text()).toEqual('10%');

    wrapper.setProps({ title: 1234 });
    expect(wrapper.find('.card-title span').text()).toEqual('1,234');
  });
});
