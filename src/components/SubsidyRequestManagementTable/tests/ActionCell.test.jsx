import React from 'react';
import renderer from 'react-test-renderer';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import ActionCell from '../ActionCell';
import { renderWithRouter } from '../../test/testUtils';

const defaultProps = {
  row: {
    original: { requestStatus: 'approved' },
  },
  onApprove: jest.fn(),
  onDecline: jest.fn(),
};

describe('ActionCell', () => {
  test('does not render anything when request status is not "requested"', () => {
    const tree = renderer
      .create(<ActionCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders decline & approve inline buttons when request status is "requested"', () => {
    const mockApprove = jest.fn();
    const mockDecline = jest.fn();
    const props = {
      ...defaultProps,
      row: {
        original: { id: 1, requestStatus: 'requested' },
      },
      onApprove: mockApprove,
      onDecline: mockDecline,
    };
    renderWithRouter(<ActionCell {...props} />);

    userEvent.click(screen.getByText('Decline'));
    expect(mockDecline).toHaveBeenCalledTimes(1);
    expect(mockDecline).toHaveBeenCalledWith({ id: 1, requestStatus: 'requested' });

    userEvent.click(screen.getByText('Approve'));
    expect(mockApprove).toHaveBeenCalledTimes(1);
    expect(mockApprove).toHaveBeenCalledWith({ id: 1, requestStatus: 'requested' });
  });
});
