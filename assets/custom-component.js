// 轮播
class SwiperCarousel extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.activeIndex = 0;
    this.isProgrammaticSlide = false; // ✅ 避免死循环触发
  }

  static get observedAttributes() {
    return ['slides-per-view', 'pagination', 'loop'];
  }

  connectedCallback() {
    this.initializeSwiper();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (['slides-per-view', 'pagination', 'loop'].includes(name)) {
      this.initializeSwiper();
    }
  }

  initializeSwiper() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }

    const slidesPerView = this.getAttribute('slides-per-view') || 1.2;
    const loop = this.getAttribute('loop') === 'true';
    const centeredSlides = this.getAttribute('centeredSlides') === 'true';
    const swiperConfig = {
      slidesPerView,
      centeredSlides,
      loop,
      spaceBetween: 20,
      speed: 800,
      autoHeight: true,  // 添加这行
    };

    this.swiper = new Swiper(this.querySelector('.swiper-container'), swiperConfig);
    this.swiper.slideToLoop(0, 0, false);

    this.swiper.on("slideChangeTransitionEnd", () => {
      this.activeIndex = this.swiper.realIndex;

      if (this.isProgrammaticSlide) {
        this.isProgrammaticSlide = false;
        return;
      }

      const changeEvent = new CustomEvent('slideChangeExtra', {
        detail: {
          activeIndex: this.swiper.activeIndex,
          realIndex: this.swiper.realIndex,
        },
        bubbles: true,
        composed: true
      });

      this.dispatchEvent(changeEvent);
    });

    this.swiper.on("slideChange", () => {
      this.activeIndex = this.swiper.realIndex;
    });
  }

  slideTo(index, speed = 800, runCallbacks = true) {

    if (this.swiper) {
      this.isProgrammaticSlide = true;
      this.swiper.slideTo(index, speed, runCallbacks);
    }
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  getSwiperInstance() {
    return this.swiper;
  }

  setSwiperOptions(options) {
    this.swiperOptions = options;
    this.initializeSwiper();
  }

}
customElements.define('swiper-carousel', SwiperCarousel);

// tabs 切换 
class TabsComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this._initTabs();
  }

  _initTabs() {
    const tabs = this.querySelectorAll(".spk-tab-btn");
    tabs.forEach((button) => {
      button.addEventListener("click", (event) => this._changeTab(event));
    });
    this._showInitialTab();
  }

  _showInitialTab() {
    const allContents = this.querySelectorAll('.spk-slider-tab-card-content');
    allContents.forEach(content => content.classList.remove('active'));

    const allTabs = this.querySelectorAll('.spk-tab-btn');
    allTabs.forEach(btn => btn.classList.remove('active'));

    const firstTab = this.querySelector('.spk-tab-btn');
    if (firstTab) {
      this._changeTab({ target: firstTab });
    }
  }

  _changeTab(event) {
    const target = event.target;
    const tabId = target.getAttribute("data-tab");
    const tabIndex = parseInt(target.getAttribute("data-tab_index"));

    // 切换按钮样式
    const allTabs = this.querySelectorAll('.spk-tab-btn');
    allTabs.forEach((btn) => btn.classList.remove("active"));
    target.classList.add("active");

    // 切换内容样式
    const allContents = this.querySelectorAll('.spk-slider-tab-card-content');
    allContents.forEach((content) => {
      const isMatch = content.getAttribute('data-tab-content') === tabId;
      content.classList.toggle("active", isMatch);
    });

    // 更新 Swiper
    this.isProgrammaticSlide = true;
    this.swiper.slideTo(tabIndex);

    // 滚动到 tab
    this._scrollToActiveTab(target);
  }

  _scrollToActiveTab(target) {
    const tabContainer = this.querySelector('.spk-tabs');
    if (!tabContainer || !target) return;

    const containerRect = tabContainer.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const offset = targetRect.left - containerRect.left;
    const scrollLeft = tabContainer.scrollLeft;

    // 检测是否为移动端
    const isMobile = window.innerWidth <= 767.98;

    if (isMobile) {
      // 移动端：滚动到左侧位置
      tabContainer.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth',
      });
    } else {
      // 桌面端：滚动到中间位置
      tabContainer.scrollTo({
        left: scrollLeft + offset - containerRect.width / 2 + targetRect.width / 2,
        behavior: 'smooth',
      });
    }
  }
}

customElements.define("tabs-component", TabsComponent);

// spk-slider-tab
class SpkSliderTab extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this._initElements();
    this._initEvents();
  }
  _initElements() {
    // 使用 this.querySelector 来确保在当前组件内查找
    const swiperContainer = this.querySelector('.swiper-container');
    if (!swiperContainer) {
      console.error('未找到 swiper-container 元素');
      return;
    }

    this.swiper = new Swiper(swiperContainer, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: this.getAttribute('loop') === 'true',
      spaceBetween: 16,
      breakpoints: {
        768: {
          spaceBetween: 20,
        }
      },
      speed: 800,
      on: {
        init: () => {
          console.log('Swiper 初始化完成');
        },
        // click(e) {
        //   const clickedSlide = e.target.closest('.swiper-slide');
        //   if (!clickedSlide) return;

        //   // 获取被点击的 slide 索引
        //   const clickedIndex = swiper.slides.indexOf(clickedSlide);
        //   const realIndex = swiper.clickedIndex;

        //   if (realIndex === undefined || realIndex === swiper.activeIndex) return;

        //   if (realIndex < swiper.activeIndex) {
        //     swiper.slidePrev();
        //   } else {
        //     swiper.slideNext();
        //   }
        // }
      }
    });

    this.tabButtons = this.querySelectorAll('.spk-tab-btn');
    this.tabContents = this.querySelectorAll('.spk-slider-tab-card-content');
    this.activeIndex = 0;
  }

  _initEvents() {
    this.tabButtons.forEach((button) => {
      button.addEventListener('click', () => this.changeTab(button));
    });

    // 监听 slideChange 事件
    this.swiper.on("slideChange", () => {
      console.log('slideChange 触发:', {
        realIndex: this.swiper.realIndex,
        activeIndex: this.swiper.activeIndex
      });
      try {
        this.activeIndex = this.swiper.realIndex;
        if (this.tabButtons[this.activeIndex]) {
          this._updateTabStyles(this.tabButtons[this.activeIndex]);
        }
      } catch (error) {
        console.error('Slide change error:', error);
      }
    });

    // 监听 slideChangeTransitionEnd 事件
    this.swiper.on("slideChangeTransitionEnd", () => {
      console.log('slideChangeTransitionEnd 触发:', {
        realIndex: this.swiper.realIndex,
        activeIndex: this.swiper.activeIndex
      });
      try {
        const event = new CustomEvent('tabChange', {
          detail: {
            index: this.swiper.realIndex,
            direction: this.swiper.swipeDirection
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      } catch (error) {
        console.error('Slide transition end error:', error);
      }
    });
  }

  changeTab(button) {
    try {
      const tabIndex = parseInt(button.getAttribute("data-tab_index"));
      if (!tabIndex) return;

      // 更新样式
      this._updateTabStyles(button);

      // 触发 Swiper 滑动
      if (this.swiper) {
        this.swiper.slideTo(tabIndex - 1, 800);
      }
    } catch (error) {
      console.error('Change tab error:', error);
    }
  }

  _updateTabStyles(button) {
    const tabIndex = parseInt(button.getAttribute("data-tab_index"));
    if (!tabIndex) return;

    // 更新内容样式
    const tabContent = this.querySelectorAll('.spk-slider-tab-card-content');
    tabContent.forEach((content) => content.classList.remove("active"));
    tabContent[tabIndex - 1]?.classList.add("active");

    // 更新按钮样式
    this.tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // 滚动到激活的 tab
    this._scrollToActiveTab(button);
  }

  _scrollToActiveTab(target) {
    const tabContainer = this.querySelector('.spk-tabs');
    if (!tabContainer || !target) return;

    const containerRect = tabContainer.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const offset = targetRect.left - containerRect.left;
    const scrollLeft = tabContainer.scrollLeft;

    // 检测是否为移动端
    const isMobile = window.innerWidth <= 767.98;

    if (isMobile) {
      // 移动端：滚动到左侧位置
      tabContainer.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth',
      });
    } else {
      // 桌面端：滚动到中间位置
      tabContainer.scrollTo({
        left: scrollLeft + offset - containerRect.width / 2 + targetRect.width / 2,
        behavior: 'smooth',
      });
    }
  }
}

customElements.define("spk-slider-tab", SpkSliderTab);

// 滚动
class ScrollEffect extends HTMLElement {
  constructor() {
    super();
    this.activeIndex = 0;
    this._scrollTrigger = null;
  }

  connectedCallback() {
    this._initElements();

    // ✅ 初始化前设置初始 top
    const initTop = this._getHeaderHeight(false);
    this.container.style.top = `${initTop}px`;
    this.style.setProperty('--header-height', `${initTop}px`);

    // ✅ DOM 完成后再初始化 ScrollTrigger，防止 layout 抖动
    requestAnimationFrame(() => {
      this._initScrollTrigger();
      this.setAttribute('data-ready', 'true');
    });

    this._onResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  _initElements() {
    this.container = this.querySelector('.scroller-container');
    this.tabs = this.querySelectorAll('.scroller-tab-item');
    this.contents = this.querySelectorAll('.spk-scroller-item');
    this.stepCount = this.contents.length;

    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this._scrollToContent(index);
      });
    });
  }

  _getHeaderHeight(isSticky = false) {
    const header = document.getElementById('HeaderWrapper');
    const sticky = document.querySelector('.shopify-section.sticky');
    let headerHeight = isSticky ? (header?.offsetHeight || 0) : 0;
    const paddingTop = parseFloat(getComputedStyle(this.parentElement?.parentElement).paddingTop || 0);

    if (isSticky) headerHeight += paddingTop;
    if (sticky && isSticky) headerHeight += sticky.offsetHeight;

    return headerHeight;
  }

  _initScrollTrigger() {
    const header = document.getElementById('HeaderWrapper');
    const sticky = document.querySelector('.shopify-section.sticky');
    const stepHeight = window.innerHeight / 3;
    const totalScroll = stepHeight * this.stepCount;
    const headerHeight = header?.offsetHeight || 0;

    let start_scroll = `top-=${headerHeight} top`;
    if (sticky) {
      start_scroll = `top-=${headerHeight + sticky.offsetHeight} top`;
    }

    this._scrollTrigger = ScrollTrigger.create({
      trigger: this.parentElement.parentElement,
      start: start_scroll,
      end: `+=${totalScroll}`,
      pin: this.container,
      pinSpacing: true,
      anticipatePin: 1, // ✅ 加快插入 spacer 处理，有助于减少跳动
      scrub: true,
      onUpdate: (self) => {
        const index = Math.round(self.progress * (this.stepCount - 1));
        if (index !== this.activeIndex) {
          this._activate(index);
        }
      },
      onEnter: () => {
        this._updateStickyTop(true);
      },
      onToggle: (self) => {
        this._setPinSpacerInset(self.isActive);
      }
    });
  }

  _setPinSpacerInset(isActive, value = '0px auto auto auto') {
    const spacer = this.container?.parentElement;
    if (spacer?.classList.contains('pin-spacer')) {
      spacer.style.inset = isActive ? '' : value;
      spacer.style.top = isActive ? '' : '0px';
    }
  }

  _scrollToContent(index) {
    const headerHeight = this._getHeaderHeight(false);
    const yOffset = this.offsetTop + index * (window.innerHeight / 3);

    gsap.to(window, {
      scrollTo: yOffset - headerHeight,
      duration: 0.8,
      ease: 'power2.inOut'
    });

    this._activate(index);
  }

  _activate(index) {
    this.activeIndex = index;

    this.tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    this.contents.forEach((content, i) => {
      content.classList.toggle('active', i === index);
    });
  }

  _updateStickyTop(isSticky = false) {
    const newTop = this._getHeaderHeight(isSticky);

    gsap.to(this.container, {
      top: `${newTop}px`,
      duration: 0.4,
      ease: 'power2.out'
    });

    this.style.setProperty('--header-height', `${newTop}px`);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);
  }

  _handleResize() {
    this._updateStickyTop(ScrollTrigger.isInViewport(this));
  }

  disconnectedCallback() {
    if (this._scrollTrigger) {
      this._scrollTrigger.kill();
      this._scrollTrigger = null;
    }
    window.removeEventListener('resize', this._onResize);
  }
}

customElements.define('scroll-effect', ScrollEffect);

// selector
class CustomSelect extends HTMLElement {
  constructor() {
    super();
    this._value = null;
    this._optionsData = [];

    // 创建 wrapper 和 display 区域
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-select-wrapper';

    this.display = document.createElement('div');
    this.display.className = 'custom-select-display';

    // 创建 label 和 arrow DOM
    this.labelEl = document.createElement('span');
    this.labelEl.className = 'custom-select-label';
    this.labelEl.textContent = '请选择...';

    this.arrow = document.createElement('span');
    this.arrow.className = 'custom-select-arrow';
    this.arrow.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.4688 5.58399L8.63695 10.4158L8 11.0527L7.36305 10.4158L2.53125 5.58399L3.16819 4.94702L8 9.77883L12.8318 4.94702L13.4688 5.58399Z" fill="black"/>
      </svg>
    `;

    this.display.appendChild(this.labelEl);
    this.display.appendChild(this.arrow);
    this.wrapper.appendChild(this.display);
    this.appendChild(this.wrapper);

    // 创建 optionsContainer
    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = 'custom-select-options';
    this.optionsContainer.style.display = 'none';
    this.optionsContainer.style.position = 'fixed';
    this.optionsContainer.style.zIndex = '9999';
    document.body.appendChild(this.optionsContainer);

    // 外部点击关闭
    this._handleClickOutside = (e) => {
      if (!this.contains(e.target) && !this.optionsContainer.contains(e.target)) {
        this.hideOptions();
      }
    };
  }

  connectedCallback() {
    if (!this._initialized) {
      this.initOptions();
      this._initialized = true;
    }

    this.display.addEventListener('click', () => {
      const isOpen = this.optionsContainer.style.display === 'block';
      isOpen ? this.hideOptions() : this.showOptions();
    });

    document.addEventListener('click', this._handleClickOutside);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._handleClickOutside);
    this.optionsContainer.remove();
  }

  initOptions() {
    const rawOptions = Array.from(this.querySelectorAll('[data-value]'));
    if (!rawOptions.length) return;

    this._optionsData = rawOptions.map(el => ({
      value: el.dataset.value,
      label: el.textContent
    }));

    rawOptions.forEach(el => el.remove());

    this.renderOptions();

    if (!this._value) {
      const first = this._optionsData[0];
      if (first) {
        this._selectOption(first.value, first.label, false);
      }
    }
  }

  renderOptions() {
    this.optionsContainer.innerHTML = '';
    this._optionsData.forEach(({ value, label }) => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.textContent = label;
      option.dataset.value = value;

      option.addEventListener('click', () => {
        this._selectOption(value, label);
      });

      this.optionsContainer.appendChild(option);
    });
  }

  showOptions() {
    Object.assign(this.optionsContainer.style, {
      display: 'block',
      visibility: 'hidden',
      top: '',
      left: '',
      width: '',
    });

    this.arrow.style.transform = 'rotate(180deg)';

    requestAnimationFrame(() => {
      const rect = this.wrapper.getBoundingClientRect();
      const height = this.optionsContainer.offsetHeight;

      const top = rect.top - height - 4;
      const left = rect.left;
      const width = rect.width;

      Object.assign(this.optionsContainer.style, {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: '9999',
        visibility: 'visible',
      });
    });
  }

  hideOptions() {
    this.arrow.style.transform = '';
    this.optionsContainer.style.display = 'none';
  }

  _selectOption(value, label, triggerEvent = true) {
    this._value = value;
    this.labelEl.textContent = label;
    this.hideOptions();

    if (triggerEvent) {
      this.dispatchEvent(new CustomEvent('option-changed', {
        detail: { value },
        bubbles: true,
        composed: true
      }));
    }
  }

  get value() {
    return this._value;
  }

  set value(val) {
    const match = this._optionsData.find(o => o.value === val);
    if (match) {
      this._selectOption(match.value, match.label);
    }
  }
}
customElements.define('custom-select', CustomSelect);


class Blinds extends HTMLElement {
  constructor() {
    super();
    this.hoverTimeout = null;
    this.currentActive = null;
    this.gridContainer = null;
  }

  connectedCallback() {
    this.gridContainer = this.querySelector('.spk-blinds');
    const cards = this.querySelectorAll('.spk-blinds-card');

    cards.forEach((card, index) => {
      // hover 添加 active（减少防抖延迟，让响应更快）
      card.addEventListener('mouseenter', () => {
        // 清除之前的超时
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
        }

        // 减少防抖延迟，让hover响应更及时
        this.hoverTimeout = setTimeout(() => {
          if (this.currentActive !== card) {
            this.activateCard(card, index);
          }
        }, 30);
      });

      // 添加mouseleave事件，当鼠标离开时可以选择是否重置
      card.addEventListener('mouseleave', () => {
        // 可选：当鼠标离开时重置到第一个卡片
        // 这里注释掉，保持当前hover的卡片激活状态
        // this.resetToFirstCard();
      });

      // click 添加 active（防止点链接）
      card.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' || event.target.closest('a')) return;
        event.stopPropagation();
        this.activateCard(card, index);
      });
    });
  }

  activateCard(card, index) {
    // 移除所有active状态
    this.querySelectorAll('.spk-blinds-card').forEach((c) => {
      c.classList.remove('active');
    });

    // 添加active状态到当前卡片
    card.classList.add('active');
    this.currentActive = card;

    // 优化Grid布局动画
    this.optimizeGridLayout(index);
  }

  optimizeGridLayout(activeIndex) {
    if (!this.gridContainer) return;

    // 使用requestAnimationFrame确保DOM更新
    requestAnimationFrame(() => {
      // 可以在这里添加额外的Grid布局优化逻辑
      // 例如动态调整grid-template-columns等
    });
  }

  resetToFirstCard() {
    const firstCard = this.querySelector('.spk-blinds-card');
    if (firstCard) {
      this.activateCard(firstCard, 0);
    }
  }
}

customElements.define('spk-blinds', Blinds);

// Modal 组件
class CustomModal extends HTMLElement {
  constructor() {
    super();
    this.classList.add('custom-modal-wrapper');
    this.innerHTML = `
      <div class="custom-modal-backdrop"></div>
      <div class="custom-modal">
        <button class="custom-modal-close">&times;</button>
        <div class="custom-modal-content">
          <slot></slot>
        </div>
      </div>
    `;

    this.backdrop = this.querySelector('.custom-modal-backdrop');
    this.modal = this.querySelector('.custom-modal');
    this.closeBtn = this.querySelector('.custom-modal-close');

    this._handleClose = this.close.bind(this);
    this._isOpen = false;
    this._escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
  }

  connectedCallback() {
    this.backdrop.addEventListener('click', this._handleClose);
    this.closeBtn.addEventListener('click', this._handleClose);
    document.addEventListener('keydown', this._escHandler);
  }

  disconnectedCallback() {
    this.backdrop.removeEventListener('click', this._handleClose);
    this.closeBtn.removeEventListener('click', this._handleClose);
    document.removeEventListener('keydown', this._escHandler);
  }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this.classList.add('active');
    document.body.classList.add('modal-open');

    requestAnimationFrame(() => {
      this.classList.add('show');
    });

    this.dispatchEvent(new CustomEvent('modal:open'));
    if (typeof this.onopen === 'function') this.onopen();
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this.classList.remove('show');
    document.body.classList.remove('modal-open');

    // 停止视频播放
    const video = this.querySelector('video');
    if (video && typeof video.pause === 'function') {
      video.pause();
      video.src = ''; // 清空地址
    }

    setTimeout(() => {
      if (!this._isOpen) {
        this.classList.remove('active');
        const modalContent = this.querySelector('.custom-modal-content');
        if (modalContent) modalContent.innerHTML = '';
      }
    }, 300);

    this.dispatchEvent(new CustomEvent('modal:close'));
    if (typeof this.onclose === 'function') this.onclose();
  }
}

customElements.define('custom-modal', CustomModal);