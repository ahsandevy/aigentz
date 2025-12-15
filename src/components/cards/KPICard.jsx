/**
 * KPI Card Component
 * Displays a single KPI metric with icon and gradient background
 */
import PropTypes from 'prop-types';

const gradientClasses = {
    blue: 'bg-gradient-to-br from-[#4f7cff] to-[#6e95ff]',
    green: 'bg-gradient-to-br from-[#00d47e] to-[#00f5a0]',
    purple: 'bg-gradient-to-br from-[#9b59f5] to-[#b87aff]',
    orange: 'bg-gradient-to-br from-[#ff8c42] to-[#ffaa6c]',
    pink: 'bg-gradient-to-br from-[#ff5e7d] to-[#ff8fab]',
    teal: 'bg-gradient-to-br from-[#00bcd4] to-[#4dd0e1]',
};

export default function KPICard({ title, value, icon, gradient = 'blue', loading = false }) {
    const gradientClass = gradientClasses[gradient] || gradientClasses.blue;

    if (loading) {
        return (
            <div className="glass-card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-700 rounded w-14 mb-1" />
                        <div className="h-3 bg-gray-700 rounded w-20" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-5 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${gradientClass} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="block text-2xl font-bold text-white truncate">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                    <span className="block text-sm text-[#b4b4c9] truncate">{title}</span>
                </div>
            </div>
        </div>
    );
}

KPICard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.node.isRequired,
    gradient: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'pink', 'teal']),
    loading: PropTypes.bool,
};
