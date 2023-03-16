import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/context/authContext";
import { LoaderContext } from "@/context/loaderContext";
import { contractCall, uploadFile } from "@/InkUtils";
import Form from "@/components/Form";


export default function VerifierRegistrationForm() {
    const router = useRouter();

    const { auth } = useAuth();

    const [verifierProfile, setVerifierProfile] = useState({});
    const [ids, setIds] = useState([]);

    const handleSubmit = async (idCardsHash) => {
        await contractCall(auth, "registerVerifier", [
            verifierProfile.currentAddress,
            verifierProfile.name,
            idCardsHash,
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
                    label: 'Address',
                    placeholder: '1234 Main St',
                    dataLabel: 'currentAddress'
                },
                {
                    label: 'ID',
                    isFile: true,
                    isMultiple: true,
                    setFile: setIds,
                    file: ids,
                    dataLabel: 'ids'
                }
            ]}
            setData={setVerifierProfile}
            data={verifierProfile}
        />
    );
}