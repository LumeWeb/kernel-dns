import WSReconnect from "./ws.js"
import {resolver} from "./common.js"
import {hashDataKey} from "@lumeweb/kernel-utils";
import {bufToHex} from "libskynet";
import {deriveRegistryEntryID, downloadSkylink} from "libskynet";
import {entryIDToSkylink} from "libskynet";
import {RpcNetwork} from "@lumeweb/kernel-rpc-client";

const relayListName = "lumeweb-relays"
const relayListOwner = Buffer.from("86c7421160eb5cb4a39495fc3e3ae25a60b330fff717e06aab978ad353722014", "hex");

/*
 TODO: Use kernel code to use many different portals and not hard code a portal
 */
let portalConnection: WSReconnect

let relayPromiseResolve: any = () => true;
let relayPromise: Promise<any>;

export function relayReady(): Promise<any> {
    return relayPromise;
}

function resetRelayPromise() {
    relayPromise = new Promise((resolve) => {
        relayPromiseResolve = resolve;
    })
}

async function fetchRelays() {
/*    const [data, err] = await downloadSkylink(entryIDToSkylink(deriveRegistryEntryID(relayListOwner, hashDataKey(relayListName))[0]))
    if (err) {
        return;
    }*/
  //  const list: string[] = JSON.parse(Buffer.from(data).toString());
    const list: string[] = ["ef92890bec753c86cfecbe1adea632a8aa130d479bab69ec999c0ea28afd48cf"];
    resolver.rpcNetwork.clearRelays();
    list.forEach((item) => {
        resolver.rpcNetwork.addRelay(item);
    });
    await (resolver.rpcNetwork as unknown as RpcNetwork).processQueue()
    relayPromiseResolve()
   // resetRelayPromise();
}

export function setupRelayListSubscription() {
/*    portalConnection = new WSReconnect("wss://web3portal.com/skynet/registry/subscription")
    // @ts-ignore
    portalConnection.on("connect", () => {
        portalConnection.send(
            JSON.stringify({
                action: "subscribe",
                pubkey: `ed25519:${relayListOwner}`,
                datakey: bufToHex(hashDataKey(relayListName)),
            })
        )
    })

    // @ts-ignore
    portalConnection.on("message", fetchRelays)
    portalConnection.start()*/
    resetRelayPromise();
    fetchRelays()
}
