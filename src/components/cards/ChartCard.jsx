/**
 * Chart Card Component
 * Wrapper component for chart displays with consistent styling
 */
import PropTypes from 'prop-types';

export default function ChartCard({ title, icon, children, size = 'medium', loading = false }) {
    const sizeClasses = {
        small: 'col-span-1',
        medium: 'col-span-1 lg:col-span-1',
        large: 'col-span-1 lg:col-span-2',
        full: 'col-span-full',
    };

    const heightClasses = {
        small: 'h-[320px]',
        medium: 'h-[320px]',
        large: 'h-[320px]',
        full: 'h-[400px]',
    };

    if (loading) {
        return (
            <div className={`glass-card p-6 ${sizeClasses[size]}`}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 bg-gray-700 rounded w-48 animate-pulse" />
                </div>
                <div className={`skeleton ${heightClasses[size]}`} />
            </div>
        );
    }

    return (
        <div className={`glass-card p-6 ${sizeClasses[size]} hover:shadow-lg transition-shadow duration-300`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <div className={`relative ${heightClasses[size]}`}>
                <div className="absolute inset-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    children: PropTypes.node,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
    loading: PropTypes.bool,
};
