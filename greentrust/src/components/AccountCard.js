import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";
import { useAccountsContext } from "@/context/accountContext";
import { useRouter } from "next/router";
import { SnackbarContext } from "@/context/snackbarContext";
import { useContext } from "react";
import dynamic from "next/dynamic";
const CC = dynamic(() => import("@/components/CopyClipboard").then(mod => mod.CopyClipboard), { ssr: false })

export default function AccountCard({ auth }) {
  const { logout } = useAccountsContext();
  const router = useRouter();
  const { setSnackbarInfo } = useContext(SnackbarContext);
  const address = auth?.caller?.address;

  return (
    <div className="p-5 rounded-lg">
      <div className="mb-0">
        {address && <CC content={address} setSnackbarInfo={setSnackbarInfo} />}
      </div>
      <div className="flex flex-row justify-around items-center gap-x-5 mt-1">
        <FontAwesomeIcon
          icon={faGear}
          className="text-primary text-xl cursor-pointer hover:scale-105"
        />
        <Button
          text="Logout"
          styles="bg-white border-[1.5px] border-primary !text-primary text-base hover:bg-primary hover:!text-white px-6"
          onClick={() => {
            logout();
            router.push("/");
          }}
        />
      </div>
    </div>
  );
}
