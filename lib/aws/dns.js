export async function dns(options) {
  const { aws, event, events, props } = options

  const awsConfig = await events.awsConfigRead(
    props,
    event.options
  )

  const awsAccount = awsConfig.accounts[aws]

  await createRecord({ ...options, awsAccount })
}

async function createRecord(options) {
  const { events, dry, props } = options

  const template = dnsTemplate(options)

  if (dry) {
    // eslint-disable-next-line no-console
    console.log(template)
    return
  }

  const zone = await hostedZone(options)

  await events.spawn([...props, "route53"], {
    args: [
      "route53",
      "change-resource-record-sets",
      "--hosted-zone-id",
      zone,
      "--change-batch",
      JSON.stringify(template, null, 2),
    ],
    command: "aws",
    env: awsEnv(options),
    silent: false,
  })
}

function awsEnv({ awsAccount }) {
  const { accessKey, region, secretKey } = awsAccount

  return {
    ...process.env,
    AWS_ACCESS_KEY_ID: accessKey,
    AWS_DEFAULT_REGION: region,
    AWS_SECRET_ACCESS_KEY: secretKey,
  }
}

async function hostedZone(options) {
  const { events, domain, props } = options

  const root_domain = domain
    .split(/\./)
    .slice(-2)
    .join(".")

  const { out } = await events.spawn(
    [...props, "route53Zones"],
    {
      args: ["route53", "list-hosted-zones"],
      cache: true,
      command: "aws",
      env: awsEnv(options),
      json: true,
      silent: false,
    }
  )

  if (out) {
    const { HostedZones: zones } = out

    const { Id: id } = zones.find(
      ({ Name: n }) => n == `${root_domain}.`
    )

    return id
  }
}

function dnsTemplate(options) {
  const { domain, ip } = options

  return {
    Changes: [
      {
        Action: "UPSERT",
        ResourceRecordSet: {
          Name: `${domain}.`,
          ResourceRecords: [{ Value: ip }],
          TTL: 60,
          Type: "A",
        },
      },
    ],
  }
}
