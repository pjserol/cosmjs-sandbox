# Info

## Public testnet

<https://github.com/cosmos/testnets/tree/master/public>

## Create key

```sh
npx ts-node generate_mnemonic.ts > testnet.alice.mnemonic.key
```

Temporary address generated: `cosmos1kv25zk96c9qexh2aeaprwhg9atc5jkj6wqffpl`

## Request faucet token

```discord
Cosmos discord in testnet-faucet
$request cosmos1kv25zk96c9qexh2aeaprwhg9atc5jkj6wqffpl theta
```

Transaction link:
<https://explorer.theta-testnet.polypore.xyz/transactions/229F98E3F4F3097605B930300560E232F69549B7BDD65D85B1C229CA1CE49071>

## Protobuf types

<https://buf.build/cosmos/cosmos-sdk>

## Init local chain

```sh
mkdir cosmos
cd cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk

git checkout v0.45.4

make build

./build/simd version

rm -rf ./private/.simapp

./build/simd init demo \
    --home ./private/.simapp \
    --chain-id learning-chain-1

cat ./private/.simapp/config/genesis.json

./build/simd keys list \
    --home ./private/.simapp \
    --keyring-backend test

./build/simd keys add alice \
    --home ./private/.simapp \
    --keyring-backend test

./build/simd keys list \
    --home ./private/.simapp \
    --keyring-backend test

./build/simd keys show alice \
    --home ./private/.simapp \
    --keyring-backend test

grep bond_denom ./private/.simapp/config/genesis.json

./build/simd add-genesis-account alice 100000000stake \
    --home ./private/.simapp \
    --keyring-backend test

grep -A 10 balances ./private/.simapp/config/genesis.json

./build/simd gentx alice 70000000stake \
    --home ./private/.simapp \
    --keyring-backend test \
    --chain-id learning-chain-1

./build/simd collect-gentxs \
    --home ./private/.simapp

./build/simd start \
    --home ./private/.simapp

# In a different terminal

export alice=$(./build/simd keys show alice --address \
    --home ./private/.simapp \
    --keyring-backend test)

./build/simd query bank balances $

export bob=cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq

./build/simd query bank balances $bob

./build/simd tx bank send $alice $bob 10stake \
    --home ./private/.simapp \
    --keyring-backend test \
    --chain-id learning-chain-1

# Export key
./build/simd keys export alice --unsafe --unarmored-hex \
    --home ./private/.simapp \
    --keyring-backend test

./build/simd keys list \
    --home ./private/.simapp \
    --keyring-backend test
```

## List of validor adresses testnet

<https://explorer.theta-testnet.polypore.xyz/validators>
