import { useState, useEffect, useContext } from "react";
import { contractCall } from "@/utils";
 import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import VerifierDashboard from "@/components/VerifierDashboard";
import FarmerDashboard from "@/components/FarmerDashboard";

export default function Dashboard() {
 const auth = {
    'api':api,
    'contract':contract,
    'address':address,
    'gasLimit':3000n * 1000000n,
    'storageDepositLimit': null
  }
 
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);
  const { loading, setLoading } = useContext(LoaderContext);
  const { api, contract } = useChain();
  const [userType, setUserType] = useState(null);
  const [farms, setFarms] = useState(null);
  const [stakes, setStakes] = useState(null);

  const fetchDashboardDetails = async () => {
    setLoading(true);
    try {
      const res = await contractCall(auth, "fetchUserType");
      setUserType(res.data);
      if (res.data == "farmer") {
        const farmerIdRes = await contractCall(auth, "addressToFarmerIds", [
          auth.user.address,
        ]);
        const farmsRes = await contractCall(auth, "fetchFarmerFarms", [
          farmerIdRes.data,
        ]);
        console.log(farmsRes.data, "farmer data");
        setFarms(farmsRes.data);
        const stakesRes = await contractCall(auth, "fetchFarmerStakes", [farmerIdRes.data]);
        let farmerStakes = [];
        for (let i = 0; i < stakesRes.data.length; i++) {
          const stake = stakesRes.data[i];
          const cropRes = await contractCall(auth, "crops", [stake.cropId]);
          const farmRes = await contractCall(auth, "farms", [cropRes.data.farmId])
          farmerStakes.push({
            ...stake,
            crop: cropRes.data,
            farm: farmRes.data
          });
        }
        setStakes(farmerStakes);
      }
    } catch (err) {
      console.log(err);

      setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
    }
    setLoading(false);
  };

  useEffect(() => {
    try{
      console.log(auth.user);
    if (auth.user) {
      fetchDashboardDetails();
    }
      }catch(err){
        setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
    }
  }, [auth?.user]);
console.log(userType, "user type")
  if (userType == "farmer") {
    return <FarmerDashboard farms={farms} stakes={stakes} />;
  }
  else if(userType == "verifier"){
    return <VerifierDashboard />;
  }
  return <></>;
}
