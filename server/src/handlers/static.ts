import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { readFile } from 'fs/promises';

export async function serveStaticFiles(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const filename = request.params.filename ?? 'index.html';

  let fileToServe;
  try {
    fileToServe = await readFile(`static/${filename}`, 'utf8');
  } catch (error) {
    try {
      fileToServe = await readFile(`static/index.html`, 'utf8');
    } catch (error) {
      context.warn(error);
      return {
        status: 404,
      };
    }
  }

  // TODO: maybe throw error on unknown file type?
  let contentType;
  switch (filename.split('.').pop()) {
    case 'css':
      contentType = 'text/css';
      break;
    case 'js':
      contentType = 'application/javascript';
      break;
    case 'png':
      contentType = 'image/png';
      break;
    case 'ico':
      contentType = 'image/x-icon';
      break;
    case 'json':
      contentType = 'application/json';
      break;
    case 'svg':
      contentType = 'image/svg+xml';
      break;
    case 'woff':
      contentType = 'font/woff';
  }

  if (!contentType) {
    return {
      status: 404,
      jsonBody: {
        message: 'UNKNOWN_FILE_TYPE',
      },
    };
  }

  return {
    headers: {
      'Content-Type': contentType,
    },
    body: fileToServe,
  };
}
