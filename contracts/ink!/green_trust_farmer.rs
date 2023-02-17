#![cfg_attr(not(feature = "std"), no_std)]

// TODO:
// 1. check about payable - done
// 2. Why is the error code different for checking the same thing - ignore
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

    #[derive(scale::Encode, scale::Decode, Default, PartialEq)]
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

    #[derive(scale::Encode, scale::Decode, Default, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
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
    #[derive(scale::Encode, scale::Decode, Default)]
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
    #[derive(scale::Encode, scale::Decode, Default)]
    pub struct Challenge {
        id: u128,
        verifier_id: u128,
        challenger: AccountId,
        challenged: u128,
        status: ChallengeStatus,
        description: Vec<u8>,
        documents: Vec<u8>
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
                address_to_farmer_ids: Mapping::default(),
                address_to_verifier_ids: Mapping::default(),
                farmers: Mapping::default(),
                farms: Mapping::default(),
                crops: Mapping::default(),
                sensors: Mapping::default(),
                stakes: Mapping::default(),
                challenges: Mapping::default(),
                verifiers: Mapping::default(),
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
                        .address_to_farmer_ids
                        .get(self.env().caller())
                        .unwrap_or(0)
                        > 0,
                "F0"
            );
            let f_id;
            if farmer_id == 0 {
                f_id = self.address_to_farmer_ids.get(self.env().caller()).unwrap();
            } else {
                f_id = farmer_id;
            }

            let mut farmer_farms: Vec<Farm> = Vec::new();
            for i in 1..self.num_farms + 1 {
                if self.farms.get(i).unwrap().farmer_id == f_id {
                    farmer_farms.push(self.farms.get(i).unwrap());
                }
            }

            farmer_farms
        }

        #[ink(message)]
        pub fn fetch_farmer_stakes(&self) -> Vec<Stake> {
            assert!(
                self.address_to_farmer_ids
                    .get(self.env().caller())
                    .unwrap_or(0)
                    != 0,
                "F0"
            );
            let mut farmer_stakes: Vec<Stake> = Vec::new();
            for i in 1..self.num_stakes + 1 {
                if self.stakes.get(i).unwrap().stakeholder == self.env().caller() {
                    farmer_stakes.push(self.stakes.get(i).unwrap());
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
                .address_to_farmer_ids
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
            self.farms.insert(&self.num_farms, &new_farm);
        }

        // fetch all farms
        #[ink(message)]
        pub fn fetch_all_farms(&self) -> Vec<Farm> {
            let mut all_farms: Vec<Farm> = Vec::new();
            for i in 1..self.num_farms + 1 {
                all_farms.push(self.farms.get(i).unwrap());
            }
            all_farms
        }

        #[ink(message)]
        pub fn fetch_farm_crops(&self, farm_id: u128) -> Vec<Crop> {
            assert!(farm_id > 0 && farm_id <= self.num_farms, "F0");
            let mut farm_crops: Vec<Crop> = Vec::new();
            for i in 1..self.num_crops + 1 {
                if self.crops.get(i).unwrap().farm_id == farm_id {
                    farm_crops.push(self.crops.get(i).unwrap());
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
                .address_to_farmer_ids
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(farmer_id != 0, "F0");
            assert!(
                self.farms.get(farm_id).unwrap().farmer_id == farmer_id,
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
            self.crops.insert(&self.num_crops, &new_crop);
        }

        #[ink(message)]
        pub fn fetch_crop_sensors(&self, crop_id: u128) -> Vec<Sensor> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_sensors: Vec<Sensor> = Vec::new();

            for i in 1..self.num_sensors + 1 {
                if self.sensors.get(i).unwrap().crop_id == crop_id {
                    crop_sensors.push(self.sensors.get(i).unwrap());
                }
            }

            crop_sensors
        }

        #[ink(message)]
        pub fn fetch_crop_stakes(&self, crop_id: u128) -> Vec<Stake> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_stakes: Vec<Stake> = Vec::new();

            for i in 1..self.num_stakes + 1 {
                if self.stakes.get(i).unwrap().crop_id == crop_id {
                    crop_stakes.push(self.stakes.get(i).unwrap());
                }
            }

            crop_stakes
        }

        #[ink(message)]
        pub fn fetch_crop_challenges(&self, crop_id: u128) -> Vec<Challenge> {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut crop_challeneges: Vec<Challenge> = Vec::new();

            for i in 1..self.num_challenges + 1 {
                if self.challenges.get(i).unwrap().challenged == crop_id {
                    crop_challeneges.push(self.challenges.get(i).unwrap());
                }
            }

            crop_challeneges
        }        

        // == Sensor Functions ==

        #[ink(message)]
        pub fn add_sensor(&mut self, crop_id: u128, name: Vec<u8>) {
            let farmer_id = self
                .address_to_farmer_ids
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(farmer_id != 0, "F0");
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            assert!(
                self.farms
                    .get(self.crops.get(crop_id).unwrap().farm_id)
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
            self.sensors.insert(&self.num_sensors, &new_sensor);
        }

        #[ink(message)]
        pub fn add_sensor_data(&mut self, sensor_id: u128, data: Vec<u8>) {
            assert!(sensor_id > 0 && sensor_id <= self.num_sensors, "S0");

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
                self.address_to_verifier_ids
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids
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
            self.verifiers.insert(&self.num_verifiers, &new_verifier);
            self.address_to_verifier_ids
                .insert(&self.env().caller(), &self.num_verifiers);
        }

        #[ink(message)]
        pub fn register_farmer(&mut self, profile: Vec<u8>, id_cards: Vec<u8>) {
            assert!(
                self.address_to_verifier_ids
                    .get(self.env().caller())
                    .unwrap_or(0)
                    == 0,
                "V1"
            );
            assert!(
                self.address_to_farmer_ids
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
            self.farmers.insert(&self.num_farmers, &new_farmer);
            self.address_to_farmer_ids
                .insert(&self.env().caller(), &self.num_farmers);
        }

        // == Stake Functions ==

        #[ink(message, payable)]
        pub fn add_challenge(&mut self, challenged: u128, description: Vec<u8>, documents: Vec<u8>) {
            let verifier_id = self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(
                verifier_id != 0
                    || self
                        .address_to_farmer_ids
                        .get(self.env().caller())
                        .unwrap_or(0)
                        != 0,
                "U0"
            );
            assert!(challenged > 0 && challenged <= self.num_crops, "Cr0");
            assert!(self.env().transferred_value() == self.challenge_amount);
            self.num_challenges += 1;
            let new_challenge = Challenge {
                id: self.num_challenges,
                verifier_id: 0,
                challenger: self.env().caller(),
                challenged: challenged,
                status: ChallengeStatus::default(),
                description:  description,
                documents: documents
            };
            self.challenges.insert(&self.num_challenges, &new_challenge);
        }

        #[ink(message)]
        pub fn fetch_all_challenges(&self) -> Vec<Challenge>  {
            let mut all_challenges: Vec<Challenge> = Vec::new();
            for i in 1..self.num_challenges + 1 {
                all_challenges.push(self.challenges.get(i).unwrap());
            }
            all_challenges
        }

        #[ink(message)]
        pub fn has_staked(&mut self, crop_id: u128, wallet_address: AccountId) -> bool {
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
            let mut has_stake: bool = false;
            for i in 1..self.num_stakes + 1 {
                if self.stakes.get(i).unwrap().crop_id == crop_id
                    && self.stakes.get(i).unwrap().stakeholder == wallet_address
                {
                    has_stake = true;
                }
            }
            has_stake
        }

        #[ink(message, payable)]
        pub fn add_stake(&mut self, crop_id: u128) {
            let farmer_id = self
                .address_to_farmer_ids
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(
                farmer_id != 0
                    || self
                        .address_to_verifier_ids
                        .get(self.env().caller())
                        .unwrap_or(0)
                        != 0,
                "U0"
            );
            assert!(crop_id > 0 && crop_id <= self.num_crops, "Cr0");
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
            assert!(
                self.env().transferred_value() == self.crops.get(crop_id).unwrap().stake_amount
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
            self.stakes.insert(&self.num_stakes, &new_stake);

            // TODO: Put in has_staked - done
        }

        #[ink(message)]
        pub fn return_stake(&mut self, stake_id: u128) {
            assert!(stake_id > 0 && stake_id <= self.num_stakes, "St0");
            assert!(
                self.stakes.get(stake_id).unwrap().stakeholder == self.env().caller(),
                "St0U"
            );
            assert!(
                self.stakes.get(stake_id).unwrap().status == StakeStatus::Staked,
                "St0S"
            );
            assert!(
                self.crops
                    .get(self.stakes.get(stake_id).unwrap().crop_id)
                    .unwrap()
                    .harvested_on
                    != 0,
                "St0H"
            );
            assert!(
                self.crops
                    .get(self.stakes.get(stake_id).unwrap().crop_id)
                    .unwrap()
                    .status
                    != CropStatus::Closed,
                "St0H"
            );
            assert!(
                self.env().block_timestamp()
                    > self
                        .crops
                        .get(self.stakes.get(stake_id).unwrap().crop_id)
                        .unwrap()
                        .harvested_on
                        + 90 * 24 * 60 * 60
            );
            self.stakes.get(stake_id).unwrap().status = StakeStatus::Released;
            self.crops
                .get(self.stakes.get(stake_id).unwrap().crop_id)
                .unwrap()
                .status = CropStatus::Closed;
            if self
                .env()
                .transfer(
                    self.env().caller(),
                    self.crops
                        .get(self.stakes.get(stake_id).unwrap().crop_id)
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
                self.challenges.get(challenge_id).unwrap().status == ChallengeStatus::Open,
                "Ch0S"
            );
            assert!(
                self.address_to_verifier_ids
                    .get(self.env().caller())
                    .unwrap_or(0)
                    != 0, "Ch0V"
            );
            let verifier_id = self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap_or(0);
            assert!(verifier_id != 0, "U0V");
            self.challenges.get(challenge_id).unwrap().status = ChallengeStatus::Alloted;
            self.challenges.get(challenge_id).unwrap().verifier_id = verifier_id;
        }

        #[ink(message)]
        pub fn fetch_challenge_details(&self, challenge_id: u128) {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            self.challenges.get(challenge_id).unwrap();
        }

        #[ink(message)]
        pub fn give_verdict(&mut self, challenge_id: u128, status: ChallengeStatus) {
            assert!(
                challenge_id > 0 && challenge_id <= self.num_challenges,
                "Ch0"
            );
            assert!(
                self.challenges.get(challenge_id).unwrap().status == ChallengeStatus::Alloted,
                "Ch0S"
            );
            assert!(
                self.challenges.get(challenge_id).unwrap().verifier_id
                    == self
                        .address_to_verifier_ids
                        .get(self.env().caller())
                        .unwrap(),
                "Ch0V"
            );
            assert!(
                self.crops
                    .get(self.challenges.get(challenge_id).unwrap().challenged)
                    .unwrap()
                    .status
                    != CropStatus::Closed,
                "Ch0C"
            );
            if status == ChallengeStatus::Succesful {
                self.crops
                    .get(self.challenges.get(challenge_id).unwrap().challenged)
                    .unwrap()
                    .status = CropStatus::Closed;
                let mut temp_num_stakes: u128 = 0;
                for i in 1..self.num_stakes + 1 {
                    temp_num_stakes += 1;
                    self.stakes.get(i).unwrap().status = StakeStatus::Unsuccesful;
                }
                if self
                    .env()
                    .transfer(
                        self.challenges.get(challenge_id).unwrap().challenger,
                        self.crops
                            .get(self.challenges.get(challenge_id).unwrap().challenged)
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
                if self.challenges.get(i).unwrap().verifier_id == verifier_id {
                    temp.push(self.challenges.get(i).unwrap());
                }
            }
            return temp;
        }

        // == Common Functions ==

        #[ink(message)]
        pub fn fetch_user_type(&self) -> Vec<u8> {
            if self
                .address_to_farmer_ids
                .get(self.env().caller())
                .unwrap_or(0)
                != 0
            {
                return "farmer".as_bytes().to_vec();
            } else if self
                .address_to_verifier_ids
                .get(self.env().caller())
                .unwrap_or(0)
                != 0
            {
                return "verifier".as_bytes().to_vec();
            } else {
                return "NR".as_bytes().to_vec();
            }
        }
    }
}
