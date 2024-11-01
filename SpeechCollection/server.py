from fastapi import FastAPI, HTTPException, Request, Cookie;
from fastapi.responses import Response;
from fastapi.staticfiles import StaticFiles;
from pathlib import Path;
# from log import log;
import uuid;

known_users = set()

uploadDir = Path('upload');
uploadDir.mkdir(exist_ok=True);
for child in uploadDir.iterdir():
    if child.is_dir():
        known_users.add(child.name);



print('Starting Speech collection server');

# Create app object
app = FastAPI();


@app.get('/userId.js')
async def user_id(user_id: str | None = Cookie(default=None)):
    returning = False;
    if user_id in known_users:
        returning = True;
        uid = user_id;
    else:
        uid = str(uuid.uuid4());
        known_users.add(uid);
        (uploadDir / uid).mkdir();
    res = Response(f'returning = {"true" if returning else "false"};\n', media_type='text/javascript');
    res.set_cookie(key='user_id', value=uid, expires='Thu, 1 Jan 2026 00:00:00 GMT');
    return res;


@app.post('/user_agent')
async def user_agent (request: Request) :
    user_id = request.cookies.get('user_id', None)
    if user_id is None:
        raise HTTPException(status_code=404)
    info = str(await request.body(), 'utf-8')
    with open(uploadDir / user_id / 'user_agent.txt', 'w', encoding='utf-8') as f:
        f.write(info)
        f.write('\n')


@app.post('/audio_device')
async def audio_device (request: Request) :
    user_id = request.cookies.get('user_id', None)
    if user_id is None:
        raise HTTPException(status_code=404)
    info = str(await request.body(), 'utf-8')
    with open(uploadDir / user_id / 'audio_device.json', 'w', encoding='utf-8') as f:
        f.write(info)
        f.write('\n')


@app.post('/audio_upload')
async def audio_upload (request: Request) :
    
    user_id = request.cookies.get('user_id', None)
    if user_id is None:
        raise HTTPException(status_code=404)
    if 'name' not in request.query_params:
        raise HTTPException(status_code=404)
    name = request.query_params['name']
    audio = await request.body()
    with open(uploadDir / user_id / f'{name}.wav', 'wb') as f:
        f.write(audio)


app.mount('/', StaticFiles(directory='static', html=True), name='static');
