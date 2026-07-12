/* ==================================================================
   VIETNAM OCEAN EXPLORER - main.js
   ------------------------------------------------------------------
   File JavaScript thuần (Vanilla JS), viết theo phong cách cơ bản:
   - document.querySelector() / querySelectorAll()
   - Vòng lặp for truyền thống
   - addEventListener()
   - classList.add() / remove() / contains()
   - localStorage + JSON.parse() / JSON.stringify()

   KHÔNG chỉnh sửa HTML hoặc CSS. Mọi thay đổi giao diện tạm thời
   (ẩn/hiện, highlight, hiệu ứng trượt tin tức...) đều thực hiện
   bằng cách gán trực tiếp element.style.* từ JavaScript, vì file
   CSS không có sẵn class tương ứng và đề bài không cho phép sửa
   file CSS.
   ================================================================== */


/* ==================================================================
   1. RESPONSIVE NAVIGATION
   ------------------------------------------------------------------
   - Nút hamburger (.header__hamburger) chỉ hiển thị dưới 1024px
     (CSS đã xử lý qua @media).
   - Các mục menu (trừ "Trang chủ") đang bị ẩn trên mobile bằng
     class có sẵn ".horizontal-nav__item--hide--mobile".
   - Ta KHÔNG tạo class mới mà chỉ remove/add đúng class có sẵn đó
     để hiện/ẩn menu khi bấm hamburger.
   ================================================================== */
function initMenu() {

    var hamburgerButton = document.querySelector('.header__hamburger');
    var headerNavForm = document.querySelector('.header-nav-form');

    // Nếu trang không có menu (thiếu phần tử) thì dừng lại, không báo lỗi
    if (hamburgerButton === null || headerNavForm === null) {
        return;
    }

    // Icon bên trong nút hamburger (thẻ <i class="fa fa-bars">)
    var hamburgerIcon = hamburgerButton.querySelector('i');

    // Lấy danh sách các mục menu đang bị ẩn trên mobile,
    // lưu lại thành 1 mảng thường để thao tác nhiều lần cho an toàn
    var hiddenItemsList = document.querySelectorAll('.horizontal-nav__item--hide--mobile');
    var hiddenNavItems = [];

    for (var i = 0; i < hiddenItemsList.length; i++) {
        hiddenNavItems.push(hiddenItemsList[i]);
    }

    var isMenuOpen = false;

    // Mở menu: bỏ class ẩn -> các mục menu hiện ra
    function openMenu() {
        for (var i = 0; i < hiddenNavItems.length; i++) {
            hiddenNavItems[i].classList.remove('horizontal-nav__item--hide--mobile');
        }

        if (hamburgerIcon !== null) {
            hamburgerIcon.classList.remove('fa-bars');
            hamburgerIcon.classList.add('fa-times');
        }

        isMenuOpen = true;
    }

    // Đóng menu: thêm lại class ẩn -> các mục menu biến mất
    function closeMenu() {
        for (var i = 0; i < hiddenNavItems.length; i++) {
            hiddenNavItems[i].classList.add('horizontal-nav__item--hide--mobile');
        }

        if (hamburgerIcon !== null) {
            hamburgerIcon.classList.remove('fa-times');
            hamburgerIcon.classList.add('fa-bars');
        }

        isMenuOpen = false;
    }

    // Bấm hamburger: mở nếu đang đóng, đóng nếu đang mở
    hamburgerButton.addEventListener('click', function (event) {
        event.stopPropagation(); // không cho sự kiện lan ra document (tránh tự đóng ngay)

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

    // Bấm chọn 1 mục điều hướng thì tự đóng menu luôn cho gọn
    for (var j = 0; j < hiddenNavItems.length; j++) {
        var navLink = hiddenNavItems[j].querySelector('.horizontal-nav__link');

        if (navLink !== null) {
            navLink.addEventListener('click', closeMenu);
        }
    }
}


/* ==================================================================
   1b. MOBILE SEARCH TOGGLE
   ------------------------------------------------------------------
   Nút kính lúp (.header__search-toggle) chỉ hiện dưới 768px.
   Ô input (.form-search__input) mặc định bị ẩn ở mobile
   (display:none trong CSS) và chỉ tự hiện từ 768px trở lên.
   Ta dùng JS để bật/tắt input này trên mobile bằng style.display.
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
    });
}


/* ==================================================================
   2. SEARCH
   ------------------------------------------------------------------
   Tìm từ khóa trong các khối nội dung chính của trang, cuộn mượt
   tới kết quả đầu tiên tìm thấy và highlight tạm thời 2 giây.
   Nếu không thấy thì hiện thông báo nhỏ góc màn hình.
   ================================================================== */

// Danh sách các vùng nội dung sẽ được tìm kiếm bên trong
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
    var searchInput = document.querySelector('.form-search__input');

    if (searchForm === null || searchInput === null) {
        return;
    }

    // "submit" bắt được cả khi bấm nút Search LẪN khi nhấn Enter trong ô input
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        performSearch(searchInput.value);
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

    // Nếu đang có thông báo cũ thì xóa đi trước
    var oldToast = document.querySelector('.js-toast-message');

    if (oldToast !== null) {
        oldToast.parentNode.removeChild(oldToast);
    }

    var toast = document.createElement('div');
    toast.className = 'js-toast-message';
    toast.textContent = message;

    // Style tối giản gán trực tiếp bằng JS (không sửa file CSS)
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
   5. SMOOTH SCROLL (dùng chung cho menu neo và cho Search ở trên)
   ------------------------------------------------------------------
   Header đang position:sticky (cao 72px) nên nếu chỉ nhảy tới đúng
   vị trí phần tử thì nội dung sẽ bị header che mất phần đầu.
   Hàm scrollToElement() tính luôn độ lệch theo chiều cao header.
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

// Gắn cuộn mượt cho mọi liên kết neo (href bắt đầu bằng "#") trong trang
function initSmoothScroll() {

    var anchorLinks = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < anchorLinks.length; i++) {
        anchorLinks[i].addEventListener('click', function (event) {

            var targetId = this.getAttribute('href');

            // Bỏ qua các liên kết "#" trống (chưa có trang đích thật, ví dụ ở footer)
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
}


/* ==================================================================
   3. SIDEBAR DEPTH NAVIGATION (scrollspy)
   ------------------------------------------------------------------
   3 tầng độ sâu (#tang-1, #tang-2, #tang-3) tương ứng với 3 chấm
   trong .depth-nav__list. Các .depth-card dùng position:sticky nên
   khi cuộn, thẻ nào "đang nằm ngay dưới header" mới thật sự là
   thẻ người dùng đang xem -> dùng scroll event + getBoundingClientRect
   để xác định (chính xác hơn IntersectionObserver trong trường hợp
   sticky-stacking này, vì các thẻ sticky luôn nằm trong viewport
   cùng lúc nên tỉ lệ intersection không phân biệt được thẻ nào
   đang "trên cùng").
   ================================================================== */
function initSidebarDepthNav() {

    var contentSection = document.querySelector('.ocean-explore__content');
    var depthCardsList = document.querySelectorAll('.depth-card');
    var navItemsList = document.querySelectorAll('.depth-nav__item');
    var navList = document.querySelector('.depth-nav__list');
    var headerElement = document.querySelector('.header');

    // Nếu trang không có đủ các phần tử cần thiết thì dừng lại
    if (contentSection === null || depthCardsList.length === 0 || navItemsList.length === 0) {
        return;
    }

    // Chuyển NodeList thành mảng thường cho dễ thao tác
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

    // Xác định thẻ .depth-card nào đang cắt ngang đường mốc -> đó là thẻ active
    function updateActiveDepthCard() {

        var activeIndex = -1;

        for (var i = 0; i < depthCards.length; i++) {
            var rect = depthCards[i].getBoundingClientRect();

            if (rect.top <= triggerOffset && rect.bottom > triggerOffset) {
                activeIndex = i;
            }
        }

        // Đã cuộn qua khỏi thẻ cuối cùng (tới Statistics/News) -> giữ trạng thái active ở thẻ cuối
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

    // Cập nhật biến CSS --progress để thanh dọc trong sidebar tô sáng dần
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

    // Giới hạn tần suất chạy hàm khi cuộn bằng requestAnimationFrame,
    // tránh gọi hàm quá nhiều lần trong 1 giây gây giật trang
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

    // Chạy 1 lần ngay khi tải trang để có trạng thái ban đầu đúng
    updateActiveDepthCard();
}


/* ==================================================================
   4. NEWS SLIDER
   ------------------------------------------------------------------
   .ocean-news__list hiện đang là CSS Grid (hiển thị 1/2/3 cột tùy
   màn hình). Để có hiệu ứng "trượt ngang" bằng 2 nút Previous/Next
   mà không sửa file CSS, ta chuyển layout sang flex-row bằng cách
   gán trực tiếp qua JavaScript (element.style...), rồi dùng
   transform: translateX() để trượt danh sách.
   ================================================================== */
function initNewsSlider() {

    var newsList = document.querySelector('.ocean-news__list');
    var newsCardsList = document.querySelectorAll('.ocean-news__card');
    var prevButton = document.querySelector('.ocean-news__button--prev');
    var nextButton = document.querySelector('.ocean-news__button--next');

    if (newsList === null || newsCardsList.length === 0 || prevButton === null || nextButton === null) {
        return;
    }

    var newsCards = [];
    for (var i = 0; i < newsCardsList.length; i++) {
        newsCards.push(newsCardsList[i]);
    }

    var currentIndex = 0;

    // Chuyển danh sách tin tức thành 1 hàng ngang có thể trượt
    newsList.style.display = 'flex';
    newsList.style.flexWrap = 'nowrap';
    newsList.style.overflow = 'hidden';
    newsList.style.transition = 'transform .5s ease';

    // Số thẻ hiển thị cùng lúc, tương ứng đúng các mốc @media trong CSS (768px / 1024px)
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

    // Đặt lại chiều rộng từng thẻ theo số thẻ hiển thị cùng lúc
    function applyCardWidth() {

        var visibleCount = getVisibleCardCount();
        var cardWidthPercent = 100 / visibleCount;

        for (var i = 0; i < newsCards.length; i++) {
            newsCards[i].style.flex = '0 0 ' + cardWidthPercent + '%';
            newsCards[i].style.maxWidth = cardWidthPercent + '%';
        }

        updateSliderPosition();
    }

    // Giới hạn currentIndex hợp lệ rồi dịch chuyển danh sách tới đúng vị trí
    function updateSliderPosition() {

        var visibleCount = getVisibleCardCount();
        var maxIndex = newsCards.length - visibleCount;

        if (maxIndex < 0) {
            maxIndex = 0;
        }

        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        if (currentIndex < 0) {
            currentIndex = 0;
        }

        var offsetPercent = currentIndex * (100 / visibleCount);
        newsList.style.transform = 'translateX(-' + offsetPercent + '%)';
    }

    // Sang tin kế tiếp, nếu đang ở cuối thì quay vòng về đầu
    function goToNextSlide() {

        var visibleCount = getVisibleCardCount();
        var maxIndex = newsCards.length - visibleCount;

        if (maxIndex < 0) {
            maxIndex = 0;
        }

        if (currentIndex < maxIndex) {
            currentIndex = currentIndex + 1;
        } else {
            currentIndex = 0; // quay vòng về tin đầu tiên
        }

        updateSliderPosition();
    }

    // Về tin trước đó, nếu đang ở đầu thì quay vòng ra cuối
    function goToPrevSlide() {

        var visibleCount = getVisibleCardCount();
        var maxIndex = newsCards.length - visibleCount;

        if (maxIndex < 0) {
            maxIndex = 0;
        }

        if (currentIndex > 0) {
            currentIndex = currentIndex - 1;
        } else {
            currentIndex = maxIndex; // quay vòng ra tin cuối cùng
        }

        updateSliderPosition();
    }

    nextButton.addEventListener('click', goToNextSlide);
    prevButton.addEventListener('click', goToPrevSlide);

    // Đổi màn hình (xoay ngang/dọc, thu phóng cửa sổ...) thì tính lại chiều rộng thẻ
    window.addEventListener('resize', applyCardWidth);

    applyCardWidth();
}


/* ==================================================================
   6. HEADER SCROLL EFFECT
   ------------------------------------------------------------------
   Thêm class "header--scrolled" (đã có sẵn style trong CSS) khi
   cuộn xuống quá 1 ngưỡng nhất định, bỏ class khi cuộn lên lại đầu.
   ================================================================== */
function initHeaderScrollEffect() {

    var headerElement = document.querySelector('.header');

    if (headerElement === null) {
        return;
    }

    var scrollThreshold = 40;

    window.addEventListener('scroll', function () {
        if (window.scrollY > scrollThreshold) {
            headerElement.classList.add('header--scrolled');
        } else {
            headerElement.classList.remove('header--scrolled');
        }
    });
}


/* ==================================================================
   8. CART MANAGER (demo logic, chưa có giao diện)
   ------------------------------------------------------------------
   Đối tượng quản lý giỏ hàng dùng localStorage, lưu dữ liệu dạng
   JSON. Trang hiện chưa có UI giỏ hàng nên đây chỉ là phần logic
   nền, sẵn sàng để gắn giao diện sau này.
   ================================================================== */
var CartManager = {

    storageKey: 'oceanExplorerCart',
    items: [],

    // Đọc giỏ hàng đã lưu (nếu có) từ localStorage vào bộ nhớ
    load: function () {

        var savedData = localStorage.getItem(this.storageKey);

        if (savedData !== null) {
            this.items = JSON.parse(savedData);
        } else {
            this.items = [];
        }

        return this.items;
    },

    // Ghi giỏ hàng hiện tại xuống localStorage
    save: function () {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },

    // Thêm 1 sản phẩm (nếu đã có trong giỏ thì cộng dồn số lượng)
    addItem: function (productId, productName, price, quantity) {

        var addedQuantity = quantity ? quantity : 1;
        var existingItem = null;

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === productId) {
                existingItem = this.items[i];
                break;
            }
        }

        if (existingItem !== null) {
            existingItem.quantity = existingItem.quantity + addedQuantity;
        } else {
            this.items.push({
                id: productId,
                name: productName,
                price: price,
                quantity: addedQuantity
            });
        }

        this.save();
        return this.items;
    },

    // Xóa 1 sản phẩm khỏi giỏ theo id
    removeItem: function (productId) {

        var remainingItems = [];

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id !== productId) {
                remainingItems.push(this.items[i]);
            }
        }

        this.items = remainingItems;
        this.save();
        return this.items;
    },

    // Cập nhật số lượng của 1 sản phẩm đã có trong giỏ
    updateQuantity: function (productId, newQuantity) {

        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === productId) {
                this.items[i].quantity = newQuantity;
                break;
            }
        }

        this.save();
        return this.items;
    },

    // Lấy toàn bộ danh sách sản phẩm hiện có trong giỏ
    getItems: function () {
        return this.items;
    },

    // Xóa sạch giỏ hàng
    clearCart: function () {
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
    initNewsSlider();
    initHeaderScrollEffect();

    // Nạp giỏ hàng đã lưu trước đó (nếu có) ngay khi trang tải xong
    CartManager.load();
});