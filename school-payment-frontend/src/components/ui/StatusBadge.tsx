import React from 'react';
import { Badge } from './Badge';
import { getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  return (
    <Badge className={getStatusColor(status)}>
      {label}
    </Badge>
  );
};

export default StatusBadge;