var App = {
    storageKey: "oceanNotebook",
    notebook: [],
    dom: {},
    init: function () {
        this.cacheDom();
    this.loadNotebook();
    this.bindEvents();
    this.renderNotebook();
    this.updateCounter();
    this.dom.count.textContent=this.notebook.length;

    this.initSearch();
    this.initMenu();
    this.initMobileSearch();
    this.initScrollLink();
    this.initWindowScroll();
    this.initCounter();
    this.initSlider();
    this.initResize();
    },

    cacheDom: function () {
        this.dom.saveButtons = document.querySelectorAll("[data-save-id]");
        this.dom.panel = document.getElementById("notebookPanel");
        this.dom.overlay = document.getElementById("notebookOverlay");
        this.dom.list = document.getElementById("notebookList");
        this.dom.empty = document.getElementById("notebookEmpty");
        this.dom.count = document.getElementById("notebookCount");
        this.dom.clear =  document.getElementById("notebookClearAll");
        this.dom.open = document.querySelector(".header__notebook-toggle");
        this.dom.close = document.querySelector(".notebook-panel__close");
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
        }else {
            this.notebook.splice(index, 1);
        }
        this.saveNotebook();
        this.renderNotebook();
        this.updateCounter();
        this.updateButtons();
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

    renderNotebook: function () {
        var html = "";
        var i;
        if (this.notebook.length == 0) {
            this.dom.empty.style.display = "block";
        }
        else {
            this.dom.empty.style.display = "none";
        }
        for (i = 0; i < this.notebook.length; i++) {
            html += '<li class="notebook-panel__item">' + '<span>' +   this.notebook[i].title + '</span>' + '<button class="remove-item" data-id="' + this.notebook[i].id + '">' + '<i class="fa fa-trash"></i>' + '</button>' +'</li>';
        }
        this.dom.list.innerHTML = html;
        this.bindRemove();
    },

    bindRemove: function () {
        var btns = document.querySelectorAll(".remove-item");
        var i;
        for (i = 0; i < btns.length; i++) {
            btns[i].onclick = this.removeItem.bind(this);
        }
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
        this.dom.count.innerHTML =
            this.notebook.length;
    },

    updateButtons: function () {
        var i;
        for (
            i = 0;
            i < this.dom.saveButtons.length;
            i++
        ) {
            var btn = this.dom.saveButtons[i];
            var icon = btn.querySelector("i");
            if ( this.findItem(
                    btn.dataset.saveId
                ) > -1
            ) {
                icon.className =
                    "fa fa-bookmark";
            }
            else {
                icon.className =
                    "fa fa-bookmark-o";
            }
        }
    },

    openNotebook: function () {
        this.dom.panel.classList.add("show");
        this.dom.overlay.classList.add("show");
    },
    closeNotebook: function () {
        this.dom.panel.classList.remove("show");
        this.dom.overlay.classList.remove("show");
    },

    initSearch: function () {
    this.dom.searchInput = document.getElementById("siteSearchInput");
    this.dom.cards = document.querySelectorAll(".depth-card, .ocean-news__card");
    if (!this.dom.searchInput) return;
    this.dom.searchInput.onkeyup = this.search.bind(this);
},
search: function () {
    var keyword = this.dom.searchInput.value.toLowerCase();
    var i, card;
    for (i = 0; i < this.dom.cards.length; i++) {
        card = this.dom.cards[i];
        card.style.display = (card.textContent||card.innerText).toLowerCase().indexOf(keyword) > -1 ? "" : "none";
    }
},
initMenu: function () {
    this.dom.menuButton = document.querySelector(".header__hamburger");
    this.dom.nav = document.querySelector(".horizontal-nav");
    if (!this.dom.menuButton) return;
    this.dom.menuButton.onclick = this.toggleMenu.bind(this);
},
toggleMenu: function () {
    this.dom.nav.classList.toggle("show");
},
initMobileSearch: function () {
    this.dom.searchToggle = document.querySelector(".header__search-toggle");
    this.dom.searchForm = document.querySelector(".form-search");
    if (!this.dom.searchToggle) return;
    this.dom.searchToggle.onclick = function () {
        App.dom.searchForm.classList.toggle("show");
    };
},
initScrollLink: function () {
    var links = document.querySelectorAll(".depth-nav__link");
    var i;
    for (i = 0; i < links.length; i++) {
        links[i].onclick = function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
        };
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
    if (!aside) return;
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
    window.addEventListener("scroll",function() {
        App.activeSidebar();
        App.stickyAside();
        App.revealCard();
    });
},

initCounter:function(){
    this.dom.counters=document.querySelectorAll(".ocean-statistics__card-title");
    this.counterPlayed=false;
    window.addEventListener("scroll",this.counterScroll.bind(this));
},
counterScroll:function(){
    if(this.counterPlayed) return;
    var section=document.querySelector(".ocean-statistics");
    if(!section) return;
    if(window.scrollY+window.innerHeight>section.offsetTop+80){
        this.counterPlayed=true;
        this.startCounter();
    }
},
startCounter:function(){
    var i;
    for(i=0;i<this.dom.counters.length;i++){
        this.animateCounter(this.dom.counters[i]);
    }
},
animateCounter:function(el){
    var end=parseFloat(el.dataset.target.replace(",",""));
    var suffix=el.dataset.suffix||"";
    var value=0;
    var step=end/80;
    var timer=setInterval(function(){
        value+=step;
        if(value>=end){
            value=end;
            clearInterval(timer);
        }
        el.innerHTML=Math.floor(value).toLocaleString()+" "+suffix;
    },20);
},
initSlider:function(){
    this.dom.newsList=document.querySelector(".ocean-news__list");
    this.dom.news=document.querySelectorAll(".ocean-news__card");
    this.dom.prev=document.querySelector(".ocean-news__button--prev");
    this.dom.next=document.querySelector(".ocean-news__button--next");
    this.dom.dots=document.querySelector(".ocean-news__dots");
    if(!this.dom.newsList) return;
    this.slideIndex=0;
    this.createDots();
    this.moveSlide();
    this.dom.next.onclick=this.nextSlide.bind(this);
    this.dom.prev.onclick=this.prevSlide.bind(this);
    this.autoSlide();
},
createDots:function(){
    var html="";
    var i;
    for(i=0;i<this.dom.news.length;i++){
        html+='<span class="dot" data-slide="'+i+'"></span>';
    }
    this.dom.dots.innerHTML=html;
    var dots=this.dom.dots.querySelectorAll(".dot");
    for(i=0;i<dots.length;i++){
        dots[i].onclick=this.gotoSlide.bind(this);
    }
},
moveSlide:function(){
    this.dom.newsList.style.transform="translateX(-"+(this.slideIndex*100)+"%)";
    var dots=this.dom.dots.querySelectorAll(".dot");
    var i;
    for(i=0;i<dots.length;i++){
        dots[i].classList.remove("active");
    }
    if(dots[this.slideIndex]){
    dots[this.slideIndex].classList.add("active");
}
},
nextSlide:function(){
    this.slideIndex++;
    if(this.slideIndex>=this.dom.news.length){
        this.slideIndex=0;
    }
    this.moveSlide();
},
prevSlide:function(){
    this.slideIndex--;
    if(this.slideIndex<0){
        this.slideIndex=this.dom.news.length-1;
    }
    this.moveSlide();
},
gotoSlide:function(e){
    this.slideIndex=parseInt(e.target.dataset.slide,10);
    this.moveSlide();
},
autoSlide:function(){
    var self=this;
    setInterval(function(){
        self.nextSlide();
    },5000);
},
initResize:function(){
    window.addEventListener("resize",function(){
        App.moveSlide();
    });
},
};

document.addEventListener(
    "DOMContentLoaded",
    function () {
        App.init();
    }
);

