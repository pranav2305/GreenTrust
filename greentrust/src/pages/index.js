import ReactDOM from "react";
const { Keyring } = require("@polkadot/keyring");
import LandingNavbar from "@/components/LandingNavbar";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import { useChain } from "@/context/chainContext";
import { useEstimationContext } from "@/context/estimationContext";
import { useCallerContext } from "@/context/callerContext";
import { useAccountsContext } from "@/context/accountContext";
import { useEffect } from "react";
import { contractCall } from "@/InkUtils";
const { mnemonicGenerate } = require("@polkadot/util-crypto");
import { useLocalStorage } from "hooks/useLocalStorage";
import Spinner from "@/components/Spinner";
import Lottie from "react-lottie-player";
import farm from "@/../../public/lotties/farm.json";

const Landing = () => {
  const router = useRouter();
  const { api, contract } = useChain();
  const { estimation } = useEstimationContext();
  const { caller } = useCallerContext();
  const { accounts } = useAccountsContext();
  // const [mnemonic, setMnemonic] = useLocalStorage('mnemonic', {});

  const callContract = async()  =>{
    console.log("contractCall called")
    const res = await contractCall(
      {
        api: api,
        contract: contract,
        estimation: estimation,
        caller: caller,
      },
      "fetchUserType"
    )
    console.log("contractCall test", res)
  }
  useEffect(() => {
    console.log(
      api,
      contract,
      accounts,
      estimation,
      caller,
      "testing useEffect"
    );
    if (!api || !contract || !caller) return;
    callContract();
  }, [api, contract, estimation, caller, accounts]);

  console.log(api, contract, "testing");

  async function registerUser() {
    if (address !== null) {
      const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
      const mnemonic = mnemonicGenerate();
      console.log(mnemonic);
      const pair = keyring.addFromUri(mnemonic, { name: "kid-116" }, "ed25519");
      console.log(pair.address); // console.log(keypair); // console.log(keypair.address); localStorage.setItem('mnemonic', mnemonic); localStorage.setItem('address', pair.address); // setMnemonic(mnemonic) router.push("/profile/role-choice") }}
    }
  }

  return (
    <>
      {false ? (
        <Spinner></Spinner>
      ) : (
        <div className="bg-white w-full overflow-hidden flex">
          <div className="md:w-2/3 w-full">
            <LandingNavbar />
            <div
              id="home"
              className="flex flex-col items-center h-full md:pt-[160px] py-[40px]"
            >
              <div className="flex md:hidden">
                <Lottie loop animationData={farm} play className="w-full" />
              </div>

              <div className="px-[10%] md:px-0 w-fit">
                <div>
                  <p className="font-comfortaa font-bold ss:text-[44px] text-[40px] text-darkGray">
                    Register with
                  </p>
                  <h1 className="font-poppins ss:text-[68px] text-[52px] text-primary leading-[120%] w-full mb-0">
                    <span className="text-primary font-extrabold">Green </span>
                    <span className="text-gray font-medium">TRUST</span>
                  </h1>
                  <p className="flex-1 font-comfortaa font-semibold ss:text-[44px] text-[40px] text-darkGray">
                    today!
                  </p>
                </div>

                <p
                  className={`text-3xl text-gray font-bold font-comfortaa max-w-[470px] mt-5`}
                >
                  Secure <span className="text-red">seamless</span>,{" "}
                  <span className="text-red">hassle-free</span> and{" "}
                  <span className="text-red">trusted</span> certification for
                  your <span className="text-primary">organic produce</span>.
                </p>

                <div className="mt-6">
                  <Button
                    text={"Get Started"}
                    styles={"!py-2 text-2xl"}
                    // onClick={onLogin}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/3 hidden md:flex ">
            <img
              src="./images/landing.svg"
              alt="landing"
              className="object-cover w-full h-screen"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Landing;
