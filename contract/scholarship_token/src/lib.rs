#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Symbol};

#[contracttype]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    TotalSupply,
    Balance(Address),
}

#[contract]
pub struct ScholarshipToken;

#[contractimpl]
impl ScholarshipToken {
    /// Initialize the BRS Token
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String) {
        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Name, &name);
        env.storage().persistent().set(&DataKey::Symbol, &symbol);
        env.storage().persistent().set(&DataKey::Decimals, &7_u32);
        env.storage().persistent().set(&DataKey::TotalSupply, &0_i128);
    }

    /// Mint new BRS tokens (Admin only)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Update recipient balance
        let balance_key = DataKey::Balance(to.clone());
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&balance_key, &new_balance);

        // Update total supply
        let total_supply: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::TotalSupply, &(total_supply + amount));
    }

    /// Transfer BRS tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Check from balance
        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&from_key)
            .unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        // Update from balance
        env.storage()
            .persistent()
            .set(&from_key, &(from_balance - amount));

        // Update to balance
        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage()
            .persistent()
            .set(&to_key, &(to_balance + amount));
    }

    /// Get balance of an address
    pub fn balance_of(env: Env, address: Address) -> i128 {
        let balance_key = DataKey::Balance(address);
        env.storage().persistent().get(&balance_key).unwrap_or(0)
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get token name
    pub fn name(env: Env) -> String {
        env.storage().persistent().get(&DataKey::Name).unwrap()
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        env.storage().persistent().get(&DataKey::Symbol).unwrap()
    }

    /// Distribute tokens based on progress (0-100)
    /// Returns amount of tokens minted
    pub fn distribute_for_progress(env: Env, student: Address, progress: u32) -> i128 {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        if progress > 100 {
            panic!("Progress cannot exceed 100");
        }

        // 1% progress = 1 BRS token
        let amount = progress as i128;

        if amount > 0 {
            let balance_key = DataKey::Balance(student.clone());
            let current_balance: i128 = env
                .storage()
                .persistent()
                .get(&balance_key)
                .unwrap_or(0);
            let new_balance = current_balance + amount;
            env.storage().persistent().set(&balance_key, &new_balance);

            // Update total supply
            let total_supply: i128 = env
                .storage()
                .persistent()
                .get(&DataKey::TotalSupply)
                .unwrap_or(0);
            env.storage()
                .persistent()
                .set(&DataKey::TotalSupply, &(total_supply + amount));
        }

        amount
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_token_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipToken);
        let client = ScholarshipTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let name = String::from_str(&env, "Scholarship Token");
        let symbol = String::from_str(&env, "BRS");

        client.initialize(&admin, &name, &symbol);

        assert_eq!(client.name(), name);
        assert_eq!(client.symbol(), symbol);
        assert_eq!(client.total_supply(), 0);
    }

    #[test]
    fn test_mint_and_balance() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipToken);
        let client = ScholarshipTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        let name = String::from_str(&env, "Scholarship Token");
        let symbol = String::from_str(&env, "BRS");

        client.initialize(&admin, &name, &symbol);

        env.mock_all_auths();
        client.mint(&student, &100);

        assert_eq!(client.balance_of(&student), 100);
        assert_eq!(client.total_supply(), 100);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipToken);
        let client = ScholarshipTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student1 = Address::generate(&env);
        let student2 = Address::generate(&env);
        let name = String::from_str(&env, "Scholarship Token");
        let symbol = String::from_str(&env, "BRS");

        client.initialize(&admin, &name, &symbol);

        env.mock_all_auths();
        client.mint(&student1, &100);
        client.transfer(&student1, &student2, &30);

        assert_eq!(client.balance_of(&student1), 70);
        assert_eq!(client.balance_of(&student2), 30);
    }

    #[test]
    fn test_progress_distribution() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipToken);
        let client = ScholarshipTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        let name = String::from_str(&env, "Scholarship Token");
        let symbol = String::from_str(&env, "BRS");

        client.initialize(&admin, &name, &symbol);

        env.mock_all_auths();
        
        // 25% progress = 25 BRS
        let minted = client.distribute_for_progress(&student, &25);
        assert_eq!(minted, 25);
        assert_eq!(client.balance_of(&student), 25);

        // Another 30% progress
        let minted2 = client.distribute_for_progress(&student, &30);
        assert_eq!(minted2, 30);
        assert_eq!(client.balance_of(&student), 55);
    }
}
