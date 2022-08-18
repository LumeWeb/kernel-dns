import {
  DNSResult,
  ResolverOptions,
  DNS_RECORD_TYPE,
  resolverError,
} from "@lumeweb/resolver-common";
import type { RpcNetwork } from "@lumeweb/kernel-rpc-client";
import { callModule } from "libkmodule/dist";

export class ResolverRegistry {
  private _resolvers: Set<ResolverModule> = new Set();
  private _rpcNetwork: RpcNetwork;

  constructor(network: RpcNetwork) {
    this._rpcNetwork = network;
  }

  get resolvers(): Set<ResolverModule> {
    return this._resolvers;
  }

  get rpcNetwork(): RpcNetwork {
    return this._rpcNetwork;
  }

  public async resolve(
    domain: string,
    options: ResolverOptions = { type: DNS_RECORD_TYPE.DEFAULT },
    bypassCache: boolean = false
  ): Promise<DNSResult> {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(domain, options, bypassCache);
      if (!result.error && result.records.length) {
        return result;
      }
    }

    return { records: [] };
  }

  public register(resolver: ResolverModule): void {
    this._resolvers.add(resolver);
  }

  public clear(): void {
    this._resolvers.clear();
  }
}

export class ResolverModule {
  private resolver: ResolverRegistry;
  private domain: string;

  constructor(resolver: ResolverRegistry, domain: string) {
    this.resolver = resolver;
    this.domain = domain;
  }

  async resolve(
    domain: string,
    options: ResolverOptions,
    bypassCache: boolean
  ): Promise<DNSResult> {
    const [ret, err] = await callModule(this.domain, "resolve", {
      domain,
      options,
      bypassCache,
    });
    if (err) {
      return resolverError(err);
    }

    return ret;
  }
}
