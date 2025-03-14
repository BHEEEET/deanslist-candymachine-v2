# Deanslist Core Candymachine

## Setup Instructions

Follow these steps to set up and run the Deanslist Core Candymachine:

1. **Setup Assets Folder**
   - Prepare the `assets` folder using one of the art engines.

2. **Generate Metadata**
   ```sh
   yarn metadata
   ```

3. **Create Collection**
   ```sh
   yarn collection
   ```
   - Copy the `collection_id` and paste it into `create_corecady.ts`.

4. **Create Candymachine**
   ```sh
   yarn candy
   ```
   - Copy the `candymachine_id` and paste it into `add_config_lines.ts`.

5. **Add Configuration Lines to Candy Machine**
   ```sh
   yarn addconfig
   ```

6. **Mint NFTs**
   ```sh
   yarn mint
   ```

7. **Fetch Assets**
   ```sh
   yarn asset
   ```

8. **Update Candy Guards**
   ```sh
   yarn updt
   ```

By following these steps, you will successfully set up and run the Deanslist Core Candymachine.