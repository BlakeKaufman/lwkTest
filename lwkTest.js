import {useEffect} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

import {Wollet, Client, Signer, Network, TxBuilder} from 'lwk-rn';
const liquidTestnet =
  '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49';
const liquidMainnet =
  '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d';

export default function LwkTest() {
  return (
    <View>
      <SafeAreaView>
        <TouchableOpacity
          onPress={() => {
            connectToLWK();
          }}>
          <Text>Start Session</Text>
        </TouchableOpacity>
        <Text>Testing</Text>
      </SafeAreaView>
    </View>
  );
}

async function connectToLWK() {
  const mnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  console.log(mnemonic);
  const network = Network.Testnet;
  const signer = await new Signer().create(mnemonic, network);
  const descriptor = await signer.wpkhSlip77Descriptor();
  console.log(await descriptor.asString());

  const wollet = await new Wollet().create(network, descriptor, null);
  const client = await new Client().defaultElectrumClient(network);
  const update = await client.fullScan(wollet);
  await wollet.applyUpdate(update);

  console.log(client.id);
  const txs = await wollet.getTransactions();
  // console.log('Get transactions');
  console.log(txs);

  const address = await wollet.getAddress();
  console.log('Get address');
  console.log(address);

  const balance = await wollet.getBalance();
  // console.log('Get balance');
  console.log(balance[liquidTestnet]);

  return;
  const out_address =
    'tlq1qqfkh3gtdtfw0uqcx8d0r7w3zh65tenu63qg394hwyed0lpey4hp5e0gztg6ay3nvz2k6d44quhz634s8weg6jt3xsz0h3jems';
  const satoshis = 1000;
  const fee_rate = 100; // this seems like absolute fees
  const builder = await new TxBuilder().create(network);
  await builder.addLbtcRecipient(out_address, satoshis);
  await builder.feeRate(fee_rate);
  let pset = await builder.finish(wollet);
  let signed_pset = await signer.sign(pset);
  let finalized_pset = await wollet.finalize(signed_pset);
  const tx = await finalized_pset.extractTx();
  await client.broadcast(tx);
  console.log('BROADCASTED TX!\nTXID: {:?}', (await tx.txId()).toString());
}
