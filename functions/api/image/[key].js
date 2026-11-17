export async function onRequestGet({params,env}) {
 if(!env.IMAGES)return new Response('Image storage unavailable',{status:503})
 const object=await env.IMAGES.get(params.key)
 if(!object)return new Response('Not found',{status:404})
 const headers=new Headers()
 object.writeHttpMetadata(headers)
 headers.set('etag',object.httpEtag)
 headers.set('Cache-Control','public, max-age=31536000, immutable')
 return new Response(object.body,{headers})
}
