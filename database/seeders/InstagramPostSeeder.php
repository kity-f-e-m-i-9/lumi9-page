<?php

namespace Database\Seeders;

use App\Models\InstagramPost;
use Illuminate\Database\Seeder;

class InstagramPostSeeder extends Seeder
{
    /**
     * Curated posts shown in the homepage Instagram section. Edit this list
     * and run `php artisan db:seed --class=InstagramPostSeeder` to update —
     * it's an upsert keyed by the media file's own URL, so re-running is
     * always safe and existing rows just get their other fields refreshed.
     *
     * image_url  — CloudFront/S3 URL of the image, or a poster/thumbnail
     *               frame when media_type is VIDEO (falls back to nothing
     *               if you don't have one — the frontend can then just
     *               show the <video> itself as the card art).
     * video_url  — only for media_type VIDEO: the CloudFront/S3 video file.
     * permalink  — where the card links to. No per-post Instagram URLs
     *              exist yet, so every card currently points at the
     *              profile page; update individually once real posts exist.
     */
    protected string $profileUrl = 'https://www.instagram.com/lumi9_diapers';

    protected array $posts = [
        [
            'image_url' => null,
            'video_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L10.mp4',
            'caption' => null,
            'media_type' => 'VIDEO',
            'sort_order' => 1,
            'is_active' => true,
        ],
        [
            'image_url' => null,
            'video_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L8.mp4',
            'caption' => null,
            'media_type' => 'VIDEO',
            'sort_order' => 2,
            'is_active' => true,
        ],
        [
            'image_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L7.jpg',
            'video_url' => null,
            'caption' => null,
            'media_type' => 'IMAGE',
            'sort_order' => 3,
            'is_active' => true,
        ],
        [
            'image_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L1.jpg',
            'video_url' => null,
            'caption' => null,
            'media_type' => 'IMAGE',
            'sort_order' => 4,
            'is_active' => true,
        ],
        [
            'image_url' => null,
            'video_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L2.mp4',
            'caption' => null,
            'media_type' => 'VIDEO',
            'sort_order' => 5,
            'is_active' => true,
        ],
        [
            'image_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L4.jpg',
            'video_url' => null,
            'caption' => null,
            'media_type' => 'IMAGE',
            'sort_order' => 6,
            'is_active' => true,
        ],
        [
            'image_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L3.jpg',
            'video_url' => null,
            'caption' => null,
            'media_type' => 'IMAGE',
            'sort_order' => 7,
            'is_active' => true,
        ],
        [
            'image_url' => null,
            'video_url' => 'https://d1oifqlqvwd9ay.cloudfront.net/Lumi9/Instagram/L5.mp4',
            'caption' => null,
            'media_type' => 'VIDEO',
            'sort_order' => 8,
            'is_active' => true,
        ],
    ];

    public function run(): void
    {
        foreach ($this->posts as $post) {
            InstagramPost::updateOrCreate(
                ['permalink' => $this->profileUrl, 'image_url' => $post['image_url'], 'video_url' => $post['video_url']],
                array_merge($post, ['permalink' => $this->profileUrl])
            );
        }

        $this->command?->info(count($this->posts).' Instagram post(s) seeded.');
    }
}
