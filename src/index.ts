import {addHandler, handleMessage} from "libkmodule"
import type {ActiveQuery} from "libkmodule"
import {resolver} from "./common.js"

import {relayReady, setupRelayListSubscription} from "./relays.js"

setupRelayListSubscription()

addHandler("resolve", resolveHandler)
onmessage = handleMessage

async function resolveHandler(aq: ActiveQuery) {
    const query = aq.callerInput

    if (!("domain" in query)) {
        aq.reject("domain required")
        return
    }

    await relayReady();
    aq.respond(await resolver.resolve(aq.callerInput.domain, aq.callerInput.params ?? {}, aq.callerInput.force || false))
}


