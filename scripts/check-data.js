import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
export async function inspectData(){
  const schema=JSON.parse(await readFile(new URL('data/schema.json',root),'utf8'));
  const tables={};
  for(const [name,table] of Object.entries(schema.tables)){
    const rows=JSON.parse(await readFile(new URL(`data/${name}.json`,root),'utf8'));
    assert(Array.isArray(rows),`${name} 应为数组`);
    const keys=new Set();
    for(const row of rows){
      assert.deepEqual(Object.keys(row).sort(),Object.keys(table.columns).sort(),`${name} 字段集合`);
      for(const [field,definition] of Object.entries(table.columns)){
        const value=row[field]; const type=definition.type;
        const valid=type==='array'?Array.isArray(value):type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):type==='integer'?Number.isInteger(value):typeof value===type;
        assert(valid,`${name}.${field} 类型应为 ${type}`);
        if(type==='number')assert(Number.isFinite(value),`${name}.${field} 应为有限数`);
      }
      assert(!keys.has(row.id),`${name} 编号重复 ${row.id}`);keys.add(row.id);
    }
    tables[name]=rows;
  }
  for(const [name,table] of Object.entries(schema.tables)){
    for(const [field,reference] of Object.entries(table.refs)){
      const [target,column]=reference.split('.');const values=new Set(tables[target].map(row=>row[column]));
      for(const row of tables[name])assert(values.has(row[field]),`${name}.${field} 引用不存在：${row[field]}`);
    }
  }
  return {schema,tables};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {tables}=await inspectData();
  if(process.argv.includes('--inspect'))console.table(Object.entries(tables).map(([资料,rows])=>({资料,记录数:rows.length})));
  else console.log(`资料格式与显式引用检查完成：${Object.keys(tables).length} 类，${Object.values(tables).reduce((n,rows)=>n+rows.length,0)} 条。此检查不计算业务结果。`);
}
