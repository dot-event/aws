export async function dns(options) {
  const { event, events, props } = options
  await events.awsConfigRead(props, event.options)
}
