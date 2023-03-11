import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
 ;import { LoaderContext } from "@/context/loaderContext";
import { SnackbarContext } from "@/context/snackbarContext";
import { contractCall } from "@/utils";
import FormPage from "@/components/FormPage";
import Form from "@/components/Form";
import plant from '@/../../public/lotties/plant.json';


export default function AddSensor() {
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);

  const router = useRouter();
  const { farmId, cropId } = router.query;

  const {  farmId,cropId } = router.query;
 const auth = {
    'api':api,
    'contract':contract,
    'address':address,
    'gasLimit':3000n * 1000000n,
    'storageDepositLimit': null
  }
  const [name , setName] = useState("");
  const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);

  const handleSubmit = async (e) => {
    await contractCall(auth, "addSensor", [cropId, data.name]);

    router.replace(`/farm/${farmId}/crop/${cropId}`);
  };

  return (
    <FormPage
      form={<Form
        handleSubmit={handleSubmit}
        fields={[
          {
            label: 'Name',
            placeholder: 'NPK Sensor',
          },
        ]}
        setData={setData}
        data={data}
      />}
      title="Register your sensor"
      text="Improve your credibility by providing continuous sensor data."
      image={plant}
    />
  );
}
