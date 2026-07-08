// Election Commission of Pakistan - Admin Component

import { ADMIN_CREDENTIALS } from '../config/constants.js';
import { UIService } from '../services/ui-service.js';

export class AdminPanel {
    constructor(app) {
        this.app = app;
    }

    login(username, password) {
        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password) {
            this.app.isAdmin = true;
            sessionStorage.setItem('ecpAdmin', 'true');
            this.applyAdminUI();
            this.closeLogin();
            this.app.navigation.navigateTo('admin');
            UIService.showToast('Login successful');
            return true;
        } else {
            const loginErr = document.getElementById('loginErr');
            if (loginErr) {
                loginErr.style.display = 'flex';
            }
            return false;
        }
    }

    logout() {
        this.app.isAdmin = false;
        sessionStorage.removeItem('ecpAdmin');
        this.applyAdminUI();
        this.app.navigation.navigateTo('home');
        UIService.showToast('Logged out');
    }

    showLogin() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.classList.add('show');
            UIService.setValue('adminUser', '');
            UIService.setValue('adminPass', '');
            const loginErr = document.getElementById('loginErr');
            if (loginErr) {
                loginErr.style.display = 'none';
            }
        }
    }

    closeLogin() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.classList.remove('show');
            UIService.setValue('adminUser', '');
            UIService.setValue('adminPass', '');
            const loginErr = document.getElementById('loginErr');
            if (loginErr) {
                loginErr.style.display = 'none';
            }
        }
    }

    closeVoteModal() {
        const voteOverlay = document.getElementById('voteSuccessOverlay');
        if (voteOverlay) {
            voteOverlay.classList.remove('show');
        }
    }

    applyAdminUI() {
        const isAdmin = this.app.isAdmin;

        document.querySelectorAll('.admin-nav-item').forEach(el => {
            el.classList.toggle('show', isAdmin);
        });

        const adminBtn = document.getElementById('adminBtnTop');
        const logoutBtn = document.getElementById('logoutBtnTop');

        if (adminBtn) adminBtn.style.display = isAdmin ? 'none' : 'flex';
        if (logoutBtn) logoutBtn.style.display = isAdmin ? 'flex' : 'none';
    }

    renderElectionControl() {
        const grid = document.getElementById('electionControlGrid');
        if (!grid) return;

        const electionNames = this.app.electionNames;
        const activeElection = this.app.activeElection;

        grid.innerHTML = Object.keys(electionNames).map(key => {
            const isActive = key === activeElection;
            return `
                <div class="election-control-item ${isActive ? 'active-election' : ''}">
                    <span class="elec-name">${electionNames[key]}</span>
                    <span class="elec-status" style="color: ${isActive ? 'var(--green-dark)' : '#999'}">
                        ${isActive ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                    ${isActive ? 
                        `<button class="btn-deactivate" onclick="window.app.deactivateElection('${key}')">Deactivate</button>` :
                        `<button class="btn-activate" onclick="window.app.activateElection('${key}')">Activate</button>`
                    }
                </div>
            `;
        }).join('');
    }

    updateDashboard() {
        const candidates = this.app.getCurrentCandidates();
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

        UIService.updateElementText('admTotalVotes', totalVotes);
        UIService.updateElementText('admElecVotes', totalVotes);

        // Recent voters table
        const recentVotersTbl = document.getElementById('recentVotersTbl');
        if (recentVotersTbl) {
            const recentVoters = this.app.recentVoters;
            if (recentVoters && recentVoters.length > 0) {
                recentVotersTbl.innerHTML = recentVoters.slice(-10).reverse().map(v => `
                    <tr>
                        <td>${v.name || 'N/A'}</td>
                        <td>${v.cnic || 'N/A'}</td>
                        <td>${v.time || 'N/A'}</td>
                    </tr>
                `).join('');
            } else {
                recentVotersTbl.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;">No recent votes yet</td></tr>';
            }
        }

        // Performance list
        const sorted = candidates
            .filter(c => c.status === 'active')
            .sort((a, b) => b.votes - a.votes);

        const admPerfList = document.getElementById('admPerfList');
        if (admPerfList) {
            if (sorted.length > 0) {
                admPerfList.innerHTML = sorted.map((c, i) => `
                    <div class="perf-item">
                        <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'} ${c.name} (${c.party})</span>
                        <strong>${c.votes} votes</strong>
                    </div>
                `).join('');
            } else {
                admPerfList.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">No active candidates</div>';
            }
        }
    }

    activateElection(electionKey) {
        if (electionKey === this.app.activeElection) return;
        this.app.activeElection = electionKey;
        this.app.saveData();
        this.app.updateElectionDisplay();
        this.renderElectionControl();
        this.app.refreshAll();
        UIService.showToast(`${this.app.electionNames[electionKey]} is now ACTIVE`);
    }

    deactivateElection(electionKey) {
        UIService.showToast('Cannot deactivate the only active election. Activate another first.', 'error');
    }

    refreshAll() {
        if (document.getElementById('page-vote').classList.contains('active')) {
            this.app.renderVoteCandidates();
        }
        if (document.getElementById('page-results').classList.contains('active')) {
            this.app.refreshResults();
            this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
        }
        if (document.getElementById('page-home').classList.contains('active')) {
            this.app.updateHomeStats();
            this.app.chartsManager.updateCharts(this.app.getActiveCandidates());
        }
        if (document.getElementById('page-manage').classList.contains('active')) {
            this.app.renderManageTable();
        }
        if (document.getElementById('page-admin').classList.contains('active')) {
            this.updateDashboard();
        }
    }
}