import React from 'react';
import { screen, render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import {
  BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED_TYPE, MOODLE_TYPE, SAP_TYPE,
} from '../../data/constants';

import SettingsLMSTab from '../index';

describe('<SettingsLMSTab />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SettingsLMSTab />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has all LMS cards present', () => {
    render(
      <SettingsLMSTab />,
    );
    expect(screen.queryByText(BLACKBOARD_TYPE)).toBeTruthy();
    expect(screen.queryByText(CANVAS_TYPE)).toBeTruthy();
    expect(screen.queryByText(CORNERSTONE_TYPE)).toBeTruthy();
    expect(screen.queryByText(DEGREED_TYPE)).toBeTruthy();
    expect(screen.queryByText(MOODLE_TYPE)).toBeTruthy();
    expect(screen.queryByText(SAP_TYPE)).toBeTruthy();
  });
});
