import { CustomHead } from "../../components/Head";
import styles from "../../styles/Home.module.scss";
import ConnectWallet from "../../components/Wallet/ConnectWallet";
import { VStack, Box, Heading, Text, Link } from "@chakra-ui/react";
import { useStoreState } from "easy-peasy";

const NamiWalletWrapper = ({ connected }) => {
  return (
    <VStack>
      <Heading>
        Nami Wallet is {connected === null ? "not connected :(" : "connected!"}
      </Heading>
      <ConnectWallet />
    </VStack>
  );
};

export default function Home(props) {
  const connected = useStoreState((state) => state.connection.connected);
  const { latestBlock } = props;
  return (
    <Box
      className={styles.container}
      bgImage={
        "https://cdn.discordapp.com/attachments/902326748719509557/904527388782784635/Attachment_1635701473.png?fbclid=IwAR2Ux_DoIG9BKru7LISPoB5wzdpjHZu0TEjGGLUjOmcVIqCt9fAbWbDFamo"
      }
    >
      <CustomHead title="page title" />
      <Box className={styles.main}>
        <Heading className={styles.title} color="brand.900">
          <Link href="https://nextjs.org">Tamahagane-CNFT</Link>
        </Heading>
        <Text mb="10">
          Interact with the Nami wallet to view and sign transactions on the
          cardano blockchain{" "}
          {/* <Text mb="10">
          The place where you forge powerfull weapons for defeating your enemys.
          The Tamahagane steel is the famous steel used by Japanese blacksmiths
          for the creation of samurai sword throughout history. It is a very
          rare and precious material, which presents its own challenges when
          using it.
        </Text> */}
        </Text>
        <NamiWalletWrapper connected={connected} />
        <Box className={styles.grid}>
          <Heading fontSize="xl">
            Server-Side rendering calls from Blockfrost API
          </Heading>
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://blockfrost.io/dashboard"
            className={styles.card}
          >
            <Heading as="h2" fontSize="2xl">
              Current Epoch &rarr;
            </Heading>
            {latestBlock ? (
              <Text>{latestBlock.epoch}</Text>
            ) : (
              <Text>Not connected to Blockfrost. API KEY NEEDED</Text>
            )}
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
