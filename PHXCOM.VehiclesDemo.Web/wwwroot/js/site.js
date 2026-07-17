// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
(function () {
	var tokenMeta = document.querySelector('meta[name="csrf-token"]');
	if (!tokenMeta || !window.jQuery) {
		return;
	}

	var csrfToken = tokenMeta.getAttribute("content");
	if (!csrfToken) {
		return;
	}

	$.ajaxSetup({
		headers: {
			"X-CSRF-TOKEN": csrfToken
		}
	});
})();
