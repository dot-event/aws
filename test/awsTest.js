// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import aws from "../"

async function run(...argv) {
  await events.task({
    argv,
    op: "aws",
    path: `${__dirname}/fixture`,
  })
}

// Constants
const cancel = ({ event }) => (event.signal.cancel = true)

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  aws({ events })
  dotTask({ events })

  events.onAny({
    "before.spawn": cancel,
  })
})

test("aws", async () => {
  const calls = []

  events.onAny("before.spawn", ({ event }) =>
    calls.push(event.options)
  )

  await run("--dns")

  expect(calls.length).toBe(0)
})
