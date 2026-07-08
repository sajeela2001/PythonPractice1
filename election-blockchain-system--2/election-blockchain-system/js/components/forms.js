// Election Commission of Pakistan - Forms Component

import { Validators } from '../utils/validators.js';
import { UIService } from '../services/ui-service.js';

export class FormsHandler {
    constructor(app) {
        this.app = app;
    }

    saveVoterFormData() {
        const votePage = document.getElementById('page-vote');
        if (!votePage || !votePage.classList.contains('active')) return;

        const data = {
            name: UIService.getValue('voterName'),
            father: UIService.getValue('voterFather'),
            cnic: UIService.getValue('cnicInput'),
            age: UIService.getValue('voterAge'),
            gender: UIService.getSelectValue('voterGender'),
            phone: UIService.getValue('voterPhone'),
            address: UIService.getValue('voterAddress'),
            photoData: this.app.capturedPhotoData,
            candidateId: this.app.selectedCandidateId
        };

        return data;
    }

    restoreVoterFormData(savedData) {
        if (!savedData) return;

        UIService.setValue('voterName', savedData.name);
        UIService.setValue('voterFather', savedData.father);
        UIService.setValue('cnicInput', savedData.cnic);
        UIService.setValue('voterAge', savedData.age);
        UIService.setValue('voterGender', savedData.gender);
        UIService.setValue('voterPhone', savedData.phone);
        UIService.setValue('voterAddress', savedData.address);

        // Restore photo
        if (savedData.photoData) {
            this.app.capturedPhotoData = savedData.photoData;
            const capturedPhoto = document.getElementById('capturedPhoto');
            if (capturedPhoto) {
                capturedPhoto.src = savedData.photoData;
                capturedPhoto.style.display = 'block';
            }
            UIService.hideElement('captureBtn');
            UIService.showElement('retakeBtn');
            UIService.addClass('photoCapturedBadge', 'show');
        }

        // Restore candidate selection
        if (savedData.candidateId) {
            this.app.selectedCandidateId = savedData.candidateId;
            const card = document.getElementById('cc-' + savedData.candidateId);
            if (card) {
                card.classList.add('selected');
            }
        }
    }

    resetVoteForm() {
        UIService.setValue('voterName', '');
        UIService.setValue('voterFather', '');
        UIService.setValue('cnicInput', '');
        UIService.setValue('voterAge', '');
        UIService.setValue('voterGender', '');
        UIService.setValue('voterPhone', '');
        UIService.setValue('voterAddress', '');
        
        UIService.hideElement('cnicAlert');
        
        this.app.capturedPhotoData = null;
        UIService.hideElement('capturedPhoto');
        UIService.hideElement('videoElement');
        UIService.showElement('captureBtn');
        
        const captureBtn = document.getElementById('captureBtn');
        if (captureBtn) captureBtn.disabled = true;
        
        UIService.hideElement('retakeBtn');
        UIService.hideElement('retryCameraBtn');
        UIService.removeClass('photoCapturedBadge', 'show');
        
        this.app.selectedCandidateId = null;
        this.app.savedVoterData = {};

        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    openCandidateForm(editId = null) {
        const formCard = document.getElementById('candidateFormCard');
        const formTitle = document.getElementById('formCardTitle');
        
        if (!formCard || !formTitle) return;

        if (editId) {
            formTitle.textContent = 'Edit Candidate';
            const candidates = this.app.getCurrentCandidates();
            const candidate = candidates.find(c => c.id === editId);
            
            if (candidate) {
                UIService.setValue('fName', candidate.name);
                UIService.setValue('fParty', candidate.party);
                UIService.setValue('fSymbol', candidate.symbol);
                UIService.setValue('fStatus', candidate.status);
                UIService.setValue('editCandId', editId);
            }
        } else {
            formTitle.textContent = 'Add New Candidate';
            UIService.setValue('fName', '');
            UIService.setValue('fParty', '');
            UIService.setValue('fSymbol', '');
            UIService.setValue('fStatus', 'active');
            UIService.setValue('editCandId', '');
        }
        
        formCard.classList.add('open');
    }

    closeCandidateForm() {
        const formCard = document.getElementById('candidateFormCard');
        if (formCard) {
            formCard.classList.remove('open');
        }
    }

    saveCandidate() {
        const name = UIService.getValue('fName');
        const party = UIService.getValue('fParty');
        const symbol = UIService.getValue('fSymbol') || 'user';
        const status = UIService.getSelectValue('fStatus');
        const editId = UIService.getValue('editCandId');

        const validation = Validators.validateCandidateForm({ name, party });
        if (!validation.valid) {
            UIService.showToast(validation.errors[0], 'error');
            return;
        }

        const initials = name.split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);

        if (!this.app.candidatesByElection[this.app.activeElection]) {
            this.app.candidatesByElection[this.app.activeElection] = [];
        }

        if (editId) {
            const candidates = this.app.candidatesByElection[this.app.activeElection];
            const index = candidates.findIndex(c => c.id === editId);
            
            if (index !== -1) {
                candidates[index].name = name;
                candidates[index].party = party;
                candidates[index].symbol = symbol;
                candidates[index].status = status;
                candidates[index].initials = initials;
            }
        } else {
            this.app.candidatesByElection[this.app.activeElection].push({
                id: 'c' + Date.now(),
                name: name,
                party: party,
                symbol: symbol,
                status: status,
                votes: 0,
                initials: initials
            });
        }

        this.app.saveData();
        this.closeCandidateForm();
        this.app.renderManageTable();
        this.app.renderVoteCandidates();
        this.app.updateHomeStats();
        this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
        UIService.showToast('Candidate saved successfully!');
    }

    removeCandidate(id) {
        if (confirm('Are you sure you want to remove this candidate?')) {
            this.app.candidatesByElection[this.app.activeElection] = 
                this.app.getCurrentCandidates().filter(c => c.id !== id);
            
            this.app.saveData();
            this.app.renderManageTable();
            this.app.renderVoteCandidates();
            this.app.updateHomeStats();
            this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
            UIService.showToast('Candidate removed');
        }
    }
}