chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'summarizeText',
      title: 'Summarize Text',
      contexts: ['selection']
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'summarizeText') {
      const selectedText = info.selectionText;
      chrome.tabs.sendMessage(tab.id, { action: 'summarize', selectedText });
    }
  });