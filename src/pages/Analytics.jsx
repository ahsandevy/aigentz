/**
 * Analytics Page - Matches original analytics.html
 * KPIs: Audiences, Daily, Age, Gender, Platform, Region
 * Charts: Age, Gender, Platform, Device, Daily Trend, Region, Age+Gender
 * Table: Custom Audiences
 * Date Range: Dropdown to select 1, 5, 7, 14, or 30 days
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { FaUsers, FaChartBar, FaBirthdayCake, FaVenusMars, FaMobileAlt, FaGlobe, FaLaptop, FaChartLine, FaBullseye, FaSync } from 'react-icons/fa';
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

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: '#b4b4c9' } } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#b4b4c9' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' } },
    },
};

const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: '#b4b4c9' } } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' } },
        y: { grid: { display: false }, ticks: { color: '#b4b4c9' } },
    },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { position: 'bottom', labels: { color: '#b4b4c9', padding: 15 } } },
};

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: { legend: { position: 'top', labels: { color: '#b4b4c9' } } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#b4b4c9' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, position: 'left', ticks: { color: '#b4b4c9' } },
        y1: { grid: { display: false }, position: 'right', ticks: { color: '#b4b4c9' }, title: { display: true, text: 'Spend (AED)', color: '#b4b4c9' } },
    },
};

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const selectedDays = 1; // Fixed to 1 day

    const [summary, setSummary] = useState(null);
    const [ageData, setAgeData] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [ageGenderData, setAgeGenderData] = useState([]);
    const [platformData, setPlatformData] = useState([]);
    const [deviceData, setDeviceData] = useState([]);
    const [regionData, setRegionData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [audiences, setAudiences] = useState([]);

    useEffect(() => { loadData(); }, [selectedDays]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, ageRes, genderRes, ageGenderRes, platformRes, deviceRes, regionRes, dailyRes, audiencesRes] = await Promise.all([
                analyticsAPI.getSummary(selectedDays),
                analyticsAPI.getAgeBreakdown(selectedDays),
                analyticsAPI.getGenderBreakdown(selectedDays),
                analyticsAPI.getAgeGenderBreakdown(selectedDays),
                analyticsAPI.getPlatformBreakdown(selectedDays),
                analyticsAPI.getDeviceBreakdown(selectedDays),
                analyticsAPI.getRegionBreakdown(selectedDays),
                analyticsAPI.getDailyTrend(selectedDays),
                analyticsAPI.getAudiences(),
            ]);
            setSummary(summaryRes);
            setAgeData(ageRes.data || []);
            setGenderData(genderRes.data || []);
            setAgeGenderData(ageGenderRes.data || []);
            setPlatformData(platformRes.data || []);
            setDeviceData(deviceRes.data || []);
            setRegionData(regionRes.data || []);
            setDailyData(dailyRes.data || []);
            setAudiences(audiencesRes.data || []);
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
                setMessage({ type: 'info', text: `Data for last ${selectedDays} days already exists. Click "Force" to update.` });
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

    // Age chart - impressions + clicks
    const ageChartData = {
        labels: ageData.map(d => d.age).sort(),
        datasets: [
            { label: 'Impressions', data: ageData.sort((a, b) => a.age.localeCompare(b.age)).map(d => d.impressions), backgroundColor: colors.blue, borderRadius: 6 },
            { label: 'Clicks', data: ageData.sort((a, b) => a.age.localeCompare(b.age)).map(d => d.clicks), backgroundColor: colors.green, borderRadius: 6 },
        ],
    };

    // Gender doughnut
    const genderChartData = {
        labels: genderData.map(d => d.gender === 'female' ? 'Female' : d.gender === 'male' ? 'Male' : d.gender),
        datasets: [{ data: genderData.map(d => d.impressions), backgroundColor: [colors.pink, colors.blue, colors.purple], borderWidth: 0, hoverOffset: 10 }],
    };

    // Platform horizontal bar
    const platformLabels = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        audience_network: 'Audience Network',
        messenger: 'Messenger'
    };
    const platformChartData = {
        labels: platformData.map(d => platformLabels[d.publisher_platform?.toLowerCase()] || d.publisher_platform),
        datasets: [
            { label: 'Impressions', data: platformData.map(d => d.impressions), backgroundColor: colors.blue, borderRadius: 6 },
            { label: 'Spend (AED)', data: platformData.map(d => d.spend), backgroundColor: colors.orange, borderRadius: 6 },
        ],
    };

    // Device bar
    const deviceChartData = {
        labels: deviceData.map(d => (d.device_platform || 'Unknown').charAt(0).toUpperCase() + (d.device_platform || '').slice(1)),
        datasets: [
            { label: 'Impressions', data: deviceData.map(d => d.impressions), backgroundColor: colors.teal, borderRadius: 6 },
            { label: 'Spend (AED)', data: deviceData.map(d => d.spend), backgroundColor: colors.orange, borderRadius: 6 },
        ],
    };

    // Daily trend line
    const dailyChartData = {
        labels: dailyData.map(d => d.date),
        datasets: [
            { label: 'Impressions', data: dailyData.map(d => d.impressions), borderColor: colors.blue, backgroundColor: colors.blue + '20', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: colors.blue },
            { label: 'Clicks', data: dailyData.map(d => d.clicks), borderColor: colors.green, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, pointBackgroundColor: colors.green },
            { label: 'Spend (AED)', data: dailyData.map(d => d.spend), borderColor: colors.orange, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, pointBackgroundColor: colors.orange, yAxisID: 'y1' },
        ],
    };

    // Region horizontal bar
    const regionChartData = {
        labels: regionData.slice(0, 10).map(d => d.region || d.country || 'Unknown'),
        datasets: [{ label: 'Impressions', data: regionData.slice(0, 10).map(d => d.impressions), backgroundColor: colorPalette, borderRadius: 6 }],
    };

    // Age + Gender stacked bar
    const ages = [...new Set(ageGenderData.map(d => d.age))].sort();
    const ageGenderChartData = {
        labels: ages,
        datasets: [
            { label: 'Male', data: ages.map(age => { const item = ageGenderData.find(d => d.age === age && d.gender === 'male'); return item ? item.impressions : 0; }), backgroundColor: colors.blue, borderRadius: 4 },
            { label: 'Female', data: ages.map(age => { const item = ageGenderData.find(d => d.age === age && d.gender === 'female'); return item ? item.impressions : 0; }), backgroundColor: colors.pink, borderRadius: 4 },
        ],
    };

    // Filter audiences by search
    const filteredAudiences = audiences.filter(a => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.subtype || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#0f0f23]">
            {/* Header */}
            <header className="bg-[#1a1a2e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#9b59f5] to-[#4f7cff] flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">Extended Analytics</h1>
                                <p className="text-xs sm:text-sm text-[#b4b4c9] hidden sm:block">Demographics, Platforms & Audiences</p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                            <nav className="flex gap-2">
                                <Link to="/" className="px-3 xl:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors text-sm xl:text-base">Overview</Link>
                                <Link to="/analytics" className="px-3 xl:px-4 py-2 rounded-lg bg-[#4f7cff] text-white font-medium text-sm xl:text-base">Analytics</Link>
                            </nav>

                            <button onClick={() => handleRefresh(false)} disabled={refreshing} className={`px-3 xl:px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${refreshing ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#00d47e] to-[#00f5a0] hover:shadow-lg'} text-white font-medium text-sm xl:text-base`}>
                                <FaSync className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden xl:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                            <button onClick={() => handleRefresh(true)} disabled={refreshing} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors text-sm" title="Force refresh from API">
                                Force
                            </button>
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
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white transition-colors">Overview</Link>
                                <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg bg-[#4f7cff] text-white font-medium">Analytics</Link>
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
                    <KPICard title="Custom Audiences" value={summary?.total_audiences || 0} icon={<FaUsers className="text-lg" />} gradient="blue" loading={loading} />
                    <KPICard title="Daily Stats Records" value={summary?.total_daily_records || 0} icon={<FaChartBar className="text-lg" />} gradient="green" loading={loading} />
                    <KPICard title="Age Breakdown Records" value={summary?.total_age_records || 0} icon={<FaBirthdayCake className="text-lg" />} gradient="purple" loading={loading} />
                    <KPICard title="Gender Stats Records" value={summary?.total_gender_records || 0} icon={<FaVenusMars className="text-lg" />} gradient="orange" loading={loading} />
                    <KPICard title="Platform Stats Records" value={summary?.total_platform_records || 0} icon={<FaMobileAlt className="text-lg" />} gradient="pink" loading={loading} />
                    <KPICard title="Region Stats Records" value={summary?.total_region_records || 0} icon={<FaGlobe className="text-lg" />} gradient="teal" loading={loading} />
                </section>

                {/* Row 1: Age & Gender */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Performance by Age Group" icon={<FaBirthdayCake className="w-5 h-5" />} loading={loading}>
                        <Bar data={ageChartData} options={barOptions} />
                    </ChartCard>
                    <ChartCard title="Performance by Gender" icon={<FaVenusMars className="w-5 h-5" />} loading={loading}>
                        <Doughnut data={genderChartData} options={doughnutOptions} />
                    </ChartCard>
                </section>

                {/* Row 2: Platform & Device */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Performance by Platform" icon={<FaMobileAlt className="w-5 h-5" />} loading={loading}>
                        <Bar data={platformChartData} options={horizontalBarOptions} />
                    </ChartCard>
                    <ChartCard title="Performance by Device" icon={<FaLaptop className="w-5 h-5" />} loading={loading}>
                        <Bar data={deviceChartData} options={barOptions} />
                    </ChartCard>
                </section>

                {/* Row 3: Daily Trend */}
                <section className="mb-6">
                    <ChartCard title="Daily Performance Trend" icon={<FaChartLine className="w-5 h-5" />} size="full" loading={loading}>
                        <div style={{ height: '350px' }}>
                            <Line data={dailyChartData} options={lineOptions} />
                        </div>
                    </ChartCard>
                </section>

                {/* Row 4: Region & Age+Gender */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Performance by Region" icon={<FaGlobe className="w-5 h-5" />} loading={loading}>
                        <Bar data={regionChartData} options={{ ...horizontalBarOptions, plugins: { legend: { display: false } } }} />
                    </ChartCard>
                    <ChartCard title="Age + Gender Combined" icon={<FaUsers className="w-5 h-5" />} loading={loading}>
                        <Bar data={ageGenderChartData} options={{ ...barOptions, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: '#b4b4c9' } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b4b4c9' } } } }} />
                    </ChartCard>
                </section>

                {/* Custom Audiences Table */}
                <section className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FaBullseye className="w-5 h-5" />
                            Custom Audiences
                        </h3>
                        <input type="text" placeholder="Search audiences..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-[#8888a4] focus:outline-none focus:border-[#4f7cff]" />
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="data-table text-sm w-full">
                            <thead className="sticky top-0 bg-[#1a1a2e]">
                                <tr>
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Type</th>
                                    <th className="text-right py-3 px-4">Size (Est.)</th>
                                    <th className="text-right py-3 px-4">Created</th>
                                    <th className="text-right py-3 px-4">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAudiences.map((audience, idx) => (
                                    <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                                        <td className="py-3 px-4 text-white">{truncate(audience.name, 40)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${audience.subtype === 'LOOKALIKE' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                {audience.subtype || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">
                                            {formatNumber(audience.approximate_count_lower_bound)} - {formatNumber(audience.approximate_count_upper_bound)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{formatDate(audience.time_created)}</td>
                                        <td className="py-3 px-4 text-right text-[#b4b4c9]">{formatDate(audience.time_updated)}</td>
                                    </tr>
                                ))}
                                {filteredAudiences.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-[#8888a4] py-8">No audience data. Click refresh to load.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="text-center py-6 text-sm text-[#8888a4] border-t border-white/10">
                    <p>Extended Analytics from Meta Marketing API v21.0 • Showing last {selectedDays} days</p>
                </footer>
            </main>
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

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch (e) {
        return '-';
    }
}
