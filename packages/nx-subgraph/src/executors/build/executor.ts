import { DeployExecutorSchema } from './schema';
import { exec } from 'child_process';

export default async function runExecutor(options: DeployExecutorSchema) {
  console.log('Executor ran for Deploy', options);
  return {
    success: true,
  };
}
