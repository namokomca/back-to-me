import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';
import {planCare,timeMinutes,clock} from '../src/data.js';
import {roleExercises,groups} from '../src/data.js';
import {lifeTemplates,suggestDivision,lifeSummary} from '../src/life.js';
export function createServer(){
 const server=new McpServer({name:'return-to-work-onboarding',version:'1.0.0'});
 const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'HH:MM');
 const person=z.object({start:time.describe('출근 시각'),end:time.describe('퇴근 시각'),outbound:z.number().int().min(0).max(240).describe('어린이집에서 회사까지 이동 분'),inbound:z.number().int().min(0).max(240).describe('회사에서 어린이집까지 이동 분')});
 server.registerTool('plan_family_handoff',{title:'부부 등하원 계획 만들기',description:'두 사람의 근무시간과 사용자가 알려준 이동시간으로 월~금 등하원 담당과 하원 공백을 계산합니다. 주소나 가족 이름은 필요하지 않습니다. 일정 저장이나 알림 발송은 하지 않습니다.',inputSchema:{drop:time.describe('어린이집 등원 시각'),pickup:time.describe('하원 마감 시각'),handoff:z.number().int().min(0).max(60).describe('등원 인계에 필요한 분'),homeMinutes:z.number().int().min(0).max(240).describe('집에서 어린이집까지 이동 분'),mine:person.describe('첫 번째 보호자'),partner:person.describe('두 번째 보호자')},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}},async input=>{
 if(timeMinutes(input.drop)>=timeMinutes(input.pickup)||[input.mine,input.partner].some(p=>timeMinutes(p.start)>=timeMinutes(p.end)))return {isError:true,content:[{type:'text',text:'등원은 하원보다, 출근은 퇴근보다 빨라야 합니다. 야간근무는 아직 지원하지 않습니다.'}]};
 const rows=planCare({...input,enrolled:true}).map(r=>({...r,leaveAt:clock(r.leave),arriveAt:clock(r.arrival)}));
 return {content:[{type:'text',text:JSON.stringify({days:rows,basis:'사용자가 입력한 이동시간을 기준으로 한 계산입니다. 실제 교통 조회 결과가 아닙니다.',next:'조정 필요인 시간대는 근무시간 변경이나 대체 돌봄을 함께 확인하세요. 실제 일정은 저장하지 않았습니다.'})}]};
 });
 const readOnly={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};
 server.registerTool('plan_household_tasks',{title:'부부의 생활 할 일 나누기',description:'사용자가 제공한 집안일과 두 사람의 가능한 분으로 미정인 담당을 제안합니다. 기존 담당은 유지합니다. 시간 부족은 미정으로 남기며 저장하거나 상대방에게 전달하지 않습니다.',inputSchema:{mineMinutes:z.number().int().min(0).max(480),partnerMinutes:z.number().int().min(0).max(480),tasks:z.array(z.object({title:z.string().min(1).max(100),minutes:z.number().int().min(1).max(240),owner:z.enum(['미정','나','배우자','함께','도움 요청']),done:z.boolean()})).max(40)},annotations:readOnly},async input=>{
 const tasks=suggestDivision(input.tasks,input.mineMinutes,input.partnerMinutes);
 return {content:[{type:'text',text:JSON.stringify({tasks,summary:lifeSummary(tasks),basis:'입력한 소요시간을 기준으로 한 제안입니다. 고정 담당을 먼저 고려하고 시간 내 가능한 미정 일을 나눕니다.',next:'시간이 부족한 일은 줄이거나 도움을 요청하세요. 실제 분담은 합의가 필요하고 앱에는 저장하지 않았습니다.'})}]};
 });
 server.registerTool('get_return_checklist',{title:'복직 후 비게 되는 생활 준비 목록',description:'돌봄, 식사, 집안일, 휴식과 복직 준비의 구체적인 예시 목록을 제공합니다. 가족의 실제 기록을 조회하지 않습니다.',inputSchema:{focus:z.enum(['생활','복직 준비','전체'])},annotations:readOnly},async({focus})=>({content:[{type:'text',text:JSON.stringify({example:true,household:focus==='복직 준비'?[]:lifeTemplates,preparation:focus==='생활'?[]:groups,note:'예시 목록입니다. 사용자에게 필요한 것만 선택하고 담당과 기한을 물어보세요. 완료 여부나 가족 기록은 알 수 없습니다.'})}]}));
 server.registerTool('get_role_practice',{title:'복직자를 위한 10분 직무 AI 연습',description:'직무별 가상 업무와 AI 요청문 예시를 제공합니다. 실제 회사 자료와 개인정보 없이 연습합니다.',inputSchema:{role:z.enum(['마케팅','기획·운영','영업','인사·총무','재무·회계','기타'])},annotations:readOnly},async({role})=>({content:[{type:'text',text:JSON.stringify({role,...roleExercises[role],minutes:10,review:['주어지지 않은 사실을 만들었는지 확인','결과를 직접 검토하고 한 가지 수정','내 말로 최종 결과를 설명'],saved:false})}]}));
 return server;
}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).json({jsonrpc:'2.0',id:null,error:{code:-32000,message:'Use MCP Streamable HTTP POST.'}});return}
 const server=createServer();const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 res.on('close',()=>{transport.close();server.close()});
 try{await server.connect(transport);await transport.handleRequest(req,res,req.body)}catch{if(!res.headersSent)res.status(500).json({jsonrpc:'2.0',id:null,error:{code:-32603,message:'MCP request failed'}})}
}
