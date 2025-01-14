
import { readFile } from "fs/promises";
import { program } from "commander";
import { ContractTransactionReceipt, ContractTransactionResponse, ethers, JsonRpcProvider, Network, Wallet } from "ethers";
import overlays from "./owner_overlay.json";

const OVERLAYS: StringMap = overlays as StringMap;

const OLD_ABI = [
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "overlay",
                type: "bytes32",
            },
        ],
        name: "stakeOfOverlay",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "overlay",
                type: "bytes32",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "withdrawFromStake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
]

const NEW_ABI = [
    {
        "inputs": [],
        "name": "withdrawFromStake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawableStake",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const CONTRACT_ADDRESSES = [
    "0x781c6D1f0eaE6F1Da1F604c6cDCcdB8B76428ba7",
    "0xBe212EA1A4978a64e8f7636Ae18305C38CA092Bd",
    "0x445B848e16730988F871c4a09aB74526d27c2Ce8"
];

async function unlockV3(keyFilePath: string, password: string) {
    const json = await readFile(keyFilePath, "utf8");
    return Wallet.fromEncryptedJson(json, password);
}

// async function _unstakeBZZ(privateKey: string, gnosisRPC: string){

// }

// function contractsToString(){
//     return Object.keys(Object.entries(obj).map(([k, v]) => `${k} => ${v}`).join(', '))
// }

async function unstakeBZZ(privateKey: string, gnosisRPC: string, contractAddress: string) {

    const provider = new JsonRpcProvider(gnosisRPC, Network.from(100), { staticNetwork: true });
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address
    console.log(`Attempting to withdraw stake from contract: ${contractAddress}`);

    try {
        await provider.getBlockNumber();
    } catch (error) {
        console.error("Error: Unable to connect to Ethereum node.");
        process.exit(1);
    }
    let ethAddressChecksum: string;
    let contractAddressChecksum: string;
    try {
        ethAddressChecksum = ethers.getAddress(address);
        contractAddressChecksum = ethers.getAddress(contractAddress);
    } catch (error: any) {
        console.error(`Invalid Ethereum address provided: ${error.message}`);
        process.exit(1);
    }
    if (contractAddress == '0x781c6D1f0eaE6F1Da1F604c6cDCcdB8B76428ba7') {
        const abi = OLD_ABI;
        const typedAbi: ABI = abi as ABI;
        const contract = new ethers.Contract(contractAddress, typedAbi, wallet);
        const overlay = OVERLAYS[address.toLowerCase()];
        const amount = await contract.stakeOfOverlay(overlay);
        console.log(`Staked amount available for withdrawal at ${address}: ${amount}`);
        if (amount > 0) {
            try {
                const tx: ContractTransactionResponse = await contract.withdrawFromStake(overlay, amount);
                console.log("Withdraw stake transaction sent:", tx.hash);
                const receipt: ContractTransactionReceipt | null = await tx.wait();
                console.log("Withdraw stake transaction completed!");
            } catch (error) {
                console.error("Error sending transaction:", error);
            }
        }
    } else { //@ts-ignore
        const abi = NEW_ABI;
        const typedAbi: ABI = abi as ABI;
        const contract = new ethers.Contract(contractAddress, typedAbi, wallet);
        const amount = await contract.withdrawableStake();
        console.log(`Staked amount available for withdrawal at ${address}: ${amount}`);
        if (amount > 0) {
            try {
                const tx: ContractTransactionResponse = await contract.withdrawFromStake();
                console.log("Withdraw stake transaction sent:", tx.hash);
                const receipt: ContractTransactionReceipt | null = await tx.wait();
                console.log("Withdraw stake transaction completed!");
            } catch (error) {
                console.error("Error sending transaction:", error);
            }
        }
    }
}

async function main() {
    program
        .name("bzz-unstake-cli")
        .description("CLI to unstake xBZZ")
        .version("0.0.1");
    program
        .command("unstake-with-pk")
        .description("Unstake xBZZ with private key")
        .argument("<private-key>", "path to swarm.key file")
        .argument('<gnosis-rpc>', 'Gnosis RPC URL')
        .requiredOption(
            '-uc, --unstake-contract <contract-address>',
            `Paused staking contract address to unstake from (accepted values: ${CONTRACT_ADDRESSES.join(', ')})`,
            (value) => {
                if (!CONTRACT_ADDRESSES.includes(value)) {
                    throw new Error(`Invalid contract address. Accepted values are: ${CONTRACT_ADDRESSES.join(', ')}`);
                }
                return value;
            }
        )
        .action(async (privateKey: string, gnosisRPC: string, options: { unstakeContract: string }) => {
            const contractAddress = options.unstakeContract;
            await unstakeBZZ(privateKey, gnosisRPC, contractAddress);
        });
    program
        .command("unstake")
        .description("Unstake xBZZ with swarm.key and password")
        .argument("<swarm-key-file>", "path to swarm.key file")
        .argument("<password>", "password")
        .argument('<gnosis-rpc>', 'Gnosis RPC URL')
        .requiredOption(
            '-uc, --unstake-contract <contract-address>',
            `Paused staking contract address to unstake from (accepted values: ${CONTRACT_ADDRESSES.join(', ')})`,
            (value) => {
                if (!CONTRACT_ADDRESSES.includes(value)) {
                    throw new Error(`Invalid contract address. Accepted values are: ${CONTRACT_ADDRESSES.join(', ')}`);
                }
                return value;
            }
        )
        .action(async (keyFilePath: string, password: string, gnosisRPC: string, options: { unstakeContract: string }) => {
            const contractAddress = options.unstakeContract;
            if (keyFilePath && password && gnosisRPC && contractAddress) {
                const { privateKey } = await unlockV3(keyFilePath, password);
                await unstakeBZZ(privateKey, gnosisRPC, contractAddress);
            }
        });

    program.parse();
}

main();
