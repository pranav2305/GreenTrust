#![cfg_attr(not(feature = "std"), no_std)]

// use ink_lang as ink;

#[ink::contract]
mod greentrustverifier {

    use ink::{
        prelude::vec::Vec,
        storage::Mapping,
    };

    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(scale::Encode,scale::Decode)]
    #[derive(Default)]
    pub struct Verifier {
        id: u128,
        name: Vec<u8>,
        current_address: Vec<u8>,
        id_cards: Vec<u8>,
        is_valid: bool,
        // #[ink(message, payable)]
        wallet_address: AccountId,
    }
    #[ink(storage)]
    pub struct GreenTrustVerifier {
        // skipping internal modifier because !ink doesn't have one
        address_to_verifier_ids: Mapping<AccountId, u128>,
        verifiers: Mapping<u128, Verifier>,
        num_verifiers: u128,
    }

    #[ink(event)]
    pub struct VerifierRegistered {
         #[ink(topic)]
         verifier_address: AccountId,
         name: Vec<u8>,
         id: u128
    }

    #[ink(event)]
    pub struct VerifierUpdated {
         #[ink(topic)]
         verifier_address: AccountId,
         name: Vec<u8>,
         id: u128
    }

    impl GreenTrustVerifier {

        #[ink(constructor)]
        pub fn new() -> Self {
            let verifiers = Mapping::default();
            let address_to_verifier_ids = Mapping::default();
            Self {
                verifiers,
                address_to_verifier_ids,
                num_verifiers: Default::default(),
            }
            // Self { address_to_verifier_ids, verifiers, num_verifiers }
            // Self { num_verifiers, verifiers, address_to_verifier_ids }
        }

        // TODO: Dont know to set it to view only
        #[ink(message)]
        pub fn fetch_verifier_profile(&self) -> Verifier {
            assert!(self.address_to_verifier_ids.get(self.env().caller()).unwrap() != 0, "V0");
            let verifier = self.verifiers.get(self.address_to_verifier_ids.get(self.env().caller()).unwrap()).unwrap();
            verifier
        }

        // TODO: The params should be string memory
        #[ink(message)]
        pub fn update_verifier_profile(&self, name: Vec<u8>, current_address: Vec<u8>, id_cards: Vec<u8>) {
            assert!(self.address_to_verifier_ids.get(self.env().caller()).unwrap() != 0, "V0");
            self.verifiers.get(self.address_to_verifier_ids.get(self.env().caller()).unwrap()).unwrap().name = name;
            self.verifiers.get(self.address_to_verifier_ids.get(self.env().caller()).unwrap()).unwrap().current_address = current_address;
            self.verifiers.get(self.address_to_verifier_ids.get(self.env().caller()).unwrap()).unwrap().id_cards = id_cards;

            // self.env().emit_event(VerifierUpdated {
            //     verifier_address: self.env().caller(), name: name, id: self.address_to_verifier_ids.get(self.env().caller()).unwrap()
            // })
        }

        #[ink(message)]
        pub fn fetch_verifier_details(&self, verifier_id: u128) -> Verifier {
            assert!(verifier_id > 0 && verifier_id <= self.num_verifiers && self.verifiers.get(verifier_id).unwrap().is_valid, "V0");
            let verifier = self.verifiers.get(verifier_id).unwrap();
            verifier
        }
    }
}