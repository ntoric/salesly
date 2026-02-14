import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Loader2, Inbox } from 'lucide-react';

const Table = ({ columns, data, loading, emptyMessage, onRowClick, actionColumn, selectable, selectedIds = [], onSelectionChange }) => {
    const allSelected = data.length > 0 && selectedIds.length === data.length;

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map(row => row.id));
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="overflow-x-auto bg-white border border-[hsl(var(--border-light))] rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-[hsl(var(--border-light))]">
                <thead className="bg-[hsl(var(--bg-body))]">
                    <tr>
                        {selectable && (
                            <th scope="col" className="px-6 py-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={clsx(
                                    "px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider",
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actionColumn && (
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[hsl(var(--border-light))]">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + (actionColumn ? 1 : 0) + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-[hsl(var(--text-muted))]">
                                    <Loader2 size={32} className="animate-spin mb-3 text-[hsl(var(--primary))]" />
                                    <p>Loading data...</p>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actionColumn ? 1 : 0) + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-[hsl(var(--text-muted))]">
                                    <Inbox size={40} className="mb-3 opacity-20" />
                                    <p>{emptyMessage || 'No records found'}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={clsx(
                                    "transition-colors",
                                    onRowClick ? "cursor-pointer hover:bg-[hsl(var(--bg-body))]" : "hover:bg-[hsl(var(--bg-body))]/50",
                                    selectable && selectedIds.includes(row.id) && "bg-blue-50"
                                )}
                            >
                                {selectable && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(row.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelectRow(row.id);
                                            }}
                                            className="rounded border-gray-300 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                                        />
                                    </td>
                                )}
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--text-main))]">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                                {actionColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {actionColumn(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        header: PropTypes.string.isRequired,
        accessor: PropTypes.string, // Optional if render is provided
        render: PropTypes.func,
        className: PropTypes.string,
    })).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string,
    onRowClick: PropTypes.func,
    actionColumn: PropTypes.func,
    selectable: PropTypes.bool,
    selectedIds: PropTypes.array,
    onSelectionChange: PropTypes.func,
};

export default Table;
