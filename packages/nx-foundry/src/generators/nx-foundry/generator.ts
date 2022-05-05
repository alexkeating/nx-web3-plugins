import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { NxFoundryGeneratorSchema } from './schema';

interface NormalizedSchema extends NxFoundryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: NxFoundryGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (tree: Tree, options: NxFoundryGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge build --root ${normalizedOptions.projectRoot}`,
        },
      },
      install: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge install --root ${normalizedOptions.projectRoot}`,
        },
      },
      update: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge update --root ${normalizedOptions.projectRoot}`,
        },
      },
      test: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge test --root ${normalizedOptions.projectRoot}`,
        },
      },
      trace: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge test -vvvv --root ${normalizedOptions.projectRoot}`,
        },
      },
      clean: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge clean --root ${normalizedOptions.projectRoot}`,
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
