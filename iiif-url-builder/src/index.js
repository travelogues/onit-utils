import fs from 'fs';
import * as fast_csv from 'fast-csv';

const BASE_FOLDER = '../../onit-iiif-harvest/data/detections/D17';

const manifests = fs.readdirSync(BASE_FOLDER)
  .map(folder => ({ barcode: folder , path: `${BASE_FOLDER}/${folder}/metadata.json` }))
  .filter(obj => fs.existsSync(obj.path));

/**
 * A list of objects { barcode, filename, path, illustration }, with illustration being
 * an object { x0, y0, x1, y1, confidence }
 */
const images = manifests.reduce((all, { barcode, path }) => {
  const files = JSON.parse(fs.readFileSync(path, 'utf8'));

  let illustrations = [];

  for (const f of files) {
    const { filename, early_printed_illustrations } = f;

    early_printed_illustrations.forEach((illustration, idx) => {
      const [ id, label ] = filename.substring(filename.lastIndexOf('/') + 1, filename.lastIndexOf('.')).split('_');

      const x = illustration.x0;
      const y = illustration.y0;
      const w = illustration.x1 - x;
      const h = illustration.y1 - y;

      const iiif = `https://iiif.onb.ac.at/images/ABO/${barcode}/${id}/${x},${y},${w},${h}/full/0/native.jpg`;

      const padded_idx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

      illustrations.push({ barcode, id, label, iiif, filename: `${barcode}_${id}_${label}_${padded_idx}.jpg` });
    })
  }

  return illustrations.length > 0 ? [...all, ...illustrations] : all;
}, []);

// Write to CSV file
const csv = fast_csv.format({ headers: true });
const out = fs.createWriteStream('outputfile.csv');

csv.pipe(out);

images.forEach(i =>
  csv.write(i));

csv.end();

