import { qrcode } from './qr-code.js';

class QRCodePainter {
  static get inputProperties() {
    return [
      '--text',
    ];
  }

  paint(ctx, geom, props) {
    const link = props.get('--text').toString() || '';
    const level = 'L';
    const mode = 0;
    const qr = qrcode(mode, level);
    qr.addData(link);
    qr.make();

    const cellSize = Math.min(geom.width, geom.height) / qr.getModuleCount();
    qr.renderTo2dContext(ctx, cellSize);
  }
}

registerPaint('qr-code', QRCodePainter);
