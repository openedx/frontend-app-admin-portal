import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AdminCardsSkeleton from './AdminCardsSkeleton';

describe('AdminCardsSkeleton', () => {
  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <IntlProvider>
          <AdminCardsSkeleton />
        </IntlProvider>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
