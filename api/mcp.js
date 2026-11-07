import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';
import {planCare,timeMinutes,clock} from '../src/data.js';
export function createServer(){
 const server=new McpServer({name:'return-to-work-onboarding',version:'1.0.0'});
 const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'HH:MM');
 const person=z.object({start:time.describe('출근 시각'),end:time.describe('퇴근 시각'),outbound:z.number().int().min(0).max(240).describe('기관에서 직장까지 이동 분'),inbound:z.number().int().min(0).max(240).describe('직장에서 기관까지 이동 분')});
 server.registerTool('plan_family_handoff',{title:'부부 등하원 계획 만들기',description:'두 사람의 근무시간과 사용자가 알려준 이동시간으로 월~금 등하원 담당과 하원 공백을 계산합니다. 주소나 가족 이름은 필요하지 않습니다. 일정 저장이나 알림 발송은 하지 않습니다.',inputSchema:{drop:time.describe('기관 등원 시각'),pickup:time.describe('하원 마감 시각'),handoff:z.number().int().min(0).max(60).describe('등원 인계에 필요한 분'),homeMinutes:z.number().int().min(0).max(240).describe('집에서 기관까지 이동 분'),mine:person.describe('첫 번째 보호자'),partner:person.describe('두 번째 보호자')},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}},async input=>{
 if(timeMinutes(input.drop)>=timeMinutes(input.pickup)||[input.mine,input.partner].some(p=>timeMinutes(p.start)>=timeMinutes(p.end)))return {isError:true,content:[{type:'text',text:'등원은 하원보다, 출근은 퇴근보다 빨라야 합니다. 야간근무는 아직 지원하지 않습니다.'}]};
 const rows=planCare({...input,enrolled:true}).map(r=>({...r,leaveAt:clock(r.leave),arriveAt:clock(r.arrival)}));
 return {content:[{type:'text',text:JSON.stringify({days:rows,basis:'사용자가 입력한 이동시간을 기준으로 한 계산입니다. 실제 교통 조회 결과가 아닙니다.',next:'조정 필요인 시간대는 근무시간 변경이나 대체 돌봄을 함께 확인하세요. 실제 일정은 저장하지 않았습니다.'})}]};
 });return server;
}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).json({jsonrpc:'2.0',id:null,error:{code:-32000,message:'Use MCP Streamable HTTP POST.'}});return}
 const server=createServer();const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 res.on('close',()=>{transport.close();server.close()});
 try{await server.connect(transport);await transport.handleRequest(req,res,req.body)}catch{if(!res.headersSent)res.status(500).json({jsonrpc:'2.0',id:null,error:{code:-32603,message:'MCP request failed'}})}
}
