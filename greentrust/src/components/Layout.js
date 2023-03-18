import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useContext } from "react";
import Skeleton from "@mui/material/Skeleton";
import { CircularProgress } from "@mui/material";
import Modal from "./Modal";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import { LoaderContext } from "@/context/loaderContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/context/authContext";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { SnackbarContext } from "@/context/snackbarContext";
// import dynamic from "next/dynamic";
// const Identicon = dynamic(() => import("@polkadot/react-identicon"));
import AccountCard from "./AccountCard";

export function ArcanaAuth() {
  const router = useRouter();
  const { auth, loaded } = useAuth();

  return (
    <>
      <div className="static">
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
      </div>
    </>
  );
}

export default function Layout({ children }) {
  const { auth, loaded } = useAuth();
  const { loading, setLoading } = useContext(LoaderContext);

  return (
    <>
      <div className="bg-white relative min-h-[100vh]">
        
          <header>
            <Navbar />
          </header>
          {(loading || !loaded) && <Spinner></Spinner>}
          <main className="h-full flex justify-center px-6 md:px-[12%] mb-24">
            <div className="mt-8 h-full max-w-[1300px] w-full">{children}</div>
          </main>
      </div>
    </>
  );
}
