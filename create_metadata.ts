import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { readFile, readdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { createSignerFromKeypair, keypairIdentity, signerIdentity } from '@metaplex-foundation/umi';

(async () => {
    try {
        // Define constants for configuration
        const RPC_ENDPOINT = 'https://api.devnet.solana.com';
        const ASSETS_FOLDER = './assets'; // Path to your folder containing the .png files
        const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username
        const OUTPUT_FILE = './uploaded_metadata.json';

        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        console.log('Wallet:', wallet);

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        console.log('Public Key:', keypair.publicKey.toString());

        const signer = createSignerFromKeypair(umi, keypair);

        // Use the required plugins
        umi.use(irysUploader());
        umi.use(signerIdentity(signer));

        // Get all .png and .json files in the folder
        const fileNames = await readdir(ASSETS_FOLDER);

        // Process and upload PNG files
        const pngFiles = fileNames
            .filter((file) => extname(file).toLowerCase() === '.png')
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Log the sorted filenames
        console.log('PNG Files to upload (in order):');
        pngFiles.forEach((file, index) => console.log(`${index + 1}: ${file}`));

        const uriUploadArray = [];
        for (const file of pngFiles) {
            const filePath = join(ASSETS_FOLDER, file);
            const fileBuffer = await readFile(filePath);
            const fileExtension = extname(file).slice(1);

            const genericFile = {
                buffer: fileBuffer,
                fileName: file,
                displayName: file,
                uniqueName: filePath,
                contentType: `image/${fileExtension}`, // Replace with the correct MIME type
                extension: fileExtension,
                tags: [], // Add tags if necessary
            };

            // Upload the PNG file and store its URI
            const [uri] = await umi.uploader.upload([genericFile]);
            uriUploadArray.push({ fileName: file, uri });
        }

        console.log('Uploaded PNG URIs:', uriUploadArray);

        // Process and upload existing JSON metadata files
        const metadataUploadArray = [];
        const jsonFiles = fileNames
            .filter((file) => extname(file).toLowerCase() === '.json')
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        for (const file of jsonFiles) {
            const filePath = join(ASSETS_FOLDER, file);

            // Read the existing metadata JSON file
            let metadata = JSON.parse(await readFile(filePath, 'utf8'));

            // Match the PNG URI and update metadata
            const matchingPng = uriUploadArray.find((png) => png.fileName.replace('.png', '') === file.replace('.json', ''));
            if (matchingPng) {
                metadata.properties.files[0].uri = matchingPng.uri;
                metadata.image = matchingPng.uri;
            }

            // Convert updated metadata to a buffer
            const metadataBuffer = Buffer.from(JSON.stringify(metadata));

            // Upload the updated JSON metadata file
            const [metadataUri] = await umi.uploader.upload([
                {
                    buffer: metadataBuffer,
                    fileName: file,
                    displayName: file,
                    uniqueName: filePath,
                    contentType: 'application/json',
                    extension: 'json',
                    tags: [],
                },
            ]);

            const metadataUriId = metadataUri.replace('https://gateway.irys.xyz/', '');
            metadataUploadArray.push({ name: metadata.name , uri: metadataUriId });
        }

        // Log the uploaded metadata URIs
        console.log('Uploaded Metadata URIs:', metadataUploadArray);

        // Write only metadata upload array to a JSON file
        await writeFile(OUTPUT_FILE, JSON.stringify(metadataUploadArray, null, 2));

        console.log(`Metadata successfully written to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error('An error occurred:', err);
    }
})();
