<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstagramService
{
    protected string $accessToken;

    protected string $businessAccountId;

    protected string $apiVersion = 'v21.0';

    public function __construct()
    {
        $this->accessToken = (string) config('services.instagram.access_token');
        $this->businessAccountId = (string) config('services.instagram.business_account_id');
    }

    /**
     * Fetch recent image/video posts via the Instagram Graph API.
     * Returns an empty collection (never throws) if not configured or on failure.
     */
    public function fetchRecentMedia(int $limit = 9): array
    {
        if (empty($this->accessToken) || empty($this->businessAccountId)) {
            Log::warning('InstagramService: access token or business account id not configured');

            return [];
        }

        try {
            $response = Http::get("https://graph.facebook.com/{$this->apiVersion}/{$this->businessAccountId}/media", [
                'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                'limit' => $limit,
                'access_token' => $this->accessToken,
            ]);

            if ($response->failed()) {
                Log::error('InstagramService: media fetch failed', [
                    'status' => $response->status(),
                    'error' => $response->json('error.message'),
                ]);

                return [];
            }

            $items = $response->json('data', []);

            return collect($items)
                ->filter(fn ($item) => in_array($item['media_type'] ?? null, ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']))
                ->map(fn ($item) => [
                    'id' => $item['id'],
                    'caption' => $item['caption'] ?? null,
                    'mediaType' => $item['media_type'],
                    'imageUrl' => $item['media_type'] === 'VIDEO'
                        ? ($item['thumbnail_url'] ?? $item['media_url'])
                        : $item['media_url'],
                    'permalink' => $item['permalink'],
                    'postedAt' => $item['timestamp'] ?? null,
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::error('InstagramService: exception fetching media', ['error' => $e->getMessage()]);

            return [];
        }
    }
}
