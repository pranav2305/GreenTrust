import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { Auth, useAuth } from "@arcana/auth-react";
import { useEffect } from "react";
import classes from "../style";
import NavBar from "@/components/Navbar";

// For Choose Role
import RoleCard from "@/components/RoleCard";

// For Dashboard
import FarmCard from "@/components/FarmCard";
import CropCard from "@/components/CropCard";
import { AiFillPlusCircle } from "@react-icons/all-files/ai/AiFillPlusCircle";

const inter = Inter({ subsets: ["latin"] });

// export default function Home() {
//   const auth = useAuth();

//   useEffect(() => {
//     if (auth?.isLoggedIn){
//       console.log(auth.user);
//     }
//   }, [auth?.user]);

//   const onLogin = async () => {
//     console.log("Logged in with address: " + auth.provider);
//     const info = await auth.getUser()
//      console.log(auth.getUser());

//   };
//   const logout = async()=>{
//     await auth.logout();
//   }
//   return (
//     <>
//       {auth.loading ? (
//         "Loading"
//       ) : auth.isLoggedIn ? (
//         <div>
//         Logged In
//         <button onClick={logout}>Logout</button>
//         </div>
//       ) : (
//         <div>
//           <Auth externalWallet={true} theme={"light"} onLogin={onLogin}/>
//         </div>
//       )}
//     </>
//   )
// }

export default function Home({}) {
  return (
    <>
      <div className="bg-white w-full overflow-x-hidden h-screen">
        <NavBar />

        {/* Choose Role Section */}
        {/* <div className="flex flex-col md:flex-row justify-center md:justify-around items-center min-h-screen -mt-10">
          <p className="h-32 font-bold text-6xl text-primary font-comfortaa mt-20 md:mt-0 text-left mr-16 md:mr-0">
            Get <br></br>Verified
          </p>
          <div className="flex space-x-[20px] flex-col md:flex-row">
            <RoleCard name={"Farmer"} imagePath={"farmer-woman.png"} />
            <RoleCard name={"Licensed Inspector"} imagePath={"sheriff.png"} />
          </div>
        </div> */}

        <div className={`${classes.paddingX} ${classes.flexCenter} mt-8`}>
          <div className={`${classes.boxWidth}`}>
            {/* Dashboard */}

            <h2 className={`${classes.title} mt-12`}>
              My Farms{" "}
              <AiFillPlusCircle className="inline mb-1 text-darkGray" />
            </h2>
            <div className="flex mt-6 flex-no-wrap overflow-x-scroll scrolling-touch items-start mb-8 p-6">
              <FarmCard
                image={"farm.png"}
                name={"Serene"}
                location={"Assam, India"}
              />
              <FarmCard
                image={"farm2.png"}
                name={"Myriad"}
                location={"Perth, Australia"}
              />
              <FarmCard
                image={"farm3.png"}
                name={"Magic"}
                location={"Bhutan, India"}
              />
              <FarmCard
                image={"farm2.png"}
                name={"Serene"}
                location={"Assam, India"}
              />
              <FarmCard
                image={"farm2.png"}
                name={"Serene"}
                location={"Assam, India"}
              />
              <FarmCard
                image={"farm2.png"}
                name={"Serene"}
                location={"Assam, India"}
              />
            </div>

            <h2 className={`${classes.title} mt-12`}>Staked Crops</h2>

            <div className="flex mt-6 flex-no-wrap overflow-x-scroll scrolling-touch items-start mb-12 p-6">
            <CropCard
                cropName={"Barley"}
                farmName={"Sila's State Farm"}
                stakeAmount={"5000"}
                date={"Feb 13th, 2020"}
                timeToMature={"13 Months"}
                location={"Assam, India"}
              />
              <CropCard
                cropName={"Apple"}
                farmName={"Pranav's Farm"}
                stakeAmount={"6000"}
                date={"Sept 22nd, 2021"}
                timeToMature={"10 Months"}
                location={"Mangaluru, India"}
              />
              <CropCard
                cropName={"Wheat"}
                farmName={"Mehul's Farm"}
                stakeAmount={"500"}
                date={"Feb 13th, 2021"}
                timeToMature={"11 Months"}
                location={"Bengaluru, India"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
