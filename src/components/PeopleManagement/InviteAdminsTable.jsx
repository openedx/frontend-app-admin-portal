import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Badge,
  IconButton,
} from '@openedx/paragon';
import { Search, Download } from '@openedx/paragon/icons';

// import AdminActionsMenu from './AdminActionsMenu';

const InviteAdminsTable = ({
  admins,
  loading,
  onAddAdmin,
  onSearch,
  onDownloadCsv,
}) => (
  <Card className="p-4 shadow-sm">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h4 className="mb-1">Your organization’s admins</h4>
        <p className="text-muted mb-0">
          View all admins of your organization.
        </p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <IconButton
          iconAs={Download}
          variant="outline-primary"
          aria-label="Download admins CSV"
          onClick={onDownloadCsv}
        />
        <Button variant="primary" onClick={onAddAdmin}>
          + Add admins
        </Button>
      </div>
    </div>

    {/* Search */}
    <div className="mb-3 d-flex align-items-center">
      <Search className="me-2 text-muted" />
      <input
        type="text"
        className="form-control form-control-sm"
        style={{ maxWidth: 280 }}
        placeholder="Search by admin details"
        aria-label="Search admins"
        onChange={e => onSearch?.(e.target.value)}
      />
    </div>

    {/* Content */}
    {loading && (
      <div className="text-center py-5">Loading…</div>
    )}

    {!loading && admins.length === 0 && (
      <div className="text-center py-5 text-muted">
        No admins found
      </div>
    )}

    {!loading && admins.length > 0 && (
      <div className="d-flex flex-column gap-3">
        {admins.map((admin, idx) => (
          <Card key={admin.email || idx} className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              {/* User info */}
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40 }}
                >
                  <span className="fw-bold">
                    {admin.name?.charAt(0)}
                  </span>
                </div>

                <div>
                  <div className="fw-bold">{admin.name}</div>
                  <div className="text-muted small">{admin.email}</div>
                </div>
              </div>

              {/* Joined */}
              <div className="d-none d-md-block">
                <div className="text-muted small">Joined org</div>
                <div>{admin.joined}</div>
              </div>

              {/* Role */}
              <div>
                <div className="text-muted small">Role</div>
                <Badge
                  variant={admin.role === 'Admin' ? 'success' : 'warning'}
                  className="text-uppercase"
                >
                  {admin.role}
                </Badge>
              </div>

              {/* Actions */}
              {/* <AdminActionsMenu
                onRemove={() => onRemoveAdmin?.(admin)}
              /> */}
            </div>
          </Card>
        ))}
      </div>
    )}

    {/* Pagination */}
    <div className="d-flex justify-content-between align-items-center mt-4 text-muted">
      <span>1 of 1</span>
      <div>
        <Button variant="ghost" size="sm" type="button">{'<'}</Button>
        <Button variant="ghost" size="sm" type="button">{'>'}</Button>
      </div>
    </div>
  </Card>
);

InviteAdminsTable.propTypes = {
  admins: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      joined: PropTypes.string,
      role: PropTypes.string,
    }),
  ),
  loading: PropTypes.bool,
  onAddAdmin: PropTypes.func,
  onSearch: PropTypes.func,
  onDownloadCsv: PropTypes.func,
};

InviteAdminsTable.defaultProps = {
  admins: [],
  loading: false,
  onAddAdmin: undefined,
  onSearch: undefined,
  onDownloadCsv: undefined,
};

export default InviteAdminsTable;
