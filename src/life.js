export const lifeTemplates = [
 {id:'bag',title:'내일 등원 가방과 여벌옷 챙기기',category:'아이 돌봄',minutes:10,when:'저녁'},
 {id:'meal',title:'오늘 저녁과 내일 아침 메뉴 정하기',category:'식사',minutes:15,when:'저녁'},
 {id:'laundry',title:'아이 옷 세탁하고 마른 옷 정리하기',category:'집안일',minutes:20,when:'저녁'},
 {id:'notice',title:'기관 알림장과 준비물 확인하기',category:'아이 돌봄',minutes:5,when:'점심'},
 {id:'backup',title:'하원이 늦는 날 대신 갈 사람 확인하기',category:'돌봄 공백',minutes:10,when:'점심'},
 {id:'rest',title:'서로 방해받지 않을 휴식 20분 정하기',category:'나를 돌보기',minutes:20,when:'저녁'}
];
export function suggestDivision(tasks,mineMinutes,partnerMinutes){
 const remaining={나:Math.max(0,mineMinutes),배우자:Math.max(0,partnerMinutes)};
 for(const t of tasks){if(!t.done&&['나','배우자'].includes(t.owner))remaining[t.owner]-=t.minutes;}
 const result=tasks.map(t=>({...t}));
 const pending=result.filter(t=>!t.done&&t.owner==='미정').sort((a,b)=>b.minutes-a.minutes);
 for(const t of pending){
  const eligible=['나','배우자'].filter(k=>remaining[k]>=t.minutes).sort((a,b)=>remaining[b]-remaining[a]);
  const owner=eligible[0]||'미정';if(owner!=='미정')remaining[owner]-=t.minutes;
  Object.assign(t,{owner,suggested:true});
 }
 return result;
}
export function lifeSummary(tasks){const open=tasks.filter(t=>!t.done);return {open:open.length,unassigned:open.filter(t=>t.owner==='미정').length,mine:open.filter(t=>t.owner==='나').reduce((n,t)=>n+t.minutes,0),partner:open.filter(t=>t.owner==='배우자').reduce((n,t)=>n+t.minutes,0)};}

