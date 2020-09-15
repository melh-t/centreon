import * as React from 'react';

import { isNil, find, propEq, any, invertObj, path } from 'ramda';

import { makeStyles } from '@material-ui/core';
import DetailsTab from './Details';
import {
  labelDetails,
  labelGraph,
  labelTimeline,
  labelShortcuts,
} from '../../translatedLabels';
import GraphTab from './Graph';
import { ResourceDetails } from '../models';
import TimelineTab from './Timeline';
import ShortcutsTab from './Shortcuts';
import hasDefinedValues from '../../hasDefinedValues';

const detailsTabId = 0;
const timelineTabId = 1;
const graphTabId = 2;
const shortcutsTabId = 3;

export type TabId = 0 | 1 | 2 | 3;

export interface TabProps {
  details?: ResourceDetails;
}

interface Tab {
  id: TabId;
  Component: (props: TabProps) => JSX.Element;
  title: string;
  getIsActive: (details) => boolean;
}

const tabs: Array<Tab> = [
  {
    id: detailsTabId,
    Component: DetailsTab,
    title: labelDetails,
    getIsActive: (): boolean => true,
  },
  {
    id: timelineTabId,
    Component: TimelineTab,
    title: labelTimeline,
    getIsActive: (): boolean => true,
  },
  {
    id: graphTabId,
    Component: GraphTab,
    title: labelGraph,
    getIsActive: (details: ResourceDetails): boolean => {
      if (isNil(details)) {
        return false;
      }

      return !isNil(path(['links', 'endpoints', 'performance_graph'], details));
    },
  },
  {
    id: shortcutsTabId,
    Component: ShortcutsTab,
    title: labelShortcuts,
    getIsActive: (details: ResourceDetails): boolean => {
      if (isNil(details)) {
        return false;
      }

      const { links, parent } = details;
      const parentUris = parent?.links.uris;

      return any(hasDefinedValues, [parentUris, links.uris]);
    },
  },
];

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
}));

interface TabByIdProps {
  details?: ResourceDetails;
  id: number;
}

const TabById = ({ id, details }: TabByIdProps): JSX.Element | null => {
  const classes = useStyles();

  const { Component } = find(propEq('id', id), tabs) as Tab;

  return (
    <div className={classes.container}>
      <Component details={details} />
    </div>
  );
};

const tabIdByLabel = {
  details: detailsTabId,
  timeline: timelineTabId,
  shortcuts: shortcutsTabId,
  graph: graphTabId,
};

const getTabIdFromLabel = (label: string): TabId => {
  return tabIdByLabel[label];
};

const getTabLabelFromId = (id: TabId): string => {
  return invertObj(tabIdByLabel)[id];
};

export {
  detailsTabId,
  timelineTabId,
  graphTabId,
  shortcutsTabId,
  tabs,
  TabById,
  getTabIdFromLabel,
  getTabLabelFromId,
};
