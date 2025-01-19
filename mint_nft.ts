
import { fetchCandyMachine, mintAssetFromCandyMachine, mintV1, mplCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { addPlugin } from "@metaplex-foundation/mpl-core"
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createSignerFromKeypair, publicKey, signerIdentity, some, sol } from '@metaplex-foundation/umi';
import base58 from "bs58";

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

const candyMachineId = publicKey("3gTqTsfWK8vN3GDpsRFJvrbUdjZu4kBbJ1GA5GTHijNC");
const coreCollection = publicKey("B6Uq5SqhCwdnLgbPnV7PxMabG8f6HNixUirhTvRfpeji");

const mint = async () => {
    try {
        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        const signer = createSignerFromKeypair(umi, keypair);
        umi.use(signerIdentity(signer));
        umi.use(mplCandyMachine())

        const candyMachineData = await fetchCandyMachine(umi, candyMachineId)
        console.log(candyMachineData)

        const asset = generateSigner(umi);

        const destination = publicKey('GaKuQyYqJKNy8nN9Xf6VmYJQXzQDvvUHHc8kTeGQLL3f')

        const result = await mintV1(umi, {
            candyMachine: candyMachineId,
            asset,
            collection: coreCollection,
            mintArgs: {
                solPayment: some({ lamports: sol(0.1), destination: destination }),
            },
        }).sendAndConfirm(umi);

        const mintTx = base58.encode(result.signature)

        console.log('View on Mint TX:', `https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
        console.log('NFT Address:', asset.publicKey);
        console.log('View NFT:', `https://explorer.solana.com/address/${asset.publicKey}?cluster=devnet`);

        // Step 2: Add the autograph plugin after minting
        console.log("Adding autograph...");
        const autoResult = await addPlugin(umi, {
            asset: asset.publicKey,
            collection: coreCollection,
            plugin: {
                type: 'Autograph',
                signatures: [
                    {
                        address: umi.identity.publicKey,
                        message: 'BHEET',
                    },
                ],
            },
        }).sendAndConfirm(umi);

        const autoTx = base58.encode(autoResult.signature)

        console.log('View on Autograph Plugin TX:', `https://explorer.solana.com/tx/${autoTx}?cluster=devnet`);

        // Step 2: Add the autograph plugin after minting
        console.log("Adding attributes...");
        const attResult = await addPlugin(umi, {
            asset: asset.publicKey,
            collection: coreCollection,
            plugin: {
                type: 'Attributes',
                attributeList: [
                    { key: "BLYAT", value: "CYKA", },
                    { key: "KURWA", value: "POLSKI", },
                ],
            },
        }).sendAndConfirm(umi);

        const attTx = base58.encode(attResult.signature)

        console.log('View on Attribute Plugin TX:', `https://explorer.solana.com/tx/${attTx}?cluster=devnet`);

        // Step 2: Add the autograph plugin after minting
        const delegate = publicKey('GaKuQyYqJKNy8nN9Xf6VmYJQXzQDvvUHHc8kTeGQLL3f')

        console.log("Adding attributes...");
        const delResult = await addPlugin(umi, {
            asset: asset.publicKey,
            collection: coreCollection,
            plugin: {
                type: 'TransferDelegate',
                authority:
                    { type: "Address", address: delegate, }

            },
        }).sendAndConfirm(umi);

        const delTx = base58.encode(delResult.signature)

        console.log('View on Attribute Plugin TX:', `https://explorer.solana.com/tx/${delTx}?cluster=devnet`);

    } catch (e) {
        console.error(e)
    }
}

mint()