<?php

namespace App\Console\Commands;

use App\Services\InstagramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class RefreshInstagramFeed extends Command
{
    protected $signature = 'instagram:refresh';

    protected $description = 'Refresh the cached Instagram feed shown on the homepage';

    public function handle(InstagramService $instagramService): int
    {
        $posts = $instagramService->fetchRecentMedia(9);

        if (empty($posts)) {
            $this->error('Instagram feed refresh returned no posts. Check services.instagram config and logs.');

            return self::FAILURE;
        }

        Cache::put('instagram_feed', $posts, now()->addHours(24));
        $this->info('Instagram feed refreshed: '.count($posts).' posts cached.');

        return self::SUCCESS;
    }
}
