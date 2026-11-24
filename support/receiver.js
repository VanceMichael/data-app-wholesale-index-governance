import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function openReceiver({directory,port=0,seed=[]}={}){
  await mkdir(directory,{recursive:true});const file=resolve(directory,'received.json');let records;
  try{records=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;records=seed;}
  let drop=false;let queue=Promise.resolve();
  const server=createServer((req,res)=>{
    queue=queue.then(async()=>{
      const url=new URL(req.url,'http://localhost');
      const send=(status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
      if(req.method==='GET'&&url.pathname.startsWith('/receipts/')){
        const id=decodeURIComponent(url.pathname.slice(10));const found=records.find(x=>x.id===id);
        return found?send(200,found):send(404,{error:'无此接受记录'});
      }
      if(req.method!=='POST')return send(405,{error:'方法不支持'});
      let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000000)return send(413,{error:'请求过大'});}
      let body;try{body=JSON.parse(raw);}catch{return send(400,{error:'请求不是JSON'});}
      if(url.pathname==='/controls/drop-next-ack'){drop=true;return send(200,{enabled:true});}
      if(url.pathname!=='/acceptances')return send(404,{error:'无此路径'});
      if(typeof body.id!=='string'||!body.id||!body.payload)return send(400,{error:'缺少业务编号或内容'});
      const old=records.find(x=>x.id===body.id);
      if(old&&JSON.stringify(old.payload)!==JSON.stringify(body.payload))return send(409,{error:'相同业务编号的内容不同'});
      const record=old??{id:body.id,payload:body.payload,accepted_at:new Date().toISOString()};
      if(!old){records.push(record);await writeFile(file,JSON.stringify(records,null,2));}
      if(drop){drop=false;req.socket.destroy();return;}
      return send(old?200:201,record);
    }).catch(error=>{res.writeHead(500);res.end(JSON.stringify({error:error.message}));});
  });
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',ok);});
  return {server,url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(ok=>server.close(ok))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const seed=JSON.parse(await readFile(new URL('../data/receiver_seed.json',import.meta.url),'utf8'));
  const service=await openReceiver({directory:process.env.RECEIVER_STATE??'./state/receiver',port:Number(process.env.RECEIVER_PORT??4317),seed});
  console.log(`合作端演练服务已启动：${service.url}`);
}
