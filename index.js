import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as QRCode from 'qrcode';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --mode [mode] --input [file] --outdir [directory]')
    .option('mode', {
        alias: 'm',
        describe: 'Compression mode',
        choices: ['gzip', 'urlencode', 'base64'],
        demandOption: true
    })
    .option('input', {
        alias: 'i',
        describe: 'Input HTML file path',
        type: 'string',
        demandOption: true
    })
    .option('outdir', {
        alias: 'o',
        describe: 'Output directory path',
        type: 'string',
        default: 'out'
    })
    .help()
    .argv;

const generateDataUri = (htmlContent) => {
    if (argv.mode === "gzip") {
        const gzippedContent = zlib.gzipSync(htmlContent);
        const base64Gzip = gzippedContent.toString('base64');
        const decompressionScript = `<script>let a="${base64Gzip}",b=atob(a),c=new Uint8Array(b.length);for(let e=0;e<b.length;e++)c[e]=b.charCodeAt(e);let d=new Response(c).body.pipeThrough(new DecompressionStream("gzip"));new Response(d).text().then((e=>{document.open(),document.write(e),document.close()}));</script>`;
        const dataUri = `data:text/html;utf8,${encodeURIComponent(decompressionScript)}`;
        return dataUri;
    } else if (argv.mode === "urlencode") {
        const urlencoded = encodeURIComponent(htmlContent);
        const dataUri = `data:text/html;utf8,${urlencoded}`;
        return dataUri;
    }
    // return base64
    const base64 = Buffer.from(htmlContent).toString('base64');
    const dataUri = `data:text/html;base64,${base64}`;
    return dataUri;
}

async function generateQr(fp) {
    const filePath = path.resolve(fp);
    try {
        const outDir = path.resolve(argv.outdir);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir);
        }

        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const dataUri = generateDataUri(htmlContent);
        console.log(`Data URI size (${argv.mode}): ${dataUri.length} bytes`);
        fs.writeFileSync(path.join(outDir, 'dataUri.txt'), dataUri);
        const qrCodePath = path.join(outDir, 'qr.png');
        await QRCode.toFile(qrCodePath, dataUri, {
            width: 1000,
            errorCorrectionLevel: 'L',
            margin: 1,
            version: 40,
        });

        console.log(`QR Code saved as ${qrCodePath}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

generateQr(argv.input);

