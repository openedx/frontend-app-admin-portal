import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ModalError } from '.';

const props = {
  title: 'So many errors!!',
  errors: ['wrong', 'bad', 'no', 'just do not'],
};

describe('ModalError component', () => {
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
