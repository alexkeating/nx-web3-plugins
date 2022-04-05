import { ServeExecutorSchema } from './schema';
import { ExecutorContext, runExecutor } from '@nrwl/devkit';
import { getExecOutput } from '@actions/exec';
import * as net from 'net';

/**
 * Check if a port is free on a certain host
 * @param {number} port
 * @param {string} host
 * @returns {Promise<[number , string , boolean]>}
 */
const isFreePort = (
  port: number,
  host = '0.0.0.0'
): Promise<[number, string, boolean]> => {
  return new Promise((resolve) => {
    if (!net.isIPv4(host) || port < 0 || port > 65535) {
      resolve([port, host, false]);
    } else {
      const server = net.createServer();

      server.on('error', () => resolve([port, host, false]));
      server.listen(port, host);

      server.on('listening', () => {
        server.close();
        server.unref();
      });

      server.on('close', () => resolve([port, host, true]));
    }
  });
};

const checkComposePorts = async (ports: number[]) => {
  for (const port of ports) {
    const free = await isFreePort(port);
    if (!free) {
      return { free: false, port: port };
    }
  }
  return { free: true };
};

// Check if ports are in use 5432, 5001, 8000, 8001, 8020, 8030,8040
// 1. check docker compose is running
// 3. if running deploy locally
// 3. if not running start
export default async function serveExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for Deploy', options);
  const freePorts = await checkComposePorts([
    5432, 5001, 8000, 8001, 8020, 8030, 8040,
  ]);
  if (!freePorts.free) {
    return {
      success: false,
      error: `Ports are not open ${freePorts.port}`,
    };
  }
  // TODO: change p
  const output = await getExecOutput(
    `docker compose -p ${context.root} -f ./docker-compose.yml up`
  );
  if (output.exitCode !== 0) {
    return {
      success: false,
      error: output.stderr,
    };
  }
  // build
  // Figure out how to add watching
  const resp = await runExecutor(
    { project: context.projectName, target: 'build' },
    {},
    context
  );
  if (!resp[0].success) {
    return {
      success: false,
      error: 'Failed to build subgraph',
    };
  }
  const deployResp = await runExecutor(
    { project: context.projectName, target: 'deploy' },
    {},
    context
  );
  if (!deployResp[0].success) {
    return {
      success: false,
      error: 'Failed to build subgraph',
    };
  }

  // then deploy locally
  return {
    success: true,
  };
}
