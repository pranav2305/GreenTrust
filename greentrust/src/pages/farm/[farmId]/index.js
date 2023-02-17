import CropCard from "@/components/CropCard";
import FarmerDefaultCard from "@/components/FarmerInfoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useContext } from "react";
import { contractCall } from "@/utils";
import { useAuth } from "@arcana/auth-react";
import { useRouter } from 'next/router'
import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import Info from "@/components/Info";
import Link from "next/link";
import { AiFillPlusCircle } from "@react-icons/all-files/ai/AiFillPlusCircle";

export default function FarmInfo() {
  const auth = useAuth();
  const router = useRouter()
  const { farmId } = router.query
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);
  const { loading, setLoading } = useContext(LoaderContext);

  const [farmInfo, setFarmInfo] = useState(null);
  const [crops, setCrops] = useState([]);
  const [farmer, setFarmer] = useState(null);
  const [hasAccess , setHasAccess] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  const fetchFarmInfo = async () => {
    setLoading(true);

    try {
      const farmRes = await contractCall(auth, 'farms', [farmId]);
      setFarmInfo(farmRes.data);
      
      const cropsRes = await contractCall(auth, 'fetchFarmCrops', [farmId]);
      setCrops(cropsRes.data);
      
      const farmerRes = await contractCall(auth, 'farmers', [parseInt(farmRes.data.farmerId._hex)]);
      
      const res = await contractCall(auth, "fetchUserType");
      if (res.data == "farmer") {
        const farmerIdRes = await contractCall(auth, "addressToFarmerIds", [
          auth.user.address,
        ]);
        console.log(farmRes.data.farmerId._hex)
          console.log( farmerIdRes.data._hex , "\n\n HELLO \n")
        if(parseInt(farmRes.data.farmerId._hex) == parseInt(farmerIdRes.data._hex)) {
          setHasAccess(true);
        }
      }
      setFarmer(farmerRes.data);
    
    }
    catch (err) {
      setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
    }

    setLoading(false);
  }

  useEffect(() => {
    if (auth.user) {
      fetchFarmInfo();
    }
  }, [auth?.user])

  var element = crops?.map((cropDetails) => {
    return <CropCard cropDetails={cropDetails} />;
  });
  var cropList = <div className={`grid grid-cols-1: md:grid-cols-2 gap-10`}>{element}</div>;

  if (!farmInfo) {
    return <></>
  }

  return (
    <div>
      <div className="mt-10">
        <div className="flex flex-col md:flex-row mb-10 justify-around">
          <div className="shrink-0 grow">
            <h1>
              {farmInfo.name ?? "Serene Farm"}
            </h1>
            <div className="flex flex-row gap-10">
              <Info icon={faLocationDot} text={farmInfo?.location} style="text-red" />
              <Info icon={faChartPie} text={`${farmInfo?.size} Acre`} style="text-gray" />
            </div>
            <div className="my-10">
              {farmer && <FarmerDefaultCard
                profile={farmer.profile}
              />}
            </div>
            <p className="w-fit font-bold text-2xl text-center text-primary font-comfortaa">
              Crops {hasAccess ? <Link href={`/farm/${farmId}/crop/add`}><AiFillPlusCircle className="inline mb-1 text-darkGray" /></Link>:<div></div>}
            </p>
            {crops?.length > 0? cropList:<p className="text-darkGray font-comfortaa">No Crops registered</p> }
            
          </div>
          <div className="hidden lg:flex shrink min-w-[400px]">
            <img
              src="/images/farmer.png"
              className="my-auto object-fill"
            ></img>
          </div>
        </div>
      </div>
    </div>
  );
}
