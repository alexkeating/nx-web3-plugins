import { StopExecutorSchema } from './schema';
import { exec } from '@actions/exec';
import { ExecutorContext } from '@nrwl/devkit';
import * as path from 'path';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(
  options: StopExecutorSchema,
  context: ExecutorContext
) {
  const parsedPath = path.parse(__dirname);
  const composePath = path.join(parsedPath.dir, 'serve', 'docker-compose.yml');
  const codegenCode = await exec(`docker compose stop`);
  if (codegenCode !== 0) {
    throw new Error(`Failed to stop subgraph node ${codegenCode}`);
  }
  return {
    success: true,
  };
}
