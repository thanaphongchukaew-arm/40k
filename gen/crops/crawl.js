/* ขั้น 1: เปิดทุกหน้าด้วย Chrome (จอคอม 1440 และมือถือ 390) แล้วเก็บขนาดกรอบของทุกรูปที่ใช้ object-fit: cover → out/crawl.json */
const puppeteer=require('puppeteer-core'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..'); const OUT=__dirname+'/out'; fs.mkdirSync(OUT,{recursive:true});
const files=require('child_process').execSync(`cd "${ROOT}" && find index.html pages -name '*.html'`).toString().trim().split('\n');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
 const out=[];
 for(const [vw,vh,tag] of [[1440,900,'d'],[390,844,'m']]){
  const pg=await b.newPage(); await pg.setViewport({width:vw,height:vh});
  for(const f of files){
   try{await pg.goto('http://localhost:8765/'+f,{waitUntil:'networkidle2',timeout:20000});}catch(e){}
   await new Promise(r=>setTimeout(r,300));
   const r=await pg.evaluate(()=>[...document.images].map((im,i)=>{const cs=getComputedStyle(im),b=im.getBoundingClientRect();
     return {i,src:im.getAttribute('src'),abs:im.src,w:b.width,h:b.height,fit:cs.objectFit,pos:cs.objectPosition,inl:im.getAttribute('style')||'',cls:im.className,par:(im.parentElement&&im.parentElement.className)||''}}).filter(x=>x.fit==='cover'&&x.w>20&&x.h>20));
   r.forEach(x=>{x.page=f;x.vp=tag;out.push(x)});
  }
 }
 fs.writeFileSync(OUT+'/crawl.json',JSON.stringify(out));
 const paths=[...new Set(out.map(x=>ROOT+decodeURIComponent(new URL(x.abs).pathname)))]; fs.writeFileSync(OUT+'/paths.txt',paths.join('\n'));
 console.log(out.length); await b.close();
})();
