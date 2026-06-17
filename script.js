
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initReveal();
  initAccordion();
  initAdminPanel();
  initMobileNav();
  initNavbarShadowOnScroll();
});
 
/* ---------------------------------------------------
   1. Floating background particles
   (hearts · sparkles · confetti squares)
--------------------------------------------------- */
function initParticles(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  let particles = [];
  let width, height;
 
  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  }
 
  const colors = ['#ff4f9a', '#ff8cc0', '#ffd1e8', '#ffffff'];
 
  function rand(min, max){ return Math.random() * (max - min) + min; }
 
  function makeParticle(){
    const type = Math.random();
    const kind = type < 0.4 ? 'heart' : type < 0.75 ? 'sparkle' : 'confetti';
    return {
      kind,
      x: rand(0, width),
      y: rand(0, height),
      size: kind === 'confetti' ? rand(4, 8) : rand(6, 14),
      speedY: rand(0.12, 0.4),
      speedX: rand(-0.25, 0.25),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.01, 0.01),
      opacity: rand(0.18, 0.55),
      color: colors[Math.floor(rand(0, colors.length))],
      flicker: rand(0, Math.PI * 2)
    };
  }
 
  function initList(){
    const count = reduceMotion ? 0 : Math.min(70, Math.floor((width * height) / 38000));
    particles = Array.from({ length: count }, makeParticle);
  }
 
  function drawHeart(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    const s = p.size / 14;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.bezierCurveTo(-7 * s, -3 * s, -3.5 * s, -8 * s, 0, -2 * s);
    ctx.bezierCurveTo(3.5 * s, -8 * s, 7 * s, -3 * s, 0, 4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
 
  function drawSparkle(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const flicker = (Math.sin(p.flicker) + 1) / 2;
    ctx.globalAlpha = p.opacity * (0.4 + flicker * 0.6);
    ctx.fillStyle = p.color;
    const s = p.size / 2;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s / 4, -s / 4);
    ctx.lineTo(s, 0);
    ctx.lineTo(s / 4, s / 4);
    ctx.lineTo(0, s);
    ctx.lineTo(-s / 4, s / 4);
    ctx.lineTo(-s, 0);
    ctx.lineTo(-s / 4, -s / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
 
  function drawConfetti(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
 
  function tick(){
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      p.flicker += 0.04;
      if(p.y < -20){ p.y = height + 20; p.x = rand(0, width); }
      if(p.x < -20) p.x = width + 20;
      if(p.x > width + 20) p.x = -20;
 
      if(p.kind === 'heart') drawHeart(p);
      else if(p.kind === 'sparkle') drawSparkle(p);
      else drawConfetti(p);
    });
    if(!reduceMotion) requestAnimationFrame(tick);
  }
 
  resize();
  initList();
  tick();
 
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); initList(); }, 200);
  });
}
 
/* ---------------------------------------------------
   2. Reveal-on-scroll
--------------------------------------------------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
 
  items.forEach(item => observer.observe(item));
}
 
/* ---------------------------------------------------
   3. Rules accordion (single-open behaviour)
--------------------------------------------------- */
function initAccordion(){
  const accordion = document.getElementById('accordion');
  if(!accordion) return;
  const items = accordion.querySelectorAll('.accordion-item');
 
  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
 
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
 
      items.forEach(other => {
        if(other !== item){
          other.classList.remove('active');
          other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });
 
      if(isOpen){
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        panel.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
 
  window.addEventListener('resize', () => {
    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const panel = item.querySelector('.accordion-panel');
      if(trigger.getAttribute('aria-expanded') === 'true'){
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}
 
/* ---------------------------------------------------
   4. Admin panel toggle
--------------------------------------------------- */
function initAdminPanel(){
  const toggle = document.getElementById('adminToggle');
  const panel = document.getElementById('adminPanel');
  if(!toggle || !panel) return;
 
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    panel.classList.toggle('open', !isOpen);
 
    if(!isOpen){
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  });
}
 
/* ---------------------------------------------------
   5. Mobile navigation
--------------------------------------------------- */
function initMobileNav(){
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if(!toggle || !links) return;
 
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
 
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
 
/* ---------------------------------------------------
   6. Subtle navbar shadow on scroll
--------------------------------------------------- */
function initNavbarShadowOnScroll(){
  const navbar = document.getElementById('navbar');
  if(!navbar) return;
  window.addEventListener('scroll', () => {
    if(window.scrollY > 12){
      navbar.style.boxShadow = '0 10px 30px -16px rgba(255,46,146,0.45)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}