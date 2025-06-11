import React from 'react';
import Plot from 'react-plotly.js';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import EmptyChart from './EmptyChart';

jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => <div data-testid="Plot" />),
}));

describe('EmptyChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    xaxis: { visible: true },
    yaxis: { visible: true },
    margin: {
      t: 0, b: 0, l: 0, r: 0,
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    autosize: true,
    dragmode: false,
  };

  it('renders correctly', () => {
    render(
      <IntlProvider locale="en">
        <EmptyChart />
      </IntlProvider>,
    );
    expect(screen.getByTestId('Plot')).toBeInTheDocument();
    expect(Plot).toHaveBeenCalledWith(
      {
        data: [],
        layout: defaultLayout,
        config: { displayModeBar: false },
        style: { width: '100%', height: '100%' },
      },
      {}, // React automatically passes the ref as the second argument
    );
  });

  it('renders custom message', () => {
    const message = 'coming soon...';
    render(
      <IntlProvider locale="en">
        <EmptyChart message={message} />,
      </IntlProvider>,
    );
    expect(screen.getByTestId('Plot')).toBeInTheDocument();
    const expectedLayout = {
      ...defaultLayout,
      annotations: [
        {
          ...defaultLayout.annotations[0],
          text: message,
        },
        ...defaultLayout.annotations.slice(1),
      ],
    };
    expect(Plot).toHaveBeenCalledWith(
      {
        data: [],
        layout: expectedLayout,
        config: { displayModeBar: false },
        style: { width: '100%', height: '100%' },
      },
      {}, // React passes the ref as the second argument
    );
  });
});
