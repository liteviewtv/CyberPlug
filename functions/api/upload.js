import { requireAdmin } from '../_lib/auth'
export async function onRequestPost({request,env}) {
 if(!await requireAdmin(request,env))return Response.json({error:'Unauthorized'},{status:401})
 if(!env.IMAGES)return Response.json({error:'Image storage is not configured yet.'},{status:503})
 const data=await request.formData(),file=data.get('file')
 if(!(file instanceof File)||!file.type.startsWith('image/'))return Response.json({error:'Choose an image file.'},{status:400})
 if(file.size>5*1024*1024)return Response.json({error:'Images must be 5 MB or smaller.'},{status:413})
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg'
 const key=crypto.randomUUID()+'.'+ext
 await env.IMAGES.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}})
 return Response.json({url:'/api/image/'+key})
}
