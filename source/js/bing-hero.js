(() => {
  const banner = document.querySelector('#banner');
  if (!banner) return;

  const mkt = 'zh-CN';
  const api = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&uhd=1&mkt=${mkt}`;

  fetch(api)
    .then((res) => res.json())
    .then((data) => {
      const img = data && data.images && data.images[0];
      if (!img || !img.url) return;
      const url = img.url.startsWith('http') ? img.url : `https://www.bing.com${img.url}`;
      banner.style.backgroundImage = `url(${url})`;
      banner.setAttribute('data-bing-img', url);
    })
    .catch(() => {
      // 如果 CORS 或网络失败，保持默认背景图
    });
})();
