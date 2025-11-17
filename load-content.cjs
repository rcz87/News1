const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { articles } = require('./dist/schema.cjs');

const connectionString = "postgresql://postgres:postgres@localhost:5432/news1";
const client = new Client({ connectionString });
const sql = postgres(connectionString);
const db = drizzle(sql);

async function loadContent() {
    try {
        await client.connect();
        console.log('Connected to database');

        const contentDir = path.join(__dirname, 'content');
        const channels = fs.readdirSync(contentDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log('Found channels:', channels);

        for (const channel of channels) {
            const channelDir = path.join(contentDir, channel);
            const files = fs.readdirSync(channelDir).filter(file => file.endsWith('.md'));

            console.log(`Loading ${files.length} files from ${channel}...`);

            for (const file of files) {
                const filePath = path.join(channelDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');

                // Parse frontmatter
                const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                let metadata = {};
                let articleContent = content;

                if (frontmatterMatch) {
                    try {
                        metadata = YAML.parse(frontmatterMatch[1]);
                        articleContent = content.replace(frontmatterMatch[0], '');
                    } catch (e) {
                        console.log(`Error parsing frontmatter for ${file}:`, e.message);
                    }
                }

                // Extract title from first line if not in metadata
                if (!metadata.title) {
                    const titleMatch = articleContent.match(/^# (.+)$/m);
                    if (titleMatch) {
                        metadata.title = titleMatch[1];
                    }
                }

                // Extract slug from filename
                const slug = file.replace('.md', '');

                const article = {
                    id: crypto.randomUUID(),
                    slug,
                    title: metadata.title || slug,
                    content: articleContent,
                    excerpt: metadata.description || articleContent.substring(0, 200) + '...',
                    channel,
                    author: metadata.author || 'Admin',
                    publishedAt: new Date(metadata.date || Date.now()),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    featured: metadata.featured || false,
                    status: 'published'
                };

                try {
                    await db.insert(articles).values(article).onConflictDoUpdate({
                        target: articles.slug,
                        set: article
                    });
                    console.log(`✓ Loaded: ${channel}/${slug}`);
                } catch (err) {
                    console.error(`Error inserting ${channel}/${slug}:`, err.message);
                }
            }
        }

        console.log('Content loading completed!');

        const count = await client.query('SELECT COUNT(*) FROM articles');
        console.log(`Total articles in database: ${count.rows[0].count}`);

    } catch (error) {
        console.error('Error loading content:', error);
    } finally {
        await client.end();
        await sql.end();
    }
}

// Simple YAML parser (fallback if not available)
const YAML = {
    parse: (str) => {
        const result = {};
        const lines = str.split('\n');
        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                result[match[1]] = match[2];
            }
        }
        return result;
    }
};

loadContent();
