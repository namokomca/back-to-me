import {ageMonths,koreanToday} from './data.js';
export const DRAFT_KEY='return-family-questions-v1';
export function emptyProfile(){return {name:'',who:'',date:'',partnerDate:'',childName:'',birthday:'',months:0,enrolled:null,schoolName:'',schoolAddress:'',homeAddress:'',drop:'08:30',pickup:'18:30',handoff:10,homeMinutes:'',mine:{role:'기타',address:'',start:'09:00',end:'18:00',mode:'',outbound:'',inbound:''},partner:{role:'기타',address:'',start:'09:00',end:'18:00',mode:'',outbound:'',inbound:''},demo:false}}
export function questionSteps(p){return ['who','dates','child','birthday','enrolled',...(p.enrolled===true?['school','caretime']:[]),'home','mineWork','mineMode',...(p.enrolled===true?['mineTravel']:[]),'partnerWork','partnerMode',...(p.enrolled===true?['partnerTravel']:[]),'review']}
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const num=(x,max)=>x!==''&&x!==null&&Number.isInteger(Number(x))&&Number(x)>=0&&Number(x)<=max;
const time=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x||'');
export function questionError(step,p){
 if(step==='who'&&!['나','배우자','둘 다'].includes(p.who))return '복직하는 사람을 골라주세요.';
 if(step==='dates'&&((p.who!=='배우자'&&!validDate(p.date))||(p.who!=='나'&&!validDate(p.partnerDate))))return '복직 날짜를 적어주세요. 이미 복직한 날짜도 괜찮아요.';
 if(step==='child'&&!p.childName.trim())return '아이 이름이나 애칭을 적어주세요.';
 if(step==='birthday'){const m=ageMonths(p.birthday,koreanToday());if(m===null||m<0||m>216)return '아이 생일을 확인해주세요. 미래 날짜는 적을 수 없어요.';}
 if(step==='enrolled'&&typeof p.enrolled!=='boolean')return '지금 기관을 이용하는지 골라주세요.';
 if(step==='school'&&!p.schoolName.trim())return '기관 이름을 적어주세요. 예정인 기관도 괜찮아요.';
 if(step==='caretime'&&(!time(p.drop)||!time(p.pickup)||p.drop>=p.pickup||!num(p.handoff,60)))return '등원은 하원보다 이르게, 인계 시간은 0~60분으로 적어주세요.';
 if(step==='home'&&p.enrolled&&!num(p.homeMinutes,240))return '집에서 기관까지 걸리는 시간을 0~240분으로 적어주세요.';
 for(const side of ['mine','partner']){
  const a=p[side];
  if(step===side+'Work'&&(!time(a.start)||!time(a.end)||a.start>=a.end))return '출근과 퇴근 시간을 확인해주세요. 야간근무 계산은 아직 준비 중이에요.';
  if(step===side+'Mode'&&!['자동차','대중교통','도보'].includes(a.mode))return '주로 이용하는 교통수단을 골라주세요.';
  if(step===side+'Travel'&&(!num(a.outbound,240)||!num(a.inbound,240)))return '이동시간을 각각 0~240분으로 적어주세요. 모르면 지도 앱에서 확인해주세요.';
 }
 return '';
}
export function finishProfile(p){const date=p.who==='배우자'?p.partnerDate:p.date;return {...p,name:p.name.trim()||'보호자',childName:p.childName.trim(),date,partnerDate:p.who==='나'?p.date:p.partnerDate,months:ageMonths(p.birthday,koreanToday()),demo:false,handoff:Number(p.handoff),homeMinutes:p.enrolled?Number(p.homeMinutes):0,mine:{...p.mine,outbound:p.enrolled?Number(p.mine.outbound):0,inbound:p.enrolled?Number(p.mine.inbound):0},partner:{...p.partner,outbound:p.enrolled?Number(p.partner.outbound):0,inbound:p.enrolled?Number(p.partner.inbound):0}}}
