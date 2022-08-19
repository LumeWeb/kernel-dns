import {
  DNSResult,
  ResolverOptions,
  DNS_RECORD_TYPE,
  resolverError,
} from "@lumeweb/resolver-common";
import type { RpcNetwork } from "@lumeweb/kernel-rpc-client";
import { callModule } from "libkmodule/dist";

export class ResolverRegistry {
  constructor(network: RpcNetwork) {
    this._rpcNetwork = network;
  }

  private _resolvers: Set<ResolverModule> = new Set<ResolverModule>();

  get resolvers(): Set<ResolverModule> {
    return this._resolvers;
  }

  private _rpcNetwork: RpcNetwork;

  get rpcNetwork(): RpcNetwork {
    return this._rpcNetwork;
  }

  public async resolve(
    domain: string,
    options: ResolverOptions = { type: DNS_RECORD_TYPE.DEFAULT },
    bypassCache: boolean = false
  ): Promise<DNSResult> {
    for (const resolver: ResolverModule of this._resolvers) {
      const result = await resolver.resolve(domain, options, bypassCache);
      if (!result.error && result.records.length) {
        return result;
      }
    }

    return { records: [] };
  }

  public register(resolver: ResolverModule): void {
    if (
      [...this._resolvers.values()].filter(
        (item) => item.domain === resolver.domain
      ).length > 0
    ) {
      return;
    }
    this._resolvers.add(resolver);
  }

  public clear(): void {
    this._resolvers.clear();
  }
}

export class ResolverModule {
  private _resolver: ResolverRegistry;

  constructor(resolver: ResolverRegistry, domain: string) {
    this._resolver = resolver;
    this._domain = domain;
  }

  private _domain: string;

  get domain(): string {
    return this._domain;
  }

  async resolve(
    domain: string,
    options: ResolverOptions,
    bypassCache: boolean
  ): Promise<DNSResult> {
    const [ret, err] = await callModule(this._domain, "resolve", {
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
