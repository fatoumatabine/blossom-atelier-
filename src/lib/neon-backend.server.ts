import { neon } from "@neondatabase/serverless";
import { products as seedProducts, type Product } from "@/lib/products";
import { hash, compare } from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

const { sign, verify } = jsonwebtoken;

export type OrderStatus = "À préparer" | "Payée" | "Expédiée" | "Livrée" | "Annulée";
export type UserRole = "admin" | "client";

export type Order = {
  id: string;
  userId: string;
  customer: string;
  email: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  discount?: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
};

export type ProductInput = {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string; // Can be a URL or base64 data
  category: Product["category"];
  subcategory?: string;
  badge?: Product["badge"];
  description: string;
  problematic?: string;
};

export type UserInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type ContactMessageInput = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactMessage = ContactMessageInput & {
  id: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
};

// Ensure users table exists
async function ensureUsersTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// Hash password and create user
export async function createUser(input: UserInput) {
  await ensureDatabase();
  await ensureUsersTable();
  const sql = getSql();
  const email = normalizeEmail(input.email);
  const name = normalizeLimitedText(input.name, "Nom", 120);
  const role = normalizeRole(input.role);

  if (!input.password || input.password.length < 8 || input.password.length > 128) {
    throw new Error("Le mot de passe doit contenir entre 8 et 128 caractères.");
  }

  // Check if user already exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  const hashedPassword = await hash(input.password, 12);
  const id = createId("usr");

  await sql`
    INSERT INTO users (id, email, password, name, role)
    VALUES (${id}, ${email}, ${hashedPassword}, ${name}, ${role})
  `;

  const user = await sql`SELECT id, email, name, role, created_at FROM users WHERE id = ${id}`;
  return {
    id: user[0].id,
    email: user[0].email,
    name: user[0].name,
    role: user[0].role,
    created_at: new Date(user[0].created_at).toISOString(),
  };
}

// Get user by email
export async function getUserByEmail(email: string) {
  await ensureDatabase();
  await ensureUsersTable();
  const sql = getSql();
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) return null;
  const users =
    await sql`SELECT id, email, password, name, role, created_at FROM users WHERE email = ${normalizedEmail}`;
  if (users.length === 0) return null;
  const user = users[0];
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name,
    role: user.role,
    created_at: new Date(user.created_at).toISOString(),
  };
}

// Validate password
export async function validatePassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const isValid = await compare(password, user.password);
  if (!isValid) return null;
  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Generate JWT token
export function generateToken(user: Omit<User, "password">): string {
  return sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

// Verify JWT token
export function verifyToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    return verify(token, getJwtSecret()) as { id: string; email: string; role: UserRole };
  } catch {
    return null;
  }
}

type ProductRow = {
  id: string;
  name: string;
  brand: string;
  price: string | number;
  original_price: string | number | null;
  image: string;
  category: Product["category"];
  subcategory: string | null;
  badge: Product["badge"] | null;
  description: string;
  problematic: string | null;
  notes: Product["notes"] | null;
  sizes: Product["sizes"] | null;
  scent_family: string | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  customer: string;
  email: string;
  total: string | number;
  status: OrderStatus;
  created_at: string | Date;
  address: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: string | number;
};

type UserRow = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  created_at: string | Date;
};

type ContactMessageRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string | Date;
};

type InventoryRow = {
  id: string;
  name: string;
  quantity: string | number;
  product_type: string;
  problematic: string | null;
  image: string | null;
  price: string | number;
  created_at: string | Date;
  updated_at: string | Date;
};

type InventoryProductTypeRow = {
  id: string;
  name: string;
  display_order: string | number;
};

const defaultJwtSecret = "your-secret-key-change-in-production";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} manquant. Configurez cette variable comme secret de production.`);
  }
  return value;
}

function getJwtSecret() {
  const secret = getRequiredEnv("JWT_SECRET");
  if (secret === defaultJwtSecret || secret === "change-me" || secret.length < 32) {
    throw new Error("JWT_SECRET doit être une valeur aléatoire forte d'au moins 32 caractères.");
  }
  return secret;
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureCloudinaryConfig() {
  cloudinary.config({
    cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  });
}

async function uploadImageToCloudinary(imageBase64: string): Promise<string> {
  try {
    ensureCloudinaryConfig();
    if (imageBase64.length > 8_000_000) {
      throw new Error("Image trop volumineuse.");
    }

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    let base64Data = imageBase64;
    if (imageBase64.includes("base64,")) {
      base64Data = imageBase64.split("base64,")[1];
    }
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: process.env.CLOUDINARY_FOLDER,
        resource_type: "auto",
      },
    );
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Échec de l'upload de l'image");
  }
}

const orderStatuses: OrderStatus[] = ["À préparer", "Payée", "Expédiée", "Livrée", "Annulée"];

let initialized = false;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquant. Ajoutez l'URL Neon dans votre fichier .env.");
  }

  // Replace .pooler. with . in the hostname (Neon recommandation)
  const url = databaseUrl.replace(/\.pooler\./, ".");

  // Logs utiles (sans montrer le secret)
  try {
    const host = url.replace(/^.*@/, "@").split("@")[1]?.split("/")[0] ?? "unknown-host";
    console.log(`[neon] DATABASE_URL host: ${host}`);
  } catch {
    // ignore
  }

  return url;
}

function getSql() {
  return neon(getDatabaseUrl());
}

function toNumber(value: string | number | null | undefined) {
  return value === null || value === undefined ? undefined : Number(value);
}

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeLimitedText(value: unknown, label: string, maxLength: number, fallback = "") {
  const text = normalizeText(value, fallback);
  if (text.length > maxLength) {
    throw new Error(`${label} est trop long.`);
  }
  return text;
}

function normalizeEmail(value: unknown) {
  const email = normalizeLimitedText(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Adresse email invalide.");
  }
  return email;
}

function normalizeRole(value: unknown): UserRole {
  if (value !== "admin" && value !== "client") {
    throw new Error("Rôle utilisateur invalide.");
  }
  return value;
}

function normalizeQuantity(value: unknown, max = 99) {
  const quantity = Math.floor(Number(value) || 0);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > max) {
    throw new Error("Quantité invalide.");
  }
  return quantity;
}

function normalizePrice(value: unknown) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Le prix du produit est invalide.");
  }
  return Math.round(price * 100) / 100;
}

function parseProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    originalPrice: toNumber(row.original_price),
    image: row.image,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    badge: row.badge ?? undefined,
    description: row.description,
    problematic: row.problematic ?? undefined,
    notes: row.notes ?? undefined,
    sizes: row.sizes ?? undefined,
    scentFamily: row.scent_family ?? undefined,
  };
}

function parseOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    userId: row.user_id,
    customer: row.customer,
    email: row.email,
    total: Number(row.total),
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    address: row.address,
    items: items
      .filter((item) => item.order_id === row.id)
      .map((item) => ({
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
  };
}

function parseContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function ensureDatabase() {
  if (initialized) return;

  const sql = getSql();
  const shouldSeedDemoData =
    process.env.SEED_DEMO_DATA === "true" || process.env.NODE_ENV !== "production";

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      original_price NUMERIC(10, 2),
      image TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Parfum', 'Maquillage', 'Soin')),
      subcategory TEXT,
      badge TEXT CHECK (badge IN ('Nouveau', 'Best-seller', 'Promo', 'Épuisé')),
      description TEXT NOT NULL,
      problematic TEXT,
      notes JSONB,
      sizes JSONB,
      scent_family TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS problematic TEXT
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      product_type TEXT NOT NULL,
      problematic TEXT,
      image TEXT,
      price NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE inventory
    ADD COLUMN IF NOT EXISTS image TEXT
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inventory_product_types (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('À préparer', 'Payée', 'Expédiée', 'Livrée', 'Annulée')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price NUMERIC(10, 2) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  for (const product of seedProducts) {
    await sql`
      INSERT INTO products (
        id, name, brand, price, original_price, image, category, subcategory, badge,
        description, problematic, notes, sizes, scent_family
      )
      VALUES (
        ${product.id}, ${product.name}, ${product.brand}, ${product.price},
        ${product.originalPrice ?? null}, ${product.image}, ${product.category},
        ${product.subcategory ?? null}, ${product.badge ?? null}, ${product.description},
        ${product.problematic ?? null},
        ${product.notes ? JSON.stringify(product.notes) : null}::jsonb,
        ${product.sizes ? JSON.stringify(product.sizes) : null}::jsonb,
        ${product.scentFamily ?? null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const orderCount = await sql`SELECT COUNT(*)::int AS count FROM orders`;

  if (shouldSeedDemoData && Number(orderCount[0]?.count ?? 0) === 0) {
    const seedOrders = [
      {
        id: "CMD-1048",
        customer: "Nadia Benali",
        email: "nadia.benali@example.com",
        address: "Plateau, Dakar",
        status: "À préparer" as OrderStatus,
        items: [
          { productId: "p3", name: "Sérum Botanique", quantity: 1, price: 64 },
          { productId: "p4", name: "Crème Précieuse", quantity: 1, price: 78 },
        ],
      },
      {
        id: "CMD-1047",
        customer: "Awa Diagne",
        email: "awa.diagne@example.com",
        address: "Almadies, Dakar",
        status: "Payée" as OrderStatus,
        items: [{ productId: "p1", name: "Éclat Floral 50ML", quantity: 1, price: 89 }],
      },
      {
        id: "CMD-1046",
        customer: "Yasmine Leroy",
        email: "yasmine.leroy@example.com",
        address: "Tevragh Zeina, Nouakchott",
        status: "Expédiée" as OrderStatus,
        items: [
          { productId: "p2", name: "Rouge Velours", quantity: 1, price: 32 },
          { productId: "p10", name: "Huile Précieuse", quantity: 1, price: 58 },
        ],
      },
    ];

    for (const order of seedOrders) {
      const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      await sql`
        INSERT INTO orders (id, customer, email, address, total, status)
        VALUES (${order.id}, ${order.customer}, ${order.email}, ${order.address}, ${total}, ${order.status})
        ON CONFLICT (id) DO NOTHING
      `;

      for (const item of order.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, name, quantity, price)
          VALUES (${order.id}, ${item.productId}, ${item.name}, ${item.quantity}, ${item.price})
        `;
      }
    }
  }

  // Seed inventory items
  const inventoryTypeCount = await sql`SELECT COUNT(*)::int AS count FROM inventory_product_types`;
  if (Number(inventoryTypeCount[0]?.count ?? 0) === 0) {
    for (const [index, name] of defaultInventoryProductTypes.entries()) {
      await sql`
        INSERT INTO inventory_product_types (id, name, display_order)
        VALUES (${`ipt-${index + 1}`}, ${name}, ${index + 1})
        ON CONFLICT (name) DO NOTHING
      `;
    }
  }

  const inventoryCount = await sql`SELECT COUNT(*)::int AS count FROM inventory`;
  if (shouldSeedDemoData && Number(inventoryCount[0]?.count ?? 0) === 0) {
    const seedInventory = [
      {
        name: "[ANUA] NIACINAMIDE 10% SERUM 30ML",
        quantity: 5,
        product_type: "SERUM",
        problematic: "IMPERFECTION",
        image: "https://picsum.photos/seed/niacinamide-serum/120/120",
        price: 16900,
      },
      {
        name: "[ANUA] BRIGHTENING PAD 210ML",
        quantity: 5,
        product_type: "TONER PAD",
        problematic: "GLOW",
        image: "https://picsum.photos/seed/brightening-pad/120/120",
        price: 16900,
      },
      {
        name: "[ANUA] MILKY TONER 250ML",
        quantity: 5,
        product_type: "TONER",
        problematic: "HYDRATATION",
        image: "https://picsum.photos/seed/milky-toner/120/120",
        price: 14900,
      },
      {
        name: "[APLB] BODY WASH 300ML",
        quantity: 5,
        product_type: "GEL DOUCHE",
        problematic: "CORPS",
        image: "https://picsum.photos/seed/body-wash/120/120",
        price: 9900,
      },
      {
        name: "[ARENCIA] CLEANSER 120G",
        quantity: 5,
        product_type: "NETTOYANT",
        problematic: "NETTOYANT",
        image: "https://picsum.photos/seed/cleanser/120/120",
        price: 13900,
      },
      {
        name: "[Beauty of Joseon] RELIEF SUN 50ML",
        quantity: 5,
        product_type: "SOLAIRE",
        problematic: "SPF",
        image: "https://picsum.photos/seed/relief-sun/120/120",
        price: 13900,
      },
      {
        name: "[Beauty of Joseon] RELIEF SUN AQUA 50ML",
        quantity: 5,
        product_type: "SOLAIRE",
        problematic: "SPF",
        price: 13900,
      },
      {
        name: "[Dr.Althea] RELIEF CREAM 50ML",
        quantity: 5,
        product_type: "CREME VISAGE",
        problematic: "PEAU SENSIBLE",
        image: "https://picsum.photos/seed/relief-cream/120/120",
        price: 16900,
      },
      {
        name: "[KSECRET] SERUM 30ML",
        quantity: 5,
        product_type: "SERUM",
        problematic: "GLOW",
        image: "https://picsum.photos/seed/ksecret-serum/120/120",
        price: 13900,
      },
      {
        name: "[KSECRET] SUN CREAM 50ML",
        quantity: 5,
        product_type: "SOLAIRE",
        problematic: "SPF",
        image: "https://picsum.photos/seed/sun-cream/120/120",
        price: 12900,
      },
      {
        name: "[MARY&MAY] EYE CREAM 30ML",
        quantity: 5,
        product_type: "YEUX",
        problematic: "CERNES",
        image: "https://picsum.photos/seed/eye-cream/120/120",
        price: 8900,
      },
      {
        name: "[NUMBUZIN] TONER 200ML",
        quantity: 5,
        product_type: "TONER",
        problematic: "GLOW",
        image: "https://picsum.photos/seed/numbuzin-toner/120/120",
        price: 15900,
      },
      {
        name: "[NUMBUZIN] PAD 180ML",
        quantity: 5,
        product_type: "TONER PAD",
        problematic: "GLOW",
        image: "https://picsum.photos/seed/numbuzin-pad/120/120",
        price: 17900,
      },
      {
        name: "[SKIN1004] AMPOULE 100ML",
        quantity: 5,
        product_type: "TRAITEMENT",
        problematic: "PEAU SENSIBLE",
        image: "https://picsum.photos/seed/ampoule/120/120",
        price: 12900,
      },
    ];
    for (const [index, item] of seedInventory.entries()) {
      const id = `inv-${Date.now()}-${index}`;
      await sql`
        INSERT INTO inventory (id, name, quantity, product_type, problematic, image, price)
        VALUES (${id}, ${item.name}, ${item.quantity}, ${item.product_type}, ${item.problematic}, ${item.image ?? null}, ${item.price})
      `;
    }
  }

  initialized = true;
}

export type InventoryItem = {
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

export type InventoryProductType = {
  id: string;
  name: string;
  display_order: number;
};

const defaultInventoryProductTypes = [
  "SERUM",
  "TONER PAD",
  "TONER",
  "GEL DOUCHE",
  "NETTOYANT",
  "SOLAIRE",
  "CREME VISAGE",
  "YEUX",
  "TRAITEMENT",
];

function parseInventory(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity) || 0,
    product_type: row.product_type,
    problematic: row.problematic,
    image: row.image ?? "",
    price: Number(row.price) || 0,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
  };
}

function parseInventoryProductType(row: InventoryProductTypeRow): InventoryProductType {
  return {
    id: row.id,
    name: row.name,
    display_order: Number(row.display_order) || 0,
  };
}

export async function listInventoryProductTypes() {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, display_order
    FROM inventory_product_types
    ORDER BY display_order ASC, name ASC
  `) as InventoryProductTypeRow[];
  return rows.map(parseInventoryProductType);
}

export async function listInventory() {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM inventory ORDER BY created_at DESC`) as InventoryRow[];
  return rows.map(parseInventory);
}

export async function getInventoryItem(id: string) {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM inventory WHERE id = ${id}`) as InventoryRow[];
  return rows[0] ? parseInventory(rows[0]) : null;
}

export async function createInventoryItem(input: {
  name: string;
  quantity: number;
  product_type: string;
  problematic: string | null;
  image: string | null;
  price: number;
}) {
  await ensureDatabase();
  const sql = getSql();
  const id = createId("inv");
  const name = normalizeLimitedText(input.name, "Nom de l'article", 180);
  const productType = normalizeLimitedText(input.product_type, "Type de produit", 80);
  const quantity = Math.max(0, Math.floor(Number(input.quantity) || 0));
  const price = normalizePrice(input.price);
  await sql`
    INSERT INTO inventory (id, name, quantity, product_type, problematic, image, price)
    VALUES (${id}, ${name}, ${quantity}, ${productType}, ${input.problematic}, ${input.image}, ${price})
  `;
  return getInventoryItem(id);
}

export async function updateInventoryItem(
  id: string,
  input: Partial<{
    name: string;
    quantity: number;
    product_type: string;
    problematic: string | null;
    image: string | null;
    price: number;
  }>,
) {
  await ensureDatabase();
  const sql = getSql();
  const current = await getInventoryItem(id);
  if (!current) {
    throw new Error("Article introuvable.");
  }
  await sql`
    UPDATE inventory
    SET
      name = ${input.name === undefined ? current.name : normalizeLimitedText(input.name, "Nom de l'article", 180)},
      quantity = ${input.quantity === undefined ? current.quantity : Math.max(0, Math.floor(Number(input.quantity) || 0))},
      product_type = ${input.product_type === undefined ? current.product_type : normalizeLimitedText(input.product_type, "Type de produit", 80)},
      problematic = ${input.problematic ?? current.problematic},
      image = ${input.image ?? current.image},
      price = ${input.price === undefined ? current.price : normalizePrice(input.price)},
      updated_at = now()
    WHERE id = ${id}
  `;
  return getInventoryItem(id);
}

export async function deleteInventoryItem(id: string) {
  await ensureDatabase();
  const sql = getSql();
  const rows = await sql`DELETE FROM inventory WHERE id = ${id} RETURNING id`;
  if (!rows.length) {
    throw new Error("Article introuvable.");
  }
  return { success: true };
}

export async function listProducts(filters?: { category?: string; q?: string }) {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products ORDER BY created_at DESC`) as ProductRow[];
  const category = filters?.category?.toLowerCase();
  const q = filters?.q?.toLowerCase();

  return rows.map(parseProduct).filter((product) => {
    const matchesCategory = category ? product.category.toLowerCase() === category : true;
    const matchesSearch = q
      ? [product.name, product.brand, product.description, product.subcategory]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(q))
      : true;

    return matchesCategory && matchesSearch;
  });
}

export async function getProduct(id: string) {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products WHERE id = ${id}`) as ProductRow[];
  return rows[0] ? parseProduct(rows[0]) : null;
}

export async function createProduct(input: ProductInput) {
  await ensureDatabase();
  const sql = getSql();
  const name = normalizeLimitedText(input.name, "Nom du produit", 180);
  const brand = normalizeLimitedText(input.brand, "Marque", 120, "BLOSSOM Atelier");
  const description = normalizeLimitedText(input.description, "Description", 2_000);

  if (!name || !description) {
    throw new Error("Le nom et la description du produit sont obligatoires.");
  }

  let imageUrl = input.image;
  // If image is provided as base64, upload to Cloudinary
  if (input.image && input.image.includes("base64,")) {
    imageUrl = await uploadImageToCloudinary(input.image);
  }

  const product: Product = {
    id: createId("prd"),
    name,
    brand,
    price: normalizePrice(input.price),
    originalPrice: input.originalPrice ? normalizePrice(input.originalPrice) : undefined,
    image:
      imageUrl ||
      seedProducts.find((p) => p.category === input.category)?.image ||
      seedProducts[0].image,
    category: input.category,
    subcategory: normalizeText(input.subcategory) || undefined,
    badge: input.badge,
    description,
    problematic: normalizeText(input.problematic) || undefined,
  };

  const rows = (await sql`
    INSERT INTO products (
      id, name, brand, price, original_price, image, category, subcategory, badge, description, problematic
    )
    VALUES (
      ${product.id}, ${product.name}, ${product.brand}, ${product.price},
      ${product.originalPrice ?? null}, ${product.image}, ${product.category},
      ${product.subcategory ?? null}, ${product.badge ?? null}, ${product.description},
      ${product.problematic ?? null}
    )
    RETURNING *
  `) as ProductRow[];

  return parseProduct(rows[0]);
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const current = await getProduct(id);

  if (!current) {
    throw new Error("Produit introuvable.");
  }

  let imageUrl = current.image;
  // If new image is provided as base64, upload to Cloudinary
  if (input.image && input.image.includes("base64,")) {
    imageUrl = await uploadImageToCloudinary(input.image);
  } else if (input.image !== undefined) {
    // If image is provided as a URL (not base64), use it directly
    imageUrl = input.image;
  }

  const updated: Product = {
    ...current,
    ...input,
    price: input.price === undefined ? current.price : normalizePrice(input.price),
    originalPrice:
      input.originalPrice === undefined
        ? current.originalPrice
        : normalizePrice(input.originalPrice),
    image: imageUrl,
    name: input.name === undefined ? current.name : normalizeText(input.name, current.name),
    brand: input.brand === undefined ? current.brand : normalizeText(input.brand, current.brand),
    description:
      input.description === undefined
        ? current.description
        : normalizeText(input.description, current.description),
    problematic:
      input.problematic === undefined
        ? current.problematic
        : normalizeText(input.problematic) || undefined,
  };

  const sql = getSql();
  const rows = (await sql`
    UPDATE products
    SET
      name = ${updated.name},
      brand = ${updated.brand},
      price = ${updated.price},
      original_price = ${updated.originalPrice ?? null},
      image = ${updated.image},
      category = ${updated.category},
      subcategory = ${updated.subcategory ?? null},
      badge = ${updated.badge ?? null},
      description = ${updated.description},
      problematic = ${updated.problematic ?? null},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[];

  return parseProduct(rows[0]);
}

export async function deleteProduct(id: string) {
  await ensureDatabase();
  const sql = getSql();
  const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;

  if (!rows.length) {
    throw new Error("Produit introuvable.");
  }

  return { success: true };
}

export async function listOrders(filters?: { status?: string }) {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders ORDER BY created_at DESC`) as OrderRow[];
  const items = (await sql`SELECT * FROM order_items ORDER BY id ASC`) as OrderItemRow[];

  return rows
    .map((row) => parseOrder(row, items))
    .filter((order) => (filters?.status ? order.status === filters.status : true));
}

export async function getOrder(id: string) {
  const orders = await listOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function createOrder(input: {
  customer: string;
  email: string;
  address: string;
  items: { productId: string; quantity: number }[];
  promoCode?: string;
}) {
  await ensureDatabase();
  const sql = getSql();
  const orderItems = [];
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
    throw new Error("La commande doit contenir entre 1 et 50 articles.");
  }

  for (const item of input.items) {
    const productId = normalizeLimitedText(item.productId, "Identifiant produit", 120);
    const product = await getProduct(productId);

    if (!product) {
      throw new Error(`Produit introuvable: ${productId}`);
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity: normalizeQuantity(item.quantity),
      price: product.price,
    });
  }

  const id = createId("CMD");
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = input.promoCode?.trim().toUpperCase() === "WELCOME10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount);
  const customer = normalizeLimitedText(input.customer, "Client", 160, "Client Blossom");
  const email = normalizeEmail(input.email);
  const address = normalizeLimitedText(input.address, "Adresse", 500, "Adresse à confirmer");

  await sql`
    INSERT INTO orders (id, customer, email, address, total, status)
    VALUES (${id}, ${customer}, ${email}, ${address}, ${total}, ${"À préparer"})
  `;

  for (const item of orderItems) {
    await sql`
      INSERT INTO order_items (order_id, product_id, name, quantity, price)
      VALUES (${id}, ${item.productId}, ${item.name}, ${item.quantity}, ${item.price})
    `;
  }

  return getOrder(id);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await ensureDatabase();

  if (!orderStatuses.includes(status)) {
    throw new Error("Statut de commande invalide.");
  }

  const sql = getSql();
  const rows = await sql`
    UPDATE orders
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!rows.length) {
    throw new Error("Commande introuvable.");
  }

  return getOrder(id);
}

export async function createContactMessage(input: ContactMessageInput) {
  await ensureDatabase();
  const sql = getSql();
  const firstName = normalizeLimitedText(input.firstName, "Prénom", 80);
  const lastName = normalizeLimitedText(input.lastName, "Nom", 80);
  const email = normalizeEmail(input.email);
  const subject = normalizeLimitedText(input.subject, "Sujet", 120, "Autre");
  const message = normalizeLimitedText(input.message, "Message", 4_000);

  if (!firstName || !lastName || !email || !message) {
    throw new Error("Prénom, nom, email et message sont obligatoires.");
  }

  const id = createId("msg");
  const rows = (await sql`
    INSERT INTO contact_messages (id, first_name, last_name, email, subject, message)
    VALUES (${id}, ${firstName}, ${lastName}, ${email}, ${subject}, ${message})
    RETURNING *
  `) as ContactMessageRow[];

  return parseContactMessage(rows[0]);
}

export async function listContactMessages() {
  await ensureDatabase();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM contact_messages ORDER BY created_at DESC
  `) as ContactMessageRow[];

  return rows.map(parseContactMessage);
}

export async function getAdminSummary() {
  await ensureDatabase();
  const [products, orders] = await Promise.all([listProducts(), listOrders()]);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "À préparer").length;
  const promoProducts = products.filter((product) => product.badge === "Promo").length;
  const averageCart = orders.length ? Math.round(revenue / orders.length) : 0;

  return {
    revenue,
    ordersCount: orders.length,
    pendingOrders,
    productsCount: products.length,
    promoProducts,
    averageCart,
    recentOrders: orders.slice(0, 6),
    recentProducts: products.slice(0, 8),
    activity: [
      `${pendingOrders} commande${pendingOrders > 1 ? "s" : ""} à préparer`,
      `${promoProducts} produit${promoProducts > 1 ? "s" : ""} en promotion`,
      `Panier moyen: ${averageCart.toLocaleString("fr-FR")} FCFA`,
      "Base Neon connectée",
    ],
  };
}
