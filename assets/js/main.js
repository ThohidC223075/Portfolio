/* =============================================================
   Thofiqul Islam — Portfolio
   main.js — shared, framework-free behaviour
   -------------------------------------------------------------
   Responsibilities:
     1. Mobile navigation toggle (accessible)
     2. Active link highlighting per page
     3. Sticky navbar elevation on scroll
     4. Scroll-reveal animations (IntersectionObserver)
     5. Animated statistic counters
     6. Footer year stamp
     7. Progressive-enhancement contact form
   All behaviour degrades gracefully when JS is disabled.
   ============================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
	   1. Mobile navigation toggle
	   --------------------------------------------------------- */
  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu after selecting a destination (mobile UX).
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
	   2. Active link highlighting
	   Matches the current filename against each nav link.
	   --------------------------------------------------------- */
  function initActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------------------------------------------------------
	   3. Sticky navbar elevation on scroll
	   --------------------------------------------------------- */
  function initScrollHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
	   4. Scroll-reveal animations
	   Subtle fade + rise. Falls back to visible if unsupported
	   or if the user prefers reduced motion.
	   --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------
	   5. Animated statistic counters
	   Counts up to the value in data-count when scrolled into view.
	   --------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = el.getAttribute("data-decimals") | 0 || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";

      if (reduced) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }

      var duration = 1400;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    var obs = new IntersectionObserver(
      function (entries, o) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ---------------------------------------------------------
	   6. Footer year stamp
	   --------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
	   7. Contact form (client-side validation only)
	   No backend: provides graceful, accessible feedback.
	   --------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var note = form.querySelector(".form-note");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = (form.querySelector("#name") || {}).value || "there";
      if (note) {
        note.textContent =
          "Thanks, " +
          name.split(" ")[0] +
          "! Your message is ready — connect this form to your email service to go live.";
      }
      form.reset();
    });
  }

  /* ---------------------------------------------------------
	   8. Achievements tabs (accessible)
	   Toggles the active tab button + panel on click.
	   --------------------------------------------------------- */
  function initTabs() {
    var buttons = document.querySelectorAll(".tab-btn");
    if (!buttons.length) return;

    function activate(btn) {
      var targetId = btn.getAttribute("data-tab");
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      document.querySelectorAll(".tab-panel").forEach(function (panel) {
        var on = panel.id === targetId;
        panel.classList.toggle("active", on);
        if (on) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        activate(btn);
      });
      // Arrow-key navigation between tabs.
      btn.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var dir = e.key === "ArrowRight" ? 1 : -1;
        var next = buttons[(i + dir + buttons.length) % buttons.length];
        activate(next);
        next.focus();
      });
    });
  }

  /* ---------------------------------------------------------
	   9. Achievements — live data from Google Sheets (gviz)
	   Each segment (tab) is filled from its own public sheet.
	   Sheet IDs are configured in achievements.html via
	   window.ACHIEVEMENT_SHEETS = { "tab-technical": "...", ... }
	   --------------------------------------------------------- */

  // Escape user/sheet text before injecting into the DOM.
  function escHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  // Emoji icon per known sub-category (falls back to a star).
  var ACH_ICONS = {
    hackathons: "⚡",
    "programming contests": "🧮",
    certifications: "📜",
    "blood donation activities": "🩸",
    "blood donation": "🩸",
    volunteering: "🤝",
    "community service": "🌱",
    "training programs": "🛠️",
    "ai/ml bootcamps": "🤖",
    seminars: "🎙️",
  };

  function initAchievements() {
    var sheetId = (window.ACHIEVEMENT_SHEET_ID || "").trim();
    var tabs = window.ACHIEVEMENT_SHEETS;
    if (!tabs || !document.querySelector(".ach-list")) return;

    Object.keys(tabs).forEach(function (panelId) {
      var panel = document.getElementById(panelId);
      if (!panel) return;
      var container = panel.querySelector(".ach-list");
      if (!container) return;

      if (!sheetId || /^PASTE_/.test(sheetId)) {
        container.innerHTML =
          '<p class="ach-status">⚠️ No Spreadsheet ID has been configured yet.</p>';
        return;
      }
      loadSheet(sheetId, (tabs[panelId] || "").toString().trim(), container);
    });
  }

  function loadSheet(sheetId, sheetName, container) {
    var url =
      "https://docs.google.com/spreadsheets/d/" +
      encodeURIComponent(sheetId) +
      "/gviz/tq?tqx=out:json&headers=1" +
      (sheetName ? "&sheet=" + encodeURIComponent(sheetName) : "");

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        var json = JSON.parse(
          text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1),
        );
        renderAchievements(parseSheetRows(json), container);
      })
      .catch(function (err) {
        container.innerHTML =
          '<p class="ach-status">❌ Unable to load data. (' +
          escHtml(err.message) +
          ")। Please check if the Google Sheet is publicly accessible.</p>";
      });
  }

  // Convert gviz table into an array of {category,title,description,image,badge}
  function parseSheetRows(json) {
    if (!json || !json.table) return [];
    var cols = (json.table.cols || []).map(function (c) {
      return (c.label || "").trim().toLowerCase();
    });
    return (json.table.rows || []).map(function (row) {
      var obj = {};
      cols.forEach(function (label, i) {
        if (!label) return;
        var cell = row.c && row.c[i];
        obj[label] = cell && cell.v != null ? cell.v : "";
      });
      return obj;
    });
  }

  function buildCard(item) {
    var title = (item.title || "").toString().trim();
    var desc = (item.description || "").toString().trim();
    var image = (item.image || "").toString().trim();
    var badge = (item.badge || "").toString().trim();

    var cover = image
      ? '<div class="ach-cover"><img src="' +
        escHtml(image) +
        '" alt="' +
        escHtml(title) +
        '" loading="lazy" referrerpolicy="no-referrer" /></div>'
      : '<div class="ach-cover ach-cover-empty"><span>' +
        escHtml((title.charAt(0) || "★").toUpperCase()) +
        "</span></div>";

    return (
      '<article class="ach-card reveal">' +
      cover +
      '<div class="ach-body">' +
      (badge ? '<span class="ach-badge">' + escHtml(badge) + "</span>" : "") +
      "<h4>" +
      escHtml(title) +
      "</h4>" +
      (desc ? "<p>" + escHtml(desc) + "</p>" : "") +
      "</div></article>"
    );
  }

  function renderAchievements(rows, container) {
    rows = rows.filter(function (r) {
      return (r.title || "").toString().trim() !== "";
    });

    if (!rows.length) {
      container.innerHTML =
        '<p class="ach-status">No information has been added yet. Please add a new row to the sheet.</p>';
      return;
    }

    // Group rows by category, preserving first-seen order.
    var groups = {};
    var order = [];
    rows.forEach(function (r) {
      var cat =
        (r.category || "Achievements").toString().trim() || "Achievements";
      if (!groups[cat]) {
        groups[cat] = [];
        order.push(cat);
      }
      groups[cat].push(r);
    });

    var html = order
      .map(function (cat) {
        var icon = ACH_ICONS[cat.toLowerCase()] || "★";
        var cards = groups[cat].map(buildCard).join("");
        return (
          '<div class="ach-subhead"><div class="card-icon">' +
          escHtml(icon) +
          "</div><h3>" +
          escHtml(cat) +
          '</h3></div><div class="grid grid-3">' +
          cards +
          "</div>"
        );
      })
      .join("");

    container.innerHTML = html;

    // Fade the freshly injected cards in.
    var revealed = container.querySelectorAll(".reveal");
    requestAnimationFrame(function () {
      revealed.forEach(function (el, i) {
        el.style.transitionDelay = (i % 3) * 80 + "ms";
        el.classList.add("in");
      });
    });
  }

  /* ---------------------------------------------------------
	   Initialise once the DOM is ready
	   --------------------------------------------------------- */
  function init() {
    initNavToggle();
    initActiveLink();
    initScrollHeader();
    initReveal();
    initCounters();
    initYear();
    initContactForm();
    initTabs();
    initAchievements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
