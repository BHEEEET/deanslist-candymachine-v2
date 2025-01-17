import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine as mplCoreCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { readFile, readdir } from 'fs/promises';
import { extname, join } from 'path';
import { createSignerFromKeypair, generateSigner, keypairIdentity, signerIdentity } from '@metaplex-foundation/umi';
import { createCollectionV1 } from '@metaplex-foundation/mpl-core';

(async () => {
    try {
        // Define constants for configuration
        const RPC_ENDPOINT = 'https://api.devnet.solana.com';
        const ASSETS_FOLDER = './assets'; // Path to your folder containing the .png files
        const WALLET_PATH = 'C:\\Users\\artis\\.config\\solana\\id.json'; // Update with your Windows username

        // Load the default Solana wallet
        const walletFile = await readFile(WALLET_PATH, 'utf8');
        const wallet = JSON.parse(walletFile);

        // Initialize Umi with the chosen RPC endpoint
        const umi = createUmi(RPC_ENDPOINT);
        const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
        const signer = createSignerFromKeypair(umi, keypair);

        // Use the required plugins
        umi.use(irysUploader());
        umi.use(signerIdentity(signer));
        umi.use(keypairIdentity(wallet))

        // Get all .png and .json files in the folder
        const fileNames = await readdir(ASSETS_FOLDER);
        const pngFiles = fileNames
            .filter((file) => extname(file).toLowerCase() === '.png')
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Log the sorted filenames
        console.log('PNG Files to upload (in order):');
        pngFiles.forEach((file, index) => console.log(`${index + 1}: ${file}`));

        // Sequentially upload PNG files and map to URIs
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

        // Create and upload metadata for each PNG
        const metadataUploadArray = [];
        for (const { fileName, uri } of uriUploadArray) {
            // Generate metadata
            const metadata = {
                name: fileName.replace('.png', ''), // Remove the extension from the name
                description: `This is the metadata for ${fileName}.`,
                image: uri, // Reference the uploaded image URI
                attributes: [
                    { trait_type: 'Example Trait', value: 'Example Value' },
                ],
                properties: {
                    files: [
                        {
                            uri,
                            type: 'image/png',
                        },
                    ],
                },
            };

            // Convert metadata to a buffer for upload
            const metadataBuffer = Buffer.from(JSON.stringify(metadata));

            // Upload metadata and store its URI
            const [metadataUri] = await umi.uploader.upload([
                {
                    buffer: metadataBuffer,
                    fileName: `${fileName.replace('.png', '')}.json`,
                    displayName: `${fileName.replace('.png', '')}.json`,
                    uniqueName: `${ASSETS_FOLDER}/${fileName.replace('.png', '')}.json`,
                    contentType: 'application/json',
                    extension: 'json',
                    tags: [],
                },
            ]);

            metadataUploadArray.push({ fileName, imageUri: uri, metadataUri });
        }

        // Log the uploaded metadata URIs
        console.log('Uploaded Metadata URIs:', metadataUploadArray);

    } catch (err) {
        console.error('An error occurred:', err);
    }
})();
