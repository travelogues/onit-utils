import fs from 'fs';

const TROPY_PATHS = {
  DORIS: 'data/doris_2022-08-16.json',
  JACOPO: 'data/jacopo_2022-08-16.json',
  MICHELA: 'data/michela_2022-08-16.json'
};

const TROPY_DATA = {
  DORIS: JSON.parse(fs.readFileSync(TROPY_PATHS.DORIS, 'utf8')),
  JACOPO: JSON.parse(fs.readFileSync(TROPY_PATHS.JACOPO, 'utf8')),
  MICHELA: JSON.parse(fs.readFileSync(TROPY_PATHS.MICHELA, 'utf8'))
}

