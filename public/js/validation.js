// Wanderlust Interactive Frontend Scripts

(function () {
  "use strict";

  // 1. Form Validation for all .needs-validation forms
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // 2. User Menu Dropdown Toggle
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");
  const userMenuWrapper = document.getElementById("userMenuWrapper");

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains("show");
      userDropdown.classList.toggle("show");
      userMenuBtn.setAttribute("aria-expanded", !isOpen);
    });

    document.addEventListener("click", (e) => {
      if (userMenuWrapper && !userMenuWrapper.contains(e.target)) {
        userDropdown.classList.remove("show");
        userMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 3. Tax Display Toggle with LocalStorage persistence
  const taxSwitch = document.getElementById("taxSwitch");
  if (taxSwitch) {
    // Restore saved state
    const savedTaxState = localStorage.getItem("wanderlust_tax_display");
    if (savedTaxState === "true") {
      taxSwitch.checked = true;
      document.body.classList.add("display-tax-active");
    }

    taxSwitch.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("display-tax-active");
        localStorage.setItem("wanderlust_tax_display", "true");
      } else {
        document.body.classList.remove("display-tax-active");
        localStorage.setItem("wanderlust_tax_display", "false");
      }
    });
  }

  // 4. Auto dismiss flash alerts after 5 seconds
  const flashAlerts = document.querySelectorAll(".alert");
  flashAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-10px)";
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });
})();

// 5. Global Wishlist Toggle Helper
function toggleWishlist(btn, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const icon = btn.querySelector("i");
  if (icon) {
    if (icon.classList.contains("fa-regular")) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      btn.classList.add("wishlist-active");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      btn.classList.remove("wishlist-active");
    }
  }
}

// 6. Live Image Preview for New & Edit forms
function updateImagePreview(url) {
  const preview = document.getElementById("imagePreview");
  if (preview) {
    const defaultUrl = "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200";
    if (url && url.trim().length > 10) {
      preview.src = url.trim();
    } else {
      preview.src = defaultUrl;
    }
  }
}

// 7. Toggle Password Visibility in Login & Signup
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
}