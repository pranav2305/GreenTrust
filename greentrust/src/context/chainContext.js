import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { INK_ENDPOINT, INK_CONTRACT_ADDRESS } from "@/config";
import { options } from '@astar-network/astar-api';
import result from "@/abi/result.json";
import metadata from "@/abi/metadata.json";

const ChainContext = React.createContext(undefined);

function ChainProvider({ children }) {
  const [api, setApi] = useState();
  const [contract, setContract] = useState();

  useEffect(() => {
    const wsProvider = new WsProvider(INK_ENDPOINT);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
    // new ApiPromise(options({wsProvider})).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    if (!api) return;
    const abi = new Abi(metadata, api.registry.getChainProperties());
    const c = new ContractPromise(api, abi, INK_CONTRACT_ADDRESS);
    setContract(c);
  }, [api]);

  return (
    <ChainContext.Provider value={{ api, contract }}>
      {children}
    </ChainContext.Provider>
  );
}

function useChain() {
  const context = React.useContext(ChainContext);
  if (context === undefined) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}

export { ChainProvider, useChain };
