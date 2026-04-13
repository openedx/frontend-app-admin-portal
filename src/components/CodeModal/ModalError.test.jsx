import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe } from 'jest-axe';
import { ModalError } from '.';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

const props = {
  title: 'So many errors!!',
  errors: ['wrong', 'bad', 'no', 'just do not'],
};

describe('ModalError component', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ModalError {...props} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('displays a title', () => {
    render(<ModalError {...props} />);
    expect(screen.getByText(props.title)).toBeInTheDocument();
  });
  it('displays errors', () => {
    render(<ModalError {...props} />);
    props.errors.forEach((err) => {
      expect(screen.getByText(err)).toBeInTheDocument();
    });
  });
});
