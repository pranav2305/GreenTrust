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

  const { auth, loaded } = useAuth();

  useEffect(() => {
    setLoading(true);
  }, [])

  useEffect(() => {
    if (loaded) {
      contractCall(auth, "fetchUserType")
        .then((res) => {
          setUserType(res.data)
          setLoading(false);
        });
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
