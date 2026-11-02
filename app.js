(() => {
  'use strict';
  const E=window.PocketEngine, $=id=>document.getElementById(id);
  const OUTFIT_LINKS=Object.freeze({
    'look-03':'https://www.bilibili.com/video/BV1Poa9zdEMv',
    'look-08':'https://www.bilibili.com/video/BV1FP41167te',
    'look-09':'https://www.bilibili.com/video/BV1fw411h74U',
    'look-10':'https://www.bilibili.com/video/BV1s7HLeAEXn?p=2',
    'look-11':'https://www.bilibili.com/video/BV1u6qEBbESr',
    'look-12':'https://www.bilibili.com/video/BV18bESzHErQ',
    'look-19':'https://www.bilibili.com/video/BV18iPneCE9A',
    'look-14':'https://www.bilibili.com/video/BV1u6qEBbEiZ',
    'look-15':'https://www.bilibili.com/video/BV1r8uV6aEzK',
    'look-16':'https://www.bilibili.com/video/BV14y3Q6WERc',
    'look-17':'https://www.bilibili.com/video/BV1dYDDB8EmM'
  });
  function previewMode(){return true;}
  let demo=previewMode(), state, toastTimer, animationTimer, reactionTimer, storageOk=true, activeSince=performance.now(), lastSave=0,lastActivity="",previewFood="auto",viewGroup=null,lastGroup=null,warnedMeal='',giftAutoOffered=false,starUnfoldTimer,birthdayAutoOffered=false,missedOnLoad=false;
  // Browser layout checks use ephemeral state so they cannot interrupt live play.
  const isolatedPreview=new URLSearchParams(location.search).get('check')==='layout'&&demo;
  const key=()=>isolatedPreview?'zhixin-pocket-layout-check':demo?'zhixin-pocket-demo-v1':'zhixin-pocket-v1';
  function storageWarning(message){storageOk=false;$('storage-warning').hidden=false;$('storage-warning').textContent=message;}
  function read(){
    if(isolatedPreview)return E.fresh();
    try { const raw=localStorage.getItem(key());if(!raw)return E.fresh();const parsed=JSON.parse(raw);if(!E.valid(parsed))throw Error('invalid');const loaded=E.migrate(E.evaluate(parsed),{...rules(),now:Date.now()});if(!demo&&E.visit(loaded,Date.now()).missed){missedOnLoad=true;return E.restart(loaded,Date.now());}return loaded; }
    catch {storageWarning('存档无法读取或浏览器禁止储存。当前进度仍可游玩，请下载备份；不会覆盖无法读取的原存档。');return E.fresh();}
  }
  state=read();if(demo&&!state.nickname&&!(isolatedPreview&&new URLSearchParams(location.search).has('onboarding')))state.nickname="志鑫";
  function save(){if(isolatedPreview||!storageOk)return;try{localStorage.setItem(key(),JSON.stringify(state));}catch{storageWarning('浏览器暂时无法保存进度，请在游戏设置中下载备份，避免关闭网页后丢失。');}}
  function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3400);}
  function rules(){return {freeplay:demo};}
  function canWish(){return state.phase==='active'&&(demo||state.level>=18);}
  function currentMeal(){return demo&&previewFood!=='auto'?E.FOODS.find(f=>f.id===previewFood)||E.food(state):E.food(state);}
  function petName(){return state.nickname||'志鑫';}
  function say(text){$('dialogue').textContent=text.replaceAll('志鑫',petName());}
  window.addEventListener('pocket-before-reload',save);
  function open(id){const d=$(id);if(d&&!d.open)d.showModal();}
  function showName(){ $('nickname-input').value=state.nickname||'';$('name-error').textContent='';$('cancel-name').hidden=!state.nickname;open('name-gate'); }
  $('name-form').addEventListener('submit',e=>{e.preventDefault();if(!E.namePet(state,$('nickname-input').value)){$('name-error').textContent='请填写 1–12 个字，不要只输入空格。';return;}save();$('name-gate').close();render();say(state.phase==='egg'?'名字取好啦，敲开蛋就能见面。':'这个名字，我记住啦。');});
  $('name-gate').addEventListener('cancel',e=>{if(!state.nickname)e.preventDefault();});
  $('cancel-name').addEventListener('click',()=>$('name-gate').close());
  $('rename-pet').addEventListener('click',()=>{$('settings').close();showName();});
  function clockLabel(){if(state.phase==='egg')return '孵化后开始第 1 天';if(state.day>=6&&state.level>=21)return '七日养成已完成';const next=new Date();next.setHours(24,0,0,0);const minutes=Math.max(0,Math.ceil((+next-Date.now())/60000));return `${Math.floor(minutes/60)}h ${minutes%60}m 后进入下一天`;}
  function meter(id,n){const m=$(id);m.replaceChildren(...Array.from({length:10},(_,i)=>{const b=document.createElement('span');b.className=i<Math.floor(n/10)?'filled':'';return b;}));m.classList.toggle('warning',n<50);m.setAttribute('aria-valuenow',String(n));}
  function changeOutfit(o){
    if(!E.canWear(state,o.id,rules())){notify(state.level>=6&&o.activity==='baby'?'幼崽形态留在最初的回忆里。':state.phase!=='active'?'先敲开蛋，和他见面吧。':'这套造型在 lev.'+o.level+' 解锁。');return;}
    clearEffects();$('food-page').hidden=true;if(E.activity(state)==='sleep')E.setActivity(state,'day',Date.now(),rules());
    E.selectOutfit(state,o.id,rules());save();render();say('换好啦！今天穿这套陪你。');
  }
  function spriteBounds(o){return window.PocketSpriteBounds[o.id]||{width:1254,height:1254,x:0,y:0,w:1254,h:1254};}
  function spriteSvg(o){
    const box=spriteBounds(o),ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.classList.add('sprite-frame');svg.setAttribute('viewBox',`${box.x} ${box.y} ${box.w} ${box.h}`);svg.setAttribute('preserveAspectRatio','xMidYMax meet');svg.setAttribute('role','img');svg.setAttribute('aria-label',o.name);
    const picture=document.createElementNS(ns,'image');picture.setAttribute('href',E.imagePath(o));picture.setAttribute('width',box.width);picture.setAttribute('height',box.height);svg.append(picture);return svg;
  }
  function createMemory(o,album=false,wardrobe=false){
    const unlocked=state.unlocked.includes(o.id),selected=E.appearance(state).id===o.id&&state.phase==='active';
    const link=wardrobe&&unlocked?OUTFIT_LINKS[o.id]:null;
    const b=document.createElement('button');b.className='memory-card'+(unlocked?'':' locked')+(selected?' selected':'');
    b.setAttribute('aria-label',o.name+'，'+(unlocked?(link?'点击换装，上滑或按上方向键打开演出视频':'点击换装'):'等级 '+o.level+' 解锁'));b.setAttribute('aria-pressed',String(selected));if(link)b.classList.add('has-video');
    const art=document.createElement('div');art.className='memory-art';const sprite=spriteSvg(o);const number=document.createElement('span');number.className='memory-number';number.textContent=String(E.OUTFITS.indexOf(o)+1).padStart(2,'0');art.append(sprite,number);if(!unlocked){const lock=document.createElement('span');lock.className='memory-lock';lock.textContent='🔒';lock.setAttribute('aria-hidden','true');art.append(lock);}
    if(link){const hint=document.createElement('span');hint.className='memory-swipe-hint';hint.textContent='↑ 上滑';hint.setAttribute('aria-hidden','true');art.append(hint);}
    const info=document.createElement('div');info.className='memory-info';const name=document.createElement('strong');name.textContent=o.name;const meta=document.createElement('span');meta.textContent=album?o.caption:unlocked?(selected?'正在穿着':'点击换装'):'lev.'+o.level+' 解锁';info.append(name,meta);b.append(art,info);
    let start=null,swiped=false;function moveUp(x,y){if(!link||!start)return false;const rise=start.y-y,side=Math.abs(start.x-x);start=null;if(rise<35||rise<=side*1.3)return false;swiped=true;save();window.location.assign(link);return true;}
    b.addEventListener('touchstart',e=>{if(link&&e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});b.addEventListener('touchend',e=>{if(e.changedTouches.length===1&&moveUp(e.changedTouches[0].clientX,e.changedTouches[0].clientY))e.preventDefault();},{passive:false});b.addEventListener('touchcancel',()=>start=null);
    b.addEventListener('pointerdown',e=>{if(link&&e.pointerType!=='touch')start={x:e.clientX,y:e.clientY};});b.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')moveUp(e.clientX,e.clientY);});b.addEventListener('pointercancel',()=>start=null);b.addEventListener('keydown',e=>{if(link&&e.key==='ArrowUp'){e.preventDefault();save();window.location.assign(link);}});b.addEventListener('click',e=>{if(swiped){swiped=false;e.preventDefault();return;}changeOutfit(o);});return b;
  }
  function renderWardrobe(){
    const current=E.group(state);if(lastGroup!==current.id){viewGroup=current.id;lastGroup=current.id;}if(!viewGroup)viewGroup=current.id;
    $('wardrobe-group').replaceChildren(...E.GROUPS.map(g=>{const option=document.createElement('option');option.value=g.id;option.textContent=g.node+' · '+g.name;option.disabled=state.level<g.min;return option;}));$('wardrobe-group').value=viewGroup;
    const displayed=viewGroup==='chapter-6'?['look-20','look-21','look-17','look-15','look-16'].map(id=>E.OUTFITS.find(o=>o.id===id)):E.OUTFITS.filter(o=>o.group===viewGroup);
    $('outfit-buttons').classList.toggle('five-look-grid',viewGroup==='chapter-6');$('outfit-buttons').replaceChildren(...displayed.map(o=>createMemory(o,false,true)));
    wardrobeSwipeNote.hidden=!E.OUTFITS.some(o=>(o.group===viewGroup||(viewGroup==='chapter-6'&&o.id==='look-17'))&&state.unlocked.includes(o.id)&&OUTFIT_LINKS[o.id]);
    $('encore-outfit').hidden=true;
    $('memory-strip').replaceChildren(...E.OUTFITS.filter(o=>o.group===current.id).map(o=>createMemory(o)));
    $('album-grid').replaceChildren();
    for(const g of [...E.GROUPS,{id:'encore',name:'额外收藏',node:'lev.21'}]){const section=document.createElement('section');section.className='album-group';const heading=document.createElement('h3');heading.textContent=g.node+' · '+g.name;const cards=document.createElement('div');cards.className='album-cards';cards.append(...E.OUTFITS.filter(o=>o.group===g.id).map(o=>createMemory(o,true)));section.append(heading,cards);$('album-grid').append(section);}
  }
  $('wardrobe-group').addEventListener('change',e=>{viewGroup=e.target.value;renderWardrobe();});
  const wardrobeSwipeNote=document.createElement('p');wardrobeSwipeNote.className='activity-hint-swipe';wardrobeSwipeNote.textContent='带 ↑ 的造型，上滑人物可打开对应舞台；轻点换装。';$('outfit-buttons').insertAdjacentElement('afterend',wardrobeSwipeNote);
  $('encore-outfit').addEventListener('click',()=>changeOutfit(E.OUTFITS.find(o=>o.id==='look-17')));
  function render(){
    E.refresh(state,Date.now());if(state.phase!=='active'||E.activity(state)==='sleep')$('food-page').hidden=true;const active=state.phase==='active',egg=state.phase==='egg',away=state.phase==='away',unlocked=canWish();const currentActivity=E.activity(state);lastActivity=currentActivity;const sleeping=currentActivity==='sleep';$('pet-name').textContent=petName();$('character-button').setAttribute('aria-label','摸摸'+petName());$('room').dataset.scene=currentActivity;$('room').dataset.phase=state.phase;const scene=['sport','show','sleep'].includes(currentActivity)?currentActivity:'day';const scenePath='assets/scene-'+scene+'-v2.png';if($('scene-background').getAttribute('src')!==scenePath)$('scene-background').src=scenePath;$('scene-label').textContent={sport:'星星运动场',show:'今晚的小舞台',sleep:'晚安时间'}[currentActivity]||'星星房间';
    $('stage-text').textContent=`${E.stage(state)} · 第 ${state.generation} 次相遇`;$('level-badge').textContent=`LV.${String(state.level).padStart(2,'0')}`;
    $('screen-stage').textContent=`✦ ${E.status(state)==='忧伤'?'忧伤':sleeping?'睡觉中':E.status(state)}`;$('screen-level').textContent=`LV.${String(state.level).padStart(2,'0')}`;
    $('hunger-value').textContent=`${state.hunger}%`;$('mood-value').textContent=`${state.mood}%`;meter('hunger-meter',state.hunger);meter('mood-meter',state.mood);
    $('status-note').textContent=egg?'准备好迎接小小的他了吗？':away?'有一项低于 30%，志鑫离家了。重新领养，再次相遇。':E.status(state)==='忧伤'?'志鑫有些低落。请及时照顾，任一项低于 30% 会离家。':sleeping?'正在睡觉，暂停状态消耗。':'状态良好 · 离线不消耗';
    $('status-dot').style.background=away?'#ad9d99':E.status(state)==='忧伤'?'#dbab74':'#8cab7d';
    $('day-label').textContent=`DAY ${String(state.day+1).padStart(2,'0')} · 7 日目标`;$('day-reset').textContent=clockLabel();$('care-count').textContent=`${state.care.length} / 3`;$('play-count').textContent=`今日陪玩 ${Math.min(2,state.playCount||0)} / 2`;
    $('care-list').replaceChildren(...[['feed','好好吃一顿饭'],['play','一起玩一小会儿'],['pet','给志鑫摸摸头']].map(([a,t])=>{const d=document.createElement('div');d.className=`care-item${state.care.includes(a)?' done':''}`;const check=document.createElement('i');check.textContent=state.care.includes(a)?'✓':'';const text=document.createElement('span');text.textContent=t;const note=document.createElement('span');note.textContent=demo?'自由体验':state.care.includes(a)?'DONE':state.day===0?'初次照顾':state.level===21?'♡':'LV +1';d.append(check,text,note);return d;}));
    $('egg-scene').hidden=!egg;$('away-scene').hidden=!away;$('character-button').hidden=!active;$('character-button').classList.toggle('sad',active&&E.status(state)==='忧伤');
    const outfit=E.appearance(state);state.outfit=outfit.id;const spritePath=E.imagePath(outfit),box=spriteBounds(outfit);$('character').setAttribute('viewBox',`${box.x} ${box.y} ${box.w} ${box.h}`);$('character').setAttribute('aria-label',outfit.name+'像素角色');if($('character-image').getAttribute('href')!==spritePath)$('character-image').setAttribute('href',spritePath);$('character-image').setAttribute('width',box.width);$('character-image').setAttribute('height',box.height);document.querySelector('.tiny-avatar img').src=spritePath;document.querySelector('.tiny-avatar').dataset.phase=state.phase;
    $('hatch-button').hidden=!egg;$('restart-button').hidden=!away;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!active||sleeping);$('character-button').disabled=!active||sleeping;
    $('write-wish-button').disabled=!unlocked;$('wish-lock').textContent=unlocked?(demo?'自由体验 · 已开启':'LEV.18 · 已开启'):'LEV.18 开启';$('wish-count').textContent=state.wishes.length?`已经收藏 ${state.wishes.length} 颗想念的星星`:'每一颗星星，都替你说想念。';
    $('read-wishes').disabled=!unlocked;$('read-wishes').textContent=unlocked?'看看瓶子里的心事 ↗':'到 lev.18，再打开这份心事';
    $('birthday-actions').hidden=!E.canCelebrate(state);$('star-reply-button').hidden=!E.hasStarReply(state);
    $('journey-count').textContent=`${String(state.level).padStart(2,'0')} / 21 LEVELS`;
    document.querySelectorAll('[data-node]').forEach(el=>{const n=Number(el.dataset.node);el.classList.toggle('active',!egg&&state.level>=n);el.classList.toggle('current',!egg&&Math.max(3,Math.ceil(state.level/3)*3)===n);});
    renderWardrobe();document.querySelector('.activity-panel').hidden=!active||state.level<6;$('activity-label').textContent=petName()+'衣柜';$('activity-detail').textContent=egg?'等待孵化':away?'等待重新领养':sleeping?'晚安 · 小被子':E.group(state).name;
    $('activity-hint').textContent=state.level<6?'day1 · lev.3 为幼崽；day2 · lev.6 开启活动与换装。':demo?'切换预览等级，会解锁该等级对应的造型。':sleeping?'点「房间」叫醒他，恢复睡前的造型。':E.canPerform(state)?'今天的小舞台已开放，穿喜欢的衣服去表演吧。':state.performanceDay===state.day?'今天的表演已完成，明天再去小舞台。':'完成一次陪玩，就有今天的表演机会。';
    document.querySelectorAll('[data-activity]').forEach(b=>{b.disabled=!active||state.level<6;b.setAttribute('aria-pressed',String(b.dataset.activity===currentActivity));b.setAttribute('aria-label',{day:'回到房间',sport:'出去运动',show:'参加表演',sleep:'裹上小被子睡觉'}[b.dataset.activity]);});
    $('mode-banner').hidden=!demo;$('experience-panel').hidden=!demo;$('preview-level').value=String(state.level);$('demo-controls').hidden=!demo;$('toggle-demo').textContent=demo?'返回正式养成':'进入自由体验';
    $('device-caption').textContent=egg?'取好名字后，轻轻敲开蛋。':away?'重新领养，开始新的养成。':sleeping?'嘘，他睡着了。':'点击屏幕里的'+petName()+'，也可以摸摸他。';document.querySelector('.device').classList.toggle('completion',state.level===21&&active);
  }
  function clearReaction(){clearTimeout(reactionTimer);const r=$('reaction');r.classList.remove('pop');r.textContent='';r.hidden=true;}
  function clearEffects(){clearReaction();clearTimeout(animationTimer);$('character-button').classList.remove('pet-animation');}
  function reaction(text){clearReaction();const r=$('reaction');r.textContent=text;r.hidden=false;void r.offsetWidth;r.classList.add('pop');reactionTimer=setTimeout(clearReaction,1100);}
  $('reaction').addEventListener('animationend',clearReaction);
  function pat(){clearTimeout(animationTimer);$('character-button').classList.remove('pet-animation');void $('character-button').offsetWidth;$('character-button').classList.add('pet-animation');animationTimer=setTimeout(()=>$('character-button').classList.remove('pet-animation'),3000);}
  function changeActivity(next){clearEffects();$('food-page').hidden=true;if(!E.setActivity(state,next,Date.now(),rules())){notify(next==='show'?(state.performanceDay===state.day?'今天已经表演过了，明天再来。':'先完成今天的一次陪玩，就能参加表演。'):'长到 lev.6 后开启活动衣柜。');return;}save();render();say({day:'回到房间啦。今天想一起做什么？',sport:'一起出去活动一下！',show:'准备上台了，记得给我加油！',sleep:'被子盖好啦。晚安，明天见。'}[next]);}
  document.querySelectorAll('[data-activity]').forEach(b=>b.addEventListener('click',()=>changeActivity(b.dataset.activity)));
  function care(action){
    if(!state.nickname){showName();return;}if(E.activity(state)==='sleep'){notify('他在睡觉，先点「房间」叫醒他吧。');return;}
    const oldUnlock=state.unlocked.length,result=E.act(state,action,Date.now(),rules());if(!result.ok)return;if(action==='feed')warnedMeal='';
    if(action==='pet')pat();reaction({feed:'♜',play:'✦',pet:'♡'}[action]);
    say({feed:'吃饱啦！今天也有被你照顾到。',play:'和你一起玩，时间就变快了。',pet:'收到摸摸了！也想给你一点温暖。'}[action]);
    if(result.levelUp){notify(state.level===21?'lev.21！谢谢你陪我慢慢长大。':state.level===18?'lev.18！星星许愿瓶为你打开了。':`长大一点点！现在是 lev.${state.level}${state.unlocked.length>oldUnlock?'，活动衣柜开启了。':'。'}`);if(state.level===21)say('21 级啦。我们的故事，还可以继续。');}
    save();render();
  }
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>b.dataset.action==='feed'?openFood():care(b.dataset.action)));
  function openFood(){clearEffects();if(!state.nickname){showName();return;}if(state.phase!=='active'||E.activity(state)==='sleep')return;const meal=currentMeal();$('food-name').textContent=meal.name;$('food-picture').src='assets/food-'+meal.id+'.svg';$('food-picture').alt=meal.name;$('food-heading').textContent=petName()+'的食物';$('food-effect').textContent='饱腹度 +50%'+(!demo&&state.day>=1&&!state.care.includes('feed')&&state.level<21?' · 等级 +1':'');$('food-page').hidden=false;}
  $('hunger-feed').addEventListener('click',()=>{$('hunger-dialog').close();openFood();});
  $('close-food').addEventListener('click',()=>$('food-page').hidden=true);
  $('eat-food').addEventListener('click',()=>{if($('food-page').hidden||state.phase!=='active'||E.activity(state)==='sleep')return;const meal=currentMeal();$('food-page').hidden=true;care('feed');say('吃到'+meal.name+'啦，肚子暖暖的。');});
  $('character-button').addEventListener('click',()=>care('pet'));
  function hatchPet(){if(!state.nickname){showName();return;}if(E.hatch(state,Date.now())){save();render();say('你好呀，从今天起，请多多关照。');reaction('♡');notify('初次见面！今天是 Day 1，已经是 lev.3。');}}
  $('hatch-button').addEventListener('click',hatchPet);$('egg-scene').addEventListener('click',hatchPet);
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.dialog)));
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('write-wish-button').addEventListener('click',()=>{if(!canWish())return;open('wish-dialog');$('wish-text').focus();});
  $('wish-text').addEventListener('input',()=>$('wish-length').textContent=`${$('wish-text').value.length} / 200`);
  $('wish-form').addEventListener('submit',e=>{e.preventDefault();if(!E.addWish(state,$('wish-text').value,Date.now(),rules())){notify('请写下 1–200 字。每个存档最多收藏 500 颗星星。');return;}save();$('wish-dialog').close();$('wish-text').value='';$('wish-length').textContent='0 / 200';render();reaction('✦');say('这颗星星，我会好好收藏。');notify('星星纸已经放进玻璃瓶。到 lev.21，再看看志鑫送来的星星纸。');});
  function openStarDialog(){if(!E.hasStarReply(state))return;clearTimeout(starUnfoldTimer);$('star-reply-stage').classList.remove('opening','opened');document.querySelector('.unfolded-paper').setAttribute('aria-hidden','true');$('unfold-star').disabled=false;$('star-reply-hint').textContent='轻轻点开这颗星星。';open('star-reply-dialog');}
  $('star-reply-button').addEventListener('click',openStarDialog);
  $('unfold-star').addEventListener('click',()=>{if($('star-reply-stage').classList.contains('opening')||$('star-reply-stage').classList.contains('opened'))return;$('unfold-star').disabled=true;$('star-reply-stage').classList.add('opening');$('star-reply-hint').textContent='正在拆开星星纸……';const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?10:1150;starUnfoldTimer=setTimeout(()=>{if(!$('star-reply-dialog').open)return;$('star-reply-stage').classList.add('opened');document.querySelector('.unfolded-paper').setAttribute('aria-hidden','false');$('star-reply-hint').textContent='这是志鑫留给你的话。';E.openStarReply(state);save();},duration);});
  $('star-reply-dialog').addEventListener('close',()=>clearTimeout(starUnfoldTimer));
  const birthdayAudio=$('birthday-audio'),birthdayMusicButton=document.createElement('button');birthdayMusicButton.type='button';birthdayMusicButton.className='secondary birthday-music-button';birthdayMusicButton.textContent='♫ 播放生日音频';$('birthday-celebrate').insertAdjacentElement('afterend',birthdayMusicButton);
  birthdayAudio.addEventListener('play',()=>{birthdayMusicButton.textContent='Ⅱ 暂停音乐';birthdayMusicButton.setAttribute('aria-pressed','true');});
  birthdayAudio.addEventListener('pause',()=>{birthdayMusicButton.textContent='♫ 播放生日音频';birthdayMusicButton.setAttribute('aria-pressed','false');});
  birthdayAudio.addEventListener('ended',()=>{birthdayMusicButton.textContent='♫ 再播放一次';birthdayMusicButton.setAttribute('aria-pressed','false');});
  function playBirthdayAudio(){const playing=birthdayAudio.play();if(playing&&typeof playing.catch==='function')playing.catch(()=>{birthdayMusicButton.textContent='♫ 点击播放生日音频';notify('音频未能自动播放，请点画面里的音乐按钮。');});}
  function openBirthday(playSound){if(!E.canCelebrate(state))return;birthdayAutoOffered=true;$('birthday-scene').classList.toggle('celebrating',!!state.birthdayCelebrated);open('birthday-dialog');birthdayAudio.pause();birthdayAudio.currentTime=0;if(playSound)playBirthdayAudio();}
  $('birthday-button').addEventListener('click',()=>openBirthday(true));
  birthdayMusicButton.addEventListener('click',()=>{if(birthdayAudio.paused){if(birthdayAudio.ended)birthdayAudio.currentTime=0;playBirthdayAudio();}else birthdayAudio.pause();});
  $('birthday-dialog').addEventListener('close',()=>{birthdayAudio.pause();birthdayAudio.currentTime=0;});
  $('birthday-celebrate').addEventListener('click',()=>{if(!E.canCelebrate(state))return;state.birthdayCelebrated=true;$('birthday-scene').classList.add('celebrating');$('birthday-celebrate').textContent='★ 生日快乐，志鑫！';save();});
  function maybeOfferBirthday(){if(birthdayAutoOffered||!E.canCelebrate(state)||state.birthdayCelebrated||document.hidden||document.querySelector('dialog[open]'))return;birthdayAutoOffered=true;setTimeout(()=>{if(E.canCelebrate(state)&&!state.birthdayCelebrated&&!document.querySelector('dialog[open]'))openBirthday(false);else birthdayAutoOffered=false;},420);}
  function maybeOfferStarReply(){if(giftAutoOffered||!E.canReceiveStarReply(state)||document.hidden||document.querySelector('dialog[open]'))return;giftAutoOffered=true;setTimeout(()=>{if(E.canReceiveStarReply(state)&&!document.querySelector('dialog[open]'))openStarDialog();else giftAutoOffered=false;},420);}
  $('read-wishes').addEventListener('click',()=>{if(!canWish())return;const list=$('wish-list');list.replaceChildren();if(!state.wishes.length){const p=document.createElement('div');p.className='empty-wishes';p.innerHTML='<span>☆</span><p>瓶子还是空的。写下第一颗星星吧。</p>';list.append(p);}else{state.wishes.slice().reverse().forEach(w=>{const paper=document.createElement('article');paper.className='wish-paper';const text=document.createElement('p');text.textContent=w.text;const time=document.createElement('time');time.dateTime=new Date(w.at).toISOString();time.textContent=`✦ ${new Date(w.at).toLocaleString('zh-CN')}`;paper.append(text,time);list.append(paper);});}open('wishes-dialog');});
  $('restart-button').addEventListener('click',()=>open('restart-dialog'));
  $('confirm-restart').addEventListener('click',()=>{if(state.phase!=='away')return;state=E.restart(state,Date.now());giftAutoOffered=false;birthdayAutoOffered=false;save();$('restart-dialog').close();say('每一次相遇，都值得被认真对待。');render();});
  function switchMode(){clearEffects();$('food-page').hidden=true;const sourceName=state.nickname;save();demo=!demo;try{localStorage.setItem('zhixin-pocket-mode',demo?'preview':'formal');}catch{}history.replaceState(null,'',demo?'?preview=1':location.pathname);storageOk=true;$('storage-warning').hidden=true;state=read();giftAutoOffered=false;birthdayAutoOffered=false;if(demo)state.nickname=sourceName||state.nickname||'志鑫';if(demo&&state.phase==='egg')setPreviewLevel(7);activeSince=performance.now();say(demo?'可以选择等级预览，对应的造型会随等级解锁。':'欢迎回来，继续照顾志鑫吧。');render();save();if(!state.nickname)showName();if(missedOnLoad){open('missed-day-dialog');missedOnLoad=false;}}
  $('toggle-demo').addEventListener('click',switchMode);$('exit-demo').addEventListener('click',switchMode);
  $('demo-button').addEventListener('click',()=>{if(!demo)switchMode();open('settings');});
  function setPreviewLevel(level,preset=''){
    if(!demo||!Number.isInteger(level)||level<0||level>21)return;
    clearEffects();$('food-page').hidden=true;viewGroup=null;lastGroup=null;
    const keptName=state.nickname,keptWishes=state.wishes;
    state=E.fresh(Date.now(),keptWishes);giftAutoOffered=false;birthdayAutoOffered=false;state.nickname=keptName||'志鑫';
    if(preset!=='egg'){
      E.hatch(state,Date.now());state.level=level;E.unlock(state);
      state.day=Math.max(0,Math.ceil(level/3)-1);state.startedDay=E.calendarDay(Date.now())-state.day;state.lastVisitDay=E.calendarDay(Date.now());
      if(level>=6)E.setActivity(state,'day',Date.now(),rules());
      if(preset==='sad')state.mood=40;
      if(preset==='away'){state.hunger=20;E.evaluate(state);}
    }
    save();render();say(preset==='away'?'我出去走一走了。期待下一次相遇。':preset==='sad'?'有一点点低落……可以陪我一会儿吗？':level>=6?'衣柜里的造型都可以试一试，也能单独切换场景。':'小时候的我，也在等你。');
  }
  $('preview-level').replaceChildren(...Array.from({length:22},(_,level)=>{const o=document.createElement('option');o.value=String(level);o.textContent='lev.'+level+([3,6,9,12,15,18,21].includes(level)?' · 第 '+(level/3)+' 天'+(level===6?' · 开启衣柜':''):level===6?' · 开启衣柜':'');return o;}));
  $('preview-level').addEventListener('change',e=>setPreviewLevel(Number(e.target.value)));
  $('preview-food').addEventListener('change',e=>{previewFood=e.target.value;if(!$('food-page').hidden)openFood();});
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{if(!demo)return;const name=b.dataset.preset;setPreviewLevel({egg:0,teen:6,sad:6,away:6,wish:18,complete:21}[name],name);$('settings').close();notify('已切换体验场景。');}));
  $('demo-next-day').addEventListener('click',()=>{if(!demo||state.phase!=='active'){notify('请先孵化或选择一个成长场景。');return;}state.day=Math.min(6,state.day+1);state.care=[];state.playCount=0;save();render();notify('体验存档已进入下一天，三项照顾已刷新。');});
  $('export-save').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`zhixin-pocket-${demo?'demo':'save'}-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已生成存档备份。请妥善保管，里面包含你的星星纸。');});
  $('import-save').addEventListener('click',()=>$('save-file').click());
  $('save-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('large');const parsed=JSON.parse(await file.text());if(!E.valid(parsed))throw Error('invalid');if(!window.confirm(`恢复备份将替换当前${demo?'体验':'正式'}进度及星星纸。确认已备份当前记录后再继续。`))return;const restored=E.migrate(E.evaluate(parsed),{...rules(),now:Date.now()}),missed=!demo&&E.visit(restored,Date.now()).missed;state=missed?E.restart(restored,Date.now()):restored;giftAutoOffered=false;birthdayAutoOffered=false;storageOk=true;$('storage-warning').hidden=true;save();render();say(missed?'漏登后，我们从新蛋开始吧。':'欢迎回来，你的养成进度已经找回。');notify(missed?'备份已读取；漏登规则仍生效。':'存档已恢复。');if(!state.nickname)showName();if(missed)open('missed-day-dialog');}catch{notify('无法恢复：这不是有效的鑫动日记存档，当前进度未改变。');}finally{e.target.value='';}});
  function mealWarningKey(now){const d=new Date(now),hour=d.getHours(),meal=hour>=18?18:hour>=13?13:hour>=10?10:0;return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${meal}`;}
  function checkHungerWarning(now=Date.now()){
    if(demo||document.hidden||!state.nickname||state.phase!=='active'||state.hunger>50||E.activity(state,now)==='sleep'||new Date(now).getHours()<10)return;
    const key=mealWarningKey(now);if(key===warnedMeal||document.querySelector('dialog[open]'))return;
    warnedMeal=key;$('hunger-warning').textContent=`不给${petName()}吃东西他是会哭的呀`;
    open('hunger-dialog');
  }
  function checkAttendance(now=Date.now()){
    if(demo||document.hidden||state.phase!=='active')return false;
    const result=E.visit(state,now);
    if(result.missed){state=E.restart(state,now);giftAutoOffered=false;birthdayAutoOffered=false;save();render();say('我们从新蛋开始，重新见面吧。');open('missed-day-dialog');return true;}
    if(result.changed){save();render();return true;}
    return false;
  }
  function tick(){const now=performance.now(),wall=Date.now(),elapsed=now-activeSince;activeSince=now;if(checkAttendance(wall))return;const previous=state.phase;const hunger=state.hunger,mood=state.mood,day=state.day;/* Large gaps indicate suspend; never charge offline time. */if(state.nickname&&!document.hidden&&elapsed>0&&elapsed<5000&&!demo&&E.activity(state,wall)!=='sleep')E.advanceActive(state,elapsed,wall);E.refresh(state,wall);if(previous!==state.phase||hunger!==state.hunger||mood!==state.mood||day!==state.day||lastActivity!==E.activity(state,wall)){render();save();if(state.phase==='away')say('房间安静了下来。可以重新领养，再次相遇。');else if(E.status(state)==='忧伤')say('有一点点低落……可以陪我一会儿吗？');}maybeOfferBirthday();maybeOfferStarReply();checkHungerWarning(wall);if(now-lastSave>15000){save();lastSave=now;$('day-reset').textContent=clockLabel();}}
  document.addEventListener('visibilitychange',()=>{activeSince=performance.now();if(document.hidden)clearEffects();else checkAttendance(Date.now());save();});window.addEventListener('pagehide',save);
  window.addEventListener('storage',e=>{if(e.key===key()&&e.newValue){try{const next=JSON.parse(e.newValue);if(E.valid(next)){state=E.migrate(E.evaluate(next),rules());activeSince=performance.now();render();}}catch{}}});
  save();render();if(state.phase==='active')say(state.level===21?'21 级啦。我们的故事，还可以继续。':'你来啦，今天也想和你待在一起。');else if(state.phase==='away')say('房间安静了下来。可以重新领养，再次相遇。');if(!state.nickname)showName();if(missedOnLoad){open('missed-day-dialog');missedOnLoad=false;}setInterval(tick,1000);
})();
