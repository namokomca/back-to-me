export async function notebook(request,env){
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 const owner=request.headers.get('oai-authenticated-user-id');
 if(!owner)return reply({error:'로그인한 계정에서만 기록을 불러올 수 있어요.'},401);
 if(!env.DB)return reply({error:'온라인 저장 연결을 준비하고 있어요.'},503);
 if(request.method==='GET'){
 const row=await env.DB.prepare('SELECT payload,revision,updated FROM notebooks WHERE owner = ?').bind(owner).first();
 return reply(row?{state:JSON.parse(row.payload),revision:row.revision,updated:row.updated}:{state:null,revision:0});
 }
 if(request.method!=='PUT')return reply({error:'지원하지 않는 요청이에요.'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'이 앱에서 저장해 주세요.'},403);
 const raw=await request.text();if(raw.length>40000)return reply({error:'기록이 너무 길어요.'},413);
 let body;try{body=JSON.parse(raw)}catch{return reply({error:'기록을 읽지 못했어요.'},400)}
 if(!Number.isSafeInteger(body.revision)||body.revision<0||!body.state?.profile||typeof body.state.profile.date!=='string'||typeof body.state.ready!=='boolean')return reply({error:'기록 형식을 확인해 주세요.'},400);
 const {profile,ready,done,owners,notes,practice}=body.state;
 const payload=JSON.stringify({profile,ready,done,owners,notes,practice});const updated=new Date().toISOString();
 const sql=body.revision===0?'INSERT INTO notebooks(owner,payload,revision,updated) VALUES(?,?,1,?) ON CONFLICT(owner) DO NOTHING':'UPDATE notebooks SET payload=?,revision=revision+1,updated=? WHERE owner=? AND revision=?';
 const params=body.revision===0?[owner,payload,updated]:[payload,updated,owner,body.revision];
 const result=await env.DB.prepare(sql).bind(...params).run();
 if(!result.meta?.changes)return reply({error:'다른 기기에서 기록이 바뀌었어요. 최신 기록을 불러온 후 다시 적어주세요.'},409);
 return reply({revision:body.revision+1,updated});
}
