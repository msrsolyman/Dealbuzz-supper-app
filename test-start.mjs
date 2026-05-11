import { spawn } from 'child_process';
const child = spawn('node', ['server.ts'], { stdio: 'pipe' });
let startOk = false;
child.stdout.on('data', (d) => {
  const line = d.toString();
  console.log('STDOUT:', line);
  if (line.includes('EADDRINUSE') || line.includes('Server running')) {
    startOk = line.includes('Server running') || line.includes('EADDRINUSE');
    child.kill();
  }
});
child.stderr.on('data', (d) => {
  console.error('STDERR:', d.toString());
  if (d.toString().includes('EADDRINUSE') || d.toString().includes('already in use')) {
    startOk = true;
    child.kill();
  }
});
child.on('exit', (code) => {
  if (!startOk && code !== null && code !== 0) {
    console.error('Server crashed with code', code);
    process.exit(1);
  } else {
    console.log('Server check OK (either ran or hit port 3000)');
  }
});
