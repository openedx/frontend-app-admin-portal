import React from 'react';
import { act, create } from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import SurveyPage from './index';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('<SurveyPage />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<SurveyPage />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders correctly', async () => {
    let tree;
    await act(async () => {
      tree = create(<SurveyPage />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
