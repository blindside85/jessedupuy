import type { APIRoute } from 'astro'
import { getImage } from 'astro:assets'
import favicon from '@images/favicon-512.png'

const faviconPngSizes = [192, 512]

export const GET: APIRoute = async () => {
    const icons = await Promise.all(
        faviconPngSizes.map(async (size) => {
            const image = await getImage({
                src: favicon,
                width: size,
                height: size,
                format: 'png'
            })
            return {
                src: image.src,
                type: `image/${image.options.format}`,
                sizes: `${image.options.width}x${image.options.height}`
            }
        })
    )

    const manifest = {
        name: 'jessedupuy.me',
        description: 'Welcome to my personal site where I share insights on cloud engineering, web development, music, fitness, and more. Join me as I explore the intersection of technology and creativity.',
        start_url: '/',
        display: 'standalone',
        id: '845656c5b75241e6873a25c583276c16',
        icons
    }

    return new Response(JSON.stringify(manifest))
}
