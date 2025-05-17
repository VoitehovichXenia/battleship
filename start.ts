import cluster from 'node:cluster';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

if (cluster.isPrimary) {  
  const WSServer = spawn('npx', [ 'tsx', 'watch', resolve(process.cwd(), './src/websocket_server/index.ts') ], {
    stdio: 'inherit',
    shell: true,
  });
  
  const clientServer = spawn('nodemon', [ resolve(process.cwd(), './index.js') ], {
    stdio: 'inherit',
    shell: true,
  });
  
  WSServer.on('close', (code) => console.log(`Server exited with code ${code}`));
  clientServer.on('close', (code) => console.log(`Client exited with code ${code}`));
}
