(() => {
  // 初期化
  let settings = {};
  const syncGet = () => {
    chrome.storage.sync.get(['token', 'channel', 'history'], (items) => {
      settings = items;
    });
  };
  syncGet();

  // 履歴を追加
  const putHistory = (url, title) => {
    // 保存する履歴の数
    const historyItems = 200;

    if (!_.isArray(settings.history)) {
      settings.history = [];
    }

    settings.history.push({
      url: url,
      title: title,
      channel: settings.channel,
      timestamp: (Date.now() / 1000)
    });

    while (settings.history.length > historyItems) {
      settings.history.shift();
    }

    chrome.storage.sync.set(settings);
  };

  /**
   * 最近の履歴にurlが含まれているかどうかを返す
   */
  const currentHistoryIncludeUrl = (url) => {
    const threshold = 24 * 60 * 60;
    const now = Date.now() / 1000;
    let items = _.filter(settings.history, (h) => {
      // タイムスタンプがしきい値秒数以内だったらtrue
      if (h.url != url) {
        return false;
      }

      return (now - h.timestamp) < threshold;
    });

    return !!items.length;
  };

  /**
   * アクティブなタブのタイトルとURLを
   * Slackに流す
   */
  chrome.tabs.getSelected(null, (tab) => {
    const title = document.querySelector('.js-tab-title');
    const url = document.querySelector('.js-tab-url');

    const dup = currentHistoryIncludeUrl(tab.url);
    if (dup) {
      $('.js-post-withhold').show();
      return;
    }

    title.innerHTML=tab.title;
    url.innerHTML=tab.url;

    const data = {
      text: tab.title + ' ' + tab.url,
      token: settings.token,
      as_user: true,
      channel: settings.channel,
      unfurl_media: true
    };

    $.post(
      'https://slack.com/api/chat.postMessage',
      data
    ).done((res) => {
      if (!res.ok) {
        $('.js-post-error').show();
        return;
      }
      putHistory(tab.url, tab.title);
      $('.js-result').text(settings.channel + 'に共有しました').show();
    });
  });
})();
