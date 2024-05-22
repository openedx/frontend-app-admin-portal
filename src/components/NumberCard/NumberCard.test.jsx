import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Groups } from '@openedx/paragon/icons';

import NumberCard from './index';

const getNumberCard = wrapper => wrapper.find('NumberCard');

const NumberCardWrapper = props => (
  <MemoryRouter>
    <NumberCard
      id="test-id"
      className="test-class"
      title={10}
      description="This describes the data!"
      icon={Groups}
      {...props}
    />
  </MemoryRouter>
);

describe('<NumberCard />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('without detail actions', () => {
      const tree = renderer
        .create((
          <NumberCardWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with detail actions', () => {
      const tree = renderer
        .create((
          <NumberCardWrapper
            detailActions={[{
              label: 'Action 1',
              slug: 'action-1',
            }, {
              label: 'Action 2',
              slug: 'action-2',
            }]}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  it('sets a non-number title', () => {
    wrapper = mount(<NumberCardWrapper title="10%" />).find('NumberCard');
    expect(wrapper.find('.card-title span').first().text()).toEqual('10%');
  });

  describe('collapsible detail actions', () => {
    beforeEach(() => {
      wrapper = mount((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
    });

    it('expands and collapses the actions', () => {
      expect(getNumberCard(wrapper).find('.details-btn-text').text()).toEqual('Details');

      wrapper.setProps({ detailsExpanded: true });
      expect(getNumberCard(wrapper).find('.details-btn-text').text()).toEqual('Detailed breakdown');
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeTruthy();

      wrapper.setProps({ detailsExpanded: false });
      expect(getNumberCard(wrapper).find('.details-btn-text').text()).toEqual('Details');
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeFalsy();
    });

    it('opens and closes detail actions with keydown on collapse btn', () => {
      getNumberCard(wrapper).find('.toggle-collapse').hostNodes().simulate('keyDown', { key: 'ArrowDown' });
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeTruthy();

      getNumberCard(wrapper).find('.toggle-collapse').hostNodes().simulate('keyDown', { key: 'Escape' });
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeFalsy();
    });

    it('closes detail actions with enter keydown on action', () => {
      wrapper.setProps({ detailsExpanded: true });
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeTruthy();
      const actions = getNumberCard(wrapper).find('.footer-body .btn-link').hostNodes();
      actions.first().simulate('keyDown', { key: 'Enter' });
      setTimeout(() => {
        expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeFalsy();
      }, 0);
    });

    it('closes detail actions with escape keydown on action', () => {
      wrapper.setProps({ detailsExpanded: true });
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeTruthy();
      const actions = getNumberCard(wrapper).find('.footer-body .btn-link').hostNodes();
      actions.first().simulate('keyDown', { key: 'Escape' });
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeFalsy();
    });

    it('sets focus index on actions', () => {
      wrapper.setProps({ detailsExpanded: true });
      const actions = getNumberCard(wrapper).find('.footer-body .btn-link').hostNodes();
      actions.first().simulate('keyDown', { key: 'ArrowDown' });
      expect(getNumberCard(wrapper).instance().state.focusIndex).toEqual(1);

      actions.last().simulate('keyDown', { key: 'ArrowUp' });
      expect(getNumberCard(wrapper).instance().state.focusIndex).toEqual(0);
    });

    it('closes detail actions on action click', () => {
      wrapper.setProps({ detailsExpanded: true });
      const actions = getNumberCard(wrapper).find('.footer-body .btn-link').hostNodes();
      actions.first().simulate('click');
      expect(getNumberCard(wrapper).instance().state.detailsExpanded).toBeFalsy();
    });

    it('shows loading spinner in action', () => {
      wrapper = mount((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
            loading: true,
          }]}
        />
      ));
      wrapper.setProps({ detailsExpanded: true });
      const action = getNumberCard(wrapper).find('.footer-body .btn-link').hostNodes().first();
      expect(action.find('.ml-2').exists()).toBeTruthy();
    });
  });
});
