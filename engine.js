(function(root) {
  'use strict';
  const DAY = 86400000;
  function calendarDay(now){const d=new Date(now);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY);}
  const ACTIONS = ['feed', 'play', 'pet'];
  const FOODS=[{id:'milk',name:'牛奶',min:0,max:5},{id:'latiao',name:'辣条',min:6,max:8},{id:'chips',name:'薯片',min:9,max:11},{id:'noodles',name:'米线',min:12,max:14},{id:'rice',name:'猪脚饭',min:15,max:17},{id:'hotpot',name:'火锅',min:18,max:21}];
  function food(s){return FOODS.find(f=>s.level>=f.min&&s.level<=f.max)||FOODS[0];}
  const {OUTFITS,GROUPS}=typeof module!=='undefined'?require('./catalog.js'):root.PocketCatalog;
  function group(s){return GROUPS.find(g=>s.level>=g.min&&s.level<=g.max)||GROUPS[0];}
  function imagePath(o){return o.image||'assets/'+o.id+'.png';}
  function canWear(s,id){const o=OUTFITS.find(o=>o.id===id);return !!o&&s.phase==='active'&&(o.activity==='baby'?s.level<6:s.level>=6&&s.level>=o.level);}
  function selectOutfit(s,id,options={}){if(!canWear(s,id,options))return false;s.selectedOutfit=id;s.outfit=id;return true;}
  function fresh(now = Date.now(), wishes = []) {
    return {version:1, phase:'egg', startedAt:now, startedDay:calendarDay(now), lastVisitDay:calendarDay(now), day:0, level:0, hunger:100, mood:100,
      care:[], activeMs:0, moodMs:0, wishes:wishes.slice(), outfit:'red-baby', unlocked:[], generation:1,
      activity:'auto', activityUntil:0, performanceDay:-1,nickname:'',selectedOutfit:null,wardrobeGroup:'baby',careRuleVersion:2,playCount:0,starReplyOpened:false,birthdayCelebrated:false};
  }
  function status(s) { return s.phase === 'away' ? '离家出走' : s.phase === 'egg' ? '等待孵化' : Math.min(s.hunger,s.mood) < 50 ? '忧伤' : '开心'; }
  function stage(s) { return s.phase === 'egg' ? '孵化期' : s.level >= 18 ? '成年期' : s.level >= 6 ? '青少年期' : '幼崽期'; }
  function refresh(s, now) {
    if(s.phase === 'egg') return s;
    if(s.activityUntil && now>=s.activityUntil){s.activity='auto';s.activityUntil=0;}
    return s;
  }
  function visit(s,now){
    if(s.phase!=='active')return {missed:false,changed:false};
    const today=calendarDay(now);
    if(today<=s.lastVisitDay)return {missed:false,changed:false};
    if(s.day>=6&&s.level>=21){s.lastVisitDay=today;return {missed:false,changed:true};}
    if(today-s.lastVisitDay>1)return {missed:true,changed:false};
    s.lastVisitDay=today;s.day=Math.min(6,s.day+1);s.care=[];s.playCount=0;
    return {missed:false,changed:true};
  }
  function evaluate(s) { if(s.phase === 'active' && Math.min(s.hunger,s.mood) < 30) s.phase='away'; return s; }
  function unlock(s) { s.unlocked=s.phase==='egg'?[]:OUTFITS.filter(o=>s.level>=o.level).map(o=>o.id);const next=group(s).id;if(s.wardrobeGroup!==next){s.wardrobeGroup=next;s.selectedOutfit=null;} }
  function migrate(s,options={}) { s.activity=s.activity||'auto';s.activityUntil=s.activityUntil||0;s.performanceDay=Number.isInteger(s.performanceDay)?s.performanceDay:-1;s.nickname=s.nickname||'';if(s.careRuleVersion!==2){s.activeMs=0;s.moodMs=0;s.careRuleVersion=2;}s.playCount=Number.isInteger(s.playCount)?s.playCount:0;s.starReplyOpened=!!s.starReplyOpened;s.birthdayCelebrated=!!s.birthdayCelebrated;s.day=Math.min(6,s.day);if(!Number.isInteger(s.lastVisitDay))s.lastVisitDay=calendarDay(options.now??Date.now());if(!Number.isInteger(s.startedDay))s.startedDay=s.lastVisitDay-s.day;unlock(s);if(s.selectedOutfit&&!canWear(s,s.selectedOutfit,options))s.selectedOutfit=null;return s; }
  function namePet(s,value){const name=String(value).trim();if(!name||Array.from(name).length>12||/[\u0000-\u001f\u007f]/.test(name))return false;s.nickname=name;return true;}
  function activity(s,now=Date.now()){
    if(s.phase!=='active')return s.phase;
    if(s.level<6)return 'baby';
    if(s.activity!=='auto'&&(!s.activityUntil||s.activityUntil>now))return s.activity;
    const hour=new Date(now).getHours();return hour>=21||hour<8?'sleep':'day';
  }
  function appearance(s,now=Date.now()) {const current=activity(s,now);if(s.level<6||s.phase!=='active')return OUTFITS[0];if(current==='sleep')return OUTFITS.find(o=>o.id==='baby');const chosen=OUTFITS.find(o=>o.id===s.selectedOutfit&&o.activity!=='baby');if(chosen)return chosen;const candidates=OUTFITS.filter(o=>o.group===group(s).id);return candidates.find(o=>o.activity===current)||candidates[0]||OUTFITS[1];}
  function nextHour(now,hour){const d=new Date(now);d.setHours(hour,0,0,0);if(+d<=now)d.setDate(d.getDate()+1);return +d;}
  function canPerform(s,{freeplay=false}={}){return s.phase==='active'&&s.level>=6&&(freeplay||s.care.includes('play')&&s.performanceDay!==s.day);}
  function setActivity(s,next,now=Date.now(),options={}){
    refresh(s,now);if(s.phase!=='active'||s.level<6||!['day','sport','sleep','show'].includes(next))return false;
    if(next==='show'){if(!canPerform(s,options))return false;s.performanceDay=s.day;}
    s.activity=next;s.activityUntil=next==='show'||next==='sport'?now+120000:next==='sleep'?nextHour(now,8):nextHour(now,new Date(now).getHours()>=21||new Date(now).getHours()<8?8:21);
    s.outfit=appearance(s,now).id;return true;
  }
  function hatch(s, now) {
    if(s.phase !== 'egg') return false;
    s.phase='active';s.startedAt=now;s.startedDay=calendarDay(now);s.lastVisitDay=s.startedDay;s.day=0;s.level=3;unlock(s);return true;
  }
  function act(s, action, now, {freeplay=false}={}) {
    refresh(s,now); evaluate(s);
    if(s.phase !== 'active' || !ACTIONS.includes(action)) return {ok:false,levelUp:false};
    if(action==='feed') s.hunger=Math.min(100,s.hunger+50);
    if(action==='play'){s.mood=Math.min(100,s.mood+20);s.playCount=(s.playCount||0)+1;}
    if(action==='pet') s.mood=Math.min(100,s.mood+10);
    const levelUp = !freeplay && s.day>=1 && !s.care.includes(action) && s.level < 21;
    if(!s.care.includes(action)) s.care.push(action);
    if(levelUp) {s.level++;unlock(s);}
    return {ok:true,levelUp};
  }
  function hungerInterval(now){const hour=new Date(now).getHours();if(hour<8||hour>=21)return 0;if(hour<10)return 144000;if(hour<13)return 216000;return 360000;}
  function advanceActive(s, ms, now=Date.now()) {
    if(s.phase!=='active') return s;
    if(!Number.isFinite(ms) || ms <= 0) return s;
    const interval=hungerInterval(now);if(!interval)return s;
    s.activeMs+=ms;s.moodMs+=ms;
    const foodTicks=Math.floor(s.activeMs/interval),moodTicks=Math.floor(s.moodMs/14400000);
    s.activeMs%=interval;s.moodMs%=14400000;
    s.hunger=Math.max(0,s.hunger-foodTicks);s.mood=Math.max(0,s.mood-moodTicks*10);
    return evaluate(s);
  }
  function addWish(s, text, now, {freeplay=false}={}) {
    const value=String(text).trim();
    if(s.phase!=='active'||s.level<18&&!freeplay||!value||value.length>200||s.wishes.length>=500) return false;
    s.wishes.push({text:value,at:now});return true;
  }
  function hasStarReply(s){return s.phase==='active'&&s.day>=6&&s.level>=21&&s.wishes.length>0;}
  function canReceiveStarReply(s){return hasStarReply(s)&&!s.starReplyOpened;}
  function openStarReply(s){if(!hasStarReply(s))return false;s.starReplyOpened=true;return true;}
  function canCelebrate(s){return s.phase==='active'&&s.day>=6;}
  function restart(s, now) { const next=fresh(now,s.wishes);next.generation=s.generation+1;next.nickname=s.nickname||'';return next; }
  function valid(s) {
    return s && s.version===1 && ['egg','active','away'].includes(s.phase) &&
      Number.isFinite(s.startedAt) && Number.isInteger(s.day) && s.day>=0 &&
      (s.startedDay===undefined||Number.isInteger(s.startedDay)) &&
      (s.lastVisitDay===undefined||Number.isInteger(s.lastVisitDay)) &&
      Number.isInteger(s.level) && s.level>=0 && s.level<=21 &&
      [s.hunger,s.mood].every(n=>Number.isFinite(n)&&n>=0&&n<=100) &&
      Number.isFinite(s.activeMs)&&s.activeMs>=0&&s.activeMs<3600000 &&
      Number.isFinite(s.moodMs)&&s.moodMs>=0&&s.moodMs<14400000 &&
      Number.isInteger(s.generation)&&s.generation>=1 &&
      Array.isArray(s.care)&&s.care.length<=3&&new Set(s.care).size===s.care.length&&s.care.every(a=>ACTIONS.includes(a)) &&
      Array.isArray(s.unlocked)&&s.unlocked.every(id=>OUTFITS.some(o=>o.id===id)) &&
      (s.nickname===undefined||typeof s.nickname==='string'&&Array.from(s.nickname).length<=12&&!/[\u0000-\u001f\u007f]/.test(s.nickname)) &&
      (s.activity===undefined||['auto','day','sport','sleep','show'].includes(s.activity)) &&
      (s.activityUntil===undefined||Number.isFinite(s.activityUntil)&&s.activityUntil>=0) &&
      (s.performanceDay===undefined||Number.isInteger(s.performanceDay)&&s.performanceDay>=-1) &&
      (s.selectedOutfit==null||OUTFITS.some(o=>o.id===s.selectedOutfit)) &&
      (s.wardrobeGroup===undefined||GROUPS.some(g=>g.id===s.wardrobeGroup)) &&
      (s.careRuleVersion===undefined||s.careRuleVersion===2) &&
      (s.playCount===undefined||Number.isInteger(s.playCount)&&s.playCount>=0) &&
      (s.starReplyOpened===undefined||typeof s.starReplyOpened==='boolean') &&
      (s.birthdayCelebrated===undefined||typeof s.birthdayCelebrated==='boolean') &&
      OUTFITS.some(o=>o.id===s.outfit) && Array.isArray(s.wishes)&&s.wishes.length<=500&&
      s.wishes.every(w=>w&&typeof w.text==='string'&&w.text.length<=200&&Number.isFinite(w.at));
  }
  const api={DAY,calendarDay,visit,ACTIONS,OUTFITS,GROUPS,group,imagePath,canWear,selectOutfit,FOODS,food,fresh,status,stage,refresh,evaluate,hatch,act,advanceActive,hungerInterval,addWish,hasStarReply,canReceiveStarReply,openStarReply,canCelebrate,restart,valid,unlock,migrate,activity,appearance,canPerform,setActivity,namePet};
  if(typeof module !== 'undefined') module.exports=api; else root.PocketEngine=api;
})(typeof window !== 'undefined'?window:globalThis);
