const d = new Date();

// NOTE: BANNER
export const banners = [
  {
    id: "1",
    image: require("@/assets/images/banner-2.png"),
  },
  {
    id: "2",
    image: require("@/assets/images/banner-1.png"),
  },
  {
    id: "3",
    image: require("@/assets/images/banner-3.png"),
  },
];

export const FlashSaleData = [
  {
    id: 1,
    name: "Simpati",
    category: "Kartu Perdana",
    normal_price: 35_000,
    discount_price: 25_000,
    discount_percentage: 15,
    image: require("@/assets/images/img3.png"),
  },
  {
    id: 2,
    name: "Simpati",
    category: "Kartu Perdana",
    normal_price: 35_000,
    discount_price: 25_000,
    discount_percentage: 15,
    image: require("@/assets/images/img1.png"),
  },
  {
    id: 3,
    name: "Simpati",
    category: "Kartu Perdana",
    normal_price: 35_000,
    discount_price: 25_000,
    discount_percentage: 15,
    image: require("@/assets/images/img2.png"),
  },
];

export const CategoryApproval = [
  {
    id: 1,
    name: "Dibuat Customer",
    isSelected: true,
  },
  {
    id: 2,
    name: "Dibuat Sales",
    isSelected: false,
  },
];

export const CategoryTransaksi = [
  {
    id: 1,
    name: "Diproses SO",
    isSelected: true,
  },
  {
    id: 2,
    name: "Disiapkan Gudang",
    isSelected: false,
  },
  {
    id: 3,
    name: "Dikirim",
    isSelected: false,
  },
];

export const Order = [
  {
    id: "ORD-2026-001",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Diproses SO",
    status_order: 2,
    created_at: "14 November 2026",
    subtotal: null,
  },
  {
    id: "ORD-2026-002",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Disiapkan Gudang",
    status_order: 3,
    created_at: "14 November 2026",
    subtotal: null,
  },
  {
    id: "ORD-2026-003",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Dikirim",
    status_order: 4,
    created_at: "14 November 2026",
    subtotal: null,
  },
  {
    id: "ORD-2026-004",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Diproses Sales",
    status_order: 1,
    created_at: "14 November 2026",
    subtotal: null,
  },
  {
    id: "ORD-2026-005",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Diproses Sales",
    status_order: 1,
    created_at: "14 November 2026",
    subtotal: null,
  },
  {
    id: "ORD-2026-006",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Selesai",
    status_order: 5,
    created_at: "14 November 2026",
    subtotal: 1_800_000,
  },
  {
    id: "ORD-2026-007",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Reject",
    status_order: 6,
    created_at: "14 November 2026",
    subtotal: 1_800_000,
  },
];

export const OrderDetail = {
  id: "ORD-2026-001",
  customer_name: "Toko Maju Jaya",
  branch: "Batam",
  product: [
    {
      id: 1,
      product_name: "Simpati Terbaik Untukmu",
      category: "Kartu Perdana",
      qty: 20,
      price: 35_000,
      sub_total_price: 700_000,
      customer_note: "-",
    },
    {
      id: 2,
      product_name: "Simpati TikTok",
      category: "Kartu Perdana",
      qty: 20,
      price: 55_000,
      sub_total_price: 1_100_000,
      customer_note: "-",
    },
  ],
  status_order: 4,
  status_order_name: "Dikirim",
  total_price: 1_800_000,
  payment_method: "Transfer Bank",
  bank_name: "BCA",
  status_payment_name: "Lunas",
};

// NOTE: STATUS TRANSAKSI
export const StatusTransaksiSelesai = [
  {
    id: 1,
    status_name: "Order Dibuat",
    created_at: "14 April 2026, 08:10",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 2,
    status_name: "Diproses Sales",
    created_at: "14 April 2026, 08:25",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 3,
    status_name: "Diproses SO",
    created_at: "14 April 2026, 08:40",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 4,
    status_name: "Disiapkan Gudang",
    created_at: "14 April 2026, 09:15",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 5,
    status_name: "Dikirim",
    created_at: "14 April 2026, 09:30",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 6,
    status_name: "Selesai",
    created_at: "14 April 2026, 15:50",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
];
export const StatusTransaksiDikirim = [
  {
    id: 1,
    status_name: "Order Dibuat",
    created_at: "14 April 2026, 08:10",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 2,
    status_name: "Diproses Sales",
    created_at: "14 April 2026, 08:25",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 3,
    status_name: "Diproses SO",
    created_at: "14 April 2026, 08:40",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 4,
    status_name: "Disiapkan Gudang",
    created_at: "14 April 2026, 09:15",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 5,
    status_name: "Dikirim",
    created_at: "14 April 2026, 09:30",
    is_reject: false,
    current_step: true,
    step_done: false,
  },
  {
    id: 6,
    status_name: "Selesai",
    created_at: "14 April 2026, 15:50",
    is_reject: false,
    current_step: false,
    step_done: false,
  },
];
export const StatusTransaksiReject = [
  {
    id: 1,
    status_name: "Order Dibuat",
    created_at: "14 April 2026, 08:10",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 2,
    status_name: "Diproses Sales",
    created_at: "14 April 2026, 08:25",
    is_reject: false,
    current_step: false,
    step_done: true,
  },
  {
    id: 3,
    status_name: "Ditolak SO",
    created_at: "14 April 2026, 08:40",
    is_reject: true,
    current_step: false,
    step_done: true,
  },
];

// NOTE: CATEGORY
export const CategoryData = [
  {
    id: 1,
    category_name: "Semua",
    isSelected: true,
  },
  {
    id: 2,
    category_name: "Kartu Perdana",
    isSelected: false,
  },
  {
    id: 3,
    category_name: "Voucher",
    isSelected: false,
  },
  {
    id: 4,
    category_name: "Telkomsel Orbit",
    isSelected: false,
  },
];

// NOTE: PRODUCT
export const ProductData = [
  {
    id: 1,
    category: "Kartu Perdana",
    name: "Simpati",
    img: require("@/assets/images/img3.png"),
  },
  {
    id: 2,
    category: "Kartu Perdana",
    name: "by.U",
    img: require("@/assets/images/img2.png"),
  },
  {
    id: 3,
    category: "Voucher",
    name: "Voucher Internet",
    img: require("@/assets/images/img1.png"),
  },
  {
    id: 4,
    category: "Telkomsel Orbit",
    name: "Modem Wifi",
    img: require("@/assets/images/img5.png"),
  },
];

// NOTE: PRODUCT ITEM
export const ProductItemData = [
  {
    id: 1,
    name: "Simpati Terbaik Untukmu",
    price: 35_000,
    unit: "pcs",
    qty: 0,
    sub_total_price: 700_000,
  },
  {
    id: 2,
    name: "Simpati TikTok",
    price: 55_000,
    unit: "pcs",
    qty: 0,
    sub_total_price: 1_100_000,
  },
];

// NOTE: OUTLET
export const OutletData = [
  {
    id: 1,
    name: "Toko Maju Jaya",
    count_address: 2,
    list_address: [
      {
        id: "address-01",
        address:
          "Komplek Ruko Taman Niaga, Blk. M No.12B, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444",
        name: "Toko Utama",
      },
      {
        id: "address-02",
        address:
          "Komplek Ruko Mall Nagoya Hill, Blk. R3 No.J36-37, Nagoya, Batam City, Kepulauan Riau 29444",
        name: "Cabang Batam",
      },
      {
        id: "address-03",
        address:
          "Komplek Ruko Taman Niaga, Blk. M No.12B, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444",
        name: "Toko Utama",
      },
      {
        id: "address-04",
        address:
          "Komplek Ruko Mall Nagoya Hill, Blk. R3 No.J36-37, Nagoya, Batam City, Kepulauan Riau 29444",
        name: "Cabang Batam",
      },
      {
        id: "address-05",
        address:
          "Komplek Ruko Taman Niaga, Blk. M No.12B, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444",
        name: "Toko Utama",
      },
      {
        id: "address-06",
        address:
          "Komplek Ruko Mall Nagoya Hill, Blk. R3 No.J36-37, Nagoya, Batam City, Kepulauan Riau 29444",
        name: "Cabang Batam",
      },
    ],
  },
  {
    id: 2,
    name: "Berkah Cell",
    count_address: 1,
    list_address: [
      {
        id: "address-01",
        address:
          "Komplek Ruko Taman Niaga, Blk. M No.12B, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444",
        name: "Toko Utama",
      },
      {
        id: "address-02",
        address:
          "Komplek Ruko Mall Nagoya Hill, Blk. R3 No.J36-37, Nagoya, Batam City, Kepulauan Riau 29444",
        name: "Cabang Batam",
      },
    ],
  },
  {
    id: 3,
    name: "Sinar Abadi Jaya",
    count_address: 1,
    list_address: [
      {
        id: "address-01",
        address:
          "Komplek Ruko Taman Niaga, Blk. M No.12B, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444",
        name: "Toko Utama",
      },
    ],
  },
  {
    id: 4,
    name: "Makmur Abadi",
    count_address: 1,
    list_address: [
      {
        id: "address-01",
        address:
          "Komplek Ruko Mall Nagoya Hill, Blk. R3 No.J36-37, Nagoya, Batam City, Kepulauan Riau 29444",
        name: "Cabang Batam",
      },
    ],
  },
];

// NOTE: PAYMENT METHOD
export const PaymentMethodData = [
  {
    id: 1,
    name: "Cash On Delivery (COD)",
    is_selected: false,
    is_collapsible: false,
  },
  {
    id: 2,
    name: "Transfer Bank",
    is_selected: false,
    is_collapsible: true,
    bank_list: [
      {
        id: "bank-01",
        name: "Bank BCA",
        img: require("@/assets/images/logo-bca.png"),
        is_bank_selected: false,
      },
      {
        id: "bank-02",
        name: "Bank Mandiri",
        img: require("@/assets/images/logo-mandiri.png"),
        is_bank_selected: false,
      },
      {
        id: "bank-03",
        name: "Bank BRI",
        img: require("@/assets/images/logo-bri.png"),
        is_bank_selected: false,
      },
      {
        id: "bank-04",
        name: "Bank BNI",
        img: require("@/assets/images/logo-bni.png"),
        is_bank_selected: false,
      },
    ],
  },
];

// NOTE: CATEGORY REPORT
export const CategoryReportData = [
  {
    id: 1,
    name: "Selesai",
    is_selected: true,
  },
  {
    id: 2,
    name: "Reject",
    is_selected: false,
  },
];

// NOTE: KATALOG
export const KatalogProduk = [
  {
    id: 1,
    name: "Kartu Perdana",
    slug: "3 Produk",
    img: require("@/assets/images/img3.png"),
  },
  {
    id: 2,
    name: "Voucher Fisik",
    slug: "3 Produk",
    img: require("@/assets/images/img1.png"),
  },
  {
    id: 3,
    name: "Modem Orbit",
    slug: "3 Produk",
    img: require("@/assets/images/img5.png"),
  },
  {
    id: 4,
    name: "Nomor Cantik",
    slug: "",
    img: require("@/assets/images/img6.png"),
  },
  {
    id: 5,
    name: "Indihome",
    slug: "37 Produk",
    img: require("@/assets/images/img7.png"),
  },
];
export const KatalogGlobalDetail = [
  {
    id: 1,
    name: "Simpati 3 GB",
    price: 30_000,
    unit: "pcs",
    value: "3 GB",
    exp: "30 Hari",
  },
  {
    id: 2,
    name: "by.U 3 GB",
    price: 30_000,
    unit: "pcs",
    value: "3 GB",
    exp: "30 Hari",
  },
  {
    id: 3,
    name: "Simpati Segel Nol K",
    price: 11_000,
    unit: "pcs",
    value: null,
    exp: null,
  },
];
export const KatalogINDDetail = [
  {
    id: 1,
    name: "JITU 1 Internet 50 Mbps",
    price: 240_000,
    unit: "bulan",
    value: "50 Mbps",
    exp: null,
  },
  {
    id: 2,
    name: "JITU 1 Internet 75 Mbps",
    price: 270_000,
    unit: "bulan",
    value: "75 Mbps",
    exp: null,
  },
  {
    id: 3,
    name: "JITU 1 Internet 150 Mbps",
    price: 375_000,
    unit: "bulan",
    value: "150 Mbps",
    exp: null,
  },
  {
    id: 4,
    name: "JITU 1 Internet 200 Mbps",
    price: 515_000,
    unit: "bulan",
    value: "200 Mbps",
    exp: null,
  },
];
export const KatalogINDCategory = [
  {
    id: 1,
    name: "Internet",
    selected: true,
  },
  {
    id: 2,
    name: "Internet + TV",
    selected: false,
  },
  {
    id: 3,
    name: "Internet + Telepon",
    selected: false,
  },
];
export const KatalogCategory = [
  {
    id: 1,
    name: "Semua",
    selected: true,
  },
  {
    id: 2,
    name: "Simpati",
    selected: false,
  },
  {
    id: 3,
    name: "by.U",
    selected: false,
  },
  {
    id: 4,
    name: "Simpati Segel Nol K",
    selected: false,
  },
];

// NOTE: NOTIF
export const NotifData = [
  {
    id: 1,
    title: "Barang Anda Sedang Dikirim",
    order_id: "ORD-2026-002",
    sales_name: "Ahmad Kurniawan",
    sales_id: "SLS-001",
    snipet: "Pesanan ORD-2026-002 sedan dalam perjalanan ke lokasi Anda.",
    type: "delivery",
    created_at: "",
  },
  {
    id: 2,
    title: "Pesanan Disetujui Sales",
    order_id: "ORD-2026-006",
    sales_name: "Ahmad Kurniawan",
    sales_id: "SLS-001",
    snipet:
      "Sales Ahmad Kurniawan telah menyetujui pesanan ORD-2026-006. Silakan pantau status selanjutnya di menu transaksi",
    type: "approval",
    created_at: "",
  },
];
export const NotifCategory = [
  {
    id: 1,
    title: "Notifikasi",
    isSelected: true,
  },
  {
    id: 2,
    title: "Chat",
    isSelected: false,
  },
];

// NOTE: CHAT
export const ChatData = [
  {
    id: 1,
    order_id: "ORD-2026-012",
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan.",
    time: "10:00",
    unread_message: 1,
    created_at: d,
  },
  {
    id: 2,
    order_id: "ORD-2026-011",
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan.",
    time: "09:00",
    unread_message: 1,
    created_at: d,
  },
  {
    id: 3,
    order_id: "ORD-2026-010",
    message: "Sama-sama pak, ditunggu order selanjutnya",
    time: "08:00",
    unread_message: 0,
    created_at: d,
  },
];
export const ChatMessage = [
  {
    id: 1,
    message: "Halo, ada yang bisa saya bantu?",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 2,
    message: "Pesanan saya kapan dikirim ya pak",
    sender_id: "CST-001",
    recipient_id: "SLS-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 3,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 4,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 5,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 6,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 7,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 8,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 9,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
  {
    id: 10,
    message: "Sedang disiapkan gudang pak. Estimasi sore ini sudah jalan",
    sender_id: "SLS-001",
    recipient_id: "CST-001",
    time: "09:02",
    created_at: d,
  },
];

// NOTE: CART
export const CartOrderDetail = [
  {
    id: "CAT-1",
    categoryName: "Kartu Perdana",
    subCategoryName: "Telkomsel",
    isCategorySelected: false,
    product: [
      {
        id: 1,
        name: "Simpati 3 GB",
        normalPrice: 30_000,
        discountPrice: 25_000,
        isProductSelected: false,
        note: "",
        qty: 10,
        unit: "pcs",
        voucher: ["THR2026"],
      },
      {
        id: 2,
        name: "by.U 3 GB",
        normalPrice: 30_000,
        discountPrice: null,
        isProductSelected: false,
        note: "",
        qty: 10,
        unit: "pcs",
        voucher: [],
      },
      {
        id: 3,
        name: "Simpati Segel Nol K",
        normalPrice: 11_000,
        discountPrice: null,
        isProductSelected: false,
        note: "",
        qty: 10,
        unit: "pcs",
        voucher: [],
      },
    ],
  },
  {
    id: "CAT-2",
    categoryName: "Voucher Fisik",
    subCategoryName: "by.U",
    isCategorySelected: false,
    product: [
      {
        id: 1,
        name: "Simpati 3 GB",
        normalPrice: 30_000,
        discountPrice: null,
        isProductSelected: false,
        note: "",
        qty: 10,
        unit: "pcs",
        voucher: [],
      },
    ],
  },
];
