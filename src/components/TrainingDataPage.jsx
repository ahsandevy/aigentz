import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingDataService } from '../services/trainingData';
import { adminAuthService } from '../services/adminAuth';
import {
    Search, Plus, LogOut, Download, Loader2,
    Trash2, Edit2, Save, X, Database, Terminal,
    CheckCircle, AlertCircle, AlertTriangle, Play,
    ChevronDown, ChevronUp, Table
} from 'lucide-react';

const TrainingDataPage = () => {
    const [examples, setExamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editQuestion, setEditQuestion] = useState('');
    const [editSql, setEditSql] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newSql, setNewSql] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    // SQL Execution state
    const [executing, setExecuting] = useState(false);
    const [executingRowId, setExecutingRowId] = useState(null);
    const [testResults, setTestResults] = useState(null); // { success: bool, data: [], error: string, row_count: number }
    const [resultsByRow, setResultsByRow] = useState({}); // { id: { success, data, error, row_count } }

    const navigate = useNavigate();

    // UI State for Modals and Toasts
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
    const [confirmation, setConfirmation] = useState(null); // { message: '', onConfirm: () => {}, type: 'danger' | 'info' }

    useEffect(() => {
        fetchExamples();
    }, []);

    // Auto-dismiss notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
    };

    const fetchExamples = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await trainingDataService.fetchAll();
            setExamples(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await adminAuthService.logout();
        navigate('/admin/login');
    };

    const handleAdd = async () => {
        if (!newQuestion.trim() || !newSql.trim()) {
            showNotification('error', 'Both question and SQL are required');
            return;
        }

        try {
            await trainingDataService.create(newQuestion, newSql);
            setShowAddModal(false);
            setNewQuestion('');
            setNewSql('');
            setTestResults(null);
            fetchExamples();
            showNotification('success', 'Training example added successfully');
        } catch (err) {
            showNotification('error', 'Failed to add: ' + err.message);
        }
    };

    const handleRunQuery = async (sql, rowId = null) => {
        if (!sql.trim()) {
            showNotification('error', 'SQL query is empty');
            return;
        }

        try {
            if (rowId) {
                setExecutingRowId(rowId);
            } else {
                setExecuting(true);
            }

            const result = await trainingDataService.execute(sql);

            if (rowId) {
                setResultsByRow(prev => ({ ...prev, [rowId]: result }));
            } else {
                setTestResults(result);
            }

            if (!result.success) {
                showNotification('error', 'Execution Failed');
            } else {
                showNotification('success', `Success: ${result.row_count} rows found`);
            }
        } catch (err) {
            const errorResult = { success: false, error: err.message };
            if (rowId) {
                setResultsByRow(prev => ({ ...prev, [rowId]: errorResult }));
            } else {
                setTestResults(errorResult);
            }
            showNotification('error', 'Execution Error: ' + err.message);
        } finally {
            setExecuting(false);
            setExecutingRowId(null);
        }
    };

    const handleStartEdit = (example) => {
        setEditingId(example.id);
        setEditQuestion(example.question);
        setEditSql(example.sql);
    };

    const handleSaveEdit = async (id) => {
        if (!editQuestion.trim() || !editSql.trim()) {
            showNotification('error', 'Both question and SQL are required');
            return;
        }

        try {
            // Validate SQL first
            const validation = await trainingDataService.validate(editSql);
            if (!validation.valid) {
                showNotification('error', validation.message);
                return;
            }

            await trainingDataService.update(id, editQuestion, editSql);
            setEditingId(null);
            fetchExamples();
            showNotification('success', 'Training example updated successfully');
        } catch (err) {
            showNotification('error', 'Failed to update: ' + err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditQuestion('');
        setEditSql('');
    };

    const handleDeleteClick = (id) => {
        setConfirmation({
            message: 'Are you sure you want to delete this training example? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => handleDeleteConfirm(id)
        });
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await trainingDataService.delete(id);
            fetchExamples();
            showNotification('success', 'Training example deleted');
        } catch (err) {
            showNotification('error', 'Failed to delete: ' + err.message);
        } finally {
            setConfirmation(null);
        }
    };

    const handleExportClick = () => {
        setConfirmation({
            message: 'Do you want to export all training data to a JSON file?',
            type: 'info',
            onConfirm: handleExportConfirm
        });
    };

    const handleExportConfirm = async () => {
        setConfirmation(null);
        try {
            setExporting(true);
            const result = await trainingDataService.export();

            // Create a blob from the JSON data
            const jsonString = JSON.stringify(result, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create a link to download the blob
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `training_data_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('success', `Successfully exported ${result.count} examples`);
        } catch (err) {
            showNotification('error', 'Failed to export: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const filteredExamples = examples.filter(ex =>
        ex.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.sql.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper component for results
    const SQLResultsTable = ({ result }) => {
        if (!result) return null;

        if (!result.success) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 animate-scale-in">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-red-800 font-bold text-sm mb-1">SQL Error</p>
                            <p className="text-red-600 text-xs font-mono break-all">{result.error}</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (result.row_count === 0) {
            return (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-4 text-center animate-scale-in">
                    <p className="text-slate-500 text-sm">Query executed successfully but returned no results.</p>
                </div>
            );
        }

        const columns = Object.keys(result.data[0]);

        return (
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden animate-scale-in bg-white">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 text-xs font-bold uppercase flex items-center gap-2">
                        <Table size={14} />
                        Query Results ({result.row_count} rows)
                    </span>
                    {result.row_count > 100 && (
                        <span className="text-amber-600 text-[10px] font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                            Showing first 100 rows
                        </span>
                    )}
                </div>
                <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-3 py-2 border-b border-slate-200 font-bold text-slate-700 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic">
                            {result.data.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                    {columns.map(col => (
                                        <td key={col} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                            {String(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white p-6 relative">
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in
                    ${notification.type === 'success'
                        ? 'bg-white border-emerald-100 text-emerald-700'
                        : 'bg-white border-red-100 text-red-700'}`}
                >
                    {notification.type === 'success'
                        ? <CheckCircle size={24} className="text-emerald-500" />
                        : <AlertCircle size={24} className="text-red-500" />
                    }
                    <p className="font-medium text-sm">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmation && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4
                                ${confirmation.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}
                            >
                                {confirmation.type === 'danger' ? <AlertTriangle size={32} /> : <Download size={32} />}
                            </div>
                            <h3 className="text-slate-800 text-xl font-bold mb-2">
                                {confirmation.type === 'danger' ? 'Delete Example?' : 'Export Data?'}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {confirmation.message}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmation(null)}
                                className="flex-1 py-2.5 bg-slate-100 to-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmation.onConfirm}
                                className={`flex-1 py-2.5 text-white rounded-lg font-medium shadow-md transition-all
                                    ${confirmation.type === 'danger'
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                {confirmation.type === 'danger' ? 'Yes, Delete' : 'Yes, Export'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 mb-6 flex justify-between items-center shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-slate-800 text-2xl font-bold mb-1 flex items-center gap-3">
                            <Database className="text-blue-600" size={28} />
                            Training Data Management
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {examples.length} total examples · {filteredExamples.length} visible
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportClick}
                            disabled={exporting}
                            className={`flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm
                                ${exporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <Download size={18} />
                            {exporting ? 'Exporting...' : 'Export Data'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm cursor-pointer"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-xl p-4 mb-6 flex gap-4 items-center shadow-sm border border-slate-100">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search questions or SQL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all font-medium text-sm cursor-pointer"
                    >
                        <Plus size={20} />
                        Add New Example
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                        <Loader2 className="animate-spin mb-3" size={32} />
                        <p>Loading database...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-600">
                        Error: {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Question</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[45%]">SQL Query</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExamples.map((ex) => (
                                    <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            {editingId === ex.id ? (
                                                <textarea
                                                    value={editQuestion}
                                                    onChange={(e) => setEditQuestion(e.target.value)}
                                                    className="w-full min-h-[80px] p-3 bg-white border border-blue-300 rounded-lg text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                />
                                            ) : (
                                                <span className="text-slate-700 text-sm leading-relaxed block">{ex.question}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top bg-slate-50/50">
                                            {editingId === ex.id ? (
                                                <div className="relative group/edit">
                                                    <textarea
                                                        value={editSql}
                                                        onChange={(e) => {
                                                            setEditSql(e.target.value);
                                                            if (testResults) setTestResults(null);
                                                        }}
                                                        className="w-full min-h-[100px] p-3 bg-white border border-blue-300 rounded-lg text-blue-600 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                    />
                                                    <button
                                                        onClick={() => handleRunQuery(editSql)}
                                                        disabled={executing || !editSql.trim()}
                                                        className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-slate-800 text-white text-[9px] font-bold uppercase rounded hover:bg-black transition-all disabled:opacity-50 group shadow-md"
                                                    >
                                                        {executing ? (
                                                            <Loader2 size={10} className="animate-spin" />
                                                        ) : (
                                                            <Play size={10} />
                                                        )}
                                                    </button>
                                                    {testResults && (
                                                        <div className="mt-2">
                                                            <SQLResultsTable result={testResults} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2 items-start justify-between group/row">
                                                        <div className="flex gap-2">
                                                            <Terminal size={14} className="text-slate-400 mt-1 shrink-0" />
                                                            <code className="text-blue-600 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                                                {ex.sql}
                                                            </code>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRunQuery(ex.sql, ex.id)}
                                                            disabled={executingRowId === ex.id}
                                                            className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                                                            title="Execute Query"
                                                        >
                                                            {executingRowId === ex.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                                            TEST
                                                        </button>
                                                    </div>

                                                    {resultsByRow[ex.id] && (
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setResultsByRow(prev => {
                                                                    const next = { ...prev };
                                                                    delete next[ex.id];
                                                                    return next;
                                                                })}
                                                                className="absolute -top-2 -right-2 z-20 p-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 shadow-sm transition-colors"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                            <SQLResultsTable result={resultsByRow[ex.id]} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            {editingId === ex.id ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleSaveEdit(ex.id)}
                                                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
                                                        title="Save"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleStartEdit(ex)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(ex.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                                <h2 className="text-slate-800 text-xl font-bold flex items-center gap-2">
                                    <Plus className="text-blue-600" size={24} />
                                    Add New Training Example
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-slate-700 text-sm font-bold mb-2">
                                        Question
                                    </label>
                                    <textarea
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="e.g., How much did I spend on ads this week?"
                                        className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 text-sm font-bold mb-2 flex justify-between">
                                        SQL Query
                                        <span className="text-blue-600 font-normal text-xs bg-blue-50 px-2 py-0.5 rounded-full">SQLite Compatible</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
                                            <Terminal size={16} />
                                        </div>
                                        <textarea
                                            value={newSql}
                                            onChange={(e) => {
                                                setNewSql(e.target.value);
                                                if (testResults) setTestResults(null);
                                            }}
                                            placeholder="SELECT SUM(spend) FROM campaign_stats WHERE..."
                                            className="w-full min-h-[150px] p-4 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 leading-relaxed"
                                        />
                                        <button
                                            onClick={() => handleRunQuery(newSql)}
                                            disabled={executing || !newSql.trim()}
                                            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
                                        >
                                            {executing ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                            )}
                                            {executing ? 'Executing...' : 'Run Query'}
                                        </button>
                                    </div>
                                    <SQLResultsTable result={testResults} />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewQuestion('');
                                        setNewSql('');
                                    }}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <Plus size={18} />
                                    Add Example
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingDataPage;
