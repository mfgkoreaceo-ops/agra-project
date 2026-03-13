import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const settings = JSON.parse(fileContents);
        return NextResponse.json(settings);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return NextResponse.json({}, { status: 200 });
        }
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
