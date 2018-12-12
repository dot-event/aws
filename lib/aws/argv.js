export async function argv({ events }) {
  await events.argv({
    alias: {
      d: ["dns"],
    },
  })
}
