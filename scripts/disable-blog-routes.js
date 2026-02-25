hexo.extend.filter.register('after_generate', () => {
  const removePrefixes = ['tags/', 'categories/', 'archives/', 'blog/'];

  hexo.route.list().forEach((route) => {
    if (removePrefixes.some((prefix) => route.startsWith(prefix))) {
      hexo.route.remove(route);
    }
  });
});
