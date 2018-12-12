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
})

test("aws", async () => {
  const calls = []

  events.onAny("before.spawn", ({ event }) => {
    calls.push(event.options)
    cancel({ event })
    event.signal.returnValue = {}
  })

  await run("--dns", "--aws=east", "--domain=test.test.com")

  expect(calls.length).toBe(2)
})
