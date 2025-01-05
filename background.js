chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'insertText') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: insertTextToPage,
        args: [message.text]
      });
      // chrome.tabs.sendMessage(activeTab.id, { type: 'SEND_TEXT', text: request.text });
    });
  }
});

function insertTextToPage(text) {
  if (!window.location.href.match(/chrome-extension:/i)) {

    const textarea = document.activeElement;
    if (textarea && (textarea.tagName === 'TEXTAREA' || (textarea.tagName === 'INPUT' && textarea.type === 'text') || (textarea.tagName === 'DIV' && textarea.isContentEditable))) {
      // const startPos = textarea.selectionStart;
      // const endPos = textarea.selectionEnd;
      // textarea.setRangeText(text, startPos, endPos, 'end');
      if (textarea.tagName === 'DIV' && textarea.isContentEditable) {
        // For content editable div
        document.execCommand('insertText', false, text);
      } else {
        // For textarea and input
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        textarea.setRangeText(text, startPos, endPos, 'end');
      }
    } else {
      // alert('Hãy chọn một vùng nhập văn bản để chèn nội dung');
      showToast('Hãy chọn một vùng nhập văn bản để chèn nội dung');
    }
  }
  console.log('textarea', text);
}
chrome.action.onClicked.addListener(function (tab) {
  open_main_page()
})

function open_main_page() {
  chrome.tabs.create({ url: 'main.html', active: true, pinned: false }, function (tab) {
    console.log(tab)
    chrome.action.setBadgeText({ text: '...' })
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 1] })
    //console.log the tab has just been updated
    // chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    //     console.log(tabId);
    //     console.log(changeInfo);
    //     console.log(tab);
    // })
    chrome.tabs.update(tab.id, { autoDiscardable: false })
  })
}
