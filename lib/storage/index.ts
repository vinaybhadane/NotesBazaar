import fs from 'fs';
import path from 'path';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

const STORAGE_DIR = path.join(process.cwd(), '.storage');
const LOCAL_PRIVATE_DIR = path.join(STORAGE_DIR, 'notes-private');
const LOCAL_PREVIEWS_DIR = path.join(STORAGE_DIR, 'notes-previews');

function ensureLocalDirs() {
  if (!fs.existsSync(LOCAL_PRIVATE_DIR)) {
    fs.mkdirSync(LOCAL_PRIVATE_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_PREVIEWS_DIR)) {
    fs.mkdirSync(LOCAL_PREVIEWS_DIR, { recursive: true });
  }
}

let rawConn = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
if (
  rawConn &&
  ((rawConn.startsWith('"') && rawConn.endsWith('"')) ||
    (rawConn.startsWith("'") && rawConn.endsWith("'")))
) {
  rawConn = rawConn.slice(1, -1).trim();
}
const connectionString = rawConn;
let blobServiceClient: BlobServiceClient | null = null;
let sharedKeyCredential: StorageSharedKeyCredential | null = null;
let corsConfigured = false;

if (connectionString) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const matchName = connectionString.match(/AccountName=([^;]+)/i);
    const matchKey = connectionString.match(/AccountKey=([^;]+)/i);
    if (matchName?.[1] && matchKey?.[1]) {
      sharedKeyCredential = new StorageSharedKeyCredential(matchName[1], matchKey[1]);
    }
  } catch (err) {
    console.warn('[Storage] Failed to initialize Azure Blob Storage client:', (err as Error).message);
  }
}

async function ensureCorsConfigured(): Promise<void> {
  if (!blobServiceClient || corsConfigured) return;
  try {
    const props = await blobServiceClient.getProperties();
    const existingCors = props.cors || [];
    const hasWildcardPut = existingCors.some(
      (c) => c.allowedOrigins.includes('*') && c.allowedMethods.includes('PUT')
    );
    if (!hasWildcardPut) {
      const updatedCors = [
        ...existingCors.slice(0, 4),
        {
          allowedOrigins: '*',
          allowedMethods: 'GET,HEAD,PUT,POST,OPTIONS',
          allowedHeaders: '*',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600,
        },
      ];
      await blobServiceClient.setProperties({ cors: updatedCors });
    }
    corsConfigured = true;
  } catch (err) {
    console.warn('[Storage] Could not inspect/update Azure Blob CORS settings:', (err as Error).message);
  }
}

export const storage = {
  isAzureConfigured(): boolean {
    return Boolean(blobServiceClient);
  },

  canGenerateUploadSas(): boolean {
    return Boolean(blobServiceClient && sharedKeyCredential);
  },

  /**
   * Generates a short-lived SAS URL for direct browser-to-Azure-Blob upload (bypasses serverless 4.5 MB limit)
   */
  async createUploadSasUrl(
    originalFilename: string,
    prefixId = 'note'
  ): Promise<{ uploadUrl: string; blobName: string; container: string }> {
    if (!blobServiceClient || !sharedKeyCredential) {
      throw new Error('Azure Blob Storage SAS upload is not configured.');
    }

    const container = process.env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private';
    const containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.createIfNotExists();
    await ensureCorsConfigured();

    const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `${prefixId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanFilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn: new Date(Date.now() + 30 * 60 * 1000),
      },
      sharedKeyCredential
    ).toString();

    return {
      uploadUrl: `${blockBlobClient.url}?${sasToken}`,
      blobName,
      container,
    };
  },

  /**
   * Verifies that a blob exists in storage and inspects its size and PDF magic bytes
   */
  async verifyBlob(
    blobName: string,
    containerName = process.env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private'
  ): Promise<{ exists: boolean; size: number; isPdf: boolean }> {
    if (blobServiceClient) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const exists = await blockBlobClient.exists();
        if (!exists) return { exists: false, size: 0, isPdf: false };

        const props = await blockBlobClient.getProperties();
        const size = Number(props.contentLength || 0);
        if (size < 5) return { exists: true, size, isPdf: false };

        const headDownload = await blockBlobClient.download(0, 5);
        const chunks: Buffer[] = [];
        if (headDownload.readableStreamBody) {
          for await (const chunk of headDownload.readableStreamBody) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
        }
        const headBuf = Buffer.concat(chunks);
        const isPdf = headBuf.slice(0, 4).toString('ascii') === '%PDF';
        return { exists: true, size, isPdf };
      } catch (err) {
        console.warn('[Storage] verifyBlob error:', (err as Error).message);
        return { exists: false, size: 0, isPdf: false };
      }
    }

    ensureLocalDirs();
    const localPath = path.join(LOCAL_PRIVATE_DIR, blobName);
    if (!fs.existsSync(localPath)) return { exists: false, size: 0, isPdf: false };
    const stat = fs.statSync(localPath);
    const fd = fs.openSync(localPath, 'r');
    const head = Buffer.alloc(4);
    fs.readSync(fd, head, 0, 4, 0);
    fs.closeSync(fd);
    return {
      exists: true,
      size: stat.size,
      isPdf: head.toString('ascii') === '%PDF',
    };
  },

  /**
   * Recovery helper: searches storage container for blobs prefixed with productId_
   */
  async findBlobForProduct(
    productId: string,
    containerName = process.env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private'
  ): Promise<{ blobName: string; container: string; size: number } | null> {
    if (blobServiceClient) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        let latest: { blobName: string; container: string; size: number; modified: number } | null = null;
        for await (const blob of containerClient.listBlobsFlat({ prefix: `${productId}_` })) {
          const mod = blob.properties.lastModified ? new Date(blob.properties.lastModified).getTime() : 0;
          if (!latest || mod > latest.modified) {
            latest = {
              blobName: blob.name,
              container: containerName,
              size: Number(blob.properties.contentLength || 0),
              modified: mod,
            };
          }
        }
        if (latest) {
          return { blobName: latest.blobName, container: latest.container, size: latest.size };
        }
      } catch (err) {
        console.warn('[Storage] findBlobForProduct error:', (err as Error).message);
      }
    }
    return null;
  },

  /**
   * Uploads a private note PDF file
   */
  async uploadPrivateNote(
    buffer: Buffer,
    originalFilename: string,
    productId: string
  ): Promise<{ blobName: string; container: string; size: number }> {
    // Validate PDF magic bytes (%PDF)
    const isPdf = buffer.length > 4 && buffer.slice(0, 4).toString('ascii') === '%PDF';
    if (!isPdf) {
      throw new Error(`Invalid file format for "${originalFilename}". Only legitimate PDF documents are accepted.`);
    }

    const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `${productId}_${Date.now()}_${cleanFilename}`;
    const container = process.env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private';

    if (blobServiceClient) {
      // Throw if Azure upload fails when Azure is configured (never silently store on ephemeral serverless disk)
      const containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: 'application/pdf',
          blobContentDisposition: `attachment; filename="${cleanFilename}"`,
        },
      });
      return { blobName, container, size: buffer.length };
    }

    // Local private storage fallback (offline local dev only)
    ensureLocalDirs();
    const localPath = path.join(LOCAL_PRIVATE_DIR, blobName);
    fs.writeFileSync(localPath, buffer);
    return { blobName, container, size: buffer.length };
  },

  /**
   * Gets a readable stream or buffer for secure server-side download streaming
   */
  async getPrivateNoteBuffer(blobName: string, containerName = 'notes-private'): Promise<Buffer> {
    if (blobServiceClient) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blockBlobClient.download(0);
        const stream = downloadResponse.readableStreamBody;
        if (stream) {
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          return Buffer.concat(chunks);
        }
      } catch (err) {
        console.warn('[Storage] Azure download failed, trying local fallback:', (err as Error).message);
      }
    }

    ensureLocalDirs();
    const localPath = path.join(LOCAL_PRIVATE_DIR, blobName);
    if (!fs.existsSync(localPath)) {
      throw new Error('The requested note document is not found in private storage.');
    }
    return fs.readFileSync(localPath);
  },
};
