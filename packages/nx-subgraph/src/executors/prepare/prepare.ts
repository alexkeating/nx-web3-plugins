import { readFileSync, writeFileSync } from 'fs';
import { safeLoad, safeDump } from 'js-yaml';
import { resolve } from 'path';

type DataSource = {
  name: string;
  template: string;
  address: string;
  startBlock: number;
};

type Template = {
  name: string;
  template: string;
};

type Config = {
  [key: string]: {
    dataSources: DataSource[];
    templates: Template[];
  };
};

export const prepareFile = (
  config: Config,
  networks: string[],
  cwd: string
) => {
  for (const network of networks) {
    try {
      const fileContents = readFileSync(
        resolve(`${cwd}/manifests`, 'header.yaml'),
        'utf8'
      );
      const data = safeLoad(fileContents);

      config[network].dataSources.forEach((source) => {
        console.log('adding data source: ', source.name);
        const dsFileContents = readFileSync(
          resolve(`${cwd}/manifests`, source.template),
          'utf8'
        );
        const dsData = safeLoad(dsFileContents);

        dsData.network = network;
        dsData.source.address = source.address;
        dsData.source.startBlock = source.startBlock;

        data.dataSources.push(dsData);
      });

      config[network].templates.forEach((source) => {
        console.log('adding data template: ', source.name);
        const dtFileContents = readFileSync(
          resolve(`${cwd}/manifests`, source.template),
          'utf8'
        );
        const dtData = safeLoad(dtFileContents);

        dtData.network = network;

        data.templates.push(dtData);
      });

      const yamlStr = safeDump(data);
      writeFileSync(`${cwd}/subgraph.yaml`, yamlStr, 'utf8');

      console.log('Generated subgraph.yaml for ' + network);
    } catch (e) {
      console.log(e);
    }
  }
};
