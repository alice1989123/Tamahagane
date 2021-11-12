const axios = require("axios");
import BuyCards from "../views/BuyCards/BuyCards";
import {
  LATEST_BLOCK,
  ADDRESSES,
  LATEST_PARAMETERS,
} from "../constants/API/v0/routes";
import Loader from "../cardano/loader";
import { Button } from "@chakra-ui/button";

const toHex = (bytes) => Buffer.from(bytes).toString("hex");
const fromHex = (hex) => Buffer.from(hex, "hex");

export default function BuyCardsPage(props) {
  let latestBlock = props.latestBlock;
  console.log(latestBlock);

  const addressToBech32 = async () => {
    await Loader.load();
    const address = (await window.cardano.getUsedAddresses())[0];
    return Loader.Cardano.Address.from_bytes(
      Buffer.from(address, "hex")
    ).to_bech32();
  };

  const builder = async () => {
    await Loader.load();
    const latestParameters = await getLatestParams();
    const params = [
      latestParameters.min_fee_a,
      latestParameters.min_fee_b,
      latestParameters.min_utxo,
      latestParameters.pool_deposit,
      latestParameters.key_deposit,
      latestParameters.max_val_size,
      latestParameters.max_tx_size,
    ].map((x) => x.toString());
    console.log(latestParameters);
    console.log(params);

    return Loader.Cardano.TransactionBuilder.new(
      // linear fee parameters (a*size + b)
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(params[0]),
        Loader.Cardano.BigNum.from_str(params[1])
      ),
      // minimum utxo value
      Loader.Cardano.BigNum.from_str(params[2]),
      // pool deposit
      Loader.Cardano.BigNum.from_str(params[3]),
      // key deposit
      Loader.Cardano.BigNum.from_str(params[4]),
      //  max-value-size
      params[5],
      // max-tx-size
      params[6]
    );
  };

  const addInputs = async (txBuilder, utxo) => {
    await Loader.load();
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
    return txBuilder;
  };

  async function addOutputs(txBuilder) {
    await Loader.load();
    const shelleyOutputAddress =
      Loader.Cardano.Address.from_bech32(TamahaganeAddres);

    // pointer address

    txBuilder.add_output(
      Loader.Cardano.TransactionOutput.new(
        shelleyOutputAddress,
        Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str("1000000"))
      )
    );

    return txBuilder;
  }

  async function addChange(txBuilder, changeAddress) {
    await Loader.load();
    const shelleyChangeAddress =
      Loader.Cardano.Address.from_bech32(changeAddress);
    txBuilder.add_change_if_needed(shelleyChangeAddress);
    return txBuilder;
  }

  async function addWitnessandSign(txBuilder) {
    await Loader.load();
    const txBody = txBuilder.build();

    const transactionWitnessSet = Loader.Cardano.TransactionWitnessSet.new();
    const tx = Loader.Cardano.Transaction.new(
      txBody,
      Loader.Cardano.TransactionWitnessSet.from_bytes(
        transactionWitnessSet.to_bytes()
      )
    );
    const Signature = await window.cardano.submitTx(signedTx);

    const txVkeyWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
      fromHex(Signature)
    );
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = Loader.Cardano.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data()
    );
    return signedTx;
  }

  const getUTXO = async () => {
    await Loader.load();
    const rawUtxo = (await window.cardano.getUtxos())[0];
    const utxo = Loader.Cardano.TransactionUnspentOutput.from_bytes(
      Buffer.from(rawUtxo, "hex")
    );
    return utxo;
  };

  const estimateFee = async () => await Loader.load();

  const testingAddres =
    "addr_test1qp6kuchljenmrpeqndh7rdthqc2frnm0jw5pu8u3ws0zuwkvhpj2uecg0a5mhkdtwnm30qw38tjq42uxu80rpjn7yytsmffw4e";

  const balance = getBalance(testingAddres);
  console.log(balance);
  const TamahaganeAddres =
    "addr_test1qp6kuchljenmrpeqndh7rdthqc2frnm0jw5pu8u3ws0zuwkvhpj2uecg0a5mhkdtwnm30qw38tjq42uxu80rpjn7yytsmffw4e";
  const price = BigInt(2000000);

  return (
    <>
      <BuyCards {...props} />
      <div> {LATEST_BLOCK}</div>
      <div>{latestBlock}</div>
      <Button
        colorScheme="teal"
        rounded="lg"
        position="relative"
        overflow="hidden"
        py="0.5"
        onClick={async () => {
          if (await window.cardano.enable()) {
            const clientAddress = await addressToBech32();
            console.log(clientAddress);
            /* window.cardano.signTx(
              "83a40081825820eef507b798abbb8a1360efbd113f51eda22e2fbaae3cc32c78724c8644c164a400018282583900756e62ff9667b187209b6fe1b577061491cf6f93a81e1f91741e2e3accb864ae67087f69bbd9ab74f71781d13ae40aab86e1de30ca7e21171a000f424082583900756e62ff9667b187209b6fe1b577061491cf6f93a81e1f91741e2e3accb864ae67087f69bbd9ab74f71781d13ae40aab86e1de30ca7e21171a1dbb916f021a00029151031a02a27040a0f6"
            ); */
            const rawutxos = window.cardano.getUtxos();

            let txBuilder = await builder();
            const utxo = await getUTXO();
            txBuilder = await addInputs(txBuilder, utxo);
            txBuilder.set_ttl(latestBlock + 2000);
            txBuilder = await addOutputs(txBuilder);
            txBuilder = await addChange(txBuilder, clientAddress);
            const siggnedTx = await addWitnessandSign(txBuilder);
            console.log("txSubmited");

            /* await window.cardano.submitTX(txSigned);
            console.log("transaction submited"); */
          }
        }}
      />
    </>
  );
}

export async function getServerSideProps() {
  async function getLatestBlock() {
    try {
      const config = {
        headers: {
          project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
        },
      };
      const response = await axios.get(LATEST_BLOCK, config);
      return response.data.slot;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const latestBlock = await getLatestBlock();
  return {
    props: {
      latestBlock,
    },
  };
}

/* async function getUTXO(address) {
  try {
    const uTXOapi = `${ADDRESSES}/${address}/utxos`;
    const config = {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
      },
    };
    const response = await axios.get(uTXOapi, config);
    console.log(response.data);
    return response;
  } catch (e) {
    console.log(e.data);
  }
}
 */
async function getBalance(address) {
  try {
    const uTXOapi = `${ADDRESSES}/${address}`;
    const config = {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
      },
    };
    const response = await axios.get(uTXOapi, config);
    const balanceLoveLace = BigInt(response.data.amount[0].quantity);
    return balanceLoveLace;
  } catch (e) {
    console.log(e.data);
  }
}

async function getLatestParams() {
  try {
    // Adds Blockfrost project_id to req header
    const config = {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
      },
    };
    const response = await axios.get(LATEST_PARAMETERS, config);

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.response);
    return null;
  }
}
