import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";
import { useAccountsContext } from "@/context/accountContext";
import { useRouter } from "next/router";

export default function AccountCard({ auth }) {
  const { logout } = useAccountsContext();
  const router = useRouter();

  const address = auth?.caller?.address;

  return (
    <div className="p-5 rounded-lg">
      <div className="mb-0">
        <p className="text-darkGray text-base font-bold">
          {address.slice(0, 5) + '...' + address.slice(-5)}
        </p>
        {/* <p className="text-gray text-sm font-bold text-ellipsis overflow-hidden whitespace-nowrap" title={auth.user?.email}>{auth.user?.email}</p> */}
      </div>
      {/* <div className="flex flex-row justify-around items-center">
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
      </div> */}
    </div>
  );
}
