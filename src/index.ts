import { addHandler, handleMessage } from "libkmodule";
import type { ActiveQuery } from "libkmodule";
import { resolver } from "./common.js";

import { validateSkylink } from "@siaweb/libweb/dist/skylinkValidate.js";
import { ResolverModule } from "./resolverRegistry.js";
import { b64ToBuf } from "@siaweb/libweb";
import { factory } from "@lumeweb/libkernel-universal";

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

  aq.respond(
    await resolver.resolve(
      query?.domain,
      query?.options,
      query?.bypassCache || false
    )
  );
}

async function handleRegister(aq: ActiveQuery) {
  if (!validateSkylink(b64ToBuf(aq.domain).shift() as Uint8Array)?.[1]) {
    aq.reject("invalid skylink");
    return;
  }

  resolver.register(
    factory<ResolverModule>(ResolverModule, aq.domain)(resolver, aq.domain)
  );
  aq.respond();
}

async function handleClear(aq: ActiveQuery) {
  resolver.clear();
  aq.respond();
}

async function handleGetResolvers(aq: ActiveQuery) {
  aq.respond(
    [...resolver.resolvers.values()].map((resolver) => resolver.domain)
  );
}
