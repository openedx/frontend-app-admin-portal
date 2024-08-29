import {
  Spinner,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import EmptyChart from './charts/EmptyChart';

const ProgressOverlay = ({ isError, message }) => (
  <div className="position-relative" style={{ minHeight: '50vh' }}>
    <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-transparent">
      {isError ? <EmptyChart /> : <Spinner animation="border" variant="primary" screenReaderText={message} />}
    </div>
  </div>
);

ProgressOverlay.propTypes = {
  isError: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};

export default ProgressOverlay;
