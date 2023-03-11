import { useState, useEffect, useContext } from "react";
import { contractCall } from "@/utils";
 import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import VerifierDashboard from "@/components/VerifierDashboard";
import FarmerDashboard from "@/components/FarmerDashboard";
import Button from "@/components/Button";


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

  useEffect(() => {
    setLoading(true);
  }, [])

  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      console.log('debug:', auth.user);
      setLoading(false);

      contractCall(auth, "fetchUserType")
        .then((res) => setType(res.data));
    }
  }, [auth?.user]);

  if (type == "farmer") {
    return <FarmerDashboard auth={auth} />;
  }
  else if(type == "verifier"){
    return <VerifierDashboard />;
  }
  else {
    return <></>
  }
}
