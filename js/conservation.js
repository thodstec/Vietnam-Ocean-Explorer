var App = {

    // ============================================================
    // STATE
    // ============================================================

    storageKey: "oceanNotebook",
    notebook: [],
    dom: {},
    slideIndex: 0,
    counterPlayed: false,

    // trang chứa nội dung chi tiết (tầng độ sâu + tin tức) và trang
    // chứa các địa điểm du lịch — dùng để điều hướng xuyên trang khi
    // 1 mục trong sổ tay được lưu từ trang khác nhưng đang được xem
    // lại ở trang này (trang này không có 2 loại nội dung đó)
    detailPage: "depth-explorer.html",
    locationsPage: "unique-locations.html",

    // ============================================================
    // INIT
    // ============================================================

    init: function () {
        this.cacheDom();
        this.loadNotebook();
        this.bindEvents();
        this.renderNotebook();
        this.updateCounter();
        this.updateButtons();

        this.initSearch();
        this.initMenu();
        this.initMobileSearch();
        this.initScrollLink();
        this.initWindowScroll();
        this.initCounter();
        this.initSlider();
        this.initResize();
        this.initDetailView();

        // chạy 1 lần lúc tải trang để phần tử nào đang nằm sẵn
        // trong khung nhìn cũng được hiện ra chứ không phải đợi
        // tới khi người dùng cuộn trang
        this.activeSidebar();
        this.revealCard();

        // riêng trang này: 2 hiệu ứng cuộn tới đâu chạy tới đó
        this.initProgressBars();
        this.initTimelineReveal();
    },

    cacheDom: function () {
        this.dom.saveButtons = document.querySelectorAll("[data-save-id]");
        this.dom.panel = document.getElementById("notebookPanel");
        this.dom.overlay = document.getElementById("notebookOverlay");
        this.dom.list = document.getElementById("notebookList");
        this.dom.empty = document.getElementById("notebookEmpty");
        this.dom.count = document.getElementById("notebookCount");
        this.dom.clear = document.getElementById("notebookClearAll");
        this.dom.open = document.querySelector(".header__notebook-toggle");
        this.dom.close = document.querySelector(".notebook-panel__close");

        // mặc định rỗng — chỉ được initSlider() gán lại nếu trang
        // hiện tại có phần tin tức (.ocean-news__list); nhờ vậy các
        // trang không có tin tức (như trang này) vẫn không bị lỗi
        // khi goToNewsCard() truy cập tới this.dom.news
        this.dom.news = [];
    },

    bindEvents: function () {
        var i;

        for (i = 0; i < this.dom.saveButtons.length; i++) {
            this.dom.saveButtons[i].onclick = this.toggleSave.bind(this);
        }

        this.dom.open.onclick = this.openNotebook.bind(this);
        this.dom.close.onclick = this.closeNotebook.bind(this);
        this.dom.overlay.onclick = this.closeNotebook.bind(this);
        this.dom.clear.onclick = this.clearNotebook.bind(this);
    },

    // ============================================================
    // NOTEBOOK (danh mục yêu thích cá nhân — lưu bằng JSON trong
    // localStorage, tương tự nghiệp vụ giỏ hàng: thêm / xóa / đếm /
    // chọn vào để xem lại nội dung tương ứng)
    //
    // Vì dùng chung 1 storageKey ("oceanNotebook") và dùng chung
    // đúng cấu trúc App này trên MỌI trang của site, dữ liệu sổ tay
    // (kể cả số đếm ở icon header) sẽ tự động đồng nhất ở mọi trang
    // — không cần xử lý gì thêm riêng cho từng trang.
    // ============================================================

    loadNotebook: function () {
        var data = localStorage.getItem(this.storageKey);

        if (data) {
            this.notebook = JSON.parse(data);
        }
    },

    saveNotebook: function () {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(this.notebook)
        );
    },

    findItem: function (id) {
        var i;

        for (i = 0; i < this.notebook.length; i++) {
            if (this.notebook[i].id == id) {
                return i;
            }
        }

        return -1;
    },

    toggleSave: function (e) {
        var button = e.currentTarget;
        var id = button.dataset.saveId;
        var title = button.dataset.saveTitle;
        var type = button.dataset.saveType;
        var index = this.findItem(id);

        if (index == -1) {
            this.notebook.push({
                id: id,
                title: title,
                type: type
            });
        } else {
            this.notebook.splice(index, 1);
        }

        this.saveNotebook();
        this.renderNotebook();
        this.updateCounter();
        this.updateButtons();
    },

    removeItem: function (e) {
        var id = e.currentTarget.dataset.id;
        var index = this.findItem(id);

        if (index > -1) {
            this.notebook.splice(index, 1);
        }

        this.saveNotebook();
        this.renderNotebook();
        this.updateCounter();
        this.updateButtons();
    },

    clearNotebook: function () {
        this.notebook = [];

        this.saveNotebook();
        this.renderNotebook();
        this.updateCounter();
        this.updateButtons();
    },

    updateCounter: function () {
        this.dom.count.textContent = this.notebook.length;
    },

    updateButtons: function () {
        var i, btn, icon, saved;

        for (i = 0; i < this.dom.saveButtons.length; i++) {
            btn = this.dom.saveButtons[i];
            icon = btn.querySelector("i");
            saved = this.findItem(btn.dataset.saveId) > -1;

            if (saved) {
                icon.className = "fa fa-bookmark";
                btn.setAttribute("aria-pressed", "true");
            } else {
                icon.className = "fa fa-bookmark-o";
                btn.setAttribute("aria-pressed", "false");
            }
        }
    },

    renderNotebook: function () {
        var i, item, li, span, button, icon;

        this.dom.list.innerHTML = "";

        if (this.notebook.length == 0) {
            this.dom.empty.style.display = "block";
        } else {
            this.dom.empty.style.display = "none";
        }

        for (i = 0; i < this.notebook.length; i++) {
            item = this.notebook[i];

            li = document.createElement("li");
            li.className = "notebook-panel__item";

            span = document.createElement("span");
            span.textContent = item.title;
            span.dataset.id = item.id;
            span.dataset.type = item.type;

            button = document.createElement("button");
            button.className = "remove-item";
            button.type = "button";
            button.dataset.id = item.id;

            icon = document.createElement("i");
            icon.className = "fa fa-trash";

            button.appendChild(icon);
            li.appendChild(span);
            li.appendChild(button);

            this.dom.list.appendChild(li);
        }

        this.bindNotebookItems();
    },

    bindNotebookItems: function () {
        var removeButtons = this.dom.list.querySelectorAll(".remove-item");
        var titles = this.dom.list.querySelectorAll(".notebook-panel__item span");
        var i;

        for (i = 0; i < removeButtons.length; i++) {
            removeButtons[i].onclick = this.removeItem.bind(this);
        }

        for (i = 0; i < titles.length; i++) {
            titles[i].onclick = this.goToItem.bind(this);
        }
    },

    // chọn vào 1 mục trong sổ tay => cuộn về đúng phần nội dung
    // chính tương ứng (tầng độ sâu / tin tức / địa điểm). Nếu nội
    // dung đó không nằm trên trang đang xem (trang này không có
    // .depth-card, .ocean-news hay .featured__card), sẽ tự điều
    // hướng sang đúng trang chứa nội dung rồi mở ra luôn.
    goToItem: function (e) {
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;

        this.closeNotebook();

        if (type == "depth") {
            this.goToDepthCard(id);
        } else if (type == "news") {
            this.goToNewsCard(id);
        } else if (type == "location") {
            this.goToLocationCard(id);
        }
    },

    goToDepthCard: function (id) {
        var target = document.getElementById(id);

        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            return;
        }

        // không có trên trang hiện tại => sang trang chứa nội dung,
        // hash "#id=" sẽ được checkDetailHash() tự mở chi tiết
        window.location.href = this.detailPage + "#id=" + id;
    },

    goToNewsCard: function (id) {
        var newsSection = document.querySelector(".ocean-news");
        var news = this.dom.news || [];
        var index = -1;
        var button, i;

        if (!newsSection) {
            window.location.href = this.detailPage + "#news=" + id;
            return;
        }

        for (i = 0; i < news.length; i++) {
            button = news[i].querySelector("[data-save-id]");

            if (button && button.dataset.saveId == id) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            this.slideIndex = index;
            this.moveSlide();
        }

        newsSection.scrollIntoView({ behavior: "smooth" });
    },

    goToLocationCard: function (id) {
        var target = document.getElementById(id);

        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            return;
        }

        window.location.href = this.locationsPage + "#id=" + id;
    },

    openNotebook: function () {
        this.dom.panel.classList.add("show");
        this.dom.overlay.classList.add("show");
        this.dom.panel.setAttribute("aria-hidden", "false");
        this.dom.open.setAttribute("aria-expanded", "true");
    },

    closeNotebook: function () {
        this.dom.panel.classList.remove("show");
        this.dom.overlay.classList.remove("show");
        this.dom.panel.setAttribute("aria-hidden", "true");
        this.dom.open.setAttribute("aria-expanded", "false");
    },

    // ============================================================
    // SEARCH (thanh tìm kiếm nội dung trang — chỉ lọc được các thẻ
    // .depth-card / .ocean-news__card nếu trang hiện tại có chứa
    // chúng; trên trang này ô tìm kiếm vẫn hiển thị bình thường,
    // chỉ đơn giản là không có gì để lọc)
    // ============================================================

    initSearch: function () {
        this.dom.searchInput = document.getElementById("siteSearchInput");
        this.dom.cards = document.querySelectorAll(".depth-card, .ocean-news__card");

        if (!this.dom.searchInput) {
            return;
        }

        this.dom.searchInput.onkeyup = this.search.bind(this);
    },

    search: function () {
        var keyword = this.dom.searchInput.value.toLowerCase();
        var i, card, text;

        for (i = 0; i < this.dom.cards.length; i++) {
            card = this.dom.cards[i];
            text = (card.textContent || card.innerText).toLowerCase();
            card.style.display = text.indexOf(keyword) > -1 ? "" : "none";
        }
    },

    // ============================================================
    // MENU (hamburger — mobile) & MOBILE SEARCH TOGGLE
    // ============================================================

    initMenu: function () {
        this.dom.menuButton = document.querySelector(".header__hamburger");
        this.dom.nav = document.querySelector(".horizontal-nav");

        if (!this.dom.menuButton) {
            return;
        }

        this.dom.menuButton.onclick = this.toggleMenu.bind(this);
    },

    toggleMenu: function () {
        var isOpen = this.dom.nav.classList.toggle("show");
        this.dom.menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    },

    initMobileSearch: function () {
        this.dom.searchToggle = document.querySelector(".header__search-toggle");
        this.dom.searchForm = document.querySelector(".form-search");

        if (!this.dom.searchToggle) {
            return;
        }

        this.dom.searchToggle.onclick = this.toggleMobileSearch.bind(this);
    },

    toggleMobileSearch: function () {
        this.dom.searchForm.classList.toggle("show");
    },

    // ============================================================
    // SIDEBAR (điều hướng theo độ sâu — scroll spy)
    // Trang này không có .depth-nav__link / .depth-card nên các
    // vòng lặp dưới đây đơn giản chạy 0 lần, không gây lỗi gì.
    // ============================================================

    initScrollLink: function () {
        var links = document.querySelectorAll(".depth-nav__link");
        var i;

        for (i = 0; i < links.length; i++) {
            links[i].onclick = this.scrollToDepthCard;
        }
    },

    scrollToDepthCard: function (e) {
        var target = document.querySelector(this.getAttribute("href"));

        e.preventDefault();

        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    },

    activeSidebar: function () {
        var cards = document.querySelectorAll(".depth-card");
        var links = document.querySelectorAll(".depth-nav__link");
        var top = window.scrollY;
        var i, j;

        for (i = 0; i < cards.length; i++) {
            if (top >= cards[i].offsetTop - 250) {
                for (j = 0; j < links.length; j++) {
                    links[j].classList.remove("active");

                    if (links[j].getAttribute("href") === "#" + cards[i].id) {
                        links[j].classList.add("active");
                    }
                }
            }
        }
    },

    stickyAside: function () {
        var aside = document.querySelector(".ocean-explore__sidebar");

        if (!aside) {
            return;
        }

        aside.classList.toggle("fixed", window.scrollY > 350);
    },

    revealCard: function () {
        var cards = document.querySelectorAll(".depth-card");
        var i;

        for (i = 0; i < cards.length; i++) {
            if (window.scrollY + window.innerHeight > cards[i].offsetTop + 120) {
                cards[i].classList.add("show");
            }
        }
    },

    initWindowScroll: function () {
        window.addEventListener("scroll", function () {
            App.activeSidebar();
            App.stickyAside();
            App.revealCard();
        });
    },

    // ============================================================
    // COUNTER (số liệu thống kê dạng đếm lên — chỉ chạy trên trang
    // có .ocean-statistics, trang này không có nên đơn giản không
    // tìm thấy phần tử nào, không gây lỗi gì)
    // ============================================================

    initCounter: function () {
        this.dom.counters = document.querySelectorAll(".ocean-statistics__card-title");
        this.counterPlayed = false;

        window.addEventListener("scroll", this.counterScroll.bind(this));
    },

    counterScroll: function () {
        var section = document.querySelector(".ocean-statistics");

        if (this.counterPlayed || !section) {
            return;
        }

        if (window.scrollY + window.innerHeight > section.offsetTop + 80) {
            this.counterPlayed = true;
            this.startCounter();
        }
    },

    startCounter: function () {
        var i;

        for (i = 0; i < this.dom.counters.length; i++) {
            this.animateCounter(this.dom.counters[i]);
        }
    },

    animateCounter: function (el) {
        var end = parseFloat(el.dataset.target.replace(",", ""));
        var suffix = el.dataset.suffix || "";
        var value = 0;
        var step = end / 80;
        var timer = setInterval(function () {
            value += step;

            if (value >= end) {
                value = end;
                clearInterval(timer);
            }

            el.innerHTML = Math.floor(value).toLocaleString() + " " + suffix;
        }, 20);
    },

    // ============================================================
    // NEWS SLIDER (điều hướng trái / phải giữa các tin tức — chỉ
    // chạy trên trang có .ocean-news__list, trang này không có)
    // ============================================================

    initSlider: function () {
        this.dom.newsList = document.querySelector(".ocean-news__list");
        this.dom.news = document.querySelectorAll(".ocean-news__card");
        this.dom.prev = document.querySelector(".ocean-news__button--prev");
        this.dom.next = document.querySelector(".ocean-news__button--next");
        this.dom.dots = document.querySelector(".ocean-news__dots");

        if (!this.dom.newsList) {
            return;
        }

        this.slideIndex = 0;

        this.createDots();
        this.moveSlide();

        this.dom.next.onclick = this.nextSlide.bind(this);
        this.dom.prev.onclick = this.prevSlide.bind(this);

        this.autoSlide();
    },

    createDots: function () {
        var i, dot, dots;

        this.dom.dots.innerHTML = "";

        for (i = 0; i < this.dom.news.length; i++) {
            dot = document.createElement("span");
            dot.className = "dot";
            dot.dataset.slide = i;

            this.dom.dots.appendChild(dot);
        }

        dots = this.dom.dots.querySelectorAll(".dot");

        for (i = 0; i < dots.length; i++) {
            dots[i].onclick = this.gotoSlide.bind(this);
        }
    },

    moveSlide: function () {
        var dots = this.dom.dots.querySelectorAll(".dot");
        var i;

        this.dom.newsList.style.transform = "translateX(-" + (this.slideIndex * 100) + "%)";

        for (i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active");
        }

        if (dots[this.slideIndex]) {
            dots[this.slideIndex].classList.add("active");
        }
    },

    nextSlide: function () {
        this.slideIndex++;

        if (this.slideIndex >= this.dom.news.length) {
            this.slideIndex = 0;
        }

        this.moveSlide();
    },

    prevSlide: function () {
        this.slideIndex--;

        if (this.slideIndex < 0) {
            this.slideIndex = this.dom.news.length - 1;
        }

        this.moveSlide();
    },

    gotoSlide: function (e) {
        this.slideIndex = parseInt(e.target.dataset.slide, 10);
        this.moveSlide();
    },

    autoSlide: function () {
        var self = this;

        setInterval(function () {
            self.nextSlide();
        }, 5000);
    },

    initResize: function () {
        window.addEventListener("resize", function () {
            if (App.dom.newsList) {
                App.moveSlide();
            }
        });
    },

    // ============================================================
    // DETAIL VIEW (Xem chi tiết — dùng cho .depth-card ở trang
    // depth-explorer. Trang này không có .depth-card nên
    // addDetailButtons() không tạo nút nào; modal vẫn được dựng sẵn
    // (rỗng, ẩn) để cấu trúc App giống hệt các trang khác)
    // ============================================================

    initDetailView: function () {
        this.buildDetailModal();
        this.addDetailButtons();
        this.bindDetailModalEvents();
        this.checkDetailHash();
    },

    buildDetailModal: function () {
        var modal = document.createElement("div");
        var overlay = document.createElement("div");
        var panel = document.createElement("div");
        var closeBtn = document.createElement("button");
        var image = document.createElement("img");
        var depth = document.createElement("p");
        var title = document.createElement("h2");
        var description = document.createElement("p");
        var info = document.createElement("ul");

        modal.className = "detail-modal";
        modal.id = "detailModal";
        modal.setAttribute("aria-hidden", "true");

        overlay.className = "detail-modal__overlay";

        panel.className = "detail-modal__panel";

        closeBtn.type = "button";
        closeBtn.className = "detail-modal__close";
        closeBtn.setAttribute("aria-label", "Đóng chi tiết");
        closeBtn.innerHTML = '<i class="fa fa-times"></i>';

        image.className = "detail-modal__image";

        depth.className = "detail-modal__depth";

        title.className = "detail-modal__title";

        description.className = "detail-modal__description";

        info.className = "detail-modal__info";

        panel.appendChild(closeBtn);
        panel.appendChild(image);
        panel.appendChild(depth);
        panel.appendChild(title);
        panel.appendChild(description);
        panel.appendChild(info);

        modal.appendChild(overlay);
        modal.appendChild(panel);

        document.body.appendChild(modal);

        this.dom.detailModal = modal;
        this.dom.detailOverlay = overlay;
        this.dom.detailClose = closeBtn;
        this.dom.detailImage = image;
        this.dom.detailDepth = depth;
        this.dom.detailTitle = title;
        this.dom.detailDescription = description;
        this.dom.detailInfo = info;
    },

    addDetailButtons: function () {
        var cards = document.querySelectorAll(".depth-card");
        var i, card, button;

        for (i = 0; i < cards.length; i++) {
            card = cards[i];

            button = document.createElement("button");
            button.type = "button";
            button.className = "depth-card__detail-button";
            button.dataset.targetId = card.id;
            button.innerHTML = 'Xem chi tiết <i class="fa fa-angle-double-right"></i>';
            button.onclick = this.openDetail.bind(this, card.id);

            card.appendChild(button);
        }
    },

    openDetail: function (cardId) {
        var card = document.getElementById(cardId);
        var image, depth, title, description, info;

        if (!card) {
            return;
        }

        image = card.querySelector(".depth-card__image");
        depth = card.querySelector(".depth-card__depth");
        title = card.querySelector(".depth-card__title");
        description = card.querySelector(".depth-card__description");
        info = card.querySelector(".depth-card__info");

        if (image && image.src) {
            this.dom.detailImage.src = image.src;
            this.dom.detailImage.alt = image.alt;
            this.dom.detailImage.style.display = "";
        } else {
            this.dom.detailImage.style.display = "none";
        }

        this.dom.detailDepth.textContent = depth ? depth.textContent : "";
        this.dom.detailTitle.innerHTML = title ? title.innerHTML : "";
        this.dom.detailDescription.textContent = description ? description.textContent : "";
        this.dom.detailInfo.innerHTML = info ? info.innerHTML : "";

        this.dom.detailModal.classList.add("show");
        this.dom.detailModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        location.hash = "id=" + cardId;
    },

    closeDetail: function () {
        this.dom.detailModal.classList.remove("show");
        this.dom.detailModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        if (location.hash.indexOf("#id=") === 0) {
            history.replaceState(null, "", location.pathname + location.search);
        }
    },

    bindDetailModalEvents: function () {
        this.dom.detailClose.onclick = this.closeDetail.bind(this);
        this.dom.detailOverlay.onclick = this.closeDetail.bind(this);

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                App.closeDetail();
            }
        });
    },

    // cho phép mở thẳng 1 mục chi tiết nếu người dùng vào trang
    // bằng địa chỉ có sẵn id (không dùng trên trang này vì không
    // có .depth-card nào để mở, nhưng giữ lại cho đồng bộ cấu trúc)
    checkDetailHash: function () {
        var hash = location.hash.replace("#", "");
        var id;

        if (hash.indexOf("id=") === 0) {
            id = hash.split("=")[1];

            if (document.getElementById(id)) {
                this.openDetail(id);
            }
        }
    },

    // ============================================================
    // PROGRESS BARS (riêng trang này) — mỗi thanh tiến trình trong
    // .threat-card tự chạy tới đúng % (đọc từ data-progress) khi
    // cuộn lọt vào khung nhìn. Dùng IntersectionObserver thay vì
    // lắng nghe sự kiện "scroll" vì mỗi thanh chỉ cần chạy đúng
    // 1 lần rồi thôi, không cần tính toán lại mỗi khi cuộn tiếp.
    // ============================================================

    initProgressBars: function () {
        var bars = document.querySelectorAll(".progress__fill");
        var observer;

        if (bars.length == 0) {
            return;
        }

        observer = new IntersectionObserver(
            this.handleProgressIntersect.bind(this),
            { threshold: 0.4 }
        );

        var i;
        for (i = 0; i < bars.length; i++) {
            observer.observe(bars[i]);
        }
    },

    handleProgressIntersect: function (entries, observer) {
        var i, entry, bar, target;

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];

            if (entry.isIntersecting) {
                bar = entry.target;
                target = bar.dataset.progress;

                // delay theo thứ tự xuất hiện trong entries, để các
                // thanh trong cùng 1 hàng chạy nối đuôi nhau cho đẹp
                setTimeout(this.fillProgressBar.bind(this, bar, target), i * 200);

                observer.unobserve(bar);
            }
        }
    },

    fillProgressBar: function (bar, target) {
        bar.style.width = target + "%";
    },

    // ============================================================
    // TIMELINE REVEAL (riêng trang này) — mỗi mốc thời gian trong
    // .timeline-wrapper mờ dần hiện ra khi cuộn tới, bằng cách gắn
    // class "is-visible" (CSS đã có sẵn transition opacity/transform
    // cho .timeline-item.is-visible)
    // ============================================================

    initTimelineReveal: function () {
        var items = document.querySelectorAll(".timeline-item");
        var observer;

        if (items.length == 0) {
            return;
        }

        observer = new IntersectionObserver(
            this.handleTimelineIntersect,
            { threshold: 0.3 }
        );

        var i;
        for (i = 0; i < items.length; i++) {
            observer.observe(items[i]);
        }
    },

    handleTimelineIntersect: function (entries) {
        var i, entry;

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];

            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", function () {
    App.init();
});