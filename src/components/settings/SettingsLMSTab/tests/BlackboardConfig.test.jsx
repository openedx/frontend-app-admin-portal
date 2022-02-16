import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import BlackboardConfig from '../LMSConfigs/BlackboardConfig';

const mockOnClick = jest.fn();

describe('<BlackboardConfig />', () => {
  test('renders Blackboard Config Form', () => {
    render(
      <BlackboardConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('API Client ID/Blackboard Application Key');
    screen.getByLabelText('API Client Secret/Application Secret');
    screen.getByLabelText('Blackboard Base URL');
  });
  test('test validation and button disable', () => {
    render(
      <BlackboardConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('API Client ID/Blackboard Application Key'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret/Application Secret'), {
      target: { value: 'test2' },
    });
    // bad url is not able to be submitted
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: 'test3' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText('This does not look like a valid url'));
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: 'test.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
