import React from 'react';
import { shallow } from 'enzyme';
import Plot from 'react-plotly.js';
import BarChart from './BarChart';

describe('BarChart', () => {
  const mockData = [
    { category: 'A', valueX: 1, valueY: 2 },
    { category: 'B', valueX: 3, valueY: 4 },
  ];
  const colorMap = { A: 'red', B: 'blue' };
  const hovertemplate = 'x=%{x}<br>y=%{y}';

  it('renders correctly', () => {
    const wrapper = shallow(
      <BarChart
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
    const plotComponent = wrapper.find(Plot);
    const traces = plotComponent.prop('data');
    expect(traces.length).toBe(Object.keys(colorMap).length);
    expect(traces[0].x).toEqual([1]);
    expect(traces[0].y).toEqual([2]);
    expect(traces[1].x).toEqual([3]);
    expect(traces[1].y).toEqual([4]);
    expect(traces[0].marker.color).toBe('red');
    expect(traces[1].marker.color).toBe('blue');
    traces.forEach(trace => {
      expect(trace.type).toBe('bar');
      expect(trace.hovertemplate).toBe(hovertemplate);
    });

    const layout = plotComponent.prop('layout');
    expect(layout.xaxis.title).toBe('X Axis');
    expect(layout.yaxis.title).toBe('Y Axis');
    expect(layout.dragmode).toBeFalsy();
    expect(layout.autosize).toBeTruthy();
    expect(layout.barmode).toBe('stack');
    expect(plotComponent.prop('config')).toEqual({ displayModeBar: false });
    expect(plotComponent.prop('style')).toEqual({ width: '100%', height: '100%' });
  });
});
