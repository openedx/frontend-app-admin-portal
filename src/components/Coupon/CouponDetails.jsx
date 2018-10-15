import React from 'react';
import { Button, CheckBox, Icon } from '@edx/paragon';

import H3 from '../H3';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import EcommerceApiService from '../../data/services/EcommerceApiService';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.tableColumns = [
      {
        label: <CheckBox />,
        key: 'select',
      },
      {
        label: 'Assigned To',
        key: 'assigned_to',
      },
      {
        label: 'Redemptions',
        key: 'redemptions',
      },
      {
        label: 'Code',
        key: 'title',
      },
      {
        label: 'Actions',
        key: 'actions',
      },
    ];

    this.state = {
      selectedFilter: null,
    };

    this.formatCouponData = this.formatCouponData.bind(this);
  }

  setSelectedFilter(selectedFilter) {
    this.setState({
      selectedFilter,
    });
  }

  getActionButton(code) {
    const { assigned_to: assignedTo, redemptions } = code;

    if (redemptions.used === redemptions.available) {
      return null;
    }

    const button = {
      label: 'Assign',
      onClick: () => {},
    };

    if (assignedTo) {
      button.label = 'Revoke';
      button.onClick = () => {};
    }

    return (
      <Button
        className={[
          'btn-link',
          'btn-sm',
          'pl-0',
        ]}
        label={button.label}
        onClick={button.onClick}
      />
    );
  }

  formatCouponData(data) {
    return data.map(code => ({
      ...code,
      redemptions: `${code.redemptions.used} of ${code.redemptions.available}`,
      actions: this.getActionButton(code),
      select: <CheckBox />,
    }));
  }

  render() {
    const { selectedFilter } = this.state;

    return (
      <div className="details row no-gutters px-2 my-3">
        <div className="col">
          <div className="details-header row mb-2">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <H3>Coupon Details</H3>
            </div>
            <div className="col-12 col-md-6 mb-2 mb-md-0 text-md-right">
              <DownloadCsvButton id="coupon-details" fetchMethod={() => {}} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col d-flex justify-content-between align-items-center">
              <div className="filters d-flex align-items-center">
                <span className="mr-2">Filter:</span>
                <Button
                  className={['btn-sm']}
                  buttonType={selectedFilter === 'not-assigned' ? 'primary' : 'link'}
                  label="Not Assigned"
                  onClick={() => this.setSelectedFilter('not-assigned')}
                />
                <Button
                  className={['btn-sm']}
                  buttonType={selectedFilter === 'not-redeemed' ? 'primary' : 'link'}
                  label="Not Redeemed"
                  onClick={() => this.setSelectedFilter('not-redeemed')}
                />
                {selectedFilter &&
                  <Button
                    className={['btn-sm', 'btn-outline-primary', 'ml-2']}
                    label={
                      <React.Fragment>
                        <Icon className={['fa', 'fa-close', 'mr-1']} />
                        Clear filters
                      </React.Fragment>
                    }
                    onClick={() => this.setSelectedFilter(null)}
                  />
                }
              </div>
            </div>
          </div>
          <TableContainer
            id="coupon-details"
            className="coupon-details"
            fetchMethod={EcommerceApiService.fetchCouponDetails}
            columns={this.tableColumns}
            formatData={this.formatCouponData}
          />
        </div>
      </div>
    );
  }
}

export default CouponDetails;
