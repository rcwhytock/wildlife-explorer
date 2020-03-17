import React from 'react';
import { Button } from '@blueprintjs/core';
import { spawn } from 'node-pty';
import { useTranslation } from 'react-i18next';

import PythonLogViewer from './PythonLogViewer';

type changeLogMessageType = (newChangeLogMessage: string) => {};
type changeDirectoryChoiceType = (newDirectory: string) => {};

const computePredictions = (
  directory: string,
  changeLogMessage: changeLogMessageType
) => {
  const args: string[] = [
    './resources/compute_predictions.py',
    '--inpath',
    directory,
    '--outpath',
    'results/'+(new Date()).toISOString()
  ];

  const pyProcess = spawn('python3', args, {});

  pyProcess.on('data', data => {
    // eslint-disable-next-line no-console
    changeLogMessage(data);
  });

  pyProcess.on('exit', exitCode => {
    // eslint-disable-next-line no-console
    console.log(`Exiting with code ${exitCode}`);
  });
};

const chooseDirectory = (changeDirectoryChoice: changeDirectoryChoiceType) => {
  // eslint-disable-next-line global-require
  const { dialog } = require('electron').remote;
  dialog
    .showOpenDialog({
      properties: ['openDirectory']
    })
    .then(result => {
      if (!result.canceled) {
        const directory = result.filePaths[0];
        changeDirectoryChoice(directory);
      }
      return null;
    })
    .catch(error => {
      // eslint-disable-next-line no-alert
      alert(error);
    });
};

type Props = {
  changeLogMessage: changeLogMessageType;
  changeDirectoryChoice: changeDirectoryChoiceType;
  logMessage: string;
  directoryChoice: string;
};

export default function Classifier(props: Props) {
  const {
    directoryChoice,
    logMessage,
    changeDirectoryChoice,
    changeLogMessage
  } = props;
  const { t } = useTranslation();

  return (
    <div style={{ padding: '20px', width: '60vw' }}>
      <h1>{t('Welcome to Mbaza AI!')}</h1>
      <h4>{t('The first offline AI wildlife explorer')}</h4>

      <div className="bp3-input-group" style={{ marginBottom: '10px' }}>
        <input
          type="text"
          className="bp3-input"
          placeholder={t('Choose directory with photos')}
          value={directoryChoice}
          onChange={e => {
            changeDirectoryChoice(e.target.value);
          }}
        />
        <button
          aria-label="Search"
          type="submit"
          className="bp3-button bp3-minimal bp3-intent-primary bp3-icon-search"
          onClick={() => {
            chooseDirectory(changeDirectoryChoice);
          }}
        />
      </div>

      <Button
        text={t('Start predictions!')}
        icon="predictive-analysis"
        onClick={() => {
          computePredictions(props.directoryChoice, changeLogMessage);
        }}
        style={{ marginBottom: '10px', backgroundColor: '#fff' }}
      />

      <PythonLogViewer logMessage={logMessage} />
    </div>
  );
}
