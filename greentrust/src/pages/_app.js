import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

import { APP_ADDRESS } from "@/config";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
// import { AuthContext } from "@/context/authContext";
import Head from "next/head";
import { initialize } from "@/InkUtils";
import { AccountsProvider } from "@/context/accountContext";
import { LoaderContext } from "@/context/loaderContext";
import { CallerProvider } from "@/context/callerContext";
import { ChainProvider } from "@/context/chainContext";
import { EstimationProvider } from "@/context/estimationContext";
import { AuthProvider } from "@/context/authContext";

config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Head>
        <title>GreenTrust</title>
      </Head>
      <LoaderContext.Provider value={{ loading, setLoading }}>
        <ChainProvider>
          <AccountsProvider>
            <CallerProvider>
              <EstimationProvider>
                <AuthProvider>
                  {router.pathname === "/auth/login" ||
                    router.pathname === "/" ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </AuthProvider>
              </EstimationProvider>
            </CallerProvider>
          </AccountsProvider>
        </ChainProvider>
      </LoaderContext.Provider>
    </>
  );
}
