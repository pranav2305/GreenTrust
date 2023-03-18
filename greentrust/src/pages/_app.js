import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "react-multi-carousel/lib/styles.css";

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
import { AuthProvider } from "@/context/authContext";
import { SnackbarContext } from "@/context/snackbarContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const handleClose = () => {
    setSnackbarInfo({ ...snackbarInfo, open: false });
  };

  return (
    <>
      <Head>
        <title>GreenTrust</title>
      </Head>
      <LoaderContext.Provider value={{ loading, setLoading }}>
        <SnackbarContext.Provider value={{ snackbarInfo, setSnackbarInfo }}>
          <ChainProvider>
            <AccountsProvider>
              <CallerProvider>
                <AuthProvider>
                  {router.pathname === "/auth/login" ||
                  router.pathname === "/" ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                  <Snackbar
                    open={snackbarInfo.open}
                    onClose={handleClose}
                    autoHideDuration={6000}
                  >
                    <Alert severity={snackbarInfo.severity}>
                      {snackbarInfo.message}
                    </Alert>
                  </Snackbar>
                </AuthProvider>
              </CallerProvider>
            </AccountsProvider>
          </ChainProvider>
        </SnackbarContext.Provider>
      </LoaderContext.Provider>
    </>
  );
}
