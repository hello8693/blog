hexo.extend.filter.register('before_generate', () => {
  const i18n = hexo.theme && hexo.theme.i18n;
  if (!i18n || typeof i18n.get !== 'function' || typeof i18n.set !== 'function') {
    return;
  }

  const current = i18n.get('zh-CN') || {};
  i18n.set('zh-CN', {
    ...current,
    noscript_warning: '站点在允许 JavaScript 运行的环境下浏览效果更佳'
  });
});
