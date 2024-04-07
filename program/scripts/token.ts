import {
  findMetadataPda,
  createMetadataAccountV3,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import * as anchor from "@coral-xyz/anchor";

import path from "path";
import os from "os";

const secretKeyFile = Buffer.from(
  JSON.parse(
    // HOME
    require("fs").readFileSync(
      path.join(os.homedir(), ".config/solana/id.json"),
      {
        encoding: "utf-8",
      }
    )
  )
);

import { mint } from "./address.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";

const quickNodeApiUrl =
"https://flashy-delicate-violet.solana-devnet.quiknode.pro/72bbc0b0fab9fc0806a21bec0da46acde5e84d4b/";
const umi = createUmi(new anchor.web3.Connection(quickNodeApiUrl)).use(
    mplCore()
)

const signer = createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secretKeyFile))

umi.use(signerIdentity(signer));


(async () => {
  const metadataPDA = await findMetadataPda(umi, { mint: publicKey(mint) });

  const createMetadataTx = createMetadataAccountV3(umi, {
    metadata: metadataPDA,
    mint: publicKey(mint),
    mintAuthority: signer,
    data: {
      name: "Apus Token",
      symbol: "APT",
      uri: "https://bafkreiac35kft6gnp7ykzhk7v5775bbstnolyvlmxdp3v6aixh6qlnwtu4.ipfs.nftstorage.link/",
      sellerFeeBasisPoints: 500,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  try {
    const { signature, result } = await createMetadataTx.sendAndConfirm(umi);
    console.log(`Metadata created: ${signature} ${result}`);
  } catch (error) {
    console.error("Failed to create metadata:", error);
  }
})();
