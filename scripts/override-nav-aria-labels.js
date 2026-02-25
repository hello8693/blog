hexo.extend.filter.register('after_render:html', (html) => {
  if (typeof html !== 'string') return html;

  return html
    .replace(/aria-label="Search"/g, 'aria-label="搜索"')
    .replace(/aria-label="Color Toggle"/g, 'aria-label="颜色切换"')
    .replace(/aria-label="Toggle navigation"/g, 'aria-label="切换导航"');
});
