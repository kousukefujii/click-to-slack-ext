(($) => {
  // 初期化
  let settings = {};
  const syncGet = () => {
    chrome.storage.sync.get(['token', 'channel', 'history'], (items) => {
      settings.token = items.token;
      settings.channel = items.channel;

      // フォームに注入
      $('input[name=token]').val(settings.token);
      $('input[name=channel]').val(settings.channel);

      // history
      const history = _.chain(items.history)
        .orderBy('timestamp', 'desc')
        .map((o) => {
          const date = new Date(o.timestamp * 1000);
          o.date = date.toLocaleString();
          return o;
        })
        .value();
      const compiled = _.template($('#history-template').html());
      history.forEach((h) => {
        $('.js-history-container').append(compiled({h: h}));
      });
    });
  };
  syncGet();

  // 保存
  $('.js-option-form').on('submit', (e) => {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    const settings = {};
    data.forEach((i) => {
      settings[i.name] = i.value;
    });
    chrome.storage.sync.set(settings);
  });

})(jQuery);
