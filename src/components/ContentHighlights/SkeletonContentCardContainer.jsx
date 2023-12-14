import PropTypes from 'prop-types';
import { CardGrid } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import SkeletonContentCard from './SkeletonContentCard';
import { HIGHLIGHTS_CARD_GRID_COLUMN_SIZES } from './data/constants';

const SkeletonContentCardContainer = ({ itemCount, columnSizes }) => (
  <CardGrid columnSizes={columnSizes}>
    {[
      ...new Array(itemCount),
    ].map(() => <SkeletonContentCard key={uuidv4()} />)};
  </CardGrid>
);

SkeletonContentCardContainer.propTypes = {
  itemCount: PropTypes.number.isRequired,
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
