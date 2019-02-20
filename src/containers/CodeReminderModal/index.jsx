import { connect } from 'react-redux';

import CodeReminderModal from '../../components/CodeReminderModal';

import sendCodeReminder from '../../data/actions/codeReminder';

const mapStateToProps = state => ({
  couponDetailsTable: state.table['coupon-details'],
});

const mapDispatchToProps = dispatch => ({
  sendCodeReminder: (couponId, options) => new Promise((resolve, reject) => {
    dispatch(sendCodeReminder({
      couponId,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeReminderModal);
