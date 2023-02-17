import { useState, createContext, useEffect   , useContext } from "react";
import { useAccountsContext } from "./accountContext";

const CallerContext = createContext(undefined);

function CallerProvider({ children }) {
  const [caller, setCaller] = useState();
  const { accounts } = useAccountsContext();

  useEffect(() => {
    if (accounts?.length > 0) {
      setCaller(accounts[0]);
    }
  }, [accounts]);

  return (
    <CallerContext.Provider
      value={{
        caller,
        setCaller,
      }}
    >
      {children}
    </CallerContext.Provider>
  );
}

function useCallerContext() {
  const context = useContext(CallerContext);
  if (context === undefined) {
    throw new Error("useCallerContext must be used within a CallerProvider");
  }
  return context;
}

export { CallerProvider, useCallerContext };
