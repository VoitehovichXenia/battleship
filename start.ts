import cluster from 'node:cluster';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

if (cluster.isPrimary) {  
  const WSServer = spawn(
    'npx',
    [
      'cross-env',
      `NODE_ENV=${process.env.NODE_ENV}`,
      `BOTH_SERVERS=${process.env.BOTH_SERVERS}`,
      'tsx', 
      process.env.NODE_ENV === 'development' ? 'watch' : '', 
      resolve(process.cwd(), './src/websocket_server/index.ts') 
    ],
    {
      stdio: 'inherit',
      shell: true,
    }
  );
  
  WSServer.on('close', (code) => console.log(`Server exited with code ${code}`));
}
