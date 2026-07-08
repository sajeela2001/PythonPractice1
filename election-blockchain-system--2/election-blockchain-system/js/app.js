// Election Commission of Pakistan - Main Application

import translations from './config/translations.js';
import { electionNames, candidatesByElection, faqData } from './config/data.js';
import { STORAGE_KEYS } from './config/constants.js';
import { Blockchain } from './models/blockchain.js';
import { StorageService } from './services/storage.js';
import { CameraService } from './services/camera.js';
import { UIService } from './services/ui-service.js';
import { Validators } from './utils/validators.js';
import { Navigation } from './components/navigation.js';
import { FormsHandler } from './components/forms.js';
import { ChartsManager } from './components/charts.js';
import { AdminPanel } from './components/admin.js';
import { DatabaseService } from './services/database.js';

class App {
    constructor() {
         this.translations = translations;  // ← ADD THIS LINE
    this.electionNames = electionNames;
        this.electionNames = electionNames;
        this.candidatesByElection = candidatesByElection;
        this.activeElection = 'national';
        this.voters = {};
        this.voterRecords = {};
        this.votingStartHour = 8;  // 8 AM
this.votingEndHour = 17;   // 5 PM
        this.recentVoters = [
            { name: 'Ahmed Khan', cnic: '12345-****-1', time: '10:15 AM', candidate: 'Muhammad Bilal' },
            { name: 'Fatima Ali', cnic: '12345-****-2', time: '10:22 AM', candidate: 'Ahmed Nawaz Khan' },
            { name: 'Usman Tariq', cnic: '12345-****-3', time: '10:30 AM', candidate: 'Tariq Mehmood' },
            { name: 'Ayesha Malik', cnic: '12345-****-4', time: '10:45 AM', candidate: 'Fatima Ali Zaidi' },
            { name: 'Bilal Hassan', cnic: '12345-****-5', time: '11:00 AM', candidate: 'Dr. Farooq Sattar' }
        ];
        this.isAdmin = false;
        this.currentLang = 'en';
        this.selectedCandidateId = null;
        this.capturedPhotoData = null;
        this.capturedFaceAnalysis = null;
        this.savedVoterData = {};
        this.editingCandidateId = null;
        this.activeProvince = null;

        this.blockchain = new Blockchain();
        this.cameraService = new CameraService();
        this.chartsManager = new ChartsManager();

       this.loadData();
        this.blockchain.initializeGenesisBlock();

        this.navigation = new Navigation(this);
        this.formsHandler = new FormsHandler(this);
        this.adminPanel = new AdminPanel(this);

        this.setupGlobalAccess();
        this.applyAdminUI();
        this.initializeApp();
    }

    setupGlobalAccess() { window.app = this; }

          initializeApp() {
        UIService.translatePage(translations, this.currentLang);
        this.updateElectionDisplay();
        this.updateHomeStats();
    this.chartsManager.updateCharts(this.getActiveCandidates(), this);
        this.renderChainVisual();
        this.renderFaqItems();
        this.formsHandler.resetVoteForm();
        this.autoLoadSampleData();
        
        // Language dropdown setup
        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLangDropdown();
            });
        }
        document.addEventListener('click', () => {
            const dropdownMenu = document.getElementById('langDropdownMenu');
            if (dropdownMenu) dropdownMenu.classList.remove('show');
        });
        // Real-time verification on CNIC input
const cnicInputField = document.getElementById('cnicInput');
if (cnicInputField) {
    cnicInputField.addEventListener('blur', () => {
        const cnic = UIService.getValue('cnicInput');
        if (cnic && this.voterRecords[cnic]) {
            const verification = this.verifyVoterInfoMatch();
            document.querySelectorAll('.field-alert').forEach(el => el.remove());
            document.querySelectorAll('.vote-input-error').forEach(el => {
                el.classList.remove('vote-input-error');
                el.style.border = '';
                el.style.background = '';
            });
            if (!verification.match) {
                if (verification.field) {
                    this.showFieldError(verification.field, verification.message);
                }
                document.getElementById('cnicAlert').style.display = 'flex';
                document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> ' + verification.message;
            } else {
                document.getElementById('cnicAlert').style.display = 'none';
            }
        }
    });
}
        this.updateLanguageUI();
        
        this.startCountdownClock();
        this.updateVotingStatus();
    } 

    updateVotingStatus() {    // ← SEPARATE function
        const status = this.isVotingOpen();
        const statusEl = document.getElementById('votingHoursStatus');
        if (statusEl) {
            statusEl.textContent = status.message;
            statusEl.style.color = status.open ? '#22c55e' : '#ef4444';
        }
        this.updateCountdownClock();
    
        document.addEventListener('click', () => {
            const dropdownMenu = document.getElementById('langDropdownMenu');
            if (dropdownMenu) dropdownMenu.classList.remove('show');
        });
        this.updateLanguageUI();
    }

    updateLanguageUI() {
        const langNames = { 'en': 'English', 'ur': 'اردو', 'pa': 'پنجابی', 'sd': 'سنڌي', 'ba': 'بلوچی', 'pk': 'پښتو' };
        const currentLangLabel = document.getElementById('currentLangLabel');
        if (currentLangLabel) currentLangLabel.textContent = langNames[this.currentLang] || 'English';
        document.querySelectorAll('.lang-dropdown-menu a').forEach(link => {
            link.classList.remove('active-lang');
            if (link.getAttribute('data-lang') === this.currentLang) link.classList.add('active-lang');
        });
    }

    loadData() {
        try {
            const savedBlockchain = StorageService.load(STORAGE_KEYS.BLOCKCHAIN);
            const savedCandidates = StorageService.load(STORAGE_KEYS.CANDIDATES);
            const savedVoters = StorageService.load(STORAGE_KEYS.VOTERS);
            const savedRecent = StorageService.load(STORAGE_KEYS.RECENT_VOTERS);
            const savedVoterRecords = StorageService.load(STORAGE_KEYS.VOTER_RECORDS);
            const savedActiveElection = StorageService.load(STORAGE_KEYS.ACTIVE_ELECTION);
            if (savedBlockchain) this.blockchain.restoreChain(savedBlockchain);
            if (savedCandidates) this.candidatesByElection = savedCandidates;
            if (savedVoters) this.voters = savedVoters;
            if (savedRecent) this.recentVoters = savedRecent;
            if (savedVoterRecords) this.voterRecords = savedVoterRecords;
            if (savedActiveElection) this.activeElection = savedActiveElection;
            this.isAdmin = StorageService.isAdmin();
        } catch (error) { console.error('Error loading data:', error); }
    }

    saveData() {
        StorageService.saveAllData({
            blockchain: this.blockchain.getChain(),
            candidates: this.candidatesByElection,
            voters: this.voters,
            recentVoters: this.recentVoters,
            voterRecords: this.voterRecords,
            activeElection: this.activeElection
        });
        this.syncToFirebase();
    }

    syncToFirebase() {
        for (const [cnic, record] of Object.entries(this.voterRecords)) { DatabaseService.saveVoter(record); }
        for (const type in this.candidatesByElection) {
            if (this.candidatesByElection[type]) {
                this.candidatesByElection[type].forEach(c => DatabaseService.saveCandidate(c));
            }
        }
        this.syncBlockchainToFirebase();
    }

     syncBlockchainToFirebase() {
        const db = firebase.firestore();
        this.blockchain.getChain().forEach(block => {
            db.collection('blockchain').doc(String(block.blockNumber).padStart(4, '0')).set({
                blockNumber: block.blockNumber, 
                timestamp: block.timestamp, 
                type: block.type,
                data: block.data, 
                previousHash: block.previousHash, 
                hash: block.hash,
                nonce: block.nonce || 0, 
                savedAt: new Date().toISOString()
            }).catch(err => console.log('Sync error:', err));
        });
    }
    getCurrentCandidates() { return this.candidatesByElection[this.activeElection] || []; }
    getActiveCandidates() { return this.getCurrentCandidates().filter(c => c.status === 'active'); }

    changeLanguage(lang) {
        this.currentLang = lang;
        document.body.classList.toggle('urdu', ['ur','pa','sd','ba','pk'].includes(this.currentLang));
        const langNames = { 'en': 'English', 'ur': 'اردو', 'pa': 'پنجابی', 'sd': 'سنڌي', 'ba': 'بلوچی', 'pk': 'پښتو' };
        const currentLangLabel = document.getElementById('currentLangLabel');
        if (currentLangLabel) currentLangLabel.textContent = langNames[this.currentLang] || 'English';
        document.querySelectorAll('.lang-dropdown-menu a').forEach(link => {
            link.classList.remove('active-lang');
            if (link.getAttribute('data-lang') === this.currentLang) link.classList.add('active-lang');
        });
        document.getElementById('langDropdownMenu')?.classList.remove('show');
        UIService.translatePage(translations, this.currentLang);
        this.updateElectionDisplay();
        this.renderFaqItems();
    }

    toggleLangDropdown() { document.getElementById('langDropdownMenu')?.classList.toggle('show'); }

    updateElectionDisplay() {
        const electionName = translations[this.currentLang][this.activeElection] || this.electionNames[this.activeElection];
       // UIService.updateElementText('currentElectionTag', electionName);
        UIService.updateElementText('voteElectionType', electionName);
        UIService.updateElementText('resultsElectionType', electionName);
        
        // Update hero heading based on active election
        const heroH = document.getElementById('heroH');
        if (heroH) {
            if (this.currentLang === 'ur') {
                heroH.textContent = electionName + ' انتخابات 2026';
            } else if (this.currentLang === 'pa') {
                heroH.textContent = electionName + ' چوݨ 2026';
            } else if (this.currentLang === 'sd') {
                heroH.textContent = electionName + ' چونڊ 2026';
            } else if (this.currentLang === 'ba') {
                heroH.textContent = electionName + ' انتخابات 2026';
            } else if (this.currentLang === 'pk') {
                heroH.textContent = electionName + ' انتخابات 2026';
            } else {
                heroH.textContent = electionName + ' Elections 2026';
            }
        }
        
        const electionType = document.getElementById('electionType');
        if (electionType) electionType.value = this.activeElection;
    }

    activateElection(key) { this.adminPanel.activateElection(key); }
    deactivateElection(key) { this.adminPanel.deactivateElection(key); }
    renderElectionControl() { this.adminPanel.renderElectionControl(); }


      updateHomeStats() {
        const active = this.getActiveCandidates();
        
        // Count votes ONLY for active election type
        let totalVotes = 0;
        if (this.candidatesByElection[this.activeElection]) {
            this.candidatesByElection[this.activeElection].forEach(c => { totalVotes += c.votes; });
        }
        
        // Count blocks ONLY for active election type
        let blockCount = 0;
        this.blockchain.getChain().forEach(block => {
            if (block.type === 'VOTE' && block.data?.electionType === this.activeElection) {
                blockCount++;
            }
        });
        
        UIService.updateElementText('hsCandidates', active.length);
        UIService.updateElementText('hsBlocks', blockCount);
        UIService.updateElementText('hsVotes', totalVotes);
        UIService.updateElementText('sCandidates', active.length);
        UIService.updateElementText('sBlocks', blockCount);
        UIService.updateElementText('sVotes', totalVotes);
        const registeredVoters = Object.keys(this.voterRecords).length || 1;
        const turnout = ((totalVotes / registeredVoters) * 100).toFixed(1);
        UIService.updateElementText('sTurnout', turnout + '%');
    }
       renderChainVisual() {
        const scroll = document.getElementById('chainScroll');
        if (!scroll) return;
        
        // Filter blocks for active election type
        const filteredBlocks = this.blockchain.getChain().filter(block => 
            block.type === 'VOTE' && block.data?.electionType === this.activeElection
        );
        
        // Take latest 12
        const displayBlocks = filteredBlocks.slice(-12);
        
        scroll.innerHTML = displayBlocks.map((block, i) => {
            const arrow = i > 0 ? '<span class="chain-arrow">→</span>' : '';
            return `${arrow}<div class="blk"><span class="blk-num">#${block.blockNumber}</span><span class="blk-check">✓</span></div>`;
        }).join('');
    }

    renderVoteCandidates() {
        const list = document.getElementById('candidatesVoteList');
        if (!list) return;
        const active = this.getActiveCandidates();
        if (active.length === 0) { list.innerHTML = '<div style="text-align:center;padding:20px;">No active candidates</div>'; return; }
        list.innerHTML = active.map(c => `<div class="candidate-card" id="cc-${c.id}" onclick="window.app.selectCandidate('${c.id}')"><div class="cand-avatar">${c.initials}</div><div class="cand-info"><strong>${c.name}</strong><small>${c.party}</small></div>${UIService.getSymbolHTML(c.symbol)}</div>`).join('');
        this.selectedCandidateId = null;
    }

    selectCandidate(id) {
        document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));
        const card = document.getElementById('cc-' + id);
        if (card) { card.classList.add('selected'); this.selectedCandidateId = id; }
    }

    initializeCamera() {
        const videoElement = document.getElementById('videoElement');
        const captureBtn = document.getElementById('captureBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const retryCameraBtn = document.getElementById('retryCameraBtn');
        if (!videoElement) return;
        videoElement.style.display = 'none';
        if (captureBtn) { captureBtn.style.display = 'none'; captureBtn.disabled = true; }
        if (retakeBtn) retakeBtn.style.display = 'none';
        if (retryCameraBtn) { retryCameraBtn.style.display = 'inline-block'; retryCameraBtn.disabled = false; retryCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera'; }
    }

    async retryCamera() {
        const videoElement = document.getElementById('videoElement');
        const captureBtn = document.getElementById('captureBtn');
        const retryCameraBtn = document.getElementById('retryCameraBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        if (!videoElement) return;
        this.cameraService.stopCamera();
        if (retryCameraBtn) { retryCameraBtn.disabled = true; retryCameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...'; }
        const result = await this.cameraService.startCamera();
        if (result.success) {
            this.cameraService.displayVideo(videoElement);
            videoElement.style.display = 'block';
            if (captureBtn) { captureBtn.style.display = 'inline-block'; captureBtn.disabled = false; }
            if (retryCameraBtn) retryCameraBtn.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'none';
            UIService.showToast('Camera ready!', 'success');
        } else {
            videoElement.style.display = 'none';
            if (captureBtn) captureBtn.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'none';
            if (retryCameraBtn) { retryCameraBtn.style.display = 'inline-block'; retryCameraBtn.disabled = false; retryCameraBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Retry'; }
            UIService.showToast(result.error, 'error');
        }
    }

    capturePhoto() {
        const videoElement = document.getElementById('videoElement');
        const canvasElement = document.getElementById('canvasElement');
        const captureBtn = document.getElementById('captureBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const capturedPhoto = document.getElementById('capturedPhoto');
        const photoCapturedBadge = document.getElementById('photoCapturedBadge');
        if (!videoElement || !canvasElement) return;
        const result = this.cameraService.capturePhoto(videoElement, canvasElement);
        if (result?.photoData) {
            this.capturedPhotoData = result.photoData;
            this.capturedFaceAnalysis = result.faceAnalysis;
            if (capturedPhoto) { capturedPhoto.src = result.photoData; capturedPhoto.style.display = 'block'; }
            if (captureBtn) captureBtn.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'inline-block';
            if (photoCapturedBadge) photoCapturedBadge.classList.add('show');
        }
    }

    retakePhoto() {
        const captureBtn = document.getElementById('captureBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const capturedPhoto = document.getElementById('capturedPhoto');
        const photoCapturedBadge = document.getElementById('photoCapturedBadge');
        this.capturedPhotoData = null;
        this.capturedFaceAnalysis = null;
        if (capturedPhoto) capturedPhoto.style.display = 'none';
        if (captureBtn) { captureBtn.style.display = 'inline-block'; captureBtn.disabled = false; }
        if (retakeBtn) retakeBtn.style.display = 'none';
        if (photoCapturedBadge) photoCapturedBadge.classList.remove('show');
    }
    async castVote() {
        const name = UIService.getValue('voterName');
        const father = UIService.getValue('voterFather');
         const votingStatus = this.isVotingOpen();
        if (!votingStatus.open) {
            UIService.showToast(votingStatus.message, 'error');
            return;
        }
        // Alphabetic validation
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            UIService.showToast('❌ Name must contain only letters!', 'error');
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(father.trim())) {
            UIService.showToast('❌ Father name must contain only letters!', 'error');
            return;
        }
        
        if (!this.validateMaleName(father)) { UIService.showToast('❌ Father name must be a male name!', 'error'); return; }
        const cnic = UIService.getValue('cnicInput');
        const age = UIService.getValue('voterAge');
        const gender = UIService.getSelectValue('voterGender');
        const phone = UIService.getValue('voterPhone');
        const address = UIService.getValue('voterAddress');
        const province = UIService.getSelectValue('voteProvince');
        const district = UIService.getSelectValue('voteDistrict');
        const constituency = UIService.getSelectValue('voteConstituency');
        const validation = Validators.validateVoterForm({ name, father, cnic, age, gender, phone, address });
        if (!validation.valid) { UIService.showToast(validation.errors[0], 'error'); return; }
        if (parseInt(age) < 18) { UIService.showToast('❌ You must be 18 or older to vote!', 'error'); return; }
        if (!this.capturedPhotoData) { UIService.showToast('Please capture your photo', 'error'); return; }
        if (!this.capturedFaceAnalysis?.faceDetected) { UIService.showToast('Face not detected!', 'error'); return; }
        if (!this.selectedCandidateId) { UIService.showToast('Select a candidate', 'error'); return; }
        
        // Check if voter is registered
        if (!this.voterRecords[cnic]) {
            document.getElementById('cnicAlert').style.display = 'flex';
            document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> This CNIC is not registered. Please register first.';
            UIService.showToast('❌ CNIC not registered! Please register first.', 'error');
            return;
        }

        // Check if voter is APPROVED (not pending, not rejected)
        if (!this.voterRecords[cnic].isVerified) {
            if (this.voterRecords[cnic].isRejected) {
                document.getElementById('cnicAlert').style.display = 'flex';
                document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> Your registration has been rejected by admin.';
                UIService.showToast('❌ Rejected by admin! Cannot vote.', 'error');
            } else {
                document.getElementById('cnicAlert').style.display = 'flex';
                document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-clock"></i> Your registration is pending admin approval.';
                UIService.showToast('⏳ Pending admin approval! Please wait.', 'error');
            }
            return;
        }

        // Check if name matches registration
        const registeredVoter = this.voterRecords[cnic];
        if (registeredVoter.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
            document.getElementById('cnicAlert').style.display = 'flex';
            document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> Name does not match registered voter!';
            UIService.showToast('❌ Name does not match registration!', 'error');
            return;
        }
        if (registeredVoter.fatherName && registeredVoter.fatherName.toLowerCase().trim() !== father.toLowerCase().trim()) {
            document.getElementById('cnicAlert').style.display = 'flex';
            document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> Father name does not match registered voter!';
            UIService.showToast('❌ Father name does not match registration!', 'error');
            return;
        }

        // Check if already voted
        if (this.voters[cnic]) { 
            document.getElementById('cnicAlert').style.display = 'flex'; 
            document.getElementById('cnicAlert').innerHTML = '<i class="fas fa-circle-exclamation"></i> This CNIC has already voted.';
            UIService.showToast('CNIC already voted!', 'error'); 
            return; 
        }
        
        const candidate = this.getCurrentCandidates().find(c => c.id === this.selectedCandidateId);
        if (!candidate) { UIService.showToast('Candidate not found', 'error'); return; }
        const txId = '0x' + Date.now().toString(16).slice(-8) + Math.random().toString(16).substring(2, 10) + cnic.replace(/\D/g, '').slice(-4);
        this.voters[cnic] = true;
        this.voterRecords[cnic] = { name, fatherName: father, cnic, age, gender, phone, address, province, district, constituency, photoData: this.capturedPhotoData, faceAnalysis: this.capturedFaceAnalysis, votedFor: candidate.name, votedForParty: candidate.party, electionType: this.activeElection, txId, isRecent: true, timestamp: new Date().toISOString() };
        candidate.votes++;
        try {
            await this.blockchain.addBlock({ candidateName: candidate.name, candidateParty: candidate.party, voterCNIC: UIService.formatCNIC(cnic), txId, electionType: this.activeElection, faceVerified: this.capturedFaceAnalysis?.faceDetected || false, timestamp: new Date().toISOString() });
            this.recentVoters.unshift({ name, cnic: UIService.formatCNIC(cnic), time: new Date().toLocaleTimeString(), candidate: candidate.name, txId });
            if (this.recentVoters.length > 50) this.recentVoters = this.recentVoters.slice(0, 50);
            this.saveData();
            this.syncBlockchainToFirebase();
            DatabaseService.saveVote({ txId, voterCNIC: UIService.formatCNIC(cnic), candidateName: candidate.name, candidateParty: candidate.party, electionType: this.activeElection, faceVerified: this.capturedFaceAnalysis?.faceDetected || false, timestamp: new Date().toISOString() });
            if (this.capturedPhotoData) DatabaseService.saveVoterPhoto(cnic, this.capturedPhotoData);
            document.getElementById('popupTxId').textContent = txId;
            setTimeout(() => { navigator.clipboard.writeText(txId).catch(() => {}); }, 500);
            const txHistory = JSON.parse(localStorage.getItem('ecp_tx_history') || '[]');
            txHistory.unshift({ txId, candidate: candidate.name, date: new Date().toLocaleString(), electionType: this.activeElection });
            localStorage.setItem('ecp_tx_history', JSON.stringify(txHistory.slice(0, 20)));
            firebase.firestore().collection('tx_history').doc(txId).set({ txId, voterCNIC: UIService.formatCNIC(cnic), candidateName: candidate.name, candidateParty: candidate.party, electionType: this.activeElection, faceVerified: this.capturedFaceAnalysis?.faceDetected || false, timestamp: new Date().toISOString(), dateFormatted: new Date().toLocaleString() }).catch(err => console.log(err));
            document.getElementById('voteSuccessOverlay').classList.add('show');
            this.formsHandler.resetVoteForm();
            this.updateHomeStats();
            this.chartsManager.updateCharts(this.getActiveCandidates(), this);
            this.renderChainVisual();
        } catch (error) { UIService.showToast('Error: ' + error.message, 'error'); }
    }
    closeVoteModal() { this.adminPanel.closeVoteModal(); }
    showLogin() { this.adminPanel.showLogin(); }
    closeLogin() { this.adminPanel.closeLogin(); }
    applyAdminUI() { this.adminPanel.applyAdminUI(); }
    updateAdminDashboard() { this.adminPanel.updateDashboard(); }
    openAddForm() { this.formsHandler.openCandidateForm(); }
    closeForm() { this.formsHandler.closeCandidateForm(); }
    saveCandidate() { this.formsHandler.saveCandidate(); }

    renderManageTable() {
        const tbody = document.getElementById('candidatesTblBody');
        if (!tbody) return;
        const candidates = this.getCurrentCandidates();
        if (candidates.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No candidates.</td></tr>'; return; }
        tbody.innerHTML = candidates.map(c => `<tr><td><div class="mini-avatar">${c.initials}</div></td><td>${c.name}</td><td>${c.party}</td><td style="text-align:center;">${UIService.getSymbolHTML(c.symbol)}</td><td><span class="status-pill ${c.status==='active'?'status-active':'status-inactive'}">${c.status}</span></td><td>${c.votes}</td><td><div class="tbl-actions"><button class="btn-sm-tbl btn-edit-tbl" onclick="window.app.formsHandler.openCandidateForm('${c.id}')"><i class="fas fa-pen"></i></button><button class="btn-sm-tbl btn-del-tbl" onclick="window.app.formsHandler.removeCandidate('${c.id}')"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
    }

    renderLedger() {
        const ledgerBody = document.getElementById('ledgerBody');
        if (!ledgerBody) return;
        ledgerBody.innerHTML = this.blockchain.getChainForDisplay().map(block => `<div class="ledger-block ${block.blockNumber===0?'genesis':'regular'}"><strong>Block #${block.blockNumber}</strong><br>Hash: ${block.hash||'N/A'}<br>TX: ${block.data?.txId||'N/A'}<br>Nonce: ${block.nonce||0}</div>`).join('');
    }

      refreshResults() {
        const active = this.getActiveCandidates().sort((a,b) => b.votes - a.votes);
        const total = active.reduce((s,c) => s + c.votes, 0) || 1;
        const container = document.getElementById('resultsBarsContainer');
        if (!container) return;
        
        // Find recent votes (last 30 seconds)
        const now = new Date();
        const recentThreshold = new Date(now - 30000); // 30 seconds ago
        
        container.innerHTML = active.map((c,i) => { 
            const pct = ((c.votes/total)*100).toFixed(1);
            let rc = 'rank-other', m = '';
            if(i===0){ rc='rank-1'; m='🥇'; }
            else if(i===1){ rc='rank-2'; m='🥈'; }
            else if(i===2){ rc='rank-3'; m='🥉'; }
            
            // Check if this candidate has recent votes
            let hasRecent = false;
            for (const [cnic, record] of Object.entries(this.voterRecords)) {
                if (record.votedFor === c.name && record.isRecent) {
                    const voteTime = new Date(record.timestamp);
                    if (voteTime > recentThreshold) {
                        hasRecent = true;
                        break;
                    }
                }
            }
            
            return `
                <div class="result-row ${hasRecent ? 'recent-vote-row' : ''}" style="${hasRecent ? 'background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:10px;animation:highlightPulse 1s ease-in-out 3;' : ''}">
                    <div class="result-row-top">
                        <span class="cand-name-result">
                            <span class="rank-badge ${rc}">${m||i+1}</span>
                            ${c.name}
                            ${hasRecent ? '<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;margin-left:8px;">🆕 NEW VOTE!</span>' : ''}
                        </span>
                        <span class="vote-count" style="${hasRecent ? 'color:#f59e0b;font-weight:bold;font-size:1.1rem;' : ''}">${c.votes} votes · ${pct}%</span>
                    </div>
                    <div class="result-bar-bg">
                        <div class="result-bar-fill" style="width:${pct}%;background:${hasRecent ? 'linear-gradient(90deg, #f59e0b, #0a3d2e)' : '#0a3d2e'}"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Clear recent flags after 30 seconds
        setTimeout(() => {
            for (const [cnic, record] of Object.entries(this.voterRecords)) {
                if (record.isRecent) {
                    const voteTime = new Date(record.timestamp);
                    if (voteTime < recentThreshold) {
                        record.isRecent = false;
                    }
                }
            }
            this.saveData();
        }, 30000);
    }

    verifyVote() {
        const txId = UIService.getValue('verifyInput');
        const resultDiv = document.getElementById('verifyResult');
        if (!resultDiv) return;
        resultDiv.style.display = 'block';
        if (!txId) { resultDiv.className='verify-result verify-warn'; resultDiv.innerHTML='Enter TX ID'; return; }
        let found = null;
        for (const [c, r] of Object.entries(this.voterRecords)) { if (r.txId===txId) { found=r; break; } }
        const block = this.blockchain.findTransaction(txId);
        if (found||block) { const i=found||block.data; resultDiv.className='verify-result verify-success'; resultDiv.innerHTML=`✅ Verified!<br>TX: ${txId}<br>Candidate: ${i.votedFor||i.candidateName}`; }
        else { resultDiv.className='verify-result verify-warn'; resultDiv.innerHTML='Not found'; }
    }

    renderFaqItems() {
        const container = document.getElementById('faqContainer');
        if (!container) return;
        container.innerHTML = faqData.map(faq => { const q=translations[this.currentLang][faq.qKey]||faq.qKey; const a=translations[this.currentLang][faq.aKey]||faq.aKey; return `<div class="faq-item"><div class="faq-question" onclick="this.nextElementSibling.classList.toggle('open');this.querySelector('i').classList.toggle('fa-chevron-down');this.querySelector('i').classList.toggle('fa-chevron-up')">${q}<i class="fas fa-chevron-down"></i></div><div class="faq-answer">${a}</div></div>` }).join('');
    }

    saveVoterData() { this.savedVoterData = this.formsHandler.saveVoterFormData(); }
    restoreVoterData() { this.formsHandler.restoreVoterFormData(this.savedVoterData); }

    resetRegistrationForm() {
        ['regName','regFather','regCnic','regAge','regGender','regEmail','regPhone','regAddress'].forEach(id => UIService.setValue(id,''));
        UIService.setValue('regProvince',''); UIService.setValue('regDistrict',''); UIService.setValue('regConstituency','');
        document.getElementById('registerStep1').style.display='block';
        document.getElementById('registerStep2').style.display='none';
        document.getElementById('registerStep3').style.display='none';
        this.registrationData=null; this.generatedOTP=null; this.otpTimerInterval=null;
    }
showFieldError(fieldId, message) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.classList.add('vote-input-error');
        fieldElement.style.border = '2px solid #ef4444';
        fieldElement.style.background = '#fef2f2';
        
        const existing = fieldElement.parentNode.querySelector('.field-alert');
        if (existing) existing.remove();
        
        const alertSpan = document.createElement('span');
        alertSpan.className = 'field-alert';
        alertSpan.style.cssText = 'display:block;color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:500;';
        alertSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
        fieldElement.parentNode.appendChild(alertSpan);
        
        setTimeout(() => {
            fieldElement.style.border = '';
            fieldElement.style.background = '';
            fieldElement.classList.remove('vote-input-error');
            const alert = fieldElement.parentNode.querySelector('.field-alert');
            if (alert) alert.remove();
        }, 5000);
    }
}
   registerVoter() {
    const name = UIService.getValue('regName'), father = UIService.getValue('regFather'), cnic = UIService.getValue('regCnic');
    
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        this.showFieldError('regName', 'Name must contain only letters!');
        return;
    }
    if (!/^[a-zA-Z\s]+$/.test(father.trim())) {
        this.showFieldError('regFather', 'Father name must contain only letters!');
        return;
    }
    
    const age = parseInt(UIService.getValue('regAge')), gender = UIService.getSelectValue('regGender');
    const email = UIService.getValue('regEmail'), phone = UIService.getValue('regPhone');
    const address = UIService.getValue('regAddress');
    
    if (!Validators.validateEmail(email)) {
        this.showFieldError('regEmail', 'Email must be in format: yourname@gmail.com');
        return;
    }
    if (!Validators.validatePhone(phone)) {
        this.showFieldError('regPhone', 'Phone must start with +92 or 03 and be 11 digits');
        return;
    }
    
    const province = UIService.getSelectValue('regProvince'), district = UIService.getSelectValue('regDistrict'), constituency = UIService.getSelectValue('regConstituency');
    if (!name || !father || !cnic || !age || !gender || !email || !phone || !address || !province || !district || !constituency) { 
        UIService.showToast('Fill all fields', 'error'); return; 
    }
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { 
        this.showFieldError('regCnic', 'Invalid CNIC format! Use: 12345-1234567-1'); return; 
    }
    if (age < 18) { 
        this.showFieldError('regAge', 'You must be 18 or older to register!'); return; 
    }
    if (age > 120) { 
        this.showFieldError('regAge', 'Invalid age!'); return; 
    }
    if (this.voterRecords[cnic]) { 
        this.showFieldError('regCnic', 'This CNIC is already registered!'); return; 
    }
    if (!this.validateMaleName(father)) { 
        this.showFieldError('regFather', 'Father name must be a male name!'); return; 
    }
    
    this.registrationData = { name, fatherName: father, cnic, age, gender, email, phone, address, province, district, constituency };
    this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('otpPopupCode').textContent = this.generatedOTP;
    document.getElementById('otpPopup').style.display = 'block';
    document.getElementById('registerStep1').style.display = 'none';
    document.getElementById('registerStep2').style.display = 'block';
    this.startOTPTimer();
    UIService.showToast('OTP sent! Check the side popup.');
}
    startOTPTimer() {
        let t=60;
        const el=document.getElementById('otpTimer'), popupTimer=document.getElementById('otpPopupTimer'), popupResend=document.getElementById('otpPopupResend');
        if(this.otpTimerInterval)clearInterval(this.otpTimerInterval);
        this.otpTimerInterval=setInterval(()=>{
            t--;
            if(el)el.innerHTML='Time: <strong>'+t+'</strong>s';
            if(popupTimer)popupTimer.innerHTML='⏱️ <strong>'+t+'</strong>s remaining';
            if(t<=30 && popupTimer) popupTimer.style.color='#f59e0b';
            if(t<=10 && popupTimer) popupTimer.style.color='#ef4444';
            if(t<=0){clearInterval(this.otpTimerInterval); if(el)el.innerHTML='<span style="color:red">Expired</span>'; if(popupTimer)popupTimer.innerHTML='<span style="color:red">❌ Expired</span>'; if(document.getElementById('resendOtpBtn'))document.getElementById('resendOtpBtn').style.display='inline-block'; if(popupResend)popupResend.style.display='inline-block';}
        },1000);
    }

    resendOTP() {
        this.generatedOTP=Math.floor(100000+Math.random()*900000).toString();
        document.getElementById('otpPopupCode').textContent = this.generatedOTP;
        document.getElementById('otpPopup').style.display = 'block';
        document.getElementById('otpPopupResend').style.display = 'none';
        document.getElementById('otpPopupTimer').style.color = '#666';
        this.startOTPTimer();
        UIService.showToast('New OTP sent!');
    }

    verifyOTP() {
        let otp=''; for(let i=1;i<=6;i++) otp+=UIService.getValue('otpInput'+i);
        if(otp!==this.generatedOTP) { UIService.showToast('Invalid OTP','error'); return; }
        if(this.otpTimerInterval)clearInterval(this.otpTimerInterval);
        document.getElementById('otpPopup').style.display = 'none';
        const vid='VOTER-'+Date.now().toString().slice(-6);
        this.voterRecords[this.registrationData.cnic] = { 
    ...this.registrationData, 
    voterId: vid, 
    isRegistered: true, 
    isOTPVerified: true, 
    isVerified: false,      // ← NOT approved yet
    isRejected: false,      // ← NOT rejected
    hasVoted: false 
};
        this.saveData();
        document.getElementById('registerStep2').style.display='none';
        document.getElementById('registerStep3').style.display='block';
        // Update registration success message with pending notice
        const step3 = document.getElementById('registerStep3');
        if (step3) {
            step3.innerHTML = `
                <div class="camera-section">
                    <div style="font-size:4rem;">📝</div>
                    <h4 style="color:#14532d;" data-key="registrationSuccess">Registration Submitted!</h4>
                    <p>Your Voter ID: <strong>${vid}</strong></p>
                    <div class="tx-box">
                        <p style="font-size:0.9rem;color:#f59e0b;"><strong>⏳ Pending Admin Approval</strong></p>
                        <p style="font-size:0.8rem;color:#666;">Your registration has been submitted. An administrator will review and approve your account before you can vote.</p>
                    </div>
                </div>
            `;
        }
        UIService.updateElementText('voterIdDisplay',vid);
    }

         autoLoadSampleData() {
    if (Object.keys(this.voterRecords).length > 0) { console.log('Data exists, skipping.'); return; }
    console.log('Auto-loading sample data...');
    
    const sampleVoters = [
        { cnic: '12345-1234567-1', name: 'Ahmed Khan', fatherName: 'Muhammad Khan', age: 25, gender: 'male', phone: '03001234567', email: 'ahmed@email.com', address: 'F-7, Islamabad', province: 'ict', district: 'Islamabad', constituency: 'NA-1 Islamabad' },
        { cnic: '12345-1234567-2', name: 'Fatima Ali', fatherName: 'Ali Hassan', age: 30, gender: 'female', phone: '03011234567', email: 'fatima@email.com', address: 'Gulberg, Lahore', province: 'punjab', district: 'Lahore', constituency: 'NA-2 Lahore' },
        { cnic: '12345-1234567-3', name: 'Usman Tariq', fatherName: 'Tariq Mehmood', age: 28, gender: 'male', phone: '03021234567', email: 'usman@email.com', address: 'North Nazimabad, Karachi', province: 'sindh', district: 'Karachi', constituency: 'NA-3 Karachi' },
        { cnic: '12345-1234567-4', name: 'Ayesha Malik', fatherName: 'Malik Shahid', age: 22, gender: 'female', phone: '03031234567', email: 'ayesha@email.com', address: 'University Town, Peshawar', province: 'kpk', district: 'Peshawar', constituency: 'NA-4 Peshawar' },
        { cnic: '12345-1234567-5', name: 'Bilal Hassan', fatherName: 'Hassan Raza', age: 35, gender: 'male', phone: '03041234567', email: 'bilal@email.com', address: 'Jinnah Road, Quetta', province: 'balochistan', district: 'Quetta', constituency: 'NA-5 Quetta' }
    ];
    sampleVoters.forEach((v, i) => { 
        this.voterRecords[v.cnic] = { ...v, voterId: 'VOTER-'+(i+1).toString().padStart(6,'0'), isRegistered:true, isOTPVerified:true, hasVoted:false, registrationDate:new Date().toISOString() }; 
    });
    
    this.blockchain.chain = [];
    this.blockchain.initializeGenesisBlock();
    
    // Add blocks directly (NOT async)
    const blocksToAdd = [
        { candidateName: 'Muhammad Bilal', candidateParty: 'PTI', voterCNIC: '12345-****-1', txId: '0xNAT01', electionType: 'national', faceVerified: true },
        { candidateName: 'Muhammad Bilal', candidateParty: 'PTI', voterCNIC: '12345-****-2', txId: '0xNAT02', electionType: 'national', faceVerified: true },
        { candidateName: 'Ahmed Nawaz Khan', candidateParty: 'PPP', voterCNIC: '12345-****-3', txId: '0xNAT03', electionType: 'national', faceVerified: true },
        { candidateName: 'Ahmed Nawaz Khan', candidateParty: 'PPP', voterCNIC: '12345-****-4', txId: '0xNAT04', electionType: 'national', faceVerified: true },
        { candidateName: 'Fatima Ali Zaidi', candidateParty: 'PML-N', voterCNIC: '12345-****-5', txId: '0xNAT05', electionType: 'national', faceVerified: true },
        { candidateName: 'Fatima Ali Zaidi', candidateParty: 'PML-N', voterCNIC: '12345-****-6', txId: '0xNAT06', electionType: 'national', faceVerified: true },
    ];
    
    blocksToAdd.forEach((data, i) => {
        this.blockchain.chain.push({
            blockNumber: this.blockchain.getChain().length,
            timestamp: new Date().toISOString(), type: 'VOTE', data: data,
            previousHash: this.blockchain.getLatestBlock().hash,
            hash: '0000block' + i + 'hash', nonce: 1000 + i
        });
    });
    
    const fakeVotes = { national: { 'Muhammad Bilal': 2, 'Ahmed Nawaz Khan': 2, 'Fatima Ali Zaidi': 2, 'Ayesha Malik': 0 } };
    if (this.candidatesByElection['national']) {
        this.candidatesByElection['national'].forEach(c => { c.votes = fakeVotes['national'][c.name] || 0; });
    }
    
    this.saveData();
    this.updateHomeStats();
    this.renderChainVisual();
    console.log('✅ Sample data loaded! 6 blocks, 6 votes');
}
  generateForm45() {
    const constituency = UIService.getValue('form45Constituency');
    const container = document.getElementById('form45Container');
    const content = document.getElementById('form45Content');
    if (!constituency || !container || !content) return;
    container.style.display = 'block';
    
    // Count votes from voterRecords
    const candidateVotes = {};
    let totalVotes = 0;
    let maleVoters = 0, femaleVoters = 0;
    let maleVotes = 0, femaleVotes = 0;
    
    for (const [cnic, record] of Object.entries(this.voterRecords)) {
        if (record.constituency === constituency && record.electionType === this.activeElection) {
            if (record.gender === 'male') maleVoters++;
            else if (record.gender === 'female') femaleVoters++;
            
            if (record.votedFor) {
                if (!candidateVotes[record.votedFor]) {
                    candidateVotes[record.votedFor] = { 
                        name: record.votedFor, 
                        party: record.votedForParty || 'Independent', 
                        votes: 0 
                    };
                }
                candidateVotes[record.votedFor].votes++;
                totalVotes++;
                
                if (record.gender === 'male') maleVotes++;
                else if (record.gender === 'female') femaleVotes++;
            }
        }
    }
    
    if (totalVotes === 0) {
        this.getCurrentCandidates().forEach(c => {
            if (!candidateVotes[c.name]) {
                candidateVotes[c.name] = { name: c.name, party: c.party, votes: 0 };
            }
        });
        for (const [cnic, record] of Object.entries(this.voterRecords)) {
            if (record.constituency === constituency && record.electionType === this.activeElection) {
                if (record.gender === 'male') maleVoters++;
                else if (record.gender === 'female') femaleVoters++;
            }
        }
    }
    
    const candidates = Object.values(candidateVotes).sort((a, b) => b.votes - a.votes);
    const validVotes = candidates.reduce((s, c) => s + c.votes, 0) || 1;
    const registeredVoters = maleVoters + femaleVoters || 1;
    const pollingStation = constituency + ' - Main Polling Station';
    const rejectedVotes = 0;
    const winner = candidates[0] || { name: 'N/A', party: 'N/A', votes: 0 };
    const now = new Date();
    const t = (key) => translations[this.currentLang]?.[key] || key;
    
    content.innerHTML = `
    <div style="max-width:800px;margin:0 auto;background:white;padding:30px;border:2px solid #000;font-family:'Courier New',monospace;font-size:13px;">
        
        <!-- HEADER -->
        <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px;">
            <h3 style="margin:0;font-size:16px;font-weight:bold;">ELECTION COMMISSION OF PAKISTAN</h3>
            <h2 style="margin:5px 0;font-size:18px;font-weight:bold;text-decoration:underline;">FORM-45</h2>
            <p style="margin:3px 0;font-weight:bold;font-size:14px;">RESULT OF THE COUNT</p>
            <p style="margin:2px 0;font-size:11px;">[See Rule 49(5) of the Elections Rules, 2017]</p>
        </div>
        
        <!-- CONSTITUENCY INFO -->
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span><strong>Constituency:</strong> ${constituency}</span>
            <span><strong>Election:</strong> ${this.activeElection.toUpperCase()}</span>
        </div>
        <div style="margin-bottom:10px;">
            <span><strong>Polling Station:</strong> ${pollingStation}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span><strong>Registered Voters:</strong> ${registeredVoters.toLocaleString()}</span>
            <span><strong>Votes Polled:</strong> ${validVotes.toLocaleString()}</span>
            <span><strong>Turnout:</strong> ${((validVotes/registeredVoters)*100).toFixed(1)}%</span>
        </div>
        
        <!-- GENDER BREAKDOWN -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px;border:1px solid #000;">
            <tr style="background:#ddd;">
                <th style="border:1px solid #000;padding:5px;">Category</th>
                <th style="border:1px solid #000;padding:5px;">Male</th>
                <th style="border:1px solid #000;padding:5px;">Female</th>
                <th style="border:1px solid #000;padding:5px;">Total</th>
            </tr>
            <tr>
                <td style="border:1px solid #000;padding:5px;"><strong>Registered Voters</strong></td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${maleVoters.toLocaleString()}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${femaleVoters.toLocaleString()}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;font-weight:bold;">${registeredVoters.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;padding:5px;"><strong>Votes Polled</strong></td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${maleVotes.toLocaleString()}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${femaleVotes.toLocaleString()}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;font-weight:bold;">${validVotes.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;padding:5px;"><strong>Turnout %</strong></td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${maleVoters > 0 ? ((maleVotes/maleVoters)*100).toFixed(1) : 0}%</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${femaleVoters > 0 ? ((femaleVotes/femaleVoters)*100).toFixed(1) : 0}%</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;font-weight:bold;">${((validVotes/registeredVoters)*100).toFixed(1)}%</td>
            </tr>
        </table>
        
        <!-- CANDIDATE RESULTS -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px;border:1px solid #000;">
            <tr style="background:#ddd;">
                <th style="border:1px solid #000;padding:5px;width:40px;">S.No</th>
                <th style="border:1px solid #000;padding:5px;">Candidate Name</th>
                <th style="border:1px solid #000;padding:5px;">Party Affiliation</th>
                <th style="border:1px solid #000;padding:5px;width:80px;">Votes</th>
                <th style="border:1px solid #000;padding:5px;width:70px;">%</th>
            </tr>
            ${candidates.map((c, i) => `
                <tr style="${i === 0 ? 'background:#e8f5e9;' : ''}">
                    <td style="border:1px solid #000;padding:5px;text-align:center;">${i + 1}</td>
                    <td style="border:1px solid #000;padding:5px;">${c.name}${i === 0 ? ' (Winner)' : ''}</td>
                    <td style="border:1px solid #000;padding:5px;">${c.party}</td>
                    <td style="border:1px solid #000;padding:5px;text-align:center;">${c.votes.toLocaleString()}</td>
                    <td style="border:1px solid #000;padding:5px;text-align:center;">${((c.votes / validVotes) * 100).toFixed(1)}%</td>
                </tr>
            `).join('')}
            <tr style="background:#ddd;font-weight:bold;">
                <td style="border:1px solid #000;padding:5px;text-align:center;" colspan="3">TOTAL VALID VOTES</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${validVotes.toLocaleString()}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">100%</td>
            </tr>
            <tr style="background:#ddd;">
                <td style="border:1px solid #000;padding:5px;text-align:center;" colspan="3">REJECTED VOTES</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">${rejectedVotes}</td>
                <td style="border:1px solid #000;padding:5px;text-align:center;">-</td>
            </tr>
        </table>
        
        <!-- SIGNATURES -->
        <div style="display:flex;justify-content:space-between;margin-top:30px;">
            <div style="width:45%;">
                <p style="margin-bottom:5px;"><strong>Date:</strong> ${now.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin-bottom:5px;"><strong>Time:</strong> ${now.toLocaleTimeString('en-PK')}</p>
                <p style="margin-bottom:40px;"><strong>Presiding Officer:</strong></p>
                <p style="margin-top:30px;">_________________________</p>
                <p style="margin:2px 0;font-size:11px;">Signature & Stamp</p>
            </div>
            <div style="width:45%;text-align:right;">
                <p style="margin-bottom:40px;"><strong>Returning Officer:</strong></p>
                <p style="margin-top:30px;">_________________________</p>
                <p style="margin:2px 0;font-size:11px;">Signature & Stamp</p>
                <p style="margin-top:5px;">${constituency}</p>
            </div>
        </div>
        
        <!-- WINNER DECLARATION -->
        <div style="text-align:center;margin-top:20px;padding:15px;border:2px solid #000;background:#f5f5f0;">
            <p style="font-weight:bold;font-size:14px;margin:0;">OFFICIAL RESULT</p>
            <p style="font-size:16px;margin:8px 0;"><strong>🏆 WINNER: ${winner.name}</strong></p>
            <p style="margin:3px 0;">Party: <strong>${winner.party}</strong></p>
            <p style="margin:3px 0;">Votes Secured: <strong>${winner.votes.toLocaleString()} (${((winner.votes / validVotes) * 100).toFixed(1)}%)</strong></p>
        </div>
        
        <!-- FOOTER -->
        <div style="text-align:center;margin-top:15px;font-size:10px;color:#666;">
            <p>This Form-45 is prepared under Section 13 of the Elections Act, 2017.</p>
            <p>Copies provided to: Returning Officer, Polling Agents, and ECP Record.</p>
        </div>
    </div>
    `;
    
    firebase.firestore().collection('form45').doc(constituency).set({ 
        formId: 'F45-' + constituency, constituency, pollingStation,
        electionType: this.activeElection, candidates, totalVotes: validVotes,
        maleVoters, femaleVoters, maleVotes, femaleVotes, registeredVoters,
        rejectedVotes, winner: winner.name, winnerParty: winner.party, 
        winnerVotes: winner.votes,
        winnerPercentage: ((winner.votes / validVotes) * 100).toFixed(1),
        generatedAt: new Date().toISOString() 
    }).catch(err => console.log(err));
}
 
     

    printForm45() {
        const content = document.getElementById('form45Content');
        const constituency = UIService.getValue('form45Constituency');
        if (!content || !constituency) { UIService.showToast('Select Province, District & Constituency first', 'error'); return; }
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>Form-45 - ${constituency}</title><style>@media print{body{margin:0;padding:15px}@page{size:A4;margin:8mm}}body{font-family:Arial,sans-serif;padding:20px}.no-print{background:#0a3d2e;color:white;padding:12px 25px;border:none;border-radius:5px;cursor:pointer;margin:5px;font-size:14px}@media print{.no-print{display:none}}</style></head><body><div class="no-print" style="text-align:center;margin-bottom:20px;"><button onclick="window.print()" style="background:#0a3d2e;color:white;padding:12px 30px;border:none;border-radius:5px;cursor:pointer;font-size:16px;margin-right:10px;">🖨️ Print Now</button><button onclick="window.close()" style="background:#c0392b;color:white;padding:12px 30px;border:none;border-radius:5px;cursor:pointer;font-size:16px;">❌ Close</button></div><div class="no-print" style="background:#f0fdf4;padding:15px;border-radius:8px;margin-bottom:20px;"><p><strong>📋 Document Info:</strong> Constituency: <strong>${constituency}</strong> | Generated: <strong>${new Date().toLocaleString()}</strong></p></div>${content.innerHTML}</body></html>`);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }

    submitComplaint() {
        const name=UIService.getValue('compName'), cnic=UIService.getValue('compCnic'), phone=UIService.getValue('compPhone'), type=UIService.getSelectValue('compType'), desc=UIService.getValue('compDesc');
        if(!name||!cnic||!phone||!type||!desc) { UIService.showToast('Fill all fields','error'); return; }
        const complaintId='COMP-'+Date.now().toString().slice(-8);
        const complaint={id:complaintId,name,cnic,phone,type,desc,status:'pending',filedDate:new Date().toISOString(),resolution:'',resolvedDate:null};
        localStorage.setItem('ecp_complaints', JSON.stringify([...JSON.parse(localStorage.getItem('ecp_complaints')||'[]'), complaint]));
        firebase.firestore().collection('complaints').doc(complaintId).set(complaint).catch(err=>console.log(err));
        document.getElementById('complaintSuccess').style.display='block';
        UIService.updateElementText('complaintIdDisplay',complaintId);
        ['compName','compCnic','compPhone','compType','compDesc'].forEach(id=>UIService.setValue(id,''));
        UIService.showToast('Complaint filed!','success');
    }

    trackComplaint() {
        const complaintId=UIService.getValue('trackComplaintId'), trackResult=document.getElementById('trackResult');
        if(!complaintId||!trackResult) return;
        const complaint=JSON.parse(localStorage.getItem('ecp_complaints')||'[]').find(c=>c.id===complaintId);
        trackResult.style.display='block';
        if(complaint){ const sc=complaint.status==='resolved'?'#22c55e':complaint.status==='pending'?'#f59e0b':'#ef4444'; trackResult.innerHTML=`<div style="background:white;padding:15px;border-radius:8px;"><p><strong>ID:</strong> ${complaint.id}</p><p><strong>Status:</strong> <span style="color:${sc};font-weight:bold;">${complaint.status.toUpperCase()}</span></p>${complaint.resolution?`<p><strong>Resolution:</strong> ${complaint.resolution}</p>`:''}</div>`; }
        else { trackResult.innerHTML='<p style="color:red;">❌ Not found</p>'; }
    }

    copyTxId() {
        const txId=document.getElementById('popupTxId').textContent;
        if(txId&&txId!=='0x0000...0000'){ navigator.clipboard.writeText(txId).then(()=>{document.getElementById('copiedMsg').hidden=false;}).catch(()=>{const ta=document.createElement('textarea');ta.value=txId;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);document.getElementById('copiedMsg').hidden=false;}); }
    }

    renderVoterVerification() {
        const tbody=document.getElementById('voterVerificationTable');
        if(!tbody)return;
        const voters=Object.values(this.voterRecords);
        if(voters.length===0){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:20px;">No voters found.</td></tr>';return;}
        tbody.innerHTML=voters.map(v=>{const s=v.isVerified?'verified':(v.isRejected?'rejected':'pending'),sc=s==='verified'?'#22c55e':(s==='rejected'?'#ef4444':'#f59e0b'),ac=v.age<18?'#ef4444':'#22c55e';return`<tr><td><strong>${v.cnic||'N/A'}</strong></td><td>${v.name||'N/A'}</td><td>${v.fatherName||'N/A'}</td><td style="color:${ac};font-weight:bold;">${v.age||'N/A'}</td><td>${v.gender||'N/A'}</td><td>${v.constituency||'N/A'}</td><td>${v.province||'N/A'}</td><td><span style="background:${sc}20;color:${sc};padding:4px 10px;border-radius:12px;font-weight:bold;">${s.toUpperCase()}</span></td><td><div class="tbl-actions">${s!=='verified'?`<button class="btn-sm-tbl btn-edit-tbl" onclick="window.app.verifyVoter('${v.cnic}')">✅ Approve</button>`:''}${s!=='rejected'?`<button class="btn-sm-tbl btn-del-tbl" onclick="window.app.rejectVoter('${v.cnic}')">❌ Reject</button>`:''}<button class="btn-sm-tbl" style="background:#e0e7ff;color:#3730a3;" onclick="window.app.viewVoterDetails('${v.cnic}')">👁️</button></div></td></tr>`}).join('');}
    
    verifyVoter(cnic){if(this.voterRecords[cnic]){this.voterRecords[cnic].isVerified=true;this.voterRecords[cnic].isRejected=false;this.saveData();this.renderVoterVerification();firebase.firestore().collection('voters').doc(cnic).update({isVerified:true,isRejected:false});UIService.showToast('✅ Approved: '+cnic,'success');}}
    rejectVoter(cnic){if(confirm('Reject '+cnic+'?')){if(this.voterRecords[cnic]){this.voterRecords[cnic].isRejected=true;this.voterRecords[cnic].isVerified=false;this.saveData();this.renderVoterVerification();firebase.firestore().collection('voters').doc(cnic).update({isRejected:true,isVerified:false});UIService.showToast('Rejected: '+cnic,'error');}}}
    viewVoterDetails(cnic){const v=this.voterRecords[cnic];if(!v){UIService.showToast('Not found','error');return;}alert(`VOTER DETAILS:\n━━━━━━━━━\nCNIC: ${v.cnic}\nName: ${v.name}\nFather: ${v.fatherName||'N/A'}\nAge: ${v.age}\nConstituency: ${v.constituency||'N/A'}\nStatus: ${v.isVerified?'✅ Verified':v.isRejected?'❌ Rejected':'⏳ Pending'}`);}

    getLocationData() {
        const allData = {
            punjab: { districts: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala'], constituencies: { 'Lahore': ['NA-117 Lahore-I', 'NA-118 Lahore-II', 'PP-10 Lahore', 'PP-27 Lahore Cantt'], 'Rawalpindi': ['NA-50 Rawalpindi-I', 'NA-51 Rawalpindi-II', 'PP-1 Rawalpindi'], 'Faisalabad': ['NA-101 Faisalabad-I', 'NA-102 Faisalabad-II', 'PP-97 Faisalabad'], 'Multan': ['NA-150 Multan-I', 'NA-151 Multan-II', 'PP-200 Multan'], 'Gujranwala': ['NA-70 Gujranwala-I', 'NA-71 Gujranwala-II', 'PP-40 Gujranwala'] } },
            sindh: { districts: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'], constituencies: { 'Karachi': ['NA-230 Karachi-I', 'NA-231 Karachi-II', 'PS-50 Clifton', 'PS-51 Saddar'], 'Hyderabad': ['NA-210 Hyderabad-I', 'NA-211 Hyderabad-II', 'PS-60 Hyderabad'], 'Sukkur': ['NA-190 Sukkur-I', 'NA-191 Sukkur-II', 'PS-1 Sukkur'], 'Larkana': ['NA-180 Larkana-I', 'NA-181 Larkana-II', 'PS-10 Larkana'], 'Mirpur Khas': ['NA-200 Mirpur Khas-I', 'PS-40 Mirpur Khas'] } },
            kpk: { districts: ['Peshawar', 'Mardan', 'Swat', 'Abbottabad', 'Bannu'], constituencies: { 'Peshawar': ['NA-4 Peshawar', 'PK-30 Hayatabad', 'PK-31 City'], 'Mardan': ['NA-20 Mardan-I', 'NA-21 Mardan-II', 'PK-50 Mardan'], 'Swat': ['NA-2 Swat-I', 'NA-3 Swat-II', 'PK-1 Swat'], 'Abbottabad': ['NA-15 Abbottabad-I', 'NA-16 Abbottabad-II', 'PK-40 Abbottabad'], 'Bannu': ['NA-35 Bannu', 'PK-80 Bannu'] } },
            balochistan: { districts: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi'], constituencies: { 'Quetta': ['NA-5 Quetta', 'PB-10 Quetta City', 'PB-11 Quetta Cantt'], 'Gwadar': ['NA-260 Gwadar', 'PB-20 Gwadar'], 'Turbat': ['NA-258 Turbat', 'PB-30 Turbat'], 'Khuzdar': ['NA-255 Khuzdar', 'PB-40 Khuzdar'], 'Sibi': ['NA-253 Sibi', 'PB-1 Sibi'] } },
            ict: { districts: ['Islamabad'], constituencies: { 'Islamabad': ['NA-1 Islamabad', 'NA-46 Islamabad-I', 'NA-47 Islamabad-II', 'NA-48 Islamabad-III'] } }
        };
        if (this.activeProvince) { const filtered = {}; filtered[this.activeProvince] = allData[this.activeProvince]; return filtered; }
        return allData;
    }

      updateVoteDistricts() {
        const provinceDropdown = document.getElementById('voteProvince');
        const districtDropdown = document.getElementById('voteDistrict');
        const constituencyDropdown = document.getElementById('voteConstituency');
        
        if (!districtDropdown || !constituencyDropdown) return;
        
        // If admin has locked a province, use it
        if (this.activeProvince) {
            if (provinceDropdown) {
                provinceDropdown.value = this.activeProvince;
                provinceDropdown.disabled = true; // LOCK IT
            }
        }
        
        const province = this.activeProvince || UIService.getSelectValue('voteProvince');
        const locationData = this.getLocationData();
        
        if (province && locationData[province]) {
            districtDropdown.disabled = false;
            districtDropdown.innerHTML = '<option value="">Select District</option>';
            locationData[province].districts.forEach(d => {
                districtDropdown.innerHTML += `<option value="${d}">${d}</option>`;
            });
        } else {
            districtDropdown.disabled = true;
            districtDropdown.innerHTML = '<option value="">Select District</option>';
        }
        
        constituencyDropdown.disabled = true;
        constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
    }

    updateVoteConstituencies() {
        const province = UIService.getSelectValue('voteProvince');
        const district = UIService.getSelectValue('voteDistrict');
        const constituencyDropdown = document.getElementById('voteConstituency');
        if (!constituencyDropdown) return;
        const locationData = this.getLocationData();
        if (province && district && locationData[province]?.constituencies[district]) {
            constituencyDropdown.disabled = false;
            constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
            locationData[province].constituencies[district].forEach(c => { constituencyDropdown.innerHTML += `<option value="${c}">${c}</option>`; });
        } else { constituencyDropdown.disabled = true; constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>'; }
    }

      updateRegDistricts() {
        const provinceDropdown = document.getElementById('regProvince');
        const districtDropdown = document.getElementById('regDistrict');
        const constituencyDropdown = document.getElementById('regConstituency');
        const locationData = this.getLocationData();
        
        // If admin has locked a province
        if (this.activeProvince) {
            if (provinceDropdown) {
                provinceDropdown.value = this.activeProvince;
                provinceDropdown.disabled = true; // LOCK IT
            }
        }
        
        const province = this.activeProvince || UIService.getSelectValue('regProvince');
        
        if (province && locationData[province]) {
            districtDropdown.disabled = false;
            districtDropdown.innerHTML = '<option value="">Select District</option>';
            locationData[province].districts.forEach(d => {
                districtDropdown.innerHTML += `<option value="${d}">${d}</option>`;
            });
        } else {
            districtDropdown.disabled = true;
            districtDropdown.innerHTML = '<option value="">Select District</option>';
        }
        constituencyDropdown.disabled = true;
        constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
    }

    updateRegConstituencies() {
        const province = UIService.getSelectValue('regProvince');
        const district = UIService.getSelectValue('regDistrict');
        const constituencyDropdown = document.getElementById('regConstituency');
        const locationData = this.getLocationData();
        if (province && district && locationData[province]?.constituencies[district]) {
            constituencyDropdown.disabled = false;
            constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
            locationData[province].constituencies[district].forEach(c => { constituencyDropdown.innerHTML += `<option value="${c}">${c}</option>`; });
        } else { constituencyDropdown.disabled = true; constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>'; }
    }

    updateDistricts() {
        const province = UIService.getSelectValue('form45Province');
        const districtDropdown = document.getElementById('form45District');
        const constituencyDropdown = document.getElementById('form45Constituency');
        if (!districtDropdown || !constituencyDropdown) return;
        const locationData = this.getLocationData();
        if (province && locationData[province]) {
            districtDropdown.disabled = false;
            districtDropdown.innerHTML = '<option value="">Select District</option>';
            locationData[province].districts.forEach(d => { districtDropdown.innerHTML += `<option value="${d}">${d}</option>`; });
        } else { districtDropdown.disabled = true; districtDropdown.innerHTML = '<option value="">Select District</option>'; }
        constituencyDropdown.disabled = true;
        constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
        document.getElementById('form45Container').style.display = 'none';
    }

    updateConstituencies() {
        const province = UIService.getSelectValue('form45Province');
        const district = UIService.getSelectValue('form45District');
        const constituencyDropdown = document.getElementById('form45Constituency');
        if (!constituencyDropdown) return;
        const locationData = this.getLocationData();
        if (province && district && locationData[province]?.constituencies[district]) {
            constituencyDropdown.disabled = false;
            constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>';
            locationData[province].constituencies[district].forEach(c => { constituencyDropdown.innerHTML += `<option value="${c}">${c}</option>`; });
        } else { constituencyDropdown.disabled = true; constituencyDropdown.innerHTML = '<option value="">Select Constituency</option>'; }
        document.getElementById('form45Container').style.display = 'none';
    }

    validateMaleName(name) {
        const femaleNames = ['fatima', 
            'ayesha', 
            'aisha', 
            'khadija', 
            'zainab',
             'maria', 
             'maryam', 
             'sara',
              'hina',
               'nadia',
                'rabia',
                 'sana',
                  'zara',
                   'amna',
                    'bushra',
                     'fariha',
                      'iffat', 
                      'samina',
                       'rukhsana', 
                       'nasreen',
                        'shazia',
                         'parveen', 
                         'shabana', 
                         'fouzia',
                          'noreen', 
                          'tahira', 
                          'saima', 
                          'sadia', 
                          'nabila', 
                          'farzana',
                           'shamim',
                            'robina',
                             'naheed', 
                             'kausar', 
                             'yasmin'];
        return !femaleNames.some(fn => name.toLowerCase().trim().includes(fn));
    }

    setActiveProvince() {
        const province = UIService.getSelectValue('activeProvince');
        const statusEl = document.getElementById('activeProvinceStatus');
        if (province === 'all') { this.activeProvince = null; if (statusEl) { statusEl.innerHTML = '✅ All provinces active'; statusEl.style.color = '#22c55e'; } }
        else { this.activeProvince = province; if (statusEl) { statusEl.innerHTML = `✅ Active: <strong>${province.toUpperCase()}</strong>`; statusEl.style.color = '#22c55e'; } }
        this.saveData();
        UIService.showToast('📍 Location settings updated!', 'success');
    }
    isVotingOpen() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour + (currentMinute / 60);
        
        if (currentTime < this.votingStartHour) {
            const hoursLeft = Math.ceil(this.votingStartHour - currentTime);
            return { open: false, message: `⏰ Voting starts at ${this.votingStartHour}:00 AM. Please come back in ${hoursLeft} hour(s).` };
        }
        
        if (currentTime >= this.votingEndHour) {
            return { open: false, message: `🔒 Voting closed at ${this.votingEndHour}:00 PM. Thank you for participating!` };
        }
        
        const hoursLeft = Math.floor(this.votingEndHour - currentTime);
        const minutesLeft = Math.floor((this.votingEndHour - currentTime - hoursLeft) * 60);
        return { open: true, message: `🟢 Voting is OPEN! Closing in ${hoursLeft}h ${minutesLeft}m at ${this.votingEndHour}:00 PM.` };
    }
        updateVotingStatus() {
        const status = this.isVotingOpen();
        const statusEl = document.getElementById('votingHoursStatus');
        if (statusEl) {
            statusEl.textContent = status.message;
            statusEl.style.color = status.open ? '#22c55e' : '#ef4444';
        }
    }
        updateCountdownClock() {
    const status = this.isVotingOpen();
    const dot = document.getElementById('countdownDot');
    const statusEl = document.getElementById('countdownStatus');
    const timerEl = document.getElementById('countdownTimer');
    const labelEl = document.getElementById('countdownLabel');
    const timerMini = document.getElementById('countdownTimerMini');
    
    if (!timerEl || !statusEl || !dot || !labelEl) return;
    
    if (status.open) {
        // Voting is OPEN
        dot.style.background = '#22c55e';
        statusEl.textContent = 'Voting Open';
        statusEl.style.color = '#22c55e';
        
        const now = new Date();
        const closingTime = new Date();
        closingTime.setHours(this.votingEndHour, 0, 0, 0);
        if (now > closingTime) closingTime.setDate(closingTime.getDate() + 1);
        
        const diff = closingTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.textContent = timeStr;
        if (timerMini) timerMini.textContent = timeStr;
        labelEl.textContent = 'until voting closes';
    } else {
        // Voting is CLOSED
        dot.style.background = '#ef4444';
        statusEl.textContent = 'Voting Closed';
        statusEl.style.color = '#ef4444';
        
        const now = new Date();
        const openingTime = new Date();
        openingTime.setHours(this.votingStartHour, 0, 0, 0);
        if (now > openingTime) openingTime.setDate(openingTime.getDate() + 1);
        
        const diff = openingTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.textContent = timeStr;
        if (timerMini) timerMini.textContent = timeStr;
        labelEl.textContent = 'until voting opens';
    }
        }

    startCountdownClock() {
        this.updateCountdownClock();
        this.countdownInterval = setInterval(() => this.updateCountdownClock(), 1000);
    }
    cleanup() { this.cameraService.stopCamera(); this.chartsManager.destroyAllCharts(); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
window.addEventListener('beforeunload', () => { if (window.app) window.app.cleanup(); });