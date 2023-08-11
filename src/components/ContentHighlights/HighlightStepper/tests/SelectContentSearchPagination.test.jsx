import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseSearchPagination } from '../SelectContentSearchPagination';

describe('<BaseSearchPagination />', () => {
  it('should render correctly and handle pagination correctly', () => {
    const refine = jest.fn();
    render(
      <BaseSearchPagination
        nbPages={5}
        currentRefinement={1}
        refine={refine}
      />,
    );

    const nextButton = screen.getByLabelText('Next, Page 2');
    userEvent.click(nextButton);
    expect(refine).toHaveBeenCalledWith(2);

    const prevButton = screen.getByLabelText('Previous, Page 1');
    userEvent.click(prevButton);
    expect(refine).toHaveBeenCalledWith(1);

    const dropdownButton = screen.getByRole('button', { name: '1 of 5' });
    userEvent.click(dropdownButton);
    const number4 = screen.getByRole('button', { name: '4' });
    // expect(number4).toBeInTheDocument();
    userEvent.click(number4);
    expect(refine).toHaveBeenCalledWith(4);
  });
});
