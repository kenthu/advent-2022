import { readFileSync } from 'fs';

import _ from 'lodash';

interface InputOutput {
  command: string;
  output: string[];
}

type FileSystemNode = File | Directory;

interface File {
  nodeType: 'file';
  name: string;
  size: number;
}
const isFile = (node: FileSystemNode): node is File => node.nodeType === 'file';

interface Directory {
  nodeType: 'directory';
  name: string;
  children: {
    [nodeName: string]: FileSystemNode;
  };
}
const isDirectory = (node: FileSystemNode): node is Directory => node.nodeType === 'directory';

interface LogProcessState {
  cwd: Directory;
  directoryStack: Directory[];
}

const makeEmptyDirectory = (name: string): Directory => ({
  nodeType: 'directory',
  name,
  children: {},
});

const processCommand = (state: LogProcessState, { command, output }: InputOutput): void => {
  if (command.startsWith('cd')) {
    const argument = command.slice(3);
    if (argument === '..') {
      state.directoryStack.pop();
      const newCwd = state.directoryStack.at(-1);
      if (!newCwd) throw new Error('Tried to cd into parent of root');
      state.cwd = newCwd;
    } else if (argument === '/') {
      state.cwd = state.directoryStack[0];
      state.directoryStack = [state.cwd];
    } else {
      const directory = state.cwd.children[argument];
      if (!directory) throw new Error(`Directory ${argument} not found`);
      if (isFile(directory)) throw new Error('Tried to cd into file');
      state.cwd = directory;
      state.directoryStack.push(directory);
    }
  } else if (command === 'ls') {
    for (const line of output) {
      const args = line.split(' ');
      if (args[0] === 'dir') {
        state.cwd.children[args[1]] = makeEmptyDirectory(args[1]);
      } else {
        state.cwd.children[args[1]] = {
          nodeType: 'file',
          name: args[1],
          size: Number(args[0]),
        };
      }
    }
  } else {
    throw new Error(`Unrecognized command: ${command}`);
  }
};

const totalSize = (dir: Directory): number => {
  return Object.values(dir.children).reduce((acc, fsNode) => {
    if (isFile(fsNode)) {
      return acc + fsNode.size;
    } else {
      return acc + totalSize(fsNode);
    }
  }, 0);
};

const allTotalSizes = (dir: Directory): number[] => {
  const childrenTotalSizes = Object.values(dir.children)
    .filter<Directory>(isDirectory)
    .reduce<number[]>((acc, directory) => acc.concat(allTotalSizes(directory)), []);
  return [totalSize(dir), ...childrenTotalSizes];
};

/**
 * @returns root directory of file system
 */
const ingestInput = (filename: string): Directory => {
  const inputOutputs = readFileSync(filename, 'utf8')
    .trimEnd()
    .split(/\n(?=\$)/)
    .map((inputOutput) => {
      const lines = inputOutput.split('\n');
      return {
        command: lines[0].slice(2),
        output: lines.slice(1),
      };
    });

  const fileSystemRoot = makeEmptyDirectory('');
  const state: LogProcessState = { cwd: fileSystemRoot, directoryStack: [fileSystemRoot] };
  for (const inputOutput of inputOutputs) {
    processCommand(state, inputOutput);
  }
  return state.directoryStack[0];
};

const result = (filename: string): number | undefined => {
  const DISK_SIZE = 70000000;
  const FREE_SPACE_NEEDED = 30000000;

  const root = ingestInput(filename);
  const currentFreeSpace = DISK_SIZE - totalSize(root);
  const needToDelete = FREE_SPACE_NEEDED - currentFreeSpace;
  const candidates = allTotalSizes(root);

  return _.min(candidates.filter((candidate) => candidate >= needToDelete));
};

// Test
console.log(result('day07/test-input.txt'));
// 24933642

// Solution
console.log(result('day07/input.txt'));
// 7068748
