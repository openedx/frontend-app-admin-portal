import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RenderField from './index';

const props = {
  id: 'foo',
  input: {},
  label: 'Text me',
  meta: { touched: false, error: undefined },
  type: 'text',
};

describe('<RenderField />', () => {
  it('renders a label', () => {
    render(<RenderField {...props} />);
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });
  it('renders an error', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: true, error } };
    render(<RenderField {...errorProps} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });
  it('renders a description', () => {
    const description = 'Render field, described';
    render(<RenderField {...props} description={description} />);
    expect(screen.getByText(description));
  });
  it('does not render an error if it has not been touched', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: false, error } };
    render(<RenderField {...errorProps} />);
    expect(screen.queryByText(error)).toBeFalsy();
  });
});
