import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SPKProvider } from './contexts/SPKContext';

// Pages
import SalesForm from './pages/SalesForm';
import ConsumerConfirm from './pages/ConsumerConfirm';
import SuccessPage from './pages/SuccessPage';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerValidation from './pages/ManagerValidation';
import SuratJalan from './pages/SuratJalan';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md">
                        <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
                        <p className="text-sm text-slate-600 mb-4">{this.state.error?.message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <SPKProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Sales Flow */}
                        <Route path="/" element={<SalesForm />} />
                        <Route path="/confirm/:spkId" element={<ConsumerConfirm />} />
                        <Route path="/success/:spkId" element={<SuccessPage />} />

                        {/* Manager Flow */}
                        <Route path="/manager" element={<ManagerDashboard />} />
                        <Route path="/manager/validate/:spkId" element={<ManagerValidation />} />
                        <Route path="/manager/surat-jalan/:spkId" element={<SuratJalan />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </SPKProvider>
        </ErrorBoundary>
    );
}
