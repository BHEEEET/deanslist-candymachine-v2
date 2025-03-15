// Import necessary modules
import { create, mplCandyMachine, getMerkleProof, getMerkleRoot } from '@metaplex-foundation/mpl-core-candy-machine';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { readFile } from 'fs/promises';
import { createSignerFromKeypair, generateSigner, publicKey, signerIdentity, some, sol, dateTime } from '@metaplex-foundation/umi';
import bs58 from 'bs58'

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

        const collectionMint = publicKey("5n3ECmNEzfsLq25F4Ls3Api83FRWtbpBfhFeGKDzkN5e");
        console.log('Using collection mint:', collectionMint);

        // Use the required plugins
        umi.use(mplCandyMachine());
        umi.use(signerIdentity(signer));

        console.log('Plugins registered.');

        const candyMachine = generateSigner(umi);

        console.log('Candy machine signer generated:', candyMachine.publicKey);

        console.log('mint', umi.identity.publicKey)

        const destination = publicKey('FThth1Uwkw1JJKMkKohpgiEshYKZojMpfhGHMf2rLZNR')

        const CANDY = './candy.json'
        const rawAllow = await readFile(CANDY, 'utf-8')
        const allowList = JSON.parse(rawAllow)

        const merkleRoot = getMerkleRoot(allowList);
        const base58Root = bs58.encode(Uint8Array.from(merkleRoot));
        console.log("Merkleroot (Base58):", base58Root);

        const createIx = await create(umi, {
            candyMachine,
            collection: collectionMint,
            collectionUpdateAuthority: umi.identity,
            itemsAvailable: 50,
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
                solPayment: some({ lamports: sol(0.1), destination: destination }),
                allowList: some({ merkleRoot: merkleRoot }),
                startDate: some({ date: dateTime("2025-03-11T12:00:00.000Z") }),
                endDate: some({ date: dateTime("2025-03-11T23:00:00.000Z") }),
            }
        });

        console.log('Candy machine creation instruction prepared.');

        const result = await createIx.sendAndConfirm(umi);

        const coreCandyMachine = candyMachine.publicKey;
        console.log('Core-Candy-Machine Address:', coreCandyMachine);
        console.log('View on Solscan:', `https://solscan.io/token/${coreCandyMachine}?cluster=devnet`);

    } catch (err) {
        console.error('An error occurred:', err);
    }
})();
