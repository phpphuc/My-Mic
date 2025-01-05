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
