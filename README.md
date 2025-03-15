# Deanslist Core Candymachine

## Setup Instructions

Follow these steps to set up and run the Deanslist Core Candymachine:

1. **Setup Assets Folder**
   - Prepare the `assets` folder using one of the art engines.
   - Check metadata
   - Check collection metadata

2. **Generate Metadata**
   - Change the parameters to the right ones

   ```ts
   const RPC_ENDPOINT = 'https://api.devnet.solana.com';
   const IMAGES_FOLDER = './assetsDL/images';
   const JSON_FOLDER = './assetsDL/json';
   const WALLET_PATH = '{YOUR_WALLETPATH}';
   const OUTPUT_FILE = './uploaded_metadata.json';
   const UPLOAD_ZONE = 'https://gateway.irys.xyz/';
   const MAX_ITEMS = 50; // Limit the number of items processed
   ```

   - Run the script

      ```sh
      yarn metadata
      ```

1. **Create Collection**
   ```sh
   yarn collection
   ```
   - Copy the `collection_id` and paste it into `create_corecady.ts`.

2. **Create Candymachine**
   ```sh
   yarn candy
   ```
   - Copy the `candymachine_id` and paste it into `add_config_lines.ts`.

3. **Add Configuration Lines to Candy Machine**
   ```sh
   yarn addconfig
   ```

4. **Mint NFTs**
   ```sh
   yarn mint
   ```

5. **Fetch Assets**
   ```sh
   yarn asset
   ```

   - Get the `candyGuardId` and paste it in the **mintpage**

6. **Update Candy Guards**
   ```sh
   yarn updt
   ```

By following these steps, you will successfully set up and run the Deanslist Core Candymachine.