(function(root){'use strict';const GROUPS=[
  {
    "id": "baby",
    "name": "初次相遇",
    "min": 0,
    "max": 5,
    "node": "lev.3",
    "day": "第 1 天"
  },
  {
    "id": "chapter-1",
    "name": "小时候的你",
    "min": 6,
    "max": 8,
    "node": "lev.6",
    "day": "第 2 天"
  },
  {
    "id": "chapter-2",
    "name": "闪闪少年",
    "min": 9,
    "max": 11,
    "node": "lev.9",
    "day": "第 3 天"
  },
  {
    "id": "chapter-3",
    "name": "热烈时刻",
    "min": 12,
    "max": 14,
    "node": "lev.12",
    "day": "第 4 天"
  },
  {
    "id": "chapter-4",
    "name": "走向舞台",
    "min": 15,
    "max": 17,
    "node": "lev.15",
    "day": "第 5 天"
  },
  {
    "id": "chapter-5",
    "name": "星光正好",
    "min": 18,
    "max": 20,
    "node": "lev.18",
    "day": "第 6 天"
  },
  {
    "id": "chapter-6",
    "name": "闪耀新章",
    "min": 21,
    "max": 21,
    "node": "lev.21",
    "day": "第 7 天"
  }
];const OUTFITS=[
  {
    "id": "red-baby",
    "name": "幼崽志鑫",
    "caption": "最初的红衣幼崽 · day1 / lev.3",
    "level": 0,
    "activity": "baby",
    "group": "baby"
  },
  {
    "id": "camouflage",
    "name": "漫画衣志鑫",
    "caption": "原有造型 · 白色漫画衣",
    "level": 6,
    "activity": "day",
    "group": "chapter-1"
  },
  {
    "id": "blue-jacket",
    "name": "运动会志鑫",
    "caption": "原有造型 · 蓝白运动装",
    "level": 6,
    "activity": "sport",
    "group": "chapter-1"
  },
  {
    "id": "tuxedo",
    "name": "小西装志鑫",
    "caption": "原有造型 · 妈妈拍的小西装",
    "level": 6,
    "activity": "show",
    "group": "chapter-1"
  },
  {
    "id": "baby",
    "name": "被子志鑫",
    "caption": "原有造型 · 小被子",
    "level": 6,
    "activity": "sleep",
    "group": "chapter-1"
  },
  {
    "id": "look-01",
    "name": "志鑫公式照",
    "caption": "素材 01 · 按素材顺序收录",
    "level": 9,
    "activity": "day",
    "group": "chapter-2",
    "image": "assets/characters/look-01.png"
  },
  {
    "id": "look-02",
    "name": "我现在会说绕口令啦",
    "caption": "素材 02 · 按素材顺序收录",
    "level": 9,
    "activity": "day",
    "group": "chapter-2",
    "image": "assets/characters/look-02.png"
  },
  {
    "id": "look-03",
    "name": "Trouble Maker",
    "caption": "素材 03 · 按素材顺序收录",
    "level": 9,
    "activity": "show",
    "group": "chapter-2",
    "image": "assets/characters/look-03.png"
  },
  {
    "id": "look-04",
    "name": "自我介绍",
    "caption": "素材 04 · 按素材顺序收录",
    "level": 9,
    "activity": "day",
    "group": "chapter-2",
    "image": "assets/characters/look-04.png"
  },
  {
    "id": "look-05",
    "name": "运动会志鑫",
    "caption": "素材 05 · 按素材顺序收录",
    "level": 12,
    "activity": "sport",
    "group": "chapter-3",
    "image": "assets/characters/look-05.png"
  },
  {
    "id": "look-06",
    "name": "山城少年",
    "caption": "素材 06 · 按素材顺序收录",
    "level": 12,
    "activity": "sport",
    "group": "chapter-3",
    "image": "assets/characters/look-06.png"
  },
  {
    "id": "look-07",
    "name": "回答",
    "caption": "素材 07 · 按素材顺序收录",
    "level": 12,
    "activity": "day",
    "group": "chapter-3",
    "image": "assets/characters/look-07.png"
  },
  {
    "id": "look-08",
    "name": "生于火焰",
    "caption": "素材 08 · 按素材顺序收录",
    "level": 12,
    "activity": "show",
    "group": "chapter-3",
    "image": "assets/characters/look-08.png"
  },
  {
    "id": "look-09",
    "name": "不顾一切",
    "caption": "素材 09 · 按素材顺序收录",
    "level": 15,
    "activity": "day",
    "group": "chapter-4",
    "image": "assets/characters/look-09.png"
  },
  {
    "id": "look-10",
    "name": "C位时刻",
    "caption": "素材 10 · 按素材顺序收录",
    "level": 15,
    "activity": "show",
    "group": "chapter-4",
    "image": "assets/characters/look-10.png"
  },
  {
    "id": "look-19",
    "name": "倒刺",
    "caption": "倒刺 · lev.15",
    "level": 15,
    "activity": "day",
    "group": "chapter-4",
    "image": "assets/characters/look-19.png"
  },
  {
    "id": "look-11",
    "name": "BadBlood",
    "caption": "素材 11 · 按素材顺序收录",
    "level": 15,
    "activity": "show",
    "group": "chapter-4",
    "image": "assets/characters/look-11.png"
  },
  {
    "id": "look-12",
    "name": "To Angel",
    "caption": "素材 12 · 按素材顺序收录",
    "level": 18,
    "activity": "show",
    "group": "chapter-5",
    "image": "assets/characters/look-12.png"
  },
  {
    "id": "look-18",
    "name": "志鑫与奥利",
    "caption": "志鑫与奥利 · lev.18",
    "level": 18,
    "activity": "show",
    "group": "chapter-5",
    "image": "assets/characters/look-18.png"
  },
  {
    "id": "look-13",
    "name": "01号选手",
    "caption": "素材 13 · 按素材顺序收录",
    "level": 18,
    "activity": "sport",
    "group": "chapter-5",
    "image": "assets/characters/look-13.png"
  },
  {
    "id": "look-14",
    "name": "only",
    "caption": "素材 14 · 按素材顺序收录",
    "level": 18,
    "activity": "show",
    "group": "chapter-5",
    "image": "assets/characters/look-14.png"
  },
  {
    "id": "look-20",
    "name": "bape男神",
    "caption": "bape男神 · lev.21",
    "level": 21,
    "activity": "day",
    "group": "chapter-6",
    "image": "assets/characters/look-20-grey-white.png"
  },
  {
    "id": "look-21",
    "name": "Prada西装",
    "caption": "Prada西装 · lev.21",
    "level": 21,
    "activity": "show",
    "group": "chapter-6",
    "image": "assets/characters/look-21.png"
  },
  {
    "id": "look-15",
    "name": "Summer Too Hot",
    "caption": "素材 15 · 按素材顺序收录",
    "level": 21,
    "activity": "show",
    "group": "chapter-6",
    "image": "assets/characters/look-15.png"
  },
  {
    "id": "look-16",
    "name": "暗红色西装",
    "caption": "素材 16 · 按素材顺序收录",
    "level": 21,
    "activity": "show",
    "group": "chapter-6",
    "image": "assets/characters/look-16.png"
  },
  {
    "id": "look-17",
    "name": "告白",
    "caption": "素材 17 · lev.21 额外收藏",
    "level": 21,
    "activity": "show",
    "group": "encore",
    "image": "assets/characters/look-17.png"
  }
];const api={GROUPS,OUTFITS};if(typeof module!=='undefined')module.exports=api;else root.PocketCatalog=api;})(typeof window!=='undefined'?window:globalThis);

