import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { isNil } from 'ramda';
import clsx from 'clsx';

import StorageIcon from '@mui/icons-material/Storage';
import LatencyIcon from '@mui/icons-material/Speed';
import { Avatar, Theme } from '@mui/material';
import { CreateCSSProperties, makeStyles } from '@mui/styles';

import { getStatusColors, SeverityCode } from '@centreon/ui';

import {
  labelDatabaseNotActive,
  labelDatabaseUpdateAndActive,
  labelLatencyDetected,
  labelNoLatencyDetected,
} from '../translatedLabels';
import { Issues } from '../models';

interface PollerStatusIconProps {
  issues: Issues | null;
}

interface StyleProps {
  databaseSeverity: SeverityCode;
  latencySeverity: SeverityCode;
}

const getIssueSeverity = ({ issues, key }): SeverityCode => {
  if (!isNil(issues[key]?.warning)) {
    return SeverityCode.Medium;
  }
  if (!isNil(issues[key]?.critical)) {
    return SeverityCode.High;
  }

  return SeverityCode.Ok;
};

const useStatusStyles = makeStyles<Theme, StyleProps>((theme) => {
  const getSeverityColor = (severityCode): CreateCSSProperties<StyleProps> => ({
    background: getStatusColors({
      severityCode,
      theme,
    }).backgroundColor,
    color: getStatusColors({
      severityCode,
      theme,
    }).color,
  });

  return {
    database: ({ databaseSeverity }): CreateCSSProperties<StyleProps> =>
      getSeverityColor(databaseSeverity),
    icon: {
      fontSize: theme.typography.body1.fontSize,
      height: theme.spacing(4),
      position: 'relative',
      width: theme.spacing(4),
    },
    latency: ({ latencySeverity }): CreateCSSProperties<StyleProps> =>
      getSeverityColor(latencySeverity),
  };
});

const PollerStatusIcon = ({ issues }: PollerStatusIconProps): JSX.Element => {
  const databaseSeverity = getIssueSeverity({ issues, key: 'database' });
  const latencySeverity = getIssueSeverity({ issues, key: 'latency' });

  const classes = useStatusStyles({ databaseSeverity, latencySeverity });

  const { t } = useTranslation();

  return (
    <>
      <Avatar
        className={clsx(classes.database, classes.icon)}
        title={
          databaseSeverity === SeverityCode.Ok
            ? t(labelDatabaseUpdateAndActive)
            : t(labelDatabaseNotActive)
        }
      >
        <StorageIcon />
      </Avatar>
      <Avatar
        className={clsx(classes.latency, classes.icon)}
        title={
          latencySeverity === SeverityCode.Ok
            ? t(labelNoLatencyDetected)
            : t(labelLatencyDetected)
        }
      >
        <LatencyIcon />
      </Avatar>
    </>
  );
};

export default PollerStatusIcon;
