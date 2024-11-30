import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailCell from './EmailCell';

describe('Email Component', () => {
  it('should display the user email and suppress highlighting', () => {
    const mockRow = {
      original: {
        userEmail: 'test@example.com',
      },
    };

    render(
      <EmailCell row={mockRow} />,
    );

    // Assert that the email is rendered correctly
    const emailElement = screen.getByText('test@example.com');
    expect(emailElement).toBeInTheDocument();

    // Assert that data-hj-suppress is present to suppress highlighting
    expect(emailElement).toHaveAttribute('data-hj-suppress');
  });

  it('should throw a prop-type warning if the email is not provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidRow = {
      original: {},
    };

    // Render with invalid props
    render(<EmailCell row={invalidRow} />);

    // Assert that a prop-types error has been logged
    expect(consoleSpy).toHaveBeenCalled();

    // Clean up the spy
    consoleSpy.mockRestore();
  });
});
