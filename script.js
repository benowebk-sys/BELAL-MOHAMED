const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

const loader=$('#loader'), pct=$('#percent'), bar=$('#loading-bar');

if(loader && pct && bar){
  let progress=0;
  let loadTimer=null;

  const setProgress=(value)=>{
    progress=Math.min(Math.max(value,0),100);
    pct.textContent=Math.round(progress)+'%';
    bar.style.width=progress+'%';
  };

  const finishLoader=()=>{
    setProgress(100);
    clearInterval(loadTimer);
    loader.classList.add('is-hidden');
    setTimeout(()=>loader.remove(),380);
  };

  loadTimer=setInterval(()=>{
    if(progress >= 100) return;

    const step=Math.random()*10+8;
    setProgress(progress + step);

    if(progress >= 100){
      finishLoader();
    }
  },70);

  window.addEventListener('load', finishLoader, { once: true });
  setTimeout(()=>{
    if(progress < 100) finishLoader();
  }, 2200);
}

const currentYear=$('#currentYear');
if(currentYear) currentYear.textContent=new Date().getFullYear();

const menu=$('#menuPanel'), open=$('#menuButton'), close=$('#closeMenu'), backdrop=$('.menu-backdrop');
const setMenuState=isOpen=>{
  menu.classList.toggle('open',isOpen);
  document.body.classList.toggle('menu-open',isOpen);
  menu.setAttribute('aria-hidden',String(!isOpen));
  open.setAttribute('aria-expanded',String(isOpen));
  open.setAttribute('aria-label',isOpen?'Close navigation menu':'Open navigation menu');
  menu.toggleAttribute('inert',!isOpen);
  if(isOpen) setTimeout(()=>close.focus(),350);
  else open.focus();
};
open.addEventListener('click',()=>setMenuState(!menu.classList.contains('open')));
close.addEventListener('click',()=>setMenuState(false));
backdrop.addEventListener('click',()=>setMenuState(false));
$$('[data-close]').forEach(a=>a.addEventListener('click',()=>setMenuState(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open'))setMenuState(false)});

$$('.service-head').forEach(btn=>btn.addEventListener('click',()=>{
  const isExpanded=btn.closest('.service-item').classList.toggle('active');
  btn.setAttribute('aria-expanded',String(isExpanded));
  document.getElementById(btn.getAttribute('aria-controls')).setAttribute('aria-hidden',String(!isExpanded));
}));

const preview=$('#previewImage');
const previewLink=$('#previewLink');
const previewPlaceholder=$('.preview-placeholder');
const selectProject=row=>{
  const {image,link}=row.dataset;
  if(!image) return;

  const previewCard=preview.closest('.work-preview');
  previewCard.classList.remove('has-image');
  previewCard.style.minHeight='';
  preview.classList.remove('show');
  previewLink.hidden=true;
  previewPlaceholder.hidden=false;
  preview.alt=`Preview of ${row.querySelector('h3').textContent}`;
  preview.onload=()=>{
    previewCard.classList.add('has-image');
    previewCard.style.minHeight='0';
    preview.classList.add('show');
    previewPlaceholder.hidden=true;
    if(link){
      previewLink.href=link;
      previewLink.hidden=false;
    }else{
      previewLink.removeAttribute('href');
    }
  };
  preview.onerror=()=>{
    previewCard.classList.remove('has-image');
    previewCard.style.minHeight='';
    preview.classList.remove('show');
    previewLink.hidden=true;
    previewPlaceholder.hidden=false;
  };
  preview.src=image;
};
$$('.work-row').forEach(row=>{
  row.addEventListener('focus',()=>selectProject(row));
  row.addEventListener('click',event=>{
    event.preventDefault();
    selectProject(row);
    document.querySelector('.work-preview')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
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
  const scrollableHeight=document.documentElement.scrollHeight-window.innerHeight;
  document.documentElement.style.setProperty('--scroll-progress',`${scrollableHeight>0?now/scrollableHeight*100:0}%`);
  lastScroll=now;
},{passive:true});

const sectionLinks=new Map(Array.from($$('.menu-panel nav a'),link=>[link.hash,link]));
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    sectionLinks.forEach(link=>{
      const isCurrent=link.hash===`#${entry.target.id}`;
      link.classList.toggle('is-current',isCurrent);
      if(isCurrent) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  });
},{rootMargin:'-25% 0px -60% 0px'});
$$('main > section[id]').forEach(section=>sectionObserver.observe(section));
