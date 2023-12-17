import moduleAlias from 'module-alias';

const rootDir = process.cwd();

moduleAlias.addAliases({
  '@server': `${rootDir}/src/server`,
  '@router': `${rootDir}/router`,
  '@controller': `${rootDir}/controller`,
  '@db': `${rootDir}/db`,
  '@lib': `${rootDir}/lib`,
  '@util'  : `${rootDir}/util`,
  '@config'  : `${rootDir}/config`,
  '@https'  : `${rootDir}/https`,
});