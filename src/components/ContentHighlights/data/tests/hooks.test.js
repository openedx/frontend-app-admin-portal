/* eslint-disable react/jsx-filename-extension */
import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentHighlightsContext, initialStateValue, testCourseAggregation } from '../../../../data/tests/ContentHighlightsTestData';
import { useContentHighlightsContext } from '../hooks';

const TestComponent = () => {
  const [rowId, setRowId] = useState('');
  const { deleteSelectedRowId } = useContentHighlightsContext();

  const handleDelete = () => {
    deleteSelectedRowId(rowId);
  };

  return (
    <div>
      <input type="text" placeholder="Enter row id" onChange={e => setRowId(e.target.value)} />
      <button type="button" onClick={handleDelete}>Delete</button>
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
