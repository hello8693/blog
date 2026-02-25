hexo.extend.filter.register('after_generate', () => {
  const removePrefixes = ['_moments/'];

  hexo.route.list().forEach((route) => {
    if (removePrefixes.some((prefix) => route.startsWith(prefix))) {
      hexo.route.remove(route);
    }
  });
});
