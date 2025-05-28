import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrendingUp } from '@openedx/paragon/icons';
import { Step } from '../OnboardingSteps';

describe('OnboardingSteps', () => {
  const defaultProps = {
    icon: TrendingUp,
    title: 'Test Step',
    timeEstimate: 2,
    targetId: 'test-target',
    onTourSelect: jest.fn(),
  };

  const renderStep = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(<Step {...finalProps} />);
  };

  it('renders step with all required props', () => {
    renderStep();
    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('(2 min)')).toBeInTheDocument();
  });

  it('calls onTourSelect when clicked', () => {
    const onTourSelect = jest.fn();
    renderStep({ onTourSelect });

    const step = screen.getByText('Test Step').closest('div');
    fireEvent.click(step);

    expect(onTourSelect).toHaveBeenCalledWith('test-target');
  });

  it('handles click when onTourSelect is not provided', () => {
    const { onTourSelect, ...propsWithoutCallback } = defaultProps;
    renderStep(propsWithoutCallback);

    const step = screen.getByText('Test Step').closest('div');
    expect(() => fireEvent.click(step)).not.toThrow();
  });

  it('renders time estimate', () => {
    renderStep();
    const timeEstimate = screen.getByText('(2 min)');
    expect(timeEstimate).toBeInTheDocument();
  });

  it('renders title', () => {
    renderStep();
    const title = screen.getByText('Test Step');
    expect(title).toBeInTheDocument();
  });
});
