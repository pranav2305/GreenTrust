import { BN, BN_ONE } from "@polkadot/util";

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
// The address is the actual on-chain address as ss58 or AccountId object.
// import { useCallerContext, useChain, useEstimationContext } from "../contexts";

export const useSubmitHandler = () => {
  const { api, contract } = useChain();
  const { estimation } = useEstimationContext();
  const { caller } = useCallerContext();

  return async (values, { setSubmitting, setStatus }) => {
    if (!api || !contract || !estimation || !caller) return;

    const injector = await web3FromAddress(caller.address);
    try {
      const tx = contract.tx["shorten"](
        {
          gasLimit: estimation.gasRequired,
          storageDepositLimit: estimation.storageDeposit.asCharge,
        },
        { DeduplicateOrNew: values.alias },
        values.url
      );
      const unsub = await tx.signAndSend(
        caller.address,
        { signer: injector.signer },
        (result) => {
          const events = [];
          let slug = "";
          setSubmitting(true);

          if (result.isInBlock) {
            result.contractEvents?.forEach(({ event, args }) => {
              slug = args[0].toHuman()?.toString() || "";
              events.push({
                name: event.identifier,
                message: `${event.docs.join()}`,
              });
            });
            result.events.forEach(({ event }) => {
              let message = "";
              if (event.section === "balances") {
                const data = event.data.toHuman();

                message = `Amount: ${data.amount}`;
              }
              event.method !== "ContractEmitted" &&
                events.push({
                  name: `${event.section}:${event.method}`,
                  message,
                });
            });
            if (!result.dispatchError) {
              setStatus({ finalized: true, events, errorMessage: "", slug });
            } else {
              let message = "Unknown Error";
              if (result.dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  result.dispatchError.asModule
                );
                message = `${decoded.section.toUpperCase()}.${
                  decoded.method
                }: ${decoded.docs}`;
              }
              setStatus({
                finalized: true,
                events,
                errorMessage: message,
              });
            }
            setSubmitting(false);
            unsub && unsub();
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
};

export const contractCallOld = async (auth, func, params = []) => {
  const { web3FromAddress } = await import("@polkadot/extension-dapp");
  const injector = await web3FromAddress(auth.caller.address);
  try {
    const tx = auth.contract.tx[func](
      {
        gasLimit: auth.gasLimit,
        storageDepositLimit: auth.storageDepositLimit,
      },
      ...params
    );

    const unsub = await tx.signAndSend(
      auth.caller.address,
      { signer: injector.signer },
      (result) => {
        const events = [];
        let slug = "";
        if (result.isInBlock) {
          result.contractEvents?.forEach(({ event, args }) => {
            slug = args[0].toHuman()?.toString() || "";
            events.push({
              name: event.identifier,
              message: `${event.docs.join()}`,
            });
          });

          result.events.forEach(({ event }) => {
            let message = "";
            if (event.section === "balances") {
              const data = event.data.toHuman();

              message = `Amount: ${data.amount}`;
            }

            event.method !== "ContractEmitted" &&
              events.push({
                name: `${event.section}:${event.method}`,
                message,
              });
          });

          if (!result.dispatchError) {
            setStatus({ finalized: true, events, errorMessage: "", slug });
          } else {
            let message = "Unknown Error";
            if (result.dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                result.dispatchError.asModule
              );
              message = `${decoded.section.toUpperCase()}.${decoded.method}: ${
                decoded.docs
              }`;
            }
            throw Error(message);
          }
          unsub && unsub();

          console.log("contractCall result", result);
          return result;
        }
      }
    );
    console.log(unsub);
  } catch (e) {
    console.log("contractCall debug:", e);
    const error = Error(e.message || "Something went wrong");
    error.code = 500;
    throw error;
  }
};

export const contractCall = async (auth, func, params = []) => {
  // maximum gas to be consumed for the call. if limit is too small the call will fail.
  // a limit to how much Balance to be used to pay for the storage created by the contract call
  // if null is passed, unlimited balance can be used
  // balance to transfer to the contract account. use only with payable messages, will fail otherwise.
  // formerly know as "endowment"
  // const value: api.registry.createType('Balance', 1000)

  // (We perform the send from an account, here using Alice's address)
  console.log(auth.signer, "contractCallsigner")
  const storageDepositLimit = null;

  const { gasRequired } = await eval(`auth.contract.query.${func}`)(
    auth.caller.address,
    {
      gasLimit: auth.api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }),
      storageDepositLimit,
    }
  );
  console.log(gasRequired, "contractCall gasreq")
  // const { gasRequired, storageDeposit, result, output } = await eval(`auth.contract.query.${func}`)(
  //   auth.caller.address,
  //   {
  //     gasLimit: auth.api?.registry.createType('WeightV2', {
  //       refTime: MAX_CALL_WEIGHT,
  //       proofSize: PROOFSIZE,
  //     }),
  //     storageDepositLimit,
  //   }
  // );
  const gasLimit = auth.api?.registry.createType("WeightV2", gasRequired);
  console.log("contractCall gaslimit", gasLimit)

  const tx = await eval(`auth.contract.tx.${func}`)({
    storageDepositLimit,
    gasLimit,
  });

  console.log("contractCall tx", tx)
  const { web3FromAddress } = await import(
    "@polkadot/extension-dapp"
  );
  const injector = await web3FromAddress(auth.caller.address)

  const result = tx.signAndSend(auth.caller.address, {
    signer: injector.signer
  }, async (res) => {
    if (res.status.isInBlock) {
      console.log("in a block");
    } else if (res.status.isFinalized) {
      console.log("finalized");
    }
    console.log(res.status, "contractCall status")
    return res.status
  });

  // The actual result from RPC as `ContractExecResult`
  // console.log(result.toHuman(), "Contract error actual");

  // // the gas consumed for contract execution
  // console.log(gasRequired.toHuman());

  // // check if the call was successful
  // if (result.isOk) {
  //   // output the return value
  //   console.log("Success", output.toHuman());
  // } else {
  //   console.error("Error", result.asErr);
  // }
};
