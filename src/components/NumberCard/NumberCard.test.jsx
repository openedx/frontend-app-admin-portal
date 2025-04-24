import React from 'react';
import renderer from 'react-test-renderer';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Groups } from '@openedx/paragon/icons';
import '@testing-library/jest-dom';

import NumberCard from './index';

const NumberCardWrapper = props => (
  <MemoryRouter>
    <NumberCard
      id="test-id"
      className="test-class"
      title={10}
      description="This describes the data!"
      icon={Groups}
      {...props}
    />
  </MemoryRouter>
);

describe('<NumberCard />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('without detail actions', () => {
      const tree = renderer
        .create((
          <NumberCardWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with detail actions', () => {
      const tree = renderer
        .create((
          <NumberCardWrapper
            detailActions={[{
              label: 'Action 1',
              slug: 'action-1',
            }, {
              label: 'Action 2',
              slug: 'action-2',
            }]}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  it('sets a non-number title', () => {
    const { container } = render(<NumberCardWrapper title="10%" />);
    expect(container.querySelector('.card-title span')).toHaveTextContent('10%');
  });

  describe('collapsible detail actions', () => {
    it('expands and collapses the actions', () => {
      const { container, rerender } = render((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
      expect(container.querySelector('.details-btn-text').textContent).toEqual('Details');

      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded
        />,
      );
      expect(container.querySelector('.details-btn-text').textContent).toEqual('Detailed breakdown');
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'true');
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded={false}
        />,
      );
      expect(container.querySelector('.details-btn-text').textContent).toEqual('Details');
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens and closes detail actions with keydown on collapse btn', () => {
      const { container } = render((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
      const toggleButton = container.querySelector('.toggle-collapse');
      fireEvent.keyDown(toggleButton, { key: 'ArrowDown' });
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(toggleButton, { key: 'Escape' });
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes detail actions with enter keydown on action', async () => {
      const { container, rerender } = render((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded
        />,
      );
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'true');
      const firstAction = container.querySelector('.footer-body .btn-link');
      fireEvent.keyDown(firstAction, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.queryByTestId('details-section')).not.toBeInTheDocument();
      });
    });

    it('closes detail actions with escape keydown on action', async () => {
      const { container, rerender } = render(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />,
      );
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded
        />,
      );
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'true');
      const firstAction = container.querySelector('.footer-body .btn-link');
      fireEvent.keyDown(firstAction, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByTestId('details-section')).not.toBeInTheDocument();
      });
    });

    it('sets focus index on actions', async () => {
      const { rerender } = render((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded
        />,
      );
      const actions = await screen.findAllByTestId('details-action-item');
      fireEvent.keyDown(actions[0], { key: 'ArrowDown' });
      expect(actions[1]).toHaveFocus();

      fireEvent.keyDown(actions[1], { key: 'ArrowDown' });
      expect(actions[0]).toHaveFocus();
    });

    it('closes detail actions on action click', async () => {
      const { container, rerender } = render((
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
        />
      ));
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }, {
            label: 'Action 2',
            slug: 'action-2',
          }]}
          detailsExpanded
        />,
      );
      const actions = await screen.findAllByTestId('details-action-item');
      fireEvent.click(actions[0]);
      expect(container.querySelector('.toggle-collapse')).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows loading spinner in action', async () => {
      const { container, rerender } = render(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
            loading: true,
          }]}
          detailsExpanded
        />,
      );
      rerender(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
            loading: true,
          }]}
          detailsExpanded
        />,
      );
      const actions = await screen.findAllByTestId('details-action-item');
      fireEvent.click(actions[0]);
      expect(container.querySelector('.ml-2')).toBeInTheDocument();
    });
    it('should scroll element into view if element exists', async () => {
      document.body.innerHTML = '<div id="learner-progress-report"></div>';
      const element = document.getElementById('learner-progress-report');
      const mockScrollIntoView = jest.fn();
      element.scrollIntoView = mockScrollIntoView;
      render(
        <NumberCardWrapper
          detailActions={[{
            label: 'Action 1',
            slug: 'action-1',
          }]}
        />,
      );

      jest.useFakeTimers();

      const detailAction = await screen.findByTestId('details-action-item');
      fireEvent.click(detailAction);

      jest.runAllTimers();

      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      jest.useRealTimers();
    });
  });
});
