import React from 'react';
import { Button } from '@blueprintjs/core';
import { spawn, IPty } from 'node-pty';
import { useTranslation } from 'react-i18next';
import path from 'path';

import PythonLogViewer from './PythonLogViewer';

type changeLogMessageType = (newChangeLogMessage: string) => {};
type changePathChoiceType = (newPath: string) => {};

function runModelProcess(baseArgs: string[]): IPty {
  const isDev = process.env.NODE_ENV === 'development';
  const isWin = !isDev && process.platform === 'win32';
  const isLinux = !isDev && process.platform === 'linux';

  // TODO: Explain why this path is different for Linux and Windows.
  const modelsRoot = isLinux ? '../..' : '..';
  const modelName = 'serengeti';
  const modelPath = path.join(
    modelsRoot,
    modelName,
    'model',
    'trained_model.pkl'
  );
  // TODO: Display a warning to the user if the grid file is missing.
  const gridFile = path.join(modelsRoot, 'biomonitoring_stations.csv');

  if (isDev) {
    return spawn(
      'venv/bin/python3',
      ['main.py', '--model', modelPath, '--grid_file', gridFile, ...baseArgs],
      { cwd: 'models/runner' }
    );
  }
  if (isWin) {
    return spawn(
      'main.exe',
      [
        '--model',
        modelPath,
        '--grid_file',
        gridFile,
        ...baseArgs,
        '--pytorch_num_workers=0'
      ],
      { cwd: 'models/win_runner/main' }
    );
  }
  if (isLinux) {
    return spawn(
      'main',
      ['--model', modelPath, '--grid_file', gridFile, ...baseArgs],
      { cwd: 'models/linux_runner/main' }
    );
  }
  throw new Error(
    `Unsupported operating system for running models: ${process.platform}`
  );
}

const computePredictions = (
  directory: string,
  savePath: string,
  changeLogMessage: changeLogMessageType
) => {
  const args: string[] = [
    '--input_folder',
    directory,
    '--output',
    savePath,
    '--keep_scores',
    '--overwrite'
  ];

  const pyProcess = runModelProcess(args);

  pyProcess.on('data', data => {
    // eslint-disable-next-line no-console
    changeLogMessage(data);
  });

  pyProcess.on('exit', exitCode => {
    // eslint-disable-next-line no-console
    console.log(`Exiting with code ${exitCode}`);
  });
};

const chooseDirectory = (changeDirectoryChoice: changePathChoiceType) => {
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

function chooseSavePath(changeSavePathChoice: changePathChoiceType) {
  // eslint-disable-next-line global-require
  const { dialog, app } = require('electron').remote;
  dialog
    .showSaveDialog({
      defaultPath: `${app.getPath('documents')}/classification_result.csv`,
      filters: [
        { name: 'CSV', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    .then(result => {
      if (!result.canceled) {
        changeSavePathChoice(result.filePath ? result.filePath : '');
      }
      return null;
    })
    .catch(error => {
      // eslint-disable-next-line no-alert
      alert(error);
    });
}

type Props = {
  changeLogMessage: changeLogMessageType;
  changeDirectoryChoice: changePathChoiceType;
  changeSavePathChoice: changePathChoiceType;
  logMessage: string;
  directoryChoice: string;
  savePath: string;
};

export default function Classifier(props: Props) {
  const {
    directoryChoice,
    savePath,
    logMessage,
    changeDirectoryChoice,
    changeSavePathChoice,
    changeLogMessage
  } = props;
  const { t } = useTranslation();

  return (
    <div style={{ padding: '30px 30px', width: '60vw' }}>
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

      <div className="bp3-input-group" style={{ marginBottom: '10px' }}>
        <input
          type="text"
          className="bp3-input"
          placeholder={t('Choose where to save the classification results')}
          value={savePath}
          onChange={e => {
            changeSavePathChoice(e.target.value);
          }}
        />
        <button
          aria-label="Search"
          type="submit"
          className="bp3-button bp3-minimal bp3-intent-primary bp3-icon-search"
          onClick={() => {
            chooseSavePath(changeSavePathChoice);
          }}
        />
      </div>

      <Button
        text={t('Find animals!')}
        icon="predictive-analysis"
        onClick={() => {
          computePredictions(
            props.directoryChoice,
            props.savePath,
            changeLogMessage
          );
        }}
        style={{ marginBottom: '10px', backgroundColor: '#fff' }}
      />

      <PythonLogViewer logMessage={logMessage} />
    </div>
  );
}
