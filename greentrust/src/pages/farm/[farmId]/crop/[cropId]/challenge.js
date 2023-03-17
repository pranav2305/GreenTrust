import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";

import FormPage from "@/components/FormPage";
import Form from "@/components/Form";
import { useAuth } from "@/context/authContext";
import { LoaderContext } from "@/context/loaderContext";
import { SnackbarContext } from "@/context/snackbarContext";
import { contractCall, uploadFile } from "@/InkUtils";
import { CHALLENGE_AMOUNT } from "@/config";
import profile from '@/../../public/lotties/profile-builder.json';


export default function Challenge() {
	const { loading, setLoading } = useContext(LoaderContext);
	const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);
	const [challenge, setChallenge] = useState({});
	const [supportingDocs, setSupportingDocs] = useState([]);
	const router = useRouter();
	const { cropId, farmId } = router.query;
	const { auth } = useAuth();

	let data = {}
	data.proofs = []

	const handleSubmit = async (docsHash) => {
		await contractCall(auth, 'addChallenge', [
			cropId,
			challenge.description,
			docsHash,
		], CHALLENGE_AMOUNT);

		router.push(`/farm/${farmId}/crop/${cropId}`);
	};

	return (<>
		<FormPage
			form={<Form
				handleSubmit={handleSubmit}
				fields={[
					{
						label: 'Description',
						placeholder: '',
						type: 'textarea',
						label: 'Description',
					},
					{
						label: 'Supporting documents',
						isFile: true,
						isMultiple: true,
						setFile: setSupportingDocs,
						file: supportingDocs,
						dataLabel: 'proofs'
					},
				]}
				setData={setChallenge}
				data={challenge}
			/>}
			title="Raise a challenge"
			text="We appreciate your effort. Fill up the details asked and upload supporting documents. Your issue will be presented to a licensed verifier at the earliest. Thank you!"
			image={profile}
			imageStyle="w-[50%]"
		/>
	</>)
}
