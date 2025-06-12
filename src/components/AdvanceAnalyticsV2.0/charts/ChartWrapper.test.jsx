import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChartWrapper from './ChartWrapper';

jest.mock('./ScatterChart', () => jest.fn(() => <div data-testid="scatter-chart" />));
jest.mock('./LineChart', () => jest.fn(() => <div data-testid="line-chart" />));
jest.mock('./BarChart', () => jest.fn(() => <div data-testid="bar-chart" />));
jest.mock('./EmptyChart', () => jest.fn(() => <div data-testid="empty-chart" />));

describe('ChartWrapper', () => {
  const baseProps = {
    isFetching: false,
    isError: false,
    loadingMessage: 'Loading chart...',
    chartProps: {
      data: [{ x: 1, y: 2 }],
      xKey: 'x',
      yKey: 'y',
      colorKey: 'color',
      colorMap: { color: 'blue' },
      hovertemplate: 'hover',
    },
  };

  it('renders EmptyChart when isError is true', () => {
    render(<ChartWrapper {...baseProps} isError />);
    expect(screen.getByTestId('empty-chart')).toBeInTheDocument();
  });

  it('shows loading spinner when isFetching is true', () => {
    render(<ChartWrapper {...baseProps} isFetching />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('renders ScatterChart when chartType is ScatterChart', () => {
    render(<ChartWrapper {...baseProps} chartType="ScatterChart" />);
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
  });

  it('renders LineChart when chartType is LineChart', () => {
    render(<ChartWrapper {...baseProps} chartType="LineChart" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders BarChart when chartType is BarChart', () => {
    render(<ChartWrapper {...baseProps} chartType="BarChart" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('does not render chart if chartProps.data is missing', () => {
    const props = {
      ...baseProps,
      chartType: 'LineChart',
      chartProps: { ...baseProps.chartProps, data: null },
    };
    render(<ChartWrapper {...props} />);
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});
