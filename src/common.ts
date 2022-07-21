import resolvers from "@lumeweb/resolver"
import { RpcNetwork } from "@lumeweb/kernel-rpc-client"

const network = new RpcNetwork()

export const resolver = resolvers.createDefaultResolver(network as any)
