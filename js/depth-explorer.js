/* ==================================================================
   VIETNAM OCEAN EXPLORER - main.js
   ------------------------------------------------------------------
   GIAI ĐOẠN 1 — HOÀN THIỆN JAVASCRIPT
   (không sửa HTML/CSS ở giai đoạn này — mọi phần tử JS cần mà HTML
   hiện chưa có đều được kiểm tra null trước, nên trang vẫn chạy
   bình thường; các hiệu ứng liên quan sẽ tự "sống dậy" khi HTML/CSS
   được bổ sung ở Giai đoạn 2 và 3.)

   Phong cách: querySelector/All, for truyền thống, addEventListener,
   classList, localStorage + JSON.parse/stringify — theo Chapter 5-6
   (Jon Duckett).
   ================================================================== */


/* ==================================================================
   TIỆN ÍCH DÙNG CHUNG
   ================================================================== */

// Trì hoãn việc gọi hàm cho tới khi người dùng ngừng thao tác 1 khoảng
// thời gian ngắn — dùng cho sự kiện "resize" để tránh gọi hàm dồn dập
function debounce(callback, delayMs) {
    var timeoutId = null;

    return function () {
        var context = this;
        var args = arguments;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(function () {
            callback.apply(context, args);
        }, delayMs);
    };
}


/* ==================================================================
   1. RESPONSIVE NAVIGATION (Mobile Menu)
   ------------------------------------------------------------------
   - Nút hamburger (.header__hamburger) chỉ hiển thị dưới 1024px.
   - Các mục menu (trừ "Trang chủ") đang bị ẩn trên mobile bằng
     class có sẵn ".horizontal-nav__item--hide--mobile" — chỉ
     remove/add đúng class có sẵn đó, không tạo class mới.
   - Bổ sung: aria-expanded (Accessibility), phím Escape (Keyboard
     Event), và Event Delegation khi đóng menu lúc chọn 1 mục.
   ================================================================== */
function initMenu() {

    var hamburgerButton = document.querySelector('.header__hamburger');
    var headerNavForm = document.querySelector('.header-nav-form');
    var navList = document.querySelector('.horizontal-nav__list');

    if (hamburgerButton === null || headerNavForm === null) {
        return;
    }

    var hamburgerIcon = hamburgerButton.querySelector('i');

    // Lưu lại các mục menu đang bị ẩn trên mobile thành 1 mảng thường
    var hiddenItemsList = document.querySelectorAll('.horizontal-nav__item--hide--mobile');
    var hiddenNavItems = [];

    for (var i = 0; i < hiddenItemsList.length; i++) {
        hiddenNavItems.push(hiddenItemsList[i]);
    }

    var isMenuOpen = false;

    // Trạng thái ban đầu cho công nghệ hỗ trợ (screen reader)
    hamburgerButton.setAttribute('aria-expanded', 'false');

    function openMenu() {
        for (var i = 0; i < hiddenNavItems.length; i++) {
            hiddenNavItems[i].classList.remove('horizontal-nav__item--hide--mobile');
        }

        if (hamburgerIcon !== null) {
            hamburgerIcon.classList.remove('fa-bars');
            hamburgerIcon.classList.add('fa-times');
        }

        hamburgerButton.setAttribute('aria-expanded', 'true');
        isMenuOpen = true;
    }

    function closeMenu() {
        for (var i = 0; i < hiddenNavItems.length; i++) {
            hiddenNavItems[i].classList.add('horizontal-nav__item--hide--mobile');
        }

        if (hamburgerIcon !== null) {
            hamburgerIcon.classList.remove('fa-times');
            hamburgerIcon.classList.add('fa-bars');
        }

        hamburgerButton.setAttribute('aria-expanded', 'false');
        isMenuOpen = false;
    }

    hamburgerButton.addEventListener('click', function (event) {
        event.stopPropagation();

        if (isMenuOpen === true) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Bấm ra ngoài khu vực menu thì tự đóng
    document.addEventListener('click', function (event) {
        if (isMenuOpen === true && headerNavForm.contains(event.target) === false) {
            closeMenu();
        }
    });

    // Phím Escape đóng menu nhanh (Keyboard Event)
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isMenuOpen === true) {
            closeMenu();
        }
    });

    // EVENT DELEGATION: 1 listener duy nhất trên cả danh sách menu,
    // thay vì gắn riêng cho từng thẻ <a> như trước
    if (navList !== null) {
        navList.addEventListener('click', function (event) {
            if (event.target.classList.contains('horizontal-nav__link')) {
                closeMenu();
            }
        });
    }
}


/* ==================================================================
   1b. MOBILE SEARCH TOGGLE
   ------------------------------------------------------------------
   Nút kính lúp (.header__search-toggle) chỉ hiện dưới 768px, dùng
   để bật/tắt ô input tìm kiếm (mặc định ẩn ở mobile trong CSS).
   ================================================================== */
function initMobileSearchToggle() {

    var searchToggleButton = document.querySelector('.header__search-toggle');
    var searchInput = document.querySelector('.form-search__input');

    if (searchToggleButton === null || searchInput === null) {
        return;
    }

    searchToggleButton.addEventListener('click', function (event) {
        event.stopPropagation();

        if (searchInput.style.display === 'block') {
            searchInput.style.display = 'none';
        } else {
            searchInput.style.display = 'block';
            searchInput.focus();
        }

        searchToggleButton.setAttribute(
            'aria-expanded',
            searchInput.style.display === 'block' ? 'true' : 'false'
        );
    });
}


/* ==================================================================
   2. SEARCH
   ------------------------------------------------------------------
   Tìm từ khóa trong các khối nội dung chính, cuộn mượt tới kết quả
   đầu tiên và highlight tạm thời 2 giây. Không tìm thấy thì hiện
   thông báo nhỏ góc màn hình.
   Bổ sung: keyup (Escape để xóa nhanh từ khóa) — Input/Keyboard Event.
   ================================================================== */

// Các vùng nội dung sẽ được tìm kiếm bên trong
var SEARCHABLE_SELECTOR =
    '.depth-card__title, ' +
    '.depth-card__description, ' +
    '.depth-card__info-item, ' +
    '.ocean-news__heading, ' +
    '.ocean-news__description, ' +
    '.ocean-statistics__card-description, ' +
    '.ocean-explore__description';

function initSearch() {

    var searchForm = document.querySelector('.form-search');

    // Ưu tiên getElementById nếu HTML đã có id (bổ sung ở Giai đoạn 2),
    // nếu chưa thì lấy tạm theo class để JS vẫn chạy đúng ngay từ bây giờ
    var searchInput = document.getElementById('siteSearchInput');

    if (searchInput === null) {
        searchInput = document.querySelector('.form-search__input');
    }

    if (searchForm === null || searchInput === null) {
        return;
    }

    // "submit" bắt được cả khi bấm nút Search LẪN khi nhấn Enter
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        performSearch(searchInput.value);
    });

    // Phím Escape trong ô tìm kiếm: xóa nhanh nội dung đang gõ (keyup)
    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
        }
    });
}

// Thực hiện tìm kiếm theo từ khóa
function performSearch(keyword) {

    var trimmedKeyword = keyword.trim();

    if (trimmedKeyword === '') {
        return;
    }

    var lowerKeyword = trimmedKeyword.toLowerCase();
    var searchableElements = document.querySelectorAll(SEARCHABLE_SELECTOR);
    var foundElement = null;

    for (var i = 0; i < searchableElements.length; i++) {
        var elementText = searchableElements[i].textContent.toLowerCase();

        if (elementText.indexOf(lowerKeyword) !== -1) {
            foundElement = searchableElements[i];
            break; // chỉ lấy kết quả xuất hiện đầu tiên
        }
    }

    if (foundElement !== null) {
        scrollToElement(foundElement);
        highlightElementTemporarily(foundElement);
    } else {
        showToastMessage('Không tìm thấy kết quả cho "' + trimmedKeyword + '"');
    }
}

// Tô sáng tạm thời 1 phần tử trong 2 giây rồi tự trở lại bình thường
function highlightElementTemporarily(element) {

    element.style.transition = 'background-color .3s ease, box-shadow .3s ease';
    element.style.backgroundColor = 'rgba(32,196,244,.35)';
    element.style.boxShadow = '0 0 0 3px rgba(32,196,244,.6)';

    setTimeout(function () {
        element.style.backgroundColor = '';
        element.style.boxShadow = '';
    }, 2000);
}

// Tạo 1 thông báo nhỏ nổi góc màn hình, tự biến mất sau vài giây
function showToastMessage(message) {

    var oldToast = document.querySelector('.js-toast-message');

    if (oldToast !== null) {
        oldToast.parentNode.removeChild(oldToast);
    }

    var toast = document.createElement('div');
    toast.className = 'js-toast-message';
    toast.textContent = message;

    // Style tối giản gán trực tiếp bằng JS (Giai đoạn 1 chưa đụng CSS)
    toast.style.position = 'fixed';
    toast.style.top = '90px';
    toast.style.right = '20px';
    toast.style.padding = '12px 20px';
    toast.style.background = 'rgba(8,40,63,.95)';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid rgba(255,255,255,.2)';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '2000';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,.35)';

    document.body.appendChild(toast);

    setTimeout(function () {
        if (toast.parentNode !== null) {
            toast.parentNode.removeChild(toast);
        }
    }, 2500);
}


/* ==================================================================
   SMOOTH SCROLL (dùng chung cho menu neo và Search ở trên)
   ------------------------------------------------------------------
   Header đang position:sticky (72px) nên cần trừ hao chiều cao header
   khi cuộn tới, tránh bị che mất phần đầu nội dung.
   Bổ sung: chuyển từ gắn listener riêng từng thẻ <a> sang Event
   Delegation (1 listener duy nhất trên document).
   ================================================================== */
function scrollToElement(targetElement) {

    var headerElement = document.querySelector('.header');
    var headerHeight = 0;

    if (headerElement !== null) {
        headerHeight = headerElement.offsetHeight;
    }

    var elementTop = targetElement.getBoundingClientRect().top;
    var currentScroll = window.pageYOffset;
    var targetPosition = elementTop + currentScroll - headerHeight - 16;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function initSmoothScroll() {

    // EVENT DELEGATION: bắt sự kiện click từ document, kiểm tra xem
    // phần tử được bấm (hoặc cha gần nhất của nó) có phải liên kết
    // neo (href bắt đầu bằng "#") hay không
    document.addEventListener('click', function (event) {

        var clickedLink = event.target.closest('a[href^="#"]');

        if (clickedLink === null) {
            return;
        }

        var targetId = clickedLink.getAttribute('href');

        // Bỏ qua liên kết "#" trống (chưa có trang đích thật, ví dụ ở footer)
        if (targetId === null || targetId === '#') {
            return;
        }

        var targetElement = document.querySelector(targetId);

        if (targetElement !== null) {
            event.preventDefault();
            scrollToElement(targetElement);
        }
    });
}


/* ==================================================================
   3. SIDEBAR ScrollSpy (Depth Navigation)
   ------------------------------------------------------------------
   Các .depth-card dùng position:sticky nên thẻ nào "đang nằm ngay
   dưới header" mới thật sự là thẻ người dùng đang xem -> dùng scroll
   event + getBoundingClientRect (chính xác hơn IntersectionObserver
   trong trường hợp sticky-stacking này).
   ================================================================== */
function initSidebarDepthNav() {

    var contentSection = document.querySelector('.ocean-explore__content');

    // Dùng getElementsByClassName (Chapter 5) — chỉ đọc 1 lần rồi
    // chuyển ngay sang mảng thường nên an toàn dù đây là live collection
    var depthCardsList = document.getElementsByClassName('depth-card');
    var navItemsList = document.querySelectorAll('.depth-nav__item');
    var navList = document.querySelector('.depth-nav__list');
    var headerElement = document.querySelector('.header');

    if (contentSection === null || depthCardsList.length === 0 || navItemsList.length === 0) {
        return;
    }

    var depthCards = [];
    for (var i = 0; i < depthCardsList.length; i++) {
        depthCards.push(depthCardsList[i]);
    }

    var navItems = [];
    for (var j = 0; j < navItemsList.length; j++) {
        navItems.push(navItemsList[j]);
    }

    var headerHeight = (headerElement !== null) ? headerElement.offsetHeight : 0;
    var triggerOffset = headerHeight + 40; // đường "mốc" gần sát dưới header

    function updateActiveDepthCard() {

        var activeIndex = -1;

        for (var i = 0; i < depthCards.length; i++) {
            var rect = depthCards[i].getBoundingClientRect();

            if (rect.top <= triggerOffset && rect.bottom > triggerOffset) {
                activeIndex = i;
            }
        }

        // Đã cuộn qua khỏi thẻ cuối cùng -> giữ trạng thái active ở thẻ cuối
        if (activeIndex === -1 && depthCards.length > 0) {
            var lastCardRect = depthCards[depthCards.length - 1].getBoundingClientRect();

            if (lastCardRect.bottom <= triggerOffset) {
                activeIndex = depthCards.length - 1;
            }
        }

        for (var k = 0; k < navItems.length; k++) {
            navItems[k].classList.remove('is-active');
            navItems[k].classList.remove('is-visited');

            if (k < activeIndex) {
                navItems[k].classList.add('is-visited');
            } else if (k === activeIndex) {
                navItems[k].classList.add('is-active');
            }
        }

        updateScrollProgress();
    }

    function updateScrollProgress() {

        if (navList === null) {
            return;
        }

        var contentRect = contentSection.getBoundingClientRect();
        var scrollableDistance = contentSection.offsetHeight - window.innerHeight;

        if (scrollableDistance <= 0) {
            navList.style.setProperty('--progress', 0);
            return;
        }

        var scrolledDistance = 0 - contentRect.top;
        var progress = scrolledDistance / scrollableDistance;

        if (progress < 0) {
            progress = 0;
        }

        if (progress > 1) {
            progress = 1;
        }

        navList.style.setProperty('--progress', progress);
    }

    var isUpdateScheduled = false;

    window.addEventListener('scroll', function () {
        if (isUpdateScheduled === false) {
            isUpdateScheduled = true;

            requestAnimationFrame(function () {
                updateActiveDepthCard();
                isUpdateScheduled = false;
            });
        }
    });

    updateActiveDepthCard();
}


/* ==================================================================
   HEADER SCROLL EFFECT
   ------------------------------------------------------------------
   Thêm class "header--scrolled" (đã có sẵn style trong CSS) khi cuộn
   xuống quá 1 ngưỡng. Bổ sung: ẩn header khi cuộn nhanh xuống, hiện
   lại khi cuộn lên — dùng transform (header đã có sẵn transition:all
   nên hiệu ứng tự mượt mà không cần thêm CSS). Có throttle bằng
   requestAnimationFrame để không giật khi cuộn nhanh.
   ================================================================== */
function initHeaderScrollEffect() {

    var headerElement = document.querySelector('.header');

    if (headerElement === null) {
        return;
    }

    var scrollThreshold = 40;
    var lastScrollY = window.scrollY;
    var isTicking = false;

    function updateHeaderState() {

        var currentScrollY = window.scrollY;

        if (currentScrollY > scrollThreshold) {
            headerElement.classList.add('header--scrolled');
        } else {
            headerElement.classList.remove('header--scrolled');
        }

        // Cuộn xuống nhanh và đã qua khỏi chiều cao header -> ẩn header
        if (currentScrollY > lastScrollY && currentScrollY > headerElement.offsetHeight) {
            headerElement.style.transform = 'translateY(-100%)';
        } else {
            headerElement.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', function () {
        if (isTicking === false) {
            isTicking = true;

            requestAnimationFrame(function () {
                updateHeaderState();
                isTicking = false;
            });
        }
    });
}


/* ==================================================================
   STATISTICS COUNTER
   ------------------------------------------------------------------
   Đếm số từ 0 lên giá trị thật khi thẻ thống kê xuất hiện trong màn
   hình. Đọc giá trị đích qua thuộc tính "data-target" trên
   .ocean-statistics__card-title.

   LƯU Ý: HTML hiện tại CHƯA có data-target (số liệu đang là chữ tĩnh
   như "12,000+", "5,4 tỷ"...) nên hàm này sẽ tạm thời BỎ QUA từng
   thẻ chưa có data-target — không có gì bị lỗi hay vỡ giao diện, số
   liệu tĩnh vẫn hiển thị bình thường. Hiệu ứng đếm sẽ tự hoạt động
   ngay khi Giai đoạn 2 bổ sung data-target vào HTML.
   ================================================================== */
function initStatisticsCounter() {

    var statCards = document.querySelectorAll('.ocean-statistics__card');

    if (statCards.length === 0) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        return; // trình duyệt cũ: bỏ qua hiệu ứng, số liệu tĩnh vẫn hiển thị đúng
    }

    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                animateCounter(entries[i].target);
                observer.unobserve(entries[i].target);
            }
        }
    }, { threshold: 0.4 });

    for (var i = 0; i < statCards.length; i++) {
        observer.observe(statCards[i]);
    }
}

// Chạy hiệu ứng đếm số cho 1 thẻ thống kê
function animateCounter(cardElement) {

    var titleElement = cardElement.querySelector('.ocean-statistics__card-title');

    if (titleElement === null) {
        return;
    }

    var targetValue = titleElement.getAttribute('data-target');

    // Chưa có data-target (chưa tới Giai đoạn 2) -> giữ nguyên số tĩnh, không làm gì thêm
    if (targetValue === null) {
        return;
    }

    var targetNumber = parseInt(targetValue, 10);

    if (isNaN(targetNumber)) {
        return;
    }

    var suffix = titleElement.getAttribute('data-suffix');

    if (suffix === null) {
        suffix = '';
    }

    var durationMs = 1500;
    var startTime = null;

    function step(timestamp) {

        if (startTime === null) {
            startTime = timestamp;
        }

        var elapsed = timestamp - startTime;
        var progress = elapsed / durationMs;

        if (progress > 1) {
            progress = 1;
        }

        var currentValue = Math.floor(progress * targetNumber);
        titleElement.textContent = currentValue.toLocaleString('vi-VN') + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            titleElement.textContent = targetNumber.toLocaleString('vi-VN') + suffix;
        }
    }

    requestAnimationFrame(step);
}


/* ==================================================================
   FADE ANIMATION (Article / Statistics / News)
   ------------------------------------------------------------------
   Thêm class "is-visible" khi phần tử cuộn vào màn hình. Class này
   CHƯA có style trong CSS ở Giai đoạn 1 nên hiện tại việc thêm class
   không gây ra hiệu ứng gì (và cũng không làm ẩn nội dung — phần tử
   vẫn hiển thị bình thường như cũ). Hiệu ứng mờ dần sẽ "sống dậy"
   ngay khi Giai đoạn 3 bổ sung CSS cho ".is-visible".
   ================================================================== */
function initFadeInEffects() {

    var fadeSelector = '.depth-card__info-item, .ocean-statistics__card, .ocean-news__card';
    var fadeElementsList = document.querySelectorAll(fadeSelector);

    if (fadeElementsList.length === 0) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        for (var i = 0; i < fadeElementsList.length; i++) {
            fadeElementsList[i].classList.add('is-visible');
        }
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.classList.add('is-visible');
                observer.unobserve(entries[i].target);
            }
        }
    }, { threshold: 0.15 });

    for (var j = 0; j < fadeElementsList.length; j++) {

        var element = fadeElementsList[j];

        // So le thời gian hiện theo thứ tự trong danh sách anh/chị/em,
        // đếm bằng previousElementSibling (DOM traversal - Chapter 5)
        var siblingIndex = 0;
        var sibling = element.previousElementSibling;

        while (sibling !== null) {
            siblingIndex = siblingIndex + 1;
            sibling = sibling.previousElementSibling;
        }

        element.style.transitionDelay = (siblingIndex * 70) + 'ms';

        observer.observe(element);
    }
}


/* ==================================================================
   4. NEWS SLIDER
   ------------------------------------------------------------------
   Chuyển .ocean-news__list từ CSS Grid tĩnh sang hàng ngang trượt
   được bằng inline style (Giai đoạn 1 chưa đụng CSS). Bổ sung so với
   bản trước: dot indicator (nếu HTML đã có vùng chứa .ocean-news__dots
   — nếu chưa có thì bỏ qua, không lỗi), autoplay có dừng khi rê chuột,
   điều khiển bằng phím mũi tên trái/phải, và debounce cho "resize".
   ================================================================== */
function initNewsSlider() {

    var newsList = document.querySelector('.ocean-news__list');
    var prevButton = document.querySelector('.ocean-news__button--prev');
    var nextButton = document.querySelector('.ocean-news__button--next');
    var dotsContainer = document.querySelector('.ocean-news__dots');

    if (newsList === null || prevButton === null || nextButton === null) {
        return;
    }

    // Dùng "children" (Chapter 5) để lấy trực tiếp các thẻ tin con
    var newsCardsList = newsList.children;

    if (newsCardsList.length === 0) {
        return;
    }

    var newsCards = [];
    for (var i = 0; i < newsCardsList.length; i++) {
        newsCards.push(newsCardsList[i]);
    }

    var currentIndex = 0;
    var autoplayTimer = null;
    var autoplayDelayMs = 6000;

    // Chuyển danh sách tin tức thành 1 hàng ngang có thể trượt
    newsList.style.display = 'flex';
    newsList.style.flexWrap = 'nowrap';
    newsList.style.overflow = 'hidden';
    newsList.style.transition = 'transform .5s ease';

    function getVisibleCardCount() {
        var screenWidth = window.innerWidth;

        if (screenWidth >= 1024) {
            return 3;
        }

        if (screenWidth >= 768) {
            return 2;
        }

        return 1;
    }

    function getMaxIndex() {
        var visibleCount = getVisibleCardCount();
        var maxIndex = newsCards.length - visibleCount;

        if (maxIndex < 0) {
            maxIndex = 0;
        }

        return maxIndex;
    }

    function applyCardWidth() {

        var visibleCount = getVisibleCardCount();
        var cardWidthPercent = 100 / visibleCount;

        for (var i = 0; i < newsCards.length; i++) {
            newsCards[i].style.flex = '0 0 ' + cardWidthPercent + '%';
            newsCards[i].style.maxWidth = cardWidthPercent + '%';
        }

        updateSliderPosition();
        buildDotIndicators();
    }

    function updateSliderPosition() {

        var visibleCount = getVisibleCardCount();
        var maxIndex = getMaxIndex();

        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        if (currentIndex < 0) {
            currentIndex = 0;
        }

        var offsetPercent = currentIndex * (100 / visibleCount);
        newsList.style.transform = 'translateX(-' + offsetPercent + '%)';

        updateDotIndicators();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSliderPosition();
    }

    function goToNextSlide() {
        var maxIndex = getMaxIndex();

        if (currentIndex < maxIndex) {
            currentIndex = currentIndex + 1;
        } else {
            currentIndex = 0; // quay vòng về tin đầu tiên
        }

        updateSliderPosition();
    }

    function goToPrevSlide() {
        var maxIndex = getMaxIndex();

        if (currentIndex > 0) {
            currentIndex = currentIndex - 1;
        } else {
            currentIndex = maxIndex; // quay vòng ra tin cuối cùng
        }

        updateSliderPosition();
    }

    // Tạo các chấm chỉ số bằng createElement — chỉ khi HTML đã có
    // vùng chứa ".ocean-news__dots" (nếu chưa có thì bỏ qua, không lỗi)
    function buildDotIndicators() {

        if (dotsContainer === null) {
            return;
        }

        // Xóa các chấm cũ trước khi tạo lại (ví dụ khi đổi kích thước màn hình)
        while (dotsContainer.firstChild !== null) {
            dotsContainer.removeChild(dotsContainer.firstChild);
        }

        var maxIndex = getMaxIndex();
        var totalDots = maxIndex + 1;

        for (var i = 0; i < totalDots; i++) {
            var dot = document.createElement('button');

            dot.type = 'button';
            dot.className = 'ocean-news__dot';
            dot.setAttribute('aria-label', 'Xem tin thứ ' + (i + 1));
            dot.setAttribute('data-dot-index', i);

            dot.addEventListener('click', function (event) {
                var dotIndex = parseInt(event.currentTarget.getAttribute('data-dot-index'), 10);
                goToSlide(dotIndex);
                restartAutoplay();
            });

            dotsContainer.appendChild(dot);
        }

        updateDotIndicators();
    }

    // Đánh dấu chấm tương ứng với vị trí hiện tại
    function updateDotIndicators() {

        if (dotsContainer === null) {
            return;
        }

        var dotElements = dotsContainer.children;

        for (var i = 0; i < dotElements.length; i++) {
            if (i === currentIndex) {
                dotElements[i].classList.add('ocean-news__dot--active');
            } else {
                dotElements[i].classList.remove('ocean-news__dot--active');
            }
        }
    }

    function startAutoplay() {
        autoplayTimer = setInterval(goToNextSlide, autoplayDelayMs);
    }

    function stopAutoplay() {
        if (autoplayTimer !== null) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    nextButton.addEventListener('click', function () {
        goToNextSlide();
        restartAutoplay();
    });

    prevButton.addEventListener('click', function () {
        goToPrevSlide();
        restartAutoplay();
    });

    // Dừng autoplay khi rê chuột vào khu vực tin tức, chạy lại khi rời đi
    newsList.addEventListener('mouseenter', stopAutoplay);
    newsList.addEventListener('mouseleave', startAutoplay);

    // Điều khiển bằng phím mũi tên trái/phải khi khu vực tin tức đang được focus
    var newsSection = document.querySelector('.ocean-news');

    if (newsSection !== null) {
        newsSection.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowRight') {
                goToNextSlide();
                restartAutoplay();
            } else if (event.key === 'ArrowLeft') {
                goToPrevSlide();
                restartAutoplay();
            }
        });
    }

    // Đổi kích thước cửa sổ: tính lại chiều rộng thẻ (có debounce, tránh gọi dồn dập)
    window.addEventListener('resize', debounce(applyCardWidth, 200));

    applyCardWidth();
    startAutoplay();
}


/* ==================================================================
   "SỔ TAY KHÁM PHÁ" — LỚP DỮ LIỆU NỀN (localStorage)
   ------------------------------------------------------------------
   Đây là phần lõi logic (chưa gắn giao diện) cho nghiệp vụ lưu lại
   những nội dung người dùng quan tâm (tầng biển, sinh vật, khoáng
   sản, địa điểm, bài viết...) — thay thế hoàn toàn khái niệm "giỏ
   hàng" cho phù hợp 1 website khám phá, không phải thương mại điện
   tử. Giao diện (nút lưu, panel xem lại, badge số lượng) sẽ được
   xây dựng đầy đủ ở giai đoạn "Sổ tay khám phá" cùng với HTML/CSS
   tương ứng.
   ================================================================== */
var ExplorerNotebook = {

    storageKey: 'oceanExplorerNotebook',
    items: [],

    // Đọc sổ tay đã lưu (nếu có) từ localStorage vào bộ nhớ
    load: function () {

        var savedData = null;

        try {
            savedData = localStorage.getItem(this.storageKey);
        } catch (error) {
            savedData = null; // trình duyệt chặn localStorage (chế độ ẩn danh...) -> coi như chưa có gì
        }

        if (savedData === null) {
            this.items = [];
            return this.items;
        }

        try {
            this.items = JSON.parse(savedData);
        } catch (error) {
            this.items = []; // dữ liệu lưu bị hỏng -> khởi tạo lại cho an toàn
        }

        return this.items;
    },

    // Ghi sổ tay hiện tại xuống localStorage
    save: function () {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },

    // Lưu 1 mục vào sổ tay (không thêm trùng nếu đã lưu rồi)
    saveItem: function (id, type, title) {

        if (this.isSaved(id) === true) {
            return this.items;
        }

        this.items.push({
            id: id,
            type: type,
            title: title,
            savedAt: new Date().toISOString()
        });

        this.save();
        return this.items;
    },

    // Bỏ lưu 1 mục theo id
    removeItem: function (id) {

        var remainingItems = [];

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id !== id) {
                remainingItems.push(this.items[i]);
            }
        }

        this.items = remainingItems;
        this.save();
        return this.items;
    },

    // Kiểm tra 1 mục đã được lưu chưa
    isSaved: function (id) {

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === id) {
                return true;
            }
        }

        return false;
    },

    // Lấy toàn bộ danh sách đã lưu
    getItems: function () {
        return this.items;
    },

    // Đếm số lượng mục đã lưu
    getCount: function () {
        return this.items.length;
    },

    // Xóa toàn bộ sổ tay
    clearAll: function () {
        this.items = [];
        this.save();
        return this.items;
    }
};


/* ==================================================================
   KHỞI CHẠY TOÀN BỘ SAU KHI DOM ĐÃ SẴN SÀNG
   ================================================================== */
document.addEventListener('DOMContentLoaded', function () {

    initMenu();
    initMobileSearchToggle();
    initSearch();
    initSmoothScroll();
    initSidebarDepthNav();
    initHeaderScrollEffect();
    initStatisticsCounter();
    initFadeInEffects();
    initNewsSlider();

    // Nạp sổ tay đã lưu trước đó (nếu có) ngay khi trang tải xong
    ExplorerNotebook.load();
});