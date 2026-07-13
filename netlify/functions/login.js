import {makeToken,json} from "./_auth.js";
export default async(req)=>{
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const {password=""}=await req.json().catch(()=>({}));
 if(!process.env.ADMIN_PASSWORD||password!==process.env.ADMIN_PASSWORD)return json({error:"Wrong password"},401);
 return json({token:makeToken()});
};