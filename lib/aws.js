// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { argv } from "./aws/argv"
import { dns } from "./aws/dns"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("aws")) {
    return options
  }

  dotArgv({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStore({ events })

  events.onAny({
    aws: argvRelay,
    awsDns: dns,
    awsSetupOnce: argv,
  })

  return options
}
