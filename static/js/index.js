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
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
  
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
  
          if (data.bookmarked) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('bookmarked');
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('bookmarked');
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
  
    if (placeSearch && placeResults) {
      let debounceTimer;
  
      placeSearch.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = placeSearch.value.trim();
  
        if (q.length < 2) {
          placeResults.innerHTML = '';
          placeResults.style.display = 'none';
          return;
        }
  
        debounceTimer = setTimeout(async () => {
          try {
            const res  = await fetch(`/posts/places/search/?q=${encodeURIComponent(q)}`);
            const data = await res.json();
  
            placeResults.innerHTML = '';
            if (data.places && data.places.length > 0) {
              data.places.forEach(place => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = place.name + (place.country ? ` — ${place.country}` : '');
                item.addEventListener('click', () => {
                  placeSearch.value  = place.name;
                  placeIdInput.value = place.id;
                  placeResults.innerHTML = '';
                  placeResults.style.display = 'none';
                  // Hide "new place" form
                  const newPlaceSection = document.getElementById('newPlaceSection');
                  if (newPlaceSection) newPlaceSection.style.display = 'none';
                });
                placeResults.appendChild(item);
              });
  
              // "Add new place" option
              const addNew = document.createElement('div');
              addNew.className = 'autocomplete-item autocomplete-add-new';
              addNew.innerHTML = '<i class="fa fa-plus-circle"></i> Add "' + q + '" as a new place';
              addNew.addEventListener('click', () => {
                placeIdInput.value = '';
                placeResults.innerHTML = '';
                placeResults.style.display = 'none';
                const newPlaceSection = document.getElementById('newPlaceSection');
                if (newPlaceSection) {
                  newPlaceSection.style.display = 'block';
                  const nameField = document.getElementById('id_new_place_name');
                  if (nameField) nameField.value = q;
                }
              });
              placeResults.appendChild(addNew);
              placeResults.style.display = 'block';
            } else {
              placeResults.style.display = 'none';
            }
          } catch (err) {
            console.error('Place search error:', err);
          }
        }, 300);
      });
  
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!placeSearch.contains(e.target) && !placeResults.contains(e.target)) {
          placeResults.style.display = 'none';
        }
      });
    }
  
    /* ── Star rating picker ───────────────────────────── */
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