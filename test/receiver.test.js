import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openReceiver} from '../support/receiver.js';
test('合作端接收后丢失确认，查询与重送保持同一接受记录',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'receiver-'));const service=await openReceiver({directory});
 try{
  const post=(path,body)=>fetch(service.url+path,{method:'POST',body:JSON.stringify(body)});
  await post('/controls/drop-next-ack',{});
  await assert.rejects(()=>post('/acceptances',{id:'合作记录甲',payload:{content:'演练接收内容'}}));
  const receipt=await fetch(service.url+'/receipts/'+encodeURIComponent('合作记录甲'));assert.equal(receipt.status,200);
  const repeated=await post('/acceptances',{id:'合作记录甲',payload:{content:'演练接收内容'}});assert.equal(repeated.status,200);
  const conflict=await post('/acceptances',{id:'合作记录甲',payload:{content:'另一内容'}});assert.equal(conflict.status,409);
 }finally{await service.close();await rm(directory,{recursive:true,force:true});}
});
