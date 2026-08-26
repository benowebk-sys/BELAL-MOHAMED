const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

const loader=$('#loader'), pct=$('#percent'), bar=$('#loading-bar');
let progress=0;
const loadTimer=setInterval(()=>{
  progress+=Math.floor(Math.random()*9)+5;
  if(progress>=100){progress=100;clearInterval(loadTimer);setTimeout(()=>loader.classList.add('hide'),280)}
  pct.textContent=progress+'%';
  bar.style.width=progress+'%';
},55);

const currentYear=$('#currentYear');
if(currentYear) currentYear.textContent=new Date().getFullYear();

const menu=$('#menuPanel'), open=$('#menuButton'), close=$('#closeMenu');
const setMenuState=isOpen=>{
  menu.classList.toggle('open',isOpen);
  document.body.classList.toggle('menu-open',isOpen);
  menu.setAttribute('aria-hidden',String(!isOpen));
  open.setAttribute('aria-expanded',String(isOpen));
  menu.toggleAttribute('inert',!isOpen);
  if(isOpen) setTimeout(()=>close.focus(),350);
};
open.addEventListener('click',()=>setMenuState(!menu.classList.contains('open')));
close.addEventListener('click',()=>{setMenuState(false);open.focus()});
$$('[data-close]').forEach(a=>a.addEventListener('click',()=>setMenuState(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){setMenuState(false);open.focus()}});

$$('.service-head').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.service-item').classList.toggle('active')));

const preview=$('#previewImage');
$$('.work-row').forEach(row=>{
  const show=()=>{
    const src=row.dataset.image;
    if(!src) return;
    preview.onload=()=>preview.classList.add('show');
    preview.onerror=()=>preview.classList.remove('show');
    preview.src=src;
  };
  const hide=()=>preview.classList.remove('show');
  const showOnClick=event=>{
    event.preventDefault();
    show();
    document.querySelector('.work-preview')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  row.addEventListener('mouseenter',show);
  row.addEventListener('mouseleave',hide);
  row.addEventListener('focus',show);
  row.addEventListener('blur',hide);
  row.addEventListener('click',showOnClick);
});

const cursor=$('#cursor');
window.addEventListener('mousemove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}});
$$('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor?.classList.add('is-view'));
  el.addEventListener('mouseleave',()=>cursor?.classList.remove('is-view'));
});
$$('.work-row').forEach(el=>{
  el.addEventListener('mouseenter',()=>{if(cursor) cursor.querySelector('span').textContent='VIEW'});
});

const io=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
$$('.reveal').forEach((el,i)=>{el.style.transitionDelay=Math.min((i%5)*55,220)+'ms';io.observe(el)});

let lastScroll=window.scrollY;
window.addEventListener('scroll',()=>{
  const now=window.scrollY;
  document.body.classList.toggle('scrolled',now>30);
  lastScroll=now;
},{passive:true});
