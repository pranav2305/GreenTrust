import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

import { AuthProvider, CHAIN } from "@arcana/auth";
import { ProvideAuth } from "@arcana/auth-react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

import { APP_ADDRESS } from "@/config";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { AuthContext } from "@/context/authContext";
import Head from "next/head";
import { initialize } from "@/InkUtils";
import { AccountsProvider } from "@/context/accountContext";
import { CallerProvider } from "@/context/callerContext";
import { ChainProvider } from "@/context/chainContext";
import { EstimationProvider } from "@/context/estimationContext";

config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  const [loadingAuth, setLoadingAuth] = useState(true);

  const authProvider = new AuthProvider(`${APP_ADDRESS}`, {
    theme: "light",
    alwaysVisible: true,
    network: "testnet", // network can be testnet or mainnet - defaults to testnet
    chainConfig: {
      chainId: CHAIN.ETHEREUM_GOERLI,
      rpcUrl: "",
    },
  });
  // initialize();

  async function initAuth() {
    try {
      await authProvider.init();
    } catch (err) {
      console.log("Error initializing authProvider:", err);
    } finally {
      setLoadingAuth(false);
    }
  }

  useEffect(() => {
    initAuth();
  }, []);

  const router = useRouter();

  return (
    <>
      <Head>
        <title>GreenTrust</title>
      </Head>
      <ChainProvider>
        <AccountsProvider>
          <CallerProvider>
            <EstimationProvider>
              <ProvideAuth provider={authProvider}>
                <AuthContext.Provider value={{ loadingAuth, authProvider }}>
                  {router.pathname === "/auth/login" ||
                  router.pathname === "/" ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </AuthContext.Provider>
              </ProvideAuth>
            </EstimationProvider>
          </CallerProvider>
        </AccountsProvider>
      </ChainProvider>
    </>
  );
}
