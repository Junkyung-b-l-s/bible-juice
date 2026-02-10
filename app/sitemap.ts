import { MetadataRoute } from 'next';
import { SITUATION_VERSE_MAP_EXPANDED_V1 } from '@/data/situationVerseMap.expanded';

const BASE_URL = 'https://bible-juice.com'; // Replace with actual domain

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/about',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    const verseRoutes = SITUATION_VERSE_MAP_EXPANDED_V1.flatMap(situation =>
        situation.core_pool.map(verse => ({
            url: `${BASE_URL}/verse/${encodeURIComponent(verse.ref_key)}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }))
    );

    return [...routes, ...verseRoutes];
}
