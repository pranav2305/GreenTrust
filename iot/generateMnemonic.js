const { mnemonicGenerate } = require('@polkadot/util-crypto');

const mnemonic = mnemonicGenerate();
console.log(mnemonic)
