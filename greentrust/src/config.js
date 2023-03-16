export const APP_ADDRESS = "851e2f9b3e599f9ea4f8f1a3c2c9012d3543dc2b";
export const CONTRACT_ADDRESS = "0x838c4B9559F617d83853DBE6a7030392fd88C1DD";
export const INK_ENDPOINT = "wss://shibuya-rpc.dwellir.com";
export const INK_CONTRACT_ADDRESS = "ZH1fkRHd14rT2rTsHg2xcEVWR9ESAW8URV7sZWtUisr7ENE";
export const CHALLENGE_AMOUNT = 1000000;
export const STAKE_DURATION = 30;
export const fnMap = {
    "read": [
        "fetchUserType",
        "fetchAllFarms",
        "addressToFarmerIds",
        "fetchFarmerFarms",
        "fetchFarmerStakes",
        "crops",
        "farms",
        "fetchFarmCrops",
        "farmers",
        "fetchCropStakes",
        "fetchCropSensors",
        "fetchCropChallenges"
    ],
    "write": []
}