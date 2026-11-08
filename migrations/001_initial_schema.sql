-- =============================================================================
-- NotesBazaar by AbhyasMitra — Azure SQL Database Initial Schema (DDL)
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255) NULL,
        permissions NVARCHAR(MAX) NULL, -- JSON array of permissions
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id NVARCHAR(50) PRIMARY KEY,
        firebase_uid NVARCHAR(128) NOT NULL UNIQUE,
        email NVARCHAR(255) NOT NULL,
        display_name NVARCHAR(255) NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'student',
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'branches')
BEGIN
    CREATE TABLE branches (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        slug NVARCHAR(100) NOT NULL UNIQUE,
        code NVARCHAR(20) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NULL,
        icon_name NVARCHAR(50) NULL,
        is_active BIT NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_branches_slug ON branches(slug);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'academic_years')
BEGIN
    CREATE TABLE academic_years (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        slug NVARCHAR(50) NOT NULL UNIQUE,
        sort_order INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_academic_years_slug ON academic_years(slug);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'semesters')
BEGIN
    CREATE TABLE semesters (
        id NVARCHAR(50) PRIMARY KEY,
        label NVARCHAR(50) NOT NULL,
        year_id NVARCHAR(50) NOT NULL,
        semester_number INT NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_semesters_year FOREIGN KEY (year_id) REFERENCES academic_years(id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'patterns')
BEGIN
    CREATE TABLE patterns (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        slug NVARCHAR(50) NOT NULL UNIQUE,
        year_introduced INT NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_patterns_slug ON patterns(slug);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'subjects')
BEGIN
    CREATE TABLE subjects (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        slug NVARCHAR(150) NOT NULL,
        code NVARCHAR(50) NULL,
        branch_id NVARCHAR(50) NOT NULL,
        year_id NVARCHAR(50) NOT NULL,
        semester_id NVARCHAR(50) NULL,
        pattern_id NVARCHAR(50) NOT NULL,
        description NVARCHAR(MAX) NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_subjects_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
        CONSTRAINT fk_subjects_year FOREIGN KEY (year_id) REFERENCES academic_years(id),
        CONSTRAINT fk_subjects_pattern FOREIGN KEY (pattern_id) REFERENCES patterns(id)
    );
    CREATE INDEX idx_subjects_slug ON subjects(slug);
    CREATE INDEX idx_subjects_branch ON subjects(branch_id);
    CREATE INDEX idx_subjects_year ON subjects(year_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
BEGIN
    CREATE TABLE products (
        id NVARCHAR(50) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        slug NVARCHAR(200) NOT NULL UNIQUE,
        branch_id NVARCHAR(50) NOT NULL,
        year_id NVARCHAR(50) NOT NULL,
        semester_id NVARCHAR(50) NULL,
        subject_id NVARCHAR(50) NOT NULL,
        pattern_id NVARCHAR(50) NOT NULL,
        short_description NVARCHAR(500) NULL,
        full_description NVARCHAR(MAX) NULL,
        topics_covered NVARCHAR(MAX) NULL, -- JSON array of topics
        price_in_paise INT NOT NULL DEFAULT 0,
        compare_at_price_in_paise INT NULL,
        publication_status NVARCHAR(50) NOT NULL DEFAULT 'published', -- draft, published, archived
        is_available BIT NOT NULL DEFAULT 1,
        is_coming_soon BIT NOT NULL DEFAULT 0,
        file_format NVARCHAR(20) NOT NULL DEFAULT 'PDF',
        file_size_bytes BIGINT NULL,
        page_count INT NULL,
        preview_blob_url NVARCHAR(1000) NULL,
        seo_title NVARCHAR(255) NULL,
        seo_description NVARCHAR(500) NULL,
        seo_keywords NVARCHAR(500) NULL,
        canonical_url NVARCHAR(500) NULL,
        created_by NVARCHAR(50) NULL,
        updated_by NVARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_products_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
        CONSTRAINT fk_products_year FOREIGN KEY (year_id) REFERENCES academic_years(id),
        CONSTRAINT fk_products_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
        CONSTRAINT fk_products_pattern FOREIGN KEY (pattern_id) REFERENCES patterns(id)
    );
    CREATE INDEX idx_products_slug ON products(slug);
    CREATE INDEX idx_products_branch ON products(branch_id);
    CREATE INDEX idx_products_status ON products(publication_status, is_available);
    CREATE INDEX idx_products_coming_soon ON products(is_coming_soon);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_files')
BEGIN
    CREATE TABLE product_files (
        id NVARCHAR(50) PRIMARY KEY,
        product_id NVARCHAR(50) NOT NULL,
        storage_provider NVARCHAR(50) NOT NULL DEFAULT 'azure_blob',
        blob_container NVARCHAR(100) NOT NULL,
        blob_name NVARCHAR(500) NOT NULL,
        original_filename NVARCHAR(255) NOT NULL,
        mime_type NVARCHAR(100) NOT NULL DEFAULT 'application/pdf',
        file_size_bytes BIGINT NOT NULL,
        sha256_checksum NVARCHAR(128) NULL,
        version INT NOT NULL DEFAULT 1,
        upload_status NVARCHAR(50) NOT NULL DEFAULT 'completed',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_files_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_files_product ON product_files(product_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
BEGIN
    CREATE TABLE orders (
        id NVARCHAR(50) PRIMARY KEY,
        user_id NVARCHAR(50) NOT NULL,
        order_number NVARCHAR(50) NOT NULL UNIQUE,
        total_amount_in_paise INT NOT NULL,
        discount_amount_in_paise INT NOT NULL DEFAULT 0,
        final_amount_in_paise INT NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'INR',
        status NVARCHAR(50) NOT NULL DEFAULT 'created', -- created, pending, paid, failed, cancelled, refunded
        razorpay_order_id NVARCHAR(100) NULL,
        razorpay_payment_id NVARCHAR(100) NULL,
        customer_email NVARCHAR(255) NOT NULL,
        customer_name NVARCHAR(255) NULL,
        metadata NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX idx_orders_user ON orders(user_id);
    CREATE INDEX idx_orders_status ON orders(status);
    CREATE INDEX idx_orders_razorpay_order ON orders(razorpay_order_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_items')
BEGIN
    CREATE TABLE order_items (
        id NVARCHAR(50) PRIMARY KEY,
        order_id NVARCHAR(50) NOT NULL,
        product_id NVARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price_in_paise INT NOT NULL,
        discount_amount_in_paise INT NOT NULL DEFAULT 0,
        final_price_in_paise INT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE INDEX idx_items_order ON order_items(order_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id NVARCHAR(50) PRIMARY KEY,
        order_id NVARCHAR(50) NOT NULL,
        razorpay_order_id NVARCHAR(100) NOT NULL,
        razorpay_payment_id NVARCHAR(100) NOT NULL UNIQUE,
        razorpay_signature NVARCHAR(255) NULL,
        amount_in_paise INT NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'INR',
        status NVARCHAR(50) NOT NULL,
        method NVARCHAR(50) NULL,
        verified_at DATETIME2 NULL,
        raw_response NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE INDEX idx_payments_order ON payments(order_id);
    CREATE INDEX idx_payments_razorpay_id ON payments(razorpay_payment_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payment_webhook_events')
BEGIN
    CREATE TABLE payment_webhook_events (
        id NVARCHAR(50) PRIMARY KEY,
        event_id NVARCHAR(100) NOT NULL UNIQUE,
        event_type NVARCHAR(100) NOT NULL,
        razorpay_order_id NVARCHAR(100) NULL,
        razorpay_payment_id NVARCHAR(100) NULL,
        signature_verified BIT NOT NULL DEFAULT 0,
        payload NVARCHAR(MAX) NOT NULL,
        processing_status NVARCHAR(50) NOT NULL DEFAULT 'received',
        processed_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_webhooks_event_id ON payment_webhook_events(event_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'download_entitlements')
BEGIN
    CREATE TABLE download_entitlements (
        id NVARCHAR(50) PRIMARY KEY,
        user_id NVARCHAR(50) NOT NULL,
        product_id NVARCHAR(50) NOT NULL,
        order_id NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'active', -- active, revoked, expired
        granted_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        expires_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_entitlements_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_entitlements_product FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT fk_entitlements_order FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE INDEX idx_entitlements_user_product ON download_entitlements(user_id, product_id);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'download_audit_logs')
BEGIN
    CREATE TABLE download_audit_logs (
        id NVARCHAR(50) PRIMARY KEY,
        entitlement_id NVARCHAR(50) NOT NULL,
        user_id NVARCHAR(50) NOT NULL,
        product_id NVARCHAR(50) NOT NULL,
        ip_address NVARCHAR(50) NULL,
        user_agent NVARCHAR(500) NULL,
        access_type NVARCHAR(50) NOT NULL DEFAULT 'direct_stream',
        status NVARCHAR(50) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'banners')
BEGIN
    CREATE TABLE banners (
        id NVARCHAR(50) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        subtitle NVARCHAR(500) NULL,
        badge_text NVARCHAR(100) NULL,
        cta_label NVARCHAR(100) NULL,
        cta_url NVARCHAR(500) NULL,
        image_url NVARCHAR(1000) NULL,
        start_at DATETIME2 NULL,
        end_at DATETIME2 NULL,
        is_active BIT NOT NULL DEFAULT 1,
        display_order INT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'offers')
BEGIN
    CREATE TABLE offers (
        id NVARCHAR(50) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(500) NULL,
        discount_type NVARCHAR(20) NOT NULL, -- percentage, fixed
        discount_value INT NOT NULL, -- percentage (e.g. 20) or fixed paise (e.g. 5000 = Rs 50)
        min_order_amount_in_paise INT NOT NULL DEFAULT 0,
        max_discount_in_paise INT NULL,
        max_uses INT NULL,
        current_uses INT NOT NULL DEFAULT 0,
        per_user_limit INT NOT NULL DEFAULT 1,
        start_at DATETIME2 NULL,
        end_at DATETIME2 NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_offers_code ON offers(code);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'coupon_redemptions')
BEGIN
    CREATE TABLE coupon_redemptions (
        id NVARCHAR(50) PRIMARY KEY,
        offer_id NVARCHAR(50) NOT NULL,
        user_id NVARCHAR(50) NOT NULL,
        order_id NVARCHAR(50) NOT NULL,
        discount_applied_in_paise INT NOT NULL,
        redeemed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_redemptions_offer FOREIGN KEY (offer_id) REFERENCES offers(id),
        CONSTRAINT fk_redemptions_order FOREIGN KEY (order_id) REFERENCES orders(id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        id NVARCHAR(50) PRIMARY KEY,
        user_id NVARCHAR(50) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        link_url NVARCHAR(500) NULL,
        channel NVARCHAR(50) NOT NULL DEFAULT 'in_app',
        is_read BIT NOT NULL DEFAULT 0,
        read_at DATETIME2 NULL,
        delivery_status NVARCHAR(50) NOT NULL DEFAULT 'delivered',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notification_campaigns')
BEGIN
    CREATE TABLE notification_campaigns (
        id NVARCHAR(50) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        audience_type NVARCHAR(50) NOT NULL, -- all, product_purchasers, branch_purchasers, selected
        audience_filter NVARCHAR(MAX) NULL, -- JSON config
        channel NVARCHAR(50) NOT NULL DEFAULT 'in_app',
        status NVARCHAR(50) NOT NULL DEFAULT 'completed',
        sent_count INT NOT NULL DEFAULT 0,
        failed_count INT NOT NULL DEFAULT 0,
        scheduled_at DATETIME2 NULL,
        sent_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notification_preferences')
BEGIN
    CREATE TABLE notification_preferences (
        id NVARCHAR(50) PRIMARY KEY,
        user_id NVARCHAR(50) NOT NULL UNIQUE,
        email_updates BIT NOT NULL DEFAULT 1,
        product_updates BIT NOT NULL DEFAULT 1,
        marketing_announcements BIT NOT NULL DEFAULT 0,
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cookie_consent_records')
BEGIN
    CREATE TABLE cookie_consent_records (
        id NVARCHAR(50) PRIMARY KEY,
        consent_token NVARCHAR(128) NOT NULL,
        user_id NVARCHAR(50) NULL,
        strictly_necessary BIT NOT NULL DEFAULT 1,
        analytics BIT NOT NULL DEFAULT 0,
        marketing BIT NOT NULL DEFAULT 0,
        functional BIT NOT NULL DEFAULT 0,
        policy_version NVARCHAR(20) NOT NULL DEFAULT '1.0',
        ip_anonymized NVARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX idx_consent_token ON cookie_consent_records(consent_token);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'admin_audit_logs')
BEGIN
    CREATE TABLE admin_audit_logs (
        id NVARCHAR(50) PRIMARY KEY,
        admin_user_id NVARCHAR(50) NULL,
        admin_email NVARCHAR(255) NOT NULL,
        action NVARCHAR(100) NOT NULL,
        entity_type NVARCHAR(100) NOT NULL,
        entity_id NVARCHAR(100) NULL,
        details NVARCHAR(MAX) NULL,
        ip_address NVARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'site_settings')
BEGIN
    CREATE TABLE site_settings (
        id NVARCHAR(50) PRIMARY KEY,
        setting_key NVARCHAR(100) NOT NULL UNIQUE,
        setting_value NVARCHAR(MAX) NOT NULL,
        is_public BIT NOT NULL DEFAULT 1,
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

