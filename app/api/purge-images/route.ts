import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'tools', 'screenshots');
    const files = fs.readdirSync(screenshotsDir);

    for (const file of files) {
      fs.unlinkSync(path.join(screenshotsDir, file));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la purge des images:', error);
    return NextResponse.json({ error: 'Erreur lors de la purge des images' }, { status: 500 });
  }
} 