(()=>{var on={minX:-5,maxX:5,minZ:-3.5,maxZ:3.5,wallHeight:3},Xt={bun:{id:"bun",name:"面包",emoji:"🍞",choppable:!1,cookable:!1,color:14722908},patty:{id:"patty",name:"肉饼",emoji:"🥩",choppable:!1,cookable:!0,cookTime:5.5,burnTime:10.5,color:11096383,cookedColor:8010280,burntColor:2759446},cheese:{id:"cheese",name:"芝士",emoji:"🧀",choppable:!1,cookable:!1,color:15976517},lettuce:{id:"lettuce",name:"生菜",emoji:"🥬",choppable:!0,chopTime:1,cookable:!1,color:7323466},tomato:{id:"tomato",name:"番茄",emoji:"🍅",choppable:!0,chopTime:1.1,cookable:!1,color:14240314},onion:{id:"onion",name:"洋葱",emoji:"🧅",choppable:!0,chopTime:1.2,cookable:!1,color:13213912}};var an=s=>({ingredient:s,state:"raw"}),ve=s=>({ingredient:s,state:"chopped"}),zi=s=>({ingredient:s,state:"cooked"}),Re={salad:{id:"salad",name:"田园沙拉",emoji:"🥗",score:90,orderTime:62,tier:1,tags:["fresh","light","veg","classic"],ingredients:[ve("lettuce"),ve("tomato"),ve("onion")],desc:"生菜 + 番茄 + 洋葱（全部切好）",tint:"#7fd05a"},cheeseburger:{id:"cheeseburger",name:"芝士汉堡",emoji:"🍔",score:130,orderTime:72,tier:2,tags:["hearty","cheese","beef","classic"],ingredients:[an("bun"),zi("patty"),an("cheese"),ve("lettuce"),ve("tomato")],desc:"面包 + 熟肉饼 + 芝士 + 生菜碎 + 番茄碎",tint:"#ffb348"},double:{id:"double",name:"双层芝士堡",emoji:"🍔",score:185,orderTime:82,tier:3,tags:["hearty","cheese","beef","double"],ingredients:[an("bun"),zi("patty"),zi("patty"),an("cheese"),ve("lettuce"),ve("tomato")],desc:"面包 + 双熟肉饼 + 芝士 + 生菜碎 + 番茄碎",tint:"#ff7a45"},garden_salad:{id:"garden_salad",name:"番茄生菜杯",emoji:"🥬",score:65,orderTime:55,tier:1,tags:["fresh","light","veg","tomato"],ingredients:[ve("lettuce"),ve("tomato")],desc:"生菜碎 + 番茄碎（清爽小份）",tint:"#9bdc6a"},tomato_toast:{id:"tomato_toast",name:"番茄芝士烤面包",emoji:"🍞",score:80,orderTime:58,tier:1,tags:["fresh","cheese","tomato","light"],ingredients:[an("bun"),an("cheese"),ve("tomato")],desc:"面包 + 芝士 + 番茄碎",tint:"#ffcf70"},veggie_burger:{id:"veggie_burger",name:"田园素堡",emoji:"🥙",score:110,orderTime:68,tier:2,tags:["fresh","veg","cheese","light"],ingredients:[an("bun"),an("cheese"),ve("lettuce"),ve("tomato"),ve("onion")],desc:"面包 + 芝士 + 生菜碎 + 番茄碎 + 洋葱碎",tint:"#b7df6a"},onion_burger:{id:"onion_burger",name:"洋葱牛肉堡",emoji:"🍔",score:125,orderTime:70,tier:2,tags:["hearty","beef","onion","classic"],ingredients:[an("bun"),zi("patty"),an("cheese"),ve("onion")],desc:"面包 + 熟肉饼 + 芝士 + 洋葱碎",tint:"#e8a24b"},cheese_salad:{id:"cheese_salad",name:"芝士脆蔬",emoji:"🥗",score:115,orderTime:70,tier:2,tags:["fresh","cheese","veg","onion"],ingredients:[ve("lettuce"),ve("tomato"),ve("onion"),an("cheese")],desc:"生菜碎 + 番茄碎 + 洋葱碎 + 芝士",tint:"#d7c65a"},deluxe:{id:"deluxe",name:"全料豪华堡",emoji:"🍔",score:180,orderTime:80,tier:3,tags:["hearty","cheese","beef","onion","double"],ingredients:[an("bun"),zi("patty"),an("cheese"),ve("lettuce"),ve("tomato"),ve("onion")],desc:"面包 + 熟肉饼 + 芝士 + 生菜碎 + 番茄碎 + 洋葱碎",tint:"#ff9a4d"},double_onion:{id:"double_onion",name:"洋葱双层堡",emoji:"🍔",score:170,orderTime:78,tier:3,tags:["hearty","beef","onion","double"],ingredients:[an("bun"),zi("patty"),zi("patty"),ve("onion")],desc:"面包 + 双熟肉饼 + 洋葱碎",tint:"#e07a45"}},On=[{id:"crate_bun",kind:"crate",ingredient:"bun",label:"面包",x:-4.15,z:-3,w:1,d:1},{id:"crate_patty",kind:"crate",ingredient:"patty",label:"肉饼",x:-3,z:-3,w:1,d:1},{id:"crate_cheese",kind:"crate",ingredient:"cheese",label:"芝士",x:-1.85,z:-3,w:1,d:1},{id:"crate_lettuce",kind:"crate",ingredient:"lettuce",label:"生菜",x:-.7,z:-3,w:1,d:1},{id:"crate_tomato",kind:"crate",ingredient:"tomato",label:"番茄",x:.45,z:-3,w:1,d:1},{id:"crate_onion",kind:"crate",ingredient:"onion",label:"洋葱",x:1.6,z:-3,w:1,d:1},{id:"board",kind:"board",label:"砧板",x:-3.2,z:.3,w:1.5,d:1.15},{id:"stove1",kind:"stove",label:"煎炉 A",x:-1.6,z:.3,w:1.25,d:1.15},{id:"stove2",kind:"stove",label:"煎炉 B",x:-.15,z:.3,w:1.25,d:1.15},{id:"counter",kind:"counter",label:"出餐台",x:1.45,z:.3,w:1.5,d:1.15},{id:"plates",kind:"plateStack",label:"盘子",x:3,z:.3,w:1.15,d:1.15},{id:"pass",kind:"pass",label:"上菜窗口",x:3.7,z:-3,w:1.9,d:1},{id:"trash",kind:"trash",label:"垃圾桶",x:4.35,z:2.55,w:.8,d:.8}],Hi=Object.fromEntries(On.map(s=>[s.id,s])),Qs=[{id:"back-run",minX:-4.93,maxX:4.8,minZ:-3.5,maxZ:-2.5},{id:"island",minX:-3.95,maxX:3.65,minZ:-.25,maxZ:.85},{id:"trash",minX:3.95,maxX:4.75,minZ:2.15,maxZ:2.95}],ca={x:-1.1,z:2.95,yaw:-.16},ln=[{id:1,name:"早班 · 熟悉灶台",subtitle:"订单不多，先把流程跑顺。",duration:180,slots:2,spawnInterval:7,orderTimeScale:1.15,tier:2,recipes:["salad","garden_salad","tomato_toast","cheeseburger"],target:[300,475,625],tip:"生菜、番茄、洋葱都要先切；肉饼放进煎炉，熟了再拿。"},{id:2,name:"午市 · 客流高峰",subtitle:"两个窗口一起催单，别让订单过期。",duration:210,slots:2,spawnInterval:7,orderTimeScale:1.2,tier:2,recipes:["salad","cheeseburger","veggie_burger","onion_burger","double"],target:[300,425,800],tip:"提前煎几块肉饼，汉堡会快很多。"},{id:3,name:"夜宵 · 极限出餐",subtitle:"订单飞快，手慢就只能看客人走了。",duration:180,slots:2,spawnInterval:6,orderTimeScale:1.1,tier:3,recipes:["salad","cheeseburger","double","cheese_salad","deluxe","double_onion"],target:[225,375,625],tip:"连击越高分数越多，扔掉烧焦的肉饼别犹豫。"}],Nl=Object.fromEntries(ln.map(s=>[s.id,s]));function Gh(s){return s.map(t=>`${t.ingredient}:${t.state}`).sort().join("|")}var jf=Object.fromEntries(Object.values(Re).map(s=>[s.id,Gh(s.ingredients)]));function kn(s){if(!s||s.length===0)return null;let t=Gh(s);for(let e of Object.values(Re))if(jf[e.id]===t)return e;return null}function Ul(s){let t=new Map;for(let e of s.ingredients){let n=Xt[e.ingredient],i=e.state==="cooked"?`熟${n.name}`:e.state==="chopped"?`${n.name}碎`:n.name;t.set(i,(t.get(i)||0)+1)}return[...t.entries()].map(([e,n])=>({label:e,n}))}var Wh=1;function Qf(s,t="raw"){return{uid:`i${Wh++}`,type:"ingredient",ingredient:s,state:t,chopProgress:0,cookTimer:0}}function Fl(){return{uid:`p${Wh++}`,type:"plate",contents:[]}}function tr(){return{carry:null}}var fn=(s,t,e={})=>({ok:!0,action:s,message:t,...e}),Ce=s=>({ok:!1,action:"blocked",message:s});function Xe(s){if(!s)return"空手";if(s.type==="plate")return s.contents.length===0?"空盘子":"装好的盘子";let t=Xt[s.ingredient];return t?s.state==="burnt"?`烧焦的${t.name}`:s.state==="cooked"?`熟${t.name}`:s.state==="chopped"?`${t.name}碎`:t.name:"神秘食材"}function Bl(s){return s?s.type==="plate"?s.contents.length?`${s.contents.length} 种配料`:"空盘":s.state==="burnt"?"烧焦":s.state==="cooked"?"已熟":s.state==="chopped"?"切好":"":""}var ha=class{constructor(t=On){this.stations=new Map;for(let e of t)this.stations.set(e.id,{...e,item:null,sizzle:0,lastState:null});this.stationSeq=0}getStation(t){return this.stations.get(t)||null}get list(){return[...this.stations.values()]}setItem(t,e){let n=this.stations.get(t);if(!n)throw new Error(`unknown station ${t}`);n.item=e}interact(t,e){let n=this.stations.get(t);if(!n)return Ce("这里没有设备");switch(n.kind){case"crate":{if(e.carry)return Ce("双手已经拿满了");let i=Qf(n.ingredient);return e.carry=i,fn("pickup",`拿起${Xt[n.ingredient].name}`,{item:i,station:n})}case"board":{if(n.item){if(e.carry)return Ce("砧板上有东西，先拿走");let a=n.item;return n.item=null,e.carry=a,a.type==="ingredient"&&Xt[a.ingredient]?.choppable&&a.state!=="chopped"?fn("pickup",`拿起${Xe(a)}（还没切完）`,{item:a,station:n}):fn("pickup",`拿起${Xe(a)}`,{item:a,station:n})}if(!e.carry)return Ce("把需要切的食材放上砧板");if(e.carry.type!=="ingredient")return Ce("盘子不能放砧板上");let i=e.carry;e.carry=null,n.item=i;let r=Xt[i.ingredient];return r?.choppable&&i.state!=="chopped"?fn("place",`放上${r.name} · 按住互动键切碎`,{item:i,station:n}):fn("place",`放上${Xe(i)}`,{item:i,station:n})}case"stove":{if(n.item){if(e.carry)return Ce("先拿走煎炉上的食材");let a=n.item;return n.item=null,e.carry=a,fn("pickup",`拿起${Xe(a)}`,{item:a,station:n})}if(!e.carry)return Ce("把肉饼放上煎炉");if(e.carry.type!=="ingredient")return Ce("煎炉上不能放盘子");let i=Xt[e.carry.ingredient];if(!i?.cookable)return Ce(`${i?.name||"这个"}不用煎`);let r=e.carry;return e.carry=null,r.cookTimer=0,n.item=r,fn("place",`${i.name}开始滋滋作响`,{item:r,station:n})}case"plateStack":{if(e.carry)return Ce("双手已经拿满了");let i=Fl();return e.carry=i,fn("pickup","拿起一个空盘子",{item:i,station:n})}case"counter":{if(n.item?.type==="plate"){if(e.carry?.type==="ingredient"){let r=e.carry;e.carry=null,n.item.contents.push({ingredient:r.ingredient,state:r.state});let a=Xt[r.ingredient];return fn("topping",`把${Xe(r)}放上盘子`,{item:r,plate:n.item,station:n,ingredient:a})}if(e.carry?.type==="plate")return Ce("这张台子上已经有盘子了");if(e.carry)return Ce("手上还拿着东西");let i=n.item;return n.item=null,e.carry=i,fn("pickup",`端起盘子（${i.contents.length} 种配料）`,{item:i,station:n})}if(e.carry?.type==="plate"){let i=e.carry;return e.carry=null,n.item=i,fn("place","放下盘子，开始摆盘",{item:i,station:n})}return e.carry?Ce("先放一个空盘子在台面上"):Ce("出餐台上是空的")}case"pass":{if(!e.carry)return Ce("端一盘做好的菜过来");if(e.carry.type!=="plate")return Ce("上菜窗口只收装好的菜");if(e.carry.contents.length===0)return Ce("空盘子可不能上菜");let i=e.carry;return e.carry=null,fn("serve","出餐！",{plate:i,station:n})}case"trash":{if(!e.carry)return Ce("垃圾桶是空的");let i=e.carry;return e.carry=null,fn("trash",`扔掉了${Xe(i)}`,{item:i,station:n})}default:return Ce("这里没什么可做的")}}chopTick(t,e,n){let i=this.stations.get(t);if(!i||i.kind!=="board"||!i.item)return null;let r=i.item,a=Xt[r.ingredient];if(!a?.choppable||r.state==="chopped")return null;if(e.carry)return{active:!1,reason:"hands-full"};r.chopProgress=Math.min(a.chopTime,(r.chopProgress||0)+n);let o=r.chopProgress>=a.chopTime-1e-6;return o&&(r.state="chopped"),{active:!0,done:o,progress:r.chopProgress/a.chopTime,item:r,station:i}}tick(t){let e=[];for(let n of this.stations.values()){if(n.kind!=="stove"||!n.item||n.item.type!=="ingredient"){n.sizzle=Math.max(0,n.sizzle-t);continue}let i=Xt[n.item.ingredient];if(!i?.cookable)continue;let r=n.item;n.sizzle=1,r.state!=="burnt"&&(r.cookTimer+=t,r.state==="raw"&&r.cookTimer>=i.cookTime?(r.state="cooked",e.push({type:"cook:done",stationId:n.id,item:r,station:n})):r.state==="cooked"&&r.cookTimer>=i.burnTime&&(r.state="burnt",e.push({type:"cook:burn",stationId:n.id,item:r,station:n})))}return e}cookProgress(t){if(!t?.item||t.item.type!=="ingredient")return 0;let e=Xt[t.item.ingredient];return e?.cookable?t.item.state==="burnt"?1:t.item.state==="cooked"?Math.min(1,t.item.cookTimer/e.burnTime):Math.min(1,t.item.cookTimer/e.cookTime):0}clearItems(){for(let t of this.stations.values())t.item=null,t.sizzle=0}};var Jh="sizzle-rush:bindings:v1",zl={fp:{},arcade:{}},tp={forward:{label:"向前",group:"移动",defaults:["KeyW"]},back:{label:"向后",group:"移动",defaults:["KeyS"]},left:{label:"向左",group:"移动",defaults:["KeyA"]},right:{label:"向右",group:"移动",defaults:["KeyD"]},sprint:{label:"冲刺",group:"动作",defaults:["ShiftLeft","ShiftRight"]},interact:{label:"互动 / 切菜",group:"动作",defaults:["KeyE"]}},ep={p1Up:{label:"P1 向上",group:"P1",defaults:["KeyW"]},p1Down:{label:"P1 向下",group:"P1",defaults:["KeyS"]},p1Left:{label:"P1 向左",group:"P1",defaults:["KeyA"]},p1Right:{label:"P1 向右",group:"P1",defaults:["KeyD"]},p1Interact:{label:"P1 互动 / 切菜",group:"P1",defaults:["Space"]},p2Up:{label:"P2 向上",group:"P2",defaults:["ArrowUp"]},p2Down:{label:"P2 向下",group:"P2",defaults:["ArrowDown"]},p2Left:{label:"P2 向左",group:"P2",defaults:["ArrowLeft"]},p2Right:{label:"P2 向右",group:"P2",defaults:["ArrowRight"]},p2Interact:{label:"P2 互动 / 切菜",group:"P2",defaults:["Enter","NumpadEnter"]}},Xh={fp:tp,arcade:ep},$h={Space:"空格",Enter:"Enter",NumpadEnter:"小键盘Enter",ShiftLeft:"左Shift",ShiftRight:"右Shift",ControlLeft:"左Ctrl",ControlRight:"右Ctrl",AltLeft:"左Alt",AltRight:"右Alt",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Backquote:"`",Minus:"-",Equal:"=",BracketLeft:"[",BracketRight:"]",Backslash:"\\",Semicolon:";",Quote:"'",Comma:",",Period:".",Slash:"/",Tab:"Tab",CapsLock:"Caps",Backspace:"⌫",Delete:"Del",Insert:"Ins",Home:"Home",End:"End",PageUp:"PgUp",PageDown:"PgDn",NumpadAdd:"小键盘+",NumpadSubtract:"小键盘-",NumpadMultiply:"小键盘*",NumpadDivide:"小键盘/",NumpadDecimal:"小键盘."};function qh(s){return s?$h[s]?$h[s]:s.startsWith("Key")?s.slice(3):s.startsWith("Digit")?s.slice(5):s.startsWith("Numpad")?`小键盘${s.slice(6)}`:(s.startsWith("F")&&/^F\d{1,2}$/.test(s),s):"—"}function Yh(){try{if(typeof localStorage<"u"){let s=localStorage.getItem(Jh);if(s)return JSON.parse(s)}}catch{}return null}function np(s){try{if(typeof localStorage<"u"){localStorage.setItem(Jh,JSON.stringify(s));return}}catch{}zl.fp=s.fp||{},zl.arcade=s.arcade||{}}var Ol=new Map,Hl=class{constructor(t){if(!Xh[t])throw new Error(`unknown input mode ${t}`);this.mode=t,this.actions=Xh[t];let n=Yh()?.[t]||zl[t]||{};this.map={};for(let[i,r]of Object.entries(this.actions)){let a=Array.isArray(n[i])&&n[i].length?n[i]:null;this.map[i]=a?[...a]:[...r.defaults]}}codesFor(t){return this.map[t]||[]}label(t){return this.codesFor(t).map(qh).join(" / ")||"—"}primaryLabel(t){return qh(this.codesFor(t)[0])}conflict(t,e){for(let[n,i]of Object.entries(this.map))if(n!==t&&i.includes(e))return n;return null}set(t,e){if(!this.actions[t])return{ok:!1,reason:"unknown-action"};if(!e||e==="Escape")return{ok:!1,reason:"reserved"};let n=this.conflict(t,e);return n?{ok:!1,reason:"conflict",conflict:n,conflictLabel:this.actions[n].label}:(this.map[t]=[e],this.save(),{ok:!0})}reset(t=null){if(t&&this.actions[t])this.map[t]=[...this.actions[t].defaults];else for(let[e,n]of Object.entries(this.actions))this.map[e]=[...n.defaults];this.save()}save(){let t=Yh()||{};t[this.mode]={...this.map},np(t)}rows(){return Object.entries(this.actions).map(([t,e])=>({action:t,label:e.label,group:e.group,codes:this.codesFor(t),keyLabel:this.label(t)}))}};function pn(s){return Ol.has(s)||Ol.set(s,new Hl(s)),Ol.get(s)}var ls=class{constructor(t,{onDevice:e=null,preventCodes:n=["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]}={}){this.bindings=t,this.onDevice=e,this.preventCodes=new Set(n),this.enabled=!0,this.down=new Set,this.just=new Set,this.framePressed=new Set,this._bind()}_bind(){this._onKeyDown=t=>{this.enabled&&(this.preventCodes.has(t.code)&&t.preventDefault(),this.onDevice?.("keyboard"),this.down.add(t.code),t.repeat||this.just.add(t.code))},this._onKeyUp=t=>this.down.delete(t.code),this._onBlur=()=>{this.down.clear(),this.just.clear(),this.framePressed.clear()},window.addEventListener("keydown",this._onKeyDown),window.addEventListener("keyup",this._onKeyUp),window.addEventListener("blur",this._onBlur)}beginFrame(){this.framePressed.clear();for(let t of this.just)for(let e of Object.keys(this.bindings.actions))this.bindings.codesFor(e).includes(t)&&this.framePressed.add(e);this.just.clear()}isDown(t){return this.enabled?this.bindings.codesFor(t).some(e=>this.down.has(e)):!1}pressed(t){return this.framePressed.has(t)}setEnabled(t){this.enabled=t,t||this.clear()}clear(){this.down.clear(),this.just.clear(),this.framePressed.clear()}dispose(){window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("keyup",this._onKeyUp),window.removeEventListener("blur",this._onBlur)}};function Zh(s,t,e=.18){let n=Math.hypot(s,t);if(n<e)return{x:0,y:0,mag:0};let i=Math.min(1,(n-e)/(1-e));return{x:s/n*i,y:t/n*i,mag:i}}var zn=(s,t)=>{let e=s?.buttons?.[t];return e?typeof e=="number"?e:e.value||(e.pressed?1:0):0};function ip(s){if(!s||!s.connected)return null;let t=s.axes||[],e=Zh(t[0]||0,t[1]||0),n=Zh(t[2]||0,t[3]||0),i=e.x,r=e.y;return Math.abs(i)<.01&&Math.abs(r)<.01&&(i=(zn(s,15)?1:0)-(zn(s,14)?1:0),r=(zn(s,13)?1:0)-(zn(s,12)?1:0)),{connected:!0,id:s.id||"",moveX:i,moveY:r,lookX:n.x,lookY:n.y,interact:zn(s,0)>.4,chop:zn(s,2)>.4||zn(s,5)>.4,sprint:zn(s,7)>.4||zn(s,10)>.4,pause:zn(s,9)>.4,active:e.mag>.15||n.mag>.15||Array.from(s.buttons||[]).some(a=>typeof a=="number"?a>.4:a.pressed)}}var kl={connected:!1,moveX:0,moveY:0,lookX:0,lookY:0,interact:!1,chop:!1,sprint:!1,pause:!1,active:!1},Vi=class{constructor({index:t=0,onDevice:e=null}={}){this.index=t,this.onDevice=e,this.state={...kl},this.prev={...kl},this._wasActive=!1}_pickPad(t){if(!t)return null;let e=t[this.index];return e?.connected?e:this.index===0&&Array.from(t).find(n=>n?.connected)||null}poll(t=void 0){let e=t;if(e===void 0)try{e=this._pickPad(navigator.getGamepads?navigator.getGamepads():null)}catch{e=null}return this.prev=this.state,this.state=ip(e)||{...kl},this.state.active&&!this._wasActive&&this.onDevice?.("gamepad"),this._wasActive=this.state.active,this.state}get connected(){return this.state.connected}get pressedInteract(){return this.state.interact&&!this.prev.interact}get pressedPause(){return this.state.pause&&!this.prev.pause}get chopHeld(){return this.state.chop||this.state.interact}get sprintHeld(){return this.state.sprint}get move(){return{x:this.state.moveX,y:this.state.moveY}}get look(){return{x:this.state.lookX,y:this.state.lookY}}};function ei(){if(typeof navigator>"u")return!1;if((navigator.maxTouchPoints||0)>0)return!0;try{return typeof matchMedia=="function"&&matchMedia("(pointer: coarse)").matches}catch{return!1}}var sp=(s,t,e)=>Math.max(t,Math.min(e,s)),ua=class{constructor({onPause:t=null,onDevice:e=null}={}){this.root=document.getElementById("touch-controls"),this.stick=document.getElementById("touch-stick"),this.knob=document.getElementById("touch-knob"),this.action=document.getElementById("touch-action"),this.pause=document.getElementById("touch-pause"),this.onPause=t,this.onDevice=e,this.enabled=!1,this.active=!1,this.x=0,this.y=0,this.mag=0,this.interactHeld=!1,this.pressedInteract=!1,this._stickId=null,this._actionId=null,this._cx=0,this._cy=0,this._max=46,this._bind()}_bind(){!this.stick||!this.action||(this._onStickDown=t=>{if(!this.enabled)return;t.preventDefault(),this.onDevice?.("touch"),this._stickId=t.pointerId;try{this.stick.setPointerCapture(t.pointerId)}catch{}let e=this.stick.getBoundingClientRect();this._cx=e.left+e.width/2,this._cy=e.top+e.height/2,this._max=Math.max(24,e.width*.34),this.active=!0,this._moveStick(t)},this._onStickMove=t=>{t.pointerId===this._stickId&&(t.preventDefault(),this._moveStick(t))},this._onStickUp=t=>{t.pointerId===this._stickId&&this._resetStick()},this._onActionDown=t=>{if(this.enabled){t.preventDefault(),this.onDevice?.("touch"),this._actionId=t.pointerId;try{this.action.setPointerCapture(t.pointerId)}catch{}this.interactHeld=!0,this.pressedInteract=!0,this.action.classList.add("held")}},this._onActionUp=t=>{t.pointerId===this._actionId&&(this._actionId=null,this.interactHeld=!1,this.action.classList.remove("held"))},this._onPause=t=>{this.enabled&&(t.preventDefault(),this.onPause?.())},this.stick.addEventListener("pointerdown",this._onStickDown),this.stick.addEventListener("pointermove",this._onStickMove),this.stick.addEventListener("pointerup",this._onStickUp),this.stick.addEventListener("pointercancel",this._onStickUp),this.action.addEventListener("pointerdown",this._onActionDown),this.action.addEventListener("pointerup",this._onActionUp),this.action.addEventListener("pointercancel",this._onActionUp),this.pause?.addEventListener("pointerdown",this._onPause),window.addEventListener("pointerup",this._onStickUp),window.addEventListener("pointerup",this._onActionUp),window.addEventListener("pointercancel",this._onStickUp),window.addEventListener("pointercancel",this._onActionUp))}_moveStick(t){let e=t.clientX-this._cx,n=t.clientY-this._cy,i=Math.hypot(e,n),r=i>this._max?this._max/i:1,a=e*r,o=n*r;this.x=a/this._max,this.y=o/this._max,this.mag=sp(i/this._max,0,1),this.knob&&(this.knob.style.transform=`translate(${a}px, ${o}px)`)}_resetStick(){this._stickId=null,this.active=!1,this.x=0,this.y=0,this.mag=0,this.knob&&(this.knob.style.transform="translate(0px, 0px)")}beginFrame(){}endFrame(){this.pressedInteract=!1}setEnabled(t){this.enabled=!!t,this.root?.classList.toggle("hidden",!this.enabled),document.body?.classList.toggle("touch-mode",this.enabled),this.enabled||(this._resetStick(),this._actionId=null,this.interactHeld=!1,this.pressedInteract=!1,this.action?.classList.remove("held"))}dispose(){this.setEnabled(!1),!(!this.stick||!this.action)&&(this.stick.removeEventListener("pointerdown",this._onStickDown),this.stick.removeEventListener("pointermove",this._onStickMove),this.stick.removeEventListener("pointerup",this._onStickUp),this.stick.removeEventListener("pointercancel",this._onStickUp),this.action.removeEventListener("pointerdown",this._onActionDown),this.action.removeEventListener("pointerup",this._onActionUp),this.action.removeEventListener("pointercancel",this._onActionUp),this.pause?.removeEventListener("pointerdown",this._onPause),window.removeEventListener("pointerup",this._onStickUp),window.removeEventListener("pointerup",this._onActionUp),window.removeEventListener("pointercancel",this._onStickUp),window.removeEventListener("pointercancel",this._onActionUp))}};var jh="sizzle-rush:playtests:v1";var Vl=[];function Qh(){try{if(typeof localStorage<"u")return localStorage}catch{}return null}function da(){let s=Qh();if(!s)return[...Vl];try{let t=s.getItem(jh);if(!t)return[];let e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function fa(s){let t=Qh();if(t)try{t.setItem(jh,JSON.stringify(s));return}catch{}Vl.length=0,Vl.push(...s)}function tu(s,t){let e=Math.max(0,Math.round(s.served||0)),n=Math.max(0,Math.round(s.expired||0)),i=Math.max(1,e+n),r=["novice","average","expert","unknown"].includes(s.skill)?s.skill:"unknown",a=!(s.firstTime===!1||s.firstTime==="false");return{id:t||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,at:typeof s.at=="string"&&s.at?s.at:new Date().toISOString(),build:s.build||"1.0.0",mode:s.mode==="arcade"?"arcade":"fp",level:Number(s.level)||1,players:Number(s.players)||1,source:s.source==="automation"?"automation":"human",device:s.device||"keyboard",participant:typeof s.participant=="string"?s.participant.trim().slice(0,24):"",skill:r,firstTime:a,duration:Math.round(s.duration||0),firstServe:s.firstServe==null?null:Math.max(0,Math.round(Number(s.firstServe)*10)/10),pauses:Math.max(0,Math.round(s.pauses||0)),difficulty:Math.max(0,Math.min(5,Math.round(s.difficulty||0))),wantReplay:["yes","maybe","no"].includes(s.wantReplay)?s.wantReplay:"",score:Math.max(0,Math.round(s.score||0)),stars:Math.max(0,Math.min(3,Math.round(s.stars||0))),served:e,expired:n,wasted:Math.max(0,Math.round(s.wasted||0)),burnt:Math.max(0,Math.round(s.burnt||0)),maxCombo:Math.max(0,Math.round(s.maxCombo||0)),timeoutRate:Math.round(n/i*1e3)/1e3,notes:typeof s.notes=="string"?s.notes.slice(0,240):""}}function eu(s){let t=tu(s),e=da();e.push(t);let n=e.slice(-500);return fa(n),t}function nu(s){let t=new Map(da().map(r=>[r.id,r])),e=0,n=0;for(let r of s||[]){if(!r||typeof r!="object"){n++;continue}let a=typeof r.id=="string"&&r.id?r.id:null;if(a&&t.has(a)){n++;continue}let o=tu(r,a);if(t.has(o.id)){n++;continue}t.set(o.id,o),e++}let i=[...t.values()].slice(-500);return fa(i),{added:e,skipped:n,total:i.length}}function iu(s,t={}){let e=da(),n=e.findIndex(a=>a.id===s);if(n<0)return null;let i=e[n],r={...i,difficulty:t.difficulty!=null?Math.max(1,Math.min(5,Math.round(Number(t.difficulty)||0))):i.difficulty||0,wantReplay:["yes","maybe","no"].includes(t.wantReplay)?t.wantReplay:i.wantReplay||""};return e[n]=r,fa(e),r}function er(s={}){return da().filter(t=>!(s.mode&&t.mode!==s.mode||s.level&&t.level!==s.level||s.source&&t.source!==s.source||s.skill&&t.skill!==s.skill||s.participant&&t.participant!==s.participant))}var Oe=s=>s.length?s.reduce((t,e)=>t+e,0)/s.length:0,cn=(s,t=1)=>Math.round(s*10**t)/10**t;function Gl(s={}){let t=er(s),e=t.filter(a=>a.source==="human"),n=[],i=["fp","arcade"],r=[...new Set(t.map(a=>a.level))].sort((a,o)=>a-o);for(let a of i)for(let o of r){let l=t.filter(u=>u.mode===a&&u.level===o);if(!l.length)continue;let c=l.filter(u=>u.source==="human");n.push({mode:a,level:o,count:l.length,humanCount:c.length,avgServed:cn(Oe(l.map(u=>u.served))),avgExpired:cn(Oe(l.map(u=>u.expired))),avgWasted:cn(Oe(l.map(u=>u.wasted))),timeoutRate:cn(Oe(l.map(u=>u.timeoutRate))*100,1),avgScore:Math.round(Oe(l.map(u=>u.score))),avgStars:cn(Oe(l.map(u=>u.stars))),bestScore:Math.max(...l.map(u=>u.score)),humanAvgServed:c.length?cn(Oe(c.map(u=>u.served))):null,humanTimeoutRate:c.length?cn(Oe(c.map(u=>u.timeoutRate))*100,1):null,humanAvgScore:c.length?Math.round(Oe(c.map(u=>u.score))):null,humanAvgStars:c.length?cn(Oe(c.map(u=>u.stars))):null,humanAvgFirstServe:(()=>{let u=c.filter(d=>d.firstServe!=null);return u.length?cn(Oe(u.map(d=>d.firstServe))):null})(),humanAvgPauses:c.length?cn(Oe(c.map(u=>u.pauses||0))):null})}return{total:t.length,human:e.length,automation:t.length-e.length,rows:n,avgServed:cn(Oe(t.map(a=>a.served))),timeoutRate:cn(Oe(t.map(a=>a.timeoutRate))*100,1),avgScore:Math.round(Oe(t.map(a=>a.score))),avgFirstServe:(()=>{let a=t.filter(o=>o.firstServe!=null);return a.length?cn(Oe(a.map(o=>o.firstServe))):null})(),avgPauses:cn(Oe(t.map(a=>a.pauses||0)))}}function rp(s){let t=String(s??"");return/[",\n]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}var Kh=["id","at","build","mode","level","players","source","device","participant","skill","firstTime","duration","firstServe","pauses","difficulty","wantReplay","score","stars","served","expired","wasted","burnt","maxCombo","timeoutRate","notes"];function su(s={}){let t=er(s),e=[Kh.join(",")];for(let n of t)e.push(Kh.map(i=>rp(n[i])).join(","));return`${e.join(`
`)}
`}function ru(s={}){return JSON.stringify({exportedAt:new Date().toISOString(),sessions:er(s)},null,2)}function au(){fa([])}var hu=["novice","average","expert","unknown"],ap=["fp","arcade"],ii=(s,t=0)=>{let e=Number(s);return Number.isFinite(e)?e:t},ni=(s,t=1)=>Math.round(s*10**t)/10**t,Wl=s=>Math.round(s/25)*25;function uu(s){let t=String(s||"").replace(/^\uFEFF/,""),e=[],n=[],i="",r=!1;for(let o=0;o<t.length;o++){let l=t[o];if(r){l==='"'?t[o+1]==='"'?(i+='"',o++):r=!1:i+=l;continue}l==='"'?r=!0:l===","?(n.push(i),i=""):l===`
`?(n.push(i),e.push(n),n=[],i=""):l!=="\r"&&(i+=l)}if((i.length||n.length)&&(n.push(i),e.push(n)),e.length<2)return[];let a=e[0].map(o=>o.trim());return e.slice(1).filter(o=>o.some(l=>l!=="")).map(o=>Object.fromEntries(a.map((l,c)=>[l,o[c]??""])))}function Hn(s,t){if(!s.length)return 0;let e=[...s].map(Number).filter(Number.isFinite).sort((a,o)=>a-o);if(!e.length)return 0;let n=(e.length-1)*(Math.max(0,Math.min(100,t))/100),i=Math.floor(n),r=Math.ceil(n);return i===r?e[i]:e[i]+(e[r]-e[i])*(n-i)}function ou(s){if(!s.length)return null;let t=s.map(o=>ii(o.served)),e=s.map(o=>ii(o.score)),n=s.map(o=>ii(o.timeoutRate)*100),i=s.filter(o=>o.firstServe!=null&&o.firstServe!=="").map(o=>ii(o.firstServe)),r=s.filter(o=>ii(o.difficulty)>0).map(o=>ii(o.difficulty)),a={yes:0,maybe:0,no:0};for(let o of s)a[o.wantReplay]!=null&&a[o.wantReplay]++;return{n:s.length,served:{p25:ni(Hn(t,25)),p50:ni(Hn(t,50)),p75:ni(Hn(t,75))},timeout:{p25:ni(Hn(n,25)),p50:ni(Hn(n,50)),p75:ni(Hn(n,75))},score:{p25:Math.round(Hn(e,25)),p50:Math.round(Hn(e,50)),p75:Math.round(Hn(e,75))},firstServe:i.length?ni(Hn(i,50)):null,avgDifficulty:r.length?ni(r.reduce((o,l)=>o+l,0)/r.length,1):null,replay:a,avgStars:ni(s.reduce((o,l)=>o+ii(l.stars),0)/s.length,2)}}function lu(s){return hu.includes(s.skill)?s.skill:"unknown"}function op(s){return s.source==="automation"?"automation":"human"}function du(s,{minSamples:t=3,players:e=1,includeAutomation:n=!1}={}){let i=Array.isArray(s)?s:[],r=i.filter(h=>op(h)==="human"),a=n?i:r,o=a.filter(h=>e==="all"?!0:ii(h.players,1)===Number(e)),l=[];r.length||l.push("CSV 里没有真人样本（source=human）；请用非自动化浏览器试玩，或从导出文件里移除 automation 行后再分析。"),!n&&a.length!==i.length&&l.push(`已忽略 ${i.length-a.length} 条自动化样本。`),e!=="all"&&l.push(`只统计 ${e}P 样本；2P 合作会显著提高分数，目标仍以 1P 为准。`),o.length||l.push(`没有符合当前筛选（${e==="all"?"全部人数":`${e}P`}）的样本，请检查 CSV 的 players/source 列。`);let c=new Map;for(let h of o){let p=h.mode==="arcade"?"arcade":"fp",g=ii(h.level,1),y=`${p}:${g}`;c.has(y)||c.set(y,{mode:p,level:g,sessions:[]}),c.get(y).sessions.push(h)}let u=[];for(let h of ap)for(let p of ln){let y=c.get(`${h}:${p.id}`)?.sessions||[],m=Object.fromEntries(hu.map(M=>[M,ou(y.filter(A=>lu(A)===M))])),f=y.filter(M=>lu(M)==="unknown").length;f&&l.push(`${h} SHIFT ${p.id}: ${f} 条样本没有经验标签（skill=unknown），不会参与阈值推荐。`),u.push({mode:h,level:p.id,currentTarget:[...p.target],sessions:y.length,bySkill:m,overall:ou(y)})}let d=u.map(h=>{let p=h.bySkill.novice,g=h.bySkill.average,y=h.bySkill.expert,m=[];(!p||p.n<t)&&m.push(`novice(${p?.n||0}/${t})`),(!g||g.n<t)&&m.push(`average(${g?.n||0}/${t})`),(!y||y.n<t)&&m.push(`expert(${y?.n||0}/${t})`);let f=null;if(!m.length){let M=Math.max(100,Wl(p.score.p50)),A=Math.max(M+100,Wl(g.score.p50)),b=Math.max(A+100,Wl(y.score.p75));f=[M,A,b]}return{mode:h.mode,level:h.level,currentTarget:h.currentTarget,target:f,ready:!!f,missing:m,samples:{novice:p?.n||0,average:g?.n||0,expert:y?.n||0,total:h.sessions}}});for(let h of d){let p=u.find(y=>y.mode===h.mode&&y.level===h.level);if(!h.ready){p.sessions>0&&l.push(`${cu(h.mode)} SHIFT ${h.level}: 样本不足（${h.missing.join("、")}），未生成建议。`);continue}let g=p.bySkill.expert.timeout.p50;g>25&&l.push(`${cu(h.mode)} SHIFT ${h.level}: 熟练组超时率 p50=${g}% > 25%，优先放宽订单耐心/队列，而不是继续降分。`)}return{totalRows:i.length,humanRows:r.length,automationRows:i.length-r.length,selectedRows:o.length,players:e,minSamples:t,includeAutomation:n,groups:u,recommendations:d,warnings:l}}function cu(s){return s==="fp"?"沉浸厨房":"街机厨房"}var fu="sizzle-rush:rsi:v1",pu=180,Xl=["fresh","light","veg","hearty","cheese","classic","beef","onion","tomato","double"],hs=[{id:"shanghai",name:"上海",emoji:"🏙️",tags:["cheese","fresh","classic"],line:"弄堂口的芝士香"},{id:"chengdu",name:"成都",emoji:"🌶️",tags:["onion","hearty","beef"],line:"雨夜里要一口扎实的"},{id:"guangzhou",name:"广州",emoji:"🌴",tags:["fresh","light","veg"],line:"天热也要清爽"},{id:"beijing",name:"北京",emoji:"🏮",tags:["hearty","classic","beef"],line:"大风天吃厚实的"},{id:"hangzhou",name:"杭州",emoji:"🌿",tags:["light","fresh","tomato"],line:"湖边的小清新"}],us=[{id:"sunny",name:"晴朗",emoji:"☀️",tags:["fresh","light","tomato"]},{id:"rain",name:"下雨",emoji:"🌧️",tags:["hearty","cheese","classic"]},{id:"snow",name:"下雪",emoji:"❄️",tags:["hearty","beef","cheese"]},{id:"heat",name:"热浪",emoji:"🔥",tags:["fresh","light","veg"]},{id:"wind",name:"起风",emoji:"🌬️",tags:["classic","onion"]}],ir=[{id:"fresh",name:"清爽",emoji:"🥬"},{id:"veg",name:"素食",emoji:"🥗"},{id:"hearty",name:"肉食",emoji:"🥩"},{id:"cheese",name:"芝士",emoji:"🧀"},{id:"onion",name:"辛香",emoji:"🧅"},{id:"tomato",name:"番茄",emoji:"🍅"},{id:"classic",name:"经典",emoji:"🍔"}],nr={fresh:"清爽",light:"轻食",veg:"素食",hearty:"厚实",cheese:"芝士",classic:"经典",beef:"牛肉",onion:"辛香",tomato:"番茄",double:"双层"},bi={state:null},Gi=(s,t,e)=>Math.max(t,Math.min(e,s)),cs=(s,t=3)=>Math.round(s*10**t)/10**t;function $l(){return Object.fromEntries(Xl.map(s=>[s,1]))}function mu(s=new Date){let t=s.getMonth()+1;return{version:1,context:{city:"shanghai",weather:t>=6&&t<=8?"heat":t===12||t<=2?"snow":"sunny",prefs:["fresh"]},policy:{version:1,weights:$l(),exploration:.12,replayScore:0,updatedAt:null},history:[],lastRecommendation:null}}function lp(s){let t=mu();if(!s||typeof s!="object")return t;let e={...t,...s,context:{...t.context,...s.context||{}},policy:{...t.policy,...s.policy||{}},history:Array.isArray(s.history)?s.history.slice(-pu):[]};e.context.prefs=Array.isArray(e.context.prefs)?e.context.prefs.filter(n=>ir.some(i=>i.id===n)).slice(0,4):[],hs.some(n=>n.id===e.context.city)||(e.context.city=t.context.city),us.some(n=>n.id===e.context.weather)||(e.context.weather=t.context.weather),e.policy.weights={...$l(),...e.policy.weights||{}};for(let n of Xl)e.policy.weights[n]=Gi(Number(e.policy.weights[n])||1,.2,2.5);return e.policy.version=Math.max(1,Number(e.policy.version)||1),e.policy.exploration=Gi(Number(e.policy.exploration)||.12,0,.4),e}function gu(){try{if(typeof localStorage<"u")return localStorage}catch{}return null}function si(){if(bi.state)return bi.state;let s=gu();if(s)try{let t=s.getItem(fu);t&&(bi.state=lp(JSON.parse(t)))}catch{}return bi.state||(bi.state=mu()),bi.state}function ma(){if(!bi.state)return;let s=gu();if(s)try{s.setItem(fu,JSON.stringify(bi.state))}catch{}}function ga(){return _u(si())}function _u(s){return{...s.context,cityInfo:ql(s.context.city),weatherInfo:Yl(s.context.weather),prefsInfo:s.context.prefs.map(t=>ir.find(e=>e.id===t)).filter(Boolean)}}function sr(s={}){let t=si();return t.context={...t.context,...s},t.context.prefs=Array.isArray(t.context.prefs)?t.context.prefs.filter(e=>ir.some(n=>n.id===e)).slice(0,4):t.context.prefs,hs.some(e=>e.id===t.context.city)||(t.context.city="shanghai"),us.some(e=>e.id===t.context.weather)||(t.context.weather="sunny"),ma(),ga()}function cp(){try{let s=Intl.DateTimeFormat().resolvedOptions().timeZone||"";if(/Chongqing|Chengdu/i.test(s))return"chengdu";if(/Guangzhou|Shenzhen/i.test(s))return"guangzhou";if(/Beijing|Tianjin/i.test(s))return"beijing";if(/Hangzhou/i.test(s))return"hangzhou";if(/Shanghai/i.test(s))return"shanghai"}catch{}return"shanghai"}function hp(s="shanghai",t=new Date){let e=t.getMonth()+1,n="sunny";e>=6&&e<=8?n="heat":e===12||e<=2?n="snow":e>=3&&e<=5?n="rain":n="wind";let r={heat:["heat","sunny","wind"],snow:["snow","wind"],rain:["rain","wind"],wind:["wind","rain","sunny"],sunny:["sunny","wind"]}[n]||[n];return r[Math.floor(yu(`${s}|${Zl(t).key}|${n}`)*r.length)]||n}function xu(s=new Date){let t=cp(),e=hp(t,s);return sr({city:t,weather:e})}function ql(s){return hs.find(t=>t.id===s)||hs[0]}function Yl(s){return us.find(t=>t.id===s)||us[0]}function Zl(s){let t=s instanceof Date?s:new Date(s);return{year:t.getFullYear(),month:t.getMonth()+1,day:t.getDate(),key:`${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()}`}}function yu(s){let t=2166136261;for(let e=0;e<String(s).length;e++)t^=String(s).charCodeAt(e),t=Math.imul(t,16777619);return(t>>>0)/4294967296}function vu(s){let t={};for(let e of s||[])for(let[n,i]of Object.entries(e.dishCounts||{}))t[n]=(t[n]||0)+(Number(i)||0);return t}function up(s,t,e,n,i,r){let a=t.context,o=ql(a.city),l=Yl(a.weather),c=new Set(s.tags||[]),u=f=>t.policy.weights[f]??1,d=.25,h=[];for(let f of c)d+=u(f)*.3,o.tags.includes(f)&&(d+=u(f)*.8),l.tags.includes(f)&&(d+=u(f)*1),a.prefs.includes(f)&&(d+=u(f)*1.25);let p=o.tags.filter(f=>c.has(f));p.length&&h.push(`${o.name} · ${p.map(f=>nr[f]).join("/")}`);let g=l.tags.filter(f=>c.has(f));g.length&&h.push(`${l.name} · ${g.map(f=>nr[f]).join("/")}`);let y=a.prefs.filter(f=>c.has(f));y.length&&h.push(`你偏好 · ${y.map(f=>nr[f]).join("/")}`),l.id==="heat"&&(c.has("fresh")||c.has("light"))&&(d+=.5),l.id==="heat"&&c.has("hearty")&&(d-=.35),(l.id==="rain"||l.id==="snow")&&(c.has("hearty")||c.has("cheese"))&&(d+=.45);let m=e[s.id]||0;return d+=Math.max(0,.8-m*.12),m===0?h.push("没做过 · 新鲜感"):m>=4&&h.push(`做过 ${m} 次`),n.includes(s.id)&&(d-=.18),s.tier===3&&(d+=.05),d+=yu(`${i}|${s.id}|${r}`)*.08,{recipe:s,score:d,reasons:h.slice(0,3),made:m}}function ds(s,{state:t=si(),date:e=new Date,variant:n=0}={}){let i=Number(s?.tier)||3,r=Zl(e),a=vu(t.history),o=(t.history||[]).slice(-6).flatMap(h=>h.recommended||[]),c=Object.values(Re).filter(h=>(h.tier||1)<=i).map(h=>up(h,t,a,o,r.key,n)).sort((h,p)=>p.score-h.score||h.recipe.id.localeCompare(p.recipe.id)),u=c.slice(0,3),d=c.slice(0,Math.max(3,Math.min(8,c.length)));if(n>0&&d.length>3){let h=n%d.length;u=[...d.slice(h),...d.slice(0,h)].slice(0,3)}if(t.policy.exploration>0&&d.length>3){let p=d.slice(3).filter(g=>!u.some(y=>y.recipe.id===g.recipe.id)).sort((g,y)=>g.made-y.made||y.score-g.score)[0];p&&p.made<2&&(u=[...u.slice(0,2),p])}return{ids:u.map(h=>h.recipe.id),items:u.map(h=>({id:h.recipe.id,name:h.recipe.name,emoji:h.recipe.emoji,score:h.recipe.score,tier:h.recipe.tier,tags:h.recipe.tags||[],reasons:h.reasons,predicted:cs(h.score)})),context:_u(t),tier:i,policyVersion:t.policy.version,date:r,variant:n}}function pa(s,t,e,n=s.policy.exploration){if(!e.length)return 0;let i=0;for(let r=0;r<e.length;r++){let a=e[r],o={...s,context:{...s.context,...a.context||{}},history:e.slice(0,r),policy:{...s.policy,weights:t,exploration:n}},l={tier:Math.max(1,Math.min(3,Number(a.level)||1))},c=ds(l,{state:o,date:a.at||new Date,variant:0}),u=Object.values(a.dishCounts||{}).reduce((p,g)=>p+(Number(g)||0),0),d=u?c.ids.reduce((p,g)=>p+(Number(a.dishCounts?.[g])||0),0)/u:0,h=(Number(a.stars)||0)/3*.5+(1-Gi(Number(a.timeoutRate)||0,0,1))*.3+(a.wantReplay==="yes"?.15:a.wantReplay==="maybe"?.07:0)+(Number(a.difficulty)>=3&&Number(a.difficulty)<=4?.05:0);i+=d*.6+h*.4}return i/e.length}function dp(s=si()){let t=s.history||[];if(t.length<2)return{changed:!1,reason:"need-more-shifts",score:s.policy.replayScore,candidates:0};let e={...s.policy.weights},n=s.policy.exploration,i={weights:e,score:pa(s,e,t,n),exploration:n},r=[];for(let c of Xl)for(let u of[-.2,.2]){let d={...e,[c]:Gi(e[c]+u,.2,2.5)},h=pa(s,d,t,n);r.push({weights:d,score:h,tag:c,delta:u}),h>i.score+1e-6&&(i={weights:d,score:h,exploration:n})}for(let c of[.05,.2,.3]){let u=pa(s,e,t,c);r.push({weights:e,score:u,exploration:c}),u>i.score+1e-6&&(i={weights:e,score:u,exploration:c})}let a={...$l()};for(let c of t)for(let[u,d]of Object.entries(c.dishCounts||{})){let h=Re[u];if(h)for(let p of h.tags||[])a[p]=Gi((a[p]||1)+(Number(d)||0)*.12,.2,2.5)}let o=pa(s,a,t,n);r.push({weights:a,score:o,source:"empirical"}),o>i.score+1e-6&&(i={weights:a,score:o,exploration:n});let l=s.policy.replayScore||0;return i.score<=l+1e-5?(s.policy.replayScore=cs(Math.max(l,i.score),4),ma(),{changed:!1,reason:"no-better-policy",score:cs(i.score,4),candidates:r.length}):(s.policy={...s.policy,weights:i.weights,exploration:Gi(i.exploration??s.policy.exploration,0,.4),replayScore:cs(i.score,4),version:s.policy.version+1,updatedAt:new Date().toISOString()},ma(),{changed:!0,fromVersion:s.policy.version-1,toVersion:s.policy.version,score:cs(i.score,4),delta:cs(i.score-l,4),candidates:r.length})}function bu(s){let t=si(),e=Zl(s.at||new Date),n=Array.isArray(s.recommended)?s.recommended.filter(o=>Re[o]):[],i={};for(let[o,l]of Object.entries(s.dishCounts||{}))Re[o]&&Number(l)>0&&(i[o]=Number(l));let r={id:s.id||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,at:s.at||new Date().toISOString(),year:e.year,month:e.month,day:e.day,mode:s.mode==="arcade"?"arcade":"fp",level:Number(s.level)||1,players:Number(s.players)||1,context:{...t.context},recommended:n,dishCounts:i,served:Math.max(0,Math.round(s.served||0)),score:Math.max(0,Math.round(s.score||0)),stars:Math.max(0,Math.min(3,Math.round(s.stars||0))),timeoutRate:Gi(Number(s.timeoutRate)||0,0,1),difficulty:Math.max(0,Math.min(5,Math.round(s.difficulty||0))),wantReplay:["yes","maybe","no"].includes(s.wantReplay)?s.wantReplay:"",policyVersion:t.policy.version};t.history.push(r),t.history=t.history.slice(-pu),t.lastRecommendation=n;let a=dp(t);return r.policyVersion=t.policy.version,ma(),{record:r,improvement:a,policy:{...t.policy}}}function Jl(s=new Date().getFullYear(),t=si()){let e=Number(s)||new Date().getFullYear(),n=t.history.filter(S=>Number(S.year)===e),i=vu(n),r=Object.entries(i).map(([S,T])=>({...Re[S],id:S,count:T})).filter(S=>S.name).sort((S,T)=>T.count-S.count||T.score-S.score),a={},o={},l=new Map;for(let S of n){a[S.context?.city]=(a[S.context?.city]||0)+1,o[S.context?.weather]=(o[S.context?.weather]||0)+1;let T=Number(S.month)||1;l.has(T)||l.set(T,{month:T,shifts:0,dishes:{}});let x=l.get(T);x.shifts++;for(let[E,C]of Object.entries(S.dishCounts||{}))x.dishes[E]=(x.dishes[E]||0)+Number(C)}let c=Object.entries(a).map(([S,T])=>({...ql(S),count:T})).sort((S,T)=>T.count-S.count),u=Object.entries(o).map(([S,T])=>({...Yl(S),count:T})).sort((S,T)=>T.count-S.count),d=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],h=[...l.values()].sort((S,T)=>S.month-T.month).map(S=>{let T=Object.entries(S.dishes).sort((x,E)=>E[1]-x[1])[0];return{...S,label:d[S.month-1],totalDishes:Object.values(S.dishes).reduce((x,E)=>x+E,0),top:T?{...Re[T[0]],count:T[1]}:null}}),p=S=>S>=3&&S<=5?"春":S>=6&&S<=8?"夏":S>=9&&S<=11?"秋":"冬",g=["春","夏","秋","冬"].map(S=>{let T=h.filter(x=>p(x.month)===S);return{name:S,shifts:T.reduce((x,E)=>x+E.shifts,0),dishes:T.reduce((x,E)=>x+E.totalDishes,0),months:T}}),y=n.reduce((S,T)=>!S||T.score>S.score?T:S,null),m=r.reduce((S,T)=>S+T.count,0),f=r[0]||null,M=c[0]||null,A=u[0]||null,b=[...new Set(n.map(S=>S.policyVersion).filter(Boolean))],w=[];if(!n.length)w.push("这一年还没有开火记录。去厨房做第一道菜，RSI 会把它们收进相册。");else{if(w.push(`${e} 年，你在 ${M?M.name:"这座城市"} 的 ${n.length} 个班次里，端出了 ${m} 道菜。`+(A?`最常遇到的是${A.name}。`:"")),f&&w.push(`最常做的是${f.name}，一共 ${f.count} 次。${f.desc}，是你这一年最熟练的味道。`),y&&w.push(`最高分的一班是 ${y.mode==="arcade"?"街机厨房":"沉浸厨房"} SHIFT ${String(y.level).padStart(2,"0")}，${y.score} 分、${y.stars} 星。`),b.length){let S=Math.min(...b),T=Math.max(...b);w.push(T>S?`RSI 厨房大脑从 v${S} 长到 v${T}，学会了在${A?A.name:"不同天气"}里先推荐什么。`:`RSI 厨房大脑还停在 v${S}，正在攒更多回放样本。`)}c.length>1&&w.push(`你走过 ${c.map(S=>S.name).join("、")}，每座城市都留下了一张菜单。`)}return{year:e,shifts:n,totalShifts:n.length,totalDishes:m,totalScore:n.reduce((S,T)=>S+(Number(T.score)||0),0),totalStars:n.reduce((S,T)=>S+(Number(T.stars)||0),0),dishes:r,topDish:f,cities:c,weathers:u,months:h,seasons:g,bestShift:y,policyVersions:b,memoir:w,generatedAt:new Date().toISOString()}}function vi(s){return String(s??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Su(s){let t=s.dishes.map(i=>`<div class="dish"><div class="emoji">${vi(i.emoji)}</div><div><b>${vi(i.name)}</b><small>${i.count} 次 · ${vi(i.desc)}</small></div></div>`).join(""),e=s.months.map(i=>`<div class="month"><b>${vi(i.label)}</b><span>${i.shifts} 班 · ${i.totalDishes} 道${i.top?` · 最常做 ${vi(i.top.name)}`:""}</span></div>`).join(""),n=s.seasons.filter(i=>i.shifts>0).map(i=>`<span class="season"><b>${vi(i.name)}</b>${i.shifts} 班 · ${i.dishes} 道</span>`).join("");return`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>${s.year} 灶台风暴年度相册</title>
<style>
body{margin:0;background:#120b08;color:#f7e8d0;font-family:"Microsoft YaHei",system-ui,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:48px 28px 80px}
.kicker{letter-spacing:.28em;color:#f6a623;font-size:12px}.title{font-size:56px;margin:8px 0;line-height:1}
.sub{color:#bfae98;margin-bottom:28px}.stats{display:flex;gap:20px;flex-wrap:wrap;margin:24px 0 32px}
.stat{background:#1e130e;border:1px solid #3a2a20;border-radius:14px;padding:14px 18px;min-width:120px}
.stat b{display:block;font-size:28px;color:#ffd27a}.stat span{font-size:11px;color:#bfae98}
h2{font-size:22px;margin:32px 0 12px;color:#ffd27a}.memoir p{line-height:1.9;color:#d9c3a6}
.dishes{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dish{display:flex;gap:12px;align-items:center;background:#1e130e;border:1px solid #3a2a20;border-radius:12px;padding:10px}
.dish .emoji{font-size:30px}.dish small{display:block;color:#bfae98;font-size:11px;margin-top:3px}
.month{display:flex;justify-content:space-between;border-bottom:1px dashed #3a2a20;padding:9px 0;font-size:13px}.month span{color:#bfae98}
.season{display:inline-block;margin:10px 6px 0 0;padding:6px 9px;border:1px solid #3a2a20;border-radius:7px;font-size:11px;color:#bfae98}.season b{color:#ffd27a;margin-right:5px}
.foot{margin-top:36px;color:#8f7d68;font-size:11px}
</style></head><body><div class="wrap">
<div class="kicker">SIZZLE! · RSI KITCHEN BRAIN</div><h1 class="title">${s.year} 年度相册</h1>
<div class="sub">一份由班次、城市、天气和推荐菜单生成的回忆录</div>
<div class="stats">
<div class="stat"><b>${s.totalShifts}</b><span>班次</span></div>
<div class="stat"><b>${s.totalDishes}</b><span>端出的菜</span></div>
<div class="stat"><b>${s.totalStars}</b><span>星星</span></div>
<div class="stat"><b>${s.totalScore}</b><span>总分</span></div>
</div>
<h2>回忆录</h2><div class="memoir">${s.memoir.map(i=>`<p>${vi(i)}</p>`).join("")}</div>
<h2>这一年做过的菜</h2><div class="dishes">${t||"<p>还没有菜。</p>"}</div>
<h2>月份</h2>${e||"<p>还没有月份记录。</p>"}
${n?`<div class="seasons">${n}</div>`:""}
<div class="foot">生成于 ${vi(new Date(s.generatedAt).toLocaleString("zh-CN"))} · RSI 本机档案</div>
</div></body></html>`}var wu="sizzle-rush:v1",jl={master:.8,music:.55,sfx:.85,sensitivity:1,fov:74,shake:1,quality:1,invertY:!1,showHints:!0,recordPlaytest:!0,touchControls:"auto",playtestProfile:{participant:"",skill:"unknown",firstTime:!0}},Kl={settings:{...jl},best:{},meta:{}};function fp(){try{if(typeof localStorage<"u"){let s=localStorage.getItem(wu);if(s)return JSON.parse(s)}}catch{}return null}function rr(s){try{if(typeof localStorage<"u"){localStorage.setItem(wu,JSON.stringify(s));return}}catch{}Kl.settings=s.settings,Kl.best=s.best,Kl.meta=s.meta}function pp(){let s=fp();return s&&typeof s=="object"?{settings:{...jl,...s.settings||{}},best:s.best||{},meta:s.meta||{}}:{settings:{...jl},best:{},meta:{}}}var Ie=pp();function Wi(){return{...Ie.settings}}function Xi(s){return Ie.settings={...Ie.settings,...s},rr(Ie),Wi()}function Eu(s,t){return`${s}:${t}`}function Tu(s,t){return Ie.best[Eu(s,t)]||{score:0,stars:0}}function Ql(){return{...Ie.best}}function Au(s,t,e,n){let i=Eu(s,t),r=Ie.best[i]||{score:0,stars:0};return e>r.score||n>r.stars?(Ie.best[i]={score:Math.max(e,r.score),stars:Math.max(n,r.stars)},rr(Ie),Ie.best[i]):r}function Ru(s){return Array.isArray(s)&&s.length===3&&s.every(t=>Number.isFinite(Number(t))&&Number(t)>=0)&&Number(s[0])<=Number(s[1])&&Number(s[1])<=Number(s[2])}function ar(s,t){let e=Ie.meta?.targets?.[s]?.[t];return Ru(e)?e.map(Number):null}function tc(s,t,e){return Ru(e)?(Ie.meta.targets||={},Ie.meta.targets[s]||={},Ie.meta.targets[s][t]=e.map(n=>Math.round(Number(n))),rr(Ie),ar(s,t)):null}function Cu(){Ie.meta.targets={},rr(Ie)}function ec(s,t){let e=ar(t,s.id);return e?{...s,target:e}:s}function Iu(){Ie.best={},rr(Ie)}var nc=["menu","modes","settings","help","data","album","pause","results"],Lu=s=>{let t=Math.max(0,Math.ceil(s));return`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`};function mp(s){if(!s)return"✋";if(s.type==="plate"){let e=kn(s.contents);return e?e.emoji:(s.contents.length,"🍽️")}return s.state==="burnt"?"♨️":Xt[s.ingredient]?.emoji??"❓"}var _a=class{constructor(t){this.app=t,this.settings=Wi(),this.screen="menu",this.hudVisible=!1,this.ticketNodes=new Map,this.lastScore=-1,this.lastTimer="",this.lastCombo=-1,this.lastCarryUid=null,this.lastPrompt=null,this.lastHudState=null,this.tutorialSteps=[],this.tutorialDone=new Set,this.modeSelection="fp",this.levelSelection=1,this.playerCount=1,ei()&&(this.modeSelection="arcade"),this.hudMode="fp",this.inputDevice="keyboard",this.capture=null,this.rsiVariant=0,this.rsiRecommendation=null,this.album=null,this.refs={hud:document.getElementById("hud"),hudMode:document.getElementById("hud-mode"),hudLevel:document.getElementById("hud-level"),hudTimer:document.getElementById("hud-timer"),hudScore:document.getElementById("hud-score"),hudCombo:document.getElementById("hud-combo"),tickets:document.getElementById("tickets"),carry:document.getElementById("hud-carry"),carryIcon:document.getElementById("carry-icon"),carryName:document.getElementById("carry-name"),prompt:document.getElementById("prompt"),promptKey:document.getElementById("prompt-key"),promptTitle:document.getElementById("prompt-title"),promptHint:document.getElementById("prompt-hint"),promptProgress:document.getElementById("prompt-progress"),promptProgressBar:document.querySelector("#prompt-progress i"),crosshair:document.getElementById("crosshair"),toasts:document.getElementById("toasts"),popups:document.getElementById("popups"),tutorial:document.getElementById("tutorial"),tutorialSteps:document.getElementById("tutorial-steps"),hudHint:document.getElementById("hud-hint"),modeDesc:document.getElementById("mode-desc"),shiftList:document.getElementById("shift-list"),playersToggle:document.getElementById("players-toggle"),totalStars:document.getElementById("total-stars"),helpRecipes:document.getElementById("help-recipes"),boot:document.getElementById("boot-overlay"),levelIntro:document.getElementById("level-intro"),liKicker:document.getElementById("li-kicker"),liTitle:document.getElementById("li-title"),liSub:document.getElementById("li-sub"),liTip:document.getElementById("li-tip"),dataSummary:document.getElementById("data-summary"),dataCount:document.getElementById("data-count"),dataTableBody:document.getElementById("data-table-body"),dataHuman:document.getElementById("data-human"),ptParticipant:document.getElementById("pt-participant"),ptSkill:document.getElementById("pt-skill"),ptFirst:document.getElementById("pt-first"),ptImport:document.getElementById("pt-import"),dataRecoBody:document.getElementById("data-reco-body"),dataStatus:document.getElementById("data-status"),resultsSurvey:document.getElementById("results-survey"),surveyDifficulty:document.getElementById("survey-difficulty"),surveyReplay:document.getElementById("survey-replay"),surveyStatus:document.getElementById("survey-status"),rsiCity:document.getElementById("rsi-city"),rsiWeather:document.getElementById("rsi-weather"),rsiPrefs:document.getElementById("rsi-prefs"),rsiRecs:document.getElementById("rsi-recs"),rsiVersion:document.getElementById("rsi-version"),rsiNote:document.getElementById("rsi-note"),albumTitle:document.getElementById("album-title"),albumSubtitle:document.getElementById("album-subtitle"),albumYear:document.getElementById("album-year"),albumStats:document.getElementById("album-stats"),albumMemoir:document.getElementById("album-memoir"),albumDishes:document.getElementById("album-dishes"),albumMonths:document.getElementById("album-months"),albumSeasons:document.getElementById("album-seasons"),albumPolicy:document.getElementById("album-policy"),bindingsFp:document.getElementById("bindings-fp"),bindingsArcade:document.getElementById("bindings-arcade"),bindStatus:document.getElementById("bind-status"),touchNote:document.getElementById("touch-note")},this._bindActions(),this._bindModeCards(),this._bindSettings(),this._bindPlaytestProfile(),this._bindRSI(),this._renderShiftList("fp"),this._renderHelp(),this._renderStarsTotal(),this.renderBindings(),this.updateBindingLabels(),this.updateHudHints("fp"),window.addEventListener("keydown",e=>this._onCaptureKey(e),!0)}renderBindings(){for(let t of["fp","arcade"]){let e=t==="fp"?this.refs.bindingsFp:this.refs.bindingsArcade;if(!e)continue;let n=pn(t);e.textContent="";let i=null;for(let r of n.rows()){if(r.group!==i){i=r.group;let c=document.createElement("div");c.className="bind-group-label",c.textContent=r.group,e.appendChild(c)}let a=document.createElement("div");a.className="bind-row";let o=document.createElement("span");o.textContent=r.label;let l=document.createElement("button");l.type="button",l.className="bind-key",l.textContent=r.keyLabel,l.addEventListener("click",()=>this._startCapture(t,r.action,l)),a.append(o,l),e.appendChild(a)}}}_startCapture(t,e,n){this.capture&&(this.capture.button?.classList.remove("capturing","conflict"),this.capture=null),this.capture={mode:t,action:e,button:n},n.classList.add("capturing"),n.textContent="按下按键…",this.refs.bindStatus&&(this.refs.bindStatus.classList.remove("error"),this.refs.bindStatus.textContent="按 Esc 取消")}_cancelCapture(){this.capture&&(this.capture=null,this.renderBindings(),this.refs.bindStatus&&(this.refs.bindStatus.classList.remove("error"),this.refs.bindStatus.textContent=""))}_onCaptureKey(t){if(!this.capture)return;if(t.preventDefault(),t.stopImmediatePropagation(),t.code==="Escape"){this._cancelCapture();return}let{mode:e,action:n,button:i}=this.capture,r=pn(e).set(n,t.code);if(!r.ok){this.refs.bindStatus&&(this.refs.bindStatus.classList.add("error"),this.refs.bindStatus.textContent=r.reason==="reserved"?"Esc 保留给暂停，换一个键":`这个键已经绑定给「${r.conflictLabel}」`),i.classList.add("conflict");return}this.capture=null,this.refs.bindStatus&&(this.refs.bindStatus.classList.remove("error"),this.refs.bindStatus.textContent="已保存"),this.renderBindings(),this.updateBindingLabels()}_resetBindings(t){this._cancelCapture(),t&&pn(t).reset(),this.renderBindings(),this.updateBindingLabels(),this.refs.bindStatus&&(this.refs.bindStatus.classList.remove("error"),this.refs.bindStatus.textContent="已恢复默认")}updateBindingLabels(){for(let t of document.querySelectorAll("[data-bind]")){let[e,n]=t.dataset.bind.split(":");!e||!n||(t.textContent=pn(e).primaryLabel(n))}this.updateHudHints(this.hudMode)}updateHudHints(t=this.hudMode){if(this.refs.hudHint){if(this.hudMode=t,this.inputDevice==="gamepad"){this.refs.hudHint.innerHTML=t==="fp"?"<span><b>左摇杆</b> 移动</span><span><b>右摇杆</b> 视角</span><span><b>A</b> 互动</span><span><b>X</b> 切菜</span><span><b>RT</b> 冲刺</span><span><b>Start</b> 暂停</span>":"<span><b>左摇杆</b> P1 移动</span><span><b>A</b> P1 互动 / 切菜</span><span><b>键盘</b> 仍然可用</span><span><b>Start</b> 暂停</span>";return}if(t==="fp"){let e=pn("fp");this.refs.hudHint.innerHTML=`<span><b>${e.primaryLabel("forward")}${e.primaryLabel("left")}${e.primaryLabel("back")}${e.primaryLabel("right")}</b> 移动</span><span><b>鼠标</b> 视角</span><span><b>${e.primaryLabel("interact")}</b> 互动 / 按住切菜</span><span><b>${e.primaryLabel("sprint")}</b> 冲刺</span><span><b>Esc</b> 暂停</span>`}else{let e=pn("arcade");this.refs.hudHint.innerHTML=`<span><b>P1 ${e.primaryLabel("p1Up")}${e.primaryLabel("p1Left")}${e.primaryLabel("p1Down")}${e.primaryLabel("p1Right")}</b> 移动</span><span><b>${e.primaryLabel("p1Interact")}</b> 互动 / 切菜</span><span><b>P2 ${e.primaryLabel("p2Up")}${e.primaryLabel("p2Left")}${e.primaryLabel("p2Down")}${e.primaryLabel("p2Right")}</b></span><span><b>${e.primaryLabel("p2Interact")}</b></span><span><b>Esc</b> 暂停</span>`}}}setInputDevice(t){this.inputDevice=t,this.updateHudHints(this.hudMode)}_bindRSI(){this.refs.rsiCity&&(this.refs.rsiCity.innerHTML=hs.map(t=>`<option value="${t.id}">${t.emoji} ${t.name}</option>`).join(""),this.refs.rsiWeather.innerHTML=us.map(t=>`<option value="${t.id}">${t.emoji} ${t.name}</option>`).join(""),this.refs.rsiCity.addEventListener("change",()=>{sr({city:this.refs.rsiCity.value}),this.rsiVariant=0,this.renderRSI()}),this.refs.rsiWeather.addEventListener("change",()=>{sr({weather:this.refs.rsiWeather.value}),this.rsiVariant=0,this.renderRSI()}),this.refs.rsiPrefs?.addEventListener("click",t=>{let e=t.target.closest("[data-pref]");if(!e)return;let n=new Set(ga().prefs);n.has(e.dataset.pref)?n.delete(e.dataset.pref):n.size<4&&n.add(e.dataset.pref),sr({prefs:[...n]}),this.rsiVariant=0,this.renderRSI()}))}renderRSI(){if(!this.refs.rsiRecs)return;let t=ga(),e=si();this.refs.rsiCity&&(this.refs.rsiCity.value=t.city),this.refs.rsiWeather&&(this.refs.rsiWeather.value=t.weather),this.refs.rsiPrefs&&(this.refs.rsiPrefs.innerHTML=ir.map(a=>`<button class="${t.prefs.includes(a.id)?"active":""}" data-pref="${a.id}" type="button">${a.emoji} ${a.name}</button>`).join(""));let n=ln.find(a=>a.id===this.levelSelection)||ln[0],i=ds(n,{variant:this.rsiVariant});this.rsiRecommendation=i,this.app.rsiRecommendation=i,this.refs.rsiVersion&&(this.refs.rsiVersion.textContent=`v${i.policyVersion}`),this.refs.rsiRecs.innerHTML=i.items.map(a=>`<article class="rsi-rec">
          <div class="rsi-rec-top"><span class="rsi-emoji">${a.emoji}</span><div><b>${a.name}</b><small>${a.tags.map(o=>nr[o]||o).join(" · ")}</small></div></div>
          <div class="rsi-reasons">${a.reasons.join(" · ")||"今日随机"}</div>
          <div class="rsi-rec-foot"><span>基础 ${a.score}</span><b>推荐 +25%</b></div>
        </article>`).join("");let r=t.prefsInfo.map(a=>a.name).join("/")||"不设限";if(this.refs.rsiNote){let a=e.policy;this.refs.rsiNote.textContent=`${t.cityInfo.name} · ${t.weatherInfo.name} · 偏好 ${r} · 已回放 ${e.history.length} 班 · replay ${a.replayScore??0}`}}getRsiRecommendation(t){return this.rsiRecommendation&&this.rsiRecommendation.tier===(t.tier||3)?this.rsiRecommendation:ds(t,{variant:this.rsiVariant})}showAlbum(t=new Date().getFullYear()){let e=Jl(t);if(this.album=e,this.refs.albumYear&&(this.refs.albumYear.textContent=String(e.year)),this.refs.albumTitle&&(this.refs.albumTitle.textContent=`${e.year} 年度相册`),this.refs.albumSubtitle&&(this.refs.albumSubtitle.textContent=e.totalShifts?`${e.totalShifts} 个班次 · ${e.totalDishes} 道菜 · ${e.cities.length} 座城市 · ${e.weathers.length} 种天气`:"还没有开火记录。先去厨房做第一道菜，RSI 会把它们收进相册。"),this.refs.albumStats&&(this.refs.albumStats.innerHTML=`
        <div class="stat"><b>${e.totalShifts}</b><span>班次</span></div>
        <div class="stat"><b>${e.totalDishes}</b><span>端出的菜</span></div>
        <div class="stat"><b>${e.totalStars}</b><span>星星</span></div>
        <div class="stat"><b>${e.totalScore}</b><span>总分</span></div>
      `),this.refs.albumMemoir&&(this.refs.albumMemoir.innerHTML=e.memoir.map(n=>`<p>${n}</p>`).join("")),this.refs.albumDishes&&(this.refs.albumDishes.innerHTML=e.dishes.length?e.dishes.map((n,i)=>`<div class="album-dish ${i===0?"top":""}"><span>${n.emoji}</span><div><b>${n.name}</b><small>${n.count} 次 · ${n.desc}</small></div></div>`).join(""):'<p class="album-empty">还没有菜。</p>'),this.refs.albumMonths&&(this.refs.albumMonths.innerHTML=e.months.length?e.months.map(n=>`<div class="album-month"><b>${n.label}</b><span>${n.shifts} 班 · ${n.totalDishes} 道${n.top?` · 最常做 ${n.top.name}`:""}</span></div>`).join(""):'<p class="album-empty">还没有月份记录。</p>'),this.refs.albumPolicy){let n=si().policy,i=n.updatedAt?`推荐权重已在本机进化（${new Date(n.updatedAt).toLocaleDateString("zh-CN")}）`:"还在等更多班次回放，推荐权重暂未更新";this.refs.albumPolicy.innerHTML=`RSI 厨房大脑 <b>v${n.version}</b> · 回放 ${e.shifts.length} 班 · ${i}`}if(this.refs.albumSeasons){let n=e.seasons.filter(i=>i.shifts>0);this.refs.albumSeasons.innerHTML=n.length?n.map(i=>`<span class="album-season"><b>${i.name}</b>${i.shifts} 班 · ${i.dishes} 道</span>`).join(""):""}this.show("album")}exportAlbum(){let t=this.album||Jl();this.app._download(`sizzle-album-${t.year}.html`,Su(t),"text/html;charset=utf-8")}show(t){if(nc.includes(t)){for(let e of nc)document.getElementById(`screen-${e}`)?.classList.toggle("active",e===t);this.screen=t,t==="modes"&&(this._renderShiftList(this.modeSelection),this._renderStarsTotal()),t==="settings"?(this._syncSettingsInputs(),this.renderBindings()):this._cancelCaptureIfAny()}}_cancelCaptureIfAny(){this.capture&&(this.capture=null,this.refs.bindStatus&&(this.refs.bindStatus.textContent=""))}showMenu(){this.hideHUD(),this.refs.levelIntro?.classList.add("hidden"),this.show("menu"),this.refs.boot.classList.add("done")}showModes(t=this.modeSelection){this.hideHUD(),this.refs.touchNote?.classList.toggle("hidden",!ei()),this.selectMode(t),this.show("modes")}hideScreens(){for(let t of nc)document.getElementById(`screen-${t}`)?.classList.remove("active");this.screen=null}showHUD(t,e){this.hudVisible=!0,this.refs.hud.classList.remove("hidden"),this.refs.hudMode.textContent=t==="fp"?"沉浸厨房":"街机厨房",this.refs.hudLevel.textContent=e.name,this.hudMode=t,this.inputDevice="keyboard",this.updateHudHints(t),this.refs.crosshair.classList.toggle("hidden",t!=="fp"),this.refs.tutorial.classList.toggle("hidden",!0),this.refs.tutorial.classList.toggle("arcade",t==="arcade"),this.ticketNodes.clear(),this.refs.tickets.textContent="",this.lastScore=-1,this.lastTimer="",this.lastCombo=-1,this.lastCarryUid=null,this.lastPrompt=null,this.refs.hudScore.textContent="0",this.refs.hudTimer.textContent=Lu(e.duration),this.refs.hudCombo.classList.add("hidden"),this.refs.carryIcon.textContent="✋",this.refs.carryName.textContent="空手",this.refs.prompt.classList.add("hidden"),this.refs.promptProgress.classList.add("hidden"),this.refs.toasts.textContent="",this.refs.popups.textContent="",this.refs.levelIntro.classList.add("hidden"),this._warned15=!1,this._interactable=null,this._danger=null,this._chopOn=null,this.refs.crosshair.classList.remove("interactable","danger","chop"),this._setFpsInputState(t)}hideHUD(){this.hudVisible=!1,this.refs.hud.classList.add("hidden")}_setFpsInputState(t){this.refs.hudHint.dataset.mode=t}_bindModeCards(){for(let t of document.querySelectorAll(".mode-card"))t.addEventListener("click",()=>this.selectMode(t.dataset.mode)),t.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this.selectMode(t.dataset.mode))});this.refs.playersToggle?.addEventListener("click",t=>{let e=t.target.closest("button[data-players]");if(e){this.playerCount=Number(e.dataset.players);for(let n of this.refs.playersToggle.querySelectorAll("button"))n.classList.toggle("active",n===e);this.app.onPlayerCountChange?.(this.playerCount)}})}selectMode(t){if(["fp","arcade"].includes(t)){this.modeSelection=t;for(let e of document.querySelectorAll(".mode-card"))e.classList.toggle("selected",e.dataset.mode===t);this.refs.modeDesc.textContent=t==="fp"?"第一人称 · 走进厨房亲手做菜":"街机 · 俯视视角，可本地双人",this.refs.playersToggle?.classList.toggle("hidden",t!=="arcade"),this._renderShiftList(t),this.renderRSI()}}_renderShiftList(t){if(!this.refs.shiftList)return;let e=Ql();this.refs.shiftList.textContent="";for(let n of ln){let i=e[`${t}:${n.id}`]||{stars:0,score:0},r=document.createElement("button");r.className="shift-btn",r.dataset.level=String(n.id),r.classList.toggle("active",n.id===this.levelSelection);let a=[1,2,3].map(o=>o<=i.stars?"<b>★</b>":"☆").join("");r.innerHTML=`
        <span class="shift-num">SHIFT ${String(n.id).padStart(2,"0")}</span>
        <span class="shift-name">${n.name}</span>
        <span class="shift-stars">${a}${i.score?` · ${i.score}`:""}</span>
      `,r.addEventListener("click",()=>{this.levelSelection=n.id;for(let o of this.refs.shiftList.querySelectorAll(".shift-btn"))o.classList.toggle("active",o===r);this.renderRSI(),this.app.onLevelChange?.(n.id)}),this.refs.shiftList.appendChild(r)}}_renderStarsTotal(){if(!this.refs.totalStars)return;let t=Ql(),e=0;for(let n of ln)for(let i of["fp","arcade"])e+=t[`${i}:${n.id}`]?.stars||0;this.refs.totalStars.textContent=`★ ${e} / ${ln.length*3*2}`}_renderHelp(){if(this.refs.helpRecipes){this.refs.helpRecipes.textContent="";for(let t of Object.values(Re)){let e=document.createElement("div");e.className="recipe";let n=Ul(t).map(i=>`<span class="recipe-part">${i.label}${i.n>1?` ×${i.n}`:""}</span>`).join("");e.innerHTML=`
        <div class="recipe-top"><span>${t.emoji}</span>${t.name}</div>
        <div class="recipe-parts">${n}</div>
        <div class="recipe-score">基础分 ${t.score}</div>
      `,this.refs.helpRecipes.appendChild(e)}}}_bindSettings(){let t={"set-master":["master",a=>`${Math.round(a*100)}%`],"set-music":["music",a=>`${Math.round(a*100)}%`],"set-sfx":["sfx",a=>`${Math.round(a*100)}%`],"set-sensitivity":["sensitivity",a=>`${Number(a).toFixed(2)}×`],"set-fov":["fov",a=>`${Math.round(a)}°`],"set-quality":["quality",a=>`${Math.round(a*100)}%`],"set-shake":["shake",a=>`${Math.round(a*100)}%`]};for(let[a,[o,l]]of Object.entries(t)){let c=document.getElementById(a);c&&c.addEventListener("input",()=>{let u=Number(c.value),d=document.querySelector(`[data-val="${o}"]`);d&&(d.textContent=l(u)),this.settings=Xi({[o]:u}),this.app.onSettingsChange?.(this.settings)})}let e=document.getElementById("set-invert");e?.addEventListener("change",()=>{this.settings=Xi({invertY:e.checked}),this.app.onSettingsChange?.(this.settings)});let n=document.getElementById("set-hints");n?.addEventListener("change",()=>{this.settings=Xi({showHints:n.checked}),this.app.onSettingsChange?.(this.settings)});let i=document.getElementById("set-record");i?.addEventListener("change",()=>{this.settings=Xi({recordPlaytest:i.checked}),this.app.onSettingsChange?.(this.settings)});let r=document.getElementById("set-touch");r?.addEventListener("change",()=>{this.settings=Xi({touchControls:r.value}),this.app.onSettingsChange?.(this.settings)})}_bindPlaytestProfile(){let t=()=>{let e={participant:this.refs.ptParticipant?.value.trim().slice(0,24)||"",skill:this.refs.ptSkill?.value||"unknown",firstTime:this.refs.ptFirst?this.refs.ptFirst.checked:!0};this.settings=Xi({playtestProfile:e}),this.app.onSettingsChange?.(this.settings)};this.refs.ptParticipant?.addEventListener("input",t),this.refs.ptSkill?.addEventListener("change",t),this.refs.ptFirst?.addEventListener("change",t),this.refs.ptImport?.addEventListener("change",async()=>{let e=this.refs.ptImport.files?.[0];if(e)try{let n=await e.text(),i=uu(n);if(!i.length){this._setDataStatus("CSV 没有可导入的数据行",!0);return}let r=nu(i);this.showPlaytestData(),this.computeRecommendations(),this._setDataStatus(`导入完成：新增 ${r.added} 条，跳过 ${r.skipped} 条（重复 id 或空行）`)}catch{this._setDataStatus("CSV 读取失败；请确认是导出的 playtest CSV",!0)}finally{this.refs.ptImport.value=""}})}_setDataStatus(t,e=!1){this.refs.dataStatus&&(this.refs.dataStatus.textContent=t||"",this.refs.dataStatus.classList.toggle("error",!!e))}computeRecommendations(){let t=du(er(),{minSamples:3,players:1});this._lastReco=t,this.renderRecommendations(t),this._setDataStatus(t.humanRows?"已按真人样本计算；应用只覆盖本机":"没有真人样本，无法计算阈值",!t.humanRows)}renderRecommendations(t){let e=this.refs.dataRecoBody;if(!e)return;if(!t.humanRows){e.innerHTML='<span class="reco-missing">没有真人样本。先让试玩者填参与者/经验，或导入别的机器导出的 CSV。</span>';return}let n=o=>o==="fp"?"沉浸厨房":"街机厨房",i=t.recommendations.filter(o=>o.ready),r=t.recommendations.map(o=>{let l=ar(o.mode,o.level)||o.currentTarget,c=ar(o.mode,o.level)?'<span class="target-badge">本机</span>':"",u=`${o.samples.novice}/${o.samples.average}/${o.samples.expert}`,d=o.ready?'<span class="reco-ready">可重标</span>':`<span class="reco-missing">缺 ${o.missing.join("、")}</span>`,h=o.ready?`<button class="btn primary tiny" data-action="apply-target" data-mode="${o.mode}" data-level="${o.level}" data-target="${o.target.join(",")}">应用</button>`:"";return`<tr>
          <td>${n(o.mode)}</td>
          <td>SHIFT ${o.level}</td>
          <td class="num">${u}</td>
          <td class="num">${l.join(" / ")}${c}</td>
          <td class="num">${o.target?o.target.join(" / "):"—"}</td>
          <td>${d}</td>
          <td>${h}</td>
        </tr>`}).join(""),a=t.warnings.length?`<div class="data-status">${t.warnings.slice(0,2).join(" ")}</div>`:"";e.innerHTML=`
      <table class="reco-table">
        <thead><tr><th>模式</th><th>班次</th><th>样本（新/普/熟）</th><th>当前</th><th>建议</th><th>状态</th><th></th></tr></thead>
        <tbody>${r}</tbody>
      </table>
      ${i.length?`<div style="margin-top:10px"><button class="btn ghost tiny" data-action="apply-ready-targets">应用全部可重标（${i.length}）</button></div>`:""}
      ${a}`}_applyTarget(t,e,n){let i=String(n||"").split(",").map(Number),r=tc(t,e,i);if(!r){this._setDataStatus("阈值格式不对，未应用",!0);return}this._setDataStatus(`已应用 ${t==="fp"?"沉浸厨房":"街机厨房"} SHIFT ${e}：${r.join(" / ")}（下一班生效）`),this._lastReco&&this.renderRecommendations(this._lastReco)}_applyReadyTargets(){if(!this._lastReco)return;let t=0;for(let e of this._lastReco.recommendations)!e.ready||!e.target||tc(e.mode,e.level,e.target)&&t++;this._setDataStatus(`已应用 ${t} 组建议阈值（本机，下一班生效）`),this.renderRecommendations(this._lastReco)}_syncPlaytestProfile(){let t=this.settings.playtestProfile||Wi().playtestProfile||{};this.refs.ptParticipant&&(this.refs.ptParticipant.value=t.participant||""),this.refs.ptSkill&&(this.refs.ptSkill.value=t.skill||"unknown"),this.refs.ptFirst&&(this.refs.ptFirst.checked=t.firstTime!==!1)}_syncSettingsInputs(){let t=Wi();this.settings=t;let e={"set-master":[t.master,`${Math.round(t.master*100)}%`],"set-music":[t.music,`${Math.round(t.music*100)}%`],"set-sfx":[t.sfx,`${Math.round(t.sfx*100)}%`],"set-sensitivity":[t.sensitivity,`${t.sensitivity.toFixed(2)}×`],"set-fov":[t.fov,`${Math.round(t.fov)}°`],"set-quality":[t.quality,`${Math.round(t.quality*100)}%`],"set-shake":[t.shake,`${Math.round(t.shake*100)}%`]},n={"set-master":"master","set-music":"music","set-sfx":"sfx","set-sensitivity":"sensitivity","set-fov":"fov","set-quality":"quality","set-shake":"shake"};for(let[l,[c,u]]of Object.entries(e)){let d=document.getElementById(l);d&&(d.value=String(c));let h=document.querySelector(`[data-val="${n[l]}"]`);h&&(h.textContent=u)}let i=document.getElementById("set-invert");i&&(i.checked=!!t.invertY);let r=document.getElementById("set-hints");r&&(r.checked=t.showHints!==!1);let a=document.getElementById("set-record");a&&(a.checked=t.recordPlaytest!==!1);let o=document.getElementById("set-touch");o&&(o.value=t.touchControls||"auto")}showPlaytestData(){this._syncPlaytestProfile();let t=Gl(),e=Gl({source:"human"});t.total||(this._lastReco=null,this.refs.dataRecoBody&&(this.refs.dataRecoBody.textContent="先采集或导入真人样本，再点“计算建议”。"),this._setDataStatus(""));let n=i=>i==="fp"?"沉浸厨房":"街机厨房";this.refs.dataCount&&(this.refs.dataCount.textContent=`${t.total} 场`),this.refs.dataHuman&&(e.total?(this.refs.dataHuman.classList.remove("empty"),this.refs.dataHuman.innerHTML=`真人样本 <b>${e.total}</b> 场 · 平均出餐 <b>${e.avgServed}</b> 单 · 超时率 <b>${e.timeoutRate}%</b> · 平均分 <b>${e.avgScore}</b>${e.avgFirstServe!=null?` · 首单 <b>${e.avgFirstServe}s</b>`:""}（按上方参与者/经验标记记录）`):(this.refs.dataHuman.classList.add("empty"),this.refs.dataHuman.textContent="真人样本 0 场：下面表格只是自动化参考。先填参与者编号和经验，再开始班次。")),this.refs.dataSummary&&(this.refs.dataSummary.innerHTML=`
        <div class="data-kpi"><b>${t.total}</b><span>总场次</span></div>
        <div class="data-kpi"><b>${t.human}</b><span>真人样本</span></div>
        <div class="data-kpi"><b>${t.avgServed}</b><span>平均出餐</span></div>
        <div class="data-kpi"><b>${t.timeoutRate}%</b><span>平均超时率</span></div>
      `),this.refs.dataTableBody&&(t.rows.length?this.refs.dataTableBody.innerHTML=t.rows.map(i=>`
          <tr>
            <td>${n(i.mode)}</td>
            <td>SHIFT ${String(i.level).padStart(2,"0")}</td>
            <td class="num">${i.count}（${i.humanCount} / ${i.count-i.humanCount}）</td>
            <td class="num">${i.avgServed}</td>
            <td class="num">${i.timeoutRate}%</td>
            <td class="num">${i.avgScore}</td>
            <td class="num">${i.avgStars.toFixed(1)}</td>
          </tr>`).join(""):this.refs.dataTableBody.innerHTML='<tr><td colspan="7" class="data-empty">还没有记录。打完一个班次后会自动出现在这里。</td></tr>'),this._lastReco&&this.renderRecommendations(this._lastReco),this.show("data")}_bindActions(){document.addEventListener("click",t=>{let e=t.target.closest("[data-action]");if(!e)return;let n=e.dataset.action;if(n==="play"){this.app.playClick?.(),this.showModes(this.modeSelection);return}if(n==="start"){this.app.startShift?.(this.modeSelection,this.levelSelection,this.playerCount);return}if(n==="back"){this.app.playClick?.(),this.screen==="settings"&&this.app.settingsReturn?this.app.settingsReturn():this.screen==="data"&&this.app.dataReturn?this.app.dataReturn():this.screen==="album"&&this.app.albumReturn?this.app.albumReturn():this.show("menu");return}if(n==="reset-bindings"){this._resetBindings(e.dataset.mode);return}if(n==="recommend-targets"){this.computeRecommendations();return}if(n==="apply-target"){this._applyTarget(e.dataset.mode,Number(e.dataset.level),e.dataset.target);return}if(n==="apply-ready-targets"){this._applyReadyTargets();return}if(n==="reset-targets"){Cu(),this._setDataStatus("已恢复官方阈值（本机覆盖已清除）"),this._lastReco&&this.renderRecommendations(this._lastReco);return}if(n==="survey-difficulty"||n==="survey-replay"){this._recordSurvey(n,e.dataset.value);return}if(n==="rsi-auto"){xu(),this.rsiVariant=0,this.renderRSI(),this.app.ui?.toast?.("已按本机时区与当前季节更新城市/天气");return}if(n==="rsi-shuffle"){this.rsiVariant=(this.rsiVariant+1)%11,this.renderRSI();return}this.app.onAction?.(n)})}onAction(t,e){this.actions=this.actions||new Map,this.actions.set(t,e)}updateGame(t,e){if(!this.hudVisible||!t||t.state==="over")return;t.score!==this.lastScore&&(this.lastScore=t.score,this.refs.hudScore.textContent=String(t.score));let n=Lu(t.timeLeft);n!==this.lastTimer&&(this.lastTimer=n,this.refs.hudTimer.textContent=n,this.refs.hudTimer.classList.toggle("warn",t.timeLeft<=45&&t.timeLeft>15),this.refs.hudTimer.classList.toggle("danger",t.timeLeft<=15)),!this._warned15&&t.timeLeft<=15&&t.timeLeft>0&&(this._warned15=!0,this.toast("最后 15 秒！把手上的单子出掉","bad"),this.app.audio?.play("countdown"));let i=t.combo>=1;this.refs.hudCombo.classList.toggle("hidden",!i),i&&t.combo!==this.lastCombo&&(this.lastCombo=t.combo,this.refs.hudCombo.textContent=`×${t.comboMultiplier.toFixed(2).replace(/0$/,"")}`,this.refs.hudCombo.style.animation="none",this.refs.hudCombo.offsetWidth,this.refs.hudCombo.style.animation=""),i||(this.lastCombo=-1),this._updateTickets(t);let r=e?.hands?.carry??null,a=r?.uid??null;a!==this.lastCarryUid&&(this.lastCarryUid=a,this.refs.carryIcon.textContent=mp(r),this.refs.carryName.textContent=r?`${Xe(r)}${Bl(r)?` · ${Bl(r)}`:""}`:"空手",this.refs.carry.classList.remove("flash"),this.refs.carry.offsetWidth,this.refs.carry.classList.add("flash"));let o=e?.getPrompt?.()??null;this.setPrompt(o);let l=e?.getCrosshairState?.()??{visible:!1};this.setCrosshair(l)}_updateTickets(t){let e=t.orders.sorted,n=e.map(i=>i.id).join(",");this._ticketIds!==n&&(this._ticketIds=n,this.refs.tickets.textContent="",this.ticketNodes.clear(),e.forEach((i,r)=>{let a=Re[i.recipeId],o=t.recommended?.has(i.recipeId),l=document.createElement("div");l.className=`ticket${o?" rsi-ticket":""}`,l.style.setProperty("--rot",`${(r-1)*1.4}deg`);let c=Ul(a).map(h=>`${h.label}${h.n>1?`×${h.n}`:""}`);l.innerHTML=`
          <div class="ticket-top"><span class="ticket-emoji">${a.emoji}</span><span class="ticket-name">${a.name}</span></div>
          <div class="ticket-parts">${c.join(" · ")}</div>
          ${o?'<div class="ticket-rsi">RSI 推荐 · 出餐 +25%</div>':""}
          <div class="ticket-time">${Math.ceil(i.time)}s</div>
          <div class="ticket-bar"><i></i></div>
        `;let u=l.querySelector(".ticket-bar i"),d=l.querySelector(".ticket-time");this.refs.tickets.appendChild(l),this.ticketNodes.set(i.id,{el:l,bar:u,timeEl:d,recipe:a})}));for(let i of e){let r=this.ticketNodes.get(i.id);if(!r)continue;let a=Math.max(0,Math.min(1,i.time/i.maxTime));r.bar.style.width=`${a*100}%`,r.bar.className=a<.25?"danger":a<.5?"warn":"";let l=`${Math.max(0,Math.ceil(i.time))}s`;r.timeEl.textContent!==l&&(r.timeEl.textContent=l)}}setPrompt(t){let e=t?JSON.stringify({t:t.title,h:t.hint,b:t.blocked,d:t.danger,g:t.good,k:t.key}):"";if(this.lastPrompt===e){t?.progress!=null?(this.refs.promptProgress.classList.remove("hidden"),this.refs.promptProgressBar.style.width=`${Math.max(0,Math.min(1,t.progress))*100}%`):t&&this.refs.promptProgress.classList.add("hidden");return}if(this.lastPrompt=e,!t){this.refs.prompt.classList.add("hidden");return}this.refs.prompt.classList.remove("hidden"),this.refs.prompt.classList.toggle("blocked",!!t.blocked),this.refs.prompt.classList.toggle("danger",!!t.danger),this.refs.prompt.classList.toggle("good",!!t.good),this.refs.promptTitle.textContent=t.title||"";let n=document.body.classList.contains("touch-mode"),i=n?"互动":this.inputDevice==="gamepad"?"A":t.key||(this.app.modeName==="arcade"?"空格":"E"),r=t.hint||"";n?r=r.split(t.key||"E").join("互动键"):this.inputDevice==="gamepad"&&(r=r.split(t.key||"E").join("A")),this.refs.promptHint.textContent=r,this.refs.promptKey.textContent=i,t.progress!=null?(this.refs.promptProgress.classList.remove("hidden"),this.refs.promptProgressBar.style.width=`${Math.max(0,Math.min(1,t.progress))*100}%`):this.refs.promptProgress.classList.add("hidden")}setCrosshair(t){if(!this.hudVisible)return;let e=this.refs.crosshair;if(!t||!t.visible){e.classList.add("hidden");return}e.classList.remove("hidden"),this._chopOn!==t.chop&&(this._chopOn=t.chop,e.classList.toggle("chop",!!t.chop)),this._interactable!==t.interactable&&(this._interactable=t.interactable,e.classList.toggle("interactable",!!t.interactable)),this._danger!==t.danger&&(this._danger=t.danger,e.classList.toggle("danger",!!t.danger))}toast(t,e=""){if(!this.hudVisible)return;let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,this.refs.toasts.appendChild(n);this.refs.toasts.children.length>4;)this.refs.toasts.firstElementChild.remove();setTimeout(()=>n.remove(),2400)}scorePop(t,e=""){if(!this.hudVisible)return;let n=document.createElement("div");n.className=`score-pop${e?" soft":""}`,n.textContent=e||`+${Math.round(t)}`,n.style.left=`${50+(Math.random()*16-8)}%`,n.style.top=`${46+(Math.random()*10-5)}%`,this.refs.popups.appendChild(n),setTimeout(()=>n.remove(),1100)}showLevelIntro(t,e){let n=this.refs.levelIntro;n&&(this.refs.liKicker.textContent=`SHIFT ${String(t.id).padStart(2,"0")} · ${e==="fp"?"FIRST PERSON":"ARCADE"}`,this.refs.liTitle.textContent=t.name,this.refs.liSub.textContent=t.subtitle,this.refs.liTip.textContent=t.tip,n.classList.remove("hidden","out"),n.offsetWidth,clearTimeout(this._introTimer),clearTimeout(this._introTimer2),this._introTimer=setTimeout(()=>{n.classList.add("out"),this._introTimer2=setTimeout(()=>{n.classList.add("hidden"),n.classList.remove("out")},480)},4200))}setupTutorial(t,e){this.tutorialDone.clear(),clearTimeout(this._tutorialTimer);let i=t==="arcade"&&ei()&&(this.settings.touchControls||"auto")!=="off"?"右下角互动键":t==="fp"?pn("fp").primaryLabel("interact"):pn("arcade").primaryLabel("p1Interact"),r=t==="fp"?[["pickup",`走到食材箱，按 ${i} 拿食材`],["chop","食材放砧板，按住左键切碎"],["cook","生肉饼上煎炉，熟了再拿"],["topping","盘子放上出餐台，摆配料"],["serve",`端起盘子到上菜窗口按 ${i}`]]:[["pickup",`走到食材箱，按 ${i} 拿食材`],["chop",`食材放砧板，按住 ${i} 切碎`],["cook","生肉饼上煎炉，熟了再拿"],["topping","盘子放上出餐台，摆配料"],["serve",`端起盘子到上菜窗口按 ${i}`]];this.tutorialSteps=r,this.refs.tutorialSteps.textContent="";for(let[a,o]of r){let l=document.createElement("li");l.dataset.step=a,l.textContent=o,this.refs.tutorialSteps.appendChild(l)}this.refs.tutorial.classList.toggle("hidden",!e),this._updateTutorialHead()}tutorialEvent(t){if(!this.refs.tutorial||this.refs.tutorial.classList.contains("hidden"))return;let e={pickup:"pickup","chop:done":"chop","cook:done":"cook",topping:"topping",serve:"serve"};if(t==="serve"){for(let[r]of this.tutorialSteps)this.tutorialDone.add(r),this.refs.tutorialSteps.querySelector(`li[data-step="${r}"]`)?.classList.add("done");this._updateTutorialHead(),clearTimeout(this._tutorialTimer),this._tutorialTimer=setTimeout(()=>this.refs.tutorial.classList.add("hidden"),900);return}let n=e[t];if(!n||this.tutorialDone.has(n))return;this.tutorialDone.add(n),this.refs.tutorialSteps.querySelector(`li[data-step="${n}"]`)?.classList.add("done"),this._updateTutorialHead(),this.tutorialDone.size===this.tutorialSteps.length&&(clearTimeout(this._tutorialTimer),this._tutorialTimer=setTimeout(()=>this.refs.tutorial.classList.add("hidden"),1200))}_updateTutorialHead(){let t=this.tutorialSteps.length?Math.round(this.tutorialDone.size/this.tutorialSteps.length*100):0,e=this.refs.tutorial.querySelector(".tutorial-head span");e&&(e.textContent=`${t}%`)}showPause(t){let e=t?`<div class="stat"><b>${t.score}</b><span>当前分数</span></div>
         <div class="stat"><b>${t.stats.served}</b><span>完成订单</span></div>
         <div class="stat"><b>${t.maxCombo}</b><span>最高连击</span></div>`:"",n=document.getElementById("pause-stats");n&&(n.innerHTML=e),this.refs.levelIntro?.classList.add("hidden"),this.show("pause"),this.setCrosshair({visible:!1}),this.refs.prompt?.classList.add("hidden")}showResults({session:t,mode:e,level:n,best:i,isBest:r,recorded:a,rsiResult:o}){let l=document.getElementById("results-stars"),c=document.getElementById("results-kicker"),u=document.getElementById("results-title"),d=t.stars>0;c.textContent=r?"NEW BEST · 新纪录":d?"SHIFT COMPLETE":"SHIFT OVER",u.textContent=d?t.stars===3?"完美出餐！":"顺利收工！":"客人等急了…",l.innerHTML="<i>★</i><i>★</i><i>★</i>",[...l.children].forEach((g,y)=>{y<t.stars&&(g.classList.add("on"),setTimeout(()=>g.classList.add("pop"),260+y*160))}),document.getElementById("results-score").textContent=String(t.score);let h=document.getElementById("results-best");h.innerHTML=r?`<b>新纪录！</b>之前最佳 ${i.score} 分`:`最佳纪录 <b>${i.score}</b> 分 · 目标 ${n.target[0]} / ${n.target[1]} / ${n.target[2]}`;let p=document.getElementById("results-record");if(p&&(p.textContent=a?`已记录试玩数据 · ${a.mode==="fp"?"沉浸厨房":"街机厨房"} · ${a.score} 分（设置 → 试玩数据可导出）`:"本局未记录试玩数据",o)){let g=o.policy?.version||1,y=t.stats.rsiBonus||0;p.textContent+=y>0?` · RSI +${y} 分 · 大脑 v${g}`:` · RSI 大脑 v${g}`,o.improvement?.changed&&(p.textContent+=` · 回放升级 v${o.improvement.fromVersion}→v${o.improvement.toVersion}`)}if(this._surveyRecord=a?.source==="human"?a:null,this.refs.resultsSurvey){this.refs.resultsSurvey.classList.toggle("hidden",!this._surveyRecord);for(let g of this.refs.surveyDifficulty?.querySelectorAll("button")||[])g.classList.toggle("active",Number(g.dataset.value)===Number(a?.difficulty||0));for(let g of this.refs.surveyReplay?.querySelectorAll("button")||[])g.classList.toggle("active",g.dataset.value===(a?.wantReplay||""));this.refs.surveyStatus&&(this.refs.surveyStatus.textContent=this._surveyRecord?a?.difficulty?"已记录，谢谢":"可选：帮助校准难度":"")}document.getElementById("results-grid").innerHTML=`
      <div class="stat"><b>${t.stats.served}</b><span>完成订单</span></div>
      <div class="stat"><b>×${t.maxCombo}</b><span>最高连击</span></div>
      <div class="stat"><b>${t.stats.expired}</b><span>超时订单</span></div>
      <div class="stat"><b>${t.stats.burnt}</b><span>烧焦肉饼</span></div>
    `,document.querySelector('#screen-results [data-action="next"]').textContent=n.id<ln.length?"下一班次":"返回主菜单",document.querySelector('#screen-results [data-action="next"]').dataset.last=n.id<ln.length?"no":"yes",this.show("results"),this.setCrosshair({visible:!1}),this.refs.prompt?.classList.add("hidden"),this.refs.tutorial?.classList.add("hidden"),this.refs.levelIntro?.classList.add("hidden")}_recordSurvey(t,e){if(!this._surveyRecord)return;let n=t==="survey-difficulty"?{difficulty:Number(e)}:{wantReplay:e},i=iu(this._surveyRecord.id,n);if(!i)return;this._surveyRecord=i;let r=t==="survey-difficulty"?this.refs.surveyDifficulty:this.refs.surveyReplay;for(let a of r?.querySelectorAll("button")||[])a.classList.toggle("active",a.dataset.value===String(e));this.refs.surveyStatus&&(this.refs.surveyStatus.textContent="已记录，谢谢")}bootDone(){this.refs.boot.classList.add("done")}setMuteIcon(t){let e=document.getElementById("mute-btn");e&&(e.textContent=t?"✕":"♪")}getSelection(){return{mode:this.modeSelection,level:this.levelSelection,players:this.playerCount}}};var Du=(s,t,e)=>Math.max(t,Math.min(e,s)),xa=class{constructor(t){this.settings=t,this.ctx=null,this.master=null,this.musicBus=null,this.sfxBus=null,this.noise=null,this.muted=!1,this.started=!1,this.intensity=.15,this._musicTimer=null,this._step=0,this._nextStepTime=0,this._sizzle=null,this._bpm=104,this._stepDur=60/this._bpm/4}get available(){return typeof window<"u"&&!!(window.AudioContext||window.webkitAudioContext)}_ensure(){if(this.ctx)return!0;if(!this.available)return!1;try{let t=window.AudioContext||window.webkitAudioContext,e=new t;this.ctx=e;let n=e.createDynamicsCompressor();n.threshold.value=-14,n.knee.value=20,n.ratio.value=5,n.attack.value=.004,n.release.value=.22,n.connect(e.destination),this.master=e.createGain(),this.master.connect(n),this.musicBus=e.createGain(),this.musicBus.connect(this.master),this.sfxBus=e.createGain(),this.sfxBus.connect(this.master);let i=Math.floor(e.sampleRate*1.2),r=e.createBuffer(1,i,e.sampleRate),a=r.getChannelData(0);for(let o=0;o<i;o++)a[o]=Math.random()*2-1;return this.noise=r,this._applyVolumes(),!0}catch{return this.ctx=null,!1}}unlock(){return this._ensure()?(this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.started||(this.started=!0,this._startSizzle()),!0):!1}setSettings(t){this.settings=t,this._applyVolumes()}setMuted(t){this.muted=t,this._applyVolumes()}_applyVolumes(){if(!this.ctx)return;let t=this.settings,e=this.ctx.currentTime,n=this.muted?0:t.master*t.master;this.master.gain.setTargetAtTime(n,e,.02),this.musicBus.gain.setTargetAtTime(t.music*t.music*.5,e,.03),this.sfxBus.gain.setTargetAtTime(t.sfx*t.sfx,e,.03)}_startSizzle(){if(!this.ctx||this._sizzle)return;let t=this.ctx,e=t.createBufferSource();e.buffer=this.noise,e.loop=!0;let n=t.createBiquadFilter();n.type="bandpass",n.frequency.value=2300,n.Q.value=.8;let i=t.createGain();i.gain.value=0,e.connect(n).connect(i).connect(this.sfxBus),e.start(),this._sizzle=i}setSizzle(t){if(!this._sizzle||!this.ctx)return;let e=Du(t,0,1)*.11;this._sizzle.gain.setTargetAtTime(e,this.ctx.currentTime,.08)}_tone(t){if(!this.ctx)return;let e=this.ctx,n=e.currentTime+(t.delay||0),i=e.createOscillator();i.type=t.type||"sine",i.frequency.setValueAtTime(t.freq,n),t.freqEnd&&i.frequency.exponentialRampToValueAtTime(Math.max(20,t.freqEnd),n+t.dur);let r=e.createGain(),a=t.gain??.12;r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(a,n+(t.attack??.006)),r.gain.exponentialRampToValueAtTime(1e-4,n+t.dur),i.connect(r),r.connect(t.bus==="music"?this.musicBus:t.bus==="ui"?this.master:this.sfxBus),i.start(n),i.stop(n+t.dur+.05)}_noiseHit(t){if(!this.ctx)return;let e=this.ctx,n=e.currentTime+(t.delay||0),i=e.createBufferSource();i.buffer=this.noise,i.loop=!0;let r=e.createBiquadFilter();r.type=t.filter||"bandpass",r.frequency.setValueAtTime(t.freq||1200,n),t.freqEnd&&r.frequency.exponentialRampToValueAtTime(Math.max(40,t.freqEnd),n+t.dur),r.Q.value=t.q??1;let a=e.createGain();a.gain.setValueAtTime(1e-4,n),a.gain.exponentialRampToValueAtTime(t.gain??.12,n+(t.attack??.004)),a.gain.exponentialRampToValueAtTime(1e-4,n+t.dur),i.connect(r).connect(a).connect(t.bus==="music"?this.musicBus:this.sfxBus),i.start(n),i.stop(n+t.dur+.03)}play(t,e={}){if(!this.ctx)return;let n=e.volume??1;switch(t){case"ui":this._tone({type:"triangle",freq:740,freqEnd:920,dur:.06,gain:.05*n});break;case"pickup":this._tone({type:"sine",freq:480,freqEnd:760,dur:.09,gain:.09*n}),this._tone({type:"triangle",freq:960,dur:.05,gain:.03*n,delay:.03});break;case"place":this._tone({type:"sine",freq:190,freqEnd:85,dur:.13,gain:.16*n}),this._noiseHit({filter:"lowpass",freq:700,dur:.08,gain:.05*n});break;case"chop":this._noiseHit({filter:"bandpass",freq:1600+Math.random()*700,q:1.6,dur:.07,gain:.11*n}),this._tone({type:"square",freq:220,freqEnd:160,dur:.05,gain:.035*n});break;case"chopDone":this._tone({type:"triangle",freq:660,dur:.1,gain:.09*n}),this._tone({type:"triangle",freq:990,dur:.12,gain:.07*n,delay:.09});break;case"cookDone":this._tone({type:"sine",freq:880,dur:.2,gain:.1*n}),this._tone({type:"sine",freq:1320,dur:.28,gain:.07*n,delay:.06});break;case"burn":this._noiseHit({filter:"lowpass",freq:900,freqEnd:240,dur:.55,gain:.16*n}),this._tone({type:"sawtooth",freq:120,freqEnd:60,dur:.45,gain:.06*n});break;case"serve":[0,.11,.22].forEach((i,r)=>{let a=[660,880,1320];this._tone({type:"sine",freq:a[r],dur:.42,gain:(.12-r*.015)*n,delay:i}),this._tone({type:"triangle",freq:a[r]*2,dur:.2,gain:.025*n,delay:i})});break;case"orderNew":this._tone({type:"square",freq:1100,dur:.035,gain:.035*n}),this._tone({type:"square",freq:1500,dur:.04,gain:.03*n,delay:.05});break;case"expire":this._tone({type:"sawtooth",freq:260,freqEnd:130,dur:.3,gain:.08*n}),this._tone({type:"square",freq:130,dur:.25,gain:.04*n,delay:.18});break;case"waste":this._noiseHit({filter:"lowpass",freq:500,dur:.2,gain:.1*n}),this._tone({type:"sine",freq:180,freqEnd:120,dur:.2,gain:.05*n});break;case"trash":this._noiseHit({filter:"lowpass",freq:900,freqEnd:300,dur:.18,gain:.11*n});break;case"step":this._noiseHit({filter:"lowpass",freq:260,dur:.055,gain:.035*n});break;case"combo":[523.25,659.25,783.99].forEach((i,r)=>this._tone({type:"triangle",freq:i,dur:.16,gain:.06*n,delay:r*.06}));break;case"countdown":this._tone({type:"square",freq:440,dur:.08,gain:.05*n});break;case"result":[523.25,659.25,783.99,1046.5].forEach((i,r)=>this._tone({type:"triangle",freq:i,dur:.5,gain:.08*n,delay:r*.13}));break;default:break}}startMusic(){!this.ctx||this._musicTimer||(this._nextStepTime=this.ctx.currentTime+.08,this._musicTimer=setInterval(()=>this._scheduler(),25))}stopMusic(){this._musicTimer&&clearInterval(this._musicTimer),this._musicTimer=null}setIntensity(t){this.intensity=Du(t,0,1)}_scheduler(){if(!this.ctx)return;let t=this.ctx.currentTime+.18;for(;this._nextStepTime<t;)this._scheduleStep(this._step,this._nextStepTime),this._nextStepTime+=this._stepDur,this._step++}_scheduleStep(t,e){let n=this.ctx,i=Math.floor(t/16)%4,r=t%16,a=[65.41,55,43.65,49],o=[[261.63,329.63,392,493.88],[220,261.63,329.63,392],[174.61,220,261.63,329.63],[196,246.94,293.66,349.23]],l=this.intensity,c=u=>e+u;if((r===0||r===8||l>.65&&r===11)&&this._musicTone("sine",130,45,.16,.22,c(0)),(r===4||r===12)&&this._musicNoise(1800,.09,.05+l*.03,c(0)),(r%2===0||l>.7)&&this._musicNoise(7200,.028,(r%4===0?.022:.012)*(.6+l*.7),c(0)),[0,3,6,8,11,14].includes(r)){let u=a[i],d=r===8?1.5:r===11?1.25:1;this._musicTone("triangle",u*d,u*d,.2,.12,c(0))}if((r===2||r===6||r===10||r===14)&&o[i].forEach((d,h)=>{this._musicTone("sine",d*2,d*2,.18,.018*(.7+l*.6),c(h*.008))}),l>.55&&[5,7,13,15].includes(r)){let u=[523.25,587.33,659.25,783.99,880],d=u[(t*7+i*3)%u.length];this._musicTone("triangle",d,d,.22,.028*l,c(0))}r===0&&this._musicTone("sawtooth",a[i]*4,a[i]*4,.7,.012+l*.008,c(0))}_musicTone(t,e,n,i,r,a){let o=this.ctx,l=o.createOscillator();l.type=t,l.frequency.setValueAtTime(e,a),n!==e&&l.frequency.exponentialRampToValueAtTime(Math.max(20,n),a+i);let c=o.createGain();c.gain.setValueAtTime(1e-4,a),c.gain.exponentialRampToValueAtTime(Math.max(2e-4,r),a+.01),c.gain.exponentialRampToValueAtTime(1e-4,a+i),l.connect(c).connect(this.musicBus),l.start(a),l.stop(a+i+.03)}_musicNoise(t,e,n,i){let r=this.ctx,a=r.createBufferSource();a.buffer=this.noise,a.loop=!0;let o=r.createBiquadFilter();o.type="highpass",o.frequency.value=t;let l=r.createGain();l.gain.setValueAtTime(1e-4,i),l.gain.exponentialRampToValueAtTime(Math.max(2e-4,n),i+.004),l.gain.exponentialRampToValueAtTime(1e-4,i+e),a.connect(o).connect(l).connect(this.musicBus),a.start(i),a.stop(i+e+.02)}};function gp(s){let t=s>>>0;return function(){t|=0,t=t+1831565813|0;let n=Math.imul(t^t>>>15,1|t);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}function ya(s=1){let t=gp(s);return{next:t,range(e,n){return e+(n-e)*t()},pick(e){return e[Math.floor(t()*e.length)%e.length]},int(e,n){return Math.floor(e+t()*(n-e+1))}}}var _p={salad:3,cheeseburger:4,double:2},va=class{constructor(t,e=ya(7)){this.level=t,this.rng=e,this.tickets=[],this.nextId=1,this.lastRecipe=null,this.spawnTimer=t.spawnInterval*.6,this.spawned=0,this.expired=0;let n=Math.min(t.slots,2);for(let i=0;i<n;i++)this.spawn()}get active(){return this.tickets.filter(t=>!t.done)}maxTimeFor(t){let e=Re[t];return Math.max(18,e.orderTime*(this.level.orderTimeScale??1))}pickRecipe(){let t=this.level.recipes.filter(r=>Re[r]),e=new Set(this.level.featured||[]),n=[];for(let r of t){let a=_p[r]??Re[r]?.weight??1,o=Math.max(1,Math.round(a*(e.has(r)?2.2:1)));for(let l=0;l<o;l++)n.push(r)}let i=this.rng.pick(n);return t.length>1&&i===this.lastRecipe&&(i=this.rng.pick(n.filter(r=>r!==this.lastRecipe))),this.lastRecipe=i,i}spawn(){if(this.active.length>=this.level.slots)return null;let t=this.pickRecipe(),e=this.maxTimeFor(t),n={id:this.nextId++,recipeId:t,maxTime:e,time:e,done:!1,spawnedAt:this.spawned};return this.spawned++,this.tickets.push(n),n}tick(t){let e=[];for(let i of this.tickets)i.done||(i.time-=t,i.time<=0&&(i.time=0,i.done=!0,e.push(i),this.expired++));this.tickets=this.tickets.filter(i=>!i.done);let n=[];if(this.spawnTimer-=t,this.spawnTimer<=0){let i=this.spawn();i&&n.push(i);let r=this.level.spawnInterval;this.spawnTimer=r*this.rng.range(.8,1.2)}return{expired:e,spawned:n}}consume(t){let e=null;for(let n of this.tickets)n.done||n.recipeId!==t||(!e||n.time<e.time)&&(e=n);return e?(e.done=!0,this.tickets=this.tickets.filter(n=>n!==e),e):null}get sorted(){return[...this.tickets].sort((t,e)=>t.time-e.time)}};var ba=class{constructor(){this._handlers=new Map}on(t,e){return this._handlers.has(t)||this._handlers.set(t,new Set),this._handlers.get(t).add(e),()=>this.off(t,e)}off(t,e){this._handlers.get(t)?.delete(e)}emit(t,e={}){let n={type:t,...e},i=this._handlers.get(t);if(i)for(let a of[...i])a(n);let r=this._handlers.get("*");if(r)for(let a of[...r])a(n);return n}clear(){this._handlers.clear()}};var Nu=(s,t,e)=>Math.max(t,Math.min(e,s)),Sa=class{constructor(t,{seed:e=20261102,mode:n="fp",recommended:i=[]}={}){this.level=t,this.mode=n,this.recommended=new Set(Array.isArray(i)?i:[]),this.rng=ya(e),this.kitchen=new ha,this.orders=new va(t,this.rng),this.timeLeft=t.duration,this.duration=t.duration,this.score=0,this.combo=0,this.comboTimer=0,this.maxCombo=0,this.state="playing",this.elapsed=0,this.firstServeAt=null,this.events=new ba,this.stats={served:0,wasted:0,expired:0,burnt:0,chopped:0,bestDish:null,bestPoints:0,rsiBonus:0,recommendedServed:0,dishCounts:{}},this.lastResult=null,this.stars=0}get comboMultiplier(){return 1+Math.min(this.combo,4)*.25}tick(t){if(this.state!=="playing")return;t=Nu(t,0,.1),this.elapsed+=t,this.timeLeft=Math.max(0,this.timeLeft-t);let{expired:e,spawned:n}=this.orders.tick(t);for(let i of e)this.stats.expired++,this.combo=0,this.comboTimer=0,this.events.emit("order:expired",{ticket:i});for(let i of n)this.events.emit("order:new",{ticket:i});for(let i of this.kitchen.tick(t))i.type==="cook:burn"&&(this.stats.burnt++,this.combo=Math.max(0,this.combo-1)),this.events.emit(i.type,i);this.combo>0&&(this.comboTimer-=t,this.comboTimer<=0&&(this.combo=0,this.comboTimer=0)),this.timeLeft<=0&&this.finish()}interact(t,e){if(this.state!=="playing")return{ok:!1,action:"blocked",message:""};let n=this.kitchen.interact(t,e);if(n.ok){if(n.action==="pickup"||n.action==="place"||n.action==="topping")this.events.emit(n.action,n);else if(n.action==="trash")this.events.emit("trash",n);else if(n.action==="serve"){let i=this.servePlate(n.plate,n.station);Object.assign(n,i),this.events.emit("serve",n)}}else this.events.emit("blocked",n);return this.lastResult=n,n}chopTick(t,e,n){if(this.state!=="playing")return null;let i=this.kitchen.chopTick(t,e,n);return i?.done&&(this.stats.chopped++,this.events.emit("chop:done",i)),i}servePlate(t,e){let n=kn(t.contents);if(!n)return this.stats.wasted++,this.events.emit("dish:waste",{plate:t,station:e}),{recipe:null,points:0,message:"这盘菜没人认得出来…",wasted:!0};let i=this.orders.consume(n.id);if(!i)return this.stats.wasted++,this.events.emit("dish:unwanted",{plate:t,station:e,recipe:n}),{recipe:n,points:0,message:`没有客人点${n.name}`,wasted:!0,unwanted:!0};let r=Nu(i.time/i.maxTime,0,1),a=n.score,o=Math.round(a*.35*r),l=this.comboMultiplier,c=Math.round((a+o)*l),u=this.recommended.has(n.id),d=u?Math.round(c*.25):0,h=c+d,p=this.combo;return this.combo=Math.min(this.combo+1,8),this.comboTimer=30,this.maxCombo=Math.max(this.maxCombo,this.combo),this.score+=h,this.stats.served++,this.stats.dishCounts[n.id]=(this.stats.dishCounts[n.id]||0)+1,u&&(this.stats.recommendedServed++,this.stats.rsiBonus+=d),this.stats.served===1&&(this.firstServeAt=Math.round(this.elapsed*10)/10),h>this.stats.bestPoints&&(this.stats.bestPoints=h,this.stats.bestDish=n.id),{recipe:n,ticket:i,points:h,base:a,tip:o,mult:l,comboBefore:p,comboAfter:this.combo,timeFrac:r,recommended:u,rsiBonus:d,message:`${n.name} +${h}`,wasted:!1}}finish(){if(this.state==="over")return;this.state="over",this.timeLeft=0;let t=0;for(let e=0;e<this.level.target.length;e++)this.score>=this.level.target[e]&&(t=e+1);this.stars=t,this.events.emit("level:end",{score:this.score,stars:t,stats:this.stats,maxCombo:this.maxCombo})}snapshot(){return{timeLeft:this.timeLeft,score:this.score,combo:this.combo,state:this.state,stars:this.stars,stats:{...this.stats},tickets:this.orders.tickets.map(t=>({...t})),stations:this.kitchen.list.map(t=>({id:t.id,kind:t.kind,item:t.item?t.item.type==="plate"?{type:"plate",contents:t.item.contents.map(e=>({...e}))}:{type:"ingredient",ingredient:t.item.ingredient,state:t.item.state,chop:t.item.chopProgress,cook:t.item.cookTimer}:null}))}}};var ld=0,Fc=1,cd=2;var es=1,hd=2,Vs=3,Li=0,Ve=1,yn=2,Kn=0,Di=1,pi=2,Bc=3,Oc=4,ud=5;var ns=100,dd=101,fd=102,pd=103,md=104,gd=200,_d=201,xd=202,yd=203,kc=204,zc=205,vd=206,bd=207,Sd=208,Md=209,wd=210,Ed=211,Td=212,Ad=213,Rd=214,Ja=0,Ka=1,ja=2,Ls=3,Qa=4,to=5,eo=6,no=7,Co=0,Cd=1,Id=2,Ln=0,Hc=1,Vc=2,Gc=3,Wr=4,Wc=5,Xc=6,$c=7;var qc=300,Ni=301,is=302,Io=303,Po=304,Xr=306,Ki=1e3,Wn=1001,io=1002,Fe=1003,Pd=1004;var $r=1005;var ze=1006,Lo=1007;var Ui=1008;var dn=1009,Yc=1010,Zc=1011,Gs=1012,Do=1013,Dn=1014,Mn=1015,Nn=1016,No=1017,Uo=1018,Ws=1020,Jc=35902,Kc=35899,jc=1021,Qc=1022,wn=1023,Xn=1026,Fi=1027,Fo=1028,Bo=1029,Bi=1030,Oo=1031;var ko=1033,qr=33776,Yr=33777,Zr=33778,Jr=33779,zo=35840,Ho=35841,Vo=35842,Go=35843,Wo=36196,Xo=37492,$o=37496,qo=37488,Yo=37489,Kr=37490,Zo=37491,Jo=37808,Ko=37809,jo=37810,Qo=37811,tl=37812,el=37813,nl=37814,il=37815,sl=37816,rl=37817,al=37818,ol=37819,ll=37820,cl=37821,hl=36492,ul=36494,dl=36495,fl=36283,pl=36284,jr=36285,ml=36286;var gr=2300,so=2301,Ya=2302,Ac=2303,Rc=2400,Cc=2401,Ic=2402;var Ld=3200;var Qr=0,Dd=1,mi="",me="srgb",_r="srgb-linear",xr="linear",ee="srgb";var Za=7680;var Nd=519,Ud=512,Fd=513,Bd=514,gl=515,Od=516,kd=517,_l=518,zd=519,th=35044;var eh="300 es",In=2e3,Ds=2001;function xp(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function yp(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function yr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Hd(){let s=yr("canvas");return s.style.display="block",s}var Uu={},Ns=null;function vr(...s){let t="THREE."+s.shift();Ns?Ns("log",t,...s):console.log(t,...s)}function Vd(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Pt(...s){s=Vd(s);let t="THREE."+s.shift();if(Ns)Ns("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function It(...s){s=Vd(s);let t="THREE."+s.shift();if(Ns)Ns("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Ji(...s){let t=s.join(" ");t in Uu||(Uu[t]=!0,Pt(...s))}function Gd(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Wd={[Ja]:Ka,[ja]:eo,[Qa]:no,[Ls]:to,[Ka]:Ja,[eo]:ja,[no]:Qa,[to]:Ls},$n=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}},$e=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ic=Math.PI/180,ro=180/Math.PI;function Ai(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return($e[s&255]+$e[s>>8&255]+$e[s>>16&255]+$e[s>>24&255]+"-"+$e[t&255]+$e[t>>8&255]+"-"+$e[t>>16&15|64]+$e[t>>24&255]+"-"+$e[e&63|128]+$e[e>>8&255]+"-"+$e[e>>16&255]+$e[e>>24&255]+$e[n&255]+$e[n>>8&255]+$e[n>>16&255]+$e[n>>24&255]).toLowerCase()}function qt(s,t,e){return Math.max(t,Math.min(e,s))}function vp(s,t){return(s%t+t)%t}function sc(s,t,e){return(1-e)*s+e*t}function Gn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function re(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ah=class ah{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ah.prototype.isVector2=!0;var Lt=ah,qn=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],u=n[i+2],d=n[i+3],h=r[a+0],p=r[a+1],g=r[a+2],y=r[a+3];if(d!==y||l!==h||c!==p||u!==g){let m=l*h+c*p+u*g+d*y;m<0&&(h=-h,p=-p,g=-g,y=-y,m=-m);let f=1-o;if(m<.9995){let M=Math.acos(m),A=Math.sin(M);f=Math.sin(f*M)/A,o=Math.sin(o*M)/A,l=l*f+h*o,c=c*f+p*o,u=u*f+g*o,d=d*f+y*o}else{l=l*f+h*o,c=c*f+p*o,u=u*f+g*o,d=d*f+y*o;let M=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=M,c*=M,u*=M,d*=M}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,i,r,a){let o=n[i],l=n[i+1],c=n[i+2],u=n[i+3],d=r[a],h=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+u*d+l*p-c*h,t[e+1]=l*g+u*h+c*d-o*p,t[e+2]=c*g+u*p+o*h-l*d,t[e+3]=u*g-o*d-l*h-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(i/2),d=o(r/2),h=l(n/2),p=l(i/2),g=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"YXZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"ZXY":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"ZYX":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"YZX":this._x=h*u*d+c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d-h*p*g;break;case"XZY":this._x=h*u*d-c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d+h*p*g;break;default:Pt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],d=e[10],h=n+o+d;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-l)*p,this._y=(r-c)*p,this._z=(a-i)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(u-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(r+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-i)/p,this._x=(r+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(qt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+i*c-r*l,this._y=i*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-i*o,this._w=a*u-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},oh=class oh{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Fu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Fu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),u=2*(o*e-r*i),d=2*(r*n-a*e);return this.x=e+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=i+l*d+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this.z=qt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this.z=qt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return rc.copy(this).projectOnVector(t),this.sub(rc)}reflect(t){return this.sub(rc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};oh.prototype.isVector3=!0;var P=oh,rc=new P,Fu=new qn,lh=class lh{constructor(t,e,n,i,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=i,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],p=n[5],g=n[8],y=i[0],m=i[3],f=i[6],M=i[1],A=i[4],b=i[7],w=i[2],S=i[5],T=i[8];return r[0]=a*y+o*M+l*w,r[3]=a*m+o*A+l*S,r[6]=a*f+o*b+l*T,r[1]=c*y+u*M+d*w,r[4]=c*m+u*A+d*S,r[7]=c*f+u*b+d*T,r[2]=h*y+p*M+g*w,r[5]=h*m+p*A+g*S,r[8]=h*f+p*b+g*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+i*r*c-i*a*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],d=u*a-o*c,h=o*l-u*r,p=c*r-a*l,g=e*d+n*h+i*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return t[0]=d*y,t[1]=(i*c-u*n)*y,t[2]=(o*n-i*a)*y,t[3]=h*y,t[4]=(u*e-i*l)*y,t[5]=(i*r-o*e)*y,t[6]=p*y,t[7]=(n*l-c*e)*y,t[8]=(a*e-n*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ji("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ac.makeScale(t,e)),this}rotate(t){return Ji("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ac.makeRotation(-t)),this}translate(t,e){return Ji("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ac.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};lh.prototype.isMatrix3=!0;var Nt=lh,ac=new Nt,Bu=new Nt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ou=new Nt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function bp(){let s={enabled:!0,workingColorSpace:_r,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ee&&(i.r=ui(i.r),i.g=ui(i.g),i.b=ui(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ee&&(i.r=Ps(i.r),i.g=Ps(i.g),i.b=Ps(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===mi?xr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Ji("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Ji("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[_r]:{primaries:t,whitePoint:n,transfer:xr,toXYZ:Bu,fromXYZ:Ou,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:me},outputColorSpaceConfig:{drawingBufferColorSpace:me}},[me]:{primaries:t,whitePoint:n,transfer:ee,toXYZ:Bu,fromXYZ:Ou,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:me}}}),s}var $t=bp();function ui(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ps(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var fs,ao=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{fs===void 0&&(fs=yr("canvas")),fs.width=t.width,fs.height=t.height;let i=fs.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=fs}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=yr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=ui(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ui(e[n]/255)*255):e[n]=ui(e[n]);return{data:e,width:t.width,height:t.height}}else return Pt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Sp=0,Us=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Sp++}),this.uuid=Ai(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(oc(i[a].image)):r.push(oc(i[a]))}else r=oc(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function oc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?ao.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Pt("Texture: Unable to serialize Texture."),{})}var Mp=0,lc=new P,nn=class s extends $n{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=Wn,i=Wn,r=ze,a=Ui,o=wn,l=dn,c=s.DEFAULT_ANISOTROPY,u=mi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mp++}),this.uuid=Ai(),this.name="",this.source=new Us(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Lt(0,0),this.repeat=new Lt(1,1),this.center=new Lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(lc).x}get height(){return this.source.getSize(lc).y}get depth(){return this.source.getSize(lc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Pt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Pt(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==qc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ki:t.x=t.x-Math.floor(t.x);break;case Wn:t.x=t.x<0?0:1;break;case io:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ki:t.y=t.y-Math.floor(t.y);break;case Wn:t.y=t.y<0?0:1;break;case io:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};nn.DEFAULT_IMAGE=null;nn.DEFAULT_MAPPING=qc;nn.DEFAULT_ANISOTROPY=1;var ch=class ch{constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,l=t.elements,c=l[0],u=l[4],d=l[8],h=l[1],p=l[5],g=l[9],y=l[2],m=l[6],f=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let A=(c+1)/2,b=(p+1)/2,w=(f+1)/2,S=(u+h)/4,T=(d+y)/4,x=(g+m)/4;return A>b&&A>w?A<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(A),i=S/n,r=T/n):b>w?b<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(b),n=S/i,r=x/i):w<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(w),n=T/r,i=x/r),this.set(n,i,r,e),this}let M=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(d-y)/M,this.z=(h-u)/M,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this.z=qt(this.z,t.z,e.z),this.w=qt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this.z=qt(this.z,t,e),this.w=qt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ch.prototype.isVector4=!0;var ge=ch,oo=class extends $n{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ze,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ge(0,0,t,e),this.scissorTest=!1,this.viewport=new ge(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},r=new nn(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:ze,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new Us(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},hn=class extends oo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},br=class extends nn{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Fe,this.minFilter=Fe,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var lo=class extends nn{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Fe,this.minFilter=Fe,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Ro=class Ro{constructor(t,e,n,i,r,a,o,l,c,u,d,h,p,g,y,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,u,d,h,p,g,y,m)}set(t,e,n,i,r,a,o,l,c,u,d,h,p,g,y,m){let f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=i,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=u,f[10]=d,f[14]=h,f[3]=p,f[7]=g,f[11]=y,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ro().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/ps.setFromMatrixColumn(t,0).length(),r=1/ps.setFromMatrixColumn(t,1).length(),a=1/ps.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let h=a*u,p=a*d,g=o*u,y=o*d;e[0]=l*u,e[4]=-l*d,e[8]=c,e[1]=p+g*c,e[5]=h-y*c,e[9]=-o*l,e[2]=y-h*c,e[6]=g+p*c,e[10]=a*l}else if(t.order==="YXZ"){let h=l*u,p=l*d,g=c*u,y=c*d;e[0]=h+y*o,e[4]=g*o-p,e[8]=a*c,e[1]=a*d,e[5]=a*u,e[9]=-o,e[2]=p*o-g,e[6]=y+h*o,e[10]=a*l}else if(t.order==="ZXY"){let h=l*u,p=l*d,g=c*u,y=c*d;e[0]=h-y*o,e[4]=-a*d,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*u,e[9]=y-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let h=a*u,p=a*d,g=o*u,y=o*d;e[0]=l*u,e[4]=g*c-p,e[8]=h*c+y,e[1]=l*d,e[5]=y*c+h,e[9]=p*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let h=a*l,p=a*c,g=o*l,y=o*c;e[0]=l*u,e[4]=y-h*d,e[8]=g*d+p,e[1]=d,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=p*d+g,e[10]=h-y*d}else if(t.order==="XZY"){let h=a*l,p=a*c,g=o*l,y=o*c;e[0]=l*u,e[4]=-d,e[8]=c*u,e[1]=h*d+y,e[5]=a*u,e[9]=p*d-g,e[2]=g*d-p,e[6]=o*u,e[10]=y*d+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(wp,t,Ep)}lookAt(t,e,n){let i=this.elements;return mn.subVectors(t,e),mn.lengthSq()===0&&(mn.z=1),mn.normalize(),Si.crossVectors(n,mn),Si.lengthSq()===0&&(Math.abs(n.z)===1?mn.x+=1e-4:mn.z+=1e-4,mn.normalize(),Si.crossVectors(n,mn)),Si.normalize(),Ma.crossVectors(mn,Si),i[0]=Si.x,i[4]=Ma.x,i[8]=mn.x,i[1]=Si.y,i[5]=Ma.y,i[9]=mn.y,i[2]=Si.z,i[6]=Ma.z,i[10]=mn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],p=n[13],g=n[2],y=n[6],m=n[10],f=n[14],M=n[3],A=n[7],b=n[11],w=n[15],S=i[0],T=i[4],x=i[8],E=i[12],C=i[1],U=i[5],F=i[9],H=i[13],D=i[2],V=i[6],Y=i[10],Z=i[14],nt=i[3],X=i[7],Q=i[11],et=i[15];return r[0]=a*S+o*C+l*D+c*nt,r[4]=a*T+o*U+l*V+c*X,r[8]=a*x+o*F+l*Y+c*Q,r[12]=a*E+o*H+l*Z+c*et,r[1]=u*S+d*C+h*D+p*nt,r[5]=u*T+d*U+h*V+p*X,r[9]=u*x+d*F+h*Y+p*Q,r[13]=u*E+d*H+h*Z+p*et,r[2]=g*S+y*C+m*D+f*nt,r[6]=g*T+y*U+m*V+f*X,r[10]=g*x+y*F+m*Y+f*Q,r[14]=g*E+y*H+m*Z+f*et,r[3]=M*S+A*C+b*D+w*nt,r[7]=M*T+A*U+b*V+w*X,r[11]=M*x+A*F+b*Y+w*Q,r[15]=M*E+A*H+b*Z+w*et,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],d=t[6],h=t[10],p=t[14],g=t[3],y=t[7],m=t[11],f=t[15],M=l*p-c*h,A=o*p-c*d,b=o*h-l*d,w=a*p-c*u,S=a*h-l*u,T=a*d-o*u;return e*(y*M-m*A+f*b)-n*(g*M-m*w+f*S)+i*(g*A-y*w+f*T)-r*(g*b-y*S+m*T)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-n*(r*u-o*l)+i*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],d=t[9],h=t[10],p=t[11],g=t[12],y=t[13],m=t[14],f=t[15],M=e*o-n*a,A=e*l-i*a,b=e*c-r*a,w=n*l-i*o,S=n*c-r*o,T=i*c-r*l,x=u*y-d*g,E=u*m-h*g,C=u*f-p*g,U=d*m-h*y,F=d*f-p*y,H=h*f-p*m,D=M*H-A*F+b*U+w*C-S*E+T*x;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/D;return t[0]=(o*H-l*F+c*U)*V,t[1]=(i*F-n*H-r*U)*V,t[2]=(y*T-m*S+f*w)*V,t[3]=(h*S-d*T-p*w)*V,t[4]=(l*C-a*H-c*E)*V,t[5]=(e*H-i*C+r*E)*V,t[6]=(m*b-g*T-f*A)*V,t[7]=(u*T-h*b+p*A)*V,t[8]=(a*F-o*C+c*x)*V,t[9]=(n*C-e*F-r*x)*V,t[10]=(g*S-y*b+f*M)*V,t[11]=(d*b-u*S-p*M)*V,t[12]=(o*E-a*U-l*x)*V,t[13]=(e*U-n*E+i*x)*V,t[14]=(y*A-g*w-m*M)*V,t[15]=(u*w-d*A+h*M)*V,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,u*o+n,u*l-i*a,0,c*l-i*o,u*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,d=o+o,h=r*c,p=r*u,g=r*d,y=a*u,m=a*d,f=o*d,M=l*c,A=l*u,b=l*d,w=n.x,S=n.y,T=n.z;return i[0]=(1-(y+f))*w,i[1]=(p+b)*w,i[2]=(g-A)*w,i[3]=0,i[4]=(p-b)*S,i[5]=(1-(h+f))*S,i[6]=(m+M)*S,i[7]=0,i[8]=(g+A)*T,i[9]=(m-M)*T,i[10]=(1-(h+y))*T,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=ps.set(i[0],i[1],i[2]).length(),o=ps.set(i[4],i[5],i[6]).length(),l=ps.set(i[8],i[9],i[10]).length();r<0&&(a=-a),Tn.copy(this);let c=1/a,u=1/o,d=1/l;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=u,Tn.elements[5]*=u,Tn.elements[6]*=u,Tn.elements[8]*=d,Tn.elements[9]*=d,Tn.elements[10]*=d,e.setFromRotationMatrix(Tn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,i,r,a,o=In,l=!1){let c=this.elements,u=2*r/(e-t),d=2*r/(n-i),h=(e+t)/(e-t),p=(n+i)/(n-i),g,y;if(l)g=r/(a-r),y=a*r/(a-r);else if(o===In)g=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===Ds)g=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=In,l=!1){let c=this.elements,u=2/(e-t),d=2/(n-i),h=-(e+t)/(e-t),p=-(n+i)/(n-i),g,y;if(l)g=1/(a-r),y=a/(a-r);else if(o===In)g=-2/(a-r),y=-(a+r)/(a-r);else if(o===Ds)g=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};Ro.prototype.isMatrix4=!0;var ae=Ro,ps=new P,Tn=new ae,wp=new P(0,0,0),Ep=new P(1,1,1),Si=new P,Ma=new P,mn=new P,ku=new ae,zu=new qn,Yn=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],u=i[9],d=i[2],h=i[6],p=i[10];switch(e){case"XYZ":this._y=Math.asin(qt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(qt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(qt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-qt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:Pt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return ku.makeRotationFromQuaternion(t),this.setFromRotationMatrix(ku,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return zu.setFromEuler(this),this.setFromQuaternion(zu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Yn.DEFAULT_ORDER="XYZ";var Sr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Tp=0,Hu=new P,ms=new qn,ri=new ae,wa=new P,or=new P,Ap=new P,Rp=new qn,Vu=new P(1,0,0),Gu=new P(0,1,0),Wu=new P(0,0,1),Xu={type:"added"},Cp={type:"removed"},gs={type:"childadded",child:null},cc={type:"childremoved",child:null},Ee=class s extends $n{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tp++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new P,e=new Yn,n=new qn,i=new P(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ae},normalMatrix:{value:new Nt}}),this.matrix=new ae,this.matrixWorld=new ae,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Sr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ms.setFromAxisAngle(t,e),this.quaternion.multiply(ms),this}rotateOnWorldAxis(t,e){return ms.setFromAxisAngle(t,e),this.quaternion.premultiply(ms),this}rotateX(t){return this.rotateOnAxis(Vu,t)}rotateY(t){return this.rotateOnAxis(Gu,t)}rotateZ(t){return this.rotateOnAxis(Wu,t)}translateOnAxis(t,e){return Hu.copy(t).applyQuaternion(this.quaternion),this.position.add(Hu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Vu,t)}translateY(t){return this.translateOnAxis(Gu,t)}translateZ(t){return this.translateOnAxis(Wu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ri.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?wa.copy(t):wa.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),or.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ri.lookAt(or,wa,this.up):ri.lookAt(wa,or,this.up),this.quaternion.setFromRotationMatrix(ri),i&&(ri.extractRotation(i.matrixWorld),ms.setFromRotationMatrix(ri),this.quaternion.premultiply(ms.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(It("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xu),gs.child=t,this.dispatchEvent(gs),gs.child=null):It("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Cp),cc.child=t,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ri.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ri.multiply(t.parent.matrixWorld)),t.applyMatrix4(ri),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xu),gs.child=t,this.dispatchEvent(gs),gs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,t,Ap),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,Rp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),d=a(t.shapes),h=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ee.DEFAULT_UP=new P(0,1,0);Ee.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Zt=class extends Ee{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ip={type:"move"},Fs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let y of t.hand.values()){let m=e.getJointPose(y,n),f=this._getHandJoint(c,y);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ip)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Zt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Xd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Mi={h:0,s:0,l:0},Ea={h:0,s:0,l:0};function hc(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Dt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=me){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,$t.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=$t.workingColorSpace){return this.r=t,this.g=e,this.b=n,$t.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=$t.workingColorSpace){if(t=vp(t,1),e=qt(e,0,1),n=qt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=hc(a,r,t+1/3),this.g=hc(a,r,t),this.b=hc(a,r,t-1/3)}return $t.colorSpaceToWorking(this,i),this}setStyle(t,e=me){function n(r){r!==void 0&&parseFloat(r)<1&&Pt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Pt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Pt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=me){let n=Xd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Pt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ui(t.r),this.g=ui(t.g),this.b=ui(t.b),this}copyLinearToSRGB(t){return this.r=Ps(t.r),this.g=Ps(t.g),this.b=Ps(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=me){return $t.workingToColorSpace(qe.copy(this),t),Math.round(qt(qe.r*255,0,255))*65536+Math.round(qt(qe.g*255,0,255))*256+Math.round(qt(qe.b*255,0,255))}getHexString(t=me){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=$t.workingColorSpace){$t.workingToColorSpace(qe.copy(this),e);let n=qe.r,i=qe.g,r=qe.b,a=Math.max(n,i,r),o=Math.min(n,i,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(i-r)/d+(i<r?6:0);break;case i:l=(r-n)/d+2;break;case r:l=(n-i)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=$t.workingColorSpace){return $t.workingToColorSpace(qe.copy(this),e),t.r=qe.r,t.g=qe.g,t.b=qe.b,t}getStyle(t=me){$t.workingToColorSpace(qe.copy(this),t);let e=qe.r,n=qe.g,i=qe.b;return t!==me?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Mi),this.setHSL(Mi.h+t,Mi.s+e,Mi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Mi),t.getHSL(Ea);let n=sc(Mi.h,Ea.h,e),i=sc(Mi.s,Ea.s,e),r=sc(Mi.l,Ea.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},qe=new Dt;Dt.NAMES=Xd;var Mr=class s{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Dt(t),this.near=e,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ji=class extends Ee{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yn,this.environmentIntensity=1,this.environmentRotation=new Yn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},An=new P,ai=new P,uc=new P,oi=new P,_s=new P,xs=new P,$u=new P,dc=new P,fc=new P,pc=new P,mc=new ge,gc=new ge,_c=new ge,hi=class s{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),An.subVectors(t,e),i.cross(An);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){An.subVectors(i,e),ai.subVectors(n,e),uc.subVectors(t,e);let a=An.dot(An),o=An.dot(ai),l=An.dot(uc),c=ai.dot(ai),u=ai.dot(uc),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,p=(c*l-o*u)*h,g=(a*u-o*l)*h;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,oi)===null?!1:oi.x>=0&&oi.y>=0&&oi.x+oi.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,oi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,oi.x),l.addScaledVector(a,oi.y),l.addScaledVector(o,oi.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return mc.setScalar(0),gc.setScalar(0),_c.setScalar(0),mc.fromBufferAttribute(t,e),gc.fromBufferAttribute(t,n),_c.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(mc,r.x),a.addScaledVector(gc,r.y),a.addScaledVector(_c,r.z),a}static isFrontFacing(t,e,n,i){return An.subVectors(n,e),ai.subVectors(t,e),An.cross(ai).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return An.subVectors(this.c,this.b),ai.subVectors(this.a,this.b),An.cross(ai).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,a,o;_s.subVectors(i,n),xs.subVectors(r,n),dc.subVectors(t,n);let l=_s.dot(dc),c=xs.dot(dc);if(l<=0&&c<=0)return e.copy(n);fc.subVectors(t,i);let u=_s.dot(fc),d=xs.dot(fc);if(u>=0&&d<=u)return e.copy(i);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(_s,a);pc.subVectors(t,r);let p=_s.dot(pc),g=xs.dot(pc);if(g>=0&&p<=g)return e.copy(r);let y=p*c-l*g;if(y<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(xs,o);let m=u*g-p*d;if(m<=0&&d-u>=0&&p-g>=0)return $u.subVectors(r,i),o=(d-u)/(d-u+(p-g)),e.copy(i).addScaledVector($u,o);let f=1/(m+y+h);return a=y*f,o=h*f,e.copy(n).addScaledVector(_s,a).addScaledVector(xs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Zn=class{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Rn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Rn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Rn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Rn):Rn.fromBufferAttribute(r,a),Rn.applyMatrix4(t.matrixWorld),this.expandByPoint(Rn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ta.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ta.copy(n.boundingBox)),Ta.applyMatrix4(t.matrixWorld),this.union(Ta)}let i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Rn),Rn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(lr),Aa.subVectors(this.max,lr),ys.subVectors(t.a,lr),vs.subVectors(t.b,lr),bs.subVectors(t.c,lr),wi.subVectors(vs,ys),Ei.subVectors(bs,vs),$i.subVectors(ys,bs);let e=[0,-wi.z,wi.y,0,-Ei.z,Ei.y,0,-$i.z,$i.y,wi.z,0,-wi.x,Ei.z,0,-Ei.x,$i.z,0,-$i.x,-wi.y,wi.x,0,-Ei.y,Ei.x,0,-$i.y,$i.x,0];return!xc(e,ys,vs,bs,Aa)||(e=[1,0,0,0,1,0,0,0,1],!xc(e,ys,vs,bs,Aa))?!1:(Ra.crossVectors(wi,Ei),e=[Ra.x,Ra.y,Ra.z],xc(e,ys,vs,bs,Aa))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Rn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Rn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(li[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),li[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),li[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),li[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),li[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),li[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),li[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),li[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(li),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},li=[new P,new P,new P,new P,new P,new P,new P,new P],Rn=new P,Ta=new Zn,ys=new P,vs=new P,bs=new P,wi=new P,Ei=new P,$i=new P,lr=new P,Aa=new P,Ra=new P,qi=new P;function xc(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){qi.fromArray(s,r);let o=i.x*Math.abs(qi.x)+i.y*Math.abs(qi.y)+i.z*Math.abs(qi.z),l=t.dot(qi),c=e.dot(qi),u=n.dot(qi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var we=new P,Ca=new Lt,Pp=0,Pe=class extends $n{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Pp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=th,this.updateRanges=[],this.gpuType=Mn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ca.fromBufferAttribute(this,e),Ca.applyMatrix3(t),this.setXY(e,Ca.x,Ca.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyMatrix3(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyMatrix4(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyNormalMatrix(t),this.setXYZ(e,we.x,we.y,we.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.transformDirection(t),this.setXYZ(e,we.x,we.y,we.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Gn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=re(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Gn(e,this.array)),e}setX(t,e){return this.normalized&&(e=re(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Gn(e,this.array)),e}setY(t,e){return this.normalized&&(e=re(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Gn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=re(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Gn(e,this.array)),e}setW(t,e){return this.normalized&&(e=re(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=re(e,this.array),n=re(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=re(e,this.array),n=re(n,this.array),i=re(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=re(e,this.array),n=re(n,this.array),i=re(i,this.array),r=re(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var wr=class extends Pe{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Er=class extends Pe{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ne=class extends Pe{constructor(t,e,n){super(new Float32Array(t),e,n)}},Lp=new Zn,cr=new P,yc=new P,di=class{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Lp.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;cr.subVectors(t,this.center);let e=cr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(cr,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(yc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(cr.copy(t.center).add(yc)),this.expandByPoint(cr.copy(t.center).sub(yc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Dp=0,bn=new ae,vc=new Ee,Ss=new P,gn=new Zn,hr=new Zn,Ue=new P,Te=class s extends $n{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Dp++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(xp(t)?Er:wr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Nt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return bn.makeRotationFromQuaternion(t),this.applyMatrix4(bn),this}rotateX(t){return bn.makeRotationX(t),this.applyMatrix4(bn),this}rotateY(t){return bn.makeRotationY(t),this.applyMatrix4(bn),this}rotateZ(t){return bn.makeRotationZ(t),this.applyMatrix4(bn),this}translate(t,e,n){return bn.makeTranslation(t,e,n),this.applyMatrix4(bn),this}scale(t,e,n){return bn.makeScale(t,e,n),this.applyMatrix4(bn),this}lookAt(t){return vc.lookAt(t),vc.updateMatrix(),this.applyMatrix4(vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ss).negate(),this.translate(Ss.x,Ss.y,Ss.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ne(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Pt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){It("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];gn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ue.addVectors(this.boundingBox.min,gn.min),this.boundingBox.expandByPoint(Ue),Ue.addVectors(this.boundingBox.max,gn.max),this.boundingBox.expandByPoint(Ue)):(this.boundingBox.expandByPoint(gn.min),this.boundingBox.expandByPoint(gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&It('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new di);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){It("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let n=this.boundingSphere.center;if(gn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];hr.setFromBufferAttribute(o),this.morphTargetsRelative?(Ue.addVectors(gn.min,hr.min),gn.expandByPoint(Ue),Ue.addVectors(gn.max,hr.max),gn.expandByPoint(Ue)):(gn.expandByPoint(hr.min),gn.expandByPoint(hr.max))}gn.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)Ue.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Ue));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ue.fromBufferAttribute(o,c),l&&(Ss.fromBufferAttribute(t,c),Ue.add(Ss)),i=Math.max(i,n.distanceToSquared(Ue))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&It('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){It("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Pe(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new P,l[x]=new P;let c=new P,u=new P,d=new P,h=new Lt,p=new Lt,g=new Lt,y=new P,m=new P;function f(x,E,C){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,E),d.fromBufferAttribute(n,C),h.fromBufferAttribute(r,x),p.fromBufferAttribute(r,E),g.fromBufferAttribute(r,C),u.sub(c),d.sub(c),p.sub(h),g.sub(h);let U=1/(p.x*g.y-g.x*p.y);isFinite(U)&&(y.copy(u).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(U),m.copy(d).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(U),o[x].add(y),o[E].add(y),o[C].add(y),l[x].add(m),l[E].add(m),l[C].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let x=0,E=M.length;x<E;++x){let C=M[x],U=C.start,F=C.count;for(let H=U,D=U+F;H<D;H+=3)f(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let A=new P,b=new P,w=new P,S=new P;function T(x){w.fromBufferAttribute(i,x),S.copy(w);let E=o[x];A.copy(E),A.sub(w.multiplyScalar(w.dot(E))).normalize(),b.crossVectors(S,E);let U=b.dot(l[x])<0?-1:1;a.setXYZW(x,A.x,A.y,A.z,U)}for(let x=0,E=M.length;x<E;++x){let C=M[x],U=C.start,F=C.count;for(let H=U,D=U+F;H<D;H+=3)T(t.getX(H+0)),T(t.getX(H+1)),T(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Pe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let i=new P,r=new P,a=new P,o=new P,l=new P,c=new P,u=new P,d=new P;if(t)for(let h=0,p=t.count;h<p;h+=3){let g=t.getX(h+0),y=t.getX(h+1),m=t.getX(h+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,y),a.fromBufferAttribute(e,m),u.subVectors(a,r),d.subVectors(i,r),u.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=e.count;h<p;h+=3)i.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),d.subVectors(i,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ue.fromBufferAttribute(t,e),Ue.normalize(),t.setXYZ(e,Ue.x,Ue.y,Ue.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u),p=0,g=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*u;for(let f=0;f<u;f++)h[g++]=c[p++]}return new Pe(h,u,d)}if(this.index===null)return Pt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let o in i){let l=i[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){let h=c[u],p=t(h,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let p=c[d];u.push(p.toJSON(t.data))}u.length>0&&(i[l]=u,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let u=i[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,p=d.length;h<p;h++)u.push(d[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},co=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=th,this.updateRanges=[],this.version=0,this.uuid=Ai()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ai()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ai()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},en=new P,Tr=class s{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)en.fromBufferAttribute(this,e),en.applyMatrix4(t),this.setXYZ(e,en.x,en.y,en.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)en.fromBufferAttribute(this,e),en.applyNormalMatrix(t),this.setXYZ(e,en.x,en.y,en.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)en.fromBufferAttribute(this,e),en.transformDirection(t),this.setXYZ(e,en.x,en.y,en.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Gn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=re(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=re(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=re(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=re(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=re(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Gn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Gn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Gn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Gn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=re(e,this.array),n=re(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=re(e,this.array),n=re(n,this.array),i=re(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=re(e,this.array),n=re(n,this.array),i=re(i,this.array),r=re(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){vr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new Pe(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){vr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},bc=new P,Np=new P,Up=new Nt,Cn=class{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=bc.subVectors(n,e).cross(Np.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(bc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(i,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Up.getNormalMatrix(t),i=this.coplanarPoint(bc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Fp=0,Pn=class extends $n{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Fp++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=Di,this.side=Li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=kc,this.blendDst=zc,this.blendEquation=ns,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Dt(0,0,0),this.blendAlpha=0,this.depthFunc=Ls,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Za,this.stencilZFail=Za,this.stencilZPass=Za,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Pt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Pt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Dt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Cn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Lt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Lt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Bs=class extends Pn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Dt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Ms,ur=new P,ws=new P,Es=new P,Ts=new Lt,dr=new Lt,$d=new ae,Ia=new P,fr=new P,Pa=new P,qu=new Lt,Sc=new Lt,Yu=new Lt,Ar=class extends Ee{constructor(t=new Bs){if(super(),this.isSprite=!0,this.type="Sprite",Ms===void 0){Ms=new Te;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new co(e,5);Ms.setIndex([0,1,2,0,2,3]),Ms.setAttribute("position",new Tr(n,3,0,!1)),Ms.setAttribute("uv",new Tr(n,2,3,!1))}this.geometry=Ms,this.material=t,this.center=new Lt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&It('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ws.setFromMatrixScale(this.matrixWorld),$d.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Es.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ws.multiplyScalar(-Es.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let a=this.center;La(Ia.set(-.5,-.5,0),Es,a,ws,i,r),La(fr.set(.5,-.5,0),Es,a,ws,i,r),La(Pa.set(.5,.5,0),Es,a,ws,i,r),qu.set(0,0),Sc.set(1,0),Yu.set(1,1);let o=t.ray.intersectTriangle(Ia,fr,Pa,!1,ur);if(o===null&&(La(fr.set(-.5,.5,0),Es,a,ws,i,r),Sc.set(0,1),o=t.ray.intersectTriangle(Ia,Pa,fr,!1,ur),o===null))return;let l=t.ray.origin.distanceTo(ur);l<t.near||l>t.far||e.push({distance:l,point:ur.clone(),uv:hi.getInterpolation(ur,Ia,fr,Pa,qu,Sc,Yu,new Lt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function La(s,t,e,n,i,r){Ts.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(dr.x=r*Ts.x-i*Ts.y,dr.y=i*Ts.x+r*Ts.y):dr.copy(Ts),s.copy(t),s.x+=dr.x,s.y+=dr.y,s.applyMatrix4($d)}var ci=new P,Mc=new P,Da=new P,Na=new P,Rr=class{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ci)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ci.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ci.copy(this.origin).addScaledVector(this.direction,e),ci.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Mc.copy(t).add(e).multiplyScalar(.5),Da.copy(e).sub(t).normalize(),Na.copy(this.origin).sub(Mc);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Da),o=Na.dot(this.direction),l=-Na.dot(Da),c=Na.lengthSq(),u=Math.abs(1-a*a),d,h,p,g;if(u>0)if(d=a*l-o,h=a*o-l,g=r*u,d>=0)if(h>=-g)if(h<=g){let y=1/u;d*=y,h*=y,p=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-r,-l),r),p=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(Mc).addScaledVector(Da,h),p}intersectSphere(t,e){if(t.radius<0)return null;ci.subVectors(t.center,this.origin);let n=ci.dot(this.direction),i=ci.dot(ci)-n*n,r=t.radius*t.radius;if(i>r)return null;let a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,i=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,i=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),d>=0?(o=(t.min.z-h.z)*d,l=(t.max.z-h.z)*d):(o=(t.max.z-h.z)*d,l=(t.min.z-h.z)*d),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,ci)!==null}intersectTriangle(t,e,n,i,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,d=t.x-a.x,h=t.y-a.y,p=t.z-a.z,g=e.x-a.x,y=e.y-a.y,m=e.z-a.z,f=n.x-a.x,M=n.y-a.y,A=n.z-a.z,b=Math.abs(l),w=Math.abs(c),S=Math.abs(u),T,x,E,C,U,F,H,D,V,Y,Z,nt;if(b>=w&&b>=S?(E=l,F=d,V=g,nt=f,l>=0?(T=c,x=u,C=h,U=p,H=y,D=m,Y=M,Z=A):(T=u,x=c,C=p,U=h,H=m,D=y,Y=A,Z=M)):w>=S?(E=c,F=h,V=y,nt=M,c>=0?(T=u,x=l,C=p,U=d,H=m,D=g,Y=A,Z=f):(T=l,x=u,C=d,U=p,H=g,D=m,Y=f,Z=A)):(E=u,F=p,V=m,nt=A,u>=0?(T=l,x=c,C=d,U=h,H=g,D=y,Y=f,Z=M):(T=c,x=l,C=h,U=d,H=y,D=g,Y=M,Z=f)),E===0)return null;let X=T/E,Q=x/E,et=1/E,At=C-X*F,Et=U-Q*F,le=H-X*V,Yt=D-Q*V,jt=Y-X*nt,$=Z-Q*nt,j=jt*Yt-$*le,_t=At*$-Et*jt,Ut=le*Et-Yt*At;if(i){if(j<0||_t<0||Ut<0)return null}else if((j<0||_t<0||Ut<0)&&(j>0||_t>0||Ut>0))return null;let mt=j+_t+Ut;if(mt===0)return null;let zt=et*(j*F+_t*V+Ut*nt);return(mt>0?zt<0:zt>0)?null:this.at(zt/mt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ye=class extends Pn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yn,this.combine=Co,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Zu=new ae,Yi=new Rr,Ua=new di,Ju=new P,Fa=new P,Ba=new P,Oa=new P,wc=new P,ka=new P,Ku=new P,za=new P,Rt=class extends Ee{constructor(t=new Te,e=new Ye){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let o=this.morphTargetInfluences;if(r&&o){ka.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],d=r[l];u!==0&&(wc.fromBufferAttribute(d,t),a?ka.addScaledVector(wc,u):ka.addScaledVector(wc.sub(e),u))}e.add(ka)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ua.copy(n.boundingSphere),Ua.applyMatrix4(r),Yi.copy(t.ray).recast(t.near),!(Ua.containsPoint(Yi.origin)===!1&&(Yi.intersectSphere(Ua,Ju)===null||Yi.origin.distanceToSquared(Ju)>(t.far-t.near)**2))&&(Zu.copy(r).invert(),Yi.copy(t.ray).applyMatrix4(Zu),!(n.boundingBox!==null&&Yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Yi)))}_computeIntersections(t,e,n){let i,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=h.length;g<y;g++){let m=h[g],f=a[m.materialIndex],M=Math.max(m.start,p.start),A=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let b=M,w=A;b<w;b+=3){let S=o.getX(b),T=o.getX(b+1),x=o.getX(b+2);i=Ha(this,f,t,n,c,u,d,S,T,x),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{let g=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let M=o.getX(m),A=o.getX(m+1),b=o.getX(m+2);i=Ha(this,a,t,n,c,u,d,M,A,b),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=h.length;g<y;g++){let m=h[g],f=a[m.materialIndex],M=Math.max(m.start,p.start),A=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let b=M,w=A;b<w;b+=3){let S=b,T=b+1,x=b+2;i=Ha(this,f,t,n,c,u,d,S,T,x),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{let g=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let M=m,A=m+1,b=m+2;i=Ha(this,a,t,n,c,u,d,M,A,b),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}};function Bp(s,t,e,n,i,r,a,o){let l;if(t.side===Ve?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===Li,o),l===null)return null;za.copy(o),za.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(za);return c<e.near||c>e.far?null:{distance:c,point:za.clone(),object:s}}function Ha(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Fa),s.getVertexPosition(l,Ba),s.getVertexPosition(c,Oa);let u=Bp(s,t,e,n,Fa,Ba,Oa,Ku);if(u){let d=new P;hi.getBarycoord(Ku,Fa,Ba,Oa,d),i&&(u.uv=hi.getInterpolatedAttribute(i,o,l,c,d,new Lt)),r&&(u.uv1=hi.getInterpolatedAttribute(r,o,l,c,d,new Lt)),a&&(u.normal=hi.getInterpolatedAttribute(a,o,l,c,d,new P),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new P,materialIndex:0};hi.getNormal(Fa,Ba,Oa,h.normal),u.face=h,u.barycoord=d}return u}var Cr=class extends nn{constructor(t=null,e=1,n=1,i,r,a,o,l,c=Fe,u=Fe,d,h){super(null,a,o,l,c,u,i,r,d,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ir=class extends Pe{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},As=new ae,ju=new ae,Va=[],Qu=new Zn,Op=new ae,pr=new Rt,mr=new di,Pr=class extends Rt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ir(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Op)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Zn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,As),Qu.copy(t.boundingBox).applyMatrix4(As),this.boundingBox.union(Qu)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new di),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,As),mr.copy(t.boundingSphere).applyMatrix4(As),this.boundingSphere.union(mr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){let n=this.matrixWorld,i=this.count;if(pr.geometry=this.geometry,pr.material=this.material,pr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mr.copy(this.boundingSphere),mr.applyMatrix4(n),t.ray.intersectsSphere(mr)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,As),ju.multiplyMatrices(n,As),pr.matrixWorld=ju,pr.raycast(t,Va);for(let a=0,o=Va.length;a<o;a++){let l=Va[a];l.instanceId=r,l.object=this,e.push(l)}Va.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Ir(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Cr(new Float32Array(i*this.count),i,this.count,Fo,Mn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Zi=new di,kp=new Lt(.5,.5),Ga=new P,Os=class{constructor(t=new Cn,e=new Cn,n=new Cn,i=new Cn,r=new Cn,a=new Cn){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=In,n=!1){let i=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],p=r[7],g=r[8],y=r[9],m=r[10],f=r[11],M=r[12],A=r[13],b=r[14],w=r[15];if(i[0].setComponents(c-a,p-u,f-g,w-M).normalize(),i[1].setComponents(c+a,p+u,f+g,w+M).normalize(),i[2].setComponents(c+o,p+d,f+y,w+A).normalize(),i[3].setComponents(c-o,p-d,f-y,w-A).normalize(),n)i[4].setComponents(l,h,m,b).normalize(),i[5].setComponents(c-l,p-h,f-m,w-b).normalize();else if(i[4].setComponents(c-l,p-h,f-m,w-b).normalize(),e===In)i[5].setComponents(c+l,p+h,f+m,w+b).normalize();else if(e===Ds)i[5].setComponents(l,h,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Zi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Zi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Zi)}intersectsSprite(t){Zi.center.set(0,0,0);let e=kp.distanceTo(t.center);return Zi.radius=.7071067811865476+e,Zi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Zi)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(Ga.x=i.normal.x>0?t.max.x:t.min.x,Ga.y=i.normal.y>0?t.max.y:t.min.y,Ga.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Ga)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ho=class extends Pn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},td=new ae,Pc=new Rr,Wa=new di,Xa=new P,Lr=class extends Ee{constructor(t=new Te,e=new ho){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Wa.copy(n.boundingSphere),Wa.applyMatrix4(i),Wa.radius+=r,t.ray.intersectsSphere(Wa)===!1)return;td.copy(i).invert(),Pc.copy(t.ray).applyMatrix4(td);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,d=n.attributes.position;if(c!==null){let h=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=h,y=p;g<y;g++){let m=c.getX(g);Xa.fromBufferAttribute(d,m),ed(Xa,m,l,i,t,e,this)}}else{let h=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let g=h,y=p;g<y;g++)Xa.fromBufferAttribute(d,g),ed(Xa,g,l,i,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function ed(s,t,e,n,i,r,a){let o=Pc.distanceSqToPoint(s);if(o<e){let l=new P;Pc.closestPointToPoint(s,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var Dr=class extends nn{constructor(t=[],e=Ni,n,i,r,a,o,l,c,u){super(t,e,n,i,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Sn=class extends nn{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ri=class extends nn{constructor(t,e,n=Dn,i,r,a,o=Fe,l=Fe,c,u=Xn,d=1){if(u!==Xn&&u!==Fi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:d};super(h,i,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Us(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},uo=class extends Ri{constructor(t,e=Dn,n=Ni,i,r,a=Fe,o=Fe,l,c=Xn){let u={width:t,height:t,depth:1},d=[u,u,u,u,u,u];super(t,t,e,n,i,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Nr=class extends nn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Be=class s extends Te{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};let o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],d=[],h=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,i,a,2),g("x","z","y",1,-1,t,n,-e,i,a,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(d,2));function g(y,m,f,M,A,b,w,S,T,x,E){let C=b/T,U=w/x,F=b/2,H=w/2,D=S/2,V=T+1,Y=x+1,Z=0,nt=0,X=new P;for(let Q=0;Q<Y;Q++){let et=Q*U-H;for(let At=0;At<V;At++){let Et=At*C-F;X[y]=Et*M,X[m]=et*A,X[f]=D,c.push(X.x,X.y,X.z),X[y]=0,X[m]=0,X[f]=S>0?1:-1,u.push(X.x,X.y,X.z),d.push(At/T),d.push(1-Q/x),Z+=1}}for(let Q=0;Q<x;Q++)for(let et=0;et<T;et++){let At=h+et+V*Q,Et=h+et+V*(Q+1),le=h+(et+1)+V*(Q+1),Yt=h+(et+1)+V*Q;l.push(At,Et,Yt),l.push(Et,le,Yt),nt+=6}o.addGroup(p,nt,E),p+=nt,h+=Z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Ur=class s extends Te{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new P,u=new Lt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,h=3;d<=e;d++,h+=3){let p=n+d/e*i;c.x=t*Math.cos(p),c.y=t*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/t+1)/2,u.y=(a[h+1]/t+1)/2,l.push(u.x,u.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new ne(a,3)),this.setAttribute("normal",new ne(o,3)),this.setAttribute("uv",new ne(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},_n=class s extends Te{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let u=[],d=[],h=[],p=[],g=0,y=[],m=n/2,f=0;M(),a===!1&&(t>0&&A(!0),e>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new ne(d,3)),this.setAttribute("normal",new ne(h,3)),this.setAttribute("uv",new ne(p,2));function M(){let b=new P,w=new P,S=0,T=(e-t)/n;for(let x=0;x<=r;x++){let E=[],C=x/r,U=C*(e-t)+t;for(let F=0;F<=i;F++){let H=F/i,D=H*l+o,V=Math.sin(D),Y=Math.cos(D);w.x=U*V,w.y=-C*n+m,w.z=U*Y,d.push(w.x,w.y,w.z),b.set(V,T,Y).normalize(),h.push(b.x,b.y,b.z),p.push(H,1-C),E.push(g++)}y.push(E)}for(let x=0;x<i;x++)for(let E=0;E<r;E++){let C=y[E][x],U=y[E+1][x],F=y[E+1][x+1],H=y[E][x+1];(t>0||E!==0)&&(u.push(C,U,H),S+=3),(e>0||E!==r-1)&&(u.push(U,F,H),S+=3)}c.addGroup(f,S,0),f+=S}function A(b){let w=g,S=new Lt,T=new P,x=0,E=b===!0?t:e,C=b===!0?1:-1;for(let F=1;F<=i;F++)d.push(0,m*C,0),h.push(0,C,0),p.push(.5,.5),g++;let U=g;for(let F=0;F<=i;F++){let D=F/i*l+o,V=Math.cos(D),Y=Math.sin(D);T.x=E*Y,T.y=m*C,T.z=E*V,d.push(T.x,T.y,T.z),h.push(0,C,0),S.x=V*.5+.5,S.y=Y*.5*C+.5,p.push(S.x,S.y),g++}for(let F=0;F<i;F++){let H=w+F,D=U+F;b===!0?u.push(D,D+1,H):u.push(D+1,D,H),x+=3}c.addGroup(f,x,b===!0?1:2),f+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Qi=class s extends _n{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Fr=class s extends Te{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};let r=[],a=[];o(i),c(n),u(),this.setAttribute("position",new ne(r,3)),this.setAttribute("normal",new ne(r.slice(),3)),this.setAttribute("uv",new ne(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(M){let A=new P,b=new P,w=new P;for(let S=0;S<e.length;S+=3)p(e[S+0],A),p(e[S+1],b),p(e[S+2],w),l(A,b,w,M)}function l(M,A,b,w){let S=w+1,T=[];for(let x=0;x<=S;x++){T[x]=[];let E=M.clone().lerp(b,x/S),C=A.clone().lerp(b,x/S),U=S-x;for(let F=0;F<=U;F++)F===0&&x===S?T[x][F]=E:T[x][F]=E.clone().lerp(C,F/U)}for(let x=0;x<S;x++)for(let E=0;E<2*(S-x)-1;E++){let C=Math.floor(E/2);E%2===0?(h(T[x][C+1]),h(T[x+1][C]),h(T[x][C])):(h(T[x][C+1]),h(T[x+1][C+1]),h(T[x+1][C]))}}function c(M){let A=new P;for(let b=0;b<r.length;b+=3)A.x=r[b+0],A.y=r[b+1],A.z=r[b+2],A.normalize().multiplyScalar(M),r[b+0]=A.x,r[b+1]=A.y,r[b+2]=A.z}function u(){let M=new P;for(let A=0;A<r.length;A+=3){M.x=r[A+0],M.y=r[A+1],M.z=r[A+2];let b=m(M)/2/Math.PI+.5,w=f(M)/Math.PI+.5;a.push(b,1-w)}g(),d()}function d(){for(let M=0;M<a.length;M+=6){let A=a[M+0],b=a[M+2],w=a[M+4],S=Math.max(A,b,w),T=Math.min(A,b,w);S>.9&&T<.1&&(A<.2&&(a[M+0]+=1),b<.2&&(a[M+2]+=1),w<.2&&(a[M+4]+=1))}}function h(M){r.push(M.x,M.y,M.z)}function p(M,A){let b=M*3;A.x=t[b+0],A.y=t[b+1],A.z=t[b+2]}function g(){let M=new P,A=new P,b=new P,w=new P,S=new Lt,T=new Lt,x=new Lt;for(let E=0,C=0;E<r.length;E+=9,C+=6){M.set(r[E+0],r[E+1],r[E+2]),A.set(r[E+3],r[E+4],r[E+5]),b.set(r[E+6],r[E+7],r[E+8]),S.set(a[C+0],a[C+1]),T.set(a[C+2],a[C+3]),x.set(a[C+4],a[C+5]),w.copy(M).add(A).add(b).divideScalar(3);let U=m(w);y(S,C+0,M,U),y(T,C+2,A,U),y(x,C+4,b,U)}}function y(M,A,b,w){w<0&&M.x===1&&(a[A]=M.x-1),b.x===0&&b.z===0&&(a[A]=w/2/Math.PI+.5)}function m(M){return Math.atan2(M.z,-M.x)}function f(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var ts=class s extends Fr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}};var He=class s extends Te{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,u=l+1,d=t/o,h=e/l,p=[],g=[],y=[],m=[];for(let f=0;f<u;f++){let M=f*h-a;for(let A=0;A<c;A++){let b=A*d-r;g.push(b,-M,0),y.push(0,0,1),m.push(A/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let M=0;M<o;M++){let A=M+c*f,b=M+c*(f+1),w=M+1+c*(f+1),S=M+1+c*f;p.push(A,b,S),p.push(b,w,S)}this.setIndex(p),this.setAttribute("position",new ne(g,3)),this.setAttribute("normal",new ne(y,3)),this.setAttribute("uv",new ne(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},Br=class s extends Te{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);let o=[],l=[],c=[],u=[],d=t,h=(e-t)/i,p=new P,g=new Lt;for(let y=0;y<=i;y++){for(let m=0;m<=n;m++){let f=r+m/n*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,u.push(g.x,g.y)}d+=h}for(let y=0;y<i;y++){let m=y*(n+1);for(let f=0;f<n;f++){let M=f+m,A=M,b=M+n+1,w=M+n+2,S=M+1;o.push(A,b,S),o.push(b,w,S)}}this.setIndex(o),this.setAttribute("position",new ne(l,3)),this.setAttribute("normal",new ne(c,3)),this.setAttribute("uv",new ne(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var un=class s extends Te{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],d=new P,h=new P,p=[],g=[],y=[],m=[];for(let f=0;f<=n;f++){let M=[],A=f/n,b=a+A*o,w=t*Math.cos(b),S=Math.sqrt(t*t-w*w),T=0;f===0&&a===0?T=.5/e:f===n&&l===Math.PI&&(T=-.5/e);for(let x=0;x<=e;x++){let E=x/e,C=i+E*r;d.x=-S*Math.cos(C),d.y=w,d.z=S*Math.sin(C),g.push(d.x,d.y,d.z),h.copy(d).normalize(),y.push(h.x,h.y,h.z),m.push(E+T,1-A),M.push(c++)}u.push(M)}for(let f=0;f<n;f++)for(let M=0;M<e;M++){let A=u[f][M+1],b=u[f][M],w=u[f+1][M],S=u[f+1][M+1];(f!==0||a>0)&&p.push(A,b,S),(f!==n-1||l<Math.PI)&&p.push(b,w,S)}this.setIndex(p),this.setAttribute("position",new ne(g,3)),this.setAttribute("normal",new ne(y,3)),this.setAttribute("uv",new ne(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Or=class s extends Fr{constructor(t=1,e=0){let n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],i=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,i,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},fi=class s extends Te{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],u=[],d=[],h=new P,p=new P,g=new P;for(let y=0;y<=n;y++){let m=a+y/n*o;for(let f=0;f<=i;f++){let M=f/i*r;p.x=(t+e*Math.cos(m))*Math.cos(M),p.y=(t+e*Math.cos(m))*Math.sin(M),p.z=e*Math.sin(m),c.push(p.x,p.y,p.z),h.x=t*Math.cos(M),h.y=t*Math.sin(M),g.subVectors(p,h).normalize(),u.push(g.x,g.y,g.z),d.push(f/i),d.push(y/n)}}for(let y=1;y<=n;y++)for(let m=1;m<=i;m++){let f=(i+1)*y+m-1,M=(i+1)*(y-1)+m-1,A=(i+1)*(y-1)+m,b=(i+1)*y+m;l.push(f,M,b),l.push(M,A,b)}this.setIndex(l),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function ss(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(nd(i))i.isRenderTargetTexture?(Pt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(nd(i[0])){let r=[];for(let a=0,o=i.length;a<o;a++)r[a]=i[a].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function Ze(s){let t={};for(let e=0;e<s.length;e++){let n=ss(s[e]);for(let i in n)t[i]=n[i]}return t}function nd(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function zp(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function nh(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$t.workingColorSpace}var qd={clone:ss,merge:Ze},Hp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Vp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,sn=class extends Pn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Hp,this.fragmentShader=Vp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ss(t.uniforms),this.uniformsGroups=zp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Dt().setHex(i.value);break;case"v2":this.uniforms[n].value=new Lt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new P().fromArray(i.value);break;case"v4":this.uniforms[n].value=new ge().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Nt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new ae().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},fo=class extends sn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Gt=class extends Pn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Dt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qr,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var kr=class extends Pn{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qr,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yn,this.combine=Co,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},po=class extends Pn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ld,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},mo=class extends Pn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Rs(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Ec(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Ci=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<i)){for(let o=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=e[++n],t<i)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let a=0;a!==i;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},go=class extends Ci{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Rc,endingEnd:Rc}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,a=t+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Cc:r=t,o=2*e-n;break;case Ic:r=i.length-2,o=e+i[r]-i[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Cc:a=t,l=2*n-e;break;case Ic:a=1,l=n+i[1]-i[0];break;default:a=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,p=this._weightNext,g=(n-e)/(i-e),y=g*g,m=y*g,f=-h*m+2*h*y-h*g,M=(1+h)*m+(-1.5-2*h)*y+(-.5+h)*g+1,A=(-1-p)*m+(1.5+p)*y+.5*g,b=p*m-p*y;for(let w=0;w!==o;++w)r[w]=f*a[u+w]+M*a[c+w]+A*a[l+w]+b*a[d+w];return r}},_o=class extends Ci{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(n-e)/(i-e),d=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*d+a[l+h]*u;return r}},xo=class extends Ci{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},yo=class extends Ci{interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(n-e)/(i-e),y=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*y+a[l+m]*g;return r}let h=o*2,p=t-1;for(let g=0;g!==o;++g){let y=a[c+g],m=a[l+g],f=p*h+g*2,M=d[f],A=d[f+1],b=t*h+g*2,w=u[b],S=u[b+1],T=Wp(n,e,M,w,i);r[g]=Yd(T,y,A,S,m)}return r}};function Yd(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function Gp(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function Wp(s,t,e,n,i){let r=(s-t)/(i-t);for(let a=0;a<8;a++){let o=Yd(r,t,e,n,i)-s;if(Math.abs(o)<1e-10)break;let l=Gp(r,t,e,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var xn=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Rs(e,this.TimeBufferType),this.values=Rs(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Rs(t.times,Array),values:Rs(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),Ec(t.settings)&&(n.settings={inTangents:Rs(t.settings.inTangents,Array),outTangents:Rs(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new xo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new _o(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new go(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new yo(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case gr:e=this.InterpolantFactoryMethodDiscrete;break;case so:e=this.InterpolantFactoryMethodLinear;break;case Ya:e=this.InterpolantFactoryMethodSmooth;break;case Ac:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gr;case this.InterpolantFactoryMethodLinear:return so;case this.InterpolantFactoryMethodSmooth:return Ya;case this.InterpolantFactoryMethodBezier:return Ac}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;Ec(this.settings)&&(id(this.settings.inTangents,t),id(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,a=i-1;for(;r!==i&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(It("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(It("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){It("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){It("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(i!==void 0&&yp(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){It("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Ya,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(i)l=!0;else{let d=o*n,h=d-n,p=d+n;for(let g=0;g!==n;++g){let y=e[d+g];if(y!==e[h+g]||y!==e[p+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*n,h=a*n;for(let p=0;p!==n;++p)e[h+p]=e[d+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,Ec(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function id(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}xn.prototype.ValueTypeName="";xn.prototype.TimeBufferType=Float32Array;xn.prototype.ValueBufferType=Float32Array;xn.prototype.DefaultInterpolation=so;var Ii=class extends xn{constructor(t,e,n){super(t,e,n)}};Ii.prototype.ValueTypeName="bool";Ii.prototype.ValueBufferType=Array;Ii.prototype.DefaultInterpolation=gr;Ii.prototype.InterpolantFactoryMethodLinear=void 0;Ii.prototype.InterpolantFactoryMethodSmooth=void 0;var vo=class extends xn{constructor(t,e,n,i){super(t,e,n,i)}};vo.prototype.ValueTypeName="color";var bo=class extends xn{constructor(t,e,n,i){super(t,e,n,i)}};bo.prototype.ValueTypeName="number";var So=class extends Ci{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(i-e),c=t*o;for(let u=c+o;c!==u;c+=4)qn.slerpFlat(r,0,a,c-o,a,c,l);return r}},zr=class extends xn{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new So(this.times,this.values,this.getValueSize(),t)}};zr.prototype.ValueTypeName="quaternion";zr.prototype.InterpolantFactoryMethodSmooth=void 0;var Pi=class extends xn{constructor(t,e,n){super(t,e,n)}};Pi.prototype.ValueTypeName="string";Pi.prototype.ValueBufferType=Array;Pi.prototype.DefaultInterpolation=gr;Pi.prototype.InterpolantFactoryMethodLinear=void 0;Pi.prototype.InterpolantFactoryMethodSmooth=void 0;var Mo=class extends xn{constructor(t,e,n,i){super(t,e,n,i)}};Mo.prototype.ValueTypeName="vector";var wo=class{constructor(t,e,n){let i=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&i.onStart!==void 0&&i.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,i.onProgress!==void 0&&i.onProgress(u,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Zd=new wo,Eo=class{constructor(t){this.manager=t!==void 0?t:Zd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Eo.DEFAULT_MATERIAL_NAME="__DEFAULT";var ks=class extends Ee{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Dt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Hr=class extends ks{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Dt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Tc=new ae,sd=new P,rd=new P,Vr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Lt(512,512),this.mapType=dn,this.map=null,this.mapPass=null,this.matrix=new ae,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Os,this._frameExtents=new Lt(1,1),this._viewportCount=1,this._viewports=[new ge(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;sd.setFromMatrixPosition(t.matrixWorld),e.position.copy(sd),rd.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(rd),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){Tc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Tc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=i?i.z/r.x:1,o=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;t.coordinateSystem===Ds||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Tc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},$a=new P,qa=new qn,Vn=new P,Gr=class extends Ee{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ae,this.projectionMatrix=new ae,this.projectionMatrixInverse=new ae,this.coordinateSystem=In,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose($a,qa,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($a,qa,Vn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose($a,qa,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($a,qa,Vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ti=new P,ad=new Lt,od=new Lt,ke=class extends Gr{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ro*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ic*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ro*2*Math.atan(Math.tan(ic*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ti.x,Ti.y).multiplyScalar(-t/Ti.z),Ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ti.x,Ti.y).multiplyScalar(-t/Ti.z)}getViewSize(t,e){return this.getViewBounds(t,ad,od),e.subVectors(od,ad)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(ic*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Lc=class extends Vr{constructor(){super(new ke(90,1,.5,500)),this.isPointLightShadow=!0}},Jn=class extends ks{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Lc}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},zs=class extends Gr{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Dc=class extends Vr{constructor(){super(new zs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Hs=class extends ks{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.target=new Ee,this.shadow=new Dc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Cs=-90,Is=1,To=class extends Ee{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new ke(Cs,Is,t,e);i.layers=this.layers,this.add(i);let r=new ke(Cs,Is,t,e);r.layers=this.layers,this.add(r);let a=new ke(Cs,Is,t,e);a.layers=this.layers,this.add(a);let o=new ke(Cs,Is,t,e);o.layers=this.layers,this.add(o);let l=new ke(Cs,Is,t,e);l.layers=this.layers,this.add(l);let c=new ke(Cs,Is,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===In)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ds)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,d=t.getRenderTarget(),h=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=y,t.setRenderTarget(n,5,i),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(d,h,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ao=class extends ke{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var ih="\\[\\]\\.:\\/",Xp=new RegExp("["+ih+"]","g"),sh="[^"+ih+"]",$p="[^"+ih.replace("\\.","")+"]",qp=/((?:WC+[\/:])*)/.source.replace("WC",sh),Yp=/(WCOD+)?/.source.replace("WCOD",$p),Zp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",sh),Jp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",sh),Kp=new RegExp("^"+qp+Yp+Zp+Jp+"$"),jp=["material","materials","bones","map"],Nc=class{constructor(t,e,n){let i=n||fe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},fe=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Xp,"")}static parseTrackName(t){let e=Kp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);jp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Pt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){It("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){It("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){It("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){It("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){It("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){It("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){It("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[i];if(a===void 0){let c=e.nodeName;It("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){It("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){It("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};fe.Composite=Nc;fe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};fe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};fe.prototype.GetterByBindingType=[fe.prototype._getValue_direct,fe.prototype._getValue_array,fe.prototype._getValue_arrayElement,fe.prototype._getValue_toArray];fe.prototype.SetterByBindingTypeAndVersioning=[[fe.prototype._setValue_direct,fe.prototype._setValue_direct_setNeedsUpdate,fe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_array,fe.prototype._setValue_array_setNeedsUpdate,fe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_arrayElement,fe.prototype._setValue_arrayElement_setNeedsUpdate,fe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_fromArray,fe.prototype._setValue_fromArray_setNeedsUpdate,fe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Dy=new Float32Array(1);var hh=class hh{constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};hh.prototype.isMatrix2=!0;var Uc=hh;function rh(s,t,e,n){let i=Qp(n);switch(e){case jc:return s*t;case Fo:return s*t/i.components*i.byteLength;case Bo:return s*t/i.components*i.byteLength;case Bi:return s*t*2/i.components*i.byteLength;case Oo:return s*t*2/i.components*i.byteLength;case Qc:return s*t*3/i.components*i.byteLength;case wn:return s*t*4/i.components*i.byteLength;case ko:return s*t*4/i.components*i.byteLength;case qr:case Yr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Zr:case Jr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ho:case Go:return Math.max(s,16)*Math.max(t,8)/4;case zo:case Vo:return Math.max(s,8)*Math.max(t,8)/2;case Wo:case Xo:case qo:case Yo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case $o:case Kr:case Zo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Jo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ko:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case jo:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Qo:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case tl:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case el:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case nl:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case il:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case sl:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case rl:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case al:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case ol:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case ll:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case cl:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case hl:case ul:case dl:return Math.ceil(s/4)*Math.ceil(t/4)*16;case fl:case pl:return Math.ceil(s/4)*Math.ceil(t/4)*8;case jr:case ml:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Qp(s){switch(s){case dn:case Yc:return{byteLength:1,components:1};case Gs:case Zc:case Nn:return{byteLength:2,components:1};case No:case Uo:return{byteLength:2,components:4};case Dn:case Do:case Mn:return{byteLength:4,components:1};case Jc:case Kc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Pt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function xf(){let s=null,t=!1,e=null,n=null;function i(r,a){n=s.requestAnimationFrame(i),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function em(s){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,d=c.byteLength,h=s.createBuffer();s.bindBuffer(l,h),s.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=s.SHORT;else if(c instanceof Uint32Array)p=s.UNSIGNED_INT;else if(c instanceof Int32Array)p=s.INT;else if(c instanceof Int8Array)p=s.BYTE;else if(c instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let u=l.array,d=l.updateRanges;if(s.bindBuffer(c,o),d.length===0)s.bufferSubData(c,0,u);else{d.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<d.length;p++){let g=d[h],y=d[p];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++h,d[h]=y)}d.length=h+1;for(let p=0,g=d.length;p<g;p++){let y=d[p];s.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var nm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,im=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,sm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,rm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,am=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,om=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,cm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,um=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,fm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,pm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,mm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,gm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,_m=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,xm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ym=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,bm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Sm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Mm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,wm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Em=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Tm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Am=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Rm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Cm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Im=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Pm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Lm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Dm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Nm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Um=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Fm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Bm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Om=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,km=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Hm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Wm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Xm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$m=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,qm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Ym=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Zm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Jm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Km=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,jm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Qm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,t0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,e0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,n0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,i0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,s0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,r0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,a0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,o0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,l0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,c0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,h0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,u0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,d0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,f0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,p0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,m0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,g0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,x0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,y0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,v0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,b0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,S0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,M0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,w0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,E0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,T0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,A0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,R0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,C0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,I0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,P0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,L0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,D0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,N0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,U0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,F0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,B0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,O0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,k0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,z0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,H0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,V0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,G0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,W0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,X0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,$0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,q0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Y0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Z0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,J0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,K0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,j0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Q0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,eg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ng=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ig=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ag=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,og=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,cg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,hg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ug=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,fg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,_g=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,bg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Mg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,wg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Eg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ag=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Cg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ig=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Pg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Dg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ng=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ug=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kt={alphahash_fragment:nm,alphahash_pars_fragment:im,alphamap_fragment:sm,alphamap_pars_fragment:rm,alphatest_fragment:am,alphatest_pars_fragment:om,aomap_fragment:lm,aomap_pars_fragment:cm,batching_pars_vertex:hm,batching_vertex:um,begin_vertex:dm,beginnormal_vertex:fm,bsdfs:pm,iridescence_fragment:mm,bumpmap_pars_fragment:gm,clipping_planes_fragment:_m,clipping_planes_pars_fragment:xm,clipping_planes_pars_vertex:ym,clipping_planes_vertex:vm,color_fragment:bm,color_pars_fragment:Sm,color_pars_vertex:Mm,color_vertex:wm,common:Em,cube_uv_reflection_fragment:Tm,defaultnormal_vertex:Am,displacementmap_pars_vertex:Rm,displacementmap_vertex:Cm,emissivemap_fragment:Im,emissivemap_pars_fragment:Pm,colorspace_fragment:Lm,colorspace_pars_fragment:Dm,envmap_fragment:Nm,envmap_common_pars_fragment:Um,envmap_pars_fragment:Fm,envmap_pars_vertex:Bm,envmap_physical_pars_fragment:Ym,envmap_vertex:Om,fog_vertex:km,fog_pars_vertex:zm,fog_fragment:Hm,fog_pars_fragment:Vm,gradientmap_pars_fragment:Gm,lightmap_pars_fragment:Wm,lights_lambert_fragment:Xm,lights_lambert_pars_fragment:$m,lights_pars_begin:qm,lights_toon_fragment:Zm,lights_toon_pars_fragment:Jm,lights_phong_fragment:Km,lights_phong_pars_fragment:jm,lights_physical_fragment:Qm,lights_physical_pars_fragment:t0,lights_fragment_begin:e0,lights_fragment_maps:n0,lights_fragment_end:i0,lightprobes_pars_fragment:s0,logdepthbuf_fragment:r0,logdepthbuf_pars_fragment:a0,logdepthbuf_pars_vertex:o0,logdepthbuf_vertex:l0,map_fragment:c0,map_pars_fragment:h0,map_particle_fragment:u0,map_particle_pars_fragment:d0,metalnessmap_fragment:f0,metalnessmap_pars_fragment:p0,morphinstance_vertex:m0,morphcolor_vertex:g0,morphnormal_vertex:_0,morphtarget_pars_vertex:x0,morphtarget_vertex:y0,normal_fragment_begin:v0,normal_fragment_maps:b0,normal_pars_fragment:S0,normal_pars_vertex:M0,normal_vertex:w0,normalmap_pars_fragment:E0,clearcoat_normal_fragment_begin:T0,clearcoat_normal_fragment_maps:A0,clearcoat_pars_fragment:R0,iridescence_pars_fragment:C0,opaque_fragment:I0,packing:P0,premultiplied_alpha_fragment:L0,project_vertex:D0,dithering_fragment:N0,dithering_pars_fragment:U0,roughnessmap_fragment:F0,roughnessmap_pars_fragment:B0,shadowmap_pars_fragment:O0,shadowmap_pars_vertex:k0,shadowmap_vertex:z0,shadowmask_pars_fragment:H0,skinbase_vertex:V0,skinning_pars_vertex:G0,skinning_vertex:W0,skinnormal_vertex:X0,specularmap_fragment:$0,specularmap_pars_fragment:q0,tonemapping_fragment:Y0,tonemapping_pars_fragment:Z0,transmission_fragment:J0,transmission_pars_fragment:K0,uv_pars_fragment:j0,uv_pars_vertex:Q0,uv_vertex:tg,worldpos_vertex:eg,background_vert:ng,background_frag:ig,backgroundCube_vert:sg,backgroundCube_frag:rg,cube_vert:ag,cube_frag:og,depth_vert:lg,depth_frag:cg,distance_vert:hg,distance_frag:ug,equirect_vert:dg,equirect_frag:fg,linedashed_vert:pg,linedashed_frag:mg,meshbasic_vert:gg,meshbasic_frag:_g,meshlambert_vert:xg,meshlambert_frag:yg,meshmatcap_vert:vg,meshmatcap_frag:bg,meshnormal_vert:Sg,meshnormal_frag:Mg,meshphong_vert:wg,meshphong_frag:Eg,meshphysical_vert:Tg,meshphysical_frag:Ag,meshtoon_vert:Rg,meshtoon_frag:Cg,points_vert:Ig,points_frag:Pg,shadow_vert:Lg,shadow_frag:Dg,sprite_vert:Ng,sprite_frag:Ug},ht={common:{diffuse:{value:new Dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Nt},alphaMap:{value:null},alphaMapTransform:{value:new Nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Nt}},envmap:{envMap:{value:null},envMapRotation:{value:new Nt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Nt},normalScale:{value:new Lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new Dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Nt},alphaTest:{value:0},uvTransform:{value:new Nt}},sprite:{diffuse:{value:new Dt(16777215)},opacity:{value:1},center:{value:new Lt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Nt},alphaMap:{value:null},alphaMapTransform:{value:new Nt},alphaTest:{value:0}}},Qn={basic:{uniforms:Ze([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.fog]),vertexShader:kt.meshbasic_vert,fragmentShader:kt.meshbasic_frag},lambert:{uniforms:Ze([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)},envMapIntensity:{value:1}}]),vertexShader:kt.meshlambert_vert,fragmentShader:kt.meshlambert_frag},phong:{uniforms:Ze([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)},specular:{value:new Dt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:kt.meshphong_vert,fragmentShader:kt.meshphong_frag},standard:{uniforms:Ze([ht.common,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.roughnessmap,ht.metalnessmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag},toon:{uniforms:Ze([ht.common,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.gradientmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)}}]),vertexShader:kt.meshtoon_vert,fragmentShader:kt.meshtoon_frag},matcap:{uniforms:Ze([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,{matcap:{value:null}}]),vertexShader:kt.meshmatcap_vert,fragmentShader:kt.meshmatcap_frag},points:{uniforms:Ze([ht.points,ht.fog]),vertexShader:kt.points_vert,fragmentShader:kt.points_frag},dashed:{uniforms:Ze([ht.common,ht.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:kt.linedashed_vert,fragmentShader:kt.linedashed_frag},depth:{uniforms:Ze([ht.common,ht.displacementmap]),vertexShader:kt.depth_vert,fragmentShader:kt.depth_frag},normal:{uniforms:Ze([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,{opacity:{value:1}}]),vertexShader:kt.meshnormal_vert,fragmentShader:kt.meshnormal_frag},sprite:{uniforms:Ze([ht.sprite,ht.fog]),vertexShader:kt.sprite_vert,fragmentShader:kt.sprite_frag},background:{uniforms:{uvTransform:{value:new Nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:kt.background_vert,fragmentShader:kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Nt}},vertexShader:kt.backgroundCube_vert,fragmentShader:kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:kt.cube_vert,fragmentShader:kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:kt.equirect_vert,fragmentShader:kt.equirect_frag},distance:{uniforms:Ze([ht.common,ht.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:kt.distance_vert,fragmentShader:kt.distance_frag},shadow:{uniforms:Ze([ht.lights,ht.fog,{color:{value:new Dt(0)},opacity:{value:1}}]),vertexShader:kt.shadow_vert,fragmentShader:kt.shadow_frag}};Qn.physical={uniforms:Ze([Qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Nt},clearcoatNormalScale:{value:new Lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Nt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Nt},sheen:{value:0},sheenColor:{value:new Dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Nt},transmissionSamplerSize:{value:new Lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Nt},attenuationDistance:{value:0},attenuationColor:{value:new Dt(0)},specularColor:{value:new Dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Nt},anisotropyVector:{value:new Lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Nt}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag};var xl={r:0,b:0,g:0},Fg=new ae,yf=new Nt;yf.set(-1,0,0,0,1,0,0,0,1);function Bg(s,t,e,n,i,r){let a=new Dt(0),o=i===!0?0:1,l,c,u=null,d=0,h=null;function p(M){let A=M.isScene===!0?M.background:null;if(A&&A.isTexture){let b=M.backgroundBlurriness>0;A=t.get(A,b)}return A}function g(M){let A=!1,b=p(M);b===null?m(a,o):b&&b.isColor&&(m(b,1),A=!0);let w=s.xr.getEnvironmentBlendMode();w==="additive"?e.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function y(M,A){let b=p(A);b&&(b.isCubeTexture||b.mapping===Xr)?(c===void 0&&(c=new Rt(new Be(1,1,1),new sn({name:"BackgroundCubeMaterial",uniforms:ss(Qn.backgroundCube.uniforms),vertexShader:Qn.backgroundCube.vertexShader,fragmentShader:Qn.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,S,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Fg.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(yf),c.material.toneMapped=$t.getTransfer(b.colorSpace)!==ee,(u!==b||d!==b.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,u=b,d=b.version,h=s.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Rt(new He(2,2),new sn({name:"BackgroundMaterial",uniforms:ss(Qn.background.uniforms),vertexShader:Qn.background.vertexShader,fragmentShader:Qn.background.fragmentShader,side:Li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=$t.getTransfer(b.colorSpace)!==ee,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(u!==b||d!==b.version||h!==s.toneMapping)&&(l.material.needsUpdate=!0,u=b,d=b.version,h=s.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,A){M.getRGB(xl,nh(s)),e.buffers.color.setClear(xl.r,xl.g,xl.b,A,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,A=1){a.set(M),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:g,addToRenderList:y,dispose:f}}function Og(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null),r=i,a=!1;function o(U,F,H,D,V){let Y=!1,Z=d(U,D,H,F);r!==Z&&(r=Z,c(r.object)),Y=p(U,D,H,V),Y&&g(U,D,H,V),V!==null&&t.update(V,s.ELEMENT_ARRAY_BUFFER),(Y||a)&&(a=!1,b(U,F,H,D),V!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function l(){return s.createVertexArray()}function c(U){return s.bindVertexArray(U)}function u(U){return s.deleteVertexArray(U)}function d(U,F,H,D){let V=D.wireframe===!0,Y=n[F.id];Y===void 0&&(Y={},n[F.id]=Y);let Z=U.isInstancedMesh===!0?U.id:0,nt=Y[Z];nt===void 0&&(nt={},Y[Z]=nt);let X=nt[H.id];X===void 0&&(X={},nt[H.id]=X);let Q=X[V];return Q===void 0&&(Q=h(l()),X[V]=Q),Q}function h(U){let F=[],H=[],D=[];for(let V=0;V<e;V++)F[V]=0,H[V]=0,D[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:H,attributeDivisors:D,object:U,attributes:{},index:null}}function p(U,F,H,D){let V=r.attributes,Y=F.attributes,Z=0,nt=H.getAttributes();for(let X in nt)if(nt[X].location>=0){let et=V[X],At=Y[X];if(At===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&(At=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&(At=U.instanceColor)),et===void 0||et.attribute!==At||At&&et.data!==At.data)return!0;Z++}return r.attributesNum!==Z||r.index!==D}function g(U,F,H,D){let V={},Y=F.attributes,Z=0,nt=H.getAttributes();for(let X in nt)if(nt[X].location>=0){let et=Y[X];et===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&(et=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&(et=U.instanceColor));let At={};At.attribute=et,et&&et.data&&(At.data=et.data),V[X]=At,Z++}r.attributes=V,r.attributesNum=Z,r.index=D}function y(){let U=r.newAttributes;for(let F=0,H=U.length;F<H;F++)U[F]=0}function m(U){f(U,0)}function f(U,F){let H=r.newAttributes,D=r.enabledAttributes,V=r.attributeDivisors;H[U]=1,D[U]===0&&(s.enableVertexAttribArray(U),D[U]=1),V[U]!==F&&(s.vertexAttribDivisor(U,F),V[U]=F)}function M(){let U=r.newAttributes,F=r.enabledAttributes;for(let H=0,D=F.length;H<D;H++)F[H]!==U[H]&&(s.disableVertexAttribArray(H),F[H]=0)}function A(U,F,H,D,V,Y,Z){Z===!0?s.vertexAttribIPointer(U,F,H,V,Y):s.vertexAttribPointer(U,F,H,D,V,Y)}function b(U,F,H,D){y();let V=D.attributes,Y=H.getAttributes(),Z=F.defaultAttributeValues;for(let nt in Y){let X=Y[nt];if(X.location>=0){let Q=V[nt];if(Q===void 0&&(nt==="instanceMatrix"&&U.instanceMatrix&&(Q=U.instanceMatrix),nt==="instanceColor"&&U.instanceColor&&(Q=U.instanceColor)),Q!==void 0){let et=Q.normalized,At=Q.itemSize,Et=t.get(Q);if(Et===void 0)continue;let le=Et.buffer,Yt=Et.type,jt=Et.bytesPerElement,$=Yt===s.INT||Yt===s.UNSIGNED_INT||Q.gpuType===Do;if(Q.isInterleavedBufferAttribute){let j=Q.data,_t=j.stride,Ut=Q.offset;if(j.isInstancedInterleavedBuffer){for(let mt=0;mt<X.locationSize;mt++)f(X.location+mt,j.meshPerAttribute);U.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let mt=0;mt<X.locationSize;mt++)m(X.location+mt);s.bindBuffer(s.ARRAY_BUFFER,le);for(let mt=0;mt<X.locationSize;mt++)A(X.location+mt,At/X.locationSize,Yt,et,_t*jt,(Ut+At/X.locationSize*mt)*jt,$)}else{if(Q.isInstancedBufferAttribute){for(let j=0;j<X.locationSize;j++)f(X.location+j,Q.meshPerAttribute);U.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let j=0;j<X.locationSize;j++)m(X.location+j);s.bindBuffer(s.ARRAY_BUFFER,le);for(let j=0;j<X.locationSize;j++)A(X.location+j,At/X.locationSize,Yt,et,At*jt,At/X.locationSize*j*jt,$)}}else if(Z!==void 0){let et=Z[nt];if(et!==void 0)switch(et.length){case 2:s.vertexAttrib2fv(X.location,et);break;case 3:s.vertexAttrib3fv(X.location,et);break;case 4:s.vertexAttrib4fv(X.location,et);break;default:s.vertexAttrib1fv(X.location,et)}}}}M()}function w(){E();for(let U in n){let F=n[U];for(let H in F){let D=F[H];for(let V in D){let Y=D[V];for(let Z in Y)u(Y[Z].object),delete Y[Z];delete D[V]}}delete n[U]}}function S(U){if(n[U.id]===void 0)return;let F=n[U.id];for(let H in F){let D=F[H];for(let V in D){let Y=D[V];for(let Z in Y)u(Y[Z].object),delete Y[Z];delete D[V]}}delete n[U.id]}function T(U){for(let F in n){let H=n[F];for(let D in H){let V=H[D];if(V[U.id]===void 0)continue;let Y=V[U.id];for(let Z in Y)u(Y[Z].object),delete Y[Z];delete V[U.id]}}}function x(U){for(let F in n){let H=n[F],D=U.isInstancedMesh===!0?U.id:0,V=H[D];if(V!==void 0){for(let Y in V){let Z=V[Y];for(let nt in Z)u(Z[nt].object),delete Z[nt];delete V[Y]}delete H[D],Object.keys(H).length===0&&delete n[F]}}}function E(){C(),a=!0,r!==i&&(r=i,c(r.object))}function C(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:E,resetDefaultState:C,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:T,initAttributes:y,enableAttribute:m,disableUnusedAttributes:M}}function kg(s,t,e){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,u){u!==0&&(s.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let p=0;p<u;p++)h+=c[p];e.update(h,n,1)}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function zg(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(T){return!(T!==wn&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(T){let x=T===Nn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==dn&&T!==Mn&&!x&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(T){if(T==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(Pt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&Pt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),f=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),A=s.getParameter(s.MAX_VARYING_VECTORS),b=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),w=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:M,maxVaryings:A,maxFragmentUniforms:b,maxSamples:w,samples:S}}function Hg(s){let t=this,e=null,n=0,i=!1,r=!1,a=new Cn,o=new Nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let p=d.length!==0||h||n!==0||i;return i=h,n=d.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){e=u(d,h,0)},this.setState=function(d,h,p){let g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,f=s.get(d);if(!i||g===null||g.length===0||r&&!m)r?u(null):c();else{let M=r?0:n,A=M*4,b=f.clippingState||null;l.value=b,b=u(g,h,A,p);for(let w=0;w!==A;++w)b[w]=e[w];f.clippingState=b,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(d,h,p,g){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let f=p+y*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<f)&&(m=new Float32Array(f));for(let A=0,b=p;A!==y;++A,b+=4)a.copy(d[A]).applyMatrix4(M,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,m}}var $s=4,Vg=6,Gg=20,Wg=256,ta=new zs,Jd=new Dt,uh=null,dh=0,fh=0,ph=!1,Xg=new P,rs=new P,Ys=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,r={}){let{size:a=256,position:o=Xg}=r;uh=this._renderer.getRenderTarget(),dh=this._renderer.getActiveCubeFace(),fh=this._renderer.getActiveMipmapLevel(),ph=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=jd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(uh,dh,fh),this._renderer.xr.enabled=ph,t.scissorTest=!1,Xs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ni||t.mapping===is?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),uh=this._renderer.getRenderTarget(),dh=this._renderer.getActiveCubeFace(),fh=this._renderer.getActiveMipmapLevel(),ph=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:ze,minFilter:ze,generateMipmaps:!1,type:Nn,format:wn,colorSpace:_r,depthBuffer:!1},i=Kd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Kd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=$g(r)),this._blurMaterial=Yg(r,t,e),this._ggxMaterial=qg(r,t,e)}return i}_compileMaterial(t){let e=new Rt(new Te,t);this._renderer.compile(e,ta)}_sceneToCubeUV(t,e,n,i,r){let l=new ke(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,p=d.toneMapping;d.getClearColor(Jd),d.toneMapping=Ln,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(i),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Rt(new Be,new Ye({name:"PMREM.Background",side:Ve,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,m=y.material,f=!1,M=t.background;M?M.isColor&&(m.color.copy(M),t.background=null,f=!0):(m.color.copy(Jd),f=!0);for(let A=0;A<6;A++){let b=A%3;b===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[A],r.y,r.z)):b===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[A]));let w=this._cubeSize;Xs(i,b*w,A>2?w:0,w,w),d.setRenderTarget(i),f&&d.render(y,l),d.render(t,l)}d.toneMapping=p,d.autoClear=h,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===Ni||t.mapping===is;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=jd());let r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;Xs(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,ta)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=c*1.25,p=d*h,{_lodMax:g}=this,y=this._sizeLods[n],m=3*y*(n>g-$s?n-g+$s:0),f=4*(this._cubeSize-y);l.envMap.value=t.texture,l.roughness.value=p,l.mipInt.value=g-e,Xs(r,m,f,3*y,2*y),i.setRenderTarget(r),i.render(o,ta),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Xs(t,m,f,3*y,2*y),i.setRenderTarget(t),i.render(o,ta)}_blur(t,e,n,i){let r=this._pingPongRenderTarget,a=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,i,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[i];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[i],d=3*u*(i>this._lodMax-$s?i-this._lodMax+$s:0),h=4*(this._cubeSize-u);Xs(e,d,h,3*u,2*u),a.setRenderTarget(e),a.render(l,ta)}};function $g(s){let t=[],e=[],n=s,i=s-$s+1+Vg;for(let r=0;r<i;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,h=6,p=3,g=new Float32Array(p*h*d),y=new Float32Array(p*h*d);for(let f=0;f<d;f++){let M=f%3*2/3-1,A=f>2?0:-1,b=[M,A,0,M+2/3,A,0,M+2/3,A+1,0,M,A,0,M+2/3,A+1,0,M,A+1,0];g.set(b,p*h*f);for(let w=0;w<h;w++){let S=u[w*2]*2-1,T=u[w*2+1]*2-1;f===0?rs.set(1,T,S):f===1?rs.set(-S,1,-T):f===2?rs.set(-S,T,1):f===3?rs.set(-1,T,-S):f===4?rs.set(-S,-1,T):rs.set(S,T,-1),rs.toArray(y,(f*h+w)*p)}}let m=new Te;m.setAttribute("position",new Pe(g,p)),m.setAttribute("outputDirection",new Pe(y,p)),e.push(new Rt(m,null)),n>$s&&n--}return{lodMeshes:e,sizeLods:t}}function Kd(s,t,e){let n=new hn(s,t,e);return n.texture.mapping=Xr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Xs(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function qg(s,t,e){return new sn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Wg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Sl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Yg(s,t,e){return new sn({name:"SphericalGaussianBlur",defines:{SAMPLES:Gg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Sl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function jd(){return new sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Qd(){return new sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Sl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var vl=class extends hn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Dr(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Be(5,5,5),r=new sn({name:"CubemapFromEquirect",uniforms:ss(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ve,blending:Kn});r.uniforms.tEquirect.value=e;let a=new Rt(i,r),o=e.minFilter;return e.minFilter===Ui&&(e.minFilter=ze),new To(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}};function Zg(s){let t=new WeakMap,e=new WeakMap,n=null;function i(h,p=!1){return h==null?null:p?a(h):r(h)}function r(h){if(h&&h.isTexture){let p=h.mapping;if(p===Io||p===Po)if(t.has(h)){let g=t.get(h).texture;return o(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let y=new vl(g.height);return y.fromEquirectangularTexture(s,h),t.set(h,y),h.addEventListener("dispose",c),o(y.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let p=h.mapping,g=p===Io||p===Po,y=p===Ni||p===is;if(g||y){let m=e.get(h),f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return n===null&&(n=new Ys(s)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),m.texture;if(m!==void 0)return m.texture;{let M=h.image;return g&&M&&M.height>0||y&&M&&l(M)?(n===null&&(n=new Ys(s)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,p){return p===Io?h.mapping=Ni:p===Po&&(h.mapping=is),h}function l(h){let p=0,g=6;for(let y=0;y<g;y++)h[y]!==void 0&&p++;return p===g}function c(h){let p=h.target;p.removeEventListener("dispose",c);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function u(h){let p=h.target;p.removeEventListener("dispose",u);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:d}}function Jg(s){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=s.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&Ji("WebGLRenderer: "+n+" extension not supported."),i}}}function Kg(s,t,e,n){let i={},r=new WeakMap;function a(d){let h=d.target;h.index!==null&&t.remove(h.index);for(let g in h.attributes)t.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete i[h.id];let p=r.get(h);p&&(t.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(d,h){return i[h.id]===!0||(h.addEventListener("dispose",a),i[h.id]=!0,e.memory.geometries++),h}function l(d){let h=d.attributes;for(let p in h)t.update(h[p],s.ARRAY_BUFFER)}function c(d){let h=[],p=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(p!==null){let M=p.array;y=p.version;for(let A=0,b=M.length;A<b;A+=3){let w=M[A+0],S=M[A+1],T=M[A+2];h.push(w,S,S,T,T,w)}}else{let M=g.array;y=g.version;for(let A=0,b=M.length/3-1;A<b;A+=3){let w=A+0,S=A+1,T=A+2;h.push(w,S,S,T,T,w)}}let m=new(g.count>=65535?Er:wr)(h,1);m.version=y;let f=r.get(d);f&&t.remove(f),r.set(d,m)}function u(d){let h=r.get(d);if(h){let p=d.index;p!==null&&h.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function jg(s,t,e){let n;function i(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,h){s.drawElements(n,h,r,d*a),e.update(h,n,1)}function c(d,h,p){p!==0&&(s.drawElementsInstanced(n,h,r,d*a,p),e.update(h,n,p))}function u(d,h,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,p);let y=0;for(let m=0;m<p;m++)y+=h[m];e.update(y,n,1)}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Qg(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:It("WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function t_(s,t,e){let n=new WeakMap,i=new ge;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==d){let E=function(){T.dispose(),n.delete(o),o.removeEventListener("dispose",E)};h!==void 0&&h.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],A=0;p===!0&&(A=1),g===!0&&(A=2),y===!0&&(A=3);let b=o.attributes.position.count*A,w=1;b>t.maxTextureSize&&(w=Math.ceil(b/t.maxTextureSize),b=t.maxTextureSize);let S=new Float32Array(b*w*4*d),T=new br(S,b,w,d);T.type=Mn,T.needsUpdate=!0;let x=A*4;for(let C=0;C<d;C++){let U=m[C],F=f[C],H=M[C],D=b*w*4*C;for(let V=0;V<U.count;V++){let Y=V*x;p===!0&&(i.fromBufferAttribute(U,V),S[D+Y+0]=i.x,S[D+Y+1]=i.y,S[D+Y+2]=i.z,S[D+Y+3]=0),g===!0&&(i.fromBufferAttribute(F,V),S[D+Y+4]=i.x,S[D+Y+5]=i.y,S[D+Y+6]=i.z,S[D+Y+7]=0),y===!0&&(i.fromBufferAttribute(H,V),S[D+Y+8]=i.x,S[D+Y+9]=i.y,S[D+Y+10]=i.z,S[D+Y+11]=H.itemSize===4?i.w:1)}}h={count:d,texture:T,size:new Lt(b,w)},n.set(o,h),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function e_(s,t,e,n,i){let r=new WeakMap;function a(c){let u=i.render.frame,d=c.geometry,h=t.get(c,d);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var n_={[Hc]:"LINEAR_TONE_MAPPING",[Vc]:"REINHARD_TONE_MAPPING",[Gc]:"CINEON_TONE_MAPPING",[Wr]:"ACES_FILMIC_TONE_MAPPING",[Xc]:"AGX_TONE_MAPPING",[$c]:"NEUTRAL_TONE_MAPPING",[Wc]:"CUSTOM_TONE_MAPPING"};function i_(s,t,e,n,i,r){let a=new hn(t,e,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Te;c.setAttribute("position",new ne([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new ne([0,2,0,0,2,0],2));let u=new fo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Rt(c,u),h=new zs(-1,1,1,-1,0,1),p=null,g=null,y=!1,m,f=null,M=[],A=!1;this.setSize=function(b,w){a.setSize(b,w),o!==null&&o.setSize(b,w),l!==null&&l.setSize(b,w);for(let S=0;S<M.length;S++){let T=M[S];T.setSize&&T.setSize(b,w)}},this.setEffects=function(b){M=b,A=M.length>0&&M[0].isRenderPass===!0;let w=a.width,S=a.height;M.length>0&&o===null&&(o=new hn(w,S,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),l=new hn(w,S,{type:Nn,depthBuffer:!1,stencilBuffer:!1}));for(let T=0;T<M.length;T++){let x=M[T];x.setSize&&x.setSize(w,S)}},this.begin=function(b,w){if(y||b.toneMapping===Ln&&M.length===0)return!1;if(f=w,w!==null){let S=w.width,T=w.height;(a.width!==S||a.height!==T)&&this.setSize(S,T)}return A===!1&&b.setRenderTarget(a),m=b.toneMapping,b.toneMapping=Ln,!0},this.hasRenderPass=function(){return A},this.end=function(b,w){b.toneMapping=m,y=!0;let S=a,T=o;for(let x=0;x<M.length;x++){let E=M[x];E.enabled!==!1&&(E.render(b,T,S,w),E.needsSwap!==!1&&(S=T,T=T===o?l:o))}if(p!==b.outputColorSpace||g!==b.toneMapping){p=b.outputColorSpace,g=b.toneMapping,u.defines={},$t.getTransfer(p)===ee&&(u.defines.SRGB_TRANSFER="");let x=n_[g];x&&(u.defines[x]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=S.texture,b.setRenderTarget(f),b.render(d,h),f=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var vf=new nn,_h=new Ri(1,1),bf=new br,Sf=new lo,Mf=new Dr,tf=[],ef=[],nf=new Float32Array(16),sf=new Float32Array(9),rf=new Float32Array(4);function Zs(s,t,e){let n=s[0];if(n<=0||n>0)return s;let i=t*e,r=tf[i];if(r===void 0&&(r=new Float32Array(i),tf[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function Le(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function De(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Ml(s,t){let e=ef[t];e===void 0&&(e=new Int32Array(t),ef[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function s_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function r_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;s.uniform2fv(this.addr,t),De(e,t)}}function a_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Le(e,t))return;s.uniform3fv(this.addr,t),De(e,t)}}function o_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;s.uniform4fv(this.addr,t),De(e,t)}}function l_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),De(e,t)}else{if(Le(e,n))return;rf.set(n),s.uniformMatrix2fv(this.addr,!1,rf),De(e,n)}}function c_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),De(e,t)}else{if(Le(e,n))return;sf.set(n),s.uniformMatrix3fv(this.addr,!1,sf),De(e,n)}}function h_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),De(e,t)}else{if(Le(e,n))return;nf.set(n),s.uniformMatrix4fv(this.addr,!1,nf),De(e,n)}}function u_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function d_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;s.uniform2iv(this.addr,t),De(e,t)}}function f_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Le(e,t))return;s.uniform3iv(this.addr,t),De(e,t)}}function p_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;s.uniform4iv(this.addr,t),De(e,t)}}function m_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function g_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;s.uniform2uiv(this.addr,t),De(e,t)}}function __(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Le(e,t))return;s.uniform3uiv(this.addr,t),De(e,t)}}function x_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;s.uniform4uiv(this.addr,t),De(e,t)}}function y_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(_h.compareFunction=e.isReversedDepthBuffer()?_l:gl,r=_h):r=vf,e.setTexture2D(t||r,i)}function v_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Sf,i)}function b_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Mf,i)}function S_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||bf,i)}function M_(s){switch(s){case 5126:return s_;case 35664:return r_;case 35665:return a_;case 35666:return o_;case 35674:return l_;case 35675:return c_;case 35676:return h_;case 5124:case 35670:return u_;case 35667:case 35671:return d_;case 35668:case 35672:return f_;case 35669:case 35673:return p_;case 5125:return m_;case 36294:return g_;case 36295:return __;case 36296:return x_;case 35678:case 36198:case 36298:case 36306:case 35682:return y_;case 35679:case 36299:case 36307:return v_;case 35680:case 36300:case 36308:case 36293:return b_;case 36289:case 36303:case 36311:case 36292:return S_}}function w_(s,t){s.uniform1fv(this.addr,t)}function E_(s,t){let e=Zs(t,this.size,2);s.uniform2fv(this.addr,e)}function T_(s,t){let e=Zs(t,this.size,3);s.uniform3fv(this.addr,e)}function A_(s,t){let e=Zs(t,this.size,4);s.uniform4fv(this.addr,e)}function R_(s,t){let e=Zs(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function C_(s,t){let e=Zs(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function I_(s,t){let e=Zs(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function P_(s,t){s.uniform1iv(this.addr,t)}function L_(s,t){s.uniform2iv(this.addr,t)}function D_(s,t){s.uniform3iv(this.addr,t)}function N_(s,t){s.uniform4iv(this.addr,t)}function U_(s,t){s.uniform1uiv(this.addr,t)}function F_(s,t){s.uniform2uiv(this.addr,t)}function B_(s,t){s.uniform3uiv(this.addr,t)}function O_(s,t){s.uniform4uiv(this.addr,t)}function k_(s,t,e){let n=this.cache,i=t.length,r=Ml(e,i);Le(n,r)||(s.uniform1iv(this.addr,r),De(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=_h:a=vf;for(let o=0;o!==i;++o)e.setTexture2D(t[o]||a,r[o])}function z_(s,t,e){let n=this.cache,i=t.length,r=Ml(e,i);Le(n,r)||(s.uniform1iv(this.addr,r),De(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||Sf,r[a])}function H_(s,t,e){let n=this.cache,i=t.length,r=Ml(e,i);Le(n,r)||(s.uniform1iv(this.addr,r),De(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||Mf,r[a])}function V_(s,t,e){let n=this.cache,i=t.length,r=Ml(e,i);Le(n,r)||(s.uniform1iv(this.addr,r),De(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||bf,r[a])}function G_(s){switch(s){case 5126:return w_;case 35664:return E_;case 35665:return T_;case 35666:return A_;case 35674:return R_;case 35675:return C_;case 35676:return I_;case 5124:case 35670:return P_;case 35667:case 35671:return L_;case 35668:case 35672:return D_;case 35669:case 35673:return N_;case 5125:return U_;case 36294:return F_;case 36295:return B_;case 36296:return O_;case 35678:case 36198:case 36298:case 36306:case 35682:return k_;case 35679:case 36299:case 36307:return z_;case 35680:case 36300:case 36308:case 36293:return H_;case 36289:case 36303:case 36311:case 36292:return V_}}var xh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=M_(e.type)}},yh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=G_(e.type)}},vh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let r=0,a=i.length;r!==a;++r){let o=i[r];o.setValue(t,e[o.id],n)}}},mh=/(\w+)(\])?(\[|\.)?/g;function af(s,t){s.seq.push(t),s.map[t.id]=t}function W_(s,t,e){let n=s.name,i=n.length;for(mh.lastIndex=0;;){let r=mh.exec(n),a=mh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){af(e,c===void 0?new xh(o,s,t):new yh(o,s,t));break}else{let d=e.map[o];d===void 0&&(d=new vh(o),af(e,d)),e=d}}}var qs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);W_(o,l,this)}let i=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(t,e,n,i){let r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,r=t.length;i!==r;++i){let a=t[i];a.id in e&&n.push(a)}return n}};function of(s,t,e){let n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}var X_=37297,$_=0;function q_(s,t){let e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var lf=new Nt;function Y_(s){$t._getMatrix(lf,$t.workingColorSpace,s);let t=`mat3( ${lf.elements.map(e=>e.toFixed(4))} )`;switch($t.getTransfer(s)){case xr:return[t,"LinearTransferOETF"];case ee:return[t,"sRGBTransferOETF"];default:return Pt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function cf(s,t,e){let n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+q_(s.getShaderSource(t),o)}else return r}function Z_(s,t){let e=Y_(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var J_={[Hc]:"Linear",[Vc]:"Reinhard",[Gc]:"Cineon",[Wr]:"ACESFilmic",[Xc]:"AgX",[$c]:"Neutral",[Wc]:"Custom"};function K_(s,t){let e=J_[t];return e===void 0?(Pt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var yl=new P;function j_(){$t.getLuminanceCoefficients(yl);let s=yl.x.toFixed(4),t=yl.y.toFixed(4),e=yl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Q_(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(na).join(`
`)}function tx(s){let t=[];for(let e in s){let n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function ex(s,t){let e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(t,i),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function na(s){return s!==""}function hf(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function uf(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var nx=/^[ \t]*#include +<([\w\d./]+)>/gm;function bh(s){return s.replace(nx,sx)}var ix=new Map;function sx(s,t){let e=kt[t];if(e===void 0){let n=ix.get(t);if(n!==void 0)e=kt[n],Pt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return bh(e)}var rx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function df(s){return s.replace(rx,ax)}function ax(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ff(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var ox={[es]:"SHADOWMAP_TYPE_PCF",[Vs]:"SHADOWMAP_TYPE_VSM"};function lx(s){return ox[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var cx={[Ni]:"ENVMAP_TYPE_CUBE",[is]:"ENVMAP_TYPE_CUBE",[Xr]:"ENVMAP_TYPE_CUBE_UV"};function hx(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":cx[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var ux={[is]:"ENVMAP_MODE_REFRACTION"};function dx(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":ux[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var fx={[Co]:"ENVMAP_BLENDING_MULTIPLY",[Cd]:"ENVMAP_BLENDING_MIX",[Id]:"ENVMAP_BLENDING_ADD"};function px(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":fx[s.combine]||"ENVMAP_BLENDING_NONE"}function mx(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function gx(s,t,e,n){let i=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=lx(e),c=hx(e),u=dx(e),d=px(e),h=mx(e),p=Q_(e),g=tx(r),y=i.createProgram(),m,f,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(na).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(na).join(`
`),f.length>0&&(f+=`
`)):(m=[ff(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(na).join(`
`),f=[ff(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ln?"#define TONE_MAPPING":"",e.toneMapping!==Ln?kt.tonemapping_pars_fragment:"",e.toneMapping!==Ln?K_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",kt.colorspace_pars_fragment,Z_("linearToOutputTexel",e.outputColorSpace),j_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(na).join(`
`)),a=bh(a),a=hf(a,e),a=uf(a,e),o=bh(o),o=hf(o,e),o=uf(o,e),a=df(a),o=df(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===eh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===eh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let A=M+m+a,b=M+f+o,w=of(i,i.VERTEX_SHADER,A),S=of(i,i.FRAGMENT_SHADER,b);i.attachShader(y,w),i.attachShader(y,S),e.index0AttributeName!==void 0?i.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(y,0,"position"),i.linkProgram(y);function T(U){if(s.debug.checkShaderErrors){let F=i.getProgramInfoLog(y)||"",H=i.getShaderInfoLog(w)||"",D=i.getShaderInfoLog(S)||"",V=F.trim(),Y=H.trim(),Z=D.trim(),nt=!0,X=!0;if(i.getProgramParameter(y,i.LINK_STATUS)===!1)if(nt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,y,w,S);else{let Q=cf(i,w,"vertex"),et=cf(i,S,"fragment");It("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(y,i.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+V+`
`+Q+`
`+et)}else V!==""?Pt("WebGLProgram: Program Info Log:",V):(Y===""||Z==="")&&(X=!1);X&&(U.diagnostics={runnable:nt,programLog:V,vertexShader:{log:Y,prefix:m},fragmentShader:{log:Z,prefix:f}})}i.deleteShader(w),i.deleteShader(S),x=new qs(i,y),E=ex(i,y)}let x;this.getUniforms=function(){return x===void 0&&T(this),x};let E;this.getAttributes=function(){return E===void 0&&T(this),E};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=i.getProgramParameter(y,X_)),C},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=$_++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=w,this.fragmentShader=S,this}var _x=0,Sh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Mh(t),e.set(t,n)),n}},Mh=class{constructor(t){this.id=_x++,this.code=t,this.usedTimes=0}};function xx(s){return s===Bi||s===Kr||s===jr}function yx(s,t,e,n,i,r){let a=new Sr,o=new Sh,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function y(x,E,C,U,F,H){let D=U.fog,V=F.geometry,Y=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?U.environment:null,Z=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,nt=t.get(x.envMap||Y,Z),X=nt&&nt.mapping===Xr?nt.image.height:null,Q=p[x.type];x.precision!==null&&(h=n.getMaxPrecision(x.precision),h!==x.precision&&Pt("WebGLProgram.getParameters:",x.precision,"not supported, using",h,"instead."));let et=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,At=et!==void 0?et.length:0,Et=0;V.morphAttributes.position!==void 0&&(Et=1),V.morphAttributes.normal!==void 0&&(Et=2),V.morphAttributes.color!==void 0&&(Et=3);let le,Yt,jt,$;if(Q){let he=Qn[Q];le=he.vertexShader,Yt=he.fragmentShader}else{le=x.vertexShader,Yt=x.fragmentShader;let he=o.getVertexShaderStage(x),Qt=o.getFragmentShaderStage(x);o.update(x,he,Qt),jt=he.id,$=Qt.id}let j=s.getRenderTarget(),_t=s.state.buffers.depth.getReversed(),Ut=F.isInstancedMesh===!0,mt=F.isBatchedMesh===!0,zt=!!x.map,Ae=!!x.matcap,Ht=!!nt,Kt=!!x.aoMap,ce=!!x.lightMap,Wt=!!x.bumpMap&&x.wireframe===!1,pe=!!x.normalMap,Ne=!!x.displacementMap,rn=!!x.emissiveMap,_e=!!x.metalnessMap,Se=!!x.roughnessMap,N=x.anisotropy>0,Ge=x.clearcoat>0,ie=x.dispersion>0,R=x.retroreflectivity>0,_=x.iridescence>0,B=x.sheen>0,z=x.transmission>0,W=N&&!!x.anisotropyMap,it=Ge&&!!x.clearcoatMap,st=Ge&&!!x.clearcoatNormalMap,q=Ge&&!!x.clearcoatRoughnessMap,K=_&&!!x.iridescenceMap,rt=_&&!!x.iridescenceThicknessMap,Mt=B&&!!x.sheenColorMap,ct=B&&!!x.sheenRoughnessMap,at=!!x.specularMap,wt=!!x.specularColorMap,Ct=!!x.specularIntensityMap,Bt=z&&!!x.transmissionMap,L=z&&!!x.thicknessMap,ot=!!x.gradientMap,J=!!x.alphaMap,lt=x.alphaTest>0,ft=!!x.alphaHash,tt=!!x.extensions,Tt=Ln;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Tt=s.toneMapping);let bt={shaderID:Q,shaderType:x.type,shaderName:x.name,vertexShader:le,fragmentShader:Yt,defines:x.defines,customVertexShaderID:jt,customFragmentShaderID:$,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:h,batching:mt,batchingColor:mt&&F._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&F.instanceColor!==null,instancingMorph:Ut&&F.morphTexture!==null,outputColorSpace:j===null?s.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:$t.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:zt,matcap:Ae,envMap:Ht,envMapMode:Ht&&nt.mapping,envMapCubeUVHeight:X,aoMap:Kt,lightMap:ce,bumpMap:Wt,normalMap:pe,displacementMap:Ne,emissiveMap:rn,normalMapObjectSpace:pe&&x.normalMapType===Dd,normalMapTangentSpace:pe&&x.normalMapType===Qr,packedNormalMap:pe&&x.normalMapType===Qr&&xx(x.normalMap.format),metalnessMap:_e,roughnessMap:Se,anisotropy:N,anisotropyMap:W,clearcoat:Ge,clearcoatMap:it,clearcoatNormalMap:st,clearcoatRoughnessMap:q,dispersion:ie,retroreflection:R,iridescence:_,iridescenceMap:K,iridescenceThicknessMap:rt,sheen:B,sheenColorMap:Mt,sheenRoughnessMap:ct,specularMap:at,specularColorMap:wt,specularIntensityMap:Ct,transmission:z,transmissionMap:Bt,thicknessMap:L,gradientMap:ot,opaque:x.transparent===!1&&x.blending===Di&&x.alphaToCoverage===!1,alphaMap:J,alphaTest:lt,alphaHash:ft,combine:x.combine,mapUv:zt&&g(x.map.channel),aoMapUv:Kt&&g(x.aoMap.channel),lightMapUv:ce&&g(x.lightMap.channel),bumpMapUv:Wt&&g(x.bumpMap.channel),normalMapUv:pe&&g(x.normalMap.channel),displacementMapUv:Ne&&g(x.displacementMap.channel),emissiveMapUv:rn&&g(x.emissiveMap.channel),metalnessMapUv:_e&&g(x.metalnessMap.channel),roughnessMapUv:Se&&g(x.roughnessMap.channel),anisotropyMapUv:W&&g(x.anisotropyMap.channel),clearcoatMapUv:it&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:st&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:q&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:rt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Mt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ct&&g(x.sheenRoughnessMap.channel),specularMapUv:at&&g(x.specularMap.channel),specularColorMapUv:wt&&g(x.specularColorMap.channel),specularIntensityMapUv:Ct&&g(x.specularIntensityMap.channel),transmissionMapUv:Bt&&g(x.transmissionMap.channel),thicknessMapUv:L&&g(x.thicknessMap.channel),alphaMapUv:J&&g(x.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(pe||N),vertexNormals:!!V.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!V.attributes.uv&&(zt||J),fog:!!D,useFog:x.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||V.attributes.normal===void 0&&pe===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:_t,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:At,morphTextureStride:Et,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&C.length>0,shadowMapType:s.shadowMap.type,toneMapping:Tt,decodeVideoTexture:zt&&x.map.isVideoTexture===!0&&$t.getTransfer(x.map.colorSpace)===ee,decodeVideoTextureEmissive:rn&&x.emissiveMap.isVideoTexture===!0&&$t.getTransfer(x.emissiveMap.colorSpace)===ee,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===yn,flipSided:x.side===Ve,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:tt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(tt&&x.extensions.multiDraw===!0||mt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return bt.vertexUv1s=l.has(1),bt.vertexUv2s=l.has(2),bt.vertexUv3s=l.has(3),l.clear(),bt}function m(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)E.push(C),E.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(f(E,x),M(E,x),E.push(s.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function f(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numSunLights),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numSunLightShadows),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function M(x,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function A(x){let E=p[x.type],C;if(E){let U=Qn[E];C=qd.clone(U.uniforms)}else C=x.uniforms;return C}function b(x,E){let C=u.get(E);return C!==void 0?++C.usedTimes:(C=new gx(s,E,x,i),c.push(C),u.set(E,C)),C}function w(x){if(--x.usedTimes===0){let E=c.indexOf(x);c[E]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function S(x){o.remove(x)}function T(){o.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:A,acquireProgram:b,releaseProgram:w,releaseShaderCache:S,programs:c,dispose:T}}function vx(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function bx(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function pf(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function mf(){let s=[],t=0,e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,g,y,m,f){let M=s[t];return M===void 0?(M={id:h.id,object:h,geometry:p,material:g,materialVariant:a(h),groupOrder:y,renderOrder:h.renderOrder,z:m,group:f},s[t]=M):(M.id=h.id,M.object=h,M.geometry=p,M.material=g,M.materialVariant=a(h),M.groupOrder=y,M.renderOrder=h.renderOrder,M.z=m,M.group=f),t++,M}function l(h,p,g,y,m,f,M){M.reversedDepth===!0&&(m=-m);let A=o(h,p,g,y,m,f);g.transmission>0?n.push(A):g.transparent===!0?i.push(A):e.push(A)}function c(h,p,g,y,m,f){let M=o(h,p,g,y,m,f);g.transmission>0?n.unshift(M):g.transparent===!0?i.unshift(M):e.unshift(M)}function u(h,p){e.length>1&&e.sort(h||bx),n.length>1&&n.sort(p||pf),i.length>1&&i.sort(p||pf)}function d(){for(let h=t,p=s.length;h<p;h++){let g=s[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:d,sort:u}}function Sx(){let s=new WeakMap;function t(n,i){let r=s.get(n),a;return r===void 0?(a=new mf,s.set(n,[a])):i>=r.length?(a=new mf,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function Mx(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new P,color:new Dt};break;case"SpotLight":e={position:new P,direction:new P,color:new Dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new Dt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new Dt,groundColor:new Dt};break;case"RectAreaLight":e={color:new Dt,position:new P,halfWidth:new P,halfHeight:new P};break}return s[t.id]=e,e}}}function wx(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var Ex=0;function Tx(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function Ax(s){let t=new Mx,e=wx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);let i=new P,r=new ae,a=new ae;function o(c){let u=0,d=0,h=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let p=0,g=0,y=0,m=0,f=0,M=0,A=0,b=0,w=0,S=0,T=0,x=0,E=0,C=0;c.sort(Tx);for(let F=0,H=c.length;F<H;F++){let D=c[F],V=D.color,Y=D.intensity,Z=D.distance,nt=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===Bi?nt=D.shadow.map.texture:nt=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=V.r*Y,d+=V.g*Y,h+=V.b*Y;else if(D.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(D.sh.coefficients[X],Y);C++}else if(D.isSunLight){let X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Q=D.shadow,et=e.get(D);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),n.sunShadow[g]=et,n.sunShadowMap[g]=nt;let At=Q.getViewportCount();for(let Et=0;Et<At;Et++)n.sunShadowMatrix[y+Et]=Q.getMatrix(Et),n.sunShadowCascade[y+Et]=Q._cascadeData[Et];y+=At,g++}n.sun[p]=X,p++}else if(D.isDirectionalLight){let X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Q=D.shadow,et=e.get(D);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,n.directionalShadow[m]=et,n.directionalShadowMap[m]=nt,n.directionalShadowMatrix[m]=D.shadow.matrix,w++}n.directional[m]=X,m++}else if(D.isSpotLight){let X=t.get(D);X.position.setFromMatrixPosition(D.matrixWorld),X.color.copy(V).multiplyScalar(Y),X.distance=Z,X.coneCos=Math.cos(D.angle),X.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),X.decay=D.decay,n.spot[M]=X;let Q=D.shadow;if(D.map&&(n.spotLightMap[x]=D.map,x++,Q.updateMatrices(D),D.castShadow&&E++),n.spotLightMatrix[M]=Q.matrix,D.castShadow){let et=e.get(D);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,n.spotShadow[M]=et,n.spotShadowMap[M]=nt,T++}M++}else if(D.isRectAreaLight){let X=t.get(D);X.color.copy(V).multiplyScalar(Y),X.halfWidth.set(D.width*.5,0,0),X.halfHeight.set(0,D.height*.5,0),n.rectArea[A]=X,A++}else if(D.isPointLight){let X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),X.distance=D.distance,X.decay=D.decay,D.castShadow){let Q=D.shadow,et=e.get(D);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,et.shadowCameraNear=Q.camera.near,et.shadowCameraFar=Q.camera.far,n.pointShadow[f]=et,n.pointShadowMap[f]=nt,n.pointShadowMatrix[f]=D.shadow.matrix,S++}n.point[f]=X,f++}else if(D.isHemisphereLight){let X=t.get(D);X.skyColor.copy(D.color).multiplyScalar(Y),X.groundColor.copy(D.groundColor).multiplyScalar(Y),n.hemi[b]=X,b++}}A>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ht.LTC_FLOAT_1,n.rectAreaLTC2=ht.LTC_FLOAT_2):(n.rectAreaLTC1=ht.LTC_HALF_1,n.rectAreaLTC2=ht.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let U=n.hash;(U.sunLength!==p||U.directionalLength!==m||U.pointLength!==f||U.spotLength!==M||U.rectAreaLength!==A||U.hemiLength!==b||U.numSunShadows!==g||U.numDirectionalShadows!==w||U.numPointShadows!==S||U.numSpotShadows!==T||U.numSpotMaps!==x||U.numLightProbes!==C)&&(n.sun.length=p,n.directional.length=m,n.spot.length=M,n.rectArea.length=A,n.point.length=f,n.hemi.length=b,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=T,n.spotShadowMap.length=T,n.spotLightMatrix.length=T+x-E,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=C,U.sunLength=p,U.directionalLength=m,U.pointLength=f,U.spotLength=M,U.rectAreaLength=A,U.hemiLength=b,U.numSunShadows=g,U.numDirectionalShadows=w,U.numPointShadows=S,U.numSpotShadows=T,U.numSpotMaps=x,U.numLightProbes=C,n.version=Ex++)}function l(c,u){let d=0,h=0,p=0,g=0,y=0,m=0,f=u.matrixWorldInverse;for(let M=0,A=c.length;M<A;M++){let b=c[M];if(b.isSunLight){let w=n.sun[d];w.direction.setFromMatrixPosition(b.matrixWorld),w.direction.transformDirection(f),d++}else if(b.isDirectionalLight){let w=n.directional[h];w.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),w.direction.sub(i),w.direction.transformDirection(f),h++}else if(b.isSpotLight){let w=n.spot[g];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(f),w.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),w.direction.sub(i),w.direction.transformDirection(f),g++}else if(b.isRectAreaLight){let w=n.rectArea[y];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(f),a.identity(),r.copy(b.matrixWorld),r.premultiply(f),a.extractRotation(r),w.halfWidth.set(b.width*.5,0,0),w.halfHeight.set(0,b.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),y++}else if(b.isPointLight){let w=n.point[p];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(f),p++}else if(b.isHemisphereLight){let w=n.hemi[m];w.direction.setFromMatrixPosition(b.matrixWorld),w.direction.transformDirection(f),m++}}}return{setup:o,setupView:l,state:n}}function gf(s){let t=new Ax(s),e=[],n=[],i=[];function r(h){d.camera=h,e.length=0,n.length=0,i.length=0}function a(h){e.push(h)}function o(h){n.push(h)}function l(h){i.push(h)}function c(){t.setup(e)}function u(h){t.setupView(e,h)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Rx(s){let t=new WeakMap;function e(i,r=0){let a=t.get(i),o;return a===void 0?(o=new gf(s),t.set(i,[o])):r>=a.length?(o=new gf(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Cx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ix=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Px=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Lx=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],_f=new ae,ea=new P,gh=new P;function Dx(s,t,e){let n=new Os,i=new Lt,r=new Lt,a=new ge,o=new po,l=new mo,c={},u=e.maxTextureSize,d={[Li]:Ve,[Ve]:Li,[yn]:yn},h=new sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Lt},radius:{value:4}},vertexShader:Cx,fragmentShader:Ix}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let g=new Te;g.setAttribute("position",new Pe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Rt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=es;let f=this.type;this.render=function(S,T,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===hd&&(Pt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=es);let E=s.getRenderTarget(),C=s.getActiveCubeFace(),U=s.getActiveMipmapLevel(),F=s.state;F.setBlending(Kn),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let H=f!==this.type;H&&T.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(V=>V.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,V=S.length;D<V;D++){let Y=S[D],Z=Y.shadow;if(Z===void 0){Pt("WebGLShadowMap:",Y,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;i.copy(Z.mapSize);let nt=Z.getFrameExtents();i.multiply(nt),r.copy(Z.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/nt.x),i.x=r.x*nt.x,Z.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/nt.y),i.y=r.y*nt.y,Z.mapSize.y=r.y));let X=s.state.buffers.depth.getReversed();if(Z.camera._reversedDepth=X,Z.map===null||H===!0){if(Z.map!==null&&(Z.map.depthTexture!==null&&(Z.map.depthTexture.dispose(),Z.map.depthTexture=null),Z.map.dispose()),this.type===Vs){if(Y.isPointLight){Pt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Z.map=new hn(i.x,i.y,{format:Bi,type:Nn,minFilter:ze,magFilter:ze,generateMipmaps:!1}),Z.map.texture.name=Y.name+".shadowMap",Z.map.depthTexture=new Ri(i.x,i.y,Mn),Z.map.depthTexture.name=Y.name+".shadowMapDepth",Z.map.depthTexture.format=Xn,Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=Fe,Z.map.depthTexture.magFilter=Fe}else Y.isPointLight?(Z.map=new vl(i.x),Z.map.depthTexture=new uo(i.x,Dn)):(Z.map=new hn(i.x,i.y),Z.map.depthTexture=new Ri(i.x,i.y,Dn)),Z.map.depthTexture.name=Y.name+".shadowMap",Z.map.depthTexture.format=Xn,this.type===es?(Z.map.depthTexture.compareFunction=X?_l:gl,Z.map.depthTexture.minFilter=ze,Z.map.depthTexture.magFilter=ze):(Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=Fe,Z.map.depthTexture.magFilter=Fe);Z.camera.updateProjectionMatrix()}Z.map.isWebGLCubeRenderTarget!==!0&&(Z.map.width!==i.x||Z.map.height!==i.y)&&Z.map.setSize(i.x,i.y);let Q=Z.map.isWebGLCubeRenderTarget?6:Z.getViewportCount();Y.isPointLight!==!0&&Z.updateMatrices(Y,x);for(let et=0;et<Q;et++){let At=Z.getCamera(et);if(Y.isPointLight){let Et=Z.camera,le=Z.matrix,Yt=Y.distance||Et.far;Yt!==Et.far&&(Et.far=Yt,Et.updateProjectionMatrix()),ea.setFromMatrixPosition(Y.matrixWorld),Et.position.copy(ea),gh.copy(Et.position),gh.add(Px[et]),Et.up.copy(Lx[et]),Et.lookAt(gh),Et.updateMatrixWorld(),le.makeTranslation(-ea.x,-ea.y,-ea.z),_f.multiplyMatrices(Et.projectionMatrix,Et.matrixWorldInverse),Z._frustum.setFromProjectionMatrix(_f,Et.coordinateSystem,Et.reversedDepth)}if(Z.map.isWebGLCubeRenderTarget)s.setRenderTarget(Z.map,et),s.clear();else{et===0&&(s.setRenderTarget(Z.map),s.clear());let Et=Z.getViewport(et);a.set(r.x*Et.x,r.y*Et.y,r.x*Et.z,r.y*Et.w),F.viewport(a)}n=Z.getFrustum(et),b(T,x,At,Y,this.type)}Z.isPointLightShadow!==!0&&this.type===Vs&&M(Z,x),Z.needsUpdate=!1}f=this.type,m.needsUpdate=!1,s.setRenderTarget(E,C,U)};function M(S,T){let x=t.update(y);h.defines.VSM_SAMPLES!==S.blurSamples&&(h.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null?S.mapPass=new hn(i.x,i.y,{format:Bi,type:Nn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),h.uniforms.shadow_pass.value=S.map.depthTexture,h.uniforms.resolution.value.set(S.map.width,S.map.height),h.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(T,null,x,h,y,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value.set(S.map.width,S.map.height),p.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(T,null,x,p,y,null)}function A(S,T,x,E){let C=null,U=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(U!==void 0)C=U;else if(C=x.isPointLight===!0?l:o,s.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let F=C.uuid,H=T.uuid,D=c[F];D===void 0&&(D={},c[F]=D);let V=D[H];V===void 0&&(V=C.clone(),D[H]=V,T.addEventListener("dispose",w)),C=V}if(C.visible=T.visible,C.wireframe=T.wireframe,E===Vs?C.side=T.shadowSide!==null?T.shadowSide:T.side:C.side=T.shadowSide!==null?T.shadowSide:d[T.side],C.alphaMap=T.alphaMap,C.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,C.map=T.map,C.clipShadows=T.clipShadows,C.clippingPlanes=T.clippingPlanes,C.clipIntersection=T.clipIntersection,C.displacementMap=T.displacementMap,C.displacementScale=T.displacementScale,C.displacementBias=T.displacementBias,C.wireframeLinewidth=T.wireframeLinewidth,C.linewidth=T.linewidth,x.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let F=s.properties.get(C);F.light=x}return C}function b(S,T,x,E,C){if(S.visible===!1)return;if(S.layers.test(T.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&C===Vs)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let H=t.update(S),D=S.material;if(Array.isArray(D)){let V=H.groups;for(let Y=0,Z=V.length;Y<Z;Y++){let nt=V[Y],X=D[nt.materialIndex];if(X&&X.visible){let Q=A(S,X,E,C);S.onBeforeShadow(s,S,T,x,H,Q,nt),s.renderBufferDirect(x,null,H,Q,S,nt),S.onAfterShadow(s,S,T,x,H,Q,nt)}}}else if(D.visible){let V=A(S,D,E,C);S.onBeforeShadow(s,S,T,x,H,V,null),s.renderBufferDirect(x,null,H,V,S,null),S.onAfterShadow(s,S,T,x,H,V,null)}}let F=S.children;for(let H=0,D=F.length;H<D;H++)b(F[H],T,x,E,C)}function w(S){S.target.removeEventListener("dispose",w);for(let x in c){let E=c[x],C=S.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function Nx(s,t){function e(){let L=!1,ot=new ge,J=null,lt=new ge(0,0,0,0);return{setMask:function(ft){J!==ft&&!L&&(s.colorMask(ft,ft,ft,ft),J=ft)},setLocked:function(ft){L=ft},setClear:function(ft,tt,Tt,bt,he){he===!0&&(ft*=bt,tt*=bt,Tt*=bt),ot.set(ft,tt,Tt,bt),lt.equals(ot)===!1&&(s.clearColor(ft,tt,Tt,bt),lt.copy(ot))},reset:function(){L=!1,J=null,lt.set(-1,0,0,0)}}}function n(){let L=!1,ot=!1,J=null,lt=null,ft=null;return{setReversed:function(tt){if(ot!==tt){let Tt=t.get("EXT_clip_control");tt?Tt.clipControlEXT(Tt.LOWER_LEFT_EXT,Tt.ZERO_TO_ONE_EXT):Tt.clipControlEXT(Tt.LOWER_LEFT_EXT,Tt.NEGATIVE_ONE_TO_ONE_EXT),ot=tt;let bt=ft;ft=null,this.setClear(bt)}},getReversed:function(){return ot},setTest:function(tt){tt?j(s.DEPTH_TEST):_t(s.DEPTH_TEST)},setMask:function(tt){J!==tt&&!L&&(s.depthMask(tt),J=tt)},setFunc:function(tt){if(ot&&(tt=Wd[tt]),lt!==tt){switch(tt){case Ja:s.depthFunc(s.NEVER);break;case Ka:s.depthFunc(s.ALWAYS);break;case ja:s.depthFunc(s.LESS);break;case Ls:s.depthFunc(s.LEQUAL);break;case Qa:s.depthFunc(s.EQUAL);break;case to:s.depthFunc(s.GEQUAL);break;case eo:s.depthFunc(s.GREATER);break;case no:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}lt=tt}},setLocked:function(tt){L=tt},setClear:function(tt){ft!==tt&&(ft=tt,ot&&(tt=1-tt),s.clearDepth(tt))},reset:function(){L=!1,J=null,lt=null,ft=null,ot=!1}}}function i(){let L=!1,ot=null,J=null,lt=null,ft=null,tt=null,Tt=null,bt=null,he=null;return{setTest:function(Qt){L||(Qt?j(s.STENCIL_TEST):_t(s.STENCIL_TEST))},setMask:function(Qt){ot!==Qt&&!L&&(s.stencilMask(Qt),ot=Qt)},setFunc:function(Qt,En,Fn){(J!==Qt||lt!==En||ft!==Fn)&&(s.stencilFunc(Qt,En,Fn),J=Qt,lt=En,ft=Fn)},setOp:function(Qt,En,Fn){(tt!==Qt||Tt!==En||bt!==Fn)&&(s.stencilOp(Qt,En,Fn),tt=Qt,Tt=En,bt=Fn)},setLocked:function(Qt){L=Qt},setClear:function(Qt){he!==Qt&&(s.clearStencil(Qt),he=Qt)},reset:function(){L=!1,ot=null,J=null,lt=null,ft=null,tt=null,Tt=null,bt=null,he=null}}}let r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap,u={},d={},h={},p=new WeakMap,g=[],y=null,m=!1,f=null,M=null,A=null,b=null,w=null,S=null,T=null,x=new Dt(0,0,0),E=0,C=!1,U=null,F=null,H=null,D=null,V=null,Y=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,nt=0,X=s.getParameter(s.VERSION);X.indexOf("WebGL")!==-1?(nt=parseFloat(/^WebGL (\d)/.exec(X)[1]),Z=nt>=1):X.indexOf("OpenGL ES")!==-1&&(nt=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),Z=nt>=2);let Q=null,et={},At=s.getParameter(s.SCISSOR_BOX),Et=s.getParameter(s.VIEWPORT),le=new ge().fromArray(At),Yt=new ge().fromArray(Et);function jt(L,ot,J,lt){let ft=new Uint8Array(4),tt=s.createTexture();s.bindTexture(L,tt),s.texParameteri(L,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(L,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Tt=0;Tt<J;Tt++)L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY?s.texImage3D(ot,0,s.RGBA,1,1,lt,0,s.RGBA,s.UNSIGNED_BYTE,ft):s.texImage2D(ot+Tt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ft);return tt}let $={};$[s.TEXTURE_2D]=jt(s.TEXTURE_2D,s.TEXTURE_2D,1),$[s.TEXTURE_CUBE_MAP]=jt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[s.TEXTURE_2D_ARRAY]=jt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),$[s.TEXTURE_3D]=jt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(s.DEPTH_TEST),a.setFunc(Ls),Wt(!1),pe(Fc),j(s.CULL_FACE),Kt(Kn);function j(L){u[L]!==!0&&(s.enable(L),u[L]=!0)}function _t(L){u[L]!==!1&&(s.disable(L),u[L]=!1)}function Ut(L,ot){return h[L]!==ot?(s.bindFramebuffer(L,ot),h[L]=ot,L===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=ot),L===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=ot),!0):!1}function mt(L,ot){let J=g,lt=!1;if(L){J=p.get(ot),J===void 0&&(J=[],p.set(ot,J));let ft=L.textures;if(J.length!==ft.length||J[0]!==s.COLOR_ATTACHMENT0){for(let tt=0,Tt=ft.length;tt<Tt;tt++)J[tt]=s.COLOR_ATTACHMENT0+tt;J.length=ft.length,lt=!0}}else J[0]!==s.BACK&&(J[0]=s.BACK,lt=!0);lt&&s.drawBuffers(J)}function zt(L){return y!==L?(s.useProgram(L),y=L,!0):!1}let Ae={[ns]:s.FUNC_ADD,[dd]:s.FUNC_SUBTRACT,[fd]:s.FUNC_REVERSE_SUBTRACT};Ae[pd]=s.MIN,Ae[md]=s.MAX;let Ht={[gd]:s.ZERO,[_d]:s.ONE,[xd]:s.SRC_COLOR,[kc]:s.SRC_ALPHA,[wd]:s.SRC_ALPHA_SATURATE,[Sd]:s.DST_COLOR,[vd]:s.DST_ALPHA,[yd]:s.ONE_MINUS_SRC_COLOR,[zc]:s.ONE_MINUS_SRC_ALPHA,[Md]:s.ONE_MINUS_DST_COLOR,[bd]:s.ONE_MINUS_DST_ALPHA,[Ed]:s.CONSTANT_COLOR,[Td]:s.ONE_MINUS_CONSTANT_COLOR,[Ad]:s.CONSTANT_ALPHA,[Rd]:s.ONE_MINUS_CONSTANT_ALPHA};function Kt(L,ot,J,lt,ft,tt,Tt,bt,he,Qt){if(L===Kn){m===!0&&(_t(s.BLEND),m=!1);return}if(m===!1&&(j(s.BLEND),m=!0),L!==ud){if(L!==f||Qt!==C){if((M!==ns||w!==ns)&&(s.blendEquation(s.FUNC_ADD),M=ns,w=ns),Qt)switch(L){case Di:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case pi:s.blendFunc(s.ONE,s.ONE);break;case Bc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Oc:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:It("WebGLState: Invalid blending: ",L);break}else switch(L){case Di:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case pi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Bc:It("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Oc:It("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:It("WebGLState: Invalid blending: ",L);break}A=null,b=null,S=null,T=null,x.set(0,0,0),E=0,f=L,C=Qt}return}ft=ft||ot,tt=tt||J,Tt=Tt||lt,(ot!==M||ft!==w)&&(s.blendEquationSeparate(Ae[ot],Ae[ft]),M=ot,w=ft),(J!==A||lt!==b||tt!==S||Tt!==T)&&(s.blendFuncSeparate(Ht[J],Ht[lt],Ht[tt],Ht[Tt]),A=J,b=lt,S=tt,T=Tt),(bt.equals(x)===!1||he!==E)&&(s.blendColor(bt.r,bt.g,bt.b,he),x.copy(bt),E=he),f=L,C=!1}function ce(L,ot){L.side===yn?_t(s.CULL_FACE):j(s.CULL_FACE);let J=L.side===Ve;ot&&(J=!J),Wt(J),L.blending===Di&&L.transparent===!1?Kt(Kn):Kt(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);let lt=L.stencilWrite;o.setTest(lt),lt&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),rn(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?j(s.SAMPLE_ALPHA_TO_COVERAGE):_t(s.SAMPLE_ALPHA_TO_COVERAGE)}function Wt(L){U!==L&&(L?s.frontFace(s.CW):s.frontFace(s.CCW),U=L)}function pe(L){L!==ld?(j(s.CULL_FACE),L!==F&&(L===Fc?s.cullFace(s.BACK):L===cd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):_t(s.CULL_FACE),F=L}function Ne(L){L!==H&&(Z&&s.lineWidth(L),H=L)}function rn(L,ot,J){L?(j(s.POLYGON_OFFSET_FILL),(D!==ot||V!==J)&&(D=ot,V=J,a.getReversed()&&(ot=-ot),s.polygonOffset(ot,J))):_t(s.POLYGON_OFFSET_FILL)}function _e(L){L?j(s.SCISSOR_TEST):_t(s.SCISSOR_TEST)}function Se(L){L===void 0&&(L=s.TEXTURE0+Y-1),Q!==L&&(s.activeTexture(L),Q=L)}function N(L,ot,J){J===void 0&&(Q===null?J=s.TEXTURE0+Y-1:J=Q);let lt=et[J];lt===void 0&&(lt={type:void 0,texture:void 0},et[J]=lt),(lt.type!==L||lt.texture!==ot)&&(Q!==J&&(s.activeTexture(J),Q=J),s.bindTexture(L,ot||$[L]),lt.type=L,lt.texture=ot)}function Ge(){let L=et[Q];L!==void 0&&L.type!==void 0&&(s.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function ie(){try{s.compressedTexImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function R(){try{s.compressedTexImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function _(){try{s.texSubImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function B(){try{s.texSubImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function z(){try{s.compressedTexSubImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function W(){try{s.compressedTexSubImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function it(){try{s.texStorage2D(...arguments)}catch(L){It("WebGLState:",L)}}function st(){try{s.texStorage3D(...arguments)}catch(L){It("WebGLState:",L)}}function q(){try{s.texImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function K(){try{s.texImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function rt(L){return d[L]!==void 0?d[L]:s.getParameter(L)}function Mt(L,ot){d[L]!==ot&&(s.pixelStorei(L,ot),d[L]=ot)}function ct(L){le.equals(L)===!1&&(s.scissor(L.x,L.y,L.z,L.w),le.copy(L))}function at(L){Yt.equals(L)===!1&&(s.viewport(L.x,L.y,L.z,L.w),Yt.copy(L))}function wt(L,ot){let J=c.get(ot);J===void 0&&(J=new WeakMap,c.set(ot,J));let lt=J.get(L);lt===void 0&&(lt=s.getUniformBlockIndex(ot,L.name),J.set(L,lt))}function Ct(L,ot){let lt=c.get(ot).get(L);l.get(ot)!==lt&&(s.uniformBlockBinding(ot,lt,L.__bindingPointIndex),l.set(ot,lt))}function Bt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),u={},d={},Q=null,et={},h={},p=new WeakMap,g=[],y=null,m=!1,f=null,M=null,A=null,b=null,w=null,S=null,T=null,x=new Dt(0,0,0),E=0,C=!1,U=null,F=null,H=null,D=null,V=null,le.set(0,0,s.canvas.width,s.canvas.height),Yt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:_t,bindFramebuffer:Ut,drawBuffers:mt,useProgram:zt,setBlending:Kt,setMaterial:ce,setFlipSided:Wt,setCullFace:pe,setLineWidth:Ne,setPolygonOffset:rn,setScissorTest:_e,activeTexture:Se,bindTexture:N,unbindTexture:Ge,compressedTexImage2D:ie,compressedTexImage3D:R,texImage2D:q,texImage3D:K,pixelStorei:Mt,getParameter:rt,updateUBOMapping:wt,uniformBlockBinding:Ct,texStorage2D:it,texStorage3D:st,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:z,compressedTexSubImage3D:W,scissor:ct,viewport:at,reset:Bt}}function Ux(s,t,e,n,i,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Lt,u=new WeakMap,d=new Set,h,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(R,_){return g?new OffscreenCanvas(R,_):yr("canvas")}function m(R,_,B){let z=1,W=ie(R);if((W.width>B||W.height>B)&&(z=B/Math.max(W.width,W.height)),z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let it=Math.floor(z*W.width),st=Math.floor(z*W.height);h===void 0&&(h=y(it,st));let q=_?y(it,st):h;return q.width=it,q.height=st,q.getContext("2d").drawImage(R,0,0,it,st),Pt("WebGLRenderer: Texture has been resized from ("+W.width+"x"+W.height+") to ("+it+"x"+st+")."),q}else return"data"in R&&Pt("WebGLRenderer: Image in DataTexture is too big ("+W.width+"x"+W.height+")."),R;return R}function f(R){return R.generateMipmaps}function M(R){s.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function b(R,_,B,z,W,it=!1){if(R!==null){if(s[R]!==void 0)return s[R];Pt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let st;z&&(st=t.get("EXT_texture_norm16"),st||Pt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let q=_;if(_===s.RED&&(B===s.FLOAT&&(q=s.R32F),B===s.HALF_FLOAT&&(q=s.R16F),B===s.UNSIGNED_BYTE&&(q=s.R8),B===s.UNSIGNED_SHORT&&st&&(q=st.R16_EXT),B===s.SHORT&&st&&(q=st.R16_SNORM_EXT)),_===s.RED_INTEGER&&(B===s.UNSIGNED_BYTE&&(q=s.R8UI),B===s.UNSIGNED_SHORT&&(q=s.R16UI),B===s.UNSIGNED_INT&&(q=s.R32UI),B===s.BYTE&&(q=s.R8I),B===s.SHORT&&(q=s.R16I),B===s.INT&&(q=s.R32I)),_===s.RG&&(B===s.FLOAT&&(q=s.RG32F),B===s.HALF_FLOAT&&(q=s.RG16F),B===s.UNSIGNED_BYTE&&(q=s.RG8),B===s.UNSIGNED_SHORT&&st&&(q=st.RG16_EXT),B===s.SHORT&&st&&(q=st.RG16_SNORM_EXT)),_===s.RG_INTEGER&&(B===s.UNSIGNED_BYTE&&(q=s.RG8UI),B===s.UNSIGNED_SHORT&&(q=s.RG16UI),B===s.UNSIGNED_INT&&(q=s.RG32UI),B===s.BYTE&&(q=s.RG8I),B===s.SHORT&&(q=s.RG16I),B===s.INT&&(q=s.RG32I)),_===s.RGB_INTEGER&&(B===s.UNSIGNED_BYTE&&(q=s.RGB8UI),B===s.UNSIGNED_SHORT&&(q=s.RGB16UI),B===s.UNSIGNED_INT&&(q=s.RGB32UI),B===s.BYTE&&(q=s.RGB8I),B===s.SHORT&&(q=s.RGB16I),B===s.INT&&(q=s.RGB32I)),_===s.RGBA_INTEGER&&(B===s.UNSIGNED_BYTE&&(q=s.RGBA8UI),B===s.UNSIGNED_SHORT&&(q=s.RGBA16UI),B===s.UNSIGNED_INT&&(q=s.RGBA32UI),B===s.BYTE&&(q=s.RGBA8I),B===s.SHORT&&(q=s.RGBA16I),B===s.INT&&(q=s.RGBA32I)),_===s.RGB&&(B===s.UNSIGNED_SHORT&&st&&(q=st.RGB16_EXT),B===s.SHORT&&st&&(q=st.RGB16_SNORM_EXT),B===s.UNSIGNED_INT_5_9_9_9_REV&&(q=s.RGB9_E5),B===s.UNSIGNED_INT_10F_11F_11F_REV&&(q=s.R11F_G11F_B10F)),_===s.RGBA){let K=it?xr:$t.getTransfer(W);B===s.FLOAT&&(q=s.RGBA32F),B===s.HALF_FLOAT&&(q=s.RGBA16F),B===s.UNSIGNED_BYTE&&(q=K===ee?s.SRGB8_ALPHA8:s.RGBA8),B===s.UNSIGNED_SHORT&&st&&(q=st.RGBA16_EXT),B===s.SHORT&&st&&(q=st.RGBA16_SNORM_EXT),B===s.UNSIGNED_SHORT_4_4_4_4&&(q=s.RGBA4),B===s.UNSIGNED_SHORT_5_5_5_1&&(q=s.RGB5_A1)}return(q===s.R16F||q===s.R32F||q===s.RG16F||q===s.RG32F||q===s.RGBA16F||q===s.RGBA32F)&&t.get("EXT_color_buffer_float"),q}function w(R,_){let B;return R?_===null||_===Dn||_===Ws?B=s.DEPTH24_STENCIL8:_===Mn?B=s.DEPTH32F_STENCIL8:_===Gs&&(B=s.DEPTH24_STENCIL8,Pt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Dn||_===Ws?B=s.DEPTH_COMPONENT24:_===Mn?B=s.DEPTH_COMPONENT32F:_===Gs&&(B=s.DEPTH_COMPONENT16),B}function S(R,_){return f(R)===!0||R.isFramebufferTexture&&R.minFilter!==Fe&&R.minFilter!==ze?Math.log2(Math.max(_.width,_.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?_.mipmaps.length:1}function T(R){let _=R.target;_.removeEventListener("dispose",T),E(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&d.delete(_)}function x(R){let _=R.target;_.removeEventListener("dispose",x),U(_)}function E(R){let _=n.get(R);if(_.__webglInit===void 0)return;let B=R.source,z=p.get(B);if(z){let W=z[_.__cacheKey];W.usedTimes--,W.usedTimes===0&&C(R),Object.keys(z).length===0&&p.delete(B)}n.remove(R)}function C(R){let _=n.get(R);s.deleteTexture(_.__webglTexture);let B=R.source,z=p.get(B);delete z[_.__cacheKey],a.memory.textures--}function U(R){let _=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(_.__webglFramebuffer[z]))for(let W=0;W<_.__webglFramebuffer[z].length;W++)s.deleteFramebuffer(_.__webglFramebuffer[z][W]);else s.deleteFramebuffer(_.__webglFramebuffer[z]);_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer[z])}else{if(Array.isArray(_.__webglFramebuffer))for(let z=0;z<_.__webglFramebuffer.length;z++)s.deleteFramebuffer(_.__webglFramebuffer[z]);else s.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&s.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let z=0;z<_.__webglColorRenderbuffer.length;z++)_.__webglColorRenderbuffer[z]&&s.deleteRenderbuffer(_.__webglColorRenderbuffer[z]);_.__webglDepthRenderbuffer&&s.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=R.textures;for(let z=0,W=B.length;z<W;z++){let it=n.get(B[z]);it.__webglTexture&&(s.deleteTexture(it.__webglTexture),a.memory.textures--),n.remove(B[z])}n.remove(R)}let F=0;function H(){F=0}function D(){return F}function V(R){F=R}function Y(){let R=F;return R>=i.maxTextures&&Pt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+i.maxTextures),F+=1,R}function Z(R){let _=[];return _.push(R.wrapS),_.push(R.wrapT),_.push(R.wrapR||0),_.push(R.magFilter),_.push(R.minFilter),_.push(R.anisotropy),_.push(R.internalFormat),_.push(R.format),_.push(R.type),_.push(R.generateMipmaps),_.push(R.premultiplyAlpha),_.push(R.flipY),_.push(R.unpackAlignment),_.push(R.colorSpace),_.join()}function nt(R,_){let B=n.get(R);if(R.isVideoTexture&&N(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&B.__version!==R.version){let z=R.image;if(z===null)Pt("WebGLRenderer: Texture marked for update but no image data found.");else if(z.complete===!1)Pt("WebGLRenderer: Texture marked for update but image is incomplete");else{_t(B,R,_);return}}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,B.__webglTexture,s.TEXTURE0+_)}function X(R,_){let B=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){_t(B,R,_);return}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,B.__webglTexture,s.TEXTURE0+_)}function Q(R,_){let B=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){_t(B,R,_);return}e.bindTexture(s.TEXTURE_3D,B.__webglTexture,s.TEXTURE0+_)}function et(R,_){let B=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&B.__version!==R.version){Ut(B,R,_);return}e.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+_)}let At={[Ki]:s.REPEAT,[Wn]:s.CLAMP_TO_EDGE,[io]:s.MIRRORED_REPEAT},Et={[Fe]:s.NEAREST,[Pd]:s.NEAREST_MIPMAP_NEAREST,[$r]:s.NEAREST_MIPMAP_LINEAR,[ze]:s.LINEAR,[Lo]:s.LINEAR_MIPMAP_NEAREST,[Ui]:s.LINEAR_MIPMAP_LINEAR},le={[Ud]:s.NEVER,[zd]:s.ALWAYS,[Fd]:s.LESS,[gl]:s.LEQUAL,[Bd]:s.EQUAL,[_l]:s.GEQUAL,[Od]:s.GREATER,[kd]:s.NOTEQUAL};function Yt(R,_){if(_.type===Mn&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===ze||_.magFilter===Lo||_.magFilter===$r||_.magFilter===Ui||_.minFilter===ze||_.minFilter===Lo||_.minFilter===$r||_.minFilter===Ui)&&Pt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,At[_.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,At[_.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,At[_.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,Et[_.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,Et[_.minFilter]),_.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,le[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Fe||_.minFilter!==$r&&_.minFilter!==Ui||_.type===Mn&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,i.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function jt(R,_){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,_.addEventListener("dispose",T));let z=_.source,W=p.get(z);W===void 0&&(W={},p.set(z,W));let it=Z(_);if(it!==R.__cacheKey){W[it]===void 0&&(W[it]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,B=!0),W[it].usedTimes++;let st=W[R.__cacheKey];st!==void 0&&(W[R.__cacheKey].usedTimes--,st.usedTimes===0&&C(_)),R.__cacheKey=it,R.__webglTexture=W[it].texture}return B}function $(R,_,B){return Math.floor(Math.floor(R/B)/_)}function j(R,_,B,z){let it=R.updateRanges;if(it.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,_.width,_.height,B,z,_.data);else{it.sort((Mt,ct)=>Mt.start-ct.start);let st=0;for(let Mt=1;Mt<it.length;Mt++){let ct=it[st],at=it[Mt],wt=ct.start+ct.count,Ct=$(at.start,_.width,4),Bt=$(ct.start,_.width,4);at.start<=wt+1&&Ct===Bt&&$(at.start+at.count-1,_.width,4)===Ct?ct.count=Math.max(ct.count,at.start+at.count-ct.start):(++st,it[st]=at)}it.length=st+1;let q=e.getParameter(s.UNPACK_ROW_LENGTH),K=e.getParameter(s.UNPACK_SKIP_PIXELS),rt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,_.width);for(let Mt=0,ct=it.length;Mt<ct;Mt++){let at=it[Mt],wt=Math.floor(at.start/4),Ct=Math.ceil(at.count/4),Bt=wt%_.width,L=Math.floor(wt/_.width),ot=Ct,J=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,Bt),e.pixelStorei(s.UNPACK_SKIP_ROWS,L),e.texSubImage2D(s.TEXTURE_2D,0,Bt,L,ot,J,B,z,_.data)}R.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,q),e.pixelStorei(s.UNPACK_SKIP_PIXELS,K),e.pixelStorei(s.UNPACK_SKIP_ROWS,rt)}}function _t(R,_,B){let z=s.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(z=s.TEXTURE_2D_ARRAY),_.isData3DTexture&&(z=s.TEXTURE_3D);let W=jt(R,_),it=_.source;e.bindTexture(z,R.__webglTexture,s.TEXTURE0+B);let st=n.get(it);if(it.version!==st.__version||W===!0){if(e.activeTexture(s.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let J=$t.getPrimaries($t.workingColorSpace),lt=_.colorSpace===mi?null:$t.getPrimaries(_.colorSpace),ft=_.colorSpace===mi||J===lt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ft)}e.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment);let K=m(_.image,!1,i.maxTextureSize);K=Ge(_,K);let rt=r.convert(_.format,_.colorSpace),Mt=r.convert(_.type),ct=b(_.internalFormat,rt,Mt,_.normalized,_.colorSpace,_.isVideoTexture);Yt(z,_);let at,wt=_.mipmaps,Ct=_.isVideoTexture!==!0,Bt=st.__version===void 0||W===!0,L=it.dataReady,ot=S(_,K);if(_.isDepthTexture)ct=w(_.format===Fi,_.type),Bt&&(Ct?e.texStorage2D(s.TEXTURE_2D,1,ct,K.width,K.height):e.texImage2D(s.TEXTURE_2D,0,ct,K.width,K.height,0,rt,Mt,null));else if(_.isDataTexture)if(wt.length>0){Ct&&Bt&&e.texStorage2D(s.TEXTURE_2D,ot,ct,wt[0].width,wt[0].height);for(let J=0,lt=wt.length;J<lt;J++)at=wt[J],Ct?L&&e.texSubImage2D(s.TEXTURE_2D,J,0,0,at.width,at.height,rt,Mt,at.data):e.texImage2D(s.TEXTURE_2D,J,ct,at.width,at.height,0,rt,Mt,at.data);_.generateMipmaps=!1}else Ct?(Bt&&e.texStorage2D(s.TEXTURE_2D,ot,ct,K.width,K.height),L&&j(_,K,rt,Mt)):e.texImage2D(s.TEXTURE_2D,0,ct,K.width,K.height,0,rt,Mt,K.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ct&&Bt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ot,ct,wt[0].width,wt[0].height,K.depth);for(let J=0,lt=wt.length;J<lt;J++)if(at=wt[J],_.format!==wn)if(rt!==null)if(Ct){if(L)if(_.layerUpdates.size>0){let ft=rh(at.width,at.height,_.format,_.type);for(let tt of _.layerUpdates){let Tt=at.data.subarray(tt*ft/at.data.BYTES_PER_ELEMENT,(tt+1)*ft/at.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,tt,at.width,at.height,1,rt,Tt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,at.width,at.height,K.depth,rt,at.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,J,ct,at.width,at.height,K.depth,0,at.data,0,0);else Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ct?L&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,at.width,at.height,K.depth,rt,Mt,at.data):e.texImage3D(s.TEXTURE_2D_ARRAY,J,ct,at.width,at.height,K.depth,0,rt,Mt,at.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ct&&Bt&&e.texStorage2D(s.TEXTURE_2D,ot,ct,wt[0].width,wt[0].height);for(let J=0,lt=wt.length;J<lt;J++)at=wt[J],_.format!==wn?rt!==null?Ct?L&&e.compressedTexSubImage2D(s.TEXTURE_2D,J,0,0,at.width,at.height,rt,at.data):e.compressedTexImage2D(s.TEXTURE_2D,J,ct,at.width,at.height,0,at.data):Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ct?L&&e.texSubImage2D(s.TEXTURE_2D,J,0,0,at.width,at.height,rt,Mt,at.data):e.texImage2D(s.TEXTURE_2D,J,ct,at.width,at.height,0,rt,Mt,at.data)}else if(_.isDataArrayTexture)if(Ct){if(Bt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ot,ct,K.width,K.height,K.depth),L)if(_.layerUpdates.size>0){let J=rh(K.width,K.height,_.format,_.type);for(let lt of _.layerUpdates){let ft=K.data.subarray(lt*J/K.data.BYTES_PER_ELEMENT,(lt+1)*J/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,lt,K.width,K.height,1,rt,Mt,ft)}_.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,rt,Mt,K.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,ct,K.width,K.height,K.depth,0,rt,Mt,K.data);else if(_.isData3DTexture)Ct?(Bt&&e.texStorage3D(s.TEXTURE_3D,ot,ct,K.width,K.height,K.depth),L&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,rt,Mt,K.data)):e.texImage3D(s.TEXTURE_3D,0,ct,K.width,K.height,K.depth,0,rt,Mt,K.data);else if(_.isFramebufferTexture){if(Bt)if(Ct)e.texStorage2D(s.TEXTURE_2D,ot,ct,K.width,K.height);else{let J=K.width,lt=K.height;for(let ft=0;ft<ot;ft++)e.texImage2D(s.TEXTURE_2D,ft,ct,J,lt,0,rt,Mt,null),J>>=1,lt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in s){let J=s.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),K.parentNode!==J){J.appendChild(K),d.add(_),J.onpaint=lt=>{let ft=lt.changedElements;for(let tt of d)ft.includes(tt.image)&&(tt.needsUpdate=!0)},J.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,K);else{let ft=s.RGBA,tt=s.RGBA,Tt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,ft,tt,Tt,K)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(wt.length>0){if(Ct&&Bt){let J=ie(wt[0]);e.texStorage2D(s.TEXTURE_2D,ot,ct,J.width,J.height)}for(let J=0,lt=wt.length;J<lt;J++)at=wt[J],Ct?L&&e.texSubImage2D(s.TEXTURE_2D,J,0,0,rt,Mt,at):e.texImage2D(s.TEXTURE_2D,J,ct,rt,Mt,at);_.generateMipmaps=!1}else if(Ct){if(Bt){let J=ie(K);e.texStorage2D(s.TEXTURE_2D,ot,ct,J.width,J.height)}L&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,rt,Mt,K)}else e.texImage2D(s.TEXTURE_2D,0,ct,rt,Mt,K);f(_)&&M(z),st.__version=it.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function Ut(R,_,B){if(_.image.length!==6)return;let z=jt(R,_),W=_.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+B);let it=n.get(W);if(W.version!==it.__version||z===!0){e.activeTexture(s.TEXTURE0+B);let st=$t.getPrimaries($t.workingColorSpace),q=_.colorSpace===mi?null:$t.getPrimaries(_.colorSpace),K=_.colorSpace===mi||st===q?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let rt=_.isCompressedTexture||_.image[0].isCompressedTexture,Mt=_.image[0]&&_.image[0].isDataTexture,ct=[];for(let tt=0;tt<6;tt++)!rt&&!Mt?ct[tt]=m(_.image[tt],!0,i.maxCubemapSize):ct[tt]=Mt?_.image[tt].image:_.image[tt],ct[tt]=Ge(_,ct[tt]);let at=ct[0],wt=r.convert(_.format,_.colorSpace),Ct=r.convert(_.type),Bt=b(_.internalFormat,wt,Ct,_.normalized,_.colorSpace),L=_.isVideoTexture!==!0,ot=it.__version===void 0||z===!0,J=W.dataReady,lt=S(_,at);Yt(s.TEXTURE_CUBE_MAP,_);let ft;if(rt){L&&ot&&e.texStorage2D(s.TEXTURE_CUBE_MAP,lt,Bt,at.width,at.height);for(let tt=0;tt<6;tt++){ft=ct[tt].mipmaps;for(let Tt=0;Tt<ft.length;Tt++){let bt=ft[Tt];_.format!==wn?wt!==null?L?J&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt,0,0,bt.width,bt.height,wt,bt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt,Bt,bt.width,bt.height,0,bt.data):Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?J&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt,0,0,bt.width,bt.height,wt,Ct,bt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt,Bt,bt.width,bt.height,0,wt,Ct,bt.data)}}}else{if(ft=_.mipmaps,L&&ot){ft.length>0&&lt++;let tt=ie(ct[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,lt,Bt,tt.width,tt.height)}for(let tt=0;tt<6;tt++)if(Mt){L?J&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,ct[tt].width,ct[tt].height,wt,Ct,ct[tt].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,Bt,ct[tt].width,ct[tt].height,0,wt,Ct,ct[tt].data);for(let Tt=0;Tt<ft.length;Tt++){let he=ft[Tt].image[tt].image;L?J&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt+1,0,0,he.width,he.height,wt,Ct,he.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt+1,Bt,he.width,he.height,0,wt,Ct,he.data)}}else{L?J&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,wt,Ct,ct[tt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,Bt,wt,Ct,ct[tt]);for(let Tt=0;Tt<ft.length;Tt++){let bt=ft[Tt];L?J&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt+1,0,0,wt,Ct,bt.image[tt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Tt+1,Bt,wt,Ct,bt.image[tt])}}}f(_)&&M(s.TEXTURE_CUBE_MAP),it.__version=W.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function mt(R,_,B,z,W,it){let st=r.convert(B.format,B.colorSpace),q=r.convert(B.type),K=b(B.internalFormat,st,q,B.normalized,B.colorSpace),rt=n.get(_),Mt=n.get(B);if(Mt.__renderTarget=_,!rt.__hasExternalTextures){let ct=Math.max(1,_.width>>it),at=Math.max(1,_.height>>it);W===s.TEXTURE_3D||W===s.TEXTURE_2D_ARRAY?e.texImage3D(W,it,K,ct,at,_.depth,0,st,q,null):e.texImage2D(W,it,K,ct,at,0,st,q,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),Se(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,z,W,Mt.__webglTexture,0,_e(_)):(W===s.TEXTURE_2D||W>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&W<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,z,W,Mt.__webglTexture,it),e.bindFramebuffer(s.FRAMEBUFFER,null)}function zt(R,_,B){if(s.bindRenderbuffer(s.RENDERBUFFER,R),_.depthBuffer){let z=_.depthTexture,W=z&&z.isDepthTexture?z.type:null,it=w(_.stencilBuffer,W),st=_.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Se(_)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,_e(_),it,_.width,_.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,_e(_),it,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,it,_.width,_.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,st,s.RENDERBUFFER,R)}else{let z=_.textures;for(let W=0;W<z.length;W++){let it=z[W],st=r.convert(it.format,it.colorSpace),q=r.convert(it.type),K=b(it.internalFormat,st,q,it.normalized,it.colorSpace);Se(_)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,_e(_),K,_.width,_.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,_e(_),K,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,K,_.width,_.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Ae(R,_,B){let z=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let W=n.get(_.depthTexture);if(W.__renderTarget=_,(!W.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),z){if(W.__webglInit===void 0&&(W.__webglInit=!0,_.depthTexture.addEventListener("dispose",T)),W.__webglTexture===void 0){W.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,W.__webglTexture),Yt(s.TEXTURE_CUBE_MAP,_.depthTexture);let rt=r.convert(_.depthTexture.format),Mt=r.convert(_.depthTexture.type),ct;_.depthTexture.format===Xn?ct=s.DEPTH_COMPONENT24:_.depthTexture.format===Fi&&(ct=s.DEPTH24_STENCIL8);for(let at=0;at<6;at++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ct,_.width,_.height,0,rt,Mt,null)}}else nt(_.depthTexture,0);let it=W.__webglTexture,st=_e(_),q=z?s.TEXTURE_CUBE_MAP_POSITIVE_X+B:s.TEXTURE_2D,K=_.depthTexture.format===Fi?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(_.depthTexture.format===Xn)Se(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,K,q,it,0,st):s.framebufferTexture2D(s.FRAMEBUFFER,K,q,it,0);else if(_.depthTexture.format===Fi)Se(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,K,q,it,0,st):s.framebufferTexture2D(s.FRAMEBUFFER,K,q,it,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ht(R){let _=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==R.depthTexture){let z=R.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),z){let W=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,z.removeEventListener("dispose",W)};z.addEventListener("dispose",W),_.__depthDisposeCallback=W}_.__boundDepthTexture=z}if(R.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let z=0;z<6;z++)Ae(_.__webglFramebuffer[z],R,z);else{let z=R.texture.mipmaps;z&&z.length>0?Ae(_.__webglFramebuffer[0],R,0):Ae(_.__webglFramebuffer,R,0)}else if(B){_.__webglDepthbuffer=[];for(let z=0;z<6;z++)if(e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[z]),_.__webglDepthbuffer[z]===void 0)_.__webglDepthbuffer[z]=s.createRenderbuffer(),zt(_.__webglDepthbuffer[z],R,!1);else{let W=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,it=_.__webglDepthbuffer[z];s.bindRenderbuffer(s.RENDERBUFFER,it),s.framebufferRenderbuffer(s.FRAMEBUFFER,W,s.RENDERBUFFER,it)}}else{let z=R.texture.mipmaps;if(z&&z.length>0?e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=s.createRenderbuffer(),zt(_.__webglDepthbuffer,R,!1);else{let W=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,it=_.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,it),s.framebufferRenderbuffer(s.FRAMEBUFFER,W,s.RENDERBUFFER,it)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Kt(R,_,B){let z=n.get(R);_!==void 0&&mt(z.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),B!==void 0&&Ht(R)}function ce(R){let _=R.texture,B=n.get(R),z=n.get(_);R.addEventListener("dispose",x);let W=R.textures,it=R.isWebGLCubeRenderTarget===!0,st=W.length>1;if(st||(z.__webglTexture===void 0&&(z.__webglTexture=s.createTexture()),z.__version=_.version,a.memory.textures++),it){B.__webglFramebuffer=[];for(let q=0;q<6;q++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[q]=[];for(let K=0;K<_.mipmaps.length;K++)B.__webglFramebuffer[q][K]=s.createFramebuffer()}else B.__webglFramebuffer[q]=s.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let q=0;q<_.mipmaps.length;q++)B.__webglFramebuffer[q]=s.createFramebuffer()}else B.__webglFramebuffer=s.createFramebuffer();if(st)for(let q=0,K=W.length;q<K;q++){let rt=n.get(W[q]);rt.__webglTexture===void 0&&(rt.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&Se(R)===!1){B.__webglMultisampledFramebuffer=s.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let q=0;q<W.length;q++){let K=W[q];B.__webglColorRenderbuffer[q]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,B.__webglColorRenderbuffer[q]);let rt=r.convert(K.format,K.colorSpace),Mt=r.convert(K.type),ct=b(K.internalFormat,rt,Mt,K.normalized,K.colorSpace,R.isXRRenderTarget===!0),at=_e(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,at,ct,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+q,s.RENDERBUFFER,B.__webglColorRenderbuffer[q])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=s.createRenderbuffer(),zt(B.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(it){e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture),Yt(s.TEXTURE_CUBE_MAP,_);for(let q=0;q<6;q++)if(_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)mt(B.__webglFramebuffer[q][K],R,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+q,K);else mt(B.__webglFramebuffer[q],R,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+q,0);f(_)&&M(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(st){for(let q=0,K=W.length;q<K;q++){let rt=W[q],Mt=n.get(rt),ct=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ct=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ct,Mt.__webglTexture),Yt(ct,rt),mt(B.__webglFramebuffer,R,rt,s.COLOR_ATTACHMENT0+q,ct,0),f(rt)&&M(ct)}e.unbindTexture()}else{let q=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(q=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(q,z.__webglTexture),Yt(q,_),_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)mt(B.__webglFramebuffer[K],R,_,s.COLOR_ATTACHMENT0,q,K);else mt(B.__webglFramebuffer,R,_,s.COLOR_ATTACHMENT0,q,0);f(_)&&M(q),e.unbindTexture()}R.depthBuffer&&Ht(R)}function Wt(R){let _=R.textures;for(let B=0,z=_.length;B<z;B++){let W=_[B];if(f(W)){let it=A(R),st=n.get(W).__webglTexture;e.bindTexture(it,st),M(it),e.unbindTexture()}}}let pe=[],Ne=[];function rn(R){if(R.samples>0){if(Se(R)===!1){let _=R.textures,B=R.width,z=R.height,W=s.COLOR_BUFFER_BIT,it=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,st=n.get(R),q=_.length>1;if(q)for(let rt=0;rt<_.length;rt++)e.bindFramebuffer(s.FRAMEBUFFER,st.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,st.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,st.__webglMultisampledFramebuffer);let K=R.texture.mipmaps;K&&K.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,st.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,st.__webglFramebuffer);for(let rt=0;rt<_.length;rt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(W|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(W|=s.STENCIL_BUFFER_BIT)),q){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,st.__webglColorRenderbuffer[rt]);let Mt=n.get(_[rt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Mt,0)}s.blitFramebuffer(0,0,B,z,0,0,B,z,W,s.NEAREST),l===!0&&(pe.length=0,Ne.length=0,pe.push(s.COLOR_ATTACHMENT0+rt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(pe.push(it),Ne.push(it),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Ne)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,pe))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),q)for(let rt=0;rt<_.length;rt++){e.bindFramebuffer(s.FRAMEBUFFER,st.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,st.__webglColorRenderbuffer[rt]);let Mt=n.get(_[rt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,st.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.TEXTURE_2D,Mt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,st.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let _=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[_])}}}function _e(R){return Math.min(i.maxSamples,R.samples)}function Se(R){let _=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function N(R){let _=a.render.frame;u.get(R)!==_&&(u.set(R,_),R.update())}function Ge(R,_){let B=R.colorSpace,z=R.format,W=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==_r&&B!==mi&&($t.getTransfer(B)===ee?(z!==wn||W!==dn)&&Pt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):It("WebGLTextures: Unsupported texture color space:",B)),_}function ie(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=Y,this.resetTextureUnits=H,this.getTextureUnits=D,this.setTextureUnits=V,this.setTexture2D=nt,this.setTexture2DArray=X,this.setTexture3D=Q,this.setTextureCube=et,this.rebindTextures=Kt,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=Wt,this.updateMultisampleRenderTarget=rn,this.setupDepthRenderbuffer=Ht,this.setupFrameBufferTexture=mt,this.useMultisampledRTT=Se,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Fx(s,t){function e(n,i=mi){let r,a=$t.getTransfer(i);if(n===dn)return s.UNSIGNED_BYTE;if(n===No)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Uo)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Jc)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Kc)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Yc)return s.BYTE;if(n===Zc)return s.SHORT;if(n===Gs)return s.UNSIGNED_SHORT;if(n===Do)return s.INT;if(n===Dn)return s.UNSIGNED_INT;if(n===Mn)return s.FLOAT;if(n===Nn)return s.HALF_FLOAT;if(n===jc)return s.ALPHA;if(n===Qc)return s.RGB;if(n===wn)return s.RGBA;if(n===Xn)return s.DEPTH_COMPONENT;if(n===Fi)return s.DEPTH_STENCIL;if(n===Fo)return s.RED;if(n===Bo)return s.RED_INTEGER;if(n===Bi)return s.RG;if(n===Oo)return s.RG_INTEGER;if(n===ko)return s.RGBA_INTEGER;if(n===qr||n===Yr||n===Zr||n===Jr)if(a===ee)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===qr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Jr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===qr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Zr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Jr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===zo||n===Ho||n===Vo||n===Go)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===zo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ho)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Vo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Go)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Wo||n===Xo||n===$o||n===qo||n===Yo||n===Kr||n===Zo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Wo||n===Xo)return a===ee?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===$o)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===qo)return r.COMPRESSED_R11_EAC;if(n===Yo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Kr)return r.COMPRESSED_RG11_EAC;if(n===Zo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Jo||n===Ko||n===jo||n===Qo||n===tl||n===el||n===nl||n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ko)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===jo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Qo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===tl)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===el)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===nl)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===il)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===sl)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===rl)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===al)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ol)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ll)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===cl)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===hl||n===ul||n===dl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===hl)return a===ee?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ul)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===dl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===fl||n===pl||n===jr||n===ml)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===fl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===pl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ml)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ws?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}var Bx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ox=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,wh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Nr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new sn({vertexShader:Bx,fragmentShader:Ox,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Rt(new He(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Eh=class extends $n{constructor(t,e){super();let n=this,i=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,p=null,g=null,y=typeof XRWebGLBinding<"u",m=new wh,f={},M=e.getContextAttributes(),A=null,b=null,w=[],S=[],T=new Lt,x=null,E=null,C=new ke;C.viewport=new ge;let U=new ke;U.viewport=new ge;let F=[C,U],H=new Ao,D=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let j=w[$];return j===void 0&&(j=new Fs,w[$]=j),j.getTargetRaySpace()},this.getControllerGrip=function($){let j=w[$];return j===void 0&&(j=new Fs,w[$]=j),j.getGripSpace()},this.getHand=function($){let j=w[$];return j===void 0&&(j=new Fs,w[$]=j),j.getHandSpace()};function Y($){let j=S.indexOf($.inputSource);if(j===-1)return;let _t=w[j];_t!==void 0&&(_t.update($.inputSource,$.frame,c||a),_t.dispatchEvent({type:$.type,data:$.inputSource}))}function Z(){i.removeEventListener("select",Y),i.removeEventListener("selectstart",Y),i.removeEventListener("selectend",Y),i.removeEventListener("squeeze",Y),i.removeEventListener("squeezestart",Y),i.removeEventListener("squeezeend",Y),i.removeEventListener("end",Z),i.removeEventListener("inputsourceschange",nt);for(let $=0;$<w.length;$++){let j=S[$];j!==null&&(S[$]=null,w[$].disconnect(j))}D=null,V=null,m.reset();for(let $ in f)delete f[$];if(t.setRenderTarget(A),p=null,h=null,d=null,i=null,b=null,jt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(T.width,T.height,!1),E!==null){let $=E.camera;$.fov=E.fov,$.zoom=E.zoom,$.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&Pt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){o=$,n.isPresenting===!0&&Pt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(i,e)),d},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function($){if(i=$,i!==null){if(A=t.getRenderTarget(),i.addEventListener("select",Y),i.addEventListener("selectstart",Y),i.addEventListener("selectend",Y),i.addEventListener("squeeze",Y),i.addEventListener("squeezestart",Y),i.addEventListener("squeezeend",Y),i.addEventListener("end",Z),i.addEventListener("inputsourceschange",nt),M.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(T),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let _t=null,Ut=null,mt=null;M.depth&&(mt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,_t=M.stencil?Fi:Xn,Ut=M.stencil?Ws:Dn);let zt={colorFormat:e.RGBA8,depthFormat:mt,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(zt),i.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),b=new hn(h.textureWidth,h.textureHeight,{format:wn,type:dn,depthTexture:new Ri(h.textureWidth,h.textureHeight,Ut,void 0,void 0,void 0,void 0,void 0,void 0,_t),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let _t={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(i,e,_t),i.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new hn(p.framebufferWidth,p.framebufferHeight,{format:wn,type:dn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),jt.setContext(i),jt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function nt($){for(let j=0;j<$.removed.length;j++){let _t=$.removed[j],Ut=S.indexOf(_t);Ut>=0&&(S[Ut]=null,w[Ut].disconnect(_t))}for(let j=0;j<$.added.length;j++){let _t=$.added[j],Ut=S.indexOf(_t);if(Ut===-1){for(let zt=0;zt<w.length;zt++)if(zt>=S.length){S.push(_t),Ut=zt;break}else if(S[zt]===null){S[zt]=_t,Ut=zt;break}if(Ut===-1)break}let mt=w[Ut];mt&&mt.connect(_t)}}let X=new P,Q=new P;function et($,j,_t){X.setFromMatrixPosition(j.matrixWorld),Q.setFromMatrixPosition(_t.matrixWorld);let Ut=X.distanceTo(Q),mt=j.projectionMatrix.elements,zt=_t.projectionMatrix.elements,Ae=mt[14]/(mt[10]-1),Ht=mt[14]/(mt[10]+1),Kt=(mt[9]+1)/mt[5],ce=(mt[9]-1)/mt[5],Wt=(mt[8]-1)/mt[0],pe=(zt[8]+1)/zt[0],Ne=Ae*Wt,rn=Ae*pe,_e=Ut/(-Wt+pe),Se=_e*-Wt;if(j.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Se),$.translateZ(_e),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),mt[10]===-1)$.projectionMatrix.copy(j.projectionMatrix),$.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let N=Ae+_e,Ge=Ht+_e,ie=Ne-Se,R=rn+(Ut-Se),_=Kt*Ht/Ge*N,B=ce*Ht/Ge*N;$.projectionMatrix.makePerspective(ie,R,_,B,N,Ge),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function At($,j){j===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(j.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(i===null)return;let j=$.near,_t=$.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(_t=m.depthFar)),H.near=U.near=C.near=j,H.far=U.far=C.far=_t,(D!==H.near||V!==H.far)&&(i.updateRenderState({depthNear:H.near,depthFar:H.far}),D=H.near,V=H.far),H.layers.mask=$.layers.mask|6,C.layers.mask=H.layers.mask&-5,U.layers.mask=H.layers.mask&-3;let Ut=$.parent,mt=H.cameras;At(H,Ut);for(let zt=0;zt<mt.length;zt++)At(mt[zt],Ut);mt.length===2?et(H,C,U):H.projectionMatrix.copy(C.projectionMatrix),E===null&&$.isPerspectiveCamera&&(E={camera:$,fov:$.fov,zoom:$.zoom}),Et($,H,Ut)};function Et($,j,_t){_t===null?$.matrix.copy(j.matrixWorld):($.matrix.copy(_t.matrixWorld),$.matrix.invert(),$.matrix.multiply(j.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(j.projectionMatrix),$.projectionMatrixInverse.copy(j.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=ro*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function($){l=$,h!==null&&(h.fixedFoveation=$),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=$)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(H)},this.getCameraTexture=function($){return f[$]};let le=null;function Yt($,j){if(u=j.getViewerPose(c||a),g=j,u!==null){let _t=u.views;p!==null&&(t.setRenderTargetFramebuffer(b,p.framebuffer),t.setRenderTarget(b));let Ut=!1;_t.length!==H.cameras.length&&(H.cameras.length=0,Ut=!0);for(let Ht=0;Ht<_t.length;Ht++){let Kt=_t[Ht],ce=null;if(p!==null)ce=p.getViewport(Kt);else{let pe=d.getViewSubImage(h,Kt);ce=pe.viewport,Ht===0&&(t.setRenderTargetTextures(b,pe.colorTexture,pe.depthStencilTexture),t.setRenderTarget(b))}let Wt=F[Ht];Wt===void 0&&(Wt=new ke,Wt.layers.enable(Ht),Wt.viewport=new ge,F[Ht]=Wt),Wt.matrix.fromArray(Kt.transform.matrix),Wt.matrix.decompose(Wt.position,Wt.quaternion,Wt.scale),Wt.projectionMatrix.fromArray(Kt.projectionMatrix),Wt.projectionMatrixInverse.copy(Wt.projectionMatrix).invert(),Wt.viewport.set(ce.x,ce.y,ce.width,ce.height),Ht===0&&(H.matrix.copy(Wt.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Ut===!0&&H.cameras.push(Wt)}let mt=i.enabledFeatures;if(mt&&mt.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let Ht=d.getDepthInformation(_t[0]);Ht&&Ht.isValid&&Ht.texture&&m.init(Ht,i.renderState)}if(mt&&mt.includes("camera-access")&&y){t.state.unbindTexture(),d=n.getBinding();for(let Ht=0;Ht<_t.length;Ht++){let Kt=_t[Ht].camera;if(Kt){let ce=f[Kt];ce||(ce=new Nr,f[Kt]=ce);let Wt=d.getCameraImage(Kt);ce.sourceTexture=Wt}}}}for(let _t=0;_t<w.length;_t++){let Ut=S[_t],mt=w[_t];Ut!==null&&mt!==void 0&&mt.update(Ut,j,c||a)}le&&le($,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),g=null}let jt=new xf;jt.setAnimationLoop(Yt),this.setAnimationLoop=function($){le=$},this.dispose=function(){}}},kx=new ae,wf=new Nt;wf.set(-1,0,0,0,1,0,0,0,1);function zx(s,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,nh(s)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function i(m,f,M,A,b){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,b)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),y(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,M,A):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ve&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ve&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let M=t.get(f),A=M.envMap,b=M.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(kx.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(wf),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,M,A){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*M,m.scale.value=A*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,M){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ve&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function y(m,f){let M=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Hx(s,t,e,n){let i={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,w){let S=w.program;n.uniformBlockBinding(b,S)}function c(b,w){let S=i[b.id];S===void 0&&(m(b),S=u(b),i[b.id]=S,b.addEventListener("dispose",M));let T=w.program;n.updateUBOMapping(b,T);let x=t.render.frame;r[b.id]!==x&&(h(b),r[b.id]=x)}function u(b){let w=d();b.__bindingPointIndex=w;let S=s.createBuffer(),T=b.__size,x=b.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,T,x),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,w,S),S}function d(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return It("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){let w=i[b.id],S=b.uniforms,T=b.__cache;s.bindBuffer(s.UNIFORM_BUFFER,w);for(let x=0,E=S.length;x<E;x++){let C=S[x];if(Array.isArray(C))for(let U=0,F=C.length;U<F;U++)p(C[U],x,U,T);else p(C,x,0,T)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(b,w,S,T){if(y(b,w,S,T)===!0){let x=b.__offset,E=b.value;if(Array.isArray(E)){let C=0;for(let U=0;U<E.length;U++){let F=E[U],H=f(F);g(F,b.__data,C),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(C+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,b.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,x,b.__data)}}function g(b,w,S){typeof b=="number"||typeof b=="boolean"?w[0]=b:b.isMatrix3?(w[0]=b.elements[0],w[1]=b.elements[1],w[2]=b.elements[2],w[3]=0,w[4]=b.elements[3],w[5]=b.elements[4],w[6]=b.elements[5],w[7]=0,w[8]=b.elements[6],w[9]=b.elements[7],w[10]=b.elements[8],w[11]=0):ArrayBuffer.isView(b)?w.set(new b.constructor(b.buffer,b.byteOffset,w.length)):b.toArray(w,S)}function y(b,w,S,T){let x=b.value,E=w+"_"+S;if(T[E]===void 0)return typeof x=="number"||typeof x=="boolean"?T[E]=x:ArrayBuffer.isView(x)?T[E]=x.slice():T[E]=x.clone(),!0;{let C=T[E];if(typeof x=="number"||typeof x=="boolean"){if(C!==x)return T[E]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(C.equals(x)===!1)return C.copy(x),!0}}return!1}function m(b){let w=b.uniforms,S=0,T=16;for(let E=0,C=w.length;E<C;E++){let U=Array.isArray(w[E])?w[E]:[w[E]];for(let F=0,H=U.length;F<H;F++){let D=U[F],V=Array.isArray(D.value)?D.value:[D.value];for(let Y=0,Z=V.length;Y<Z;Y++){let nt=V[Y],X=f(nt),Q=S%T,et=Q%X.boundary,At=Q+et;S+=et,At!==0&&T-At<X.storage&&(S+=T-At),D.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=S,S+=X.storage}}}let x=S%T;return x>0&&(S+=T-x),b.__size=S,b.__cache={},this}function f(b){let w={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(w.boundary=4,w.storage=4):b.isVector2?(w.boundary=8,w.storage=8):b.isVector3||b.isColor?(w.boundary=16,w.storage=12):b.isVector4?(w.boundary=16,w.storage=16):b.isMatrix3?(w.boundary=48,w.storage=48):b.isMatrix4?(w.boundary=64,w.storage=64):b.isTexture?Pt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(w.boundary=16,w.storage=b.byteLength):Pt("WebGLRenderer: Unsupported uniform value type.",b),w}function M(b){let w=b.target;w.removeEventListener("dispose",M);let S=a.indexOf(w.__bindingPointIndex);a.splice(S,1),s.deleteBuffer(i[w.id]),delete i[w.id],delete r[w.id]}function A(){for(let b in i)s.deleteBuffer(i[b]);a=[],i={},r={}}return{bind:l,update:c,dispose:A}}var Vx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),jn=null;function Gx(){return jn===null&&(jn=new Cr(Vx,16,16,Bi,Nn),jn.name="DFG_LUT",jn.minFilter=ze,jn.magFilter=ze,jn.wrapS=Wn,jn.wrapT=Wn,jn.generateMipmaps=!1,jn.needsUpdate=!0),jn}var bl=class{constructor(t={}){let{canvas:e=Hd(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:p=dn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let y=p,m=new Set([ko,Oo,Bo]),f=new Set([dn,Dn,Gs,Ws,No,Uo]),M=new Uint32Array(4),A=new Int32Array(4),b=new P,w=null,S=null,T=[],x=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,U=!1,F=null,H=null,D=null,V=null;this._outputColorSpace=me;let Y=0,Z=0,nt=null,X=-1,Q=null,et=new ge,At=new ge,Et=null,le=new Dt(0),Yt=0,jt=e.width,$=e.height,j=1,_t=null,Ut=null,mt=new ge(0,0,jt,$),zt=new ge(0,0,jt,$),Ae=!1,Ht=new Os,Kt=!1,ce=!1,Wt=new ae,pe=new P,Ne=new ge,rn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},_e=!1;function Se(){return nt===null?j:1}let N=n;function Ge(v,I){return e.getContext(v,I)}let ie,R,_,B,z,W,it,st,q,K,rt,Mt,ct,at,wt,Ct,Bt,L,ot,J,lt,ft,tt;try{let v={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",he,!1),e.addEventListener("webglcontextrestored",Qt,!1),e.addEventListener("webglcontextcreationerror",En,!1),N===null){let I="webgl2";if(N=Ge(I,v),N===null)throw Ge(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Tt()}catch(v){throw e.removeEventListener("webglcontextlost",he,!1),e.removeEventListener("webglcontextrestored",Qt,!1),e.removeEventListener("webglcontextcreationerror",En,!1),It("WebGLRenderer: "+v.message),v}function Tt(){ie=new Jg(N),ie.init(),lt=new Fx(N,ie),R=new zg(N,ie,t,lt),_=new Nx(N,ie),R.reversedDepthBuffer&&h&&_.buffers.depth.setReversed(!0),H=N.createFramebuffer(),D=N.createFramebuffer(),V=N.createFramebuffer(),B=new Qg(N),z=new vx,W=new Ux(N,ie,_,z,R,lt,B),it=new Zg(C),st=new em(N),ft=new Og(N,st),q=new Kg(N,st,B,ft),K=new e_(N,q,st,ft,B),L=new t_(N,R,W),wt=new Hg(z),rt=new yx(C,it,ie,R,ft,wt),Mt=new zx(C,z),ct=new Sx,at=new Rx(ie),Bt=new Bg(C,it,_,K,g,l),Ct=new Dx(C,K,R),tt=new Hx(N,B,R,_),ot=new kg(N,ie,B),J=new jg(N,ie,B),B.programs=rt.programs,C.capabilities=R,C.extensions=ie,C.properties=z,C.renderLists=ct,C.shadowMap=Ct,C.state=_,C.info=B}y!==dn&&(E=new i_(y,e.width,e.height,o,i,r));let bt=new Eh(C,N);this.xr=bt,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let v=ie.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=ie.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(v){v!==void 0&&(j=v,this.setSize(jt,$,!1))},this.getSize=function(v){return v.set(jt,$)},this.setSize=function(v,I,G=!0){if(bt.isPresenting){Pt("WebGLRenderer: Can't change size while VR device is presenting.");return}jt=v,$=I,e.width=Math.floor(v*j),e.height=Math.floor(I*j),G===!0&&(e.style.width=v+"px",e.style.height=I+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,v,I)},this.getDrawingBufferSize=function(v){return v.set(jt*j,$*j).floor()},this.setDrawingBufferSize=function(v,I,G){jt=v,$=I,j=G,e.width=Math.floor(v*G),e.height=Math.floor(I*G),this.setViewport(0,0,v,I)},this.setEffects=function(v){if(y===dn){It("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let I=0;I<v.length;I++)if(v[I].isOutputPass===!0){Pt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(et)},this.getViewport=function(v){return v.copy(mt)},this.setViewport=function(v,I,G,O){v.isVector4?mt.set(v.x,v.y,v.z,v.w):mt.set(v,I,G,O),_.viewport(et.copy(mt).multiplyScalar(j).round())},this.getScissor=function(v){return v.copy(zt)},this.setScissor=function(v,I,G,O){v.isVector4?zt.set(v.x,v.y,v.z,v.w):zt.set(v,I,G,O),_.scissor(At.copy(zt).multiplyScalar(j).round())},this.getScissorTest=function(){return Ae},this.setScissorTest=function(v){_.setScissorTest(Ae=v)},this.setOpaqueSort=function(v){_t=v},this.setTransparentSort=function(v){Ut=v},this.getClearColor=function(v){return v.copy(Bt.getClearColor())},this.setClearColor=function(){Bt.setClearColor(...arguments)},this.getClearAlpha=function(){return Bt.getClearAlpha()},this.setClearAlpha=function(){Bt.setClearAlpha(...arguments)},this.clear=function(v=!0,I=!0,G=!0){let O=0;if(v){let k=!1;if(nt!==null){let dt=nt.texture.format;k=m.has(dt)}if(k){let dt=nt.texture.type,gt=f.has(dt),ut=Bt.getClearColor(),yt=Bt.getClearAlpha(),St=ut.r,Ot=ut.g,Vt=ut.b;gt?(M[0]=St,M[1]=Ot,M[2]=Vt,M[3]=yt,N.clearBufferuiv(N.COLOR,0,M)):(A[0]=St,A[1]=Ot,A[2]=Vt,A[3]=yt,N.clearBufferiv(N.COLOR,0,A))}else O|=N.COLOR_BUFFER_BIT}I&&(O|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),G&&(O|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&N.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),F=v},this.dispose=function(){e.removeEventListener("webglcontextlost",he,!1),e.removeEventListener("webglcontextrestored",Qt,!1),e.removeEventListener("webglcontextcreationerror",En,!1),Bt.dispose(),ct.dispose(),at.dispose(),z.dispose(),it.dispose(),K.dispose(),ft.dispose(),tt.dispose(),rt.dispose(),bt.dispose(),bt.removeEventListener("sessionstart",Nh),bt.removeEventListener("sessionend",Uh),ki.stop()};function he(v){v.preventDefault(),vr("WebGLRenderer: Context Lost."),U=!0}function Qt(){vr("WebGLRenderer: Context Restored."),U=!1;let v=B.autoReset,I=Ct.enabled,G=Ct.autoUpdate,O=Ct.needsUpdate,k=Ct.type;Tt(),B.autoReset=v,Ct.enabled=I,Ct.autoUpdate=G,Ct.needsUpdate=O,Ct.type=k}function En(v){It("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Fn(v){let I=v.target;I.removeEventListener("dispose",Fn),Xf(I)}function Xf(v){$f(v),z.remove(v)}function $f(v){let I=z.get(v).programs;I!==void 0&&(I.forEach(function(G){rt.releaseProgram(G)}),v.isShaderMaterial&&rt.releaseShaderCache(v))}this.renderBufferDirect=function(v,I,G,O,k,dt){I===null&&(I=rn);let gt=k.isMesh&&k.matrixWorld.determinantAffine()<0,ut=Zf(v,I,G,O,k);_.setMaterial(O,gt);let yt=G.index,St=1;if(O.wireframe===!0){if(yt=q.getWireframeAttribute(G),yt===void 0)return;St=2}let Ot=G.drawRange,Vt=G.attributes.position,vt=Ot.start*St,te=(Ot.start+Ot.count)*St;dt!==null&&(vt=Math.max(vt,dt.start*St),te=Math.min(te,(dt.start+dt.count)*St)),yt!==null?(vt=Math.max(vt,0),te=Math.min(te,yt.count)):Vt!=null&&(vt=Math.max(vt,0),te=Math.min(te,Vt.count));let Me=te-vt;if(Me<0||Me===1/0)return;ft.setup(k,O,ut,G,yt);let de,oe=ot;if(yt!==null&&(de=st.get(yt),oe=J,oe.setIndex(de)),k.isMesh)O.wireframe===!0?(_.setLineWidth(O.wireframeLinewidth*Se()),oe.setMode(N.LINES)):oe.setMode(N.TRIANGLES);else if(k.isLine){let We=O.linewidth;We===void 0&&(We=1),_.setLineWidth(We*Se()),k.isLineSegments?oe.setMode(N.LINES):k.isLineLoop?oe.setMode(N.LINE_LOOP):oe.setMode(N.LINE_STRIP)}else k.isPoints?oe.setMode(N.POINTS):k.isSprite&&oe.setMode(N.TRIANGLES);if(k.isBatchedMesh)if(ie.get("WEBGL_multi_draw"))oe.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let We=k._multiDrawStarts,pt=k._multiDrawCounts,tn=k._multiDrawCount,Jt=yt?st.get(yt).bytesPerElement:1,vn=z.get(O).currentProgram.getUniforms();for(let Bn=0;Bn<tn;Bn++)vn.setValue(N,"_gl_DrawID",Bn),oe.render(We[Bn]/Jt,pt[Bn])}else if(k.isInstancedMesh)oe.renderInstances(vt,Me,k.count);else if(G.isInstancedBufferGeometry){let We=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,pt=Math.min(G.instanceCount,We);oe.renderInstances(vt,Me,pt)}else oe.render(vt,Me)};function Dh(v,I,G,O){F!==null&&v.isNodeMaterial&&F.setObject(O,v),Kt===!0&&wt.setState(v,G,!1),v.transparent===!0&&v.side===yn&&v.forceSinglePass===!1?(v.side=Ve,v.needsUpdate=!0,la(v,I,O),v.side=Li,v.needsUpdate=!0,la(v,I,O),v.side=yn):la(v,I,O)}this.compile=function(v,I,G=null){G===null&&(G=v),F!==null&&F.renderStart(v,I,G),S=at.get(G),S.init(I),x.push(S),G.traverseVisible(function(k){k.isLight&&k.layers.test(I.layers)&&(S.pushLight(k),k.castShadow&&S.pushShadow(k))}),v!==G&&v.traverseVisible(function(k){k.isLight&&k.layers.test(I.layers)&&(S.pushLight(k),k.castShadow&&S.pushShadow(k))}),S.setupLights(),F!==null&&F.updateLights(S.state.lightsArray),ce=this.localClippingEnabled,Kt=wt.init(this.clippingPlanes,ce),Kt===!0&&wt.setGlobalState(this.clippingPlanes,I),F!==null&&Ct.render(S.state.shadowsArray,G,I);let O=new Set;return v.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let dt=k.material;if(dt)if(Array.isArray(dt))for(let gt=0;gt<dt.length;gt++){let ut=dt[gt];Dh(ut,G,I,k),O.add(ut)}else Dh(dt,G,I,k),O.add(dt)}),S=x.pop(),F!==null&&F.renderEnd(),O},this.compileAsync=function(v,I,G=null){let O=this.compile(v,I,G);return new Promise(k=>{function dt(){if(O.forEach(function(gt){let yt=z.get(gt).currentProgram;(yt===void 0||yt.isReady())&&O.delete(gt)}),O.size===0){k(v);return}setTimeout(dt,10)}ie.get("KHR_parallel_shader_compile")!==null?dt():setTimeout(dt,10)})};let Ll=null;function qf(v){Ll&&Ll(v)}function Nh(){ki.stop()}function Uh(){ki.start()}let ki=new xf;ki.setAnimationLoop(qf),typeof self<"u"&&ki.setContext(self),this.setAnimationLoop=function(v){Ll=v,bt.setAnimationLoop(v),v===null?ki.stop():ki.start()},bt.addEventListener("sessionstart",Nh),bt.addEventListener("sessionend",Uh),this.render=function(v,I){if(I!==void 0&&I.isCamera!==!0){It("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;F!==null&&F.renderStart(v,I);let G=bt.enabled===!0&&bt.isPresenting===!0,O=E!==null&&(nt===null||G)&&E.begin(C,nt);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),bt.enabled===!0&&bt.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(bt.cameraAutoUpdate===!0&&bt.updateCamera(I),I=bt.getCamera()),v.isScene===!0&&v.onBeforeRender(C,v,I,nt),S=at.get(v,x.length),S.init(I),S.state.textureUnits=W.getTextureUnits(),x.push(S),Wt.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),Ht.setFromProjectionMatrix(Wt,In,I.reversedDepth),ce=this.localClippingEnabled,Kt=wt.init(this.clippingPlanes,ce),w=ct.get(v,T.length),w.init(),T.push(w),bt.enabled===!0&&bt.isPresenting===!0){let gt=C.xr.getDepthSensingMesh();gt!==null&&Dl(gt,I,-1/0,C.sortObjects)}Dl(v,I,0,C.sortObjects),w.finish(),F!==null&&F.updateLights(S.state.lightsArray),C.sortObjects===!0&&w.sort(_t,Ut),_e=bt.enabled===!1||bt.isPresenting===!1||bt.hasDepthSensing()===!1,_e&&Bt.addToRenderList(w,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Kt===!0&&wt.beginShadows();let k=S.state.shadowsArray;if(Ct.render(k,v,I),Kt===!0&&wt.endShadows(),(O&&E.hasRenderPass())===!1){let gt=w.opaque,ut=w.transmissive;if(S.setupLights(),I.isArrayCamera){let yt=I.cameras;if(ut.length>0)for(let St=0,Ot=yt.length;St<Ot;St++){let Vt=yt[St];Bh(gt,ut,v,Vt)}_e&&Bt.render(v);for(let St=0,Ot=yt.length;St<Ot;St++){let Vt=yt[St];Fh(w,v,Vt,Vt.viewport)}}else ut.length>0&&Bh(gt,ut,v,I),_e&&Bt.render(v),Fh(w,v,I)}nt!==null&&Z===0&&(W.updateMultisampleRenderTarget(nt),W.updateRenderTargetMipmap(nt)),O&&E.end(C),v.isScene===!0&&v.onAfterRender(C,v,I),ft.resetDefaultState(),X=-1,Q=null,x.pop(),x.length>0?(S=x[x.length-1],W.setTextureUnits(S.state.textureUnits),Kt===!0&&wt.setGlobalState(C.clippingPlanes,S.state.camera)):S=null,T.pop(),T.length>0?w=T[T.length-1]:w=null,F!==null&&F.renderEnd()};function Dl(v,I,G,O){if(v.visible===!1)return;if(v.layers.test(I.layers)){if(v.isGroup)G=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(I);else if(v.isLightProbeGrid)S.pushLightProbeGrid(v);else if(v.isLight)S.pushLight(v),v.castShadow&&S.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(Ht)){O&&Ne.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Wt);let gt=K.update(v),ut=v.material;ut.visible&&w.push(v,gt,ut,G,Ne.z,null,I)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(Ht))){let gt=K.update(v),ut=v.material;if(O&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Ne.copy(v.boundingSphere.center)):(gt.boundingSphere===null&&gt.computeBoundingSphere(),Ne.copy(gt.boundingSphere.center)),Ne.applyMatrix4(v.matrixWorld).applyMatrix4(Wt)),Array.isArray(ut)){let yt=gt.groups;for(let St=0,Ot=yt.length;St<Ot;St++){let Vt=yt[St],vt=ut[Vt.materialIndex];vt&&vt.visible&&w.push(v,gt,vt,G,Ne.z,Vt,I)}}else ut.visible&&w.push(v,gt,ut,G,Ne.z,null,I)}}let dt=v.children;for(let gt=0,ut=dt.length;gt<ut;gt++)Dl(dt[gt],I,G,O)}function Fh(v,I,G,O){let{opaque:k,transmissive:dt,transparent:gt}=v;S.setupLightsView(G),Kt===!0&&wt.setGlobalState(C.clippingPlanes,G),O&&_.viewport(et.copy(O)),k.length>0&&oa(k,I,G),dt.length>0&&oa(dt,I,G),gt.length>0&&oa(gt,I,G),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Bh(v,I,G,O){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[O.id]===void 0){let vt=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[O.id]=new hn(1,1,{generateMipmaps:!0,type:vt?Nn:dn,minFilter:Ui,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:$t.workingColorSpace})}let dt=S.state.transmissionRenderTarget[O.id],gt=O.viewport||et;dt.setSize(gt.z*C.transmissionResolutionScale,gt.w*C.transmissionResolutionScale);let ut=C.getRenderTarget(),yt=C.getActiveCubeFace(),St=C.getActiveMipmapLevel();C.setRenderTarget(dt),C.getClearColor(le),Yt=C.getClearAlpha(),Yt<1&&C.setClearColor(16777215,.5),C.clear(),_e&&Bt.render(G);let Ot=C.toneMapping;C.toneMapping=Ln;let Vt=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),S.setupLightsView(O),Kt===!0&&wt.setGlobalState(C.clippingPlanes,O),oa(v,G,O),W.updateMultisampleRenderTarget(dt),W.updateRenderTargetMipmap(dt),ie.has("WEBGL_multisampled_render_to_texture")===!1){let vt=!1;for(let te=0,Me=I.length;te<Me;te++){let de=I[te],{object:oe,geometry:We,material:pt,group:tn}=de;if(pt.side===yn&&oe.layers.test(O.layers)){let Jt=pt.side;pt.side=Ve,pt.needsUpdate=!0,Oh(oe,G,O,We,pt,tn),pt.side=Jt,pt.needsUpdate=!0,vt=!0}}vt===!0&&(W.updateMultisampleRenderTarget(dt),W.updateRenderTargetMipmap(dt))}C.setRenderTarget(ut,yt,St),C.setClearColor(le,Yt),Vt!==void 0&&(O.viewport=Vt),C.toneMapping=Ot}function oa(v,I,G){let O=I.isScene===!0?I.overrideMaterial:null;for(let k=0,dt=v.length;k<dt;k++){let gt=v[k],{object:ut,geometry:yt,group:St}=gt,Ot=gt.material;Ot.allowOverride===!0&&O!==null&&(Ot=O),ut.layers.test(G.layers)&&Oh(ut,I,G,yt,Ot,St)}}function Oh(v,I,G,O,k,dt){F!==null&&k.isNodeMaterial&&F.setObject(v,k),v.onBeforeRender(C,I,G,O,k,dt),v.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),k.onBeforeRender(C,I,G,O,v,dt),k.transparent===!0&&k.side===yn&&k.forceSinglePass===!1?(k.side=Ve,k.needsUpdate=!0,C.renderBufferDirect(G,I,O,k,v,dt),k.side=Li,k.needsUpdate=!0,C.renderBufferDirect(G,I,O,k,v,dt),k.side=yn):C.renderBufferDirect(G,I,O,k,v,dt),v.onAfterRender(C,I,G,O,k,dt)}function la(v,I,G){I.isScene!==!0&&(I=rn);let O=z.get(v),k=S.state.lights,dt=S.state.shadowsArray,gt=k.state.version,ut=rt.getParameters(v,k.state,dt,I,G,S.state.lightProbeGridArray),yt=rt.getProgramCacheKey(ut),St=O.programs;O.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,O.fog=I.fog;let Ot=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;O.envMap=it.get(v.envMap||O.environment,Ot),O.envMapRotation=O.environment!==null&&v.envMap===null?I.environmentRotation:v.envMapRotation,St===void 0&&(v.addEventListener("dispose",Fn),St=new Map,O.programs=St);let Vt=St.get(yt);if(Vt!==void 0){if(O.currentProgram===Vt&&O.lightsStateVersion===gt)return zh(v,ut),Vt}else ut.uniforms=rt.getUniforms(v),F!==null&&v.isNodeMaterial&&F.build(v,G,ut),v.onBeforeCompile(ut,C),Vt=rt.acquireProgram(ut,yt),St.set(yt,Vt),O.uniforms=ut.uniforms;let vt=O.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(vt.clippingPlanes=wt.uniform),zh(v,ut),O.needsLights=Kf(v),O.lightsStateVersion=gt,O.needsLights&&(vt.ambientLightColor.value=k.state.ambient,vt.lightProbe.value=k.state.probe,vt.sunLights.value=k.state.sun,vt.sunLightShadows.value=k.state.sunShadow,vt.directionalLights.value=k.state.directional,vt.directionalLightShadows.value=k.state.directionalShadow,vt.spotLights.value=k.state.spot,vt.spotLightShadows.value=k.state.spotShadow,vt.rectAreaLights.value=k.state.rectArea,vt.ltc_1.value=k.state.rectAreaLTC1,vt.ltc_2.value=k.state.rectAreaLTC2,vt.pointLights.value=k.state.point,vt.pointLightShadows.value=k.state.pointShadow,vt.hemisphereLights.value=k.state.hemi,vt.sunShadowMatrix.value=k.state.sunShadowMatrix,vt.sunShadowCascade.value=k.state.sunShadowCascade,vt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,vt.spotLightMatrix.value=k.state.spotLightMatrix,vt.spotLightMap.value=k.state.spotLightMap,vt.pointShadowMatrix.value=k.state.pointShadowMatrix),O.lightProbeGrid=S.state.lightProbeGridArray.length>0,O.currentProgram=Vt,O.uniformsList=null,Vt}function kh(v){if(v.uniformsList===null){let I=v.currentProgram.getUniforms();v.uniformsList=qs.seqWithValue(I.seq,v.uniforms)}return v.uniformsList}function zh(v,I){let G=z.get(v);G.outputColorSpace=I.outputColorSpace,G.batching=I.batching,G.batchingColor=I.batchingColor,G.instancing=I.instancing,G.instancingColor=I.instancingColor,G.instancingMorph=I.instancingMorph,G.skinning=I.skinning,G.morphTargets=I.morphTargets,G.morphNormals=I.morphNormals,G.morphColors=I.morphColors,G.morphTargetsCount=I.morphTargetsCount,G.numClippingPlanes=I.numClippingPlanes,G.numIntersection=I.numClipIntersection,G.vertexAlphas=I.vertexAlphas,G.vertexTangents=I.vertexTangents,G.toneMapping=I.toneMapping}function Yf(v,I){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;b.setFromMatrixPosition(I.matrixWorld);for(let G=0,O=v.length;G<O;G++){let k=v[G];if(k.texture!==null&&k.boundingBox.containsPoint(b))return k}return null}function Zf(v,I,G,O,k){I.isScene!==!0&&(I=rn),W.resetTextureUnits();let dt=I.fog,gt=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?I.environment:null,ut=nt===null?C.outputColorSpace:nt.isXRRenderTarget===!0?nt.texture.colorSpace:$t.workingColorSpace,yt=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,St=it.get(O.envMap||gt,yt),Ot=O.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Vt=!!G.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),vt=!!G.morphAttributes.position,te=!!G.morphAttributes.normal,Me=!!G.morphAttributes.color,de=Ln;O.toneMapped&&(nt===null||nt.isXRRenderTarget===!0)&&(de=C.toneMapping);let oe=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,We=oe!==void 0?oe.length:0,pt=z.get(O),tn=S.state.lights;if(Kt===!0&&(ce===!0||v!==Q)){let ue=v===Q&&O.id===X;wt.setState(O,v,ue)}let Jt=!1;O.version===pt.__version?(pt.needsLights&&pt.lightsStateVersion!==tn.state.version||pt.outputColorSpace!==ut||k.isBatchedMesh&&pt.batching===!1||!k.isBatchedMesh&&pt.batching===!0||k.isBatchedMesh&&pt.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&pt.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&pt.instancing===!1||!k.isInstancedMesh&&pt.instancing===!0||k.isSkinnedMesh&&pt.skinning===!1||!k.isSkinnedMesh&&pt.skinning===!0||k.isInstancedMesh&&pt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&pt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&pt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&pt.instancingMorph===!1&&k.morphTexture!==null||pt.envMap!==St||O.fog===!0&&pt.fog!==dt||pt.numClippingPlanes!==void 0&&(pt.numClippingPlanes!==wt.numPlanes||pt.numIntersection!==wt.numIntersection)||pt.vertexAlphas!==Ot||pt.vertexTangents!==Vt||pt.morphTargets!==vt||pt.morphNormals!==te||pt.morphColors!==Me||pt.toneMapping!==de||pt.morphTargetsCount!==We||!!pt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(Jt=!0):(Jt=!0,pt.__version=O.version);let vn=pt.currentProgram;Jt===!0&&(vn=la(O,I,k),F&&O.isNodeMaterial&&F.onUpdateProgram(O,vn,pt));let Bn=!1,_i=!1,as=!1,se=vn.getUniforms(),ye=pt.uniforms;if(_.useProgram(vn.program)&&(Bn=!0,_i=!0,as=!0),O.id!==X&&(X=O.id,_i=!0),pt.needsLights){let ue=Yf(S.state.lightProbeGridArray,k);pt.lightProbeGrid!==ue&&(pt.lightProbeGrid=ue,_i=!0)}if(Bn||Q!==v){_.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),se.setValue(N,"projectionMatrix",v.projectionMatrix),se.setValue(N,"viewMatrix",v.matrixWorldInverse);let yi=se.map.cameraPosition;yi!==void 0&&yi.setValue(N,pe.setFromMatrixPosition(v.matrixWorld)),R.logarithmicDepthBuffer&&se.setValue(N,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&se.setValue(N,"isOrthographic",v.isOrthographicCamera===!0),Q!==v&&(Q=v,_i=!0,as=!0)}if(pt.needsLights&&(tn.state.sunShadowMap.length>0&&se.setValue(N,"sunShadowMap",tn.state.sunShadowMap,W),tn.state.directionalShadowMap.length>0&&se.setValue(N,"directionalShadowMap",tn.state.directionalShadowMap,W),tn.state.spotShadowMap.length>0&&se.setValue(N,"spotShadowMap",tn.state.spotShadowMap,W),tn.state.pointShadowMap.length>0&&se.setValue(N,"pointShadowMap",tn.state.pointShadowMap,W)),k.isSkinnedMesh){se.setOptional(N,k,"bindMatrix"),se.setOptional(N,k,"bindMatrixInverse");let ue=k.skeleton;ue&&(ue.boneTexture===null&&ue.computeBoneTexture(),se.setValue(N,"boneTexture",ue.boneTexture,W))}k.isBatchedMesh&&(se.setOptional(N,k,"batchingTexture"),se.setValue(N,"batchingTexture",k._matricesTexture,W),se.setOptional(N,k,"batchingIdTexture"),se.setValue(N,"batchingIdTexture",k._indirectTexture,W),se.setOptional(N,k,"batchingColorTexture"),k._colorsTexture!==null&&se.setValue(N,"batchingColorTexture",k._colorsTexture,W));let xi=G.morphAttributes;if((xi.position!==void 0||xi.normal!==void 0||xi.color!==void 0)&&L.update(k,G,vn),(_i||pt.receiveShadow!==k.receiveShadow)&&(pt.receiveShadow=k.receiveShadow,se.setValue(N,"receiveShadow",k.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&I.environment!==null&&(ye.envMapIntensity.value=I.environmentIntensity),ye.dfgLUT!==void 0&&(ye.dfgLUT.value=Gx()),_i){if(se.setValue(N,"toneMappingExposure",C.toneMappingExposure),pt.needsLights&&Jf(ye,as),dt&&O.fog===!0&&Mt.refreshFogUniforms(ye,dt),Mt.refreshMaterialUniforms(ye,O,j,$,S.state.transmissionRenderTarget[v.id]),pt.needsLights&&pt.lightProbeGrid){let ue=pt.lightProbeGrid;ye.probesSH.value=ue.texture,ye.probesMin.value.copy(ue.boundingBox.min),ye.probesMax.value.copy(ue.boundingBox.max),ye.probesResolution.value.copy(ue.resolution)}qs.upload(N,kh(pt),ye,W)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(qs.upload(N,kh(pt),ye,W),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&se.setValue(N,"center",k.center),se.setValue(N,"modelViewMatrix",k.modelViewMatrix),se.setValue(N,"normalMatrix",k.normalMatrix),se.setValue(N,"modelMatrix",k.matrixWorld),O.uniformsGroups!==void 0){let ue=O.uniformsGroups;for(let yi=0,os=ue.length;yi<os;yi++){let Vh=ue[yi];tt.update(Vh,vn),tt.bind(Vh,vn)}}return vn}function Jf(v,I){v.ambientLightColor.needsUpdate=I,v.lightProbe.needsUpdate=I,v.sunLights.needsUpdate=I,v.sunLightShadows.needsUpdate=I,v.directionalLights.needsUpdate=I,v.directionalLightShadows.needsUpdate=I,v.pointLights.needsUpdate=I,v.pointLightShadows.needsUpdate=I,v.spotLights.needsUpdate=I,v.spotLightShadows.needsUpdate=I,v.rectAreaLights.needsUpdate=I,v.hemisphereLights.needsUpdate=I}function Kf(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return Z},this.getRenderTarget=function(){return nt},this.setRenderTargetTextures=function(v,I,G){let O=z.get(v);O.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),z.get(v.texture).__webglTexture=I,z.get(v.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:G,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,I){let G=z.get(v);G.__webglFramebuffer=I,G.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(v,I=0,G=0){nt=v,Y=I,Z=G;let O=null,k=!1,dt=!1;if(v){let ut=z.get(v);if(ut.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(N.FRAMEBUFFER,ut.__webglFramebuffer),et.copy(v.viewport),At.copy(v.scissor),Et=v.scissorTest,_.viewport(et),_.scissor(At),_.setScissorTest(Et),X=-1;return}else if(ut.__webglFramebuffer===void 0)W.setupRenderTarget(v);else if(ut.__hasExternalTextures)W.rebindTextures(v,z.get(v.texture).__webglTexture,z.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Ot=v.depthTexture;if(ut.__boundDepthTexture!==Ot){if(Ot!==null&&z.has(Ot)&&(v.width!==Ot.image.width||v.height!==Ot.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");W.setupDepthRenderbuffer(v)}}let yt=v.texture;(yt.isData3DTexture||yt.isDataArrayTexture||yt.isCompressedArrayTexture)&&(dt=!0);let St=z.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(St[I])?O=St[I][G]:O=St[I],k=!0):v.samples>0&&W.useMultisampledRTT(v)===!1?O=z.get(v).__webglMultisampledFramebuffer:Array.isArray(St)?O=St[G]:O=St,et.copy(v.viewport),At.copy(v.scissor),Et=v.scissorTest}else et.copy(mt).multiplyScalar(j).floor(),At.copy(zt).multiplyScalar(j).floor(),Et=Ae;if(G!==0&&(O=H),_.bindFramebuffer(N.FRAMEBUFFER,O)&&_.drawBuffers(v,O),_.viewport(et),_.scissor(At),_.setScissorTest(Et),k){let ut=z.get(v.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+I,ut.__webglTexture,G)}else if(dt){let ut=I;for(let yt=0;yt<v.textures.length;yt++){let St=z.get(v.textures[yt]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+yt,St.__webglTexture,G,ut)}}else if(v!==null&&G!==0){let ut=z.get(v.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ut.__webglTexture,G)}X=-1};function Hh(v){let I=z.get(v);return(I.__readFormat!==v.format||I.__readType!==v.type)&&(I.__readFormat=v.format,I.__readType=v.type,I.__formatReadable=R.textureFormatReadable(v.format),I.__typeReadable=R.textureTypeReadable(v.type)),I}this.readRenderTargetPixels=function(v,I,G,O,k,dt,gt,ut=0){if(!(v&&v.isWebGLRenderTarget)){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=z.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&gt!==void 0&&(yt=yt[gt]),yt){_.bindFramebuffer(N.FRAMEBUFFER,yt);try{let St=v.textures[ut],Ot=St.format,Vt=St.type;v.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+ut);let vt=Hh(St);if(vt.__formatReadable===!1){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(vt.__typeReadable===!1){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=v.width-O&&G>=0&&G<=v.height-k&&N.readPixels(I,G,O,k,lt.convert(Ot),lt.convert(Vt),dt)}finally{let St=nt!==null?z.get(nt).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,St)}}},this.readRenderTargetPixelsAsync=async function(v,I,G,O,k,dt,gt,ut=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let yt=z.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&gt!==void 0&&(yt=yt[gt]),yt)if(I>=0&&I<=v.width-O&&G>=0&&G<=v.height-k){_.bindFramebuffer(N.FRAMEBUFFER,yt);let St=v.textures[ut],Ot=St.format,Vt=St.type;v.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+ut);let vt=Hh(St);if(vt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(vt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let te=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,te),N.bufferData(N.PIXEL_PACK_BUFFER,dt.byteLength,N.STREAM_READ),N.readPixels(I,G,O,k,lt.convert(Ot),lt.convert(Vt),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);let Me=nt!==null?z.get(nt).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,Me);let de=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Gd(N,de,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,te),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,dt),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(te),N.deleteSync(de),dt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,I=null,G=0){let O=Math.pow(2,-G),k=Math.floor(v.image.width*O),dt=Math.floor(v.image.height*O),gt=I!==null?I.x:0,ut=I!==null?I.y:0;W.setTexture2D(v,0),N.copyTexSubImage2D(N.TEXTURE_2D,G,0,0,gt,ut,k,dt),_.unbindTexture()},this.copyTextureToTexture=function(v,I,G=null,O=null,k=0,dt=0){let gt,ut,yt,St,Ot,Vt,vt,te,Me,de=v.isCompressedTexture?v.mipmaps[dt]:v.image;if(G!==null)gt=G.max.x-G.min.x,ut=G.max.y-G.min.y,yt=G.isBox3?G.max.z-G.min.z:1,St=G.min.x,Ot=G.min.y,Vt=G.isBox3?G.min.z:0;else{let ye=Math.pow(2,-k);gt=Math.floor(de.width*ye),ut=Math.floor(de.height*ye),v.isDataArrayTexture?yt=de.depth:v.isData3DTexture?yt=Math.floor(de.depth*ye):yt=1,St=0,Ot=0,Vt=0}O!==null?(vt=O.x,te=O.y,Me=O.z):(vt=0,te=0,Me=0);let oe=lt.convert(I.format),We=lt.convert(I.type),pt;I.isData3DTexture?(W.setTexture3D(I,0),pt=N.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(W.setTexture2DArray(I,0),pt=N.TEXTURE_2D_ARRAY):(W.setTexture2D(I,0),pt=N.TEXTURE_2D),_.activeTexture(N.TEXTURE0),_.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,I.flipY),_.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),_.pixelStorei(N.UNPACK_ALIGNMENT,I.unpackAlignment);let tn=_.getParameter(N.UNPACK_ROW_LENGTH),Jt=_.getParameter(N.UNPACK_IMAGE_HEIGHT),vn=_.getParameter(N.UNPACK_SKIP_PIXELS),Bn=_.getParameter(N.UNPACK_SKIP_ROWS),_i=_.getParameter(N.UNPACK_SKIP_IMAGES);_.pixelStorei(N.UNPACK_ROW_LENGTH,de.width),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,de.height),_.pixelStorei(N.UNPACK_SKIP_PIXELS,St),_.pixelStorei(N.UNPACK_SKIP_ROWS,Ot),_.pixelStorei(N.UNPACK_SKIP_IMAGES,Vt);let as=v.isDataArrayTexture||v.isData3DTexture,se=I.isDataArrayTexture||I.isData3DTexture;if(v.isDepthTexture){let ye=z.get(v),xi=z.get(I),ue=z.get(ye.__renderTarget),yi=z.get(xi.__renderTarget);_.bindFramebuffer(N.READ_FRAMEBUFFER,ue.__webglFramebuffer),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,yi.__webglFramebuffer);for(let os=0;os<yt;os++)as&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,z.get(v).__webglTexture,k,Vt+os),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,z.get(I).__webglTexture,dt,Me+os)),N.blitFramebuffer(St,Ot,gt,ut,vt,te,gt,ut,N.DEPTH_BUFFER_BIT,N.NEAREST);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(k!==0||v.isRenderTargetTexture||z.has(v)){let ye=z.get(v),xi=z.get(I);_.bindFramebuffer(N.READ_FRAMEBUFFER,D),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,V);for(let ue=0;ue<yt;ue++)as?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,ye.__webglTexture,k,Vt+ue):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ye.__webglTexture,k),se?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,xi.__webglTexture,dt,Me+ue):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,xi.__webglTexture,dt),k!==0?N.blitFramebuffer(St,Ot,gt,ut,vt,te,gt,ut,N.COLOR_BUFFER_BIT,N.NEAREST):se?N.copyTexSubImage3D(pt,dt,vt,te,Me+ue,St,Ot,gt,ut):N.copyTexSubImage2D(pt,dt,vt,te,St,Ot,gt,ut);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else se?v.isDataTexture||v.isData3DTexture?N.texSubImage3D(pt,dt,vt,te,Me,gt,ut,yt,oe,We,de.data):I.isCompressedArrayTexture?N.compressedTexSubImage3D(pt,dt,vt,te,Me,gt,ut,yt,oe,de.data):N.texSubImage3D(pt,dt,vt,te,Me,gt,ut,yt,oe,We,de):v.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,dt,vt,te,gt,ut,oe,We,de.data):v.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,dt,vt,te,de.width,de.height,oe,de.data):N.texSubImage2D(N.TEXTURE_2D,dt,vt,te,gt,ut,oe,We,de);_.pixelStorei(N.UNPACK_ROW_LENGTH,tn),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Jt),_.pixelStorei(N.UNPACK_SKIP_PIXELS,vn),_.pixelStorei(N.UNPACK_SKIP_ROWS,Bn),_.pixelStorei(N.UNPACK_SKIP_IMAGES,_i),dt===0&&I.generateMipmaps&&N.generateMipmap(pt),_.unbindTexture()},this.initRenderTarget=function(v){z.get(v).__webglFramebuffer===void 0&&W.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?W.setTextureCube(v,0):v.isData3DTexture?W.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?W.setTexture2DArray(v,0):W.setTexture2D(v,0),_.unbindTexture()},this.resetState=function(){Y=0,Z=0,nt=null,_.reset(),ft.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return In}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=$t._getDrawingBufferColorSpace(t),e.unpackColorSpace=$t._getUnpackColorSpace()}};var wl=class extends ji{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new Be;t.deleteAttribute("uv");let e=new Gt({side:Ve}),n=new Gt,i=new Jn(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let r=new Rt(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new Pr(t,n,6),o=new Ee;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new Rt(t,Ks(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Rt(t,Ks(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let u=new Rt(t,Ks(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let d=new Rt(t,Ks(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let h=new Rt(t,Ks(20));h.position.set(3.235,11.486,-12.541),h.scale.set(2.5,2,.1),this.add(h);let p=new Rt(t,Ks(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Ks(s){return new kr({color:0,emissive:16777215,emissiveIntensity:s})}var Th=new Map,Ah=new Map,Je=(s,t)=>(Th.has(s)||Th.set(s,t()),Th.get(s)),Ke=(s,t={})=>{let e=`${s}|${JSON.stringify(t)}`;return Ah.has(e)||Ah.set(e,new Gt({color:s,roughness:t.roughness??.62,metalness:t.metalness??.02,flatShading:t.flat??!1,emissive:t.emissive??0,emissiveIntensity:t.emissiveIntensity??0})),Ah.get(e)},xe={bun:14854749,pattyRaw:11819588,pattyCooked:7550243,pattyBurnt:2365203,cheese:15976517,lettuce:7323466,tomato:14240314,onion:13213912,plate:15986146,stem:5212725};function je(s,t){let e=new Rt(s,t);return e.castShadow=!0,e.receiveShadow=!0,e}function Wx(s,t){let e=new Zt,n=s==="burnt"?xe.pattyBurnt:s==="cooked"?xe.pattyCooked:xe.pattyRaw,i=je(Je("patty",()=>new _n(.13,.133,.045,20)),Ke(n,{roughness:.5}));if(s==="raw"&&t>0){let r=new Dt(xe.pattyRaw).lerp(new Dt(xe.pattyCooked),Math.min(1,t));i.material=new Gt({color:r,roughness:.5})}if(e.add(i),s==="cooked"){let r=je(Je("pattyMark",()=>new Be(.18,.004,.02)),Ke(4858133,{roughness:.9}));r.position.y=.024,r.rotation.y=.5,e.add(r)}return e}function Xx(){let s=new Zt,t=je(Je("bun",()=>new un(.13,18,12)),Ke(xe.bun,{roughness:.72}));t.scale.set(1,.6,1),s.add(t);for(let e=0;e<3;e++){let n=je(Je("seed",()=>new un(.012,6,4)),Ke(16047264,{roughness:.8})),i=e/3*Math.PI*2;n.position.set(Math.cos(i)*.055,.06,Math.sin(i)*.055),s.add(n)}return s}function $x(){let s=new Zt,t=je(Je("cheese",()=>new Be(.19,.018,.19)),Ke(xe.cheese,{roughness:.4}));return t.rotation.y=.22,s.add(t),s}function qx(s){let t=new Zt;if(s)for(let e=0;e<7;e++){let n=je(Je("lettuceBit",()=>new Or(.038,0)),Ke(e%2?6203455:xe.lettuce,{flat:!0,roughness:.8}));n.position.set((Math.random()-.5)*.15,.012+Math.random()*.02,(Math.random()-.5)*.15),n.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3),t.add(n)}else{let e=je(Je("lettuce",()=>new ts(.115,0)),Ke(xe.lettuce,{roughness:.75,flat:!0}));e.scale.set(1.18,.72,1.12),t.add(e)}return t}function Yx(s){let t=new Zt;if(s)for(let e=0;e<8;e++){let n=je(Je("tomatoBit",()=>new Be(.045,.035,.045)),Ke(e%2?xe.tomato:13058095,{roughness:.55}));n.position.set((Math.random()-.5)*.14,.014+Math.random()*.015,(Math.random()-.5)*.14),n.rotation.y=Math.random()*3,t.add(n)}else{let e=je(Je("tomato",()=>new un(.1,16,12)),Ke(xe.tomato,{roughness:.45}));e.scale.set(1,.9,1),t.add(e);let n=je(Je("stem",()=>new _n(.012,.02,.035,5)),Ke(xe.stem,{roughness:.9}));n.position.y=.095,t.add(n)}return t}function Zx(s){let t=new Zt;if(s)for(let e=0;e<6;e++){let n=je(Je("onionBit",()=>new fi(.036,.009,4,8,Math.PI*1.4)),Ke(e%2?14201830:xe.onion,{roughness:.6}));n.position.set((Math.random()-.5)*.14,.014+e*.004,(Math.random()-.5)*.14),n.rotation.set(Math.PI/2+Math.random()*.4,Math.random()*3,0),t.add(n)}else{let e=je(Je("onion",()=>new un(.105,16,12)),Ke(xe.onion,{roughness:.62}));e.scale.set(1,.88,1),t.add(e);let n=je(Je("onionTip",()=>new Qi(.03,.06,6)),Ke(11633860,{roughness:.7}));n.position.y=.105,t.add(n)}return t}function Rh(s,t="raw",e=0){switch(s){case"bun":return Xx();case"patty":return Wx(t,e);case"cheese":return $x();case"lettuce":return qx(t==="chopped");case"tomato":return Yx(t==="chopped");case"onion":return Zx(t==="chopped");default:{let n=new Zt;return n.add(je(Je("unknown",()=>new Be(.1,.1,.1)),Ke(8947848))),n}}}function Jx(s){let t=Rh(s.ingredient,s.state);return t.scale.setScalar(.92),t}function Kx(s=[]){let t=new Zt,e=je(Je("plateBase",()=>new _n(.215,.185,.016,28)),Ke(xe.plate,{roughness:.35}));e.position.y=.008,t.add(e);let n=je(Je("plateRim",()=>new fi(.205,.012,6,30)),Ke(xe.plate,{roughness:.35}));n.rotation.x=Math.PI/2,n.position.y=.02,t.add(n);let i=[...s].sort((o,l)=>(o.ingredient==="bun"?1:0)-(l.ingredient==="bun"?1:0)),r=.022,a=i.length>3?.028:.04;return i.forEach((o,l)=>{let c=Jx(o);c.position.y=r,c.rotation.y=l*1.7%(Math.PI*2),c.position.x=(Math.random()-.5)*.012,c.position.z=(Math.random()-.5)*.012,t.add(c),r+=a}),t}function El(s,t=0){return s?s.type==="plate"?Kx(s.contents):Rh(s.ingredient,s.state,t):new Zt}function Ef(s,t=3){let e=new Zt;for(let n=0;n<t;n++){let i=Rh(s,"raw");i.scale.setScalar(.8);let r=n/t*Math.PI*2+.4;i.position.set(Math.cos(r)*.14,n===2?.05:0,Math.sin(r)*.1),i.rotation.y=Math.random()*3,e.add(i)}return e}var eM={bun:xe.bun,patty:xe.pattyCooked,cheese:xe.cheese,lettuce:xe.lettuce,tomato:xe.tomato,onion:xe.onion};function ti(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function ia(s,t=1,e=1){let n=new Sn(s);return n.colorSpace=me,n.wrapS=Ki,n.wrapT=Ki,n.repeat.set(t,e),n.anisotropy=4,n}function js(s,t,e,n=.08,i=.05){let r=s.getImageData(0,0,t,e),a=r.data;for(let o=0;o<a.length;o+=4){let l=(Math.random()-.5)*255*n;a[o]=Math.max(0,Math.min(255,a[o]+l)),a[o+1]=Math.max(0,Math.min(255,a[o+1]+l)),a[o+2]=Math.max(0,Math.min(255,a[o+2]+l))}if(s.putImageData(r,0,0),i>0){s.globalAlpha=i,s.fillStyle="#000";for(let o=0;o<90;o++)s.beginPath(),s.arc(Math.random()*t,Math.random()*e,Math.random()*2+.5,0,Math.PI*2),s.fill();s.globalAlpha=1}}function Af(){let t=ti(512,512),e=t.getContext("2d");e.fillStyle="#6d3b2b",e.fillRect(0,0,512,512);let n=512/4;for(let i=0;i<4;i++)for(let r=0;r<4;r++){let a=.86+Math.random()*.22,o=Math.round(150*a),l=Math.round(84*a),c=Math.round(62*a);e.fillStyle=`rgb(${o},${l},${c})`,e.fillRect(r*n+3,i*n+3,n-6,n-6),e.fillStyle="rgba(255,255,255,0.04)",e.fillRect(r*n+3,i*n+3,n-6,4),e.fillStyle="rgba(0,0,0,0.08)",e.fillRect(r*n+3,i*n+n-7,n-6,4)}e.strokeStyle="rgba(30,16,10,0.55)",e.lineWidth=5;for(let i=0;i<=4;i++)e.beginPath(),e.moveTo(i*n,0),e.lineTo(i*n,512),e.stroke(),e.beginPath(),e.moveTo(0,i*n),e.lineTo(512,i*n),e.stroke();return js(e,512,512,.06,.05),ia(t,2.5,1.8)}function Rf(){let t=ti(512,512),e=t.getContext("2d");e.fillStyle="#c6ad8c",e.fillRect(0,0,512,512);let n=512/4,i=512/6;for(let r=0;r<6;r++)for(let a=0;a<4;a++){let o=.92+Math.random()*.1;e.fillStyle=`rgba(255,241,216,${.18*o})`,e.fillRect(a*n+2,r*i+2,n-4,i-4),e.strokeStyle="rgba(110,86,62,0.2)",e.lineWidth=2,e.strokeRect(a*n+2,r*i+2,n-4,i-4)}return js(e,512,512,.06,.04),ia(t,3,2)}function Cf(){let e=ti(512,512),n=e.getContext("2d");n.fillStyle="#8a5a34",n.fillRect(0,0,512,512);for(let i=0;i<46;i++){let r=Math.random()*512;n.strokeStyle=`rgba(${60+Math.random()*40},${34+Math.random()*20},${16+Math.random()*14},${.15+Math.random()*.25})`,n.lineWidth=1+Math.random()*3,n.beginPath(),n.moveTo(0,r);for(let a=0;a<=512;a+=32)n.lineTo(a,r+Math.sin(a*.02+i)*5+Math.random()*3);n.stroke()}return js(n,512,512,.07,.03),ia(e,1,1)}function If(){let t=ti(256,256),e=t.getContext("2d");e.fillStyle="#19332d",e.fillRect(0,0,256,256);for(let n=0;n<6;n++)for(let i=0;i<4;i++){let r=.85+Math.random()*.3,a=Math.round(58*r);e.fillStyle=`rgb(${Math.round(30*r)},${a},${Math.round(54*r)})`,e.fillRect(i*64+3,n*42+3,58,36),e.fillStyle="rgba(230,255,240,0.04)",e.fillRect(i*64+3,n*42+3,58,2)}e.strokeStyle="rgba(8,20,16,0.85)",e.lineWidth=4;for(let n=0;n<=6;n++)e.beginPath(),e.moveTo(0,n*42),e.lineTo(256,n*42),e.stroke();for(let n=0;n<=4;n++)e.beginPath(),e.moveTo(n*64,0),e.lineTo(n*64,256),e.stroke();return js(e,256,256,.04,.01),ia(t,2.6,1.4)}function Pf(){let t=ti(256,256),e=t.getContext("2d");e.fillStyle="#9aa6ad",e.fillRect(0,0,256,256);for(let n=0;n<900;n++)e.fillStyle=`rgba(255,255,255,${Math.random()*.06})`,e.fillRect(Math.random()*256,Math.random()*256,1,1+Math.random()*2);return js(e,256,256,.04,0),ia(t,1,1)}function Ch(s,t,e="#f6a623"){let r=ti(512,160),a=r.getContext("2d");a.clearRect(0,0,512,160),a.fillStyle="rgba(18,11,8,0.82)",Tf(a,8,12,496,136,28),a.fill(),a.strokeStyle="rgba(247,232,208,0.18)",a.lineWidth=2,a.stroke(),a.fillStyle=e,Tf(a,24,28,10,104,5),a.fill(),a.fillStyle="#f7e8d0",a.textAlign="center",a.textBaseline="middle",a.font='700 56px "Microsoft YaHei", "PingFang SC", sans-serif',a.fillText(s,512/2+8,160/2-(t?12:0)),t&&(a.fillStyle="rgba(247,232,208,0.66)",a.font='600 26px "Microsoft YaHei", "PingFang SC", sans-serif',a.fillText(t,512/2+8,160/2+38));let o=new Sn(r);return o.colorSpace=me,o.anisotropy=4,o}function Lf(s="SIZZLE!"){let n=ti(1024,300),i=n.getContext("2d");i.clearRect(0,0,1024,300),i.textAlign="center",i.textBaseline="middle";for(let[a,o]of[[70,.45],[34,.7],[12,.9]])i.shadowColor="rgba(255,96,58,0.95)",i.shadowBlur=a,i.fillStyle=`rgba(255,120,70,${o})`,i.font='italic 900 168px "Arial Black", sans-serif',i.fillText(s,1024/2,300/2);i.shadowBlur=6,i.shadowColor="#ffd7a0",i.fillStyle="#fff4de",i.font='italic 900 168px "Arial Black", sans-serif',i.fillText(s,1024/2,300/2);let r=new Sn(n);return r.colorSpace=me,r.anisotropy=4,r}function Df(s,t,e=12){let r=ti(384,512),a=r.getContext("2d");a.fillStyle=`hsl(${e} 48% 28%)`,a.fillRect(0,0,384,512),a.fillStyle=`hsl(${e+18} 70% 58%)`,a.beginPath(),a.arc(384/2,512*.4,384*.32,0,Math.PI*2),a.fill(),a.fillStyle="rgba(20,12,8,0.85)",a.beginPath(),a.arc(384/2,512*.4,384*.22,0,Math.PI*2),a.fill(),a.fillStyle="#ffe9c9",a.textAlign="center",a.font='italic 900 84px "Arial Black", sans-serif',a.fillText(s,384/2,512*.4+28),a.font='700 32px "Microsoft YaHei", sans-serif',a.fillText(t,384/2,512*.72),a.fillStyle="rgba(255,255,255,0.12)",a.fillRect(24,464,336,8),js(a,384,512,.04,.02);let o=new Sn(r);return o.colorSpace=me,o}function Nf(s,t){let i=ti(320,112),r=i.getContext("2d");r.fillStyle="#f4e4c6",r.fillRect(0,0,320,112),r.fillStyle="#e9d3ad",r.fillRect(0,0,320,8),r.fillRect(0,104,320,8),r.strokeStyle="#7a4c2b",r.lineWidth=5,r.strokeRect(4,4,312,104),r.textAlign="center",r.textBaseline="middle",r.font='34px "Segoe UI Emoji", "Apple Color Emoji", sans-serif',r.fillText(s,48,112/2+2),r.fillStyle="#3a2416",r.font='800 34px "Microsoft YaHei", "PingFang SC", sans-serif',r.fillText(t,198,112/2+2);let a=new Sn(i);return a.colorSpace=me,a.anisotropy=4,a}function Uf(){let e=ti(512,256),n=e.getContext("2d");n.fillStyle="#1b2a24",n.fillRect(0,0,512,256),n.strokeStyle="rgba(220,235,220,0.15)",n.lineWidth=2,n.strokeRect(6,6,500,244),n.fillStyle="#f1e6cf",n.textAlign="center",n.textBaseline="middle",n.font='700 26px "Microsoft YaHei", sans-serif',n.fillText("今 日 菜 单",512/2,46),n.strokeStyle="rgba(241,230,207,0.3)",n.lineWidth=2,n.beginPath(),n.moveTo(90,70),n.lineTo(422,70),n.stroke(),n.font='600 22px "Microsoft YaHei", sans-serif',n.textAlign="left",n.fillText("芝士汉堡",70,112),n.fillText("田园沙拉",70,158),n.fillText("双层芝士堡",70,204),n.textAlign="right",n.fillStyle="rgba(246,166,35,0.9)",n.fillText("¥ 18",442,112),n.fillText("¥ 12",442,158),n.fillText("¥ 28",442,204);let i=new Sn(e);return i.colorSpace=me,i.anisotropy=4,i}function Tf(s,t,e,n,i,r){let a=Math.min(r,n/2,i/2);s.beginPath(),s.moveTo(t+a,e),s.arcTo(t+n,e,t+n,e+i,a),s.arcTo(t+n,e+i,t,e+i,a),s.arcTo(t,e+i,t,e,a),s.arcTo(t,e,t+n,e,a),s.closePath()}var sa=.92,xt=(s,t,e,n,i=0,r=0,a=0)=>{let o=new Rt(new Be(s,t,e),n);return o.position.set(i,r,a),o.castShadow=!0,o.receiveShadow=!0,o},Qe=(s,t,e,n,i=20)=>{let r=new Rt(new _n(s,t,e,i),n);return r.castShadow=!0,r.receiveShadow=!0,r};function Qx(){let s=document.createElement("canvas");s.width=512,s.height=320;let t=s.getContext("2d"),e=t.createLinearGradient(0,0,0,320);e.addColorStop(0,"#0b1426"),e.addColorStop(.55,"#243554"),e.addColorStop(1,"#5a3a2c"),t.fillStyle=e,t.fillRect(0,0,512,320),t.fillStyle="rgba(255,240,210,0.9)",t.beginPath(),t.arc(390,70,26,0,Math.PI*2),t.fill(),t.fillStyle="#0d111b";let n=0;for(;n<512;){let r=18+Math.random()*42,a=70+Math.random()*120;t.fillRect(n,320-a,r,a);for(let o=320-a+10;o<300;o+=18)for(let l=n+6;l<n+r-6;l+=12)Math.random()>.55&&(t.fillStyle=`rgba(255,${180+Math.random()*60},120,${.35+Math.random()*.5})`,t.fillRect(l,o,4,5),t.fillStyle="#0d111b");n+=r+4}let i=new Sn(s);return i.colorSpace=me,i}var Tl=class{constructor(t){this.scene=t,this.time=0,this.stationVisuals=new Map,this._labelTimer=0,this._makeMaterials(),this._buildRoom(),this._buildCounters(),this._buildStations(),this._buildDecor()}_makeMaterials(){let t=Af(),e=Rf(),n=Cf(),i=If(),r=Pf();this.mats={floor:new Gt({map:t,roughness:.72,metalness:.02}),wall:new Gt({map:e,roughness:.88,metalness:0}),tile:new Gt({map:i,roughness:.42,metalness:.1}),wood:new Gt({map:n,roughness:.58,metalness:.02}),boardWood:new Gt({map:n,color:14727562,roughness:.5,metalness:.01}),islandBody:new Gt({color:2968383,roughness:.62,metalness:.04}),woodDark:new Gt({color:6044194,roughness:.65}),woodLight:new Gt({color:12158290,roughness:.55}),steel:new Gt({map:r,color:12174023,metalness:.82,roughness:.32}),steelDark:new Gt({color:3357247,metalness:.72,roughness:.35}),black:new Gt({color:1382426,roughness:.55,metalness:.2}),brass:new Gt({color:12618302,metalness:.9,roughness:.28}),cream:new Gt({color:15260868,roughness:.6}),ceiling:new Gt({color:2365460,roughness:.95}),dark:new Gt({color:854279,roughness:.9}),fabric:new Gt({color:8204068,roughness:.95}),red:new Gt({color:11023652,roughness:.7}),paper:new Gt({color:15917764,roughness:.9}),plant:new Gt({color:4160059,roughness:.85,flatShading:!0}),bulb:new Ye({color:16767392})}}_buildRoom(){let{scene:t,mats:e}=this,n=new Rt(new He(10.2,7.2),e.floor);n.rotation.x=-Math.PI/2,n.receiveShadow=!0,t.add(n);let i=new Rt(new He(10.2,7.2),e.ceiling);i.rotation.x=Math.PI/2,i.position.y=3,t.add(i);for(let m=-1;m<=1;m++){let f=xt(10.2,.14,.18,e.woodDark,0,2.89,m*2.2);t.add(f)}let r=m=>{let f=xt(.16,3,7.2,e.wall,m,1.5,0);t.add(f);let M=xt(.05,1.05,7.05,e.wall,m+(m>0?-.1:.1),.525,0);M.material=e.wall,t.add(M);let A=xt(.08,.12,7.2,e.woodDark,m+(m>0?-.09:.09),.06,0);t.add(A)};r(-5.04),r(5.04);let a=xt(10.2,3,.16,e.wall,0,1.5,3.56);t.add(a);let o=xt(1.1,2.15,.08,e.woodDark,2.2,1.07,3.45);t.add(o),t.add(xt(1.28,.12,.12,e.woodLight,2.2,2.18,3.43)),t.add(xt(.28,.06,.04,e.brass,2.6,1,3.39));let l=new Rt(new He(.5,.18),new Ye({color:9367729,transparent:!0,opacity:.85}));l.position.set(2.2,2.45,3.47),l.rotation.y=Math.PI,t.add(l),t.add(xt(7.44,3,.16,e.wall,-1.32,1.5,-3.56)),t.add(xt(.24,3,.16,e.wall,4.92,1.5,-3.56)),t.add(xt(2.4,.9,.16,e.wall,3.6,2.55,-3.56)),t.add(xt(2.4,1.05,.16,e.wall,3.6,.525,-3.56));let c=xt(7.3,1.24,.04,e.tile,-1.28,1.56,-3.47);t.add(c),t.add(xt(7.3,.05,.07,e.brass,-1.28,2.2,-3.44));let u=e.brass;t.add(xt(2.5,.08,.1,u,3.6,2.1,-3.47)),t.add(xt(2.5,.08,.1,u,3.6,1.05,-3.47)),t.add(xt(.08,1.1,.1,u,2.36,1.575,-3.47)),t.add(xt(.08,1.1,.1,u,4.84,1.575,-3.47));let d=new Rt(new He(2.34,1),new Gt({color:5911840,roughness:.9,emissive:2757128,emissiveIntensity:.7}));d.position.set(3.6,1.575,-3.94),t.add(d),t.add(xt(.05,1.05,.42,e.woodDark,2.43,1.575,-3.73)),t.add(xt(.05,1.05,.42,e.woodDark,4.77,1.575,-3.73)),t.add(xt(2.34,.04,.42,e.woodDark,3.6,2.08,-3.73)),t.add(xt(2.34,.05,.42,e.woodLight,3.6,1.07,-3.73)),t.add(xt(2.25,.05,.36,e.woodLight,3.6,1.3,-3.8));for(let m=0;m<4;m++){let f=Qe(.14,.12,.02,e.cream,20);f.position.set(2.85+m*.48,1.334,-3.8),t.add(f)}t.add(xt(2.25,.04,.3,e.brass,3.6,1.96,-3.86));let h=new Jn(16754784,11,5,2);h.position.set(3.6,1.95,-3.55),t.add(h),this.passGlow=h,t.add(xt(2.5,.03,.03,e.brass,3.6,2.24,-3.42));for(let m=0;m<3;m++){let f=xt(.28,.36,.012,e.paper,3+m*.6,2.06,-3.41);f.rotation.z=(Math.random()-.5)*.12,t.add(f),t.add(xt(.03,.06,.02,e.brass,3+m*.6,2.24,-3.4))}let p=Qx(),g=new Rt(new He(2.16,1.2),new Ye({map:p}));g.position.set(-4.955,1.95,1.5),g.rotation.y=Math.PI/2,t.add(g),t.add(xt(.08,.07,2.36,e.woodDark,-4.93,2.59,1.5)),t.add(xt(.08,.07,2.36,e.woodDark,-4.93,1.31,1.5)),t.add(xt(.08,1.35,.07,e.woodDark,-4.93,1.95,.33)),t.add(xt(.08,1.35,.07,e.woodDark,-4.93,1.95,2.67)),t.add(xt(.07,1.22,.06,e.woodDark,-4.9,1.95,1.5));let y=new Rt(new He(2.6,1.4),e.fabric);y.rotation.x=-Math.PI/2,y.position.set(.4,.012,2.45),y.receiveShadow=!0,t.add(y)}_counterRun(t,e,n,i,r=null,a=null){let o=new Zt,l=xt(t-.08,sa-.12,e-.06,a||this.mats.wood,0,(sa-.12)/2,0);o.add(l);let c=Math.max(2,Math.round(t/.9));for(let h=0;h<c;h++){let p=-t/2+.08+h/c*(t-.16)+(t-.16)/c/2,g=xt(.02,sa-.3,e-.05,this.mats.woodDark,p,(sa-.12)/2+.03,.01);o.add(g)}let u=xt(t,.06,e,r||this.mats.woodLight,0,sa-.03,0);o.add(u);let d=xt(t-.2,.1,e-.2,this.mats.black,0,.05,0);return o.add(d),o.position.set(n,0,i),this.scene.add(o),o}_buildCounters(){this._counterRun(7.3,1,-1.28,-3),this._counterRun(2.4,1,3.6,-3,this.mats.steel),this._counterRun(7.6,1.1,-.15,.3,this.mats.steel,this.mats.islandBody);let t=xt(.34,.02,.24,this.mats.cream,3.2,.955,.6);t.rotation.y=.2,this.scene.add(t),this.scene.add(xt(1.38,.74,.035,this.mats.woodDark,-.3,.58,.845));let e=new Rt(new He(1.26,.64),new Ye({map:Uf()}));e.position.set(-.3,.58,.866),this.scene.add(e);for(let l=0;l<8;l++){let c=-3.55+l*.95;c>-1.25&&c<.7||this.scene.add(xt(.26,.032,.03,this.mats.brass,c,.68,.868))}for(let l=0;l<7;l++){let c=-4.2+l*1;if(c>2.1)break;this.scene.add(xt(.26,.032,.03,this.mats.brass,c,.68,-2.488))}let n=new Zt,i=Qe(.32,.29,.78,this.mats.steelDark);i.position.y=.39,n.add(i);let r=Qe(.335,.335,.05,this.mats.steel);r.position.y=.8,n.add(r);let a=Qe(.27,.27,.03,this.mats.black);a.position.y=.82,n.add(a);let o=xt(.16,.05,.08,this.mats.black,0,.06,.34);n.add(o),n.position.set(4.35,0,2.55),this.scene.add(n),this.trashBin=n}_makeLabel(t,e,n=1){let i=Ch(t,""),r=new Bs({map:i,transparent:!0,depthWrite:!1,opacity:.9}),a=new Ar(r),o=.72*n,l=.22*n;return a.scale.set(o,l,1),a.position.set(0,e,.06),{sprite:a,tex:i,title:t,subtitle:"",baseW:o,baseH:l}}_setLabel(t,e,n){if(t.title===e&&t.subtitle===n)return;t.title=e,t.subtitle=n;let i=Ch(e,n);t.sprite.material.map.dispose(),t.sprite.material.map=i,t.sprite.material.needsUpdate=!0,t.tex=i}_buildStations(){for(let t of On){let e=new Zt;e.position.set(t.x,0,t.z),this.scene.add(e);let n=new Rt(new Br(Math.max(t.w,t.d)*.42,Math.max(t.w,t.d)*.47,40),new Ye({color:16164387,transparent:!0,opacity:.35,side:yn,depthWrite:!1,blending:pi}));n.rotation.x=-Math.PI/2,n.position.y=.948,n.visible=!1,e.add(n);let i={def:t,group:e,ring:n,itemRoot:null,itemAnchor:new P(0,.96,0),label:null,burner:null,pan:null,stoveLight:null,lastSig:"",fxAnchor:new P(t.x,1.15,t.z)};switch(t.kind){case"crate":{let r=xt(.82,.42,.72,this.mats.wood,0,1.14,0);e.add(r);for(let c=0;c<3;c++){let u=xt(.84,.035,.03,this.mats.woodDark,0,1+c*.13,-.37);e.add(u)}let a=xt(.7,.06,.6,this.mats.black,0,1.36,0);e.add(a);let o=Ef(t.ingredient,3);o.position.y=1.4,e.add(o);let l=new Rt(new He(.54,.19),new Ye({map:Nf(Xt[t.ingredient].emoji,t.label)}));l.position.set(0,1.02,.365),e.add(l),i.itemAnchor.set(0,1.4,0),i.label=null;break}case"board":{let r=xt(1.32,.06,.84,this.mats.boardWood,0,.955,0);e.add(r);let a=xt(.05,.04,.84,this.mats.woodDark,-.64,.985,0),o=xt(.05,.04,.84,this.mats.woodDark,.64,.985,0);e.add(a,o);for(let p=0;p<5;p++){let g=xt(.16+Math.random()*.2,.002,.012,this.mats.woodDark,(Math.random()-.5)*.8,.986,(Math.random()-.5)*.5);g.rotation.y=Math.random()*1.2,e.add(g)}let l=new Zt,c=xt(.26,.012,.06,this.mats.steel,0,0,0),u=xt(.14,.025,.05,this.mats.woodDark,.2,0,0);l.add(c,u),l.position.set(.32,1,.24),l.rotation.y=-.5,e.add(l),i.knife=l;let d=new Zt;d.position.set(0,1,0),e.add(d),i.itemRoot=d,i.itemAnchor.set(0,1,0);let h=this._makeLabel("🔪 砧板",1.3,.9);e.add(h.sprite),i.label=h;break}case"stove":{let r=xt(1.15,.05,1,this.mats.steelDark,0,.945,0);e.add(r);let a=xt(.92,.02,.78,this.mats.black,0,.975,0);e.add(a);let o=new Rt(new fi(.22,.018,8,32),new Ye({color:16734751,transparent:!0,opacity:.15,blending:pi,depthWrite:!1}));o.rotation.x=Math.PI/2,o.position.y=.99,e.add(o),i.burner=o;let l=new Zt,c=Qe(.28,.24,.045,this.mats.black,26);c.position.y=.03,l.add(c);let u=Qe(.245,.225,.01,this.mats.steelDark,26);u.position.y=.052,l.add(u);let d=xt(.34,.026,.06,this.mats.woodDark,.4,.055,0);l.add(d),l.position.y=.99,e.add(l),i.pan=l;let h=new Zt;h.position.set(0,1.045,0),e.add(h),i.itemRoot=h,i.itemAnchor.set(0,1.045,0);let p=new Jn(16742954,0,2.6,2);p.position.set(0,1.2,0),e.add(p),i.stoveLight=p;for(let y=0;y<3;y++){let m=Qe(.028,.028,.03,this.mats.brass,10);m.rotation.x=Math.PI/2,m.position.set(-.28+y*.16,.86,.51),e.add(m)}let g=this._makeLabel("🔥 煎炉",1.3,.9);e.add(g.sprite),i.label=g;break}case"counter":{let r=xt(1.4,.05,1,this.mats.steel,0,.95,0);e.add(r);let a=xt(.75,.02,.55,this.mats.boardWood,0,.98,0);a.rotation.y=.08,e.add(a);let o=new Zt;o.position.set(0,1,0),e.add(o),i.itemRoot=o,i.itemAnchor.set(0,1,0);let l=this._makeLabel("🍽️ 出餐台",1.3,.95);e.add(l.sprite),i.label=l;break}case"plateStack":{for(let o=0;o<7;o++){let l=Qe(.2,.17,.016,this.mats.cream,24);l.position.y=.96+o*.018,l.rotation.y=o*.3,e.add(l)}let r=xt(.9,.03,.03,this.mats.brass,0,1.16,-.32);e.add(r);let a=this._makeLabel("🍽️ 盘子",1.28,.8);e.add(a.sprite),i.label=a;break}case"pass":{let r=Qe(.07,.085,.03,this.mats.brass,16);r.position.set(.45,.98,.12),e.add(r);let a=new Rt(new un(.07,16,10,0,Math.PI*2,0,Math.PI*.55),this.mats.brass);a.position.set(.45,1.02,.12),a.castShadow=!0,e.add(a);let o=Qe(.012,.012,.06,this.mats.brass,8);o.position.set(.45,1.1,.12),e.add(o);let l=this._makeLabel("🛎️ 上菜窗口",1.95,1);e.add(l.sprite),i.label=l,i.bell=a;break}case"trash":{let r=this._makeLabel("🗑️ 垃圾桶",1.18,.78);e.add(r.sprite),i.label=r;break}default:break}this.stationVisuals.set(t.id,i)}}_buildDecor(){let{scene:t,mats:e}=this,n=Lf("SIZZLE!"),i=new Rt(new He(3.1,.9),new Ye({map:n,transparent:!0,opacity:.92,depthWrite:!1}));i.position.set(-.9,2.55,-3.44),t.add(i);let r=new Rt(new He(3.7,1.3),new Ye({map:n,transparent:!0,opacity:.18,blending:pi,depthWrite:!1}));r.position.set(-.9,2.55,-3.43),t.add(r);let a=new Jn(16738874,4,6,2);a.position.set(-.9,2.3,-2.9),t.add(a),this.neonLight=a,this.pendantLights=[];for(let y of[-2.4,.55,3]){let m=new Zt,f=Qe(.008,.008,.38,e.black,6);f.position.y=2.76,m.add(f);let M=new Rt(new Qi(.19,.16,24,1,!0),new Gt({color:9059114,metalness:.45,roughness:.5,side:yn,emissive:3806472,emissiveIntensity:.9}));M.position.y=2.53,m.add(M);let A=new Rt(new Ur(.175,20),new Ye({color:16763010}));A.rotation.x=Math.PI/2,A.position.y=2.5,m.add(A);let b=new Rt(new un(.05,12,8),e.bulb);b.position.y=2.47,m.add(b);let w=new Jn(16756848,5.2,5.5,2);w.position.y=2.42,m.add(w),m.position.set(y,0,.3),t.add(m),this.pendantLights.push({light:w,bulb:b,base:5.2})}let o=new Zt,l=Qe(.26,.26,.04,e.cream,28);l.rotation.x=Math.PI/2,o.add(l);let c=new Rt(new fi(.27,.025,8,32),e.brass);o.add(c);let u=xt(.02,.16,.012,e.black,0,.07,.03),d=xt(.13,.02,.012,e.black,.055,0,.03);u.position.z=.025,d.position.z=.025,o.add(u,d),o.position.set(1.85,2.45,-3.45),t.add(o);for(let y=0;y<2;y++){let m=new Rt(new He(.7,.95),new Gt({map:Df(y?"HOT!":"FRESH",y?"趁热吃":"今日蔬菜",y?8:110),roughness:.9}));m.position.set(4.89,1.85,-1.1+y*1.3),m.rotation.y=-Math.PI/2,t.add(m),t.add(xt(.06,1.06,.8,e.woodDark,4.97,1.85,-1.1+y*1.3)),t.add(xt(.04,.05,.72,e.brass,4.9,2.4,-1.1+y*1.3))}let h=xt(.35,.05,2.2,e.woodLight,4.78,1.62,2.1);t.add(h);for(let y=0;y<5;y++){let m=Qe(.07,.07,.16,y%2?e.brass:e.cream,14);m.position.set(4.75,1.73,1.2+y*.42),t.add(m);let f=Qe(.075,.075,.03,e.woodDark,14);f.position.set(4.75,1.82,1.2+y*.42),t.add(f)}let p=Qe(.18,.14,.28,e.red,16);p.position.set(-4.4,.14,2.9),t.add(p);let g=new Rt(new ts(.3,0),e.plant);g.position.set(-4.4,.52,2.9),g.scale.set(.9,1.2,.9),g.castShadow=!0,t.add(g);for(let y=0;y<4;y++){let m=Qe(.09,.09,.015,e.steelDark,12);m.position.set(-1.3+y*.75,2.1,1.35),m.rotation.x=Math.PI/2,t.add(m),t.add(xt(.015,.3,.015,e.black,-1.3+y*.75,2.24,1.35))}for(let y=0;y<3;y++){let m=xt(.32,.05,.24,y===1?e.red:y===2?e.cream:e.woodDark,2.1,.955+y*.055,-2.75);m.rotation.y=.15+y*.1,t.add(m)}}update(t,e,n,i=null){this.time+=t;let r=e.kitchen,a=this.time;this._labelTimer-=t;let o=this._labelTimer<=0;o&&(this._labelTimer=.12);for(let[c,u]of this.stationVisuals){let d=r.getStation(c);if(!d)continue;let h=d.item?.type==="ingredient"?r.cookProgress(d):0,p=d.item?.state==="raw"?Math.floor(h*4):0,g=d.item?.type==="plate"?d.item.contents.map(M=>M.ingredient+M.state).join(","):"",y=d.item?`${d.item.uid}|${d.item.type}|${d.item.state||""}|${p}|${g}`:"empty";if(y!==u.lastSig&&u.itemRoot&&(u.lastSig=y,u.itemRoot.clear(),d.item)){let M=El(d.item,h);d.item.type==="plate"&&(M.position.y=0),u.itemRoot.add(M),u.currentMesh=M}let m=c===n;if(u.ring.visible=m,m){let M=.3+.18*(.5+.5*Math.sin(a*7));u.ring.material.opacity=M,u.ring.scale.setScalar(1+Math.sin(a*5)*.03)}let f=u.label;if(f){let M=i?u.def.x-i.x:99,A=i?u.def.z-i.z:99,b=Math.hypot(M,A),w=Math.max(0,Math.min(1,(b-1.35)/.55)),S=0;u.def.kind==="crate"?S=b<5.4?.72:.25:u.def.kind==="stove"?S=m||d.item?.95:0:S=m?.95:0;let T=S*w;f.sprite.visible=T>.02,f.sprite.material.opacity=T;let x=m?1.05:1;f.sprite.scale.set(f.baseW*x,f.baseH*x,1)}if(d.kind==="stove"){let M=d.item?.type==="ingredient"&&d.item.state!=="burnt",A=M?d.item.state==="cooked"?1:h:0;if(u.burner.material.opacity=M?.24+Math.sin(a*10+c.length)*.08+A*.24:.06,u.stoveLight&&(u.stoveLight.intensity=M?1.25+Math.sin(a*12)*.35:0),u.currentMesh&&(u.currentMesh.position.y=0+Math.sin(a*2)*.002),o){let b="";d.item&&(d.item.state==="burnt"?b="烧焦了 · 扔进垃圾桶":d.item.state==="cooked"?b="已熟 · 快拿走":d.item.type==="ingredient"&&(b=`煎制中 ${Math.round(h*100)}%`)),this._setLabel(u.label,"🔥 煎炉",b)}}if(d.kind==="board"&&o){let M=d.item,A="";if(M?.type==="ingredient"){let b=Xt[M.ingredient];M.state==="chopped"?A="切好了 · 拿走":b?.choppable?A=`切碎 ${Math.round((M.chopProgress||0)/b.chopTime*100)}%`:A="这个不用切"}this._setLabel(u.label,"🔪 砧板",A)}if(d.kind==="counter"&&o){let M="";if(d.item?.type==="plate"){let A=d.item.contents.length;M=A?`已摆 ${A} 种配料`:"空盘 · 放配料"}this._setLabel(u.label,"🍽️ 出餐台",M)}}this.pendantLights?.forEach(({light:c,base:u},d)=>{c.intensity=u+Math.sin(a*7+d*2)*.35}),this.neonLight&&(this.neonLight.intensity=3.6+Math.sin(a*3.2)*.5);let l=this.stationVisuals.get("pass")?.bell;if(l&&l.userData.ping>0){l.userData.ping=Math.max(0,l.userData.ping-t*2.2);let c=l.userData.ping;l.rotation.z=Math.sin(c*46)*.28*c,l.position.y=1.02+Math.abs(Math.sin(c*18))*.025*c}}stoveAnchor(t){let e=this.stationVisuals.get(t);return e?new P(e.def.x,1.08,e.def.z):null}ringBell(){let t=this.stationVisuals.get("pass");t?.bell&&(t.bell.userData.ping=1)}dispose(){for(let t of this.stationVisuals.values())t.label?.sprite.material.map?.dispose(),t.label?.sprite.material.dispose();this.stationVisuals.clear()}};var Ff=1.62,ty=3.05,Bf=4.75,Un=.31,Oi=(s,t,e)=>Math.max(t,Math.min(e,s)),Al=class{constructor({camera:t,canvas:e,settings:n,onFootstep:i,onPointerLockLost:r,canLock:a,onPauseRequest:o,onDeviceChange:l}){this.camera=t,this.canvas=e,this.settings=n,this.onFootstep=i,this.onPointerLockLost=r,this.canLock=a,this.onPauseRequest=o,this.onDeviceChange=l,this.bindings=pn("fp"),this.inputDevice="keyboard",this.yaw=ca.yaw,this.pitch=-.06,this.pos=new P(ca.x,Ff,ca.z),this.vel=new P,this.interactQueued=!1,this.mouseDown=!1,this.locked=!1,this.wasLocked=!1,this.dragging=!1,this.dragLast={x:0,y:0},this.enabled=!0,this.bobPhase=0,this.stepAccum=0,this.fov=n.fov||74,this.fovTarget=this.fov,this.trauma=0,this.keyboard=new ls(this.bindings,{onDevice:c=>this._setDevice(c)}),this.gamepad=new Vi({index:0,onDevice:c=>this._setDevice(c)}),this._ignoreLockLoss=!1,this._bind(),this._applyCamera(0)}_setDevice(t){this.inputDevice!==t&&(this.inputDevice=t,this.onDeviceChange?.(t))}_bind(){this._onMouseMove=t=>{if(!this.enabled)return;let e=.0021*(this.settings.sensitivity||1);if(this.locked){this.yaw-=t.movementX*e;let n=this.settings.invertY?-1:1;this.pitch-=t.movementY*e*n,this.pitch=Oi(this.pitch,-1.45,1.45)}else if(this.dragging){let n=t.clientX-this.dragLast.x,i=t.clientY-this.dragLast.y;this.dragLast.x=t.clientX,this.dragLast.y=t.clientY,this.yaw-=n*e*.8;let r=this.settings.invertY?-1:1;this.pitch-=i*e*.8*r,this.pitch=Oi(this.pitch,-1.45,1.45)}},this._onMouseDown=t=>{if(t.button===0){if(this.locked){this.mouseDown=!0;return}this.enabled&&t.target===this.canvas&&(this.dragging=!0,this.dragLast.x=t.clientX,this.dragLast.y=t.clientY)}},this._onMouseUp=t=>{t.button===0&&(this.mouseDown=!1,this.dragging=!1)},this._onLockChange=()=>{let t=document.pointerLockElement===this.canvas;this.locked=t,t?this.wasLocked=!0:this.wasLocked&&!this._ignoreLockLoss&&(this.wasLocked=!1,this.mouseDown=!1,this.keyboard.clear(),this.onPointerLockLost?.()),this._ignoreLockLoss=!1},this._onCanvasClick=()=>{!this.enabled||this.locked||this.canLock&&!this.canLock()||this.requestLock()},this._onBlur=()=>{this.keyboard.clear(),this.mouseDown=!1,this.dragging=!1},this._onContextMenu=t=>t.preventDefault(),document.addEventListener("mousemove",this._onMouseMove),document.addEventListener("mousedown",this._onMouseDown),document.addEventListener("mouseup",this._onMouseUp),document.addEventListener("pointerlockchange",this._onLockChange),this.canvas.addEventListener("click",this._onCanvasClick),this.canvas.addEventListener("contextmenu",this._onContextMenu),window.addEventListener("blur",this._onBlur)}requestLock(){try{let t=this.canvas.requestPointerLock?.({unadjustedMovement:!1});t&&typeof t.catch=="function"&&t.catch(()=>{})}catch{}}exitLock(){this._ignoreLockLoss=!0,this.mouseDown=!1,this.keyboard.clear();try{document.exitPointerLock?.()}catch{}this.locked=!1,this.wasLocked=!1}setEnabled(t){this.enabled=t,this.keyboard.setEnabled(t),t||(this.mouseDown=!1,this.gamepad.state={...this.gamepad.state,interact:!1,chop:!1,pause:!1},this.gamepad.prev={...this.gamepad.prev,interact:!1,chop:!1,pause:!1})}get isMoving(){return this.vel.lengthSq()>.2}consumeInteract(){let t=this.interactQueued||this.keyboard.pressed("interact")||this.gamepad.pressedInteract;return this.interactQueued=!1,t}get chopHeld(){return this.enabled&&(this.keyboard.isDown("interact")||this.mouseDown||this.gamepad.chopHeld)}forwardVector(t=new P){let e=Math.cos(this.pitch);return t.set(-Math.sin(this.yaw)*e,Math.sin(this.pitch),-Math.cos(this.yaw)*e),t}addTrauma(t){this.trauma=Math.min(1,this.trauma+t)}update(t,e=null){if(!this.enabled){this._applyCamera(t,e);return}this.keyboard.beginFrame(),this.gamepad.poll(),this.gamepad.pressedPause&&this.onPauseRequest?.();let n=M=>Oi(M,-1.45,1.45),i=this.gamepad.look;if(i.x||i.y){let M=(this.settings.sensitivity||1)*t;this.yaw-=i.x*2.4*M;let A=this.settings.invertY?-1:1;this.pitch=n(this.pitch-i.y*1.8*M*A)}let r=(this.keyboard.isDown("forward")?1:0)-(this.keyboard.isDown("back")?1:0),a=(this.keyboard.isDown("right")?1:0)-(this.keyboard.isDown("left")?1:0),o=this.gamepad.move,l=Math.hypot(o.x,o.y),c=0,u=0,d=Math.sin(this.yaw),h=Math.cos(this.yaw);if(l>.12){let M=-o.y,A=o.x;c=-d*M+h*A,u=-h*M-d*A}else(r||a)&&(c=-d*r+h*a,u=-h*r-d*a);let p=Math.hypot(c,u);p>0&&(c/=p,u/=p);let g=this.keyboard.isDown("sprint")||this.gamepad.sprintHeld,y=(g?Bf:ty)*(p>0?1:0),m=1-Math.exp(-13*t);this.vel.x+=(c*y-this.vel.x)*m,this.vel.z+=(u*y-this.vel.z)*m,Math.abs(this.vel.x)<.01&&(this.vel.x=0),Math.abs(this.vel.z)<.01&&(this.vel.z=0),this.pos.x+=this.vel.x*t,this.pos.z+=this.vel.z*t,this._resolveCollisions();let f=Math.hypot(this.vel.x,this.vel.z);f>.4&&(this.bobPhase+=t*(g?11.5:8.6),this.stepAccum+=f*t,this.stepAccum>1.9&&(this.stepAccum=0,this.onFootstep?.())),this.fovTarget=(this.settings.fov||74)+(g&&f>2.5?4.5:0),this._applyCamera(t,e,f)}_resolveCollisions(){let t={minX:on.minX+Un,maxX:on.maxX-Un,minZ:on.minZ+Un,maxZ:on.maxZ-Un};this.pos.x=Oi(this.pos.x,t.minX,t.maxX),this.pos.z=Oi(this.pos.z,t.minZ,t.maxZ);for(let e=0;e<2;e++)for(let n of Qs){let i=Oi(this.pos.x,n.minX,n.maxX),r=Oi(this.pos.z,n.minZ,n.maxZ),a=this.pos.x-i,o=this.pos.z-r,l=a*a+o*o;if(l>=Un*Un)continue;if(l<1e-8){let d=this.pos.x-n.minX,h=n.maxX-this.pos.x,p=this.pos.z-n.minZ,g=n.maxZ-this.pos.z,y=Math.min(d,h,p,g);y===d?this.pos.x=n.minX-Un:y===h?this.pos.x=n.maxX+Un:y===p?this.pos.z=n.minZ-Un:this.pos.z=n.maxZ+Un;continue}let c=Math.sqrt(l),u=(Un-c)/c;this.pos.x+=a*u,this.pos.z+=o*u}}_applyCamera(t,e=null,n=0){let i=Oi(n/Bf,0,1),r=Math.sin(this.bobPhase*2)*.026*i,a=Math.sin(this.bobPhase)*.009*i;this.trauma>0&&(this.trauma=Math.max(0,this.trauma-t*1.8));let o=this.trauma*this.trauma,l=(e?.x||0)+Math.sin(this.bobPhase*2.3+1)*.012*o,c=(e?.y||0)+Math.sin(this.bobPhase*1.7)*.012*o,u=(e?.roll||0)+a+Math.sin(this.bobPhase*1.3)*.02*o;this.camera.position.set(this.pos.x,Ff+r,this.pos.z),this.camera.rotation.order="YXZ",this.camera.rotation.set(this.pitch+l,this.yaw+c,u);let d=this.fovTarget;this.fov+=(d-this.fov)*(1-Math.exp(-8*(t||.016))),Math.abs(this.camera.fov-this.fov)>.01&&(this.camera.fov=this.fov,this.camera.updateProjectionMatrix())}applySettings(t){this.settings=t,this.fovTarget=t.fov||74}teleport(t,e,n=this.yaw){this.pos.x=t,this.pos.z=e,this.vel.set(0,0,0),this.yaw=n,this._applyCamera(0)}lookAt(t,e){this.yaw=Math.atan2(-(t-this.pos.x),-(e-this.pos.z)),this.pitch=-.12,this._applyCamera(0)}dispose(){this.keyboard.dispose(),document.removeEventListener("mousemove",this._onMouseMove),document.removeEventListener("mousedown",this._onMouseDown),document.removeEventListener("mouseup",this._onMouseUp),document.removeEventListener("pointerlockchange",this._onLockChange),this.canvas.removeEventListener("click",this._onCanvasClick),this.canvas.removeEventListener("contextmenu",this._onContextMenu),window.removeEventListener("blur",this._onBlur),this.exitLock()}};var ey=`
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (340.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`,ny=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d) * vAlpha;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vColor, a);
  }
`,ra=class{constructor(t,{additive:e=!1,max:n=180,order:i=5}={}){this.max=n,this.cursor=0,this.additive=e,this.pos=new Float32Array(n*3),this.col=new Float32Array(n*3),this.size=new Float32Array(n),this.alpha=new Float32Array(n),this.vel=new Float32Array(n*3),this.life=new Float32Array(n),this.maxLife=new Float32Array(n),this.gravity=new Float32Array(n),this.drag=new Float32Array(n);for(let o=0;o<n;o++)this.pos[o*3+1]=-50;let r=new Te;r.setAttribute("position",new Pe(this.pos,3)),r.setAttribute("aColor",new Pe(this.col,3)),r.setAttribute("aSize",new Pe(this.size,1)),r.setAttribute("aAlpha",new Pe(this.alpha,1)),this.geo=r;let a=new sn({vertexShader:ey,fragmentShader:ny,transparent:!0,depthWrite:!1,blending:e?pi:Di});this.points=new Lr(r,a),this.points.frustumCulled=!1,this.points.renderOrder=i,t.add(this.points)}spawn({x:t=0,y:e=1,z:n=0,vx:i=0,vy:r=.4,vz:a=0,color:o=16777215,size:l=.12,life:c=1,gravity:u=0,drag:d=.2}){let h=this.cursor;this.cursor=(this.cursor+1)%this.max;let p=new Dt(o);return this.pos[h*3]=t,this.pos[h*3+1]=e,this.pos[h*3+2]=n,this.vel[h*3]=i,this.vel[h*3+1]=r,this.vel[h*3+2]=a,this.col[h*3]=p.r,this.col[h*3+1]=p.g,this.col[h*3+2]=p.b,this.size[h]=l,this.alpha[h]=0,this.life[h]=c,this.maxLife[h]=c,this.gravity[h]=u,this.drag[h]=d,h}update(t){let{pos:e,vel:n,life:i,maxLife:r,alpha:a,size:o,gravity:l,drag:c}=this;for(let u=0;u<this.max;u++){if(i[u]<=0)continue;if(i[u]-=t,i[u]<=0){a[u]=0,e[u*3+1]=-50;continue}let d=u*3;n[d+1]+=l[u]*t;let h=Math.max(0,1-c[u]*t);n[d]*=h,n[d+2]*=h,e[d]+=n[d]*t,e[d+1]+=n[d+1]*t,e[d+2]+=n[d+2]*t;let p=r[u]-i[u],g=Math.min(1,p/.12),y=Math.min(1,i[u]/(r[u]*.45));a[u]=g*y,o[u]+=t*.02}this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.aColor.needsUpdate=!0,this.geo.attributes.aSize.needsUpdate=!0,this.geo.attributes.aAlpha.needsUpdate=!0}dispose(){this.points.parent?.remove(this.points),this.geo.dispose(),this.points.material.dispose()}};function Ih(s,t,e,n=5){for(let i=0;i<n;i++){let r=Math.random()*Math.PI*2,a=.6+Math.random()*1.2;s.spawn({x:t.x+(Math.random()-.5)*.15,y:t.y+.03,z:t.z+(Math.random()-.5)*.15,vx:Math.cos(r)*a,vy:.9+Math.random()*1.1,vz:Math.sin(r)*a,color:e,size:.045+Math.random()*.03,life:.5+Math.random()*.35,gravity:-7.5,drag:.6})}}function Ph(s,t,e=1){s.spawn({x:t.x+(Math.random()-.5)*.2,y:t.y+.02,z:t.z+(Math.random()-.5)*.2,vx:(Math.random()-.5)*.1,vy:.26+Math.random()*.22,vz:(Math.random()-.5)*.1,color:16767150,size:(.065+Math.random()*.045)*e,life:.85+Math.random()*.55,gravity:.1,drag:.5})}function Rl(s,t){s.spawn({x:t.x+(Math.random()-.5)*.2,y:t.y+.02,z:t.z+(Math.random()-.5)*.2,vx:(Math.random()-.5)*.28,vy:.3+Math.random()*.3,vz:(Math.random()-.5)*.28,color:3814191,size:.13+Math.random()*.1,life:1.3+Math.random()*.8,gravity:.15,drag:.25})}function Of(s,t,e=26){let n=[16164387,15224890,8048803,16771272,16740241,7325695];for(let i=0;i<e;i++){let r=Math.random()*Math.PI*2,a=.8+Math.random()*2.4;s.spawn({x:t.x+(Math.random()-.5)*.4,y:t.y+.1,z:t.z+(Math.random()-.5)*.3,vx:Math.cos(r)*a,vy:1.4+Math.random()*2.2,vz:Math.sin(r)*a,color:n[i%n.length],size:.055+Math.random()*.05,life:.9+Math.random()*.8,gravity:-5.5,drag:.5})}}function kf(s,t,e=6){for(let n=0;n<e;n++)s.spawn({x:t.x+(Math.random()-.5)*.2,y:t.y,z:t.z+(Math.random()-.5)*.2,vx:(Math.random()-.5)*.9,vy:.7+Math.random()*.8,vz:(Math.random()-.5)*.9,color:16752704,size:.04,life:.35+Math.random()*.3,gravity:-4,drag:.4})}var zf=s=>`${Math.round(s*100)}%`;function aa(s,t,e){if(!s)return null;let n=t?.carry??null,i=s;switch(i.kind){case"crate":return n?{title:"双手已满",hint:"先放下或处理手上的东西",blocked:!0}:{title:`拿${Xt[i.ingredient].name}`,hint:"按 E",action:"拿取"};case"board":{if(i.item){let r=Xt[i.item.ingredient];if(n)return{title:"砧板被占用了",hint:"先拿走砧板上的食材",blocked:!0};if(r?.choppable&&i.item.state!=="chopped"){let a=Math.min(1,(i.item.chopProgress||0)/r.chopTime);return{title:`切${r.name}`,hint:a>0?`按住 E / 左键 · ${zf(a)}`:"按住 E / 左键",action:"切菜",progress:a}}return{title:`拿走${Xe(i.item)}`,hint:"按 E",action:"拿取"}}if(n?.type==="ingredient"){let r=Xt[n.ingredient];return{title:`放上${r.name}`,hint:r.choppable?"放下后按住 E 切碎":"按 E",action:"放置"}}return n?.type==="plate"?{title:"盘子不能放砧板",hint:"找个出餐台",blocked:!0}:{title:"砧板空着",hint:"拿食材过来切"}}case"stove":{if(i.item){let r=Xt[i.item.ingredient];if(n)return{title:"煎炉被占用了",hint:"先拿走煎炉上的食材",blocked:!0};if(i.item.state==="burnt")return{title:`拿走${Xe(i.item)}`,hint:"扔进垃圾桶，别上菜",action:"拿取",danger:!0};if(i.item.state==="cooked")return{title:`拿走${Xe(i.item)}`,hint:"按 E",action:"拿取",good:!0};let a=r?.cookable?Math.min(1,i.item.cookTimer/r.cookTime):0;return{title:`煎制中 ${zf(a)}`,hint:"熟了再拿 · 再等就要焦了",progress:a}}return n?.type==="ingredient"&&Xt[n.ingredient]?.cookable?{title:`放下${Xe(n)}`,hint:"按 E 开煎",action:"开煎"}:n?{title:"煎炉只煎肉饼",hint:"先把别的东西放下",blocked:!0}:{title:"空煎炉",hint:"拿生肉饼过来"}}case"plateStack":return n?{title:"双手已满",hint:"先放下手上的东西",blocked:!0}:{title:"拿一个盘子",hint:"按 E",action:"拿取"};case"counter":{if(i.item?.type==="plate"){if(n?.type==="ingredient")return{title:`把${Xe(n)}放上盘子`,hint:"按 E · 依次摆好配料",action:"摆盘"};if(n?.type==="plate")return{title:"这里已经有盘子了",hint:"端着盘子上菜去吧",blocked:!0};if(n)return{title:"手上还拿着东西",hint:"先处理一下",blocked:!0};let r=kn(i.item.contents);if(r)return{title:`端起${r.name}`,hint:"按 E · 然后去上菜窗口",action:"拿取",good:!0};let a=i.item.contents.length;return{title:a?`盘子 · ${a} 种配料`:"空盘子",hint:a?"继续摆配料，或端走":"从食材箱拿配料放上来"}}return n?.type==="plate"?{title:"放下盘子",hint:"按 E 开始摆盘",action:"放置"}:n?{title:"先放个盘子在台上",hint:"盘子台在左边",blocked:!0}:{title:"空出餐台",hint:"从盘子台拿一个盘子"}}case"pass":{if(n?.type==="plate"&&n.contents.length){let r=kn(n.contents);return r?{title:`上菜：${r.name}`,hint:"按 E 交给窗口",action:"上菜",good:!0}:{title:"上菜（配方不对）",hint:"客人不会收这盘",danger:!0}}return n?.type==="plate"?{title:"空盘不能上菜",hint:"先摆好配料",blocked:!0}:n?{title:"上菜窗口只收装好的菜",hint:"把食材做成菜再来",blocked:!0}:{title:"上菜窗口",hint:"端一盘做好的菜过来"}}case"trash":return n?{title:`扔掉${Xe(n)}`,hint:"按 E · 眼不见心不烦",action:"丢弃"}:{title:"垃圾桶",hint:"端着不要的东西过来"};default:return null}}var Hf=(s,t,e)=>Math.max(t,Math.min(e,s)),Cl=class{constructor({canvas:t,session:e,hands:n,settings:i,audio:r,onPauseRequest:a,onDeviceChange:o}){this.canvas=t,this.session=e,this.hands=n,this.settings=i,this.audio=r,this.onPauseRequest=a,this.onDeviceChange=o,this.inputDevice="keyboard",this.paused=!1,this.active=!0,this.time=0,this.activeStation=null,this.nearestId=null,this.chopFxTimer=0,this.chopSoundTimer=0,this.steamTimer=0,this.handPop=0,this.handUid=null,this.sizzleLevel=0,this._initRenderer(),this._initScene(),this._initKitchen(),this._initParticles(),this._initPlayer(),this._initHands(),this._bindSession(),this.resize()}_initRenderer(){this.renderer=new bl({canvas:this.canvas,antialias:!0,powerPreference:"high-performance"});let t=Math.min(window.devicePixelRatio||1,1.5);this.pixelRatio=Math.min(2,t*(this.settings.quality||1)),this.renderer.setPixelRatio(this.pixelRatio),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=es,this.renderer.toneMapping=Wr,this.renderer.toneMappingExposure=.96,this.renderer.outputColorSpace=me}_initScene(){this.scene=new ji,this.scene.background=new Dt(1182472),this.scene.fog=new Mr(1313801,11,27),this.camera=new ke(this.settings.fov||74,16/9,.045,40),this.scene.add(this.camera);let t=new Ys(this.renderer);try{let i=t.fromScene(new wl,.05).texture;this.scene.environment=i,this.scene.environmentIntensity=.16,this.envTexture=i}catch{}t.dispose(),this.scene.add(new Hr(16769212,2757645,.42));let e=new Hs(16773336,1.9);e.position.set(3.6,6.4,4.2),e.castShadow=!0,e.shadow.mapSize.set(2048,2048),e.shadow.camera.near=.5,e.shadow.camera.far=22,e.shadow.camera.left=-7,e.shadow.camera.right=7,e.shadow.camera.top=6,e.shadow.camera.bottom=-6,e.shadow.bias=-4e-4,e.shadow.normalBias=.02,this.scene.add(e),this.scene.add(e.target);let n=new Hs(16742981,.65);n.position.set(-4,3,-3),this.scene.add(n)}_initKitchen(){this.kitchen=new Tl(this.scene),this.kitchen.update(0,this.session,null)}_initParticles(){this.steam=new ra(this.scene,{additive:!0,max:160,order:8}),this.bits=new ra(this.scene,{additive:!1,max:200,order:7})}_initPlayer(){this.player=new Al({camera:this.camera,canvas:this.canvas,settings:this.settings,onFootstep:()=>this.audio?.play("step",{volume:.6}),onPointerLockLost:()=>{this.active&&!this.paused&&this.onPauseRequest?.()},canLock:()=>this.active&&!this.paused&&this.session.state==="playing",onPauseRequest:()=>this.onPauseRequest?.(),onDeviceChange:t=>{this.inputDevice=t,this.onDeviceChange?.(t)}})}_initHands(){this.handGroup=new Zt,this.handGroup.position.set(.34,-.27,-.58),this.camera.add(this.handGroup),this.handItemRoot=new Zt,this.handItemRoot.position.y=-.02,this.handGroup.add(this.handItemRoot);let t=new Gt({color:14262383,roughness:.82}),e=new Gt({color:15854300,roughness:.9});this.armGroup=new Zt,this.handGroup.add(this.armGroup);let n=new Rt(new _n(.052,.075,.34,10),e);n.rotation.x=Math.PI/2,n.position.set(.02,-.2,.18),this.armGroup.add(n);let i=new Rt(new _n(.074,.078,.05,10),e);i.rotation.x=Math.PI/2,i.position.set(0,-.18,.03),this.armGroup.add(i);let r=new Rt(new un(.07,14,10),t);r.scale.set(1,.82,1.18),r.position.set(0,-.13,-.02),r.rotation.x=.25,this.armGroup.add(r);let a=new Rt(new un(.028,8,6),t);a.position.set(-.055,-.09,-.06),a.scale.set(1.4,.8,.9),this.armGroup.add(a),this.armGroup.visible=!1,this.knifeGroup=new Zt;let o=new Rt(new Be(.24,.012,.055),new Gt({color:14212576,metalness:.9,roughness:.22}));o.position.x=-.05;let l=new Rt(new Be(.13,.03,.05),new Gt({color:3810326,roughness:.7}));l.position.x=.13,this.knifeGroup.add(o,l),this.knifeGroup.position.set(.02,-.04,.02),this.knifeGroup.rotation.set(-.9,.1,.15),this.knifeGroup.visible=!1,this.handGroup.add(this.knifeGroup),this._refreshHandItem()}_refreshHandItem(){let t=this.hands.carry,e=t?.uid??null;if(e===this.handUid||(this.handUid=e,this.handItemRoot.clear(),!t))return;let n=El(t);n.scale.setScalar(.82),n.traverse(i=>{i.isMesh&&(i.castShadow=!1,i.receiveShadow=!1)}),n.position.y=.02,n.rotation.set(.15,-.35,.1),this.handItemRoot.add(n),this.handPop=1}_bindSession(){this.unsubs=[];let t=(e,n)=>this.unsubs.push(this.session.events.on(e,n));t("serve",e=>{let n=this.kitchen.stoveAnchor("pass")||new P(3.7,1.2,-2.75);Of(this.bits,new P(3.7,1.25,-2.7),34),this.kitchen.ringBell(),this.player.addTrauma(.42)}),t("chop:done",e=>{let n=this.kitchen.stationVisuals.get("board"),i=new P(-3.2,1.03,.3),r=Xt[e.item?.ingredient];Ih(this.bits,i,r?r.color:11184810,9),this.player.addTrauma(.12)}),t("cook:done",e=>{let n=this.kitchen.stoveAnchor(e.stationId);n&&Ph(this.steam,n,1.6),this.player.addTrauma(.08)}),t("cook:burn",e=>{let n=this.kitchen.stoveAnchor(e.stationId);if(n)for(let i=0;i<8;i++)Rl(this.bits,n);this.player.addTrauma(.24)}),t("order:expired",()=>this.player.addTrauma(.18)),t("topping",e=>{let n=new P(1.45,1.02,.3);kf(this.steam,n,4)}),t("trash",()=>{Rl(this.bits,new P(4.35,.9,2.55))}),t("dish:waste",()=>this.player.addTrauma(.12)),t("dish:unwanted",()=>this.player.addTrauma(.12))}resize(){let t=window.innerWidth,e=window.innerHeight;this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix()}applySettings(t){this.settings=t,this.player.applySettings(t);let e=Math.min(window.devicePixelRatio||1,1.5);this.pixelRatio=Math.min(2,e*(t.quality||1)),this.renderer.setPixelRatio(this.pixelRatio),this.resize()}findNearest(){let t=this.player.pos,e=this.player.forwardVector(new P),n=null,i=1/0;for(let r of On){let a=Math.max(r.x-r.w/2-t.x,0,t.x-(r.x+r.w/2)),o=Math.max(r.z-r.d/2-t.z,0,t.z-(r.z+r.d/2)),l=Math.hypot(a,o);if(l>1.55)continue;let c=r.x-t.x,u=r.z-t.z,d=Math.hypot(c,u)||1,h=c/d*e.x+u/d*e.z;if(h<.05)continue;let p=l-h*.35;p<i&&(i=p,n=r)}return n}update(t){this.time+=t,this.player.update(t),this._refreshHandItem();let e=this.findNearest();this.nearestId=e?.id??null,this.activeStation=e;let n=e?this.session.kitchen.getStation(e.id):null,i=this.hands,r=!1;if(n?.kind==="board"&&n.item&&!i.carry){let a=Xt[n.item.ingredient];a?.choppable&&n.item.state!=="chopped"&&this.player.chopHeld&&this.session.chopTick("board",i,t)?.active&&(r=!0,this.chopFxTimer-=t,this.chopSoundTimer-=t,this.chopFxTimer<=0&&(this.chopFxTimer=.17,Ih(this.bits,new P(e.x,1.03,e.z),a.color,3)),this.chopSoundTimer<=0&&(this.chopSoundTimer=.32,this.audio?.play("chop"),this.player.addTrauma(.035)))}this.player.consumeInteract()&&(n?n.kind==="board"&&n.item&&!i.carry&&Xt[n.item.ingredient]?.choppable&&n.item.state!=="chopped"||this.session.interact(n.id,i):this.audio?.play("ui",{volume:.4})),this.kitchen.update(t,this.session,this.nearestId,this.player.pos),this._updateStoveFx(t),this._updateHand(t,r),this._updateBoard(r),this.steam.update(t),this.bits.update(t)}_updateStoveFx(t){this.steamTimer-=t;let e=0;for(let n of["stove1","stove2"]){let i=this.session.kitchen.getStation(n);if(!(!i?.item||i.item.type!=="ingredient")){if(i.item.state==="burnt"){if(this.steamTimer<=0){let r=this.kitchen.stoveAnchor(n);r&&Rl(this.bits,r)}continue}if(e++,this.steamTimer<=0){let r=this.kitchen.stoveAnchor(n);r&&Ph(this.steam,r,.9+Math.random()*.5)}}}this.steamTimer<=0&&(this.steamTimer=.16),this.sizzleLevel+=((e>0?1:0)-this.sizzleLevel)*Math.min(1,t*6),this.audio?.setSizzle(this.sizzleLevel)}_updateHand(t,e){if(this.handGroup.position.set(.34+Math.sin(this.time*1.3)*.006+(this.player.isMoving?Math.sin(this.player.bobPhase)*.014:0),-.27+Math.sin(this.time*1.7)*.005+(this.player.isMoving?Math.cos(this.player.bobPhase*2)*.01:0),-.58),this.handPop>0){this.handPop=Math.max(0,this.handPop-t*4.5);let n=.82*(1+this.handPop*.5);this.handItemRoot.scale.setScalar(n)}else this.handItemRoot.scale.setScalar(.82);this.knifeGroup.visible=e,this.handItemRoot.visible=!e&&!!this.hands.carry,this.armGroup.visible=e||!!this.hands.carry,e&&(this.knifeGroup.rotation.x=-.9+Math.sin(this.time*26)*.55,this.knifeGroup.position.y=-.04+Math.sin(this.time*26)*.035)}_updateBoard(t){let e=this.kitchen.stationVisuals.get("board");e?.itemRoot&&(t?(e.itemRoot.rotation.z=Math.sin(this.time*34)*.025,e.itemRoot.position.y=1+Math.abs(Math.sin(this.time*20))*.004):(e.itemRoot.rotation.z*=.8,e.itemRoot.position.y=1),e.knife&&(e.knife.visible=!t))}render(){this.renderer.render(this.scene,this.camera)}getPrompt(){if(!this.activeStation)return null;let t=this.session.kitchen.getStation(this.activeStation.id),e=aa(t,this.hands,this.session.kitchen);if(!e)return null;let n=this.player.bindings.label("interact"),i=(e.hint||"").replace(/E/g,n);return t.kind==="board"&&t.item&&!this.hands.carry&&Xt[t.item.ingredient]?.choppable&&t.item.state!=="chopped"?{...e,key:n,hint:i}:{...e,key:n,hint:i}}getCrosshairState(){let t=this.getPrompt();return{visible:!0,interactable:!!this.activeStation,danger:!!t?.danger,chop:!1}}pause(){this.paused=!0,this.player.setEnabled(!1),this.player.exitLock(),this.audio?.setSizzle(0)}resume(){this.paused=!1,this.player.setEnabled(!0),this.player.requestLock()}stop(){this.active=!1,this.paused=!0,this.player.setEnabled(!1),this.player.exitLock(),this.audio?.setSizzle(0);for(let t of this.unsubs||[])t();this.unsubs=[]}dispose(){this.stop(),this.kitchen.dispose(),this.steam.dispose(),this.bits.dispose(),this.player.dispose(),this.envTexture?.dispose?.(),this.renderer.dispose(),this.scene.clear()}teleportToStation(t){let e=Hi[t];if(!e)return;let n=e.x,i;e.z<-2?i=e.z+1.3:e.z>1.5?i=e.z-1.05:i=e.z+1.3,n=Hf(n,-4.5,4.5),i=Hf(i,-3.1,3.1),this.player.teleport(n,i),this.player.lookAt(e.x,e.z),this.player.pitch=-.26}};var Ft=.28,Vf=3.35,gi=(s,t,e)=>Math.max(t,Math.min(e,s)),Il=["#ffb03a","#7ad0a3"],Gf=["#c97c12","#3e8f68"];function be(s,t,e,n,i,r){let a=Math.min(r,Math.abs(n)/2,Math.abs(i)/2);s.beginPath(),s.moveTo(t+a,e),s.arcTo(t+n,e,t+n,e+i,a),s.arcTo(t+n,e+i,t,e+i,a),s.arcTo(t,e+i,t,e,a),s.arcTo(t,e,t+n,e,a),s.closePath()}function iy(s){if(!s)return"";if(s.type==="plate"){let t=kn(s.contents);return t?t.emoji:(s.contents.length,"🍽️")}return s.state==="burnt"?"🥩":Xt[s.ingredient]?.emoji||"❓"}var Pl=class{constructor({canvas:t,session:e,settings:n,players:i=1,audio:r,onPauseRequest:a,onDeviceChange:o,touchEnabled:l=!1}){this.canvas=t,this.ctx=t.getContext("2d"),this.session=e,this.settings=n,this.audio=r,this.onPauseRequest=a,this.onDeviceChange=o,this.inputDevice="keyboard",this.playerCount=gi(i,1,2),this.time=0,this.paused=!1,this.active=!0,this.bindings=pn("arcade"),this.keyboard=new ls(this.bindings,{onDevice:c=>this._setDevice(c)}),this.pads=[new Vi({index:0,onDevice:c=>this._setDevice(c)}),new Vi({index:1,onDevice:c=>this._setDevice(c)})],this.touch=new ua({onPause:()=>this.onPauseRequest?.(),onDevice:c=>this._setDevice(c)}),this.touchEnabled=!!l,this.touch.setEnabled(this.touchEnabled),this.particles=[],this.shake=0,this.steamTimer=0,this.chopSoundTimer=0,this.sizzle=0,this.width=1,this.height=1,this.dpr=1,this.scale=100,this.cx=0,this.cy=0,this.unsubs=[],this.players=this._makePlayers(this.playerCount),this.nearest=new Map,this._bind(),this._bindSession(),this.resize()}_setDevice(t){this.inputDevice!==t&&(this.inputDevice=t,this.onDeviceChange?.(t))}get hands(){return this.players[0]?.hands??null}_makePlayers(t){let e=[{id:0,name:"P1",color:Il[0],dark:Gf[0],x:t===2?-.7:0,z:2.45,vx:0,vz:0,face:-Math.PI/2,hands:tr(),actions:{up:"p1Up",down:"p1Down",left:"p1Left",right:"p1Right",interact:"p1Interact"},interactQueued:!1,chopTimer:0,stepAccum:0,bob:0}];return t===2&&e.push({id:1,name:"P2",color:Il[1],dark:Gf[1],x:.7,z:2.45,vx:0,vz:0,face:-Math.PI/2,hands:tr(),actions:{up:"p2Up",down:"p2Down",left:"p2Left",right:"p2Right",interact:"p2Interact"},interactQueued:!1,chopTimer:0,stepAccum:0,bob:0}),e}_bind(){this._onBlur=()=>{this.keyboard.clear()},window.addEventListener("blur",this._onBlur)}_bindSession(){let t=(e,n)=>this.unsubs.push(this.session.events.on(e,n));t("serve",()=>{this._confetti(3.7,-2.7,30),this.shake=Math.min(1,this.shake+.55),this.bellFlash=1}),t("chop:done",e=>{let n=Hi.board;this._bits(n.x,n.z,Xt[e.item?.ingredient]?.color||"#aaaaaa",7)}),t("cook:done",()=>{this._steam(3.7,-2.7),this.shake=Math.min(1,this.shake+.15)}),t("cook:burn",e=>{let n=Hi[e.stationId];if(n)for(let i=0;i<8;i++)this._smoke(n.x,n.z);this.shake=Math.min(1,this.shake+.25)}),t("order:expired",()=>{this.shake=Math.min(1,this.shake+.2)}),t("topping",()=>this.shake=Math.min(1,this.shake+.08))}resize(){let t=Math.min(window.devicePixelRatio||1,2),e=window.innerWidth,n=window.innerHeight;this.dpr=t,this.width=e,this.height=n,this.canvas.width=Math.floor(e*t),this.canvas.height=Math.floor(n*t),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${n}px`,this.scale=Math.min(e/10.9,(n-132)/7.55),this.cx=e/2,this.cy=n/2+22}applySettings(t){if(this.settings=t,t.touchControls){let e=!1;try{e=new URLSearchParams(location.search).get("touch")==="1"}catch{e=!1}let n=ei()||e;this.touchEnabled=t.touchControls==="on"||t.touchControls!=="off"&&n,this.paused||this.touch.setEnabled(this.touchEnabled)}}sx(t){return this.cx+t*this.scale}sy(t){return this.cy+t*this.scale}stationDistance(t,e){let n=gi(t.x,e.x-e.w/2,e.x+e.w/2),i=gi(t.z,e.z-e.d/2,e.z+e.d/2);return Math.hypot(t.x-n,t.z-i)}nearestStation(t){let e=null,n=1.32;for(let i of On){let r=this.stationDistance(t,i);r<n&&(n=r,e=i)}return e}update(t){this.time+=t;let e=this.session.kitchen;this.nearest.clear(),this.keyboard.beginFrame();for(let i of this.pads)i.poll();this.pads.some(i=>i.pressedPause)&&this.onPauseRequest?.(),this.touch?.beginFrame?.();for(let i of this.players){let r=this.pads[i.id],a=0,o=0;this.keyboard.isDown(i.actions.up)&&(o-=1),this.keyboard.isDown(i.actions.down)&&(o+=1),this.keyboard.isDown(i.actions.left)&&(a-=1),this.keyboard.isDown(i.actions.right)&&(a+=1);let l=r.state;Math.hypot(l.moveX,l.moveY)>.12&&(a=l.moveX,o=l.moveY),i.id===0&&this.touch?.active&&this.touch.mag>.12&&(a=this.touch.x,o=this.touch.y);let u=Math.hypot(a,o)||1;a/=u,o/=u;let d=1-Math.exp(-14*t);i.vx+=(a*Vf-i.vx)*d,i.vz+=(o*Vf-i.vz)*d,Math.abs(i.vx)<.01&&(i.vx=0),Math.abs(i.vz)<.01&&(i.vz=0),i.x+=i.vx*t,i.z+=i.vz*t;let h=Math.hypot(i.vx,i.vz);h>.3&&(i.face=Math.atan2(i.vz,i.vx),i.bob+=t*9,i.stepAccum+=h*t,i.stepAccum>1.7&&(i.stepAccum=0,this.audio?.play("step",{volume:.45}))),this._resolve(i)}this._separatePlayers();for(let i of this.players){let r=this.nearestStation(i);this.nearest.set(i.id,r);let a=this.pads[i.id],o=a.state.interact||a.state.chop,l=i.id===0&&this.touch?.interactHeld,c=this.keyboard.isDown(i.actions.interact)||o||l,u=this.keyboard.pressed(i.actions.interact)||a.pressedInteract||i.interactQueued||i.id===0&&this.touch?.pressedInteract;if(i.interactQueued=!1,!r)continue;let d=e.getStation(r.id),h=d?.kind==="board"&&d.item&&!i.hands.carry&&Xt[d.item.ingredient]?.choppable&&d.item.state!=="chopped";h&&c?this.session.chopTick(r.id,i.hands,t)?.active&&(this.chopSoundTimer-=t,this.chopSoundTimer<=0&&(this.chopSoundTimer=.3,this.audio?.play("chop",{volume:.7}),this._bits(r.x,r.z,Xt[d.item.ingredient].color,2))):u&&(h||(this.session.interact(r.id,i.hands),this.shake=Math.min(1,this.shake+.04)))}this.touch?.endFrame?.(),this._updateParticles(t),this._updateSteam(t),this.shake=Math.max(0,this.shake-t*2.2),this.bellFlash&&(this.bellFlash=Math.max(0,this.bellFlash-t*1.8));let n=0;for(let i of["stove1","stove2"]){let r=e.getStation(i);r?.item?.type==="ingredient"&&r.item.state!=="burnt"&&n++,r?.item?.state}this.sizzle+=((n?1:0)-this.sizzle)*Math.min(1,t*6),this.audio?.setSizzle(this.sizzle)}_resolve(t){let e=on.minX+Ft,n=on.maxX-Ft,i=on.minZ+Ft,r=on.maxZ-Ft;t.x=gi(t.x,e,n),t.z=gi(t.z,i,r);for(let a=0;a<2;a++)for(let o of Qs){let l=gi(t.x,o.minX,o.maxX),c=gi(t.z,o.minZ,o.maxZ),u=t.x-l,d=t.z-c,h=u*u+d*d;if(h>=Ft*Ft)continue;if(h<1e-8){let y=t.x-o.minX,m=o.maxX-t.x,f=t.z-o.minZ,M=o.maxZ-t.z,A=Math.min(y,m,f,M);A===y?t.x=o.minX-Ft:A===m?t.x=o.maxX+Ft:A===f?t.z=o.minZ-Ft:t.z=o.maxZ+Ft;continue}let p=Math.sqrt(h),g=(Ft-p)/p;t.x+=u*g,t.z+=d*g}}_separatePlayers(){if(this.players.length<2)return;let[t,e]=this.players,n=e.x-t.x,i=e.z-t.z,r=Math.hypot(n,i),a=Ft*2.15;if(r>0&&r<a){let o=(a-r)/2,l=n/r,c=i/r;t.x-=l*o,t.z-=c*o,e.x+=l*o,e.z+=c*o}}_updateSteam(t){if(this.steamTimer-=t,!(this.steamTimer>0)){this.steamTimer=.08;for(let e of["stove1","stove2"]){let n=this.session.kitchen.getStation(e);!n?.item||n.item.type!=="ingredient"||(n.item.state==="burnt"?this._smoke(n.x,n.z):this._steam(n.x,n.z))}}}getPrompt(){let t=this.players[0];if(!t)return null;let e=this.nearest.get(t.id);if(!e)return null;let n=this.session.kitchen.getStation(e.id),i=aa(n,t.hands,this.session.kitchen);if(!i)return null;let r=this.bindings.primaryLabel("p1Interact");return{...i,key:r,hint:(i.hint||"").replace(/E/g,r)}}getCrosshairState(){return{visible:!1}}_spawnParticle(t){this.particles.length>260&&this.particles.shift(),this.particles.push(t)}_steam(t,e){this._spawnParticle({kind:"steam",x:t+(Math.random()-.5)*.2,z:e+(Math.random()-.5)*.2,h:.2,vh:.5+Math.random()*.3,life:1.1+Math.random()*.5,max:1.6,size:6+Math.random()*5,color:"rgba(255,235,205,0.5)"})}_smoke(t,e){this._spawnParticle({kind:"smoke",x:t+(Math.random()-.5)*.15,z:e+(Math.random()-.5)*.15,h:.2,vh:.4+Math.random()*.3,life:1.2+Math.random()*.5,max:1.7,size:8+Math.random()*6,color:"rgba(40,32,28,0.55)"})}_bits(t,e,n,i=4){for(let r=0;r<i;r++){let a=Math.random()*Math.PI*2,o=.8+Math.random()*1.4;this._spawnParticle({kind:"bit",x:t,z:e,vx:Math.cos(a)*o,vz:Math.sin(a)*o,h:.4,vh:1.2+Math.random()*1.2,life:.6,max:.6,size:3+Math.random()*3,color:n})}}_confetti(t,e,n=24){let i=["#ffb03a","#e8503a","#7ad0a3","#ffe8c8","#ff6f91","#6fc7ff"];for(let r=0;r<n;r++){let a=Math.random()*Math.PI*2,o=.8+Math.random()*2.2;this._spawnParticle({kind:"confetti",x:t,z:e,vx:Math.cos(a)*o,vz:Math.sin(a)*o,h:.5,vh:1.5+Math.random()*2,life:1+Math.random()*.6,max:1.6,size:3+Math.random()*4,color:i[r%i.length],rot:Math.random()*6})}}_updateParticles(t){for(let e=this.particles.length-1;e>=0;e--){let n=this.particles[e];if(n.life-=t,n.life<=0){this.particles.splice(e,1);continue}n.h+=n.vh*t,(n.kind==="bit"||n.kind==="confetti")&&(n.vh-=6*t,n.x+=(n.vx||0)*t,n.z+=(n.vz||0)*t,n.h<.02&&(n.h=.02,n.vh*=-.25))}}render(){let t=this.ctx,{width:e,height:n,dpr:i}=this;t.setTransform(i,0,0,i,0,0),t.clearRect(0,0,e,n);let r=t.createRadialGradient(e*.5,n*.42,80,e*.5,n*.5,Math.max(e,n)*.75);r.addColorStop(0,"#241510"),r.addColorStop(.55,"#140d0a"),r.addColorStop(1,"#0a0605"),t.fillStyle=r,t.fillRect(0,0,e,n);let a=(Math.random()-.5)*14*this.shake*this.shake,o=(Math.random()-.5)*14*this.shake*this.shake;t.save(),t.translate(this.cx+a,this.cy+o),t.scale(this.scale,this.scale),this._drawRoom(t),this._drawKitchen(t),this._drawStationHighlights(t),this._drawStations(t),this._drawPlayers(t),this._drawParticles(t),t.restore(),this._drawWorldLabels(t),this._drawPlayerPrompts(t)}_drawRoom(t){let e=on.minX,n=on.maxX,i=on.minZ,r=on.maxZ,a=t.createLinearGradient(0,i,0,r);a.addColorStop(0,"#5f3527"),a.addColorStop(1,"#7a4932"),t.fillStyle=a,t.fillRect(e,i,n-e,r-i);let o=.5;for(let h=i;h<r;h+=o)for(let p=e;p<n;p+=o){let g=Math.round((p-e)/o),y=Math.round((h-i)/o);t.fillStyle=(g+y)%2===0?"rgba(255,230,200,0.035)":"rgba(0,0,0,0.05)",t.fillRect(p+.01,h+.01,o-.02,o-.02)}t.strokeStyle="rgba(20,10,6,0.3)",t.lineWidth=.02;for(let h=e;h<=n;h+=1)t.beginPath(),t.moveTo(h,i),t.lineTo(h,r),t.stroke();for(let h=i;h<=r;h+=1)t.beginPath(),t.moveTo(e,h),t.lineTo(n,h),t.stroke();t.fillStyle="#7d2f24",be(t,-1.3,1.75,2.6,1.4,.12),t.fill(),t.strokeStyle="rgba(255,220,180,0.18)",t.lineWidth=.04,be(t,-1.2,1.85,2.4,1.2,.08),t.stroke();let l=t.createLinearGradient(e,.8,e,2.5);l.addColorStop(0,"#0d1730"),l.addColorStop(1,"#3c2c38"),t.fillStyle=l,t.fillRect(e,.9,.16,2);let c=-4.2,u=t.createLinearGradient(0,c,0,i);u.addColorStop(0,"#0e1d19"),u.addColorStop(1,"#1b352e"),t.fillStyle=u,t.fillRect(e-.28,c,n-e+.56,i-c),t.strokeStyle="rgba(180,220,205,0.07)",t.lineWidth=.012;for(let h=e;h<=n;h+=.38)t.beginPath(),t.moveTo(h,c),t.lineTo(h,i),t.stroke();for(let h=c+.18;h<i;h+=.2)t.beginPath(),t.moveTo(e-.28,h),t.lineTo(n+.28,h),t.stroke();t.save(),t.font='italic 900 0.34px "Arial Black", sans-serif',t.textAlign="center",t.textBaseline="middle",t.shadowColor="rgba(255,90,50,0.95)",t.shadowBlur=.22,t.fillStyle="rgba(255,150,100,0.95)",t.fillText("SIZZLE!",-2.7,c+.34),t.shadowBlur=.05,t.fillStyle="#fff0d8",t.fillText("SIZZLE!",-2.7,c+.34),t.restore();let d=t.createLinearGradient(0,c,0,i);d.addColorStop(0,"#100a07"),d.addColorStop(1,"rgba(255,150,80,0.55)"),t.fillStyle=d,t.fillRect(2.9,c+.09,1.9,.5),t.strokeStyle="#c08a3e",t.lineWidth=.03,t.strokeRect(2.9,c+.09,1.9,.5),this._drawWorldText(t,"上菜口",3.85,c+.36,.16,"rgba(255,220,180,0.9)"),t.fillStyle="#efe2c8",t.beginPath(),t.arc(.9,c+.38,.17,0,Math.PI*2),t.fill(),t.strokeStyle="#c08a3e",t.lineWidth=.025,t.stroke(),t.strokeStyle="#241610",t.lineWidth=.02,t.beginPath(),t.moveTo(.9,c+.38),t.lineTo(.9,c+.26),t.moveTo(.9,c+.38),t.lineTo(.99,c+.41),t.stroke(),t.fillStyle="#1a100c",t.fillRect(e-.28,r,n-e+.56,.28),t.fillRect(e-.28,c,.28,r-c),t.fillRect(n,c,.28,r-c),t.strokeStyle="rgba(255,200,150,0.08)",t.lineWidth=.02,t.strokeRect(e,i,n-e,r-i)}_drawKitchen(t){for(let r of Qs){if(r.id==="trash")continue;let a=r.maxX-r.minX,o=r.maxZ-r.minZ;t.fillStyle="rgba(0,0,0,0.35)",be(t,r.minX+.06,r.minZ+.1,a,o,.1),t.fill();let l=t.createLinearGradient(0,r.minZ,0,r.maxZ);l.addColorStop(0,"#9c6a3e"),l.addColorStop(.55,"#7a4c2b"),l.addColorStop(1,"#5a351d"),t.fillStyle=l,be(t,r.minX,r.minZ,a,o,.08),t.fill(),t.strokeStyle="rgba(30,15,8,0.7)",t.lineWidth=.025,t.stroke(),t.fillStyle="rgba(255,235,200,0.12)",be(t,r.minX+.04,r.minZ+.04,a-.08,o*.32,.05),t.fill(),t.strokeStyle="rgba(255,240,210,0.16)",t.lineWidth=.012,be(t,r.minX+.05,r.minZ+.05,a-.1,o-.1,.05),t.stroke()}let e=2.55,n=4.7,i=-3.42;t.fillStyle="rgba(10,6,4,0.85)",t.fillRect(e,i,n-e,.3),t.fillStyle="rgba(255,170,100,0.2)",t.fillRect(e+.08,i+.05,n-e-.16,.2),t.strokeStyle="#c08a3e",t.lineWidth=.03,t.strokeRect(e,i,n-e,.3),t.fillStyle="rgba(0,0,0,0.4)",t.beginPath(),t.ellipse(4.35,2.62,.42,.32,0,0,Math.PI*2),t.fill(),t.fillStyle="#3b444a",t.beginPath(),t.arc(4.35,2.55,.32,0,Math.PI*2),t.fill(),t.strokeStyle="#8a949a",t.lineWidth=.03,t.stroke(),t.fillStyle="#0d0b09",t.beginPath(),t.arc(4.35,2.55,.24,0,Math.PI*2),t.fill(),t.fillStyle="#d9a94d",t.beginPath(),t.arc(4.15,-2.88,.07,0,Math.PI*2),t.fill(),this.bellFlash>0&&(t.strokeStyle=`rgba(255,220,140,${this.bellFlash})`,t.lineWidth=.03,t.beginPath(),t.arc(4.15,-2.88,.14+(1-this.bellFlash)*.35,0,Math.PI*2),t.stroke())}_stationTopColor(t){switch(t.kind){case"board":return["#d8b072","#b1854b"];case"stove":return["#3a4247","#242a2e"];case"counter":return["#c9d1d5","#8b979e"];case"plateStack":return["#e8dcc4","#b8a88c"];default:return["#8a5a34","#5f3c21"]}}_drawStationHighlights(t){for(let e of this.players){let n=this.nearest.get(e.id);n&&(t.strokeStyle=e.color,t.globalAlpha=.55,t.lineWidth=.045,t.setLineDash([.12,.07]),t.lineDashOffset=-this.time*1.5,be(t,n.x-n.w/2-.08,n.z-n.d/2-.08,n.w+.16,n.d+.16,.08),t.stroke(),t.setLineDash([]),t.globalAlpha=1)}}_drawStations(t){let e=this.session.kitchen;for(let n of On){let i=e.getStation(n.id),r=n.w*.86,a=n.d*.86,o=n.x-r/2,l=n.z-a/2;if(n.kind==="trash"){this._drawWorldText(t,n.label,n.x,n.z+.42,.16,"rgba(247,232,208,0.6)");continue}if(n.kind==="crate"){t.fillStyle="rgba(0,0,0,0.3)",be(t,o+.03,l+.06,r,a,.05),t.fill();let h=t.createLinearGradient(0,l,0,l+a);h.addColorStop(0,"#b57d45"),h.addColorStop(1,"#6d4424"),t.fillStyle=h,be(t,o,l,r,a,.05),t.fill(),t.strokeStyle="rgba(40,20,10,0.7)",t.lineWidth=.02,t.stroke(),t.strokeStyle="rgba(40,22,12,0.45)",t.lineWidth=.015;for(let p=1;p<3;p++)t.beginPath(),t.moveTo(o+.04,l+a*p/3),t.lineTo(o+r-.04,l+a*p/3),t.stroke();this._drawEmoji(t,Xt[n.ingredient].emoji,n.x,n.z+.03,.34),this._drawWorldText(t,n.label,n.x,l+a+.2,.16,"rgba(247,232,208,0.72)");continue}let[c,u]=this._stationTopColor(n);t.fillStyle="rgba(0,0,0,0.32)",be(t,o+.03,l+.06,r,a,.06),t.fill();let d=t.createLinearGradient(0,l,0,l+a);d.addColorStop(0,c),d.addColorStop(1,u),t.fillStyle=d,be(t,o,l,r,a,.06),t.fill(),t.strokeStyle="rgba(20,12,8,0.6)",t.lineWidth=.02,t.stroke(),t.strokeStyle="rgba(255,255,255,0.14)",t.lineWidth=.012,be(t,o+.03,l+.03,r-.06,a-.06,.04),t.stroke(),this._drawStationDetail(t,n,i,o,l,r,a),this._drawWorldText(t,n.label,n.x,l+a+.19,.155,"rgba(247,232,208,0.68)")}}_drawStationDetail(t,e,n,i,r,a,o){let l=this.session.kitchen;if(e.kind==="board"&&(t.save(),t.translate(e.x+.3,e.z+.15),t.rotate(-.45),t.fillStyle="#cfd6da",be(t,-.16,-.025,.24,.05,.01),t.fill(),t.fillStyle="#3a2416",be(t,.08,-.02,.12,.04,.01),t.fill(),t.restore()),e.kind==="stove"&&(t.fillStyle="#1a1d1f",t.beginPath(),t.arc(e.x,e.z,.28,0,Math.PI*2),t.fill(),t.strokeStyle="#5c6569",t.lineWidth=.025,t.stroke(),t.fillStyle="#2d3438",t.beginPath(),t.arc(e.x,e.z,.21,0,Math.PI*2),t.fill(),t.strokeStyle="#3a2416",t.lineWidth=.06,t.beginPath(),t.moveTo(e.x+.27,e.z),t.lineTo(e.x+.5,e.z),t.stroke(),n.item&&n.item.state!=="burnt")){let c=.55+Math.sin(this.time*9+e.x)*.15;t.strokeStyle=`rgba(255,120,40,${.5*c})`,t.lineWidth=.05,t.beginPath(),t.arc(e.x,e.z,.23,0,Math.PI*2),t.stroke()}if(e.kind==="plateStack")for(let c=0;c<5;c++)t.fillStyle=c%2?"#f4eee3":"#e2d8c5",t.beginPath(),t.ellipse(e.x,e.z+.06-c*.03,.19,.13,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(120,100,80,0.4)",t.lineWidth=.012,t.stroke();e.kind==="counter"&&(t.fillStyle="rgba(255,240,210,0.1)",be(t,e.x-.32,e.z-.24,.64,.48,.04),t.fill()),e.kind==="pass"&&this._drawEmoji(t,"🛎️",e.x+.45,e.z+.08,.26),n.item&&this._drawStationItem(t,e,n.item,l)}_drawStationItem(t,e,n,i){let r=(e.kind==="stove",0);if(n.type==="plate"){t.fillStyle="#f4eee3",t.beginPath(),t.ellipse(e.x,e.z+r,.22,.16,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(120,100,80,0.5)",t.lineWidth=.015,t.stroke();let o=n.contents.length,l=kn(n.contents);o&&n.contents.slice(0,6).forEach((c,u)=>{let d=u/Math.max(1,Math.min(6,o))*Math.PI*2;this._drawEmoji(t,Xt[c.ingredient].emoji,e.x+Math.cos(d)*.09,e.z+Math.sin(d)*.06,.14)}),l&&(this._drawEmoji(t,l.emoji,e.x,e.z-.02,.2),this._drawCheck(t,e.x+.24,e.z-.18,.09));return}let a=Xt[n.ingredient];if(this._drawEmoji(t,n.state==="burnt"?"🥩":a.emoji,e.x,e.z+r,.3),n.state==="burnt"?(t.strokeStyle="rgba(232,80,58,0.9)",t.lineWidth=.03,t.beginPath(),t.arc(e.x,e.z,.17,0,Math.PI*2),t.stroke(),this._drawWorldText(t,"焦",e.x+.18,e.z-.16,.11,"#ff7a5e")):n.state==="cooked"&&this._drawCheck(t,e.x+.18,e.z-.16,.08),e.kind==="stove"&&n.state!=="burnt"){let o=i.cookProgress(i.getStation(e.id));t.strokeStyle=n.state==="cooked"?"#7ad0a3":"#f6a623",t.lineWidth=.035,t.beginPath(),t.arc(e.x,e.z,.32,-Math.PI/2,-Math.PI/2+o*Math.PI*2),t.stroke()}if(e.kind==="board"&&a?.choppable&&n.state!=="chopped"){let o=Math.min(1,(n.chopProgress||0)/a.chopTime),l=.7;t.fillStyle="rgba(0,0,0,0.5)",be(t,e.x-l/2,e.z-.42,l,.08,.04),t.fill(),t.fillStyle="#f6a623",be(t,e.x-l/2,e.z-.42,l*o,.08,.04),t.fill()}}_drawCheck(t,e,n,i){t.fillStyle="#7ad0a3",t.beginPath(),t.arc(e,n,i,0,Math.PI*2),t.fill(),t.strokeStyle="#10241a",t.lineWidth=i*.28,t.beginPath(),t.moveTo(e-i*.45,n),t.lineTo(e-i*.1,n+i*.38),t.lineTo(e+i*.5,n-i*.4),t.stroke()}_drawPlayers(t){for(let e of this.players){if(t.fillStyle="rgba(0,0,0,0.4)",t.beginPath(),t.ellipse(e.x,e.z+.12,Ft*1.15,Ft*.72,0,0,Math.PI*2),t.fill(),this.nearest.get(e.id)&&(t.strokeStyle=e.color,t.globalAlpha=.5,t.lineWidth=.03,t.beginPath(),t.arc(e.x,e.z,Ft+.08+Math.sin(this.time*5)*.02,0,Math.PI*2),t.stroke(),t.globalAlpha=1),t.fillStyle=e.dark,t.beginPath(),t.arc(e.x,e.z+.02,Ft,0,Math.PI*2),t.fill(),t.fillStyle=e.color,t.beginPath(),t.arc(e.x,e.z,Ft*.94,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255,250,240,0.85)",be(t,e.x-Ft*.55,e.z-Ft*.1,Ft*1.1,Ft*.9,Ft*.3),t.fill(),t.fillStyle="#f0c9a0",t.beginPath(),t.arc(e.x,e.z-Ft*.55,Ft*.52,0,Math.PI*2),t.fill(),t.fillStyle="#fff8ec",be(t,e.x-Ft*.44,e.z-Ft*1.28,Ft*.88,Ft*.42,Ft*.18),t.fill(),t.beginPath(),t.arc(e.x-Ft*.26,e.z-Ft*1.22,Ft*.24,0,Math.PI*2),t.arc(e.x+Ft*.02,e.z-Ft*1.3,Ft*.28,0,Math.PI*2),t.fill(),t.fillStyle="rgba(20,10,5,0.55)",t.beginPath(),t.arc(e.x+Math.cos(e.face)*Ft*.55,e.z+Math.sin(e.face)*Ft*.55,Ft*.12,0,Math.PI*2),t.fill(),e.hands.carry){let i=Math.sin(this.time*4+e.id)*.03,r=e.hands.carry;r.type==="plate"&&(t.fillStyle="#f4eee3",t.beginPath(),t.ellipse(e.x,e.z-Ft*1.9+i,.22,.1,0,0,Math.PI*2),t.fill()),this._drawEmoji(t,iy(r),e.x,e.z-Ft*2+i,.26)}if(t.font='700 0.17px "Trebuchet MS", sans-serif',t.textAlign="center",t.textBaseline="middle",t.fillStyle=e.color,t.fillText(e.name,e.x,e.z+Ft*1.5),this.time<14){let i=this.bindings.primaryLabel(e.actions.interact),r=.5;t.fillStyle="rgba(0,0,0,0.6)",be(t,e.x-r/2,e.z+Ft*1.68,r,.2,.05),t.fill(),t.strokeStyle=e.color,t.lineWidth=.012,t.stroke(),t.fillStyle="rgba(247,232,208,0.9)",t.font='700 0.12px "Microsoft YaHei", sans-serif',t.fillText(i,e.x,e.z+Ft*1.78)}}}_drawParticles(t){for(let e of this.particles){let n=Math.max(0,Math.min(1,e.life/Math.min(.45,e.max)));t.globalAlpha=n,e.kind==="steam"||e.kind==="smoke"?(t.fillStyle=e.color,t.beginPath(),t.arc(e.x,e.z-e.h,e.size/100,0,Math.PI*2),t.fill()):(t.save(),t.translate(e.x,e.z-e.h),t.rotate(e.rot||0),t.fillStyle=e.color,t.fillRect(-e.size/200,-e.size/200,e.size/100,e.size/100),t.restore()),t.globalAlpha=1}}_drawEmoji(t,e,n,i,r){t.font=`${r}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(e,n,i)}_drawWorldText(t,e,n,i,r,a){t.font=`700 ${r}px "Microsoft YaHei", "PingFang SC", sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillStyle="rgba(0,0,0,0.5)",t.fillText(e,n+.008,i+.012),t.fillStyle=a,t.fillText(e,n,i)}_drawWorldLabels(t){let e=(n,i,r,a,o,l="center")=>{t.font=`700 ${a}px "Microsoft YaHei", "PingFang SC", sans-serif`,t.textAlign=l,t.textBaseline="middle",t.fillStyle="rgba(0,0,0,0.55)",t.fillText(n,i+1,r+2),t.fillStyle=o,t.fillText(n,i,r)}}_drawPlayerPrompts(t){let e=this.players[1];if(!e)return;let n=this.nearest.get(e.id);if(!n)return;let i=this.session.kitchen.getStation(n.id),r=aa(i,e.hands,this.session.kitchen);if(!r||r.blocked)return;let a=this.sx(n.x),o=this.sy(n.z-n.d/2)-46;t.font='700 12px "Microsoft YaHei", sans-serif';let l=Math.max(96,t.measureText(r.title).width+42);t.fillStyle="rgba(18,11,8,0.88)",be(t,a-l/2,o-17,l,30,8),t.fill(),t.strokeStyle=Il[1],t.lineWidth=1.5,t.stroke(),t.fillStyle=Il[1],t.fillRect(a-l/2+5,o-12,4,20),t.fillStyle="#f7e8d0",t.textAlign="left",t.textBaseline="middle",t.font='700 11px "Microsoft YaHei", sans-serif',t.fillText(this.bindings.primaryLabel("p2Interact"),a-l/2+14,o-2),t.fillStyle="rgba(247,232,208,0.85)",t.font='700 12px "Microsoft YaHei", sans-serif',t.fillText(r.title,a-l/2+56,o-2)}pause(){this.paused=!0,this.keyboard.setEnabled(!1),this.touch.setEnabled(!1),this.audio?.setSizzle(0)}resume(){this.paused=!1,this.keyboard.setEnabled(!0),this.touch.setEnabled(this.touchEnabled)}stop(){this.active=!1,this.paused=!0;for(let t of this.unsubs)t();this.unsubs=[],this.audio?.setSizzle(0)}dispose(){this.stop(),this.keyboard.dispose(),this.touch?.dispose?.(),window.removeEventListener("blur",this._onBlur)}teleportToStation(t,e=0){let n=Hi[t],i=this.players[e];if(!n||!i)return;let r;n.z<-2?r=n.z+1.1:n.z>1.5?r=n.z-1.05:r=n.z+1.15,i.x=gi(n.x,-4.5,4.5),i.z=gi(r,-3.1,3.1),i.vx=i.vz=0,i.face=Math.atan2(n.z-i.z,n.x-i.x)}};var Wf=(s,t,e)=>Math.max(t,Math.min(e,s)),Lh=class{constructor(){this.settings=Wi(),this.ui=new _a(this),this.audio=new xa(this.settings),this.modeName="fp",this.levelId=1,this.players=1,this.session=null,this.mode=null,this.hands=null,this.paused=!1,this.active=!1,this.resultsOpen=!1,this.lastTs=0,this.settingsReturn=null,this.dataReturn=null,this.inputDevice="keyboard",this._sessionSubs=[],this._blockedAt=0,this._lastFrame=performance.now(),this.canvasFP=document.getElementById("fp-canvas"),this.canvas2D=document.getElementById("arcade-canvas"),this._bindGlobal(),this._bindActions(),this.ui.showMenu(),setTimeout(()=>this.ui.bootDone(),500),window.__SIZZLE__={app:this,start:(t="fp",e=1,n=1)=>this.startShift(t,e,n),pause:()=>this.pause(),resume:()=>this.resume(),finish:()=>this.session?.finish(),get session(){return window.__SIZZLE__.app.session},get mode(){return window.__SIZZLE__.app.mode},get ui(){return window.__SIZZLE__.app.ui},giveDish:(t="cheeseburger")=>this.debugGiveDish(t),teleport:t=>this.mode?.teleportToStation?.(t),interact:t=>this.session?.interact(t,this.mode?.hands),setScore:t=>{this.session&&(this.session.score=t)}},requestAnimationFrame(this._loop)}_bindActions(){let t={help:()=>{this.settingsReturn=null,this.ui.show("help")},pause:()=>this.pause(),mute:()=>this.toggleMute(),resume:()=>this.resume(),restart:()=>this.startShift(this.modeName,this.levelId,this.players),retry:()=>this.startShift(this.modeName,this.levelId,this.players),menu:()=>this.toMenu(),next:()=>{this.levelId<ln.length?this.startShift(this.modeName,this.levelId+1,this.players):this.toMenu()},"reset-progress":()=>{Iu(),this.ui._renderStarsTotal(),this.ui._renderShiftList(this.modeName),this.ui.toast("最佳记录已清空")},"playtest-data":()=>{let e=this.ui.screen==="results"||this.ui.screen==="pause"?this.ui.screen:"settings";this.dataReturn=()=>this.ui.show(e),this.ui.showPlaytestData()},"export-csv":()=>{this._download(`sizzle-rush-playtest-${new Date().toISOString().slice(0,10)}.csv`,su(),"text/csv;charset=utf-8")},"export-json":()=>{this._download(`sizzle-rush-playtest-${new Date().toISOString().slice(0,10)}.json`,ru(),"application/json;charset=utf-8")},"clear-playtest":()=>{typeof confirm=="function"&&!confirm("清空本机所有试玩记录？导出备份后再操作。")||(au(),this.ui.showPlaytestData())},album:()=>{let e=this.ui.screen==="modes"?"modes":"menu";this.albumReturn=()=>this.ui.show(e),this.ui.showAlbum()},"export-album":()=>this.ui.exportAlbum(),"print-album":()=>{try{window.print()}catch{}}};this.ui.onAction=(e,n)=>{t[e]=n},this.ui.actions=t,this.onAction=e=>{if(e==="settings"){this.settingsReturn=this.paused||this.resultsOpen?()=>this.ui.show(this.resultsOpen?"results":"pause"):null,this.ui.show("settings");return}let n=t[e];n&&(this.audio.unlock(),this.audio.play("ui"),n())},this.ui.app=this}_bindGlobal(){window.addEventListener("resize",()=>this.mode?.resize?.()),document.addEventListener("pointerlockerror",()=>{}),window.addEventListener("keydown",t=>{if(t.code==="Escape"){if(this.ui.screen==="settings"){typeof this.settingsReturn=="function"?this.settingsReturn():this.ui.show("menu");return}if(this.ui.screen==="help"){this.ui.show("menu");return}if(!this.active)return;if(this.resultsOpen){this.toMenu();return}this.paused?this.resume():this.pause()}})}playClick(){this.audio.unlock(),this.audio.startMusic(),this.audio.setIntensity(.16),this.audio.play("ui")}startShift(t=this.modeName,e=this.levelId,n=this.players){let i=ec(Nl[e]||ln[0],t),r=this.ui?.getRsiRecommendation?.(i)||ds(i),a={...i,recipes:[...new Set([...r.ids,...i.recipes])],featured:r.ids};this.activeRecommendation=r,this.activeLevel=a,this.modeName=t,this.levelId=a.id,this.players=n,this.ui.modeSelection=t,this.ui.levelSelection=a.id,this.ui.playerCount=n,this.audio.unlock(),this.audio.startMusic(),this.audio.setSizzle(0),this.audio.setIntensity(.28),this._teardown(),this.session=new Sa(a,{seed:Math.floor(Math.random()*1e9),mode:t,recommended:r.ids}),this.paused=!1,this.resultsOpen=!1,this.active=!0,this.inputDevice="keyboard",this.pauseCount=0,this.settingsReturn=null,this.ui.hideScreens(),this.ui.showHUD(t,a),this.ui.setupTutorial(t,t==="fp"?this.settings.showHints!==!1&&a.id===1:this.settings.showHints!==!1&&a.id===1),this.ui.showLevelIntro(a,t),document.getElementById("fp-canvas").classList.toggle("hidden",t!=="fp"),document.getElementById("arcade-canvas").classList.toggle("hidden",t!=="arcade");let o=this.settings.touchControls||"auto",l=typeof location<"u"&&new URLSearchParams(location.search).get("touch")==="1",c=t==="arcade"&&(o==="on"||o!=="off"&&(ei()||l));t==="fp"?(this.hands=tr(),this.mode=new Cl({canvas:this.canvasFP,session:this.session,hands:this.hands,settings:this.settings,audio:this.audio,onPauseRequest:()=>this.pause(),onDeviceChange:u=>{this.inputDevice=u,this.ui.setInputDevice?.(u)}})):(this.mode=new Pl({canvas:this.canvas2D,session:this.session,settings:this.settings,players:n,audio:this.audio,onPauseRequest:()=>this.pause(),onDeviceChange:u=>{this.inputDevice=u,this.ui.setInputDevice?.(u)},touchEnabled:c}),this.hands=this.mode.hands),t==="fp"&&o!=="off"&&ei()&&this.ui.toast("第一人称需要键鼠或手柄；触屏建议玩街机厨房","bad"),this._bindSessionEvents(),this.lastTs=performance.now(),this._setHudVisibility(!0)}_bindSessionEvents(){let t=this.session,e=(i,r)=>this._sessionSubs.push(t.events.on(i,r)),n=this.ui;e("pickup",()=>{this.audio.play("pickup"),n.tutorialEvent("pickup")}),e("place",()=>this.audio.play("place")),e("topping",()=>{this.audio.play("place"),n.tutorialEvent("topping")}),e("chop:done",()=>{this.audio.play("chopDone"),n.tutorialEvent("chop:done")}),e("cook:done",()=>{this.audio.play("cookDone"),n.toast("肉饼熟了，快拿走","good"),n.tutorialEvent("cook:done")}),e("cook:burn",()=>{this.audio.play("burn"),n.toast("烧焦了！扔进垃圾桶，别上菜","bad")}),e("serve",i=>{this.audio.play("serve"),n.tutorialEvent("serve"),n.scorePop(i.points);let r=i.comboAfter>1?` · 连击 ×${(1+Math.min(i.comboAfter-1,4)*.25).toFixed(2)}`:"";n.toast(`${i.recipe.name} +${i.points}${r}`,"good"),i.comboAfter>1&&setTimeout(()=>this.audio.play("combo"),140)}),e("dish:waste",()=>{this.audio.play("waste"),n.toast("这盘菜没人认得出来…","bad")}),e("dish:unwanted",i=>{this.audio.play("waste"),n.toast(`没有客人点${i.recipe.name}`,"bad")}),e("order:new",()=>this.audio.play("orderNew")),e("order:expired",()=>{this.audio.play("expire"),n.toast("订单超时，客人走了","bad")}),e("blocked",i=>{let r=performance.now();i.message&&r-this._blockedAt>1600&&(this._blockedAt=r,n.toast(i.message,"bad"))}),e("trash",()=>this.audio.play("trash")),e("level:end",i=>this._onLevelEnd(i))}_onLevelEnd(t){if(this.resultsOpen)return;this.resultsOpen=!0,this.paused=!0,this.audio.setIntensity(.08),this.audio.play("result"),this.mode?.pause?.();let e=this.activeLevel||ec(Nl[this.levelId],this.modeName),n=Tu(this.modeName,this.levelId),i=this.session.score>n.score||this.session.stars>n.stars;Au(this.modeName,this.levelId,this.session.score,this.session.stars);let r=null;if(this.settings.recordPlaytest!==!1){let o=this.settings.playtestProfile||{};try{r=eu({mode:this.modeName,level:e.id,players:this.players,source:typeof navigator<"u"&&navigator.webdriver?"automation":"human",device:this.mode?.inputDevice||this.inputDevice||"keyboard",participant:o.participant||"",skill:o.skill||"unknown",firstTime:o.firstTime!==!1,duration:this.session.elapsed,firstServe:this.session.firstServeAt,pauses:this.pauseCount,score:this.session.score,stars:this.session.stars,served:this.session.stats.served,expired:this.session.stats.expired,wasted:this.session.stats.wasted,burnt:this.session.stats.burnt,maxCombo:this.session.maxCombo})}catch{r=null}}let a=null;try{a=bu({mode:this.modeName,level:e.id,players:this.players,recommended:this.activeRecommendation?.ids||e.recipes||[],dishCounts:this.session.stats.dishCounts,served:this.session.stats.served,score:this.session.score,stars:this.session.stars,timeoutRate:this.session.stats.expired/Math.max(1,this.session.stats.expired+this.session.stats.served),difficulty:r?.difficulty||0,wantReplay:r?.wantReplay||""}),this.lastRsiResult=a}catch{a=null}setTimeout(()=>{this.resultsOpen&&(this.ui.showResults({session:this.session,mode:this.modeName,level:e,best:n,isBest:i,recorded:r,rsiResult:a}),this.ui._renderStarsTotal())},700)}_download(t,e,n){try{let i=new Blob([e],{type:n}),r=URL.createObjectURL(i),a=document.createElement("a");a.href=r,a.download=t,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(r),1500)}catch{}}pause(){!this.active||this.paused||this.resultsOpen||(this.paused=!0,this.pauseCount++,this.mode?.pause?.(),this.audio.setSizzle(0),this.audio.setIntensity(.05),this.ui.showPause(this.session))}resume(){!this.active||this.resultsOpen||(this.paused=!1,this.ui.hideScreens(),this.mode?.resume?.(),this.audio.setIntensity(this._intensity()))}toMenu(){this._teardown(),this.active=!1,this.paused=!1,this.resultsOpen=!1,this.audio.setSizzle(0),this.audio.setIntensity(.14),this.ui.showMenu()}_teardown(){for(let t of this._sessionSubs)t();if(this._sessionSubs=[],this.mode){try{this.mode.dispose()}catch{}this.mode=null}this.session=null,this.hands=null}_setHudVisibility(t){this.ui.refs.hud.classList.toggle("hidden",!t)}_intensity(){if(!this.session)return .2;let t=1-this.session.timeLeft/this.session.duration;return Wf(.28+t*.35+this.session.combo*.05,.2,1)}toggleMute(){this.audio.unlock(),this.audio.setMuted(!this.audio.muted),this.ui.setMuteIcon(this.audio.muted)}onSettingsChange(t){this.settings=t,this.audio.setSettings(t),this.mode?.applySettings?.(t)}debugGiveDish(t="cheeseburger"){if(!this.session||!this.mode)return null;let e=Re[t];if(!e)return null;let n=Fl();n.contents=e.ingredients.map(a=>({...a}));let i=this.mode.hands||this.hands;i.carry=n,this.mode.players?.[0]&&(this.mode.players[0].hands.carry=n);let r=this.session.orders.tickets.find(a=>a.recipeId===t)||(()=>{let a={id:9e3+Math.floor(Math.random()*1e3),recipeId:t,maxTime:70,time:70,done:!1,spawnedAt:0};return this.session.orders.tickets.push(a),a})();return{plate:n,ticket:r}}_loop=t=>{requestAnimationFrame(this._loop);let e=(t-this.lastTs)/1e3;this.lastTs=t;let n=Wf(Number.isFinite(e)?e:.016,0,.1);!this.active||!this.session||!this.mode||(!this.paused&&this.session.state==="playing"&&(this.session.tick(n),this.mode.update(n),this.ui.updateGame(this.session,this.mode),this.audio.setIntensity(this._intensity())),this.mode.render(n))}},sy=new Lh,zM=sy;})();
