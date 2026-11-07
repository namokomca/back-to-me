import React,{useState} from 'react';
export default function CloudSync({state,onLoad}){
 const[revision,setRevision]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState('같은 계정으로 로그인한 다른 기기에서도 기록을 이어볼 수 있어요.');
 async function sync(save){setBusy(true);try{const r=await fetch('/api/notebook',save?{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state,revision})}:{});const d=await r.json();if(!r.ok)throw Error(d.error||'온라인 저장을 사용할 수 없어요.');setRevision(d.revision);if(!save&&d.state)onLoad(d.state);setMessage(save?'계정에 저장했어요. 다른 기기에서 최신 기록을 불러와 주세요.':d.state?'최신 기록을 불러왔어요.':'아직 계정에 저장한 기록이 없어요. 지금 기록을 저장해 주세요.')}catch(e){setMessage(e.message==='Unexpected token'?'연결을 확인해 주세요.':e.message)}finally{setBusy(false)}}
 return <section className="care-preview cloud-sync"><h3>다른 기기에서도 이어보기</h3><p className="form-note">저장할 때 가족 정보, 할 일, 메모가 이 앱의 계정별 서버 저장소로 전송됩니다. 불러오면 이 기기의 기록을 서버 기록으로 바꿉니다.</p><div className="form-actions"><button className="primary" disabled={busy} onClick={()=>sync(true)}>계정에 기록 저장하기</button><button className="secondary" disabled={busy} onClick={()=>sync(false)}>최신 기록 불러오기</button></div><p className="form-note" role="status">{busy?'기록을 연결하고 있어요.':message}</p></section>
}

