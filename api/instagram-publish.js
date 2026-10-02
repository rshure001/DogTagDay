const GRAPH='https://graph.facebook.com/v24.0';

async function postGraph(path, params) {
  const response = await fetch(GRAPH + path, {
    method: 'POST',
    headers: {'content-type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || 'Meta API request failed');
  return data;
}

async function waitForMedia(containerId, token) {
  for (let i = 0; i < 30; i++) {
    const response = await fetch(
      GRAPH + '/' + containerId + '?fields=status_code&access_token=' + encodeURIComponent(token)
    );
    const data = await response.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR' || data.error) {
      throw new Error(data.error?.message || 'Instagram media processing failed');
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Instagram media processing timed out');
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const token=process.env.META_ACCESS_TOKEN;
  const igUserId=process.env.IG_USER_ID;
  if(!token||!igUserId) return res.status(503).json({error:'Meta authorization is not configured yet.'});

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const videoUrl = body.video_url;
  const caption = body.caption || '';
  if(!videoUrl) return res.status(400).json({error:'video_url is required'});

  try {
    const container = await postGraph('/' + igUserId + '/media', {
      media_type:'REELS',
      video_url:videoUrl,
      caption,
      share_to_feed:'true',
      access_token:token,
    });
    await waitForMedia(container.id, token);
    const published = await postGraph('/' + igUserId + '/media_publish', {
      creation_id:container.id,
      access_token:token,
    });
    return res.status(200).json({ok:true, media_id:published.id});
  } catch (error) {
    return res.status(502).json({error:error.message});
  }
}
