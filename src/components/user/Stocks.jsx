import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/browser";
import { Table, Button, Modal, Input, notification } from "antd";
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { formatRupiah } from '../../Helper/FormatRupiah';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Cart from "./Cart";

const Stocks = () => {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const videoRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/v1/api/all-products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Failed to load products.',
        });
        console.error("Error fetching products:", error);
      });
  }, []);

  // Barcode scanner setup
  const codeReader = new BrowserMultiFormatReader();
  const formats = [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.QR_CODE];

  const startScan = () => {
    const constraints = {
      video: {
        width: 1280,
        height: 720,
        focusMode: "continuous"
      }
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      codeReader
        .decodeOnceFromVideoDevice(undefined, videoRef.current, {
          hints: { possibleFormats: formats },
        })
        .then((result) => {
          setBarcode(result.text);
          findProduct(result.text);
        })
        .catch((err) => {
          console.error(err);
          startScan();
        });
    });
  };

  const stopScan = () => {
    codeReader.reset();
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const findProduct = (barcodeInput) => {
    const foundProduct = products.find((prod) => prod.barcode === barcodeInput);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      setProduct(null);
    }
  };

  const handleManualInput = (e) => {
    setBarcode(e.target.value);
    findProduct(e.target.value);
  };

  // const showModal = () => {
  //   setIsModalOpen(true);
  // };

  const handleOk = () => {
    setIsModalOpen(false);
    stopScan();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    stopScan();
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = products.filter(item =>
      item.barcode.toLowerCase().includes(value) ||
      item.name.toLowerCase().includes(value) ||
      item.price.toString().includes(value) ||
      item.stock.toString().includes(value)
    );

    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    if (product.stock > 0) {
      const existingProduct = cart.find(item => item.barcode === product.barcode);

      if (existingProduct) {
        setCart(cart.map(item =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }

      setProducts(products.map(p =>
        p.barcode === product.barcode
          ? { ...p, stock: p.stock - 1 }
          : p
      ));

      notification.success({
        message: 'Produk Ditambahkan',
        description: `${product.name} berhasil ditambahkan ke keranjang.`,
        placement: 'bottomLeft',
      });
    } else {
      notification.error({
        message: 'Stok Habis',
        description: `Stok untuk ${product.name} sudah habis.`,
      });
    }
  };

  // Hitung total harga dan total produk di keranjang
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const columns = [
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      sorter: (a, b) => a.barcode.localeCompare(b.barcode),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => formatRupiah(price),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => addToCart(record)} disabled={record.stock <= 0}>
          Pilih
        </Button>
      ),
    },
  ];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fungsi untuk membuka/tutup Drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Fungsi untuk mengubah jumlah produk
  const updateQuantity = (barcode, operation) => {
    const cartProduct = cart.find(item => item.barcode === barcode);
    const productInStock = products.find(item => item.barcode === barcode);

    if (cartProduct) {
      if (operation === "increment" && productInStock.stock > 0) {
        // Tambahkan jumlah produk dan kurangi stok
        setCart(cart.map(item =>
          item.barcode === barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));

        setProducts(products.map(p =>
          p.barcode === barcode
            ? { ...p, stock: p.stock - 1 }
            : p
        ));
      } else if (operation === "decrement" && cartProduct.quantity > 1) {
        // Kurangi jumlah produk dan tambahkan stok
        setCart(cart.map(item =>
          item.barcode === barcode
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));

        setProducts(products.map(p =>
          p.barcode === barcode
            ? { ...p, stock: p.stock + 1 }
            : p
        ));
      } else if (operation === "decrement" && cartProduct.quantity === 1) {
        // Jika quantity 1 dan dikurangi, produk dihapus dari keranjang
        removeFromCart(barcode);
      }
    }
  };


  // Fungsi untuk menghapus produk dari keranjang
  const removeFromCart = (barcode) => {
    const removedProduct = cart.find(item => item.barcode === barcode);

    if (removedProduct) {
      // Mengembalikan stok produk saat dihapus dari keranjang
      setProducts(products.map(p =>
        p.barcode === barcode
          ? { ...p, stock: p.stock + removedProduct.quantity }
          : p
      ));

      // Menghapus produk dari keranjang
      setCart(cart.filter(item => item.barcode !== barcode));
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    axios.get('http://localhost:5000/v1/api/all-products')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Failed to load products.',
        });
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };


  // Fungsi untuk mengekspor data ke file Excel
  const exportToExcel = () => {
    const exportData = filteredProducts.length > 0 ? filteredProducts : products;

    // Mapping data yang akan diekspor ke Excel
    const worksheetData = exportData.map(item => ({
      Barcode: item.barcode,
      Name: item.name,
      Price: item.price,
      Stock: item.stock,
      Unit: item.unit,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    XLSX.writeFile(workbook, 'products_data.xlsx');
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">Obat-obatan</h1>

      {/* Tombol untuk membuka keranjang */}
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        onClick={toggleDrawer}
        className="absolute top-6 right-6"
      >
        Keranjang ({totalItems})
      </Button>

      {/* Cart */}
      <Cart
        cart={cart}
        products={products}
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalItems={totalItems}
        totalPrice={totalPrice}
      />

      <Input
        placeholder="Search all fields"
        value={searchText}
        onChange={handleSearch}
        prefix={<SearchOutlined />}
        className="mb-4 w-3/4"
      />
      <div>
        <Button type="primary" onClick={fetchProducts} loading={loading}>
          Refresh Products
        </Button>
        <Button type="primary" onClick={exportToExcel} className="ml-4" style={{ backgroundColor: 'green' }}>
          Export to Excel
        </Button>
      </div>
      <Table
        dataSource={filteredProducts.length > 0 ? filteredProducts : products}
        rowKey="barcode"
        columns={columns}
        pagination={false}
        className=' w-3/4'
      />

      <Modal
        title="Barcode Scanner"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <div className="flex justify-center">
          <video ref={videoRef} className="rounded-lg shadow-lg" width="100%" height="auto" />
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={startScan} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2">
            Start Scan
          </Button>
          <Button onClick={stopScan} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Stop Scan
          </Button>
        </div>
        <div className="mt-4 flex justify-center">
          <Input
            type="text"
            value={barcode}
            onChange={handleManualInput}
            placeholder="Enter barcode manually"
            className="px-4 py-2 border rounded w-64"
          />
        </div>
        {product ? (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
            <h2 className="text-xl font-bold">Product Found:</h2>
            <p>Name: {product.name}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>
        ) : barcode ? (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
            <p>No product found for barcode: {barcode}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Stocks;
