#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub required_progress: u32,
    pub reward_amount: i128,
    pub proof_type: String, // "exam", "attendance", "project", "video"
    pub is_completed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Scholarship {
    pub id: u64,
    pub donor: Address,
    pub student: Address,
    pub total_amount: i128,
    pub released_amount: i128,
    pub token_type: String, // "BRS", "USDC", "XLM"
    pub is_active: bool,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    ScholarshipCounter,
    Scholarship(u64),
    Milestones(u64), // scholarship_id -> Vec<Milestone>
    Balance(u64),    // scholarship_id -> deposited balance
}

#[contract]
pub struct ScholarshipEscrow;

#[contractimpl]
impl ScholarshipEscrow {
    /// Create a new scholarship
    pub fn create_scholarship(
        env: Env,
        donor: Address,
        student: Address,
        total_amount: i128,
        token_type: String,
        milestones: Vec<Milestone>,
    ) -> u64 {
        donor.require_auth();

        // Generate scholarship ID
        let counter: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::ScholarshipCounter)
            .unwrap_or(0);
        let scholarship_id = counter + 1;

        // Create scholarship
        let scholarship = Scholarship {
            id: scholarship_id,
            donor: donor.clone(),
            student: student.clone(),
            total_amount,
            released_amount: 0,
            token_type: token_type.clone(),
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        // Store scholarship
        env.storage()
            .persistent()
            .set(&DataKey::Scholarship(scholarship_id), &scholarship);

        // Store milestones
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(scholarship_id), &milestones);

        // Initialize balance to 0
        env.storage()
            .persistent()
            .set(&DataKey::Balance(scholarship_id), &0_i128);

        // Update counter
        env.storage()
            .persistent()
            .set(&DataKey::ScholarshipCounter, &scholarship_id);

        scholarship_id
    }

    /// Deposit funds to scholarship
    pub fn deposit_funds(env: Env, donor: Address, scholarship_id: u64, amount: i128) {
        donor.require_auth();

        let mut scholarship: Scholarship = env
            .storage()
            .persistent()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found");

        // Verify donor
        if scholarship.donor != donor {
            panic!("Only scholarship donor can deposit");
        }

        // Update balance
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(scholarship_id))
            .unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(scholarship_id), &new_balance);
    }

    /// Complete a milestone and release payment
    pub fn complete_milestone(
        env: Env,
        scholarship_id: u64,
        milestone_id: u32,
        proof_data: String,
    ) -> i128 {
        // Get scholarship
        let mut scholarship: Scholarship = env
            .storage()
            .persistent()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found");

        if !scholarship.is_active {
            panic!("Scholarship is not active");
        }

        // Get milestones
        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(scholarship_id))
            .expect("Milestones not found");

        // Find and update milestone
        let mut milestone_found = false;
        let mut reward_amount = 0_i128;

        for i in 0..milestones.len() {
            let mut milestone = milestones.get(i).unwrap();
            if milestone.id == milestone_id {
                if milestone.is_completed {
                    panic!("Milestone already completed");
                }
                milestone.is_completed = true;
                reward_amount = milestone.reward_amount;
                milestones.set(i, milestone);
                milestone_found = true;
                break;
            }
        }

        if !milestone_found {
            panic!("Milestone not found");
        }

        // Check if enough funds deposited
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(scholarship_id))
            .unwrap_or(0);

        if current_balance < reward_amount {
            panic!("Insufficient funds in escrow");
        }

        // Update scholarship
        scholarship.released_amount += reward_amount;
        env.storage()
            .persistent()
            .set(&DataKey::Scholarship(scholarship_id), &scholarship);

        // Update milestones
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(scholarship_id), &milestones);

        // Update balance
        env.storage()
            .persistent()
            .set(&DataKey::Balance(scholarship_id), &(current_balance - reward_amount));

        reward_amount
    }

    /// Get scholarship details
    pub fn get_scholarship(env: Env, scholarship_id: u64) -> Scholarship {
        env.storage()
            .persistent()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found")
    }

    /// Get milestones for a scholarship
    pub fn get_milestones(env: Env, scholarship_id: u64) -> Vec<Milestone> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestones(scholarship_id))
            .expect("Milestones not found")
    }

    /// Get scholarship balance
    pub fn get_balance(env: Env, scholarship_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(scholarship_id))
            .unwrap_or(0)
    }

    /// Get completion percentage
    pub fn get_completion_percentage(env: Env, scholarship_id: u64) -> u32 {
        let milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(scholarship_id))
            .expect("Milestones not found");

        if milestones.len() == 0 {
            return 0;
        }

        let mut completed = 0_u32;
        for i in 0..milestones.len() {
            let milestone = milestones.get(i).unwrap();
            if milestone.is_completed {
                completed += 1;
            }
        }

        (completed * 100) / (milestones.len() as u32)
    }

    /// Get all scholarships for a student
    pub fn get_student_scholarships(env: Env, student: Address) -> Vec<Scholarship> {
        let mut result = Vec::new(&env);
        let counter: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::ScholarshipCounter)
            .unwrap_or(0);

        for id in 1..=counter {
            if let Some(scholarship) = env
                .storage()
                .persistent()
                .get::<DataKey, Scholarship>(&DataKey::Scholarship(id))
            {
                if scholarship.student == student {
                    result.push_back(scholarship);
                }
            }
        }
        result
    }

    /// Get all scholarships created by a donor
    pub fn get_donor_scholarships(env: Env, donor: Address) -> Vec<Scholarship> {
        let mut result = Vec::new(&env);
        let counter: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::ScholarshipCounter)
            .unwrap_or(0);

        for id in 1..=counter {
            if let Some(scholarship) = env
                .storage()
                .persistent()
                .get::<DataKey, Scholarship>(&DataKey::Scholarship(id))
            {
                if scholarship.donor == donor {
                    result.push_back(scholarship);
                }
            }
        }
        result
    }

    /// Get all scholarships (admin view)
    pub fn get_all_scholarships(env: Env) -> Vec<Scholarship> {
        let mut result = Vec::new(&env);
        let counter: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::ScholarshipCounter)
            .unwrap_or(0);

        for id in 1..=counter {
            if let Some(scholarship) = env
                .storage()
                .persistent()
                .get::<DataKey, Scholarship>(&DataKey::Scholarship(id))
            {
                result.push_back(scholarship);
            }
        }
        result
    }

    /// Get total number of scholarships
    pub fn get_scholarship_count(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::ScholarshipCounter)
            .unwrap_or(0)
    }

    /// Cancel scholarship (donor only, if no milestones completed)
    pub fn cancel_scholarship(env: Env, donor: Address, scholarship_id: u64) {
        donor.require_auth();

        let mut scholarship: Scholarship = env
            .storage()
            .persistent()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found");

        if scholarship.donor != donor {
            panic!("Only donor can cancel");
        }

        if scholarship.released_amount > 0 {
            panic!("Cannot cancel scholarship with released payments");
        }

        scholarship.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Scholarship(scholarship_id), &scholarship);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::vec;

    #[test]
    fn test_create_scholarship() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipEscrow);
        let client = ScholarshipEscrowClient::new(&env, &contract_id);

        let donor = Address::generate(&env);
        let student = Address::generate(&env);

        let milestone1 = Milestone {
            id: 1,
            title: String::from_str(&env, "Complete Module 1"),
            description: String::from_str(&env, "Finish first course module"),
            required_progress: 25,
            reward_amount: 250,
            proof_type: String::from_str(&env, "exam"),
            is_completed: false,
        };

        let milestones = vec![&env, milestone1];

        env.mock_all_auths();
        let scholarship_id = client.create_scholarship(
            &donor,
            &student,
            &1000,
            &String::from_str(&env, "BRS"),
            &milestones,
        );

        assert_eq!(scholarship_id, 1);

        let scholarship = client.get_scholarship(&scholarship_id);
        assert_eq!(scholarship.donor, donor);
        assert_eq!(scholarship.student, student);
        assert_eq!(scholarship.total_amount, 1000);
    }

    #[test]
    fn test_deposit_and_complete_milestone() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipEscrow);
        let client = ScholarshipEscrowClient::new(&env, &contract_id);

        let donor = Address::generate(&env);
        let student = Address::generate(&env);

        let milestone1 = Milestone {
            id: 1,
            title: String::from_str(&env, "Complete Module 1"),
            description: String::from_str(&env, "Finish first course module"),
            required_progress: 25,
            reward_amount: 250,
            proof_type: String::from_str(&env, "exam"),
            is_completed: false,
        };

        let milestones = vec![&env, milestone1];

        env.mock_all_auths();
        let scholarship_id = client.create_scholarship(
            &donor,
            &student,
            &1000,
            &String::from_str(&env, "BRS"),
            &milestones,
        );

        // Deposit funds
        client.deposit_funds(&donor, &scholarship_id, &1000);
        assert_eq!(client.get_balance(&scholarship_id), 1000);

        // Complete milestone
        let proof = String::from_str(&env, "exam_score_85");
        let released = client.complete_milestone(&scholarship_id, &1, &proof);

        assert_eq!(released, 250);
        assert_eq!(client.get_balance(&scholarship_id), 750);

        let scholarship = client.get_scholarship(&scholarship_id);
        assert_eq!(scholarship.released_amount, 250);
    }
}
