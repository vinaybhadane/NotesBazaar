import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import {
  Branch,
  AcademicYear,
  Pattern,
  Subject,
  Product,
  Order,
  OrderItem,
  Payment,
  DownloadEntitlement,
  Banner,
  Offer,
  Notification,
  NotificationCampaign,
  User,
  SiteSettings,
  Role,
} from '@/lib/types';

// Detect if Azure SQL credentials are provided
const hasAzureSqlConfig = Boolean(
  process.env.AZURE_SQL_CONNECTION_STRING ||
    (process.env.AZURE_SQL_SERVER && process.env.AZURE_SQL_DATABASE && process.env.AZURE_SQL_USER)
);

let sqlPool: sql.ConnectionPool | null = null;
let sqlPoolFailed = false;

async function getSqlPool(): Promise<sql.ConnectionPool | null> {
  if (!hasAzureSqlConfig || sqlPoolFailed) return null;
  if (sqlPool) return sqlPool;

  try {
    if (process.env.AZURE_SQL_CONNECTION_STRING) {
      sqlPool = await new sql.ConnectionPool(process.env.AZURE_SQL_CONNECTION_STRING as any).connect();
    } else {
      const config: sql.config = {
        server: process.env.AZURE_SQL_SERVER || '',
        database: process.env.AZURE_SQL_DATABASE || '',
        user: process.env.AZURE_SQL_USER || '',
        password: process.env.AZURE_SQL_PASSWORD || '',
        port: parseInt(process.env.AZURE_SQL_PORT || '1433', 10),
        options: {
          encrypt: process.env.AZURE_SQL_ENCRYPT !== 'false',
          trustServerCertificate: process.env.AZURE_SQL_TRUST_SERVER_CERTIFICATE === 'true',
        },
      };
      sqlPool = await new sql.ConnectionPool(config).connect();
    }
    console.log('[Database] Connected successfully to Azure SQL Database.');
    return sqlPool;
  } catch (err) {
    console.warn('[Database] Could not connect to Azure SQL, falling back to local persistent storage:', (err as Error).message);
    sqlPoolFailed = true;
    return null;
  }
}

// Local persistent JSON storage fallback
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'notesbazaar.json');

interface LocalDbSchema {
  users: User[];
  branches: Branch[];
  academic_years: AcademicYear[];
  patterns: Pattern[];
  subjects: Subject[];
  products: Product[];
  orders: Order[];
  order_items: OrderItem[];
  payments: Payment[];
  webhook_events: { id: string; event_id: string; processed_at: string }[];
  download_entitlements: DownloadEntitlement[];
  download_audit_logs: any[];
  banners: Banner[];
  offers: Offer[];
  notifications: Notification[];
  notification_campaigns: NotificationCampaign[];
  admin_audit_logs: any[];
  site_settings: Record<string, any>;
}

function getInitialLocalData(): LocalDbSchema {
  return {
    users: [],
    branches: [],
    academic_years: [],
    patterns: [],
    subjects: [],
    products: [],
    orders: [],
    order_items: [],
    payments: [],
    webhook_events: [],
    download_entitlements: [],
    download_audit_logs: [],
    banners: [],
    offers: [],
    notifications: [],
    notification_campaigns: [],
    admin_audit_logs: [],
    site_settings: {
      site_name: 'NotesBazaar by AbhyasMitra',
      support_email: 'support@abhyasmitra.com',
      support_phone: '+91 98765 43210',
      official_disclaimer:
        'NotesBazaar by AbhyasMitra is an independent educational resource and is not officially affiliated with, endorsed by, or sponsored by Savitribai Phule Pune University (SPPU).',
      download_expiry_hours: 72,
      max_upload_size_mb: 50,
      maintenance_mode: false,
      announcement_bar_enabled: true,
      announcement_bar_text: 'SPPU 2024 Pattern notes for SE and TE are now live! Explore branch-wise notes.',
      announcement_bar_link: '/notes',
    },
  };
}

function readLocalData(): LocalDbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const init = getInitialLocalData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf8');
    return init;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return getInitialLocalData();
  }
}

function writeLocalData(data: LocalDbSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export const db = {
  async getDatabaseStatus(): Promise<{ provider: 'azure_sql' | 'local_persistent'; connected: boolean; info: string }> {
    const pool = await getSqlPool();
    if (pool) {
      return {
        provider: 'azure_sql',
        connected: true,
        info: `Connected to Azure SQL: ${process.env.AZURE_SQL_DATABASE || 'azure_db'}`,
      };
    }
    return {
      provider: 'local_persistent',
      connected: true,
      info: 'Running on local persistent database (.data/notesbazaar.json). Set AZURE_SQL_* in .env.local for Azure SQL.',
    };
  },

  // ---------------------------------------------------------------------------
  // Branches
  // ---------------------------------------------------------------------------
  async getBranches(): Promise<Branch[]> {
    const data = readLocalData();
    return data.branches.filter((b) => b.is_active).sort((a, b) => a.sort_order - b.sort_order);
  },

  async getBranchBySlug(slug: string): Promise<Branch | null> {
    const data = readLocalData();
    return data.branches.find((b) => b.slug === slug && b.is_active) || null;
  },

  // ---------------------------------------------------------------------------
  // Academic Years
  // ---------------------------------------------------------------------------
  async getAcademicYears(): Promise<AcademicYear[]> {
    const data = readLocalData();
    return data.academic_years.filter((y) => y.is_active).sort((a, b) => a.sort_order - b.sort_order);
  },

  async getYearBySlug(slug: string): Promise<AcademicYear | null> {
    const data = readLocalData();
    return data.academic_years.find((y) => y.slug === slug && y.is_active) || null;
  },

  // ---------------------------------------------------------------------------
  // Patterns
  // ---------------------------------------------------------------------------
  async getPatterns(): Promise<Pattern[]> {
    const data = readLocalData();
    return data.patterns.filter((p) => p.is_active);
  },

  // ---------------------------------------------------------------------------
  // Subjects
  // ---------------------------------------------------------------------------
  async getSubjects(filter?: { branch_id?: string; year_id?: string }): Promise<Subject[]> {
    const data = readLocalData();
    return data.subjects.filter((s) => {
      if (!s.is_active) return false;
      if (filter?.branch_id && s.branch_id !== filter.branch_id) return false;
      if (filter?.year_id && s.year_id !== filter.year_id) return false;
      return true;
    });
  },

  async getSubjectBySlug(slug: string): Promise<Subject | null> {
    const data = readLocalData();
    return data.subjects.find((s) => s.slug === slug && s.is_active) || null;
  },

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------
  async getProducts(params?: {
    branch_slug?: string;
    branch_id?: string;
    year_slug?: string;
    year_id?: string;
    semester?: string;
    subject_slug?: string;
    pattern_slug?: string;
    search?: string;
    status?: 'published' | 'draft' | 'archived' | 'all';
    coming_soon?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'title';
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const data = readLocalData();
    let items = [...data.products];

    // Branch slug filter
    if (params?.branch_slug) {
      const branch = data.branches.find((b) => b.slug === params.branch_slug);
      if (branch) {
        items = items.filter((p) => p.branch_id === branch.id);
      } else {
        return { products: [], total: 0 };
      }
    } else if (params?.branch_id) {
      items = items.filter((p) => p.branch_id === params.branch_id);
    }

    // Year slug filter
    if (params?.year_slug) {
      const year = data.academic_years.find((y) => y.slug === params.year_slug);
      if (year) {
        items = items.filter((p) => p.year_id === year.id);
      } else {
        return { products: [], total: 0 };
      }
    } else if (params?.year_id) {
      items = items.filter((p) => p.year_id === params.year_id);
    }

    // Subject slug filter
    if (params?.subject_slug) {
      const subject = data.subjects.find((s) => s.slug === params.subject_slug);
      if (subject) {
        items = items.filter((p) => p.subject_id === subject.id);
      } else {
        return { products: [], total: 0 };
      }
    }

    // Status filter
    if (!params?.status || params.status === 'published') {
      items = items.filter((p) => p.publication_status === 'published');
    } else if (params.status !== 'all') {
      items = items.filter((p) => p.publication_status === params.status);
    }

    // Coming soon filter
    if (typeof params?.coming_soon === 'boolean') {
      items = items.filter((p) => p.is_coming_soon === params.coming_soon);
    }

    // Search query filter (search across title, subject name, topics, description)
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter((p) => {
        const sub = data.subjects.find((s) => s.id === p.subject_id);
        const subName = sub ? sub.name.toLowerCase() : '';
        const br = data.branches.find((b) => b.id === p.branch_id);
        const brName = br ? br.name.toLowerCase() : '';
        return (
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          subName.includes(q) ||
          brName.includes(q) ||
          p.topics_covered.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    switch (params?.sort) {
      case 'price_asc':
        items.sort((a, b) => a.price_in_paise - b.price_in_paise);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price_in_paise - a.price_in_paise);
        break;
      case 'title':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    const total = items.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || items.length;
    const paginated = items.slice(offset, offset + limit);

    // Enrich with names
    const enriched = paginated.map((p) => {
      const br = data.branches.find((b) => b.id === p.branch_id);
      const yr = data.academic_years.find((y) => y.id === p.year_id);
      const sub = data.subjects.find((s) => s.id === p.subject_id);
      const pat = data.patterns.find((pt) => pt.id === p.pattern_id);
      return {
        ...p,
        branch_name: br?.name,
        year_name: yr?.name,
        subject_name: sub?.name,
        pattern_name: pat?.name,
      };
    });

    return { products: enriched, total };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const data = readLocalData();
    const p = data.products.find((item) => item.slug === slug);
    if (!p) return null;

    const br = data.branches.find((b) => b.id === p.branch_id);
    const yr = data.academic_years.find((y) => y.id === p.year_id);
    const sub = data.subjects.find((s) => s.id === p.subject_id);
    const pat = data.patterns.find((pt) => pt.id === p.pattern_id);

    return {
      ...p,
      branch_name: br?.name,
      year_name: yr?.name,
      subject_name: sub?.name,
      pattern_name: pat?.name,
    };
  },

  async getProductById(id: string): Promise<Product | null> {
    const data = readLocalData();
    const p = data.products.find((item) => item.id === id);
    if (!p) return null;

    const br = data.branches.find((b) => b.id === p.branch_id);
    const yr = data.academic_years.find((y) => y.id === p.year_id);
    const sub = data.subjects.find((s) => s.id === p.subject_id);
    const pat = data.patterns.find((pt) => pt.id === p.pattern_id);

    return {
      ...p,
      branch_name: br?.name,
      year_name: yr?.name,
      subject_name: sub?.name,
      pattern_name: pat?.name,
    };
  },

  async createProduct(product: Product): Promise<Product> {
    const data = readLocalData();
    data.products.push(product);
    writeLocalData(data);
    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const data = readLocalData();
    const idx = data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    data.products[idx] = {
      ...data.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeLocalData(data);
    return data.products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const data = readLocalData();
    const initialLen = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    writeLocalData(data);
    return data.products.length < initialLen;
  },

  // ---------------------------------------------------------------------------
  // Orders & Checkout
  // ---------------------------------------------------------------------------
  async createOrder(order: Order, items: OrderItem[]): Promise<Order> {
    const data = readLocalData();
    data.orders.push(order);
    for (const item of items) {
      data.order_items.push(item);
    }
    writeLocalData(data);
    return order;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const data = readLocalData();
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;

    const items = data.order_items.filter((it) => it.order_id === id);
    const enrichedItems = items.map((it) => {
      const prod = data.products.find((p) => p.id === it.product_id);
      return {
        ...it,
        product_title: prod?.title,
        product_slug: prod?.slug,
      };
    });

    return {
      ...order,
      items: enrichedItems,
    };
  },

  async getOrderByRazorpayOrderId(rpOrderId: string): Promise<Order | null> {
    const data = readLocalData();
    const order = data.orders.find((o) => o.razorpay_order_id === rpOrderId);
    if (!order) return null;
    return this.getOrderById(order.id);
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    razorpayPaymentId?: string
  ): Promise<Order | null> {
    const data = readLocalData();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    if (razorpayPaymentId) {
      order.razorpay_payment_id = razorpayPaymentId;
    }
    order.updated_at = new Date().toISOString();
    writeLocalData(data);
    return order;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const data = readLocalData();
    const userOrders = data.orders
      .filter((o) => o.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return userOrders.map((o) => {
      const items = data.order_items.filter((it) => it.order_id === o.id).map((it) => {
        const prod = data.products.find((p) => p.id === it.product_id);
        return {
          ...it,
          product_title: prod?.title,
          product_slug: prod?.slug,
        };
      });
      return { ...o, items };
    });
  },

  async getAllOrders(): Promise<Order[]> {
    const data = readLocalData();
    return data.orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((o) => {
        const items = data.order_items.filter((it) => it.order_id === o.id).map((it) => {
          const prod = data.products.find((p) => p.id === it.product_id);
          return {
            ...it,
            product_title: prod?.title,
            product_slug: prod?.slug,
          };
        });
        return { ...o, items };
      });
  },

  // ---------------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------------
  async recordPayment(payment: Payment): Promise<Payment> {
    const data = readLocalData();
    const existing = data.payments.find((p) => p.razorpay_payment_id === payment.razorpay_payment_id);
    if (existing) return existing;

    data.payments.push(payment);
    writeLocalData(data);
    return payment;
  },

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const data = readLocalData();
    return data.webhook_events.some((ev) => ev.event_id === eventId);
  },

  async recordWebhookProcessed(eventId: string): Promise<void> {
    const data = readLocalData();
    data.webhook_events.push({
      id: `wh_${Date.now()}`,
      event_id: eventId,
      processed_at: new Date().toISOString(),
    });
    writeLocalData(data);
  },

  // ---------------------------------------------------------------------------
  // Download Entitlements
  // ---------------------------------------------------------------------------
  async createEntitlement(userId: string, productId: string, orderId: string): Promise<DownloadEntitlement> {
    const data = readLocalData();
    const existing = data.download_entitlements.find(
      (e) => e.user_id === userId && e.product_id === productId && e.status === 'active'
    );
    if (existing) return existing;

    const entitlement: DownloadEntitlement = {
      id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      status: 'active',
      granted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    data.download_entitlements.push(entitlement);
    writeLocalData(data);
    return entitlement;
  },

  async getEntitlementsByUser(userId: string): Promise<DownloadEntitlement[]> {
    const data = readLocalData();
    const list = data.download_entitlements.filter((e) => e.user_id === userId && e.status === 'active');
    return list.map((e) => {
      const prod = data.products.find((p) => p.id === e.product_id);
      return {
        ...e,
        product: prod,
      };
    });
  },

  async getEntitlementById(entitlementId: string): Promise<DownloadEntitlement | null> {
    const data = readLocalData();
    const e = data.download_entitlements.find((item) => item.id === entitlementId);
    if (!e) return null;
    const prod = data.products.find((p) => p.id === e.product_id);
    return {
      ...e,
      product: prod,
    };
  },

  async hasEntitlement(userId: string, productId: string): Promise<boolean> {
    const data = readLocalData();
    return data.download_entitlements.some(
      (e) => e.user_id === userId && e.product_id === productId && e.status === 'active'
    );
  },

  async logDownloadAudit(params: {
    entitlement_id: string;
    user_id: string;
    product_id: string;
    ip_address?: string;
    user_agent?: string;
    status: 'granted' | 'denied';
  }): Promise<void> {
    const data = readLocalData();
    data.download_audit_logs.push({
      id: `dl_log_${Date.now()}`,
      ...params,
      created_at: new Date().toISOString(),
    });
    writeLocalData(data);
  },

  // ---------------------------------------------------------------------------
  // Banners & Offers
  // ---------------------------------------------------------------------------
  async getActiveBanners(): Promise<Banner[]> {
    const data = readLocalData();
    const now = new Date().getTime();
    return data.banners
      .filter((b) => {
        if (!b.is_active) return false;
        if (b.start_at && new Date(b.start_at).getTime() > now) return false;
        if (b.end_at && new Date(b.end_at).getTime() < now) return false;
        return true;
      })
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getAllBanners(): Promise<Banner[]> {
    const data = readLocalData();
    return data.banners;
  },

  async createBanner(banner: Banner): Promise<Banner> {
    const data = readLocalData();
    data.banners.push(banner);
    writeLocalData(data);
    return banner;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const data = readLocalData();
    const idx = data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    data.banners[idx] = { ...data.banners[idx], ...updates, updated_at: new Date().toISOString() };
    writeLocalData(data);
    return data.banners[idx];
  },

  async deleteBanner(id: string): Promise<boolean> {
    const data = readLocalData();
    const len = data.banners.length;
    data.banners = data.banners.filter((b) => b.id !== id);
    writeLocalData(data);
    return data.banners.length < len;
  },

  async getActiveOffers(): Promise<Offer[]> {
    const data = readLocalData();
    const now = new Date().getTime();
    return data.offers.filter((o) => {
      if (!o.is_active) return false;
      if (o.start_at && new Date(o.start_at).getTime() > now) return false;
      if (o.end_at && new Date(o.end_at).getTime() < now) return false;
      if (o.max_uses && o.current_uses >= o.max_uses) return false;
      return true;
    });
  },

  async getOfferByCode(code: string): Promise<Offer | null> {
    const data = readLocalData();
    const offer = data.offers.find((o) => o.code.toUpperCase() === code.toUpperCase() && o.is_active);
    if (!offer) return null;

    const now = new Date().getTime();
    if (offer.start_at && new Date(offer.start_at).getTime() > now) return null;
    if (offer.end_at && new Date(offer.end_at).getTime() < now) return null;
    if (offer.max_uses && offer.current_uses >= offer.max_uses) return null;

    return offer;
  },

  async createOffer(offer: Offer): Promise<Offer> {
    const data = readLocalData();
    data.offers.push(offer);
    writeLocalData(data);
    return offer;
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const data = readLocalData();
    return data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const data = readLocalData();
    const n = data.notifications.find((item) => item.id === id && item.user_id === userId);
    if (!n) return false;
    n.is_read = true;
    n.read_at = new Date().toISOString();
    writeLocalData(data);
    return true;
  },

  async sendNotification(notification: Notification): Promise<Notification> {
    const data = readLocalData();
    data.notifications.push(notification);
    writeLocalData(data);
    return notification;
  },

  async createNotificationCampaign(campaign: NotificationCampaign): Promise<NotificationCampaign> {
    const data = readLocalData();
    data.notification_campaigns.push(campaign);
    writeLocalData(data);
    return campaign;
  },

  async getNotificationCampaigns(): Promise<NotificationCampaign[]> {
    const data = readLocalData();
    return data.notification_campaigns.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // ---------------------------------------------------------------------------
  // Users & Admin Authorization
  // ---------------------------------------------------------------------------
  async upsertUser(user: { firebase_uid: string; email: string; display_name?: string | null }): Promise<User> {
    const data = readLocalData();
    let u = data.users.find((item) => item.firebase_uid === user.firebase_uid);
    const adminEmail = (process.env.ADMIN_EMAIL || 'vinaybhadane06@gmail.com').toLowerCase();
    const isOwner = user.email.toLowerCase() === adminEmail;

    if (!u) {
      u = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        firebase_uid: user.firebase_uid,
        email: user.email,
        display_name: user.display_name || null,
        role: isOwner ? 'admin' : 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.users.push(u);
    } else {
      u.email = user.email;
      if (user.display_name) u.display_name = user.display_name;
      if (isOwner) u.role = 'admin';
      u.updated_at = new Date().toISOString();
    }
    writeLocalData(data);
    return u;
  },

  async getUserByFirebaseUid(uid: string): Promise<User | null> {
    const data = readLocalData();
    return data.users.find((u) => u.firebase_uid === uid) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const data = readLocalData();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getAllUsers(): Promise<User[]> {
    const data = readLocalData();
    return data.users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // ---------------------------------------------------------------------------
  // Settings & Audit
  // ---------------------------------------------------------------------------
  async getSiteSettings(): Promise<SiteSettings> {
    const data = readLocalData();
    return data.site_settings as SiteSettings;
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const data = readLocalData();
    data.site_settings = { ...data.site_settings, ...settings };
    writeLocalData(data);
    return data.site_settings as SiteSettings;
  },

  async logAdminAudit(params: {
    admin_email: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: string;
  }): Promise<void> {
    const data = readLocalData();
    data.admin_audit_logs.push({
      id: `audit_${Date.now()}`,
      ...params,
      created_at: new Date().toISOString(),
    });
    writeLocalData(data);
  },

  async getAdminStats() {
    const data = readLocalData();
    const totalPublished = data.products.filter((p) => p.publication_status === 'published').length;
    const totalDrafts = data.products.filter((p) => p.publication_status === 'draft').length;
    const totalComingSoon = data.products.filter((p) => p.is_coming_soon).length;
    const totalOrders = data.orders.length;
    const paidOrders = data.orders.filter((o) => o.status === 'paid');
    const failedOrders = data.orders.filter((o) => o.status === 'failed');
    const pendingOrders = data.orders.filter((o) => o.status === 'pending' || o.status === 'created');
    const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.final_amount_in_paise, 0);

    return {
      totalPublished,
      totalDrafts,
      totalComingSoon,
      totalOrders,
      successfulPayments: paidOrders.length,
      failedPayments: failedOrders.length,
      pendingPayments: pendingOrders.length,
      revenueTotalInPaise: totalRevenuePaise,
      totalUsers: data.users.length,
    };
  },
};
