import React from 'react';
import { shallow } from 'enzyme';
import Plot from 'react-plotly.js';
import ScatterChart from './ScatterChart';

describe('ScatterChart', () => {
  const colorMap = { A: 'red', B: 'blue' };
  const hovertemplate = 'c=%{customdata[0]}<br>x=%{x}<br>y=%{y}';

  const props = {
    data: [
      {
        category: 'A', x: 1, y: 2, weight: 3,
      },
      {
        category: 'B', x: 3, y: 4, weight: 5,
      },
    ],
    xKey: 'x',
    yKey: 'y',
    colorKey: 'category',
    colorMap,
    hovertemplate,
    xAxisTitle: 'X Axis',
    yAxisTitle: 'Y Axis',
    markerSizeKey: 'weight',
    customDataKeys: ['category'],
  };

  it('renders correctly', () => {
    const wrapper = shallow(
      <ScatterChart {...props} />,
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
    expect(traces[0].marker.size).toEqual([6.045]);
    expect(traces[1].marker.size).toEqual([6.075]);
    expect(traces[0].customdata[0]).toEqual(['A']);
    expect(traces[1].customdata[0]).toEqual(['B']);
    traces.forEach(trace => {
      expect(trace.type).toBe('scatter');
      expect(trace.mode).toBe('markers');
      expect(trace.hovertemplate).toBe(hovertemplate);
    });

    const layout = plotComponent.prop('layout');
    expect(layout.xaxis.title).toBe('X Axis');
    expect(layout.yaxis.title).toBe('Y Axis');
    expect(layout.dragmode).toBeFalsy();
    expect(layout.autosize).toBeTruthy();
    expect(layout.legend.itemsizing).toBe('constant');
    expect(plotComponent.prop('config')).toEqual({ displayModeBar: false });
    expect(plotComponent.prop('style')).toEqual({ width: '100%', height: '100%' });
  });
});
