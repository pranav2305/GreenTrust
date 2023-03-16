import { useState, useEffect, useContext } from "react";
import { contractCall } from "@/InkUtils";
import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import VerifierDashboard from "@/components/VerifierDashboard";
import FarmerDashboard from "@/components/FarmerDashboard";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";


export default function Dashboard() {
  const { loading, setLoading } = useContext(LoaderContext);
  const [userType, setUserType] = useState(null);
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);

  const { auth, loaded } = useAuth();

  const router = useRouter();

  const getUserType = async () => {
    try {
      const res = await contractCall(auth, "fetchUserType");
      setUserType(res.data);
      setLoading(false);
      if (res.data == 'NR') {
        router.push('/farms');
      }
    } catch (err) {
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
  else if (userType == "verifier") {
    return <VerifierDashboard />;
  }
}
