import Loader from "./loader";
import {
  LATEST_BLOCK,
  ADDRESSES,
  LATEST_PARAMETERS,
} from "../constants/API/v0/routes";
import axios from "axios";

export const sendLovelacestoAddres = async function (
  LovelacestoAddress,
  Address
) {
  const estimatedFee = BigInt(1000000);
  const amount = LovelacestoAddress + estimatedFee;

  if (await window.cardano.enable()) {
    const clientAddress = await addressToBech32();

    await Loader.load();

    const rawutxos = await window.cardano.getUtxos();
    const utxos = rawutxos.map((rawutxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(
        Buffer.from(rawutxo, "hex")
      )
    );
    const selectedUTXOs = selectUTXO(utxos, amount);

    let txBuilder = await builder();

    //  every utxo in the selectedUtxos gets  added to the transaction
    for (let i = 0; i < selectedUTXOs.length; i++) {
      txBuilder = await addInputs(txBuilder, utxos[i]);
    }
    const latestBlock = await getLatestBlock();

    txBuilder.set_ttl(latestBlock + 2000);

    try {
      txBuilder = await addOutputs(txBuilder, LovelacestoAddress, Address);

      txBuilder = await addChange(txBuilder, clientAddress);
    } catch (e) {
      console.log(
        `We were not able to do the  transaction please check if you have enought founds`
      );
    }

    try {
      const SignedTx = await addWitnessandSign(txBuilder);

      const txHash = await window.cardano.submitTx(toHex(SignedTx.to_bytes()));
      console.log(`Transaction submited, with TxHash ${txHash}`);
    } catch (e) {
      `Transaction could not be submited, please verify if you have  enought founds`;
      console.log(e);
    }
  }
};

export const addressToBech32 = async () => {
  await Loader.load();
  const address = (await window.cardano.getUsedAddresses())[0];
  return Loader.Cardano.Address.from_bytes(
    Buffer.from(address, "hex")
  ).to_bech32();
};
export async function getLatestParams() {
  try {
    // Adds Blockfrost project_id to req header
    const config = {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
      },
    };
    const response = await axios.get(LATEST_PARAMETERS, config);

    return response.data;
  } catch (error) {
    console.log(error.response);
    return null;
  }
}

export const builder = async () => {
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

export const addInputs = async (txBuilder, utxo) => {
  await Loader.load();
  txBuilder.add_input(
    utxo.output().address(),
    utxo.input(),
    utxo.output().amount()
  );
  return txBuilder;
};

export async function addOutputs(txBuilder, price, TamahaganeAddres) {
  await Loader.load();
  const shelleyOutputAddress =
    Loader.Cardano.Address.from_bech32(TamahaganeAddres);

  // pointer address

  txBuilder.add_output(
    Loader.Cardano.TransactionOutput.new(
      shelleyOutputAddress,
      Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str(price.toString()))
    )
  );

  return txBuilder;
}

export async function addChange(txBuilder, changeAddress) {
  await Loader.load();
  const shelleyChangeAddress =
    Loader.Cardano.Address.from_bech32(changeAddress);
  txBuilder.add_change_if_needed(shelleyChangeAddress);
  return txBuilder;
}

export async function addWitnessandSign(txBuilder) {
  await Loader.load();
  const txBody = txBuilder.build();

  const transactionWitnessSet = Loader.Cardano.TransactionWitnessSet.new();
  const tx = Loader.Cardano.Transaction.new(
    txBody,
    Loader.Cardano.TransactionWitnessSet.from_bytes(
      transactionWitnessSet.to_bytes()
    )
  );
  const Signature = await window.cardano.signTx(toHex(tx.to_bytes(tx)));
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

export async function getBalance(address) {
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
    console.log(e);
  }
}

export const selectUTXO = function (utxos, amount) {
  // gets a list of the balances of the utxos
  const balances = utxos.map((x) =>
    BigInt(parseInt(x.output().amount().coin().to_str()))
  );
  // calculates the first index needed to fullify the transaction
  const getIndex = function (balances, amount) {
    let index = 0;

    for (let i = 0; i < balances.length; i++) {
      let partialarray = balances.slice(0, i + 1);
      const partialSum = partialarray.reduce(add, 0n);

      function add(accumulator, a) {
        return accumulator + a;
      }

      index++;

      if (partialSum >= amount) break;
    }
    return index;
  };
  // returns the first utxos needed to cover the transaction if there is not enought it returns all the utxos
  return utxos.slice(0, getIndex(balances, amount));
};

export const toHex = (bytes) => Buffer.from(bytes).toString("hex");
export const fromHex = (hex) => Buffer.from(hex, "hex");

export async function getLatestBlock() {
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
