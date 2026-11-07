import {coach} from '../worker/coach.mjs';
export default async function handler(req,res){
 const origin='https://'+req.headers.host;
 const request=new Request(origin+'/api/coach',{method:req.method,headers:{'Content-Type':'application/json',...(req.headers.origin?{origin:req.headers.origin}:{})},...(!['GET','HEAD'].includes(req.method)?{body:typeof req.body==='string'?req.body:JSON.stringify(req.body||{})}:{})});
 const response=await coach(request,process.env);
 res.statusCode=response.status;for(const[key,value]of response.headers)res.setHeader(key,value);res.end(await response.text());
}
