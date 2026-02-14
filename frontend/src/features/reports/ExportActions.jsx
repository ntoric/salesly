import PropTypes from 'prop-types';
import { FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react';
import { useState } from 'react';

const ExportActions = ({ onExportCSV, onExportExcel, onPrintLabel, showPrint = false, loading = false }) => {
    const [activeAction, setActiveAction] = useState(null);

    const handleAction = async (actionFn, actionName) => {
        if (!actionFn || loading) return;
        setActiveAction(actionName);
        try {
            await actionFn();
        } catch (error) {
            console.error("Export failed", error);
        } finally {
            setActiveAction(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleAction(onExportCSV, 'csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--text-secondary))] border border-[hsl(var(--border-light))] rounded-md hover:bg-[hsl(var(--bg-card))] transition-colors"
                title="Export CSV"
            >
                {activeAction === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span className="hidden sm:inline">CSV</span>
            </button>

            <button
                onClick={() => handleAction(onExportExcel, 'excel')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--text-secondary))] border border-[hsl(var(--border-light))] rounded-md hover:bg-[hsl(var(--bg-card))] transition-colors"
                title="Export Excel"
            >
                {activeAction === 'excel' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                <span className="hidden sm:inline">Excel</span>
            </button>

            {showPrint && (
                <button
                    onClick={() => handleAction(onPrintLabel, 'print')}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--primary))] border border-[hsl(var(--primary))/30] bg-[hsl(var(--primary))/10] rounded-md hover:bg-[hsl(var(--primary))/20] transition-colors"
                    title="Print Address Label"
                >
                    {activeAction === 'print' ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                    <span className="hidden sm:inline">Label</span>
                </button>
            )}
        </div>
    );
};

ExportActions.propTypes = {
    onExportCSV: PropTypes.func,
    onExportExcel: PropTypes.func,
    onPrintLabel: PropTypes.func,
    showPrint: PropTypes.bool,
    loading: PropTypes.bool,
};

export default ExportActions;
