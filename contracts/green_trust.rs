#![cfg_attr(not(feature = "std"), no_std)]

// TODO:
// 1. Why is the error code different for checking the same thing - ignore

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

    #[derive(scale::Encode, scale::Decode, Default, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum StakeStatus {
        #[default]
        Staked,
        Released,
        Unsuccessful,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Copy, Default, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum ChallengeStatus {
        #[default]
        Open,
        Alloted,
        Rejected,
        Successful,
    }

    // == Structs ==

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode)]
    pub struct Farmer {
        id: u128,
        wallet_address: AccountId,
        profile: Vec<u8>,
        id_cards: Vec<u8>,
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
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Crop {
        id: u128,
        details: Vec<u8>,
        harvested_on: u64,
        stake_amount: u128,
        farm_id: u128,
        status: CropStatus,
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
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode)]
    pub struct Stake {
        id: u128,
        crop_id: u128,
        stakeholder: AccountId,
        status: StakeStatus,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode)]
    pub struct Challenge {
        id: u128,
        verifier_id: u128,
        challenger: AccountId,
        challenged: u128,
        status: ChallengeStatus,
        description: Vec<u8>,
        documents: Vec<u8>,
    }

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode, scale::Decode)]
    pub struct Verifier {
        id: u128,
        wallet_address: AccountId,
        name: Vec<u8>,
        current_address: Vec<u8>,
        id_cards: Vec<u8>,
    }

    // == Variables ==

    #[ink(storage)]
    pub struct GreenTrustFarmer {
        // skipping internal modifier because !ink doesn't have one
        address_to_farmer_ids_map: Mapping<AccountId, u128>,
        address_to_verifier_ids_map: Mapping<AccountId, u128>,
        farmers_map: Mapping<u128, Farmer>,
        farms_map: Mapping<u128, Farm>,
        crops_map: Mapping<u128, Crop>,
        sensors_map: Mapping<u128, Sensor>,
        stakes_map: Mapping<u128, Stake>,
        challenges_map: Mapping<u128, Challenge>,
        verifiers_map: Mapping<u128, Verifier>,
        num_farmers: u128,
        num_farms: u128,
        num_crops: u128,
        num_sensors: u128,
        num_stakes: u128,
        num_challenges: u128,
        num_verifiers: u128,
        challenge_amount: u128,
    }

    // == Implementation ==

    impl GreenTrustFarmer {
        // Constructor
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                address_to_farmer_ids_map: Mapping::default(),
                address_to_verifier_ids_map: Mapping::default(),
                farmers_map: Mapping::default(),
                farms_map: Mapping::default(),
                crops_map: Mapping::default(),
                sensors_map: Mapping::default(),
                stakes_map: Mapping::default(),
                challenges_map: Mapping::default(),
                verifiers_map: Mapping::default(),
                num_farmers: 0,
                num_farms: 0,
                num_crops: 0,
                num_sensors: 0,
                num_stakes: 0,
                num_challenges: 0,
                num_verifiers: 0,
                challenge_amount: 1000000,
            }
        }

        // == Farmer Functions ==

        #[ink(message)]
        pub fn fetch_farmer_farms(&self, farmer_id: u128) -> Vec<Farm> {
            assert!(
                farmer_id > 0 && farmer_id <= self.num_farmers
                    || self
                        .address_to_farmer_ids_map
                        .get(self.env().caller())
                        .unwrap_or(0)
                        > 0,
                "F0"
            );
            let f_id;
            if farmer_id == 0 {
                f_id = self
                    .address_to_farmer_ids_map
                    .get(self.env().caller())
                    .unwrap();
            } else {
                f_id = farmer_id;
            }

            let mut farmer_farms: Vec<Farm> = Vec::new();
            for i in 1..self.num_farms + 1 {
                if self.farms_map.get(i).unwrap().farmer_id == f_id {
                    farmer_farms.push(self.farms_map.get(i).unwrap());
                }
            }

            farmer_farms
        }

        #[ink(message)]
        pub fn fetch_farmer_stakes(&self) -> Vec<Stake> {
            assert!(
                self.address_to_farmer_ids_map
                    .get(self.env().caller())
                    .unwrap_or(0)
                    != 0,
                "F0"
            );
            let mut farmer_stakes: Vec<Stake> = Vec::new();
            for i in 1..self.num_stakes + 1 {
                if self.stakes_map.get(i).unwrap().stakeholder == self.env().caller() {
                    farmer_stakes.push(self.stakes_map.get(i).unwrap());
                }
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
            let farmer_id = self
                .address_to_farmer_ids_map
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(farmer_id != 0, "F0");
            self.num_farms += 1;
            let new_farm = Farm {
                id: self.num_farms,
                name: name,
                size: size,
                latitude: latitude,
                longitude: longitude,
                location: location,
                documents: documents,
                farmer_id: farmer_id,
            };
            self.farms_map.insert(&self.num_farms, &new_farm);
        }

        // fetch all farms_map
        #[ink(message)]
        pub fn fetch_all_farms(&self) -> Vec<Farm> {
            let mut all_farms: Vec<Farm> = Vec::new();
            for i in 1..self.num_farms + 1 {
                all_farms.push(self.farms_map.get(i).unwrap());
            }
            all_farms
        }

        #[ink(message)]
        pub fn fetch_farm_crops(&self, farm_id: u128) -> Vec<Crop> {
            assert!(farm_id > 0 && farm_id <= self.num_farms, "F0");
            let mut farm_crops: Vec<Crop> = Vec::new();
            for i in 1..self.num_crops + 1 {
                if self.crops_map.get(i).unwrap().farm_id == farm_id {
                    farm_crops.push(self.crops_map.get(i).unwrap());
                }
            }

            farm_crops
        }

        // == Crop Functions ==

        #[ink(message)]
        pub fn add_crop(
            &mut self,
            details: Vec<u8>,
            harvested_on: u64,
            stake_amount: u128,
            farm_id: u128,
        ) {
            let farmer_id = self
                .address_to_farmer_ids_map
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(farmer_id != 0, "F0");
            assert!(
                self.farms_map.get(farm_id).unwrap().farmer_id == farmer_id,
                "F0C"
            );
            self.num_crops += 1;
            let new_crop = Crop {
                id: self.num_crops,
                details: details,
                harvested_on: harvested_on,
                stake_amount: stake_amount,
                farm_id: farm_id,
                status: CropStatus::default(),
            };
            self.crops_map.insert(&self.num_crops, &new_crop);
        }

        #[ink(message)]
        pub fn fetch_crop_sensors(&self, crop_id: u128) -> Vec<Sensor> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_sensors: Vec<Sensor> = Vec::new();

            for i in 1..self.num_sensors + 1 {
                if self.sensors_map.get(i).unwrap().crop_id == crop_id {
                    crop_sensors.push(self.sensors_map.get(i).unwrap());
                }
            }

            crop_sensors
        }

        #[ink(message)]
        pub fn fetch_crop_stakes(&self, crop_id: u128) -> Vec<Stake> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_stakes: Vec<Stake> = Vec::new();

            for i in 1..self.num_stakes + 1 {
                if self.stakes_map.get(i).unwrap().crop_id == crop_id {
                    crop_stakes.push(self.stakes_map.get(i).unwrap());
                }
            }

            crop_stakes
        }

        #[ink(message)]
        pub fn fetch_crop_challenges(&self, crop_id: u128) -> Vec<Challenge> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_challeneges: Vec<Challenge> = Vec::new();

            for i in 1..self.num_challenges + 1 {
                if self.challenges_map.get(i).unwrap().challenged == crop_id {
                    crop_challeneges.push(self.challenges_map.get(i).unwrap());
                }
            }

            crop_challeneges
        }

        // == Sensor Functions ==

        #[ink(message)]
        pub fn add_sensor(&mut self, crop_id: u128, name: Vec<u8>) {
            let farmer_id = self
                .address_to_farmer_ids_map
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(farmer_id != 0, "F0");
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            assert!(
                self.farms_map
                    .get(self.crops_map.get(crop_id).unwrap().farm_id)
                    .unwrap()
                    .farmer_id
                    == farmer_id,
                "F0S"
            );
            self.num_sensors += 1;
            let new_sensor = Sensor {
                id: self.num_sensors,
                name: name,
                data: "".as_bytes().to_vec(),
                crop_id: crop_id,
            };
            self.sensors_map.insert(&self.num_sensors, &new_sensor);
        }

        #[ink(message)]
        pub fn add_sensor_data(&mut self, sensor_id: u128, data: Vec<u8>) {
            assert!(sensor_id > 0 && sensor_id <= self.num_sensors, "S0");

            self.sensors_map.get(sensor_id).unwrap().data = data;
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
                self.address_to_verifier_ids_map
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids_map
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "F1"
            );
            self.num_verifiers += 1;
            let new_verifier = Verifier {
                name: name,
                current_address: current_address,
                id_cards: id_cards,
                id: self.num_verifiers,
                wallet_address: self.env().caller(),
            };
            self.verifiers_map
                .insert(&self.num_verifiers, &new_verifier);
            self.address_to_verifier_ids_map
                .insert(&self.env().caller(), &self.num_verifiers);
        }

        #[ink(message)]
        pub fn register_farmer(&mut self, profile: Vec<u8>, id_cards: Vec<u8>) {
            assert!(
                self.address_to_verifier_ids_map
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids_map
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "F1"
            );
            self.num_farmers += 1;
            let new_farmer = Farmer {
                id: self.num_farmers,
                wallet_address: self.env().caller(),
                profile: profile,
                id_cards: id_cards,
            };
            self.farmers_map.insert(&self.num_farmers, &new_farmer);
            self.address_to_farmer_ids_map
                .insert(&self.env().caller(), &self.num_farmers);
        }

        // == Stake Functions ==

        #[ink(message, payable)]
        pub fn add_challenge(
            &mut self,
            challenged: u128,
            description: Vec<u8>,
            documents: Vec<u8>,
        ) {
            assert!(challenged > 0 && challenged <= self.num_crops, "Cr0");
            assert!(self.env().transferred_value() == self.challenge_amount);
            self.num_challenges += 1;
            let new_challenge = Challenge {
                id: self.num_challenges,
                verifier_id: 0,
                challenger: self.env().caller(),
                challenged: challenged,
                status: ChallengeStatus::default(),
                description: description,
                documents: documents,
            };
            self.challenges_map
                .insert(&self.num_challenges, &new_challenge);
        }

        #[ink(message)]
        pub fn fetch_all_challenges(&self) -> Vec<Challenge> {
            let mut all_challenges: Vec<Challenge> = Vec::new();
            for i in 1..self.num_challenges + 1 {
                all_challenges.push(self.challenges_map.get(i).unwrap());
            }
            all_challenges
        }

        #[ink(message)]
        pub fn has_staked(&mut self, crop_id: u128, wallet_address: AccountId) -> bool {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut has_stake: bool = false;
            for i in 1..self.num_stakes + 1 {
                if self.stakes_map.get(i).unwrap().crop_id == crop_id
                    && self.stakes_map.get(i).unwrap().stakeholder == wallet_address
                {
                    has_stake = true;
                }
            }
            has_stake
        }

        #[ink(message, payable)]
        pub fn add_stake(&mut self, crop_id: u128) {
            let farmer_id = self
                .address_to_farmer_ids_map
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(
                farmer_id != 0
                    || self
                        .address_to_verifier_ids_map
                        .get(self.env().caller())
                        .unwrap_or(0)
                        != 0,
                "U0"
            );
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            assert!(
                self.crops_map.get(crop_id).unwrap().status == CropStatus::Open,
                "Cr0"
            );
            assert!(
                self.farms_map
                    .get(self.crops_map.get(crop_id).unwrap().farm_id)
                    .unwrap()
                    .farmer_id
                    != self
                        .address_to_farmer_ids_map
                        .get(self.env().caller())
                        .unwrap(),
                "F0St"
            );
            assert!(
                self.env().transferred_value() == self.crops_map.get(crop_id).unwrap().stake_amount
            );
            assert!(!self.has_staked(crop_id, self.env().caller()), "St1");

            // TODO: Check if the farmer has already staked for this crop - done
            self.num_stakes += 1;
            let new_stake = Stake {
                id: self.num_stakes,
                crop_id: crop_id,
                stakeholder: self.env().caller(),
                status: StakeStatus::default(),
            };
            self.stakes_map.insert(&self.num_stakes, &new_stake);

            // TODO: Put in has_staked - done
        }

        #[ink(message)]
        pub fn return_stake(&mut self, stake_id: u128) {
            assert!(stake_id > 0 && stake_id <= self.num_stakes, "St0");
            assert!(
                self.stakes_map.get(stake_id).unwrap().stakeholder == self.env().caller(),
                "St0U"
            );
            assert!(
                self.stakes_map.get(stake_id).unwrap().status == StakeStatus::Staked,
                "St0S"
            );
            assert!(
                self.crops_map
                    .get(self.stakes_map.get(stake_id).unwrap().crop_id)
                    .unwrap()
                    .harvested_on
                    != 0,
                "St0H"
            );
            assert!(
                self.crops_map
                    .get(self.stakes_map.get(stake_id).unwrap().crop_id)
                    .unwrap()
                    .status
                    != CropStatus::Closed,
                "St0H"
            );
            assert!(
                self.env().block_timestamp()
                    > self
                        .crops_map
                        .get(self.stakes_map.get(stake_id).unwrap().crop_id)
                        .unwrap()
                        .harvested_on
                        + 90 * 24 * 60 * 60
            );
            let mut stake = self.stakes_map.get(stake_id).unwrap();
            stake.status = StakeStatus::Released;
            self.stakes_map.insert(stake_id, &stake);
            let mut crop = self.crops_map
                .get(self.stakes_map.get(stake_id).unwrap().crop_id)
                .unwrap();
            crop.status = CropStatus::Closed;
            self.crops_map.insert(self.stakes_map.get(stake_id).unwrap().crop_id, &crop);
            if self
                .env()
                .transfer(
                    self.env().caller(),
                    self.crops_map
                        .get(self.stakes_map.get(stake_id).unwrap().crop_id)
                        .unwrap()
                        .stake_amount,
                )
                .is_err()
            {
                panic!(
                    "requested transfer failed. this can be the case if the contract does not\
                     have sufficient free funds or if the transfer would have brought the\
                     contract's balance below minimum balance."
                )
            }
        }

        #[ink(message)]
        pub fn claim_challenge(&mut self, challenge_id: u128) {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            assert!(
                self.challenges_map.get(challenge_id).unwrap().status == ChallengeStatus::Open,
                "Ch0S"
            );
            let verifier_id = self
                .address_to_verifier_ids_map
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(verifier_id != 0, "Ch0V");
            let mut challenge = self.challenges_map.get(challenge_id).unwrap();
            challenge.status = ChallengeStatus::Alloted;
            challenge.verifier_id = verifier_id;
            self.challenges_map.insert(challenge_id, &challenge);
        }

        #[ink(message)]
        pub fn fetch_challenge_details(&self, challenge_id: u128) {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            self.challenges_map.get(challenge_id).unwrap();
        }

        #[ink(message)]
        pub fn give_verdict(&mut self, challenge_id: u128, status: ChallengeStatus) {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            assert!(
                self.challenges_map.get(challenge_id).unwrap().status == ChallengeStatus::Alloted,
                "Ch0S"
            );
            assert!(
                self.challenges_map.get(challenge_id).unwrap().verifier_id
                    == self
                        .address_to_verifier_ids_map
                        .get(self.env().caller())
                        .unwrap(),
                "Ch0V"
            );
            assert!(
                self.crops_map
                    .get(self.challenges_map.get(challenge_id).unwrap().challenged)
                    .unwrap()
                    .status
                    != CropStatus::Closed,
                "Ch0C"
            );
            let mut challenge = self.challenges_map.get(challenge_id).unwrap();
            challenge.status = status;
            self.challenges_map.insert(challenge_id, &challenge);
            if status == ChallengeStatus::Successful {
                let mut crop = self.crops_map
                    .get(self.challenges_map.get(challenge_id).unwrap().challenged)
                    .unwrap();
                crop.status = CropStatus::Closed;
                self.crops_map.insert(
                    self.challenges_map.get(challenge_id).unwrap().challenged,
                    &crop,
                );
                let mut temp_num_stakes: u128 = 0;
                for i in 1..self.num_stakes + 1 {
                    temp_num_stakes += 1;
                    let mut stake = self.stakes_map.get(i).unwrap();
                    stake.status = StakeStatus::Unsuccessful;
                    self.stakes_map.insert(i, &stake);
                }
                if self
                    .env()
                    .transfer(
                        self.challenges_map.get(challenge_id).unwrap().challenger,
                        self.crops_map
                            .get(self.challenges_map.get(challenge_id).unwrap().challenged)
                            .unwrap()
                            .stake_amount
                            * temp_num_stakes,
                    )
                    .is_err()
                {
                    panic!(
                        "requested transfer failed. this can be the case if the contract does not\
                     have sufficient free funds or if the transfer would have brought the\
                     contract's balance below minimum balance."
                    )
                }
            }
            if self
                .env()
                .transfer(self.env().caller(), self.challenge_amount)
                .is_err()
            {
                panic!(
                    "requested transfer failed. this can be the case if the contract does not\
                     have sufficient free funds or if the transfer would have brought the\
                     contract's balance below minimum balance."
                )
            }
        }

        #[ink(message)]
        pub fn fetch_verifier_challenges(&self, verifier_id: u128) -> Vec<Challenge> {
            let mut temp: Vec<Challenge> = Vec::new();
            for i in 1..self.num_challenges + 1 {
                if self.challenges_map.get(i).unwrap().verifier_id == verifier_id {
                    temp.push(self.challenges_map.get(i).unwrap());
                }
            }
            return temp;
        }

        // == Common Functions ==

        #[ink(message)]
        pub fn fetch_user_type(&self) -> Vec<u8> {
            if self
                .address_to_farmer_ids_map
                .get(self.env().caller())
                .unwrap_or(0)
                != 0
            {
                return "farmer".as_bytes().to_vec();
            } else if self
                .address_to_verifier_ids_map
                .get(self.env().caller())
                .unwrap_or(0)
                != 0
            {
                return "verifier".as_bytes().to_vec();
            } else {
                return "NR".as_bytes().to_vec();
            }
        }

        // == Getter Functions ==

        #[ink(message)]
        pub fn farmers(&self, farmer_id: u128) -> Farmer {
            assert!(farmer_id > 0 && farmer_id <= self.num_farmers, "F0");
            return self.farmers_map.get(farmer_id).unwrap();
        }

        #[ink(message)]
        pub fn farms(&self, farm_id: u128) -> Farm {
            assert!(farm_id > 0 && farm_id <= self.num_farms, "F0");
            return self.farms_map.get(farm_id).unwrap();
        }

        #[ink(message)]
        pub fn crops(&self, crop_id: u128) -> Crop {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "C0");
            return self.crops_map.get(crop_id).unwrap();
        }

        #[ink(message)]
        pub fn sensors(&self, sensor_id: u128) -> Sensor {
            assert!(sensor_id > 0 && sensor_id <= self.num_sensors, "S0");
            return self.sensors_map.get(sensor_id).unwrap();
        }

        #[ink(message)]
        pub fn stakes(&self, stake_id: u128) -> Stake {
            assert!(stake_id > 0 && stake_id <= self.num_stakes, "S0");
            return self.stakes_map.get(stake_id).unwrap();
        }

        #[ink(message)]
        pub fn challenges(&self, challenge_id: u128) -> Challenge {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            return self.challenges_map.get(challenge_id).unwrap();
        }

        #[ink(message)]
        pub fn verifiers(&self, verifier_id: u128) -> Verifier {
            assert!(verifier_id > 0 && verifier_id <= self.num_verifiers, "V0");
            return self.verifiers_map.get(verifier_id).unwrap();
        }

        #[ink(message)]
        pub fn address_to_farmer_ids(&self, address: AccountId) -> u128 {
            return self.address_to_farmer_ids_map.get(address).unwrap();
        }

        #[ink(message)]
        pub fn address_to_verifier_ids(&self, address: AccountId) -> u128 {
            return self.address_to_verifier_ids_map.get(address).unwrap();
        }
    }
}