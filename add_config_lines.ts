import { addConfigLines, fetchCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { readFile } from 'fs/promises';
import { createSignerFromKeypair, publicKey, signerIdentity, some } from '@metaplex-foundation/umi';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

const candyMachine = publicKey('BVoUZULpjsdf3Gj3TqH64JmjrGumwLJpp63hTN21Xhkh');
const metadatafile = './uploaded_metadata.json';


const addDataToCandy = async () => {
    try {
        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        const signer = createSignerFromKeypair(umi, keypair);
        umi.use(signerIdentity(signer));

        const candyMachineData = await fetchCandyMachine(umi, candyMachine)

        // Read and parse metadata file
        const fileContent = await readFile(metadatafile, 'utf-8');
        let configLines = JSON.parse(fileContent);
        

        // Ensure the parsed content matches the expected type
        if (!Array.isArray(configLines) || !configLines.every(line => line.name && line.uri)) {
            throw new Error('Invalid metadata format. Each item must have "name" and "uri".');
        }

        // Remove the last item from the configLines array
        configLines.pop();

        console.log(configLines)

        // Add the config lines
        await addConfigLines(umi, {
            candyMachine: candyMachine,
            index: 0,
            configLines: configLines,
        }).sendAndConfirm(umi);
    } catch (e) {
        console.error('Failed to add NFTs: ', e);
    }
};

addDataToCandy();
