import React from 'react';
import { Card } from '@edx/paragon';

const SkeletonContentCard = () => (
  <Card isLoading>
    <Card.ImageCap logoSkeleton />
    <Card.Section className="mt-2" />
    <Card.Footer />
  </Card>
);

export default SkeletonContentCard;