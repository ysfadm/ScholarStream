#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

// Student information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StudentInfo {
    pub address: Address,
    pub total_progress: u32,
    pub last_update: u64,
}

// Storage keys for persistent data
#[contracttype]
pub enum DataKey {
    TotalProgress,
    LastStudent,
    Student(Address),      // student address -> StudentInfo
    AllStudents,           // Vec<Address> of all students
}

#[contract]
pub struct ScholarshipMilestone;

#[contractimpl]
impl ScholarshipMilestone {
    /// Update student's milestone progress
    /// Adds progress to total and updates last student
    pub fn update_progress(env: Env, student: Address, progress: u32) {
        // Get current total progress or default to 0
        let current_total: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalProgress)
            .unwrap_or(0);

        // Add new progress to total
        let new_total = current_total + progress;

        // Save updated total progress
        env.storage()
            .persistent()
            .set(&DataKey::TotalProgress, &new_total);

        // Save last student address
        env.storage()
            .persistent()
            .set(&DataKey::LastStudent, &student);

        // Update student info
        let mut student_info: StudentInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Student(student.clone()))
            .unwrap_or(StudentInfo {
                address: student.clone(),
                total_progress: 0,
                last_update: 0,
            });

        student_info.total_progress += progress;
        student_info.last_update = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Student(student.clone()), &student_info);

        // Add student to all students list if not already there
        let mut all_students: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AllStudents)
            .unwrap_or(Vec::new(&env));

        let mut student_exists = false;
        for i in 0..all_students.len() {
            if all_students.get(i).unwrap() == student {
                student_exists = true;
                break;
            }
        }

        if !student_exists {
            all_students.push_back(student);
            env.storage()
                .persistent()
                .set(&DataKey::AllStudents, &all_students);
        }
    }

    /// Get total accumulated progress across all updates
    pub fn get_total_progress(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalProgress)
            .unwrap_or(0)
    }

    /// Get the last student who submitted progress
    pub fn get_last_student(env: Env) -> Option<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::LastStudent)
    }

    /// Get student information
    pub fn get_student_info(env: Env, student: Address) -> Option<StudentInfo> {
        env.storage()
            .persistent()
            .get(&DataKey::Student(student))
    }

    /// Get all students who have submitted progress
    pub fn get_all_students(env: Env) -> Vec<StudentInfo> {
        let addresses: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AllStudents)
            .unwrap_or(Vec::new(&env));

        let mut students = Vec::new(&env);
        for i in 0..addresses.len() {
            let addr = addresses.get(i).unwrap();
            if let Some(info) = env
                .storage()
                .persistent()
                .get::<DataKey, StudentInfo>(&DataKey::Student(addr))
            {
                students.push_back(info);
            }
        }
        students
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_update_progress() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipMilestone);
        let client = ScholarshipMilestoneClient::new(&env, &contract_id);

        let student1 = Address::generate(&env);
        let student2 = Address::generate(&env);

        // First update
        client.update_progress(&student1, &25);
        assert_eq!(client.get_total_progress(), 25);
        assert_eq!(client.get_last_student(), Some(student1.clone()));

        // Second update
        client.update_progress(&student2, &30);
        assert_eq!(client.get_total_progress(), 55);
        assert_eq!(client.get_last_student(), Some(student2));
    }

    #[test]
    fn test_empty_state() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ScholarshipMilestone);
        let client = ScholarshipMilestoneClient::new(&env, &contract_id);

        assert_eq!(client.get_total_progress(), 0);
        assert_eq!(client.get_last_student(), None);
    }
}
