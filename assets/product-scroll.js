class DlHighlight0718H extends HTMLElement {
    constructor() {
        super();
        // huey["dl-highlight0718-h"] = this;
        this.main = this.querySelector(".dl-highlight0718-h");
        this.container = this.querySelector(".dl-highlight0718-h-container");
        this.itemsContainer = this.querySelector(".dl-highlight0718-h-items");
        this.infosBase = this.querySelector(".dl-highlight0718-h-infos-base");
        this.infoContainer = this.querySelector(".dl-highlight0718-h-infos");
        this.infoItems = this.querySelectorAll(".dl-highlight0718-h-info");
        this.images = this.querySelectorAll(".dl-highlight0718-h-image");
        this.titleBtns = this.querySelectorAll(".dl-highlight0718-h-info-subtitle");
        this.activeIndex = 0;
        this.preContainerTop = 0;
        this.scrollHandler = this.scroll.bind(this);
        this.titleBtnClickHandler = this.titleBtnClick.bind(this);
        this.windowWidth = window.innerWidth
    }
    connectedCallback() {
        this.bindEvents();
        this.init();
    }
    init() {
        window.innerWidth > 990 ? (this.destroyMobile(),
        this.initDesktop()) : (this.destroyDesktop(),
        this.initMobile())
    }
    initDesktop() {
        window.addEventListener("scroll", this.scrollHandler);
        this.titleBtns.forEach(btn => {
            btn.addEventListener("click", this.titleBtnClickHandler)
        }
        )
    }
    destroyDesktop() {
        window.removeEventListener("scroll", this.scrollHandler);
        this.titleBtns.forEach(btn => {
            btn.removeEventListener("click", this.titleBtnClickHandler)
        }
        )
    }
    initMobile() {}
    destroyMobile() {}
    initializeGlide() {
        this.glide && (this.glide.destroy(),
        this.glide = null);
        this.glide = new Glide(this.itemsContainer,{
            type: "slider",
            startAt: 0,
            perView: 1.425,
            gap: 8,
            rewind: !1
        });
        this.glide.mount()
    }
    checkExposure() {
        let rect = this.container.getBoundingClientRect()
          , result = rect.top == this.preContainerTop;
        return this.preContainerTop = rect.top,
        result
    }
    activeSlide(index) {
        this.slideAnimating || (this.slideAnimating = !0,
        index = index < 0 ? 0 : index,
        index = index >= this.infoItems.length ? this.infoItems.length - 1 : index,
        this.infoContainer.dataset.dlActiveIndex = index,
        this.activeIndex = index,
        this.infoItems.forEach( (item, i) => {
            i === index ? item.classList.add("dl-active") : item.classList.remove("dl-active")
        }
        ),
        this.images.forEach( (item, i) => {
            i < index ? (item.classList.add("dl-prev"),
            item.classList.remove("dl-next")) : i === index ? (item.classList.remove("dl-prev"),
            item.classList.remove("dl-next")) : (item.classList.remove("dl-prev"),
            item.classList.add("dl-next"))
        }
        ),
        index === 0 ? this.moveScrolltoTop() : index === this.infoItems.length - 1 && this.moveScrolltoBottom(),
        setTimeout( () => {
            this.slideAnimating = !1
        }
        , 1000))
    }
    bindEvents() {
        window.addEventListener("resize", this.resize.bind(this))
    }
    titleBtnClick(e) {
        let target = e.currentTarget
          , index = Number(target.dataset.dlIndex);
        this.activeSlide(index)
    }
    scroll() {
      
        this.checkExposure() && (this.scrolling && cancelAnimationFrame(this.scrolling),
        this.scrolling = requestAnimationFrame( () => {
            let currentScrollTop = window.scrollY || document.documentElement.scrollTop
              , scrollDirection = currentScrollTop > this.previousScrollTop ? "down" : "up";
            this.previousScrollTop = currentScrollTop;
            let index = scrollDirection === "down" ? this.activeIndex + 1 : this.activeIndex - 1;
            this.activeSlide(index);
            this.scrolling = null
        }
        ))
    }
    moveScrolltoTop() {
        let target = this.main.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: target,
            behavior: "smooth"
        })
    }
    moveScrolltoBottom() {
        let target = this.main.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        window.scrollTo({
            top: target,
            behavior: "smooth"
        })
    }
    getScrollIndex() {
        let rect = this.getBoundingClientRect()
          , container = this.container.getBoundingClientRect()
          , index = Math.floor((container.top - rect.top) / 300) - 1;
        return index < 0 ? 0 : index >= this.infoItems.length ? this.infoItems.length - 1 : index
    }
    resize() {
        this.windowWidth !== window.innerWidth && (this.windowWidth = window.innerWidth,
        this.resizing && clearTimeout(this.resizing),
        this.resizing = setTimeout( () => {
            this.init();
            this.resizing = null
        }
        , 200))
    }
}
customElements.define("dl-highlight0718-h", DlHighlight0718H);