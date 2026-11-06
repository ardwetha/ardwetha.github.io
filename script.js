/* ============================================================
   ardwetha — landing page scripts
   particles + tiny terminal touches. no dependencies.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    /* matchMedia unavailable — assume full motion */
  }

  /* footer year, kept current automatically */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* typewriter for the hero eyebrow line */
  var typeline = document.getElementById("typeline");
  if (typeline && typeline.textContent && !reduceMotion) {
    var line = typeline.textContent;
    typeline.textContent = "";
    setTimeout(function () {
      var i = 0;
      var timer = setInterval(function () {
        i += 1;
        typeline.textContent = line.slice(0, i);
        if (i >= line.length) {
          clearInterval(timer);
        }
      }, 60);
    }, 750);
  }

  /* ---------------------------------------------------------
     particle field — drifting static on a canvas
     --------------------------------------------------------- */
  var canvas = document.getElementById("particles");
  if (!canvas) return;
  var ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  var w = 0;
  var h = 0;
  var particles = [];
  var LINK_DIST = 110;
  var mouse = { x: -9999, y: -9999 };

  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 12,
      driftX: (Math.random() - 0.5) * 0.2,
      driftY: -(0.05 + Math.random() * 0.3),
      pushX: 0,
      pushY: 0,
      r: 0.7 + Math.random() * 1.7,
      base: 0.22 + Math.random() * 0.5,
      twSpeed: 0.006 + Math.random() * 0.02,
      twPhase: Math.random() * Math.PI * 2
    };
  }

  function build() {
    var count = Math.min(130, Math.max(36, Math.floor((w * h) / 14000)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(spawn(true));
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function draw(t) {
    var i, j, p, q, dx, dy, d, a;

    ctx.clearRect(0, 0, w, h);

    /* move and draw the dots */
    for (i = 0; i < particles.length; i++) {
      p = particles[i];

      /* gentle push away from the cursor */
      dx = p.x - mouse.x;
      dy = p.y - mouse.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130 && d > 0.001) {
        var s = (1 - d / 130) * 0.45;
        p.pushX += (dx / d) * s;
        p.pushY += (dy / d) * s;
      }
      p.pushX *= 0.9;
      p.pushY *= 0.9;
      p.x += p.driftX + p.pushX;
      p.y += p.driftY + p.pushY;

      /* drifted off the top (or sides) — re-enter from below */
      if (p.y < -14 || p.x < -14 || p.x > w + 14) {
        p = particles[i] = spawn(false);
      }

      a = p.base * (0.55 + 0.45 * Math.sin(t * p.twSpeed + p.twPhase));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#dcdcdc";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* faint constellation links between close particles */
    ctx.strokeStyle = "#ababab";
    ctx.lineWidth = 1;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      for (j = i + 1; j < particles.length; j++) {
        q = particles[j];
        dx = p.x - q.x;
        dy = p.y - q.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.14;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  function loop(t) {
    draw(t);
    window.requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    draw(1200); /* one calm, static frame */
  } else {
    window.requestAnimationFrame(loop);
  }

  /* the cursor disturbs the static */
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("pointerleave", function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* a click sends a little shockwave through the particles */
  window.addEventListener("pointerdown", function (e) {
    if (reduceMotion) return;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var dx = p.x - e.clientX;
      var dy = p.y - e.clientY;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 200 && d > 0.001) {
        var s = (1 - d / 200) * 4.5;
        p.pushX += (dx / d) * s;
        p.pushY += (dy / d) * s;
      }
    }
  });
})();
