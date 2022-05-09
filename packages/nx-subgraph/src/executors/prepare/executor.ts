import { PrepareExecutorSchema } from './schema';
import { prepareFile } from './prepare';
import { ExecutorContext } from '@nrwl/devkit';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { safeLoad } from 'js-yaml';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(
  options: PrepareExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for prepare', options);
  const data = resolve(`${context.cwd}/manifests`, 'deploy-prep.js');
  // prepareFile(data, options.networks, context.cwd);
  return {
    success: true,
  };
}
