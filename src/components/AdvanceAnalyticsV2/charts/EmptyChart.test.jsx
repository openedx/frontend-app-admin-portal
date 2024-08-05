import React from 'react';
import { mount } from 'enzyme';
import Plot from 'react-plotly.js';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EmptyChart from './EmptyChart';

describe('EmptyChart', () => {
  const defaultLayout = {
    annotations: [
      {
        text: 'No matching data found',
        xref: 'paper',
        yref: 'paper',
        showarrow: false,
        font: {
          size: 20,
          color: '#333333',
        },
        x: 0.5,
        y: 0.5,
        xanchor: 'center',
        yanchor: 'middle',
      },
    ],
    xaxis: { visible: false },
    yaxis: { visible: false },
    margin: {
      t: 0, b: 0, l: 0, r: 0,
    },
    paper_bgcolor: 'lightgray',
    plot_bgcolor: 'lightgray',
    autosize: true,
  };

  it('renders correctly', () => {
    const wrapper = mount(
      <IntlProvider locale="en">
        <EmptyChart />
      </IntlProvider>,
    );
    const plotComponent = wrapper.find(Plot);
    expect(plotComponent.prop('data').length).toEqual(0);
    expect(plotComponent.prop('layout')).toEqual(defaultLayout);
    expect(plotComponent.prop('config')).toEqual({ displayModeBar: false });
    expect(plotComponent.prop('style')).toEqual({ width: '100%', height: '100%' });
  });

  it('renders custom message', () => {
    const message = 'coming soon...';
    const wrapper = mount(
      <IntlProvider locale="en">
        <EmptyChart message={message} />,
      </IntlProvider>,
    );
    const plotComponent = wrapper.find(Plot);
    expect(plotComponent.prop('layout').annotations[0].text).toBe(message);
  });
});
