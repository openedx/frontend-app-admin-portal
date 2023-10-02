import React from 'react';
import { render, screen } from '@testing-library/react';
import NoBudgetActivityCard from '../NoBudgetActivityCard';
import '@testing-library/jest-dom/extend-expect';

describe('NoBudgetActivityCard', () => {
  it('should render the component without errors', () => {
    render(<NoBudgetActivityCard />);
    expect(screen.getByText('No budget activity yet? Assign a course!')).toBeInTheDocument();
  });

  it('should render three course images', () => {
    const { getAllByRole } = render(<NoBudgetActivityCard />);
    const images = getAllByRole('img');
    expect(images.length).toBe(3);
  });

  it('has the correct alt text for images', () => {
    render(<NoBudgetActivityCard />);
    expect(screen.getByAltText('Illustration for finding the right course')).toBeInTheDocument();
    expect(screen.getByAltText('Illustration for naming your learner')).toBeInTheDocument();
    expect(screen.getByAltText('Illustration for confirming spend')).toBeInTheDocument();
  })

  it('should render three steps with their respective titles and descriptions', () => {
    render(<NoBudgetActivityCard />);
    expect(screen.getByText('Find the right course')).toBeInTheDocument();
    expect(screen.getByText('Check out your budget’s catalog of courses and select the course you want to assign to learner(s).')).toBeInTheDocument();
    expect(screen.getByText('Name your learner(s)')).toBeInTheDocument();
    expect(screen.getByText('You will be prompted to enter email addresses for the learner or learners you want to assign.')).toBeInTheDocument();
    expect(screen.getByText('Confirm spend')).toBeInTheDocument();
    expect(screen.getByText('Once confirmed, the total cost will be deducted from your budget, and you can track your spending right here!')).toBeInTheDocument();
  });
});
