// Dashboard.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const data = [
        { month: 'Jan', pemasukan: 4000, pengeluaran: 2400, total: 1600 },
        { month: 'Feb', pemasukan: 3000, pengeluaran: 1398, total: 1602 },
        { month: 'Mar', pemasukan: 2000, pengeluaran: 9800, total: -7800 },
        { month: 'Apr', pemasukan: 2780, pengeluaran: 3908, total: -1128 },
        { month: 'May', pemasukan: 1890, pengeluaran: 4800, total: -2910 },
        { month: 'Jun', pemasukan: 2390, pengeluaran: 3800, total: -1410 },
        { month: 'Jul', pemasukan: 3490, pengeluaran: 4300, total: -810 },
    ];

    return (
        <div className="dashboard-container">
            <h2 className="text-center text-2xl font-bold my-4">Grafik Stok Bulanan</h2>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pemasukan" fill="#82ca9d" name="Pemasukan Stok" />
                    <Bar dataKey="pengeluaran" fill="#8884d8" name="Pengeluaran Stok" />
                    <Bar dataKey="total" fill="#ffc658" name="Total Stok" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Dashboard;
