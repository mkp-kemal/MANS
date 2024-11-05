// App.js
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Stocks from './components/user/Stocks';
import Dashboard from './components/user/Dashboard';
import { useState } from 'react';
import { Button } from 'antd';
import { HomeFilled, MenuOutlined } from '@ant-design/icons';
import Sidebar from './components/user/Sidebar';
import Authentication from './components/admin/Authentication';
import DashboardPanel from './components/admin/DashboardPanel';

const App = () => {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
};

const MainRoutes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toHome = () => {
    window.location.href = '/';
  }
  const location = useLocation();

  return (
    <>
      <div className="pt-19">
        {location.pathname !== '/admin' ? (
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={toggleSidebar}
            className="absolute top-6 left-6"
          >
          </Button>
        ) : (
          <Button
            type="link"
            icon={<HomeFilled />}
            onClick={toHome}
            className="absolute top-6 left-6"
          >
          </Button>
        )}

        {/* Sidebar */}
        <Sidebar visible={isSidebarOpen} onClose={toggleSidebar} />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/admin" element={<Authentication />} />
          <Route path="/admin/management" element={<DashboardPanel />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
