import {getStore} from "@netlify/blobs";import {authorized,json} from "./_auth.js";
const store=()=>getStore("cloud-furniture");
async function read(){return await store().get("products",{type:"json"})||[]}
export default async(req)=>{
 if(req.method==="GET"){let p=await read();return json({products:p.filter(x=>x.visible!==false)})}
 if(!authorized(req))return json({error:"Unauthorized"},401);
 if(req.method==="POST"){let body=await req.json();let p=await read();let now=new Date().toISOString();if(body.id){let i=p.findIndex(x=>x.id===body.id);if(i<0)return json({error:"Not found"},404);p[i]={...p[i],...body,image:body.image||p[i].image,updatedAt:now}}else{p.unshift({...body,id:crypto.randomUUID(),createdAt:now})}await store().setJSON("products",p);return json({ok:true})}
 if(req.method==="DELETE"){let id=new URL(req.url).searchParams.get("id");let p=(await read()).filter(x=>x.id!==id);await store().setJSON("products",p);return json({ok:true})}
 return json({error:"Method not allowed"},405)
};