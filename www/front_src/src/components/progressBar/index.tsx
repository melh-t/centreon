import * as React from 'react';

import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { Step, StepLabel, Stepper } from '@material-ui/core';

interface Props {
  activeStep: number;
  steps: Array<string>;
}

const ProgressBar = ({ steps, activeStep }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Stepper alternativeLabel activeStep={activeStep}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{t(label)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressBar;
