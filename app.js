(function(){document.documentElement.classList.add('js');
var d=document.getElementById('depth');
function dp(){var m=document.documentElement.scrollHeight-innerHeight;d.textContent=Math.round(Math.min(1,scrollY/Math.max(m,1))*200)}
addEventListener('scroll',dp,{passive:true});dp();
var L='de';try{L=localStorage.getItem('gk')||'de'}catch(e){}
function set(l){L=l;document.documentElement.lang=l;document.querySelectorAll('[data-en]').forEach(function(el){if(el.dataset.de==null)el.dataset.de=el.textContent;el.textContent=l=='en'?el.dataset.en:el.dataset.de});document.getElementById('lang').textContent=l=='en'?'DE':'EN';try{localStorage.setItem('gk',l)}catch(e){}}
document.getElementById('lang').onclick=function(){set(L=='en'?'de':'en')};if(L=='en')set('en');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)})})();
