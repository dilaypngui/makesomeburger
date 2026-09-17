/* Pre-rendered food sprites with live 3D positioning. No GPU requirement. */
(function(){
  const atlas=new Image();
  window.burgerArtReady=new Promise((resolve,reject)=>{atlas.onload=resolve;atlas.onerror=()=>reject(new Error('Malzeme görselleri yüklenemedi.'));});
  atlas.src='./ingredients-toon.png';
  function tightFrame(index){
    // Sprite atlas objects are not perfectly aligned to the grid. Explicit bounds exclude neighboring art.
    const bounds=[[30,68,280,224],[337,82,278,211],[643,73,269,216],[950,80,279,225],[28,349,294,254],[340,401,270,191],[638,373,285,231],[949,390,278,214],[29,646,288,260],[338,677,280,210],[652,676,267,208],[964,676,261,211],[43,965,259,216],[337,966,275,220],[643,911,279,310],[974,944,249,255]];
    return bounds[index].map((v,i)=>v*(i%2?atlas.naturalHeight:atlas.naturalWidth)/1254);
  }
  function frame(index){const w=atlas.naturalWidth/4,h=atlas.naturalHeight/4;if(index===10)return tightFrame(index);return [(index%4)*w,Math.floor(index/4)*h,w,h];}

  window.burgerIcon=function(index){const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');const cw=atlas.naturalWidth/4,ch=atlas.naturalHeight/4;x.drawImage(atlas,...frame(index),0,0,160,160);return c.toDataURL('image/png');};
  // Compose recipes from the same ingredient atlas used on the board; never use the premade meat burger.
  const recipeCache=new Map();
  window.recipeLayers=function(ings){return [6].concat(ings.slice().sort((a,b)=>a-b)).concat([0]);};
  window.recipeCanvas=function(ings){
    const key=ings.slice().sort((a,b)=>a-b).join(',');
    if(recipeCache.has(key))return recipeCache.get(key);
    const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
    const layers=window.recipeLayers(ings);
    // Bottom-to-top rendering preserves duplicate portions and keeps each filling visible.
    x.drawImage(atlas,...tightFrame(6),22,161,212,59);
    layers.slice(1,-1).forEach((ing,i)=>{
      const widths={1:232,2:222,3:230,4:236,5:218,7:221,8:226,9:222,10:205,11:205,12:205,13:219};
      const w=widths[ing]||222,y=149-i*18;
      x.drawImage(atlas,...tightFrame(ing),(256-w)/2,y,w,47);
    });
    x.drawImage(atlas,...tightFrame(0),17,32,222,101);
    if(recipeCache.size>180)recipeCache.delete(recipeCache.keys().next().value);
    recipeCache.set(key,c);return c;
  };
  window.recipeIcon=function(ings){return window.recipeCanvas(ings).toDataURL('image/png');};
  window.PastelRenderer=class{
    constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d',{alpha:true});this.shadowMap={};this.ratio=1;this.w=1;this.h=1;this.isSpriteRenderer=true;this.sceneState=null;}
    setPixelRatio(r){this.ratio=Math.min(r,2);}
    setSize(w,h){this.w=w;this.h=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
    setState(state){this.sceneState=state;}
    dispose(){}
    point(x,y,z,camera){const p=new THREE.Vector3(x,y,z).project(camera);return {x:(p.x+1)*this.w/2,y:(1-p.y)*this.h/2};}
    render(scene,camera){
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      const ctx=this.ctx;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.clearRect(0,0,this.w,this.h);
      const st=this.sceneState;if(!st||!atlas.complete)return;
      const p=(x,y,z)=>this.point(x,y,z,camera);
      const cacheKey=[this.w,this.h,st.mode,st.rows,st.cols,st.trayCount,st.hover,st.selected,st.near.join(','),st.wood,!!st.decor.mat,st.belt].join('/');
      if(this.backgroundKey===cacheKey&&this.background){ctx.drawImage(this.background,0,0,this.w,this.h);}else{
      const path=(x,z,w,d,r,y)=>{
        const pts=[];const arcs=[[x+w/2-r,z+d/2-r,0],[x-w/2+r,z+d/2-r,Math.PI/2],[x-w/2+r,z-d/2+r,Math.PI],[x+w/2-r,z-d/2+r,Math.PI*1.5]];
        for(const [cx,cz,start]of arcs)for(let i=0;i<=8;i++){const a=start+i/8*Math.PI/2;pts.push(p(cx+Math.cos(a)*r,y||0,cz+Math.sin(a)*r));}
        ctx.beginPath();pts.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();
      };
      const surface=(x,z,w,d,colors,r,depth)=>{
        const top=p(x,0,z-d/2),bot=p(x,0,z+d/2),gradient=ctx.createLinearGradient(top.x,top.y,bot.x,bot.y);
        gradient.addColorStop(0,colors[0]);gradient.addColorStop(.5,colors[1]);gradient.addColorStop(1,colors[2]);
        ctx.save();ctx.shadowColor='#61422240';ctx.shadowBlur=12;ctx.shadowOffsetY=8;
        path(x,z,w,d,r,-(depth||.13));ctx.fillStyle=colors[2];ctx.fill();ctx.restore();
        path(x,z,w,d,r,0);ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle=colors[3]||'#fff1ce';ctx.lineWidth=2;ctx.stroke();
      };
      const woodColors={mese:['#eaba77','#d49c56','#b57a3a','#ffdfa6'],ceviz:['#a76a3d','#82502d','#61391f','#c8945b'],kiraz:['#ffdc7e','#e9b343','#be8224','#fff2ad'],kulrengi:['#a1aca1','#758b83','#536a65','#ced4bc']};
      const wood=woodColors[st.wood]||woodColors.mese;
      if(st.decor.mat){
        surface(0,0,st.boardW+.1,st.boardD+.15,wood,.36,.12);
        ctx.strokeStyle='#68381222';ctx.lineWidth=1;
        for(let i=1;i<12;i++){const z=-st.boardD/2+i*st.boardD/12,a=p(-st.boardW/2,.01,z),b=p(st.boardW/2,.01,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      // Individual raised cream platters leave the turquoise counter visible between lanes.
      for(let c=0;c<st.cols;c++){
        const active=c===st.hover,near=st.near[c],x=st.colX(c);
        const cream=active?['#fffcc5','#fff0a5','#e8bf66','#ffffdc']:['#fff8df','#fff0cf','#ead5a7','#fffde8'];
        if(st.wood!=="mese")surface(x,0,1.70,st.boardD-.06,wood,.29,.18);
        surface(x,0,1.64,st.boardD-.12,cream,.28,.14);
        path(x,0,1.48,st.boardD-.29,.24,.016);ctx.strokeStyle=active?'#edaf27':'#e5c997';ctx.lineWidth=2;ctx.stroke();
        if(near||active){path(x,0,1.65,st.boardD-.1,.28,.02);ctx.strokeStyle=active?'#fff879':'#82ca38';ctx.lineWidth=3;ctx.stroke();}
        if(active){const a=p(x,.05,st.rowZ(0)-.2);ctx.fillStyle='#f7a824';ctx.beginPath();ctx.moveTo(a.x-6,a.y-10);ctx.lineTo(a.x+6,a.y-10);ctx.lineTo(a.x,a.y-2);ctx.fill();}
      }
      const trayW=(st.trayCount-1)*st.traySpace+1.6;
      if(st.belt){surface(0,st.handZ,trayW+.16,1.96,['#b4c4c0','#6d817d','#465f59','#dce8d9'],.3,.16);for(let n=0;n<18;n++){const x=-trayW/2+n*trayW/17,a=p(x,.02,st.handZ+.94);ctx.fillStyle='#e5ead7';ctx.beginPath();ctx.ellipse(a.x,a.y,3,2,0,0,Math.PI*2);ctx.fill();}}
      surface(0,st.handZ,trayW,1.65,['#fff9e2','#fff0cf','#dfc896','#fffde9'],.38,.15);
      path(0,st.handZ,trayW-.18,1.46,.3,.018);ctx.strokeStyle='#e2c895';ctx.lineWidth=2;ctx.stroke();
      for(let t=0;t<st.trayCount;t++)if(t===st.selected){path(st.trayX(t),st.handZ,1.4,1.34,.23,.025);ctx.fillStyle='#ffd04d55';ctx.fill();ctx.strokeStyle='#f4b629';ctx.lineWidth=3;ctx.stroke();}
      if(!this.background)this.background=document.createElement('canvas');this.background.width=this.domElement.width;this.background.height=this.domElement.height;this.background.getContext('2d').drawImage(this.domElement,0,0);this.backgroundKey=cacheKey;
      }
      const foods=scene.children.filter(o=>o.userData.isTile&&(Number.isInteger(o.userData.ing)||o.userData.recipe));
      // Painter ordering preserves ingredient stacks during automatic burger assembly.
      foods.sort((a,b)=>a.position.z-b.position.z||a.position.y-b.position.y);
      const cw=atlas.naturalWidth/4,ch=atlas.naturalHeight/4;
      for(const tile of foods){
        const ing=tile.userData.ing,v=tile.position,center=p(v.x,v.y+.1,v.z),base=p(v.x,.045,v.z),edge=p(v.x+.68,v.y,v.z);
        const size=Math.abs(edge.x-center.x)*2*tile.scale.x*(ing===4?.88:ing===10?.80:1);
        // Ground contact remains visible while an ingredient lifts off the tray.
        ctx.save();ctx.fillStyle='#304b3628';ctx.shadowColor='#304b3620';ctx.shadowBlur=5;ctx.beginPath();ctx.ellipse(base.x,base.y+size*.07,size*.32,size*.105,0,0,Math.PI*2);ctx.fill();ctx.restore();
        ctx.save();ctx.translate(center.x,center.y);ctx.rotate(-tile.rotation.y*.15+tile.rotation.z);const height=size*(.87+.1*tile.scale.y);
        if(tile.userData.recipe)ctx.drawImage(window.recipeCanvas(tile.userData.recipe),-size*.66,-size*.74,size*1.32,size*1.32);
        else ctx.drawImage(atlas,...frame(ing),-size*.56,-height*.58,size*1.12,height*1.12);ctx.restore();
      }
    }
  };
})();
