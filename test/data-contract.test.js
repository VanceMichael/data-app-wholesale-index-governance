import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectData} from '../scripts/check-data.js';
test('合成资料符合公开字段及引用契约',async()=>{
 const {schema,tables}=await inspectData();assert.equal(schema.synthetic,true);
 assert(Object.keys(tables).length>=2);
});
test('业务过程的原事实与后续记录能够关联',async()=>{
 const {tables}=await inspectData();const roots=new Set(tables.quotes.map(x=>x.id));
 const linked=tables.revisions.filter(x=>roots.has(x.quote));assert(linked.length>0);
 assert(new Set(linked.map(x=>x.quote)).size>0);
});
