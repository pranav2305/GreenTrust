import {
    useEffect,
    useState,
    createContext,
    useCallback,
    useContext,
  } from "react";

  const AccountsContext = createContext(undefined);
  
  function AccountsProvider({ children }) {
    const [accounts, setAccounts] = useState();
    const [signer, setSigner] = useState();
    const [hasAccess, setHasAccess] = useState(false);
    console.log("logout", accounts, signer, hasAccess);

    function login() {
      setHasAccess(true);
    }

    function logout() {
      console.log("logout test");
      setHasAccess(false);
    }

    async function getExtension() {
      const { web3Enable } = await import(
        "@polkadot/extension-dapp"
      );
      const extensions = await web3Enable("green-trust");
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
      signer && setHasAccess(true);
    }, [signer])
  
    useEffect(() => {
      if (hasAccess) {
        initAccounts();
      } else {
        setAccounts(undefined);
        setSigner(undefined);
      }
    }, [initAccounts, signer, hasAccess]);
  
    return (
      <AccountsContext.Provider
        value={{
          accounts,
          setAccounts,
          initAccounts,
          setSigner,
          signer,
          login,
          logout
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
  