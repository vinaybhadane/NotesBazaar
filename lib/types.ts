export type Role = 'student' | 'admin' | 'catalog_manager' | 'support_manager';

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  role: Role;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Semester {
  id: string;
  label: string;
  year_id: string;
  semester_number: number;
  is_active: boolean;
}

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  year_introduced: number;
  is_active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  branch_id: string;
  year_id: string;
  semester_id?: string | null;
  pattern_id: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface Product {
  id: string;
  title: string;
  slug: string;
  branch_id: string;
  year_id: string;
  semester_id?: string | null;
  subject_id: string;
  pattern_id: string;
  short_description: string;
  full_description: string;
  topics_covered: string[]; // List of topic names/modules
  price_in_paise: number; // e.g. 4900 = ₹49.00
  compare_at_price_in_paise?: number | null;
  publication_status: PublicationStatus;
  is_available: boolean;
  is_coming_soon: boolean; // MANDATORY: If true, purchases disabled UI + Server
  file_format: string; // 'PDF'
  file_size_bytes?: number;
  page_count?: number;
  preview_blob_url?: string | null;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined convenience fields
  branch_name?: string;
  year_name?: string;
  subject_name?: string;
  pattern_name?: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  storage_provider: 'azure_blob' | 'local';
  blob_container: string;
  blob_name: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_checksum?: string;
  version: number;
  upload_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export type OrderStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount_in_paise: number;
  discount_amount_in_paise: number;
  final_amount_in_paise: number;
  currency: string;
  status: OrderStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  customer_email: string;
  customer_name?: string | null;
  metadata?: Record<string, any>;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_in_paise: number;
  discount_amount_in_paise: number;
  final_price_in_paise: number;
  created_at?: string;
  // Joined
  product_title?: string;
  product_slug?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  amount_in_paise: number;
  currency: string;
  status: string;
  method?: string;
  verified_at?: string;
  raw_response?: string;
  created_at: string;
}

export interface DownloadEntitlement {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  status: 'active' | 'revoked' | 'expired';
  granted_at: string;
  expires_at?: string | null;
  created_at: string;
  // Joined
  product?: Product;
  files?: ProductFile[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge_text?: string;
  cta_label: string;
  cta_url: string;
  image_url?: string;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // e.g. 15 for 15%, or 3000 for ₹30 off
  min_order_amount_in_paise: number;
  max_discount_in_paise?: number | null;
  max_uses?: number | null;
  current_uses: number;
  per_user_limit: number;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link_url?: string | null;
  channel: 'in_app' | 'email' | 'push';
  is_read: boolean;
  read_at?: string | null;
  delivery_status: 'delivered' | 'pending' | 'failed';
  created_at: string;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  audience_type: 'all' | 'product_purchasers' | 'branch_purchasers' | 'selected';
  audience_filter?: Record<string, any>;
  channel: 'in_app' | 'email' | 'push';
  status: 'draft' | 'sending' | 'completed' | 'failed';
  sent_count: number;
  failed_count: number;
  scheduled_at?: string | null;
  sent_at: string;
  created_by?: string;
  created_at: string;
}

export interface CookiePreferences {
  strictly_necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  policy_version: string;
}

export interface SiteSettings {
  site_name: string;
  support_email: string;
  support_phone: string;
  official_disclaimer: string;
  download_expiry_hours: number;
  max_upload_size_mb: number;
  maintenance_mode: boolean;
  announcement_bar_enabled: boolean;
  announcement_bar_text: string;
  announcement_bar_link: string;
}

