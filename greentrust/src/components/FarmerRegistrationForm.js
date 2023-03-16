import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authContext";
import { contractCall } from "@/InkUtils";
import Form from "@/components/Form";
import { LoaderContext } from "@/context/loaderContext";


export default function FarmerRegistrationForm() {
    const { loading, setLoading } = useContext(LoaderContext);
    const router = useRouter();
    const  { auth, loaded } = useAuth();

    const [data, setData] = useState({});

    const [pic, setPic] = useState([]);
    const [proofs, setProofs] = useState([]);
    
    const handleSubmit = async (picHash, docsHash) => {
        data.profilePic = picHash;

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
