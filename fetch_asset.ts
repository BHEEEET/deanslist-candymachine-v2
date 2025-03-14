import { fetchAsset, fetchCollection } from '@metaplex-foundation/mpl-core'
import { readFile } from 'fs/promises';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { endDateGuardManifest, fetchCandyMachine, mplCandyMachine, safeFetchCandyGuard, startDateGuardManifest } from '@metaplex-foundation/mpl-core-candy-machine';
import bs58 from 'bs58';


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
    umi.use(mplCandyMachine());
    const assetAddress = publicKey('JCsyzkAeooXVXKpGKNbgmKVZojVNpEcZ9yQCu2wbHdu9')

    const asset = await fetchAsset(umi, assetAddress, {
        skipDerivePlugins: false,
    })

    const candyMachine = publicKey('5QAvMBEKtY4CoxLDJzFUdcusZWNjTeQ2AES1tZ2cc5LU')

    const candyMachineData = await fetchCandyMachine(umi, candyMachine)
    const guard = await safeFetchCandyGuard(umi, candyMachineData.mintAuthority)

    const collection = publicKey('FfAAFtqAnCwdVWxfKx3mx5gEU1JpJPPhWcp1MGB5x7pR')

    const collectionDAta = await fetchCollection(umi, collection)


    console.log("Autograph:", asset)
    // console.log("Attributes:", asset.attributes)
    // console.log("Delegate:", asset.transferDelegate)
    // console.log(candyMachineData)
    // console.log(collectionDAta)
    // console.log('Royalties: ', collectionDAta.royalties?.creators)
    console.log('Candy', candyMachineData)
    console.log('Guards:', guard)
    if (guard) {
        // Bot Tax
        console.log("botTax:",
            guard.guards.botTax?.__option === 'Some' ?
                `${Number(guard.guards.botTax.value.lamports.basisPoints) / 1_000_000_000} SOL` :
                "None");

        // Sol Payment
        console.log("solPayment:",
            guard.guards.solPayment?.__option === 'Some' ?
                `${Number(guard.guards.solPayment.value.lamports.basisPoints) / 1_000_000_000} SOL` :
                "None");

        // Function to format date in UTC
        const formatUTC = (timestamp: number) => {
            return new Date(timestamp * 1000).toUTCString(); // Convert to UTC format
        };

        // Start Date
        if (guard.guards.startDate?.__option === 'Some' && guard.guards.startDate.value) {
            const startTimestamp = Number(guard.guards.startDate.value.date);
            console.log("Start Date (UTC):", formatUTC(startTimestamp));
        } else {
            console.log("Start Date: None");
        }

        // End Date
        if (guard.guards.endDate?.__option === 'Some' && guard.guards.endDate.value) {
            const endTimestamp = Number(guard.guards.endDate.value.date);
            console.log("End Date (UTC):", formatUTC(endTimestamp));
        } else {
            console.log("End Date: None");
        }



        if (guard.guards.allowList.__option === 'Some') {
            // Extract the Merkle Root Uint8Array safely
            const merkleRootUint8Array = guard.guards.allowList.value.merkleRoot;

            // Convert to Base58 (Solana-style string)
            const merkleRootBase58 = merkleRootUint8Array;

            console.log("Allowlist Merkle Root (Base58):", merkleRootBase58);
        } else {
            console.log("No Merkle Root found in allowList.");
        }
    } else {
        console.log("No guard found");
    }
}

fetchNFT()