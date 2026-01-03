import React, { useState, useEffect } from 'react';
import { depotReportsApi } from '../utils/api';

interface DepotReportsProps {
    assignedDepotId: string | null;
}

export default function DepotReports({ assignedDepotId }: DepotReportsProps) {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [paymentReport, setPaymentReport] = useState<any>(null);
    const [deliveryReport, setDeliveryReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (assignedDepotId) {
            loadReports();
        }
    }, [assignedDepotId]);

    const loadReports = async () => {
        if (!assignedDepotId) return;

        setIsLoading(true);
        try {
            const fromDate = dateRange.from || undefined;
            const toDate = dateRange.to || undefined;

            const [paymentData, deliveryData] = await Promise.all([
                depotReportsApi.getPaymentReport(assignedDepotId, fromDate, toDate),
                depotReportsApi.getDeliveryReport(assignedDepotId, fromDate, toDate)
            ]);

            setPaymentReport(paymentData);
            setDeliveryReport(deliveryData);
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Failed to load reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyFilter = () => {
        loadReports();
    };

    const exportToExcel = (data: any[], filename: string) => {
        // Simple CSV export
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row =>
            Object.values(row).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
        );

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!assignedDepotId) {
        return (
            <div className="p-4 md:p-8">
                <div className="text-center py-12">
                    <p className="text-gray-600">No depot assigned</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 overflow-x-hidden">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Depot Reports</h1>
                <p className="text-gray-600 text-sm md:text-base">Payment and delivery tracking for your depot</p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="sm:self-end">
                        <button
                            onClick={handleApplyFilter}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300"
                        >
                            {isLoading ? 'Loading...' : 'Apply Filter'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Report */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">💵 Payment Report (To-Pay Collections)</h2>
                    <button
                        onClick={() => paymentReport && exportToExcel(paymentReport.payments, 'payment_report')}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Export Excel
                    </button>
                </div>

                {paymentReport && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                            <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Total Collections</p>
                                <p className="text-lg md:text-2xl font-bold text-blue-600">₹{paymentReport.summary.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Cash</p>
                                <p className="text-lg md:text-2xl font-bold text-green-600">₹{paymentReport.summary.cash.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Online/UPI</p>
                                <p className="text-lg md:text-2xl font-bold text-purple-600">₹{paymentReport.summary.online.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Total Payments</p>
                                <p className="text-lg md:text-2xl font-bold text-gray-700">{paymentReport.summary.count}</p>
                            </div>
                        </div>

                        {/* Payment Table - Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paymentReport.payments.map((payment: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(payment.date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.receipt_number}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{payment.customer_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{payment.destination}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {payment.payment_method === 'cash' ? 'Cash' : 'Online'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Cards - Mobile */}
                        <div className="md:hidden space-y-3">
                            {paymentReport.payments.map((payment: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{payment.receipt_number}</p>
                                            <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {payment.payment_method === 'cash' ? 'Cash' : 'Online'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 truncate mr-2">{payment.customer_name}</span>
                                        <span className="font-bold text-gray-900">₹{payment.amount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!paymentReport && !isLoading && (
                    <p className="text-center text-gray-500 py-8">No payment data available</p>
                )}
            </div>

            {/* Delivery Report */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">📦 Delivery Report</h2>
                    <button
                        onClick={() => deliveryReport && exportToExcel(deliveryReport.deliveries, 'delivery_report')}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Export Excel
                    </button>
                </div>

                {deliveryReport && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                            <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Total Bookings</p>
                                <p className="text-lg md:text-2xl font-bold text-blue-600">{deliveryReport.summary.total}</p>
                            </div>
                            <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Delivered</p>
                                <p className="text-lg md:text-2xl font-bold text-green-600">{deliveryReport.summary.delivered}</p>
                            </div>
                            <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Pending</p>
                                <p className="text-lg md:text-2xl font-bold text-orange-600">{deliveryReport.summary.pending}</p>
                            </div>
                            <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-gray-600">Total Packages</p>
                                <p className="text-lg md:text-2xl font-bold text-purple-600">{deliveryReport.summary.totalPackages}</p>
                            </div>
                        </div>

                        {/* Delivery Table - Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Packages</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {deliveryReport.deliveries.map((delivery: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(delivery.date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{delivery.receipt_number}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.customer_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{delivery.destination}</td>
                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">{delivery.packages}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {delivery.delivery_instructions.includes('Home') ? 'Home Delivery' : 'Pickup'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {delivery.status === 'delivered' ? 'Delivered' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Delivery Cards - Mobile */}
                        <div className="md:hidden space-y-3">
                            {deliveryReport.deliveries.map((delivery: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{delivery.receipt_number}</p>
                                            <p className="text-xs text-gray-500">{new Date(delivery.date).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {delivery.status === 'delivered' ? 'Delivered' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 truncate">{delivery.customer_name}</span>
                                            <span className="text-sm font-medium text-gray-900">{delivery.packages} pkg</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{delivery.destination} • {delivery.delivery_instructions.includes('Home') ? 'Home Delivery' : 'Pickup'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!deliveryReport && !isLoading && (
                    <p className="text-center text-gray-500 py-8">No delivery data available</p>
                )}
            </div>
        </div>
    );
}

