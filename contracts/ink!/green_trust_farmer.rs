#![cfg_attr(not(feature = "std"), no_std)]

// TODO:
// 1. check about payable
// 2. Why is the error code different for checking the same thing
// 3. has_staked

#[ink::contract]

mod greentrustfarmer {

    use ink::{prelude::vec::Vec, storage::Mapping};

    // == Enums ==

    #[derive(scale::Encode, scale::Decode, Default, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum CropStatus {
        #[default]
        Open,
        Locked,
        Closed,
    }

    #[derive(scale::Encode, scale::Decode, Default)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum StakeStatus {
        #[default]
        Staked,
        Released,
        Unsuccesful,
    }

    pub enum ChallengeStatus {
        #[default]
        Open,
        Alloted,
        Rejected,
        Succesful,
    }

    // == Structs ==

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Farmer {
        id: u128,
        wallet_address: AccountId,
        profile: Vec<u8>,
        id_cards: Vec<u8>,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Farm {
        id: u128,
        name: Vec<u8>,
        size: Vec<u8>,
        latitude: Vec<u8>,
        longitude: Vec<u8>,
        location: Vec<u8>,
        farmer_id: u128,
        documents: Vec<u8>,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Crop {
        id: u128,
        details: Vec<u8>,
        stake_amount: u128,
        farm_id: u128,
        status: CropStatus,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Sensor {
        id: u128,
        crop_id: u128,
        name: Vec<u8>,
        data: Vec<u8>,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Stake {
        id: u128,
        crop_id: u128,
        stakeholder: AccountId,
        stake_amount: u128,
        status: StakeStatus,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Challenge {
        id: u128,
        verifier_id: u128,
        challenger: AccountId,
        challenged: u128,
        status: ChallengeStatus,
        is_valid: bool,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Verifier {
        id: u128,
        wallet_address: AccountId,
        name: Vec<u8>,
        current_address: Vec<u8>,
        id_cards: Vec<u8>,
        is_valid: bool,
    }

    // == Variables ==

    #[ink(storage)]
    pub struct GreenTrustFarmer {
        // skipping internal modifier because !ink doesn't have one
        address_to_farmer_ids: Mapping<AccountId, u128>,
        address_to_verifier_ids: Mapping<AccountId, u128>,
        farmers: Mapping<u128, Farmer>,
        farms: Mapping<u128, Farm>,
        crops: Mapping<u128, Crop>,
        sensors: Mapping<u128, Sensor>,
        stakes: Mapping<u128, Stake>,
        challenges: Mapping<u128, Challenge>,
        verifiers: Mapping<u128, Verifier>,
        // has_staked: Mapping<u128, Mapping<AccountId, bool>>,
        num_farmers: u128,
        num_farms: u128,
        num_crops: u128,
        num_sensors: u128,
        num_stakes: u128,
        num_challenges: u128,
        num_verifiers: u128,
    }

    // == Events ==

    #[ink(event)]
    pub struct FarmerRegistered {
        #[ink(topic)]
        farmer_address: AccountId,
        id: u128,
    }

    #[ink(event)]
    pub struct FarmerUpdated {
        #[ink(topic)]
        farmer_address: AccountId,
        id: u128,
    }

    #[ink(event)]
    pub struct FarmAdded {
        farm_id: u128,
        farmer_id: u128,
    }

    #[ink(event)]
    pub struct SensorAdded {
        id: u128,
        crop_id: u128,
    }

    #[ink(event)]
    pub struct SensorDataAdded {
        sensor_id: u128,
        data: Vec<u8>,
    }

    #[ink(event)]
    pub struct StakeAdded {
        id: u128,
        crop_id: u128,
        stakeholder: AccountId,
    }

    // == Implementation ==

    impl GreenTrustFarmer {
        // Constructor
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                address_to_farmer_ids: Mapping::default(),
                address_to_verifier_ids: Mapping::default(),
                farmers: Mapping::default(),
                farms: Mapping::default(),
                crops: Mapping::default(),
                sensors: Mapping::default(),
                stakes: Mapping::default(),
                challenges: Mapping::default(),
                verifiers: Mapping::default(),
                // has_staked: Mapping::default(),
                num_farmers: 0,
                num_farms: 0,
                num_crops: 0,
                num_sensors: 0,
                num_stakes: 0,
                num_challenges: 0,
                num_verifiers: 0,
            }
        }

        // == Farmer Functions ==

        #[ink(message)]
        pub fn update_farmer_profile(&mut self, profile: Vec<u8>, id_cards: Vec<u8>) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0, "F0");
            self.farmers.get(farmer_id).unwrap().profile = profile;
            self.farmers.get(farmer_id).unwrap().id_cards = id_cards;
            self.env().emit_event(FarmerUpdated {
                farmer_address: self.env().caller(),
                id: farmer_id,
            });
        }

        #[ink(message)]
        pub fn fetch_farmer_farms(&self, farmer_id: u128) -> Vec<Farm> {
            assert!(
                farmer_id > 0 && farmer_id <= self.num_farmers
                    || self.address_to_farmer_ids.get(self.env().caller()).unwrap() > 0,
                "F0"
            );
            let mut f_id = 0;
            if farmer_id == 0 {
                f_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            } else {
                f_id = farmer_id;
            }

            let mut farm_ids: Vec<u128> = Vec::new();
            for i in 1..self.num_farms + 1 {
                if self.farms.get(i).unwrap().farmer_id == f_id {
                    farm_ids.push(i);
                }
            }

            let mut farm_ids: Vec<u128> = Vec::new();
            let mut farmer_farms = Vec::new();

            for i in 1..self.num_farms + 1 {
                if self.farms.get(i).unwrap().farmer_id == f_id {
                    farm_ids.push(i);
                }
            }

            for i in 0..farm_ids.len() {
                farmer_farms.push(self.farms.get(farm_ids[i]).unwrap());
            }

            farmer_farms
        }

        #[ink(message)]
        pub fn fetch_farmer_stakes(&self) -> Vec<Stake> {
            assert!(
                self.address_to_farmer_ids.get(self.env().caller()).unwrap() != 0,
                "F0"
            );
            let mut stake_ids: Vec<u128> = Vec::new();
            for i in 1..self.num_stakes + 1 {
                if self.stakes.get(i).unwrap().stakeholder == self.env().caller() {
                    stake_ids.push(i);
                }
            }

            let mut farmer_stakes = Vec::new();

            for i in 0..stake_ids.len() {
                farmer_stakes.push(self.stakes.get(stake_ids[i]).unwrap());
            }

            farmer_stakes
        }

        // == Farm Functions ==

        #[ink(message)]
        pub fn add_farm(
            &mut self,
            name: Vec<u8>,
            size: Vec<u8>,
            latitude: Vec<u8>,
            longitude: Vec<u8>,
            location: Vec<u8>,
            documents: Vec<u8>,
        ) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0, "F0");
            self.num_farms += 1;
            self.farms.get(self.num_farmers).unwrap().name = name;
            self.farms.get(self.num_farmers).unwrap().size = size;
            self.farms.get(self.num_farmers).unwrap().latitude = latitude;
            self.farms.get(self.num_farmers).unwrap().longitude = longitude;
            self.farms.get(self.num_farmers).unwrap().location = location;
            self.farms.get(self.num_farmers).unwrap().documents = documents;
            self.farms.get(self.num_farmers).unwrap().is_valid = true;
            self.farms.get(self.num_farmers).unwrap().farmer_id = farmer_id;

            self.env().emit_event(FarmAdded {
                farm_id: self.num_farms,
                farmer_id: farmer_id,
            });
        }

        #[ink(message)]
        pub fn fetch_farm_crops(&self, farm_id: u128) -> Vec<Crop> {
            assert!(
                farm_id > 0
                    && farm_id <= self.num_farms
                    && self.farms.get(farm_id).unwrap().is_valid,
                "F0"
            );
            let mut crop_ids: Vec<u128> = Vec::new();
            for i in 1..self.num_crops + 1 {
                if self.crops.get(i).unwrap().farm_id == farm_id {
                    crop_ids.push(i);
                }
            }

            let mut farmer_crops = Vec::new();

            for i in 0..crop_ids.len() {
                farmer_crops.push(self.crops.get(crop_ids[i]).unwrap());
            }

            farmer_crops
        }

        // == Crop Functions ==

        #[ink(message)]
        pub fn add_crop(&mut self, details: Vec<u8>, stake_amount: u128, farm_id: u128) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0, "F0");
            assert!(
                self.farms.get(farm_id).unwrap().farmer_id == farmer_id,
                "F0C"
            );
            self.num_crops += 1;
            self.crops.get(self.num_crops).unwrap().details = details;
            self.crops.get(self.num_crops).unwrap().stake_amount = stake_amount;
            self.crops.get(self.num_crops).unwrap().farm_id = farm_id;
            self.crops.get(self.num_crops).unwrap().is_valid = true;
        }

        #[ink(message)]
        pub fn fetch_crop_sensors(&self, crop_id: u128) -> Vec<Sensor> {
            assert!(
                crop_id > 0
                    && crop_id <= self.num_crops
                    && self.crops.get(crop_id).unwrap().is_valid,
                "Cr0"
            );
            let mut sensor_ids: Vec<u128> = Vec::new();
            let mut crop_sensors = Vec::new();

            for i in 1..self.num_sensors + 1 {
                if self.sensors.get(i).unwrap().crop_id == crop_id {
                    sensor_ids.push(i);
                }
            }

            for i in 0..sensor_ids.len() {
                crop_sensors.push(self.sensors.get(sensor_ids[i]).unwrap());
            }

            crop_sensors
        }

        #[ink(message)]
        pub fn fetch_crop_stakes(&self, crop_id: u128) -> Vec<Stake> {
            assert!(
                crop_id > 0
                    && crop_id <= self.num_crops
                    && self.crops.get(crop_id).unwrap().is_valid,
                "Cr0"
            );
            let mut stake_ids: Vec<u128> = Vec::new();
            let mut crop_stakes = Vec::new();

            for i in 1..self.num_stakes + 1 {
                if self.stakes.get(i).unwrap().crop_id == crop_id {
                    stake_ids.push(i);
                }
            }

            for i in 0..stake_ids.len() {
                crop_stakes.push(self.stakes.get(stake_ids[i]).unwrap());
            }

            crop_stakes
        }

        // == Sensor Functions ==

        #[ink(message)]
        pub fn add_sensor(&mut self, crop_id: u128, name: Vec<u8>) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0, "F0");
            assert!(
                self.farms
                    .get(self.crops.get(crop_id).unwrap().farm_id)
                    .unwrap()
                    .farmer_id
                    == farmer_id,
                "F0S"
            );
            assert!(self.crops.get(crop_id).unwrap().is_valid, "Cr0");
            self.num_sensors += 1;

            self.sensors.get(self.num_sensors).unwrap().name = name;
            self.sensors.get(self.num_sensors).unwrap().crop_id = crop_id;
            self.sensors.get(self.num_sensors).unwrap().is_valid = true;
            self.sensors.get(self.num_sensors).unwrap().id = self.num_sensors;

            self.env().emit_event(SensorAdded {
                id: self.num_sensors,
                crop_id: crop_id,
            });
        }

        #[ink(message)]
        pub fn add_sensor_data(&mut self, sensor_id: u128, data: Vec<u8>) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0, "F0");
            assert!(self.sensors.get(sensor_id).unwrap().is_valid, "S0");
            assert!(
                self.farms
                    .get(
                        self.crops
                            .get(self.sensors.get(sensor_id).unwrap().crop_id)
                            .unwrap()
                            .farm_id
                    )
                    .unwrap()
                    .farmer_id
                    == farmer_id,
                "F0SD"
            );
            assert!(
                self.crops
                    .get(self.sensors.get(sensor_id).unwrap().crop_id)
                    .unwrap()
                    .status
                    == CropStatus::Open,
                "Cr0"
            );

            self.sensors.get(sensor_id).unwrap().data = data;
        }

        // == Registration Functions ==

        #[ink(message)]
        pub fn register_verifier(
            &mut self,
            name: Vec<u8>,
            current_address: Vec<u8>,
            id_cards: Vec<u8>,
        ) {
            assert!(
                self.address_to_verifier_ids.get(self.env().caller()) == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids.get(self.env().caller()) == 0,
                "F1"
            );
            self.num_verifiers += 1;
            self.verifiers.get(self.num_verifiers).unwrap().name = name;
            self.verifiers
                .get(self.num_verifiers)
                .unwrap()
                .current_address = current_address;
            self.verifiers.get(self.num_verifiers).unwrap().id_cards = id_cards;
            self.verifiers.get(self.num_verifiers).unwrap().is_valid = true;
            self.verifiers.get(self.num_verifiers).unwrap().id = self.num_verifiers;
            self.address_to_verifier_ids
                .insert(&self.env().caller(), &self.num_verifiers);
        }

        #[ink(message)]
        pub fn register_farmer(&mut self, profile: Vec<u8>, id_cards: Vec<u8>) {
            assert!(
                self.address_to_verifier_ids.get(self.env().caller()) == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids.get(self.env().caller()) == 0,
                "F1"
            );
            self.num_farmers += 1;
            self.farmers.get(self.num_farmers).unwrap().id = self.num_farmers;
            self.farmers.get(self.num_farmers).unwrap().wallet_address = self.env().caller();
            self.farmers.get(self.num_farmers).unwrap().profile = profile;
            self.farmers.get(self.num_farmers).unwrap().id_cards = id_cards;
            self.farmers.get(self.num_farmers).unwrap().is_valid = true;
            self.address_to_farmer_ids
                .insert(&self.env().caller(), &self.num_farmers);
        }

        #[ink(message)]
        pub fn update_verifier_profile(
            &mut self,
            name: Vec<u8>,
            current_address: Vec<u8>,
            id_cards: Vec<u8>,
        ) {
            let verifier_id = self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap();
            assert!(verifier_id != 0, "V0");
            self.verifiers.get(verifier_id).unwrap().name = name;
            self.verifiers.get(verifier_id).unwrap().current_address = current_address;
            self.verifiers.get(verifier_id).unwrap().id_cards = id_cards;
        }

        // == Stake Functions ==

        #[ink(message)]
        pub fn add_challenge(&mut self, challenged: u128, status: ChallengeStatus) {
            let verifier_id = self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap();
            assert!(verifier_id !=0
            || self.address_to_farmer_ids.get(self.env().caller()) != try.unwrap_or(0), "U0");
            assert!(self.crops.get(challenged).unwrap().is_valid, "Cr0");
            self.num_challenges += 1;
            self.challenges.get(self.num_challenges).unwrap().id = self.num_challenges;
            self.challenges.get(self.num_challenges).unwrap().challenger = verifier_id;
            self.challenges.get(self.num_challenges).unwrap().challenged = challenged;
            self.challenges.get(self.num_challenges).unwrap().status = status;
            self.challenges.get(self.num_challenges).unwrap().is_valid = true;
        }

        #[ink(message)]
        pub fn add_stake(&mut self, crop_id: u128) {
            let farmer_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            assert!(farmer_id != 0 || self.address_to_verifier_ids.get(self.env().caller()) != try.unwrap_or(0), "U0");
            assert!(self.crops.get(crop_id).unwrap().is_valid, "Cr0");
            assert!(
                self.crops.get(crop_id).unwrap().status == CropStatus::Open,
                "Cr0"
            );
            assert!(
                self.farms
                    .get(self.crops.get(crop_id).unwrap().farm_id)
                    .unwrap()
                    .farmer_id
                    != self.address_to_farmer_ids.get(self.env().caller()).unwrap(),
                "F0St"
            );

            // TODO: Check if the farmer has already staked for this crop

            self.num_stakes += 1;
            self.stakes.get(self.num_stakes).unwrap().id = self.num_stakes;
            self.stakes.get(self.num_stakes).unwrap().crop_id = crop_id;
            self.stakes.get(self.num_stakes).unwrap().stakeholder = self.env().caller();
            self.stakes.get(self.num_stakes).unwrap().status = StakeStatus::Open;
            self.stakes.get(self.num_stakes).unwrap().is_valid = true;

            // TODO: Put in has_staked
        }

        #[ink(message)]
        pub fn accept_challenge(&mut self, challenge_id: u128) {
            let verifier_id = self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap();
            assert!(verifier_id != 0, "U0V");
            assert!(self.challenges.get(challenge_id).unwrap().is_valid, "Ch0");
            self.challenges.get(challenge_id).unwrap().status = ChallengeStatus::Alloted;
            self.challenges.get(challenge_id).unwrap().verifier_id = verifier_id;
        }

        #[ink(message)]
        pub fn fetch_challenge_details(&self, challenge_id: u128) {
            assert!(
                challenge_id > 0
                    && challenge_id <= num_challenges
                    && self.challenges.get(challenge_id).unwrap().is_valid,
                "Ch0"
            );
            self.challenges.get(challenge_id).unwrap();
        }

        // == Common Functions ==

        // #[ink(message)]
        // pub fn fetch_user_type(&self) -> Vec<u8> {
        //     assert!(
        //         self.address_to_farmer_ids.get(self.env().caller()) != 0
        //             || self.address_to_verifier_ids.get(self.env().caller()) != try.unwrap_or(0),
        //         "U0"
        //     );
        //     if self.address_to_farmer_ids.get(self.env().caller()) != 0 {
        //         return "farmer".as_bytes().to_vec();
        //     } else if self.address_to_verifier_ids.get(self.env().caller()) != 0 {
        //         return "verifier".as_bytes().to_vec();
        //     } else {
        //         return "consumer".as_bytes().to_vec();
        //     }
        // }
    }
}
