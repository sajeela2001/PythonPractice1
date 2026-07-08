// Election Commission of Pakistan - Charts Component

import { CHART_COLORS } from '../config/constants.js';

export class ChartsManager {
    constructor() {
        this.charts = {};
        this.barChart = null;
        this.pieChart = null;
    }

    updateCharts(candidates, app) {
        const active = candidates.filter(c => c.status === 'active');
        const labels = active.map(c => c.name);
        const votes = active.map(c => c.votes);
        const total = votes.reduce((s, v) => s + v, 0) || 1;
        
        const recentCandidates = new Set();
        const now = new Date();
        for (const [cnic, record] of Object.entries(app.voterRecords)) {
            if (record.isRecent && record.votedFor) {
                const voteTime = new Date(record.timestamp);
                if (voteTime > new Date(now - 30000)) {
                    recentCandidates.add(record.votedFor);
                }
            }
        }
        
        // Bar Chart
        if (this.barChart) this.barChart.destroy();
        const barCtx = document.getElementById('resBar')?.getContext('2d');
        if (barCtx) {
            this.barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Votes',
                        data: votes,
                        backgroundColor: active.map(c => 
                            recentCandidates.has(c.name) ? '#f59e0b' : '#0a3d2e'
                        ),
                        borderColor: active.map(c => 
                            recentCandidates.has(c.name) ? '#d97706' : '#064e3b'
                        ),
                        borderWidth: recentCandidates.size > 0 ? 2 : 1,
                        borderRadius: 5,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0a3d2e',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: function(ctx) {
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    const isNew = recentCandidates.has(ctx.label);
                                    return `${ctx.raw} votes (${pct}%)${isNew ? ' 🆕 NEW!' : ''}`;
                                }
                            }
                        }
                    },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    animation: { duration: recentCandidates.size > 0 ? 1000 : 500 }
                }
            });
        }
        
        // Pie Chart
        if (this.pieChart) this.pieChart.destroy();
        const pieCtx = document.getElementById('resPie')?.getContext('2d');
        if (pieCtx) {
            const colors = ['#0a3d2e', '#1a5a3e', '#2d7a4e', '#c8a84b', '#8b6914', '#4a7c59'];
            this.pieChart = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: votes,
                        backgroundColor: colors.slice(0, active.length),
                        borderColor: '#fff',
                        borderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            backgroundColor: '#0a3d2e',
                            callbacks: {
                                label: function(ctx) {
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    const isNew = recentCandidates.has(ctx.label);
                                    return `${ctx.label}: ${ctx.raw} votes (${pct}%)${isNew ? ' 🆕' : ''}`;
                                }
                            }
                        }
                    },
                    animation: { animateScale: true, duration: 800 }
                }
            });
        }
    }

    createBarChart(chartId, labels, data, hasVotes) {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        const displayLabels = labels.length > 0 ? labels : ['No Data'];
        const displayData = data.length > 0 ? data : [0];
        const colors = CHART_COLORS.slice(0, displayLabels.length);

        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: displayLabels,
                datasets: [{
                    label: 'Votes',
                    data: displayData,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#e0e0e0', display: true },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        grid: { color: '#e0e0e0', display: true }
                    }
                },
                plugins: {
                    legend: { display: hasVotes }
                }
            }
        });
    }

    createPieChart(chartId, labels, data, hasVotes) {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        if (hasVotes) {
            const colors = CHART_COLORS.slice(0, labels.length);

            this.charts[chartId] = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Votes',
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        } else {
            const emptyCount = labels.length > 0 ? labels.length : 4;
            const emptyLabels = Array(emptyCount).fill('');
            const emptyData = Array(emptyCount).fill(1);
            const emptyColors = ['#d5d5d0', '#c8c8c3', '#bfbfba', '#b5b5b0', '#ababa6', '#a1a19c'];

            this.charts[chartId] = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: emptyLabels,
                    datasets: [{
                        data: emptyData,
                        backgroundColor: emptyColors.slice(0, emptyCount),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
    }

    destroyAllCharts() {
        if (this.barChart) { this.barChart.destroy(); this.barChart = null; }
        if (this.pieChart) { this.pieChart.destroy(); this.pieChart = null; }
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }
}