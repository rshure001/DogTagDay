export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const token=process.env.META_ACCESS_TOKEN;
  const igUserId=process.env.IG_USER_ID;
  if(!token||!igUserId) return res.status(503).json({error:'Meta authorization is not configured yet.'});
  return res.status(501).json({error:'Meta publish wiring pending.'});
}