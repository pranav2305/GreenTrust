import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useContext } from "react";
import Skeleton from "@mui/material/Skeleton";
import { CircularProgress } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Modal from "./Modal";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import { LoaderContext } from "@/context/loaderContext";
import { SnackbarContext } from "@/context/snackbarContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/context/authContext";
import { faUser } from "@fortawesome/free-regular-svg-icons";
// import dynamic from "next/dynamic";
// const Identicon = dynamic(() => import("@polkadot/react-identicon"));
import AccountCard from "./AccountCard";

export function ArcanaAuth() {
  const router = useRouter();
  const { auth, loaded } = useAuth();

  return (
    <>
      {!loaded ? (
        <Skeleton variant="circular" width={44} height={44} />
      ) : (
        <Modal
          anchor={
            <div className="w-[44px] h-[44px] bg-primary rounded-full shadow-sm hover:scale-105 flex items-center justify-center">
              {/* <Identicon
              value={auth.caller.address}
              size={32}
              theme={"light"}
            /> */}
              <FontAwesomeIcon icon={faUser} className="text-white" />
            </div>
          }
          popover={<AccountCard auth={auth} />}
        />
      )}
    </>
  );
}

export default function Layout({ children }) {
  const { auth, loaded } = useAuth();
  const { loading, setLoading } = useContext(LoaderContext);

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
      <Snackbar
        open={snackbarInfo.open}
        onClose={handleClose}
        autoHideDuration={6000}
      >
        <Alert severity={snackbarInfo.severity}>{snackbarInfo.message}</Alert>
      </Snackbar>
      <div className="bg-white relative min-h-[100vh]">
        <SnackbarContext.Provider value={{ snackbarInfo, setSnackbarInfo }}>
          <header>
            <Navbar />
          </header>
          {(loading || !loaded) && <Spinner></Spinner>}
          <main className="h-full flex justify-center px-6 md:px-[12%] mb-24">
            <div className="mt-8 h-full max-w-[1300px] w-full">{children}</div>
          </main>
        </SnackbarContext.Provider>
      </div>
    </>
  );
}
