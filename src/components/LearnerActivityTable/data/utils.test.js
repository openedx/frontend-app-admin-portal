import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { trackDataTableEvent, updateUrlWithPageNumber } from './utils';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('trackDataTableEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends track event when shouldTrackRef.current is true', () => {
    // Setup
    const shouldTrackRef = { current: true };
    const enterpriseId = 'test-enterprise-id';
    const eventName = 'test-event-name';
    const tableId = 'test-table-id';
    const options = { page: 1, pageSize: 10 };

    // Execute
    const result = trackDataTableEvent({
      shouldTrackRef,
      enterpriseId,
      eventName,
      tableId,
      options,
    });

    // Verify
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      eventName,
      {
        tableId,
        ...options,
      },
    );
    expect(result).toBe(true);
    expect(shouldTrackRef.current).toBe(true); // Remains true
  });

  it('does not send track event but sets shouldTrackRef to true when initial value is false', () => {
    // Setup
    const shouldTrackRef = { current: false };
    const enterpriseId = 'test-enterprise-id';
    const eventName = 'test-event-name';
    const tableId = 'test-table-id';
    const options = { page: 1, pageSize: 10 };

    // Execute
    const result = trackDataTableEvent({
      shouldTrackRef,
      enterpriseId,
      eventName,
      tableId,
      options,
    });

    // Verify
    expect(sendEnterpriseTrackEvent).not.toHaveBeenCalled();
    expect(result).toBe(true);
    expect(shouldTrackRef.current).toBe(true); // Changed to true
  });

  it('handles undefined options properly', () => {
    // Setup
    const shouldTrackRef = { current: true };
    const enterpriseId = 'test-enterprise-id';
    const eventName = 'test-event-name';
    const tableId = 'test-table-id';

    // Execute
    trackDataTableEvent({
      shouldTrackRef,
      enterpriseId,
      eventName,
      tableId,
    });

    // Verify
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      eventName,
      {
        tableId,
      },
    );
  });
});

describe('updateUrlWithPageNumber', () => {
  const mockNavigate = jest.fn();
  const createMockLocation = (search = '') => ({
    pathname: '/test-path',
    search,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds page number to URL when pageNumber is not 1', () => {
    const location = createMockLocation();
    const pageNumber = 3;
    const id = 'test-table';

    updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith('/test-path?test-table-page=3', { replace: true });
  });

  it('removes page number from URL when pageNumber is 1', () => {
    const location = createMockLocation('?test-table-page=3&filter=active');
    const pageNumber = 1;
    const id = 'test-table';

    updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith('/test-path?filter=active', { replace: true });
  });

  it('respects existing query parameters when adding page number', () => {
    const location = createMockLocation('?filter=active&sort=name');
    const pageNumber = 2;
    const id = 'test-table';

    updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith('/test-path?filter=active&sort=name&test-table-page=2', { replace: true });
  });

  it('uses replace=false when specified', () => {
    const location = createMockLocation();
    const pageNumber = 2;
    const id = 'test-table';

    updateUrlWithPageNumber(id, pageNumber, location, mockNavigate, false);

    expect(mockNavigate).toHaveBeenCalledWith('/test-path?test-table-page=2', { replace: false });
  });
});
