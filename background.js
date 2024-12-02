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