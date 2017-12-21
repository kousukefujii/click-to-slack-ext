(() => {
  // 初期化
  let settings = {};
  const syncGet = () => {
    chrome.storage.sync.get(['token', 'channel', 'history'], (items) => {
      settings = items;
    });
  };
  syncGet();

  const putHistory = (url, title) => {
    if (!_.isArray(settings.history)) {
      settings.history = [];
    }

    settings.history.push({
      url: url,
      title: title,
      channel: settings.channel,
      timestamp: (Date.now() / 1000)
    });
    chrome.storage.sync.set(settings);
  };

  chrome.tabs.getSelected(null, (tab) => {
    const title = document.querySelector('.js-tab-title');
    const url = document.querySelector('.js-tab-url');

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
    ).done(() => {
      putHistory(tab.url, tab.title);
    });
  });
})();
