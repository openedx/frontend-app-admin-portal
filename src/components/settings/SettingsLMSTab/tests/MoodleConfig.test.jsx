import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import MoodleConfig from '../LmsConfigs/MoodleConfig';

const mockOnClick = jest.fn();

describe('<MoodleConfig />', () => {
  test('renders Moodle Config Form', () => {
    render(
      <MoodleConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Moodle Base URL');
    screen.getByLabelText('Webservice Short Name');
  });
  test('test button disable', () => {
    render(
      <MoodleConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('Webservice Short Name'), {
      target: { value: 'test2' },
    });

    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
