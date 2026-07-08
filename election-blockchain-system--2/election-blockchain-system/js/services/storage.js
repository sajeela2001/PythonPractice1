// Election Commission of Pakistan - Storage Service

import { STORAGE_KEYS } from '../config/constants.js';

export class StorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    static saveAllData(data) {
        StorageService.save(STORAGE_KEYS.BLOCKCHAIN, data.blockchain);
        StorageService.save(STORAGE_KEYS.CANDIDATES, data.candidates);
        StorageService.save(STORAGE_KEYS.VOTERS, data.voters);
        StorageService.save(STORAGE_KEYS.RECENT_VOTERS, data.recentVoters);
        StorageService.save(STORAGE_KEYS.VOTER_RECORDS, data.voterRecords);
        StorageService.save(STORAGE_KEYS.ACTIVE_ELECTION, data.activeElection);
    }

    static loadAllData() {
        return {
            blockchain: StorageService.load(STORAGE_KEYS.BLOCKCHAIN),
            candidates: StorageService.load(STORAGE_KEYS.CANDIDATES),
            voters: StorageService.load(STORAGE_KEYS.VOTERS),
            recentVoters: StorageService.load(STORAGE_KEYS.RECENT_VOTERS),
            voterRecords: StorageService.load(STORAGE_KEYS.VOTER_RECORDS),
            activeElection: StorageService.load(STORAGE_KEYS.ACTIVE_ELECTION)
        };
    }

    static isAdmin() {
        return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
    }

    static setAdmin(value) {
        if (value) {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
    }
}