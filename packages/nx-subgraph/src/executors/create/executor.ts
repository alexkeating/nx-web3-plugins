import { CreateExecutorSchema } from './schema';
import { exec } from '@actions/exec';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(options: CreateExecutorSchema) {
  console.log('Executor ran for create', options);
  const codegenCode = await exec(
    `graph create ${options.name} --node ${options.node}`
  );
  if (codegenCode !== 0) {
    return {
      success: false,
      exitCode: codegenCode,
    };
  }
  return {
    success: true,
  };
}
