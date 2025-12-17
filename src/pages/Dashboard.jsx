/**
 * Dashboard Page - Matches original dashboard.html
 * KPIs: Impressions, Clicks, Spend, Purchases, CTR, CPC
 * Charts: Campaign Performance, Status Distribution, Objective, Spend vs Purchases, Top 10, Quality, Ad Status
 * Table: Top Performing Ads
 * Date Range: Dropdown to select 1, 5, 7, 14, or 30 days
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { FaEye, FaHandPointer, FaDollarSign, FaShoppingCart, FaChartLine, FaChartBar, FaBullseye, FaFlag, FaMoneyBillWave, FaStar, FaMobileAlt, FaTrophy, FaRocket, FaLightbulb, FaBars, FaTimes, FaSync } from 'react-icons/fa';
import KPICard from '../components/cards/KPICard';
import ChartCard from '../components/cards/ChartCard';
import analyticsAPI from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

// Fixed to 1 day - no date range selection

const colors = {
    blue: '#4f7cff',
    green: '#00d47e',
    purple: '#9b59f5',
    orange: '#ff8c42',
    pink: '#ff5e7d',
    teal: '#00bcd4',
    yellow: '#ffc107',
    red: '#ef5350',
};

const colorPalette = [colors.blue, colors.green, colors.purple, colors.orange, colors.pink, colors.teal, colors.yellow, colors.red];

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { color: '#b4b4c9', padding: 15 } } },
};

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#b4b4c9', padding: 15 } } },
};

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', align: 'end', labels: { color: '#b4b4c9' } } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#b4b4c9', maxRotation: 45 } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' } },
    },
};

const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' } },
        y: { grid: { display: false }, ticks: { color: '#b4b4c9' } },
    },
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const selectedDays = 1; // Fixed to 1 day

    const [summary, setSummary] = useState(null);
    const [campaignStats, setCampaignStats] = useState([]);
    const [campaignStatusDist, setCampaignStatusDist] = useState([]);
    const [objectiveDist, setObjectiveDist] = useState([]);
    const [spendPurchases, setSpendPurchases] = useState([]);
    const [qualityDist, setQualityDist] = useState([]);
    const [adStatusDist, setAdStatusDist] = useState([]);
    const [topAds, setTopAds] = useState([]);

    useEffect(() => { loadData(); }, [selectedDays]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, campaignStatsRes, statusRes, objectiveRes, spendRes, qualityRes, adStatusRes, topAdsRes] = await Promise.all([
                analyticsAPI.getSummary(selectedDays),
                analyticsAPI.getCampaignStats(selectedDays),
                analyticsAPI.getCampaignStatusDistribution(),
                analyticsAPI.getCampaignObjectiveDistribution(),
                analyticsAPI.getCampaignSpendPurchases(selectedDays),
                analyticsAPI.getQualityRankingDistribution(selectedDays),
                analyticsAPI.getAdStatusDistribution(),
                analyticsAPI.getTopAds(50, selectedDays),
            ]);
            setSummary(summaryRes);
            setCampaignStats(campaignStatsRes.data || []);
            setCampaignStatusDist(statusRes.data || []);
            setObjectiveDist(objectiveRes.data || []);
            setSpendPurchases(spendRes.data || []);
            setQualityDist(qualityRes.data || []);
            setAdStatusDist(adStatusRes.data || []);
            setTopAds(topAdsRes.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (force = false) => {
        setRefreshing(true);
        setMessage(null);
        try {
            const result = await analyticsAPI.refreshData(selectedDays, force);
            if (result.from_cache && !force) {
                setMessage({ type: 'info', text: `Data for last ${selectedDays} days already exists. Click "Force Refresh" to update.` });
            } else {
                setMessage({ type: 'success', text: `Successfully loaded ${result.records_updated} records from Meta API` });
            }
            await loadData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to refresh data. Check your .env credentials.' });
        } finally {
            setRefreshing(false);
        }
    };

    // Date range fixed to 1 day - no handleDateRangeChange needed

    // Chart data
    const campaignChartData = {
        labels: campaignStats.slice(0, 8).map(c => truncate(c.campaign_name, 20)),
        datasets: [
            { label: 'Impressions', data: campaignStats.slice(0, 8).map(c => c.impressions), backgroundColor: colors.blue, borderRadius: 6 },
            { label: 'Clicks', data: campaignStats.slice(0, 8).map(c => c.clicks), backgroundColor: colors.green, borderRadius: 6 },
        ],
    };

    const statusChartData = {
        labels: campaignStatusDist.map(s => s.status),
        datasets: [{ data: campaignStatusDist.map(s => s.count), backgroundColor: colorPalette, borderWidth: 0, hoverOffset: 10 }],
    };

    const objectiveChartData = {
        labels: objectiveDist.map(o => formatObjective(o.objective)),
        datasets: [
            { label: 'Count', data: objectiveDist.map(o => o.count), backgroundColor: colors.blue + 'cc', borderRadius: 6 },
        ],
    };

    const spendPurchasesChartData = {
        labels: spendPurchases.map(c => truncate(c.campaign_name, 18)),
        datasets: [
            { label: 'Spend (AED)', data: spendPurchases.map(c => c.spend), backgroundColor: colors.purple, borderRadius: 6, yAxisID: 'y' },
            { label: 'Purchases', data: spendPurchases.map(c => c.purchases), backgroundColor: colors.teal, borderRadius: 6, yAxisID: 'y1' },
        ],
    };

    const topCampaignsChartData = {
        labels: campaignStats.slice(0, 10).map(c => truncate(c.campaign_name, 40)),
        datasets: [{ label: 'Impressions', data: campaignStats.slice(0, 10).map(c => c.impressions), backgroundColor: colorPalette, borderRadius: 8 }],
    };

    const qualityChartData = {
        labels: qualityDist.map(q => (q.quality_ranking || 'Unknown').replace(/_/g, ' ')),
        datasets: [{ data: qualityDist.map(q => q.count), backgroundColor: [colors.green, colors.orange, colors.pink, colors.red, colors.purple], borderWidth: 0, hoverOffset: 8 }],
    };

    const adStatusChartData = {
        labels: adStatusDist.map(s => s.status),
        datasets: [{ data: adStatusDist.map(s => s.count), backgroundColor: colorPalette, borderWidth: 0, hoverOffset: 10 }],
    };

    // Filter top ads by search
    const filteredAds = topAds.filter(ad =>
        (ad.ad_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.campaign_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f0f23]">
            {/* Header */}
            <header className="bg-[#1a1a2e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#4f7cff] to-[#9b59f5] flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">Meta Ads Dashboard</h1>
                                <p className="text-xs sm:text-sm text-[#b4b4c9] hidden sm:block">Servis Shoes AED Account</p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                            <nav className="flex gap-2">
                                <Link to="/" className="px-3 xl:px-4 py-2 rounded-lg bg-[#4f7cff] text-white font-medium text-sm xl:text-base">Overview</Link>
                                <Link to="/analytics" className="px-3 xl:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors text-sm xl:text-base">Analytics</Link>
                            </nav>

                            <button onClick={() => handleRefresh(false)} disabled={refreshing} className={`px-3 xl:px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${refreshing ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#00d47e] to-[#00f5a0] hover:shadow-lg'} text-white font-medium text-sm xl:text-base`}>
                                <FaSync className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden xl:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                            <button onClick={() => handleRefresh(true)} disabled={refreshing} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors text-sm" title="Force refresh from API">
                                Force
                            </button>
                            <div className="px-3 xl:px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs xl:text-sm text-green-400 hidden xl:inline">Live</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
                            <nav className="flex flex-col gap-2 mb-4">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg bg-[#4f7cff] text-white font-medium">Overview</Link>
                                <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors">Analytics</Link>
                            </nav>
                            <div className="flex flex-col gap-2">

                                <button onClick={() => { handleRefresh(false); setMobileMenuOpen(false); }} disabled={refreshing} className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${refreshing ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#00d47e] to-[#00f5a0] hover:shadow-lg'} text-white font-medium`}>
                                    <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
                        message.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' :
                            message.type === 'info' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' :
                                'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* KPI Cards */}
                <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <KPICard title="Total Impressions" value={summary?.total_impressions || 0} icon={<FaEye className="text-lg" />} gradient="blue" loading={loading} />
                    <KPICard title="Total Clicks" value={summary?.total_clicks || 0} icon={<FaHandPointer className="text-lg" />} gradient="green" loading={loading} />
                    <KPICard title="Total Spend (AED)" value={(summary?.total_spend || 0).toFixed(2)} icon={<FaMoneyBillWave className="text-lg" />} gradient="purple" loading={loading} />
                    <KPICard title="Total Purchases" value={summary?.total_purchases || 0} icon={<FaShoppingCart className="text-lg" />} gradient="orange" loading={loading} />
                    <KPICard title="Average CTR" value={`${(summary?.avg_ctr || 0).toFixed(2)}%`} icon={<FaChartLine className="text-lg" />} gradient="pink" loading={loading} />
                    <KPICard title="Average CPC (AED)" value={(summary?.avg_cpc || 0).toFixed(2)} icon={<FaDollarSign className="text-lg" />} gradient="teal" loading={loading} />
                </section>

                {/* Row 1: Campaign Performance + Status Distribution */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <ChartCard title="Campaign Performance Overview" icon={<FaChartBar className="w-5 h-5" />} size="large" loading={loading}>
                            <Bar data={campaignChartData} options={barOptions} />
                        </ChartCard>
                    </div>
                    <ChartCard title="Campaign Status Distribution" icon={<FaBullseye className="w-5 h-5" />} loading={loading}>
                        <Doughnut data={statusChartData} options={doughnutOptions} />
                    </ChartCard>
                </section>

                {/* Row 2: Objective + Spend vs Purchases */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <ChartCard title="Objective Breakdown" icon={<FaFlag className="w-5 h-5" />} loading={loading}>
                        <Bar data={objectiveChartData} options={{ ...horizontalBarOptions, indexAxis: 'y' }} />
                    </ChartCard>
                    <div className="lg:col-span-2">
                        <ChartCard title="Spend vs Purchases by Campaign" icon={<FaMoneyBillWave className="w-5 h-5" />} size="large" loading={loading}>
                            <Bar data={spendPurchasesChartData} options={{
                                ...barOptions,
                                scales: {
                                    ...barOptions.scales,
                                    y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' }, title: { display: true, text: 'Spend (AED)', color: '#b4b4c9' } },
                                    y1: { position: 'right', grid: { display: false }, ticks: { color: '#b4b4c9' }, title: { display: true, text: 'Purchases', color: '#b4b4c9' } },
                                }
                            }} />
                        </ChartCard>
                    </div>
                </section>

                {/* Row 3: Top 10 Campaigns */}
                <section className="mb-6">
                    <ChartCard title="Top 10 Campaigns by Impressions" icon={<FaChartBar className="w-5 h-5" />} size="full" loading={loading}>
                        <div style={{ height: '350px' }}>
                            <Bar data={topCampaignsChartData} options={horizontalBarOptions} />
                        </div>
                    </ChartCard>
                </section>

                {/* Row 4: Quality + Ad Status */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Quality Ranking Distribution" icon={<FaStar className="w-5 h-5" />} loading={loading}>
                        <Pie data={qualityChartData} options={pieOptions} />
                    </ChartCard>
                    <ChartCard title="Ad Status Overview" icon={<FaMobileAlt className="w-5 h-5" />} loading={loading}>
                        <Doughnut data={adStatusChartData} options={doughnutOptions} />
                    </ChartCard>
                </section>

                {/* Top Performing Ads Table */}
                <section className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FaTrophy className="w-5 h-5" />
                            Top Performing Ads
                        </h3>
                        <input type="text" placeholder="Search ads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-[#8888a4] focus:outline-none focus:border-[#4f7cff]" />
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="data-table text-sm w-full">
                            <thead className="sticky top-0 bg-[#1a1a2e]">
                                <tr>
                                    <th className="text-left py-3 px-4">Ad Name</th>
                                    <th className="text-left py-3 px-4">Campaign</th>
                                    <th className="text-right py-3 px-4">Impressions</th>
                                    <th className="text-right py-3 px-4">Clicks</th>
                                    <th className="text-right py-3 px-4">CTR</th>
                                    <th className="text-right py-3 px-4">Spend</th>
                                    <th className="text-right py-3 px-4">Purchases</th>
                                    <th className="text-center py-3 px-4">Quality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAds.map((ad, idx) => (
                                    <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                                        <td className="py-3 px-4 text-white">{truncate(ad.ad_name, 35)}</td>
                                        <td className="py-3 px-4 text-[#b4b4c9]">{truncate(ad.campaign_name, 25)}</td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{formatNumber(ad.impressions)}</td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{formatNumber(ad.clicks)}</td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{(ad.ctr || 0).toFixed(2)}%</td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{(ad.spend || 0).toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-green-400">{ad.purchases || 0}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${getQualityClass(ad.quality_ranking)}`}>
                                                {(ad.quality_ranking || '-').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAds.length === 0 && (
                                    <tr><td colSpan={8} className="text-center text-[#8888a4] py-8">No ads data. Click refresh to load.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Insights Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <InsightCard icon={<FaRocket className="text-2xl" />} title="Best Performing Campaign" content={campaignStats[0] ? `${truncate(campaignStats[0].campaign_name, 40)}\n${formatNumber(campaignStats[0].impressions)} impressions\n${formatNumber(campaignStats[0].clicks)} clicks` : 'Loading...'} />
                    <InsightCard icon={<FaLightbulb className="text-2xl" />} title="Optimization Tip" content={summary?.total_ads > 0 ? `You have ${summary.total_ads} active ads. Focus on top performers with high CTR for better ROI.` : 'Click refresh to load data.'} />
                    <InsightCard icon={<FaChartLine className="text-2xl" />} title="Quick Stats" content={`Campaigns: ${summary?.total_campaigns || 0}\nAds: ${summary?.total_ads || 0}\nTotal Spend: ${(summary?.total_spend || 0).toFixed(2)} AED`} />
                </section>

                <footer className="text-center py-6 text-sm text-[#8888a4] border-t border-white/10">
                    <p>Data fetched from Meta Marketing API v21.0 • Showing last {selectedDays} days</p>
                </footer>
            </main>
        </div>
    );
}

function InsightCard({ icon, title, content }) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="text-white">{icon}</div>
                <h4 className="font-semibold text-white">{title}</h4>
            </div>
            <p className="text-[#b4b4c9] whitespace-pre-line text-sm">{content}</p>
        </div>
    );
}

function truncate(text, maxLength) {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatNumber(num) {
    const n = parseFloat(num) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}

function formatObjective(obj) {
    if (!obj) return 'Unknown';
    return obj.replace(/OUTCOME_/g, '').replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getQualityClass(ranking) {
    if (!ranking) return 'bg-gray-500/20 text-gray-400';
    if (ranking.includes('ABOVE')) return 'bg-green-500/20 text-green-400';
    if (ranking === 'AVERAGE') return 'bg-orange-500/20 text-orange-400';
    if (ranking.includes('BELOW')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
}
