// Sidebar.jsx
import { Menu, Drawer } from "antd";
import { HomeOutlined, ShoppingCartOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Sidebar = ({ visible, onClose }) => {
    const token = document.cookie
        .split(';')
        .map(cookie => cookie.split('='))
        .find(cookie => cookie[0].trim() === 'jwt')?.[1];

    const onLogout = () => {
        document.cookie.split(";").forEach(cookie => {
            const name = cookie.split("=")[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        window.location.href = '/';
    };

    // Define menu items
    const menuItems = [
        {
            key: "dashboard",
            icon: <HomeOutlined />,
            label: <Link to="/" onClick={onClose}>Dashboard</Link>,
        },
        {
            key: "stocks",
            icon: <ShoppingCartOutlined />,
            label: <Link to="/stocks" onClick={onClose}>Stocks</Link>,
        },
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: <Link to="/settings" onClick={onClose}>Settings</Link>,
        },
        token
            ? {
                key: "logout",
                icon: <LogoutOutlined />,
                label: <Link onClick={onLogout}>Logout</Link>,
            }
            : {
                key: "admin",
                icon: <BarChartOutlined />,
                label: <Link to="/admin" onClick={onClose}>Admin Panel</Link>,
            },
    ];

    return (
        <Drawer
            title="Menu"
            placement="left"
            onClose={onClose}
            open={visible}
            width={250}
        >
            <Menu mode="inline" items={menuItems} />
        </Drawer>
    );
};

export default Sidebar;
