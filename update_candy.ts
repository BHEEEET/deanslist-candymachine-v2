// Import necessary modules
import { create, mplCandyMachine, getMerkleProof, getMerkleRoot, fetchCandyGuard, updateCandyGuard } from '@metaplex-foundation/mpl-core-candy-machine';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { readFile } from 'fs/promises';
import { createSignerFromKeypair, generateSigner, publicKey, signerIdentity, some, sol, dateTime } from '@metaplex-foundation/umi';
import bs58 from 'bs58'

(async () => {
    try {
        const RPC_ENDPOINT = 'https://api.devnet.solana.com';
        const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username
        const destination = publicKey('GaKuQyYqJKNy8nN9Xf6VmYJQXzQDvvUHHc8kTeGQLL3f')

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

        // Use the required plugins
        umi.use(mplCandyMachine());
        umi.use(signerIdentity(signer));

        const candyGuardId = publicKey("AqaR7wdw4NeSwr92HN5bYyqjsxgSsmeVmVpSZoBQGRCk")


        const candyGuard = await fetchCandyGuard(umi, candyGuardId)

        const createIx = updateCandyGuard(umi, {
            candyGuard: candyGuard.publicKey,
            guards: {
                botTax: some({ lamports: sol(0.01), lastInstruction: true }),
                solPayment: some({ lamports: sol(0.1), destination: destination }),
                startDate: some({ date: dateTime("2025-03-14T06:00:00.000Z") }),
                endDate: some({ date: dateTime("2025-03-14T23:00:00.000Z") }),
            },
            groups: []
        });



        console.log('Candy machine REMOVE WHITELIST instruction prepared.');

        const result = await createIx.sendAndConfirm(umi);

        const coreCandyMachine = candyMachine;
        console.log('Core-Candy-Machine Address:', coreCandyMachine);
        console.log('View on Solscan:', `https://solscan.io/token/${result}?cluster=devnet`);

    } catch (err) {
        console.error('An error occurred:', err);
    }
})();
