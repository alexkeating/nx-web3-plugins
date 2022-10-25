import fetch from 'cross-fetch';

export const getDNSRecord = async ({
  cloudflareZoneID,
  recordName,
  recordDomain,
}: {
  cloudflareZoneID: string;
  recordName: string;
  recordDomain: string;
}) => {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records?name=${recordName}.${recordDomain}`
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
