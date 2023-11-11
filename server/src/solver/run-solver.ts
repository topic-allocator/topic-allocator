import { spawn } from 'child_process';
import { buildSolverInput } from '../lib/utils';

type Result = { studentId: number; topicId: number }[];

export async function runSolver(
  input: ReturnType<typeof buildSolverInput>,
): Promise<Result> {
  const { stdout, stderr } = await spawnPromise(
    'python3',
    [__dirname + '/solver.py'],
    JSON.stringify(input),
  );

  console.error(stderr);

  const resultStringPrefix = 'result: ';
  const resultString = stdout.slice(
    stdout.indexOf(resultStringPrefix) + resultStringPrefix.length,
    stdout.length,
  );

  const result: string[] = JSON.parse(resultString);

  return result.map((row) => {
    const [studentId, topicId] = row.split('_');
    return { studentId: parseInt(studentId), topicId: parseInt(topicId) };
  });
}

function spawnPromise(
  command: string,
  args: string[],
  stdin: string | undefined,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        reject({
          code,
          stdout,
          stderr,
        });
      } else {
        resolve({
          stdout,
          stderr,
        });
      }
    });
  });
}
