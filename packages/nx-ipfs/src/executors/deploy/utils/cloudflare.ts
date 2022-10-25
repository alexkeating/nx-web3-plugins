import fetch from 'cross-fetch';

export const getDNSRecord = async ({
  cloudflareZoneID,
  recordName,
  recordDomain,
  cloudflareToken,
}: {
  cloudflareZoneID: string;
  recordName: string;
  recordDomain: string;
  cloudflareToken: string;
}) => {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records?name=${recordName}.${recordDomain}`,
    {
      headers: {
        authorization: `Bearer ${cloudflareToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return resp;
};

export const updateDNSLink = async ({
  recordId,
  cloudflareZoneID,
  cloudflareToken,
  recordName,
  recordDomain,
  hash,
}: {
  recordId: string;
  cloudflareZoneID: string;
  cloudflareToken: string;
  recordName: string;
  recordDomain: string;
  hash: string;
}) => {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records/${recordId}`,
    {
      method: 'put',
      headers: {
        authorization: `Bearer ${cloudflareToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'TXT',
        name: `${recordName}.${recordDomain}`,
        content: `dnslink=/ipfs/${hash}`,
      }),
    }
  );
  return resp;
};
