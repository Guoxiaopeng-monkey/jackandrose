class CountrySelector {
  constructor() {
    this.section = document.querySelector('[data-country-selector-section]');
    this.insertPosition = this.section.dataset.insertPosition;
    this.mobileInsertPosition = this.section.dataset.mobileInsertPosition;
    this.customSelector = this.section.dataset.customSelector;
    this.mobileCustomSelector = this.section.dataset.mobileCustomSelector;
    this.enableIpDetection = this.section.dataset.enableIpDetection;
    this.defaultCountry = this.section.dataset.defaultCountry;
    // 定义欧洲国家代码列表
    this.europeanCountries = [
      'al', 'ad', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 
      'is', 'ie', 'it', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md', 'mc', 'me', 'nl', 'no', 'pl', 'pt', 
      'ro', 'ru', 'sm', 'rs', 'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va'
    ];
    this.init();
  }

  async init() {
    await this.updateDisplayedCountry();
    this.moveSectionToPosition();
    this.setupEventListeners();
    
    // 监听 URL 变化
    window.addEventListener('popstate', () => this.updateDisplayedCountry());
  }

  async updateDisplayedCountry() {
    try {
      const currentUrl = window.location.href;
      const options = document.querySelectorAll('.country-selector__option');
      
      // 非首次访问时，通过 href 匹配来确定国家
      if (localStorage.getItem('hasVisited')) {
        // 查找与当前 URL 匹配的选项
        let matchedOption = null;
        for (const option of options) {
          if (option.href && currentUrl.includes(option.href)) {
            matchedOption = option;
            break;
          }
        }

        if (matchedOption) {
          const countryCode = matchedOption.getAttribute('data-country-code');
          const flagCode = matchedOption.querySelector('.country-selector__flag-wrapper').innerHTML;
          const countryName = matchedOption.querySelector('.country-selector__option-name').textContent;
          const language = matchedOption.querySelector('.country-selector__option-language').textContent;

          document.querySelectorAll('[data-country-selector-section]').forEach(section => {
            const currentFlag = section.querySelector('.country-selector__current .country-selector__flag-wrapper');
            const currentName = section.querySelector('.country-selector__current .country-selector__name');
            const currentLanguage = section.querySelector('.country-selector__current .country-selector__language');

            if (currentFlag) currentFlag.innerHTML = flagCode;
            if (currentName) currentName.textContent = countryName;
            if (currentLanguage) currentLanguage.textContent = language;
          });
          return;
        }
      }

      // 首次访问或未找到匹配选项时，使用默认逻辑
      const countryCode = await this.setDefaultCountry();
      if (!countryCode) return; // 如果返回null，说明已经跳转，不需要继续处理

      const countryOption = document.querySelector(`.country-selector__option[data-country-code="${countryCode}"]`);
      
      if (countryOption) {
        const flagCode = countryOption.querySelector('.country-selector__flag-wrapper').innerHTML;
        const countryName = countryOption.querySelector('.country-selector__option-name').textContent;
        const language = countryOption.querySelector('.country-selector__option-language').textContent;

        document.querySelectorAll('[data-country-selector-section]').forEach(section => {
          const currentFlag = section.querySelector('.country-selector__current .country-selector__flag-wrapper');
          const currentName = section.querySelector('.country-selector__current .country-selector__name');
          const currentLanguage = section.querySelector('.country-selector__current .country-selector__language');

          if (currentFlag) currentFlag.innerHTML = flagCode;
          if (currentName) currentName.textContent = countryName;
          if (currentLanguage) currentLanguage.textContent = language;
        });
      }
    } catch (error) {
      console.error('Failed to update displayed country:', error);
    }
  }

  async setDefaultCountry() {

    // 从URL中获取国家代码
    const url = new URL(window.location.href);
    const countryCodeFromUrl = url.searchParams.get('country') || url.pathname.split('/')[1];
    
    // 非首次访问，直接使用URL中的国家代码
    if (localStorage.getItem('hasVisited')) {
      if (countryCodeFromUrl) {
        const availableCountries = Array.from(document.querySelectorAll('.country-selector__option'))
          .map(option => option.getAttribute('data-country-code'));
        
        // 检查是否是欧洲国家
        const isEuropean = this.europeanCountries.includes(countryCodeFromUrl.toLowerCase());
        
        // 确定要使用的国家代码
        let countryCodeToUse;
        if (isEuropean) {
          countryCodeToUse = 'eu';
        } else if (availableCountries.includes(countryCodeFromUrl)) {
          countryCodeToUse = countryCodeFromUrl;
        } else {
          countryCodeToUse = this.defaultCountry;
        }
        
        return countryCodeToUse;
      }
      return this.defaultCountry;
    }

    // 首次访问，进行IP检测
    if (this.enableIpDetection) {
      try {
        console.log(">>>>1111");
        const countryCode = await this.getCountryByIp();
        if (!countryCode) {
          // IP检测失败，使用默认选项并跳转
          const defaultOption = document.querySelector(`.country-selector__option[data-country-code="${this.defaultCountry}"]`);
          if (defaultOption && defaultOption.href) {
            localStorage.setItem('hasVisited', 'true');
            window.location.replace(defaultOption.href);
            return null;
          }
          localStorage.setItem('hasVisited', 'true');
          return this.defaultCountry;
        }

        const availableCountries = Array.from(document.querySelectorAll('.country-selector__option'))
          .map(option => option.getAttribute('data-country-code'));
        
        // 检查是否是欧洲国家
        const isEuropean = this.europeanCountries.includes(countryCode.toLowerCase());
        
        // 确定要使用的国家代码
        let countryCodeToUse;
        if (isEuropean) {
          countryCodeToUse = 'eu';
        } else if (availableCountries.includes(countryCode)) {
          countryCodeToUse = countryCode;
        } else {
          // IP检测到的国家不在选项中，使用默认选项并跳转
          const defaultOption = document.querySelector(`.country-selector__option[data-country-code="${this.defaultCountry}"]`);
          if (defaultOption && defaultOption.href) {
            localStorage.setItem('hasVisited', 'true');
            //window.location.replace(defaultOption.href);
            return null;
          }
          countryCodeToUse = this.defaultCountry;
        }

        // 检查当前URL是否与IP国家代码匹配
        const currentUrl = new URL(window.location.href);
        const currentCountryCode = currentUrl.searchParams.get('country') || currentUrl.pathname.split('/')[1];
        // 如果当前URL的国家代码与IP检测结果不匹配，则跳转
        if (currentCountryCode.length == 2 && countryCodeToUse !== currentCountryCode) {
          const countryOption = document.querySelector(`.country-selector__option[data-country-code="${countryCodeToUse}"]`);
          if (countryOption && countryOption.href) {
            localStorage.setItem('hasVisited', 'true');
            window.location.replace(countryOption.href);
            return null;
          }
        }
        
        localStorage.setItem('hasVisited', 'true');
        return countryCodeToUse;
      } catch (error) {
        console.error('Failed to set default country:', error);
        // IP检测出错，使用默认选项并跳转
        const defaultOption = document.querySelector(`.country-selector__option[data-country-code="${this.defaultCountry}"]`);
        if (defaultOption && defaultOption.href) {
          localStorage.setItem('hasVisited', 'true');
          window.location.replace(defaultOption.href);
          return null;
        }
        localStorage.setItem('hasVisited', 'true');
        return this.defaultCountry;
      }
    }

    // 如果未启用IP检测，使用默认选项并跳转
    const defaultOption = document.querySelector(`.country-selector__option[data-country-code="${this.defaultCountry}"]`);
    if (defaultOption && defaultOption.href) {
      localStorage.setItem('hasVisited', 'true');
      window.location.replace(defaultOption.href);
      return null;
    }
    localStorage.setItem('hasVisited', 'true');
    return this.defaultCountry;
  }

  async getCountryByIp() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.country_code.toLowerCase();
    } catch (error) {
      console.error('IP detection failed:', error);
      return null;
    }
  }

  isMobileDevice() {
    return window.innerWidth <= 768;
  }

  initializeSelector(selectorElement) {
    const trigger = selectorElement.querySelector('[data-country-selector-trigger]');
    const modal = selectorElement.querySelector('[data-country-selector-modal]');
    const closeButton = selectorElement.querySelector('[data-country-selector-close]');
    const options = selectorElement.querySelectorAll('.country-selector__option');

    // 打开模态框
    trigger.addEventListener('click', () => {
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('country-selector__modal--visible'), 10);
      options[0].focus();
    });

    // 关闭模态框
    const closeModal = () => {
      modal.classList.remove('country-selector__modal--visible');
      setTimeout(() => modal.style.display = 'none', 300);
    };

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
      }
    });

    // 键盘焦点管理
    options.forEach((option, index) => {
      option.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && index < options.length - 1) {
          options[index + 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
          options[index - 1].focus();
        } else if (e.key === 'ArrowDown' && index + 3 < options.length) {
          options[index + 3].focus();
        } else if (e.key === 'ArrowUp' && index - 3 >= 0) {
          options[index - 3].focus();
        }
      });

      // 添加点击事件处理
      option.addEventListener('click', () => {
        const countryCode = option.getAttribute('data-country-code');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('country', countryCode);
        window.location.href = currentUrl.toString();
      });
    });
  }

  moveSectionToPosition() {
    const isMobile = this.isMobileDevice();

    // 移除现有选择器
    document.querySelectorAll('[data-country-selector-section]').forEach(el => el.remove());

    // 创建选择器实例
    const pcSelector = this.section.cloneNode(true);
    const mobileSelector = this.section.cloneNode(true);
    mobileSelector.classList.add('mobile-country-selector');

    // 初始化选择器
    this.initializeSelector(pcSelector);
    this.initializeSelector(mobileSelector);

    // 插入PC端选择器
    let pcInserted = false;
    if (this.insertPosition === 'custom' && this.customSelector) {
      const targetElement = document.querySelector(this.customSelector);
      if (targetElement) {
        targetElement.appendChild(pcSelector);
        pcInserted = true;
      }
    } else if (this.insertPosition === 'header') {
      const header = document.querySelector('.header-item--icons');
      if (header) {
        header.insertBefore(pcSelector, header.firstChild);
        pcInserted = true;
      }
    } else if (this.insertPosition === 'footer') {
      const footer = document.querySelector('.footer-info .grid');
      if (footer) {
        footer.appendChild(pcSelector);
        pcInserted = true;
      }
    }

    // 插入移动端选择器
    let mobileInserted = false;
    if (this.mobileInsertPosition === 'custom' && this.mobileCustomSelector) {
      const targetElement = document.querySelector(this.mobileCustomSelector);
      if (targetElement) {
        targetElement.appendChild(mobileSelector);
        mobileInserted = true;
      }
    } else if (this.mobileInsertPosition === 'header') {
      const header = document.querySelector('.slide-nav.e_slide-nav');
      if (header) {
        header.appendChild(mobileSelector);
        mobileInserted = true;
      }
    } else if (this.mobileInsertPosition === 'footer') {
      const footer = document.querySelector('.footer-info .grid');
      if (footer) {
        footer.appendChild(mobileSelector);
        mobileInserted = true;
      }
    }

    // 显示/隐藏选择器
    document.querySelectorAll('[data-country-selector-section]').forEach(el => {
      if (el.classList.contains('mobile-country-selector')) {
        if (mobileInserted) {
          el.style.display = isMobile ? 'block' : 'none';
          el.classList.add('country-selector--visible');
        } else {
          el.style.display = 'none';
          el.classList.remove('country-selector--visible');
        }
      } else {
        if (pcInserted) {
          el.style.display = isMobile ? 'none' : 'block';
          el.classList.add('country-selector--visible');
        } else {
          el.style.display = 'none';
          el.classList.remove('country-selector--visible');
        }
      }
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.moveSectionToPosition());
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new CountrySelector();
}); 
