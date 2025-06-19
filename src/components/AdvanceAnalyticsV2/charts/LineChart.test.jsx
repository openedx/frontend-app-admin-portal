import React from 'react';
import Plot from 'react-plotly.js';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LineChart from './LineChart';

jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => <div data-testid="Plot" />),
}));

describe('LineChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockData = [
    { category: 'A', valueX: 1, valueY: 2 },
    { category: 'B', valueX: 3, valueY: 4 },
  ];
  const colorMap = { A: 'red', B: 'blue' };
  const hovertemplate = 'x=%{x}<br>y=%{y}';

  it('renders correctly', () => {
    render(
      <LineChart
        data={mockData}
        xKey="valueX"
        yKey="valueY"
        colorKey="category"
        colorMap={colorMap}
        hovertemplate={hovertemplate}
        xAxisTitle="X Axis"
        yAxisTitle="Y Axis"
      />,
    );
    expect(screen.getByTestId('Plot')).toBeInTheDocument();
    const {
      data: traces,
      layout,
      config,
      style,
    } = Plot.mock.calls[0][0];
    expect(traces.length).toBe(Object.keys(colorMap).length);
    expect(traces[0].x).toEqual([1]);
    expect(traces[0].y).toEqual([2]);
    expect(traces[1].x).toEqual([3]);
    expect(traces[1].y).toEqual([4]);
    expect(traces[0].marker.color).toBe('red');
    expect(traces[1].marker.color).toBe('blue');
    traces.forEach(trace => {
      expect(trace.type).toBe('scatter');
      expect(trace.mode).toBe('lines');
      expect(trace.hovertemplate).toBe(hovertemplate);
    });

    expect(layout.xaxis.title).toBe('X Axis');
    expect(layout.yaxis.title).toBe('Y Axis');
    expect(layout.dragmode).toBeFalsy();
    expect(layout.autosize).toBeTruthy();
    expect(config).toEqual({ displayModeBar: false });
    expect(style).toEqual({ width: '100%', height: '100%' });
  });
});
