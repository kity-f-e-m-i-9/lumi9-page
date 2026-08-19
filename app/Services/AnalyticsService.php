<?php

namespace App\Services;

use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use App\Models\OrderConversion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    /**
     * Record one real page view: upserts the visitor and session, then
     * inserts a page_views row carrying whatever UTM params were on the URL.
     */
    public function trackPageView(array $data): void
    {
        DB::transaction(function () use ($data) {
            $this->updateVisitor($data);
            $this->updateSession($data);

            AnalyticsPageView::create([
                'visitor_id' => $data['visitor_id'],
                'session_id' => $data['session_id'],
                'url' => $data['url'],
                'referrer' => $data['referrer'] ?? null,
                'utm_data' => $this->extractUtmParams($data['url']),
            ]);
        });
    }

    public function updateVisitor(array $data): void
    {
        $visitor = AnalyticsVisitor::find($data['visitor_id']);

        if ($visitor) {
            $visitor->update([
                'last_visit' => now(),
                'visit_count' => $visitor->visit_count + 1,
                'ip_address' => $data['ip_address'] ?? $visitor->ip_address,
                'user_agent' => $data['user_agent'] ?? $visitor->user_agent,
                'is_bot' => $data['is_bot'] ?? $visitor->is_bot,
                'device_type' => $data['device_type'] ?? $visitor->device_type,
                'language' => $data['language'] ?? $visitor->language,
            ]);

            return;
        }

        AnalyticsVisitor::create([
            'visitor_id' => $data['visitor_id'],
            'last_visit' => now(),
            'visit_count' => 1,
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'is_bot' => $data['is_bot'] ?? false,
            'device_type' => $data['device_type'] ?? null,
            'language' => $data['language'] ?? null,
        ]);
    }

    public function updateSession(array $data): void
    {
        AnalyticsSession::updateOrCreate(
            ['session_id' => $data['session_id']],
            [
                'visitor_id' => $data['visitor_id'],
                'last_activity' => now(),
                'screen_resolution' => $data['screen_resolution'] ?? null,
            ]
        );
    }

    /**
     * Attribute a completed order to the visitor's session and its earliest
     * page view's UTM/referrer/landing URL — mirrors Femi9's session-scoped
     * first-touch attribution.
     */
    public function trackOrderConversion(string $orderId, ?string $visitorId, ?string $conversionUrl = null): void
    {
        if (! $visitorId) {
            return;
        }

        try {
            $session = AnalyticsSession::where('visitor_id', $visitorId)
                ->orderByDesc('last_activity')
                ->first();

            if (! $session) {
                Log::warning('AnalyticsService: no session found for visitor', [
                    'visitor_id' => $visitorId,
                    'order_id' => $orderId,
                ]);

                return;
            }

            $firstPageView = AnalyticsPageView::where('visitor_id', $visitorId)
                ->where('session_id', $session->session_id)
                ->orderBy('created_at')
                ->first();

            OrderConversion::updateOrCreate(
                ['order_id' => $orderId],
                [
                    'visitor_id' => $visitorId,
                    'session_id' => $session->session_id,
                    'first_landed_url' => $firstPageView->url ?? null,
                    'referring_url' => $firstPageView->referrer ?? null,
                    'conversion_url' => $conversionUrl,
                    'utm_data' => $firstPageView->utm_data ?? null,
                ]
            );
        } catch (\Exception $e) {
            Log::error('AnalyticsService: failed to track order conversion', [
                'order_id' => $orderId,
                'visitor_id' => $visitorId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function extractUtmParams(string $url): ?array
    {
        $query = parse_url($url, PHP_URL_QUERY);

        if (! $query) {
            return null;
        }

        parse_str($query, $params);

        $utm = array_filter($params, fn ($key) => str_starts_with($key, 'utm_'), ARRAY_FILTER_USE_KEY);

        return ! empty($utm) ? $utm : null;
    }
}
