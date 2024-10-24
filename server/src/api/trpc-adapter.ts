import type {
  HttpRequest as AzureRequest,
  HttpResponseInit as AzureResponseInit,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import {
  type AnyTRPCRouter,
  type inferRouterContext,
  TRPCError,
  getErrorShape,
} from '@trpc/server';
import { resolveResponse } from '@trpc/server/http';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';

type TrpcRequest = Request;
type TrpcResponse = Response;

export function getTrpcPath(request: AzureRequest) {
  if (typeof request.params.path === 'string') {
    return request.params.path;
  }
  return null;
}

const methodsThatDontHaveBody = ['GET', 'HEAD', 'OPTIONS'];

export async function azureRequestToTrpcRequest(
  request: AzureRequest,
  _context: InvocationContext,
): Promise<TrpcRequest> {
  let body;
  if (!methodsThatDontHaveBody.includes(request.method)) {
    body = await request.arrayBuffer();
  }

  return new Request(request.url, {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
  });
}

export async function trpcResponseToAzureResponse(
  response: TrpcResponse,
): Promise<AzureResponseInit> {
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.arrayBuffer(),
  };
}
type MaybePromise<T> = T | Promise<T>;

export type CreateContextOptions = {
  request: AzureRequest;
  context: InvocationContext;
  path: string;
};
type AzureCreateContextFn<TRouter extends AnyTRPCRouter> = (
  opts: CreateContextOptions,
) => MaybePromise<inferRouterContext<TRouter>>;

type AzureHandlerOptions<
  TRouter extends AnyTRPCRouter,
  TRequest,
> = HTTPBaseHandlerOptions<TRouter, TRequest> & {
  createContext?: AzureCreateContextFn<TRouter>;
};

export function createTrpcHandler<TRouter extends AnyTRPCRouter>({
  router,
  createContext = () => {},
  ...opts
}: AzureHandlerOptions<TRouter, AzureRequest>): (
  req: AzureRequest,
  context: InvocationContext,
) => Promise<HttpResponseInit> {
  return async (request, context) => {
    const path = getTrpcPath(request);

    if (path === null) {
      const error = getErrorShape({
        config: router._def._config,
        error: new TRPCError({
          message:
            'Route param "trpc" not found - does the route contain a parameter called "trpc"?',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        type: 'unknown',
        ctx: undefined,
        path: undefined,
        input: undefined,
      });
      return {
        status: 500,
        jsonBody: {
          id: -1,
          error,
        },
      };
    }

    let trpcRequest;
    try {
      trpcRequest = await azureRequestToTrpcRequest(request, context);
    } catch {
      const error = getErrorShape({
        config: router._def._config,
        error: new TRPCError({
          message:
            'Error converting Azure request to tRPC request - make sure the request is valid.',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        type: 'unknown',
        ctx: undefined,
        path: undefined,
        input: undefined,
      });

      return {
        status: 500,
        jsonBody: {
          id: -1,
          error,
        },
      };
    }

    const response = await resolveResponse({
      router,
      allowBatching: opts.allowBatching,
      responseMeta: opts.responseMeta,
      createContext: () => createContext?.({ request, context, path }),
      req: trpcRequest,
      path,
      error: null,
      onError(o) {
        context.error(
          `Error occured in tRPC handler: '${o.path}'. Error message: '${o.error.message}'.`,
        );
      },
    });

    return trpcResponseToAzureResponse(response);
  };
}
