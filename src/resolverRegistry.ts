import {
  DNSResult,
  ResolverOptions,
  DNS_RECORD_TYPE,
  resolverError,
} from "@lumeweb/libresolver";
import { Client } from "@lumeweb/libkernel-universal";

export class ResolverRegistry {
  private _resolvers: Set<ResolverModule> = new Set<ResolverModule>();

  get resolvers(): Set<ResolverModule> {
    return this._resolvers;
  }
  public async resolve(
    domain: string,
    options: ResolverOptions = { type: DNS_RECORD_TYPE.CONTENT },
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

export class ResolverModule extends Client {
  private _resolver: ResolverRegistry;

  constructor(resolver: ResolverRegistry, domain: string) {
    super();
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
    try {
      return this.callModuleReturn("resolve", {
        domain,
        options,
        bypassCache,
      });
    } catch (e: any) {
      return resolverError(e as Error);
    }
  }
}
