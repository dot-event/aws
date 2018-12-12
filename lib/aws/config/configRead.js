import { join } from "path"

// Packages
import deepmerge from "deepmerge"

// Helpers
import { configPaths } from "./configPaths"

export async function configRead(options) {
  const { cwd, event, events, props } = options
  const { configPath, secretsPath } = configPaths(options)

  const baseConfig = await events.fsReadYaml(
    [...props, "awsBaseConfig"],
    {
      path: join(cwd, configPath),
      save: true,
    }
  )

  const secretsConfig = await events.fsReadYaml(
    [...props, "awsSecretsConfig"],
    {
      path: join(cwd, secretsPath),
      save: true,
    }
  )

  removeDanglingSecrets({ baseConfig, secretsConfig })

  const config = secretsConfig
    ? deepmerge(baseConfig, secretsConfig)
    : baseConfig

  await events.set([...props, "awsConfig"], config)

  event.signal.returnValue = config
}

function removeDanglingSecrets(options) {
  const { baseConfig, secretsConfig } = options

  if (!secretsConfig) {
    return
  }

  for (const ns in secretsConfig) {
    for (const key in secretsConfig[ns]) {
      if (!baseConfig[ns] || !baseConfig[ns][key]) {
        delete secretsConfig[ns][key]
      }
    }
  }
}
