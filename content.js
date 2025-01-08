var tooltipRemovalTimeout;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // alert('list')
  if (message.interim_transcript) {
    // showToast(message.interim_transcript);
    if (document.hasFocus()) {
      let tooltip = document.getElementById("tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "fixed";
        tooltip.style.top = "10px";
        tooltip.style.right = "10px";
        tooltip.style.backgroundColor = "black";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.zIndex = "9999";
        document.body.appendChild(tooltip);
      }
      tooltip.innerText = message.interim_transcript;
    }
  }
});



// alert('listvdxcv')
function showToast(message) {
	const toast = document.createElement('div');
	toast.className = 'toast-message';
	toast.innerText = message;
	document.body.appendChild(toast);

	setTimeout(() => {
		toast.classList.add('show');
	}, 100);

	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => {
			document.body.removeChild(toast);
		}, 300);
	}, 3000);
}
