// Election Commission of Pakistan - Constants

export const STORAGE_KEYS = {
    BLOCKCHAIN: 'ecp_blockchain',
    CANDIDATES: 'ecp_candidates',
    VOTERS: 'ecp_voters',
    RECENT_VOTERS: 'ecp_recent',
    VOTER_RECORDS: 'ecp_voter_records',
    ACTIVE_ELECTION: 'ecp_active_election',
    ADMIN_SESSION: 'ecpAdmin'
};

export const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

export const CHART_COLORS = [
    '#0a3d2e', '#1a5a3e', '#c8a84b', '#2a7a4e', '#3a8a5e', '#e8c96a'
];

export const MIN_VOTING_AGE = 18;

export const CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/;

export const PHONE_PATTERN = /^\d{11}$/;

export const TOTAL_ELIGIBLE_VOTERS = 100000;