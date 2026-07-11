import { loadEnv } from "@/lib/env";
import { createFileRoute } from "@tanstack/react-router";
import { z, ZodError } from "zod";
import { timingSafeEqual } from "node:crypto";

if (process.env.NODE_ENV !== "production") {
  loadEnv();
}
import {
  createOrder,
  createContactMessage,
  createProduct,
  deleteProduct,
  getAdminSummary,
  getOrder,
  getUserByEmail,
  listContactMessages,
  getProduct,
  listOrders,
  listProducts,
  updateOrderStatus,
  updateProduct,
  type OrderStatus,
  type ProductInput,
} from "@/lib/neon-backend.server";

// Import inventory functions
import {
  listInventory,
  listInventoryProductTypes,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type InventoryItem,
} from "@/lib/neon-backend.server";

// Import auth functions
import {
  createUser,
  validatePassword,
  generateToken,
  verifyToken,
  type UserInput,
} from "@/lib/neon-backend.server";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({ request }) => handleApi(request, "GET"),
      POST: async ({ request }) => handleApi(request, "POST"),
      PATCH: async ({ request }) => handleApi(request, "PATCH"),
      DELETE: async ({ request }) => handleApi(request, "DELETE"),
    },
  },
});

const sessionCookieName = "blossom_session";
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const auditLog: Array<{ timestamp: string; action: string; user?: string; details: string }> = [];

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'self'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const emailSchema = z.string().trim().email("Adresse email invalide.").max(254);
const authRegisterSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, "Mot de passe trop court.").max(128),
    name: z.string().trim().min(2, "Nom requis.").max(120),
    role: z.enum(["admin", "client"]).optional(),
  })
  .strict();

const authLoginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Mot de passe requis.").max(128),
  })
  .strict();

const contactSchema = z
  .object({
    firstName: z.string().trim().min(1, "Prénom requis.").max(80),
    lastName: z.string().trim().min(1, "Nom requis.").max(80),
    email: emailSchema,
    subject: z.string().trim().max(120).optional().default("Autre"),
    message: z.string().trim().min(5, "Message trop court.").max(4_000),
  })
  .strict();

const orderSchema = z
  .object({
    customer: z.string().trim().min(2, "Client requis.").max(160),
    email: emailSchema,
    address: z.string().trim().min(5, "Adresse requise.").max(500),
    items: z
      .array(
        z.object({
          productId: z.string().trim().min(1).max(120),
          quantity: z.coerce.number().int().min(1).max(99),
        }),
      )
      .min(1, "Panier vide.")
      .max(50, "Trop d'articles dans la commande."),
    promoCode: z.string().trim().max(40).optional(),
  })
  .strict();

const productSchema = z
  .object({
    name: z.string().trim().min(1).max(180),
    brand: z.string().trim().min(1).max(120),
    price: z.coerce.number().min(0).max(10_000_000),
    originalPrice: z.coerce.number().min(0).max(10_000_000).optional(),
    image: z.string().trim().max(8_000_000).optional(),
    category: z.enum(["Parfum", "Maquillage", "Soin"]),
    subcategory: z.string().trim().max(120).optional(),
    badge: z.enum(["Nouveau", "Best-seller", "Promo", "Épuisé"]).optional(),
    description: z.string().trim().min(1).max(2_000),
    problematic: z.string().trim().max(80).optional(),
  })
  .strict();

const inventorySchema = z
  .object({
    name: z.string().trim().min(1).max(180),
    quantity: z.coerce.number().int().min(0).max(1_000_000),
    product_type: z.string().trim().min(1).max(80),
    problematic: z.string().trim().max(80).nullable().optional(),
    image: z.string().trim().max(8_000_000).nullable().optional(),
    price: z.coerce.number().min(0).max(10_000_000),
  })
  .strict();

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...securityHeaders,
      ...init?.headers,
    },
  });
}

function error(message: string, status = 400) {
  return json({ error: message }, { status });
}

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

function enforceRateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${bucket}:${getClientIp(request)}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Response("Trop de requêtes. Réessayez dans quelques minutes.", {
      status: 429,
    });
  }

  current.count += 1;
}

function addAuditLog(action: string, user: string | undefined, details: string) {
  auditLog.push({
    timestamp: new Date().toISOString(),
    action,
    user,
    details,
  });
  // Keep last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.shift();
  }
}

function validateMimeType(base64Data: string, allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"]): boolean {
  try {
    const headerMatch = base64Data.match(/^data:([a-zA-Z0-9\/+]+);base64,/);
    if (!headerMatch) return false;
    const mimeType = headerMatch[1];
    return allowedTypes.includes(mimeType);
  } catch {
    return false;
  }
}

function validateSameOrigin(request: Request, url: URL, method: string) {
  if (!["POST", "PATCH", "DELETE"].includes(method)) return;

  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    throw new Response("Origine de requête refusée.", { status: 403 });
  }
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return "";

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function getRequestToken(request: Request) {
  const header = request.headers.get("Authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return bearer || getCookie(request, sessionCookieName);
}

function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=604800; HttpOnly; SameSite=Strict${secure}`;
}

function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

function zodMessage(validationError: ZodError) {
  return validationError.errors[0]?.message ?? "Données invalides.";
}

async function validatedJson<T>(request: Request, schema: z.ZodType<T>, maxBytes = 100_000) {
  try {
    const body = await readJson<unknown>(request, maxBytes);
    return schema.parse(body);
  } catch (parseError) {
    if (parseError instanceof ZodError) {
      throw new Error(zodMessage(parseError));
    }
    throw parseError;
  }
}

function requireAdmin(request: Request) {
  const token = getRequestToken(request);
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== "admin") {
    throw new Response("Accès administrateur requis.", { status: 401 });
  }

  return user;
}

async function readJson<T>(request: Request, maxBytes = 100_000) {
  try {
    const text = await request.text();
    if (text.length > maxBytes) {
      throw new Error("Le corps JSON est trop volumineux.");
    }
    return JSON.parse(text) as T;
  } catch (jsonError) {
    if (jsonError instanceof Error && jsonError.message.includes("volumineux")) {
      throw jsonError;
    }
    throw new Error("Le corps JSON est invalide.");
  }
}

async function handleApi(request: Request, method: string) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean).slice(1);

  try {
    validateSameOrigin(request, url, method);

    if (method === "GET" && parts[0] === "health") {
      return json({ ok: true, service: "Blossom Neon API" });
    }

    // Auth endpoints
    if (method === "GET" && parts[0] === "auth" && parts[1] === "me") {
      const token = getRequestToken(request);
      const tokenUser = token ? verifyToken(token) : null;
      if (!tokenUser) {
        return error("Session invalide.", 401);
      }

      const storedUser = await getUserByEmail(tokenUser.email);
      if (!storedUser) {
        return error("Session invalide.", 401);
      }

      return json({
        user: {
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name,
          role: storedUser.role,
        },
      });
    }

    if (method === "POST" && parts[0] === "auth" && parts[1] === "logout") {
      return json(
        { ok: true },
        {
          headers: {
            "Set-Cookie": expiredSessionCookie(),
          },
        },
      );
    }

    if (method === "POST" && parts[0] === "auth" && parts[1] === "register") {
      enforceRateLimit(request, "auth:register", 5, 60 * 60 * 1000);
      const body = await validatedJson(request, authRegisterSchema);
      const userInput: UserInput = { ...body, role: body.role ?? "client" };
      if (userInput.role === "admin") {
        const provided = request.headers.get("x-admin-setup-key");
        const expected = process.env.ADMIN_SETUP_KEY;
        if (!expected || !provided) {
          addAuditLog("admin_creation_failed", body.email, "Clé admin manquante");
          return error("Clé de création admin invalide.", 403);
        }
        try {
          if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
            addAuditLog("admin_creation_failed", body.email, "Clé admin invalide");
            return error("Clé de création admin invalide.", 403);
          }
        } catch {
          addAuditLog("admin_creation_failed", body.email, "Clé admin invalide");
          return error("Clé de création admin invalide.", 403);
        }
      }
      const user = await createUser(userInput);
      addAuditLog("user_created", user.email, `Rôle: ${userInput.role}`);
      return json({ user }, { status: 201 });
    }

    if (method === "POST" && parts[0] === "auth" && parts[1] === "login") {
      enforceRateLimit(request, "auth:login", 10, 15 * 60 * 1000);
      const body = await validatedJson(request, authLoginSchema);
      const user = await validatePassword(body.email, body.password);
      if (!user) {
        addAuditLog("login_failed", body.email, "Identifiants invalides");
        return error("Identifiants invalides.", 401);
      }
      const token = generateToken(user);
      addAuditLog("login_success", user.email, `Rôle: ${user.role}`);
      return json(
        { user, token },
        {
          headers: {
            "Set-Cookie": sessionCookie(token),
          },
        },
      );
    }

    if (method === "GET" && parts[0] === "admin" && parts[1] === "summary") {
      requireAdmin(request);
      return json(await getAdminSummary());
    }

    if (method === "GET" && parts[0] === "admin" && parts[1] === "audit-logs") {
      requireAdmin(request);
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 1000);
      return json(auditLog.slice(-limit));
    }

    if (parts[0] === "inventory") {
      requireAdmin(request);
      return handleInventory(request, method, parts, url);
    }

    if (parts[0] === "products") {
      return handleProducts(request, method, parts, url);
    }

    if (parts[0] === "orders") {
      return handleOrders(request, method, parts, url);
    }

    if (parts[0] === "contact") {
      return handleContact(request, method);
    }

    return error("Endpoint introuvable.", 404);
  } catch (apiError) {
    if (apiError instanceof Response) {
      return error(await apiError.text(), apiError.status);
    }
    const message = apiError instanceof Error ? apiError.message : "Erreur serveur.";
    return error(message, message.includes("introuvable") ? 404 : 400);
  }
}

async function handleContact(request: Request, method: string) {
  if (method === "GET") {
    requireAdmin(request);
    return json(await listContactMessages());
  }

  if (method === "POST") {
    const body = await readJson<{
      firstName: string;
      lastName: string;
      email: string;
      subject: string;
      message: string;
    }>(request);
    return json(await createContactMessage(body), { status: 201 });
  }

  return error("Méthode contact non supportée.", 405);
}

async function handleInventory(request: Request, method: string, parts: string[], url: URL) {
  const id = parts[1];

  if (method === "GET" && id === "categories") {
    return json(await listInventoryProductTypes());
  }

  if (method === "GET" && !id) {
    return json(await listInventory());
  }

  if (method === "POST" && !id) {
    const body = await readJson<{
      name: string;
      quantity: number;
      product_type: string;
      problematic: string | null;
      image: string | null;
      price: number;
    }>(request);
    return json(await createInventoryItem(body), { status: 201 });
  }

  if (method === "GET" && id) {
    const item = await getInventoryItem(id);
    return item ? json(item) : error("Article introuvable.", 404);
  }

  if (method === "PATCH" && id) {
    const body = await readJson<
      Partial<{
        name: string;
        quantity: number;
        product_type: string;
        problematic: string | null;
        image: string | null;
        price: number;
      }>
    >(request);
    return json(await updateInventoryItem(id, body));
  }

  if (method === "DELETE" && id) {
    return json(await deleteInventoryItem(id));
  }

  return error("Méthode inventaire non supportée.", 405);
}

async function handleProducts(request: Request, method: string, parts: string[], url: URL) {
  const id = parts[1];

  if (method === "GET" && !id) {
    enforceRateLimit(request, "api:products:list", 100, 60 * 1000);
    return json(
      await listProducts({
        category: url.searchParams.get("category") ?? undefined,
        q: url.searchParams.get("q") ?? undefined,
      }),
    );
  }

  if (method === "POST" && !id) {
    const admin = requireAdmin(request);
    const body = await readJson<ProductInput>(request);
    const product = await createProduct(body);
    addAuditLog("product_created", admin.email, `ID: ${product.id}, Nom: ${product.name}`);
    return json(product, { status: 201 });
  }

  if (method === "GET" && id) {
    enforceRateLimit(request, "api:products:get", 100, 60 * 1000);
    const product = await getProduct(id);
    return product ? json(product) : error("Produit introuvable.", 404);
  }

  if (method === "PATCH" && id) {
    const admin = requireAdmin(request);
    const body = await readJson<Partial<ProductInput>>(request);
    const product = await updateProduct(id, body);
    addAuditLog("product_updated", admin.email, `ID: ${id}`);
    return json(product);
  }

  if (method === "DELETE" && id) {
    const admin = requireAdmin(request);
    const result = await deleteProduct(id);
    addAuditLog("product_deleted", admin.email, `ID: ${id}`);
    return json(result);
  }

  return error("Méthode produit non supportée.", 405);
}

async function handleOrders(request: Request, method: string, parts: string[], url: URL) {
  const id = parts[1];

  if (method === "GET" && !id) {
    requireAdmin(request);
    return json(await listOrders({ status: url.searchParams.get("status") ?? undefined }));
  }

  if (method === "POST" && !id) {
    enforceRateLimit(request, "api:orders:create", 20, 60 * 60 * 1000);
    const body = await readJson<{
      customer: string;
      email: string;
      address: string;
      items: { productId: string; quantity: number }[];
      promoCode?: string;
    }>(request);
    const order = await createOrder(body);
    addAuditLog("order_created", body.email, `ID: ${order.id}, Total: ${order.total}`);
    return json(order, { status: 201 });
  }

  if (method === "GET" && id) {
    requireAdmin(request);
    const order = await getOrder(id);
    return order ? json(order) : error("Commande introuvable.", 404);
  }

  if (method === "PATCH" && id) {
    requireAdmin(request);
    const body = await readJson<{ status: OrderStatus }>(request);
    return json(await updateOrderStatus(id, body.status));
  }

  return error("Méthode commande non supportée.", 405);
}
