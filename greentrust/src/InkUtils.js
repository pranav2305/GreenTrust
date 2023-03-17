import { BN, BN_ONE } from "@polkadot/util";
import { fnMap } from "@/config";

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

export const contractCall = async (auth, func, params = [], value=null) => {
  if (!auth?.caller) {
    console.log("auth debug:", auth);
    const error = Error("Unauthorized");
    error.code = 401;
    throw error;
  }

  const storageDepositLimit = null;

  if (fnMap["read"].includes(func)) {
    const { result, output } = await eval(`auth.contract.query.${func}`)(
      auth.caller.address,
      {
        gasLimit: auth.api?.registry.createType('WeightV2', {
          refTime: MAX_CALL_WEIGHT,
          proofSize: PROOFSIZE,
        }),
        storageDepositLimit,
      },
      ...params
    );
    if (result.isOk) {
      return {
        status: 200,
        data: output.toHuman().Ok
      };
    } else {
      const error = Error(result.asErr);
      error.code = 500;
      throw error;
    }
  }  else {
    const { gasRequired, result, output } = await eval(`auth.contract.query.${func}`)(
      auth.caller.address,
      {
        gasLimit: auth.api?.registry.createType("WeightV2", {
          refTime: MAX_CALL_WEIGHT,
          proofSize: PROOFSIZE,
        }),
        storageDepositLimit,
        ...(value && {value: value})
      },
      ...params
    );
    if (!result.isOk) {
      const error = Error(result.asErr);
      error.code = 500;
      throw error;
    }
    const gasLimit = auth.api?.registry.createType("WeightV2", gasRequired);
    const tx = await eval(`auth.contract.tx.${func}`)({
      storageDepositLimit,
      gasLimit,
      ...(value && {value: value})
    }, ...params);
  
    const { web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );
    const injector = await web3FromAddress(auth.caller.address)
  
    await tx.signAndSend(auth.caller.address, {
      signer: injector.signer
    }, async (res) => {
      // if (res.status.isInBlock) {
      //   console.log("In a block");
      // } else if (res.status.isFinalized) {
      //   console.log("Finalized");
      // }
      return  {
        status: 200,
        data: res.status
      }
    });
  }
};
