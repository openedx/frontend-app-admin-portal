import PropTypes from 'prop-types';
import { CardGrid } from '@edx/paragon';
import SkeletonContentCard from './SkeletonContentCard';
import { HIGHLIGHTS_CARD_GRID_COLUMN_SIZES } from './data/constants';

const SkeletonContentCardContainer = ({ length, columnSizes }) => (
  <CardGrid columnSizes={columnSizes}>
    {[
      ...new Array(length),
    // eslint-disable-next-line react/no-array-index-key
    ].map((_, index) => <SkeletonContentCard key={index} />)};
  </CardGrid>
);

SkeletonContentCardContainer.propTypes = {
  length: PropTypes.number.isRequired,
  columnSizes: PropTypes.shape({
    xs: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
};

SkeletonContentCardContainer.defaultProps = {
  columnSizes: HIGHLIGHTS_CARD_GRID_COLUMN_SIZES,
};

export default SkeletonContentCardContainer;
