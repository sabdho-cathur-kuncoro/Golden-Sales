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
    status_order: 1,
    created_at: "14 November 2026",
  },
  {
    id: "ORD-2026-002",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Disiapkan Gudang",
    status_order: 2,
    created_at: "14 November 2026",
  },
  {
    id: "ORD-2026-003",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Dikirim",
    status_order: 3,
    created_at: "14 November 2026",
  },
  {
    id: "ORD-2026-004",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Diproses Sales",
    status_order: 4,
    created_at: "14 November 2026",
  },
  {
    id: "ORD-2026-005",
    customer_name: "Toko Maju Jaya",
    branch: "Batam",
    qty: 50,
    payment_method: "Transfer Bank",
    status_order_name: "Diproses Sales",
    status_order: 4,
    created_at: "14 November 2026",
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
      sub_total_price: 700_000,
      customer_note: "",
    },
    {
      id: 2,
      product_name: "Simpati TikTok",
      category: "Kartu Perdana",
      qty: 20,
      sub_total_price: 1_100_000,
      customer_note: "",
    },
  ],
  total_price: 1_800_000,
  payment_method: "Transfer Bank",
  bank_name: "BCA",
  status_payment_name: "Lunas",
};
