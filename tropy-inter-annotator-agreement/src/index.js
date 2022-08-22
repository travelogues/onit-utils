import fs from 'fs';
import Papa from 'papaparse';

const TROPY_PATHS = {
  DORIS: 'data/doris_2022-08-16.json',
  JACOPO: 'data/jacopo_2022-08-16.json',
  MICHELA: 'data/michela_2022-08-16.json'
};

const parse = path => 
  JSON.parse(fs.readFileSync(path, 'utf8'))['@graph'].map(item => {
    return {
      set: item.photo[0].path.match(/D(16|17|18|19)/)[0],
      filename: item.photo[0].filename,
      tags: item.tag
    }
  });

const TROPY_DATA = {
  DORIS: parse(TROPY_PATHS.DORIS),
  JACOPO: parse(TROPY_PATHS.JACOPO),
  MICHELA: parse(TROPY_PATHS.MICHELA)
}

const distinctRecords = Array.from(new Set([
  ...TROPY_DATA.DORIS.map(item => ({ filename: item.filename, set: item.set })),
  ...TROPY_DATA.JACOPO.map(item => ({ filename: item.filename, set: item.set })),
  ...TROPY_DATA.MICHELA.map(item => ({ filename: item.filename, set: item.set }))
]));

// Sort by set and filename
distinctRecords.sort((a, b) => {
  if (a.set === b.set) {
    return a.filename > b.filename ? 1 : -1;
  }
     
  return a.set > b.set ? 1 : -1;
});

const ratings = distinctRecords.map(({ filename, set }) => {
  const getTags = annotator => TROPY_DATA[annotator].find(item => item.filename === filename)?.tags || [];

  const tagsDoris = getTags('DORIS');
  const tagsJacopo = getTags('JACOPO');
  const tagsMichela = getTags('MICHELA');

  const intersection = new Set(tagsDoris.filter(tag => tagsJacopo.includes(tag) && tagsMichela.includes(tag)));
  const union = new Set([...tagsDoris, ...tagsJacopo, ...tagsMichela ]);

  return {
    filename, set,
    doris: tagsDoris.join(' | '),
    michela: tagsMichela.join(' | '),
    jacopo: tagsJacopo.join(' | '),
    agreement: intersection.size / union.size
  }
});

const config = {
	quotes: true, 
	quoteChar: '"',
	escapeChar: '"',
	delimiter: ",",
	header: true
}

const csv = Papa.unparse(ratings, config);
fs.writeFileSync('result.csv', csv);

