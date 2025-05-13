import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon, Spinner } from '@openedx/paragon';
import classNames from 'classnames';
import { ArrowDownward } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { removeTrailingSlash } from '../../../../utils';

const DetailsAction = ({
  slug, label, isLoading, onClick, dataTestId,
}) => {
  const location = useLocation();
  const { actionSlug } = useParams();
  const slugIndex = location?.pathname.lastIndexOf('/');
  const truncatedURL = location?.pathname.substring(0, slugIndex);

  return (
    <Link
      data-testid={dataTestId}
      key={label}
      to={actionSlug ? `${truncatedURL}/${slug}` : `${removeTrailingSlash(location?.pathname)}/${slug}`}
      onClick={onClick}
    >
      <div
        className={classNames('p-2 d-flex align-items-center justify-content-between', { 'bg-primary-100': slug === actionSlug })}
      >
        <span className="label">{label}</span>
        <Icon src={ArrowDownward} />
        {isLoading && <Spinner animation="border" className="ml-2" variant="primary" size="sm" />}
      </div>
    </Link>
  );
};

DetailsAction.propTypes = {
  slug: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  dataTestId: PropTypes.func,
};

export default DetailsAction;
