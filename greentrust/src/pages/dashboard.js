import { useState, useEffect, useContext } from "react";
import { contractCall } from "@/InkUtils";
 import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import VerifierDashboard from "@/components/VerifierDashboard";
import FarmerDashboard from "@/components/FarmerDashboard";
import { useAuth } from "@/context/authContext";


export default function Dashboard() {
  const { loading, setLoading } = useContext(LoaderContext);
  const [userType, setUserType] = useState(null);
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);

  const { auth, loaded } = useAuth();
  console.log(auth, loaded, "test")

  const getUserType = async () => {
    try {
      console.log("fetching user type", auth)
      const res = await contractCall(auth, "fetchUserType");
      setUserType(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
    }
  }

  useEffect(() => {
    setLoading(true);
  }, [])

  useEffect(() => {
    if (loaded) {
      getUserType();
    }
  }, [loaded]);

  if (userType == "farmer") {
    return <FarmerDashboard auth={auth} />;
  }
  else if(userType == "verifier"){
    return <VerifierDashboard />;
  }
  else {
    return <></>
  }
}
