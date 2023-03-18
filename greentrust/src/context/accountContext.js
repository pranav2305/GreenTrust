import {
  useEffect,
  useState,
  createContext,
  useCallback,
  useContext,
} from "react";
import { SnackbarContext } from "@/context/snackbarContext";

const AccountsContext = createContext(undefined);

function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState();
  const [signer, setSigner] = useState();
  const [hasAccess, setHasAccess] = useState(undefined);
  const { setSnackbarInfo } = useContext(SnackbarContext);

  function login() {
    setHasAccess(true);
  }

  async function logout() {
    setHasAccess(false);
  }

  async function getExtension() {
    const { web3Enable } = await import("@polkadot/extension-dapp");
    const extensions = await web3Enable("green-trust");
    const extns = extensions.find(
      (e) => e.name === "polkadot-js" || e.name === "subwallet-js"
    );
    if (!extns) {
      console.log("Please install polkadot-js extension");
      setSnackbarInfo({
        open: true,
        severity: "error",
        message: "Please install polkadot-js extension from <a href='https://polkadot.js.org/extension/' style='text-decoration: underline; color: blue;' target='_blank'>here</a>",
      });
      setHasAccess(false);
    }
    return extns;
  }

  const initAccounts = useCallback(async () => {
    if (!signer) {
      const s = await getExtension();
      setSigner(s);
    } else {
      const { web3Accounts } = await import("@polkadot/extension-dapp");
      const acc = await web3Accounts();
      setAccounts(acc);
    }
  }, [signer]);

  useEffect(() => {
    setHasAccess(localStorage.getItem("hasAccess") === "true");
  }, []);

  useEffect(() => {
    if (hasAccess === undefined) return;
    localStorage.setItem("hasAccess", hasAccess);
  }, [hasAccess]);

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
        logout,
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
