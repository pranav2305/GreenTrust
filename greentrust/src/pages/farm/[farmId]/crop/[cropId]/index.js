import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faLocationDot,
	faChartPie,
	faQrcode,
	faCircleXmark,
	faMoneyBillWave,
	faCoins,
	faUnlock,
	faHandHoldingDollar,
	faShare,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
;
import SensorCard from "@/components/SensorCard";
import FarmerCard from "@/components/FarmerInfoCard";
import Button from "@/components/Button";
import { CAROUSEL_RESPONSIVE_SETTINGS, contractCall, sendNotification } from "@/InkUtils";
import { SnackbarContext } from "@/context/snackbarContext";
import { LoaderContext } from "@/context/loaderContext";
import Info from "@/components/Info";
import ChallengeCard from "@/components/ChallengeCard";
import IconButton from "@/components/IconButton";
import Empty from "@/components/Empty";
import Modal from "@/components/Modal";
import QRCard from "@/components/QRCard";
import CustomCarousel from "@/components/CustomCarousel";
import { HOST } from "@/config";

import Highcharts from "highcharts";

import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsReact from "highcharts-react-official";
import SensorGraph from "@/components/SensorGraph";

import Lottie from "react-lottie-player";
import plant from "../../../../../../public/lotties/plant.json";
import { useAuth } from "@/context/authContext";

const Crop = () => {
	const router = useRouter();

	const { farmId, cropId } = router.query;

	const { auth, loaded } = useAuth();

	const [data, setData] = useState(null);

	const { snackbarInfo, setSnackbarInfo } = useContext(SnackbarContext);
	var mockData = [
		{
			time: 1676460952,
			data: {
				temperature: 30,
				humidity: 50,
				light: 120,
			},
		},
		{
			time: 1676633752,
			data: {
				temperature: 50,
				humidity: 10,
				light: 100,
			},
		},
		{
			time: 1676806552,
			data: {
				temperature: 20,
				humidity: 50,
				light: 190,
			},
		},
	];
	const [hidden, setHidden] = useState(true);
	const { loading, setLoading } = useContext(LoaderContext);
	const [isFarmer, setIsFarmer] = useState(false);
	const [farmerId, setFarmerId] = useState("");
	const [userType, setUserType] = useState(null);
	const [hasAccess, setHasAccess] = useState(false);
	const [hasStaked, setHasStaked] = useState(false);
	const [isInvalid, setIsInvalid] = useState(false);
	const [sensorData, setSensorData] = useState(mockData);

	async function getCropDetails() {
		setLoading(true);

		const data = {};

		let res;

		try {
			res = await contractCall(auth, 'crops', [cropId]);
			data.crop = { ...res.data, ...JSON.parse(res.data.details) }
			console.log("res debug:", res);

			data.farmId = Number(res.data.farmId);

			res = await contractCall(auth, 'fetchCropStakes', [cropId]);

			res = await contractCall(auth, 'farms', [data.farmId]);
			data.farm = res.data;

			res = await contractCall(auth, 'farmers', [data.farm.farmerId]);
			data.farmerProfile = res.data.profile;

			res = await contractCall(auth, 'fetchCropSensors', [cropId]);
			data.sensors = res.data;

			res = await contractCall(auth, 'fetchCropStakes', [cropId]);
			data.stakes = res.data;

			res = await contractCall(auth, "fetchCropChallenges", [cropId]);
			// res = await contractCall(auth, "fetchAllChallenges", []);
			data.challenges = res.data;
			for (let challenge of data.challenges) {
				if (challenge.challenged == cropId && challenge.status == 3) {
					setIsInvalid(true);
				}
			}

			data.stakeholders = [];
			for (let stake of data.stakes) {
				res = await contractCall(auth, 'addressToFarmerIds', [stake.stakeholder])
				const farmerId = parseInt(res.data._hex);

				res = await contractCall(auth, 'farmers', [farmerId]);
				data.stakeholders.push(res.data);
			}

			res = await contractCall(auth, "fetchUserType");
			if (res.data == "farmer") {
				const farmerIdRes = await contractCall(auth, "addressToFarmerIds", [
					auth.caller.address,
				]);
				if (data.farm.farmerId == farmerIdRes.data) {
					setHasAccess(true);
				}
			}
			setData(data);

			if (data.sensors.length > 0) {

				res = await contractCall(auth, "sensors", [parseInt(data.sensors[0].id._hex)]);
			}

			if (res.data.data != null) {
				res = await fetch(`https://ipfs.io/ipfs/${res.data.data}`);
				const sensorData = await res.json();
				setSensorData(sensorData);
			}
		}
		catch (err) {
			setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
		}
		setLoading(false);
	}

	useEffect(() => {
		if (loaded) {
			getCropDetails();
		}
	}, [loaded]);

	return (<>{data && (
		<div>
			{isInvalid && <Alert severity="warning" className="mb-10 text-comfortaa fixed bottom-0 z-10 left-10">A challenge against this crop has be verified to be true</Alert>}
			<div>
				<div
					className={
						" fixed flex-col inset-0 z-10 backdrop-blur-xl space-y-4 shadow-2xl  h-screen w-screen justify-center items-center " +
						(hidden ? "hidden" : "flex")
					}
				>

					<SensorGraph sensorData={sensorData} />
					<Button text={"Close"} onClick={() => setHidden(true)}>Close</Button>

				</div>
				<Link href={'/farm/' + data.farmId}>
					<h1>
						{data.farm.name}
					</h1>
				</Link>
				<div className={`flex mb-10 opacity-${isInvalid ? '50' : '100'}`}>
					<div className="shrink hidden md:flex">
						<img
							src="/images/plant.png"
							className="mr-10 my-auto object-fill"
						></img>
					</div>
					<div className="grow">
						<div>
							<div className="flex justify-between items-start xl:items-center pt-4 flex-col xl:flex-row">
								<div className="flex justify-center gap-4 flex-col max-w-[320px]">
									<div className="flex flex-row justify-between">
										<h2 className="mb-0">
											{data.crop.name}
										</h2>
										<Modal
											anchor={<FontAwesomeIcon
												icon={faQrcode}
												className="text-gray !w-[32px] !h-[32px]"
											/>}
											popover={<QRCard value={`${HOST}/farm/${farmId}/crop/${cropId}`} />}
										/>
									</div>
									<div className="flex flex-row gap-10">
										<Info icon={faLocationDot} text={data.farm.location} style="text-red" />
										<Info icon={faChartPie} text={`${data.crop.size} Acre`} style="text-gray" />
									</div>
								</div>
								<div>
									{auth?.caller && !hasAccess ?
										<Link href={`/farm/${farmId}/crop/${cropId}/challenge`}>
											<Button
												text="Challenge"
												icon={faCircleXmark}
												styles="bg-red !px-8 !justify-between !py-2 !gap-3 mt-4 xl:mt-0"
											/></Link> : <div></div>}
								</div>
							</div>
						</div>
						<div className="my-20">
							<FarmerCard
								profile={data.farmerProfile}
							/>
						</div>
						<div className="flex flex-row gap-10 items-center mb-2">
							<h3 className="mb-0">
								Sensors
							</h3>
							{hasAccess && <Link href={`/farm/${farmId}/crop/${cropId}/sensor/add`}><IconButton icon={faPlus} styles="!w-6 !h-6" /></Link>}
						</div>
						<div className="grid grid-cols-1: sm:grid-cols-2 gap-10">
							{data.sensors.length > 0 ? data.sensors.map((sensor) => (
								<SensorCard onClick={() => { setHidden(false) }} details={sensor} />)) : <p className="text-gray text-center max-w-[200px]">No sensor added yet!</p>}
						</div>
						<h3 className="mt-10 mb-0">
							Stakeholders
						</h3>
						<div className="flex mt-2 items-center">
							<FontAwesomeIcon
								icon={faMoneyBillWave}
								className="text-gray w-[26px] h-[26px] mr-4"
							/>
							&nbsp;
							<p className=""><span className="text-primary font-semibold">{data.crop.stakeAmount}/-</span> each</p>
						</div>
						<div>
							<div className="flex my-3 gap-3">{data.stakeholders.map((stakeholder) => (
								<FarmerCard profile={stakeholder.profile} onlyPic={true} />
							))}</div>
							<div className="flex mt-10 flex-wrap justify-start items-start gap-x-2">

								{!hasAccess ?
									<Button
										text="Sponsor"
										icon={faCoins}
										styles="!px-8 !justify-between !py-2 !gap-3 mt-4 xl:mt-0"
										onClick={async () => {
											setLoading(true);

											try {
												await contractCall(auth, 'addStake', [cropId])
											}
											catch (err) {
												setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
											}
											setLoading(false);
										}}
									/>
									: <div></div>}

								{/* {true ?
									<Button
										text="Request Sponsorship"
										icon={faCoins}
										styles="!px-8 !justify-between !py-2 !gap-3 mt-4 xl:mt-0"
										onClick={async () => {
											setLoading(true);

											try {
												await sendNotification("sub", "bod");
											}
											catch (err) {
												setSnackbarInfo({ ...snackbarInfo, open: true, message: `Error ${err.code}: ${err.message}` })
											}
											setLoading(false);
										}}
									/>
									: <div></div>} */}

							</div>
						</div>
					</div>
				</div>
				<div>
					{data.challenges.length > 0 && <><h3>
						Pending Challenges
					</h3>
						<div className="static my-8">
							<CustomCarousel responsive={CAROUSEL_RESPONSIVE_SETTINGS}>{data.challenges?.map((challenge, index) => (
								<ChallengeCard key={index} challenge={challenge} full={false} />
							))}</CustomCarousel>
						</div>
					</>}
				</div>
			</div>
		</div>
	)}</>);
}

export default Crop;
