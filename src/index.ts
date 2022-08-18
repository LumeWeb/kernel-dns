import { addHandler, handleMessage } from "libkmodule";
import type { ActiveQuery } from "libkmodule";
import { resolver } from "./common.js";

import { relayReady, setupRelayListSubscription } from "./relays.js";
import { validSkylink } from "libskynet/dist/skylinkvalidate.js";
import { ResolverModule } from "./resolverRegistry.js";
import { b64ToBuf } from "libskynet";

setupRelayListSubscription();

addHandler("resolve", handleResolve);
addHandler("register", handleRegister);
addHandler("clear", handleClear);
addHandler("getResolvers", handleGetResolvers);
onmessage = handleMessage;

async function handleResolve(aq: ActiveQuery) {
  const query = aq.callerInput;
  if (!("domain" in query)) {
    aq.reject("domain required");
    return;
  }

  await relayReady();
  aq.respond(
    await resolver.resolve(
      aq.callerInput.domain,
      aq.callerInput.options ?? {},
      aq.callerInput.bypassCache || false
    )
  );
}

async function handleRegister(aq: ActiveQuery) {
  if (!validSkylink(b64ToBuf(aq.domain).shift() as Uint8Array)) {
    aq.reject("invalid skylink");
    return;
  }

  resolver.register(new ResolverModule(resolver, aq.domain));
  aq.respond();
}

async function handleClear(aq: ActiveQuery) {
  resolver.clear();
  aq.respond();
}

async function handleGetResolvers(aq: ActiveQuery) {
  aq.respond([...resolver.resolvers.values()]);
}
