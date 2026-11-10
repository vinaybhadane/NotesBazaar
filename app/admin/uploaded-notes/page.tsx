import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import UploadedNotesClient from './UploadedNotesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Uploaded Notes & Files | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminUploadedNotesPage() {
  const [files, allBlobs] = await Promise.all([
    db.getAllUploadedFiles(),
    storage.listAllPrivateBlobs(),
  ]);

  const referencedBlobNames = new Set(files.map((f) => f.blob_name));
  const orphanBlobs = allBlobs.filter((b) => !referencedBlobNames.has(b.blobName));

  return (
    <UploadedNotesClient
      initialFiles={files}
      initialOrphanBlobs={orphanBlobs}
    />
  );
}

