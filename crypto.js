(function(g){
var te=new TextEncoder(),td=new TextDecoder(),S=crypto.subtle;
function b64(u){var s='';u=new Uint8Array(u);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
function ub(s){var a=atob(s),u=new Uint8Array(a.length);for(var i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return u}
function hex(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
function norm(n){return n.trim().toLowerCase()}
async function uid(n){return hex(await S.digest('SHA-256',te.encode('gk:'+norm(n))))}
async function kek(n,p,salt,iter){var m=await S.importKey('raw',te.encode(norm(n)+'\u0000'+p),'PBKDF2',false,['deriveKey']);return S.deriveKey({name:'PBKDF2',salt:salt,iterations:iter,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function enc(k,d){var iv=crypto.getRandomValues(new Uint8Array(12));return{iv:b64(iv),ct:b64(await S.encrypt({name:'AES-GCM',iv:iv},k,d))}}
function dec(k,o){return S.decrypt({name:'AES-GCM',iv:ub(o.iv)},k,ub(o.ct))}
async function encryptAll(plan,users,iter){
iter=iter||250000;var raw=crypto.getRandomValues(new Uint8Array(32));
var ck=await S.importKey('raw',raw,'AES-GCM',false,['encrypt']);
var out={v:1,iter:iter,data:await enc(ck,te.encode(JSON.stringify(plan))),users:[]};
for(var i=0;i<users.length;i++){var u=users[i],salt=crypto.getRandomValues(new Uint8Array(16)),w=await enc(await kek(u.name,u.pw,salt,iter),raw);out.users.push({h:await uid(u.name),s:b64(salt),iv:w.iv,wk:w.ct})}
return out}
async function open(f,raw){var ck=await S.importKey('raw',raw,'AES-GCM',false,['decrypt']);return{plan:JSON.parse(td.decode(await dec(ck,f.data))),key:b64(raw)}}
async function login(f,n,p){
var h=await uid(n),u=f.users.filter(function(x){return x.h===h})[0];
var k=await kek(n,p,u?ub(u.s):new Uint8Array(16),f.iter);
if(!u)throw new Error('bad');
return open(f,new Uint8Array(await dec(k,{iv:u.iv,ct:u.wk})))}
function parsePlan(t){
var plan={comp:{date:'',title:'',place:''},note:'',items:[]};
t.split('\n').forEach(function(l){l=l.trim();if(!l||l[0]==='#')return;
if(/^Wettbewerb:/i.test(l)){var p=l.slice(11).split('|').map(function(s){return s.trim()});plan.comp={date:p[0],title:p[1]||'',place:p[2]||''};return}
if(/^Hinweis:/i.test(l)){plan.note=l.slice(8).trim();return}
var p=l.split('|').map(function(s){return s.trim()});if(!/^\d{4}-\d{2}-\d{2}$/.test(p[0]))return;
plan.items.push({id:p[0]+'-'+(p[2]||'').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,24),date:p[0],dept:p[1]||'Alle',title:p[2]||'',note:p[3]||'',mate:/^mate$/i.test(p[4]||'')})});
plan.items.sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0});return plan}
g.GK={encryptAll:encryptAll,login:login,parsePlan:parsePlan,openKey:function(f,k){return open(f,ub(k))}}})(globalThis);
