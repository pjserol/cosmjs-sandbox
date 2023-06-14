import { StargateClient } from "@cosmjs/stargate"

const rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())

    console.log(
        "Alice Balances:",
        await client.getAllBalances("cosmos1kv25zk96c9qexh2aeaprwhg9atc5jkj6wqffpl")
    )
}

runAll()
