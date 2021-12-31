import Loader from "./loader";
import CustomLoader from "./customLoader.js";
import {
  LATEST_BLOCK,
  ADDRESSES,
  LATEST_PARAMETERS,
} from "../constants/routes.js";
import axios from "axios";
import CoinSelection from "./CoinSelection.js";
import { Buffer } from "safe-buffer";
import { getParams, getUtxos } from "./apiServerCalls";
import { languageViews } from "./Types/LanguageViews";
import { PlutusDataObject } from "./Types/PlutusDataObject";
import { PlutusField, PlutusFieldType } from "./Types/PlutusField";
import { Address } from "./custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib_bg";
import { Value } from "./@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib_bg";
import { Contract } from "./marketPlaceContract";
import { registerSell } from "./apiServerCalls";

export function toHex(bytes) {
  return Buffer.from(bytes, "hex").toString("hex");
}
export function fromHex(hex) {
  return Buffer.from(hex, "hex");
}
export const sendLovelacestoAddres = async function (
  LovelacestoAddress,
  Address,
  buyingOption
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
    const selectedUTXOs = utxos; //selectUTXO(utxos, amount); We must implement a selecting algorithm MINE AS WELL AS BERRY HAVE SOME ISSUES

    let txBuilder = await makeTxBuilder();

    //  every utxo in the selectedUtxos gets  added to the transaction
    for (let i = 0; i < selectedUTXOs.length; i++) {
      txBuilder = await addInputs(txBuilder, utxos[i]);
    }
    const latestBlock = await getLatestBlock();

    txBuilder.set_ttl(latestBlock + 2000);

    txBuilder = await addOutputs(txBuilder, LovelacestoAddress, Address);

    txBuilder = await addChange(txBuilder, clientAddress);

    const txBody = txBuilder.build();

    const transactionWitnessSet = Loader.Cardano.TransactionWitnessSet.new();
    const tx = Loader.Cardano.Transaction.new(
      txBody,
      Loader.Cardano.TransactionWitnessSet.from_bytes(
        transactionWitnessSet.to_bytes()
      )
    );
    let Signature;
    try {
      Signature = await window.cardano.signTx(toHex(tx.to_bytes(tx)));
    } catch (e) {
      return "SIGNING-ERROR";
    }

    const txVkeyWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
      fromHex(Signature)
    );
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = Loader.Cardano.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data()
    );

    let txHash;

    try {
      txHash = await window.cardano.submitTx(toHex(signedTx.to_bytes()));
    } catch (e) {
      return "SUBMITION-ERROR";
    }

    console.log(`Transaction submited, with TxHash ${txHash}`);
    return txHash;
  }
};

export const addressBech32 = async () => {
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

export async function maketxconfigBuilder() {
  await Loader.load();
  const p = await initTx();
  let configBuilder = Loader.Cardano.TransactionBuilderConfigBuilder.new();

  configBuilder = configBuilder.fee_algo(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(p.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(p.linearFee.minFeeB)
    )
  );
  configBuilder = configBuilder.coins_per_utxo_word(
    Loader.Cardano.BigNum.from_str(p.coinsPerUtxoWord)
  );
  configBuilder = configBuilder.pool_deposit(
    Loader.Cardano.BigNum.from_str(p.poolDeposit)
  );
  configBuilder = configBuilder.key_deposit(
    Loader.Cardano.BigNum.from_str(p.keyDeposit)
  );
  configBuilder = configBuilder.max_tx_size(p.maxTxSize);
  configBuilder = configBuilder.max_value_size(p.maxValSize);
  configBuilder = configBuilder.prefer_pure_change(true);
  const config = configBuilder.build();
  return config;
}

export async function makeTxBuilder() {
  const config = await maketxconfigBuilder();
  const txBuilder = Loader.Cardano.TransactionBuilder.new(config);
  return txBuilder;
}

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

  const Signature = await window.Cardano.signTx(toHex(tx.to_bytes(tx)));

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
  //TODO: check this!
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

const amountToValue = async (assets) => {
  //await Loader.load();
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Loader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Loader.Cardano.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
        Loader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Loader.Cardano.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};

const hexToAscii = (hex) => {
  var _hex = hex.toString();
  var str = "";
  for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  return str;
};

const asciiToHex = (str) => {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join("");
};

export async function createLockingPolicyScript() {
  const slot = await getLatestBlock();
  const ttl = slot + 1000;
  const address = Buffer.from(
    (await window.cardano.getUsedAddresses())[0],
    "hex"
  );
  const paymentKeyHash = Loader.Cardano.BaseAddress.from_address(
    Loader.Cardano.Address.from_bytes(address)
  )
    .payment_cred()
    .to_keyhash();

  const nativeScripts = Loader.Cardano.NativeScripts.new();
  const script = Loader.Cardano.ScriptPubkey.new(paymentKeyHash);
  const nativeScript = Loader.Cardano.NativeScript.new_script_pubkey(script);
  const lockScript = Loader.Cardano.NativeScript.new_timelock_expiry(
    Loader.Cardano.TimelockExpiry.new(ttl)
  );
  nativeScripts.add(nativeScript);
  nativeScripts.add(lockScript);
  const finalScript = Loader.Cardano.NativeScript.new_script_all(
    Loader.Cardano.ScriptAll.new(nativeScripts)
  );
  const policyId = Buffer.from(
    Loader.Cardano.ScriptHash.from_bytes(
      finalScript.hash().to_bytes()
    ).to_bytes(),
    "hex"
  ).toString("hex");
  return { id: policyId, script: finalScript, ttl };
}

export async function MintTx(metadata) {
  const protocolParameters = await initTx();

  const policy = await createLockingPolicyScript();

  let name = metadata.name.slice(0, 32);

  const assets = [{ name: name, quantity: metadata.quantity.toString() }];

  const METADATA = {
    [policy.id]: {
      [name.slice(0, 32)]: {
        ...metadata.metadata,
      },
    },
  };
  // console.log(METADATA);

  try {
    const transaction = await mintTx(
      assets,
      METADATA,
      policy,
      protocolParameters
    );
    const signedTx = await signTx(transaction);
    const txHash = await submitTx(signedTx);
    return txHash;
  } catch (error) {
    console.log(error);
    return { error: error.info || error.toString() };
  }
  // const metadata = METADATA
}

export async function mintTx(assets, metadata, policy, protocolParameters) {
  const address = Buffer.from(
    (await window.cardano.getUsedAddresses())[0],
    "hex"
  );

  const checkValue = await amountToValue(
    assets.map((asset) => ({
      unit: policy.id + asciiToHex(asset.name),
      quantity: asset.quantity,
    }))
  );

  const minAda = Loader.Cardano.min_ada_required(
    checkValue,
    Loader.Cardano.BigNum.from_str(protocolParameters.minUtxo)
  );

  let value = Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str("0"));
  const _outputs = Loader.Cardano.TransactionOutputs.new();
  _outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      Loader.Cardano.Value.new(minAda)
    )
  );
  const utxos = (await window.cardano.getUtxos()).map((utxo) =>
    Loader.Cardano.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, "hex"))
  );

  CoinSelection.setProtocolParameters(
    protocolParameters.minUtxo,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize
  );
  const selection = await CoinSelection.randomImprove(utxos, _outputs, 20);
  const nativeScripts = Loader.Cardano.NativeScripts.new();
  nativeScripts.add(policy.script);

  const mintedAssets = Loader.Cardano.Assets.new();
  assets.forEach((asset) => {
    mintedAssets.insert(
      Loader.Cardano.AssetName.new(Buffer.from(asset.name)),
      Loader.Cardano.BigNum.from_str(asset.quantity)
    );
  });

  const mintedValue = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str("0")
  );

  const multiAsset = Loader.Cardano.MultiAsset.new();
  multiAsset.insert(
    Loader.Cardano.ScriptHash.from_bytes(policy.script.hash().to_bytes()),
    mintedAssets
  );

  mintedValue.set_multiasset(multiAsset);
  value = value.checked_add(mintedValue);

  const mint = Loader.Cardano.Mint.new();

  const mintAssets = Loader.Cardano.MintAssets.new();
  assets.forEach((asset) => {
    mintAssets.insert(
      Loader.Cardano.AssetName.new(Buffer.from(asset.name)),
      Loader.Cardano.Int.new(Loader.Cardano.BigNum.from_str(asset.quantity))
    );
  });

  mint.insert(
    Loader.Cardano.ScriptHash.from_bytes(
      policy.script
        .hash(Loader.Cardano.ScriptHashNamespace.NativeScript)
        .to_bytes()
    ),
    mintAssets
  );

  const inputs = Loader.Cardano.TransactionInputs.new();
  selection.input.forEach((utxo) => {
    inputs.add(
      Loader.Cardano.TransactionInput.new(
        utxo.input().transaction_id(),
        utxo.input().index()
      )
    );
    value = value.checked_add(utxo.output().amount());
  });

  const rawOutputs = Loader.Cardano.TransactionOutputs.new();
  rawOutputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      value
    )
  );
  const fee = Loader.Cardano.BigNum.from_str("0");

  const rawTxBody = Loader.Cardano.TransactionBody.new(
    inputs,
    rawOutputs,
    fee,
    policy.ttl
  );
  rawTxBody.set_mint(mint);

  let _metadata;
  if (metadata) {
    const generalMetadata = Loader.Cardano.GeneralTransactionMetadata.new();
    //console.log(Buffer.from(generalMetadata.to_bytes(), "hex").toString("hex"));

    generalMetadata.insert(
      Loader.Cardano.BigNum.from_str("721"),
      Loader.Cardano.encode_json_str_to_metadatum(JSON.stringify(metadata))
    );
    /*     console.log(Loader.Cardano.AuxiliaryData.new().len());
     */ _metadata = Loader.Cardano.AuxiliaryData.new();
    _metadata.set_metadata(generalMetadata);

    console.log(`the metadata is ${_metadata.metadata()}`);

    rawTxBody.set_auxiliary_data_hash(
      Loader.Cardano.hash_auxiliary_data(_metadata)
    );
  }
  const witnesses = Loader.Cardano.TransactionWitnessSet.new();
  witnesses.set_native_scripts(nativeScripts);

  const dummyVkeyWitness =
    "8258208814c250f40bfc74d6c64f02fc75a54e68a9a8b3736e408d9820a6093d5e38b95840f04a036fa56b180af6537b2bba79cec75191dc47419e1fd8a4a892e7d84b7195348b3989c15f1e7b895c5ccee65a1931615b4bdb8bbbd01e6170db7a6831310c";

  const vkeys = Loader.Cardano.Vkeywitnesses.new();
  vkeys.add(
    Loader.Cardano.Vkeywitness.from_bytes(Buffer.from(dummyVkeyWitness, "hex"))
  );
  vkeys.add(
    Loader.Cardano.Vkeywitness.from_bytes(Buffer.from(dummyVkeyWitness, "hex"))
  );
  witnesses.set_vkeys(vkeys);

  const rawTx = Loader.Cardano.Transaction.new(rawTxBody, witnesses, _metadata);
  const linearFee = Loader.Cardano.LinearFee.new(
    Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
    Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
  );
  let minFee = Loader.Cardano.min_fee(rawTx, linearFee);

  value = value.checked_sub(Loader.Cardano.Value.new(minFee));
  const outputs = Loader.Cardano.TransactionOutputs.new();
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      value
    )
  );

  const finalTxBody = Loader.Cardano.TransactionBody.new(
    inputs,
    outputs,
    minFee,
    policy.ttl
  );
  finalTxBody.set_mint(rawTxBody.multiassets());
  finalTxBody.set_auxiliary_data_hash(rawTxBody.auxiliary_data_hash());

  const finalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  finalWitnesses.set_native_scripts(nativeScripts);

  const transaction = Loader.Cardano.Transaction.new(
    finalTxBody,
    finalWitnesses,
    rawTx.auxiliary_data()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize) throw ERROR.txTooBig;

  return transaction;
}

export const initTx = async () => {
  const latest_block = await getLatestBlock();
  const p = await getLatestParams();

  return {
    linearFee: {
      minFeeA: p.min_fee_a.toString(),
      minFeeB: p.min_fee_b.toString(),
    },
    minUtxo: "1000000", //p.min_utxo, minUTxOValue protocol paramter has been removed since Alonzo HF. Calulation of minADA works differently now, but 1 minADA still sufficient for now
    poolDeposit: p.pool_deposit,
    keyDeposit: p.key_deposit,
    coinsPerUtxoWord: "34482",
    maxValSize: 5000,
    priceMem: 5.77e-2,
    priceStep: 7.21e-5,
    maxTxSize: parseInt(p.max_tx_size),
    slot: parseInt(latest_block),
  };
};

async function signTx(transaction) {
  //await Loader.load();
  const witnesses = await window.cardano.signTx(
    Buffer.from(transaction.to_bytes(), "hex").toString("hex")
  );
  const txWitnesses = transaction.witness_set();
  const txVkeys = txWitnesses.vkeys();
  const txScripts = txWitnesses.native_scripts();

  const addWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
    Buffer.from(witnesses, "hex")
  );
  const addVkeys = addWitnesses.vkeys();
  const addScripts = addWitnesses.native_scripts();

  const totalVkeys = Loader.Cardano.Vkeywitnesses.new();
  const totalScripts = Loader.Cardano.NativeScripts.new();

  if (txVkeys) {
    for (let i = 0; i < txVkeys.len(); i++) {
      totalVkeys.add(txVkeys.get(i));
    }
  }
  if (txScripts) {
    for (let i = 0; i < txScripts.len(); i++) {
      totalScripts.add(txScripts.get(i));
    }
  }
  if (addVkeys) {
    for (let i = 0; i < addVkeys.len(); i++) {
      totalVkeys.add(addVkeys.get(i));
    }
  }
  if (addScripts) {
    for (let i = 0; i < addScripts.len(); i++) {
      totalScripts.add(addScripts.get(i));
    }
  }

  const totalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  totalWitnesses.set_vkeys(totalVkeys);
  totalWitnesses.set_native_scripts(totalScripts);

  const signedTx = await Loader.Cardano.Transaction.new(
    transaction.body(),
    totalWitnesses,
    transaction.auxiliary_data()
  );
  return signedTx;
}
export async function submitTx(signedTx) {
  try {
    const txHash = await window.cardano.submitTx(
      Buffer.from(signedTx.to_bytes(), "hex").toString("hex")
    );
    return txHash;
  } catch (e) {
    console.log(e);
  }
}

export async function createTamahagenPolicyScript() {
  const slot = await getLatestBlock();
  const ttl = slot + 1000;
  const address = Buffer.from(
    (await window.cardano.getUsedAddresses())[0],
    "hex"
  );

  const tamahaganeAddress = Loader.Cardano.Address.from_bech32(
    "addr_test1qrj8usl8knn54f42aaphxxq94956jsl7mv259tjd83uk75wthmqmh5c9s5vr6fg8el3f835cv8gvmdshy505xdhe0aqsayctzd"
  );

  const paymentKeyHash = Loader.Cardano.BaseAddress.from_address(
    Loader.Cardano.Address.from_bytes(address)
  )
    .payment_cred()
    .to_keyhash();

  const tamahaganeKeyHash = Loader.Cardano.BaseAddress.from_address(
    tamahaganeAddress
  )
    .payment_cred()
    .to_keyhash();

  const nativeScripts = Loader.Cardano.NativeScripts.new();
  const script = Loader.Cardano.ScriptPubkey.new(paymentKeyHash);
  const nativeScript = Loader.Cardano.NativeScript.new_script_pubkey(script);
  const tamahagenScript = Loader.Cardano.ScriptPubkey.new(tamahaganeKeyHash);
  const tamahaganeNativeScript =
    Loader.Cardano.NativeScript.new_script_pubkey(tamahagenScript);

  const lockScript = Loader.Cardano.NativeScript.new_timelock_expiry(
    Loader.Cardano.TimelockExpiry.new(ttl)
  );
  nativeScripts.add(nativeScript);
  /*   nativeScripts.add(tamahaganeNativeScript);
   */ nativeScripts.add(lockScript);

  const finalScript = Loader.Cardano.NativeScript.new_script_all(
    Loader.Cardano.ScriptAll.new(nativeScripts)
  );
  const policyId = Buffer.from(
    Loader.Cardano.ScriptHash.from_bytes(
      finalScript.hash().to_bytes()
    ).to_bytes(),
    "hex"
  ).toString("hex");
  return { id: policyId, script: finalScript, ttl };
}

export async function MintWeapon(metadata) {
  const protocolParameters = await initTx();

  const policy = await createTamahagenPolicyScript();

  let name = metadata.name.slice(0, 32);

  const assets = [{ name: name, quantity: metadata.quantity.toString() }];

  const METADATA = {
    [policy.id]: {
      [name.slice(0, 32)]: {
        ...metadata.metadata,
      },
    },
    ["version"]: "1.0",
  };
  console.log(METADATA);

  try {
    const transaction = await mintTx(
      assets,
      METADATA,
      policy,
      protocolParameters
    );
    const signedTx = await partialsignTx(transaction);
    const txHash = await submitTx(signedTx);
    return txHash;
  } catch (error) {
    console.log(error);
    return { error: error.info || error.toString() };
  }
  // const metadata = METADATA
}

async function partialsignTx(transaction) {
  //await Loader.load();
  const witnesses = await window.cardano.signTx(
    Buffer.from(transaction.to_bytes(), "hex").toString("hex"),
    true
  );
  const txWitnesses = transaction.witness_set();
  const txVkeys = txWitnesses.vkeys();
  const txScripts = txWitnesses.native_scripts();

  const addWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
    Buffer.from(witnesses, "hex")
  );
  const addVkeys = addWitnesses.vkeys();
  const addScripts = addWitnesses.native_scripts();

  const totalVkeys = Loader.Cardano.Vkeywitnesses.new();
  const totalScripts = Loader.Cardano.NativeScripts.new();

  if (txVkeys) {
    for (let i = 0; i < txVkeys.len(); i++) {
      totalVkeys.add(txVkeys.get(i));
    }
  }
  if (txScripts) {
    for (let i = 0; i < txScripts.len(); i++) {
      totalScripts.add(txScripts.get(i));
    }
  }
  if (addVkeys) {
    for (let i = 0; i < addVkeys.len(); i++) {
      totalVkeys.add(addVkeys.get(i));
    }
  }
  if (addScripts) {
    for (let i = 0; i < addScripts.len(); i++) {
      totalScripts.add(addScripts.get(i));
    }
  }

  const totalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  totalWitnesses.set_vkeys(totalVkeys);
  totalWitnesses.set_native_scripts(totalScripts);

  const signedTx = await Loader.Cardano.Transaction.new(
    transaction.body(),
    totalWitnesses,
    transaction.auxiliary_data()
  );
  console.log(signedTx);
  console.log(signedTx.witness_set());
  console.log(Buffer.from(signedTx.to_bytes(), "hex").toString("hex"));
  return signedTx;
}
export function metadataBuilder(description, src, name, mediaType) {
  return {
    description: description,
    files: [
      {
        mediaType: mediaType,
        name: name,
        src: src,
      },
    ],
    image: src,
    mediaType: mediaType,
    name: name,
  };
}

export async function signTx_(transaction_) {
  //await Loader.load();
  const transaction = Loader.Cardano.Transaction.from_bytes(
    Buffer.from(transaction_, "hex")
  );
  const witnesses = await window.cardano.signTx(transaction_, true);

  const txWitnesses = transaction.witness_set();
  const txVkeys = txWitnesses.vkeys();
  const txScripts = txWitnesses.native_scripts();

  const addWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
    Buffer.from(witnesses, "hex")
  );
  const addVkeys = addWitnesses.vkeys();
  const addScripts = addWitnesses.native_scripts();

  const totalVkeys = Loader.Cardano.Vkeywitnesses.new();
  const totalScripts = Loader.Cardano.NativeScripts.new();

  if (txVkeys) {
    for (let i = 0; i < txVkeys.len(); i++) {
      totalVkeys.add(txVkeys.get(i));
    }
  }
  if (txScripts) {
    for (let i = 0; i < txScripts.len(); i++) {
      totalScripts.add(txScripts.get(i));
    }
  }
  if (addVkeys) {
    for (let i = 0; i < addVkeys.len(); i++) {
      totalVkeys.add(addVkeys.get(i));
    }
  }
  if (addScripts) {
    for (let i = 0; i < addScripts.len(); i++) {
      totalScripts.add(addScripts.get(i));
    }
  }

  const totalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  totalWitnesses.set_vkeys(totalVkeys);
  totalWitnesses.set_native_scripts(totalScripts);

  const signedTx = await Loader.Cardano.Transaction.new(
    transaction.body(),
    totalWitnesses,
    transaction.auxiliary_data()
  );
  return signedTx;
}

export const assetsToValue = (assets) => {
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Loader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Loader.Cardano.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
        Loader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Loader.Cardano.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};

export const valueToAssets = (value) => {
  const assets = [];
  assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
  if (value.multiasset()) {
    const multiAssets = value.multiasset().keys();
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);
      const policyAssets = value.multiasset().get(policy);
      const assetNames = policyAssets.keys();
      for (let k = 0; k < assetNames.len(); k++) {
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset =
          Buffer.from(policy.to_bytes(), "hex").toString("hex") +
          Buffer.from(policyAsset.name(), "hex").toString("hex");
        assets.push({
          unit: asset,
          quantity: quantity.to_str(),
        });
      }
    }
  }
  return assets;
};

export async function sell(selectedAsset, askingPrice, metadata) {
  if (selectedAsset.length == 0) {
    console.log("you have not selected an asset to sell");
  } else {
    await CustomLoader.load();
    const martketAddressbech32 =
      "addr_test1wp9cnq967kcf7dtn7fhpqr0cz0wjffse67qc3ww4v3c728c4qjr6j";
    const marketAddress =
      CustomLoader.Cardano.Address.from_bech32(martketAddressbech32);

    async function initTx(protocolParameters) {
      const txBuilder = CustomLoader.Cardano.TransactionBuilder.new(
        CustomLoader.Cardano.LinearFee.new(
          CustomLoader.Cardano.BigNum.from_str(
            protocolParameters.linearFee.minFeeA
          ),
          CustomLoader.Cardano.BigNum.from_str(
            protocolParameters.linearFee.minFeeB
          )
        ),
        CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
        CustomLoader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
        CustomLoader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
        protocolParameters.maxValSize,
        protocolParameters.maxTxSize,
        protocolParameters.priceMem,
        protocolParameters.priceStep,
        CustomLoader.Cardano.LanguageViews.new(
          Buffer.from(languageViews, "hex")
        )
      );
      const datums = CustomLoader.Cardano.PlutusList.new();
      const outputs = CustomLoader.Cardano.TransactionOutputs.new();
      return { txBuilder };
    }

    //console.log(selectedAsset[0]);
    const hexUtxos = await window.cardano.getUtxos();

    //console.log(hexUtxos);

    const utxos = hexUtxos.map((x) =>
      CustomLoader.Cardano.TransactionUnspentOutput.from_bytes(
        Buffer.from(x, "hex")
      )
    );

    const protocolParameters = await getParams();

    // console.log(protocolParameters);

    const { txBuilder } = await initTx(protocolParameters);

    const hexAddress = await addressBech32();

    const clientAddress = CustomLoader.Cardano.Address.from_bech32(hexAddress);

    const baseAddress =
      CustomLoader.Cardano.BaseAddress.from_address(clientAddress);

    const pkh = baseAddress.payment_cred().to_keyhash().to_bytes();
    //console.log(pkh);
    console.log(Buffer.from(pkh, "hex").toString("hex"));

    const policyId = selectedAsset.unit.slice(0, 56);
    //console.log(policyId);
    const assetNameHex = selectedAsset.unit.slice(56);

    console.log(assetNameHex);

    const assetName = Buffer.from(assetNameHex, "hex").toString("utf8");
    console.log(assetName, Buffer.from(fromHex(assetNameHex), "hex"));

    CoinSelection.setProtocolParameters(
      protocolParameters.minUtxo.toString(),
      protocolParameters.linearFee.minFeeA.toString(),
      protocolParameters.linearFee.minFeeB.toString(),
      protocolParameters.maxTxSize.toString()
    );

    const hoskyDatumObject = OfferDatum(pkh, askingPrice, policyId, assetName);

    console.log(hoskyDatumObject);

    const datum = await ToPlutusData(hoskyDatumObject);

    console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

    //    console.log(datum);

    const datumHash = CustomLoader.Cardano.hash_plutus_data(datum);

    console.log(Buffer.from(datumHash.to_bytes(), "hex").toString("hex"));

    /*  console.log(
      Buffer.from(
        CustomLoader.Cardano.hash_plutus_data(datum).to_bytes(),
        "hex"
      ).toString("hex")
    ); */

    console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

    const outPutValue_ = await amountToValue([
      {
        unit: selectedAsset.unit,
        quantity: selectedAsset.quantity,
      },
    ]);

    const outPutValue = CustomLoader.Cardano.Value.from_bytes(
      //This is needed because amountToValue uses Loader instead of CustomLoader maybe we should just use Custom Loader everywhere instead
      outPutValue_.to_bytes()
    );

    const datumHashBytes = datumHash.to_bytes(); //this is required because ptr changes after it is used
    const min_ada_required = CustomLoader.Cardano.min_ada_required(
      outPutValue,
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
      datumHash
    );
    outPutValue.set_coin(min_ada_required);

    const outPut = CustomLoader.Cardano.TransactionOutput.new(
      marketAddress,
      outPutValue
    );

    outPut.set_data_hash(
      CustomLoader.Cardano.DataHash.from_bytes(datumHashBytes)
    );

    const outPuts = CustomLoader.Cardano.TransactionOutputs.new();
    outPuts.add(outPut);
    let { input, change } = CoinSelection.randomImprove(utxos, outPuts, 8);
    input.forEach((utxo) => {
      txBuilder.add_input(
        utxo.output().address(),
        utxo.input(),
        utxo.output().amount()
      );
    });

    txBuilder.add_output(outPut);

    const transactionWitnessSet =
      CustomLoader.Cardano.TransactionWitnessSet.new();

    if (metadata) {
      aux_data = CustomLoader.Cardano.AuxiliaryData.new();
      const generalMetadata =
        CustomLoader.Cardano.GeneralTransactionMetadata.new();
      Object.keys(metadata).forEach((label) => {
        Object.keys(metadata[label]).length > 0 &&
          generalMetadata.insert(
            CustomLoader.Cardano.BigNum.from_str(label),
            CustomLoader.Cardano.encode_json_str_to_metadatum(
              JSON.stringify(metadata[label]),
              1
            )
          );
      });

      aux_data.set_metadata(generalMetadata);
      txBuilder.set_auxiliary_data(aux_data);
    }

    txBuilder.add_change_if_needed(clientAddress);

    const txBody = txBuilder.build();
    const tx = CustomLoader.Cardano.Transaction.new(
      txBody,
      CustomLoader.Cardano.TransactionWitnessSet.new(),
      txBody.auxiliary_data
    );
    const size = tx.to_bytes().length * 2;
    console.log(size);
    if (size > protocolParameters.maxTxSize)
      throw new Error("MAX_SIZE_REACHED");
    let txVkeyWitnesses = await window.cardano.signTx(
      toHex(tx.to_bytes()),
      true
    );
    console.log(toHex(tx.to_bytes()));
    txVkeyWitnesses = CustomLoader.Cardano.TransactionWitnessSet.from_bytes(
      fromHex(txVkeyWitnesses)
    );
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
    const signedTx = CustomLoader.Cardano.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data()
    );

    console.log("Full Tx Size", signedTx.to_bytes().length);

    const txHash = await window.cardano.submitTx(toHex(signedTx.to_bytes()));
    console.log(
      `Your item has been listened at sale for a price of ${askingPrice}`
    );
    return txHash;
  }
}

export async function CancelSell(asset, metadata) {
  await CustomLoader.load();
  const martketAddressbech32 =
    "addr_test1wp9cnq967kcf7dtn7fhpqr0cz0wjffse67qc3ww4v3c728c4qjr6j";
  const marketAddress =
    CustomLoader.Cardano.Address.from_bech32(martketAddressbech32);

  async function initTx(protocolParameters) {
    const txBuilder = CustomLoader.Cardano.TransactionBuilder.new(
      CustomLoader.Cardano.LinearFee.new(
        CustomLoader.Cardano.BigNum.from_str(
          protocolParameters.linearFee.minFeeA
        ),
        CustomLoader.Cardano.BigNum.from_str(
          protocolParameters.linearFee.minFeeB
        )
      ),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
      protocolParameters.maxValSize,
      protocolParameters.maxTxSize,
      protocolParameters.priceMem,
      protocolParameters.priceStep,
      CustomLoader.Cardano.LanguageViews.new(Buffer.from(languageViews, "hex"))
    );

    return { txBuilder };
  }

  async function getUtxoNFT(asset, marketAddress) {
    if (!(asset.quantity == 1)) {
      console.log("this is not an NFT!");
    }

    const utxos = await getUtxos(marketAddress);

    const stringutxos = utxos.map((x) => JSON.stringify(x));
    const filteredstring = stringutxos.filter((x) =>
      x.includes(`${asset.unit}`)
    );
    const selectedUtox = JSON.parse(filteredstring);

    const valueutxo = await assetsToValue_(selectedUtox.amount);

    const inpututxo = CustomLoader.Cardano.TransactionInput.new(
      CustomLoader.Cardano.TransactionHash.from_bytes(
        Buffer.from(selectedUtox.tx_hash, "hex")
      ),
      selectedUtox.tx_index
    );

    const outpututxo = CustomLoader.Cardano.TransactionOutput.new(
      CustomLoader.Cardano.Address.from_bech32(marketAddress),
      valueutxo
    );

    const utxoNFT = CustomLoader.Cardano.TransactionUnspentOutput.new(
      inpututxo,
      outpututxo
    );

    return utxoNFT;
  }

  const scriptUtxo = await getUtxoNFT(asset, martketAddressbech32);

  const askingPrice = "5000000";

  const dummy_inputDAtaHash = // TODO: Check about it! Is it nedeed?
    "be01a7c9cd7b5982ea98022cac268913311a5a98ad6a37b3d67f1bf918b7b8e8";
  const protocolParameters = await getParams();

  // console.log(protocolParameters);

  const { txBuilder } = await initTx(protocolParameters);

  const hexAddress = await addressBech32();

  const clientAddress = CustomLoader.Cardano.Address.from_bech32(hexAddress);

  const baseAddress =
    CustomLoader.Cardano.BaseAddress.from_address(clientAddress);

  const pkh = baseAddress.payment_cred().to_keyhash().to_bytes();
  console.log(Buffer.from(pkh, "hex").toString("hex"));
  const assetNameHex = asset.unit.slice(56);
  const assetName = Buffer.from(assetNameHex, "hex").toString("utf8");

  const policyId = asset.unit.slice(0, 56);

  const unit = policyId + assetNameHex;
  console.log(unit);

  const nfTValue = await assetsToValue_([
    { unit: asset.unit, quantity: asset.quantity },
  ]);

  //nfTValue.set_coin(CustomLoader.Cardano.BigNum.from_str("1851850"));
  //console.log(  nfTValue);

  const nfTValueBytes = nfTValue.to_bytes();

  const min_ada_required = CustomLoader.Cardano.min_ada_required(
    CustomLoader.Cardano.Value.from_bytes(nfTValueBytes),
    CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
    CustomLoader.Cardano.DataHash.from_bytes(
      Buffer.from(dummy_inputDAtaHash, "hex")
    )
  );
  //console.log(nfTValueBytes);

  const utxos = (await window.cardano.getUtxos()).map((utxo) =>
    CustomLoader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const outPut = CustomLoader.Cardano.TransactionOutput.new(
    clientAddress,
    CustomLoader.Cardano.Value.from_bytes(nfTValueBytes).checked_add(
      CustomLoader.Cardano.Value.new(min_ada_required)
    )
  );

  const hoskyDatumObject = OfferDatum(pkh, askingPrice, policyId, assetName);

  //console.log(hoskyDatumObject);

  const datum = await ToPlutusData(hoskyDatumObject);

  console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

  const datumHash = CustomLoader.Cardano.hash_plutus_data(datum);

  console.log(datumHash);

  console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

  const datumList = CustomLoader.Cardano.PlutusList.new();
  datumList.add(datum);
  const outPuts = CustomLoader.Cardano.TransactionOutputs.new();
  outPuts.add(outPut);

  CoinSelection.setProtocolParameters(
    protocolParameters.minUtxo.toString(),
    protocolParameters.linearFee.minFeeA.toString(),
    protocolParameters.linearFee.minFeeB.toString(),
    protocolParameters.maxTxSize.toString()
  );

  let { input, change, remaining } = CoinSelection.randomImprove(
    utxos,
    outPuts,
    8,
    [scriptUtxo]
  );

  input.forEach((utxo) => {
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  });

  txBuilder.add_output(outPut);

  const redeemers = CustomLoader.Cardano.Redeemers.new();
  // not passing datum because close.json content is {"constructor":2,"fields":[]}

  const SimpleRedeemer = async (index) => {
    //close.json - {"constructor":2,"fields":[]} - this is why I pyt new_i32(2), maybe I'm wrong here
    const redeemerData = CustomLoader.Cardano.PlutusData.new_constr_plutus_data(
      CustomLoader.Cardano.ConstrPlutusData.new(
        CustomLoader.Cardano.Int.new_i32(2),
        CustomLoader.Cardano.PlutusList.new()
      )
    );

    const r = CustomLoader.Cardano.Redeemer.new(
      CustomLoader.Cardano.RedeemerTag.new_spend(),
      CustomLoader.Cardano.BigNum.from_str(index),
      redeemerData,
      CustomLoader.Cardano.ExUnits.new(
        CustomLoader.Cardano.BigNum.from_str("7000000"),
        CustomLoader.Cardano.BigNum.from_str("3000000000")
      )
    );

    return r;
  };

  const scriptUtxoIndex = txBuilder
    .index_of_input(scriptUtxo.input())
    .toString();

  redeemers.add(await SimpleRedeemer(scriptUtxoIndex));

  const scripts = CustomLoader.Cardano.PlutusScripts.new();
  scripts.add(CustomLoader.Cardano.PlutusScript.new(fromHex(Contract.cborHex)));

  const transactionWitnessSet =
    CustomLoader.Cardano.TransactionWitnessSet.new();

  /*   if (typeof metadata !== undefined) {
    aux_data = CustomLoader.Cardano.AuxiliaryData.new();
    const generalMetadata =
      CustomLoader.Cardano.GeneralTransactionMetadata.new();
    Object.keys(metadata).forEach((label) => {
      Object.keys(metadata[label]).length > 0 &&
        generalMetadata.insert(
          CustomLoader.Cardano.BigNum.from_str(label),
          CustomLoader.Cardano.encode_json_str_to_metadatum(
            JSON.stringify(metadata[label]),
            1
          )
        );
    });

    aux_data.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(aux_data);
  } */

  txBuilder.set_plutus_scripts(scripts);
  console.log(scripts);
  txBuilder.set_plutus_data(datumList);
  console.log(datumList);

  txBuilder.set_redeemers(redeemers);
  console.log(redeemers);

  transactionWitnessSet.set_plutus_scripts(scripts);
  console.log(scripts);

  transactionWitnessSet.set_plutus_data(datumList);
  console.log(datumList);

  transactionWitnessSet.set_redeemers(redeemers);
  console.log(redeemers);

  // console.log(utxos, input, change, remaining);

  const collateralHex = await window.cardano.getCollateral();

  if (collateralHex.length === 0) {
    console.log("there is not collaterals for this transaction");
    window.alert(
      "Your transaction has not been submited, in order to list your item, provide some collateral in the Nami Wallet configuration."
    );
    return;
  }

  const collateral = CustomLoader.Cardano.TransactionUnspentOutput.from_bytes(
    Buffer.from(collateralHex[0], "Hex")
  );

  const collaterals = CustomLoader.Cardano.TransactionInputs.new();

  console.log(collateral.input());
  collaterals.add(collateral.input());

  const requiredSigners = CustomLoader.Cardano.Ed25519KeyHashes.new();
  requiredSigners.add(baseAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);
  txBuilder.set_collateral(collaterals);
  txBuilder.add_change_if_needed(clientAddress);

  const txBody = txBuilder.build();
  const tx = CustomLoader.Cardano.Transaction.new(
    txBody,
    transactionWitnessSet,
    txBody.auxiliary_data
  );
  const size = tx.to_bytes().length * 2;
  console.log(size);
  if (size > protocolParameters.maxTxSize) throw new Error("MAX_SIZE_REACHED");
  console.log(toHex(tx.to_bytes()));

  let txVkeyWitnesses = await window.cardano.signTx(toHex(tx.to_bytes()), true);
  txVkeyWitnesses = CustomLoader.Cardano.TransactionWitnessSet.from_bytes(
    fromHex(txVkeyWitnesses)
  );
  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
  const signedTx = CustomLoader.Cardano.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    tx.auxiliary_data()
  );

  console.log("Full Tx Size", signedTx.to_bytes().length);

  try {
    const txHash = await window.cardano.submitTx(toHex(signedTx.to_bytes()));
    const registration = await registerSell(txHash);
    console.log(
      `Your item has been listed for sale with a price of ${askingPrice} Ada,  The transaction Hash for  the listing transaction is ${txHash}`
    );
    return txHash;
  } catch (e) {
    console.log(e);
  }
}

export async function BuyNFT(asset, metadata) {
  await CustomLoader.load();

  const askingPrice = "5000000";

  const marketPkhStr =
    "a75c75fa79bc7d53ef715d64745a7a01c2c1f7653b2ae962413ac521";

  const paymentvKeyMarrket = CustomLoader.Cardano.StakeCredential.from_keyhash(
    CustomLoader.Cardano.Ed25519KeyHash.from_bytes(
      Buffer.from(marketPkhStr, "hex")
    )
  );

  const marketAddress = CustomLoader.Cardano.EnterpriseAddress.new(
    CustomLoader.Cardano.NetworkId.testnet,
    paymentvKeyMarrket
  ).to_address();

  console.log(marketAddress.to_bech32());

  /* const marketAddress =
    CustomLoader.Cardano.Address.from_bech32(martketPkhBech32); */

  const sellerAddressBech32 =
    "addr_test1qrw2vq6hztckfke0n8r3gpxnjgg4627audn0h034ntsp78thnae0km53d08p2paq2kp524nxkzzja099utujetdz867qpf8p9s";
  const scriptAddressBech32 =
    "addr_test1wp9cnq967kcf7dtn7fhpqr0cz0wjffse67qc3ww4v3c728c4qjr6j";
  const scriptAddress =
    CustomLoader.Cardano.Address.from_bech32(scriptAddressBech32);

  const sellerAddress =
    CustomLoader.Cardano.Address.from_bech32(sellerAddressBech32);

  async function initTx(protocolParameters) {
    const txBuilder = CustomLoader.Cardano.TransactionBuilder.new(
      CustomLoader.Cardano.LinearFee.new(
        CustomLoader.Cardano.BigNum.from_str(
          protocolParameters.linearFee.minFeeA
        ),
        CustomLoader.Cardano.BigNum.from_str(
          protocolParameters.linearFee.minFeeB
        )
      ),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
      CustomLoader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
      protocolParameters.maxValSize,
      protocolParameters.maxTxSize,
      protocolParameters.priceMem,
      protocolParameters.priceStep,
      CustomLoader.Cardano.LanguageViews.new(Buffer.from(languageViews, "hex"))
    );

    return { txBuilder };
  }

  async function getUtxoNFT(asset, marketAddress) {
    if (!(asset.quantity == 1)) {
      console.log("this is not an NFT!");
    }

    const utxos = await getUtxos(marketAddress);

    const stringutxos = utxos.map((x) => JSON.stringify(x));
    const filteredstring = stringutxos.filter((x) =>
      x.includes(`${asset.unit}`)
    );
    const selectedUtox = JSON.parse(filteredstring);

    const valueutxo = await assetsToValue_(selectedUtox.amount);

    const inpututxo = CustomLoader.Cardano.TransactionInput.new(
      CustomLoader.Cardano.TransactionHash.from_bytes(
        Buffer.from(selectedUtox.tx_hash, "hex")
      ),
      selectedUtox.tx_index
    );

    const outpututxo = CustomLoader.Cardano.TransactionOutput.new(
      CustomLoader.Cardano.Address.from_bech32(marketAddress),
      valueutxo
    );

    const utxoNFT = CustomLoader.Cardano.TransactionUnspentOutput.new(
      inpututxo,
      outpututxo
    );

    return utxoNFT;
  }

  const scriptUtxo = await getUtxoNFT(asset, scriptAddressBech32);

  const dummy_inputDAtaHash = // TODO: Check about it! Is it nedeed?
    "be01a7c9cd7b5982ea98022cac268913311a5a98ad6a37b3d67f1bf918b7b8e8";
  const protocolParameters = await getParams();

  // console.log(protocolParameters);

  const { txBuilder } = await initTx(protocolParameters);

  const hexAddress = await addressBech32();

  const clientAddress = CustomLoader.Cardano.Address.from_bech32(hexAddress);

  const sellerbaseAddress =
    CustomLoader.Cardano.BaseAddress.from_address(sellerAddress);

  const pkh = sellerbaseAddress.payment_cred().to_keyhash().to_bytes();
  console.log(Buffer.from(pkh, "hex").toString("hex"));
  const assetNameHex = asset.unit.slice(56);
  const assetName = Buffer.from(assetNameHex, "hex").toString("utf8");

  const policyId = asset.unit.slice(0, 56);

  const unit = policyId + assetNameHex;
  console.log(unit);

  const nfTValue = await assetsToValue_([
    { unit: asset.unit, quantity: asset.quantity },
  ]);

  //nfTValue.set_coin(CustomLoader.Cardano.BigNum.from_str("1851850"));
  //console.log(  nfTValue);

  const nfTValueBytes = nfTValue.to_bytes();

  const min_ada_required = CustomLoader.Cardano.min_ada_required(
    CustomLoader.Cardano.Value.from_bytes(nfTValueBytes),
    CustomLoader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
    CustomLoader.Cardano.DataHash.from_bytes(
      Buffer.from(dummy_inputDAtaHash, "hex")
    )
  );
  //console.log(nfTValueBytes);

  const utxos = (await window.cardano.getUtxos()).map((utxo) =>
    CustomLoader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  // Outputs

  const NFToutPut = CustomLoader.Cardano.TransactionOutput.new(
    clientAddress,
    CustomLoader.Cardano.Value.from_bytes(nfTValueBytes).checked_add(
      CustomLoader.Cardano.Value.new(min_ada_required)
    )
  );

  const sellerOutPut = CustomLoader.Cardano.TransactionOutput.new(
    sellerAddress,

    CustomLoader.Cardano.Value.new(
      CustomLoader.Cardano.BigNum.from_str("10000000")
    )
  );

  const marketOutPut = CustomLoader.Cardano.TransactionOutput.new(
    marketAddress,
    CustomLoader.Cardano.Value.new(
      CustomLoader.Cardano.BigNum.from_str("10000000")
    )
  );

  // DATUM

  const hoskyDatumObject = OfferDatum(pkh, askingPrice, policyId, assetName);

  //console.log(hoskyDatumObject);

  const datum = await ToPlutusData(hoskyDatumObject);

  console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

  const datumHash = CustomLoader.Cardano.hash_plutus_data(datum);

  console.log(datumHash);

  console.log(Buffer.from(datum.to_bytes(), "hex").toString("hex"));

  const datumList = CustomLoader.Cardano.PlutusList.new();
  datumList.add(datum);
  const outPuts = CustomLoader.Cardano.TransactionOutputs.new();
  outPuts.add(NFToutPut);
  outPuts.add(sellerOutPut);
  outPuts.add(marketOutPut);

  CoinSelection.setProtocolParameters(
    protocolParameters.minUtxo.toString(),
    protocolParameters.linearFee.minFeeA.toString(),
    protocolParameters.linearFee.minFeeB.toString(),
    protocolParameters.maxTxSize.toString()
  );

  let { input, change, remaining } = CoinSelection.randomImprove(
    utxos,
    outPuts,
    8,
    [scriptUtxo]
  );

  input.forEach((utxo) => {
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  });

  txBuilder.add_output(NFToutPut);
  txBuilder.add_output(sellerOutPut);
  txBuilder.add_output(marketOutPut);

  const redeemers = CustomLoader.Cardano.Redeemers.new();
  // not passing datum because close.json content is {"constructor":2,"fields":[]}

  const SimpleRedeemer = async (index) => {
    //close.json - 0 is de data in the redemer corresponds to Buy ?
    const redeemerData = CustomLoader.Cardano.PlutusData.new_constr_plutus_data(
      CustomLoader.Cardano.ConstrPlutusData.new(
        CustomLoader.Cardano.Int.new_i32(0),
        CustomLoader.Cardano.PlutusList.new()
      )
    );

    const r = CustomLoader.Cardano.Redeemer.new(
      CustomLoader.Cardano.RedeemerTag.new_spend(),
      CustomLoader.Cardano.BigNum.from_str(index),
      redeemerData,
      CustomLoader.Cardano.ExUnits.new(
        CustomLoader.Cardano.BigNum.from_str("7000000"),
        CustomLoader.Cardano.BigNum.from_str("3000000000")
      )
    );

    return r;
  };

  const scriptUtxoIndex = txBuilder
    .index_of_input(scriptUtxo.input())
    .toString();

  const redeemer = await SimpleRedeemer(scriptUtxoIndex);
  console.log(Buffer.from(redeemer.to_bytes(), "hex").toString("hex"));
  redeemers.add(redeemer);

  const scripts = CustomLoader.Cardano.PlutusScripts.new();
  scripts.add(CustomLoader.Cardano.PlutusScript.new(fromHex(Contract.cborHex)));

  const transactionWitnessSet =
    CustomLoader.Cardano.TransactionWitnessSet.new();

  /*   if (typeof metadata !== undefined) {
    aux_data = CustomLoader.Cardano.AuxiliaryData.new();
    const generalMetadata =
      CustomLoader.Cardano.GeneralTransactionMetadata.new();
    Object.keys(metadata).forEach((label) => {
      Object.keys(metadata[label]).length > 0 &&
        generalMetadata.insert(
          CustomLoader.Cardano.BigNum.from_str(label),
          CustomLoader.Cardano.encode_json_str_to_metadatum(
            JSON.stringify(metadata[label]),
            1
          )
        );
    });

    aux_data.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(aux_data);
  } */

  txBuilder.set_plutus_scripts(scripts);
  console.log(scripts);
  txBuilder.set_plutus_data(datumList);
  console.log(datumList);

  txBuilder.set_redeemers(redeemers);
  console.log(redeemers);

  transactionWitnessSet.set_plutus_scripts(scripts);
  console.log(scripts);

  transactionWitnessSet.set_plutus_data(datumList);
  console.log(datumList);

  transactionWitnessSet.set_redeemers(redeemers);
  console.log(redeemers);

  // console.log(utxos, input, change, remaining);

  const collateralHex = await window.cardano.getCollateral();

  if (collateralHex.length === 0) {
    console.log("there is not collaterals for this transaction");
    window.alert(
      "Your transaction has not been submited, in order to list your item, provide some collateral in the Nami Wallet configuration."
    );
    return;
  }

  const collateral = CustomLoader.Cardano.TransactionUnspentOutput.from_bytes(
    Buffer.from(collateralHex[0], "Hex")
  );

  const collaterals = CustomLoader.Cardano.TransactionInputs.new();

  console.log(collateral.input());
  collaterals.add(collateral.input());

  /*  const requiredSigners = CustomLoader.Cardano.Ed25519KeyHashes.new();
  requiredSigners.add(
    CustomLoader.Cardano.BaseAddress.from_address(clientAddress)
      .payment_cred()
      .to_keyhash()
  );
  txBuilder.set_required_signers(requiredSigners); */
  txBuilder.set_collateral(collaterals);
  txBuilder.add_change_if_needed(clientAddress);

  const txBody = txBuilder.build();
  const tx = CustomLoader.Cardano.Transaction.new(
    txBody,
    transactionWitnessSet,
    txBody.auxiliary_data
  );
  const size = tx.to_bytes().length * 2;
  console.log(size);
  if (size > protocolParameters.maxTxSize) throw new Error("MAX_SIZE_REACHED");
  console.log(toHex(tx.to_bytes()));

  let txVkeyWitnesses = await window.cardano.signTx(toHex(tx.to_bytes()), true);
  txVkeyWitnesses = CustomLoader.Cardano.TransactionWitnessSet.from_bytes(
    fromHex(txVkeyWitnesses)
  );
  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
  const signedTx = CustomLoader.Cardano.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    tx.auxiliary_data()
  );

  console.log("Full Tx Size", signedTx.to_bytes().length);

  try {
    const txHash = await window.cardano.submitTx(toHex(signedTx.to_bytes()));
    const registration = await registerSell(txHash);
    console.log(
      `Your item has been listed for sale with a price of ${askingPrice} Ada,  The transaction Hash for  the listing transaction is ${txHash}`
    );
    return txHash;
  } catch (e) {
    console.log(e);
  }
}

export async function assetsToValue_(assets) {
  await CustomLoader.load();
  const multiAsset = CustomLoader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = CustomLoader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        CustomLoader.Cardano.AssetName.new(
          Buffer.from(asset.unit.slice(56), "hex")
        ),
        CustomLoader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      CustomLoader.Cardano.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = CustomLoader.Cardano.Value.new(
    CustomLoader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
}

const OfferDatum = (pkh, askingPrice, policyId, assetName) => {
  const offerDatum = new PlutusDataObject(0);
  offerDatum.Fields = [
    {
      Index: 0,
      Type: PlutusFieldType.Bytes,
      Key: "pkh",
      Value: pkh,
    },
    {
      Index: 0,
      Type: PlutusFieldType.Integer,
      Key: "price",
      Value: askingPrice,
    },
    {
      Index: 0,
      Type: PlutusFieldType.Bytes,
      Key: "policyId",
      Value: fromHex(policyId),
    },
    {
      Index: 0,
      Type: PlutusFieldType.Bytes,
      Key: "assetName",
      Value: Buffer.from(assetName, "utf8"),
    },
  ];
  return offerDatum;
};

const ToPlutusData = async (plutusDataObj) => {
  await CustomLoader.load();
  const datumFields = CustomLoader.Cardano.PlutusList.new();
  plutusDataObj.Fields.sort((a, b) => a.Index - b.Index);
  plutusDataObj.Fields.forEach((f) => {
    switch (f.Type) {
      case PlutusFieldType.Integer:
        datumFields.add(
          CustomLoader.Cardano.PlutusData.new_integer(
            CustomLoader.Cardano.BigInt.from_str(f.Value.toString())
          )
        );
        break;
      // case PlutusFieldType.Data:
      //     datumFields.add(ToPlutusData(f.Value) as PlutusData);
      case PlutusFieldType.Bytes:
        datumFields.add(CustomLoader.Cardano.PlutusData.new_bytes(f.Value));
    }
  });

  return CustomLoader.Cardano.PlutusData.new_constr_plutus_data(
    CustomLoader.Cardano.ConstrPlutusData.new(
      CustomLoader.Cardano.Int.new_i32(plutusDataObj.ConstructorIndex),
      datumFields
    )
  );
};
