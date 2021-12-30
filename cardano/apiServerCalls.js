import axios from "axios";
import { addressToBech32, signTx_, submitTx } from "./wallet";
import { sendLovelacestoAddres } from "./wallet";

const serverApi = process.env.NEXT_PUBLIC_SERVER_API;

export async function burningTokens() {
  const address = await addressToBech32();
  const response = await axios.post(
    `${serverApi}${apiEndPoints.burningTokens}`,
    {
      address: address,
    }
  );
  console.log(response);
}

export async function buyCards(buyOption) {
  const address = await addressToBech32();
  const balance = await window.cardano.getBalance();
  const utxos = await window.cardano.getUtxos();
  const TamahaganeAddres =
    "addr_test1qpt5akr98022xddld4he0rf7s603f04uv5ammywkvrk9p5fwx27w0tclpgyvut0nzqmvyxu5dnuw03rx42rup8q4qaqq2l70ns";

  const txHash = await sendLovelacestoAddres(
    BigInt(buyOption * 1000000 * 2 + 2000000),
    TamahaganeAddres,
    buyOption
  );
  console.log(txHash);

  if (!(txHash === undefined)) {
    if (txHash === "SUBMITION-ERROR") {
      console.log("submition error ");
      return [undefined, `SUBMITION-ERROR`];
    }
    if (txHash === "SIGNING-ERROR") {
      console.log("signing  error ");
      return [(undefined, `SIGNING-ERROR`)];
    }
    const response = await axios.post(`${serverApi}${apiEndPoints.buyCards}`, {
      address: address,
      balance: balance,
      utxos: utxos,
      buyOption: buyOption,
      txHash: txHash,
    });

    console.log(`transaction submited with txHash ${txHash}`);

    console.log(response);
    return [txHash, "TX-HASH", response];
  }
}

export async function forgeWeapon(tokensToBurn, nFTtoForge) {
  const address = await addressToBech32();
  const balance = await window.cardano.getBalance();
  const utxos = await window.cardano.getUtxos();

  const response = await axios.post(`${serverApi}${apiEndPoints.forgeWeapon}`, {
    address: address,
    balance: balance,
    utxos: utxos,
    tokensToBurn: tokensToBurn,
    nFTtoForge: nFTtoForge,
  });
  console.log(tokensToBurn);
  const signedTx = await signTx_(response.data);
  const txHash = await submitTx(signedTx);

  console.log(`transaction submited with txHash ${txHash}`);
  return txHash;
}

export async function getParams() {
  const params = await axios.get(`${serverApi}${apiEndPoints.parameters}`);
  //console.log(params);

  return params.data;
}

export async function getAssets(address) {
  // This function trows an error 404 if the address has not had any tx...  FIX!!!
  try {
    const response = await axios.post(`${serverApi}${apiEndPoints.assets}`, {
      address: address,
    });
    const assets = response.data.amount.map((x) => x.unit);

    return assets;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function registerSell(txHash, price, address) {
  try {
    const response = await axios.post(
      `${serverApi}${apiEndPoints.registerSell}`,
      {
        txHash: txHash,
        price: price,
        address: address,
      }
    );
    const status = response.data;

    return status;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function martketData() {
  try {
    const response = await axios.get(`${serverApi}${apiEndPoints.filter}`);
    const data = response.data;
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUtxos(address) {
  try {
    console.log(`${serverApi}${apiEndPoints.getUtxos}`);
    const response = await axios.post(`${serverApi}${apiEndPoints.getUtxos}`, {
      address: address,
    });
    const data = response.data;

    return data;
    //console.log(data);
  } catch (error) {
    console.log(error);
    return null;
  }
}

const apiEndPoints = {
  burningTokens: "",
  buyCards: "/api/buy_cards",
  forgeWeapon: "/api/forge-weapon",
  parameters: "/api/blockfrost/params",
  assets: "/api/assetss",
  registerSell: "/api/register_sell",
  filter: "/api/filter",
  getUtxos: "/api/utxos",
};
