import { RpcNetwork } from "@lumeweb/kernel-rpc-client";
import { ResolverRegistry } from "./resolverRegistry.js";

const network: RpcNetwork = new RpcNetwork();

export const resolver = new ResolverRegistry(network as any);
