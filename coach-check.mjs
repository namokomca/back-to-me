import assert from 'node:assert/strict';import {coach} from './worker/coach.mjs';
const request=(body,origin='https://test.local')=>new Request('https://test.local/api/coach',{method:'POST',headers:{origin},body:JSON.stringify(body)});
assert.equal((await coach(request({}),{})).status,503);
assert.equal((await coach(request({},'https://other.local'),{OPENAI_API_KEY:'test'})).status,403);
assert.equal((await coach(request({mode:'bad',message:'x'}),{OPENAI_API_KEY:'test'})).status,400);
let captured;globalThis.fetch=async(url,options)=>{captured=JSON.parse(options.body);return Response.json({output:[{content:[{type:'output_text',text:'작은 단계부터 시작해요.'}]}]})};
const response=await coach(request({mode:'chat',message:'복귀가 걱정돼요',context:{name:'SECRET_NAME',home:'SECRET_ADDRESS',role:'마케팅'}}),{OPENAI_API_KEY:'test'});
assert.equal((await response.json()).text,'작은 단계부터 시작해요.');assert.ok(!captured.input.includes('SECRET'));assert.equal(captured.store,false);
console.log('PASS: missing key, origin, validation, response extraction, excluded identity/location, no API response storage');
