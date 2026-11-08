-- =============================================================================
-- NotesBazaar by AbhyasMitra — Seed Data for Azure SQL
-- Schema-matched strictly against migrations/001_initial_schema.sql
-- =============================================================================

-- 1. Roles
IF NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role_admin') 
    INSERT INTO roles (id, name, description) VALUES ('role_admin', 'Administrator', 'Full platform administrative access');
IF NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role_student') 
    INSERT INTO roles (id, name, description) VALUES ('role_student', 'Student', 'Registered engineering student');

-- 2. Patterns
IF NOT EXISTS (SELECT 1 FROM patterns WHERE id = 'pat_2024') 
    INSERT INTO patterns (id, name, slug, year_introduced, is_active) VALUES ('pat_2024', 'SPPU 2024 Pattern', 'sppu-2024-pattern', 2024, 1);

-- 3. Academic Years
IF NOT EXISTS (SELECT 1 FROM academic_years WHERE id = 'yr_se') 
    INSERT INTO academic_years (id, name, slug, sort_order, is_active) VALUES ('yr_se', 'Second Year (SE)', 'second-year', 1, 1);
IF NOT EXISTS (SELECT 1 FROM academic_years WHERE id = 'yr_te') 
    INSERT INTO academic_years (id, name, slug, sort_order, is_active) VALUES ('yr_te', 'Third Year (TE)', 'third-year', 2, 1);

-- 4. Semesters
IF NOT EXISTS (SELECT 1 FROM semesters WHERE id = 'sem_3') 
    INSERT INTO semesters (id, label, year_id, semester_number, is_active) VALUES ('sem_3', 'Semester 3', 'yr_se', 3, 1);
IF NOT EXISTS (SELECT 1 FROM semesters WHERE id = 'sem_4') 
    INSERT INTO semesters (id, label, year_id, semester_number, is_active) VALUES ('sem_4', 'Semester 4', 'yr_se', 4, 1);
IF NOT EXISTS (SELECT 1 FROM semesters WHERE id = 'sem_5') 
    INSERT INTO semesters (id, label, year_id, semester_number, is_active) VALUES ('sem_5', 'Semester 5', 'yr_te', 5, 1);
IF NOT EXISTS (SELECT 1 FROM semesters WHERE id = 'sem_6') 
    INSERT INTO semesters (id, label, year_id, semester_number, is_active) VALUES ('sem_6', 'Semester 6', 'yr_te', 6, 1);

-- 5. Branches
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_comp') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_comp', 'Computer Engineering', 'computer-engineering', 'COMP', 'Comprehensive study notes for SPPU 2024 Pattern Computer Engineering covering core systems, algorithms, database architectures, and software engineering.', 'Laptop', 1, 1);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_it') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_it', 'Information Technology', 'information-technology', 'IT', 'High-yield curriculum notes for Information Technology students under SPPU 2024 Pattern, focusing on web architectures, networking, data structures, and cloud fundamentals.', 'Globe', 1, 2);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_aids') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_aids', 'Artificial Intelligence and Data Science', 'artificial-intelligence-and-data-science', 'AIDS', 'Structured notes for AI & DS students under the SPPU 2024 Pattern covering linear algebra, machine learning, data engineering, and probability theory.', 'Cpu', 1, 3);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_entc') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_entc', 'Electronics and Tele-Communication', 'electronics-and-tele-communication', 'ENTC', 'In-depth notes for E&TC engineering covering signals, digital circuits, microcontrollers, embedded systems, and communication principles under SPPU 2024 Pattern.', 'Radio', 1, 4);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_elec') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_elec', 'Electrical Engineering', 'electrical-engineering', 'ELEC', 'Complete SPPU 2024 Pattern academic notes for Electrical Engineering covering electrical machines, power systems, control engineering, and power electronics.', 'Zap', 1, 5);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_mech') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_mech', 'Mechanical Engineering', 'mechanical-engineering', 'MECH', 'Engineering notes for Mechanical stream covering thermodynamics, fluid dynamics, strength of materials, kinematics of machines, and manufacturing technology.', 'Settings', 1, 6);
IF NOT EXISTS (SELECT 1 FROM branches WHERE id = 'br_civil') 
    INSERT INTO branches (id, name, slug, code, description, icon_name, is_active, sort_order) 
    VALUES ('br_civil', 'Civil Engineering', 'civil-engineering', 'CIVIL', 'Curriculum-aligned notes for Civil Engineering covering structural analysis, surveying, concrete technology, environmental engineering, and fluid mechanics.', 'Building', 1, 7);

-- 6. Subjects
IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_dsa') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_dsa', 'Data Structures and Algorithms', 'data-structures-and-algorithms', '210242', 'br_comp', 'yr_se', 'sem_3', 'pat_2024', 'Arrays, Stacks, Queues, Trees, Graphs, Sorting algorithms, Searching techniques, and Asymptotic Complexity.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_dbms') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_dbms', 'Database Management Systems', 'database-management-systems', '210243', 'br_comp', 'yr_se', 'sem_3', 'pat_2024', 'Relational model, SQL queries, Normalization up to BCNF, Indexing, Transaction processing, ACID properties, and Concurrency control.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_toc') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_toc', 'Theory of Computation', 'theory-of-computation', '310241', 'br_comp', 'yr_te', 'sem_5', 'pat_2024', 'Finite automata, Regular expressions, Context-Free Grammars, Pushdown Automata, Turing Machines, and Decidability.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_cn') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_cn', 'Computer Networks', 'computer-networks', '310242', 'br_comp', 'yr_te', 'sem_5', 'pat_2024', 'OSI Reference Model, TCP/IP Suite, Data Link layer framing, Routing algorithms, Transport Layer protocols, and Network security.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_os') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_os', 'Operating Systems', 'operating-systems', '214441', 'br_it', 'yr_se', 'sem_3', 'pat_2024', 'Process management, CPU scheduling, Thread synchronization, Deadlocks, Virtual memory management, and File system implementation.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_ml') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_ml', 'Machine Learning', 'machine-learning', '317521', 'br_aids', 'yr_te', 'sem_5', 'pat_2024', 'Supervised vs Unsupervised learning, Regression models, Support Vector Machines, Decision Trees, Clustering algorithms, and Model evaluation.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_del') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_del', 'Digital Electronics and Logic Design', 'digital-electronics', '204181', 'br_entc', 'yr_se', 'sem_3', 'pat_2024', 'Boolean algebra, Karnaugh maps, Combinational and Sequential circuit design, Flip-Flops, Registers, Counters, and Logic Families.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_som') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_som', 'Strength of Materials', 'strength-of-materials', '202041', 'br_mech', 'yr_se', 'sem_3', 'pat_2024', 'Stress and strain analysis, Shear force and bending moment diagrams, Torsion of circular shafts, and Deflection of beams.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_em') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_em', 'Electrical Machines', 'electrical-machines', '203141', 'br_elec', 'yr_se', 'sem_3', 'pat_2024', 'DC Generators and Motors, Transformers, Three-phase induction motors, and Synchronous machines under SPPU 2024 Pattern.', 1);

IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = 'sub_survey') 
    INSERT INTO subjects (id, name, slug, code, branch_id, year_id, semester_id, pattern_id, description, is_active) 
    VALUES ('sub_survey', 'Surveying and Geomatics', 'surveying-and-geomatics', '201001', 'br_civil', 'yr_se', 'sem_3', 'pat_2024', 'Linear measurements, Compass surveying, Theodolite traversing, Leveling methods, and GPS/Total Station fundamentals.', 1);

-- 7. Products
IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_dsa_se_comp') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_dsa_se_comp', 'Data Structures and Algorithms Complete Notes — SE Computer Engineering', 'data-structures-and-algorithms-se-comp', 'br_comp', 'yr_se', 'sem_3', 'sub_dsa', 'pat_2024', 'Complete SPPU 2024 Pattern DSA notes covering all 6 units with code implementations and proofs.', 'Complete, syllabus-aligned engineering notes for Data Structures and Algorithms under Savitribai Phule Pune University (SPPU) 2024 Pattern.', 7900, 12900, 'published', 1, 0, 'PDF', 4850000, 142);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_dbms_se_comp') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_dbms_se_comp', 'Database Management Systems Comprehensive Notes — SE Computer Engineering', 'database-management-systems-se-comp', 'br_comp', 'yr_se', 'sem_3', 'sub_dbms', 'pat_2024', 'High-yield DBMS notes covering relational algebra, SQL, normalization, transaction processing, and ACID proofs.', 'Curriculum-aligned database study materials for Second Year Computer Engineering students under SPPU 2024 Pattern.', 6900, 11900, 'published', 1, 0, 'PDF', 5200000, 128);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_toc_te_comp') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_toc_te_comp', 'Theory of Computation (TOC) Complete Notes — TE Computer Engineering', 'theory-of-computation-te-comp', 'br_comp', 'yr_te', 'sem_5', 'sub_toc', 'pat_2024', 'Comprehensive automata theory, Turing machines, decidability, and solved transition diagrams.', 'In-depth Third Year notes for Theory of Computation under SPPU 2024 Pattern with solved past-paper problems.', 8900, 14900, 'published', 1, 0, 'PDF', 6100000, 160);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_cn_te_comp') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_cn_te_comp', 'Computer Networks Full Notes — TE Computer Engineering', 'computer-networks-te-comp', 'br_comp', 'yr_te', 'sem_5', 'sub_cn', 'pat_2024', 'OSI model, routing algorithms, subnetting, TCP/IP socket programming, and protocol analysis.', 'Detailed Computer Networks semester notes for TE Computer Engineering students strictly aligned to SPPU 2024 Pattern.', 7900, 12900, 'published', 1, 0, 'PDF', 4700000, 135);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_os_se_it') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_os_se_it', 'Operating Systems Detailed Notes — SE Information Technology', 'operating-systems-se-it', 'br_it', 'yr_se', 'sem_3', 'sub_os', 'pat_2024', 'Process synchronization, Peterson algorithm, semaphores, paging, deadlocks, and virtual memory.', 'Structured Operating Systems curriculum notes for SE IT students studying under SPPU 2024 Pattern.', 6900, 11900, 'published', 1, 0, 'PDF', 3900000, 118);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_ml_te_aids_coming_soon') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_ml_te_aids_coming_soon', 'Machine Learning Advanced Notes — TE AI & Data Science', 'machine-learning-te-aids', 'br_aids', 'yr_te', 'sem_5', 'sub_ml', 'pat_2024', 'Supervised and unsupervised models, gradient descent derivations, SVMs, and neural network basics.', 'Upcoming curriculum guide for Third Year AI & Data Science students under SPPU 2024 Pattern.', 9900, 15900, 'published', 0, 1, 'PDF', 7200000, 180);

IF NOT EXISTS (SELECT 1 FROM products WHERE id = 'prod_del_se_entc_coming_soon') 
    INSERT INTO products (id, title, slug, branch_id, year_id, semester_id, subject_id, pattern_id, short_description, full_description, price_in_paise, compare_at_price_in_paise, publication_status, is_available, is_coming_soon, file_format, file_size_bytes, page_count) 
    VALUES ('prod_del_se_entc_coming_soon', 'Digital Electronics and Logic Design Notes — SE E&TC Engineering', 'digital-electronics-se-entc', 'br_entc', 'yr_se', 'sem_3', 'sub_del', 'pat_2024', 'Karnaugh maps, combinational logic design, synchronous counters, and logic family circuits.', 'Upcoming notes for SE E&TC engineering students under SPPU 2024 Pattern.', 7900, 12900, 'published', 0, 1, 'PDF', 5100000, 125);

-- 8. Offers
IF NOT EXISTS (SELECT 1 FROM offers WHERE id = 'off_welcome15') 
    INSERT INTO offers (id, code, title, description, discount_type, discount_value, min_order_amount_in_paise, max_discount_in_paise, max_uses, current_uses, per_user_limit, is_active) 
    VALUES ('off_welcome15', 'ABHYAS15', '15% Off Your First Notes Purchase', 'Get an instant 15% discount on any SPPU 2024 Pattern note.', 'percentage', 15, 4900, 2500, 500, 0, 1, 1);

-- 9. Banners
IF NOT EXISTS (SELECT 1 FROM banners WHERE id = 'ban_hero_2024') 
    INSERT INTO banners (id, title, subtitle, badge_text, cta_label, cta_url, is_active, display_order) 
    VALUES ('ban_hero_2024', 'SPPU 2024 Pattern Notes Are Live', 'Verified branch-wise study notes crafted strictly according to the updated SPPU syllabus.', 'SPPU 2024', 'Explore Catalog', '/notes', 1, 1);

IF NOT EXISTS (SELECT 1 FROM banners WHERE id = 'ban_second_year') 
    INSERT INTO banners (id, title, subtitle, badge_text, cta_label, cta_url, is_active, display_order) 
    VALUES ('ban_second_year', 'SE Semester Exam Preparations', 'High-yield notes with step-by-step algorithms, solved proofs, and circuit diagrams.', 'Engineering', 'View SE Notes', '/branches/computer-engineering/second-year', 1, 2);

-- 10. Site Settings
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'site_name') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_site_name', 'site_name', 'NotesBazaar by AbhyasMitra', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'support_email') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_support_email', 'support_email', 'support@abhyasmitra.in', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'support_phone') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_support_phone', 'support_phone', '+91 98765 43210', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'official_disclaimer') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_official_disclaimer', 'official_disclaimer', 'NotesBazaar by AbhyasMitra is an independent educational resource and is not officially affiliated with, endorsed by, or sponsored by Savitribai Phule Pune University (SPPU).', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'download_expiry_hours') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_download_expiry_hours', 'download_expiry_hours', '72', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'max_upload_size_mb') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_max_upload_size_mb', 'max_upload_size_mb', '50', 1);
IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'maintenance_mode') 
    INSERT INTO site_settings (id, setting_key, setting_value, is_public) VALUES ('set_maintenance_mode', 'maintenance_mode', 'false', 1);
