import { useState, useRef } from "react";
import { Button, Modal, Input, notification } from "antd";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "axios";

const AddProduct = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        barcode: "",
        name: "",
        unit: "",
        price: "",
        stock: "",
    });
    const [isScanning, setIsScanning] = useState(false);
    const [isScanned, setIsScanned] = useState(false);
    const videoRef = useRef(null);
    const codeReader = new BrowserMultiFormatReader();

    const startScan = () => {
        setIsScanning(true);
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                    if (result) {
                        setNewProduct((prevProduct) => ({ ...prevProduct, barcode: result.text }));
                        setIsScanned(true);
                        stopScan();
                    }
                });
            });
    };

    const stopScan = () => {
        codeReader.reset();
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
    };

    const handleSubmit = () => {
        if (!newProduct.barcode || !newProduct.name || !newProduct.unit || !newProduct.price || !newProduct.stock) {
            notification.error({
                message: 'Input Error',
                description: 'All fields are required!',
            });
            return;
        }

        // Send product data to the backend to save in productList.json
        axios.post('http://localhost:5000/v1/api/add-products', newProduct)
            .then((response) => {
                notification.success({
                    message: 'Product Added',
                    description: `${newProduct.name} has been added successfully.`,
                });

                // Reset form
                setNewProduct({ barcode: "", name: "", unit: "", price: "", stock: "" });
                setIsModalOpen(false);
                setIsScanned(false);
            })
            .catch((error) => {
                notification.error({
                    message: 'Error',
                    description: 'Failed to add product. Please try again later.',
                });
                console.error("Error saving product:", error);
            });
    };

    return (
        <>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Add Product
            </Button>

            <Modal
                title="Add New Product"
                visible={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Add"
            >
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Enter barcode or scan"
                        name="barcode"
                        value={newProduct.barcode}
                        onChange={handleInputChange}
                        suffix={
                            !isScanned && (
                                <Button onClick={isScanning ? stopScan : startScan}>
                                    {isScanning ? 'Stop Scanning' : 'Scan Barcode'}
                                </Button>
                            )
                        }
                    />
                    <Input
                        placeholder="Product Name"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                    />
                    <Input
                        placeholder="Unit (e.g., bottle, tablet)"
                        name="unit"
                        value={newProduct.unit}
                        onChange={handleInputChange}
                    />
                    <Input
                        placeholder="Price"
                        name="price"
                        type="number"
                        value={newProduct.price}
                        onChange={handleInputChange}
                    />
                    <Input
                        placeholder="Stock"
                        name="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={handleInputChange}
                    />
                </div>
                {isScanning && (
                    <div className="mt-4">
                        <video ref={videoRef} className="w-full rounded-lg" />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default AddProduct;
