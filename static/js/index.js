/* =========================================================
   TripPulse — index.js
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Navbar mobile toggle ─────────────────────────── */
    const toggle = document.getElementById('navbarToggle');
    const menu   = document.getElementById('navbarMenu');
  
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        const icon = toggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      });
  
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('open');
          const icon = toggle.querySelector('i');
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    }
  
    /* ── Dropdown (click on mobile, hover on desktop) ── */
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.dropdown');
        dropdown.classList.toggle('open');
      });
    });
  
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    });
  
    /* ── Auto-dismiss alerts ──────────────────────────── */
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      // Auto dismiss after 4s
      setTimeout(() => dismissAlert(alert), 4000);
  
      const closeBtn = alert.querySelector('.alert-close');
      if (closeBtn) closeBtn.addEventListener('click', () => dismissAlert(alert));
    });
  
    function dismissAlert(alert) {
      alert.style.transition = 'opacity .3s ease, transform .3s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateX(30px)';
      setTimeout(() => alert.remove(), 300);
    }
  
    /* ── Password visibility toggle ──────────────────── */
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input    = document.getElementById(targetId);
        if (!input) return;
  
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
  
        const icon = btn.querySelector('i');
        icon.classList.toggle('fa-eye',      !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
      });
    });
  
    /* ── Avatar preview on file select ───────────────── */
    const avatarInput = document.getElementById('id_avatar');
    if (avatarInput) {
      const avatarClearInput = document.getElementById('id_avatar-clear');
      const avatarDeleteBtn = document.getElementById('avatarDeleteBtn');

      if (avatarDeleteBtn && avatarClearInput) {
        avatarDeleteBtn.addEventListener('click', () => {
          avatarClearInput.checked = true;
          avatarInput.value = '';
          const preview = document.getElementById('avatarPreview');
          if (!preview) return;

          if (preview.tagName === 'IMG') {
            const placeholder = document.createElement('div');
            placeholder.id = 'avatarPreview';
            placeholder.className = 'avatar-preview-placeholder';
            placeholder.innerHTML = '<i class="fa fa-user"></i>';
            preview.replaceWith(placeholder);
          }
        });
      }

      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (avatarClearInput) {
          avatarClearInput.checked = false;
        }
  
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('avatarPreview');
          if (!preview) return;
  
          if (preview.tagName === 'IMG') {
            preview.src = ev.target.result;
          } else {
            // Replace placeholder div with img
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.id  = 'avatarPreview';
            img.alt = 'Avatar preview';
            img.classList.add('avatar-preview');
            preview.replaceWith(img);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  
    /* ── Confirm delete dialogs ───────────────────────── */
    document.querySelectorAll('[data-confirm]').forEach(el => {
      el.addEventListener('click', (e) => {
        const msg = el.dataset.confirm || 'Are you sure?';
        if (!confirm(msg)) e.preventDefault();
      });
    });
  
    /* ── Active nav link highlight ────────────────────── */
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-menu a').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  
    /* ── Like button AJAX ─────────────────────────────── */
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const postId   = btn.dataset.postId;
        const csrfToken = getCookie('csrftoken');
  
        try {
          const res = await fetch(`/posts/${postId}/like/`, {
            method: 'POST',
            headers: {
              'X-CSRFToken': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
  
          if (res.status === 403) {
            window.location.href = `/users/login/?next=/posts/${postId}/`;
            return;
          }
  
          const data = await res.json();
          const icon  = btn.querySelector('i');
          const count = btn.querySelector('.like-count');
  
          if (data.liked) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('liked');
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('liked');
          }
  
          if (count) count.textContent = data.count;
        } catch (err) {
          console.error('Like error:', err);
        }
      });
    });
  
    /* ── Bookmark button AJAX ─────────────────────────── */
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const postId    = btn.dataset.postId;
        const csrfToken = getCookie('csrftoken');
  
        try {
          const res = await fetch(`/posts/${postId}/bookmark/`, {
            method: 'POST',
            headers: {
              'X-CSRFToken': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
  
          if (res.status === 403) {
            window.location.href = `/users/login/?next=/posts/${postId}/`;
            return;
          }
  
          const data = await res.json();
          const icon  = btn.querySelector('i');
          const label = btn.querySelector('.bookmark-label');
          const savedLabel = btn.dataset.labelSaved || 'Saved';
          const unsavedLabel = btn.dataset.labelUnsaved || 'Save';

          if (data.bookmarked) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('bookmarked');
            if (label) label.textContent = savedLabel;
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('bookmarked');
            if (label) label.textContent = unsavedLabel;

            // On Saved Posts page, remove the card immediately after unsave.
            if (savedLabel === 'Unsave') {
              const card = btn.closest('.post-card');
              if (card) card.remove();
              window.location.reload();
            }
          }
        } catch (err) {
          console.error('Bookmark error:', err);
        }
      });
    });
  
    /* ── Place search autocomplete (create post) ──────── */
    const placeSearch  = document.getElementById('placeSearch');
    const placeResults = document.getElementById('placeResults');
    const placeIdInput = document.getElementById('id_place');
    const newPlaceSection = document.getElementById('newPlaceSection');
    const newPlaceNameInput = document.getElementById('id_new_place_name');
    const toggleNewPlace = document.getElementById('toggleNewPlace');

    if (placeSearch && placeResults) {
      let debounceTimer;

      function hidePlaceResults() {
        placeResults.innerHTML = '';
        placeResults.style.display = 'none';
      }

      function showNewPlaceSection(prefillName = '') {
        if (!newPlaceSection) return;
        newPlaceSection.style.display = 'block';
        if (newPlaceNameInput && prefillName) {
          newPlaceNameInput.value = prefillName;
        }
        if (placeIdInput) placeIdInput.value = '';
      }

      function hideNewPlaceSection() {
        if (!newPlaceSection) return;
        newPlaceSection.style.display = 'none';
      }

      function selectPlace(place) {
        placeSearch.value = place.name;
        if (placeIdInput) placeIdInput.value = place.id;
        hideNewPlaceSection();
        hidePlaceResults();
      }

      async function renderPlaceResults(query) {
        const isDefaultList = !query;
        const limit = isDefaultList ? 5 : 8;

        try {
          const res = await fetch(`/posts/places/search/?q=${encodeURIComponent(query)}&limit=${limit}`);
          const data = await res.json();
          const places = data.places || [];
          placeResults.innerHTML = '';

          if (!places.length && !query) {
            hidePlaceResults();
            return;
          }

          if (!places.length && query) {
            const empty = document.createElement('div');
            empty.className = 'autocomplete-empty';
            empty.textContent = 'No matching places found.';
            placeResults.appendChild(empty);
          }

          places.forEach((place) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            const countryText = place.country ? ` - ${place.country}` : '';
            item.innerHTML = `<div class="place-item-main">${place.name}</div><div class="place-item-sub">${countryText}</div>`;
            item.addEventListener('click', () => selectPlace(place));
            placeResults.appendChild(item);
          });

          const exactExists = places.some((p) => p.name.toLowerCase() === query.toLowerCase());
          if (query && !exactExists) {
            const addNew = document.createElement('button');
            addNew.type = 'button';
            addNew.className = 'autocomplete-item autocomplete-add-new';
            addNew.innerHTML = `<i class="fa fa-plus-circle"></i> Create "${query}"`;
            addNew.addEventListener('click', () => {
              showNewPlaceSection(query);
              hidePlaceResults();
            });
            placeResults.appendChild(addNew);
          }

          placeResults.style.display = 'block';
        } catch (err) {
          console.error('Place search error:', err);
        }
      }

      placeSearch.addEventListener('focus', () => {
        renderPlaceResults(placeSearch.value.trim());
      });

      placeSearch.addEventListener('click', () => {
        renderPlaceResults(placeSearch.value.trim());
      });

      placeSearch.addEventListener('input', () => {
        if (placeIdInput) placeIdInput.value = '';
        clearTimeout(debounceTimer);
        const query = placeSearch.value.trim();
        debounceTimer = setTimeout(() => renderPlaceResults(query), 200);
      });

      if (toggleNewPlace) {
        toggleNewPlace.addEventListener('click', () => {
          showNewPlaceSection(placeSearch.value.trim());
        });
      }

      document.addEventListener('click', (e) => {
        if (!placeSearch.contains(e.target) && !placeResults.contains(e.target)) {
          hidePlaceResults();
        }
      });
    }

    const starPicker = document.querySelector('.star-picker');
    if (starPicker) {
      const stars  = starPicker.querySelectorAll('.star-option');
      const hidden = document.getElementById('id_rating');
  
      stars.forEach((star, idx) => {
        star.addEventListener('mouseenter', () => highlightStars(stars, idx));
        star.addEventListener('mouseleave', () => {
          const val = hidden ? parseInt(hidden.value) : 0;
          highlightStars(stars, val - 1);
        });
        star.addEventListener('click', () => {
          if (hidden) hidden.value = idx + 1;
          highlightStars(stars, idx);
          stars.forEach(s => s.classList.remove('selected'));
          for (let i = 0; i <= idx; i++) stars[i].classList.add('selected');
        });
      });
  
      function highlightStars(stars, upTo) {
        stars.forEach((s, i) => {
          const icon = s.querySelector('i');
          if (i <= upTo) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
          }
        });
      }
    }
  
    /* ── Smooth scroll for anchor links ──────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  
    /* ── Helper: get cookie ───────────────────────────── */
    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
          cookie = cookie.trim();
          if (cookie.startsWith(name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          }
        });
      }
      return cookieValue;
    }
  
  });


  document.addEventListener('DOMContentLoaded', () => {

  /* Tab switching (My Posts page) */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  /* Photo upload preview (post form) */
  const photoInput = document.getElementById('id_photo');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const area = photoInput.closest('.photo-upload-area');
        let preview = area.querySelector('.photo-preview-img');
        if (!preview) {
          preview = document.createElement('img');
          preview.className = 'photo-preview-img';
          area.appendChild(preview);
        }
        preview.src = ev.target.result;
        area.querySelector('i').style.display = 'none';
        area.querySelector('p').style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }

});
