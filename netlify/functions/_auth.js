import crypto from "node:crypto";
const secret=()=>process.env.ADMIN_SECRET||"";
export function makeToken(){
  const exp=Date.now()+12*60*60*1000;
  const payload=Buffer.from(JSON.stringify({exp})).toString("base64url");
  const sig=crypto.createHmac("sha256",secret()).update(payload).digest("base64url");
  return payload+"."+sig;
}
export function authorized(req){
  try{
    const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/,"");
    const [p,s]=token.split(".");
    const good=crypto.createHmac("sha256",secret()).update(p).digest("base64url");
    if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(good))) return false;
    return JSON.parse(Buffer.from(p,"base64url").toString()).exp>Date.now();
  }catch{return false}
}
export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
