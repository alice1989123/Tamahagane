import Loader from "./loader";
import {
  LATEST_BLOCK,
  ADDRESSES,
  LATEST_PARAMETERS,
} from "../constants/API/v0/routes";
import axios from "axios";
import CoinSelection from "./coinSelection.js";

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
    const selectedUTXOs = selectUTXO(utxos, amount);

    let txBuilder = await builder();

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

    /*  if (SignedTx === "SIGNING-ERROR") {
      return SignedTx;
    } */

    const txHash = await window.cardano.submitTx(toHex(signedTx.to_bytes()));
    console.log(`Transaction submited, with TxHash ${txHash}`);
    return txHash;
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
