import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Check,
  ClipboardList,
  Edit3,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  PackagePlus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import type { Product } from "@/lib/products";
import adminHeroImage from "@/assets/promo-banner.jpg";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin - BLOSSOM" },
      {
        name: "description",
        content: "Dashboard administrateur Blossom pour gérer les produits, commandes et ventes.",
      },
    ],
  }),
});

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
};

type AdminSummary = {
  revenue: number;
  ordersCount: number;
  pendingOrders: number;
  productsCount: number;
  promoProducts: number;
  averageCart: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    items: Array<{ name: string; quantity: number }>;
  }>;
  activity: string[];
};

type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: "À préparer" | "Payée" | "Expédiée" | "Livrée" | "Annulée";
  createdAt: string;
  address: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
};

type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type ProductFormState = {
  name: string;
  brand: string;
  price: string;
  originalPrice: string;
  image: string;
  category: Product["category"];
  subcategory: string;
  badge: "" | NonNullable<Product["badge"]>;
  problematic: string;
  description: string;
};

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  product_type: string;
  problematic: string | null;
  image: string;
  price: number;
  created_at: string;
  updated_at: string;
};

type InventoryProductType = {
  id: string;
  name: string;
  display_order: number;
};

type InventoryFormState = {
  name: string;
  quantity: string;
  product_type: string;
  problematic: string;
  image: string;
  price: string;
};

const blankProductForm: ProductFormState = {
  name: "",
  brand: "BLOSSOM Atelier",
  price: "",
  originalPrice: "",
  image: "",
  category: "Soin",
  subcategory: "",
  badge: "",
  problematic: "",
  description: "",
};

const problematicOptions = [
  "IMPERFECTION",
  "GLOW",
  "HYDRATATION",
  "CORPS",
  "NETTOYANT",
  "SPF",
  "PEAU SENSIBLE",
  "CERNES",
];

const blankInventoryForm: InventoryFormState = {
  name: "",
  quantity: "5",
  product_type: "SERUM",
  problematic: "",
  image: "",
  price: "",
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Produits", icon: Boxes },
  { id: "inventory", label: "Inventaire", icon: ClipboardList },
  { id: "orders", label: "Commandes", icon: ShoppingBag },
  { id: "messages", label: "Messages", icon: MessageSquare },
] as const;

const sessionKey = "blossom_admin_session";
const pageSize = 8;

function formatCfa(value: number) {
  return `${Math.round(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function paginate<T>(items: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    pageCount,
    items: items.slice(start, start + pageSize),
  };
}

async function apiRequest<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Requête impossible.");
  }
  return data as T;
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as { token: string; user: AdminUser }) : null;
  } catch {
    return null;
  }
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    brand: product.brand,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : "",
    image: product.image,
    category: product.category,
    subcategory: product.subcategory ?? "",
    badge: product.badge ?? "",
    problematic: product.problematic ?? "",
    description: product.description,
  };
}

function formToPayload(form: ProductFormState) {
  const image = normalizeImageUrl(form.image);

  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    image: image || undefined,
    category: form.category,
    subcategory: form.subcategory.trim() || undefined,
    badge: form.badge || undefined,
    problematic: form.problematic.trim() || undefined,
    description: form.description.trim(),
  };
}

function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:")) return trimmed;

  const urls = trimmed.match(/https?:\/\/[^\s"'<>]+/g);
  return urls?.at(-1) ?? trimmed;
}

function isPinterestPageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.includes("pinterest.") && url.pathname.includes("/pin/");
  } catch {
    return false;
  }
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Image illisible."));
    reader.readAsDataURL(file);
  });
}

function inventoryToForm(item: InventoryItem): InventoryFormState {
  return {
    name: item.name,
    quantity: String(item.quantity),
    product_type: item.product_type,
    problematic: item.problematic ?? "",
    image: item.image ?? "",
    price: String(item.price),
  };
}

function inventoryFormToPayload(form: InventoryFormState) {
  const image = normalizeImageUrl(form.image).trim();
  return {
    name: form.name.trim(),
    quantity: Math.max(0, Math.floor(Number(form.quantity) || 0)),
    product_type: form.product_type.trim(),
    problematic: form.problematic.trim() || null,
    image: image || null,
    price: Number(form.price),
  };
}

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<(typeof navItems)[number]["id"]>("dashboard");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryTypes, setInventoryTypes] = useState<InventoryProductType[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState("");
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productProblemFilter, setProductProblemFilter] = useState("all");
  const [productViewMode, setProductViewMode] = useState<"card" | "table">("card");
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState("all");
  const [inventoryProblemFilter, setInventoryProblemFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [messageQuery, setMessageQuery] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [form, setForm] = useState<ProductFormState>(blankProductForm);
  const [inventoryForm, setInventoryForm] = useState<InventoryFormState>(blankInventoryForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readStoredSession();
    if (session?.token && session.user.role === "admin") {
      setToken(session.token);
      setUser(session.user);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (token) {
      void loadAdminData(token);
    }
  }, [token]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) =>
      (productCategoryFilter === "all" || product.category === productCategoryFilter) &&
      (productProblemFilter === "all" || product.problematic === productProblemFilter) &&
      (!normalized ||
        [product.name, product.brand, product.category, product.subcategory, product.badge, product.problematic]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized))),
    );
  }, [products, query, productCategoryFilter, productProblemFilter]);

  const filteredInventory = useMemo(() => {
    const normalized = inventoryQuery.trim().toLowerCase();
    return inventory.filter((item) =>
      (inventoryTypeFilter === "all" || item.product_type === inventoryTypeFilter) &&
      (inventoryProblemFilter === "all" || item.problematic === inventoryProblemFilter) &&
      (!normalized ||
        [item.name, item.product_type, item.problematic]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized))),
    );
  }, [inventory, inventoryQuery, inventoryTypeFilter, inventoryProblemFilter]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => orderStatusFilter === "all" || order.status === orderStatusFilter),
    [orders, orderStatusFilter],
  );

  const filteredMessages = useMemo(() => {
    const normalized = messageQuery.trim().toLowerCase();
    if (!normalized) return messages;
    return messages.filter((item) =>
      [item.firstName, item.lastName, item.email, item.subject, item.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [messages, messageQuery]);

  const paginatedProducts = useMemo(() => paginate(filteredProducts, productPage), [filteredProducts, productPage]);
  const paginatedInventory = useMemo(() => paginate(filteredInventory, inventoryPage), [filteredInventory, inventoryPage]);
  const paginatedOrders = useMemo(() => paginate(filteredOrders, orderPage), [filteredOrders, orderPage]);
  const paginatedMessages = useMemo(() => paginate(filteredMessages, messagePage), [filteredMessages, messagePage]);

  const dashboardMetrics = useMemo(() => {
    const totalRevenue = summary?.revenue ?? orders.reduce((total, order) => total + order.total, 0);
    const ordersCount = summary?.ordersCount ?? orders.length;
    const pendingOrders =
      summary?.pendingOrders ?? orders.filter((order) => order.status === "À préparer").length;
    const paidOrders = orders.filter((order) => order.status === "Payée").length;
    const deliveredOrders = orders.filter((order) => order.status === "Livrée").length;
    const cancelledOrders = orders.filter((order) => order.status === "Annulée").length;
    const promoProducts =
      summary?.promoProducts ??
      products.filter((product) => product.badge === "Promo" || Boolean(product.originalPrice)).length;
    const totalStockUnits = inventory.reduce((total, item) => total + item.quantity, 0);
    const lowStockItems = inventory.filter((item) => item.quantity > 0 && item.quantity <= 3).length;
    const outOfStockItems = inventory.filter((item) => item.quantity <= 0).length;
    const averageCart =
      summary?.averageCart ?? (ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0);
    const inventoryValue = inventory.reduce((total, item) => total + item.price * item.quantity, 0);
    const unreadMessages = messages.length;

    return {
      totalRevenue,
      ordersCount,
      pendingOrders,
      paidOrders,
      deliveredOrders,
      cancelledOrders,
      promoProducts,
      totalStockUnits,
      lowStockItems,
      outOfStockItems,
      averageCart,
      inventoryValue,
      unreadMessages,
    };
  }, [inventory, messages.length, orders, products, summary]);

  const dashboardInsightCards = [
    {
      label: "Commandes à préparer",
      value: String(dashboardMetrics.pendingOrders),
      detail: `${dashboardMetrics.paidOrders} payée${dashboardMetrics.paidOrders > 1 ? "s" : ""} en attente de suite`,
      icon: ClipboardList,
    },
    {
      label: "Stock disponible",
      value: String(dashboardMetrics.totalStockUnits),
      detail: `${dashboardMetrics.lowStockItems} référence${dashboardMetrics.lowStockItems > 1 ? "s" : ""} en stock bas`,
      icon: Boxes,
    },
    {
      label: "Valeur stock",
      value: formatCfa(dashboardMetrics.inventoryValue),
      detail: `${inventory.length} fiche${inventory.length > 1 ? "s" : ""} inventaire`,
      icon: WalletCards,
    },
    {
      label: "Promotions",
      value: String(dashboardMetrics.promoProducts),
      detail: "Produits avec badge ou ancien prix",
      icon: BarChart3,
    },
    {
      label: "Messages clients",
      value: String(dashboardMetrics.unreadMessages),
      detail: "Demandes reçues via contact",
      icon: Mail,
    },
    {
      label: "Statut base",
      value: error ? "À vérifier" : "Connectée",
      detail: "Synchronisation Neon",
      icon: Check,
    },
  ];

  useEffect(() => {
    setProductPage(1);
  }, [query, productCategoryFilter, productProblemFilter]);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventoryQuery, inventoryTypeFilter, inventoryProblemFilter]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderStatusFilter]);

  useEffect(() => {
    setMessagePage(1);
  }, [messageQuery]);

  const stats = [
    {
      label: "Revenus",
      value: formatCfa(dashboardMetrics.totalRevenue),
      detail: `${dashboardMetrics.ordersCount} commande${dashboardMetrics.ordersCount === 1 ? "" : "s"}`,
      icon: WalletCards,
    },
    {
      label: "Commandes",
      value: String(dashboardMetrics.ordersCount),
      detail: `${dashboardMetrics.pendingOrders} à préparer`,
      icon: ShoppingBag,
    },
    {
      label: "Produits",
      value: String(summary?.productsCount ?? products.length),
      detail: `${dashboardMetrics.totalStockUnits} unités stock`,
      icon: Boxes,
    },
    {
      label: "Panier moyen",
      value: formatCfa(dashboardMetrics.averageCart),
      detail: "Moyenne boutique",
      icon: BarChart3,
    },
  ];

  async function loadAdminData(authToken = token) {
    setLoading(true);
    setError("");
    try {
      const [summaryData, productData, inventoryData, inventoryTypeData, orderData, messageData] = await Promise.all([
        apiRequest<AdminSummary>("/api/admin/summary", authToken),
        apiRequest<Product[]>("/api/products", authToken),
        apiRequest<InventoryItem[]>("/api/inventory", authToken),
        apiRequest<InventoryProductType[]>("/api/inventory/categories", authToken),
        apiRequest<AdminOrder[]>("/api/orders", authToken),
        apiRequest<ContactMessage[]>("/api/contact", authToken),
      ]);
      setSummary(summaryData);
      setProducts(productData);
      setInventory(inventoryData);
      setInventoryTypes(inventoryTypeData);
      setOrders(orderData);
      setMessages(messageData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<{ token: string; user: AdminUser }>("/api/auth/login", undefined, {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      if (data.user.role !== "admin") {
        throw new Error("Ce compte n'a pas accès à l'administration.");
      }
      window.localStorage.setItem(sessionKey, JSON.stringify(data));
      setToken(data.token);
      setUser(data.user);
      setMessage(`Bienvenue ${data.user.name}.`);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(sessionKey);
    setToken("");
    setUser(null);
    setSummary(null);
    setProducts([]);
    setInventory([]);
    setInventoryTypes([]);
    setOrders([]);
    setMessages([]);
    setForm(blankProductForm);
    setInventoryForm(blankInventoryForm);
    setEditingId(null);
    setEditingInventoryId(null);
    setProductModalOpen(false);
    setInventoryModalOpen(false);
  }

  function startAddProduct() {
    setEditingId(null);
    setForm(blankProductForm);
    setProductModalOpen(true);
    setView("products");
    setMessage("");
    setError("");
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm(productToForm(product));
    setProductModalOpen(true);
    setView("products");
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankProductForm);
    setProductModalOpen(false);
  }

  function startAddInventory() {
    setEditingInventoryId(null);
    setInventoryForm(blankInventoryForm);
    setInventoryModalOpen(true);
    setView("inventory");
    setMessage("");
    setError("");
  }

  function startEditInventory(item: InventoryItem) {
    setEditingInventoryId(item.id);
    setInventoryForm(inventoryToForm(item));
    setInventoryModalOpen(true);
    setView("inventory");
    setMessage("");
    setError("");
  }

  function resetInventoryForm() {
    setEditingInventoryId(null);
    setInventoryForm(blankInventoryForm);
    setInventoryModalOpen(false);
  }

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = formToPayload(form);
      if (!payload.name || !payload.description || !Number.isFinite(payload.price)) {
        throw new Error("Nom, prix et description sont obligatoires.");
      }
      if (editingId) {
        await apiRequest<Product>(`/api/products/${editingId}`, token, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Produit mis à jour.");
      } else {
        await apiRequest<Product>("/api/products", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Produit ajouté au catalogue.");
      }
      resetForm();
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`Supprimer ${product.name} ?`)) return;
    setError("");
    setMessage("");
    try {
      await apiRequest<{ success: true }>(`/api/products/${product.id}`, token, { method: "DELETE" });
      if (editingId === product.id) resetForm();
      setMessage("Produit supprimé.");
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible.");
    }
  }

  async function handleSaveInventory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = inventoryFormToPayload(inventoryForm);
      if (!payload.name || !payload.product_type || !Number.isFinite(payload.price)) {
        throw new Error("Description, type de produit et prix sont obligatoires.");
      }
      if (editingInventoryId) {
        await apiRequest<InventoryItem>(`/api/inventory/${editingInventoryId}`, token, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Article stock mis à jour.");
      } else {
        await apiRequest<InventoryItem>("/api/inventory", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Article ajouté à l'inventaire.");
      }
      resetInventoryForm();
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteInventory(item: InventoryItem) {
    if (!window.confirm(`Supprimer ${item.name} du stock ?`)) return;
    setError("");
    setMessage("");
    try {
      await apiRequest<{ success: true }>(`/api/inventory/${item.id}`, token, { method: "DELETE" });
      if (editingInventoryId === item.id) resetInventoryForm();
      setMessage("Article stock supprimé.");
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible.");
    }
  }

  async function handleUpdateOrderStatus(order: AdminOrder, status: AdminOrder["status"]) {
    setError("");
    setMessage("");
    try {
      await apiRequest<AdminOrder>(`/api/orders/${order.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(`Commande ${order.id} mise à jour.`);
      await loadAdminData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Mise à jour impossible.");
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2E8C6]">
        <Loader2 className="h-7 w-7 animate-spin text-[#800000]" />
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="relative grid min-h-screen overflow-hidden bg-[#F2E8C6] text-[#3F1712] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative min-h-[44vh] overflow-hidden bg-[#DAD4B5] lg:min-h-screen">
          <img
            src={adminHeroImage}
            alt="Sélection beauté Blossom"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3F1712]/58 via-[#3F1712]/14 to-[#F2E8C6]/12" />
          <div className="absolute inset-x-8 top-8 z-10 flex items-start justify-between gap-4 md:inset-x-12 md:top-12">
            <Link to="/" className="w-fit animate-admin-slide text-[#F2E8C6]">
              <p className="font-serif text-4xl tracking-[0.22em] drop-shadow-lg">BLOSSOM</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-[#F2E8C6]/70">
                BLOSSOM Atelier
              </p>
            </Link>
            <span className="hidden border border-[#F2E8C6]/45 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-[#F2E8C6] md:inline-flex">
              Admin
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8 z-10 max-w-xl animate-admin-fade text-[#F2E8C6] md:bottom-12 md:left-12">
            <ShieldCheck className="mb-6 h-10 w-10 text-[#F2E8C6]/80" />
            <h1 className="font-serif text-5xl italic leading-tight md:text-6xl">
              Espace administrateur
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#F2E8C6]/76">
              Gérez le catalogue, les ventes et les opérations Blossom depuis un espace clair et
              sécurisé.
            </p>
          </div>
        </section>

        <main className="relative flex items-center justify-center px-4 py-10 md:px-8">
          <form onSubmit={handleLogin} className="animate-admin-fade w-full max-w-md border border-[#DAD4B5] bg-[#FFF9E4]/88 p-8 shadow-[0_24px_70px_-42px_rgb(63_23_18_/_0.48)] backdrop-blur-md">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#800000]">Connexion</p>
              <h2 className="mt-2 font-serif text-4xl italic">Admin Blossom</h2>
              <p className="mt-3 text-sm leading-6 text-[#806356]">
                Connectez-vous pour suivre les commandes, les stocks et les produits.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#800000]">Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full border border-[#DAD4B5]/70 bg-[#F2E8C6]/80 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-[#800000] focus:bg-white/70 focus:shadow-[0_0_0_3px_rgb(152_43_28_/_0.12)]"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#800000]">Mot de passe</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full border border-[#DAD4B5]/70 bg-[#F2E8C6]/80 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-[#800000] focus:bg-white/70 focus:shadow-[0_0_0_3px_rgb(152_43_28_/_0.12)]"
                  required
                />
              </label>
            </div>

            {error && <p className="mt-5 border border-[#982B1C]/25 bg-[#982B1C]/10 px-4 py-3 text-sm text-[#800000] animate-shake">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#800000] to-[#982B1C] px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#F2E8C6] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Se connecter
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8C6] text-[#3F1712]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-screen border-r border-[#DAD4B5]/30 bg-[#800000] text-white shadow-2xl lg:flex lg:flex-col lg:sticky lg:top-0 lg:overflow-y-auto">
          <div className="border-b border-white/15 px-7 py-7">
            <Link to="/" className="block animate-admin-slide">
              <p className="font-serif text-3xl tracking-[0.22em] text-[#F2E8C6]">BLOSSOM</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-white/70">BLOSSOM Atelier</p>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 hover:translate-x-1 ${
                  view === item.id ? "bg-[#F2E8C6] text-[#3F1712] shadow-lg" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="m-4 border border-white/15 bg-white/[0.08] p-5 animate-admin-fade">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="mt-1 text-xs text-white/45">{user.email}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#F2E8C6]/80">ID {user.id}</p>
            <button onClick={logout} className="mt-4 flex items-center gap-2 text-xs text-white/68 hover:text-white">
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#DAD4B5]/40 bg-[#F2E8C6]/88 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#800000]">Administration</p>
                <h1 className="font-serif text-3xl italic md:text-4xl">
                  {view === "dashboard"
                    ? "Dashboard boutique"
                    : view === "products"
                      ? "Catalogue produits"
                      : view === "inventory"
                        ? "Inventaire stock"
                        : view === "orders"
                          ? "Commandes"
                          : "Messages clients"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-widest lg:hidden ${
                      view === item.id ? "border-[#800000] bg-[#800000] text-[#F2E8C6]" : "border-[#DAD4B5]/50 bg-white/80 hover:border-[#982B1C]"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                ))}
                <button onClick={logout} className="inline-flex items-center gap-2 border border-[#DAD4B5]/50 bg-white/80 px-4 py-2 text-[10px] uppercase tracking-widest transition-colors hover:border-[#982B1C] hover:text-[#800000]">
                  <LogOut className="h-3.5 w-3.5" />
                  Sortir
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8">
            {(message || error) && (
              <div
                className={`animate-admin-fade flex items-center gap-3 border px-4 py-3 text-sm ${
                  error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {error ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {error || message}
              </div>
            )}

            {view === "dashboard" && (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="admin-panel admin-hover animate-admin-fade p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-[#800000]">{stat.label}</p>
                          <p className="mt-3 font-serif text-4xl">{loading ? "..." : stat.value}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center bg-[#F2E8C6] text-[#800000] animate-admin-pulse">
                          <stat.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-medium text-[#800000]">{stat.detail}</p>
                    </div>
                  ))}
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {dashboardInsightCards.map((metric, index) => (
                    <div
                      key={metric.label}
                      className="admin-panel admin-hover animate-admin-fade flex items-center justify-between gap-4 p-4"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#800000]">
                          {metric.label}
                        </p>
                        <p className="mt-2 font-serif text-3xl leading-none">{metric.value}</p>
                        <p className="mt-2 truncate text-xs text-[#806356]">{metric.detail}</p>
                      </div>
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#F2E8C6] text-[#800000]">
                        <metric.icon className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
                  <div className="admin-panel animate-admin-fade overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#DAD4B5]/25 px-5 py-4">
                      <div>
                        <h2 className="font-serif text-2xl italic">Commandes récentes</h2>
                        <p className="text-xs text-[#800000]">Préparation, paiement et livraison.</p>
                      </div>
                      <ClipboardList className="h-5 w-5 text-[#800000]" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left">
                        <thead className="bg-[#F2E8C6]/35 text-[10px] uppercase tracking-[0.22em] text-[#800000]">
                          <tr>
                            <th className="px-5 py-3 font-medium">Commande</th>
                            <th className="px-5 py-3 font-medium">Client</th>
                            <th className="px-5 py-3 font-medium">Articles</th>
                            <th className="px-5 py-3 font-medium">Total</th>
                            <th className="px-5 py-3 font-medium">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DAD4B5]/20 text-sm">
                          {(summary?.recentOrders ?? []).map((order) => (
                            <tr key={order.id} className="transition-colors hover:bg-[#F2E8C6]">
                              <td className="px-5 py-4 font-semibold">{order.id}</td>
                              <td className="px-5 py-4">{order.customer}</td>
                              <td className="px-5 py-4 text-[#6f6258]">
                                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                              </td>
                              <td className="px-5 py-4 font-semibold">{formatCfa(order.total)}</td>
                              <td className="px-5 py-4">
                                <span className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/30 px-3 py-1 text-xs text-[#800000]">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="animate-admin-fade border border-[#800000] bg-[#800000] p-5 text-white shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl italic">Activité récente</h2>
                        <p className="mt-1 text-xs text-white/55">Résumé opérationnel en direct.</p>
                      </div>
                      <span className="bg-[#F2E8C6]/12 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#F2E8C6]">
                        Live
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {[
                        `Admin connecté: ${user.id}`,
                        `${dashboardMetrics.pendingOrders} commande${dashboardMetrics.pendingOrders > 1 ? "s" : ""} à préparer`,
                        `${dashboardMetrics.promoProducts} produit${dashboardMetrics.promoProducts > 1 ? "s" : ""} en promotion`,
                        `Panier moyen: ${formatCfa(dashboardMetrics.averageCart)}`,
                        `${dashboardMetrics.totalStockUnits} unité${dashboardMetrics.totalStockUnits > 1 ? "s" : ""} en stock`,
                        dashboardMetrics.lowStockItems
                          ? `${dashboardMetrics.lowStockItems} stock${dashboardMetrics.lowStockItems > 1 ? "s" : ""} bas à surveiller`
                          : "Aucun stock bas signalé",
                        dashboardMetrics.outOfStockItems
                          ? `${dashboardMetrics.outOfStockItems} article${dashboardMetrics.outOfStockItems > 1 ? "s" : ""} épuisé${dashboardMetrics.outOfStockItems > 1 ? "s" : ""}`
                          : "Aucun article épuisé",
                        error ? "Base Neon à vérifier" : "Base Neon connectée",
                        ...(summary?.activity ?? []),
                      ].map((item) => (
                        <div key={item} className="flex gap-3 text-sm">
                          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#DAD4B5]" />
                          <p className="text-white/70">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {view === "products" && (
              <section>
                <div className="admin-panel animate-admin-fade overflow-hidden">
                  <div className="flex flex-col gap-4 border-b border-[#DAD4B5]/25 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-serif text-2xl italic">Produits</h2>
                      <p className="text-xs text-[#800000]">{filteredProducts.length} fiche{filteredProducts.length > 1 ? "s" : ""} affichée{filteredProducts.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <label className="flex w-full items-center gap-3 border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-4 py-2.5 transition-colors focus-within:border-[#982B1C] md:w-72">
                        <Search className="h-4 w-4 text-[#800000]" />
                        <input
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-[#9c8d7d]"
                          placeholder="Rechercher..."
                        />
                      </label>
                      <select
                        value={productCategoryFilter}
                        onChange={(event) => setProductCategoryFilter(event.target.value)}
                        className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-3 py-2.5 text-xs uppercase tracking-wider text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                      >
                        <option value="all">Toutes catégories</option>
                        <option value="Soin">Soin</option>
                        <option value="Parfum">Parfum</option>
                        <option value="Maquillage">Maquillage</option>
                      </select>
                      <select
                        value={productProblemFilter}
                        onChange={(event) => setProductProblemFilter(event.target.value)}
                        className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-3 py-2.5 text-xs uppercase tracking-wider text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                      >
                        <option value="all">Toutes problématiques</option>
                        {problematicOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProductViewMode("card")}
                          className={`inline-flex items-center justify-center rounded border px-3 py-2 text-[10px] uppercase tracking-widest transition ${productViewMode === "card" ? "border-[#800000] bg-[#800000] text-[#F2E8C6]" : "border-[#DAD4B5]/50 bg-[#F2E8C6]/85 text-[#3F1712] hover:border-[#982B1C]"}`}
                          type="button"
                        >
                          Cadre
                        </button>
                        <button
                          onClick={() => setProductViewMode("table")}
                          className={`inline-flex items-center justify-center rounded border px-3 py-2 text-[10px] uppercase tracking-widest transition ${productViewMode === "table" ? "border-[#800000] bg-[#800000] text-[#F2E8C6]" : "border-[#DAD4B5]/50 bg-[#F2E8C6]/85 text-[#3F1712] hover:border-[#982B1C]"}`}
                          type="button"
                        >
                          Tableau
                        </button>
                      </div>
                      <button
                        onClick={startAddProduct}
                        className="inline-flex items-center justify-center gap-2 bg-[#800000] px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#F2E8C6] transition-all hover:-translate-y-0.5 hover:bg-[#982B1C]"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un produit
                      </button>
                    </div>
                  </div>

                  {productViewMode === "card" ? (
                    <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 xl:grid-cols-3">
                      {paginatedProducts.items.map((product) => (
                        <div key={product.id} className="overflow-hidden rounded-[28px] border border-[#DAD4B5]/30 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                          <div className="relative overflow-hidden bg-[#F2E8C6]/70">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-48 w-full object-cover transition duration-300 hover:scale-105"
                              loading="lazy"
                            />
                            {product.badge && (
                              <span className="absolute right-3 top-3 rounded-full bg-[#800000]/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#F2E8C6]">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded-full border border-[#DAD4B5]/60 bg-[#F2E8C6]/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#800000]">
                                {product.category}
                                {product.subcategory ? ` • ${product.subcategory}` : ""}
                              </span>
                              <span className="font-semibold text-[#3F1712]">{formatCfa(product.price)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#1f1b18]">{product.name}</p>
                              <p className="mt-2 text-sm leading-5 text-[#6f6258] line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(product)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DAD4B5]/70 text-[#3F1712] transition hover:border-[#800000] hover:text-[#800000]"
                                  aria-label={`Modifier ${product.name}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => void handleDeleteProduct(product)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ead0c9] text-red-700 transition hover:bg-red-50"
                                  aria-label={`Supprimer ${product.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => startEdit(product)}
                                className="rounded-full bg-[#800000] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#F2E8C6] transition hover:bg-[#982B1C]"
                                type="button"
                              >
                                Voir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="bg-[#F2E8C6]/35 text-[10px] uppercase tracking-[0.18em] text-[#800000]">
                          <tr>
                            <th className="px-5 py-3 font-medium">Image</th>
                            <th className="px-5 py-3 font-medium">Produit</th>
                            <th className="px-5 py-3 font-medium">Catégorie</th>
                            <th className="px-5 py-3 font-medium">Prix</th>
                            <th className="px-5 py-3 font-medium">Badge</th>
                            <th className="px-5 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DAD4B5]/20 text-sm">
                          {paginatedProducts.items.map((product) => (
                            <tr key={product.id} className="transition-colors hover:bg-[#F2E8C6]/70">
                              <td className="px-5 py-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-14 w-14 rounded border border-[#DAD4B5]/30 object-cover"
                                  loading="lazy"
                                />
                              </td>
                              <td className="px-5 py-4 font-medium">
                                <div>{product.name}</div>
                                <div className="mt-1 text-xs text-[#6f6258]">{product.brand}</div>
                              </td>
                              <td className="px-5 py-4 text-[#6f6258]">
                                {product.category}{product.subcategory ? ` • ${product.subcategory}` : ""}
                              </td>
                              <td className="px-5 py-4 font-semibold">{formatCfa(product.price)}</td>
                              <td className="px-5 py-4">
                                {product.badge ? (
                                  <span className="inline-flex rounded border border-[#DAD4B5]/50 bg-[#F2E8C6]/30 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#800000]">
                                    {product.badge}
                                  </span>
                                ) : (
                                  <span className="text-[10px] uppercase tracking-wider text-[#6f6258]">Aucun</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEdit(product)}
                                    className="inline-flex h-9 w-9 items-center justify-center border border-[#DAD4B5]/50 transition-colors hover:border-[#800000] hover:text-[#800000]"
                                    aria-label={`Modifier ${product.name}`}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => void handleDeleteProduct(product)}
                                    className="inline-flex h-9 w-9 items-center justify-center border border-[#ead0c9] text-red-700 hover:bg-red-50"
                                    aria-label={`Supprimer ${product.name}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <PaginationControls
                    page={paginatedProducts.page}
                    pageCount={paginatedProducts.pageCount}
                    total={filteredProducts.length}
                    onPageChange={setProductPage}
                  />
                </div>
              </section>
            )}

            {view === "inventory" && (
              <section>
                <div className="admin-panel animate-admin-fade overflow-hidden">
                  <div className="flex flex-col gap-4 border-b border-[#DAD4B5]/25 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-serif text-2xl italic">Stock produits</h2>
                      <p className="text-xs text-[#800000]">
                        {filteredInventory.length} article{filteredInventory.length > 1 ? "s" : ""} affiché{filteredInventory.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <label className="flex w-full items-center gap-3 border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-4 py-2.5 transition-colors focus-within:border-[#982B1C] md:w-72">
                        <Search className="h-4 w-4 text-[#800000]" />
                        <input
                          value={inventoryQuery}
                          onChange={(event) => setInventoryQuery(event.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-[#9c8d7d]"
                          placeholder="Rechercher stock..."
                        />
                      </label>
                      <select
                        value={inventoryTypeFilter}
                        onChange={(event) => setInventoryTypeFilter(event.target.value)}
                        className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-3 py-2.5 text-xs uppercase tracking-wider text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                      >
                        <option value="all">Tous types</option>
                        {inventoryTypes.map((type) => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                      <select
                        value={inventoryProblemFilter}
                        onChange={(event) => setInventoryProblemFilter(event.target.value)}
                        className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-3 py-2.5 text-xs uppercase tracking-wider text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                      >
                        <option value="all">Toutes problématiques</option>
                        {problematicOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <button
                        onClick={startAddInventory}
                        className="inline-flex items-center justify-center gap-2 bg-[#800000] px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#F2E8C6] transition-all hover:-translate-y-0.5 hover:bg-[#982B1C]"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter au stock
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-[#F2E8C6]/35 text-[10px] uppercase tracking-[0.18em] text-[#800000]">
                        <tr>
                              <th className="px-5 py-3 font-medium">Image</th>
                          <th className="px-5 py-3 font-medium">Produit</th>
                          <th className="px-5 py-3 font-medium">Quantité</th>
                          <th className="px-5 py-3 font-medium">Type de pdt</th>
                          <th className="px-5 py-3 font-medium">Problématique</th>
                          <th className="px-5 py-3 font-medium">Prix unitaire</th>
                          <th className="px-5 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DAD4B5]/20 text-sm">
                        {paginatedInventory.items.map((item) => (
                          <tr key={item.id} className="transition-colors hover:bg-[#F2E8C6]/70">
                            <td className="px-5 py-4">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-14 w-14 rounded border border-[#DAD4B5]/30 object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="inline-flex h-14 w-14 items-center justify-center rounded border border-dashed border-[#DAD4B5]/30 bg-[#F2E8C6] text-[10px] uppercase tracking-widest text-[#800000]/70">
                                  Sans image
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 font-medium">{item.name}</td>
                            <td className="px-5 py-4">{item.quantity}</td>
                            <td className="px-5 py-4 text-[#6f6258]">{item.product_type}</td>
                            <td className="px-5 py-4 text-[#6f6258]">{item.problematic ?? "-"}</td>
                            <td className="px-5 py-4 font-semibold">
                              {formatCfa(item.price)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditInventory(item)}
                                  className="inline-flex h-9 w-9 items-center justify-center border border-[#DAD4B5]/50 transition-colors hover:border-[#800000] hover:text-[#800000]"
                                  aria-label={`Modifier ${item.name}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => void handleDeleteInventory(item)}
                                  className="inline-flex h-9 w-9 items-center justify-center border border-[#ead0c9] text-red-700 hover:bg-red-50"
                                  aria-label={`Supprimer ${item.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    page={paginatedInventory.page}
                    pageCount={paginatedInventory.pageCount}
                    total={filteredInventory.length}
                    onPageChange={setInventoryPage}
                  />
                </div>
              </section>
            )}

            {view === "orders" && (
              <section className="admin-panel animate-admin-fade overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-[#DAD4B5]/25 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl italic">Commandes</h2>
                    <p className="text-xs text-[#800000]">{filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={orderStatusFilter}
                      onChange={(event) => setOrderStatusFilter(event.target.value)}
                      className="border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-3 py-2.5 text-xs uppercase tracking-wider text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="À préparer">À préparer</option>
                      <option value="Payée">Payée</option>
                      <option value="Expédiée">Expédiée</option>
                      <option value="Livrée">Livrée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                    <ShoppingBag className="h-5 w-5 text-[#800000]" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left">
                    <thead className="bg-[#F2E8C6]/35 text-[10px] uppercase tracking-[0.18em] text-[#800000]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Commande</th>
                        <th className="px-5 py-3 font-medium">Client</th>
                        <th className="px-5 py-3 font-medium">Adresse</th>
                        <th className="px-5 py-3 font-medium">Total</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DAD4B5]/20 text-sm">
                      {paginatedOrders.items.map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-[#F2E8C6]/70">
                          <td className="px-5 py-4 font-semibold">{order.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-xs text-[#800000]">{order.email}</p>
                          </td>
                          <td className="px-5 py-4 text-[#806356]">{order.address}</td>
                          <td className="px-5 py-4 font-semibold">{formatCfa(order.total)}</td>
                          <td className="px-5 py-4">
                            <select
                              value={order.status}
                              onChange={(event) => void handleUpdateOrderStatus(order, event.target.value as AdminOrder["status"])}
                              className="border border-[#DAD4B5]/50 bg-white/80 px-3 py-2 text-xs text-[#3F1712] outline-none transition-colors focus:border-[#982B1C]"
                            >
                              <option value="À préparer">À préparer</option>
                              <option value="Payée">Payée</option>
                              <option value="Expédiée">Expédiée</option>
                              <option value="Livrée">Livrée</option>
                              <option value="Annulée">Annulée</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={paginatedOrders.page}
                  pageCount={paginatedOrders.pageCount}
                  total={filteredOrders.length}
                  onPageChange={setOrderPage}
                />
              </section>
            )}

            {view === "messages" && (
              <section className="admin-panel animate-admin-fade overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-[#DAD4B5]/25 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl italic">Messages clients</h2>
                    <p className="text-xs text-[#800000]">{filteredMessages.length} message{filteredMessages.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex w-full items-center gap-3 border border-[#DAD4B5]/50 bg-[#F2E8C6]/85 px-4 py-2.5 transition-colors focus-within:border-[#982B1C] md:w-80">
                      <Search className="h-4 w-4 text-[#800000]" />
                      <input
                        value={messageQuery}
                        onChange={(event) => setMessageQuery(event.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-[#9c8d7d]"
                        placeholder="Rechercher message..."
                      />
                    </label>
                    <Mail className="hidden h-5 w-5 text-[#800000] md:block" />
                  </div>
                </div>
                <div className="grid gap-4 p-5 xl:grid-cols-2">
                  {paginatedMessages.items.map((item) => (
                    <article key={item.id} className="admin-hover border border-[#DAD4B5]/45 bg-[#F2E8C6]/80 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.firstName} {item.lastName}</p>
                          <p className="text-xs text-[#800000]">{item.email}</p>
                        </div>
                        <span className="bg-[#DAD4B5]/65 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#3F1712]">
                          {item.subject || "Autre"}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#3F1712]">{item.message}</p>
                      <p className="mt-4 text-[10px] uppercase tracking-widest text-[#800000]">
                        {new Date(item.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </article>
                  ))}
                  {!filteredMessages.length && (
                    <div className="border border-dashed border-[#DAD4B5]/50 p-8 text-center text-sm text-[#800000]">
                      Aucun message reçu pour le moment.
                    </div>
                  )}
                </div>
                <PaginationControls
                  page={paginatedMessages.page}
                  pageCount={paginatedMessages.pageCount}
                  total={filteredMessages.length}
                  onPageChange={setMessagePage}
                />
              </section>
            )}
          </div>
        </main>
      </div>

      <AdminModal open={productModalOpen} onClose={resetForm}>
        <ProductForm
          form={form}
          editingId={editingId}
          saving={saving}
          onCancel={resetForm}
          onSubmit={(event) => void handleSaveProduct(event)}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        />
      </AdminModal>

      <AdminModal open={inventoryModalOpen} onClose={resetInventoryForm}>
        <InventoryForm
          form={inventoryForm}
          editingId={editingInventoryId}
          productTypes={inventoryTypes}
          saving={saving}
          onCancel={resetInventoryForm}
          onSubmit={(event) => void handleSaveInventory(event)}
          onChange={(patch) => setInventoryForm((current) => ({ ...current, ...patch }))}
        />
      </AdminModal>
    </div>
  );
}

function AdminModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F1712]/74 px-4 py-6 backdrop-blur-sm animate-admin-fade">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-[#800000] shadow-2xl animate-admin-fade">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= pageSize) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-[#DAD4B5]/25 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#800000]">
        Page {page} sur {pageCount} - {total} résultat{total > 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="border border-[#DAD4B5]/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#800000] transition-colors hover:border-[#982B1C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1)
          .filter((item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1)
          .map((item, index, pages) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 && item - pages[index - 1] > 1 && (
                <span className="text-xs text-[#800000]/50">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(item)}
                className={`h-9 w-9 border text-xs font-semibold ${
                  item === page
                    ? "border-[#800000] bg-[#800000] text-[#F2E8C6]"
                    : "border-[#DAD4B5]/50 text-[#800000] transition-colors hover:border-[#982B1C]"
                }`}
              >
                {item}
              </button>
            </span>
          ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="border border-[#DAD4B5]/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#800000] transition-colors hover:border-[#982B1C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function ProductForm({
  form,
  editingId,
  saving,
  onCancel,
  onSubmit,
  onChange,
}: {
  form: ProductFormState;
  editingId: string | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (patch: Partial<ProductFormState>) => void;
}) {
  const previewImage = normalizeImageUrl(form.image);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const isPinterestPage = previewImage ? isPinterestPageUrl(previewImage) : false;

  useEffect(() => {
    setImagePreviewError(false);
  }, [previewImage]);

  return (
    <form onSubmit={onSubmit} className="bg-[#800000] p-6 text-white shadow-sm md:p-7">
      <div className="flex items-center justify-between gap-4 pr-12">
        <div>
          <h2 className="font-serif text-2xl italic">{editingId ? "Modifier le produit" : "Ajouter un produit"}</h2>
          <p className="text-xs text-white/50">Catalogue Blossom</p>
        </div>
        <PackagePlus className="h-5 w-5 text-[#DAD4B5]" />
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <input value={form.name} onChange={(event) => onChange({ name: event.target.value })} className="admin-dark-input" required />
          </Field>
          <Field label="Marque">
            <input value={form.brand} onChange={(event) => onChange({ brand: event.target.value })} className="admin-dark-input" required />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Prix (FCFA)">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => onChange({ price: event.target.value })} className="admin-dark-input" required />
          </Field>
          <Field label="Ancien prix (FCFA)">
            <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(event) => onChange({ originalPrice: event.target.value })} className="admin-dark-input" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Catégorie">
            <select value={form.category} onChange={(event) => onChange({ category: event.target.value as Product["category"] })} className="admin-dark-input">
              <option value="Soin">Soin</option>
              <option value="Parfum">Parfum</option>
              <option value="Maquillage">Maquillage</option>
            </select>
          </Field>
          <Field label="Badge">
            <select value={form.badge} onChange={(event) => onChange({ badge: event.target.value as ProductFormState["badge"] })} className="admin-dark-input">
              <option value="">Aucun</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Best-seller">Best-seller</option>
              <option value="Promo">Promo</option>
              <option value="Épuisé">Épuisé</option>
            </select>
          </Field>
        </div>

        <Field label="Sous-catégorie">
          <input value={form.subcategory} onChange={(event) => onChange({ subcategory: event.target.value })} className="admin-dark-input" />
        </Field>

        <Field label="Problématique">
          <select
            value={form.problematic}
            onChange={(event) => onChange({ problematic: event.target.value })}
            className="admin-dark-input"
          >
            <option value="">Aucune</option>
            {problematicOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="aspect-square overflow-hidden border border-white/10 bg-white/[0.06]">
            {previewImage && !isPinterestPage && !imagePreviewError ? (
              <img
                src={previewImage}
                alt="Aperçu produit"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => setImagePreviewError(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-white/35">
                <ImagePlus className="h-8 w-8" />
                <span className="text-[10px] uppercase tracking-widest">
                  {isPinterestPage
                    ? "Lien Pinterest non direct"
                    : imagePreviewError
                      ? "Image non lisible"
                      : "Image"}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Field label="Image produit">
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/20 bg-white/[0.06] px-4 py-4 text-[11px] font-semibold uppercase tracking-widest text-white/75 transition-colors hover:bg-white/[0.1]">
                <ImagePlus className="h-4 w-4" />
                Importer une image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    onChange({ image: await readImageFile(file) });
                  }}
                />
              </label>
            </Field>
            <Field label="Image URL">
              <input
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(event) => onChange({ image: normalizeImageUrl(event.target.value) })}
                onBlur={(event) => onChange({ image: normalizeImageUrl(event.target.value) })}
                className="admin-dark-input"
                placeholder="https://i.pinimg.com/.../image.jpg"
              />
            </Field>
            {isPinterestPage && (
              <p className="text-xs leading-5 text-[#F2E8C6]">
                Ce lien ouvre une page Pinterest, pas une image. Ouvre l'image, clic droit, puis copie
                l'adresse de l'image. Elle doit souvent commencer par https://i.pinimg.com/.
              </p>
            )}
            {imagePreviewError && (
              <p className="text-xs leading-5 text-[#F2E8C6]">
                Cette URL ne renvoie pas une image affichable. Utilise une URL directe finissant par
                .jpg, .png ou .webp, ou importe le fichier.
              </p>
            )}
          </div>
        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={(event) => onChange({ description: event.target.value })} className="admin-dark-input min-h-28 resize-none" required />
        </Field>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-[#F2E8C6] px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#3F1712] transition-all hover:-translate-y-0.5 hover:bg-[#DAD4B5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editingId ? "Enregistrer" : "Créer"}
        </button>
        {editingId && (
          <button type="button" onClick={onCancel} className="border border-white/15 px-4 py-3 text-[11px] uppercase tracking-widest text-white/72 transition-colors hover:bg-white/[0.08]">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

function InventoryForm({
  form,
  editingId,
  productTypes,
  saving,
  onCancel,
  onSubmit,
  onChange,
}: {
  form: InventoryFormState;
  editingId: string | null;
  productTypes: InventoryProductType[];
  saving: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (patch: Partial<InventoryFormState>) => void;
}) {
  const previewImage = normalizeImageUrl(form.image);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const isPinterestPage = previewImage ? isPinterestPageUrl(previewImage) : false;

  useEffect(() => {
    setImagePreviewError(false);
  }, [previewImage]);

  return (
    <form onSubmit={onSubmit} className="bg-[#800000] p-6 text-white shadow-sm md:p-7">
      <div className="flex items-center justify-between gap-4 pr-12">
        <div>
          <h2 className="font-serif text-2xl italic">{editingId ? "Modifier le stock" : "Ajouter au stock"}</h2>
          <p className="text-xs text-white/50">Inventaire par type et problématique</p>
        </div>
        <ClipboardList className="h-5 w-5 text-[#DAD4B5]" />
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Product Description">
          <input
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="admin-dark-input"
            placeholder="[ANUA] NIACINAMIDE 10% SERUM 30ML"
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Quantity">
            <input
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(event) => onChange({ quantity: event.target.value })}
              className="admin-dark-input"
              required
            />
          </Field>
          <Field label="Prix de vente unitaire">
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(event) => onChange({ price: event.target.value })}
              className="admin-dark-input"
              placeholder="16900"
              required
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type de pdt">
            <select
              value={form.product_type}
              onChange={(event) => onChange({ product_type: event.target.value })}
              className="admin-dark-input"
            >
              {(productTypes.length
                ? productTypes
                : [
                    { id: "SERUM", name: "SERUM", display_order: 1 },
                    { id: "TONER PAD", name: "TONER PAD", display_order: 2 },
                    { id: "TONER", name: "TONER", display_order: 3 },
                  ]
              ).map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Problématique">
            <select
              value={form.problematic}
              onChange={(event) => onChange({ problematic: event.target.value })}
              className="admin-dark-input"
            >
              <option value="">Aucune</option>
              <option value="IMPERFECTION">IMPERFECTION</option>
              <option value="GLOW">GLOW</option>
              <option value="HYDRATATION">HYDRATATION</option>
              <option value="CORPS">CORPS</option>
              <option value="NETTOYANT">NETTOYANT</option>
              <option value="SPF">SPF</option>
              <option value="PEAU SENSIBLE">PEAU SENSIBLE</option>
              <option value="CERNES">CERNES</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <div className="aspect-square overflow-hidden border border-white/10 bg-white/[0.06]">
            {previewImage && !isPinterestPage && !imagePreviewError ? (
              <img
                src={previewImage}
                alt="Aperçu image inventaire"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => setImagePreviewError(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-white/35">
                <ImagePlus className="h-8 w-8" />
                <span className="text-[10px] uppercase tracking-widest">
                  {isPinterestPage
                    ? "Lien Pinterest non direct"
                    : imagePreviewError
                      ? "Image non lisible"
                      : "Image"
                  }
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Field label="Image produit">
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/20 bg-white/[0.06] px-4 py-4 text-[11px] font-semibold uppercase tracking-widest text-white/75 transition-colors hover:bg-white/[0.1]">
                <ImagePlus className="h-4 w-4" />
                Importer une image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    onChange({ image: await readImageFile(file) });
                  }}
                />
              </label>
            </Field>
            <Field label="Image URL">
              <input
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(event) => onChange({ image: normalizeImageUrl(event.target.value) })}
                onBlur={(event) => onChange({ image: normalizeImageUrl(event.target.value) })}
                className="admin-dark-input"
                placeholder="https://i.pinimg.com/.../image.jpg"
              />
            </Field>
            {isPinterestPage && (
              <p className="text-xs leading-5 text-[#F2E8C6]">
                Ce lien ouvre une page Pinterest, pas une image. Ouvre l'image, clic droit, puis copie
                l'adresse de l'image. Elle doit souvent commencer par https://i.pinimg.com/.
              </p>
            )}
            {imagePreviewError && (
              <p className="text-xs leading-5 text-[#F2E8C6]">
                Cette URL ne renvoie pas une image affichable. Utilise une URL directe finissant par
                .jpg, .png ou .webp, ou importe le fichier.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-[#F2E8C6] px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#3F1712] transition-all hover:-translate-y-0.5 hover:bg-[#DAD4B5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editingId ? "Enregistrer" : "Ajouter"}
        </button>
        {editingId && (
          <button type="button" onClick={onCancel} className="border border-white/15 px-4 py-3 text-[11px] uppercase tracking-widest text-white/72 transition-colors hover:bg-white/[0.08]">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</span>
      {children}
    </label>
  );
}
