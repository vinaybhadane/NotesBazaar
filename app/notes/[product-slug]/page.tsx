import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import NoteCard from '@/components/NoteCard';
import ProductPurchaseBox from './ProductPurchaseBox';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  DownloadCloud,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ 'product-slug': string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolved = await params;
  const product = await db.getProductBySlug(resolved['product-slug']);
  if (!product) return { title: 'Product Not Found' };

  const priceRupees = (product.price_in_paise / 100).toFixed(0);

  return {
    title: product.seo_title || `${product.title} | NotesBazaar`,
    description:
      product.seo_description ||
      `${product.short_description} Download PDF for ₹${priceRupees}. SPPU 2024 Pattern.`,
    alternates: {
      canonical: product.canonical_url || `/notes/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.short_description,
      type: 'article',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolved = await params;
  const productSlug = resolved['product-slug'];
  const product = await db.getProductBySlug(productSlug);

  if (!product || product.publication_status !== 'published') {
    notFound();
  }

  // Fetch related notes from the same branch
  const { products: relatedProducts } = await db.getProducts({
    branch_id: product.branch_id,
    status: 'published',
    limit: 4,
  });

  const attachedFiles = await db.getProductFilesByProductId(product.id);
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.short_description,
    offers: {
      '@type': 'Offer',
      price: (product.price_in_paise / 100).toFixed(2),
      priceCurrency: 'INR',
      availability: product.is_coming_soon
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/notes/${product.slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Notes',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/notes`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/notes/${product.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium flex items-center gap-2">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/notes" className="hover:text-slate-900">
          Notes
        </Link>
        <span>/</span>
        {product.branch_name && (
          <>
            <span className="text-slate-400">{product.branch_name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Product Hero & Purchase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Product Overview & Topics */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="pill-badge pill-badge-yellow">SPPU 2024 Pattern</span>
              <span className="pill-badge pill-badge-gray">{product.branch_name}</span>
              <span className="pill-badge pill-badge-cyan">{product.year_name}</span>
              {product.is_coming_soon && (
                <span className="pill-badge pill-badge-peach font-bold animate-pulse">
                  COMING SOON!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {product.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Format</span>
              <span className="font-bold text-slate-900">{product.file_format} Document</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Pages</span>
              <span className="font-bold text-slate-900">{product.page_count || 65}+ Pages</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Academic Pattern</span>
              <span className="font-bold text-slate-900">2024 Pattern</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Access</span>
              <span className="font-bold text-slate-900">Account Download</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">About These Notes</h2>
            <div className="prose prose-slate text-xs sm:text-sm text-slate-600 leading-relaxed max-w-none">
              <p>{product.full_description}</p>
            </div>
          </div>

          {/* Multi-Note Pack Bundle (If multiple documents are included in this single purchase) */}
          {attachedFiles && attachedFiles.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="pill-badge pill-badge-yellow text-[11px]">SINGLE PURCHASE PACK</span>
                <span className="text-xs font-bold text-slate-500">
                  Includes {attachedFiles.length} Separate Documents
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-950">
                Documents Included in this Single Purchase
              </h2>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                {attachedFiles.map((file, idx) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 flex-shrink-0">
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {file.original_filename}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          Document #{idx + 1} · PDF Format
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      Included
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                ✓ All {attachedFiles.length} note files are permanently unlocked in your student account immediately after payment.
              </p>
            </div>
          )}

          {/* Topics & Units Covered */}
          {product.topics_covered && product.topics_covered.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-950">
                Syllabus Units Covered ({product.topics_covered.length})
              </h2>
              <div className="space-y-2.5">
                {product.topics_covered.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/90 flex items-start gap-3 shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Independent Disclaimer Reminder */}
          <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 text-xs text-slate-500">
            <p>
              <strong>Disclaimer:</strong> This study guide is an independent reference prepared by subject specialists to assist SPPU engineering students with their semester exam preparation under the 2024 Pattern syllabus.
            </p>
          </div>
        </div>

        {/* Right 1 Column: Sticky Purchase Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <ProductPurchaseBox product={product} />
          </div>
        </div>
      </div>

      {/* Related Notes */}
      {filteredRelated.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <h2 className="text-2xl font-black text-slate-950">
            Related Notes in {product.branch_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRelated.map((note) => (
              <NoteCard key={note.id} product={note} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

