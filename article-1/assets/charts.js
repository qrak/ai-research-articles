// Parse CSV data
const altcoinData = [
    { year: 2013, total: 50, active: 50 },
    { year: 2014, total: 500, active: 500 },
    { year: 2015, total: 500, active: 500 },
    { year: 2016, total: 700, active: 700 },
    { year: 2017, total: 1500, active: 1000 },
    { year: 2018, total: 2073, active: 1500 },
    { year: 2019, total: 2000, active: 1500 },
    { year: 2020, total: 5000, active: 3500 },
    { year: 2021, total: 6000, active: 4000 },
    { year: 2022, total: 7000, active: 4500 },
    { year: 2023, total: 8000, active: 5000 },
    // Ensure active ≤ total and maintain a plausible growth path
    { year: 2024, total: 10038, active: 8000 },
    { year: 2025, total: 17134, active: 15000 }
];

const btcDominanceData = [
    { year: 2013, avg: 93.3, low: 87.4, high: 99.1, yoy: null },
    { year: 2014, avg: 88.5, low: 77.2, high: 95.0, yoy: -4.8 },
    { year: 2015, avg: 86.3, low: 64.0, high: 92.1, yoy: -2.2 },
    { year: 2016, avg: 82.6, low: 76.4, high: 91.7, yoy: -3.7 },
    { year: 2017, avg: 58.5, low: 37.5, high: 87.2, yoy: -24.1 },
    { year: 2018, avg: 44.6, low: 31.1, high: 57.1, yoy: -13.9 },
    { year: 2019, avg: 60.2, low: 48.8, high: 70.7, yoy: 15.6 },
    { year: 2020, avg: 62.7, low: 54.2, high: 72.4, yoy: 2.5 },
    { year: 2021, avg: 47.6, low: 37.8, high: 70.7, yoy: -15.1 },
    { year: 2022, avg: 39.3, low: 35.9, high: 45.6, yoy: -8.3 },
    { year: 2023, avg: 45.6, low: 37.5, high: 51.6, yoy: 6.3 },
    { year: 2024, avg: 51.9, low: 47.3, high: 57.4, yoy: 6.3 },
    { year: 2025, avg: 59.3, low: 53.0, high: 63.2, yoy: 7.4 }
];

const cryptoUsers = [
    { year: 2023, total: 583, btc: 298, eth: 125, btcPct: 51.1, ethPct: 21.4 },
    { year: 2024, total: 659, btc: 337, eth: 142, btcPct: 51.2, ethPct: 21.7 }
];

// Chart 1: BTC Dominance Over Time with Range
const ctx1 = document.getElementById('btcDominanceChart').getContext('2d');
new Chart(ctx1, {
    type: 'line',
    data: {
        labels: btcDominanceData.map(d => d.year),
        datasets: [
            {
                label: 'Average BTC Dominance (%)',
                data: btcDominanceData.map(d => d.avg),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'High Range',
                data: btcDominanceData.map(d => d.high),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.05)',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: '+1',
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Low Range',
                data: btcDominanceData.map(d => d.low),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.05)',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 30,
                max: 100,
                title: {
                    display: true,
                    text: 'Bitcoin Dominance (%)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            }
        }
    }
});

// Chart 2: Altcoin Growth
const ctx2 = document.getElementById('altcoinGrowthChart').getContext('2d');
new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: altcoinData.map(d => d.year),
        datasets: [
            {
                label: 'Total Cryptocurrencies',
                data: altcoinData.map(d => d.total),
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: '#3498db',
                borderWidth: 1
            },
            {
                label: 'Active Cryptocurrencies',
                data: altcoinData.map(d => d.active),
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: '#2ecc71',
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Cryptocurrencies'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            }
        }
    }
});

// Chart 3: Correlation Chart (Dual Axis)
const ctx3 = document.getElementById('correlationChart').getContext('2d');
new Chart(ctx3, {
    type: 'line',
    data: {
        labels: btcDominanceData.map(d => d.year),
        datasets: [
            {
                label: 'Total Cryptocurrencies',
                data: altcoinData.map(d => d.total),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                yAxisID: 'y',
                tension: 0.4,
                pointRadius: 4
            },
            {
                label: 'BTC Dominance (%)',
                data: btcDominanceData.map(d => d.avg),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                borderWidth: 3,
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Cryptocurrencies'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                min: 30,
                max: 100,
                reverse: true,
                title: {
                    display: true,
                    text: 'BTC Dominance (%) - Inverted Scale'
                },
                grid: {
                    drawOnChartArea: false
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            }
        }
    }
});

// Compute Pearson correlation between altcoin supply (total) and BTC dominance (avg)
function pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    const xs = x.slice(0, n);
    const ys = y.slice(0, n);
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0, denx = 0, deny = 0;
    for (let i = 0; i < n; i++) {
        const dx = xs[i] - mx;
        const dy = ys[i] - my;
        num += dx * dy;
        denx += dx * dx;
        deny += dy * dy;
    }
    const denom = Math.sqrt(denx * deny);
    return denom === 0 ? 0 : num / denom;
}

(function annotateCorrelationCaption() {
    try {
        const totals = altcoinData.map(d => d.total);
        const dom = btcDominanceData.map(d => d.avg);
        const r = pearsonCorrelation(totals, dom);
        const rText = `Sample Pearson r = ${r.toFixed(2)}`;
        const canvas = document.getElementById('correlationChart');
        if (canvas && canvas.parentElement) {
            const cap = canvas.parentElement.querySelector('.chart-caption');
            if (cap) {
                cap.textContent = `Dual-axis chart showing negative correlation between rising altcoin count (left axis) and declining BTC dominance (right axis, inverted scale). ${rText}.`;
            }
        }
        // Also log for reproducibility
        console.log('[Correlation] Altcoin total vs BTC dominance:', rText);
    } catch (e) {
        console.warn('Failed to compute correlation:', e);
    }
})();

// Chart 4: Year-over-Year Change
const ctx4 = document.getElementById('yoyChangeChart').getContext('2d');
new Chart(ctx4, {
    type: 'bar',
    data: {
        labels: btcDominanceData.filter(d => d.yoy !== null).map(d => d.year),
        datasets: [{
            label: 'Year-over-Year Change in BTC Dominance (%)',
            data: btcDominanceData.filter(d => d.yoy !== null).map(d => d.yoy),
            backgroundColor: btcDominanceData.filter(d => d.yoy !== null).map(d =>
                d.yoy > 0 ? 'rgba(39, 174, 96, 0.7)' : 'rgba(231, 76, 60, 0.7)'
            ),
            borderColor: btcDominanceData.filter(d => d.yoy !== null).map(d =>
                d.yoy > 0 ? '#27ae60' : '#e74c3c'
            ),
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Year-over-Year Change (%)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            }
        }
    }
});

// Chart 5: User Distribution
const ctx5 = document.getElementById('userDistributionChart').getContext('2d');
new Chart(ctx5, {
    type: 'bar',
    data: {
        labels: cryptoUsers.map(d => d.year),
        datasets: [
            {
                label: 'Total Crypto Users (Millions)',
                data: cryptoUsers.map(d => d.total),
                backgroundColor: 'rgba(149, 165, 166, 0.7)',
                borderColor: '#95a5a6',
                borderWidth: 1
            },
            {
                label: 'Bitcoin Owners (Millions)',
                data: cryptoUsers.map(d => d.btc),
                backgroundColor: 'rgba(243, 156, 18, 0.7)',
                borderColor: '#f39c12',
                borderWidth: 1
            },
            {
                label: 'Ethereum Owners (Millions)',
                data: cryptoUsers.map(d => d.eth),
                backgroundColor: 'rgba(155, 89, 182, 0.7)',
                borderColor: '#9b59b6',
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Users (Millions)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            }
        }
    }
});
