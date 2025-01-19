// Import necessary modules
import { create, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { readFile } from 'fs/promises';
import { createSignerFromKeypair, generateSigner, publicKey, signerIdentity, some,sol } from '@metaplex-foundation/umi';

(async () => {
    try {
        const RPC_ENDPOINT = 'https://api.devnet.solana.com';
        const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

        console.log('Loading wallet from:', WALLET_PATH);

        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        console.log('Wallet loaded successfully.');

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        const signer = createSignerFromKeypair(umi, keypair);

        console.log('Signer initialized with public key:', signer.publicKey);

        const collectionMint = publicKey("FECV7f5heoUjrY2uMMfs5xCVSe8AtNJRVwR1VjQNKExq");
        console.log('Using collection mint:', collectionMint);

        // Use the required plugins
        umi.use(mplCandyMachine());
        umi.use(signerIdentity(signer));

        console.log('Plugins registered.');

        const candyMachine = generateSigner(umi);

        console.log('Candy machine signer generated:', candyMachine.publicKey);

        console.log('mint', umi.identity.publicKey)

        const destination = publicKey('GaKuQyYqJKNy8nN9Xf6VmYJQXzQDvvUHHc8kTeGQLL3f')

        const createIx = await create(umi, {
            candyMachine,
            collection: collectionMint,
            collectionUpdateAuthority: umi.identity,
            itemsAvailable: 16,
            authority: umi.identity.publicKey,
            isMutable: true,
            configLineSettings: some({
                prefixName: 'DL v2 Test #',
                nameLength: 20,
                prefixUri: 'https://gateway.irys.xyz/',
                uriLength: 90,
                isSequential: false,
            }),
            guards: {
                botTax: some({ lamports: sol(0.01), lastInstruction: true }),
                solPayment: some({ lamports: sol(0.1), destination: destination}),
            }
        });

        console.log('Candy machine creation instruction prepared.');

        const result = await createIx.sendAndConfirm(umi);

        console.log('Transaction confirmed successfully!');
        console.log('Transaction result:', result);

        const coreCandyMachine = candyMachine.publicKey;
        console.log('Core-Candy-Machine Address:', coreCandyMachine);
        console.log('View on Solscan:', `https://solscan.io/token/${coreCandyMachine}?cluster=devnet`);

    } catch (err) {
        console.error('An error occurred:', err);
    }
})();
