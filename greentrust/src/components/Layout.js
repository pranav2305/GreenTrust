import { useEffect } from "react";
import { useRouter } from 'next/router'
import { useState } from "react";
import { useContext } from "react";

import { CircularProgress } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import Navbar from "./Navbar";
import Spinner from "./Spinner";
// import { AuthContext } from "@/context/authContext";
import { LoaderContext } from "@/context/loaderContext";
import { SnackbarContext } from "@/context/snackbarContext";
import { useChain } from "@/context/chainContext";
import { useLocalStorage } from "hooks/useLocalStorage";

export function ArcanaAuth() {
  const [address, setAddress] = useLocalStorage('address');

  const router = useRouter();
  const { api, contract } = useChain();
  const auth = {
    'api':api,
    'contract':contract,
    'address':address,
    'gasLimit':3000n * 1000000n,
    'storageDepositLimit': null
  }
  
  // const { loadingAuth, authProvider } = useContext(AuthContext);

  return (
    <>
      {auth.loading
        ? <CircularProgress size={24} co />
        : auth?.isLoggedIn
          ? <button
            className="bg-primary text-white text-xl font-medium rounded-full w-[160px] py-[8px] whitespace-normal"
            onClick={async () => {
              await authProvider.init();
              auth.logout();
              router.push('/');
            }}
          >
            Logout
          </button>
          : <button
            className="bg-primary text-white text-xl font-medium rounded-full w-[160px] py-[8px] whitespace-normal"
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </button>
      }
    </>
  )
}

export default function Layout({ children }) {
  const [address, setAddress] = useLocalStorage('address');
  const { api, contract } = useChain();

 const auth = {
    'api':api,
    'contract':contract,
    'address':address,
    'gasLimit':3000n * 1000000n,
    'storageDepositLimit': null
  }

  const [loading, setLoading] = useState(false);

  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: "error",
    message: ""
  });

  const handleClose = () => {
    setSnackbarInfo({...snackbarInfo, open: false});
  };

  return (
    <>
      <Snackbar
        open={snackbarInfo.open}
        onClose={handleClose}
        autoHideDuration={6000}
      >
        <Alert severity={snackbarInfo.severity}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
      <div className="bg-white relative min-h-[100vh]">
        <SnackbarContext.Provider value={{snackbarInfo, setSnackbarInfo}}>
          <header>
            <Navbar />
          </header>
          {loading && <Spinner></Spinner>}
          <LoaderContext.Provider value={{ loading, setLoading }}>
            <main className="h-full flex justify-center px-6 md:px-[12%] mb-24">
              <div className="mt-8 h-full max-w-[1300px] w-full">
                {children}
              </div>
            </main>
          </LoaderContext.Provider>
        </SnackbarContext.Provider>
      </div>
    </>
  );
}
