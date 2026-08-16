(function () {
  "use strict";

  const body = document.body;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");
  const announcement = document.querySelector("[data-announcement]");
  const announcementClose = document.querySelector("[data-announcement-close]");

  function setNavigation(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-open", open);
    body.classList.toggle("nav-open", open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavigation(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 832) setNavigation(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navToggle?.getAttribute("aria-expanded") === "true") {
      setNavigation(false);
      navToggle.focus();
    }
  });

  if (announcement && announcementClose) {
    announcementClose.addEventListener("click", function () {
      announcement.hidden = true;
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });

  const filterButtons = Array.from(document.querySelectorAll("[data-team-filter]"));
  const teamCards = Array.from(document.querySelectorAll("[data-specialty]"));
  const filterStatus = document.querySelector("[data-filter-status]");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selected = button.dataset.teamFilter;

      filterButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });

      let visibleCount = 0;
      teamCards.forEach(function (card) {
        const visible = selected === "all" || card.dataset.specialty === selected;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (filterStatus) {
        filterStatus.textContent = `${visibleCount} team member${visibleCount === 1 ? "" : "s"} shown.`;
      }
    });
  });

  const galleryItems = Array.from(document.querySelectorAll("[data-gallery-item]"));
  const galleryDialog = document.querySelector("[data-gallery-dialog]");
  const galleryImage = galleryDialog?.querySelector("[data-gallery-image]");
  const galleryTitle = galleryDialog?.querySelector("[data-gallery-title]");
  const galleryDescription = galleryDialog?.querySelector("[data-gallery-description]");
  const galleryClose = galleryDialog?.querySelector("[data-gallery-close]");
  const galleryPrevious = galleryDialog?.querySelector("[data-gallery-previous]");
  const galleryNext = galleryDialog?.querySelector("[data-gallery-next]");
  let currentGalleryIndex = 0;

  function updateGallery(index) {
    if (!galleryDialog || !galleryImage || !galleryTitle || !galleryDescription || !galleryItems.length) return;
    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    const sourceImage = item.querySelector("img");
    galleryImage.src = item.dataset.full || sourceImage.src;
    galleryImage.alt = sourceImage.alt;
    galleryTitle.textContent = item.dataset.title;
    galleryDescription.textContent = item.dataset.description;
  }

  function openGallery(index) {
    if (!galleryDialog) return;
    updateGallery(index);
    if (typeof galleryDialog.showModal === "function") {
      galleryDialog.showModal();
    } else {
      galleryDialog.setAttribute("open", "");
    }
    galleryClose?.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openGallery(index);
    });
  });

  galleryClose?.addEventListener("click", function () {
    galleryDialog.close();
  });
  galleryPrevious?.addEventListener("click", function () {
    updateGallery(currentGalleryIndex - 1);
  });
  galleryNext?.addEventListener("click", function () {
    updateGallery(currentGalleryIndex + 1);
  });

  galleryDialog?.addEventListener("click", function (event) {
    if (event.target === galleryDialog) galleryDialog.close();
  });

  galleryDialog?.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") updateGallery(currentGalleryIndex - 1);
    if (event.key === "ArrowRight") updateGallery(currentGalleryIndex + 1);
  });

  galleryDialog?.addEventListener("close", function () {
    galleryItems[currentGalleryIndex]?.focus();
  });

  const appointmentForm = document.querySelector("[data-appointment-form]");

  if (appointmentForm) {
    const status = appointmentForm.querySelector("[data-form-status]");
    const submitButton = appointmentForm.querySelector("button[type='submit']");
    const fields = Array.from(appointmentForm.querySelectorAll("input, select, textarea"));

    const messages = {
      valueMissing: "Please complete this field.",
      typeMismatch: "Please enter a valid email address.",
      patternMismatch: "Please use an Australian phone format, for example 0412 345 678.",
      tooShort: "Please provide a little more detail."
    };

    function getMessage(field) {
      if (field.validity.valueMissing) return messages.valueMissing;
      if (field.validity.typeMismatch) return messages.typeMismatch;
      if (field.validity.patternMismatch) return messages.patternMismatch;
      if (field.validity.tooShort) return messages.tooShort;
      return field.validationMessage || "Please review this field.";
    }

    function validateField(field) {
      const error = appointmentForm.querySelector(`#${field.id}-error`);
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (error) error.textContent = valid ? "" : getMessage(field);
      return valid;
    }

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
      field.addEventListener("change", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    const dateField = appointmentForm.querySelector("#preferred-date");
    if (dateField) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateField.min = tomorrow.toISOString().slice(0, 10);
    }

    appointmentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const invalidFields = fields.filter(function (field) {
        return !validateField(field);
      });

      if (invalidFields.length) {
        status.className = "form-status is-error";
        status.textContent = `Please correct ${invalidFields.length} highlighted field${invalidFields.length === 1 ? "" : "s"} before continuing.`;
        invalidFields[0].focus();
        return;
      }

      submitButton.disabled = true;
      status.className = "form-status is-success";
      status.textContent = "Request received in this demonstration. No information was sent or stored.";
      appointmentForm.reset();
      fields.forEach(function (field) {
        field.setAttribute("aria-invalid", "false");
        const error = appointmentForm.querySelector(`#${field.id}-error`);
        if (error) error.textContent = "";
      });
      submitButton.disabled = false;
      status.focus();
    });

    appointmentForm.addEventListener("reset", function () {
      window.setTimeout(function () {
        fields.forEach(function (field) {
          field.setAttribute("aria-invalid", "false");
          const error = appointmentForm.querySelector(`#${field.id}-error`);
          if (error) error.textContent = "";
        });
        status.className = "form-status";
        status.textContent = "";
      }, 0);
    });
  }
})();
