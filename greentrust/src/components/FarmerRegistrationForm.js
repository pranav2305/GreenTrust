import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/auth/useAuth";

 ;
import { LoaderContext } from "@/context/loaderContext";
import { SnackbarContext } from "@/context/snackbarContext";
import { contractCall, uploadFile } from "@/utils";
import Form from "@/components/Form";
import { LoaderContext } from "@/context/loaderContext";
import InputBox from "./InputBox";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useChain } from "@/context/chainContext";


export default function FarmerRegistrationForm() {
    const { loading, setLoading } = useContext(LoaderContext);

    const router = useRouter();

    const {api, contract} = useChain();

    const [address, setAddress] = useLocalStorage('address');

   const auth = {
    'api':api,
    'contract':contract,
    'address':address,
    'gasLimit':3000n * 1000000n,
    'storageDepositLimit': null
  }

    useEffect(() => {
        if (auth.user) {
            setLoading(false);
        }
    }, [auth.user])

    useEffect(() => {
        if (!auth.user) {
            setLoading(true);
        }
    }, [])

    const [data, setData] = useState({});

    const [pic, setPic] = useState([]);
    const [proofs, setProofs] = useState([]);
    
    const handleSubmit = async (picHash, docsHash) => {
        data.profilePic = picHash;

        console.log('debug:', data, docsHash);
        
        await contractCall(auth, 'registerFarmer', [
            JSON.stringify(data),
            docsHash,
        ]);

        router.replace('/dashboard');
    };

    return (
        <Form
            handleSubmit={handleSubmit}
            fields={[
                {
                    label: 'Name',
                    placeholder: 'Jane Doe',
                },
                {
                    label: 'Email',
                    placeholder: 'janedoe@greentrust.com',
                },
                {
                    label: 'Address',
                    placeholder: '1234 Main St',
                    dataLabel: 'currentAddress'
                },
                {
                    label: 'Farmer Id',
                    placeholder: '1234',
                    dataLabel: 'farmerId'
                },
                {
                    label: 'Profile Pic',
                    id: 'pic',
                    isFile: true,
                    setFile: setPic,
                    file: pic,
                },
                {
                    label: 'Document Proofs',
                    id: 'proofs',
                    isFile: true,
                    isMultiple: true,
                    setFile: setProofs,
                    file: proofs,
                    dataLabel: 'proofs' 
                }
            ]}
            setData={setData}
            data={data}
        />
    );
}
