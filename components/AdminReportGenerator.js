import { useState, useEffect } from 'react';

export default function AdminReportGenerator() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        command: 'All',
        start_date: '',
        end_date: ''
    });
    const [commands, setCommands] = useState([]);

    useEffect(() => {
        fetchCommands();
        loadReports();
    }, []);

    const fetchCommands = async () => {
        try {
            const response = await fetch('/api/get_commands.php');
            const data = await response.json();
            if (data.success) {
                setCommands(['All', ...data.commands]);
            }
        } catch (error) {
            console.error('Error fetching commands:', error);
        }
    };

    const loadReports = async () => {
        setLoading(true);
        try {
            let url = '/api/get_all_weekly_reports.php?';
            if (filter.command && filter.command !== 'All') {
                url += `command=${encodeURIComponent(filter.command)}&`;
            }
            if (filter.start_date) {
                url += `start_date=${filter.start_date}&`;
            }
            if (filter.end_date) {
                url += `end_date=${filter.end_date}&`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
        setLoading(false);
    };

    const exportToExcel = () => {
        if (reports.length === 0) {
            alert('No data to export');
            return;
        }

        const exportData = reports.map(r => ({
            'Report Date': r.report_date,
            'Command': r.command_name,
            'Type of Service': r.type_of_service,
            'Location': r.location_served,
            'Command Strength': r.command_strength,
            '1st Service': r.service_1_attendance,
            '2nd Service': r.service_2_attendance,
            '3rd Service': r.service_3_attendance,
            'Average %': r.average_attendance,
            'Submitted By': r.submitted_by_name,
            'Submitted On': new Date(r.created_at).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Weekly Reports');
        XLSX.writeFile(wb, `weekly_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Generate Weekly Command Reports</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Command</label>
                    <select
                        value={filter.command}
                        onChange={(e) => setFilter({ ...filter, command: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        {commands.map(cmd => (
                            <option key={cmd} value={cmd}>{cmd}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={filter.start_date}
                        onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={filter.end_date}
                        onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="flex gap-2 items-end">
                    <button
                        onClick={loadReports}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                        Filter
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={reports.length === 0}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-8">Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No reports found for the selected criteria
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Command</th>
                                <th className="px-3 py-2 text-left">Service Type</th>
                                <th className="px-3 py-2 text-center">1st</th>
                                <th className="px-3 py-2 text-center">2nd</th>
                                <th className="px-3 py-2 text-center">3rd</th>
                                <th className="px-3 py-2 text-center">Avg %</th>
                                <th className="px-3 py-2 text-left">Submitted By</th>
                                <th className="px-3 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{report.report_date}</td>
                                    <td className="px-3 py-2 font-semibold">{report.command_name}</td>
                                    <td className="px-3 py-2">{report.type_of_service}</td>
                                    <td className="px-3 py-2 text-center">{report.service_1_attendance}</td>
                                    <td className="px-3 py-2 text-center">{report.service_2_attendance}</td>
                                    <td className="px-3 py-2 text-center">{report.service_3_attendance}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${report.average_attendance >= 70 ? 'bg-green-100 text-green-700' :
                                                report.average_attendance >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {report.average_attendance}%
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs">{report.submitted_by_name}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => window.open(`/api/generate_report_pdf.php?id=${report.id}`, '_blank')}
                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                        >
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-500">
                        Total Reports: {reports.length}
                    </div>
                </div>
            )}
        </div>
    );
}