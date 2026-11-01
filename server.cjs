const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
const allowed=new Set(['index.html','admin.html','styles.css','surprise.js','app.js','catalog.json','assets/sticker-collage.jpg','assets/logo-symbol.png','assets/favicon-32.png','assets/apple-touch-icon.png']);
http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);res.end('No encontrado');return;}fs.readFile(path.join(root,name),(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(name)]||'text/plain','Cache-Control':'no-cache'});res.end(error?'No encontrado':data);});}).listen(4173,'127.0.0.1',()=>console.log('Stickermanía Col: http://localhost:4173'));
