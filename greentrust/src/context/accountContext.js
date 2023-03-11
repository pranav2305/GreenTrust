import {
    useEffect,
    useState,
    createContext,
    ReactNode,
    useCallback,
    useContext,
  } from "react";
  // import dynamic from 'next/dynamic'
  // const web3Accounts = dynamic(() => import('@polkadot/extension-dapp'), { ssr: false });
  // const web3Enable = dynamic(() => import('@polkadot/extension-dapp'), { ssr: false });

  const AccountsContext = createContext(undefined);
  
  function AccountsProvider({ children }) {
    console.log("test accounts provider")
    const [accounts, setAccounts] = useState();
    const [signer, setSigner] = useState();

    async function getExtension() {
      const { web3Enable } = await import(
        "@polkadot/extension-dapp"
      );
      console.log("test get extension")
      const extensions = await web3Enable("green-trust");
      console.log(extensions, "test extensions");
      return extensions.find((e) => e.name === "polkadot-js");
    }

    const initAccounts = useCallback(async () => {
      if (!signer) {
        const s = await getExtension();
        console.log(s, "test signer");
        setSigner(s);
      } else {
        const { web3Accounts } = await import(
          "@polkadot/extension-dapp"
        );
        const acc = await web3Accounts();
        setAccounts(acc);
      }
    }, [signer]);
  
    useEffect(() => {
      initAccounts()
    }, [initAccounts, signer]);
  
    return (
      <AccountsContext.Provider
        value={{
          accounts,
          setAccounts,
          initAccounts,
          setSigner,
          signer,
        }}
      >
        {children}
      </AccountsContext.Provider>
    );
  }
  
  function useAccountsContext() {
    const context = useContext(AccountsContext);
    if (context === undefined) {
      throw new Error(
        "useAccountsContext must be used within an AccountsProvider"
      );
    }
    return context;
  }
  
  export { AccountsProvider, useAccountsContext };
  