// Import necessary modules from Metaplex and Node.js
import { createCollection, createCollectionV2, ruleSet } from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

// Constants

async function main() {
    try {
        const RPC_ENDPOINT = 'https://api.devnet.solana.com'; // RPC endpoint for Solana Devnet
        const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Path to the wallet JSON file

        const creator1 = publicKey('GaKuQyYqJKNy8nN9Xf6VmYJQXzQDvvUHHc8kTeGQLL3f')
        const creator2 = publicKey('9SuQHwj9p6GDZMusnmqfXovaHxd9z3bQQn8e85fA5ue1')


        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

        // Set the wallet as the identity for transactions
        umi.use(keypairIdentity(keypair));

        // Generate a new signer for the collection
        const collectionSigner = generateSigner(umi);

        // Create the collection
        await createCollection(umi, {
            collection: collectionSigner,
            name: 'Core DL v2 Devnet Test',
            uri: "https://gateway.irys.xyz/84YN6fsi4vYnj4WDywT9aFBAo13s5yQcSsWQUbn3DEW1",
            plugins: [
                {
                    type: 'Royalties',
                    basisPoints: 500,
                    creators: [
                        {
                            address: creator1,
                            percentage: 20,
                        },
                        {
                            address: creator2,
                            percentage: 80,
                        },
                    ],
                    ruleSet: ruleSet('None'), // Compatibility rule set
                },
            ],
        }).sendAndConfirm(umi);

        // Log the collection address (public key)
        const collectionAddress = collectionSigner.publicKey;
        console.log('Collection Address:', collectionAddress);
        console.log('View on Solscan:', `https://solscan.io/token/${collectionAddress}?cluster=devnet`);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Execute the main function
main();
