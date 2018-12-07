import React from 'react';
import PropTypes from 'prop-types';
import { Button, CheckBox, Icon } from '@edx/paragon';

import TableContainer from '../../containers/TableContainer';
import EcommerceApiService from '../../data/services/EcommerceApiService';

class CouponDetailsTable extends React.Component {
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

    this.formatCouponData = this.formatCouponData.bind(this);
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
        className={['btn-link', 'btn-sm', 'pl-0']}
        label={button.label}
        onClick={button.onClick}
      />
    );
  }

  formatCouponData(data) {
    return data.map(code => ({
      ...code,
      assigned_to: code.error ? (
        <span className="text-danger">
          <Icon className={['fa', 'fa-exclamation-circle', 'mr-2']} screenReaderText="Error" />
          {code.error}
        </span>
      ) : code.assigned_to,
      redemptions: `${code.redemptions.used} of ${code.redemptions.available}`,
      actions: this.getActionButton(code),
      select: <CheckBox />,
    }));
  }

  render() {
    const { couponId, selectedFilter } = this.props;
    return (
      <TableContainer
        id="coupon-details"
        className="coupon-details-table"
        fetchMethod={() => EcommerceApiService.fetchCouponDetails(couponId, {
          code_filter: selectedFilter ? selectedFilter : 'default'
        })}
        columns={this.tableColumns}
        formatData={this.formatCouponData}
      />
    );
  };
};

CouponDetailsTable.propTypes = {
  couponId: PropTypes.number.isRequired,
  selectedFilter: PropTypes.string,
}

export default CouponDetailsTable;
