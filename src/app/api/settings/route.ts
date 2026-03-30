import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
    try {
        const dbSettings = await prisma.siteSettings.findUnique({
            where: { id: 'global' },
        });

        if (dbSettings && dbSettings.data) {
            return NextResponse.json(dbSettings.data);
        }

        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8');
            const settings = JSON.parse(fileContents);
            
            await prisma.siteSettings.upsert({
                where: { id: 'global' },
                update: { data: settings },
                create: { id: 'global', data: settings },
            });

            return NextResponse.json(settings);
        } catch (fileError: any) {
            if (fileError.code === 'ENOENT') {
                return NextResponse.json({}, { status: 200 });
            }
            throw fileError;
        }
    } catch (error: any) {
        console.error('Failed to get settings from database:', error);
        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8');
            const settings = JSON.parse(fileContents);
            return NextResponse.json(settings);
        } catch (fallbackError) {
            return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
        }
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        await prisma.siteSettings.upsert({
            where: { id: 'global' },
            update: { data },
            create: { id: 'global', data },
        });

        try {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            console.warn("Failed to write to fallback settings.json, but DB was updated", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const partialData = await request.json();
        
        const dbSettings = await prisma.siteSettings.findUnique({
            where: { id: 'global' },
        });

        let currentData: any = {};
        if (dbSettings && dbSettings.data) {
            currentData = typeof dbSettings.data === 'string' ? JSON.parse(dbSettings.data) : dbSettings.data;
        } else {
             try {
                const fileContents = await fs.readFile(dataFilePath, 'utf8');
                currentData = JSON.parse(fileContents);
             } catch(e) {}
        }

        const mergedData = { ...currentData, ...partialData };
        
        await prisma.siteSettings.upsert({
            where: { id: 'global' },
            update: { data: mergedData },
            create: { id: 'global', data: mergedData },
        });

        try {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, JSON.stringify(mergedData, null, 2), 'utf8');
        } catch (e) {
            console.warn("Failed to write to fallback settings.json, but DB was updated", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to patch settings:', error);
        return NextResponse.json({ error: 'Failed to patch settings' }, { status: 500 });
    }
}
