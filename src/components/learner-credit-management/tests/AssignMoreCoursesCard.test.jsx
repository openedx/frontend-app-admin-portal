import React from 'react';
import { render, screen } from '@testing-library/react';
import AssignMoreCoursesCard from '../AssignMoreCoursesCard';
import '@testing-library/jest-dom/extend-expect';

describe('AssignMoreCoursesCard', () => {
  it('should render the component without errors', () => {
    render(<AssignMoreCoursesCard balance="14,004" expirationDate="Dec 31, 2023" />);
    expect(screen.getByText(/Assign more courses to maximize your budget./)).toBeInTheDocument();
  });

  it('should render the illustration image', () => {
    const { getByAltText } = render(<AssignMoreCoursesCard balance="14,004" expirationDate="Dec 31, 2023" />);
    expect(getByAltText('Illustration for naming your learner')).toBeInTheDocument();
  });

  it('should render the assign courses button', () => {
    render(<AssignMoreCoursesCard balance="14,004" expirationDate="Dec 31, 2023" />);
    expect(screen.getByText('Assign courses')).toBeInTheDocument();
  });

  it('should display the passed balance and expiration date', () => {
    render(<AssignMoreCoursesCard balance="5,000" expirationDate="Jan 31, 2024" />);
    expect(screen.getByText(/balance of \$5,000/)).toBeInTheDocument();
    expect(screen.getByText(/will expire on Jan 31, 2024./)).toBeInTheDocument();
  });
});
