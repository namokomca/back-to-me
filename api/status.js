export default function handler(req,res){res.setHeader('Cache-Control','no-store');res.status(200).json({connected:!!process.env.OPENAI_API_KEY,cloudSync:false,mcp:true});}
