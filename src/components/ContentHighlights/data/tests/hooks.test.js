/* eslint-disable react/jsx-filename-extension */
import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentHighlightsContext, initialStateValue, testCourseAggregation } from '../../../../data/tests/ContentHighlightsTestData';
import { useContentHighlightsContext } from '../hooks';

const TestComponent = () => {
  const [rowId, setRowId] = useState('');
  const { deleteSelectedRowId, setCatalogVisibilityAlert } = useContentHighlightsContext();

  const handleDelete = () => {
    deleteSelectedRowId(rowId);
  };

  const handleSetCatalogVisibilityAlert = () => {
    setCatalogVisibilityAlert({ isOpen: true });
  };
  return (
    <div>
      <input type="text" placeholder="Enter row id" onChange={e => setRowId(e.target.value)} />
      <button type="button" onClick={handleDelete}>Delete</button>
      <button type="button" onClick={handleSetCatalogVisibilityAlert}>Set Catalog Visibility Alert</button>
    </div>
  );
};

describe('deleteSelectedRowId', () => {
  it('should delete the selected row id', () => {
    const { getByText, getByPlaceholderText } = render(
      <ContentHighlightsContext value={
                {
                  ...initialStateValue,
                  stepperModal: {
                    ...initialStateValue.stepperModal,
                    currentSelectedRowIds: testCourseAggregation,
                  },
                }
    }
      >
        <TestComponent />
      </ContentHighlightsContext>,
    );
    const input = getByPlaceholderText('Enter row id');
    const button = getByText('Delete');
    fireEvent.change(input, { target: { value: '123' } });
    userEvent.click(button);
  });
});
describe('setCatalogVisibilityAlert', () => {
  it('should set the catalog visibility alert', () => {
    const { getByText } = render(
      <ContentHighlightsContext value={initialStateValue}>
        <TestComponent />
      </ContentHighlightsContext>,
    );
    const button = getByText('Set Catalog Visibility Alert');
    userEvent.click(button);
  });
});
