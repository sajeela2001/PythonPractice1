// Election Commission of Pakistan - Navigation Component

export class Navigation {
    constructor(app) {
        this.app = app;
        this.setupNavigation();
        this.setupModalListeners();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = link.getAttribute('data-page');
                this.navigateTo(pageName);
            });
        });
    }

    setupModalListeners() {
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Close modals when clicking overlay
        window.addEventListener('click', (e) => {
            if (e.target.id === 'loginOverlay') {
                this.app.closeLogin();
            }
            if (e.target.id === 'voteSuccessOverlay') {
                this.app.closeVoteModal();
            }
        });
    }

    navigateTo(pageName) {
        // Save voter data if leaving vote page
        if (document.getElementById('page-vote') && 
            document.getElementById('page-vote').classList.contains('active') && 
            pageName !== 'vote') {
            this.app.saveVoterData();
        }

        // Check admin access
        const adminPages = ['election-control', 'admin', 'manage'];
        if (adminPages.includes(pageName) && !this.app.isAdmin) {
            this.app.showLogin();
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById('page-' + pageName);
        if (page) {
            page.classList.add('active');
        }

        // Set active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        // Page-specific initialization
        this.initializePage(pageName);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initializePage(pageName) {
        switch(pageName) {
            case 'home':
                this.app.updateHomeStats();
                this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
                this.app.renderChainVisual();
                break;
                case 'register':
                this.app.resetRegistrationForm();
                break;
                case 'vote':
                this.app.renderVoteCandidates();
                this.app.initializeCamera();
                this.app.restoreVoterData();
               // Auto-set province if locked
               if (this.app.activeProvince) {
               setTimeout(() => this.app.updateVoteDistricts(), 100);
                }
               break;
               case 'election-control':
                this.app.renderElectionControl();
                break;
                case 'admin':
    this.app.updateAdminDashboard();
    // Auto-import Excel data if no voters loaded
    if (Object.keys(this.app.voterRecords).length === 0) {
        setTimeout(() => this.app.importExcelData(), 500);
    }
    break;
            case 'manage':
                this.app.renderManageTable();
                break;
            case 'blockchain':
                this.app.renderLedger();
                break;
            case 'results':
                this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
                this.app.refreshResults();
                break;
            case 'verify':
                if (document.getElementById('verifyInput')) {
                    document.getElementById('verifyInput').value = '';
                }
                if (document.getElementById('verifyResult')) {
                    document.getElementById('verifyResult').style.display = 'none';
                }
                break;
 case 'form45':
    document.getElementById('form45Container').style.display = 'none';
    UIService.setValue('form45Constituency', '');
    this.app.populateConstituencyDropdown();
    break;
case 'complaints':
    document.getElementById('complaintSuccess').style.display = 'none';
    if (document.getElementById('trackResult')) document.getElementById('trackResult').style.display = 'none';
    break;
    case 'verify-voters':
    this.app.renderVoterVerification();
    break;
            case 'faq':
                this.app.renderFaqItems();
                break;
        }
    }

    closeAllModals() {
        const loginOverlay = document.getElementById('loginOverlay');
        const voteOverlay = document.getElementById('voteSuccessOverlay');
        
        if (loginOverlay) loginOverlay.classList.remove('show');
        if (voteOverlay) voteOverlay.classList.remove('show');
    }
}