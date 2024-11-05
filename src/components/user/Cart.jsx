/* eslint-disable react/prop-types */
import { Button, Drawer, Table, notification } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { TbShoppingCartOff } from 'react-icons/tb';
import { formatRupiah } from '../../Helper/FormatRupiah';
import { useState } from 'react';
import axios from 'axios';

const Cart = ({
    cart,
    products,
    isDrawerOpen,
    toggleDrawer,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
}) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async (barcode, quantity) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/v1/api/pay', {
                barcode,
                quantity,
            });

            notification.success({
                message: 'Pembayaran Berhasil',
                description: response.data.message,
                placement: 'bottomRight',
            });

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            // Show error notification
            notification.error({
                message: 'Pembayaran Gagal',
                description: error.response.data.message,
                placement: 'bottomRight',
            });
        } finally {
            setLoading(true);
        }
    };

    return (
        <Drawer
            title="Keranjang Belanja"
            placement="left"
            closable={true}
            width={cart.length === 0 ? "300" : "520"}
            onClose={toggleDrawer}
            open={isDrawerOpen}
        >
            {cart.length === 0 ? (
                <div className="flex items-center justify-center">
                    <TbShoppingCartOff className="mr-2" />
                    <p>Keranjang kosong</p>
                </div>
            ) : (
                <>
                    <Table
                        dataSource={cart}
                        rowKey="barcode"
                        pagination={false}
                        columns={[
                            {
                                title: "Name",
                                dataIndex: "name",
                                key: "name",
                            },
                            {
                                title: "Quantity",
                                dataIndex: "quantity",
                                key: "quantity",
                                render: (text, record) => (
                                    <div className="flex items-center">
                                        <Button
                                            icon={<MinusOutlined />}
                                            onClick={() => updateQuantity(record.barcode, "decrement")}
                                            disabled={record.quantity === 1}
                                        />
                                        <span className="mx-2">{record.quantity}</span>
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => updateQuantity(record.barcode, "increment")}
                                            disabled={products.find(item => item.barcode === record.barcode)?.stock === 0}
                                        />
                                    </div>
                                ),
                            },
                            {
                                title: "Price",
                                dataIndex: "price",
                                key: "price",
                                render: (price) => formatRupiah(price),
                            },
                            {
                                title: "Subtotal",
                                key: "subtotal",
                                render: (text, record) => (
                                    <span>{formatRupiah(record.price * record.quantity)}</span>
                                ),
                            },
                            {
                                title: "Aksi",
                                key: "action",
                                render: (_, record) => (
                                    <Button
                                        type="danger"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeFromCart(record.barcode)}
                                    >
                                        Hapus
                                    </Button>
                                ),
                            },
                        ]}
                    />
                    <div className="mt-4">
                        <p>Total Items: {totalItems}</p>
                        <p>Total Price: {formatRupiah(totalPrice)}</p>
                    </div>
                    <div className="mt-4">
                        {cart.map((item) => (
                            <Button
                                type="primary"
                                key={item.barcode}
                                onClick={() => handlePayment(item.barcode, item.quantity)}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Bayar'}
                            </Button>
                        ))}
                    </div>
                </>
            )}
        </Drawer>
    );
};

export default Cart;
