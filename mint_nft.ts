
import { fetchCandyMachine, mintAssetFromCandyMachine, mintV1, mplCandyMachine  } from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createSignerFromKeypair, publicKey, signerIdentity, some } from '@metaplex-foundation/umi';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

const candyMachineId = publicKey("DRKFiJNJeg4FC8hYntWcbnDQi1gJdY3vHSjPL54gs28D");
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

        await mintAssetFromCandyMachine(umi, {
            candyMachine: candyMachineId,
            mintAuthority: umi.identity,
            assetOwner: umi.identity.publicKey,
            asset,
            collection: coreCollection,
        }).sendAndConfirm(umi);

        console.log('NFT Address:', asset);
        console.log('View on Solscan:', `https://solscan.io/token/${asset}?cluster=devnet`);

    } catch (e) {
        console.error(e)
    }
}

mint()