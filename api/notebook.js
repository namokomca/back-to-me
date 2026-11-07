export default function handler(req,res){res.setHeader('Cache-Control','no-store');res.status(503).json({error:'이 공개 데모는 기기에 기록을 저장해요. 계정 저장은 기존 개인용 앱에서 이용할 수 있어요.'});}
