import { readdir, readFile, stat, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const cwd = process.cwd();
const distDir = path.join(cwd, 'dist');
const htmlTargets = [
  path.join(distDir, 'index.html'),
  path.join(distDir, '404.html'),
  path.join(distDir, 'lawn-mowing', 'index.html')
];

const exts = new Set(['.jpg', '.jpeg', '.png']);

const MAX_WIDTH = 1200;
const PORTFOLIO_MAX = 840; // 2x of 420px max rendered carousel width

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
};

const exists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const convertImages = async () => {
  if (!(await exists(distDir))) return [];
  const files = await walk(distDir);
  const converted = [];

  for (const file of files) {
    if (file.endsWith('.webp')) continue;
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) continue;

    const webpPath = file.replace(/\.(jpe?g|png)$/i, '.webp');

    const isPortfolio = path.basename(file).startsWith('pexels-');
    const maxWidth = isPortfolio ? PORTFOLIO_MAX : MAX_WIDTH;

    const metadata = await sharp(file).metadata();
    let pipeline = sharp(file);

    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    await pipeline.webp({ quality: 80, effort: 6 }).toFile(webpPath);

    const relOriginal = path.relative(distDir, file).replace(/\\/g, '/');
    const relWebp = path.relative(distDir, webpPath).replace(/\\/g, '/');
    converted.push({ relOriginal, relWebp });

    await unlink(file);
    console.log(`[images] ${relOriginal} -> ${relWebp} (max-width: ${maxWidth}px)`);
  }

  return converted;
};

const updateHtmlRefs = async (mapping) => {
  if (!mapping.length) return;

  for (const htmlFile of htmlTargets) {
    if (!(await exists(htmlFile))) continue;
    let html = await readFile(htmlFile, 'utf8');
    let changed = false;

    for (const { relOriginal, relWebp } of mapping) {
      if (!html.includes(relOriginal)) continue;
      html = html.split(relOriginal).join(relWebp);
      changed = true;
    }

    if (changed) {
      await writeFile(htmlFile, html, 'utf8');
      console.log(`[html] updated references in ${path.relative(distDir, htmlFile)}`);
    }
  }
};

const updateCssRefs = async (mapping) => {
  if (!mapping.length) return;

  const allFiles = await walk(distDir);
  const cssFiles = allFiles.filter((f) => f.endsWith('.css'));

  for (const cssFile of cssFiles) {
    let css = await readFile(cssFile, 'utf8');
    let changed = false;

    for (const { relOriginal, relWebp } of mapping) {
      if (!css.includes(relOriginal)) continue;
      css = css.split(relOriginal).join(relWebp);
      changed = true;
    }

    if (changed) {
      await writeFile(cssFile, css, 'utf8');
      console.log(`[css] updated references in ${path.relative(distDir, cssFile)}`);
    }
  }
};

const main = async () => {
  const mapping = await convertImages();
  await updateHtmlRefs(mapping);
  await updateCssRefs(mapping);
  console.log(`[images] optimization complete (${mapping.length} converted)`);
};

main().catch((error) => {
  console.error('[images] optimization failed', error);
  process.exit(1);
});
