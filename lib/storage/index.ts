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

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
let blobServiceClient: BlobServiceClient | null = null;

if (connectionString) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } catch (err) {
    console.warn('[Storage] Failed to initialize Azure Blob Storage client:', (err as Error).message);
  }
}

export const storage = {
  isAzureConfigured(): boolean {
    return Boolean(blobServiceClient);
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
      throw new Error('Invalid file format. Only legitimate PDF documents are accepted.');
    }

    const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `${productId}_${Date.now()}_${cleanFilename}`;
    const container = process.env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private';

    if (blobServiceClient) {
      try {
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
      } catch (err) {
        console.warn('[Storage] Azure upload failed, falling back to local private storage:', (err as Error).message);
      }
    }

    // Local private storage fallback
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

