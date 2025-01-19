import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi';

const fetchNFT = async () => {

    const RPC_ENDPOINT = 'https://api.devnet.solana.com';
    const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

    // Load the default Solana wallet
    const walletFile = await readFile(WALLET_PATH, 'utf8');
    const wallet = JSON.parse(walletFile);

    // Initialize Umi with the chosen RPC endpoint
    const umi = createUmi(RPC_ENDPOINT);
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

    const signer = createSignerFromKeypair(umi, keypair);

    umi.use(signerIdentity(signer));
    const assetAddress = publicKey('CWbhF2zt51527164hqy8uo9ut6Pu1gNhN93RWRkpiiGt')

    const asset = await fetchAsset(umi, assetAddress, {
        skipDerivePlugins: false,
    })



    console.log("Autograph:", asset.autograph)
    console.log("Attributes:", asset.attributes)
    console.log("Delegate:", asset.transferDelegate)
}

fetchNFT()