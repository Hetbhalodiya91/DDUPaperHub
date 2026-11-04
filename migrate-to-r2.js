// Migration script: copies existing local PDFs into Cloudflare R2
// Uses the same S3-compatible AWS SDK v2 that the app already uses
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://7188cfbc71536983536d63f725bd336a.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'a34ffc9c700824320fdfaddc54400f6c',
    secretAccessKey: 'f86a0a9a5f5d01aa6564491698a216cc8edd4ffa048d6f3741dd36ebe963459f'
  }
});

const bucket = 'ddu-paperhub';
const uploadDir = './uploads';

async function migrate() {
  const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf') || f.endsWith('.PDF'));

  if (files.length === 0) {
    console.log('No PDF files found in ./uploads — nothing to migrate.');
    return;
  }

  console.log(`Found ${files.length} PDF(s) to migrate...\n`);

  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const fileContent = fs.readFileSync(filePath);

    // R2 key format: papers/<original-filename>
    const key = `papers/${file}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: 'application/pdf'
    });

    try {
      await s3.send(command);
      console.log(`✓ Migrated: ${file} → s3://${bucket}/${key}`);
    } catch (err) {
      console.error(`✗ Failed: ${file}`, err.message);
    }
  }

  console.log('\nMigration complete. All PDFs are now in R2.');
}

// Run the migration
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});