const { ContractPromise } = require('@polkadot/api-contract');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate } = require('@polkadot/util-crypto');

const metadata = require('./metadata.json')

require('dotenv').config();


async function main() {
    const address = process.env.CONTRACT_ADDRESS;

    const wsProvider = new WsProvider(process.env.PROVIDER_ENDPOINT);
    const api = await ApiPromise.create({ provider: wsProvider });

    const contract = new ContractPromise(api, metadata, address);

    const value = 10000; // only for payable messages, call will fail otherwise
    const gasLimit = 3000n * 1000000n;
    const storageDepositLimit = null;

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
    const mnemonic = process.env.MNEMONIC;
    console.log(mnemonic)
    const pair = keyring.addFromUri(mnemonic, { name: 'kid-116' }, 'ed25519');
    console.log(pair.address)

    data = {
        'timestamp': '2021-08-01T00:00:00.000Z',
        'data': {
            'temperature': 25,
            'humidity': 50
        }
    }

    const params = [1, JSON.stringify(data)];

    const { gasRequired, storageDeposit, result, output } = await contract.query['fetchUserType'](
        pair.address,
        {
            gasLimit,
            storageDepositLimit,
        }
    );
    console.log('Result:', gasRequired, storageDeposit, result, output);

    const res = await contract.tx
    ['addSensorData']({ storageDepositLimit, gasLimit }, ...params)
        .signAndSend(pair, result => {
            if (result.status.isInBlock) {
                console.log('in a block');
            } else if (result.status.isFinalized) {
                console.log('finalized');
            }
        });
    console.log(res);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
