# bzz-unstake-cli
A cli tool to unstake xBZZ from the [paused staking contract](https://gnosisscan.io/address/0x781c6d1f0eae6f1da1f604c6cdccdb8b76428ba7#code).

Note: if you have migrated to bee 2.2 there is no need to revert to older versions. Doing so may lead to bee data corruption.

## Requirements
- `node` >= 20

## Setup
```
git clone https://github.com/w3rkspacelabs/bzz-unstake-cli.git
cd bzz-unstake-cli
npm install
```
## Unstaking you `xBZZ`

### Usage
> #### For Dappnode users:
> 1. Connect to your dappnode using `Wireguard` or `OpenVPN`
> 2. Once you've established connection:
> - Download your `swarm.key` file:
>   - http://my.dappnode/file-download/DAppNodePackage-bee.swarm.public.dappnode.eth/?path=/home/bee/.bee/keys/swarm.key
> - Download your password.tar file and extract your password:
>   - http://my.dappnode/file-download/DAppNodePackage-bee.swarm.public.dappnode.eth/?path=/home/bee/.bee/password
> 3. Unstake with the commands below 

### Unstake CLI

#### Previous Staking Contracts (For Unstaking)

Stake Registry - https://github.com/ethersphere/storage-incentives/blob/8d91927b183ec622a2c809b9a58b6ebe15e16d9a/deployments/mainnet/StakeRegistry.json 

| Version   | Address                                    |
|-----------|--------------------------------------------|
| pre 2.2.0 | [0x781c6D1f0eaE6F1Da1F604c6cDCcdB8B76428ba7](https://gnosisscan.io/address/0x781c6d1f0eae6f1da1f604c6cdccdb8b76428ba7) |
| pre 2.3.0 | [0xBe212EA1A4978a64e8f7636Ae18305C38CA092Bd](https://gnosisscan.io/address/0xbe212ea1a4978a64e8f7636ae18305c38ca092bd) |
| current | [0x445B848e16730988F871c4a09aB74526d27c2Ce8](https://gnosisscan.io/address/0x445b848e16730988f871c4a09ab74526d27c2ce8) |

#### Unstake with swarm.key and password and staking contract
```
tsx src/index.ts unstake <path-to-swarm-key-file> <password> <gnosis-rpc-url> --unstake-contract <contract-address>
```

#### Unstake with private key and staking contract
```
tsx src/index.ts unstake-with-pk <private-key> <gnosis-rpc-url> --unstake-contract <contract-address>
```

**Output:**
```
Staked amount available for withdrawal: 110000000000000000
Withdraw stake transaction sent: 0x123abc7d956606ac0083b0356e4bd5351276b854c732e4f78357a4a722932dfc
Withdraw stake transaction completed!
```

## Restaking your `xBZZ`

Once the `xBZZ` is unstaked, you may now stake your prefered amount of `xBZZ` (minimum `10 xBZZ` )

> #### For Dappnode users:
> ##### Option 1: Using bee dashboard on Dappnode
> Dappnode users may restake using the bee dashboard at:
> - http://dashboard.swarm.public.dappnode/#/account/staking
> ![image](https://github.com/user-attachments/assets/dddc41ac-795a-425a-9b20-36a2e28779d0)
> 
> ##### Option 2: Using swarm-cli with Dappnode
> To stake 10 xBZZ:
> ```
> swarm-cli stake --deposit 100000000000000000 --bee-api-url http://bee.swarm.public.dappnode:1633
> ```
> 
> ##### Option 3: Using curl with Dappnode
> To stake 10 xBZZ:
> ```
> curl -X POST http://bee.swarm.public.dappnode:1633/stake/100000000000000000
> ```

### Restaking

To restake `10 xBZZ` (`100000000000000000 PLUR`)

### Option 1: Using curl
```
curl -X POST localhost:1633/stake/100000000000000000
```
### Option 2: Using swarm-cli
```
 swarm-cli stake --deposit 100000000000000000 --bee-api-url http:localhost:1633
```

