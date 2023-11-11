import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { spawnSync } from 'child_process';

export async function pythonTest(
  _request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  const { stdout } = spawnSync('python3', [__dirname + '/python-test.py']);

  return {
    jsonBody: stdout.toString(),
  };
}
