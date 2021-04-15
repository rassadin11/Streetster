"use strict";

// ===== check mobile devices ========================================================================================================================================================

let isMobile = {
	Android: function() {return navigator.userAgent.match(/Android/i);},
	BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
	iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
	Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
	Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
	any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());}
};

// ===== /check mobile devices ========================================================================================================================================================

// ===== Animation on scroll ========================================================================================================================================================

/* @@include('animation-on-scroll.js */

// ===== Burger ========================================================================================================================================================

const burger = document.querySelector('.icon-menu');
const menuBody = document.querySelector('.menu_body');
const containerCart = document.querySelector('.main-item__container.cart');
const blurCart = document.querySelector('.blur.cart');
const headerFormCart = document.querySelector('.header-form.cart');

burger.addEventListener('click', () => {
	const menuList = document.querySelector('.menu__list');

	document.body.classList.toggle('hidden');
	
	menuList.classList.toggle('active');
	blurCart.classList.toggle('active');
	menuBody.classList.toggle('active');
	burger.classList.toggle('active');

	if (containerCart) {
		if (containerCart.classList.contains('active')) {
			setTimeout(() => {
				containerCart.classList.remove('active');
			}, 300)
		} else {
			containerCart.classList.add('active');
		}
	}


	if (headerFormCart.classList.contains('down')) {
		headerFormCart.classList.remove('down')
	}
}); 

// ===== Dinamic adaptive ========================================================================================================================================================

// Dynamic Adapt v. 1.1
// HTML data-da="where(uniq class name),position(digi),when(breakpoint)"
// e.x. data-da="item,2,992"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle
// copy from github 02.06.2020

// ===== recoding ========================================================================================================================================================

// Dynamic Adapt v. 1.2
// HTML data-da="where(uniq class name), position(digi), when(breakpoint), mobile first or computer first('min' or 'max'), when back (second breakpoint)"
// e.x. data-da="item, 2, 992, max, 768"
// Artyom Rassadin 2021
// My brains
// copy from my head 22.02.2021

// ===== /recoding ========================================================================================================================================================

"use strict";

(function () {
	let originalPositions = [];
	let daElements = document.querySelectorAll('[data-da]');
	let daElementsArray = [];
	let daMatchMedia = [];

	// Заполняем массивы
	if (daElements.length > 0) {
		let number = 0;
		for (let index = 0; index < daElements.length; index++) {
			const daElement = daElements[index];
			const daMove = daElement.getAttribute('data-da');

			if (daMove != '') {
				const daArray = daMove.split(','); // разбиваем массив
				const daPlace = daArray[1] ? daArray[1].trim() : 'last'; // место в какое по счету перемещаем
				const daBreakpoint = daArray[2] ? daArray[2].trim() : '767'; // на каком разрешении перемещаем
				const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
				const daSecondBreakpoint = daArray[4] ? daArray[4].trim() : '';

				const daDestination = document.querySelector('.' + daArray[0].trim()) // место куда перемещаем ( элемент в DOM-дереве )

				if (daArray.length > 0 && daDestination) {
					daElement.setAttribute('data-da-index', number);

					// Заполняем массив первоначальных позиций

					originalPositions[number] = {
						"parent": daElement.parentNode, // получаем родителя
						"index": indexInParent(daElement) // получаем индекс ЭТОГО элемента в элементе РОДИТЕЛЯ
					};

					// Заполняем массив элементов

					daElementsArray[number] = {
						"element": daElement,
						"destination": document.querySelector('.' + daArray[0].trim()),
						"place": daPlace,
						"breakpoint": daBreakpoint,
						"type": daType,
						"secondBreakpoint": daSecondBreakpoint,
					}

					number++;
				}
			}
		}

		dynamicAdaptSort(daElementsArray);

		// Создаем события в точке брейкпоинта

		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daBreakpoint = el.breakpoint;
			const daType = el.type;
			const daSecondBreakpoint = el.secondBreakpoint;
				
			daMatchMedia.push(window.matchMedia("(" + daType + "-width: " + daBreakpoint + "px) and (min-width: " + daSecondBreakpoint + "px)"));
			daMatchMedia[index].addListener(dynamicAdapt);
		}
	}

	// Основная функция
	
	function dynamicAdapt(e) {
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daElement = el.element; // сам элемент
			const daDestination = el.destination; // то куда перебрасываем элемент
			const daPlace = el.place; // место в какое по счету перемещаем
			const daBreakpoint = el.breakpoint; // на каком брейкпоинте перемещаем элемент
			const daSecondBreakpoint = el.secondBreakpoint;

			const daClassname = "_dynamic_adapt_" + daBreakpoint; // создание нейминга класса

			if (daMatchMedia[index].matches) {
				// Перебрасываем элементы
				if (!daElement.classList.contains(daClassname) && document.body.clientWidth > daSecondBreakpoint) {
					let actualIndex = indexOfElements(daDestination)[daPlace];

					if (daPlace === 'first') {
						actualIndex = indexOfElements(daDestination)[0];
					} else if (daPlace === 'last') {
						actualIndex = indexOfElements(daDestination)[indexOfElements(daDestination).length];
					}

					daDestination.insertBefore(daElement, daDestination.children[actualIndex]);
					daElement.classList.add(daClassname);
				}
			} else {
				// Возвращаем на место
				if (daElement.classList.contains(daClassname)) {
					dynamicAdaptBack(daElement);
					daElement.classList.remove(daClassname);
				}

				if (document.body.clientWidth <= daSecondBreakpoint || document.body.clientWidth > daBreakpoint) {
					dynamicAdaptBack(daElement);
				}
			}
		}

		customAdapt();
	}

	// Вызов основной функции

	dynamicAdapt();

	// Функция возврата на место

	function dynamicAdaptBack(el) {
		const daIndex = el.getAttribute('data-da-index');
		const originalPlace = originalPositions[daIndex]; // получаем расположение элемента 
		const parentPlace = originalPlace['parent']; // получаем родителя элемента
		const indexPlace = originalPlace['index']; // получаем индекс этого элемента в элементе родителя
		const actualIndex = indexOfElements(parentPlace, true)[indexPlace]; // определенный элемент из функции получения массива индексов элементов внутри родителя
		parentPlace.insertBefore(el, parentPlace.children[actualIndex]); // создаем новый элемент с каким-либо HTML-кодом
	}

	// Функция получения индекса внутри родителя

	function indexInParent(el) {
		let children = Array.prototype.slice.call(el.parentNode.children);
		return children.indexOf(el);
	}

	// Функция получения массива индексов элементов внутри родителя 

	function indexOfElements(parent, back) {
		const children = parent.children; // получение всех детей в виде коллекции
		const childrenArray = []; 

		for (let i = 0; i < children.length; i++) { // перебираем каждый из детей
			const childrenElement = children[i]; // получаем одного из детей из коллекции

			if (back) {
				childrenArray.push(i);
			} else {
				// Исключая перенесенный элемент

				if (childrenElement.getAttribute('data-da') == null) {
					childrenArray.push(i);
				}
			}
		}

		return childrenArray;
	}

	// Сортировка объекта

	function dynamicAdaptSort(arr) {
		arr.sort(function (a, b) {
			if (a.breakpoint > b.breakpoint) { return -1 } else { return 1 }
		});
		arr.sort(function (a, b) {
			if (a.place > b.place) { return 1 } else { return -1 }
		});
	}

	// Дополнительные сценарии адаптации

	function customAdapt() {
		// const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
}());; 

// ===== noUiSlider ===========================================================================================================================================================

// Подключать непосредственно выше этого файла в основом проекте

// ===== Slider ========================================================================================================================================================


// ===== categoryMainSwiper ========================================================================================================================================================

const categoryMainSwiper = new Swiper(".category-swiper", {
	loop: !0,
	centeredSlides: !0,

	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},

	autoplay: {
		delay:1e4,
		disableOnInteraction: !1,
	},

	slidesPerColumn: 1,
	breakpoints: {
		320: {
			slidesPerView: 1,
			spaceBetween: 20
		},
		767: {
			slidesPerView: 1.1,
			spaceBetween: 30
		},
		992: {
			slidesPerView: 1.5,
			spaceBetween: 40
		},
		1200: {
			slidesPerView: 1.94,
			spaceBetween: 70
		}
	},
});

// ===== /categoryMainSwiper ========================================================================================================================================================

// ===== newsSlider ========================================================================================================================================================

const newsSlider = new Swiper('.news-slider', {
	slidesPerView: 3,
	spaceBetween: 20,
	slidesPerGroup: 3,

	navigation: {
		nextEl: ".d-swiper-button-next",
		prevEl: ".d-swiper-button-prev"
	},

	breakpoints: {
		1400: {
			slidesPerGroup: 3,
		},
		992: {
			slidesPerView: 2,
			spaceBetween: 50,
			slidesPerGroup: 2,
		},
		768: {
			slidesPerView: 2,
			spaceBetween: 20,
			slidesPerGroup: 2,
		},
		550: {
			slidesPerView: 1,
			slidesPerGroup: 1,
		},
		320: {
			slidesPerView: 1.1,
			slidesPerGroup: 1,
		}
	},
});

// ===== /newsSlider ========================================================================================================================================================
;

// ===== Number animation with slow motion ========================================================================================================================================================

/* let animationTime = 1000; // ms
let numb = 150;
let step = 1;
let value = animationTime / numb / step;
let i = 0;
let number = 0;

function animation(num, elem) {
	let timeout = setTimeout(() => {
		if (num >= number) {
			if (i > numb / step - 15) { // замедление "15" нужно менять
				value += 10;
			}
			i++;

			elem.firstChild.innerHTML = number; // изменение числа
			number += step;
			animation(num, elem);
		} else if (num < number) {
			clearTimeout(timeout)
		}
	}, value)
}; */

// ===== Dropdown menu ========================================================================================================================================================

/* let body = document.querySelector('body');

// isMobile находится в start.js 

if (isMobile.any()) {
	
	body.classList.add('touch');
	let arrow=document.querySelectorAll('.arrow');

	for (i = 0; i < arrow.length; i++) {
		let thisLink=arrow[i].previousElementSibling;
		let subMenu=arrow[i].nextElementSibling;
		let thisArrow=arrow[i];

		thisLink.classList.add('parent');
		arrow[i].addEventListener('click', function(){
			subMenu.classList.toggle('open');
			thisArrow.classList.toggle('active');
		});
	}

} else {
	body.classList.add('mouse');
}; */;

// ===== header-form ========================================================================================================================================================

let headerInput = document.querySelector('.header-form');
let headerFormCard = document.querySelectorAll('.card-header');

if (document.body.clientWidth > 992) {
	headerInput.addEventListener('click', (e) => {
		headerInput.classList.toggle('focus');

		for (let elem of headerFormCard) {
			elem.classList.toggle('open')
		}
	})

	document.addEventListener('click', (event) => {
		if (!headerInput.contains(event.target) && headerInput.classList.contains('focus')) {
			headerInput.classList.remove('focus')

			for (let elem of headerFormCard) {
				elem.classList.remove('open')
			}
		}
	})
}

// ===== header-form-filters ========================================================================================================================================================

let headerFormInput = document.querySelector('.header-form__input');

headerFormInput.oninput = () => {
	let headerCardTitle = document.querySelectorAll('.card-header__title');

	if (headerCardTitle) {
		if (headerFormInput.value !== '') {
			for (let elem of headerCardTitle) {
				let splitElem = elem.innerHTML.split('');
					splitInput = headerFormInput.value.split('');
					i = 0;

				for (let value of splitInput) {
					for (let letter of splitElem) {
						if (letter.toLowerCase() === value.toLowerCase()) i++;
					}
				}

				if (i < splitInput.length) {
					elem.parentNode.classList.remove('open')
				}
			}

			let headerCardOpen = document.querySelectorAll('.card-header.open');

			if (headerCardOpen.length > 1) {
				for (let item of headerCardOpen) {
					item.style.borderRadius = '0';
					item.style.border = '1px solid #000000;';
				}

				headerCardOpen[headerCardOpen.length - 1].style.borderRadius = '0 0 15.5px 15.5px';
				headerCardOpen[headerCardOpen.length - 1].style.border = 'none';
			}
		}	
	} else {
		for (let elem of headerFormCard) {
			elem.classList.add('open')
		}

		let headerCardOpen = document.querySelectorAll('.card-header.open');

		for (let item of headerCardOpen) {
			item.style.borderRadius = '0';
			item.style.borderBottom = '1px solid #000000';
		}

		headerCardOpen[headerCardOpen.length - 1].style.borderRadius = '0 0 15.5px 15.5px';
		headerCardOpen[headerCardOpen.length - 1].style.border = 'none';
	}
}

// ===== header-form-search ========================================================================================================================================================

const headerFormSearch = document.querySelector('.header-form__icon');

if (headerFormSearch) {
	headerFormSearch.addEventListener('click', () => {
		let sectionHeader = document.querySelector('.section-header.second-page');

		if (sectionHeader) {
			if (!headerInput.classList.contains('down')) {
				setTimeout(() => {
					headerInput.classList.add('down');
				}, 300)
			} else {
				headerInput.classList.remove('down');
			}

			sectionHeader.classList.toggle('down')
		} else {
			headerInput.classList.toggle('down');
		}
	})
}

// ===== /header-form-search ========================================================================================================================================================

// ===== interest ========================================================================================================================================================

let interestArticle = document.querySelectorAll('.item-interest');

if (interestArticle) {
	for (let elem of interestArticle) {
		if (interestArticle[0] === elem) {
			continue;
		}
		
		elem.addEventListener('mouseover', () => {
			let interestArticleIcon = elem.querySelector('.item-interest__img');
			let interestArticleContent = elem.querySelector('.item-interest__content');

			interestArticleIcon.classList.add('hover');
			interestArticleContent.classList.add('hover');
		})

		elem.addEventListener('mouseout', () => {
			let interestArticleIcon = elem.querySelector('.item-interest__img');
			let interestArticleContent = elem.querySelector('.item-interest__content');

			interestArticleIcon.classList.remove('hover');
			interestArticleContent.classList.remove('hover');
		})
	}
}

let mainGridItem = document.querySelector('.main-grid-item');

if (mainGridItem) {
	mainGridItem.addEventListener("mouseover", () => {
		let mainGridTitle = mainGridItem.querySelector('.item-interest__title');
		let	mainGridParagraph = mainGridItem.querySelector('.item-interest__paragraph');

		mainGridTitle.classList.add('hover');
		mainGridParagraph.classList.add('hover');
	})

	mainGridItem.addEventListener("mouseout", () => {
		let mainGridTitle = mainGridItem.querySelector('.item-interest__title');
		let	mainGridParagraph = mainGridItem.querySelector('.item-interest__paragraph');

		mainGridTitle.classList.remove('hover');
		mainGridParagraph.classList.remove('hover');
	})
}

// ===== /interest ========================================================================================================================================================

// ===== bike-is ========================================================================================================================================================

let bikeIsItem = document.querySelectorAll('.item-bike-is');

if (bikeIsItem) {
	for (let elem of bikeIsItem) {
		elem.addEventListener('mouseover', () => {
			let bikeIsIcon = elem.querySelector('.item-bike-is__icon');

			bikeIsIcon.classList.add('hover')
		})

		elem.addEventListener('mouseout', () => {
			let bikeIsIcon = elem.querySelector('.item-bike-is__icon');

			bikeIsIcon.classList.remove('hover')
		})
	}
}

// ===== /bike-is ========================================================================================================================================================

// ===== ellipsis.js ========================================================================================================================================================

!function(){"use strict";function a(a){var c=k(b,a||{});this.create(c),this.add()}var b={ellipsis:"…",debounce:0,responsive:!0,className:".clamp",lines:2,portrait:null,break_word:!0},c=0,d=!!window.requestAnimationFrame,e=function(){return c+=1},f=function(a,b){a.setAttribute("data-ellipsis-id",b)},g=function(a){return a.getAttribute("data-ellipsis-id")},h=function(a,b){var c=e();f(b,c),a[c]=a[c]||{},a[c].element=b,a[c].innerHTML=b.innerHTML},i=function(a,b){return a?a[g(b)]:null},j=function(a){return Object.keys(a).map(function(b,c){return a[b].element})},k=function(a,b){var c={};for(var d in a)c[d]=a[d];for(var e in b)c[e]=b[e];return c};a.prototype={conf:{},prop:{},lines:{},temp:null,listener:null,create:function(a){if(this.conf=a,this.lines={get current(){return a.portrait&&window.innerHeight>window.innerWidth?a.portrait:a.lines}},this.conf.responsive){this.temp={};var b,c=this.conf.debounce;if(d&&!c){this._isScheduled=!1;var e=this;b=function(a){e._isScheduled||(e._isScheduled=!0,window.requestAnimationFrame(function(){e._isScheduled=!1,e.add(j(e.temp))}))}}else{c=c||16;var f;b=function(a){clearTimeout(f),f=setTimeout(function(){this.add(j(this.temp))}.bind(this),c)}}this.listener=b.bind(this),window.addEventListener("resize",this.listener,!1),window.removeEventListener("beforeunload",this.listener,!1)}},destroy:function(){this.listener&&window.removeEventListener("resize",this.listener,!1)},createProp:function(a){this.prop={get height(){var b=a.getBoundingClientRect();return parseInt(b.bottom-b.top,10)},get lineheight(){var b=getComputedStyle(a).getPropertyValue("line-height");return String("normal|initial|inherit").indexOf(b)>-1&&(b=parseInt(getComputedStyle(a).getPropertyValue("font-size"),10)+2),parseInt(b,10)}}},add:function(a){if(!a&&this.conf.className&&(a=document.querySelectorAll(this.conf.className)),a)if(a.length)for(var b=0;b<a.length;b++)this.addElement(a[b]);else void 0===a.length&&this.addElement(a)},addElement:function(a){if(this.conf.responsive){var b=i(this.temp,a);b?a.innerHTML!==b.innerHTML&&(a.innerHTML=b.innerHTML):h(this.temp,a)}this.createProp(a),this.isNotCorrect()&&(a.childNodes.length&&a.childNodes.length>1?this.handleChildren(a):a.childNodes.length&&1===a.childNodes.length&&3===a.childNodes[0].nodeType&&this.simpleText(a))},breakWord:function(a,b,c){var d=a.split(" ");if(d.pop(),c&&d.pop(),!b)return d[d.length-1]&&(d[d.length-1]=d[d.length-1].replace(/(,$)/g,"").replace(/(\.$)/g,"")),d.push(this.conf.ellipsis),d.join(" ");if(d[d.length-1])return d[d.length-1]=d[d.length-1].replace(/(,$)/g,"").replace(/(\.$)/g,""),d.push(this.conf.ellipsis),[d.join(" "),b];if(!d[d.length-1]&&b){var e=" "+b.trim().replace(/(,$)/g,"").replace(/(\.$)/g,"")+" ";return d.push(this.conf.ellipsis),[d.join(" "),e]}},simpleText:function(a){for(var b=a.childNodes[0].nodeValue;this.prop.height>this.prop.lineheight*this.lines.current;)a.childNodes[0].nodeValue=b.slice(0,-1),b=a.childNodes[0].nodeValue;this.conf.break_word?(a.childNodes[0].nodeValue=b.slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis,this.isNotCorrect()&&(a.childNodes[0].nodeValue=" "+a.childNodes[0].nodeValue.slice(0,-(this.conf.ellipsis.length+1)).trim().slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis)):(a.childNodes[0].nodeValue=this.breakWord(a.childNodes[0].nodeValue),this.isNotCorrect()&&(a.childNodes[0].nodeValue=this.breakWord(a.childNodes[0].nodeValue,null,!0)))},isNotCorrect:function(){return this.prop.height>this.prop.lineheight*this.lines.current},processBreak:function(a,b,c){var d=this.breakWord(a.innerText||a.nodeValue,b.innerText||b.nodeValue,c);a.innerText?a.innerText=d[0]:a.nodeValue=d[0],b.innerText?b.innerText=d[1]:b.nodeValue=d[1]},handleChildren:function(a){for(var b,c=a.childNodes,d=c.length-1;d>=0;d--){var e;if(8!==c[d].nodeType){if(3===c[d].nodeType?(e=c[d].nodeValue,c[d].nodeValue=""):(e=getComputedStyle(c[d]).getPropertyValue("display"),c[d].style.display="none"),this.prop.height<=this.prop.lineheight*this.lines.current){if(3===c[d].nodeType){for(c[d].nodeValue=e,b=c[d].nodeValue;this.prop.height>this.prop.lineheight*this.lines.current;)c[d].nodeValue=b.slice(0,-1),b=c[d].nodeValue;if(this.conf.break_word){if(c[d].nodeValue=b.slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis,this.isNotCorrect()){if(c[d].nodeValue=" "+c[d].nodeValue.slice(0,-this.conf.ellipsis.length).trim().slice(0,-this.conf.ellipsis.length),!(c[d].nodeValue.length>1))continue;c[d].nodeValue=c[d].nodeValue.slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis}}else{if(!c[d].innerText&&!c[d].nodeValue)continue;if(this.processBreak(c[d],c[d-1]),this.isNotCorrect()&&(this.processBreak(c[d],c[d-1],!0),this.isNotCorrect())){a.removeChild(c[d]);continue}}}else{for(c[d].style.display=e,b=c[d].innerText;this.prop.height>this.prop.lineheight*this.lines.current;)c[d].innerText=b.slice(0,-1),b=c[d].innerText;if(this.conf.break_word){if(c[d].innerText=b.slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis,this.isNotCorrect()){if(c[d].innerText=" "+c[d].innerText.slice(0,-this.conf.ellipsis.length).trim().slice(0,-this.conf.ellipsis.length),!(c[d].innerText.length>1))continue;c[d].innerText=c[d].innerText.slice(0,-this.conf.ellipsis.length)+this.conf.ellipsis}}else{if(!c[d].innerText&&!c[d].nodeValue)continue;if(this.processBreak(c[d],c[d-1]),this.isNotCorrect()&&(this.processBreak(c[d],c[d-1],!0),this.isNotCorrect())){a.removeChild(c[d]);continue}}}break}a.removeChild(c[d])}}}};var l=function(b){return new a(b)};"function"==typeof define&&define.amd&&define("ellipsis",[],function(){return l}),self.Ellipsis=l}();

Ellipsis({
  className: '.clamp',
  lines: 3,
});

// ===== /ellipsis.js ========================================================================================================================================================

// ===== accordeon-footer ========================================================================================================================================================

let footerTitle = document.querySelectorAll('.ul-footer__title');

if (document.body.clientWidth < 992) {
	for (let elem of footerTitle) {
		elem.addEventListener('click', () => {
			let accordeonUl = elem.nextElementSibling;

			elem.classList.toggle('active')
			accordeonUl.classList.toggle('active')
		})
	}
}

// ===== menu-body ========================================================================================================================================================

let menuBodyWidth = document.querySelector('.main-item__background.modify');
let headerBlockCart = document.querySelector('.header-block.cart');

let div = document.createElement('div');

div.style.overflowY = 'scroll';
div.style.width = '50px';
div.style.height = '50px';

document.body.append(div);

let scrollWidth = div.offsetWidth - div.clientWidth;

div.remove();

if (menuBodyWidth) {
	if (!isMobile.any()) {
		if (document.body.clientWidth > 1440) {
			document.body.classList.add('active')
		}

		menuBody.style.width = document.body.clientWidth - menuBodyWidth.getBoundingClientRect().left - menuBodyWidth.clientWidth + 'px';
	} else {
		menuBody.style.width = '100vw';	
	}
} else {
	if (!isMobile.any()) {
		menuBody.style.width = '35vw';
	} else {
		menuBody.style.width = '100vw';
	}


	if (document.body.clientWidth > 1440) {
		document.body.classList.add('active')
	}
}


// ===== /menu-body ========================================================================================================================================================

// ===== blur ========================================================================================================================================================

blurCart.style.width = document.body.clientWidth + 'px';

// ===== /blur ========================================================================================================================================================

// ===== fullscreen article ========================================================================================================================================================

let fullscreenArticle = document.querySelector('.news-article__fullscreen');

if (fullscreenArticle) {
	if (document.body.clientWidth > 768) {
		const fullscreenContent = fullscreenArticle.querySelector('.news-article-wrapper');
		const fullscreenIcon = fullscreenArticle.querySelector('.fullscreen-article__icon');

		fullscreenIcon.style.height = fullscreenContent.clientHeight + 'px';
	}
}

// ===== /fullscreen article ========================================================================================================================================================

window.onresize = () => {
	if (document.body.clientWidth < 992) {
		for (let elem of footerTitle) {
			elem.addEventListener('click', () => {
				let accordeonUl = elem.nextElementSibling;

				elem.classList.toggle('active')
				accordeonUl.classList.toggle('active')
			})
		}
	}

	// ===== menu-body ========================================================================================================================================================

	if (menuBodyWidth) {
		if (!isMobile.any()) {
			if (document.body.clientWidth > 1440) {
				document.body.classList.add('active')
			}

			menuBody.style.width = document.body.clientWidth - menuBodyWidth.getBoundingClientRect().left - menuBodyWidth.clientWidth + 'px';
		} else {
			menuBody.style.width = '100vw';	
		}
	} else {
		if (!isMobile.any()) {
			menuBody.style.width = '35vw';
		} else {
			menuBody.style.width = '100vw';
		}


		if (document.body.clientWidth > 1440) {
			document.body.classList.add('active')
		}
	}
	// ===== /menu-body ========================================================================================================================================================

	// ===== blur ========================================================================================================================================================

	blurCart.style.width = document.body.clientWidth + 'px';

	// ===== /blur ========================================================================================================================================================

	if (fullscreenArticle) {
		if (document.body.clientWidth > 768) {
			const fullscreenContent = fullscreenArticle.querySelector('.news-article-wrapper');
			const fullscreenIcon = fullscreenArticle.querySelector('.fullscreen-article__icon');

			fullscreenIcon.style.height = fullscreenContent.clientHeight + 'px';
		}
	}
}

// ===== /accordeon-footer ========================================================================================================================================================

// ===== offroad-section ========================================================================================================================================================

const offroadSectionSlider = new Swiper('.main-slider-swiper', {
	slidesPerView: 1,

	navigation: {
		prevEl: '.main-slider-swiper-arrow-prev',
		nextEl: '.main-slider-swiper-arrow-next',
	},

	pagination: {
      el: '.a-swiper-pagination',
    },
    grabCursor: true,

    breakpoint: {
    	992: {
    		slidesPerView: 1,
    	}, 
    	320: {
    		slidesPerView: 'auto',
    	}
    }
})

// ===== /offroad-section ========================================================================================================================================================

// ===== cart ========================================================================================================================================================

let nameItemMainColor = document.querySelectorAll('.name-item-main__color.cart');

if (nameItemMainColor) {
	for (let elem of nameItemMainColor) {
		elem.addEventListener('click', () => {
			for (let item of nameItemMainColor) {
				if (item.classList.contains('active')) {
					item.classList.remove('active');
				}
			}
			
			let nameItemMainSpan = document.querySelector('.name-item-main__colors.color > span');
			
			nameItemMainSpan.classList.add('active');

			nameItemMainSpan.innerHTML = elem.dataset.color;

			elem.classList.toggle('active')
		})
	}
}

let minus = document.querySelectorAll('.accessories-cart__item');

if (minus) {
	for (let elem of minus) {
		if (elem.innerHTML == '-') {
			elem.classList.add('other')
		}
	}
}

// ===== /cart ========================================================================================================================================================