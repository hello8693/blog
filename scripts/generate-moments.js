const fs = require('fs');
const path = require('path');

const MOMENTS_PREFIX = '_moments/';

function normalizeSource(source) {
  return (source || '').replace(/\\/g, '/');
}

function isIgnoredSource(source) {
  return path.basename(source).startsWith('_');
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  return [`${value}`.trim()].filter(Boolean);
}

function escapeHTML(value) {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hasFrontMatterDate(raw) {
  if (typeof raw !== 'string') return false;
  const match = raw.match(/^(-{3,}|;{3,})\s*\n([\s\S]*?)\n\1\s*\n/);
  if (!match) return false;
  const frontMatter = match[2] || '';
  return /^\s*date\s*:/m.test(frontMatter);
}

function getFileMtime(page, sourceDir) {
  const fullSource = page.full_source || (page.source ? path.join(sourceDir, page.source) : '');
  if (!fullSource) return null;
  try {
    return fs.statSync(fullSource).mtime;
  } catch (error) {
    return null;
  }
}

function getDateValue(date) {
  if (!date) return 0;
  if (typeof date.valueOf === 'function') return date.valueOf();
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function formatDate(date, helper, helperContext) {
  if (!date) return '';
  if (typeof helper === 'function') {
    return helper.call(helperContext, date, 'YYYY-MM-DD HH:mm');
  }
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  const pad = (value) => `${value}`.padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function renderContent(page) {
  if (typeof page.content === 'string') return page.content;
  if (typeof page._content === 'string' && page._content.trim()) {
    return hexo.render.renderSync({ text: page._content, engine: 'markdown' });
  }
  return '';
}

hexo.extend.generator.register('moments', function generateMoments(locals) {
  const dateHelper = hexo.extend.helper.get('date');
  const helperContext = { config: hexo.config, page: {} };

  const moments = locals.pages
    .toArray()
    .map((page) => {
      const source = normalizeSource(page.source);
      if (!source.startsWith(MOMENTS_PREFIX)) return null;
      if (isIgnoredSource(source)) return null;

      const pinned = page.pinned === true || page.pinned === 'true' || page.pinned === 1;
      const hasDate = hasFrontMatterDate(page.raw);
      const fallbackDate = hasDate ? null : getFileMtime(page, hexo.source_dir);
      const displayDate = hasDate ? page.date : (fallbackDate || page.updated || page.date);

      const metaParts = [];
      const dateText = formatDate(displayDate, dateHelper, helperContext);
      if (dateText) metaParts.push(`<span class="moment-date">${escapeHTML(dateText)}</span>`);

      if (page.location) {
        metaParts.push(`<span class="moment-location">地点：${escapeHTML(page.location)}</span>`);
      }
      if (page.mood) {
        metaParts.push(`<span class="moment-mood">心情：${escapeHTML(page.mood)}</span>`);
      }

      const tags = normalizeArray(page.tags);
      const tagsHtml = tags.length
        ? `<span class="moment-tags">${tags.map((tag) => `<span class="moment-tag">#${escapeHTML(tag)}</span>`).join('')}</span>`
        : '';

      const metaHtml = `<div class="moment-meta">${metaParts.join('')}${tagsHtml}</div>`;
      const contentHtml = renderContent(page);

      const images = normalizeArray(page.images);
      const imagesHtml = images.length
        ? `<div class="moment-images">${images.map((src) => `<img src="${escapeHTML(src)}" alt="moment image" loading="lazy">`).join('')}</div>`
        : '';

      return {
        pinned,
        sortDate: hasDate ? page.date : (fallbackDate || page.updated || page.date),
        html: `<article class="moment-item${pinned ? ' is-pinned' : ''}">${metaHtml}<div class="moment-content markdown-body">${contentHtml}</div>${imagesHtml}</article>`
      };
    })
    .filter(Boolean);

  moments.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return getDateValue(b.sortDate) - getDateValue(a.sortDate);
  });

  const html = `<div class="moments-feed">${moments.map((item) => item.html).join('')}</div>`;

  return [
    {
      path: 'moments/index.html',
      layout: ['page'],
      data: {
        title: '动态',
        layout: 'page',
        comments: false,
        content: html
      }
    }
  ];
});
