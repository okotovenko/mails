function initSliders() {
	if (document.querySelector('.slider__slider')) {
		new Swiper('.slider__slider', {
			observer: true,
			observeParents: true,
			slidesPerView: 1,
			spaceBetween: 30,
			autoHeight: true,
			speed: 500,
			loop: true,
			autoplay: {
				delay: 12000,
				disableOnInteraction: false,
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			navigation: {
				prevEl: '.swiper-button-prev',
				nextEl: '.swiper-button-next',
			},
			on: {
			}
		});
	}
}
window.addEventListener("load", function (e) {
	initSliders();
});