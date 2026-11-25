/*
@license
  Fetch by Archetype Themes (https://archetypethemes.co)
  Access unminified JS in assets/theme.js

  Use this event listener to run your own JS outside of this file.
  Documentation - https://help.archetypethemes.co/en/articles/206592

  document.addEventListener('page:loaded', function() {
    // Page has loaded and theme assets are ready
  });
*/

if (console && console.log) {
  console.log("Fetch theme (" + theme.settings.themeVersion + ") by ARCHΞTYPE | Learn more at https://archetypethemes.co");
}

(function () {
  "use strict";

  if (window.Shopify && window.Shopify.theme && navigator && navigator.sendBeacon && window.Shopify.designMode) {
    navigator.sendBeacon('https://api.archetypethemes.co/api/beacon', new URLSearchParams({
      shop: window.Shopify.shop,
      themeName: window.theme && window.theme.settings && `${window.theme.settings.themeName} v${window.theme.settings.themeVersion}`,
      role: window.Shopify.theme.role,
      route: window.location.pathname,
      themeId: window.Shopify.theme.id,
      themeStoreId: window.Shopify.theme.theme_store_id || 0,
      isThemeEditor: !!window.Shopify.designMode
    }))
  }

  theme.customerTemplates = function () {
    checkUrlHash();
    initEventListeners();
    resetPasswordSuccess();
    customerAddressForm();

    function checkUrlHash() {
      var hash = window.location.hash;

      // Allow deep linking to recover password form
      if (hash === '#recover') {
        toggleRecoverPasswordForm();
      }
    }

    function toggleRecoverPasswordForm() {
      var passwordForm = document.getElementById('RecoverPasswordForm').classList.toggle('hide');
      var loginForm = document.getElementById('CustomerLoginForm').classList.toggle('hide');
    }

    function initEventListeners() {
      // Show reset password form
      var recoverForm = document.getElementById('RecoverPassword');
      if (recoverForm) {
        recoverForm.addEventListener('click', function (evt) {
          evt.preventDefault();
          toggleRecoverPasswordForm();
        });
      }

      // Hide reset password form
      var hideRecoverPassword = document.getElementById('HideRecoverPasswordLink');
      if (hideRecoverPassword) {
        hideRecoverPassword.addEventListener('click', function (evt) {
          evt.preventDefault();
          toggleRecoverPasswordForm();
        });
      }
    }

    function resetPasswordSuccess() {
      var formState = document.querySelector('.reset-password-success');

      // check if reset password form was successfully submitted
      if (!formState) {
        return;
      }

      // show success message
      document.getElementById('ResetSuccess').classList.remove('hide');
    }

    function customerAddressForm() {
      var newAddressForm = document.getElementById('AddressNewForm');
      var addressForms = document.querySelectorAll('.js-address-form');

      if (!newAddressForm || !addressForms.length) {
        return;
      }

      // Country/province selector can take a short time to load
      setTimeout(function () {
        document.querySelectorAll('.js-address-country').forEach(el => {
          var countryId = el.dataset.countryId;
          var provinceId = el.dataset.provinceId;
          var provinceContainerId = el.dataset.provinceContainerId;

          new Shopify.CountryProvinceSelector(
            countryId,
            provinceId,
            {
              hideElement: provinceContainerId
            }
          );
        });
      }, 1000);

      // Toggle new/edit address forms
      document.querySelectorAll('.address-new-toggle').forEach(el => {
        el.addEventListener('click', function () {
          newAddressForm.classList.toggle('hide');
        });
      });

      document.querySelectorAll('.address-edit-toggle').forEach(el => {
        el.addEventListener('click', function (evt) {
          var formId = evt.currentTarget.dataset.formId;
          document.getElementById('EditAddress_' + formId).classList.toggle('hide');
        });
      });

      document.querySelectorAll('.address-delete').forEach(el => {
        el.addEventListener('click', function (evt) {
          var formId = evt.currentTarget.dataset.formId;
          var confirmMessage = evt.currentTarget.dataset.confirmMessage;

          if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
            if (Shopify) {
              Shopify.postLink('/account/addresses/' + formId, { parameters: { _method: 'delete' } });
            }
          }
        })
      });
    }
  };






  /*============================================================================
    Things that require DOM to be ready
  ==============================================================================*/
  function DOMready(callback) {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
  }

  DOMready(function () {
    if (theme.settings.isCustomerTemplate) {
      theme.customerTemplates();
    }

    document.dispatchEvent(new CustomEvent("page:loaded"));
  });
})();

const eee_mainContent = document.getElementById('Product-step');

// 检查元素是否存在
if (eee_mainContent) {
  let document_lastHeight = eee_mainContent.scrollHeight;

  const observerDocumentHeight = new ResizeObserver(() => {
    const currentHeight = eee_mainContent.scrollHeight;

    if (currentHeight !== document_lastHeight) {
      document_lastHeight = currentHeight;
      // console.log('document_lastHeight',document_lastHeight,'currentHeight',currentHeight)
      ScrollTrigger.refresh(); // 刷新 ScrollTrigger
    }
  });

  // 观察 #MainContent 元素
  observerDocumentHeight.observe(eee_mainContent);
}

// let document_lastHeight = document.body.scrollHeight;
// const observerDocumentHeight = new ResizeObserver(() => {
//     const currentHeight = document.body.scrollHeight;

//     if (currentHeight !== document_lastHeight) {
//         document_lastHeight = currentHeight; 
//         ScrollTrigger.refresh();
//     }
// });
// observerDocumentHeight.observe(document.body);



/* Hide on screens smaller than 768px */
// @media (max-width: 767px) {
//   .Slideshow-template--18015345967350__slideshow_eYwh94 {
//     display: none;
//   }
// }
