
import { fetchCandyMachine, mintAssetFromCandyMachine, mintV1, mplCandyMachine  } from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createSignerFromKeypair, publicKey, signerIdentity, some ,sol} from '@metaplex-foundation/umi';
import base58 from "bs58";

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

const candyMachineId = publicKey("BVoUZULpjsdf3Gj3TqH64JmjrGumwLJpp63hTN21Xhkh");
const coreCollection = publicKey("6J9xzHz9QddxyaJ6VwzXHuXSvNoSokx2GfEVo92QCqCS");

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
                solPayment: some({lamports: sol(0.1), destination: destination }),
              },
        }).sendAndConfirm(umi);

        const signature = base58.encode(result.signature)

        console.log('View on Mint TX Solscan:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log('NFT Address:', asset.publicKey);
        console.log('View on Solscan:', `https://solscan.io/token/${asset.publicKey}?cluster=devnet`);

    } catch (e) {
        console.error(e)
    }
}

mint()