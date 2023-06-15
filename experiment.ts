import { readFile } from "fs/promises"
import { fromHex } from "@cosmjs/encoding"
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { IndexedTx, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"

const cosmosEnv = process.env.cosmos_environment || "local"

let rpc: string
if (cosmosEnv === "testnet") {
    rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"
} else {
    rpc = "http://127.0.0.1:26657"
}

const getTesnetAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile("./testnet.alice.mnemonic.key")).toString(), {
        prefix: "cosmos",
    })
}

const getLocalAliceSignerFromPriKey = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos"
    )
}

interface FaucetResult {
    faucet: string
    tx: Tx
}

async function getFaucet(client: StargateClient): Promise<FaucetResult> {
    const faucetTx: IndexedTx = (await client.getTx(
        "229F98E3F4F3097605B930300560E232F69549B7BDD65D85B1C229CA1CE49071"
    ))!

    console.log("Faucet Tx:", faucetTx)
    const decodedTx: Tx = Tx.decode(faucetTx.tx)
    console.log("DecodedTx:", decodedTx)
    console.log("Decoded messages:", decodedTx.body!.messages)
    const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
    console.log("Sent message:", sendMessage)

    const faucet: string = sendMessage.fromAddress
    console.log("Faucet balances:", await client.getAllBalances(faucet))

    // Get the faucet address another way
    {
        const rawLog = JSON.parse(faucetTx.rawLog)
        console.log("Raw log:", JSON.stringify(rawLog, null, 4))
        const faucet: string = rawLog[0].events
            .find((eventEl: any) => eventEl.type === "coin_spent")
            .attributes.find((attribute: any) => attribute.key === "spender").value
        console.log("Faucet address from raw log:", faucet)
    }

    return { faucet, tx: decodedTx }
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())

    console.log(
        "Alice Balances:",
        await client.getAllBalances("cosmos1kv25zk96c9qexh2aeaprwhg9atc5jkj6wqffpl")
    )

    let faucet: string
    let decodedTx: Tx
    let token: string
    if (cosmosEnv === "testnet") {
        // retrieve faucet address and tx
        const { faucet: faucetTestnet, tx: decodedTxTestnet } = await getFaucet(client)
        faucet = faucetTestnet
        decodedTx = decodedTxTestnet
        token = "uatom"
    } else {
        // bob's local address
        faucet = "cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq"
        // decodedTx = null
        token = "stake"
    }

    let aliceSigner: OfflineDirectSigner
    if (cosmosEnv === "testnet") {
        aliceSigner = await getTesnetAliceSignerFromMnemonic()
    } else {
        aliceSigner = await getLocalAliceSignerFromPriKey()
    }

    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice's address from signer", alice)

    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "With signing client, chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight()
    )

    // console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
    // console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))

    // Check the balance of Alice and the Faucet
    console.log("Alice balance before:", await client.getAllBalances(alice))
    console.log("Faucet balance before:", await client.getAllBalances(faucet))

    // Execute the sendTransaction Tx and store the result
    const result = await signingClient.sendTokens(alice, faucet, [{ denom: token, amount: "100000" }], {
        amount: [{ denom: token, amount: "500" }],
        gas: "200000",
    })

    // Output the result of the Tx
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
    console.log("Faucet balance after:", await client.getAllBalances(faucet))
}

runAll()
