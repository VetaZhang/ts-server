import './util/moduleAlias';
import HttpServer from '@server/HttpServer';

const server = new HttpServer({
  port: 3000,
  routList: [
    {
      path: '/mmm/:n/:m',
      method: 'GET'
    }
  ],
  middlewareList: [
    //
  ]
});

server.listen(({ port }) => {
  console.log(`Server is running on ${port}`);
});