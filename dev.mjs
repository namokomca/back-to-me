import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['server.mjs'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4174'],{stdio:'inherit'})];
function stop(){for(const c of children)c.kill()};process.on('SIGINT',stop);process.on('SIGTERM',stop);for(const c of children)c.on('exit',stop);
