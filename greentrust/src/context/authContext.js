import * as React from "react";
import { useEffect, useState } from "react";
import { useChain } from "@/context/chainContext";
import { useCallerContext } from "@/context/callerContext";

const AuthContext = React.createContext(undefined);

function AuthProvider({ children }) {
  const { api, contract } = useChain();
  const { caller } = useCallerContext();
  const auth = {
    api: api,
    contract: contract,
    caller: caller,
  };
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (auth.api && auth.contract && auth.caller)  {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, loaded }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
