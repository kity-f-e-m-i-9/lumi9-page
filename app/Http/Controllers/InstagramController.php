<?php

namespace App\Http\Controllers;

use App\Models\InstagramPost;

class InstagramController extends Controller
{
    /**
     * Recent Instagram posts for the homepage feed section.
     *
     * Backed by curated posts managed in the instagram_posts table rather
     * than a live Graph API call — no Meta Business setup required. Swap
     * this for a call to InstagramService::fetchRecentMedia() once that's
     * configured; the response shape stays the same either way.
     */
    public function feed()
    {
        $posts = InstagramPost::where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->limit(9)
            ->get()
            ->map(fn (InstagramPost $post) => [
                'id' => $post->id,
                'caption' => $post->caption,
                'mediaType' => $post->media_type,
                'imageUrl' => $post->image_url,
                'videoUrl' => $post->video_url,
                'permalink' => $post->permalink,
                'postedAt' => $post->created_at,
            ]);

        return response()->json([
            'success' => true,
            'posts' => $posts,
            'profileUrl' => config('services.instagram.profile_url'),
        ]);
    }
}
