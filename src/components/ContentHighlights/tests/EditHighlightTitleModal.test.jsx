import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import EditHighlightTitleModal from '../EditHighlightTitleModal';
import { MAX_HIGHLIGHT_TITLE_LENGTH } from '../data/constants';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const CURRENT_TITLE = 'Current Highlight Title';

const renderComponent = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentTitle: CURRENT_TITLE,
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  return render(
    <IntlProvider locale="en">
      <EditHighlightTitleModal {...defaultProps} {...props} />
    </IntlProvider>,
  );
};

const expectDuplicateNameError = () => {
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText(/A highlight with this name already exists/)).toBeInTheDocument();
  expect(screen.getByText(/Please enter a unique name/)).toBeInTheDocument();
};

describe('<EditHighlightTitleModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the current title and save enabled', () => {
    renderComponent();

    expect(screen.getByText('Edit highlight name')).toBeInTheDocument();
    expect(screen.getByTestId('edit-highlight-title-input')).toHaveValue(CURRENT_TITLE);
    expect(screen.getByText(`${CURRENT_TITLE.length} / ${MAX_HIGHLIGHT_TITLE_LENGTH}`)).toBeInTheDocument();
    expect(screen.getByTestId('edit-highlight-title-save-button')).toBeEnabled();
  });

  it('disables save when the title is empty or whitespace', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByTestId('edit-highlight-title-input');
    await user.clear(input);
    await user.type(input, '   ');

    expect(screen.getByTestId('edit-highlight-title-save-button')).toBeDisabled();
  });

  it('prevents typing beyond the max title length', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByTestId('edit-highlight-title-input');
    await user.clear(input);
    await user.type(input, 'a'.repeat(MAX_HIGHLIGHT_TITLE_LENGTH + 5));

    expect(input).toHaveValue('a'.repeat(MAX_HIGHLIGHT_TITLE_LENGTH));
    expect(screen.getByText(`${MAX_HIGHLIGHT_TITLE_LENGTH} / ${MAX_HIGHLIGHT_TITLE_LENGTH}`)).toBeInTheDocument();
  });

  it('trims title and calls onSave then onClose', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSave = jest.fn().mockResolvedValue(undefined);
    renderComponent({ onClose, onSave });

    const input = screen.getByTestId('edit-highlight-title-input');
    await user.clear(input);
    await user.type(input, '  Updated title  ');
    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Updated title');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('opens error modal and logs error when save fails', async () => {
    const user = userEvent.setup();
    const saveError = new Error('save failed');
    const onSave = jest.fn().mockRejectedValue(saveError);
    const onClose = jest.fn();
    renderComponent({ onSave, onClose });

    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expect(logError).toHaveBeenCalledWith(saveError);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/Something went wrong behind the scenes/)).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows duplicate name error when API returns title already exists', async () => {
    const user = userEvent.setup();
    const duplicateError = {
      response: { data: { title: ['A highlight set with this title already exists for this enterprise.'] } },
    };
    const onSave = jest.fn().mockRejectedValue(duplicateError);
    const onClose = jest.fn();
    renderComponent({ onSave, onClose });

    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expectDuplicateNameError();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows duplicate name error when API returns non_field_errors already exists', async () => {
    const user = userEvent.setup();
    const duplicateError = {
      response: { data: { non_field_errors: ['A highlight with this title already exists.'] } },
    };
    const onSave = jest.fn().mockRejectedValue(duplicateError);
    const onClose = jest.fn();
    renderComponent({ onSave, onClose });

    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expectDuplicateNameError();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows duplicate name error and does not call onSave for client-side duplicate title', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderComponent({
      onSave,
      onClose,
      existingHighlightTitles: ['Recommended for Marketing'],
    });

    const input = screen.getByTestId('edit-highlight-title-input');
    await user.clear(input);
    await user.type(input, 'recommended for marketing');
    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
      expectDuplicateNameError();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes modal when "Exit and discard changes" is clicked on error modal', async () => {
    const user = userEvent.setup();
    const saveError = new Error('save failed');
    const onSave = jest.fn().mockRejectedValue(saveError);
    const onClose = jest.fn();
    renderComponent({ onSave, onClose });

    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expect(screen.getByText('Exit and discard changes')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Exit and discard changes'));
    expect(onClose).toHaveBeenCalled();
  });

  it('returns to form when "Try Again" is clicked on error modal', async () => {
    const user = userEvent.setup();
    const saveError = new Error('save failed');
    const onSave = jest.fn().mockRejectedValue(saveError);
    const onClose = jest.fn();
    renderComponent({ onSave, onClose });

    await user.click(screen.getByTestId('edit-highlight-title-save-button'));

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Try again'));
    expect(onClose).not.toHaveBeenCalled();
    // The edit modal should still be open with the input visible
    expect(screen.getByTestId('edit-highlight-title-input')).toBeInTheDocument();
  });

  it('resets title to currentTitle when modal is reopened after typing without saving', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderComponent({ onClose, onSave, isOpen: true });

    // Type a new value without saving
    const input = screen.getByTestId('edit-highlight-title-input');
    await user.clear(input);
    await user.type(input, 'Something new');
    expect(input).toHaveValue('Something new');

    // Close the modal without saving (isOpen -> false)
    rerender(
      <IntlProvider locale="en">
        <EditHighlightTitleModal
          isOpen={false}
          onClose={onClose}
          currentTitle={CURRENT_TITLE}
          onSave={onSave}
        />
      </IntlProvider>,
    );

    // Reopen the modal (isOpen -> true)
    rerender(
      <IntlProvider locale="en">
        <EditHighlightTitleModal
          isOpen
          onClose={onClose}
          currentTitle={CURRENT_TITLE}
          onSave={onSave}
        />
      </IntlProvider>,
    );

    // Should show the original title, not what the user typed
    expect(screen.getByTestId('edit-highlight-title-input')).toHaveValue(CURRENT_TITLE);
  });
});
