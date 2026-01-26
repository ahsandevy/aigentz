
import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // 'alert', 'confirm', 'success', 'error'
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel',
    });

    const showAlert = useCallback((title, message, confirmText = 'OK') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'alert',
                title,
                message,
                confirmText,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
        });
    }, []);

    const showConfirm = useCallback((title, message, confirmText = 'Confirm', cancelText = 'Cancel') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                confirmText,
                cancelText,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                },
            });
        });
    }, []);

    const showSuccess = useCallback((title, message, confirmText = 'OK') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'success',
                title,
                message,
                confirmText,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
        });
    }, []);

    const showError = useCallback((title, message, confirmText = 'Got it') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'error',
                title,
                message,
                confirmText,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
        });
    }, []);

    const closeModal = useCallback(() => {
        setModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showSuccess, showError, closeModal, modal }}>
            {children}
            <ModalComponent />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

const ModalComponent = () => {
    const { modal, closeModal } = useModal();

    if (!modal.isOpen) return null;

    const getTypeStyles = () => {
        switch (modal.type) {
            case 'success':
                return {
                    icon: (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ),
                    buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                };
            case 'error':
                return {
                    icon: (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    ),
                    buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                };
            case 'confirm':
                return {
                    icon: (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    ),
                    buttonColor: 'bg-[#1e4a79] hover:bg-[#153a5f] focus:ring-[#1e4a79]',
                };
            default:
                return {
                    icon: (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    ),
                    buttonColor: 'bg-[#1e4a79] hover:bg-[#153a5f] focus:ring-[#1e4a79]',
                };
        }
    };

    const { icon, buttonColor } = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[10000] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-300"
                    aria-hidden="true"
                    onClick={modal.type === 'confirm' ? undefined : closeModal}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Panel */}
                <div className="relative inline-block align-bottom bg-white/90 backdrop-blur-md rounded-3xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20 animate-fadeIn">
                    <div>
                        {icon}
                        <div className="mt-4 text-center">
                            <h3 className="text-2xl leading-7 font-extrabold text-[#1a365d] tracking-tight mb-3" id="modal-title">
                                {modal.title}
                            </h3>
                            <div className="mt-3">
                                <p className="text-base text-gray-600 whitespace-pre-line font-medium leading-relaxed px-2">
                                    {modal.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            className={`inline-flex justify-center items-center w-full rounded-2xl border border-transparent shadow-lg px-6 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${buttonColor}`}
                            onClick={modal.onConfirm}
                        >
                            {modal.confirmText}
                        </button>
                        {modal.type === 'confirm' && (
                            <button
                                type="button"
                                className="inline-flex justify-center items-center w-full rounded-2xl border border-gray-200 shadow-sm px-6 py-3.5 bg-white text-base font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100"
                                onClick={modal.onCancel}
                            >
                                {modal.cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
