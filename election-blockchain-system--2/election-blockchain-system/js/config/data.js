// Election Commission of Pakistan - Data Configuration

export const electionNames = {
    national: 'National Assembly',
    provincial: 'Provincial Assembly',
    senate: 'Senate',
    local: 'Local Government'
};

export const candidatesByElection = {
    national: [
        { id: 'n1', name: 'Ahmed Nawaz Khan', party: 'PPP', symbol: 'star', status: 'active', votes: 0, initials: 'AN' },
        { id: 'n2', name: 'Fatima Ali Zaidi', party: 'PML-N', symbol: 'flag', status: 'active', votes: 0, initials: 'FA' },
        { id: 'n3', name: 'Muhammad Bilal', party: 'PTI', symbol: 'balance-scale', status: 'active', votes: 0, initials: 'MB' },
        { id: 'n4', name: 'Ayesha Malik', party: 'Independent', symbol: 'leaf', status: 'active', votes: 0, initials: 'AM' }
    ],
    provincial: [
        { id: 'p1', name: 'Raja Muhammad Ali', party: 'PPP', symbol: 'crown', status: 'active', votes: 0, initials: 'RA' },
        { id: 'p2', name: 'Sana Khalid', party: 'PML-N', symbol: 'moon', status: 'active', votes: 0, initials: 'SK' },
        { id: 'p3', name: 'Tariq Mehmood', party: 'PTI', symbol: 'bolt', status: 'active', votes: 0, initials: 'TM' }
    ],
    senate: [
        { id: 's1', name: 'Dr. Farooq Sattar', party: 'MQM', symbol: 'globe', status: 'active', votes: 0, initials: 'FS' },
        { id: 's2', name: 'Nasreen Jalil', party: 'Independent', symbol: 'feather', status: 'active', votes: 0, initials: 'NJ' }
    ],
    local: [
        { id: 'l1', name: 'Kamran Tessori', party: 'Independent', symbol: 'house', status: 'active', votes: 0, initials: 'KT' },
        { id: 'l2', name: 'Rukhsana Zubairi', party: 'PPP', symbol: 'hand', status: 'active', votes: 0, initials: 'RZ' }
    ]
};

export const faqData = [
    { qKey: 'faqQ1', aKey: 'faqA1' },
    { qKey: 'faqQ2', aKey: 'faqA2' },
    { qKey: 'faqQ3', aKey: 'faqA3' },
    { qKey: 'faqQ4', aKey: 'faqA4' },
    { qKey: 'faqQ5', aKey: 'faqA5' }
];