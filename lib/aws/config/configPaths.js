// Helpers
export function configPaths({ events, props }) {
  const { operations } = events.get(props)
  const configPath = operations.aws.config

  const secretsPath =
    configPath.replace(/\.yaml$/, "") + "-secrets.yaml"

  return { configPath, secretsPath }
}
