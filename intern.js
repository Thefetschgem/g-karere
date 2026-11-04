(function(){
var F=window.GK_DATA,$=function(i){return document.getElementById(i)};
var MO=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var done={};try{done=JSON.parse(localStorage.getItem('gk-done')||'{}')}catch(e){}
function save(){try{localStorage.setItem('gk-done',JSON.stringify(done))}catch(e){}}
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function fmt(s){var p=s.split('-');return p[2]+'.'+p[1]+'.'+p[0]}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var P,dept='Alle';
function render(){
 $('login').hidden=true;$('plan').hidden=false;
 var d=Math.ceil((new Date(P.comp.date+'T09:00:00')-new Date())/864e5);
 $('days').textContent=Math.max(d,0);
 $('cname').textContent=P.comp.title+' · '+P.comp.place+' · '+fmt(P.comp.date);
 var n=$('note');n.textContent=P.note;n.hidden=!P.note;
 var ds=['Alle'];P.items.forEach(function(i){if(ds.indexOf(i.dept)<0&&i.dept!=='Alle')ds.push(i.dept)});
 var ch=$('chips');ch.textContent='';
 ds.forEach(function(x){var b=el('button',x===dept?'on':'',x);b.onclick=function(){dept=x;render()};ch.appendChild(b)});
 var L=$('list');L.textContent='';var cur='',today=iso(new Date());
 P.items.filter(function(i){return dept==='Alle'||i.dept===dept||i.dept==='Alle'}).forEach(function(i){
  var m=i.date.slice(0,7);
  if(m!==cur){cur=m;L.appendChild(el('h3','mon mono',MO[+m.slice(5)-1]+' '+m.slice(0,4)))}
  var late=i.date<today&&!done[i.id];
  var r=el('div','it'+(done[i.id]?' done':'')+(late?' late':''));
  r.appendChild(el('span','mono',fmt(i.date).slice(0,5)));
  var b=el('div'),lb=el('label'),cb=document.createElement('input');cb.type='checkbox';cb.checked=!!done[i.id];
  cb.onchange=function(){if(cb.checked)done[i.id]=1;else delete done[i.id];save();render()};
  var h=el('h3','',i.title);lb.appendChild(cb);lb.appendChild(h);b.appendChild(lb);
  b.appendChild(el('span','tag mono',i.dept));
  if(i.mate)b.appendChild(el('span','tag m mono','MATE-Frist'));
  if(late)b.appendChild(el('span','tag mono','überfällig'));
  if(i.note)b.appendChild(el('p','',i.note));
  r.appendChild(b);L.appendChild(r)})
}
function show(r){P=r.plan;try{sessionStorage.setItem('gk-key',r.key)}catch(e){}render()}
var k=null;try{k=sessionStorage.getItem('gk-key')}catch(e){}
if(k&&F)GK.openKey(F,k).then(show).catch(function(){try{sessionStorage.removeItem('gk-key')}catch(e){}});
$('f').onsubmit=function(ev){ev.preventDefault();var b=$('go');b.disabled=true;$('err').textContent='';
 GK.login(F,$('u').value,$('p').value).then(show).catch(function(){$('err').textContent='Benutzername oder Passwort stimmt nicht.'}).then(function(){b.disabled=false})};
$('out').onclick=function(){try{sessionStorage.removeItem('gk-key')}catch(e){}location.reload()};
})();
