import React from 'react';
import {
  screen, render, fireEvent,
} from '@testing-library/react';
import { formatBytes, getSizeInBytes } from './utils';
import '@testing-library/jest-dom/extend-expect';
import MultipleFileInputField from './MultipleFileInputField';

const formatBytesTestData = [[100, '100 Bytes'], [1024, '1 KB'], [1048576, '1 MB'], [1200000, '1.14 MB'], [4550000, '4.34 MB']];
const getSizeInBytesTestData = [['1KB', 1024], ['1 MB', 1048576], ['100 Bytes', 100], ['276 KB', 282624], ['1.2 MB', 1258291.2]];
describe('MultipleFileInputField:formatBytes', () => {
  formatBytesTestData.forEach((value) => {
    it(`tests formatBytes with: ${value[0]}`, () => {
      expect(formatBytes(value[0])).toEqual(value[1]);
    });
  });
});
describe('MultipleFileInputField:getSizeInBytes', () => {
  getSizeInBytesTestData.forEach((value) => {
    it(`tests formatBytes with: ${value[0]}`, () => {
      expect(getSizeInBytes(value[0])).toEqual(value[1]);
    });
  });
});

const props = {
  id: 'foo',
  input: {
    value: [],
    onChange: jest.fn(),
  },
  label: 'Text me',
  description: 'lorem ipsum',
  meta: { touched: false, error: undefined },
  type: 'text',

};

describe('<MultipleFileInputField />', () => {
  it('renders a label', () => {
    render(<MultipleFileInputField {...props} />);
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });
  it('renders an error', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: true, error } };
    render(<MultipleFileInputField {...errorProps} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });
  it('renders a description', () => {
    render(<MultipleFileInputField {...props} />);
    expect(screen.getByText(props.description));
  });
  it('does not render an error if it has not been touched', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: false, error } };
    render(<MultipleFileInputField {...errorProps} />);
    expect(screen.queryByText(error)).toBeFalsy();
  });
  it('select files works correctly', async () => {
    const { container } = render(<MultipleFileInputField {...props} />);
    expect(screen.getByText('Select files')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
    const fileContents = 'file contents';
    const file = new Blob([fileContents], { type: 'text/plain', size: 456, name: 'abc.txt' });
    const readAsArrayBuffer = jest.fn();
    const dummyFileReader = { readAsArrayBuffer, result: fileContents };
    window.FileReader = jest.fn(() => dummyFileReader);
    fireEvent.change(container.querySelector('input'), { target: { files: [file] } });
    expect(FileReader).toHaveBeenCalled();
    expect(readAsArrayBuffer).toHaveBeenCalled();
  });
});
