import React from 'react';
import { Card } from '@openedx/paragon';

const SkeletonContentCard = () => (
  <Card isLoading data-testid="card-item-skeleton">
    <Card.ImageCap logoSkeleton />
    <Card.Section className="mt-2" />
    <Card.Footer />
  </Card>
);

export default SkeletonContentCard;
