import { addConfigLines, fetchCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { readFile } from 'fs/promises';
import { createSignerFromKeypair, publicKey, signerIdentity, some } from '@metaplex-foundation/umi';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

const candyMachine = publicKey('5QAvMBEKtY4CoxLDJzFUdcusZWNjTeQ2AES1tZ2cc5LU');
const metadatafile = './uploaded_metadata.json';

const addDataToCandy = async () => {
    try {
        // Load the wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        // Initialize Umi with the RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        const signer = createSignerFromKeypair(umi, keypair);
        umi.use(signerIdentity(signer));

        const candyMachineData = await fetchCandyMachine(umi, candyMachine);
        console.log(`Starting itemsLoaded count: ${candyMachineData.itemsLoaded}`);

        // Read and parse metadata file
        const fileContent = await readFile(metadatafile, 'utf-8');
        let configLines = JSON.parse(fileContent);

        // Validate metadata format
        if (!Array.isArray(configLines) || !configLines.every(line => line.name && line.uri)) {
            throw new Error('Invalid metadata format. Each item must have "name" and "uri".');
        }

        async function getBalance() {
            const balanceLamports = await umi.rpc.getBalance(keypair.publicKey);

            // Convert SolAmount to number before performing arithmetic
            const balanceInLamports = Number(balanceLamports.basisPoints);

            return balanceInLamports / 1_000_000_000;  // Convert lamports to SOL
        }


        // Get initial balance
        const initialBalance = await getBalance();
        console.log(`Initial SOL Balance: ${initialBalance.toFixed(6)} SOL`);

        const chunkSize = 5;  // Process 5 NFTs at a time
        let batchIndex = 0;   // Start from index 0

        for (let i = 0; i < configLines.length; i += chunkSize) {
            const chunk = configLines.slice(i, i + chunkSize);
            console.log(`Adding NFTs at index ${batchIndex}:`, chunk);

            try {
                await addConfigLines(umi, {
                    candyMachine,
                    index: batchIndex,
                    configLines: chunk,
                }).sendAndConfirm(umi);

                console.log(`Successfully added ${chunk.length} NFTs at index ${batchIndex}.`);
                batchIndex += 5;  // Increment index by 5 after each batch of 5 NFTs

            } catch (error) {
                if (error instanceof Error && error.message.includes("too large")) {
                    console.error(`Transaction too large. Retrying the same batch with chunk size of ${chunkSize}.`);
                    i -= chunkSize; // Retry the same batch
                } else {
                    console.error('Failed to add NFTs:', error instanceof Error ? error.message : error);
                    break;
                }
            }
        }

        console.log('All NFTs added successfully.');
        // Get final balance
        const finalBalance = await getBalance();
        console.log(`Final SOL Balance: ${finalBalance.toFixed(6)} SOL`);

        // Calculate and log SOL spent
        const solSpent = initialBalance - finalBalance;
        console.log(`Total SOL Spent: ${solSpent.toFixed(6)} SOL`);
    } catch (e) {
        if (e instanceof Error) {
            console.error('Failed to add NFTs:', e.message);
        } else {
            console.error('Unexpected error:', e);
        }
    }
};

addDataToCandy();
