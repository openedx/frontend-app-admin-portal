import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import CurrentContentHighlightItemsHeader from '../CurrentContentHighlightItemsHeader';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

jest.mock('../DeleteHighlightSet', () => ({
  __esModule: true,
  default: () => <div data-testid="deleteHighlightSet" />,
}));

const highlightSetUUID = 'fake-uuid';
const highlightTitle = 'fake-title';
const CurrentContentHighlightItemsHeaderWrapper = (props) => (
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[`/test-enterprise/admin/content-highlights/${highlightSetUUID}`]}>
      <Routes>
        <Route
          path="/:enterpriseSlug/admin/content-highlights/:highlightSetUUID"
          element={<CurrentContentHighlightItemsHeader {...props} />}
        />
      </Routes>
    </MemoryRouter>
  </IntlProvider>
);

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading={false} highlightTitle={highlightTitle} />,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('Displays all content data titles', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading={false} highlightTitle={highlightTitle} />,
    );
    expect(screen.getByText(highlightTitle)).toBeInTheDocument();
    expect(screen.getByTestId('deleteHighlightSet')).toBeInTheDocument();
  });

  it('Displays Skeleton on load', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading highlightTitle={highlightTitle} />,
    );
    expect(screen.queryByText(highlightTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId('header-skeleton')).toBeInTheDocument();
  });

  it('shows edit button when onSaveTitle is provided', () => {
    const onSaveTitle = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        onSaveTitle={onSaveTitle}
      />,
    );
    expect(screen.getByTestId('edit-highlight-title-button')).toBeInTheDocument();
  });

  it('hides edit button when onSaveTitle is not provided', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        onSaveTitle={null}
      />,
    );
    expect(screen.queryByTestId('edit-highlight-title-button')).not.toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onSaveTitle = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        onSaveTitle={onSaveTitle}
      />,
    );
    const editButton = screen.getByTestId('edit-highlight-title-button');
    await user.click(editButton);
    expect(screen.getByTestId('edit-highlight-title-input')).toBeInTheDocument();
  });

  it('shows Edit content button and Delete in view mode', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading={false} highlightTitle={highlightTitle} />,
    );
    expect(screen.getByTestId('edit-content-button')).toBeInTheDocument();
    expect(screen.getByTestId('deleteHighlightSet')).toBeInTheDocument();
    expect(screen.queryByTestId('remove-content-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('add-content-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cancel-edit-button')).not.toBeInTheDocument();
  });

  it('calls onEditClick when Edit content button is clicked', () => {
    const onEditClick = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        onEditClick={onEditClick}
      />,
    );
    fireEvent.click(screen.getByTestId('edit-content-button'));
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('shows Manage title, subtitle and three action buttons in edit mode', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
      />,
    );
    expect(screen.getByTestId('manage-highlight-title')).toBeInTheDocument();
    expect(screen.getByTestId('manage-highlight-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('remove-content-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-content-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-edit-button')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-content-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('deleteHighlightSet')).not.toBeInTheDocument();
  });

  it('Remove content button is disabled when selectedCount is 0', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        selectedCount={0}
      />,
    );
    expect(screen.getByTestId('remove-content-button')).toBeDisabled();
  });

  it('Remove content button is enabled when selectedCount > 0', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        selectedCount={2}
      />,
    );
    expect(screen.getByTestId('remove-content-button')).not.toBeDisabled();
  });

  it('calls onCancelClick when Cancel is clicked', () => {
    const onCancelClick = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        onCancelClick={onCancelClick}
      />,
    );
    fireEvent.click(screen.getByTestId('cancel-edit-button'));
    expect(onCancelClick).toHaveBeenCalledTimes(1);
  });

  it('calls onAddContentClick when Add content is clicked', () => {
    const onAddContentClick = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        onAddContentClick={onAddContentClick}
      />,
    );
    fireEvent.click(screen.getByTestId('add-content-button'));
    expect(onAddContentClick).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveSelectedContent when Remove content is clicked with selection', () => {
    const onRemoveSelectedContent = jest.fn();
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        selectedCount={1}
        onRemoveSelectedContent={onRemoveSelectedContent}
      />,
    );
    fireEvent.click(screen.getByTestId('remove-content-button'));
    expect(onRemoveSelectedContent).toHaveBeenCalledTimes(1);
  });

  it('Remove content button shows pending state when isRemoving is true', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        selectedCount={1}
        isRemoving
      />,
    );
    expect(screen.getByText('Removing...')).toBeInTheDocument();
    expect(screen.getByTestId('remove-content-button')).toBeDisabled();
  });

  it('Remove content button is disabled when isRemoving is true even with selectedCount > 0', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper
        isLoading={false}
        highlightTitle={highlightTitle}
        isEditing
        selectedCount={3}
        isRemoving
      />,
    );
    expect(screen.getByTestId('remove-content-button')).toBeDisabled();
  });
});
