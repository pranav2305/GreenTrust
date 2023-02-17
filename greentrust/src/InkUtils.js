import dynamic from 'next/dynamic'
const web3Accounts = dynamic(() => import('@polkadot/extension-dapp'), { ssr: false });
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






export const contractCall = async (auth, func, params = []) => {
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
        // const events = [];
        // let slug = "";
        if (result.isInBlock) {

        //   result.contractEvents?.forEach(({ event, args }) => {
        //     slug = args[0].toHuman()?.toString() || "";
        //     events.push({
        //       name: event.identifier,
        //       message: `${event.docs.join()}`,
        //     });
        //   });

        //   result.events.forEach(({ event }) => {
        //     let message = "";
        //     if (event.section === "balances") {
        //       const data = event.data.toHuman();

        //       message = `Amount: ${data.amount}`;
        //     }

        //     event.method !== "ContractEmitted" &&
        //       events.push({
        //         name: `${event.section}:${event.method}`,
        //         message,
        //       });

        //   });

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
          
          return result;
        }
      }
    );
  } catch (e) {
    console.log("contractCall debug:", e);
    const error = Error(e.message || "Something went wrong");
    error.code = 500;
    throw error;
  }
};
