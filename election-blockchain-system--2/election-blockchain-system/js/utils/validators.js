// Election Commission of Pakistan - Validators

import { CNIC_PATTERN, PHONE_PATTERN, MIN_VOTING_AGE } from '../config/constants.js';

export class Validators {
    static validateCNIC(cnic) {
        if (!cnic) return false;
        return CNIC_PATTERN.test(cnic);
    }

    static validatePhone(phone) {
        if (!phone) return false;
        const phoneDigits = phone.replace(/-/g, '');
        return PHONE_PATTERN.test(phoneDigits);
    }

    static validateAge(age) {
        const ageNum = parseInt(age);
        return !isNaN(ageNum) && ageNum >= MIN_VOTING_AGE && ageNum <= 120;
    }

    static validateRequired(value) {
        return value && value.toString().trim().length > 0;
    }

    static validateAlpha(value, fieldName) {
        if (!value || !/^[a-zA-Z\s]+$/.test(value.trim())) {
            return `${fieldName} must contain only letters`;
        }
        return null;
    }

    static validateVoterForm(data) {
        const errors = [];

        // Name validation with alpha check
        if (!Validators.validateRequired(data.name)) {
            errors.push('Full name is required');
        } else if (!/^[a-zA-Z\s]+$/.test(data.name.trim())) {
            errors.push('Name must contain only letters');
        }

        // Father name validation with alpha check
        if (!Validators.validateRequired(data.father)) {
            errors.push("Father's name is required");
        } else if (!/^[a-zA-Z\s]+$/.test(data.father.trim())) {
            errors.push("Father's name must contain only letters");
        }

        if (!Validators.validateCNIC(data.cnic)) {
            errors.push('Invalid CNIC format! Use: 12345-1234567-1');
        }

        if (!Validators.validateAge(data.age)) {
            errors.push(`You must be ${MIN_VOTING_AGE} or older to vote`);
        }

        if (!Validators.validateRequired(data.gender)) {
            errors.push('Gender is required');
        }

        if (!Validators.validatePhone(data.phone)) {
            errors.push('Phone number must be exactly 11 digits');
        }

        if (!Validators.validateRequired(data.address)) {
            errors.push('Address is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static validateCandidateForm(data) {
        const errors = [];

        if (!Validators.validateRequired(data.name)) {
            errors.push('Candidate name is required');
        }

        if (!Validators.validateRequired(data.party)) {
            errors.push('Party name is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static validateTxId(txId) {
        if (!txId) return false;
        return txId.startsWith('0x') && txId.length >= 10;
    }
}