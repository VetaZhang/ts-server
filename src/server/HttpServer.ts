import { Server, createServer, IncomingMessage, ServerResponse } from 'http';
import qs, { ParsedQs } from 'qs';
import { match } from 'node-match-path';

interface IRoute {
  path: string;
  method: string;
}

class Request {
  private req: IncomingMessage;
  readonly path: string;
  param: {
    [key: string]: string | number;
  };
  query: {
    [key: string]: string | number | boolean;
  };
  body: {
    [key: string]: string | number | boolean;
  };
  
  constructor(
    req: IncomingMessage,
    param: null | {
      [key: string]: string | number;
    }
  ) {
    const [path, query] = req.url!.split('?');
    this.req = req;
    this.path = path;
    this.param = param ?? {};
    this.query = this.formatQuery(qs.parse(query));
    this.body = {};
    
  }

  formatQuery(query: ParsedQs) {
    return Object.entries(query).reduce((result: typeof this.query, item) => {
      const [k, v] = item;
      if (v === '') {
        result[k] = true;
      } else if (typeof v === 'string') {
        result[k] = v;
      }
      return result;
    }, {});
  }

  parseBody() {
    //
  }

  getOriginReq() {
    return this.req;
  }
}

class Response {
  private res: ServerResponse;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  ok() {
    this.res.statusCode = 200;
    this.res.statusMessage = 'ok';
  }

  notFound() {
    this.res.statusCode = 404;
    this.res.statusMessage = 'Not Found';
  }

  serverError(msg: string) {
    this.res.statusCode = 500;
    this.res.statusMessage = msg;
  }

  json(data: object) {
    this.ok();
    this.res.setHeader('Content-Type', 'application/json');
    this.res.write(JSON.stringify(data));
  }
}

interface IMiddleware {
  (req: IncomingMessage, res: ServerResponse): void;
}

interface IOptions {
  port: number;
  routList: IRoute[];
  middlewareList: IMiddleware[];
}

class HttpServer {
  port: number;
  routeList: IRoute[];
  middlewareList: IMiddleware[];
  server: null | Server;

  constructor(options: IOptions) {
    this.port = options.port;
    this.routeList = options.routList;
    this.middlewareList = options.middlewareList;
    this.server = null;
  }

  async getRoute(req: IncomingMessage) {
    let param: null | { [key: string]: string | number; } = {};
    const [path, _] = req.url!.split('?');
    const route = this.routeList.find(routeConfig => {
      const result = match(routeConfig.path, path);
      if (req.method === routeConfig.method && result.matches) {
        param = result.params;
        return true;
      }
      return false;
    });

    return { route, param };
  }

  async handleMiddlewareList(req: IncomingMessage, res: ServerResponse) {
    // let index = 0;
      // let data = {};
      // while (mid[index]) {
      //   await hander(mid[index], req, res, data);
      //   index++;
      // }
    for (const middleware of this.middlewareList) {
      await middleware(req, res);
    }
  }

  listen(cb: (server: HttpServer) => void) {
    this.server = createServer((req, res) => {
      let post = '';     
 
      req.on('data', function(chunk) {
        post += chunk;
      });
  
      req.on('end', async () => { 
        this.handleRequest(req, res, post);
      });
    })
    .listen(this.port, () => {
      cb(this);
    });
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse, post: string) {
    const response = new Response(res);
    if (req.url) {
      const { route, param } = await this.getRoute(req);
      if (route) {
        const request = new Request(req, param);
        console.log(request.path, request.param, request.query, request.body, post);

        response.json({});
      } else {
        response.notFound();
      }
      // this.handleMiddlewareList(req, res);
    } else {
      response.serverError('No Url Detected');
    }
    res.end();
  }
}

export default HttpServer;