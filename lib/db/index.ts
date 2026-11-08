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
let lastSqlConnectAttempt = 0;
const RETRY_INTERVAL_MS = 5000;

async function getSqlPool(): Promise<sql.ConnectionPool | null> {
  if (!hasAzureSqlConfig) return null;
  if (sqlPool && sqlPool.connected) return sqlPool;

  const now = Date.now();
  if (now - lastSqlConnectAttempt < RETRY_INTERVAL_MS) {
    return null;
  }
  lastSqlConnectAttempt = now;

  try {
    let sqlConn = process.env.AZURE_SQL_CONNECTION_STRING?.trim();
    if (sqlConn && ((sqlConn.startsWith('"') && sqlConn.endsWith('"')) || (sqlConn.startsWith("'") && sqlConn.endsWith("'")))) {
      sqlConn = sqlConn.slice(1, -1).trim();
    }

    if (sqlConn) {
      sqlPool = await new sql.ConnectionPool(sqlConn).connect();
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
    return null;
  }
}

// Local persistent JSON storage fallback
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const init = getInitialLocalData();
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf8');
      } catch {
        // Safe write ignore on read-only serverless disk
      }
      return init;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Database] Read local data fallback:', (err as Error).message);
    return getInitialLocalData();
  }
}


// -----------------------------------------------------------------------------
// In-Memory & Azure SQL Synchronized Data Store
// -----------------------------------------------------------------------------
let memoryCache: LocalDbSchema | null = null;
let lastCacheSync = 0;
const CACHE_TTL_MS = 15000; // 15 seconds TTL for high performance & fresh data

async function getStore(): Promise<LocalDbSchema> {
  const pool = await getSqlPool();
  if (!pool) {
    return readLocalData();
  }

  const now = Date.now();
  if (memoryCache && now - lastCacheSync < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    const [
      branchesRes,
      yearsRes,
      patternsRes,
      subjectsRes,
      productsRes,
      offersRes,
      bannersRes,
      settingsRes,
      usersRes,
      ordersRes,
      itemsRes,
      paymentsRes,
      entitlementsRes,
    ] = await Promise.all([
      pool.request().query('SELECT * FROM branches WHERE is_active = 1 ORDER BY sort_order'),
      pool.request().query('SELECT * FROM academic_years WHERE is_active = 1 ORDER BY sort_order'),
      pool.request().query('SELECT * FROM patterns WHERE is_active = 1'),
      pool.request().query('SELECT * FROM subjects WHERE is_active = 1'),
      pool.request().query('SELECT * FROM products'),
      pool.request().query('SELECT * FROM offers WHERE is_active = 1'),
      pool.request().query('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order'),
      pool.request().query('SELECT * FROM site_settings'),
      pool.request().query('SELECT * FROM users'),
      pool.request().query('SELECT * FROM orders ORDER BY created_at DESC'),
      pool.request().query('SELECT * FROM order_items'),
      pool.request().query('SELECT * FROM payments'),
      pool.request().query('SELECT * FROM download_entitlements'),
    ]);

    const settingsObj: Record<string, any> = {};
    for (const s of settingsRes.recordset) {
      try {
        settingsObj[s.setting_key] = JSON.parse(s.setting_value);
      } catch {
        settingsObj[s.setting_key] = s.setting_value;
      }
    }

    const productsMapped: Product[] = productsRes.recordset.map((r: any) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      branch_id: r.branch_id,
      year_id: r.year_id,
      semester_id: r.semester_id,
      subject_id: r.subject_id,
      pattern_id: r.pattern_id,
      short_description: r.short_description || '',
      full_description: r.full_description || r.short_description || '',
      topics_covered: r.topics_covered ? (typeof r.topics_covered === 'string' ? JSON.parse(r.topics_covered) : r.topics_covered) : [],
      price_in_paise: r.price_in_paise,
      compare_at_price_in_paise: r.compare_at_price_in_paise || r.price_in_paise,
      publication_status: r.publication_status,
      is_available: Boolean(r.is_available),
      is_coming_soon: Boolean(r.is_coming_soon),
      file_format: r.file_format || 'PDF',
      page_count: r.page_count || 0,
      file_size_bytes: Number(r.file_size_bytes || 0),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    memoryCache = {
      users: usersRes.recordset.map((u: any) => ({
        id: u.id,
        firebase_uid: u.firebase_uid,
        email: u.email,
        display_name: u.display_name,
        role: u.role,
        status: u.status,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
        updated_at: u.updated_at ? new Date(u.updated_at).toISOString() : new Date().toISOString(),
      })),
      branches: branchesRes.recordset,
      academic_years: yearsRes.recordset,
      patterns: patternsRes.recordset,
      subjects: subjectsRes.recordset,
      products: productsMapped,
      orders: ordersRes.recordset.map((o: any) => ({
        id: o.id,
        user_id: o.user_id,
        order_number: o.order_number || o.id,
        total_amount_in_paise: o.total_amount_in_paise,
        discount_amount_in_paise: o.discount_in_paise || 0,
        final_amount_in_paise: o.total_amount_in_paise,
        currency: o.currency || 'INR',
        status: o.status,
        razorpay_order_id: o.razorpay_order_id,
        razorpay_payment_id: o.razorpay_payment_id,
        customer_email: o.customer_email,
        customer_name: o.customer_name,
        created_at: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
        updated_at: o.updated_at ? new Date(o.updated_at).toISOString() : new Date().toISOString(),
      })),
      order_items: itemsRes.recordset.map((it: any) => ({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price_in_paise: it.price_in_paise,
        discount_amount_in_paise: 0,
        final_price_in_paise: it.price_in_paise,
        product_title: it.product_title,
      })),
      payments: paymentsRes.recordset,
      webhook_events: [],
      download_entitlements: entitlementsRes.recordset.map((e: any) => ({
        id: e.id,
        user_id: e.user_id,
        product_id: e.product_id,
        order_id: e.order_id,
        status: e.is_active ? 'active' : 'revoked',
        granted_at: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
        expires_at: e.expires_at ? new Date(e.expires_at).toISOString() : null,
        created_at: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
      })),
      download_audit_logs: [],
      banners: bannersRes.recordset.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        badge_text: b.badge_text || undefined,
        cta_label: b.cta_label || 'View',
        cta_url: b.cta_url || '/notes',
        is_active: Boolean(b.is_active),
        display_order: b.display_order,
        created_at: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
        updated_at: b.updated_at ? new Date(b.updated_at).toISOString() : new Date().toISOString(),
      })),
      offers: offersRes.recordset.map((o: any) => ({
        id: o.id,
        code: o.code,
        title: o.title,
        description: o.description,
        discount_type: o.discount_type,
        discount_value: o.discount_value,
        min_order_amount_in_paise: o.min_order_amount_in_paise || 0,
        max_discount_in_paise: o.max_discount_in_paise,
        max_uses: o.max_uses,
        current_uses: o.current_uses || 0,
        per_user_limit: o.per_user_limit || 1,
        start_at: o.start_at ? new Date(o.start_at).toISOString() : new Date().toISOString(),
        end_at: o.end_at ? new Date(o.end_at).toISOString() : new Date(Date.now() + 31536000000).toISOString(),
        is_active: Boolean(o.is_active),
      })),
      notifications: [],
      notification_campaigns: [],
      admin_audit_logs: [],
      site_settings: settingsObj,
    };

    lastCacheSync = now;
    return memoryCache;
  } catch (err) {
    console.warn('[Database] Azure SQL query error, falling back to local file:', (err as Error).message);
    return readLocalData();
  }
}

function writeLocalData(data: LocalDbSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Database] Local file write skipped or failed (safe on serverless):', (err as Error).message);
  }
  memoryCache = data;
  lastCacheSync = Date.now();
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
    const data = await getStore();
    return data.branches.filter((b) => b.is_active).sort((a, b) => a.sort_order - b.sort_order);
  },

  async getBranchBySlug(slug: string): Promise<Branch | null> {
    const data = await getStore();
    return data.branches.find((b) => b.slug === slug && b.is_active) || null;
  },

  // ---------------------------------------------------------------------------
  // Academic Years
  // ---------------------------------------------------------------------------
  async getAcademicYears(): Promise<AcademicYear[]> {
    const data = await getStore();
    return data.academic_years.filter((y) => y.is_active).sort((a, b) => a.sort_order - b.sort_order);
  },

  async getYearBySlug(slug: string): Promise<AcademicYear | null> {
    const data = await getStore();
    return data.academic_years.find((y) => y.slug === slug && y.is_active) || null;
  },

  // ---------------------------------------------------------------------------
  // Patterns
  // ---------------------------------------------------------------------------
  async getPatterns(): Promise<Pattern[]> {
    const data = await getStore();
    return data.patterns.filter((p) => p.is_active);
  },

  // ---------------------------------------------------------------------------
  // Subjects
  // ---------------------------------------------------------------------------
  async getSubjects(filter?: { branch_id?: string; year_id?: string }): Promise<Subject[]> {
    const data = await getStore();
    return data.subjects.filter((s) => {
      if (!s.is_active) return false;
      if (filter?.branch_id && s.branch_id !== filter.branch_id) return false;
      if (filter?.year_id && s.year_id !== filter.year_id) return false;
      return true;
    });
  },

  async getSubjectBySlug(slug: string): Promise<Subject | null> {
    const data = await getStore();
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
    const data = await getStore();
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
    const data = await getStore();
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
    const data = await getStore();
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
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), product.id)
          .input('title', sql.NVarChar(255), product.title)
          .input('slug', sql.NVarChar(200), product.slug)
          .input('branch_id', sql.NVarChar(50), product.branch_id)
          .input('year_id', sql.NVarChar(50), product.year_id)
          .input('semester_id', sql.NVarChar(50), product.semester_id || null)
          .input('subject_id', sql.NVarChar(50), product.subject_id)
          .input('pattern_id', sql.NVarChar(50), product.pattern_id)
          .input('short_description', sql.NVarChar(500), product.short_description || '')
          .input('full_description', sql.NVarChar(sql.MAX), product.full_description || '')
          .input('topics_covered', sql.NVarChar(sql.MAX), JSON.stringify(product.topics_covered || []))
          .input('price_in_paise', sql.Int, product.price_in_paise)
          .input('compare_at_price_in_paise', sql.Int, product.compare_at_price_in_paise || product.price_in_paise)
          .input('publication_status', sql.NVarChar(50), product.publication_status)
          .input('is_available', sql.Bit, product.is_available ? 1 : 0)
          .input('is_coming_soon', sql.Bit, product.is_coming_soon ? 1 : 0)
          .input('file_format', sql.NVarChar(20), product.file_format || 'PDF')
          .input('page_count', sql.Int, product.page_count || 0)
          .input('file_size_bytes', sql.BigInt, product.file_size_bytes || 0)
          .query(`
            INSERT INTO products (
              id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id,
              short_description, full_description, topics_covered, price_in_paise,
              compare_at_price_in_paise, publication_status, is_available, is_coming_soon,
              file_format, page_count, file_size_bytes
            ) VALUES (
              @id, @title, @slug, @branch_id, @year_id, @semester_id, @subject_id, @pattern_id,
              @short_description, @full_description, @topics_covered, @price_in_paise,
              @compare_at_price_in_paise, @publication_status, @is_available, @is_coming_soon,
              @file_format, @page_count, @file_size_bytes
            )
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to insert product in Azure SQL:', dbErr);
      }
    }
    const data = await getStore();
    data.products.push(product);
    writeLocalData(data);
    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        const req = pool.request().input('id', sql.NVarChar(50), id);
        const sets: string[] = [];
        if (updates.title !== undefined) {
          req.input('title', sql.NVarChar(255), updates.title);
          sets.push('title = @title');
        }
        if (updates.slug !== undefined) {
          req.input('slug', sql.NVarChar(200), updates.slug);
          sets.push('slug = @slug');
        }
        if (updates.short_description !== undefined) {
          req.input('short_description', sql.NVarChar(500), updates.short_description);
          sets.push('short_description = @short_description');
        }
        if (updates.full_description !== undefined) {
          req.input('full_description', sql.NVarChar(sql.MAX), updates.full_description);
          sets.push('full_description = @full_description');
        }
        if (updates.price_in_paise !== undefined) {
          req.input('price_in_paise', sql.Int, updates.price_in_paise);
          sets.push('price_in_paise = @price_in_paise');
        }
        if (updates.compare_at_price_in_paise !== undefined) {
          req.input('compare_at_price_in_paise', sql.Int, updates.compare_at_price_in_paise);
          sets.push('compare_at_price_in_paise = @compare_at_price_in_paise');
        }
        if (updates.publication_status !== undefined) {
          req.input('publication_status', sql.NVarChar(50), updates.publication_status);
          sets.push('publication_status = @publication_status');
        }
        if (typeof updates.is_available === 'boolean') {
          req.input('is_available', sql.Bit, updates.is_available ? 1 : 0);
          sets.push('is_available = @is_available');
        }
        if (typeof updates.is_coming_soon === 'boolean') {
          req.input('is_coming_soon', sql.Bit, updates.is_coming_soon ? 1 : 0);
          sets.push('is_coming_soon = @is_coming_soon');
        }
        if (updates.page_count !== undefined) {
          req.input('page_count', sql.Int, updates.page_count);
          sets.push('page_count = @page_count');
        }
        if (sets.length > 0) {
          sets.push('updated_at = SYSUTCDATETIME()');
          await req.query(`UPDATE products SET ${sets.join(', ')} WHERE id = @id`);
        }
      } catch (dbErr) {
        console.warn('[Database] Failed to update product in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
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
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), id)
          .query(`
            DELETE FROM download_entitlements WHERE product_id = @id;
            DELETE FROM order_items WHERE product_id = @id;
            DELETE FROM product_files WHERE product_id = @id;
            DELETE FROM products WHERE id = @id;
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to delete product in Azure SQL:', dbErr);
      }
    }
    const data = await getStore();
    const initialLen = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    writeLocalData(data);
    return data.products.length < initialLen;
  },

  // ---------------------------------------------------------------------------
  // Orders & Checkout
  // ---------------------------------------------------------------------------
  async createOrder(order: Order, items: OrderItem[]): Promise<Order> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), order.id)
          .input('user_id', sql.NVarChar(50), order.user_id)
          .input('order_number', sql.NVarChar(50), order.order_number)
          .input('total_amount_in_paise', sql.Int, order.total_amount_in_paise)
          .input('discount_amount_in_paise', sql.Int, order.discount_amount_in_paise)
          .input('final_amount_in_paise', sql.Int, order.final_amount_in_paise)
          .input('currency', sql.NVarChar(10), order.currency || 'INR')
          .input('status', sql.NVarChar(50), order.status)
          .input('razorpay_order_id', sql.NVarChar(100), order.razorpay_order_id || null)
          .input('customer_email', sql.NVarChar(255), order.customer_email)
          .input('customer_name', sql.NVarChar(255), order.customer_name || null)
          .query(`
            INSERT INTO orders (id, user_id, order_number, total_amount_in_paise, discount_amount_in_paise, final_amount_in_paise, currency, status, razorpay_order_id, customer_email, customer_name)
            VALUES (@id, @user_id, @order_number, @total_amount_in_paise, @discount_amount_in_paise, @final_amount_in_paise, @currency, @status, @razorpay_order_id, @customer_email, @customer_name)
          `);

        for (const item of items) {
          await pool.request()
            .input('id', sql.NVarChar(50), item.id)
            .input('order_id', sql.NVarChar(50), item.order_id)
            .input('product_id', sql.NVarChar(50), item.product_id)
            .input('quantity', sql.Int, item.quantity || 1)
            .input('unit_price_in_paise', sql.Int, item.unit_price_in_paise)
            .input('discount_amount_in_paise', sql.Int, item.discount_amount_in_paise || 0)
            .input('final_price_in_paise', sql.Int, item.final_price_in_paise)
            .query(`
              INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_in_paise, discount_amount_in_paise, final_price_in_paise)
              VALUES (@id, @order_id, @product_id, @quantity, @unit_price_in_paise, @discount_amount_in_paise, @final_price_in_paise)
            `);
        }
      } catch (dbErr) {
        console.warn('[Database] Failed to insert order in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    data.orders.push(order);
    for (const item of items) {
      data.order_items.push(item);
    }
    writeLocalData(data);
    return order;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const data = await getStore();
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
    const data = await getStore();
    const order = data.orders.find((o) => o.razorpay_order_id === rpOrderId);
    if (!order) return null;
    return this.getOrderById(order.id);
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    razorpayPaymentId?: string
  ): Promise<Order | null> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), orderId)
          .input('status', sql.NVarChar(50), status)
          .input('payment_id', sql.NVarChar(100), razorpayPaymentId || null)
          .query(`
            UPDATE orders 
            SET status = @status, 
                razorpay_payment_id = COALESCE(@payment_id, razorpay_payment_id),
                updated_at = SYSUTCDATETIME() 
            WHERE id = @id
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to update order status in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
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
    const data = await getStore();
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
    const data = await getStore();
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
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), payment.id)
          .input('order_id', sql.NVarChar(50), payment.order_id)
          .input('razorpay_order_id', sql.NVarChar(100), payment.razorpay_order_id)
          .input('razorpay_payment_id', sql.NVarChar(100), payment.razorpay_payment_id)
          .input('razorpay_signature', sql.NVarChar(255), payment.razorpay_signature || null)
          .input('amount_in_paise', sql.Int, payment.amount_in_paise)
          .input('currency', sql.NVarChar(10), payment.currency || 'INR')
          .input('status', sql.NVarChar(50), payment.status)
          .input('method', sql.NVarChar(50), payment.method || null)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM payments WHERE razorpay_payment_id = @razorpay_payment_id)
              INSERT INTO payments (id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount_in_paise, currency, status, method)
              VALUES (@id, @order_id, @razorpay_order_id, @razorpay_payment_id, @razorpay_signature, @amount_in_paise, @currency, @status, @method)
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to insert payment in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    const existing = data.payments.find((p) => p.razorpay_payment_id === payment.razorpay_payment_id);
    if (existing) return existing;

    data.payments.push(payment);
    writeLocalData(data);
    return payment;
  },

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const data = await getStore();
    return data.webhook_events.some((ev) => ev.event_id === eventId);
  },

  async recordWebhookProcessed(eventId: string): Promise<void> {
    const data = await getStore();
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
    const data = await getStore();
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

    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), entitlement.id)
          .input('user_id', sql.NVarChar(50), entitlement.user_id)
          .input('product_id', sql.NVarChar(50), entitlement.product_id)
          .input('order_id', sql.NVarChar(50), entitlement.order_id)
          .input('is_active', sql.Bit, 1)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM download_entitlements WHERE user_id = @user_id AND product_id = @product_id AND is_active = 1)
              INSERT INTO download_entitlements (id, user_id, product_id, order_id, is_active)
              VALUES (@id, @user_id, @product_id, @order_id, @is_active)
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to insert download entitlement in Azure SQL:', dbErr);
      }
    }

    data.download_entitlements.push(entitlement);
    writeLocalData(data);
    return entitlement;
  },

  async getEntitlementsByUser(userId: string): Promise<DownloadEntitlement[]> {
    const data = await getStore();
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
    const data = await getStore();
    const e = data.download_entitlements.find((item) => item.id === entitlementId);
    if (!e) return null;
    const prod = data.products.find((p) => p.id === e.product_id);
    return {
      ...e,
      product: prod,
    };
  },

  async hasEntitlement(userId: string, productId: string): Promise<boolean> {
    const data = await getStore();
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
    const data = await getStore();
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
    const data = await getStore();
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
    const data = await getStore();
    return data.banners;
  },

  async createBanner(banner: Banner): Promise<Banner> {
    const data = await getStore();
    data.banners.push(banner);
    writeLocalData(data);
    return banner;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const data = await getStore();
    const idx = data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    data.banners[idx] = { ...data.banners[idx], ...updates, updated_at: new Date().toISOString() };
    writeLocalData(data);
    return data.banners[idx];
  },

  async deleteBanner(id: string): Promise<boolean> {
    const data = await getStore();
    const len = data.banners.length;
    data.banners = data.banners.filter((b) => b.id !== id);
    writeLocalData(data);
    return data.banners.length < len;
  },

  async getAllOffers(): Promise<Offer[]> {
    const data = await getStore();
    return data.offers;
  },

  async getActiveOffers(): Promise<Offer[]> {
    const data = await getStore();
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
    const data = await getStore();
    const offer = data.offers.find((o) => o.code.toUpperCase() === code.toUpperCase() && o.is_active);
    if (!offer) return null;

    const now = new Date().getTime();
    if (offer.start_at && new Date(offer.start_at).getTime() > now) return null;
    if (offer.end_at && new Date(offer.end_at).getTime() < now) return null;
    if (offer.max_uses && offer.current_uses >= offer.max_uses) return null;

    return offer;
  },

  async createOffer(offer: Offer): Promise<Offer> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), offer.id)
          .input('code', sql.NVarChar(50), offer.code)
          .input('title', sql.NVarChar(150), offer.title)
          .input('description', sql.NVarChar(sql.MAX), offer.description || null)
          .input('discount_type', sql.NVarChar(20), offer.discount_type)
          .input('discount_value', sql.Int, offer.discount_value)
          .input('min_order_amount_in_paise', sql.Int, offer.min_order_amount_in_paise || 0)
          .input('max_discount_in_paise', sql.Int, offer.max_discount_in_paise || null)
          .input('max_uses', sql.Int, offer.max_uses || null)
          .input('current_uses', sql.Int, offer.current_uses || 0)
          .input('per_user_limit', sql.Int, offer.per_user_limit || 1)
          .input('is_active', sql.Bit, offer.is_active ? 1 : 0)
          .query(`
            INSERT INTO offers (id, code, title, description, discount_type, discount_value, min_order_amount_in_paise, max_discount_in_paise, max_uses, current_uses, per_user_limit, is_active)
            VALUES (@id, @code, @title, @description, @discount_type, @discount_value, @min_order_amount_in_paise, @max_discount_in_paise, @max_uses, @current_uses, @per_user_limit, @is_active)
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to insert offer in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    data.offers.push(offer);
    writeLocalData(data);
    return offer;
  },

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        const req = pool.request().input('id', sql.NVarChar(50), id);
        const sets: string[] = [];
        if (updates.max_uses !== undefined) {
          req.input('max_uses', sql.Int, updates.max_uses);
          sets.push('max_uses = @max_uses');
        }
        if (updates.per_user_limit !== undefined) {
          req.input('per_user_limit', sql.Int, updates.per_user_limit);
          sets.push('per_user_limit = @per_user_limit');
        }
        if (typeof updates.is_active === 'boolean') {
          req.input('is_active', sql.Bit, updates.is_active ? 1 : 0);
          sets.push('is_active = @is_active');
        }
        if (updates.min_order_amount_in_paise !== undefined) {
          req.input('min_order_amount_in_paise', sql.Int, updates.min_order_amount_in_paise);
          sets.push('min_order_amount_in_paise = @min_order_amount_in_paise');
        }
        if (updates.max_discount_in_paise !== undefined) {
          req.input('max_discount_in_paise', sql.Int, updates.max_discount_in_paise);
          sets.push('max_discount_in_paise = @max_discount_in_paise');
        }
        if (sets.length > 0) {
          sets.push('updated_at = SYSUTCDATETIME()');
          await req.query(`UPDATE offers SET ${sets.join(', ')} WHERE id = @id`);
        }
      } catch (dbErr) {
        console.warn('[Database] Failed to update offer in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    const idx = data.offers.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    data.offers[idx] = { ...data.offers[idx], ...updates };
    writeLocalData(data);
    return data.offers[idx];
  },

  async deleteOffer(id: string): Promise<boolean> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), id)
          .query('DELETE FROM offers WHERE id = @id');
      } catch (dbErr) {
        console.warn('[Database] Failed to delete offer in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    const len = data.offers.length;
    data.offers = data.offers.filter((o) => o.id !== id);
    writeLocalData(data);
    return data.offers.length < len;
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const data = await getStore();
    return data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const data = await getStore();
    const n = data.notifications.find((item) => item.id === id && item.user_id === userId);
    if (!n) return false;
    n.is_read = true;
    n.read_at = new Date().toISOString();
    writeLocalData(data);
    return true;
  },

  async sendNotification(notification: Notification): Promise<Notification> {
    const data = await getStore();
    data.notifications.push(notification);
    writeLocalData(data);
    return notification;
  },

  async createNotificationCampaign(campaign: NotificationCampaign): Promise<NotificationCampaign> {
    const data = await getStore();
    data.notification_campaigns.push(campaign);
    writeLocalData(data);
    return campaign;
  },

  async getNotificationCampaigns(): Promise<NotificationCampaign[]> {
    const data = await getStore();
    return data.notification_campaigns.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // ---------------------------------------------------------------------------
  // Users & Admin Authorization
  // ---------------------------------------------------------------------------
  async upsertUser(user: { firebase_uid: string; email: string; display_name?: string | null }): Promise<User> {
    const data = await getStore();
    let u = data.users.find((item) => item.firebase_uid === user.firebase_uid || (item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase()));
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
      if (user.firebase_uid && user.firebase_uid !== 'anon') u.firebase_uid = user.firebase_uid;
      if (user.display_name) u.display_name = user.display_name;
      if (isOwner) u.role = 'admin';
      u.updated_at = new Date().toISOString();
    }

    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), u.id)
          .input('firebase_uid', sql.NVarChar(128), u.firebase_uid)
          .input('email', sql.NVarChar(255), u.email)
          .input('display_name', sql.NVarChar(255), u.display_name || null)
          .input('role', sql.NVarChar(50), u.role)
          .input('status', sql.NVarChar(50), u.status)
          .query(`
            IF EXISTS (SELECT 1 FROM users WHERE firebase_uid = @firebase_uid)
              UPDATE users SET email = @email, display_name = COALESCE(@display_name, display_name), role = @role, status = @status, updated_at = SYSUTCDATETIME() WHERE firebase_uid = @firebase_uid
            ELSE IF EXISTS (SELECT 1 FROM users WHERE email = @email)
              UPDATE users SET firebase_uid = @firebase_uid, display_name = COALESCE(@display_name, display_name), role = @role, status = @status, updated_at = SYSUTCDATETIME() WHERE email = @email
            ELSE
              INSERT INTO users (id, firebase_uid, email, display_name, role, status)
              VALUES (@id, @firebase_uid, @email, @display_name, @role, @status)
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to upsert user in Azure SQL:', dbErr);
      }
    }

    writeLocalData(data);
    return u;
  },

  async getUserByFirebaseUid(uid: string): Promise<User | null> {
    const data = await getStore();
    return data.users.find((u) => u.firebase_uid === uid) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const data = await getStore();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getAllUsers(): Promise<User[]> {
    const data = await getStore();
    return data.users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // ---------------------------------------------------------------------------
  // Settings & Audit
  // ---------------------------------------------------------------------------
  async getSiteSettings(): Promise<SiteSettings> {
    const data = await getStore();
    return data.site_settings as SiteSettings;
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const pool = await getSqlPool();
    if (pool) {
      try {
        for (const [key, val] of Object.entries(settings)) {
          await pool.request()
            .input('setting_key', sql.NVarChar(100), key)
            .input('setting_value', sql.NVarChar(sql.MAX), typeof val === 'object' ? JSON.stringify(val) : String(val))
            .query(`
              IF EXISTS (SELECT 1 FROM site_settings WHERE setting_key = @setting_key)
                UPDATE site_settings SET setting_value = @setting_value, updated_at = SYSUTCDATETIME() WHERE setting_key = @setting_key
              ELSE
                INSERT INTO site_settings (setting_key, setting_value) VALUES (@setting_key, @setting_value)
            `);
        }
      } catch (dbErr) {
        console.warn('[Database] Failed to update site settings in Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
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
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pool = await getSqlPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(50), auditId)
          .input('admin_email', sql.NVarChar(255), params.admin_email)
          .input('action', sql.NVarChar(100), params.action)
          .input('entity_type', sql.NVarChar(50), params.entity_type)
          .input('entity_id', sql.NVarChar(50), params.entity_id || null)
          .input('details', sql.NVarChar(sql.MAX), params.details || null)
          .query(`
            INSERT INTO admin_audit_logs (id, admin_email, action, entity_type, entity_id, details)
            VALUES (@id, @admin_email, @action, @entity_type, @entity_id, @details)
          `);
      } catch (dbErr) {
        console.warn('[Database] Failed to log admin audit to Azure SQL:', dbErr);
      }
    }

    const data = await getStore();
    data.admin_audit_logs.push({
      id: auditId,
      ...params,
      created_at: new Date().toISOString(),
    });
    writeLocalData(data);
  },

  async getAdminStats() {
    const data = await getStore();
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
