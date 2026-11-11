// Charts for the empirical section. Data comes from ../data/build_data.py -> data.js.
(function () {
    const D = window.CDE;
    if (!D || typeof Chart === 'undefined') return; // page without charts, or data.js missing

    const el = id => document.getElementById(id);
    const usd = v => (v >= 1e12 ? '$' + (v / 1e12).toFixed(2) + 'T' : '$' + (v / 1e9).toFixed(0) + 'B');
    const base = { responsive: true, maintainAspectRatio: true };

    if (el('btcDominanceChart')) new Chart(el('btcDominanceChart'), {
        type: 'line',
        data: {
            labels: D.dominance.map(d => d.year),
            datasets: [
                { label: 'Annual average BTC dominance (%)', data: D.dominance.map(d => d.avg), borderColor: '#f39c12', backgroundColor: 'rgba(243,156,18,.1)', borderWidth: 3, pointRadius: 4, tension: .3 },
                { label: 'Intra-year high', data: D.dominance.map(d => d.high), borderColor: '#27ae60', borderWidth: 1, borderDash: [5, 5], fill: '+1', pointRadius: 0, tension: .3 },
                { label: 'Intra-year low', data: D.dominance.map(d => d.low), borderColor: '#e74c3c', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, tension: .3 }
            ]
        },
        options: { ...base, scales: { y: { min: 30, max: 100, title: { display: true, text: 'BTC dominance (%)' } } } }
    });

    if (el('capitalChart')) new Chart(el('capitalChart'), {
        type: 'line',
        data: {
            labels: D.capital.map(c => c.month),
            datasets: [{ label: 'Total crypto market cap', data: D.capital.map(c => c.mcap), borderColor: '#2980b9', backgroundColor: 'rgba(41,128,185,.12)', borderWidth: 2, pointRadius: 0, fill: true }]
        },
        options: {
            ...base,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => usd(c.parsed.y) } } },
            scales: {
                y: { type: 'logarithmic', title: { display: true, text: 'Market cap (USD, log scale)' }, ticks: { callback: v => usd(v) } },
                x: { ticks: { maxTicksLimit: 14 } }
            }
        }
    });

    if (el('correlationChart')) new Chart(el('correlationChart'), {
        type: 'line',
        data: {
            labels: D.monthly.map(m => m.month),
            datasets: [
                { label: 'CMC-tracked assets', data: D.monthly.map(m => m.active), borderColor: '#3498db', borderWidth: 2, pointRadius: 0, yAxisID: 'y' },
                { label: 'BTC dominance (%)', data: D.monthly.map(m => m.btc), borderColor: '#f39c12', borderWidth: 2, pointRadius: 0, yAxisID: 'y1' }
            ]
        },
        options: {
            ...base,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { title: { display: true, text: 'Tracked cryptocurrencies' } },
                y1: { position: 'right', title: { display: true, text: 'BTC dominance (%)' }, grid: { drawOnChartArea: false } },
                x: { ticks: { maxTicksLimit: 12 } }
            }
        }
    });

    if (el('yoyChart')) new Chart(el('yoyChart'), {
        type: 'bar',
        data: {
            labels: D.dominance.filter(d => d.yoy !== null).map(d => d.year),
            datasets: [{
                label: 'Change in annual average dominance (pp)',
                data: D.dominance.filter(d => d.yoy !== null).map(d => d.yoy),
                backgroundColor: D.dominance.filter(d => d.yoy !== null).map(d => d.yoy >= 0 ? 'rgba(39,174,96,.7)' : 'rgba(231,76,60,.7)')
            }]
        },
        options: { ...base, plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: 'Percentage points' } } } }
    });

    if (el('tvlChart')) new Chart(el('tvlChart'), {
        type: 'line',
        data: {
            labels: D.tvl.map(t => t.month),
            datasets: [{ label: 'DeFi TVL, all chains', data: D.tvl.map(t => t.tvl), borderColor: '#8e44ad', backgroundColor: 'rgba(142,68,173,.12)', borderWidth: 2, pointRadius: 0, fill: true }]
        },
        options: {
            ...base,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => usd(c.parsed.y) } } },
            scales: { y: { type: 'logarithmic', ticks: { callback: v => usd(v) }, title: { display: true, text: 'TVL (USD, log scale)' } }, x: { ticks: { maxTicksLimit: 12 } } }
        }
    });
})();
